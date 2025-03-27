<script setup>
import { useSocketStore } from '../stores/socket.js';
import { useUserStore } from '../stores/user.js';
import { onMounted, ref } from 'vue';
import { usePartyStore } from '../stores/party.js';
import { useRouter } from 'vue-router';

const env = import.meta.env;
const { socket } = useSocketStore();
const userStore = useUserStore();
const user = userStore.user;
const partyStore = usePartyStore();
const partyId = partyStore.partyId;
const router = useRouter();
const draws = ref([]);
const players = ref([]);

async function getFinalScores() {
  const response = await fetch(`${env.VITE_URL}/api/parties/end-party`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': userStore.language,
    },
    body: JSON.stringify({
      socket_id: socket.id,
      user_id: user.id,
      party_id: partyId,
    }),
  });

  if (response.ok) {
    const json = await response.json();

    draws.value = json.draws;
    players.value = json.players;
  } else {
    await router.push({ path: '/' });
  }
}

onMounted(() => {
  getFinalScores();
});
</script>

<template>
  {{ draws }}
  {{ players }}
</template>
