<script setup>
import '../../assets/css/components/drawing/_tool.scss';

defineProps({
  tool: {
    type: Object,
    required: true,
  }
});

defineEmits(['selectTool']);

function generateIconUrl(icon) {
  return new URL(`../../assets/imgs/icons/tools/${icon}.svg`, import.meta.url).href;
}
</script>

<template>
  <button
    :class="[
      'tool',
      {'tool--selected': tool.selected}
    ]"
    @click="$emit('selectTool', tool.name)"
  >
    <span class="tool__inner">
      <img :src="generateIconUrl(tool.icon)" :alt="tool.name"/>
    </span>
  </button>
</template>