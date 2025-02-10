<script setup>
import '../../assets/css/components/lobby/_players.scss';
import {useI18n} from "vue-i18n";
import Player from "../utils/Player.vue";

const { t } = useI18n();

defineProps({
  players: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <div class="players">
    <h2 class="players__title">
      {{ t("players") }}
      <span class="players__number">{{ players.length }}</span>/16
    </h2>
    <ul class="players__list">
      <li
        v-for="player in players"
        :key="player.pseudo"
        class="players__player"
      >
        <Player :player="player"/>
      </li>
      <li
        v-for="index in 16 - players.length"
        :key="index"
        class="players__player"
      >
        <Player/>
      </li>
    </ul>
  </div>
</template>