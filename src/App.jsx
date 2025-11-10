import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TripForm from './components/TripForm'
import TripList from './components/TripList'
import SummaryDashboard from './components/SummaryDashboard'
import PlacesManagement from './components/PlacesManagement'
import DieselExpense from './components/DieselExpense'
import ReportGenerator from './components/ReportGenerator'
import PeriodDeletion from './components/PeriodDeletion'
import Layout from './components/Layout'
import Login from './components/Login'
import { isAuthenticated } from './lib/auth'

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setAuthenticated(isAuthenticated())
    setChecking(false)
  }, [])

  const handleLogin = () => {
    setAuthenticated(true)
  }

  if (checking) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  if (!authenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={
            <div className="space-y-4 sm:space-y-6">
              <SummaryDashboard />
              {!isEditing && <TripForm />}
              <TripList onEditingChange={setIsEditing} />
              <PeriodDeletion />
            </div>
          } />
          <Route path="/places" element={<PlacesManagement />} />
          <Route path="/diesel" element={<DieselExpense />} />
          <Route path="/reports" element={<ReportGenerator />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

