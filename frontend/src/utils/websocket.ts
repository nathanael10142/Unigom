class WebSocketService {
  private ws: WebSocket | null = null
  private token: string | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 5000
  private eventListeners: { [key: string]: ((data: any) => void)[] } = {}

  connect(token: string) {
    this.token = token
    const wsUrl = `${(import.meta as any).env.VITE_WS_URL || 'ws://localhost:8000'}/api/v1/ws`
    
    try {
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('WebSocket connecté')
        this.reconnectAttempts = 0
        // Send authentication token
        this.send('auth', { token })
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const eventType = data.type || 'message'
          if (this.eventListeners[eventType]) {
            this.eventListeners[eventType].forEach(callback => callback(data))
          }
        } catch (error) {
          console.error('Erreur parsing WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket déconnecté')
        this.handleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

    } catch (error) {
      console.error('Erreur connexion WebSocket:', error)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  send(event: string, data: any) {
    if (this.isConnected()) {
      this.ws!.send(JSON.stringify({ type: event, data }))
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event].push(callback)
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.eventListeners[event]) {
      if (callback) {
        this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback)
      } else {
        delete this.eventListeners[event]
      }
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Tentative de reconnexion WebSocket ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      setTimeout(() => {
        if (this.token) {
          this.connect(this.token)
        }
      }, this.reconnectInterval)
    }
  }
}

export const wsService = new WebSocketService()
export default wsService
