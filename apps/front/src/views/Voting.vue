<script setup>
import '../assets/css/views/_voting.scss';
import Settings from '../components/inputs/Settings.vue';
import { useI18n } from 'vue-i18n';
import TeamDraw from '../components/voting/TeamDraw.vue';
import { useUserStore } from '../stores/user.js';
import { usePartyStore } from '../stores/party.js';
import { onMounted, ref, useTemplateRef } from 'vue';

const { t } = useI18n();
const userStore = useUserStore();
const user = userStore.user;
const partyStore = usePartyStore();
const hostId = ref(partyStore.hostId);
const votingElement = useTemplateRef('voting');
const step = ref(1);

onMounted(() => {
  if (user.id === hostId.value) {
    votingElement.value.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
      step.value++;
    });
  }
});
</script>

<template>
  <main ref="voting" class="voting">
    <h1 class="hidden-title">{{ t('voting') }}</h1>
    <TeamDraw :step="step" mission="Une voiture futuriste" number-team="1" />
    <Settings />
  </main>
</template>
