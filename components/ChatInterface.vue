<template>
  <div class="flex flex-col h-full">
    <!-- Chat Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-2">
        <Icon name="heroicons:chat-bubble-left-right" class="w-5 h-5 text-primary" />
        <h3 class="font-semibold text-gray-900 dark:text-white">Chat with Document</h3>
      </div>
      <button
        v-if="chatHistory.length > 0"
        class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        @click="handleClearChat"
      >
        <Icon name="heroicons:trash" class="w-4 h-4" />
      </button>
    </div>

    <!-- Chat Messages -->
    <div
      ref="chatContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
    >
      <!-- Prompt API Not Available Warning -->
      <div v-if="!isPromptApiAvailable" class="flex flex-col items-center justify-center h-full text-center p-6">
        <div class="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-6 max-w-md">
          <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h4 class="text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-3">
            Prompt API Not Available
          </h4>
          <p class="text-sm text-yellow-700 dark:text-yellow-400 mb-4">
            The chat feature requires Chrome's Prompt API to be enabled. This API is currently experimental.
          </p>
          <div class="text-left bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
            <p class="text-xs font-semibold text-gray-900 dark:text-white mb-2">To enable it:</p>
            <ol class="text-xs text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside">
              <li>Use <strong>Chrome Canary</strong> or <strong>Chrome Dev</strong> (not regular Chrome)</li>
              <li>Open <code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">chrome://flags</code></li>
              <li>Search for <strong>"Prompt API for Gemini Nano"</strong></li>
              <li>Set it to <strong>Enabled</strong></li>
              <li><strong>Restart Chrome completely</strong></li>
              <li>Verify in console: <code class="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">window.ai</code> should not be undefined</li>
            </ol>
          </div>
          <div class="text-left bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
            <p class="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">Quick Test:</p>
            <p class="text-xs text-blue-700 dark:text-blue-400">
              Open DevTools Console and type: <code class="bg-blue-100 dark:bg-blue-900 px-1 rounded">window.ai</code>
            </p>
            <p class="text-xs text-blue-600 dark:text-blue-500 mt-1">
              If it shows <code class="bg-blue-100 dark:bg-blue-900 px-1 rounded">undefined</code>, the flag is not enabled.
            </p>
          </div>
          <p class="text-xs text-yellow-600 dark:text-yellow-500">
            <strong>Important:</strong> Regular Chrome does not support this feature yet. You must use Chrome Canary or Dev channel.
          </p>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="chatHistory.length === 0" class="flex flex-col items-center justify-center h-full text-center">
        <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Start a conversation
        </h4>
        <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Ask questions about your document and get instant answers powered by AI
        </p>
      </div>

      <!-- Messages -->
      <div
        v-for="message in chatHistory"
        :key="message.id"
        :class="[
          'flex',
          message.role === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <div
          :class="[
            'max-w-[80%] rounded-lg px-4 py-2',
            message.role === 'user'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
          ]"
        >
          <!-- User messages: plain text -->
          <p v-if="message.role === 'user'" class="text-sm whitespace-pre-wrap">
            {{ message.content }}
          </p>
          <!-- Assistant messages: render markdown (sanitized via formatMarkdown utility) -->
          <div 
            v-else 
            class="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0"
            v-html="formatMarkdown(message.content)" 
          />
          <span class="text-xs opacity-70 mt-1 block">
            {{ formatTime(message.timestamp) }}
          </span>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
          <div class="flex items-center space-x-2">
            <Icon name="heroicons:arrow-path" class="w-4 h-4 text-gray-500 animate-spin" />
            <span class="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
          </div>
        </div>
      </div>

      <!-- Streaming message (sanitized via formatMarkdown utility) -->
      <div v-if="streamingMessage" class="flex justify-start">
        <div class="max-w-[80%] bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
          <div 
            class="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 text-gray-900 dark:text-white"
            v-html="formatMarkdown(streamingMessage)" 
          />
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-700">
      <form class="flex space-x-2" @submit.prevent="handleSendMessage">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="Ask a question about your document..."
          class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          :disabled="isLoading || !hasDocument || !isPromptApiAvailable"
        >
        <button
          type="submit"
          class="btn-primary px-4 py-2"
          :disabled="!inputMessage.trim() || isLoading || !hasDocument || !isPromptApiAvailable"
        >
          <Icon v-if="isLoading" name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
          <Icon v-else name="heroicons:paper-airplane" class="w-5 h-5" />
        </button>
      </form>
      <p v-if="!hasDocument && isPromptApiAvailable" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Please enter or upload a document first to start chatting
      </p>
      <p v-if="!isPromptApiAvailable" class="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
        Prompt API is not available. Please enable it in Chrome flags.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { formatMarkdown } from '../utils/markdownFormatter'
import { useChromePrompt } from '../composables/useChromePrompt'
import { useToast } from '../composables/useToast'

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
const isPromptApiAvailable = ref(false)

// Check if Prompt API is available on mount (client-side only)
onMounted(async () => {
  if (typeof window !== 'undefined') {
    isPromptApiAvailable.value = await checkSupport()
    
    // After checking support, try to create session if we have a document
    if (isPromptApiAvailable.value && props.documentText && props.documentText.trim()) {
      try {
        const success = await createSession(props.documentText)
        if (success) {
          toast.success('Chat session created! You can now ask questions.')
        }
      } catch (error) {
        console.error('Error creating chat session:', error)
        toast.error('Failed to initialize chat')
      }
    }
  }
})

// Create session when document changes (but not on initial mount)
watch(() => props.documentText, async (newText, oldText) => {
  // Don't try to create session if Prompt API is not available
  if (!isPromptApiAvailable.value) {
    return
  }
  
  // Skip if this is the initial value (handled in onMounted)
  if (oldText === undefined) {
    return
  }
  
  if (newText && newText.trim()) {
    try {
      const success = await createSession(newText)
      if (success) {
        toast.success('Chat session updated!')
      }
    } catch (error) {
      console.error('Error creating chat session:', error)
      toast.error('Failed to initialize chat')
    }
  } else {
    destroySession()
  }
})

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
  if (confirm('Are you sure you want to clear the chat history?')) {
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

// Use the imported formatMarkdown utility from utils/markdownFormatter.ts
// It provides secure markdown formatting with built-in sanitization

// Scroll to bottom when new messages arrive
watch(chatHistory, () => {
  scrollToBottom()
}, { deep: true })
</script>
