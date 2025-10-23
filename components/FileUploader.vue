<template>
  <div class="space-y-4">
    <!-- File Drop Zone -->
    <div
      :class="[
        'border-2 border-dashed rounded-lg p-8 transition-all duration-200',
        isDragging 
          ? 'border-primary bg-primary/10 dark:bg-primary/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
      ]"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <div class="text-center">
        <Icon 
          :name="isDragging ? 'heroicons:arrow-down-tray' : 'heroicons:document-arrow-up'" 
          :class="[
            'w-12 h-12 mx-auto mb-4',
            isDragging ? 'text-primary animate-bounce' : 'text-gray-400'
          ]" 
        />
        <p class="text-gray-700 dark:text-gray-300 font-medium mb-2">
          {{ isDragging ? 'Drop your file here' : 'Drag and drop a file here' }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          or
        </p>
        <label class="btn-primary inline-flex items-center cursor-pointer">
          <Icon name="heroicons:folder-open" class="w-4 h-4 mr-2" />
          Browse Files
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            :accept="[...acceptedFormats, acceptedMimeTypes].join(',')"
            @change="handleFileSelect"
          >
        </label>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Supported formats: TXT, PDF, DOCX (max {{ maxSizeMB }}MB)
        </p>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-4">
      <Icon name="heroicons:arrow-path" class="w-5 h-5 text-primary animate-spin mr-2" />
      <span class="text-gray-600 dark:text-gray-400">Processing file...</span>
    </div>
    
    <!-- File Info -->
    <div v-if="selectedFile && !isLoading" class="card p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <Icon name="heroicons:document-text" class="w-8 h-8 text-primary" />
          <div>
            <p class="font-medium text-gray-900 dark:text-white">{{ selectedFile.name }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatFileSize(selectedFile.size) }}
            </p>
          </div>
        </div>
        <button
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Remove file"
          @click="clearFile"
        >
          <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '../composables/useToast'
import { parseDocument, getSupportedExtensions, getSupportedMimeTypes, isFileSupported } from '../utils/documentParser'

interface Props {
  maxSizeMB?: number
}

interface Emits {
  (e: 'file-loaded', content: string, filename: string, metadata?: { wordCount: number, charCount: number, pageCount?: number }): void
  (e: 'error', message: string): void
}

const props = withDefaults(defineProps<Props>(), {
  maxSizeMB: 10
})

const emit = defineEmits<Emits>()
const toast = useToast()

const isDragging = ref(false)
const isLoading = ref(false)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const acceptedFormats = getSupportedExtensions()
const acceptedMimeTypes = getSupportedMimeTypes().join(',')
const maxSizeBytes = props.maxSizeMB * 1024 * 1024

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0 && files[0]) {
    processFile(files[0])
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0 && files[0]) {
    processFile(files[0])
  }
}

const processFile = async (file: File) => {
  // Validate file size
  if (file.size > maxSizeBytes) {
    const errorMsg = `File is too large. Maximum size is ${props.maxSizeMB}MB`
    toast.error(errorMsg)
    emit('error', errorMsg)
    return
  }
  
  // Validate file type using our utility
  if (!isFileSupported(file)) {
    const errorMsg = 'Unsupported file format. Please use TXT, PDF, DOCX, or MD files.'
    toast.error(errorMsg)
    emit('error', errorMsg)
    return
  }
  
  selectedFile.value = file
  isLoading.value = true
  
  try {
    // Use our document parser utility
    const result = await parseDocument(file)
    
    // Check for parsing errors
    if (result.error) {
      throw new Error(result.error)
    }
    
    if (!result.text.trim()) {
      throw new Error('File appears to be empty or could not be read')
    }
    
    // Emit the loaded content with metadata
    emit('file-loaded', result.text, file.name, {
      wordCount: result.wordCount,
      charCount: result.charCount,
      pageCount: result.pageCount
    })
    
    // Show success message with file info
    const fileInfo = result.pageCount 
      ? `${result.pageCount} pages, ${result.wordCount} words`
      : `${result.wordCount} words`
    toast.success(`File "${file.name}" loaded successfully! (${fileInfo})`)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to read file'
    toast.error(errorMsg)
    emit('error', errorMsg)
    selectedFile.value = null
  } finally {
    isLoading.value = false
  }
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>
