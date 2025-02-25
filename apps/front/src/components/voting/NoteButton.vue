<script setup>
import '../../assets/css/components/voting/_note-button.scss';

defineProps({
  note: {
    type: Number,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
});
defineEmits(['click']);
</script>

<template>
  <div :class="['vote-button', { 'vote-button--selected': isSelected }]">
    <button
      class="vote-button__input"
      :data-note="note"
      @click="$emit('click', note)"
    >
      {{ note }}
    </button>
  </div>
</template>
