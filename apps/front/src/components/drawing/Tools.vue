<script setup>
import '../../assets/css/components/drawing/_tools.scss';
import Tool from "./Tool.vue";

defineEmits(['selectTool']);

defineProps({
  tools: {
    type: Array,
    required: true,
  }
});
</script>

<template>
  <div class="tools">
    <Tool
      v-for="(tool, index) in tools"
      :key="index"
      :tool="tool"
      @selectTool="$emit('selectTool', $event)"
    />
  </div>
</template>