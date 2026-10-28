<template>
  <div class="flex h-[440px] flex-col lg:h-[520px]">
    <!-- Prompt API unavailable -->
    <div v-if="!isPromptApiAvailable" class="flex-1 p-6 sm:p-8">
      <p class="font-read text-[24px] leading-tight">{{ t('chat.unavailableTitle') }}</p>
      <p class="mt-3 max-w-[40ch] text-ui text-ink">
        {{ t('chat.unavailableDesc') }}
      </p>

      <div class="mt-6 space-y-3 text-ui">
        <p v-if="browser === 'unsupported'">
          {{ t('chat.unsupportedBrowser') }}
        </p>
        <template v-else-if="browser === 'edge'">
          <p>{{ t('chat.edgeGuide') }}</p>
          <p class="meta">
            {{ t('chat.edgeInternals', { code: 'edge://on-device-internals' }) }}
          </p>
        </template>
        <template v-else>
          <p>{{ t('chat.chromeGuide') }}</p>
          <p class="meta">
            {{ t('chat.chromeInternals', { version: 'chrome://version', internals: 'chrome://on-device-internals' }) }}
          </p>
          <p class="meta">
            {{ t('chat.modelHardwareNeeds') }}
          </p>
        </template>
      </div>

      <a
        href="https://developer.chrome.com/docs/ai/prompt-api"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-6 inline-block text-ui underline underline-offset-2"
      >
        {{ t('chat.promptApiGuide') }}
      </a>
    </div>

    <template v-else>
      <div class="flex items-center justify-between gap-4 px-6 pt-5 sm:px-8">
        <p class="meta">{{ t('chat.deviceOnlyNote') }}</p>
        <button
          v-if="chatHistory.length > 0"
          type="button"
          class="btn-quiet"
          @click="handleClearChat"
        >
          {{ t('chat.clearChat') }}
        </button>
      </div>

      <div ref="chatContainer" class="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5 sm:px-8">
        <div v-if="chatHistory.length === 0 && !streamingMessage" class="flex h-full flex-col justify-center">
          <p class="font-read text-[24px] leading-tight">{{ t('chat.emptyTitle') }}</p>
          <p class="mt-3 max-w-[38ch] text-ui text-ink">
            {{ t('chat.emptyDesc') }}
          </p>
          <div class="mt-6 flex flex-col items-start gap-1">
            <button
              v-for="question in suggestions"
              :key="question"
              type="button"
              class="text-left text-ui text-ink transition-colors hover:text-ink-muted"
              :disabled="!hasDocument"
              @click="useSuggestion(question)"
            >
              {{ question }}
            </button>
          </div>
          <p v-if="!hasDocument" class="meta mt-6">
            {{ t('chat.addDocumentToBegin') }}
          </p>
        </div>

        <div
          v-for="message in chatHistory"
          :key="message.id"
          class="max-w-[62ch]"
        >
          <p class="meta">{{ message.role === 'user' ? t('chat.you') : t('chat.assistant') }}</p>
          <p v-if="message.role === 'user'" class="mt-1 whitespace-pre-wrap text-ui">
            {{ message.content }}
          </p>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div
            v-else
            class="reading mt-1 text-[17px] leading-[1.6]"
            v-html="formatMarkdown(message.content)"
          />
          <p class="meta mt-1 tabular">{{ formatTime(message.timestamp) }}</p>
        </div>

        <div v-if="isLoading" class="max-w-[62ch]">
          <p class="meta">{{ t('chat.assistant') }}</p>
          <p class="mt-1 text-ui text-ink-muted">{{ t('chat.thinking') }}</p>
        </div>

        <div v-if="streamingMessage" class="max-w-[62ch]">
          <p class="meta">{{ t('chat.assistant') }}</p>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div
            class="reading mt-1 text-[17px] leading-[1.6]"
            v-html="formatMarkdown(streamingMessage)"
          />
        </div>
      </div>

      <form class="flex items-center gap-2 px-6 pb-5 sm:px-8" @submit.prevent="handleSendMessage">
        <label for="chat-input" class="sr-only">{{ t('chat.inputPlaceholder') }}</label>
        <input
          id="chat-input"
          ref="chatInput"
          v-model="inputMessage"
          type="text"
          :placeholder="t('chat.inputPlaceholder')"
          class="field flex-1"
          :disabled="isLoading || !hasDocument"
          autocomplete="off"
        >
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!inputMessage.trim() || isLoading || !hasDocument"
        >
          {{ t('chat.askButton') }}
        </button>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { formatMarkdown } from '../utils/markdownFormatter'
import { useChromePrompt } from '../composables/useChromePrompt'
import { useToast } from '../composables/useToast'
import { useI18n } from '../composables/useI18n'
import { detectAIBrowser, type AIBrowser } from '../utils/browser'

interface Props {
  documentText: string
  hasDocument: boolean
}

const props = defineProps<Props>()
const toast = useToast()
const { t, locale } = useI18n()

const {
  isLoading,
  chatHistory,
  createSession,
  sendMessageStreaming,
  clearHistory,
  destroySession,
  checkSupport
} = useChromePrompt()

const inputMessage = ref('')
const streamingMessage = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const chatInput = ref<HTMLInputElement | null>(null)
const isPromptApiAvailable = ref(false)
const browser = ref<AIBrowser>('chrome')

const suggestions = computed(() => [
  t('chat.suggestions.mainClaim'),
  t('chat.suggestions.numbers'),
  t('chat.suggestions.leftOut')
])

onMounted(async () => {
  if (typeof window !== 'undefined') {
    browser.value = detectAIBrowser()
    isPromptApiAvailable.value = await checkSupport()

    if (isPromptApiAvailable.value && props.documentText && props.documentText.trim()) {
      try {
        await createSession(props.documentText)
      } catch (error) {
        console.error('Error creating chat session:', error)
        toast.error('Failed to initialize chat')
      }
    }
  }
})

watch(() => props.documentText, async (newText, oldText) => {
  if (!isPromptApiAvailable.value) {
    return
  }

  if (oldText === undefined) {
    return
  }

  if (newText && newText.trim()) {
    try {
      await createSession(newText)
    } catch (error) {
      console.error('Error creating chat session:', error)
      toast.error('Failed to initialize chat')
    }
  } else {
    destroySession()
  }
})

const useSuggestion = async (question: string) => {
  inputMessage.value = question
  await nextTick()
  chatInput.value?.focus()
}

const handleSendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const message = inputMessage.value.trim()
  inputMessage.value = ''
  streamingMessage.value = ''

  try {
    await sendMessageStreaming(message, (chunk) => {
      streamingMessage.value = chunk
      scrollToBottom()
    })
    streamingMessage.value = ''
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
    toast.error('Failed to send message')
  }
}

const handleClearChat = () => {
  clearHistory()
  toast.info(t('toasts.chatCleared'))
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const localeCode = locale.value === 'es' ? 'es-ES' : 'en-US'
  return date.toLocaleTimeString(localeCode, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

watch(chatHistory, () => {
  scrollToBottom()
}, { deep: true })
</script>
