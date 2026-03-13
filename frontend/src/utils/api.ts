import axios, { AxiosInstance, AxiosResponse } from 'axios'

// Service API désactivé pour éviter les erreurs 404 - MODE DÉMO
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'
class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor pour ajouter le token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor pour gérer les erreurs
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expiré ou invalide
          localStorage.removeItem('access_token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(credentials: { username: string; password: string }) {
    // Convertir vers le format OAuth2PasswordRequestForm attendu par le backend
    const formData = new FormData()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    
    return this.client.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  }

  async getMe() {
    return this.client.get('/auth/me')
  }

  // Employees endpoints
  async getEmployees() { 
    return this.client.get('/employees')
  }

  async getEmployee(id: number) { 
    return this.client.get(`/employees/${id}`)
  }

  async createEmployee(data: any) { 
    return this.client.post('/employees', data)
  }

  async updateEmployee(id: number, data: any) { 
    return this.client.put(`/employees/${id}`, data)
  }

  async deleteEmployee(id: number) { 
    return this.client.delete(`/employees/${id}`)
  }

  // Attendance endpoints
  async getAttendance(params?: any) {
    return this.client.get('/attendance/history', { params })
  }

  async getAttendanceStats() {
    return this.client.get('/dashboard/stats')
  }

  async syncAttendance() {
    return this.client.post('/attendance/sync')
  }

  async getScanLogs(params?: any) { 
    return this.client.get('/attendance/scans', { params })
  }

  async exportAttendance(params?: any) { 
    return this.client.get('/attendance/export', { params })
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.client.get('/dashboard/stats')
  }

  async getAttendanceTrends() {
    return this.client.get('/dashboard/trends')
  }

  // Postes endpoints
  async getPostes(params?: any) {
    // Convertir page/page_size en skip/limit pour le backend
    const page = params?.page || 1
    const pageSize = params?.page_size || 50
    const skip = (page - 1) * pageSize
    
    const backendParams = {
      skip,
      limit: pageSize,
      statut: params?.statut,
      departement: params?.departement
    }
    
    return this.client.get('/postes', { params: backendParams })
  }

  async getPoste(id: number) { 
    return this.client.get(`/postes/${id}`)
  }

  async createPoste(data: any) { 
    return this.client.post('/postes', data)
  }

  async updatePoste(id: number, data: any) { 
    return this.client.put(`/postes/${id}`, data)
  }

  async deletePoste(id: number) { 
    return this.client.delete(`/postes/${id}`)
  }

  async getPosteEmployees(id: number) { 
    return this.client.get(`/postes/${id}/employees`)
  }

  // Notifications endpoints - Bientôt disponibles
  async getNotifications(params?: any) {
    return {
      data: {
        items: [],
        total: 0,
        page: 1,
        total_pages: 0
      }
    }
  }

  async markNotificationAsRead(id: string) {
    return { data: { success: true } }
  }

  async exportNotifications(params?: any) {
    return { data: { success: true, message: 'Bientôt disponible' } }
  }

  // Health check
  async healthCheck() { 
    return this.client.get('/health')
  }
}

export const apiClient = new ApiClient()
export default apiClient
