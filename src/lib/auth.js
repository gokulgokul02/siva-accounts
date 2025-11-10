// Simple authentication with hashed password
// Password: siva@2000
// Hash: bcrypt hash of "siva@2000"

// Using a simple hash for client-side (in production, use proper backend authentication)
// This is a SHA-256 hash of "siva@2000"
const HASHED_PASSWORD = 'cf7bf91ccc047b2474ec6216f4f15cc5d2709b19fcafb6bd2a2a90cb90e3eea8'

export const authenticate = (username, password) => {
  // Simple hash function (in production, use proper crypto)
  const hashPassword = async (pwd) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(pwd)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  return new Promise(async (resolve) => {
    if (username === 'siva@2000') {
      const hashedInput = await hashPassword(password)
      if (hashedInput === HASHED_PASSWORD) {
        // Store authentication in sessionStorage
        sessionStorage.setItem('authenticated', 'true')
        sessionStorage.setItem('username', username)
        resolve(true)
      } else {
        resolve(false)
      }
    } else {
      resolve(false)
    }
  })
}

export const isAuthenticated = () => {
  return sessionStorage.getItem('authenticated') === 'true'
}

export const logout = () => {
  sessionStorage.removeItem('authenticated')
  sessionStorage.removeItem('username')
}

export const getUsername = () => {
  return sessionStorage.getItem('username')
}

