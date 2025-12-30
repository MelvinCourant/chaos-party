<script setup>
import '../../assets/css/components/home/_tutorial.scss';
import { useI18n } from 'vue-i18n';
import Slider from '../utils/Slider.vue';

const { t } = useI18n();
const tutorialSlides = [
  {
    title: t('tutorial_1.title'),
    description: t('tutorial_1.description'),
    image: '1',
  },
  {
    title: t('tutorial_2.title'),
    description: t('tutorial_2.description'),
    image: '2',
  },
  {
    title: t('tutorial_3.title'),
    description: t('tutorial_3.description'),
    image: '3',
  },
  {
    title: t('tutorial_4.title'),
    description: t('tutorial_4.description'),
    image: '4',
  },
  {
    title: t('tutorial_5.title'),
    description: t('tutorial_5.description'),
    image: '5',
  },
];
</script>

<template>
  <div class="tutorial">
    <h2 class="tutorial__title">{{ t('how_to_play') }}</h2>
    <Slider :slides="tutorialSlides" />
  </div>
</template>
