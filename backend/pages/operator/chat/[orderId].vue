<template>
  <div class="chat-page">
    <header class="header">
      <NuxtLink to="/operator" class="back-button">← Back</NuxtLink>
      <h1>Order Chat</h1>
      <UserProfile />
    </header>

    <div class="container">
      <div v-if="loading" class="loading">Loading chat...</div>
      <div v-else-if="pageError" class="error-message">{{ pageError }}</div>
      <div v-else>
        <div class="order-info">
          <h2>Order #{{ shortId }}</h2>
          <p>Customer: {{ order.customerName || 'Unknown customer' }}</p>
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
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSocket } from '~/composables/useSocket'

const route = useRoute()
const orderId = String(route.params.orderId || '')
const roomName = `order:${orderId}`

const loading = ref(true)
const pageError = ref('')
const order = ref<any>(null)
const messages = ref<any[]>([])
const text = ref('')

const {
  connected,
  connect,
  disconnect,
  joinRoom,
  leaveRoom,
  sendMessage,
  onMessage,
  onPresence,
  offMessage,
  offPresence,
  error: socketError
} = useSocket()

const shortId = computed(() => orderId.slice(-8))

function formatStatus(status: string) {
  const map: Record<string, string> = {
    queued: 'Queued',
    blending: 'In Preparation',
    ready: 'Ready',
    picked_up: 'Completed',
    draft: 'Draft'
  }
  return map[status] || status
}

function formatTs(ts: number) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString()
}

async function initializeChat() {
  loading.value = true
  pageError.value = ''
  messages.value = []

  if (!orderId) {
    pageError.value = 'Missing order identifier.'
    loading.value = false
    return
  }

  try {
    const session = await $fetch('/api/auth/session') as any
    if (!session?.loggedIn) {
      pageError.value = 'You must be logged in as an operator to use chat.'
      return
    }

    const roles: string[] = session.user?.roles || []
    if (!roles.includes('operator')) {
      pageError.value = 'Operator role required.'
      return
    }

    const resp = await $fetch('/api/operator/orders') as any
    if (!resp?.ok) {
      pageError.value = 'Failed to load orders.'
      return
    }

    const found = (resp.orders || []).find((o: any) => o.id === orderId)
    if (!found) {
      pageError.value = 'Order not found or no longer active.'
      return
    }

    if (found.status !== 'queued' && found.status !== 'blending') {
      pageError.value = 'Chat is available only while the order is queued or in preparation.'
      return
    }

    order.value = found

    await connect(session.user)
    await joinRoom(roomName)

    offMessage()
    offPresence()

    onMessage((m: any) => {
      messages.value.push(m)
    })

    onPresence((p: any) => {
      messages.value.push({
        id: `presence-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        user: p.user,
        text: `[${p.type}]`,
        ts: Date.now()
      })
    })
  } catch (err: any) {
    console.error('operator chat init error', err)
    pageError.value = err?.message || 'Unexpected error starting chat.'
  } finally {
    loading.value = false
  }
}

async function send() {
  if (!text.value || !text.value.trim()) return
  try {
    await sendMessage(roomName, text.value.trim())
    text.value = ''
  } catch (err) {
    console.error('send failed', err)
  }
}

onMounted(() => {
  initializeChat()
})

onBeforeUnmount(async () => {
  try {
    if (connected.value) {
      await leaveRoom(roomName)
    }
  } catch (err) {
    // ignore cleanup failures
  }
  disconnect()
  offMessage()
  offPresence()
})

definePageMeta({
  middleware: 'operator'
})

useHead({ title: 'Operator Order Chat' })
</script>

<style scoped>
.chat-page { min-height: 100vh; background: #f5f7fa }
.header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 1rem 1.5rem; display:flex; justify-content:space-between; align-items:center }
.container { max-width:800px; margin:1.5rem auto; padding:1rem }
.order-info { background:white; border-radius:8px; padding:1rem; box-shadow:0 2px 8px rgba(0,0,0,0.08); margin-bottom:1rem }
.chat-box { background:white; border-radius:8px; padding:1rem; box-shadow:0 2px 8px rgba(0,0,0,0.08) }
.messages { height: 300px; overflow:auto; padding:0.5rem; border:1px solid #eee; margin-bottom:0.5rem }
.message { margin-bottom:0.5rem }
.composer { display:flex; gap:0.5rem }
.composer input { flex:1; padding:0.5rem }
.socket-error { margin-top:0.5rem; color:#c62828; font-size:0.9rem }
.loading { text-align:center; padding:2rem 0 }
.error-message { background:#ffebee; color:#c62828; padding:1rem; border-radius:8px }
.back-button { color:white; text-decoration:none }
.back-button:hover { text-decoration:underline }
</style>
