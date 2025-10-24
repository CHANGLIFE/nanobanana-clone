'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email?: string
  user_metadata?: {
    name?: string
    avatar_url?: string
    full_name?: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (provider: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const response = await fetch('/api/auth/user')
      const data = await response.json()
      console.log('Auth API response:', { ok: response.ok, data })

      if (response.ok && data.user) {
        setUser(data.user)
        console.log('User authenticated:', data.user.email)
      } else if (response.ok && !data.user) {
        // API is working but user data is null (e.g., first-time user)
        setUser(null)
        console.log('API working but no user data - checking if this is first-time setup')
      } else {
        setUser(null)
        console.log('User authentication failed:', data)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (provider: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        setUser(null)
        window.location.href = '/'
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}