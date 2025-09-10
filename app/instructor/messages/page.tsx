'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  threadId: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
  readBy: string[]
}

interface MessageThread {
  id: string
  type: 'DIRECT' | 'CLASS'
  title: string
  classTitle?: string
  participants: Array<{
    id: string
    name: string
    role: 'INSTRUCTOR' | 'STUDENT'
  }>
  lastMessage: Message | null
  unreadCount: number
  createdAt: string
}

export default function InstructorMessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [activeThread, setActiveThread] = useState<MessageThread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'direct' | 'class'>('all')
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const instructorId = 'demo-instructor-1'

  // Demo data
  const demoThreads: MessageThread[] = [
    {
      id: 'thread-1',
      type: 'DIRECT',
      title: 'Sarah Martinez',
      participants: [
        { id: 'demo-instructor-1', name: 'Maria Rodriguez', role: 'INSTRUCTOR' },
        { id: 'student-1', name: 'Sarah Martinez', role: 'STUDENT' }
      ],
      lastMessage: {
        id: 'msg-1',
        threadId: 'thread-1',
        senderId: 'student-1',
        senderName: 'Sarah Martinez',
        content: 'Hi! I have a question about the salsa steps we learned today.',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        readBy: []
      },
      unreadCount: 1,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'thread-2',
      type: 'CLASS',
      title: 'Beginner Salsa - Class Announcement',
      classTitle: 'Beginner Salsa',
      participants: [
        { id: 'demo-instructor-1', name: 'Maria Rodriguez', role: 'INSTRUCTOR' },
        { id: 'student-1', name: 'Sarah Martinez', role: 'STUDENT' },
        { id: 'student-2', name: 'Alex Thompson', role: 'STUDENT' },
        { id: 'student-3', name: 'Emma Wilson', role: 'STUDENT' }
      ],
      lastMessage: {
        id: 'msg-2',
        threadId: 'thread-2',
        senderId: 'demo-instructor-1',
        senderName: 'Maria Rodriguez',
        content: 'Don\'t forget to bring comfortable shoes for tomorrow\'s class!',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        readBy: ['demo-instructor-1', 'student-1']
      },
      unreadCount: 0,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'thread-3',
      type: 'DIRECT',
      title: 'Alex Thompson',
      participants: [
        { id: 'demo-instructor-1', name: 'Maria Rodriguez', role: 'INSTRUCTOR' },
        { id: 'student-2', name: 'Alex Thompson', role: 'STUDENT' }
      ],
      lastMessage: {
        id: 'msg-3',
        threadId: 'thread-3',
        senderId: 'demo-instructor-1',
        senderName: 'Maria Rodriguez',
        content: 'Great progress in today\'s class! Keep practicing those turns.',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        readBy: ['demo-instructor-1', 'student-2']
      },
      unreadCount: 0,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  const demoMessages: { [threadId: string]: Message[] } = {
    'thread-1': [
      {
        id: 'msg-1-1',
        threadId: 'thread-1',
        senderId: 'student-1',
        senderName: 'Sarah Martinez',
        content: 'Hi Maria! I had a great time in class today.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        readBy: ['demo-instructor-1']
      },
      {
        id: 'msg-1-2',
        threadId: 'thread-1',
        senderId: 'demo-instructor-1',
        senderName: 'Maria Rodriguez',
        content: 'I\'m so glad you enjoyed it! You\'re making great progress.',
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        readBy: ['student-1']
      },
      {
        id: 'msg-1',
        threadId: 'thread-1',
        senderId: 'student-1',
        senderName: 'Sarah Martinez',
        content: 'Hi! I have a question about the salsa steps we learned today.',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        readBy: []
      }
    ],
    'thread-2': [
      {
        id: 'msg-2-1',
        threadId: 'thread-2',
        senderId: 'demo-instructor-1',
        senderName: 'Maria Rodriguez',
        content: 'Hello everyone! Great class today. Remember to practice the basic steps we covered.',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        readBy: ['demo-instructor-1', 'student-1', 'student-2']
      },
      {
        id: 'msg-2',
        threadId: 'thread-2',
        senderId: 'demo-instructor-1',
        senderName: 'Maria Rodriguez',
        content: 'Don\'t forget to bring comfortable shoes for tomorrow\'s class!',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        readBy: ['demo-instructor-1', 'student-1']
      }
    ],
    'thread-3': [
      {
        id: 'msg-3-1',
        threadId: 'thread-3',
        senderId: 'student-2',
        senderName: 'Alex Thompson',
        content: 'Thanks for the extra help today with the spins!',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        readBy: ['demo-instructor-1']
      },
      {
        id: 'msg-3',
        threadId: 'thread-3',
        senderId: 'demo-instructor-1',
        senderName: 'Maria Rodriguez',
        content: 'Great progress in today\'s class! Keep practicing those turns.',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        readBy: ['demo-instructor-1', 'student-2']
      }
    ]
  }

  useEffect(() => {
    // Simulate loading threads
    setTimeout(() => {
      setThreads(demoThreads)
      setIsLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const filteredThreads = threads.filter(thread => {
    if (filter === 'all') return true
    if (filter === 'direct') return thread.type === 'DIRECT'
    if (filter === 'class') return thread.type === 'CLASS'
    return true
  })

  const handleThreadSelect = (thread: MessageThread) => {
    setActiveThread(thread)
    setMessages(demoMessages[thread.id] || [])
    
    // Mark as read (simulate API call)
    if (thread.unreadCount > 0) {
      setThreads(prev => prev.map(t => 
        t.id === thread.id ? { ...t, unreadCount: 0 } : t
      ))
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeThread) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      threadId: activeThread.id,
      senderId: instructorId,
      senderName: 'Maria Rodriguez',
      content: newMessage,
      createdAt: new Date().toISOString(),
      readBy: [instructorId]
    }

    // Add message to current thread
    setMessages(prev => [...prev, message])
    
    // Update thread's last message
    setThreads(prev => prev.map(thread => 
      thread.id === activeThread.id 
        ? { ...thread, lastMessage: message }
        : thread
    ))

    setNewMessage('')

    // In real app, would call API here
    // await fetch('/api/instructor/messages/send', { ... })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays}d ago`
    } else if (diffHours > 0) {
      return `${diffHours}h ago`
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return diffMins > 0 ? `${diffMins}m ago` : 'now'
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Threads List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <button 
              onClick={() => setShowNewMessageModal(true)}
              className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
            >
              + New
            </button>
          </div>
          
          {/* Filter tabs */}
          <div className="flex space-x-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'direct', label: 'Direct' },
              { key: 'class', label: 'Class' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-3 py-2 text-sm rounded-md transition ${
                  filter === tab.key
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Threads */}
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => handleThreadSelect(thread)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                activeThread?.id === thread.id ? 'bg-purple-50 border-purple-200' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-sm mr-2">
                    {thread.type === 'CLASS' ? '👥' : '💬'}
                  </span>
                  <h3 className="font-medium text-gray-900 truncate">{thread.title}</h3>
                </div>
                {thread.unreadCount > 0 && (
                  <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
              
              {thread.classTitle && (
                <p className="text-xs text-purple-600 mb-1">📚 {thread.classTitle}</p>
              )}
              
              {thread.lastMessage && (
                <div className="flex justify-between items-end">
                  <p className="text-sm text-gray-600 truncate flex-1 mr-2">
                    {thread.lastMessage.senderName === 'Maria Rodriguez' ? 'You: ' : ''}
                    {thread.lastMessage.content}
                  </p>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatTime(thread.lastMessage.createdAt)}
                  </span>
                </div>
              )}
              
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">
                  {thread.participants.length} participant{thread.participants.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeThread ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{activeThread.title}</h2>
                  <p className="text-sm text-gray-600">
                    {activeThread.type === 'CLASS' ? 'Class Group' : 'Direct Message'} • 
                    {activeThread.participants.length} participant{activeThread.participants.length > 1 ? 's' : ''}
                  </p>
                </div>
                <button className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm">
                  ⚙️ Settings
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === instructorId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === instructorId
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}>
                    {message.senderId !== instructorId && (
                      <p className="text-xs text-gray-600 mb-1 font-medium">
                        {message.senderName}
                      </p>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === instructorId ? 'text-purple-200' : 'text-gray-500'
                    }`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Message ${activeThread.type === 'CLASS' ? 'class' : activeThread.title}...`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl mb-4 block">💬</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a thread to start messaging your students</p>
            </div>
          </div>
        )}
      </div>

      {/* New Message Modal (placeholder) */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New Message</h3>
            <p className="text-gray-600 mb-4">
              New message creation coming soon! You'll be able to:
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• Start direct messages with students</li>
              <li>• Send class announcements</li>
              <li>• Search for students by name</li>
            </ul>
            <div className="flex justify-end">
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
