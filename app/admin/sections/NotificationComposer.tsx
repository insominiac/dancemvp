'use client'

import React, { useState, useEffect } from 'react'
import { Send, Users, Calendar, Clock, AlertTriangle, Save, FileText, X } from 'lucide-react'

interface NotificationTemplate {
  id: string
  name: string
  title: string
  message: string
  type: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
}

interface User {
  id: string
  fullName: string
  email: string
  role: string
}

interface NotificationComposerProps {
  onSent: () => void
}

export default function NotificationComposer({ onSent }: NotificationComposerProps) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'SYSTEM_ANNOUNCEMENT',
    priority: 'NORMAL' as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
    actionUrl: '',
    scheduledFor: '',
    recipients: 'all' as 'all' | 'users' | 'instructors' | 'custom'
  })
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showUserSelector, setShowUserSelector] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState('')

  const notificationTypes = [
    { value: 'SYSTEM_ANNOUNCEMENT', label: 'System Announcement' },
    { value: 'CLASS_REMINDER', label: 'Class Reminder' },
    { value: 'EVENT_REMINDER', label: 'Event Reminder' },
    { value: 'BOOKING_CONFIRMATION', label: 'Booking Confirmation' },
    { value: 'PAYMENT_CONFIRMATION', label: 'Payment Confirmation' },
    { value: 'INSTRUCTOR_MESSAGE', label: 'Instructor Message' },
    { value: 'MAINTENANCE_NOTICE', label: 'Maintenance Notice' }
  ]

  const priorities = [
    { value: 'LOW', label: 'Low', color: 'text-gray-600 bg-gray-50' },
    { value: 'NORMAL', label: 'Normal', color: 'text-blue-600 bg-blue-50' },
    { value: 'HIGH', label: 'High', color: 'text-orange-600 bg-orange-50' },
    { value: 'URGENT', label: 'Urgent', color: 'text-red-600 bg-red-50' }
  ]

  const recipientOptions = [
    { value: 'all', label: 'All Users', icon: Users },
    { value: 'users', label: 'Students Only', icon: Users },
    { value: 'instructors', label: 'Instructors Only', icon: Users },
    { value: 'custom', label: 'Custom Selection', icon: Users }
  ]

  // Fetch templates and users
  const fetchData = async () => {
    try {
      const [templatesRes, usersRes] = await Promise.all([
        fetch('/api/admin/notifications/templates'),
        fetch('/api/admin/users?limit=1000&select=id,fullName,email,role')
      ])

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json()
        setTemplates(templatesData.templates || [])
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  // Apply template
  const applyTemplate = (template: NotificationTemplate) => {
    setFormData({
      ...formData,
      title: template.title,
      message: template.message,
      type: template.type,
      priority: template.priority
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let targetUserIds: string[] = []

      switch (formData.recipients) {
        case 'all':
          targetUserIds = users.map(u => u.id)
          break
        case 'users':
          targetUserIds = users.filter(u => u.role === 'USER').map(u => u.id)
          break
        case 'instructors':
          targetUserIds = users.filter(u => u.role === 'INSTRUCTOR').map(u => u.id)
          break
        case 'custom':
          targetUserIds = selectedUsers
          break
      }

      if (targetUserIds.length === 0) {
        throw new Error('No recipients selected')
      }

      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          userIds: targetUserIds,
          scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send notification')
      }

      const result = await response.json()
      setSuccess(`Notification sent successfully to ${result.recipientCount} users`)
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'SYSTEM_ANNOUNCEMENT',
        priority: 'NORMAL',
        actionUrl: '',
        scheduledFor: '',
        recipients: 'all'
      })
      setSelectedUsers([])
      
      // Refresh parent data
      onSent()

    } catch (err: any) {
      console.error('Error sending notification:', err)
      setError(err.message || 'Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  // Save as template
  const saveAsTemplate = async () => {
    if (!formData.title || !formData.message) {
      setError('Title and message are required to save as template')
      return
    }

    setSaving(true)
    try {
      const templateName = prompt('Enter template name:')
      if (!templateName) return

      const response = await fetch('/api/admin/notifications/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: templateName,
          title: formData.title,
          message: formData.message,
          type: formData.type,
          priority: formData.priority
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save template')
      }

      setSuccess('Template saved successfully')
      await fetchData() // Refresh templates
    } catch (err: any) {
      setError(err.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  // Filter users for search
  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  )

  useEffect(() => {
    fetchData()
  }, [])

  const getRecipientCount = () => {
    switch (formData.recipients) {
      case 'all': return users.length
      case 'users': return users.filter(u => u.role === 'USER').length
      case 'instructors': return users.filter(u => u.role === 'INSTRUCTOR').length
      case 'custom': return selectedUsers.length
      default: return 0
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Send className="w-5 h-5 mr-2" />
            Compose Notification
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Create and send notifications to users
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Templates Section */}
          {templates.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Quick Templates
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {templates.slice(0, 6).map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="text-left p-3 bg-white rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-sm text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1 truncate">{template.title}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {notificationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter notification title..."
              required
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 characters
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter notification message..."
              required
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.message.length}/500 characters
            </div>
          </div>

          {/* Action URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action URL (Optional)
            </label>
            <input
              type="url"
              value={formData.actionUrl}
              onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/action"
            />
            <div className="text-xs text-gray-500 mt-1">
              URL to redirect users when they click the notification
            </div>
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipients ({getRecipientCount()} users)
            </label>
            <div className="space-y-3">
              {recipientOptions.map((option) => {
                const Icon = option.icon
                return (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="recipients"
                      value={option.value}
                      checked={formData.recipients === option.value}
                      onChange={(e) => setFormData({ ...formData, recipients: e.target.value as any })}
                      className="text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <Icon className="w-4 h-4 ml-3 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                )
              })}
            </div>

            {/* Custom User Selection */}
            {formData.recipients === 'custom' && (
              <div className="mt-4 p-4 border border-gray-200 rounded-md">
                <button
                  type="button"
                  onClick={() => setShowUserSelector(!showUserSelector)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Select Users ({selectedUsers.length} selected)
                </button>

                {showUserSelector && (
                  <div className="mt-4 border border-gray-200 rounded-md max-h-64 overflow-hidden">
                    <div className="p-3 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-1 text-sm"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredUsers.map((user) => (
                        <label key={user.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.id])
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                              }
                            }}
                            className="text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-xs text-gray-500">{user.email} • {user.role}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scheduling */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              min={new Date().toISOString().slice(0, 16)}
            />
            <div className="text-xs text-gray-500 mt-1">
              Leave empty to send immediately
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-sm text-green-800">{success}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={saveAsTemplate}
              disabled={saving || !formData.title || !formData.message}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save as Template
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    title: '',
                    message: '',
                    type: 'SYSTEM_ANNOUNCEMENT',
                    priority: 'NORMAL',
                    actionUrl: '',
                    scheduledFor: '',
                    recipients: 'all'
                  })
                  setSelectedUsers([])
                  setError(null)
                  setSuccess(null)
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading || getRecipientCount() === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {formData.scheduledFor ? 'Schedule Notification' : 'Send Now'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}