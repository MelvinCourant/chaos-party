import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', () => {
  let localStorageSettings = null;

  if (localStorage.getItem('settings')) {
    localStorageSettings = JSON.parse(localStorage.getItem('settings') || '{}');
  }

  let musicVolume = 0;
  let soundVolume = 0;
  const settings = ref({});

  settings.value = {
    musicVolume: musicVolume,
    soundVolume: soundVolume,
  };

  if (localStorageSettings) {
    musicVolume = localStorageSettings.musicVolume;
    soundVolume = localStorageSettings.soundVolume;

    settings.value = {
      musicVolume: musicVolume,
      soundVolume: soundVolume,
    };
  }

  function updateSettings(newSettings) {
    for (let key in newSettings) {
      settings.value[key] = newSettings[key];
    }

    localStorage.setItem('settings', JSON.stringify(settings.value));
  }

  return {
    settings,
    updateSettings,
  };
});
