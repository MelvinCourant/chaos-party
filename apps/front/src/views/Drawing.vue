<script setup>
import '../assets/css/views/_drawing.scss';
import {useI18n} from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <main class="drawing">
    <h1 class="hidden-title">{{ t("drawing") }}</h1>

    <canvas></canvas>
  </main>
</template>