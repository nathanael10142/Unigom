import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Bell, RefreshCw, Menu } from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../utils/cn'

interface HeaderProps {
  className?: string
  title?: string
  subtitle?: string
  showSyncButton?: boolean
  onSync?: () => void
  extraActions?: React.ReactNode
}

export const Header: React.FC<HeaderProps> = ({
  className,
  title,
  subtitle,
  showSyncButton = false,
  onSync,
  extraActions,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarOpen, setSidebarOpen, isSyncing, unreadCount } = useUIStore()
  const { admin } = useAuthStore()

  // Titre automatique selon la route
  const getPageTitle = () => {
    if (title) return title
    
    const path = location.pathname
    switch (path) {
      case '/': return 'Tableau de Bord'
      case '/employees': return 'Employés'
      case '/attendance': return 'Pointages'
      case '/postes': return 'Postes'
      case '/settings': return 'Paramètres'
      case '/notifications': return 'Notifications'
      default: return 'Tableau de Bord'
    }
  }

  // Sous-titre automatique selon la route
  const getPageSubtitle = () => {
    if (subtitle) return subtitle
    
    const path = location.pathname
    switch (path) {
      case '/': return 'Vue d\'ensemble du système'
      case '/employees': return 'Gestion des employés'
      case '/attendance': return 'Suivi des pointages'
      case '/postes': return 'Gestion des postes'
      case '/settings': return 'Configuration du système'
      case '/notifications': return 'Alertes et activités'
      default: return ''
    }
  }

  const handleNotificationsClick = () => {
    // Naviguer vers la page de notifications
    console.log('Navigation vers notifications...')
    navigate('/notifications')
  }

  return (
    <header className={cn('bg-chat border-b border-border px-4 py-3', className)}>
      <div className="flex items-center justify-between">
        {/* Left side - Logo, Menu and Title */}
        <div className="flex items-center gap-4">
          {/* Logo cliquable */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center"
          >
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-8 w-auto object-contain hover:opacity-80 transition-opacity"
            />
          </button>
          
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-hover-bg"
            >
              <Menu size={20} />
            </button>
          )}
          
          <div>
            <h1 className="text-text-primary text-lg font-semibold">
              {getPageTitle()}
            </h1>
            {getPageSubtitle() && (
              <p className="text-text-secondary text-sm">{getPageSubtitle()}</p>
            )}
          </div>
        </div>

        {/* Right side - Search, Sync, Notifications */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="input-whatsapp pl-10 w-64"
            />
          </div>

          {/* Extra Actions */}
          {extraActions && (
            <div className="flex gap-2">
              {extraActions}
            </div>
          )}

          {/* Sync Button */}
          {showSyncButton && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className={cn(
                'btn-whatsapp',
                isSyncing && 'opacity-50 cursor-not-allowed'
              )}
            >
              <RefreshCw className={cn('w-4 h-4', isSyncing && 'animate-spin')} />
              {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={handleNotificationsClick}
              className="relative text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-hover-bg"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className="avatar avatar-md bg-primary text-white">
              {admin?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden md:block">
              <p className="text-text-primary text-sm font-medium">
                {admin?.username || 'Admin'}
              </p>
              <p className="text-text-secondary text-xs">En ligne</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
