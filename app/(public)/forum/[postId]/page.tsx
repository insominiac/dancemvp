'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Eye, Lock, Pin, Send, Check, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Post {
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
  }
  replies: Reply[]
  _count: {
    replies: number
  }
}

interface Reply {
  id: string
  content: string
  isSolution: boolean
  createdAt: string
  user: {
    id: string
    fullName: string
    email: string
    profileImage?: string
  }
  replies?: Reply[]
}

export default function ForumPostPage({ params }: { params: { postId: string } }) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [params.postId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/forum/posts/${params.postId}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
      } else {
        toast.error('Failed to load post')
        router.push('/forum')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      toast.error('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Please enter a reply')
      return
    }

    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/forum/${params.postId}`)
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/forum/posts/${params.postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent,
          parentId: replyingTo,
        }),
      })

      if (response.ok) {
        toast.success('Reply posted!')
        setReplyContent('')
        setReplyingTo(null)
        fetchPost() // Refresh the post
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to post reply')
      }
    } catch (error) {
      console.error('Error posting reply:', error)
      toast.error('Failed to post reply')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const response = await fetch(`/api/forum/posts/${params.postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Post deleted')
        router.push('/forum')
      } else {
        toast.error('Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
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

  const renderReply = (reply: Reply, depth = 0) => (
    <div key={reply.id} className={depth > 0 ? 'ml-12 mt-4' : ''}>
      <div className="bg-white rounded-lg shadow-sm p-4">
        {reply.isSolution && (
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-green-600 font-medium">Solution</span>
          </div>
        )}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <img
              src={reply.user.profileImage || '/default-avatar.png'}
              alt={reply.user.fullName}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{reply.user.fullName}</span>
                <span className="text-sm text-gray-500">{formatDate(reply.createdAt)}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
              {!post?.isLocked && (
                <button
                  onClick={() => setReplyingTo(reply.id)}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                >
                  Reply
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {reply.replies && reply.replies.length > 0 && (
        <div className="mt-2">
          {reply.replies.map((subReply) => renderReply(subReply, depth + 1))}
        </div>
      )}
      {replyingTo === reply.id && (
        <div className="mt-4 ml-12">
          <div className="bg-gray-50 p-4 rounded-lg">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setReplyingTo(null)
                  setReplyContent('')
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={submitting || !replyContent.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Post not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/forum"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Forum
        </Link>

        {/* Post */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {post.isPinned && (
                  <div className="flex items-center gap-1 text-orange-500">
                    <Pin className="w-4 h-4" />
                    <span className="text-sm font-medium">Pinned</span>
                  </div>
                )}
                {post.isLocked && (
                  <div className="flex items-center gap-1 text-red-500">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">Locked</span>
                  </div>
                )}
                <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  {post.category}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
            </div>
            {user?.id === post.user.id && (
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
                title="Delete post"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <img
              src={post.user.profileImage || '/default-avatar.png'}
              alt={post.user.fullName}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium">{post.user.fullName}</p>
              <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
            <div className="ml-auto flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.viewsCount} views</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{post._count.replies} replies</span>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-gray-700">{post.content}</p>
          </div>
        </div>

        {/* Replies */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Replies ({post._count.replies})
          </h2>
          {post.replies.length === 0 ? (
            <p className="text-gray-500">No replies yet. Be the first to respond!</p>
          ) : (
            <div className="space-y-4">
              {post.replies.map((reply) => renderReply(reply))}
            </div>
          )}
        </div>

        {/* Reply form */}
        {!post.isLocked ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Post a Reply</h3>
            {isAuthenticated ? (
              <>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={5}
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleReply}
                    disabled={submitting || !replyContent.trim()}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? 'Posting...' : 'Post Reply'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">You need to be logged in to reply</p>
                <Link
                  href={`/login?callbackUrl=/forum/${params.postId}`}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Login to Reply
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <Lock className="w-5 h-5" />
              <p>This post is locked and no longer accepting replies.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}