<script setup>
import '../../assets/css/components/utils/_team.scss';
import { useI18n } from "vue-i18n";
import { useUserStore } from "../../stores/user.js";
import Player from "./Player.vue";
import Button from "../inputs/Button.vue";
import Icon from "./Icon.vue";
import {inject} from "vue";

defineProps({
  team: {
    type: Object,
    required: true
  },
  step: {
    type: String,
    default: "creating-teams"
  }
})

defineEmits(['joinTeam', 'leaveTeam'])

const { t } = useI18n();
const userStore = useUserStore();
const user = userStore.user;
const maxPlayers = inject("maxPlayers");
</script>

<template>
  <div
    :class="[
      'team',
      `team--${step}`
    ]"
  >
    <h2
      class="team__title"
      v-if="step === 'creating-teams'"
    >
      {{ t("players") }}
      <span class="team__number">{{ team.players.length }}</span>/<slot></slot>
    </h2>
    <ul class="team__players">
      <li
        class="team__player"
        v-for="player in team.players"
        :key="player.id"
      >
        <Player :player="player"/>
      </li>
    </ul>
    <Button
      v-if="
        step === 'creating-teams' &&
        team.players.length < maxPlayers &&
        team.players.find(player => player.id === user.id) === undefined
      "
      :text="t('join')"
      @click="$emit('joinTeam', user.id, team.id)"
    >
      <Icon
        icon="join-red"
        type="button"
      />
    </Button>
    <Button
      v-if="
        step === 'creating-teams' &&
        team.players.find(player => player.id === user.id) !== undefined
      "
      :text="t('leave')"
      type="danger"
      @click="$emit('leaveTeam', user.id, team.id)"
    >
      <Icon
        icon="leave"
        type="button"
      />
    </Button>
  </div>
</template>