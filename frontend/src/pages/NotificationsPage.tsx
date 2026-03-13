import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle, AlertTriangle, Info, Eye, EyeOff, Download, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '../components/ui/Button'
import { useUIStore } from '../stores/uiStore'
import apiClient from '../utils/api'
import wsService from '../utils/websocket'

// Types et constantes
interface NotificationStats {
  total: number
  unread: number
  byType: Record<string, number>
  byPriority: Record<string, number>
  today: number
  thisWeek: number
}

interface NotificationFilters {
  type?: string
  priority?: string
  source?: string
  read?: boolean
  dateFrom?: string
  dateTo?: string
}

const NOTIFICATION_TYPES = [
  { value: 'scan_success', label: 'Pointage réussi' },
  { value: 'scan_late', label: 'Retard' },
  { value: 'scan_absent', label: 'Absence' },
  { value: 'system_info', label: 'Information système' },
  { value: 'system_warning', label: 'Alerte système' },
  { value: 'sync_complete', label: 'Synchronisation' }
]

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
  { value: 'critical', label: 'Critique' }
]

const SOURCES = [
  'attendance',
  'system', 
  'sync',
  'auth',
  'admin'
]

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {},
    byPriority: {},
    today: 0,
    thisWeek: 0
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<NotificationFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())
  const [realtimeEnabled, setRealtimeEnabled] = useState(true)
  const { addNotification } = useUIStore()

  // Fonctions utilitaires
  const fetchNotifications = async () => {
    setLoading(true)
    try {
      // Appel API réel pour récupérer les notifications
      const response = await apiClient.getNotifications({
        page: currentPage,
        page_size: 20,
        ...filters
      })
      
      if (response.data) {
        setNotifications(response.data.items || [])
        setTotalPages(response.data.total_pages || 1)
        
        // Calculer les statistiques
        const items = response.data.items || []
        const stats: NotificationStats = {
          total: items.length,
          unread: items.filter((n: any) => !n.read).length,
          byType: {},
          byPriority: {},
          today: 0,
          thisWeek: 0
        }
        
        // Calculer les statistiques par type et priorité
        items.forEach((notification: any) => {
          stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1
          stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1
          
          const notifDate = new Date(notification.created_at)
          const today = new Date()
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          
          if (notifDate.toDateString() === today.toDateString()) {
            stats.today++
          }
          if (notifDate >= weekAgo) {
            stats.thisWeek++
          }
        })
        
        setStats(stats)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // En cas d'erreur, utiliser des données vides
      setNotifications([])
      setStats({
        total: 0,
        unread: 0,
        byType: {},
        byPriority: {},
        today: 0,
        thisWeek: 0
      })
    } finally {
      setLoading(false)
    }
  }

  // Autres fonctions utilitaires
  const exportNotifications = async () => {
    try {
      await apiClient.exportNotifications(filters)
      addNotification({
        type: 'success',
        title: 'Export réussi',
        message: 'Les notifications ont été exportées',
        read: false,
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur d\'export',
        message: 'Impossible d\'exporter les notifications',
        read: false,
      })
    }
  }

  const toggleRealtime = () => {
    const newState = !realtimeEnabled
    setRealtimeEnabled(newState)
    
    if (newState) {
      // Connecter WebSocket
      const token = localStorage.getItem('access_token')
      if (token) {
        wsService.connect(token)
      }
    } else {
      // Déconnecter WebSocket
      wsService.disconnect()
    }
    
    addNotification({
      type: 'info',
      title: newState ? 'Temps réel activé' : 'Temps réel désactivé',
      message: newState ? 'Vous recevrez les notifications en temps réel' : 'Les notifications en temps réel sont désactivées',
      read: false,
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'scan_success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'scan_late':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'scan_absent':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'system_info':
        return <Info className="w-5 h-5 text-blue-500" />
      case 'system_warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case 'sync_complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50'
      case 'high':
        return 'text-orange-600 bg-orange-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const toggleSelection = (notificationId: string) => {
    const newSelection = new Set(selectedNotifications)
    if (newSelection.has(notificationId)) {
      newSelection.delete(notificationId)
    } else {
      newSelection.add(notificationId)
    }
    setSelectedNotifications(newSelection)
  }

  const selectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set())
    } else {
      setSelectedNotifications(new Set(notifications.map((n: any) => n.id)))
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return format(date, 'dd MMM yyyy à HH:mm', { locale: fr })
    } catch {
      return 'Date invalide'
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.markNotificationAsRead(notificationId)
      // Mettre à jour l'état local
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error)
    }
  }

  
  useEffect(() => {
    fetchNotifications()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 bg-chat flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
          <p className="text-text-primary mt-4">Chargement des notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-chat">
      {/* Actions Header */}
      <div className="flex justify-between items-center p-6 pb-0">
        <div>
          <h1 className="text-text-primary text-2xl font-bold">
            Notifications
          </h1>
          <p className="text-text-secondary text-sm">
            {stats.unread} non lue(s) sur {stats.total} totale(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            icon={realtimeEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
            variant={realtimeEnabled ? "outline" : "danger"}
            size="sm"
            onClick={toggleRealtime}
          >
            {realtimeEnabled ? 'Temps réel' : 'Hors ligne'}
          </Button>
          <Button
            icon={<Download size={16} />}
            variant="outline"
            size="sm"
            onClick={exportNotifications}
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-whatsapp p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total</p>
              <p className="text-text-primary text-2xl font-bold">{stats.total}</p>
            </div>
            <Bell className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="card-whatsapp p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Non lues</p>
              <p className="text-text-primary text-2xl font-bold">{stats.unread}</p>
            </div>
            <Bell className="w-8 h-8 text-warning" />
          </div>
        </div>
        
        {/* Filters Section */}
        {showFilters && (
          <div className="card-whatsapp p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Filtres</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Type</label>
              <select
                  className="input-whatsapp w-full"
                  value={filters.type || ''}
                  onChange={(e) => setFilters({...filters, type: e.target.value || undefined})}
                >
                  <option value="">Tous les types</option>
                  {NOTIFICATION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-1">Priorité</label>
                <select
                  className="input-whatsapp w-full"
                  value={filters.priority || ''}
                  onChange={(e) => setFilters({...filters, priority: e.target.value || undefined})}
                >
                  <option value="">Toutes les priorités</option>
                  {PRIORITY_LEVELS.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-1">Source</label>
                <select
                  className="input-whatsapp w-full"
                  value={filters.source || ''}
                  onChange={(e) => setFilters({...filters, source: e.target.value || undefined})}
                >
                  <option value="">Toutes les sources</option>
                  {SOURCES.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-1">Statut</label>
                <select
                  className="input-whatsapp w-full"
                  value={filters.read === undefined ? '' : filters.read.toString()}
                  onChange={(e) => setFilters({...filters, read: e.target.value === '' ? undefined : e.target.value === 'true'})}
                >
                  <option value="">Toutes</option>
                  <option value="false">Non lues</option>
                  <option value="true">Lues</option>
                </select>
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-1">Date début</label>
                <input
                  type="date"
                  className="input-whatsapp w-full"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-1">Date fin</label>
                <input
                  type="date"
                  className="input-whatsapp w-full"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                />
              </div>

              <div className="md:col-span-2 flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({})
                    setCurrentPage(1)
                  }}
                  className="w-full"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-dots justify-center">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
              <p className="text-text-secondary mt-4">Chargement des notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">Bientôt disponible</p>
              <p className="text-text-secondary text-sm mt-2">Le système de notifications sera bientôt opérationnel</p>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="flex items-center gap-2 p-3 bg-hover-bg rounded-lg">
                <input
                  type="checkbox"
                  checked={selectedNotifications.size === notifications.length}
                  onChange={selectAll}
                  className="rounded border-border"
                />
                <span className="text-text-secondary text-sm">
                  {selectedNotifications.size === notifications.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                </span>
              </div>

              {notifications.map((notification) => {
                const iconElement = getNotificationIcon(notification.type)
                const priorityColor = getPriorityColor(notification.priority)
                const isSelected = selectedNotifications.has(notification.id)

                return (
                  <div
                    key={notification.id}
                    className={`card-whatsapp p-4 hover:border-border-light transition-all duration-200 cursor-pointer ${
                      !notification.read ? 'bg-hover-bg' : ''
                    } ${isSelected ? 'border-primary' : ''}`}
                    onClick={() => toggleSelection(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(notification.id)}
                        className="rounded border-border mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />

                      <div className={`p-2 rounded-lg bg-opacity-10 ${
                        notification.priority === 'critical' ? 'bg-error' :
                        notification.priority === 'high' ? 'bg-warning' :
                        notification.priority === 'medium' ? 'bg-info' :
                        'bg-text-muted'
                      }`}>
                        {iconElement}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-text-primary font-medium ${
                                !notification.read ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${priorityColor} bg-opacity-10`}>
                                {notification.priority}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                              )}
                            </div>
                            
                            <p className="text-text-secondary text-sm mb-2">
                              {notification.message}
                            </p>

                            {/* Additional Data */}
                            {notification.data && (
                              <div className="bg-hover-bg rounded-lg p-3 mb-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                  {notification.data.employee && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-text-primary">Employé:</span>
                                      <span className="text-text-secondary">{notification.data.employee.name}</span>
                                      <span className="text-text-muted">({notification.data.employee.matricule})</span>
                                    </div>
                                  )}
                                  {notification.data.scan && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-text-primary">Pointage:</span>
                                      <span className="text-text-secondary">{notification.data.scan.time}</span>
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        notification.data.scan.status === 'PRESENT' ? 'bg-success/20 text-success' :
                                        notification.data.scan.status === 'LATE' ? 'bg-warning/20 text-warning' :
                                        notification.data.scan.status === 'ABSENT' ? 'bg-error/20 text-error' :
                                        'bg-info/20 text-info'
                                      }`}>
                                        {notification.data.scan.status === 'PRESENT' ? 'Présent' :
                                         notification.data.scan.status === 'LATE' ? 'Retard' :
                                         notification.data.scan.status === 'ABSENT' ? 'Absent' :
                                         notification.data.scan.status}
                                      </span>
                                    </div>
                                  )}
                                  {notification.data.scan?.device && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-text-primary">Terminal:</span>
                                      <span className="text-text-secondary">{notification.data.scan.device}</span>
                                    </div>
                                  )}
                                  {notification.data.auth && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-text-primary">Auth:</span>
                                      <span className="text-text-secondary">{notification.data.auth.username}</span>
                                      <span className="text-text-muted">depuis {notification.data.auth.ip}</span>
                                    </div>
                                  )}
                                  {notification.data.sync && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-text-primary">Sync:</span>
                                      <span className="text-text-secondary">{notification.data.sync.operation}</span>
                                      <span className="text-text-muted">({notification.data.sync.count} éléments)</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                              <span>{notification.source}</span>
                              <span>{formatTimestamp(notification.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            
            <span className="text-text-secondary text-sm">
              Page {currentPage} sur {totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
