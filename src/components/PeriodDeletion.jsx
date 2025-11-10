import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function PeriodDeletion() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [deleteType, setDeleteType] = useState('trips') // 'trips' or 'diesel' or 'both'
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [previewCount, setPreviewCount] = useState({ trips: 0, diesel: 0 })

  const previewDeletion = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('Start date must be before end date')
      return
    }

    setLoading(true)
    try {
      let tripsCount = 0
      let dieselCount = 0

      if (deleteType === 'trips' || deleteType === 'both') {
        const { count } = await supabase
          .from('trips')
          .select('*', { count: 'exact', head: true })
          .gte('date', startDate)
          .lte('date', endDate)
        tripsCount = count || 0
      }

      if (deleteType === 'diesel' || deleteType === 'both') {
        const { count } = await supabase
          .from('diesel_expenses')
          .select('*', { count: 'exact', head: true })
          .gte('date', startDate)
          .lte('date', endDate)
        dieselCount = count || 0
      }

      setPreviewCount({ trips: tripsCount, diesel: dieselCount })
      setShowConfirm(true)
    } catch (error) {
      alert('Error previewing deletion: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you absolutely sure you want to delete this data? This action cannot be undone!`)) {
      return
    }

    setLoading(true)
    try {
      if (deleteType === 'trips' || deleteType === 'both') {
        const { error: tripsError } = await supabase
          .from('trips')
          .delete()
          .gte('date', startDate)
          .lte('date', endDate)

        if (tripsError) throw tripsError
      }

      if (deleteType === 'diesel' || deleteType === 'both') {
        const { error: dieselError } = await supabase
          .from('diesel_expenses')
          .delete()
          .gte('date', startDate)
          .lte('date', endDate)

        if (dieselError) throw dieselError
      }

      alert('Data deleted successfully!')
      setStartDate('')
      setEndDate('')
      setShowConfirm(false)
      setPreviewCount({ trips: 0, diesel: 0 })
      
      // Refresh the page to update data
      window.location.reload()
    } catch (error) {
      alert('Error deleting data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-red-700">⚠️ Delete Data by Period</h2>
      <p className="text-sm text-gray-600 mb-4">Select a date range to delete trips and/or diesel expenses. This action cannot be undone!</p>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Delete Type</label>
          <select
            value={deleteType}
            onChange={(e) => setDeleteType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="trips">Trips Only</option>
            <option value="diesel">Diesel Expenses Only</option>
            <option value="both">Both Trips and Diesel</option>
          </select>
        </div>

        {!showConfirm ? (
          <button
            onClick={previewDeletion}
            disabled={loading || !startDate || !endDate}
            className="w-full md:w-auto px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Checking...' : 'Preview Deletion'}
          </button>
        ) : (
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 space-y-4">
            <div>
              <p className="font-semibold text-red-800 mb-2">Preview:</p>
              {(deleteType === 'trips' || deleteType === 'both') && (
                <p className="text-sm text-red-700">• {previewCount.trips} trip(s) will be deleted</p>
              )}
              {(deleteType === 'diesel' || deleteType === 'both') && (
                <p className="text-sm text-red-700">• {previewCount.diesel} diesel expense(s) will be deleted</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false)
                  setPreviewCount({ trips: 0, diesel: 0 })
                }}
                disabled={loading}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

