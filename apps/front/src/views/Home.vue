<script setup>
import "../assets/css/views/_home.scss";
import Footer from "../components/layouts/Footer.vue";
import PlayerPanel from "../components/home/PlayerPanel.vue";
import Tutorial from "../components/home/Tutorial.vue";
import { io } from "socket.io-client";
const env = import.meta.env;

io(env.VITE_URL);
</script>

<template>
  <main class="home">
    <h1 class="hidden-title">Chaos Party</h1>
    <img
        src="../assets/imgs/logo.png"
        alt="Chaos Party"
        class="home__logo"
    />
    <div class="home__onboarding">
      <PlayerPanel />
      <Tutorial />
    </div>
  </main>
  <Footer />
</template>