<script setup>
import '../../assets/css/components/inputs/_button.scss';

defineProps({
  type: {
    type: String,
    default: 'default'
  },
  rounded: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div
    :class="[
      'button',
      `button--${type}`,
      { 'button--rounded': rounded }
    ]"
  >
    <div class="button__container">
      <button
        class="button__input"
      >
        <slot></slot>
        {{ text }}
      </button>
    </div>
  </div>
</template>