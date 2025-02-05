<script setup>
import '../../assets/css/components/inputs/_select.scss';
import {ref} from "vue";

defineProps({
  attributes: {
    type: Object,
    default: () => ({}),
  },
  color: {
    type: String,
    default: 'white',
  },
  options: {
    type: Array,
    required: true,
  }
});

const emit = defineEmits(["change"]);

const isOpened = ref(false);

document.addEventListener("click", (event) => {
  if (
    !event.target.closest("select") &&
      isOpened.value
  ) {
    isOpened.value = false;
  }
});
</script>

<template>
  <label
    :class="[
      'select',
      `select--${color}`,
      { 'select--disabled': attributes.disabled },
      { 'select--opened': isOpened },
    ]"
    :for="attributes.id"
  >
    <slot class="select__icon"></slot>
    <span class="select__label">
      {{ options.find(option => option.selected).label }}
    </span>
    <select
        :value="options.find(option => option.selected).value"
        color="white"
        :disabled="disabled"
        :id="attributes.id"
        @change="emit('change', $event.target.value)"
        @click="isOpened = !isOpened"
    >
      <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :selected="option.selected"
      >
        {{ option.label }}
      </option>
    </select>
    <svg
        class="select__arrow"
        xmlns="http://www.w3.org/2000/svg" width="14" height="10" viewBox="0 0 14 10" fill="none">
      <path d="M6.61691 9.43126L0.673725 2.29944C-0.0210239 1.46574 0.571816 0.200003 1.65705 0.200003L12.1913 0.200003C13.2766 0.200003 13.8694 1.46574 13.1747 2.29944L7.23148 9.43126C7.07156 9.62316 6.77682 9.62316 6.61691 9.43126Z" fill="#FDF1ED"/>
    </svg>
  </label>
</template>