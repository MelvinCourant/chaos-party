<script setup>
import '../../assets/css/components/inputs/_field.scss';

defineProps({
  label: {
    type: String,
    default: ""
  },
  attributes: {
    type: Object,
    required: true
  },
});
</script>

<template>
  <div class="field">
    <label
      :for="attributes.id"
      class="field__label"
    >
      {{ label }}
    </label>
    <input
      v-bind="attributes"
      class="field__input"
    />
  </div>
</template>