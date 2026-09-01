import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('fintrack_token')
    const storedUser = localStorage.getItem('fintrack_user')

    if (storedToken && storedUser) {
      // Set token in axios default headers immediately
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    // Set token in axios default headers immediately on login
    api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`
    localStorage.setItem('fintrack_token', jwtToken)
    localStorage.setItem('fintrack_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    // Remove token from axios default headers
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('fintrack_token')
    localStorage.removeItem('fintrack_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}