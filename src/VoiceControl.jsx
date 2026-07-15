import { useRef, useState } from 'react'

function VoiceControl({ text, disabled, onTranscript }) {
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const utteranceRef = useRef(null)

  const stopSpeaking = () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }
    utteranceRef.current = null
    setSpeaking(false)
  }

  const handleSpeak = () => {
    if (!text) {
      setError('No text available to speak')
      return
    }

    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      setError('Browser speech synthesis is not supported')
      return
    }

    if (speaking) {
      stopSpeaking()
      return
    }

    setError(null)
    setSpeaking(true)

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.onend = () => {
      setSpeaking(false)
      utteranceRef.current = null
    }
    utterance.onerror = () => {
      setError('Voice playback error')
      setSpeaking(false)
      utteranceRef.current = null
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const stopListening = () => {
    const recognition = recognitionRef.current
    if (recognition) {
      recognition.stop()
      recognitionRef.current = null
    }
    setListening(false)
  }

  const handleListen = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setError('Speech recognition is not supported by this browser')
      return
    }

    if (listening) {
      stopListening()
      return
    }

    setError(null)
    setListening(true)

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      if (typeof onTranscript === 'function') {
        onTranscript(transcript)
      }
    }

    recognition.onerror = () => {
      setError('Voice recognition error')
      setListening(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }

    recognition.start()
    recognitionRef.current = recognition
  }

  return (
    <div className="voiceControls">
      <button type="button" onClick={handleSpeak} disabled={disabled || !text}>
        {speaking ? 'Stop speaking' : 'Speak Response'}
      </button>
      <button type="button" onClick={handleListen} disabled={disabled}>
        {listening ? 'Stop listening' : 'Voice Input'}
      </button>
      {error && <p className="voiceError">{error}</p>}
    </div>
  )
}

export default VoiceControl
