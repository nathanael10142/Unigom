import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  Users,
  Fingerprint,
  Building,
  Settings,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../utils/cn'

const menuItems = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: Home, path: '/' },
  { id: 'employees', label: 'Employés', icon: Users, path: '/employees' },
  { id: 'attendance', label: 'Pointages', icon: Fingerprint, path: '/attendance' },
  { id: 'postes', label: 'Postes', icon: Building, path: '/postes' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
  { id: 'settings', label: 'Paramètres', icon: Settings, path: '/settings' },
]

interface SidebarProps {
  className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarOpen, setSidebarOpen, unreadCount } = useUIStore()
  const { admin, logout } = useAuthStore()
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard')

  const handleMenuItemClick = (itemId: string) => {
    setActiveMenuItem(itemId)
    // Navigation handled by React Router
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div
      className={cn(
        'bg-sidebar border-r border-border flex flex-col transition-all duration-300',
        sidebarOpen ? 'w-72' : 'w-20',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
            {/* Logo */}
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain"
            />
            {sidebarOpen && (
              <div>
                <h1 className="text-text-primary font-semibold">UNIGOM</h1>
                <p className="text-text-secondary text-xs">Biométrie</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeMenuItem === item.id || location.pathname === item.path
            const Icon = item.icon
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleMenuItemClick(item.id)
                  navigate(item.path)
                }}
                className={cn(
                  'sidebar-item w-full relative',
                  isActive && 'active bg-hover-bg'
                )}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
                
                {/* Badge pour les notifications */}
                {item.id === 'notifications' && unreadCount > 0 && (
                  <span className="absolute top-2 right-2 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-border">
        <div className="space-y-2">
          {sidebarOpen && admin && (
            <div className="px-3 py-2">
              <p className="text-text-primary text-sm font-medium truncate">
                {admin.username}
              </p>
              <p className="text-text-secondary text-xs">Administrateur</p>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
