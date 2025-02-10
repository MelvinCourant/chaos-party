<script setup>
import '../../assets/css/components/creating_teams/_configurations.scss';
import Popin from "../utils/Popin.vue";
import Icon from "../utils/Icon.vue";
import Select from "../inputs/Select.vue";
import Button from "../inputs/Button.vue";
import { useI18n } from "vue-i18n";
import { useUserStore } from "../../stores/user.js";
import { usePartyStore } from "../../stores/party.js";

defineProps({
  numberTeamsSelect: {
    type: Array,
    required: true,
  },
  configurations: {
    type: Array,
    required: true,
  },
});

defineEmits(["randomTeams", "change"]);

const { t } = useI18n();
const userStore = useUserStore();
const user = userStore.user;
const partyStore = usePartyStore();
const hostId = partyStore.hostId;
</script>

<template>
  <div class="configurations">
    <Select
      :options="numberTeamsSelect"
    >
      <svg
          style="min-width: 31px;"
          xmlns="http://www.w3.org/2000/svg" width="31" height="26" viewBox="0 0 31 26" fill="none">
        <circle cx="15.2937" cy="6.93333" r="6.93333" fill="#FDF1ED"/>
        <circle cx="23.9604" cy="6.9334" r="5.2" fill="#FDF1ED"/>
        <circle cx="6.627" cy="6.9334" r="5.2" fill="#FDF1ED"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M24.9457 22.5334H28.9785C30.0039 22.5334 30.7902 21.6496 30.5411 20.6549C29.9029 18.1061 28.2035 13.8667 23.9605 13.8667C22.4246 13.8667 21.222 14.4222 20.2823 15.2519C22.8958 16.9474 24.2471 19.9164 24.9457 22.5334Z" fill="#FDF1ED"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.3054 15.2519C9.36575 14.4222 8.16316 13.8667 6.62729 13.8667C2.38423 13.8667 0.684835 18.1061 0.0465655 20.6548C-0.20255 21.6496 0.583767 22.5334 1.60925 22.5334H5.64196C6.34064 19.9164 7.69193 16.9474 10.3054 15.2519Z" fill="#FDF1ED"/>
        <path d="M15.2937 15.6001C21.7221 15.6001 23.3823 21.3218 23.8111 24.2773C23.9486 25.2247 23.1844 26.0001 22.2271 26.0001H8.36041C7.40312 26.0001 6.63893 25.2247 6.77638 24.2773C7.20517 21.3218 8.86541 15.6001 15.2937 15.6001Z" fill="#FDF1ED"/>
      </svg>
    </Select>
    <Button
      :popovertarget="'configuration'"
    >
      <Icon
        icon="configuration"
        type="button"
      />
      Configuration
    </Button>
    <Button
      @click="$emit('randomTeams')"
      v-if="hostId === user.id"
    >
      <Icon
        icon="random"
        type="button"
      />
      {{ t("random_teams") }}
    </Button>
    <Popin
      id="configuration"
      :title="t('game_configuration')"
    >
      <ul class="popin__list">
        <li
          class="popin__select"
          v-for="configuration in configurations"
        >
          <div class="popin__label">
            <p class="popin__select-title">{{ configuration.title }}</p>
            <p class="popin__select-description">{{ configuration.description }}</p>
          </div>
          <Select
            :options="configuration.options"
            color="black"
            :attributes="configuration.attributes"
            @change="(value) => $emit('change', configuration.attributes.id, value)"
          >
            <svg
              v-if="configuration.icon === 'time'"
              style="min-width: 31px;"
              xmlns="http://www.w3.org/2000/svg" width="31" height="28" viewBox="0 0 31 28" fill="none"
            >
              <path d="M6.53428 2.20845C5.497 2.48639 4.55116 3.03248 3.79182 3.79182C3.03248 4.55116 2.48639 5.497 2.20845 6.53428" stroke="#1A120F" stroke-width="3.05882" stroke-linecap="round"/>
              <path d="M24.9951 2.20845C26.0324 2.48639 26.9782 3.03248 27.7375 3.79182C28.4969 4.55116 29.043 5.497 29.3209 6.53428" stroke="#1A120F" stroke-width="3.05882" stroke-linecap="round"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M15.7647 27.9999C22.522 27.9999 27.9999 22.522 27.9999 15.7646C27.9999 9.00722 22.522 3.5293 15.7647 3.5293C9.00729 3.5293 3.52936 9.00722 3.52936 15.7646C3.52936 22.522 9.00729 27.9999 15.7647 27.9999ZM17.2941 9.64694C17.2941 8.80227 16.6094 8.11753 15.7647 8.11753C14.92 8.11753 14.2353 8.80227 14.2353 9.64694V15.3822C14.2353 16.4381 15.0912 17.294 16.1471 17.294H20.3529C21.1976 17.294 21.8824 16.6093 21.8824 15.7646C21.8824 14.9199 21.1976 14.2352 20.3529 14.2352H17.2941V9.64694Z" fill="#1A120F"/>
            </svg>
            <svg
              v-if="configuration.icon === 'defilement'"
              style="min-width: 20px;"
              xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 20 28" fill="none"
            >
              <path d="M12.6363 17.5454L7.90906 22.2727L12.6363 27" stroke="#1A120F" stroke-width="2.36364"/>
              <path d="M17.4371 9.86341C18.1632 11.121 18.5454 12.5476 18.5454 13.9998C18.5454 15.4519 18.1632 16.8785 17.4371 18.1361C16.711 19.3938 15.6667 20.4381 14.409 21.1642C13.1514 21.8903 11.7248 22.2725 10.2727 22.2725" stroke="#1A120F" stroke-width="2.36364" stroke-linecap="round"/>
              <path d="M7.90908 10.4546L12.6364 5.72732L7.90908 1.00004" stroke="#1A120F" stroke-width="2.36364"/>
              <path d="M3.10834 18.1366C2.38225 16.879 2 15.4524 2 14.0002C2 12.5481 2.38225 11.1215 3.10834 9.86386C3.83442 8.60624 4.87875 7.56191 6.13636 6.83583C7.39398 6.10975 8.82056 5.7275 10.2727 5.7275" stroke="#1A120F" stroke-width="2.36364" stroke-linecap="round"/>
            </svg>
          </Select>
        </li>
      </ul>
    </Popin>
  </div>
</template>