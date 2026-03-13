// Service API désactivé pour éviter les erreurs 404 - MODE DÉMO
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

    // Response interceptor pour gérer les erreurs - MODE DÉMO
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        // Mode démo - ne pas afficher d'erreurs pour les appels API
        console.log('API call failed - mode démo:', error.message)
        
        // Simuler des réponses réussies pour éviter les erreurs
        if (error.config?.url?.includes('/dashboard/stats')) {
          return Promise.resolve({
            data: {
              total_employees: 156,
              present_today: 142,
              late_today: 8,
              absent_today: 6,
              total_scans_today: 2847
            }
          })
        }
        
        if (error.config?.url?.includes('/attendance')) {
          return Promise.resolve({
            data: {
              notifications: [],
              total_count: 0,
              current_page: 1,
              total_pages: 1
            }
          })
        }
        
        // Ne pas rediriger vers login en mode démo
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(credentials: { username: string; password: string }) {
    console.log('Login API désactivé - mode démo')
    return {
      data: {
        access_token: 'demo-token',
        admin: {
          id: 1,
          username: credentials.username,
          email: 'admin@unigom.edu',
          last_login: new Date().toISOString()
        }
      }
    }
  }

  async getMe() {
    console.log('GetMe API désactivé - mode démo')
    return {
      data: {
        id: 1,
        username: 'admin',
        email: 'admin@unigom.edu',
        last_login: new Date().toISOString()
      }
    }
  }

  // Employees endpoints
  async getEmployees() { 
    return { data: [] } 
  }

  async getEmployee() { 
    return { data: null } 
  }

  async createEmployee() { 
    return { data: null } 
  }

  async updateEmployee() { 
    return { data: null } 
  }

  async deleteEmployee() { 
    return { data: null } 
  }

  // Attendance endpoints
  async getAttendance() {
    console.log('Attendance API désactivé - mode démo')
    return {
      data: {
        notifications: [],
        total_count: 0,
        current_page: 1,
        total_pages: 1
      }
    }
  }

  async getAttendanceStats() {
    console.log('Attendance Stats API désactivé - mode démo')
    return {
      data: {
        total_employees: 156,
        present_today: 142,
        late_today: 8,
        absent_today: 6,
        total_scans_today: 2847
      }
    }
  }

  async syncAttendance() {
    console.log('Sync Attendance API désactivé - mode démo')
    return { data: { success: true } }
  }

  async getScanLogs() { 
    return { data: [] } 
  }

  async exportAttendance() { 
    return { data: null } 
  }

  // Dashboard endpoints
  async getDashboardStats() {
    console.log('Dashboard Stats API désactivé - mode démo')
    return {
      data: {
        total_employees: 156,
        present_today: 142,
        late_today: 8,
        absent_today: 6,
        total_scans_today: 2847
      }
    }
  }

  async getAttendanceTrends() { 
    return { data: [] } 
  }

  // Postes endpoints
  async getPostes() { 
    return { data: [] } 
  }

  async getPoste() { 
    return { data: null } 
  }

  async createPoste() { 
    return { data: null } 
  }

  async updatePoste() { 
    return { data: null } 
  }

  async deletePoste() { 
    return { data: null } 
  }

  async getPosteEmployees() { 
    return { data: [] } 
  }

  // Health check
  async healthCheck() { 
    return { data: { status: 'ok' } } 
  }
}

export const apiClient = new ApiClient()
export default apiClient
