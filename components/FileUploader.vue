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
        {{ isDragging ? t('fileUploader.dragActive') : t('fileUploader.dragIdle') }}
      </p>
      <p class="mt-3 max-w-[46ch] text-ui text-ink">
        {{ t('fileUploader.subtitle', { maxSize: maxSizeMB }) }}
      </p>
    </div>

    <div v-if="isLoading" class="mt-8" role="status" aria-live="polite">
      <p class="meta">
        {{ selectedFile ? t('fileUploader.readingNamedFile', { name: selectedFile.name }) : t('fileUploader.readingFile') }}
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
        :aria-label="t('fileUploader.removeAria')"
        @click="clearFile"
      >
        {{ t('common.remove') }}
      </button>
    </div>

    <div class="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
      <label class="btn btn-primary cursor-pointer">
        {{ t('common.openFile') }}
        <input
          ref="fileInput"
          type="file"
          class="sr-only"
          :accept="[...acceptedFormats, acceptedMimeTypes].join(',')"
          @change="handleFileSelect"
        >
      </label>
      <span class="meta">{{ t('fileUploader.orDrop') }}</span>
    </div>

    <p class="meta mt-6">
      {{ t('fileUploader.localNote') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '../composables/useToast'
import { useI18n } from '../composables/useI18n'
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
const { t } = useI18n()

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
      throw new Error(t('toasts.emptyFile'))
    }

    emit('file-loaded', result.text, file.name, {
      wordCount: result.wordCount,
      charCount: result.charCount,
      pageCount: result.pageCount
    })

    if (result.pageCount) {
      toast.success(t('toasts.fileLoadedWithPages', {
        filename: file.name,
        pageCount: result.pageCount,
        wordCount: result.wordCount
      }))
    } else {
      toast.success(t('toasts.fileLoadedWords', {
        filename: file.name,
        wordCount: result.wordCount
      }))
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : t('toasts.readFailed', { filename: file.name, error: '' })
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
