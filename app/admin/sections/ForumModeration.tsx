'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Pin, 
  Lock, 
  Unlock,
  Trash2, 
  Search, 
  Filter,
  Check,
  AlertTriangle,
  Eye,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings,
  MoreVertical
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ForumPost {
  id: string
  title: string
  content: string
  category: string
  viewsCount: number
  isPinned: boolean
  isLocked: boolean
  createdAt: string
  user: {
    id: string
    fullName: string
    email: string
    profileImage?: string
    role: string
  }
  _count: {
    replies: number
  }
}

interface ForumReply {
  id: string
  content: string
  isSolution: boolean
  createdAt: string
  user: {
    id: string
    fullName: string
    email: string
    profileImage?: string
    role: string
  }
  post: {
    id: string
    title: string
    category: string
  }
  parent?: {
    id: string
    content: string
  }
  _count: {
    replies: number
  }
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'general', label: 'General Discussion' },
  { value: 'technique', label: 'Dance Techniques' },
  { value: 'events', label: 'Events & Socials' },
  { value: 'partners', label: 'Partner Search' },
  { value: 'music', label: 'Music & Playlists' },
  { value: 'beginners', label: 'Beginners Corner' },
]

export default function ForumModeration() {
  const [activeTab, setActiveTab] = useState<'posts' | 'replies'>('posts')
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts()
    } else {
      fetchReplies()
    }
  }, [activeTab, searchTerm, selectedCategory, selectedStatus, currentPage])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)

      const response = await fetch(`/api/admin/forum/posts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
        setTotalPages(data.pagination.totalPages)
      } else {
        toast.error('Failed to fetch forum posts')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to fetch forum posts')
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })
      
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/admin/forum/replies?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReplies(data.replies)
        setTotalPages(data.pagination.totalPages)
      } else {
        toast.error('Failed to fetch forum replies')
      }
    } catch (error) {
      console.error('Error fetching replies:', error)
      toast.error('Failed to fetch forum replies')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      toast.error('Please select items first')
      return
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedItems.length} ${activeTab}?`)) {
      return
    }

    try {
      const endpoint = activeTab === 'posts' ? '/api/admin/forum/posts' : '/api/admin/forum/replies'
      const body = activeTab === 'posts' 
        ? { action, postIds: selectedItems }
        : { action, replyIds: selectedItems }

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        setSelectedItems([])
        if (activeTab === 'posts') {
          fetchPosts()
        } else {
          fetchReplies()
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Action failed')
      }
    } catch (error) {
      console.error('Bulk action error:', error)
      toast.error('Action failed')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const selectAllItems = () => {
    const allIds = activeTab === 'posts' 
      ? posts.map(post => post.id)
      : replies.map(reply => reply.id)
    setSelectedItems(allIds)
  }

  const clearSelection = () => {
    setSelectedItems([])
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Forum Moderation</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('posts')
              setCurrentPage(1)
              setSelectedItems([])
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'posts'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Forum Posts
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('replies')
              setCurrentPage(1)
              setSelectedItems([])
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'replies'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Replies
            </div>
          </button>
        </nav>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          {activeTab === 'posts' && (
            <>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pinned">Pinned</option>
                <option value="locked">Locked</option>
                <option value="normal">Normal</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-purple-700 font-medium">
              {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              {activeTab === 'posts' ? (
                <>
                  <button
                    onClick={() => handleBulkAction('pin')}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm"
                  >
                    Pin
                  </button>
                  <button
                    onClick={() => handleBulkAction('unpin')}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm"
                  >
                    Unpin
                  </button>
                  <button
                    onClick={() => handleBulkAction('lock')}
                    className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm"
                  >
                    Lock
                  </button>
                  <button
                    onClick={() => handleBulkAction('unlock')}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                  >
                    Unlock
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleBulkAction('markSolution')}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                  >
                    Mark Solution
                  </button>
                  <button
                    onClick={() => handleBulkAction('unmarkSolution')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                  >
                    Unmark Solution
                  </button>
                </>
              )}
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
              >
                Delete
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              {activeTab === 'posts' ? 'Forum Posts' : 'Forum Replies'}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={selectedItems.length === 0 ? selectAllItems : clearSelection}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                {selectedItems.length === 0 ? 'Select All' : 'Clear Selection'}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : activeTab === 'posts' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={selectedItems.length === posts.length ? clearSelection : selectAllItems}
                      checked={posts.length > 0 && selectedItems.length === posts.length}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className={selectedItems.includes(post.id) ? 'bg-purple-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(post.id)}
                        onChange={() => toggleSelectItem(post.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {post.category}
                          </span>
                          {post.isPinned && <Pin className="w-4 h-4 text-orange-500" />}
                          {post.isLocked && <Lock className="w-4 h-4 text-red-500" />}
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{post.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {post.content.substring(0, 100)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={post.user.profileImage || '/default-avatar.png'}
                          alt={post.user.fullName}
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{post.user.fullName}</p>
                          <p className="text-xs text-gray-500">{post.user.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.viewsCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{post._count.replies}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {post.isPinned && (
                          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">Pinned</span>
                        )}
                        {post.isLocked && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Locked</span>
                        )}
                        {!post.isPinned && !post.isLocked && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Normal</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(post.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {posts.length === 0 && (
              <div className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No forum posts found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={selectedItems.length === replies.length ? clearSelection : selectAllItems}
                      checked={replies.length > 0 && selectedItems.length === replies.length}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reply
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {replies.map((reply) => (
                  <tr key={reply.id} className={selectedItems.includes(reply.id) ? 'bg-purple-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(reply.id)}
                        onChange={() => toggleSelectItem(reply.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {reply.isSolution && (
                          <div className="flex items-center gap-1 mb-1">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-600 font-medium">Solution</span>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 line-clamp-3">
                          {reply.content.substring(0, 150)}...
                        </p>
                        {reply.parent && (
                          <p className="text-xs text-purple-600 mt-1">
                            ↳ Reply to: {reply.parent.content.substring(0, 50)}...
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{reply.post.title}</p>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {reply.post.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={reply.user.profileImage || '/default-avatar.png'}
                          alt={reply.user.fullName}
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{reply.user.fullName}</p>
                          <p className="text-xs text-gray-500">{reply.user.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {reply.isSolution && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Solution</span>
                        )}
                        {reply._count.replies > 0 && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                            {reply._count.replies} replies
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(reply.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {replies.length === 0 && (
              <div className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No forum replies found</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
