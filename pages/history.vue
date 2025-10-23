<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOfflineStorage } from '../composables/useOfflineStorage'
import { useToast } from '../composables/useToast'
import type { StoredAnalysis } from '../types/storage'

definePageMeta({
  name: 'history'
})

useHead({
  title: 'History - DocuPrism',
  meta: [
    { name: 'description', content: 'View your saved document analyses' }
  ]
})

const { 
  isStorageAvailable, 
  storedAnalyses, 
  getStoredAnalyses, 
  deleteAnalysis, 
  clearAllAnalyses,
  getStorageInfo,
  formatTimestamp 
} = useOfflineStorage()

const toast = useToast()
const selectedAnalysis = ref<StoredAnalysis | null>(null)
const analyses = computed(() => storedAnalyses.value)
const storageInfo = computed(() => getStorageInfo())

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const viewAnalysis = (analysis: StoredAnalysis) => {
  selectedAnalysis.value = analysis
}

const closeModal = () => {
  selectedAnalysis.value = null
}

const copySummary = async (analysis: StoredAnalysis) => {
  try {
    await navigator.clipboard.writeText(analysis.summary)
    toast.success('Summary copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy:', err)
    toast.error('Failed to copy to clipboard')
  }
}

const deleteAnalysisItem = (id: string) => {
  if (confirm('Are you sure you want to delete this analysis?')) {
    const success = deleteAnalysis(id)
    if (success) {
      toast.success('Analysis deleted')
    } else {
      toast.error('Failed to delete analysis')
    }
  }
}

const handleClearAll = () => {
  if (confirm('Are you sure you want to delete all analyses? This action cannot be undone.')) {
    const success = clearAllAnalyses()
    if (success) {
      toast.success('All analyses cleared')
    } else {
      toast.error('Failed to clear analyses')
    }
  }
}

onMounted(() => {
  if (isStorageAvailable.value) {
    getStoredAnalyses()
  }
})
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Icon name="heroicons:clock" class="w-8 h-8 mr-3 text-primary" />
            Analysis History
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            View and manage your saved document analyses
          </p>
        </div>
        
        <button
          v-if="analyses.length > 0"
          class="btn-secondary flex items-center"
          @click="handleClearAll"
        >
          <Icon name="heroicons:trash" class="w-4 h-4 mr-2" />
          Clear All
        </button>
      </div>
    </div>
    
    <!-- Storage Info -->
    <div v-if="isStorageAvailable && analyses.length > 0" class="mb-6">
      <div class="card p-4">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">
            Storage Used: {{ formatBytes(storageInfo.used) }} / {{ formatBytes(storageInfo.available) }}
          </span>
          <span class="text-gray-600 dark:text-gray-400">
            {{ analyses.length }} {{ analyses.length === 1 ? 'analysis' : 'analyses' }} saved
          </span>
        </div>
        <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            class="bg-primary h-2 rounded-full transition-all duration-300"
            :style="{ width: `${Math.min(storageInfo.percentage, 100)}%` }"
          />
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-if="analyses.length === 0" class="card p-12">
      <div class="text-center">
        <Icon name="heroicons:document-text" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No analyses yet
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Your saved document analyses will appear here
        </p>
        <NuxtLink to="/" class="btn-primary inline-flex items-center">
          <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
          Create Analysis
        </NuxtLink>
      </div>
    </div>
    
    <!-- Analysis List -->
    <div v-else class="space-y-4">
      <div
        v-for="analysis in analyses"
        :key="analysis.id"
        class="card p-6 hover:shadow-2xl transition-shadow duration-200"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="badge-success text-xs">
                {{ analysis.options.type }}
              </span>
              <span class="badge-warning text-xs">
                {{ analysis.options.length }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatTimestamp(analysis.timestamp) }}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {{ analysis.inputText }}
            </p>
          </div>
          
          <div class="flex items-center gap-2 ml-4">
            <button
              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="View details"
              @click="viewAnalysis(analysis)"
            >
              <Icon name="heroicons:eye" class="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Copy summary"
              @click="copySummary(analysis)"
            >
              <Icon name="heroicons:clipboard-document" class="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              class="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              title="Delete"
              @click="deleteAnalysisItem(analysis.id)"
            >
              <Icon name="heroicons:trash" class="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
        
        <!-- Summary Preview -->
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mt-3">
          <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {{ analysis.summary }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- Detail Modal -->
    <div
      v-if="selectedAnalysis"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click="closeModal"
    >
      <div class="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity" />
      
      <div class="flex min-h-full items-center justify-center p-4">
        <div
          class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full p-6 transform transition-all max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              Analysis Details
            </h3>
            <button
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              @click="closeModal"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <!-- Metadata -->
          <div class="mb-6 flex flex-wrap gap-2">
            <span class="badge-success">{{ selectedAnalysis.options.type }}</span>
            <span class="badge-warning">{{ selectedAnalysis.options.length }}</span>
            <span class="badge-success">{{ selectedAnalysis.options.format }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatTimestamp(selectedAnalysis.timestamp) }}
            </span>
          </div>
          
          <!-- Original Text -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Original Text
            </h4>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 max-h-48 overflow-y-auto">
              <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {{ selectedAnalysis.inputText }}
              </p>
            </div>
          </div>
          
          <!-- Summary -->
          <div>
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Summary
            </h4>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {{ selectedAnalysis.summary }}
              </p>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="mt-6 flex justify-end gap-3">
            <button
              class="btn-secondary"
              @click="copySummary(selectedAnalysis)"
            >
              <Icon name="heroicons:clipboard-document" class="w-4 h-4 mr-2" />
              Copy Summary
            </button>
            <button
              class="btn-primary"
              @click="closeModal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
