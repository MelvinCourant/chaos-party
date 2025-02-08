<script setup>
import '../../assets/css/components/lobby/_mode.scss';
import {inject} from "vue";
import {useUserStore} from "../../stores/user.js";

defineProps({
  mode: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["selectMode"]);

const modeSelected = inject("modeSelected");
const hostId = inject("hostId");
const userStore = useUserStore();
const user = userStore.user;

function getImageUrl(mode, format) {
  return new URL(`../../assets/imgs/modes/${mode.image}.${format}`, import.meta.url).href;
}

function modeIsSelectable(modeId) {
  if (hostId.value === user.id && modeSelected.value !== modeId) {
    emit("selectMode", modeId);
  }
}
</script>

<template>
  <div
    :class="[
      'mode',
      { 'mode--selected': modeSelected === mode.id }
    ]"
  >
    <button
      class="mode__card"
      @click="modeIsSelectable(mode.id)"
    >
      <div class="mode__card-container">
        <div class="mode__image-container">
          <img
              :src="getImageUrl(mode, 'svg')"
              :alt="mode.name"
              class="mode__image"
              v-show="modeSelected !== mode.id"
          />
          <img
              :src="getImageUrl(mode, 'gif')"
              :alt="mode.name"
              class="mode__image"
              v-show="modeSelected === mode.id"
          />
        </div>
        <div class="mode__content">
          <h3 class="mode__title">{{ mode.name }}</h3>
          <p class="mode__description">{{ mode.description }}</p>
        </div>
      </div>
    </button>
  </div>
</template>