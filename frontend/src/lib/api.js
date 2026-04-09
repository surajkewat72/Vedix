import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

/** Get the current session's access token */
async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data?.session?.access_token || null
}

/** Authenticated fetch helper */
async function authFetch(path, options = {}) {
  const token = await getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res
}

// ─── Chart API ──────────────────────────────────────────────────────────────

export const chartApi = {
  calculate: async (birthDetails) => {
    const res = await authFetch('/chart/calculate', {
      method: 'POST',
      body: JSON.stringify(birthDetails),
    })
    return res.json()
  },

  getMyChart: async () => {
    const res = await authFetch('/chart/me')
    return res.json()
  },
}

// ─── Chat API ───────────────────────────────────────────────────────────────

export const chatApi = {
  /**
   * Send a message and receive a streaming SSE response.
   * onChunk(text) is called for each streamed chunk.
   * onDone() is called when streaming ends.
   */
  sendMessage: async (message, history = [], onChunk, onDone, language = 'English') => {
    const token = await getToken()
    const res = await fetch(`${BASE_URL}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, history, language }),
    })

    if (!res.ok) throw new Error(`Chat error: HTTP ${res.status}`)

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value, { stream: true })
      const lines = text.split('\n').filter(l => l.startsWith('data: '))

      for (const line of lines) {
        try {
          const data = JSON.parse(line.slice(6))
          if (data.done) {
            onDone?.()
          } else if (data.content) {
            onChunk?.(data.content)
          }
        } catch (_) {}
      }
    }
  },

  getHistory: async () => {
    const res = await authFetch('/chat/history')
    return res.json()
  },

  clearHistory: async () => {
    const res = await authFetch('/chat/history', { method: 'DELETE' })
    return res.json()
  },
}
