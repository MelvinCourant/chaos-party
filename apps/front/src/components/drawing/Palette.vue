<script setup>
import '../../assets/css/components/drawing/_palette.scss';

defineProps({
  colors: {
    type: Array,
    required: true
  },
  customColor: {
    type: Object,
  }
})

defineEmits(['selectColor']);
</script>

<template>
  <div class="palette">
    <button
      v-for="(color, index) in colors"
      :key="index"
      :class="[
        'palette__color',
        { 'palette__color--selected': color.selected },
        { 'white': color.name === 'text' }
      ]"
      @click="$emit('selectColor', color)"
    >
      <span
        class="color"
        :style="`background-color: var(--${color.name})`"
      ></span>
    </button>
    <label
      :class="[
        'palette__color-custom',
        { 'palette__color-custom--selected': customColor.selected }
      ]"
    >
      <span
        class="color"
        :style="{ backgroundColor: customColor.value }"
      ></span>
      <input
        type="color"
        v-model="customColor.value"
        @click="$emit('selectColor', customColor)"
      />
    </label>
  </div>
</template>