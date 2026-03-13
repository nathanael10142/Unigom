import React, { useState, useEffect } from 'react'
import { Fingerprint, RefreshCw, Download, Search, UserCheck, UserX, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '../components/ui/Button'
import apiClient from '../utils/api'
import { useUIStore } from '../stores/uiStore'
import type { Attendance, ScanLog } from '../types'

interface AttendanceRecord {
  id: number
  employee_id: string
  employee_name: string
  department: string
  date: string
  time_in?: string
  time_out?: string
  status: string
  scan_count: number
  created_at: string
}

interface ScanLogRecord {
  id: number
  employee_id: string
  employee_name: string
  department: string
  scanned_at: string
  raw_time: string
  serial_no?: number
  created_at: string
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export const AttendancePage: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [scanLogs, setScanLogs] = useState<ScanLogRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedStatus, setSelectedStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const { isSyncing, setSyncing, addNotification } = useUIStore()

  const fetchAttendanceData = async () => {
    setLoading(true)
    try {
      // Récupérer les pointages du jour ou avec filtres
      const params = new URLSearchParams()
      
      if (selectedDate) {
        const dateObj = new Date(selectedDate)
        const today = new Date()
        
        if (dateObj.toDateString() === today.toDateString()) {
          // Si c'est aujourd'hui, utiliser l'endpoint /today
          const response = await fetch('/api/v1/attendance/today', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            setAttendance(data)
            setTotalCount(data.length)
            setTotalPages(1)
          }
        } else {
          // Sinon utiliser l'endpoint /history avec pagination
          params.append('date_from', selectedDate)
          params.append('date_to', selectedDate)
          if (selectedStatus) params.append('status', selectedStatus)
          if (searchTerm) params.append('search', searchTerm)
          params.append('page', currentPage.toString())
          params.append('page_size', '20')
          
          const response = await fetch(`/api/v1/attendance/history?${params}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          })
          if (response.ok) {
            const data: PaginatedResponse<AttendanceRecord> = await response.json()
            setAttendance(data.items)
            setTotalCount(data.total)
            setTotalPages(data.total_pages)
          }
        }
      }
      
      // Récupérer les scans récents (derniers 10)
      const scansParams = new URLSearchParams()
      scansParams.append('page_size', '10')
      if (selectedDate) {
        scansParams.append('date_from', selectedDate)
        scansParams.append('date_to', selectedDate)
      }
      
      const scansResponse = await fetch(`/api/v1/attendance/scans?${scansParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (scansResponse.ok) {
        const scansData: PaginatedResponse<ScanLogRecord> = await scansResponse.json()
        setScanLogs(scansData.items)
      }
      
    } catch (error) {
      console.error('Error fetching attendance data:', error)
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les données de pointage',
        read: false,
      })
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
        message: 'Pointages synchronisés avec succès',
        read: false,
      })
      await fetchAttendanceData() // Refresh data
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

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedDate) {
        params.append('date_from', selectedDate)
        params.append('date_to', selectedDate)
      }
      if (selectedStatus) params.append('status', selectedStatus)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/v1/attendance/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `presence_${selectedDate}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        addNotification({
          type: 'success',
          title: 'Export',
          message: 'Données exportées avec succès',
          read: false,
        })
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export',
        message: 'Erreur lors de l\'export',
        read: false,
      })
    }
  }

  useEffect(() => {
    fetchAttendanceData()
  }, [selectedDate, selectedStatus, searchTerm, currentPage])

  // Écouter les mises à jour WebSocket
  useEffect(() => {
    const handleAttendanceUpdate = () => {
      fetchAttendanceData()
    }

    window.addEventListener('attendance_update', handleAttendanceUpdate as EventListener)
    return () => {
      window.removeEventListener('attendance_update', handleAttendanceUpdate as EventListener)
    }
  }, [selectedDate, selectedStatus, searchTerm, currentPage])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <UserCheck className="w-4 h-4 text-success" />
      case 'LATE':
        return <Clock className="w-4 h-4 text-warning" />
      case 'ABSENT':
        return <UserX className="w-4 h-4 text-error" />
      case 'REFUSED':
        return <UserX className="w-4 h-4 text-error" />
      default:
        return <Clock className="w-4 h-4 text-text-muted" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'text-success bg-success/10'
      case 'LATE':
        return 'text-warning bg-warning/10'
      case 'ABSENT':
        return 'text-error bg-error/10'
      case 'REFUSED':
        return 'text-error bg-error/10'
      default:
        return 'text-text-muted bg-hover-bg'
    }
  }

  return (
    <div className="flex-1 bg-chat">
      {/* Actions Header */}
      <div className="flex justify-between items-center p-6 pb-0">
        <div>
          <h1 className="text-text-primary text-2xl font-bold">
            Pointages du Jour
          </h1>
          <p className="text-text-secondary text-sm">
            {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: fr })}
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

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card-whatsapp">
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-success" />
              <div>
                <p className="text-text-secondary text-xs">Présents</p>
                <p className="text-text-primary text-lg font-bold">{attendance.filter(record => record.status === 'PRESENT').length}</p>
              </div>
            </div>
          </div>
          <div className="card-whatsapp">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-warning" />
              <div>
                <p className="text-text-secondary text-xs">Retards</p>
                <p className="text-text-primary text-lg font-bold">{attendance.filter(record => record.status === 'LATE').length}</p>
              </div>
            </div>
          </div>
          <div className="card-whatsapp">
            <div className="flex items-center gap-3">
              <UserX className="w-5 h-5 text-error" />
              <div>
                <p className="text-text-secondary text-xs">Absents</p>
                <p className="text-text-primary text-lg font-bold">{attendance.filter(record => record.status === 'ABSENT').length}</p>
              </div>
            </div>
          </div>
          <div className="card-whatsapp">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-primary" />
              <div>
                <p className="text-text-secondary text-xs">Total Scans</p>
                <p className="text-text-primary text-lg font-bold">{scanLogs.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="date"
            className="input-whatsapp"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value)
              setCurrentPage(1) // Reset to first page when date changes
            }}
          />
          
          <select
            className="input-whatsapp"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value)
              setCurrentPage(1) // Reset to first page when filter changes
            }}
          >
            <option value="">Tous les statuts</option>
            <option value="PRESENT">Présents</option>
            <option value="LATE">Retards</option>
            <option value="ABSENT">Absents</option>
            <option value="REFUSED">Refusés</option>
          </select>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un employé..."
              className="input-whatsapp pl-10 w-full"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Reset to first page when search changes
              }}
            />
          </div>

          <Button
            icon={<Download size={20} />}
            variant="outline"
            onClick={handleExport}
          >
            Exporter
          </Button>
        </div>

        {/* Results count */}
        <div className="mb-4 text-text-secondary text-sm">
          {totalCount > 0 ? (
            <span>Affichage de {attendance.length} sur {totalCount} pointage(s)</span>
          ) : (
            <span>Aucun pointage trouvé</span>
          )}
        </div>

        {/* Attendance List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-dots justify-center">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
              <p className="text-text-secondary mt-4">Chargement des pointages...</p>
            </div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-8">
              <Fingerprint className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">Aucun pointage trouvé pour cette période</p>
            </div>
          ) : (
            attendance.map((record) => (
              <div
                key={record.id}
                className="card-whatsapp p-4 hover:border-border-light transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="avatar avatar-md bg-primary text-white">
                      {record.employee_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    
                    {/* Employee Info */}
                    <div>
                      <h3 className="text-text-primary font-semibold">
                        {record.employee_name || 'Inconnu'}
                      </h3>
                      <p className="text-text-secondary text-sm">
                        {record.department || 'Département non spécifié'}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-text-muted text-xs">
                          {record.time_in || 'Non pointé'}
                        </span>
                        <span className="text-text-muted text-xs">
                          {record.scan_count} scan(s)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      {record.status}
                    </div>
                  </div>
                </div>
              </div>
            ))
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

        {/* Recent Scan Logs */}
        {scanLogs.length > 0 && (
          <div className="mt-8">
            <h3 className="text-text-primary font-semibold mb-4">Scans Récents</h3>
            <div className="space-y-2">
              {scanLogs.map((log) => (
                <div key={log.id} className="card-whatsapp p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Fingerprint className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-text-primary text-sm">
                          {log.employee_name || 'Inconnu'}
                        </p>
                        <p className="text-text-secondary text-xs">
                          {format(new Date(log.scanned_at), 'HH:mm:ss')} - {log.department || 'Non spécifié'}
                        </p>
                      </div>
                    </div>
                    <span className="text-text-muted text-xs">
                      {format(new Date(log.scanned_at), 'HH:mm:ss')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
