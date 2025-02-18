<script setup>
import "../../assets/css/components/drawing/_board.scss";
import Cursor from "./Cursor.vue";
import { inject, onMounted, ref, useTemplateRef, watch } from "vue";
import { useSocketStore } from "../../stores/socket.js";
import { useI18n } from "vue-i18n";

const props = defineProps({
  mouseMoving: { type: Object, default: null },
  mouseUp: { type: Boolean, default: false },
  color: { type: String, default: "#1A120F" },
  lineWidth: { type: Number, default: 8 },
  opacity: { type: Number, default: 100 },
  tool: { type: String, default: "pen" },
});

const { socket } = useSocketStore();
const { t } = useI18n();
const canvas = useTemplateRef("canvas");
const tempCanvas = useTemplateRef("tempCanvas");
const rect = ref(null);
const position = ref({ x: 0, y: 0 });
const ctx = ref(null);
const tempCtx = ref(null);
const tempFirstPoints = ref([]);
const colorRgba = ref(hexToRgba(props.color, props.opacity / 100));
const isDrawingMap = ref({});
const mission = inject("mission");
const objective = inject("objective");
const isSaboteur = inject("isSaboteur");
const players = inject("players");
const teamId = inject("teamId");
const history = ref([]);
const historyIndex = ref(-1);
const globalCompositeOperation = ref("source-over");

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
    history: history.value,
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

  if (globalCompositeOperation.value === "destination-out") {
    ctx.value.globalCompositeOperation = "source-over";
  }

  const img = new Image();
  img.src = imageData;
  img.onload = () => {
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    ctx.value.drawImage(img, 0, 0);
  };
}

window.addEventListener("keydown", (event) => {
  event.preventDefault();

  if (!canvas.value) return;

  if ((event.ctrlKey || event.metaKey) && event.key === "z") {
    undo();
  } else if ((event.ctrlKey || event.metaKey) && event.key === "y") {
    redo();
  }
});

function hexToRgba(hex, alpha) {
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function handDraw(step, player) {
  const {
    x,
    y,
    opacity,
    color,
    lineWidth,
    globalCompositeOperation,
    tool,
    socketId,
  } = player;

  if (step === "start") {
    ctx.value.lineCap = "round";
    ctx.value.lineJoin = "round";
    ctx.value.globalAlpha = opacity;
    ctx.value.strokeStyle = color;
    ctx.value.lineWidth = lineWidth;
    ctx.value.globalCompositeOperation = globalCompositeOperation;

    ctx.value.beginPath();
    ctx.value.moveTo(x, y);
    ctx.value.lineTo(x, y);
    ctx.value.stroke();

    if (socketId === socket.id) {
      socket.emit("start-drawing", {
        x: x,
        y: y,
        global_composite_operation: globalCompositeOperation,
        global_alpha: opacity,
        color: color,
        line_width: lineWidth,
        team_id: teamId.value,
        socket_id: socketId,
        tool: tool,
      });
    }
  } else if (step === "draw") {
    ctx.value.lineTo(x, y);
    ctx.value.stroke();

    if (socketId === socket.id) {
      socket.emit("draw", {
        x: x,
        y: y,
        global_alpha: opacity,
        color: color,
        team_id: teamId.value,
        socket_id: socketId,
        tool: tool,
      });
    }
  } else if (step === "stop") {
    ctx.value.closePath();

    if (socketId === socket.id) {
      socket.emit("stop-drawing", {
        x: x,
        y: y,
        global_alpha: opacity,
        color: color,
        team_id: teamId.value,
        socket_id: socketId,
        tool: tool,
      });
    }
  }
}

function startDrawing(event, player) {
  if (!canvas.value) return;

  let drawingPlayer = player;

  if (!drawingPlayer) {
    position.value.x = event.clientX - rect.value.left;
    position.value.y = event.clientY - rect.value.top;
    colorRgba.value = hexToRgba(props.color, props.opacity / 100);

    if (props.tool !== "rubber") {
      globalCompositeOperation.value = "source-over";
    } else {
      globalCompositeOperation.value = "destination-out";
    }

    drawingPlayer = {
      x: position.value.x,
      y: position.value.y,
      opacity: props.opacity / 100,
      color: colorRgba.value,
      lineWidth: props.lineWidth,
      globalCompositeOperation: globalCompositeOperation.value,
      socketId: socket.id,
      tool: props.tool,
    };
  }

  isDrawingMap.value[drawingPlayer.socketId] = true;

  if (drawingPlayer.tool === "pen" || drawingPlayer.tool === "rubber") {
    handDraw("start", drawingPlayer);
  }
}

function draw(event, player) {
  if (!canvas.value) return;

  let drawingPlayer = player;

  if (!drawingPlayer) {
    position.value.x = event.clientX - rect.value.left;
    position.value.y = event.clientY - rect.value.top;

    drawingPlayer = {
      x: position.value.x,
      y: position.value.y,
      opacity: props.opacity / 100,
      color: colorRgba.value,
      socketId: socket.id,
      tool: props.tool,
    };
  }

  if (!isDrawingMap.value[drawingPlayer.socketId]) return;

  if (drawingPlayer.tool === "pen" || drawingPlayer.tool === "rubber") {
    handDraw("draw", drawingPlayer);
  }
}

function stopDrawing(player, element) {
  if (!canvas.value) return;

  let drawingPlayer = player;

  if (!drawingPlayer) {
    drawingPlayer = {
      x: position.value.x,
      y: position.value.y,
      opacity: props.opacity / 100,
      color: colorRgba.value,
      socketId: socket.id,
      tool: props.tool,
    };
  }

  isDrawingMap.value[drawingPlayer.socketId] = false;

  if (drawingPlayer.tool === "pen" || drawingPlayer.tool === "rubber") {
    handDraw("stop", drawingPlayer);
  }

  if (element === "board") {
    saveState();
  }
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

    // Temp canvas for preview
    tempCanvas.value.width = tempCanvas.value.offsetWidth;
    tempCanvas.value.height = tempCanvas.value.offsetHeight;
    tempCtx.value = tempCanvas.value.getContext("2d");
    tempCtx.value.lineCap = "round";
    tempCtx.value.lineJoin = "round";

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

  watch(
    () => props.mouseUp,
    (newValue) => {
      if (!newValue) return;
      stopDrawing();
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
      canvas: canvas.value.toDataURL(),
      history: history.value,
      history_index: historyIndex.value,
    });
  });

  socket.on("canvas-state", (data) => {
    if (!canvas.value || socket.id === data.socket_id) return;

    const img = new Image();

    img.onload = () => {
      ctx.value.drawImage(img, 0, 0);
    };
    img.src = data.canvas;

    history.value = data.history;
    historyIndex.value = data.history_index;
  });

  socket.on("start-drawing", (data) => {
    if (socket.id === data.socket_id) return;

    startDrawing(null, {
      x: data.x,
      y: data.y,
      opacity: data.global_alpha,
      color: data.color,
      lineWidth: data.line_width,
      globalCompositeOperation: data.global_composite_operation,
      socketId: data.socket_id,
      tool: data.tool,
    });
  });

  socket.on("draw", (data) => {
    if (socket.id === data.socket_id) return;

    draw(null, {
      x: data.x,
      y: data.y,
      opacity: data.global_alpha,
      color: data.color,
      socketId: data.socket_id,
      tool: data.tool,
    });
  });

  socket.on("stop-drawing", (data) => {
    if (socket.id === data.socket_id) return;

    stopDrawing(
      {
        x: data.x,
        y: data.y,
        opacity: data.global_alpha,
        color: data.color,
        socketId: data.socket_id,
        tool: data.tool,
      },
      "board",
    );
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
      <canvas ref="tempCanvas" class="board__canvas-temp" />
      <canvas
        ref="canvas"
        class="board__canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup.stop="stopDrawing(null, 'board')"
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
