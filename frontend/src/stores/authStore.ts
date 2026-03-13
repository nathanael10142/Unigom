import { create } from 'zustand'
import apiClient from '../utils/api'
import type { Admin } from '../types'

interface AuthState {
  admin: Admin | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { username: string; password: string }) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  token: null,
  isAuthenticated: false,
  isLoading: false, // Start with false to avoid issues

  login: async (credentials) => {
    try {
      set({ isLoading: true })
      const response = await apiClient.login(credentials)
      const data = response.data
      
      // La réponse OAuth2 contient access_token, token_type et admin
      const { access_token, admin } = data
      
      // Sauvegarder le token dans localStorage
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('admin', JSON.stringify(admin))
      
      set({
        admin,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        admin: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('admin')
    set({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token')
    const adminData = localStorage.getItem('admin')
    
    if (token && adminData) {
      try {
        const admin = JSON.parse(adminData)
        set({
          admin,
          token,
          isAuthenticated: true,
          isLoading: false,
        })
      } catch (error) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('admin')
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } else {
      set({
        admin: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
}))
