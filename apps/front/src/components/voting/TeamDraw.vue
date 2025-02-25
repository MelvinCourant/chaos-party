<script setup>
import '../../assets/css/components/voting/_team-draw.scss';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const props = defineProps({
  step: {
    type: Number,
    default: 2,
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
const env = import.meta.env;
const generateSrc = computed(() => {
  return `${env.VITE_URL}/uploads/${props.imgSrc}`;
});
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
        :src="generateSrc"
        class="team-draw__img"
        :alt="`Illustration ${numberTeam}`"
      />
      <div class="team-draw__background"></div>
    </div>
  </div>
</template>
