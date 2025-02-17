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
const isDrawing = ref(false);
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

function startDrawing(event) {
  if (!canvas.value) return;

  position.value.x = event.clientX - rect.value.left;
  position.value.y = event.clientY - rect.value.top;
  isDrawing.value = true;

  colorRgba.value = hexToRgba(props.color, props.opacity / 100);

  ctx.value.globalAlpha = props.opacity / 100;
  ctx.value.strokeStyle = colorRgba.value;
  ctx.value.lineWidth = props.lineWidth;
  ctx.value.lineCap = "round";
  ctx.value.lineJoin = "round";

  if (
    props.tool === "line" ||
    props.tool === "empty-rectangle" ||
    props.tool === "rectangle"
  ) {
    tempCtx.value.globalAlpha = props.opacity / 100;
    tempCtx.value.lineWidth = props.lineWidth;
    tempCtx.value.lineCap = "round";
    tempCtx.value.lineJoin = "round";
    tempFirstPoints.value.push({
      socket_id: socket.id,
      x: position.value.x,
      y: position.value.y,
    });
  }

  ctx.value.beginPath();
  ctx.value.moveTo(position.value.x, position.value.y);

  if (props.tool !== "rubber") {
    globalCompositeOperation.value = "source-over";
    ctx.value.globalCompositeOperation = globalCompositeOperation.value;
  } else {
    globalCompositeOperation.value = "destination-out";
    ctx.value.globalCompositeOperation = globalCompositeOperation.value;
  }

  if (props.tool === "rectangle") {
    ctx.value.fillStyle = colorRgba.value;
    ctx.value.fillRect(position.value.x, position.value.y, 1, 1);
  } else if (props.tool === "empty-rectangle") {
    tempCtx.value.strokeStyle = colorRgba.value;
    ctx.value.rect(position.value.x, position.value.y, 1, 1);
  } else {
    ctx.value.lineTo(position.value.x, position.value.y);
    ctx.value.stroke();
  }

  if (props.tool === "pen" || props.tool === "rubber") {
    socket.emit("start-drawing", {
      x: position.value.x,
      y: position.value.y,
      global_composite_operation: globalCompositeOperation.value,
      global_alpha: props.opacity / 100,
      color: colorRgba.value,
      line_width: props.lineWidth,
      team_id: teamId.value,
      socket_id: socket.id,
    });
  } else {
    const firstPoint = tempFirstPoints.value.find(
      (point) => point.socket_id === socket.id,
    );

    socket.emit("start-drawing-shape", {
      first_point_x: firstPoint.x,
      first_point_y: firstPoint.y,
      global_alpha: props.opacity / 100,
      color: colorRgba.value,
      line_width: props.lineWidth,
      team_id: teamId.value,
      socket_id: socket.id,
    });
  }
}

function draw(event) {
  if (!isDrawing.value || !canvas.value) return;

  position.value.x = event.clientX - rect.value.left;
  position.value.y = event.clientY - rect.value.top;

  if (
    props.tool === "line" ||
    props.tool === "empty-rectangle" ||
    props.tool === "rectangle"
  ) {
    const firstPoint = tempFirstPoints.value.find(
      (point) => point.socket_id === socket.id,
    );

    if (props.tool === "line" || props.tool === "empty-rectangle") {
      tempCtx.value.strokeStyle = colorRgba.value;
    } else if (props.tool === "rectangle") {
      tempCtx.value.fillStyle = colorRgba.value;
    }

    tempCtx.value.clearRect(
      0,
      0,
      tempCanvas.value.width,
      tempCanvas.value.height,
    );
    tempCtx.value.beginPath();
    tempCtx.value.moveTo(firstPoint.x, firstPoint.y);

    if (props.tool === "empty-rectangle") {
      tempCtx.value.rect(
        firstPoint.x,
        firstPoint.y,
        position.value.x - firstPoint.x,
        position.value.y - firstPoint.y,
      );
    } else if (props.tool === "rectangle") {
      tempCtx.value.fillRect(
        firstPoint.x,
        firstPoint.y,
        position.value.x - firstPoint.x,
        position.value.y - firstPoint.y,
      );
    } else {
      tempCtx.value.lineTo(position.value.x, position.value.y);
    }

    tempCtx.value.stroke();
  } else {
    ctx.value.lineTo(position.value.x, position.value.y);
    ctx.value.stroke();
  }

  socket.emit("draw", {
    x: position.value.x,
    y: position.value.y,
    global_alpha: props.opacity / 100,
    color: colorRgba.value,
    team_id: teamId.value,
    socket_id: socket.id,
    tool: props.tool,
  });
}

function stopDrawing(element) {
  if (!isDrawing.value || !canvas.value) return;

  if (
    props.tool === "line" ||
    props.tool === "empty-rectangle" ||
    props.tool === "rectangle"
  ) {
    tempCtx.value.clearRect(
      0,
      0,
      tempCanvas.value.width,
      tempCanvas.value.height,
    );
    tempCtx.value.closePath();

    if (props.tool === "empty-rectangle" || props.tool === "rectangle") {
      const firstPoint = tempFirstPoints.value.find(
        (point) => point.socket_id === socket.id,
      );

      if (props.tool === "empty-rectangle") {
        ctx.value.rect(
          firstPoint.x,
          firstPoint.y,
          position.value.x - firstPoint.x,
          position.value.y - firstPoint.y,
        );
      } else if (props.tool === "rectangle") {
        ctx.value.fillRect(
          firstPoint.x,
          firstPoint.y,
          position.value.x - firstPoint.x,
          position.value.y - firstPoint.y,
        );
      }
    } else {
      ctx.value.lineTo(position.value.x, position.value.y);
    }

    ctx.value.stroke();
    tempFirstPoints.value = tempFirstPoints.value.filter(
      (point) => point.socket_id !== socket.id,
    );
  }

  isDrawing.value = false;
  ctx.value.closePath();

  socket.emit("stop-drawing", {
    x: position.value.x,
    y: position.value.y,
    global_alpha: props.opacity / 100,
    color: colorRgba.value,
    team_id: teamId.value,
    socket_id: socket.id,
    tool: props.tool,
  });

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
    ctx.value.strokeStyle = data.color;
    ctx.value.lineWidth = data.line_width;
    ctx.value.globalCompositeOperation = data.global_composite_operation;

    ctx.value.beginPath();
    ctx.value.lineTo(data.x, data.y);
    ctx.value.stroke();
    ctx.value.moveTo(data.x, data.y);
  });

  socket.on("start-drawing-shape", (data) => {
    if (socket.id === data.socket_id) return;

    isDrawingMap.value[data.socket_id] = true;

    if (!canvas.value) return;

    ctx.value.globalAlpha = data.global_alpha;
    ctx.value.strokeStyle = data.color;
    ctx.value.lineWidth = data.line_width;

    tempCtx.value.globalAlpha = data.global_alpha;
    tempCtx.value.lineWidth = data.line_width;
    tempFirstPoints.value.push({
      socket_id: data.socket_id,
      x: data.first_point_x,
      y: data.first_point_y,
    });

    if (props.tool === "rectangle") {
      ctx.value.fillStyle = data.color;
    } else {
      tempCtx.value.strokeStyle = data.color;
    }

    ctx.value.beginPath();
    ctx.value.moveTo(data.first_point_x, data.first_point_y);

    if (props.tool === "rectangle") {
      ctx.value.fillRect(data.first_point_x, data.first_point_y, 1, 1);
    } else if (props.tool === "empty-rectangle") {
      tempCtx.value.rect(data.first_point_x, data.first_point_y, 1, 1);
    } else {
      tempCtx.value.lineTo(data.first_point_x, data.first_point_x);
    }

    ctx.value.stroke();
  });

  socket.on("draw", (data) => {
    if (
      !canvas.value ||
      !isDrawingMap.value[data.socket_id] ||
      socket.id === data.socket_id
    )
      return;

    if (
      data.tool === "line" ||
      data.tool === "empty-rectangle" ||
      data.tool === "rectangle"
    ) {
      const firstPoint = tempFirstPoints.value.find(
        (point) => point.socket_id === data.socket_id,
      );

      ctx.value.globalCompositeOperation = "source-over";

      if (data.tool === "rectangle") {
        tempCtx.value.fillStyle = data.color;
      } else if (data.tool === "empty-rectangle") {
        tempCtx.value.strokeStyle = data.color;
      }

      tempCtx.value.clearRect(
        0,
        0,
        tempCanvas.value.width,
        tempCanvas.value.height,
      );
      tempCtx.value.beginPath();
      tempCtx.value.moveTo(firstPoint.x, firstPoint.y);

      if (data.tool === "empty-rectangle") {
        tempCtx.value.rect(
          firstPoint.x,
          firstPoint.y,
          data.x - firstPoint.x,
          data.y - firstPoint.y,
        );
      } else if (data.tool === "rectangle") {
        tempCtx.value.fillRect(
          firstPoint.x,
          firstPoint.y,
          data.x - firstPoint.x,
          data.y - firstPoint.y,
        );
      } else {
        tempCtx.value.lineTo(data.x, data.y);
      }

      tempCtx.value.stroke();
    } else {
      ctx.value.lineTo(data.x, data.y);
      ctx.value.stroke();
    }
  });

  socket.on("stop-drawing", (data) => {
    if (socket.id === data.socket_id) return;

    isDrawingMap.value[data.socket_id] = false;

    if (!canvas.value) return;

    if (
      data.tool === "line" ||
      data.tool === "empty-rectangle" ||
      data.tool === "rectangle"
    ) {
      const firstPoint = tempFirstPoints.value.find(
        (point) => point.socket_id === data.socket_id,
      );

      tempCtx.value.clearRect(
        0,
        0,
        tempCanvas.value.width,
        tempCanvas.value.height,
      );
      tempCtx.value.closePath();

      if (data.tool === "empty-rectangle") {
        ctx.value.strokeStyle = data.color;
        ctx.value.rect(
          firstPoint.x,
          firstPoint.y,
          data.x - firstPoint.x,
          data.y - firstPoint.y,
        );
      } else if (data.tool === "rectangle") {
        ctx.value.fillStyle = data.color;
        ctx.value.fillRect(
          firstPoint.x,
          firstPoint.y,
          data.x - firstPoint.x,
          data.y - firstPoint.y,
        );
      } else {
        ctx.value.strokeStyle = data.color;
        ctx.value.lineTo(data.x, data.y);
      }

      ctx.value.stroke();

      tempFirstPoints.value = tempFirstPoints.value.filter(
        (point) => point.socket_id !== data.socket_id,
      );
    }

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
      <canvas ref="tempCanvas" class="board__canvas-temp" />
      <canvas
        ref="canvas"
        class="board__canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup.stop="stopDrawing('board')"
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
