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

defineEmits(["updateValue"]);
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
      v-model="attributes.value"
      @input="$emit('updateValue', $event.target.value)"
    />
  </div>
</template>