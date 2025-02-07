<script setup>
import '../assets/css/views/_lobby.scss';
import Players from "../components/lobby/Players.vue";
import Settings from "../components/inputs/Settings.vue";
import {ref} from "vue";
import { useUserStore } from "../stores/user.js";

const userStore = useUserStore();
const user = userStore.user;

const players = ref([
  {
    id: user.id,
    pseudo: user.pseudo,
    role: "host",
    image: "",
  },
  {
    id: "",
    pseudo: "Antoine",
    role: "player",
    image: "",
  }
]);
</script>

<template>
  <main class="lobby">
    <h1 class="hidden-title">Lobby</h1>
    <Players
      :players="players"
    />
    <Settings />
  </main>
</template>