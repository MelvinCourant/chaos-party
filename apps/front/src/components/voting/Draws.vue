<script setup>
import '../../assets/css/components/voting/_draws.scss';
import { useI18n } from 'vue-i18n';
import { reactive, ref } from 'vue';
import Button from '../inputs/Button.vue';
import Icon from '../utils/Icon.vue';

defineProps({
  draws: {
    type: Array,
    required: true,
  },
});

const { t } = useI18n();
const env = import.meta.env;
const selectedDraw = reactive({
  mission: '',
  image: '',
});

function generateDrawUrl(image) {
  return new URL(`${env.VITE_URL}/uploads/${image}`).href;
}

function updateSelectedDraw(draw) {
  selectedDraw.mission = draw.mission;
  selectedDraw.image = draw.image;
}

async function downloadDraw() {
  if (!selectedDraw.image) return;

  const imageUrl = generateDrawUrl(selectedDraw.image);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imageUrl;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  canvas.toBlob(
    (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = selectedDraw.image.replace(/\.\w+$/, '.jpg');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    'image/jpeg',
    1,
  );
}
</script>

<template>
  <div class="draws">
    <button
      class="draws__draw"
      v-for="draw in draws"
      :key="draw"
      @click="updateSelectedDraw(draw)"
    >
      <img :src="generateDrawUrl(draw.image)" :alt="draw.mission" />
      <div class="draws__background"></div>
    </button>
  </div>
  <div
    class="draws-preview"
    v-if="selectedDraw.image"
    @click.self="updateSelectedDraw({ mission: '', image: '' })"
  >
    <h2 class="draws-preview__mission">{{ selectedDraw.mission }} !</h2>
    <div class="draws-preview__draw">
      <img
        :src="generateDrawUrl(selectedDraw.image)"
        :alt="selectedDraw.mission"
      />
      <div class="draws__background"></div>
    </div>
    <Button :text="t('download')" @click="downloadDraw">
      <Icon icon="download" type="button" />
    </Button>
  </div>
</template>
