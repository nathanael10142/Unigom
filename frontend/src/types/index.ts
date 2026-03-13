// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Auth Types
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  admin: Admin
}

export interface Admin {
  id: number
  username: string
  is_active: boolean
  created_at?: string
  last_login?: string
}

// Employee Types
export interface Employee {
  id: number
  uuid: string
  name: string
  email: string
  phone?: string
  position?: string
  department?: string
  photo?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface EmployeeCreate {
  name: string
  email: string
  phone?: string
  position?: string
  department?: string
  photo?: string
}

export interface EmployeeUpdate {
  name?: string
  email?: string
  phone?: string
  position?: string
  department?: string
  photo?: string
  is_active?: boolean
}

// Attendance Types
export interface Attendance {
  id: number
  agent_uuid: string
  date: string
  arrival_time?: string
  departure_time?: string
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'REFUSED'
  scan_count: number
  created_at: string
  updated_at?: string
  agent?: Employee
}

export interface AttendanceRecord {
  id: number
  agent_uuid: string
  date: string
  arrival_time?: string
  departure_time?: string
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'REFUSED'
  scan_count: number
  agent: Employee
}

export interface ScanLog {
  id: number
  agent_uuid: string
  scanned_at: string
  raw_time: string
  serial_no?: number
  device_id: string
  campus_id: string
  agent?: Employee
}

// Dashboard Types
export interface DashboardStats {
  date: string
  present: number
  late: number
  absent: number
  refused: number
  total_employees: number
  attendance_rate: number
  is_weekend: boolean
}

export interface AttendanceTrend {
  date: string
  present: number
  late: number
  absent: number
  total: number
}

// Poste Types
export interface Poste {
  id: number
  name: string
  description?: string
  department: string
  parent_id?: number
  is_active: boolean
  created_at: string
  updated_at?: string
  children?: Poste[]
  employees_count?: number
}

export interface PosteCreate {
  name: string
  description?: string
  department: string
  parent_id?: number
}

export interface PosteUpdate {
  name?: string
  description?: string
  department?: string
  parent_id?: number
  is_active?: boolean
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'attendance_update' | 'sync_status' | 'notification'
  data: any
  timestamp: string
}

export interface AttendanceUpdate {
  agent_uuid: string
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'REFUSED'
  time: string
  agent: Employee
}

export interface SyncStatus {
  status: 'syncing' | 'completed' | 'error'
  message: string
  progress?: number
  total?: number
}

// UI Types
export interface NotificationItem {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
  data?: any
}

export interface SidebarItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
}

// Form Types
export interface FilterOptions {
  date?: string
  status?: string
  department?: string
  search?: string
}

// System Notification Types
export interface SystemNotification {
  id: string
  type: 'scan_success' | 'scan_failed' | 'scan_late' | 'scan_refused' | 'sync_start' | 'sync_complete' | 'sync_error' | 'auth_success' | 'auth_failed' | 'system_info' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  source: string
  data?: {
    employee?: {
      uuid: string
      name: string
      matricule: string
      department: string
    }
    scan?: {
      time: string
      status: string
      device: string
    }
    sync?: {
      operation: string
      count: number
      duration: number
    }
    auth?: {
      username: string
      ip: string
      reason: string
    }
    system?: {
      component: string
      status: string
      details: string
    }
  }
}

export interface NotificationFilters {
  type?: string
  priority?: string
  source?: string
  dateFrom?: string
  dateTo?: string
  read?: boolean
  search?: string
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<string, number>
  byPriority: Record<string, number>
  today: number
  thisWeek: number
}

export interface SortOptions {
  field: string
  order: 'asc' | 'desc'
}

// Utility Types
export type StatusColor = 'success' | 'warning' | 'error' | 'info'
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'REFUSED'
export type UserRole = 'admin' | 'user'
