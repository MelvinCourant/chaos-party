<script setup>
import '../../assets/css/components/utils/_popin.scss';

defineProps({
  title: {
    type: String,
    required: true,
  }
})
</script>

<template>
  <div
    popover
    class="popin"
  >
    <p class="popin__title">{{ title }}</p>
    <slot></slot>
  </div>
</template>