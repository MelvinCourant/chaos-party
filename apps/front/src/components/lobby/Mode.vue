<script setup>
import '../../assets/css/components/lobby/_mode.scss';
import {inject} from "vue";

defineProps({
  mode: {
    type: Object,
    required: true,
  },
});

defineEmits(["selectMode"]);

const modeSelected = inject("modeSelected");

function getImageUrl(mode, format) {
  return new URL(`../../assets/imgs/modes/${mode.image}.${format}`, import.meta.url).href;
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
      @click="$emit('selectMode', mode.id)"
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