<script setup>
import '../../assets/css/components/utils/_timer.scss';
import { inject, computed, watch, ref, reactive } from 'vue';
import { useSettingsStore } from '../../stores/settings.js';
import Sound from '../utils/Sound.vue';

const settingsStore = useSettingsStore();
const { settings } = settingsStore;
const duration = inject('duration');
const elapsed = inject('elapsed');
const play = inject('play');
const durationTimer = ref(duration.value * 60);
const soundAttributes = reactive({
  controls: true,
  volume: settings.soundVolume,
  id: 'timer',
});

const elapsedPercentage = computed(
  () => (elapsed.value / (durationTimer.value * 1000)) * 100,
);
const remainingTime = computed(
  () => durationTimer.value - elapsed.value / 1000,
);

watch(
  duration,
  () => {
    durationTimer.value = duration.value * 60;
  },
  { immediate: true },
);

watch(settings, (value) => {
  soundAttributes.volume = value.soundVolume;
});
</script>

<template>
  <div class="timer">
    <span
      class="timer__time"
      :style="`--elapsed: ${elapsedPercentage}%; --countdown-duration: ${remainingTime}s;`"
    ></span>
  </div>
  <Sound sound="timer" :attributes="soundAttributes" :play="play" />
</template>
