<script setup>
import { useI18n } from "vue-i18n";
import Icon from "./Icon.vue";
import Button from "../inputs/Button.vue";
import {ref} from "vue";
import {usePartyStore} from "../../stores/party.js";

const { t } = useI18n();
const linkCopied = ref(false);
const partyStore = usePartyStore();
const partyId = partyStore.partyId;

function copyLink() {
  navigator.clipboard.writeText(window.location.href.replace("/lobby", `/${partyId}`));

  linkCopied.value = true;

  setTimeout(() => {
    linkCopied.value = false;
  }, 2000);
}
</script>

<template>
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
</template>