import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  let localStorageUser = null;

  if (localStorage.getItem('user')) {
    localStorageUser = JSON.parse(localStorage.getItem('user') || '{}');
  }

  let id = '';
  let pseudo = '';
  let image = '';
  const user = ref({});

  user.value = {
    id: id,
    pseudo: pseudo,
    image: image,
  };

  if (localStorageUser) {
    id = localStorageUser.id;
    pseudo = localStorageUser.pseudo;
    image = localStorageUser.image;

    user.value = {
      id: id,
      pseudo: pseudo,
      image: image,
    };
  }

  function updateUser(newUser) {
    for (let key in newUser) {
      user.value[key] = newUser[key];
    }

    localStorage.setItem('user', JSON.stringify(user.value));
  }

  const language = ref('en');

  if (localStorage.getItem('locale') === 'fr') {
    language.value = localStorage.getItem('locale');
  }

  function updateLanguage(newLanguage) {
    language.value = newLanguage;
    localStorage.setItem('locale', newLanguage);
    window.location.reload();
  }

  return {
    user,
    updateUser,
    language,
    updateLanguage,
  };
});
