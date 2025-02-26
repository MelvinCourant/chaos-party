<script setup>
import '../../assets/css/components/utils/_timer.scss';
import { inject, computed, watch, ref } from 'vue';

const duration = inject('duration');
const elapsed = inject('elapsed');
const durationTimer = ref(duration.value * 60);

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
</script>

<template>
  <div class="timer">
    <span
      class="timer__time"
      :style="`--elapsed: ${elapsedPercentage}%; --countdown-duration: ${remainingTime}s;`"
    ></span>
  </div>
</template>
