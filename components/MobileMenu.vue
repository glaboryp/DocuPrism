<template>
  <div>
    <!-- Mobile Menu Overlay -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 z-[100] lg:hidden"
        @click="closeMenu"
      />
    </Transition>

    <!-- Mobile Menu Panel -->
    <Transition name="slide">
      <div
        v-if="isOpen"
        class="fixed top-0 right-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-2xl z-[101] lg:hidden"
      >
        <div class="flex flex-col h-full">
          <!-- Menu Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
            <button
              class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close menu"
              @click="closeMenu"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <!-- Menu Items -->
          <nav class="flex-1 overflow-y-auto p-4">
            <ul class="space-y-2">
              <!-- History Link -->
              <li>
                <NuxtLink
                  to="/history"
                  :class="[
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                    isCheckingSupport 
                      ? 'opacity-50 cursor-not-allowed pointer-events-none' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  ]"
                  @click="closeMenu"
                >
                  <Icon name="heroicons:clock" class="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span class="text-gray-900 dark:text-white font-medium">History</span>
                </NuxtLink>
              </li>

              <!-- Theme Toggle -->
              <li>
                <button
                  class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  @click="toggleTheme"
                >
                  <Icon 
                    :name="isDark ? 'heroicons:sun' : 'heroicons:moon'" 
                    class="w-5 h-5 text-gray-700 dark:text-gray-300"
                  />
                  <span class="text-gray-900 dark:text-white font-medium">
                    {{ isDark ? 'Light Mode' : 'Dark Mode' }}
                  </span>
                </button>
              </li>

              <!-- GitHub Link -->
              <li>
                <a
                  href="https://github.com/glaboryp/DocuPrism"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  @click="closeMenu"
                >
                  <svg
                    class="w-5 h-5 text-gray-700 dark:text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span class="text-gray-900 dark:text-white font-medium">GitHub</span>
                </a>
              </li>
            </ul>
          </nav>

          <!-- Menu Footer -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
              DocuPrism v1.0
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useChromeAI } from '../composables/useChromeAI'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

const route = useRoute()
const { isDark, toggleTheme } = useTheme()
const { isCheckingSupport } = useChromeAI()

const closeMenu = () => {
  emit('close')
  document.body.style.overflow = ''
}

// Prevent body scroll when menu is open
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Close menu when route changes
watch(() => route.path, () => {
  closeMenu()
})

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Fade transition for overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide transition for menu panel */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
