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
    <ul class="tools__list">
      <li
        v-for="(tool, index) in tools"
        :key="index"
        class="tools__item"
      >
        <Tool
          :tool="tool"
          @selectTool="$emit('selectTool', $event)"
        />
      </li>
    </ul>
  </div>
</template>