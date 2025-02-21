<script setup>
import '../../assets/css/components/drawing/_timer.scss';
import { inject, computed } from 'vue';

const duration = inject('duration');
const elapsed = inject('elapsed');
const durationTimer = duration.value * 60;

const elapsedPercentage = computed(
  () => (elapsed.value / (durationTimer * 1000)) * 100,
);
const remainingTime = computed(() => durationTimer - elapsed.value / 1000);
</script>

<template>
  <div class="timer">
    <span
      class="timer__time"
      :style="`--elapsed: ${elapsedPercentage}%; --countdown-duration: ${remainingTime}s;`"
    ></span>
  </div>
</template>
