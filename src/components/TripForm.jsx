import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function TripForm({ tripToEdit, onSuccess }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customer_name: '',
    place: '',
    amount: '',
    status: 'unpaid'
  })
  const [places, setPlaces] = useState([])
  const [filteredPlaces, setFilteredPlaces] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tripToEdit) {
      setFormData({
        date: tripToEdit.date,
        customer_name: tripToEdit.customer_name,
        place: tripToEdit.place,
        amount: tripToEdit.amount,
        status: tripToEdit.status
      })
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        customer_name: '',
        place: '',
        amount: '',
        status: 'unpaid'
      })
    }
  }, [tripToEdit])

  useEffect(() => {
    fetchPlaces()
  }, [])

  const fetchPlaces = async () => {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('place_name')
    
    if (error) {
      console.error('Error fetching places:', error)
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        console.error('Database tables not found. Please run the SQL schema in your Supabase dashboard.')
      }
    } else if (data) {
      setPlaces(data)
    }
  }

  const handlePlaceChange = (value) => {
    setFormData({ ...formData, place: value })
    
    if (value) {
      const filtered = places.filter(p =>
        p.place_name.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredPlaces(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectPlace = (place) => {
    setFormData({
      ...formData,
      place: place.place_name,
      amount: place.default_amount
    })
    setShowSuggestions(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (tripToEdit) {
        const { error } = await supabase
          .from('trips')
          .update({
            date: formData.date,
            customer_name: formData.customer_name,
            place: formData.place,
            amount: parseFloat(formData.amount),
            status: formData.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', tripToEdit.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('trips')
          .insert([{
            date: formData.date,
            customer_name: formData.customer_name,
            place: formData.place,
            amount: parseFloat(formData.amount),
            status: formData.status
          }])
        
        if (error) throw error
      }

      setFormData({
        date: new Date().toISOString().split('T')[0],
        customer_name: '',
        place: '',
        amount: '',
        status: 'unpaid'
      })
      
      if (onSuccess) onSuccess()
    } catch (error) {
      alert('Error saving trip: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4">
        {tripToEdit ? 'Edit Trip' : 'Add New Trip'}
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
            <label className="block text-sm font-medium mb-1">Customer Name</label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
              required
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium mb-1">Place</label>
          <input
            type="text"
            value={formData.place}
            onChange={(e) => handlePlaceChange(e.target.value)}
            onFocus={() => {
              if (formData.place) {
                const filtered = places.filter(p =>
                  p.place_name.toLowerCase().includes(formData.place.toLowerCase())
                )
                setFilteredPlaces(filtered)
                setShowSuggestions(filtered.length > 0)
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            required
          />
          {showSuggestions && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredPlaces.map((place) => (
                <div
                  key={place.id}
                  onClick={() => selectPlace(place)}
                  className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100"
                >
                  <div className="font-medium">{place.place_name}</div>
                  <div className="text-sm text-gray-600">₹{place.default_amount}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? 'Saving...' : tripToEdit ? 'Update Trip' : 'Add Trip'}
          </button>
          {tripToEdit && onSuccess && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  date: new Date().toISOString().split('T')[0],
                  customer_name: '',
                  place: '',
                  amount: '',
                  status: 'unpaid'
                })
                onSuccess()
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

