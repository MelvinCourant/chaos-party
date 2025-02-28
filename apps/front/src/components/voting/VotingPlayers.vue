<script setup>
import '../../assets/css/components/voting/_voting-players.scss';
import Player from '../utils/Player.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  type: {
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
  <div class="voting-players">
    <h2 class="voting-players__title">{{ title }}</h2>
    <div class="voting-players__list">
      <Player :player="player" v-for="player in players" :key="player.id" />
    </div>
  </div>
</template>
