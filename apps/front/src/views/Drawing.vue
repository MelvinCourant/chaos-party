<script setup>
import '../assets/css/views/_drawing.scss';
import { useI18n } from "vue-i18n";
import { useSocketStore } from "../stores/socket.js";
import { useUserStore } from "../stores/user.js";
import { onMounted, ref, useTemplateRef } from "vue";
import router from "../router/index.js";
import Cursor from "../components/drawing/Cursor.vue";

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
const canvas = useTemplateRef("canvas");
const rect = ref(null);
const position = ref({ x: 0, y: 0 });
const ctx = ref(null);
const isDrawing = ref(false);
const isDrawingMap = ref({})

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

function mouseMove(event) {
  position.value.x = event.clientX - rect.value.left;
  position.value.y = event.clientY - rect.value.top;

  socket.emit("player-move", {
    x: position.value.x,
    y: position.value.y,
    team_id: teamId.value,
    socket_id: socket.id,
  });
}

function startDrawing(event) {
  if (!canvas.value) return;

  position.value.x = event.clientX - rect.value.left;
  position.value.y = event.clientY - rect.value.top;

  isDrawing.value = true;
  ctx.value.beginPath();
  ctx.value.moveTo(position.value.x, position.value.y);

  socket.emit("start-drawing", {
    x: position.value.x,
    y: position.value.y,
    team_id: teamId.value,
    socket_id: socket.id,
  });
}

function draw(event) {
  if (!isDrawing.value || !canvas.value) return;

  position.value.x = event.clientX - rect.value.left;
  position.value.y = event.clientY - rect.value.top;

  ctx.value.lineTo(position.value.x, position.value.y);
  ctx.value.stroke();

  socket.emit("draw", {
    x: position.value.x,
    y: position.value.y,
    team_id: teamId.value,
    socket_id: socket.id,
  });
}

function stopDrawing() {
  if (!canvas.value) return;
  isDrawing.value = false;
  ctx.value.closePath();

  socket.emit("stop-drawing", {
    team_id: teamId.value,
    socket_id: socket.id,
  });
}

onMounted(() => {
  getDrawingDatas();

  rect.value = canvas.value.getBoundingClientRect();

  if (canvas.value) {
    canvas.value.width = canvas.value.offsetWidth;
    canvas.value.height = canvas.value.offsetHeight;
    ctx.value = canvas.value.getContext("2d");
    ctx.value.strokeStyle = "black";
    ctx.value.lineWidth = 2;
    ctx.value.lineCap = "round";
  }

  socket.on("join", (player) => {
    players.value.push(player);
  });

  socket.on("leave-party", (data) => {
    players.value.splice(players.value.findIndex((player) => player.socketId === data.socket_id), 1);
  });

  socket.on("get-state", () => {
    socket.emit("player-state", {
      x: position.value.x,
      y: position.value.y,
      team_id: teamId.value,
      socket_id: socket.id,
    });
  });

  socket.on("player-state", (data) => {
    if(socket.id === data.socket_id) return;

    const player = players.value.find((player) => player.socketId === data.socket_id);
    if (player) {
      player.x = data.x;
      player.y = data.y;
    }
  });

  socket.on("player-move", (data) => {
    if(socket.id === data.socket_id) return;

    const player = players.value.find((player) => player.socketId === data.socket_id);
    if (player) {
      player.x = data.x;
      player.y = data.y;
    }
  });

  socket.on("start-drawing", (data) => {
    if(socket.id === data.socket_id) return;

    isDrawingMap.value[data.socket_id] = true;

    if (!canvas.value) return;

    ctx.value.beginPath();
    ctx.value.moveTo(data.x, data.y);
  });

  socket.on("draw", (data) => {
    if (
      !canvas.value ||
      !isDrawingMap.value[data.socket_id] ||
      socket.id === data.socket_id
    ) return;

    ctx.value.lineTo(data.x, data.y);
    ctx.value.stroke();
  });

  socket.on("stop-drawing", (data) => {
    if(socket.id === data.socket_id) return;

    isDrawingMap.value[data.socket_id] = false;
    if (!canvas.value) return;

    ctx.value.closePath();
  });
});
</script>

<template>
  <main
    class="drawing"
    @mousemove="mouseMove"
  >
    <h1 class="hidden-title">{{ t("drawing") }}</h1>

    <div class="board">
      <canvas
        ref="canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
      />
      <Cursor
        v-for="player in players"
        :key="player.socketId"
        :player="player"
      />
    </div>
  </main>
</template>
