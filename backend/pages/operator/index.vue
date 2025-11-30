<template>
  <div class="operator-page">
    <header class="header">
      <NuxtLink to="/" class="back-button">← Back</NuxtLink>
      <h1>👨‍🍳 Operator Dashboard</h1>
      <div class="header-right">
        <div class="stats">
          <span class="stat">Queue: {{ queuedOrders.length }}</span>
          <span class="stat">In Progress: {{ blendingOrders.length }}</span>
        </div>
        <UserProfile />
      </div>
    </header>

    <div class="container">
      <!-- Orders Panel -->
      <div class="panel orders-panel">
          <div class="panel-header">
            <h2>📋 View Orders</h2>
            <div class="panel-stats">
              <span class="stat-badge queue">{{ queuedOrders.length }} Queued</span>
              <span class="stat-badge progress">{{ blendingOrders.length }} In Progress</span>
              <span class="stat-badge ready">{{ readyOrders.length }} Ready</span>
            </div>
          </div>
          
          <div v-if="loading" class="loading">Loading orders...</div>
          
          <div v-else class="dashboard">
        <!-- Queued Orders -->
        <div class="orders-section">
          <h2>📋 Queued Orders</h2>
          <div v-if="queuedOrders.length === 0" class="empty-state">
            No orders in queue
          </div>
          <div v-else class="orders-grid">
            <div
              v-for="order in queuedOrders"
              :key="order.id"
              class="order-card queued"
            >
              <div class="order-header">
                <div>
                  <span class="order-id">Order #{{ order.id.slice(-6) }}</span>
                  <p class="customer-name" v-if="order.customerName">👤 {{ order.customerName }}</p>
                </div>
                <span class="order-price">${{ order.price?.toFixed(2) }}</span>
              </div>
              <div class="order-details">
                <p v-if="order.drinkName || order.menuItemName" class="drink-name">
                  <strong>Drink:</strong> {{ order.drinkName || order.menuItemName }}
                </p>
                <p v-if="order.baseId"><strong>Base:</strong> {{ getBaseName(order.baseId) }}</p>
                <p><strong>Size:</strong> {{ getSizeName(order.sizeId) }}</p>
                <p v-if="order.fruitIds?.length"><strong>Fruits:</strong> {{ getFruitNames(order.fruitIds) }}</p>
                <p><strong>Sweetness:</strong> {{ order.sweetness }}%</p>
                <p><strong>Ice:</strong> {{ order.iceLevel }}%</p>
                <p v-if="order.extraNote" class="note"><strong>Note:</strong> {{ order.extraNote }}</p>
              </div>
              <div class="card-actions">
                <NuxtLink :to="`/operator/chat/${order.id}`" class="btn btn-outline">
                  💬 Chat with Customer
                </NuxtLink>
                <button @click="startOrder(order.id)" class="btn btn-primary">
                  Start Preparation
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- In Progress Orders -->
        <div class="orders-section">
          <h2>🎯 In Progress</h2>
          <div v-if="blendingOrders.length === 0" class="empty-state">
            No orders in progress
          </div>
          <div v-else class="orders-grid">
            <div
              v-for="order in blendingOrders"
              :key="order.id"
              class="order-card blending"
            >
              <div class="order-header">
                <div>
                  <span class="order-id">Order #{{ order.id.slice(-6) }}</span>
                  <p class="customer-name" v-if="order.customerName">👤 {{ order.customerName }}</p>
                </div>
                <span class="order-price">${{ order.price?.toFixed(2) }}</span>
              </div>
              <div class="order-details">
                <p v-if="order.drinkName || order.menuItemName" class="drink-name">
                  <strong>Drink:</strong> {{ order.drinkName || order.menuItemName }}
                </p>
                <p v-if="order.baseId"><strong>Base:</strong> {{ getBaseName(order.baseId) }}</p>
                <p><strong>Size:</strong> {{ getSizeName(order.sizeId) }}</p>
                <p v-if="order.fruitIds?.length"><strong>Fruits:</strong> {{ getFruitNames(order.fruitIds) }}</p>
                <p><strong>Sweetness:</strong> {{ order.sweetness }}%</p>
                <p><strong>Ice:</strong> {{ order.iceLevel }}%</p>
                <p v-if="order.extraNote" class="note"><strong>Note:</strong> {{ order.extraNote }}</p>
              </div>
              <div class="card-actions">
                <NuxtLink :to="`/operator/chat/${order.id}`" class="btn btn-outline">
                  💬 Chat with Customer
                </NuxtLink>
                <button @click="finishOrder(order.id)" class="btn btn-success">
                  Mark as Ready
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Ready Orders -->
        <div class="orders-section">
          <h2>✅ Ready for Pickup</h2>
          <div v-if="readyOrders.length === 0" class="empty-state">
            No orders ready
          </div>
          <div v-else class="orders-grid">
            <div
              v-for="order in readyOrders"
              :key="order.id"
              class="order-card ready"
            >
              <div class="order-header">
                <span class="order-id">Order #{{ order.id.slice(-6) }}</span>
                <span class="order-price">${{ order.price?.toFixed(2) }}</span>
              </div>
              <div class="order-details">
                <p><strong>Base:</strong> {{ getBaseName(order.baseId) }}</p>
                <p><strong>Size:</strong> {{ getSizeName(order.sizeId) }}</p>
              </div>
              <div class="ready-badge">Ready for pickup! 🎉</div>
            </div>
          </div>
        </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface MenuItem {
  id: string
  name: string
}

interface Menu {
  bases: MenuItem[]
  fruits: MenuItem[]
  sizes: MenuItem[]
}

interface Order {
  id: string
  status: string
  baseId: string
  sizeId: string
  fruitIds: string[]
  sweetness: number
  iceLevel: number
  extraNote?: string
  price: number
  submittedAt?: number
  customerName?: string
  menuItemName?: string
  drinkName?: string
}

const orders = ref<Order[]>([])
const menu = ref<Menu>({ bases: [], fruits: [], sizes: [] })
const loading = ref(true)

const queuedOrders = computed(() => 
  orders.value.filter(o => o.status === 'queued').sort((a, b) => 
    (a.submittedAt || 0) - (b.submittedAt || 0)
  )
)

const blendingOrders = computed(() => 
  orders.value.filter(o => o.status === 'blending')
)

const readyOrders = computed(() => 
  orders.value.filter(o => o.status === 'ready')
)

function getBaseName(baseId: string): string {
  return menu.value.bases.find(b => b.id === baseId)?.name || 'Unknown'
}

function getSizeName(sizeId: string): string {
  return menu.value.sizes.find(s => s.id === sizeId)?.name || 'Unknown'
}

function getFruitNames(fruitIds: string[]): string {
  return fruitIds
    .map(id => menu.value.fruits.find(f => f.id === id)?.name)
    .filter(Boolean)
    .join(', ')
}

async function loadMenu() {
  try {
    const response = await fetch('/api/menu')
    const data = await response.json()
    if (data.ok) {
      menu.value = data
    }
  } catch (e) {
    console.error('Failed to load menu:', e)
  }
}

async function loadOrders() {
  try {
    const response = await fetch('/api/operator/orders')
    const data = await response.json()
    if (data.ok) {
      orders.value = data.orders
    }
  } catch (e) {
    console.error('Failed to load orders:', e)
  } finally {
    loading.value = false
  }
}

async function startOrder(orderId: string) {
  try {
    const response = await fetch(`/api/operator/orders/${orderId}/start`, {
      method: 'POST'
    })
    const data = await response.json()
    if (data.ok) {
      // Reload all orders to get updated status
      await loadOrders()
    } else {
      alert('Failed to start order')
    }
  } catch (e) {
    console.error('Failed to start order:', e)
    alert('Failed to start order')
  }
}

async function finishOrder(orderId: string) {
  try {
    const response = await fetch(`/api/operator/orders/${orderId}/finish`, {
      method: 'POST'
    })
    const data = await response.json()
    if (data.ok) {
      // Reload all orders to get updated status
      await loadOrders()
    } else {
      alert('Failed to finish order')
    }
  } catch (e) {
    console.error('Failed to finish order:', e)
    alert('Failed to finish order')
  }
}

// Auto-refresh orders every 5 seconds
let refreshInterval: NodeJS.Timeout | null = null

onMounted(async () => {
  await loadMenu()
  await loadOrders()
  
  // Set up auto-refresh
  refreshInterval = setInterval(() => {
    loadOrders()
  }, 5000)
})

onBeforeUnmount(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

definePageMeta({
  middleware: 'operator'
})

useHead({
  title: 'Little Smoothie - Operator'
})
</script>

<style scoped>
.operator-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.back-button {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: rgba(255,255,255,0.2);
  transition: background 0.3s;
}

.back-button:hover {
  background: rgba(255,255,255,0.3);
}

.stats {
  display: flex;
  gap: 1rem;
}

.stat {
  background: rgba(255,255,255,0.2);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
}

.container {
  padding: 2rem;
  max-width: 1800px;
  margin: 0 auto;
}

.panel {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.panel-header h2 {
  margin: 0;
  color: #333;
}

.panel-stats {
  display: flex;
  gap: 0.75rem;
}

.stat-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.stat-badge.queue {
  background: #fff3cd;
  color: #856404;
}

.stat-badge.progress {
  background: #d1ecf1;
  color: #0c5460;
}

.stat-badge.ready {
  background: #d4edda;
  color: #155724;
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
}

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.orders-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  border-bottom: 2px solid #4facfe;
  padding-bottom: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-style: italic;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.order-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.order-card.queued {
  border-color: #ffc107;
  background: #fff9e6;
}

.order-card.blending {
  border-color: #4facfe;
  background: #e6f7ff;
}

.order-card.ready {
  border-color: #28a745;
  background: #e6f9ed;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.order-header .customer-name {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  color: #666;
  font-weight: normal;
}

.drink-name {
  font-size: 1.1rem;
  color: #4facfe;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.order-id {
  font-weight: 700;
  font-size: 1.1rem;
}

.order-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #28a745;
}

.order-details {
  margin-bottom: 1rem;
}

.order-details p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

.note {
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  margin-top: 0.75rem;
  font-style: italic;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn {
  width: 100%;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-block;
  text-align: center;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}

.btn-outline {
  background: white;
  color: #4facfe;
  border: 2px solid #4facfe;
}

.btn-outline:hover {
  background: #4facfe;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.ready-badge {
  text-align: center;
  padding: 0.75rem;
  background: #d4edda;
  border-radius: 8px;
  color: #155724;
  font-weight: 600;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .orders-grid {
    grid-template-columns: 1fr;
  }
  
  .stats {
    flex-direction: column;
    gap: 0.5rem;
  }

  .panel-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>


