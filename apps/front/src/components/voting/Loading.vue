<script setup>
import '../../assets/css/components/voting/_loading.scss';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div class="loading">
    <div style="width: 20px; height: 20px">
      <span class="loading__spinner"></span>
    </div>
    <p class="loading__text">{{ t('loading') }}</p>
  </div>
</template>
