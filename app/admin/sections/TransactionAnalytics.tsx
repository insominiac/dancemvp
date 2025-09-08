'use client'

import { useState, useEffect } from 'react'

interface Transaction {
  id: string
  userId: string
  user?: any
  bookingId?: string
  booking?: any
  amount: string
  type: string
  status: string
  paymentMethod?: string
  referenceNumber?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export default function TransactionAnalytics() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filter, setFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [formData, setFormData] = useState({
    userId: '',
    bookingId: '',
    amount: '0',
    type: 'Payment',
    status: 'PENDING',
    paymentMethod: 'Card',
    referenceNumber: '',
    description: ''
  })

  // Calculate analytics
  const totalRevenue = transactions
    .filter(t => t.status === 'COMPLETED' && t.type === 'Payment')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
  
  const totalRefunds = transactions
    .filter(t => t.status === 'COMPLETED' && t.type === 'Refund')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
  
  const pendingTransactions = transactions.filter(t => t.status === 'PENDING').length
  const completedTransactions = transactions.filter(t => t.status === 'COMPLETED').length

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/transactions')
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions)
      }
    } catch (err) {
      console.error('Error fetching transactions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingTransaction(null)
    setFormData({
      userId: '',
      bookingId: '',
      amount: '0',
      type: 'Payment',
      status: 'PENDING',
      paymentMethod: 'Card',
      referenceNumber: '',
      description: ''
    })
    setShowModal(true)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      userId: transaction.userId,
      bookingId: transaction.bookingId || '',
      amount: transaction.amount.toString(),
      type: transaction.type,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod || 'Card',
      referenceNumber: transaction.referenceNumber || '',
      description: transaction.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction record?')) return
    
    try {
      const res = await fetch(`/api/admin/transactions/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchTransactions()
        alert('Transaction deleted successfully')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to delete transaction')
      }
    } catch (err) {
      alert('Failed to delete transaction')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = editingTransaction 
      ? `/api/admin/transactions/${editingTransaction.id}`
      : '/api/admin/transactions'
    const method = editingTransaction ? 'PUT' : 'POST'
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setShowModal(false)
        fetchTransactions()
        alert(`Transaction ${editingTransaction ? 'updated' : 'created'} successfully`)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save transaction')
      }
    } catch (err) {
      alert('Failed to save transaction')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'REFUNDED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Payment': return '💳'
      case 'Refund': return '↩️'
      case 'Adjustment': return '⚖️'
      default: return '💰'
    }
  }

  const filteredTransactions = transactions.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false
    
    if (dateFilter !== 'all') {
      const transDate = new Date(t.createdAt)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - transDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (dateFilter === 'today' && daysDiff > 0) return false
      if (dateFilter === 'week' && daysDiff > 7) return false
      if (dateFilter === 'month' && daysDiff > 30) return false
    }
    
    return true
  })

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
        <h2 className="text-3xl font-bold">Transaction Management</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          ➕ Add Transaction
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-green-600 text-sm font-medium">Total Revenue</div>
          <div className="text-2xl font-bold text-green-700">${totalRevenue.toFixed(2)}</div>
          <div className="text-xs text-green-600">{completedTransactions} completed</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-red-600 text-sm font-medium">Total Refunds</div>
          <div className="text-2xl font-bold text-red-700">${totalRefunds.toFixed(2)}</div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-yellow-600 text-sm font-medium">Pending</div>
          <div className="text-2xl font-bold text-yellow-700">{pendingTransactions}</div>
          <div className="text-xs text-yellow-600">Awaiting processing</div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-blue-600 text-sm font-medium">Net Revenue</div>
          <div className="text-2xl font-bold text-blue-700">
            ${(totalRevenue - totalRefunds).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex gap-2">
          {['all', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All Status' : status}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          {['all', 'today', 'week', 'month'].map((period) => (
            <button
              key={period}
              onClick={() => setDateFilter(period)}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                dateFilter === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {period === 'all' ? 'All Time' : 
               period === 'today' ? 'Today' :
               period === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      #{transaction.referenceNumber || transaction.id.slice(-8)}
                    </div>
                    {transaction.description && (
                      <div className="text-xs text-gray-500">{transaction.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {transaction.user?.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {transaction.user?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg">{getTypeIcon(transaction.type)}</span>
                    <span className="ml-2 text-sm">{transaction.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    ${parseFloat(transaction.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {transaction.paymentMethod || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Payment">Payment</option>
                    <option value="Refund">Refund</option>
                    <option value="Adjustment">Adjustment</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="Card">Credit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <input
                  type="text"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Optional"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  placeholder="Optional notes..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editingTransaction ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
