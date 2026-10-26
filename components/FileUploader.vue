<template>
  <div
    class="flex min-h-[280px] flex-col justify-between p-6 transition-colors sm:min-h-[360px] sm:p-8 lg:min-h-[400px]"
    :class="{ 'bg-inset': isDragging }"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <div>
      <p class="font-read text-[24px] leading-tight">
        {{ isDragging ? 'Drop the file here.' : 'Open a document from this device.' }}
      </p>
      <p class="mt-3 max-w-[46ch] text-ui text-ink-muted">
        TXT, MD, PDF or DOCX, up to {{ maxSizeMB }} MB. The file is read here; it is never uploaded.
      </p>
    </div>

    <div v-if="isLoading" class="mt-8" role="status" aria-live="polite">
      <p class="meta">
        Reading{{ selectedFile ? ` “${selectedFile.name}”` : ' the file' }}…
      </p>
      <div class="progress mt-3">
        <span />
      </div>
    </div>

    <div v-else-if="selectedFile" class="mt-8 flex items-start justify-between gap-4 bg-inset p-4">
      <div>
        <p class="text-ui font-medium">{{ selectedFile.name }}</p>
        <p class="meta mt-1">{{ formatFileSize(selectedFile.size) }}</p>
      </div>
      <button
        type="button"
        class="btn-quiet"
        aria-label="Remove file"
        @click="clearFile"
      >
        Remove
      </button>
    </div>

    <div class="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
      <label class="btn btn-primary cursor-pointer">
        Open file
        <input
          ref="fileInput"
          type="file"
          class="sr-only"
          :accept="[...acceptedFormats, acceptedMimeTypes].join(',')"
          @change="handleFileSelect"
        >
      </label>
      <span class="meta">or drop it onto this page</span>
    </div>

    <p class="meta mt-6">
      PDF and Word files are extracted locally before summarizing.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '../composables/useToast'
import { parseDocument, getSupportedExtensions, getSupportedMimeTypes } from '../utils/documentParser'
import { validateFileSize, validateFileType, formatFileSize } from '../utils/validators'

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
  const sizeValidation = validateFileSize(file, props.maxSizeMB)
  if (!sizeValidation.valid) {
    toast.error(sizeValidation.error!)
    emit('error', sizeValidation.error!)
    return
  }

  const typeValidation = validateFileType(file)
  if (!typeValidation.valid) {
    toast.error(typeValidation.error!)
    emit('error', typeValidation.error!)
    return
  }

  selectedFile.value = file
  isLoading.value = true

  try {
    const result = await parseDocument(file)

    if (result.error) {
      throw new Error(result.error)
    }

    if (!result.text.trim()) {
      throw new Error('File appears to be empty or could not be read')
    }

    emit('file-loaded', result.text, file.name, {
      wordCount: result.wordCount,
      charCount: result.charCount,
      pageCount: result.pageCount
    })

    const fileInfo = result.pageCount
      ? `${result.pageCount} pages, ${result.wordCount} words`
      : `${result.wordCount} words`
    toast.success(`File "${file.name}" loaded (${fileInfo})`)
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
