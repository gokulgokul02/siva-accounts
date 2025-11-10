import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function SummaryDashboard() {
  const [summary, setSummary] = useState({
    totalPaid: 0,
    totalPending: 0
  })
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState(null)

  useEffect(() => {
    fetchSummary()
    
    // Subscribe to changes
    const subscription = supabase
      .channel('trips_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => {
        fetchSummary()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchSummary = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('trips')
      .select('amount, status')
    
    if (error) {
      console.error('Error fetching summary:', error)
      // Check if it's a table not found error
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        setDbError('Database tables not found. Please run the SQL schema in your Supabase dashboard. See SETUP_GUIDE.md for instructions.')
      } else {
        setDbError(null)
      }
    } else {
      setDbError(null)
      const totalPaid = data
        ?.filter(t => t.status === 'paid')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0
      
      const totalPending = data
        ?.filter(t => t.status === 'unpaid')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0
      
      setSummary({ totalPaid, totalPending })
    }
    setLoading(false)
  }

  if (loading && !dbError) {
    return <div className="text-center py-4">Loading summary...</div>
  }

  if (dbError) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Database Setup Required</h3>
        <p className="text-yellow-700 mb-4">{dbError}</p>
        <div className="bg-white rounded p-4 text-sm text-gray-700">
          <p className="font-semibold mb-2">Quick Fix:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open your Supabase Dashboard</li>
            <li>Go to SQL Editor</li>
            <li>Run the SQL from <code className="bg-gray-100 px-1 rounded">supabase-schema.sql</code></li>
            <li>Refresh this page</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchSummary}
          className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 text-sm sm:text-base"
          title="Refresh summary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Total Paid</h3>
          <p className="text-3xl font-bold text-green-700">₹{summary.totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Total Pending</h3>
          <p className="text-3xl font-bold text-red-700">₹{summary.totalPending.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}

