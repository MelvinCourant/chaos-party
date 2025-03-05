<script setup>
import '../../assets/css/components/voting/_saboteur-reveal.scss';
import Avatar from '../utils/Avatar.vue';

defineProps({
  saboteurReveal: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="saboteur-reveal">
    <h2 class="saboteur-reveal__title">{{ saboteurReveal.title }}</h2>
    <div class="saboteur-reveal__player">
      <div class="saboteur-reveal__identity">
        <Avatar type="saboteur" />
        <p class="saboteur-reveal__pseudo">
          {{ saboteurReveal.player.pseudo }}
        </p>
      </div>
      <div class="saboteur-reveal__points">
        <span v-if="!saboteurReveal.player.saboteur_revealed">+6</span>
        <span v-else>0</span>
      </div>
    </div>
  </div>
</template>
