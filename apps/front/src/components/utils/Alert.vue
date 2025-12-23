<script setup>
import '../../assets/css/components/utils/_alert.scss';

defineProps({
  display: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'info',
  },
  text: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <div :class="`alert alert--${type}`" v-if="display">{{ text }}</div>
</template>
