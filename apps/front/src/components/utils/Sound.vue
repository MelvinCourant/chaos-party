<script setup>
import '../../assets/css/components/utils/_sound.scss';
import { watch } from 'vue';

const props = defineProps({
  sound: {
    type: String,
    required: true,
  },
  attributes: {
    type: Object,
    default: () => ({}),
  },
  play: {
    type: Boolean,
    default: false,
  },
});

function generateSoundUrl(sound) {
  return new URL(`../../assets/audios/${sound}.mp3`, import.meta.url).href;
}

watch(
  () => props.play,
  (value) => {
    if (value) {
      document.querySelector(`#${props.attributes.id}`).play();
    }
  },
);
</script>

<template>
  <audio
    class="sound"
    :src="generateSoundUrl(sound)"
    v-bind="attributes"
  ></audio>
</template>
