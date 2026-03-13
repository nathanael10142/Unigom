import React, { useState, useEffect } from 'react'
import { Users, UserPlus, Search, Edit, Fingerprint, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '../components/ui/Button'
import apiClient from '../utils/api'
import { useUIStore } from '../stores/uiStore'

interface Employee {
  uuid: string
  id: string // alias for uuid
  matricule: string
  full_name: string
  name: string // alias for full_name
  department: string
  position: string
  email?: string
  telephone?: string
  phone?: string // alias for telephone
  biometric_id?: string
  statut: string
  is_active: boolean
}

interface PaginatedResponse {
  items: Employee[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

interface CreateEmployeeForm {
  name: string
  email: string
  phone: string
  department: string
  position: string
  biometric_id: string
  matricule: string
  is_active: boolean
}

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [activeOnly, setActiveOnly] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [showBiometricModal, setShowBiometricModal] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<CreateEmployeeForm>({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    biometric_id: '',
    matricule: '',
    is_active: true
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
    'Marketing'
  ]

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('page_size', '20')
      if (searchTerm) params.append('search', searchTerm)
      if (selectedDepartment) params.append('department', selectedDepartment)
      params.append('active_only', activeOnly.toString())

      const response = await fetch(`/api/v1/employees?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        const data: PaginatedResponse = await response.json()
        setEmployees(data.items)
        setTotalCount(data.total)
        setTotalPages(data.total_pages)
      } else {
        throw new Error('Failed to fetch employees')
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les employés',
        read: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEmployee = async () => {
    setFormLoading(true)
    try {
      const response = await fetch('/api/v1/employees', {
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
          message: 'Employé créé avec succès',
          read: false,
        })
        setShowCreateForm(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          department: '',
          position: '',
          biometric_id: '',
          matricule: '',
          is_active: true
        })
        fetchEmployees()
      } else {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create employee')
      }
    } catch (error) {
      console.error('Error creating employee:', error)
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: error instanceof Error ? error.message : 'Impossible de créer l\'employé',
        read: false,
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateBiometric = async (employee: Employee, biometricId: string) => {
    try {
      const response = await fetch(`/api/v1/employees/${employee.uuid}/biometric`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ biometric_id: biometricId || null })
      })

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Succès',
          message: 'ID biométrique mis à jour',
          read: false,
        })
        setShowBiometricModal(null)
        fetchEmployees()
      } else {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to update biometric ID')
      }
    } catch (error) {
      console.error('Error updating biometric ID:', error)
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: error instanceof Error ? error.message : 'Impossible de mettre à jour l\'ID biométrique',
        read: false,
      })
    }
  }

  const handleSyncEmployees = async () => {
    try {
      const response = await fetch('/api/v1/employees/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        addNotification({
          type: 'success',
          title: 'Synchronisation',
          message: result.message || 'Employés synchronisés avec succès',
          read: false,
        })
        fetchEmployees()
      } else {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to sync employees')
      }
    } catch (error) {
      console.error('Error syncing employees:', error)
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: error instanceof Error ? error.message : 'Impossible de synchroniser les employés',
        read: false,
      })
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [currentPage, searchTerm, selectedDepartment, activeOnly])

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-success/10 text-success' 
          : 'bg-error/10 text-error'
      }`}>
        {isActive ? 'Actif' : 'Inactif'}
      </span>
    )
  }

  return (
    <div className="flex-1 bg-chat">
      {/* Page Header */}
      <div className="p-6 pb-0">
        <h1 className="text-text-primary text-2xl font-bold">
          Gestion des Employés
        </h1>
        <p className="text-text-secondary text-sm">
          {totalCount} employé(s) trouvé(s)
        </p>
      </div>

      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, ID biométrique..."
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
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active-only"
              checked={activeOnly}
              onChange={(e) => {
                setActiveOnly(e.target.checked)
                setCurrentPage(1)
              }}
              className="rounded border-border"
            />
            <label htmlFor="active-only" className="text-text-secondary text-sm">
              Actifs uniquement
            </label>
          </div>

          <Button
            icon={<RefreshCw size={20} />}
            variant="outline"
            onClick={handleSyncEmployees}
          >
            Synchroniser
          </Button>

          <Button
            icon={<UserPlus size={20} />}
            onClick={() => setShowCreateForm(true)}
          >
            Ajouter
          </Button>
        </div>

        {/* Results count */}
        <div className="mb-4 text-text-secondary text-sm">
          {totalCount > 0 ? (
            <span>Affichage de {employees.length} sur {totalCount} employé(s)</span>
          ) : (
            <span>Aucun employé trouvé</span>
          )}
        </div>

        {/* Employees List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-dots justify-center">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
              <p className="text-text-secondary mt-4">Chargement des employés...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">Aucun employé trouvé</p>
            </div>
          ) : (
            employees.map((employee) => (
              <div
                key={employee.uuid}
                className="card-whatsapp p-4 hover:border-border-light transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className={`avatar avatar-md ${
                      employee.is_active ? 'bg-primary' : 'bg-text-muted'
                    } text-white`}>
                      {employee.name?.charAt(0).toUpperCase() || 'E'}
                    </div>
                    
                    {/* Employee Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-text-primary font-semibold">
                          {employee.name || 'Nom non spécifié'}
                        </h3>
                        {getStatusBadge(employee.is_active)}
                      </div>
                      <p className="text-text-secondary text-sm">
                        {employee.position || 'Poste non spécifié'} • {employee.department || 'Département non spécifié'}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                        <span>{employee.email || 'Email non spécifié'}</span>
                        <span>{employee.phone || 'Téléphone non spécifié'}</span>
                        {employee.biometric_id && (
                          <span className="flex items-center gap-1">
                            <Fingerprint className="w-3 h-3" />
                            {employee.biometric_id}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      icon={<Fingerprint size={16} />}
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBiometricModal(employee)}
                      title="Modifier l'ID biométrique"
                    />
                    <Button
                      icon={<Edit size={16} />}
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingEmployee(employee)}
                      title="Modifier"
                    />
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
      </div>

      {/* Create Employee Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-chat border border-border rounded-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-text-primary text-lg font-semibold mb-4">Ajouter un Employé</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-text-secondary text-sm mb-1">Nom complet *</label>
                <input
                  type="text"
                  className="input-whatsapp w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-1">Email</label>
                <input
                  type="email"
                  className="input-whatsapp w-full"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-1">Téléphone</label>
                <input
                  type="tel"
                  className="input-whatsapp w-full"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-1">Matricule</label>
                <input
                  type="text"
                  className="input-whatsapp w-full"
                  value={formData.matricule}
                  onChange={(e) => setFormData({...formData, matricule: e.target.value})}
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
                <label className="block text-text-secondary text-sm mb-1">Poste</label>
                <input
                  type="text"
                  className="input-whatsapp w-full"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-1">ID Biométrique</label>
                <input
                  type="text"
                  className="input-whatsapp w-full"
                  value={formData.biometric_id}
                  onChange={(e) => setFormData({...formData, biometric_id: e.target.value})}
                  placeholder="Laisser vide pour aucun"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is-active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded border-border"
                  />
                  <label htmlFor="is-active" className="text-text-secondary text-sm">
                    Employé actif
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                disabled={formLoading}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateEmployee}
                disabled={formLoading || !formData.name.trim()}
                loading={formLoading}
                className="w-full sm:w-auto"
              >
                Créer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Biometric ID Modal */}
      {showBiometricModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-chat border border-border rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-4 sm:mx-auto">
            <h2 className="text-text-primary text-lg font-semibold mb-4">
              Modifier l'ID Biométrique
            </h2>
            <p className="text-text-secondary text-sm mb-4">
              {showBiometricModal.name}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm mb-1">ID Biométrique</label>
                <input
                  type="text"
                  className="input-whatsapp w-full"
                  defaultValue={showBiometricModal.biometric_id || ''}
                  placeholder="Laisser vide pour supprimer"
                  id="biometric-input"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowBiometricModal(null)}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button
                onClick={() => {
                  const input = document.getElementById('biometric-input') as HTMLInputElement
                  handleUpdateBiometric(showBiometricModal, input.value)
                }}
                className="w-full sm:w-auto"
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
