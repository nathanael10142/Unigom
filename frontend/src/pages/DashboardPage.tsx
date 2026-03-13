import React, { useState, useEffect } from 'react'
import { Users, UserCheck, UserX, Clock, TrendingUp, Activity, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '../components/ui/Button'
import apiClient from '../utils/api'
import { useUIStore } from '../stores/uiStore'
import type { DashboardStats } from '../types'

interface WeeklyDataPoint {
  date: string
  day_label: string
  present: number
  late: number
  absent: number
  refused: number
}

interface RecentActivity {
  id: number
  employee_name: string
  time: string
  status: 'PRÉSENT' | 'RETARD' | 'ABSENT' | 'REFUSÉ'
  department?: string
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [weeklyData, setWeeklyData] = useState<WeeklyDataPoint[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const { addNotification, isSyncing, setSyncing } = useUIStore()

  const fetchDashboardData = async () => {
    try {
      // Récupérer les statistiques du jour
      const statsResponse = await apiClient.getDashboardStats()
      if (statsResponse.data) {
        setStats(statsResponse.data)
      } else {
        setStats(null)
      }
      
      // Récupérer les données hebdomadaires
      const weeklyResponse = await fetch('/api/v1/dashboard/weekly', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (weeklyResponse.ok) {
        const weekly = await weeklyResponse.json()
        setWeeklyData(weekly)
      }
      
      // Récupérer les activités récentes (derniers pointages)
      const attendanceResponse = await apiClient.getAttendance({ page: 1, page_size: 10 })
      if (attendanceResponse.data) {
        const activities: RecentActivity[] = attendanceResponse.data.items.map((item: any) => ({
          id: item.id,
          employee_name: item.employee_name,
          time: item.time_in || 'Non pointé',
          status: item.status === 'PRESENT' ? 'PRÉSENT' : 
                  item.status === 'LATE' ? 'RETARD' : 
                  item.status === 'ABSENT' ? 'ABSENT' : 'REFUSÉ',
          department: item.department
        }))
        setRecentActivities(activities.slice(0, 5)) // Limiter à 5 activités récentes
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set default values when API fails
      setStats(null)
      setWeeklyData([])
      setRecentActivities([])
      
      // Only show notification if it's not a 404 (backend not running)
      if ((error as any).response?.status !== 404) {
        addNotification({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger les données du tableau de bord',
          read: false,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await apiClient.syncAttendance()
      addNotification({
        type: 'success',
        title: 'Synchronisation',
        message: 'Données synchronisées avec succès',
        read: false,
      })
      await fetchDashboardData() // Rafraîchir les données
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Synchronisation',
        message: 'Erreur lors de la synchronisation',
        read: false,
      })
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Configurer le rafraîchissement automatique toutes les 30 secondes
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const statCards = [
    {
      title: 'Total Employés',
      value: stats?.total_employees || 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Présents',
      value: stats?.present || 0,
      icon: UserCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Retards',
      value: stats?.late || 0,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Absents',
      value: stats?.absent || 0,
      icon: UserX,
      color: 'text-error',
      bgColor: 'bg-error/10',
    },
  ]

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-primary">Chargement du tableau de bord...</p>
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
            Tableau de Bord
          </h1>
          <p className="text-text-secondary text-sm">
            Vue d'ensemble du {(() => {
              try {
                const dateToFormat = stats && stats.date ? new Date(stats.date) : new Date()
                if (isNaN(dateToFormat.getTime())) {
                  return format(new Date(), 'dd MMMM yyyy', { locale: fr })
                }
                return format(dateToFormat, 'dd MMMM yyyy', { locale: fr })
              } catch {
                return format(new Date(), 'dd MMMM yyyy', { locale: fr })
              }
            })()}
          </p>
        </div>
        <Button
          icon={<RefreshCw size={16} />}
          onClick={handleSync}
          loading={isSyncing}
          variant="outline"
        >
          {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (
              <div key={index} className="card-whatsapp">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">{card.title}</p>
                    <p className="text-text-primary text-2xl font-bold mt-1">
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Attendance Rate */}
        <div className="card-whatsapp">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-text-primary font-semibold">Taux de Présence</h3>
              <p className="text-text-secondary text-sm">Aujourd'hui</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{stats?.attendance_rate || 0}%</p>
              {stats?.is_weekend && (
                <p className="text-text-muted text-xs">Weekend</p>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        {weeklyData.length > 0 && (
          <div className="card-whatsapp">
            <h3 className="text-text-primary font-semibold mb-4">Statistiques Hebdomadaires</h3>
            <div className="space-y-3">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm w-12">{day.day_label}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex gap-1 h-6">
                      <div 
                        className="bg-success rounded-sm" 
                        style={{ width: `${(day.present / Math.max(day.present + day.late + day.absent + day.refused, 1)) * 100}%` }}
                        title={`Présents: ${day.present}`}
                      />
                      <div 
                        className="bg-warning rounded-sm" 
                        style={{ width: `${(day.late / Math.max(day.present + day.late + day.absent + day.refused, 1)) * 100}%` }}
                        title={`Retards: ${day.late}`}
                      />
                      <div 
                        className="bg-error rounded-sm" 
                        style={{ width: `${(day.absent / Math.max(day.present + day.late + day.absent + day.refused, 1)) * 100}%` }}
                        title={`Absents: ${day.absent}`}
                      />
                    </div>
                  </div>
                  <span className="text-text-muted text-xs">
                    {day.present + day.late + day.absent + day.refused}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-sm"></div>
                <span className="text-text-secondary">Présents</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning rounded-sm"></div>
                <span className="text-text-secondary">Retards</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-error rounded-sm"></div>
                <span className="text-text-secondary">Absents</span>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <div className="card-whatsapp">
            <h3 className="text-text-primary font-semibold mb-4">Activités Récentes</h3>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-hover-bg rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'PRÉSENT' ? 'bg-success' :
                    activity.status === 'RETARD' ? 'bg-warning' : 'bg-error'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-text-primary text-sm">{activity.employee_name} a pointé</p>
                    <p className="text-text-secondary text-xs">{activity.time} {activity.department && `• ${activity.department}`}</p>
                  </div>
                  <span className={`text-xs font-medium ${
                    activity.status === 'PRÉSENT' ? 'text-success' :
                    activity.status === 'RETARD' ? 'text-warning' : 'text-error'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Sync Info */}
        {stats && (
          <div className="text-center">
            <p className="text-text-muted text-sm">
              Dernière synchronisation: {format(new Date(), 'HH:mm:ss')}
            </p>
            {stats.is_weekend && (
              <p className="text-text-muted text-xs mt-1">
                Mode weekend - Les statistiques peuvent être réduites
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
