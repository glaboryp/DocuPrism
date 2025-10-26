<template>
  <button
    class="p-1.5 sm:px-2 sm:pt-1 rounded-lg bg-accent-100 hover:bg-accent-200 transition-all duration-200 shadow-sm hover:shadow-md border border-accent-200"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    aria-label="Toggle theme"
    @click="toggleTheme"
  >
    <Icon
      :name="isDark ? 'heroicons:sun' : 'heroicons:moon'"
      class="w-4 h-4 sm:w-5 sm:h-5 text-accent"
    />
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>