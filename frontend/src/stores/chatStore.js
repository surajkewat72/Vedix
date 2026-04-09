import { create } from 'zustand'
import { chatApi } from '../lib/api'

export const useChatStore = create((set, get) => ({
  messages: [],
  isStreaming: false,
  currentStream: '',
  error: null,
  botLanguage: 'English',

  setLanguage: (lang) => set({ botLanguage: lang }),

  loadHistory: async () => {
    try {
      const result = await chatApi.getHistory()
      if (result.success) {
        set({ messages: result.messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.created_at,
        }))})
      }
    } catch (err) {
      console.error('Failed to load chat history:', err)
    }
  },

  sendMessage: async (text) => {
    const { messages } = get()

    // Add user message immediately
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }

    set({ messages: [...messages, userMsg], isStreaming: true, currentStream: '' })

    const historyForApi = messages.slice(-20).map(m => ({ role: m.role, content: m.content }))

    try {
      // Simulate human reading and typing delay (1.5 to 3 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));

      let fullResponse = ''

      await chatApi.sendMessage(
        text,
        historyForApi,
        (chunk) => {
          fullResponse += chunk
          set({ currentStream: fullResponse })
        },
        () => {
          // Stream done — add assistant message
          const aiMsg = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date().toISOString(),
          }
          set(state => ({
            messages: [...state.messages, aiMsg],
            isStreaming: false,
            currentStream: '',
          }))
        },
        get().botLanguage
      )
    } catch (err) {
      set({
        isStreaming: false,
        currentStream: '',
        error: err.message,
        messages: [...get().messages, {
          id: Date.now().toString(),
          role: 'assistant',
          content: '⚠️ Sorry, I was unable to connect to the AI. Please ensure Ollama is running.',
          timestamp: new Date().toISOString(),
        }]
      })
    }
  },

  clearHistory: async () => {
    try {
      await chatApi.clearHistory()
      set({ messages: [], currentStream: '', isStreaming: false })
    } catch (err) {
      console.error('Failed to clear history:', err)
    }
  },

  resetState: () => set({ messages: [], currentStream: '', isStreaming: false, error: null }),
}))
