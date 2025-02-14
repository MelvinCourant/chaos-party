<script setup>
import '../../assets/css/components/drawing/_timer.scss';
import {inject} from "vue";

const duration = inject("duration");
const durationTimer = duration.value * 60;
</script>

<template>
  <div class="timer">
    <span
      class="timer__time"
      :style="`--duration: ${durationTimer}s`"
    ></span>
  </div>
</template>