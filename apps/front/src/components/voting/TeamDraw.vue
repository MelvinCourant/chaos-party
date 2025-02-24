<script setup>
import '../../assets/css/components/voting/_team-draw.scss';
import { useI18n } from 'vue-i18n';

defineProps({
  step: {
    type: Number,
    default: 1,
  },
  numberTeam: {
    type: Number,
    required: true,
  },
  mission: {
    type: String,
    required: true,
  },
  imgSrc: {
    type: String,
    required: false,
    default: '',
  },
});

const { t } = useI18n();
</script>

<template>
  <div :class="['team-draw', `team-draw--step-${step}`]">
    <h2 class="team-draw__title">
      {{ t('team_number_drew', { number: numberTeam }) }} <br />
      <span class="team-draw__mission"
        >{{ mission }} {{ t('exclamation_mark') }}</span
      >
    </h2>
    <div class="team-draw__illustration">
      <img
        v-if="imgSrc"
        :src="imgSrc"
        class="team-draw__img"
        :alt="`${t('team_number_drew', { number: numberTeam })}' illustration`"
      />
      <div class="team-draw__background"></div>
    </div>
  </div>
</template>
