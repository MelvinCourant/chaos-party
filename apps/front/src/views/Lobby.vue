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

const { socket } = useSocketStore();
const { t } = useI18n();
const userStore = useUserStore();
const partyStore = usePartyStore();
const user = userStore.user;
const players = ref([
  {
    id: user.id,
    pseudo: user.pseudo,
    role: "host",
    image: "",
  }
]);

function copyLink() {
  navigator.clipboard.writeText(window.location.href.replace("lobby", partyStore.partyId));
}

onMounted(() => {
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
    <div class="lobby__copy-link">
      <Button @click="copyLink">
        <Icon icon="link" type="button" />
        {{ t("copy_link") }}
      </Button>
    </div>
  </main>
</template>