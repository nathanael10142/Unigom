import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import wsService from './utils/websocket'

// Layout Components
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'

// Page Components
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { AttendancePage } from './pages/AttendancePage'
import { PostesPage } from './pages/PostesPage'
import { SettingsPage } from './pages/SettingsPage'
import { NotificationsPage } from './pages/NotificationsPage'

// Loading Spinner
import { Loader2 } from 'lucide-react'

function App() {
  const { isAuthenticated, isLoading, checkAuth, token } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, []) // Remove checkAuth dependency to prevent infinite loop

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connecter WebSocket quand authentifié
      wsService.connect(token)
      
      // Nettoyer à la déconnexion
      return () => {
        wsService.disconnect()
      }
    }
  }, [isAuthenticated, token])

  // Écouter les événements WebSocket globaux
  useEffect(() => {
    const handleAttendanceUpdate = (event: CustomEvent) => {
      console.log('Attendance update received:', event.detail)
    }

    const handleSyncStatus = (event: CustomEvent) => {
      console.log('Sync status update:', event.detail)
    }

    window.addEventListener('attendance_update', handleAttendanceUpdate as EventListener)
    window.addEventListener('sync_status', handleSyncStatus as EventListener)

    return () => {
      window.removeEventListener('attendance_update', handleAttendanceUpdate as EventListener)
      window.removeEventListener('sync_status', handleSyncStatus as EventListener)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-primary">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/postes" element={<PostesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
