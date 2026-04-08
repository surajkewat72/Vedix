import { useState, useEffect, useRef } from 'react'
import { useChatStore } from '../stores/chatStore'
import VoiceButton from './VoiceButton'
import { Send, Trash2, Sparkles } from 'lucide-react'

const SUGGESTED = [
  "What does my Sun sign say about my personality?",
  "Tell me about my Moon placement and emotions",
  "What career paths suit my birth chart?",
  "When will I find love according to my chart?",
  "What are my life's biggest challenges?",
]

export default function ChatInterface() {
  const { messages, isStreaming, currentStream, sendMessage, loadHistory, clearHistory } = useChatStore()
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { loadHistory() }, [])
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentStream])

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return
    const text = input.trim()
    setInput('')
    await sendMessage(text)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const lastAiMessage = [...messages].reverse().find(m => m.role === 'assistant')?.content || ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Chat header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(17, 13, 30, 0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)',
          }}>
            <span style={{ fontSize: '1.3rem' }}>🔮</span>
          </div>
          <div>
            <div style={{ fontWeight: '600', fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Vedix AI Astrologer</div>
            <div style={{ fontSize: '0.75rem', color: isStreaming ? '#4ade80' : 'var(--color-text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isStreaming ? '#4ade80' : '#6b7280' }} />
              {isStreaming ? 'Reading the stars…' : 'Online — Vedic Astrologer'}
            </div>
          </div>
        </div>
        <button
          id="clear-chat-btn"
          onClick={clearHistory}
          title="Clear conversation"
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--color-text-dim)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '0.8rem', padding: '6px 10px',
            borderRadius: '6px', transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-dim)'}
        >
          <Trash2 size={14} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 && !isStreaming && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔮</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--color-accent)', marginBottom: '8px' }}>
              Welcome to Your Cosmic Reading
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
              Ask me anything about your birth chart, life path, relationships, or destiny.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {SUGGESTED.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); inputRef.current?.focus() }}
                  style={{
                    padding: '8px 14px',
                    background: 'rgba(124, 58, 237, 0.1)',
                    border: '1px solid rgba(124, 58, 237, 0.25)',
                    borderRadius: '20px',
                    color: 'var(--color-primary-light)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.2)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            {msg.role === 'assistant' && (
              <div style={{
                width: '32px', height: '32px',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginRight: '10px', marginTop: '4px',
                fontSize: '0.9rem',
              }}>🔮</div>
            )}
            <div
              className={msg.role === 'user' ? 'msg-user' : 'msg-ai'}
              style={{
                padding: '12px 16px',
                maxWidth: '75%',
                fontSize: '0.9rem',
                lineHeight: '1.65',
                color: 'var(--color-text)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Streaming AI response */}
        {isStreaming && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'fadeIn 0.3s' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginRight: '10px', marginTop: '4px', fontSize: '0.9rem',
            }}>🔮</div>
            <div className="msg-ai" style={{ padding: '12px 16px', maxWidth: '75%', fontSize: '0.9rem', lineHeight: '1.65', color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>
              {currentStream || (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '4px 0' }}>
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--color-border)',
        background: 'rgba(17, 13, 30, 0.5)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={inputRef}
              id="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your destiny, relationships, career…"
              disabled={isStreaming}
              rows={1}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                resize: 'none',
                outline: 'none',
                lineHeight: '1.5',
                transition: 'border-color 0.2s',
                maxHeight: '120px',
                overflowY: 'auto',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          <VoiceButton
            onTranscript={(text) => setInput(text)}
            lastAiMessage={lastAiMessage}
          />

          <button
            id="send-message-btn"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            style={{
              width: '44px', height: '44px',
              background: input.trim() && !isStreaming
                ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                : 'rgba(124, 58, 237, 0.2)',
              border: 'none',
              borderRadius: '12px',
              cursor: input.trim() && !isStreaming ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            <Send size={18} color={input.trim() && !isStreaming ? 'white' : 'rgba(167,139,250,0.4)'} />
          </button>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--color-text-dim)', marginTop: '8px', textAlign: 'center' }}>
          Powered by Ollama llama3 · Vedic Astrology · Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
