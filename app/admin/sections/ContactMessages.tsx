'use client'

import { useState, useEffect } from 'react'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
  adminReply?: string
  repliedAt?: string
}

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, unread, read
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchMessages()
  }, [currentPage, statusFilter, searchTerm])

  useEffect(() => {
    filterMessages()
  }, [messages, statusFilter, searchTerm])

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const res = await fetch(`/api/admin/contact?${params}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
        setTotalPages(data.totalPages)
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filterMessages = () => {
    let filtered = [...messages]
    
    if (statusFilter === 'unread') {
      filtered = filtered.filter(msg => !msg.isRead)
    } else if (statusFilter === 'read') {
      filtered = filtered.filter(msg => msg.isRead)
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(msg => 
        msg.name.toLowerCase().includes(term) ||
        msg.email.toLowerCase().includes(term) ||
        msg.subject.toLowerCase().includes(term) ||
        msg.message.toLowerCase().includes(term)
      )
    }
    
    setFilteredMessages(filtered)
  }

  const handleMessageClick = async (message: ContactMessage) => {
    setSelectedMessage(message)
    
    // Mark as read if not already read
    if (!message.isRead) {
      try {
        await fetch(`/api/admin/contact/${message.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true })
        })
        
        // Update local state
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, isRead: true } : msg
        ))
      } catch (err) {
        console.error('Error marking message as read:', err)
      }
    }
  }

  const handleReply = (message: ContactMessage) => {
    setSelectedMessage(message)
    setReplyText('')
    setShowReplyModal(true)
  }

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    try {
      const res = await fetch(`/api/admin/contact/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText })
      })

      if (res.ok) {
        setShowReplyModal(false)
        fetchMessages()
        alert('Reply sent successfully!')
      } else {
        alert('Failed to send reply')
      }
    } catch (err) {
      alert('Failed to send reply')
      console.error('Error sending reply:', err)
    }
  }

  const handleBulkAction = async (action: 'markRead' | 'markUnread' | 'delete') => {
    if (selectedMessages.size === 0) {
      alert('Please select messages first')
      return
    }

    if (action === 'delete' && !confirm('Are you sure you want to delete the selected messages?')) {
      return
    }

    try {
      const res = await fetch('/api/admin/contact/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          messageIds: Array.from(selectedMessages)
        })
      })

      if (res.ok) {
        setSelectedMessages(new Set())
        fetchMessages()
        alert(`${action === 'delete' ? 'Messages deleted' : 'Messages updated'} successfully`)
      } else {
        alert('Failed to perform bulk action')
      }
    } catch (err) {
      alert('Failed to perform bulk action')
      console.error('Error performing bulk action:', err)
    }
  }

  const handleSelectMessage = (messageId: string) => {
    const newSelected = new Set(selectedMessages)
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId)
    } else {
      newSelected.add(messageId)
    }
    setSelectedMessages(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedMessages.size === filteredMessages.length) {
      setSelectedMessages(new Set())
    } else {
      setSelectedMessages(new Set(filteredMessages.map(msg => msg.id)))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Contact Messages</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {messages.filter(m => !m.isRead).length} unread
          </span>
          <button
            onClick={fetchMessages}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedMessages.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-700">
              {selectedMessages.size} message{selectedMessages.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('markRead')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
              >
                Mark Read
              </button>
              <button
                onClick={() => handleBulkAction('markUnread')}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition"
              >
                Mark Unread
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedMessages.size === filteredMessages.length && filteredMessages.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <tr key={message.id} className={`hover:bg-gray-50 ${!message.isRead ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedMessages.has(message.id)}
                      onChange={() => handleSelectMessage(message.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      !message.isRead 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {!message.isRead ? '● Unread' : '○ Read'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className={`text-sm ${!message.isRead ? 'font-semibold text-gray-900' : 'text-gray-900'}`}>
                        {message.name}
                      </div>
                      <div className="text-sm text-gray-500">{message.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      onClick={() => handleMessageClick(message)}
                      className={`text-sm cursor-pointer hover:text-blue-600 ${
                        !message.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'
                      }`}
                    >
                      {message.subject}
                      {message.adminReply && (
                        <span className="ml-2 text-xs text-green-600">
                          ↩ Replied
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(message.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleMessageClick(message)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleReply(message)}
                        className="text-green-600 hover:text-green-900 text-sm"
                      >
                        Reply
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && !showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Message Details</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <p className="text-sm text-gray-900">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-900">{selectedMessage.email}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <p className="text-sm text-gray-900">{selectedMessage.subject}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Received</label>
                <p className="text-sm text-gray-500">{formatDate(selectedMessage.createdAt)}</p>
              </div>

              {selectedMessage.adminReply && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Reply</label>
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.adminReply}</p>
                    {selectedMessage.repliedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Replied on {formatDate(selectedMessage.repliedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => handleReply(selectedMessage)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                {selectedMessage.adminReply ? 'Reply Again' : 'Reply'}
              </button>
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Reply to {selectedMessage.name}</h3>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Message</label>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                  <strong>Subject:</strong> {selectedMessage.subject}<br />
                  <div className="mt-2">{selectedMessage.message}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={8}
                  placeholder="Type your reply here..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowReplyModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredMessages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📧</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
          <p className="text-gray-500">
            {statusFilter === 'unread' ? 'No unread messages' :
             statusFilter === 'read' ? 'No read messages' :
             searchTerm ? 'Try adjusting your search terms' :
             'Contact messages will appear here when submitted'}
          </p>
        </div>
      )}
    </div>
  )
}