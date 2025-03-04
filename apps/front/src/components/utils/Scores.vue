<script setup>
import Player from '../utils/Player.vue';
import Avatar from './Avatar.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  players: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="scores">
    <h2 class="scores__title">{{ title }}</h2>
    <ul class="scores__list">
      <li v-for="player in players">
        <Player :player="player" :key="player.id" />
        <span class="scores__points">+{{ player.score }}</span>
      </li>
    </ul>
  </div>
</template>
