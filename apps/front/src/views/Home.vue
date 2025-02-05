<script setup>
import "../assets/css/views/_home.scss";
import Footer from "../components/layouts/Footer.vue";
import PlayerPanel from "../components/home/PlayerPanel.vue";
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
    </div>
  </main>
  <Footer />
</template>