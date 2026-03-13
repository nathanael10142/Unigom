import React, { useState, useEffect } from 'react'
import { Building, Plus, Search, Edit, Trash2, Users, ChevronDown, ChevronRight, Upload } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useUIStore } from '../stores/uiStore'
import type { Poste, PosteCreate, PosteUpdate } from '../types'

export const PostesPage: React.FC = () => {
  const [postes, setPostes] = useState<Poste[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [expandedPostes, setExpandedPostes] = useState<Set<number>>(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPoste, setEditingPoste] = useState<Poste | null>(null)
  const [formData, setFormData] = useState<PosteCreate>({
    name: '',
    description: '',
    department: '',
    parent_id: undefined
  })
  const [formLoading, setFormLoading] = useState(false)
  const { addNotification } = useUIStore()

  const departments = [
    'Direction Générale',
    'Ressources Humaines',
    'Finance',
    'IT',
    'Production',
    'Logistique',
    'Commercial',
    'Marketing',
    'Enseignement',
    'Maintenance'
  ]

  const fetchPostes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('page_size', '50')
      if (searchTerm) params.append('search', searchTerm)
      if (selectedDepartment) params.append('department', selectedDepartment)

      const response = await fetch(`/api/v1/postes?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPostes(data.items || data)
        setTotalCount(data.total || data.length)
        setTotalPages(data.total_pages || Math.ceil((data.total || data.length) / 50))
      } else {
        throw new Error('Failed to fetch postes')
      }
    } catch (error) {
      console.error('Error fetching postes:', error)
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les postes',
        read: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePoste = async () => {
    setFormLoading(true)
    try {
      const response = await fetch('/api/v1/postes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Succès',
          message: 'Poste créé avec succès',
          read: false,
        })
        setShowCreateModal(false)
        setFormData({
          name: '',
          description: '',
          department: '',
          parent_id: undefined
        })
        fetchPostes()
      } else {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create poste')
      }
    } catch (error) {
      console.error('Error creating poste:', error)
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: error instanceof Error ? error.message : 'Impossible de créer le poste',
        read: false,
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdatePoste = async (poste: Poste, updates: PosteUpdate) => {
    try {
      const response = await fetch(`/api/v1/postes/${poste.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Succès',
          message: 'Poste mis à jour avec succès',
          read: false,
        })
        setEditingPoste(null)
        fetchPostes()
      } else {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to update poste')
      }
    } catch (error) {
      console.error('Error updating poste:', error)
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: error instanceof Error ? error.message : 'Impossible de mettre à jour le poste',
        read: false,
      })
    }
  }

  const handleDeletePoste = async (poste: Poste) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le poste "${poste.name}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/v1/postes/${poste.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Succès',
          message: 'Poste supprimé avec succès',
          read: false,
        })
        fetchPostes()
      } else {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to delete poste')
      }
    } catch (error) {
      console.error('Error deleting poste:', error)
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: error instanceof Error ? error.message : 'Impossible de supprimer le poste',
        read: false,
      })
    }
  }

  const handleExportPostes = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedDepartment) params.append('department', selectedDepartment)

      const response = await fetch(`/api/v1/postes/export?${params}`, {
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
        a.download = `postes_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        addNotification({
          type: 'success',
          title: 'Export',
          message: 'Postes exportés avec succès',
          read: false,
        })
      }
    } catch (error) {
      console.error('Error exporting postes:', error)
      addNotification({
        type: 'error',
        title: 'Export',
        message: 'Impossible d\'exporter les postes',
        read: false,
      })
    }
  }

  useEffect(() => {
    fetchPostes()
  }, [currentPage, searchTerm, selectedDepartment])

  const toggleExpanded = (posteId: number) => {
    const newExpanded = new Set(expandedPostes)
    if (newExpanded.has(posteId)) {
      newExpanded.delete(posteId)
    } else {
      newExpanded.add(posteId)
    }
    setExpandedPostes(newExpanded)
  }

  // Organiser les postes en hiérarchie
  const organizePostes = (postes: Poste[]): Poste[] => {
    const posteMap = new Map<number, Poste>()
    const rootPostes: Poste[] = []

    // Créer une map de tous les postes
    postes.forEach(poste => {
      poste.children = []
      posteMap.set(poste.id, poste)
    })

    // Organiser en hiérarchie
    postes.forEach(poste => {
      if (poste.parent_id && posteMap.has(poste.parent_id)) {
        const parent = posteMap.get(poste.parent_id)!
        parent.children!.push(poste)
      } else {
        rootPostes.push(poste)
      }
    })

    return rootPostes
  }

  const renderPosteTree = (poste: Poste, level: number = 0) => {
    const isExpanded = expandedPostes.has(poste.id)
    const hasChildren = poste.children && poste.children.length > 0

    return (
      <div key={poste.id} className="w-full">
        <div
          className={`card-whatsapp p-4 hover:border-border-light transition-all duration-200 ${
            level > 0 ? 'ml-6' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Expand/Collapse Button */}
              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(poste.id)}
                  className="p-1 hover:bg-hover-bg rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-text-secondary" />
                  ) : (
                    <ChevronRight size={16} className="text-text-secondary" />
                  )}
                </button>
              )}

              {/* Poste Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="avatar avatar-sm bg-primary text-white">
                    {poste.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-text-primary font-semibold">
                      {poste.name}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      {poste.department}
                    </p>
                    {poste.description && (
                      <p className="text-text-muted text-xs mt-1">
                        {poste.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-text-secondary" />
                  <span className="text-text-secondary text-sm">
                    {poste.employees_count || 0}
                  </span>
                </div>
                
                <div
                  className={`w-2 h-2 rounded-full ${
                    poste.is_active ? 'bg-success' : 'bg-error'
                  }`}
                />
                
                <div className="flex items-center gap-1">
                  <button 
                    className="p-1.5 hover:bg-hover-bg rounded transition-colors"
                    onClick={() => setEditingPoste(poste)}
                  >
                    <Edit size={14} className="text-text-secondary" />
                  </button>
                  <button 
                    className="p-1.5 hover:bg-hover-bg rounded transition-colors"
                    onClick={() => handleDeletePoste(poste)}
                  >
                    <Trash2 size={14} className="text-error" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div className="mt-2">
              {poste.children!.map(child => renderPosteTree(child, level + 1))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const organizedPostes = organizePostes(postes)

  return (
    <div className="flex-1 bg-chat">
      {/* Actions Header */}
      <div className="flex justify-between items-center p-6 pb-0">
        <div>
          <h1 className="text-text-primary text-2xl font-bold">
            Gestion des Postes
          </h1>
          <p className="text-text-secondary text-sm">
            {totalCount} poste(s) trouvé(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<Upload size={16} />}
            variant="outline"
            size="sm"
            onClick={handleExportPostes}
          >
            Exporter
          </Button>
          <Button
            icon={<Plus size={20} />}
            onClick={() => setShowCreateModal(true)}
          >
            Ajouter Poste
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un poste..."
              className="input-whatsapp pl-10 w-full"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          
          <select
            className="input-whatsapp"
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">Tous les départements</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <div className="mb-4 text-text-secondary text-sm">
          {totalCount > 0 ? (
            <span>Affichage de {postes.length} sur {totalCount} poste(s)</span>
          ) : (
            <span>Aucun poste trouvé</span>
          )}
        </div>

        {/* Postes Tree */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-dots justify-center">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
              <p className="text-text-secondary mt-4">Chargement des postes...</p>
            </div>
          ) : organizedPostes.length === 0 ? (
            <div className="text-center py-8">
              <Building className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">Aucun poste trouvé</p>
            </div>
          ) : (
            organizedPostes.map(poste => renderPosteTree(poste))
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

        {/* Department Summary */}
        <div className="mt-8">
          <h3 className="text-text-primary font-semibold mb-4">Résumé par Département</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const deptPostes = postes.filter(p => p.department === dept)
              const totalEmployees = deptPostes.reduce((sum, p) => sum + (p.employees_count || 0), 0)
              
              return (
                <div key={dept} className="card-whatsapp p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-text-primary font-medium">{dept}</h4>
                      <p className="text-text-secondary text-sm">
                        {deptPostes.length} poste(s) • {totalEmployees} employé(s)
                      </p>
                    </div>
                    <Building className="w-8 h-8 text-primary opacity-50" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Create Poste Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-chat border border-border rounded-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg mx-4 sm:mx-auto">
            <h2 className="text-text-primary text-lg font-semibold mb-4">Ajouter un Poste</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-text-secondary text-sm mb-1">Nom du poste *</label>
                <input
                  type="text"
                  className="input-whatsapp w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-text-secondary text-sm mb-1">Description</label>
                <textarea
                  className="input-whatsapp w-full"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description du poste..."
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-1">Département</label>
                <select
                  className="input-whatsapp w-full"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                >
                  <option value="">Sélectionner un département</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-1">Poste parent</label>
                <select
                  className="input-whatsapp w-full"
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({...formData, parent_id: e.target.value ? parseInt(e.target.value) : undefined})}
                >
                  <option value="">Aucun (poste racine)</option>
                  {postes.map(poste => (
                    <option key={poste.id} value={poste.id}>{poste.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={formLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreatePoste}
                disabled={formLoading || !formData.name.trim()}
                loading={formLoading}
              >
                Créer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Poste Modal */}
      {editingPoste && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-chat border border-border rounded-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg mx-4 sm:mx-auto">
            <h2 className="text-text-primary text-lg font-semibold mb-4">Modifier le Poste</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-text-secondary text-sm mb-1">Nom du poste *</label>
                <input
                  type="text"
                  className="input-whatsapp w-full"
                  defaultValue={editingPoste.name}
                  id="edit-name"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-text-secondary text-sm mb-1">Description</label>
                <textarea
                  className="input-whatsapp w-full"
                  rows={3}
                  defaultValue={editingPoste.description || ''}
                  id="edit-description"
                  placeholder="Description du poste..."
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-1">Département</label>
                <select
                  className="input-whatsapp w-full"
                  defaultValue={editingPoste.department}
                  id="edit-department"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-1">Statut</label>
                <select
                  className="input-whatsapp w-full"
                  defaultValue={editingPoste.is_active ? 'true' : 'false'}
                  id="edit-status"
                >
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditingPoste(null)}
              >
                Annuler
              </Button>
              <Button
                onClick={() => {
                  const name = (document.getElementById('edit-name') as HTMLInputElement).value
                  const description = (document.getElementById('edit-description') as HTMLTextAreaElement).value
                  const department = (document.getElementById('edit-department') as HTMLSelectElement).value
                  const is_active = (document.getElementById('edit-status') as HTMLSelectElement).value === 'true'
                  
                  handleUpdatePoste(editingPoste, {
                    name,
                    description,
                    department,
                    is_active
                  })
                }}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
