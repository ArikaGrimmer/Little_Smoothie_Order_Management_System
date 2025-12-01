import { io, Socket } from 'socket.io-client'
import { ref, onBeforeUnmount } from 'vue'

export function useSocket() {
  const socket = ref<Socket | null>(null)
  const connected = ref(false)
  const error = ref<string>('')
  const joinedRooms = new Set<string>() // Track joined rooms to rejoin after reconnects

  const connect = (user?: any): Promise<Socket> => {
    if (import.meta.server) {
      return Promise.reject(new Error('Socket connections are client-only'))
    }

    return new Promise((resolve, reject) => {
      try {
        if (socket.value) {
          const existing = socket.value as Socket
          if (existing.connected) {
            resolve(existing)
            return
          }
          existing.removeAllListeners()
          existing.disconnect()
          socket.value = null
        }

        const runtimeConfig = useRuntimeConfig()
        const publicConfig = runtimeConfig.public as Record<string, unknown>
        const socketUrl = (publicConfig?.socketUrl as string) || 'http://localhost:4001'

  console.debug('[Socket] Connecting to', socketUrl)
  const newSocket = io(socketUrl, {
          auth: user ? { user } : undefined,
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5
        })

        let settled = false

        const handleConnect = () => {
          connected.value = true
          error.value = ''
          console.log('[Socket] Connected:', newSocket.id)
          joinedRooms.forEach((room) => {
            newSocket.emit('join', room, (ack: any) => {
              if (!ack?.ok) {
                console.warn(`[Socket] Auto rejoin failed for ${room}`, ack)
              }
            })
          })

          if (!settled) {
            settled = true
            resolve(newSocket)
          }
        }

        const handleDisconnect = (reason: string) => {
          connected.value = false
          console.log('[Socket] Disconnected:', reason)
        }

        const handleConnectError = (err: Error) => {
          error.value = `Connection error: ${err.message}`
          console.error('[Socket] Connection error:', err)
          if (!settled) {
            settled = true
            reject(err)
          }
        }

        newSocket.on('connect', handleConnect)
        newSocket.on('disconnect', handleDisconnect)
        newSocket.on('connect_error', handleConnectError)

        socket.value = newSocket
      } catch (err: any) {
        error.value = `Failed to initialize socket: ${err.message}`
        console.error('[Socket] Init error:', err)
        reject(err)
      }
    })
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.removeAllListeners()
      socket.value.disconnect()
      socket.value = null
      joinedRooms.clear()
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
          joinedRooms.add(room)
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
          joinedRooms.delete(room)
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


