<template>
  <div
    class="pointer-events-none fixed bottom-24 left-4 z-[90] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:left-6"
    role="region"
    aria-label="Notifications"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 px-4 py-3 text-ui"
        :class="toast.type === 'error' ? 'bg-danger text-sheet' : 'bg-ink text-sheet'"
        role="alert"
        aria-atomic="true"
      >
        <p class="flex-1">{{ toast.message }}</p>
        <button
          type="button"
          class="-mr-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center opacity-70 transition-opacity hover:opacity-100"
          aria-label="Dismiss notification"
          @click="removeToast(toast.id)"
        >
          <Icon name="heroicons:x-mark" class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts, remove } = useToast()

const removeToast = (id: string) => {
  remove(id)
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.toast-move {
  transition: transform 160ms ease;
}
</style>
