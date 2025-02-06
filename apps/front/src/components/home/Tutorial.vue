<script setup>
import '../../assets/css/components/home/_tutorial.scss';
import {useI18n} from "vue-i18n";
import Slider from "../utils/Slider.vue";

const {t} = useI18n();
const tutorialSlides = [
  {
    title: t('tutorial_1.title'),
    description: t('tutorial_1.description'),
  },
  {
    title: t('tutorial_2.title'),
    description: t('tutorial_2.description'),
  },
  {
    title: t('tutorial_3.title'),
    description: t('tutorial_3.description'),
  },
  {
    title: t('tutorial_4.title'),
    description: t('tutorial_4.description'),
  },
  {
    title: t('tutorial_5.title'),
    description: t('tutorial_5.description'),
  }
];
</script>

<template>
  <div class="tutorial">
    <h2 class="tutorial__title">{{ t("how_to_play") }}</h2>
    <Slider
      :slides="tutorialSlides"
    />
  </div>
</template>