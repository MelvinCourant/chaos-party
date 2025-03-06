<script setup>
import Sound from './utils/Sound.vue';
import { useSettingsStore } from '../stores/settings.js';
import { reactive, watch } from 'vue';

const settingsStore = useSettingsStore();
const { settings } = settingsStore;
const musicAttributes = reactive({
  muted: true,
  loop: true,
  controls: true,
  volume: settings.musicVolume,
  id: 'music-intro',
});

watch(settings, (value) => {
  musicAttributes.volume = value.musicVolume;
  musicAttributes.muted = value.musicVolume === 0;
});

musicAttributes.muted = settings.musicVolume === 0;
</script>

<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
  <Sound sound="easy_cheesy" :attributes="musicAttributes" />
</template>
