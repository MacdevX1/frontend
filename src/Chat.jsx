import { useContext, useEffect, useMemo, useRef } from 'react'
import './Chat.css'
import MyContext from './MyContext.jsx'

function Chat() {
  const { activeThread } = useContext(MyContext)
  const messages = useMemo(() => activeThread?.messages ?? [], [activeThread?.messages])
  const scrollRef = useRef(null)

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const sanitizeMessage = (message) => {
    if (typeof message !== 'string') return message

    return message
      .replace(/(^|\n)#{1,6}\s*/g, '$1')
      .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
      .replace(/\$([^$\n]+)\$/g, '$1')
      .replace(/\\\(([^)]+)\\\)/g, '$1')
      .replace(/\\\[([^\]]+)\\\]/g, '$1')
      .replace(/\\begin\{[^}]+\}|\\end\{[^}]+\}/g, '')
      .replace(/\\left|\\right/g, '')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
      .replace(/\\cdot/g, '*')
      .replace(/\\(sin|cos|tan|csc|sec|cot|log|ln|exp|arcsin|arccos|arctan)\b/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\{\s*([^}]+)\s*\}/g, '$1')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="chat">
      <div className="chatMessages">
        {messages.length > 0 &&
          messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`chatMessage ${message.role}`}>
              <div className="messageMeta">
                <span className="messageIcon">
                  <i className={message.role === 'user' ? 'fa-solid fa-user' : 'fa-solid fa-robot'} />
                </span>
                <div>
                  <div className="messageRole">{message.role === 'user' ? 'You' : 'Abhigpt'}</div>
                  {message.timestamp ? <div className="messageTime">{formatTime(message.timestamp)}</div> : null}
                </div>
              </div>
              <p>{sanitizeMessage(message.content)}</p>
            </div>
          ))}
        <div ref={scrollRef} />
      </div>
    </div>
  )
}

export default Chat
