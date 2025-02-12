<script setup>
import '../assets/css/views/_drawing.scss';
import {useI18n} from "vue-i18n";
import {useSocketStore} from "../stores/socket.js";
import {useUserStore} from "../stores/user.js";
import {onMounted, ref} from "vue";
import router from "../router/index.js";
import Cursor from "../components/drawing/Cursor.vue";

const env = import.meta.env;
const { t } = useI18n();
const { socket } = useSocketStore();
const userStore = useUserStore();
const user = userStore.user;
const teamId = ref("")
const mission = ref("");
const objective = ref("");
const isSaboteur = ref(false);
const players = ref([]);

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

    if(json.sabotage) {
      objective.value = json.sabotage;
      isSaboteur.value = true;
    } else {
      objective.value = json.objective;
    }
  } else {
    await router.push({ path: '/' });
  }
}

function mouseMove(event) {
  socket.emit("mouse-move", {
    x: (event.clientX / window.innerWidth) * 100,
    y: (event.clientY / window.innerHeight) * 100,
    team_id: teamId.value,
    socket_id: socket.id,
  });
}

onMounted(() => {
  getDrawingDatas();

  socket.on("player-move", (data) => {
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
    @mousemove="mouseMove"
  >
    <h1 class="hidden-title">{{ t("drawing") }}</h1>

    <canvas/>
    <Cursor
      v-for="player in players"
      :key="player.socketId"
      :player="player"
    />
  </main>
</template>