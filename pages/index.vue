<script setup lang="ts">
import { computed } from 'vue'
import SummaryView from '../sections/SummaryView.vue'
import { useI18n } from '../composables/useI18n'

definePageMeta({
  name: 'index'
})

const { t } = useI18n()

useHead({
  title: computed(() => `DocuPrism - ${t('common.appName')}`),
  meta: [
    { name: 'description', content: computed(() => t('desk.subtitle')) }
  ]
})
</script>

<template>
  <SummaryView />
</template>
