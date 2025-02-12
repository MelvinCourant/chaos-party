<script setup>
import '../assets/css/views/_drawing.scss';
import {useI18n} from "vue-i18n";
import {useSocketStore} from "../stores/socket.js";
import {useUserStore} from "../stores/user.js";
import {onMounted, ref} from "vue";
import router from "../router/index.js";

const env = import.meta.env;
const { t } = useI18n();
const { socket } = useSocketStore();
const userStore = useUserStore();
const user = userStore.user;
const mission = ref("");
const objective = ref("");
const isSaboteur = ref(false);
const players = ref([]);

async function getDrawingDatas() {
  const response = await fetch(`${env.VITE_URL}/api/teams/show-drawing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": userStore.language,
    },
    body: JSON.stringify({
      socket_id: socket.id,
      user_id: user.id,
    }),
  });

  if (response.ok) {
    const json = await response.json();

    mission.value = json.mission;
    players.value = json.players;

    if(json.sabotage) {
      objective.value = json.sabotage;
      isSaboteur.value = true;
    } else {
      objective.value = json.objective;
    }
  } else {
    await router.push({ path: '/' });
  }
}

onMounted(() => {
  getDrawingDatas();
});
</script>

<template>
  <main class="drawing">
    <h1 class="hidden-title">{{ t("drawing") }}</h1>

    <canvas></canvas>
  </main>
</template>