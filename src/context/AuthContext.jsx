import React, { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../services/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    let active = true

    async function restoreSession() {
      try {
        const storedToken = localStorage.getItem('authToken')
        if (!storedToken) return

        const restoredUser = await authApi.getMe(storedToken)
        if (!active) return
        setUser(restoredUser)
        setToken(storedToken)
      } catch (error) {
        if (!active) return

        if (error?.status === 401 || error?.status === 404) {
          localStorage.removeItem('authToken')
        } else {
          setAuthError(error instanceof Error ? error.message : 'Unable to restore your session.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    restoreSession()
    return () => {
      active = false
    }
  }, [])

  const login = async (email, password) => {
    const result = await authApi.login({ email, password })
    localStorage.setItem('authToken', result.token)
    setUser(result.user)
    setToken(result.token)
    setAuthError(null)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
  }

  const register = async (data) => {
    const result = await authApi.register(data)
    localStorage.setItem('authToken', result.token)
    setUser(result.user)
    setToken(result.token)
    setAuthError(null)
  }

  const changePassword = async (currentPassword, newPassword) => {
    if (!token) throw new Error('Not authenticated')
    await authApi.changePassword(token, { currentPassword, newPassword })
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, authError, login, logout, register, changePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
