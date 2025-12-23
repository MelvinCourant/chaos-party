<script setup>
import '../../assets/css/components/utils/_dots-menu.scss';
import { inject, ref } from 'vue';

defineEmits(['actionClicked']);

const actions = inject('dotsMenuActions');
const menuOpened = ref(false);
</script>

<template>
  <div class="dots-menu">
    <button class="dots-menu__button" @click="menuOpened = !menuOpened">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="17"
        height="5"
        viewBox="0 0 17 5"
        fill="none"
      >
        <circle
          cx="8.33317"
          cy="2.08335"
          r="1.04167"
          stroke="#EB5E28"
          stroke-width="2.08333"
          stroke-linecap="round"
        />
        <circle
          cx="2.08317"
          cy="2.08335"
          r="1.04167"
          stroke="#EB5E28"
          stroke-width="2.08333"
          stroke-linecap="round"
        />
        <circle
          cx="14.5832"
          cy="2.08335"
          r="1.04167"
          stroke="#EB5E28"
          stroke-width="2.08333"
          stroke-linecap="round"
        />
      </svg>
    </button>
    <div
      class="dots-menu__actions-container"
      v-show="menuOpened"
      @click="menuOpened = !menuOpened"
    >
      <ul class="dots-menu__actions">
        <li v-for="action in actions" :key="action.id">
          <button
            :class="`dots-menu__action dots-menu__action--${action.type}`"
            @click="$emit('actionClicked', action.name)"
          >
            {{ action.text }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
