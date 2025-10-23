<template>
  <header class="relative bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex items-center justify-between">
        <!-- Logo and Title -->
         <NuxtLink to="/">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg overflow-hidden">
                <img 
                  src="../assets/images/icon.png" 
                  alt="DocuPrism Logo" 
                  class="w-full h-full object-contain"
                >
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">DocuPrism</h1>
              <p class="text-sm text-gray-600 dark:text-gray-400">On-Device Document Analysis</p>
            </div>
          </div>
        </NuxtLink>
        
        <!-- Status Badge and Theme Toggle -->
        <div class="flex items-center space-x-3">
          <!-- History Link -->
          <NuxtLink
            to="/history"
            class="px-2 pt-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600 group"
            title="View History"
            aria-label="View analysis history"
          >
            <Icon name="heroicons:clock" class="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          </NuxtLink>
          
          <!-- Theme Toggle -->
          <ThemeToggle />
          
          <!-- AI Status Badge -->
          <button
            v-if="!isSupported && !isCheckingSupport" 
            class="status-badge error hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
            title="Click to learn how to enable Chrome AI"
            @click="showModal = true"
          >
            <Icon name="heroicons:exclamation-triangle" class="w-4 h-4" />
            <span>AI Not Supported</span>
          </button>
          <div
            v-else-if="isSupported" 
            class="status-badge success">
            <Icon name="heroicons:check-circle" class="w-4 h-4" />
            <span>AI Ready</span>
          </div>
          <div
            v-else 
            class="status-badge warning">
            <Icon name="heroicons:clock" class="w-4 h-4" />
            <span>Checking...</span>
          </div>
          
          <!-- GitHub Link -->
          <a
            href="https://github.com/glaboryp/DocuPrism"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600 group"
            title="View on GitHub"
            aria-label="View DocuPrism on GitHub"
          >
            <!-- GitHub SVG Icon -->
            <svg
              class="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </header>
  
  <!-- AI Requirements Modal -->
  <AIRequirementsModal 
    :is-open="showModal" 
    @close="showModal = false" 
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChromeAI } from '../composables/useChromeAI'
import ThemeToggle from '../components/ThemeToggle.vue'
import AIRequirementsModal from '../components/AIRequirementsModal.vue'

// Use Chrome AI composable directly
const { isSupported, isCheckingSupport } = useChromeAI()

// Modal state
const showModal = ref(false)
</script>