<script setup>
import '../../assets/css/components/utils/_slider.scss';
import {ref} from "vue";

const props = defineProps({
  slides: {
    type: Array,
    required: true
  }
});

const activeSlide = ref(0);
const sliderInterval = ref(null);

function autoSlider() {
  clearInterval(sliderInterval.value);
  sliderInterval.value = setInterval(() => {
    if(activeSlide.value === props.slides.length - 1) {
      activeSlide.value = 0;
    } else {
      activeSlide.value++;
    }
  }, 5000);
}

function resetSlider(index) {
  activeSlide.value = index;
  autoSlider();
}

autoSlider();
</script>

<template>
  <div class="slider">
    <ul class="slides">
      <li
        v-for="(slide, index) in slides"
        :key="index"
        :data-slide="index"
        :class="[
          'slide',
          {'slide--active': index === activeSlide}
        ]"
      >
        <div class="slide__image"></div>
        <h3 class="slide__title">{{ index + 1 }}. {{ slide.title }}</h3>
        <p class="slide__description">{{ slide.description }}</p>
      </li>
    </ul>
    <ul class="dots">
      <li
        v-for="(slide, index) in slides"
        :key="index"
        :data-slide="index"
        :class="[
          'dot',
          {'dot--active': index === activeSlide}
        ]"
      >
        <button
          class="dot__button"
          @click="resetSlider(index)"
        ></button>
      </li>
    </ul>
  </div>
</template>