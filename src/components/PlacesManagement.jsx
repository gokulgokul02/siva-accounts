import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function PlacesManagement() {
  const [places, setPlaces] = useState([])
  const [formData, setFormData] = useState({
    place_name: '',
    default_amount: ''
  })
  const [editingPlace, setEditingPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPlaces()
  }, [])

  const fetchPlaces = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('place_name')
    
    if (error) {
      alert('Error fetching places: ' + error.message)
    } else {
      setPlaces(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingPlace) {
        const { error } = await supabase
          .from('places')
          .update({
            place_name: formData.place_name,
            default_amount: parseFloat(formData.default_amount),
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPlace.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('places')
          .insert([{
            place_name: formData.place_name,
            default_amount: parseFloat(formData.default_amount)
          }])
        
        if (error) throw error
      }

      setFormData({ place_name: '', default_amount: '' })
      setEditingPlace(null)
      fetchPlaces()
    } catch (error) {
      alert('Error saving place: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (place) => {
    setEditingPlace(place)
    setFormData({
      place_name: place.place_name,
      default_amount: place.default_amount
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this place?')) return

    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('Error deleting place: ' + error.message)
    } else {
      fetchPlaces()
    }
  }

  const handleCancel = () => {
    setEditingPlace(null)
    setFormData({ place_name: '', default_amount: '' })
  }

  if (loading) {
    return <div className="text-center py-8">Loading places...</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {editingPlace ? 'Edit Place' : 'Add New Place'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Place Name</label>
              <input
                type="text"
                value={formData.place_name}
                onChange={(e) => setFormData({ ...formData, place_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Default Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.default_amount}
                onChange={(e) => setFormData({ ...formData, default_amount: e.target.value })}
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
              {saving ? 'Saving...' : editingPlace ? 'Update Place' : 'Add Place'}
            </button>
            {editingPlace && (
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
        <h2 className="text-xl font-bold mb-4">Frequently Traveled Places</h2>
        {places.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No places added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Place Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Default Amount</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {places.map((place) => (
                  <tr key={place.id}>
                    <td className="border border-gray-300 px-4 py-2">{place.place_name}</td>
                    <td className="border border-gray-300 px-4 py-2">₹{place.default_amount}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(place)}
                          className="px-2 sm:px-3 py-1 bg-green-500 text-white rounded text-xs sm:text-sm hover:bg-green-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(place.id)}
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

