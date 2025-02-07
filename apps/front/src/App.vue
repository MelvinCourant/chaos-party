<script setup>
import './assets/css/main.scss';
import Main from './components/Main.vue';
import { onMounted } from "vue";
import { useSocketStore } from "./stores/socket.js";

const socketStore = useSocketStore();

onMounted(() => {
  socketStore.connect();
});
</script>

<template>
  <Main/>
</template>