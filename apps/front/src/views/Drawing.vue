<script setup>
import '../assets/css/views/_drawing.scss';
import { useI18n } from 'vue-i18n';
import { useSocketStore } from '../stores/socket.js';
import { useUserStore } from '../stores/user.js';
import { usePartyStore } from '../stores/party.js';
import { onMounted, ref, provide, watch } from 'vue';
import router from '../router/index.js';
import Settings from '../components/inputs/Settings.vue';
import Draw from '../components/drawing/Draw.vue';
import config from '../../../../cp-config.json';

const env = import.meta.env;
const { t } = useI18n();
const { socket } = useSocketStore();
const userStore = useUserStore();
const user = userStore.user;
const partyStore = usePartyStore();
const partyId = partyStore.partyId;
const teamId = ref('');
const mission = ref('');
const objective = ref('');
const isSaboteur = ref(false);
const players = ref([]);
const mouseMoving = ref(null);
const mouseUp = ref(false);
const drawingDuration = ref(3);
const timer = ref(0);
const elapsed = ref(0);
let interval = null;

provide('mission', mission);
provide('objective', objective);
provide('isSaboteur', isSaboteur);
provide('players', players);
provide('teamId', teamId);
provide('duration', drawingDuration);
provide('elapsed', elapsed);

async function getDrawingDatas() {
  const response = await fetch(`${env.VITE_URL}/api/teams/show-drawing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': userStore.language,
    },
    body: JSON.stringify({
      socket_id: socket.id,
      user_id: user.id,
    }),
  });

  if (response.ok) {
    const json = await response.json();

    drawingDuration.value = parseInt(json.drawing_time);
    teamId.value = json.team_id;
    mission.value = json.mission;
    players.value = json.players;

    if (json.sabotage) {
      objective.value = json.sabotage;
      isSaboteur.value = true;
    } else {
      objective.value = json.objective;
    }

    socket.emit('team-state', {
      team_id: teamId.value,
    });

    socket.emit('party-state', {
      party_id: partyId,
    });
  } else {
    await router.push({ path: '/' });
  }
}

function startTimer() {
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => {
    timer.value += 100;
  }, 100);
}

function stopTimer() {
  clearInterval(interval);
  interval = null;
  timer.value = 0;
}

onMounted(() => {
  getDrawingDatas();

  socket.on('join', (player) => {
    players.value.push(player);
  });

  socket.on('leave-party', (data) => {
    players.value.splice(
      players.value.findIndex((player) => player.socketId === data.socket_id),
      1,
    );
  });

  socket.on('player-move', (data) => {
    if (socket.id === data.socket_id) return;

    const player = players.value.find(
      (player) => player.socketId === data.socket_id,
    );
    if (player) {
      player.x = data.x;
      player.y = data.y;
    }
  });

  socket.on('party-state', () => {
    socket.emit('timer-state', {
      party_id: partyId,
      socket_id: socket.id,
      timer: timer.value,
    });
  });

  socket.on('player-state', (data) => {
    if (socket.id === data.socket_id) return;

    const player = players.value.find(
      (player) => player.socketId === data.socket_id,
    );
    if (player) {
      player.x = data.x;
      player.y = data.y;
    }
  });

  socket.on('start-timer', startTimer);

  socket.on('timer-state', (data) => {
    if (socket.id === data.socket_id) return;

    if (data.timer === 0) {
      socket.emit('player-ready', {
        party_id: partyId,
      });
    } else {
      timer.value = data.timer;
      elapsed.value = data.timer;
      startTimer();
    }
  });

  watch(timer, (value) => {
    const maxTime = drawingDuration.value * 60 * 1000;

    if (value >= maxTime) {
      stopTimer();

      socket.emit('timer-finished', {
        party_id: partyId,
      });
    }
  });

  if (config.timer_actived) {
    socket.on('redirect', async () => {
      await router.push({ path: '/voting' });
    });
  }
});
</script>

<template>
  <main
    class="drawing"
    @mousemove="mouseMoving = $event"
    @mouseup="mouseUp = true"
    @mousedown="mouseUp = false"
  >
    <h1 class="hidden-title">{{ t('drawing') }}</h1>
    <Settings />
    <Draw :mouseMoving="mouseMoving" :mouseUp="mouseUp" />
  </main>
</template>
