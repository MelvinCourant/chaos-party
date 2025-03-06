<script setup>
import Sound from './utils/Sound.vue';
import { useSettingsStore } from '../stores/settings.js';
import { reactive, watch } from 'vue';
import { useRoute } from 'vue-router';

const settingsStore = useSettingsStore();
const { settings } = settingsStore;
const route = useRoute();
const musicAttributes = reactive({
  muted: true,
  loop: true,
  controls: true,
  volume: settings.musicVolume,
  id: 'music-intro',
});

const musicIntroRoutes = ['/', '/lobby', '/creating-teams'];

watch(settings, (value) => {
  musicAttributes.volume = value.musicVolume;

  if (musicIntroRoutes.includes(route.path)) {
    musicAttributes.muted = value.musicVolume === 0;
  }
});

if (musicIntroRoutes.includes(route.path)) {
  musicAttributes.muted = settings.musicVolume === 0;
}

watch(route, (value) => {
  if (musicIntroRoutes.includes(value.path) && settings.musicVolume > 0) {
    musicAttributes.muted = false;
  } else {
    musicAttributes.muted = true;
  }
});
</script>

<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
  <Sound sound="easy_cheesy" :attributes="musicAttributes" />
</template>
