<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="closeModal"
  >
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity" />
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4 sm:p-6">
      <div
        class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 transform transition-all max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-red-500" />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Chrome AI Not Available
            </h3>
          </div>
          <button
            class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            @click="closeModal"
          >
            <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <!-- Content -->
        <div class="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <p class="font-medium text-gray-800 dark:text-gray-200">
            To use DocuPrism's AI features, you need:
          </p>
          
          <div class="space-y-3">
            <!-- Chrome Version -->
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                <span class="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p class="font-medium text-gray-800 dark:text-gray-200">Chrome Canary or Dev Channel</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Version 127+ with Built-in AI APIs</p>
              </div>
            </div>
            
            <!-- Flags -->
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                <span class="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <p class="font-medium text-gray-800 dark:text-gray-200">Enable Chrome Flags</p>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <p>Go to <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">chrome://flags</code> and enable:</p>
                  <ul class="list-disc list-inside mt-1 space-y-1">
                    <li><code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">summarization-api-for-gemini-nano</code></li>
                    <li><code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">prompt-api-for-gemini-nano</code></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Links -->
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Helpful resources:</p>
            <div class="flex flex-col space-y-1">
              <a
                href="https://developer.chrome.com/docs/ai/built-in"
                target="_blank"
                class="text-primary hover:text-primary-hover text-xs underline"
              >
                Chrome Built-in AI Documentation
              </a>
              <a
                href="https://developer.chrome.com/origintrials/#/view_trial/2971108594873614337"
                target="_blank"
                class="text-primary hover:text-primary-hover text-xs underline"
              >
                Built-in AI Origin Trial
              </a>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="flex justify-end mt-6">
          <button
            class="btn-primary px-4 py-2 text-sm"
            @click="closeModal"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const closeModal = () => {
  emit('close')
}

// Close modal on Escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>