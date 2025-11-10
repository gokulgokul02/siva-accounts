import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import TripForm from './TripForm'

export default function TripList({ onEditingChange }) {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTrip, setEditingTrip] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null)

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) {
      alert('Error fetching trips: ' + error.message)
    } else {
      setTrips(data || [])
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this trip?')) return

    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('Error deleting trip: ' + error.message)
    } else {
      fetchTrips()
    }
  }

  const handleEdit = (trip) => {
    setEditingTrip(trip)
    if (onEditingChange) onEditingChange(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFormSuccess = () => {
    setEditingTrip(null)
    if (onEditingChange) onEditingChange(false)
    fetchTrips()
  }

  const handleStatusToggle = async (trip) => {
    setUpdatingStatus(trip.id)
    const newStatus = trip.status === 'paid' ? 'unpaid' : 'paid'
    
    const { error } = await supabase
      .from('trips')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', trip.id)
    
    if (error) {
      alert('Error updating status: ' + error.message)
    } else {
      fetchTrips() // Refresh data
    }
    setUpdatingStatus(null)
  }

  const handleRefresh = () => {
    fetchTrips()
  }

  if (loading) {
    return <div className="text-center py-8">Loading trips...</div>
  }

  return (
    <div>
      {editingTrip && (
        <div className="mb-4 sm:mb-6">
          <TripForm tripToEdit={editingTrip} onSuccess={handleFormSuccess} />
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
          <h2 className="text-lg sm:text-xl font-bold">All Trips</h2>
          <button
            onClick={handleRefresh}
            className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 text-sm sm:text-base"
            title="Refresh data"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        {trips.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No trips found. Add your first trip above!</p>
        ) : (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full border-collapse min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Date</th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Customer</th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm hidden sm:table-cell">Place</th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Amount</th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Status</th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr
                    key={trip.id}
                    className={trip.status === 'unpaid' ? 'bg-red-50' : ''}
                  >
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">
                      {new Date(trip.date).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">
                      <div className="truncate max-w-[100px] sm:max-w-none">{trip.customer_name}</div>
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm hidden sm:table-cell">
                      <div className="truncate max-w-[120px]">{trip.place}</div>
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium">₹{trip.amount}</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      <button
                        onClick={() => handleStatusToggle(trip)}
                        disabled={updatingStatus === trip.id}
                        className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                          trip.status === 'paid' 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-red-500 text-white hover:bg-red-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {updatingStatus === trip.id ? 'Updating...' : (trip.status === 'paid' ? 'Paid' : 'Unpaid')}
                      </button>
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button
                          onClick={() => handleEdit(trip)}
                          className="px-2 sm:px-3 py-1 bg-green-500 text-white rounded text-xs sm:text-sm hover:bg-green-600 whitespace-nowrap"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(trip.id)}
                          className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded text-xs sm:text-sm hover:bg-red-600 whitespace-nowrap"
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

