<script setup>
import "../assets/css/views/_home.scss";
import Footer from "../components/layouts/Footer.vue";
import PlayerPanel from "../components/home/PlayerPanel.vue";
import Tutorial from "../components/home/Tutorial.vue";
import {useRoute, useRouter} from "vue-router";
import {ref} from "vue";
import { useUserStore } from "../stores/user.js";
import { usePartyStore } from "../stores/party.js";
import { useSocketStore } from "../stores/socket.js";

const env = import.meta.env;
const route = useRoute();
const params = route.params;
const id = params.id;
const router = useRouter();
const userStore = useUserStore();
const user = userStore.user;
const partyStore = usePartyStore();
const { socket } = useSocketStore();
const formValues = ref({});

partyStore.updateHostId("");

if(!id) {
  partyStore.updatePartyId("");
}

function saveValues(values) {
  formValues.value = values;
  formValues.value.user_id = user.id;
  formValues.value.socket_id = socket.id;

  if(id) {
    formValues.value.party_id = id;
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
    await router.push({ path: '/lobby' });
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
    await router.push({ path: `/${party.step}` });
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