<template>
  <footer class="frame mt-24 pb-10">
    <div class="reveal grid grid-cols-1 gap-10 sm:grid-cols-12">
      <div class="sm:col-span-7">
        <div class="flex items-center gap-3">
          <BrandMark class="h-8 w-8" />
          <span class="font-read text-[32px] leading-none tracking-[-0.02em]">DocuPrism</span>
        </div>
        <p class="mt-4 max-w-[38ch] text-ui text-ink">
          {{ t('footer.tagline') }}
        </p>
      </div>

      <div class="flex flex-col gap-2 text-ui sm:col-span-5 sm:items-end">
        <NuxtLink to="/history" class="text-ink transition-colors hover:text-ink-muted">
          {{ t('common.history') }}
        </NuxtLink>
        <a
          href="https://github.com/glaboryp/DocuPrism"
          target="_blank"
          rel="noopener noreferrer"
          class="text-ink transition-colors hover:text-ink-muted"
        >
          {{ t('common.sourceOnGithub') }}
        </a>
        <p class="meta mt-2 text-left sm:text-right">
          {{ t('footer.challenge') }}<br>
          {{ t('footer.version', { version: '1.2.0' }) }}
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import BrandMark from '../components/BrandMark.vue'
import { useI18n } from '../composables/useI18n'

const { t } = useI18n()
</script>
