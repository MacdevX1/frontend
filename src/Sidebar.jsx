import { useContext, useState } from 'react'
import './Sidebar.css'
import logo from './assets/blackLogo.png'
import MyContext from './MyContext.jsx'

function Sidebar() {
  const { threads, activeThread, handleNewChat, handleSelectThread, handleDeleteThread, sidebarOpen, closeSidebar } = useContext(MyContext)
  const [historyOpen, setHistoryOpen] = useState(true)

  const renderPreview = (thread) => {
    const lastMessage = thread.messages?.[thread.messages.length - 1]
    if (!lastMessage) {
      return 'Start the conversation'
    }
    const text = lastMessage.content.replace(/\s+/g, ' ').trim()
    return text.length > 64 ? `${text.slice(0, 61)}...` : text
  }

  return (
    <>
      <div className={`sidebarBackdrop ${sidebarOpen ? 'visible' : ''}`} onClick={closeSidebar} />
      <section className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button type="button" className="sidebarCloseButton" onClick={closeSidebar}>
          <i className="fa-solid fa-chevron-left"></i>
          <span>Chats</span>
        </button>

        <button className="newChatButton" type="button" onClick={handleNewChat}>
          <div className="logoWrap">
            <img src={logo} alt="GPT logo" className="logo" />
          </div>
          <span>New Chat</span>
          <i className="fa-solid fa-plus"></i>
        </button>

      <div className="historyWrapper">
        <div className="historyHeader" onClick={() => setHistoryOpen((open) => !open)}>
          <span>Previous chats</span>
          <i className={`fa-solid fa-chevron-down ${historyOpen ? 'open' : ''}`} />
        </div>

        {historyOpen && (
          <ul className="history">
            {threads.length === 0 ? (
              <li className="emptyState">No chats yet. Start a new conversation.</li>
            ) : (
              threads.map((thread) => (
                <li
                  key={thread.threadId}
                  className={activeThread?.threadId === thread.threadId ? 'active' : ''}
                >
                  <div className="threadRow">
                    <button type="button" className="threadButton" onClick={() => handleSelectThread(thread.threadId)}>
                      <span className="threadTitle">{thread.title || 'New Chat'}</span>
                      <span className="threadPreview">{renderPreview(thread)}</span>
                    </button>

                    <button type="button" className="deleteThread" onClick={() => handleDeleteThread(thread.threadId)} aria-label="Delete chat">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <div className="sign">
        <p>By Abhinav Santosh &hearts;</p>
      </div>
    </section>
    </>
  )
}

export default Sidebar
