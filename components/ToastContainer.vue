<template>
  <div
    class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
    role="region"
    aria-label="Notifications"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto',
          'max-w-sm w-full',
          'rounded-lg shadow-lg',
          'p-4',
          'flex items-start gap-3',
          'backdrop-blur-sm',
          'border',
          'transition-all duration-300',
          toastClasses[toast.type]
        ]"
        role="alert"
        :aria-atomic="true"
      >
        <!-- Icon -->
        <div class="flex-shrink-0">
          <Icon
            :name="toastIcons[toast.type]"
            :class="['w-5 h-5', toastIconClasses[toast.type]]"
          />
        </div>
        
        <!-- Message -->
        <div class="flex-1 pt-0.5">
          <p :class="['text-sm font-medium', toastTextClasses[toast.type]]">
            {{ toast.message }}
          </p>
        </div>
        
        <!-- Close Button -->
        <button
          type="button"
          :class="[
            'flex-shrink-0',
            'rounded-lg p-1',
            'hover:bg-black/10 dark:hover:bg-white/10',
            'transition-colors',
            toastTextClasses[toast.type]
          ]"
          aria-label="Close notification"
          @click="removeToast(toast.id)"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts, remove } = useToast()

const toastClasses = {
  success: 'bg-green-50/95 dark:bg-green-900/40 border-green-200 dark:border-green-700',
  error: 'bg-red-50/95 dark:bg-red-900/40 border-red-200 dark:border-red-700',
  warning: 'bg-yellow-50/95 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-700',
  info: 'bg-blue-50/95 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700'
}

const toastIcons = {
  success: 'heroicons:check-circle',
  error: 'heroicons:x-circle',
  warning: 'heroicons:exclamation-triangle',
  info: 'heroicons:information-circle'
}

const toastIconClasses = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400'
}

const toastTextClasses = {
  success: 'text-green-800 dark:text-green-200',
  error: 'text-red-800 dark:text-red-200',
  warning: 'text-yellow-800 dark:text-yellow-200',
  info: 'text-blue-800 dark:text-blue-200'
}

const removeToast = (id: string) => {
  remove(id)
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
