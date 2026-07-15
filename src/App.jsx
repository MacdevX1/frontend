import { useEffect, useState } from 'react'
import MyContext from './MyContext.jsx'
import ChatWindow from './ChatWindow.jsx'
import Sidebar from './Sidebar.jsx'
import Auth from './Auth.jsx'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://ec2-3-104-37-144.ap-southeast-2.compute.amazonaws.com:3000/api'

function App() {
  const [threads, setThreads] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth > 1024 : true))
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark'
  })
  const [responseStyle, setResponseStyle] = useState('balanced')

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', theme === 'light')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleSidebar = () => setSidebarOpen((open) => !open)
  const closeSidebar = () => setSidebarOpen(false)

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 1024)
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const fetchThreads = async () => {
    try {
      const response = await fetch(`${API_BASE}/thread`, {
        credentials: 'include'
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to load chats')
      }

      setThreads(data)
      setActiveThread(data.length > 0 ? data[0] : null)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch(`${API_BASE}/me`, {
          credentials: 'include'
        })

        const data = await response.json()
        if (response.ok) {
          setUser(data.user)
          await fetchThreads()
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setAuthChecked(true)
      }
    }

    verifySession()
  }, [])

  const handleAuthenticated = async (authenticatedUser) => {
    setUser(authenticatedUser)
    setAuthChecked(true)
    await fetchThreads()
  }

  const handleSelectThread = (threadId) => {
    const thread = threads.find((item) => item.threadId === threadId)
    if (thread) {
      setActiveThread(thread)
      setDraft('')
      setError(null)
    }
  }

  const handleNewChat = () => {
    setActiveThread(null)
    setDraft('')
    setError(null)
  }

  const handleDeleteThread = async (threadId) => {
    try {
      const response = await fetch(`${API_BASE}/thread/${threadId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.error || 'Could not delete the chat')
      }

      setThreads((prev) => prev.filter((item) => item.threadId !== threadId))
      if (activeThread?.threadId === threadId) {
        setActiveThread(null)
        setDraft('')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSendMessage = async () => {
    const message = draft.trim()
    if (!message) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          threadId: activeThread?.threadId,
          message,
          mode: responseStyle
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to send message')
      }

      const nextThread = data.thread
      setDraft('')
      setActiveThread(nextThread)
      setThreads((prev) => [nextThread, ...prev.filter((thread) => thread.threadId !== nextThread.threadId)])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (err) {
      console.warn('Logout failed', err)
    } finally {
      setUser(null)
      setThreads([])
      setActiveThread(null)
      setDraft('')
      setError(null)
    }
  }

  const handleTranscript = (transcript) => {
    setDraft(transcript)
  }

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }

  const providerValue = {
    user,
    threads,
    activeThread,
    draft,
    loading,
    error,
    responseStyle,
    setResponseStyle,
    handleSelectThread,
    handleNewChat,
    handleDeleteThread,
    setDraft,
    handleSendMessage,
    handleLogout,
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
    setTheme,
    theme,
    toggleTheme,
    handleTranscript
  }

  if (!authChecked) {
    return (
      <div className="loadingScreen">
        <p>Checking session…</p>
      </div>
    )
  }

  if (!user) {
    return <Auth onAuthenticated={handleAuthenticated} />
  }

  return (
    <div className="main">
      <MyContext.Provider value={providerValue}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  )
}

export default App
