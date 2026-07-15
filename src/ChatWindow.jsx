import { useContext } from 'react'
import './ChatWindow.css'
import Chat from './Chat.jsx'
import MyContext from './MyContext.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import VoiceControl from './VoiceControl.jsx'

function ChatWindow() {
  const {
    user,
    activeThread,
    draft,
    setDraft,
    handleSendMessage,
    loading,
    error,
    responseStyle,
    setResponseStyle,
    theme,
    toggleTheme,
    handleLogout,
    handleTranscript,
    toggleSidebar
  } = useContext(MyContext)

  const chatTitle = activeThread?.title || 'New conversation'
  const latestAssistantMessage = activeThread?.messages
    ?.slice()
    .reverse()
    .find((message) => message.role === 'assistant')?.content

  return (
    <div className="chatWindow">
      <div className="navbar">
        <div>
          <span className="chatTitle">{chatTitle}</span>
          <p className="chatSubtitle">AI assistant powered by Gemini</p>
          <p className="userLabel">Signed in as {user?.email}</p>
        </div>

        <div className="navbarActions">
          <button type="button" className="sidebarToggleButton" onClick={toggleSidebar}>
            <i className="fa-solid fa-bars"></i>
            <span>Chats</span>
          </button>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button type="button" className="logoutButton" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>

      <div className="chatControls">
        <label className="selectLabel">
          Response style
          <select value={responseStyle} onChange={(event) => setResponseStyle(event.target.value)}>
            <option value="balanced">Balanced</option>
            <option value="creative">Creative</option>
            <option value="precise">Precise</option>
          </select>
        </label>

        <VoiceControl text={latestAssistantMessage} disabled={loading} onTranscript={handleTranscript} />
      </div>

      {error ? (
        <div className="statusBanner">
          <span className="statusIcon">!</span>
          <p>{error}</p>
        </div>
      ) : null}

      <Chat />

      <div className="chatInput">
        <div className="userInput">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Ask anything..."
            disabled={loading}
          />

          <button id="submit" type="button" onClick={handleSendMessage} disabled={loading || draft.trim() === ''}>
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
          </button>
        </div>

        {error ? <p className="errorMessage">{error}</p> : null}

        <p className="info">
          Abhigpt can make mistakes. Check important info. See Cookie Preferences.
        </p>
      </div>
    </div>
  )
}

export default ChatWindow
