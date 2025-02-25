<script setup>
import '../assets/css/views/_voting.scss';
import Settings from '../components/inputs/Settings.vue';
import { useI18n } from 'vue-i18n';
import TeamDraw from '../components/voting/TeamDraw.vue';
import { useUserStore } from '../stores/user.js';
import { usePartyStore } from '../stores/party.js';
import { useSocketStore } from '../stores/socket.js';
import { onMounted, ref } from 'vue';
import Loading from '../components/voting/Loading.vue';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const env = import.meta.env;
const userStore = useUserStore();
const user = userStore.user;
const partyStore = usePartyStore();
const partyId = partyStore.partyId;
const hostId = ref(partyStore.hostId);
const { socket } = useSocketStore();
const router = useRouter();
const mission = ref('');
const numberTeam = ref(1);
const draw = ref('');
const step = ref(1);

async function getVoting() {
  const response = await fetch(`${env.VITE_URL}/api/parties/voting`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': userStore.language,
    },
    body: JSON.stringify({
      socket_id: socket.id,
      user_id: user.id,
      party_id: partyId,
      number_team: numberTeam.value,
    }),
  });

  if (response.ok) {
    const json = await response.json();

    mission.value = json.team.mission;
    draw.value = json.team.draw;

    socket.emit('voting-player-ready', {
      party_id: partyId,
    });
  } else {
    await router.push({ path: '/' });
  }
}

getVoting();

function nextStep(e) {
  if (
    user.id === hostId.value &&
    step.value > 1 &&
    !e.target.closest('.settings') &&
    !e.target.closest('.popin')
  ) {
    step.value++;

    socket.emit('next-step', {
      party_id: partyId,
      socket_id: socket.id,
    });
  }
}

onMounted(() => {
  socket.on('voting-start', () => {
    step.value = 2;
  });

  socket.on('next-step', (data) => {
    if (socket.id === data.socket_id) return;

    step.value++;
  });
});
</script>

<template>
  <main
    ref="voting"
    :class="['voting', `voting--step-${step}`]"
    @click.stop="nextStep"
  >
    <h1 class="hidden-title">{{ t('voting') }}</h1>
    <Loading v-show="step === 1" />
    <TeamDraw
      v-show="step > 1"
      :step="step"
      :mission="mission"
      :number-team="numberTeam"
      :img-src="draw"
    />
    <Settings />
  </main>
</template>
