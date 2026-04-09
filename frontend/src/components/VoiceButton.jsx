import { useState, useCallback, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const speechSynthesis = window.speechSynthesis

const languageToLocale = {
  'English': 'en-IN',
  'Hinglish': 'en-IN',
  'Hindi': 'hi-IN',
  'Bengali': 'bn-IN',
  'Marathi': 'mr-IN',
  'Telugu': 'te-IN',
  'Tamil': 'ta-IN',
  'Gujarati': 'gu-IN',
  'Kannada': 'kn-IN'
}

export default function VoiceButton({ onTranscript, lastAiMessage, language = 'English', autoSpeak = false, isStreaming = false, messageId = null }) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [error, setError] = useState(null)
  const [lastSpokenId, setLastSpokenId] = useState(null)

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setError('Voice input not supported in this browser. Use Chrome or Edge.')
      return
    }

    const rec = new SpeechRecognition()
    rec.lang = languageToLocale[language] || 'en-IN'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.continuous = false

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      onTranscript?.(transcript)
      setIsListening(false)
    }

    rec.onerror = (e) => {
      setError(`Voice error: ${e.error}`)
      setIsListening(false)
    }

    rec.onend = () => setIsListening(false)

    rec.start()
    setRecognition(rec)
    setIsListening(true)
    setError(null)
  }, [onTranscript])

  const stopListening = useCallback(() => {
    recognition?.stop()
    setIsListening(false)
  }, [recognition])

  const speakMessage = useCallback(() => {
    if (!speechSynthesis || !lastAiMessage) return

    if (isSpeaking) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    // Clean text: remove asterisks or markdown to avoid hearing them spoken
    const cleanText = lastAiMessage.replace(/[*_#]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    const targetLocale = languageToLocale[language] || 'en-IN'
    const targetLangPrefix = targetLocale.split('-')[0]
    
    utterance.lang = targetLocale
    utterance.rate = 0.94
    utterance.pitch = 1.05
    utterance.volume = 1

    // Try to find a good localized voice
    const voices = speechSynthesis.getVoices()
    let preferred = null
    
    const premiumKeywords = ['Premium', 'Enhanced', 'Google', 'Rishi', 'Veena', 'Lekha', 'Samantha', 'Daniel']
    const findVoice = (condition) => voices.find(v => condition(v) && premiumKeywords.some(k => v.name.includes(k))) || voices.find(condition)
    
    // Hindi and Marathi share Devanagari script, so they can fallback to each other
    if (['Hindi', 'Marathi'].includes(language)) {
      preferred = findVoice(v => v.lang === targetLocale) || 
                  findVoice(v => v.lang.startsWith(targetLangPrefix)) ||
                  findVoice(v => v.lang === 'hi-IN') || 
                  findVoice(v => v.lang.startsWith('hi'))
    } else {
      // For all other languages (Gujarati, Bengali, Telugu, etc.)
      preferred = findVoice(v => v.lang === targetLocale) ||
                  findVoice(v => v.lang.startsWith(targetLangPrefix))
    }
    
    // Universal fallback if absolutely needed, but for regional scripts this will be silent
    if (!preferred) {
      preferred = voices.find(v => premiumKeywords.some(k => v.name.includes(k))) || voices[0]
      if (['Gujarati', 'Bengali', 'Tamil', 'Telugu', 'Kannada'].includes(language)) {
        setError(`⚠️ Native ${language} voice not found. Please use Chrome or select Hinglish.`)
      }
    }

    if (preferred) utterance.voice = preferred

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    speechSynthesis.speak(utterance)
  }, [lastAiMessage, isSpeaking, language])

  useEffect(() => {
    // Determine if we should auto-speak
    if (autoSpeak && lastAiMessage && !isStreaming && messageId && messageId !== lastSpokenId) {
      speakMessage()
      setLastSpokenId(messageId)
    }
  }, [autoSpeak, lastAiMessage, isStreaming, messageId, lastSpokenId, speakMessage])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {error && (
        <span style={{ fontSize: '0.75rem', color: '#f87171', maxWidth: '200px' }}>{error}</span>
      )}

      {/* Speak last AI message */}
      {lastAiMessage && (
        <button
          id="voice-speak-btn"
          onClick={speakMessage}
          title={isSpeaking ? 'Stop speaking' : 'Read last message aloud'}
          style={{
            width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isSpeaking ? 'rgba(167, 139, 250, 0.2)' : 'rgba(124, 58, 237, 0.1)',
            border: `1px solid ${isSpeaking ? 'rgba(167,139,250,0.6)' : 'rgba(124,58,237,0.3)'}`,
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: isSpeaking ? '#a78bfa' : 'var(--color-text-muted)',
          }}
        >
          {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}

      {/* Mic button */}
      <button
        id="voice-mic-btn"
        onClick={isListening ? stopListening : startListening}
        title={isListening ? 'Stop listening' : 'Speak your question'}
        style={{
          width: '40px', height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isListening
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #7c3aed, #a855f7)',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: isListening
            ? '0 0 0 4px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.4)'
            : '0 0 0 0 transparent',
          animation: isListening ? 'pulse-glow 1.5s ease-in-out infinite' : 'none',
        }}
      >
        {isListening ? <MicOff size={18} color="white" /> : <Mic size={18} color="white" />}
      </button>
    </div>
  )
}
