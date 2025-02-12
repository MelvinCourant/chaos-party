<script setup>
import '../../assets/css/components/drawing/_cursor.scss';

defineProps({
  player: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div
    class="cursor"
    :style="`top: ${player.y}px; left: ${player.x}px`"
    v-if="player.x && player.y"
  >
    <svg
      class="cursor__arrow"
      xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M14.9745 4.01246L-4.13656e-05 4.13656e-05L3.79472 14.1623C5.40686 9.0596 9.67362 5.13617 14.9745 4.01246Z"
            :fill="`var(--${player.color})`"
      />
    </svg>
    <div
      class="cursor__pseudo"
      :style="`background-color: var(--${player.color})`"
    >
      {{ player.pseudo }}
    </div>
  </div>
</template>