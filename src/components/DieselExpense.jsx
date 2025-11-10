import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function DieselExpense() {
  const [expenses, setExpenses] = useState([])
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: ''
  })
  const [editingExpense, setEditingExpense] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('diesel_expenses')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) {
      alert('Error fetching diesel expenses: ' + error.message)
    } else {
      setExpenses(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingExpense) {
        const { error } = await supabase
          .from('diesel_expenses')
          .update({
            date: formData.date,
            amount: parseFloat(formData.amount),
            updated_at: new Date().toISOString()
          })
          .eq('id', editingExpense.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('diesel_expenses')
          .insert([{
            date: formData.date,
            amount: parseFloat(formData.amount)
          }])
        
        if (error) throw error
      }

      setFormData({ date: new Date().toISOString().split('T')[0], amount: '' })
      setEditingExpense(null)
      fetchExpenses()
    } catch (error) {
      alert('Error saving diesel expense: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setFormData({
      date: expense.date,
      amount: expense.amount
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this diesel expense?')) return

    const { error } = await supabase
      .from('diesel_expenses')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('Error deleting diesel expense: ' + error.message)
    } else {
      fetchExpenses()
    }
  }

  const handleCancel = () => {
    setEditingExpense(null)
    setFormData({ date: new Date().toISOString().split('T')[0], amount: '' })
  }

  if (loading) {
    return <div className="text-center py-8">Loading diesel expenses...</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {editingExpense ? 'Edit Diesel Expense' : 'Add Diesel Expense'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
            >
              {saving ? 'Saving...' : editingExpense ? 'Update Expense' : 'Add Expense'}
            </button>
            {editingExpense && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Diesel Expenses History</h2>
        {expenses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No diesel expenses recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">₹{expense.amount}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="px-2 sm:px-3 py-1 bg-green-500 text-white rounded text-xs sm:text-sm hover:bg-green-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

