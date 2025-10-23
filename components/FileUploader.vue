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
            :accept="acceptedFormats.join(',')"
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

interface Props {
  maxSizeMB?: number
}

interface Emits {
  (e: 'file-loaded', content: string, filename: string): void
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

const acceptedFormats = ['.txt', '.pdf', '.docx', '.doc', '.md']
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
  
  // Validate file type
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!acceptedFormats.includes(extension)) {
    const errorMsg = 'Unsupported file format. Please use TXT, PDF, or DOCX files.'
    toast.error(errorMsg)
    emit('error', errorMsg)
    return
  }
  
  selectedFile.value = file
  isLoading.value = true
  
  try {
    let content = ''
    
    if (extension === '.txt' || extension === '.md') {
      content = await readTextFile(file)
    } else if (extension === '.pdf') {
      content = await readPDFFile(file)
    } else if (extension === '.docx' || extension === '.doc') {
      content = await readDocxFile(file)
    }
    
    if (!content.trim()) {
      throw new Error('File appears to be empty or could not be read')
    }
    
    emit('file-loaded', content, file.name)
    toast.success(`File "${file.name}" loaded successfully!`)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to read file'
    toast.error(errorMsg)
    emit('error', errorMsg)
    selectedFile.value = null
  } finally {
    isLoading.value = false
  }
}

const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      resolve(content)
    }
    reader.onerror = () => reject(new Error('Failed to read text file'))
    reader.readAsText(file)
  })
}

const readPDFFile = async (_file: File): Promise<string> => {
  // For now, we'll show a message that PDF support requires additional library
  // In production, you would use pdf.js or similar
  toast.warning('PDF support coming soon. Please convert to TXT for now.')
  throw new Error('PDF files are not yet supported. Please use TXT or DOCX files.')
}

const readDocxFile = async (_file: File): Promise<string> => {
  // For now, we'll show a message that DOCX support requires additional library
  // In production, you would use mammoth.js or similar
  toast.warning('DOCX support coming soon. Please convert to TXT for now.')
  throw new Error('DOCX files are not yet supported. Please use TXT files.')
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>
