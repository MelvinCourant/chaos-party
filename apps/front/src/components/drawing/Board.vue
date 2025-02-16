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
  tool: { type: String, default: "pen" },
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
const mouseDown = ref(false);
const history = ref([]);
const historyIndex = ref(-1);

function saveState() {
  if (!canvas.value) return;

  if (historyIndex.value < history.value.length - 1) {
    history.value.splice(historyIndex.value + 1);
  }

  history.value.push(canvas.value.toDataURL());
  historyIndex.value++;
}

function undo() {
  if (historyIndex.value <= 0) return;

  historyIndex.value--;
  restoreState(history.value[historyIndex.value]);

  socket.emit("undo", {
    team_id: teamId.value,
    socket_id: socket.id,
    history_index: historyIndex.value,
  });
}

function redo() {
  if (historyIndex.value >= history.value.length - 1) return;

  historyIndex.value++;
  restoreState(history.value[historyIndex.value]);

  socket.emit("redo", {
    team_id: teamId.value,
    socket_id: socket.id,
    history_index: historyIndex.value,
  });
}

function restoreState(imageData) {
  if (!canvas.value || !ctx.value) return;

  const img = new Image();
  img.src = imageData;
  img.onload = () => {
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    ctx.value.drawImage(img, 0, 0);
  };
}

window.addEventListener("keydown", (event) => {
  if (!canvas.value || !mouseDown) return;

  if ((event.ctrlKey || event.metaKey) && event.key === "z") {
    event.preventDefault();
    undo();
  } else if ((event.ctrlKey || event.metaKey) && event.key === "y") {
    event.preventDefault();
    redo();
  }
});

function hexToRgba(hex, alpha) {
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function startDrawing(event) {
  if (!canvas.value) return;

  mouseDown.value = true;
  position.value.x = event.clientX - rect.value.left;
  position.value.y = event.clientY - rect.value.top;
  isDrawing.value = true;

  const color = hexToRgba(props.strokeStyle, props.opacity / 100);

  ctx.value.globalAlpha = props.opacity / 100;
  ctx.value.strokeStyle = color;
  ctx.value.lineWidth = props.lineWidth;
  ctx.value.lineCap = "round";
  ctx.value.lineJoin = "round";

  ctx.value.beginPath();
  ctx.value.moveTo(position.value.x, position.value.y);
  ctx.value.lineTo(position.value.x, position.value.y);
  ctx.value.stroke();

  socket.emit("start-drawing", {
    x: position.value.x,
    y: position.value.y,
    global_alpha: props.opacity / 100,
    stroke_style: color,
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

  mouseDown.value = false;
  isDrawing.value = false;
  ctx.value.closePath();

  socket.emit("stop-drawing", {
    team_id: teamId.value,
    socket_id: socket.id,
  });

  saveState();
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
  }, 500);

  window.addEventListener("resize", () => {
    rect.value = canvas.value.getBoundingClientRect();
  });

  if (canvas.value) {
    canvas.value.width = canvas.value.offsetWidth;
    canvas.value.height = canvas.value.offsetHeight;
    ctx.value = canvas.value.getContext("2d");
    ctx.value.lineCap = "round";
    ctx.value.lineJoin = "round";
    saveState();
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

  watch(
    () => props.mouseMoving,
    (newValue) => {
      if (!newValue) return;
      mouseMove(newValue);
    },
  );

  socket.on("get-state", () => {
    if (!canvas.value) return;

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
    if (socket.id === data.socket_id) return;

    isDrawingMap.value[data.socket_id] = true;

    if (!canvas.value) return;

    ctx.value.globalAlpha = data.global_alpha;
    ctx.value.strokeStyle = data.stroke_style;
    ctx.value.lineWidth = data.line_width;
    ctx.value.beginPath();
    ctx.value.lineTo(data.x, data.y);
    ctx.value.stroke();
    ctx.value.moveTo(data.x, data.y);
  });

  socket.on("draw", (data) => {
    if (
      !canvas.value ||
      !isDrawingMap.value[data.socket_id] ||
      socket.id === data.socket_id
    )
      return;

    ctx.value.lineTo(data.x, data.y);
    ctx.value.stroke();
  });

  socket.on("stop-drawing", (data) => {
    if (socket.id === data.socket_id) return;

    isDrawingMap.value[data.socket_id] = false;

    if (!canvas.value) return;

    ctx.value.closePath();
    saveState();
  });

  socket.on("undo", (data) => {
    if (socket.id === data.socket_id) return;

    historyIndex.value = data.history_index;
    restoreState(history.value[historyIndex.value]);
  });

  socket.on("redo", (data) => {
    if (socket.id === data.socket_id) return;

    historyIndex.value = data.history_index;
    restoreState(history.value[historyIndex.value]);
  });
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
