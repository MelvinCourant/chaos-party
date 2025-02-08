<script setup>
import '../assets/css/views/_lobby.scss';
import Players from "../components/lobby/Players.vue";
import Settings from "../components/inputs/Settings.vue";
import {onMounted, ref, provide} from "vue";
import { useUserStore } from "../stores/user.js";
import Button from "../components/inputs/Button.vue";
import { useI18n } from "vue-i18n";
import Icon from "../components/utils/Icon.vue";
import { useSocketStore } from "../stores/socket.js";
import { useRoute, useRouter } from "vue-router";
import Modes from "../components/lobby/Modes.vue";

const env = import.meta.env;
const { socket } = useSocketStore();
const { t } = useI18n();
const userStore = useUserStore();
const user = userStore.user;
const route = useRoute();
const router = useRouter();
const partyId = route.params.id;
const players = ref([]);
const hostId = ref(null);
const modes = ref([]);
const modeSelected = ref(null);
const linkCopied = ref(false);

provide("modeSelected", modeSelected);
provide("hostId", hostId);

function copyLink() {
  navigator.clipboard.writeText(window.location.href.replace("/lobby", ""));

  linkCopied.value = true;

  setTimeout(() => {
    linkCopied.value = false;
  }, 2000);
}

async function getParty() {
  const response = await fetch(`${env.VITE_URL}/api/parties/party-details`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": userStore.language,
    },
    body: JSON.stringify({
      party_id: partyId,
      socket_id: socket.id,
    }),
  });

  if (response.ok) {
    const party = await response.json();
    players.value = party.players;
    modeSelected.value = party.mode_id;

    const host = party.players.find((player) => player.role === "host");
    hostId.value = host.id;
  } else {
    await router.push({ path: '/' });
  }
}

async function getModes() {
  const response = await fetch(`${env.VITE_URL}/api/modes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": userStore.language,
    },
  });

  if (response.ok) {
    modes.value = await response.json();
  }
}

async function updateMode(modeId) {
  modeSelected.value = modeId;

  await fetch(`${env.VITE_URL}/api/parties/update-mode`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": userStore.language,
    },
    body: JSON.stringify({
      user_id: user.id,
      party_id: partyId,
      mode_id: modeId,
    }),
  });
}

onMounted(() => {
  getParty();
  getModes();

  socket.on("join", (player) => {
    players.value.push(player);
  });

  socket.on("leave", (player) => {
    players.value = players.value.filter((p) => p.id !== player.id);
  });

  socket.on("new-host", (host) => {
    players.value.forEach((player) => {
      if (player.id === host.id) {
        player.role = "host";
      }
    });

    hostId.value = host.id;
  });

  socket.on("update-mode", (modeId) => {
    modeSelected.value = modeId;
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
    <div class="party">
      <Modes
        :modes="modes"
        @selectMode="updateMode($event)"
      />
      <div class="party__actions">
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
      </div>
    </div>
  </main>
</template>