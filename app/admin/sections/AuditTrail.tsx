'use client'

import { useState, useEffect } from 'react'

interface AuditLog {
  id: string
  userId: string
  action: string
  tableName: string
  recordId: string
  oldValues?: string
  newValues?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  user: {
    fullName: string
    email: string
    role: string
  }
}

interface AuditStats {
  totalLogs: number
  todayLogs: number
  weeklyLogs: number
  topActions: Array<{ action: string; count: number }>
  topUsers: Array<{ user: string; count: number }>
  topTables: Array<{ table: string; count: number }>
}

export default function AuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // Filters
  const [actionFilter, setActionFilter] = useState('all')
  const [tableFilter, setTableFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('all') // today, week, month, all
  const [searchTerm, setSearchTerm] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 20

  // Available filter options
  const [actionOptions, setActionOptions] = useState<string[]>([])
  const [tableOptions, setTableOptions] = useState<string[]>([])

  useEffect(() => {
    fetchAuditLogs()
    fetchAuditStats()
  }, [currentPage, actionFilter, tableFilter, userFilter, dateFilter, searchTerm])

  const fetchAuditLogs = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(actionFilter !== 'all' && { action: actionFilter }),
        ...(tableFilter !== 'all' && { table: tableFilter }),
        ...(userFilter && { user: userFilter }),
        ...(dateFilter !== 'all' && { dateRange: dateFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/audit-logs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setTotalPages(data.totalPages)
        setTotalCount(data.totalCount)
        
        // Update filter options
        if (data.actionOptions) setActionOptions(data.actionOptions)
        if (data.tableOptions) setTableOptions(data.tableOptions)
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAuditStats = async () => {
    try {
      const response = await fetch('/api/admin/audit-logs/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching audit stats:', error)
    }
  }

  const exportAuditLogs = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams({
        format,
        ...(actionFilter !== 'all' && { action: actionFilter }),
        ...(tableFilter !== 'all' && { table: tableFilter }),
        ...(userFilter && { user: userFilter }),
        ...(dateFilter !== 'all' && { dateRange: dateFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/audit-logs/export?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error)
      alert('Failed to export audit logs')
    }
  }

  const viewLogDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setShowDetailModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'insert':
        return 'bg-green-100 text-green-800'
      case 'update':
      case 'modify':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
      case 'remove':
        return 'bg-red-100 text-red-800'
      case 'login':
      case 'authenticate':
        return 'bg-purple-100 text-purple-800'
      case 'logout':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const clearFilters = () => {
    setActionFilter('all')
    setTableFilter('all')
    setUserFilter('')
    setDateFilter('all')
    setSearchTerm('')
    setCurrentPage(1)
  }

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Audit Trail</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {totalCount.toLocaleString()} total logs
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => exportAuditLogs('csv')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
            >
              📊 Export CSV
            </button>
            <button
              onClick={() => exportAuditLogs('json')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              📄 Export JSON
            </button>
            <button
              onClick={fetchAuditLogs}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Logs</p>
                <p className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</p>
              </div>
              <span className="text-2xl">📋</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Today</p>
                <p className="text-2xl font-bold">{stats.todayLogs.toLocaleString()}</p>
              </div>
              <span className="text-2xl">📅</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">This Week</p>
                <p className="text-2xl font-bold">{stats.weeklyLogs.toLocaleString()}</p>
              </div>
              <span className="text-2xl">📊</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Top Action</p>
                <p className="text-lg font-bold">
                  {stats.topActions[0]?.action || 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {stats.topActions[0]?.count || 0} times
                </p>
              </div>
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Actions</option>
              {actionOptions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
            <select
              value={tableFilter}
              onChange={(e) => {
                setTableFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Tables</option>
              {tableOptions.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <input
              type="text"
              placeholder="User email..."
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-40 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Record ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {log.user.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.user.email}
                      </div>
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          log.user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          log.user.role === 'INSTRUCTOR' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {log.user.role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {log.tableName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {log.recordId.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.ipAddress || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewLogDetails(log)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
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
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
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

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Audit Log Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Log ID</label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">{selectedLog.id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                  <p className="text-sm">{formatDate(selectedLog.createdAt)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                  <p className="text-sm">
                    {selectedLog.user.fullName} ({selectedLog.user.email})
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs rounded-full ${
                      selectedLog.user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      selectedLog.user.role === 'INSTRUCTOR' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedLog.user.role}
                    </span>
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                  <p className="text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getActionColor(selectedLog.action)}`}>
                      {selectedLog.action}
                    </span>
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
                  <p className="text-sm font-mono">{selectedLog.tableName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Record ID</label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">{selectedLog.recordId}</p>
                </div>
              </div>
              
              {/* Technical Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <p className="text-sm font-mono">{selectedLog.ipAddress || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded text-xs break-all">
                    {selectedLog.userAgent || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Old Values */}
            {selectedLog.oldValues && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Old Values</label>
                <pre className="text-xs bg-red-50 border border-red-200 p-4 rounded overflow-x-auto">
                  {JSON.stringify(JSON.parse(selectedLog.oldValues), null, 2)}
                </pre>
              </div>
            )}
            
            {/* New Values */}
            {selectedLog.newValues && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Values</label>
                <pre className="text-xs bg-green-50 border border-green-200 p-4 rounded overflow-x-auto">
                  {JSON.stringify(JSON.parse(selectedLog.newValues), null, 2)}
                </pre>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {logs.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
          <p className="text-gray-500">
            {searchTerm || actionFilter !== 'all' || tableFilter !== 'all' || userFilter || dateFilter !== 'all'
              ? 'Try adjusting your search criteria'
              : 'Audit logs will appear here as system events occur'
            }
          </p>
        </div>
      )}
    </div>
  )
}