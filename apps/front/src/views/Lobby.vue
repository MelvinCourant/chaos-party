<script setup>
import '../assets/css/views/_lobby.scss';
import Players from "../components/lobby/Players.vue";
import Settings from "../components/inputs/Settings.vue";
import {onMounted, ref} from "vue";
import { useUserStore } from "../stores/user.js";
import { usePartyStore } from "../stores/party.js";
import Button from "../components/inputs/Button.vue";
import { useI18n } from "vue-i18n";
import Icon from "../components/utils/Icon.vue";
import { useSocketStore } from "../stores/socket.js";
import { useRoute, useRouter } from "vue-router";

const env = import.meta.env;
const { socket } = useSocketStore();
const { t } = useI18n();
const userStore = useUserStore();
const partyStore = usePartyStore();
const route = useRoute();
const router = useRouter();
const partyId = route.params.id;
const players = ref([]);
const linkCopied = ref(false);

function copyLink() {
  navigator.clipboard.writeText(window.location.href.replace("/lobby", ""));

  linkCopied.value = true;

  setTimeout(() => {
    linkCopied.value = false;
  }, 2000);
}

async function getParty() {
  const response = await fetch(`${env.VITE_URL}/api/parties/party-details/${partyId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": userStore.language,
    }
  });

  if (response.ok) {
    const party = await response.json();
    partyStore.updatePartyId(party.id);
    players.value = party.players;
  } else {
    await router.push({ path: '/' });
  }
}

onMounted(() => {
  getParty();

  socket.on("join", (player) => {
    players.value.push(player);
  });
});
</script>

<template>
  <main class="lobby">
    <h1 class="hidden-title">Lobby</h1>
    <Players
      :players="players"
    />
    <Settings />
    <div class="copy-link">
      <Button @click="copyLink">
        <Icon icon="link" type="button" />
        {{ t("copy_link") }}
      </Button>
      <p
        class="copy-link__text"
        v-show="linkCopied"
      >
        {{ t("link_copied_clipboard") }}
      </p>
    </div>
  </main>
</template>