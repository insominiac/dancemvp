'use client'

import { useState, useEffect } from 'react'
import { useAuth, useRequireAdmin } from '@/app/lib/auth-context'

interface LoginToken {
  id: string
  token: string
  name: string | null
  purpose: string | null
  isActive: boolean
  usedCount: number
  maxUses: number | null
  expiresAt: string | null
  allowedRoles: string[]
  metadata: any
  createdAt: string
  updatedAt: string
  lastUsedAt: string | null
  lastUsedIp: string | null
  createdBy: string
  stats: {
    totalAttempts: number
    successfulAttempts: number
    successRate: number
    recentAttempts24h: number
  }
  loginUrl: string
}

interface CreateTokenForm {
  name?: string
  purpose?: string
  maxUses?: number
  expiresAt?: string
  allowedRoles?: string[]
  metadata?: Record<string, any>
}

export default function LoginTokensPage() {
  const [tokens, setTokens] = useState<LoginToken[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newToken, setNewToken] = useState<CreateTokenForm>({})
  const [generatedToken, setGeneratedToken] = useState<LoginToken | null>(null)
  const [filter, setFilter] = useState('')
  const [purposeFilter, setPurposeFilter] = useState('')

  useRequireAdmin()
  const { user } = useAuth()

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    try {
      const response = await fetch('/api/auth/login-tokens')
      const result = await response.json()
      
      if (result.success) {
        setTokens(result.data.tokens)
      }
    } catch (error) {
      console.error('Failed to fetch tokens:', error)
    } finally {
      setLoading(false)
    }
  }

  const createToken = async () => {
    setCreateLoading(true)
    try {
      const response = await fetch('/api/auth/login-tokens/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newToken)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setGeneratedToken(result.data)
        setNewToken({})
        fetchTokens() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to create token:', error)
    } finally {
      setCreateLoading(false)
    }
  }

  const deleteToken = async (tokenId: string) => {
    if (!confirm('Are you sure you want to delete this token?')) return
    
    try {
      const response = await fetch('/api/auth/login-tokens', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tokenId })
      })
      
      if (response.ok) {
        fetchTokens()
      }
    } catch (error) {
      console.error('Failed to delete token:', error)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const filteredTokens = tokens.filter(token => {
    const matchesSearch = !filter || 
      token.name?.toLowerCase().includes(filter.toLowerCase()) ||
      token.purpose?.toLowerCase().includes(filter.toLowerCase()) ||
      token.token.toLowerCase().includes(filter.toLowerCase())
    
    const matchesPurpose = !purposeFilter || token.purpose === purposeFilter
    
    return matchesSearch && matchesPurpose
  })

  const purposes = Array.from(new Set(tokens.map(t => t.purpose).filter(Boolean)))

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold leading-6 text-gray-900">Login Tokens</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage unique login URLs for marketing campaigns and special access
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            🔗 Create New Token
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🎫</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tokens</dt>
                  <dd className="text-lg font-medium text-gray-900">{tokens.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Tokens</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {tokens.filter(t => t.isActive).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Uses</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {tokens.reduce((sum, t) => sum + t.usedCount, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {tokens.length > 0 
                      ? Math.round(tokens.reduce((sum, t) => sum + t.stats.successRate, 0) / tokens.length)
                      : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search tokens..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
            <select
              value={purposeFilter}
              onChange={(e) => setPurposeFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All purposes</option>
              {purposes.map(purpose => (
                <option key={purpose} value={purpose}>{purpose}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tokens Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Login Tokens</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTokens.map((token) => (
                <tr key={token.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {token.name || 'Unnamed Token'}
                        </span>
                        {token.purpose && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {token.purpose}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-1">
                        {token.token.substring(0, 8)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{token.usedCount} / {token.maxUses || '∞'} uses</div>
                      {token.lastUsedAt && (
                        <div className="text-xs text-gray-500">
                          Last: {new Date(token.lastUsedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{token.stats.totalAttempts} attempts</div>
                      <div className="text-xs text-gray-500">
                        {token.stats.successRate}% success
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        token.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {token.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {token.expiresAt && (
                        <span className="text-xs text-gray-500">
                          Expires: {new Date(token.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => copyToClipboard(token.loginUrl)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Copy URL"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => copyToClipboard(token.token)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Copy Token"
                    >
                      🔗
                    </button>
                    <button
                      onClick={() => deleteToken(token.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTokens.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl block mb-4">🔍</span>
              <h3 className="text-lg font-medium text-gray-900">No tokens found</h3>
              <p className="text-gray-500">Get started by creating your first login token</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Token Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Login Token</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newToken.name || ''}
                    onChange={(e) => setNewToken({...newToken, name: e.target.value})}
                    placeholder="Marketing Campaign 2024"
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <select
                    value={newToken.purpose || ''}
                    onChange={(e) => setNewToken({...newToken, purpose: e.target.value})}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Select purpose</option>
                    <option value="marketing">Marketing Campaign</option>
                    <option value="referral">Referral Link</option>
                    <option value="admin">Admin Access</option>
                    <option value="campaign">Special Campaign</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses (optional)</label>
                  <input
                    type="number"
                    value={newToken.maxUses || ''}
                    onChange={(e) => setNewToken({...newToken, maxUses: e.target.value ? parseInt(e.target.value) : undefined})}
                    placeholder="Unlimited"
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (optional)</label>
                  <input
                    type="datetime-local"
                    value={newToken.expiresAt || ''}
                    onChange={(e) => setNewToken({...newToken, expiresAt: e.target.value})}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewToken({})
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={createToken}
                  disabled={createLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create Token'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Token Modal */}
      {generatedToken && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="text-center">
                <span className="text-4xl block mb-4">🎉</span>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Token Created Successfully!</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Login URL</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={generatedToken.loginUrl}
                      readOnly
                      className="flex-1 border rounded-l-md px-3 py-2 bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedToken.loginUrl)}
                      className="border-l-0 border border-gray-300 rounded-r-md px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={generatedToken.token}
                      readOnly
                      className="flex-1 border rounded-l-md px-3 py-2 bg-gray-50 text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedToken.token)}
                      className="border-l-0 border border-gray-300 rounded-r-md px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Save this information now - you won't be able to see the full URL again!
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setGeneratedToken(null)
                    setShowCreateForm(false)
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}