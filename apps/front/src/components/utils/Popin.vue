<script setup>
import '../../assets/css/components/utils/_popin.scss';
import Button from '../inputs/Button.vue';
import Icon from './Icon.vue';

defineProps({
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  actions: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['actionClick']);
</script>

<template>
  <div popover :class="['popin', { 'popin--error': type === 'error' }]">
    <p class="popin__title">{{ title }}</p>
    <slot></slot>

    <div class="popin__actions" v-if="actions">
      <Button
        v-for="(action, index) in actions"
        :key="index"
        :type="action.type"
        :text="action.text"
        @click="() => $emit('actionClick', action)"
      >
        <Icon icon="back" type="button" />
      </Button>
    </div>
  </div>
</template>
