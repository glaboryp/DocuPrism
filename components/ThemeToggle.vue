<template>
  <button
    class="px-2 pt-1 rounded-lg bg-accent-100 hover:bg-accent-200 transition-all duration-200 shadow-sm hover:shadow-md border border-accent-200"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    aria-label="Toggle theme"
    @click="toggleTheme"
  >
    <Icon
      :name="isDark ? 'heroicons:sun' : 'heroicons:moon'"
      class="w-5 h-5 text-accent"
    />
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>