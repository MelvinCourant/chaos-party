<script setup>
import '../../assets/css/components/utils/_icon.scss';

defineProps({
  icon: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'default'
  }
});

function generateIconUrl(icon) {
  return new URL(`../../assets/imgs/icons/${icon}.svg`, import.meta.url).href;
}
</script>

<template>
  <img
    :class="[
      'icon',
      `icon--${type}`
    ]"
    :src="generateIconUrl(icon)"
    :alt="icon"
  />
</template>