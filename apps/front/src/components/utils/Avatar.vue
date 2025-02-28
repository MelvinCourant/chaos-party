<script setup>
import '../../assets/css/components/utils/_avatar.scss';
import Button from '../inputs/Button.vue';

defineProps({
  type: {
    type: String,
    default: 'choice',
  },
  img: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <div :class="['avatar', `avatar--${type}`]">
    <div class="avatar__container">
      <img
        v-if="img"
        :src="`/images/avatars/${img}.svg`"
        :alt="img"
        class="avatar__image"
      />
      <Button v-if="type === 'choice'" type="default" rounded>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
        >
          <circle cx="9" cy="5" r="5" fill="#1A120F" />
          <path
            d="M0.672356 16.6507C1.49871 13.1586 4.96466 11.25 8.55323 11.25H9.44678C13.0353 11.25 16.5013 13.1586 17.3276 16.6507C17.4875 17.3264 17.6146 18.0335 17.6861 18.7521C17.7545 19.439 17.1904 20 16.5 20H1.5C0.809645 20 0.245523 19.439 0.313879 18.7521C0.385379 18.0335 0.512461 17.3264 0.672356 16.6507Z"
            fill="#1A120F"
          />
        </svg>
      </Button>
    </div>
  </div>
</template>
