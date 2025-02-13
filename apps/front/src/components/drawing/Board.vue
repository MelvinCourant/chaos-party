<script setup>
import '../../assets/css/components/drawing/_board.scss';
import Cursor from "./Cursor.vue";
import {onMounted, ref, useTemplateRef, watch} from "vue";
import {useSocketStore} from "../../stores/socket.js";

const props = defineProps({
  players: {
    type: Array,
    required: true,
  },
  teamId: {
    type: String,
    required: true,
  },
  mouseMoving: {
    type: Event,
    required: false,
  },
})

const { socket } = useSocketStore();
const canvas = useTemplateRef("canvas");
const rect = ref(null);
const position = ref({ x: 0, y: 0 });
const ctx = ref(null);
const isDrawing = ref(false);
const isDrawingMap = ref({})

function mouseMove(event) {
  position.value.x = event.clientX - rect.value.left;
  position.value.y = event.clientY - rect.value.top;

  socket.emit("player-move", {
    x: position.value.x,
    y: position.value.y,
    team_id: props.teamId,
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
    team_id: props.teamId,
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
    team_id: props.teamId,
    socket_id: socket.id,
  });
}

function stopDrawing() {
  if (!canvas.value) return;
  isDrawing.value = false;
  ctx.value.closePath();

  socket.emit("stop-drawing", {
    team_id: props.teamId,
    socket_id: socket.id,
  });
}

watch(() => props.mouseMoving, (newValue) => {
  if (!newValue) return;
  mouseMove(newValue);
})

onMounted(() => {
  rect.value = canvas.value.getBoundingClientRect();

  if (canvas.value) {
    canvas.value.width = canvas.value.offsetWidth;
    canvas.value.height = canvas.value.offsetHeight;
    ctx.value = canvas.value.getContext("2d");
    ctx.value.strokeStyle = "black";
    ctx.value.lineWidth = 2;
    ctx.value.lineCap = "round";
  }

  socket.on("get-state", () => {
    if(!canvas.value) return;

    socket.emit("player-state", {
      x: position.value.x,
      y: position.value.y,
      team_id: props.teamId,
      socket_id: socket.id,
    });

    socket.emit("canvas-state", {
      team_id: props.teamId,
      socket_id: socket.id,
      canvas: canvas.value.toDataURL(),
    });
  });

  socket.on("canvas-state", (data) => {
    if (!canvas.value || socket.id === data.socket_id) return;

    const img = new Image();
    img.onload = () => {
      ctx.value.drawImage(img, 0, 0);
    };
    img.src = data.canvas;
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
})
</script>

<template>
  <div class="board">
    <canvas
      ref="canvas"
      class="board__canvas"
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
</template>