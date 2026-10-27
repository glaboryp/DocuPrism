<template>
  <div class="flex h-[440px] flex-col lg:h-[520px]">
    <!-- Prompt API unavailable -->
    <div v-if="!isPromptApiAvailable" class="flex-1 p-6 sm:p-8">
      <p class="font-read text-[24px] leading-tight">Chat is not available here.</p>
      <p class="mt-3 max-w-[40ch] text-ui text-ink">
        The chat needs Chrome's Prompt API. Summaries may still work in this browser.
      </p>

      <div class="mt-6 space-y-3 text-ui">
        <p v-if="browser === 'unsupported'">
          Open this page in <strong>desktop Chrome 148 or newer</strong> (or a recent Microsoft Edge).
          This browser does not include a built-in on-device model.
        </p>
        <template v-else-if="browser === 'edge'">
          <p>Update to a recent <strong>Microsoft Edge Stable</strong> on Windows or macOS. No flags are needed.</p>
          <p class="meta">
            Check the model and device class at
            <code class="bg-inset px-1">edge://on-device-internals</code>.
          </p>
        </template>
        <template v-else>
          <p>Use <strong>Chrome 148 or newer</strong> on desktop. No flags are needed.</p>
          <p class="meta">
            Check <code class="bg-inset px-1">chrome://version</code>, then the model at
            <code class="bg-inset px-1">chrome://on-device-internals</code>.
          </p>
          <p class="meta">
            The model needs about 22 GB of free disk and a GPU with more than 4 GB of VRAM
            (or 16 GB of RAM and 4+ CPU cores).
          </p>
        </template>
      </div>

      <a
        href="https://developer.chrome.com/docs/ai/prompt-api"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-6 inline-block text-ui underline underline-offset-2"
      >
        Prompt API guide
      </a>
    </div>

    <template v-else>
      <div class="flex items-center justify-between gap-4 px-6 pt-5 sm:px-8">
        <p class="meta">Answers stay on this device</p>
        <button
          v-if="chatHistory.length > 0"
          type="button"
          class="btn-quiet"
          @click="handleClearChat"
        >
          Clear chat
        </button>
      </div>

      <div ref="chatContainer" class="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5 sm:px-8">
        <div v-if="chatHistory.length === 0 && !streamingMessage" class="flex h-full flex-col justify-center">
          <p class="font-read text-[24px] leading-tight">Ask about this document.</p>
          <p class="mt-3 max-w-[38ch] text-ui text-ink">
            Questions use the text in the document pane. If the document changes, the chat starts again.
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
            Add a document in the left page to begin.
          </p>
        </div>

        <div
          v-for="message in chatHistory"
          :key="message.id"
          class="max-w-[62ch]"
        >
          <p class="meta">{{ message.role === 'user' ? 'You' : 'DocuPrism' }}</p>
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
          <p class="meta">DocuPrism</p>
          <p class="mt-1 text-ui text-ink-muted">Thinking…</p>
        </div>

        <div v-if="streamingMessage" class="max-w-[62ch]">
          <p class="meta">DocuPrism</p>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div
            class="reading mt-1 text-[17px] leading-[1.6]"
            v-html="formatMarkdown(streamingMessage)"
          />
        </div>
      </div>

      <form class="flex items-center gap-2 px-6 pb-5 sm:px-8" @submit.prevent="handleSendMessage">
        <label for="chat-input" class="sr-only">Ask a question about the document</label>
        <input
          id="chat-input"
          ref="chatInput"
          v-model="inputMessage"
          type="text"
          placeholder="Ask a question…"
          class="field flex-1"
          :disabled="isLoading || !hasDocument"
          autocomplete="off"
        >
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!inputMessage.trim() || isLoading || !hasDocument"
        >
          Ask
        </button>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { formatMarkdown } from '../utils/markdownFormatter'
import { useChromePrompt } from '../composables/useChromePrompt'
import { useToast } from '../composables/useToast'
import { detectAIBrowser, type AIBrowser } from '../utils/browser'

interface Props {
  documentText: string
  hasDocument: boolean
}

const props = defineProps<Props>()
const toast = useToast()

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

const suggestions = [
  'What is the main claim?',
  'Which numbers does it report?',
  'What does it leave out?'
]

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
  if (confirm('Clear this chat history?')) {
    clearHistory()
    toast.info('Chat history cleared')
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

watch(chatHistory, () => {
  scrollToBottom()
}, { deep: true })
</script>
