import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logout, getUsername } from '../lib/auth'
import Logo from './Logo'

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 md:mb-0">
              <Logo />
              <h1 className="text-xl sm:text-2xl font-bold">Siva Cabs Accounts</h1>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-4 items-center">
              <Link
                to="/"
                className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition text-sm sm:text-base ${
                  isActive('/') ? 'bg-green-700' : 'bg-green-500 hover:bg-green-700'
                }`}
              >
                Home
              </Link>
              <Link
                to="/places"
                className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition text-sm sm:text-base ${
                  isActive('/places') ? 'bg-green-700' : 'bg-green-500 hover:bg-green-700'
                }`}
              >
                Places
              </Link>
              <Link
                to="/diesel"
                className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition text-sm sm:text-base ${
                  isActive('/diesel') ? 'bg-green-700' : 'bg-green-500 hover:bg-green-700'
                }`}
              >
                Diesel
              </Link>
              <Link
                to="/reports"
                className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition text-sm sm:text-base ${
                  isActive('/reports') ? 'bg-green-700' : 'bg-green-500 hover:bg-green-700'
                }`}
              >
                Reports
              </Link>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm">({getUsername()})</span>
                <button
                  onClick={handleLogout}
                  className="px-2 sm:px-4 py-1.5 sm:py-2 bg-red-500 rounded-md hover:bg-red-700 transition text-sm sm:text-base"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {children}
      </main>
    </div>
  )
}

