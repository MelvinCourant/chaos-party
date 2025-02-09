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

function modeIsSelectable(mode) {
  if (
    hostId.value === user.id &&
    modeSelected.value.id !== mode.id
  ) {
    emit("selectMode", mode);
  }
}
</script>

<template>
  <div
    :class="[
      'mode',
      { 'mode--selected': modeSelected.id === mode.id }
    ]"
  >
    <button
      class="mode__card"
      @click="modeIsSelectable(mode)"
    >
      <div class="mode__card-container">
        <div class="mode__image-container">
          <img
              :src="getImageUrl(mode, 'svg')"
              :alt="mode.name"
              class="mode__image"
              v-show="modeSelected.id !== mode.id"
          />
          <img
              :src="getImageUrl(mode, 'gif')"
              :alt="mode.name"
              class="mode__image"
              v-show="modeSelected.id === mode.id"
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