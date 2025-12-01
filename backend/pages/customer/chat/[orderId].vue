<template>
  <div class="chat-page">
    <header class="header">
      <NuxtLink to="/customer/orders" class="back-button">← Back</NuxtLink>
      <h1>Order Chat</h1>
      <UserProfile />
    </header>

    <div class="container">
      <div v-if="loading" class="loading">Loading chat...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else>
        <div class="order-info">
          <h2>Order #{{ shortId }}</h2>
          <p>Status: {{ formatStatus(order.status) }}</p>
        </div>

        <div class="chat-box">
          <div id="messages" class="messages">
            <div v-for="m in messages" :key="m.id" class="message">
              <strong>{{ m.user?.name || m.user?.email }}:</strong>
              <span class="text">{{ m.text }}</span>
              <small class="ts">{{ formatTs(m.ts) }}</small>
            </div>
          </div>

          <div class="composer">
            <input v-model="text" type="text" placeholder="Type a message..." @keydown.enter="send" />
            <button @click="send" class="btn btn-primary">Send</button>
          </div>
          <div v-if="socketError" class="socket-error">{{ socketError }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSocket } from '~/composables/useSocket'

const route = useRoute()
const router = useRouter()
const orderId = String(route.params.orderId || '')

const loading = ref(true)
const error = ref('')
const order = ref<any>(null)
const messages = ref<any[]>([])
const text = ref('')

const { connected, connect, disconnect, joinRoom, leaveRoom, sendMessage, onMessage, onPresence, offMessage, offPresence, error: socketError } = useSocket()

const shortId = computed(() => orderId.slice(-8))

function formatStatus(s: string) {
  const map: Record<string,string> = { queued: 'Queued', blending: 'In Preparation', ready: 'Ready', picked_up: 'Completed', draft: 'Draft' }
  return map[s] || s
}

function formatTs(ts: number) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString()
}

async function loadAndAuthorize() {
  loading.value = true
  error.value = ''
  try {
    // Get session & user
    const sess = await $fetch('/api/auth/session') as any
    if (!sess.loggedIn) {
      error.value = 'You must be logged in to access the chat.'
      return
    }

    // Fetch the user's orders and find the one matching the param
    const resp = await $fetch('/api/customer/my-orders') as any
    if (!resp.ok) {
      error.value = 'Failed to load orders.'
      return
    }
    const found = (resp.orders || []).find((o: any) => o.id === orderId)
    if (!found) {
      error.value = 'Order not found or you do not have permission to view this order.'
      return
    }

    // Only allow chat for queued or blending orders
    if (found.status !== 'queued' && found.status !== 'blending') {
      error.value = 'Chat is only available while your order is queued or being prepared.'
      return
    }

    order.value = found

    // Connect socket and join room
    await connect(sess.user)

    await joinRoom(`order:${orderId}`)

    offMessage()
    offPresence()
    onMessage((m:any) => {
      messages.value.push(m)
    })
    onPresence((p:any) => {
      // Optional: show presence messages
      messages.value.push({ id: `presence-${Date.now()}-${Math.random()}`, user: p.user, text: `[${p.type}]`, ts: Date.now() })
    })

  } catch (e:any) {
    console.error('chat load error', e)
    error.value = e?.message || 'Unexpected error'
  } finally {
    loading.value = false
  }
}

async function send() {
  if (!text.value || text.value.trim() === '') return
  try {
    const ack = await sendMessage(`order:${orderId}`, text.value.trim())
    if (ack && ack.ok) {
      // message will also be received via onMessage; optionally add optimistic
      // messages here if you want immediate display
      text.value = ''
    }
  } catch (e:any) {
    console.error('send failed', e)
  }
}

onBeforeUnmount(async () => {
  try {
    if (connected.value) {
      await leaveRoom(`order:${orderId}`)
    }
  } catch (e) { /* ignore */ }
  disconnect()
  offMessage()
  offPresence()
})

onMounted(() => {
  loadAndAuthorize()
})

useHead({ title: 'Order Chat' })
</script>

<style scoped>
.chat-page { min-height: 100vh; background: #f5f7fa }
.header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1rem 1.5rem; display:flex; justify-content:space-between; align-items:center }
.container { max-width:800px; margin:1.5rem auto; padding:1rem }
.chat-box { background:white; border-radius:8px; padding:1rem; box-shadow:0 2px 8px rgba(0,0,0,0.08) }
.messages { height: 300px; overflow:auto; padding:0.5rem; border:1px solid #eee; margin-bottom:0.5rem }
.message { margin-bottom:0.5rem }
.composer { display:flex; gap:0.5rem }
.composer input { flex:1; padding:0.5rem }
.socket-error { margin-top:0.5rem; color:#c62828; font-size:0.9rem }
</style>
