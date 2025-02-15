<script setup>
import "../../assets/css/components/drawing/_thicknesses.scss";

defineProps({
  thicknesses: {
    type: Array,
    required: true,
  },
});

defineEmits(["selectThickness"]);
</script>

<template>
  <div class="thicknesses">
    <button
      v-for="(thickness, index) in thicknesses"
      :key="index"
      :class="[
        'thicknesses__thickness',
        { 'thicknesses__thickness--selected': thickness.selected }
      ]"
      @click="$emit('selectThickness', thickness.value)"
    >
      <span
        class="thickness"
        :style="{ width: `${thickness.value}px`, height: `${thickness.value}px` }"
      ></span>
    </button>
  </div>
</template>