<script setup>
import { useI18n } from "vue-i18n";
import { useUserStore } from "../stores/user.js";
import { useSocketStore } from "../stores/socket.js";
import { usePartyStore } from "../stores/party.js";
import router from "../router/index.js";

const env = import.meta.env;
const { t } = useI18n();
const { socket } = useSocketStore();
const userStore = useUserStore();
const user = userStore.user;
const partyStore = usePartyStore();
const partyId = partyStore.partyId;

async function getPartyConfigurations() {
  const response = await fetch(`${env.VITE_URL}/api/parties/party-configurations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": userStore.language,
    },
    body: JSON.stringify({
      party_id: partyId,
      socket_id: socket.id,
      user_id: user.id,
    }),
  });

  if (response.ok) {
  } else {
    await router.push({ path: '/' });
  }
}

getPartyConfigurations();
</script>

<template>
  <h1 class="hidden-title">{{ t('creating_teams') }}</h1>
</template>