import { io, Socket } from 'socket.io-client'
import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useSocket() {
  const socket = ref<Socket | null>(null)
  const connected = ref(false)
  const error = ref<string>('')

  const connect = (token?: string) => {
    try {
      const socketUrl = process.env.NODE_ENV === 'production'
        ? 'wss://your-production-url.com'
        : 'http://localhost:4001'

      socket.value = io(socketUrl, {
        auth: token ? { token } : undefined,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      })

      socket.value.on('connect', () => {
        connected.value = true
        console.log('[Socket] Connected:', socket.value?.id)
      })

      socket.value.on('disconnect', (reason) => {
        connected.value = false
        console.log('[Socket] Disconnected:', reason)
      })

      socket.value.on('connect_error', (err) => {
        error.value = `Connection error: ${err.message}`
        console.error('[Socket] Connection error:', err)
      })
    } catch (err: any) {
      error.value = `Failed to initialize socket: ${err.message}`
      console.error('[Socket] Init error:', err)
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
    }
  }

  const joinRoom = (room: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket.value || !connected.value) {
        reject(new Error('Socket not connected'))
        return
      }

      socket.value.emit('join', room, (response: any) => {
        if (response.ok) {
          console.log(`[Socket] Joined room: ${room}`)
          resolve(response)
        } else {
          reject(new Error(response.error || 'Failed to join room'))
        }
      })
    })
  }

  const leaveRoom = (room: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket.value) {
        reject(new Error('Socket not connected'))
        return
      }

      socket.value.emit('leave', room, (response: any) => {
        if (response.ok) {
          console.log(`[Socket] Left room: ${room}`)
          resolve(response)
        } else {
          reject(new Error(response.error || 'Failed to leave room'))
        }
      })
    })
  }

  const sendMessage = (room: string, text: string, meta?: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket.value || !connected.value) {
        reject(new Error('Socket not connected'))
        return
      }

      socket.value.emit('message', { room, text, meta }, (response: any) => {
        if (response.ok) {
          resolve(response)
        } else {
          reject(new Error(response.error || 'Failed to send message'))
        }
      })
    })
  }

  const onMessage = (callback: (msg: any) => void) => {
    if (socket.value) {
      socket.value.on('message', callback)
    }
  }

  const onPresence = (callback: (presence: any) => void) => {
    if (socket.value) {
      socket.value.on('presence', callback)
    }
  }

  const offMessage = () => {
    if (socket.value) {
      socket.value.off('message')
    }
  }

  const offPresence = () => {
    if (socket.value) {
      socket.value.off('presence')
    }
  }

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    socket,
    connected,
    error,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    onMessage,
    onPresence,
    offMessage,
    offPresence
  }
}


