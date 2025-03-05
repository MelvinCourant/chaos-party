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
  disabled: {
    type: Boolean,
    default: false,
  },
});
defineEmits(['click']);
</script>

<template>
  <div
    :class="[
      'vote-button',
      { 'vote-button--selected': isSelected },
      { 'vote-button--disabled': disabled },
    ]"
  >
    <button
      class="vote-button__input"
      :data-note="note"
      :disabled="disabled"
      @click="
        () => {
          if (!isSelected) {
            $emit('click', note);
          }
        }
      "
    >
      {{ note }}
    </button>
  </div>
</template>
