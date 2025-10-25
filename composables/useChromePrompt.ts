import { ref, readonly } from 'vue'
import { createAIError, logError } from '../utils/errorHandler'
import type { AILanguageModel } from '../types/chrome-ai'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export const useChromePrompt = () => {
  const isSupported = ref(false)
  const isLoading = ref(false)
  const error = ref<string>('')
  const session = ref<AILanguageModel | null>(null)
  const chatHistory = ref<ChatMessage[]>([])
  const documentContext = ref<string>('')  // Store document context

  // Check if Prompt API is supported
  const checkSupport = async (): Promise<boolean> => {
    try {
      // Check for Prompt API using the same pattern as Summarizer
      // The API might be at window.ai.languageModel or a future window.LanguageModel
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aiWindow = window as any
      const hasPromptAPI = typeof window !== 'undefined' && (
        (aiWindow.ai && typeof aiWindow.ai === 'object' && 'languageModel' in aiWindow.ai) ||
        ('LanguageModel' in window)
      )
      
      if (!hasPromptAPI) {
        error.value = 'Prompt API not available'
        return false
      }

      // Try to check capabilities if available
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const capWindow = window as any
        if (capWindow.ai?.languageModel?.capabilities) {
          const capabilities = await capWindow.ai.languageModel.capabilities()
          
          if (capabilities.available === 'no') {
            error.value = 'Prompt API not available on this device'
            return false
          }
        }
      } catch {
        // Capabilities check failed, but API might still work
      }

      isSupported.value = true
      return true
    } catch (err) {
      logError(err, { context: 'checkPromptSupport' })
      error.value = 'Failed to check Prompt API support'
      return false
    }
  }

  // Create a new chat session with document context
  const createSession = async (documentContextParam: string): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = ''

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aiWindow = window as any
      
      // Check both possible locations for the API
      const LanguageModelAPI = aiWindow.LanguageModel || aiWindow.ai?.languageModel
      
      if (!LanguageModelAPI) {
        console.error('[useChromePrompt] No LanguageModel API found')
        throw createAIError('notSupported')
      }

      // Store document context for use in each message
      // Note: Chrome's LanguageModel API doesn't support systemPrompt yet,
      // so we need to include the context in each message
      documentContext.value = documentContextParam

      // Create the session without system prompt (not supported yet)
      session.value = await LanguageModelAPI.create({
        temperature: 0.7,
        topK: 3
      })

      // Clear previous chat history
      chatHistory.value = []

      return true
    } catch (err) {
      console.error('[useChromePrompt] Error creating session:', err)
      logError(err, { context: 'createPromptSession' })
      error.value = err instanceof Error ? err.message : 'Failed to create chat session'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Send a message and get response
  const sendMessage = async (message: string): Promise<string> => {
    if (!session.value) {
      throw new Error('No active chat session')
    }

    try {
      isLoading.value = true
      error.value = ''

      // Add user message to history
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: Date.now()
      }
      chatHistory.value.push(userMessage)

      // Get AI response
      const response = await session.value.prompt(message)

      // Add assistant message to history
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }
      chatHistory.value.push(assistantMessage)

      return response
    } catch (err) {
      logError(err, { context: 'sendPromptMessage' })
      error.value = err instanceof Error ? err.message : 'Failed to send message'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Send a message and get streaming response
  const sendMessageStreaming = async (
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<void> => {
    if (!session.value) {
      throw new Error('No active chat session')
    }

    try {
      isLoading.value = true
      error.value = ''

      // Add user message to history
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: Date.now()
      }
      chatHistory.value.push(userMessage)

      let fullResponse = ''

      // Build the full prompt with document context
      const fullPrompt = documentContext.value 
        ? `Based on the following document:

---
${documentContext.value}
---

Question: ${message}

CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE:
1. Answer the question based ONLY on the information in the document above
2. If the answer is not in the document, say so clearly
3. **RESPOND IN THE EXACT SAME LANGUAGE AS THE QUESTION** - If the question is in English, respond in English. If it's in Spanish, respond in Spanish. Match the language of the question precisely.
4. Keep your answer concise and accurate
5. Do not translate the question or change languages - maintain the same language throughout your response`
        : message
      
      // Get streaming response with context included
      const stream = session.value.promptStreaming(fullPrompt)
      for await (const chunk of stream) {
        // Accumulate chunks instead of replacing
        fullResponse += chunk
        // Pass the full accumulated response to the callback
        onChunk(fullResponse)
      }

      // Add complete assistant message to history
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now()
      }
      chatHistory.value.push(assistantMessage)
    } catch (err) {
      logError(err, { context: 'sendPromptMessageStreaming' })
      error.value = err instanceof Error ? err.message : 'Failed to send message'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Clear chat history
  const clearHistory = () => {
    chatHistory.value = []
  }

  // Destroy session
  const destroySession = () => {
    if (session.value) {
      session.value.destroy()
      session.value = null
    }
    chatHistory.value = []
  }

  return {
    // State
    isSupported: readonly(isSupported),
    isLoading: readonly(isLoading),
    error: readonly(error),
    chatHistory: readonly(chatHistory),
    
    // Methods
    checkSupport,
    createSession,
    sendMessage,
    sendMessageStreaming,
    clearHistory,
    destroySession
  }
}
