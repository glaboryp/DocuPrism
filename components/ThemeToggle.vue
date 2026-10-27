<template>
  <button
    type="button"
    class="inline-flex h-11 w-11 items-center justify-center text-ink transition-colors hover:bg-inset"
    :title="isDark ? t('theme.switchToLight') : t('theme.switchToDark')"
    :aria-label="isDark ? t('theme.switchToLight') : t('theme.switchToDark')"
    :aria-pressed="isDark"
    @click="toggleTheme"
  >
    <Icon
      :name="isDark ? 'heroicons:sun' : 'heroicons:moon'"
      class="h-[18px] w-[18px]"
      aria-hidden="true"
    />
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme'
import { useI18n } from '../composables/useI18n'

const { isDark, toggleTheme } = useTheme()
const { t } = useI18n()
</script>
