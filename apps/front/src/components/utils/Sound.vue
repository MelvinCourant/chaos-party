<script setup>
import '../../assets/css/components/utils/_sound.scss';
import { onMounted } from 'vue';

const props = defineProps({
  sound: {
    type: String,
    required: true,
  },
  attributes: {
    type: Object,
    default: () => ({}),
  },
});

function generateSoundUrl(sound) {
  return new URL(`../../assets/audios/musics/${sound}.mp3`, import.meta.url)
    .href;
}

onMounted(() => {
  document.body.addEventListener('click', () => {
    document.querySelector(`#${props.attributes.id}`).play();
  });
});
</script>

<template>
  <audio
    class="sound"
    :src="generateSoundUrl(sound)"
    v-bind="attributes"
  ></audio>
</template>
