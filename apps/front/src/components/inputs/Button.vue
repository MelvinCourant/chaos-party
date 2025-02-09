<script setup>
import '../../assets/css/components/inputs/_button.scss';

defineProps({
  popovertarget: {
    type: String,
    default: ''
  },
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

defineEmits(['click'])
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
        :popovertarget="popovertarget"
        @click="$emit('click')"
      >
        <slot></slot>
        {{ text }}
      </button>
    </div>
  </div>
</template>