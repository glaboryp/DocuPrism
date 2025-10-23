<script setup lang="ts">
import SummaryView from '../sections/SummaryView.vue'

definePageMeta({
  name: 'index'
})

useHead({
  title: 'DocuPrism - On-Device Document Analysis',
  meta: [
    { name: 'description', content: 'Privacy-first, offline-capable PWA for on-device document analysis using Chrome Built-in AI' }
  ]
})
</script>

<template>
  <SummaryView />
</template>
