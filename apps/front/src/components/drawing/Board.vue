<script setup>
import '../../assets/css/components/drawing/_board.scss';
import Cursor from "./Cursor.vue";
import {inject, onMounted, ref, useTemplateRef, watch} from "vue";
import {useSocketStore} from "../../stores/socket.js";
import {useI18n} from "vue-i18n";

const props = defineProps({
  mouseMoving: {
    type: Object,
    default: null,
  },
  strokeStyle: {
    type: String,
    default: "#1A120F",
  },
  lineWidth: {
    type: Number,
    default: 8,
  },
});

const { socket } = useSocketStore();
const { t } = useI18n();
const canvas = useTemplateRef("canvas");
const rect = ref(null);
const position = ref({ x: 0, y: 0 });
const ctx = ref(null);
const isDrawing = ref(false);
const isDrawingMap = ref({})
const mission = inject("mission");
const objective = inject("objective");
const isSaboteur = inject("isSaboteur");
const players = inject("players");
const teamId = inject("teamId");

function startDrawing(event) {
  if (!canvas.value) return;

  position.value.x = event.clientX - rect.value.left;
  position.value.y = event.clientY - rect.value.top;

  isDrawing.value = true;
  ctx.value.strokeStyle = props.strokeStyle;
  ctx.value.lineWidth = props.lineWidth;
  ctx.value.beginPath();
  ctx.value.moveTo(position.value.x, position.value.y);

  socket.emit("start-drawing", {
    x: position.value.x,
    y: position.value.y,
    stroke_style: props.strokeStyle,
    line_width: props.lineWidth,
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
  setTimeout(() => {
    rect.value = canvas.value.getBoundingClientRect();
  }, 50);

  window.addEventListener("resize", () => {
    rect.value = canvas.value.getBoundingClientRect();
  });

  if (canvas.value) {
    canvas.value.width = canvas.value.offsetWidth;
    canvas.value.height = canvas.value.offsetHeight;
    ctx.value = canvas.value.getContext("2d");
    ctx.value.lineCap = "round";
    ctx.value.lineJoin = "round";
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

  watch(() => props.mouseMoving, (newValue) => {
    if (!newValue) return;
    mouseMove(newValue);
  })

  socket.on("get-state", () => {
    if(!canvas.value) return;

    socket.emit("player-state", {
      x: position.value.x,
      y: position.value.y,
      team_id: teamId.value,
      socket_id: socket.id,
    });

    socket.emit("canvas-state", {
      team_id: teamId.value,
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

    ctx.value.strokeStyle = data.stroke_style;
    ctx.value.lineWidth = data.line_width;
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
    <h2 class="board__mission">
      {{ t('draw_dots') }} {{ mission }}{{ t('exclamation_mark')}}
    </h2>
    <p
      :class="[
        'board__objective',
        { 'board__objective--sabotage': isSaboteur }
      ]"
    >
      {{ objective }}
    </p>
    <div class="board__container">
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
  </div>
</template>