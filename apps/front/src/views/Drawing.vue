<script setup>
import '../assets/css/views/_drawing.scss';
import { useI18n } from "vue-i18n";
import { useSocketStore } from "../stores/socket.js";
import { useUserStore } from "../stores/user.js";
import { onMounted, ref } from "vue";
import router from "../router/index.js";
import Board from "../components/drawing/Board.vue";
import Settings from "../components/inputs/Settings.vue";

const env = import.meta.env;
const { t } = useI18n();
const { socket } = useSocketStore();
const userStore = useUserStore();
const user = userStore.user;
const teamId = ref("");
const mission = ref("");
const objective = ref("");
const isSaboteur = ref(false);
const players = ref([]);
const mouseMoving = ref(null);

async function getDrawingDatas() {
  const response = await fetch(`${env.VITE_URL}/api/teams/show-drawing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": userStore.language,
    },
    body: JSON.stringify({
      socket_id: socket.id,
      user_id: user.id,
    }),
  });

  if (response.ok) {
    const json = await response.json();

    teamId.value = json.team_id;
    mission.value = json.mission;
    players.value = json.players;

    if (json.sabotage) {
      objective.value = json.sabotage;
      isSaboteur.value = true;
    } else {
      objective.value = json.objective;
    }

    socket.emit("get-state", {
      team_id: teamId.value,
    });
  } else {
    await router.push({ path: '/' });
  }
}

onMounted(() => {
  getDrawingDatas();

  socket.on("join", (player) => {
    players.value.push(player);
  });

  socket.on("leave-party", (data) => {
    players.value.splice(players.value.findIndex((player) => player.socketId === data.socket_id), 1);
  });

  socket.on("player-move", (data) => {
    if(socket.id === data.socket_id) return;

    const player = players.value.find((player) => player.socketId === data.socket_id);
    if (player) {
      player.x = data.x;
      player.y = data.y;
    }
  });

  socket.on("player-state", (data) => {
    if(socket.id === data.socket_id) return;

    const player = players.value.find((player) => player.socketId === data.socket_id);
    if (player) {
      player.x = data.x;
      player.y = data.y;
    }
  });
});
</script>

<template>
  <main
    class="drawing"
    @mousemove="mouseMoving = $event"
  >
    <h1 class="hidden-title">{{ t("drawing") }}</h1>
    <Settings/>
    <Board
      :mission="mission"
      :objective="objective"
      :isSaboteur="isSaboteur"
      :players="players"
      :teamId="teamId"
      :mouseMoving="mouseMoving"
    />
  </main>
</template>
