import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { usuariosAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  const login = async ({ correo, password }) => {
    setLoading(true)
    try {
      const res = await usuariosAPI.login({ correo, password })
      // Esperamos que el backend responda con { token, userId, nombre, correo, tipo }
      const data = res.data || {}
      setToken(data.token || null)
      setUser({
        id: data.userId,
        nombre: data.nombre,
        correo: data.correo,
        tipo: data.tipo,
      })
      return { ok: true, data }
    } catch (error) {
      return { ok: false, error }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ token, user, loading, login, logout, isAuthenticated: !!token }), [token, user, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
