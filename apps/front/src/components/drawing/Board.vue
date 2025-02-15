<script setup>
import "../../assets/css/components/drawing/_board.scss";
import Cursor from "./Cursor.vue";
import { inject, onMounted, ref, useTemplateRef, watch } from "vue";
import { useSocketStore } from "../../stores/socket.js";
import { useI18n } from "vue-i18n";

const props = defineProps({
  mouseMoving: { type: Object, default: null },
  strokeStyle: { type: String, default: "#1A120F" },
  lineWidth: { type: Number, default: 8 },
  opacity: { type: Number, default: 100 },
});

const { socket } = useSocketStore();
const { t } = useI18n();
const canvas = useTemplateRef("canvas");
const rect = ref(null);
const position = ref({ x: 0, y: 0 });
const ctx = ref(null);
const isDrawing = ref(false);
const isDrawingMap = ref({});
const mission = inject("mission");
const objective = inject("objective");
const isSaboteur = inject("isSaboteur");
const players = inject("players");
const teamId = inject("teamId");

function hexToRgba(hex, alpha) {
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function startDrawing(event) {
  if (!canvas.value) return;

  position.value.x = event.clientX - rect.value.left;
  position.value.y = event.clientY - rect.value.top;
  isDrawing.value = true;

  ctx.value.globalAlpha = props.opacity / 100;
  ctx.value.strokeStyle = hexToRgba(props.strokeStyle, props.opacity / 100);
  ctx.value.lineWidth = props.lineWidth;
  ctx.value.lineCap = "round";
  ctx.value.lineJoin = "round";

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
  const observer = new MutationObserver(() => {
    rect.value = canvas.value.getBoundingClientRect();
  });
  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  setTimeout(() => {
    observer.disconnect();
  }, 1000);

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
});
</script>

<template>
  <div class="board">
    <h2 class="board__mission">
      {{ t("draw_dots") }} {{ mission }}{{ t("exclamation_mark") }}
    </h2>
    <p
      :class="[
        'board__objective',
        { 'board__objective--sabotage': isSaboteur },
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
      />
      <div class="board__background"></div>
      <Cursor
        v-for="player in players"
        :key="player.socketId"
        :player="player"
      />
    </div>
  </div>
</template>
