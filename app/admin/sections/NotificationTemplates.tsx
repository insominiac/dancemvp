'use client'

import React, { useState, useEffect } from 'react'
import { FileText, Plus, Edit, Trash2, Copy, Save, X, AlertTriangle } from 'lucide-react'

interface NotificationTemplate {
  id: string
  name: string
  title: string
  message: string
  type: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  isActive: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

export default function NotificationTemplates() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    message: '',
    type: 'SYSTEM_ANNOUNCEMENT',
    priority: 'NORMAL' as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
    isActive: true
  })

  const notificationTypes = [
    { value: 'SYSTEM_ANNOUNCEMENT', label: 'System Announcement' },
    { value: 'CLASS_REMINDER', label: 'Class Reminder' },
    { value: 'EVENT_REMINDER', label: 'Event Reminder' },
    { value: 'BOOKING_CONFIRMATION', label: 'Booking Confirmation' },
    { value: 'PAYMENT_CONFIRMATION', label: 'Payment Confirmation' },
    { value: 'INSTRUCTOR_MESSAGE', label: 'Instructor Message' },
    { value: 'MAINTENANCE_NOTICE', label: 'Maintenance Notice' },
    { value: 'CLASS_CANCELLED', label: 'Class Cancelled' },
    { value: 'WAITLIST_SPOT_AVAILABLE', label: 'Waitlist Spot Available' }
  ]

  const priorities = [
    { value: 'LOW', label: 'Low', color: 'text-gray-600 bg-gray-50' },
    { value: 'NORMAL', label: 'Normal', color: 'text-blue-600 bg-blue-50' },
    { value: 'HIGH', label: 'High', color: 'text-orange-600 bg-orange-50' },
    { value: 'URGENT', label: 'Urgent', color: 'text-red-600 bg-red-50' }
  ]

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/notifications/templates')
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }

      const data = await response.json()
      setTemplates(data.templates || [])

    } catch (err: any) {
      console.error('Error fetching templates:', err)
      setError(err.message || 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  // Save template (create or update)
  const saveTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const url = editingTemplate 
        ? `/api/admin/notifications/templates/${editingTemplate.id}`
        : '/api/admin/notifications/templates'
      
      const method = editingTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${editingTemplate ? 'update' : 'create'} template`)
      }

      setSuccess(`Template ${editingTemplate ? 'updated' : 'created'} successfully`)
      setIsEditing(false)
      setEditingTemplate(null)
      setFormData({
        name: '',
        title: '',
        message: '',
        type: 'SYSTEM_ANNOUNCEMENT',
        priority: 'NORMAL',
        isActive: true
      })
      
      await fetchTemplates()

    } catch (err: any) {
      console.error('Error saving template:', err)
      setError(err.message || 'Failed to save template')
    }
  }

  // Delete template
  const deleteTemplate = async (template: NotificationTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/notifications/templates/${template.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete template')
      }

      setSuccess('Template deleted successfully')
      await fetchTemplates()

    } catch (err: any) {
      console.error('Error deleting template:', err)
      setError(err.message || 'Failed to delete template')
    }
  }

  // Toggle template active status
  const toggleTemplateStatus = async (template: NotificationTemplate) => {
    try {
      const response = await fetch(`/api/admin/notifications/templates/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...template,
          isActive: !template.isActive
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update template status')
      }

      await fetchTemplates()

    } catch (err: any) {
      console.error('Error updating template status:', err)
      setError(err.message || 'Failed to update template status')
    }
  }

  // Duplicate template
  const duplicateTemplate = (template: NotificationTemplate) => {
    setFormData({
      name: `${template.name} (Copy)`,
      title: template.title,
      message: template.message,
      type: template.type,
      priority: template.priority,
      isActive: true
    })
    setEditingTemplate(null)
    setIsEditing(true)
  }

  // Edit template
  const editTemplate = (template: NotificationTemplate) => {
    setFormData({
      name: template.name,
      title: template.title,
      message: template.message,
      type: template.type,
      priority: template.priority,
      isActive: template.isActive
    })
    setEditingTemplate(template)
    setIsEditing(true)
  }

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false)
    setEditingTemplate(null)
    setFormData({
      name: '',
      title: '',
      message: '',
      type: 'SYSTEM_ANNOUNCEMENT',
      priority: 'NORMAL',
      isActive: true
    })
    setError(null)
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const getPriorityColor = (priority: string) => {
    const priorityConfig = priorities.find(p => p.value === priority)
    return priorityConfig?.color || 'text-gray-600 bg-gray-50'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading templates...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Notification Templates</h3>
          <p className="text-sm text-gray-600">Manage reusable notification templates</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </button>
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

      {/* Template Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>
              <button
                onClick={cancelEditing}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveTemplate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter template name..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active template
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingTemplate ? 'Update' : 'Create'} Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Templates ({templates.length})</h3>
        </div>

        {templates.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
            <p className="text-gray-600 mb-4">Create your first notification template to get started.</p>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {templates.map((template) => (
              <div key={template.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {template.name}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        getPriorityColor(template.priority)
                      }`}>
                        {template.priority}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        template.isActive 
                          ? 'text-green-800 bg-green-100'
                          : 'text-gray-800 bg-gray-100'
                      }`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {template.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {template.message}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                      <span>
                        {template.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span>Used {template.usageCount} times</span>
                      <span>
                        Updated {new Date(template.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleTemplateStatus(template)}
                      className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded ${
                        template.isActive
                          ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                          : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {template.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => duplicateTemplate(template)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      title="Duplicate template"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => editTemplate(template)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTemplate(template)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}