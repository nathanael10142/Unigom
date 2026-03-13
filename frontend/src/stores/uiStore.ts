import { create } from 'zustand'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  read: boolean
  timestamp: Date
}

interface UIState {
  sidebarOpen: boolean
  notifications: NotificationItem[]
  unreadCount: number
  isSyncing: boolean
  lastSyncTime: Date | null
  
  // Actions
  setSidebarOpen: (open: boolean) => void
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  markAllAsRead: () => void
  setSyncing: (syncing: boolean) => void
  setLastSyncTime: (time: Date) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  notifications: [],
  unreadCount: 0,
  isSyncing: false,
  lastSyncTime: null,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addNotification: (notification) => {
    const id = Date.now().toString()
    const timestamp = new Date()
    const newNotification = { ...notification, read: false, id, timestamp }
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))

    // Auto remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(id)
    }, 5000)
  },

  removeNotification: (id) => {
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id)
      const unreadCount = notifications.filter((n) => !n.read).length
      
      return { notifications, unreadCount }
    })
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  setSyncing: (syncing) => set({ isSyncing: syncing }),
  
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
}))
