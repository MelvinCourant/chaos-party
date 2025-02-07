<script setup>
import "../assets/css/views/_home.scss";
import Footer from "../components/layouts/Footer.vue";
import PlayerPanel from "../components/home/PlayerPanel.vue";
import Tutorial from "../components/home/Tutorial.vue";
import {useRoute, useRouter} from "vue-router";
import {ref} from "vue";
import { useUserStore } from "../stores/user.js";
import { usePartyStore } from "../stores/party.js";

const env = import.meta.env;
const route = useRoute();
const params = route.params;
const id = params.id;
const router = useRouter();
const userStore = useUserStore();
const partyStore = usePartyStore();
const formValues = ref({});

function saveValues(values) {
  formValues.value = values;

  if(id) {
    formValues.value.partyId = id;
    joinParty(formValues.value);
  } else {
    createParty(formValues.value);
  }
}

async function createParty() {
  const response = await fetch(`${env.VITE_URL}/api/parties/create-party`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": userStore.language,
    },
    body: JSON.stringify(formValues.value),
  });

  if (response.ok) {
    const party = await response.json();

    userStore.updateUser(party.user);
    partyStore.updatePartyId(party.id);
    await router.push({ path: `/lobby/${party.id}` });
  }
}

async function joinParty() {
  const response = await fetch(`${env.VITE_URL}/api/parties/join-party`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": userStore.language,
    },
    body: JSON.stringify(formValues.value),
  });

  if (response.ok) {
    const party = await response.json();

    userStore.updateUser(party.user);
    partyStore.updatePartyId(party.id);
    await router.push({ path: `/lobby/${party.id}` });
  }
}
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
      <PlayerPanel
        @submitPlayer="saveValues"
      />
      <Tutorial />
    </div>
    <Footer />
  </main>
</template>