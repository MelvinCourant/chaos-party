<script setup>
import "../../assets/css/components/inputs/_range.scss";
import { ref, watch } from "vue";

const props = defineProps({
  attributes: {
    type: Object,
    default: {
      min: 0,
      max: 100,
      step: 1,
      value: 50,
    },
  },
});

const linearGradient = ref(
  `linear-gradient(to right, var(--blue) ${props.attributes.value - props.attributes.min}%, var(--blue-transparent-30) ${props.attributes.value}%)`,
);

watch(
  () => props.attributes.value,
  (value) => {
    linearGradient.value = `linear-gradient(to right, var(--blue) ${value - props.attributes.min}%, var(--blue-transparent-30) ${value}%)`;
  },
);

defineEmits(["input"]);
</script>

<template>
  <input
    type="range"
    class="range"
    v-bind="attributes"
    :style="`background: ${linearGradient};`"
    @input="$emit('input', $event.target.value)"
  />
</template>
