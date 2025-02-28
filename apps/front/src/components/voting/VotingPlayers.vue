<script setup>
import '../../assets/css/components/voting/_voting-players.scss';
import Player from '../utils/Player.vue';
import Avatar from '../utils/Avatar.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  players: {
    type: Array,
    required: true,
  },
  saboteurVotes: {
    type: Array,
    required: true,
  },
});

defineEmits(['playerSelected']);
</script>

<template>
  <div class="voting-players">
    <h2 class="voting-players__title">{{ title }}</h2>
    <ul class="voting-players__list">
      <li v-for="player in players">
        <Player
          :player="player"
          :key="player.id"
          :disabled="disabled"
          @click="$emit('playerSelected', $event)"
        />
        <ul
          class="voting-players__votes"
          v-if="
            saboteurVotes.some(
              (saboteurVote) => saboteurVote.player_id === player.id,
            )
          "
        >
          <li
            class="voting-players__vote"
            v-for="(vote, index) in saboteurVotes.find(
              (saboteurVote) => saboteurVote.player_id === player.id,
            ).votes"
            :key="vote.user_id"
            :style="`transform: translate(${index * 12}px, -50%); z-index: ${index};`"
          >
            <Avatar type="vote" :img="vote.user_image" />
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
