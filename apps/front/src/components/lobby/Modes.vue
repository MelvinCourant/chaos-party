<script setup>
import '../../assets/css/components/lobby/_modes.scss';
import Mode from "./Mode.vue";
import { useI18n } from "vue-i18n";

defineProps({
  modes: {
    type: Array,
    required: true,
  }
});

defineEmits(["selectMode"]);

const { t } = useI18n();
</script>

<template>
  <div class="modes">
    <h2 class="modes__title">{{ t("game_modes") }}</h2>
    <ul class="modes__list">
      <li
        class="modes__item"
        v-for="mode in modes"
        :key="mode.id"
      >
        <Mode
          :mode="mode"
          @selectMode="($event) => $emit('selectMode', $event)"
        />
      </li>
    </ul>
  </div>
</template>