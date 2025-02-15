<script setup>
import "../../assets/css/components/drawing/_opacity.scss";
import Range from "../inputs/Range.vue";

defineProps({
  attributes: {
    type: Object,
    required: true,
  },
});

defineEmits(["selectOpacity"]);
</script>

<template>
  <div class="opacity">
    <div class="opacity__min"></div>
    <Range :attributes="attributes" @input="$emit('selectOpacity', $event)" />
    <div class="opacity__max"></div>
  </div>
</template>
