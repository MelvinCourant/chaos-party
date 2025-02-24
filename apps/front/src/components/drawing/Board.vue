<script setup>
import '../../assets/css/components/drawing/_board.scss';
import Cursor from './Cursor.vue';
import { inject, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useSocketStore } from '../../stores/socket.js';
import { useI18n } from 'vue-i18n';
import { usePartyStore } from '../../stores/party.js';

const props = defineProps({
  mouseMoving: { type: Object, default: null },
  mouseUp: { type: Boolean, default: false },
  color: { type: String, default: '#1A120F' },
  lineWidth: { type: Number, default: 8 },
  opacity: { type: Number, default: 100 },
  tool: { type: String, default: 'pen' },
});

const { socket } = useSocketStore();
const { t } = useI18n();
const canvas = useTemplateRef('canvas');
const tempCanvas = useTemplateRef('tempCanvas');
const rect = ref(null);
const position = ref({ x: 0, y: 0 });
const ctx = ref(null);
const tempCtx = ref(null);
const tempFirstPoints = ref([]);
const colorRgba = ref(hexToRgba(props.color, props.opacity / 100));
const isDrawingMap = ref({});
const mission = inject('mission');
const objective = inject('objective');
const isSaboteur = inject('isSaboteur');
const players = inject('players');
const teamId = inject('teamId');
const partyStore = usePartyStore();
const partyId = partyStore.partyId;
const history = ref([]);
const historyIndex = ref(-1);
const globalCompositeOperation = ref('source-over');
const onSaving = ref(false);

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

  socket.emit('undo', {
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

  socket.emit('redo', {
    team_id: teamId.value,
    socket_id: socket.id,
    history_index: historyIndex.value,
  });
}

function restoreState(imageData) {
  if (!canvas.value || !ctx.value) return;

  if (globalCompositeOperation.value === 'destination-out') {
    ctx.value.globalCompositeOperation = 'source-over';
  }

  const img = new Image();
  img.src = imageData;
  img.onload = () => {
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    ctx.value.drawImage(img, 0, 0);
  };
}

window.addEventListener('keydown', (event) => {
  event.preventDefault();

  if (!canvas.value) return;

  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    undo();
  } else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
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

  if (step === 'start') {
    ctx.value.strokeStyle = color;
    ctx.value.lineWidth = lineWidth;
    ctx.value.globalCompositeOperation = globalCompositeOperation;

    ctx.value.beginPath();
    ctx.value.moveTo(x, y);
    ctx.value.lineTo(x, y);
    ctx.value.stroke();

    if (socketId === socket.id) {
      socket.emit('start-drawing', {
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
  } else if (step === 'draw') {
    ctx.value.lineTo(x, y);
    ctx.value.stroke();

    if (socketId === socket.id) {
      socket.emit('draw', {
        x: x,
        y: y,
        global_alpha: opacity,
        color: color,
        team_id: teamId.value,
        socket_id: socketId,
        tool: tool,
      });
    }
  } else if (step === 'stop') {
    ctx.value.closePath();

    if (socketId === socket.id) {
      socket.emit('stop-drawing', {
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

function lineDraw(step, player) {
  const { x, y, opacity, color, lineWidth, tool, socketId } = player;

  if (step === 'start') {
    ctx.value.globalAlpha = opacity;
    ctx.value.strokeStyle = color;
    ctx.value.lineWidth = lineWidth;
    ctx.value.globalCompositeOperation = 'source-over';

    tempCtx.value.globalAlpha = opacity;
    tempCtx.value.strokeStyle = color;
    tempCtx.value.lineWidth = lineWidth;
    tempFirstPoints.value.push({
      socket_id: socketId,
      x: x,
      y: y,
    });

    tempCtx.value.beginPath();
    tempCtx.value.moveTo(x, y);
    tempCtx.value.lineTo(x, y);
    tempCtx.value.stroke();

    const firstPoint = tempFirstPoints.value.find(
      (point) => point.socket_id === socketId,
    );

    if (socketId === socket.id) {
      socket.emit('start-drawing-shape', {
        first_point_x: firstPoint.x,
        first_point_y: firstPoint.y,
        global_alpha: opacity,
        color: color,
        line_width: lineWidth,
        team_id: teamId.value,
        socket_id: socketId,
        tool: tool,
      });
    }
  } else if (step === 'draw' || step === 'stop') {
    const firstPoint = tempFirstPoints.value.find(
      (point) => point.socket_id === socketId,
    );

    tempCtx.value.clearRect(
      0,
      0,
      tempCanvas.value.width,
      tempCanvas.value.height,
    );
    tempCtx.value.closePath();

    if (step === 'draw') {
      tempCtx.value.beginPath();
      tempCtx.value.moveTo(firstPoint.x, firstPoint.y);
      tempCtx.value.lineTo(x, y);
      tempCtx.value.stroke();

      if (socketId === socket.id) {
        socket.emit('draw', {
          x: x,
          y: y,
          global_alpha: opacity,
          color: color,
          team_id: teamId.value,
          socket_id: socketId,
          tool: tool,
        });
      }
    } else {
      ctx.value.beginPath();
      ctx.value.moveTo(firstPoint.x, firstPoint.y);
      ctx.value.lineTo(x, y);
      ctx.value.stroke();
      ctx.value.closePath();

      tempFirstPoints.value = tempFirstPoints.value.filter(
        (point) => point.socket_id !== socketId,
      );

      if (socketId === socket.id) {
        socket.emit('stop-drawing', {
          x: x,
          y: y,
          global_alpha: opacity,
          color: color,
          line_width: lineWidth,
          team_id: teamId.value,
          socket_id: socketId,
          tool: tool,
        });
      }
    }
  }
}

function rectangleDraw(step, player) {
  const { x, y, opacity, color, lineWidth, tool, socketId } = player;

  if (step === 'start') {
    ctx.value.globalAlpha = opacity;
    ctx.value.lineWidth = lineWidth;
    ctx.value.globalCompositeOperation = 'source-over';

    if (tool === 'empty-rectangle') {
      ctx.value.strokeStyle = color;
    } else {
      ctx.value.strokeStyle = 'transparent';
      ctx.value.fillStyle = color;
    }

    tempCtx.value.globalAlpha = opacity;
    tempCtx.value.lineWidth = lineWidth;
    tempFirstPoints.value.push({
      socket_id: socketId,
      x: x,
      y: y,
    });

    if (tool === 'empty-rectangle') {
      tempCtx.value.strokeStyle = color;
    } else {
      tempCtx.value.strokeStyle = 'transparent';
      tempCtx.value.fillStyle = color;
    }

    tempCtx.value.beginPath();
    tempCtx.value.moveTo(x, y);

    if (tool === 'empty-rectangle') {
      tempCtx.value.strokeRect(x, y, 1, 1);
    } else {
      tempCtx.value.fillRect(x, y, 1, 1);
    }

    const firstPoint = tempFirstPoints.value.find(
      (point) => point.socket_id === socketId,
    );

    if (socketId === socket.id) {
      socket.emit('start-drawing-shape', {
        first_point_x: firstPoint.x,
        first_point_y: firstPoint.y,
        global_alpha: opacity,
        color: color,
        line_width: lineWidth,
        team_id: teamId.value,
        socket_id: socketId,
        tool: tool,
      });
    }
  } else if (step === 'draw' || step === 'stop') {
    const firstPoint = tempFirstPoints.value.find(
      (point) => point.socket_id === socketId,
    );

    tempCtx.value.clearRect(
      0,
      0,
      tempCanvas.value.width,
      tempCanvas.value.height,
    );
    tempCtx.value.closePath();

    if (step === 'draw') {
      tempCtx.value.beginPath();
      tempCtx.value.moveTo(firstPoint.x, firstPoint.y);

      if (tool === 'empty-rectangle') {
        tempCtx.value.strokeRect(
          firstPoint.x,
          firstPoint.y,
          Math.floor(x - firstPoint.x),
          Math.floor(y - firstPoint.y),
        );
      } else {
        tempCtx.value.fillRect(
          firstPoint.x,
          firstPoint.y,
          x - firstPoint.x,
          y - firstPoint.y,
        );
      }

      if (socketId === socket.id) {
        socket.emit('draw', {
          x: x,
          y: y,
          global_alpha: opacity,
          color: color,
          team_id: teamId.value,
          socket_id: socketId,
          tool: tool,
        });
      }
    } else {
      ctx.value.beginPath();
      ctx.value.moveTo(firstPoint.x, firstPoint.y);

      if (tool === 'empty-rectangle') {
        ctx.value.rect(
          firstPoint.x,
          firstPoint.y,
          Math.floor(x - firstPoint.x),
          Math.floor(y - firstPoint.y),
        );
      } else {
        ctx.value.fillRect(
          firstPoint.x,
          firstPoint.y,
          x - firstPoint.x,
          y - firstPoint.y,
        );
      }

      ctx.value.stroke();
      ctx.value.closePath();

      tempFirstPoints.value = tempFirstPoints.value.filter(
        (point) => point.socket_id !== socketId,
      );

      if (socketId === socket.id) {
        socket.emit('stop-drawing', {
          x: x,
          y: y,
          global_alpha: opacity,
          color: color,
          line_width: lineWidth,
          team_id: teamId.value,
          socket_id: socketId,
          tool: tool,
        });
      }
    }
  }
}

function ellipseDraw(step, player) {
  const { x, y, opacity, color, lineWidth, tool, socketId } = player;

  if (step === 'start') {
    ctx.value.globalAlpha = opacity;
    ctx.value.lineWidth = lineWidth;
    ctx.value.globalCompositeOperation = 'source-over';

    if (tool === 'empty-ellipse') {
      ctx.value.strokeStyle = color;
    } else {
      ctx.value.strokeStyle = 'transparent';
      ctx.value.fillStyle = color;
    }

    tempCtx.value.globalAlpha = opacity;
    tempCtx.value.lineWidth = lineWidth;
    tempFirstPoints.value.push({
      socket_id: socketId,
      x: x,
      y: y,
    });

    if (tool === 'empty-ellipse') {
      tempCtx.value.strokeStyle = color;
    } else {
      tempCtx.value.strokeStyle = 'transparent';
      tempCtx.value.fillStyle = color;
    }

    tempCtx.value.beginPath();
    tempCtx.value.moveTo(x, y);
    tempCtx.value.ellipse(x, y, 1, 1, 0, 0, Math.PI * 2);

    if (tool === 'ellipse') {
      tempCtx.value.fill();
    }

    tempCtx.value.stroke();

    const firstPoint = tempFirstPoints.value.find(
      (point) => point.socket_id === socketId,
    );

    if (socketId === socket.id) {
      socket.emit('start-drawing-shape', {
        first_point_x: firstPoint.x,
        first_point_y: firstPoint.y,
        global_alpha: opacity,
        color: color,
        line_width: lineWidth,
        team_id: teamId.value,
        socket_id: socketId,
        tool: tool,
      });
    }
  } else if (step === 'draw' || step === 'stop') {
    const firstPoint = tempFirstPoints.value.find(
      (point) => point.socket_id === socketId,
    );
    const centerX = (firstPoint.x + x) / 2;
    const centerY = (firstPoint.y + y) / 2;
    const radiusX = Math.abs(x - firstPoint.x) / 2;
    const radiusY = Math.abs(y - firstPoint.y) / 2;

    tempCtx.value.clearRect(
      0,
      0,
      tempCanvas.value.width,
      tempCanvas.value.height,
    );
    tempCtx.value.closePath();

    if (step === 'draw') {
      tempCtx.value.beginPath();
      tempCtx.value.ellipse(
        centerX,
        centerY,
        radiusX,
        radiusY,
        0,
        0,
        Math.PI * 2,
      );

      if (tool === 'ellipse') {
        tempCtx.value.fill();
      }

      tempCtx.value.stroke();

      if (socketId === socket.id) {
        socket.emit('draw', {
          x: x,
          y: y,
          global_alpha: opacity,
          color: color,
          team_id: teamId.value,
          socket_id: socketId,
          tool: tool,
        });
      }
    } else {
      ctx.value.beginPath();
      ctx.value.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);

      if (tool === 'ellipse') {
        ctx.value.fill();
      }

      ctx.value.stroke();
      ctx.value.closePath();

      tempFirstPoints.value = tempFirstPoints.value.filter(
        (point) => point.socket_id !== socketId,
      );

      if (socketId === socket.id) {
        socket.emit('stop-drawing', {
          x: x,
          y: y,
          global_alpha: opacity,
          color: color,
          line_width: lineWidth,
          team_id: teamId.value,
          socket_id: socketId,
          tool: tool,
        });
      }
    }
  }
}

function floodFill(player) {
  const { x, y, opacity, color, socketId } = player;

  if (!canvas.value || !ctx.value) return;

  ctx.value.globalAlpha = opacity;
  ctx.value.globalCompositeOperation = 'source-over';

  const imageData = ctx.value.getImageData(
    0,
    0,
    canvas.value.width,
    canvas.value.height,
  );
  const data = imageData.data;
  const width = canvas.value.width;
  const height = canvas.value.height;

  const startX = Math.floor(x);
  const startY = Math.floor(y);
  const targetPos = (startY * width + startX) * 4;

  const targetR = data[targetPos];
  const targetG = data[targetPos + 1];
  const targetB = data[targetPos + 2];
  const targetA = data[targetPos + 3];

  const isEmptyCanvas = targetA < 10;

  const rgbaMatch = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([.\d]+))?\)/,
  );
  if (!rgbaMatch) return;

  const fillR = parseInt(rgbaMatch[1]);
  const fillG = parseInt(rgbaMatch[2]);
  const fillB = parseInt(rgbaMatch[3]);
  const fillA = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) * 255 : 255;

  if (
    !isEmptyCanvas &&
    Math.abs(targetR - fillR) < 5 &&
    Math.abs(targetG - fillG) < 5 &&
    Math.abs(targetB - fillB) < 5 &&
    Math.abs(targetA - fillA) < 5
  ) {
    return;
  }

  const tolerance = 20;

  const isSimilarColor = (pos) => {
    if (isEmptyCanvas) {
      return data[pos + 3] < 10;
    } else {
      const alphaTolerance = data[pos + 3] < 200 ? tolerance * 2 : tolerance;
      return (
        Math.abs(data[pos] - targetR) <= alphaTolerance &&
        Math.abs(data[pos + 1] - targetG) <= alphaTolerance &&
        Math.abs(data[pos + 2] - targetB) <= alphaTolerance &&
        Math.abs(data[pos + 3] - targetA) <= tolerance
      );
    }
  };

  const stack = [[startX, startY]];
  const processed = new Set();
  const getIndex = (x, y) => (y * width + x) * 4;
  const getPosId = (x, y) => `${x},${y}`;

  while (stack.length) {
    const [curX, curY] = stack.pop();
    const id = getPosId(curX, curY);

    if (
      processed.has(id) ||
      curX < 0 ||
      curX >= width ||
      curY < 0 ||
      curY >= height
    ) {
      continue;
    }

    const pos = getIndex(curX, curY);

    if (!isSimilarColor(pos)) {
      continue;
    }

    data[pos] = fillR;
    data[pos + 1] = fillG;
    data[pos + 2] = fillB;
    data[pos + 3] = fillA;

    processed.add(id);

    stack.push([curX + 1, curY]);
    stack.push([curX - 1, curY]);
    stack.push([curX, curY + 1]);
    stack.push([curX, curY - 1]);
  }

  ctx.value.putImageData(imageData, 0, 0);

  if (socketId === socket.id) {
    socket.emit('start-drawing', {
      x: x,
      y: y,
      global_alpha: opacity,
      color: color,
      team_id: teamId.value,
      socket_id: socketId,
      tool: 'paint-pot',
    });

    socket.emit('stop-drawing', {
      x: x,
      y: y,
      global_alpha: opacity,
      color: color,
      team_id: teamId.value,
      socket_id: socketId,
      tool: 'paint-pot',
    });
  }
}

function startDrawing(event, player) {
  if (!canvas.value) return;

  let drawingPlayer = player;

  if (!drawingPlayer) {
    position.value.x = Math.floor(event.clientX - rect.value.left);
    position.value.y = Math.floor(event.clientY - rect.value.top);
    colorRgba.value = hexToRgba(props.color, props.opacity / 100);

    if (props.tool !== 'rubber') {
      globalCompositeOperation.value = 'source-over';
    } else {
      globalCompositeOperation.value = 'destination-out';
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

  if (drawingPlayer.tool === 'pen' || drawingPlayer.tool === 'rubber') {
    handDraw('start', drawingPlayer);
  } else if (drawingPlayer.tool === 'line') {
    lineDraw('start', drawingPlayer);
  } else if (
    drawingPlayer.tool === 'empty-rectangle' ||
    drawingPlayer.tool === 'rectangle'
  ) {
    rectangleDraw('start', drawingPlayer);
  } else if (
    drawingPlayer.tool === 'empty-ellipse' ||
    drawingPlayer.tool === 'ellipse'
  ) {
    ellipseDraw('start', drawingPlayer);
  } else if (drawingPlayer.tool === 'paint-pot') {
    floodFill(drawingPlayer);
  }
}

function draw(event, player) {
  if (!canvas.value) return;

  let drawingPlayer = player;

  if (!drawingPlayer) {
    position.value.x = Math.floor(event.clientX - rect.value.left);
    position.value.y = Math.floor(event.clientY - rect.value.top);

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

  if (drawingPlayer.tool === 'pen' || drawingPlayer.tool === 'rubber') {
    handDraw('draw', drawingPlayer);
  } else if (drawingPlayer.tool === 'line') {
    lineDraw('draw', drawingPlayer);
  } else if (
    drawingPlayer.tool === 'empty-rectangle' ||
    drawingPlayer.tool === 'rectangle'
  ) {
    rectangleDraw('draw', drawingPlayer);
  } else if (
    drawingPlayer.tool === 'empty-ellipse' ||
    drawingPlayer.tool === 'ellipse'
  ) {
    ellipseDraw('draw', drawingPlayer);
  }
}

function stopDrawing(player) {
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

  if (!isDrawingMap.value[drawingPlayer.socketId]) return;

  isDrawingMap.value[drawingPlayer.socketId] = false;

  if (drawingPlayer.tool === 'pen' || drawingPlayer.tool === 'rubber') {
    handDraw('stop', drawingPlayer);
  } else if (drawingPlayer.tool === 'line') {
    lineDraw('stop', drawingPlayer);
  } else if (
    drawingPlayer.tool === 'empty-rectangle' ||
    drawingPlayer.tool === 'rectangle'
  ) {
    rectangleDraw('stop', drawingPlayer);
  } else if (
    drawingPlayer.tool === 'empty-ellipse' ||
    drawingPlayer.tool === 'ellipse'
  ) {
    ellipseDraw('stop', drawingPlayer);
  }

  saveState();
}

onMounted(() => {
  if (canvas.value) {
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

    window.addEventListener('resize', () => {
      rect.value = canvas.value.getBoundingClientRect();
    });

    canvas.value.width = canvas.value.offsetWidth;
    canvas.value.height = canvas.value.offsetHeight;
    ctx.value = canvas.value.getContext('2d');
    ctx.value.lineCap = 'round';

    // Temp canvas for preview
    tempCanvas.value.width = tempCanvas.value.offsetWidth;
    tempCanvas.value.height = tempCanvas.value.offsetHeight;
    tempCtx.value = tempCanvas.value.getContext('2d');
    tempCtx.value.lineCap = 'round';

    saveState();
  }

  function mouseMove(event) {
    position.value.x = event.clientX - rect.value.left;
    position.value.y = event.clientY - rect.value.top;

    socket.emit('player-move', {
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

      if (isDrawingMap.value[socket.id]) {
        draw(newValue);
      }
    },
  );

  watch(
    () => props.mouseUp,
    (newValue) => {
      if (!newValue) return;
      stopDrawing();
    },
  );

  socket.on('party-state', () => {
    if (!canvas.value) return;

    socket.emit('player-state', {
      x: position.value.x,
      y: position.value.y,
      team_id: teamId.value,
      socket_id: socket.id,
    });

    socket.emit('canvas-state', {
      team_id: teamId.value,
      canvas: canvas.value.toDataURL(),
      history: history.value,
      history_index: historyIndex.value,
    });
  });

  socket.on('canvas-state', (data) => {
    if (!canvas.value || socket.id === data.socket_id) return;

    const img = new Image();

    img.onload = () => {
      ctx.value.drawImage(img, 0, 0);
    };
    img.src = data.canvas;

    history.value = data.history;
    historyIndex.value = data.history_index;
  });

  socket.on('start-drawing', (data) => {
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

  socket.on('start-drawing-shape', (data) => {
    if (socket.id === data.socket_id) return;

    startDrawing(null, {
      x: data.first_point_x,
      y: data.first_point_y,
      opacity: data.global_alpha,
      color: data.color,
      lineWidth: data.line_width,
      socketId: data.socket_id,
      tool: data.tool,
    });
  });

  socket.on('draw', (data) => {
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

  socket.on('stop-drawing', (data) => {
    if (socket.id === data.socket_id) return;

    stopDrawing({
      x: data.x,
      y: data.y,
      opacity: data.global_alpha,
      color: data.color,
      socketId: data.socket_id,
      tool: data.tool,
    });
  });

  socket.on('undo', (data) => {
    if (socket.id === data.socket_id) return;

    historyIndex.value = data.history_index;
    restoreState(history.value[historyIndex.value]);
  });

  socket.on('redo', (data) => {
    if (socket.id === data.socket_id) return;

    historyIndex.value = data.history_index;
    restoreState(history.value[historyIndex.value]);
  });

  socket.on('on-saving-draw', () => {
    onSaving.value = true;
  });

  socket.on('timer-finished', () => {
    setTimeout(() => {
      if (!onSaving.value) {
        socket.emit('final-draw', {
          team_id: teamId.value,
          party_id: partyId,
          draw: canvas.value.toDataURL(),
        });
      }
    }, Math.random() * 500);
  });
});
</script>

<template>
  <div class="board">
    <h2 class="board__mission">
      {{ t('draw_dots') }} {{ mission }}{{ t('exclamation_mark') }}
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
        @mouseup.stop="stopDrawing()"
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
