<template>
  <div class="customer-orders-page">
    <header class="header">
      <NuxtLink to="/" class="back-button">← Back</NuxtLink>
      <h1>📦 My Orders</h1>
      <UserProfile />
    </header>

    <div class="container">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading your orders...</p>
      </div>

      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="loadOrders" class="btn btn-secondary">Retry</button>
      </div>

      <div v-else-if="orders.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h2>No Orders Yet</h2>
        <p>You haven't placed any orders yet. Start by browsing our menu!</p>
        <NuxtLink to="/menu" class="btn btn-primary">Browse Menu</NuxtLink>
      </div>

      <div v-else class="orders-list">
        <div 
          v-for="order in orders" 
          :key="order.id"
          class="order-card"
          :class="order.status"
        >
          <div class="order-header">
            <div>
              <h3>Order #{{ order.id.slice(-8) }}</h3>
              <p class="order-date">{{ formatDate(order.submittedAt || order.createdAt) }}</p>
            </div>
            <div class="order-price">
              <span class="price-label">Total</span>
              <span class="price-value">${{ order.price?.toFixed(2) || '0.00' }}</span>
            </div>
          </div>

          <div class="order-details">
            <div v-if="order.menuItemName" class="detail-row highlight">
              <span class="label">🥤 Drink:</span>
              <span class="value">{{ order.menuItemName }}</span>
            </div>
            
            <div v-if="order.baseId && !order.menuItemName" class="detail-row">
              <span class="label">Base:</span>
              <span class="value">{{ getBaseName(order.baseId) }}</span>
            </div>
            
            <div v-if="order.sizeId" class="detail-row">
              <span class="label">Size:</span>
              <span class="value">{{ getSizeName(order.sizeId) }}</span>
            </div>
            
            <div v-if="order.fruitIds?.length" class="detail-row">
              <span class="label">Fruits:</span>
              <span class="value">{{ getFruitNames(order.fruitIds) }}</span>
            </div>
            
            <div v-if="order.sweetness !== undefined && order.sweetness !== null" class="detail-row">
              <span class="label">Sweetness:</span>
              <span class="value">{{ order.sweetness }}%</span>
            </div>
            
            <div v-if="order.iceLevel !== undefined && order.iceLevel !== null" class="detail-row">
              <span class="label">Ice Level:</span>
              <span class="value">{{ order.iceLevel }}%</span>
            </div>
            
            <div v-if="order.extraNote" class="detail-row note-row">
              <span class="label">Note:</span>
              <span class="value">{{ order.extraNote }}</span>
            </div>
          </div>

          <div class="order-status-info">
            <div v-if="order.status === 'draft'" class="status-message draft">
              📝 <strong>Draft</strong> - This is a saved draft. Submit your order when ready.
            </div>
            <div v-else-if="order.status === 'queued'" class="status-message info">
              ⏳ <strong>In Queue</strong> - Your order is waiting to be prepared.
            </div>
            <div v-else-if="order.status === 'blending'" class="status-message blending">
              🎉 <strong>In Preparation</strong> - Your smoothie is being prepared right now!
            </div>
            <div v-else-if="order.status === 'ready'" class="status-message success">
              ✅ <strong>Ready</strong> - Your smoothie is ready for pickup!
            </div>
            <div v-else-if="order.status === 'picked_up'" class="status-message success">
              🎊 <strong>Completed</strong> - Order completed! Thank you for your order.
            </div>
            <div v-else class="status-message info">
              📋 Status: {{ formatStatus(order.status) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Order {
  id: string
  status: string
  price: number
  submittedAt?: number
  createdAt?: number
  menuItemName?: string
  baseId?: string
  sizeId?: string
  fruitIds?: string[]
  sweetness?: number
  iceLevel?: number
  extraNote?: string
}

interface Menu {
  bases: Array<{ id: string; name: string }>
  sizes: Array<{ id: string; name: string }>
  fruits: Array<{ id: string; name: string }>
}

const orders = ref<Order[]>([])
const menu = ref<Menu>({ bases: [], sizes: [], fruits: [] })
const loading = ref(true)
const error = ref('')

async function loadMenu() {
  try {
    const response = await $fetch('/api/menu') as any
    if (response.ok) {
      menu.value = response
    }
  } catch (e) {
    console.error('Failed to load menu:', e)
  }
}

async function loadOrders() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/customer/my-orders') as any
    if (response.ok) {
      orders.value = (response.orders || []) as Order[]
      // Sort by most recent first
      orders.value.sort((a, b) => {
        const timeA = a.submittedAt || a.createdAt || 0
        const timeB = b.submittedAt || b.createdAt || 0
        return timeB - timeA
      })
    }
  } catch (e: any) {
    console.error('Error loading orders:', e)
    if (e.statusCode === 401) {
      error.value = 'Please log in to view your orders.'
    } else {
      error.value = 'Failed to load orders. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

function getBaseName(baseId: string): string {
  return menu.value.bases.find(b => b.id === baseId)?.name || 'Unknown Base'
}

function getSizeName(sizeId: string): string {
  return menu.value.sizes.find(s => s.id === sizeId)?.name || 'Unknown Size'
}

function getFruitNames(fruitIds: string[]): string {
  if (!fruitIds || fruitIds.length === 0) return 'None'
  return fruitIds
    .map(id => menu.value.fruits.find(f => f.id === id)?.name)
    .filter(Boolean)
    .join(', ') || 'None'
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'draft': 'Draft',
    'queued': 'Queued',
    'blending': 'In Progress',
    'ready': 'Ready',
    'picked_up': 'Completed'
  }
  return statusMap[status] || status
}

function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return 'Unknown date'
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await Promise.all([loadMenu(), loadOrders()])
  
  // Refresh orders every 5 seconds to get status updates
  setInterval(() => {
    loadOrders()
  }, 5000)
})

useHead({
  title: 'My Orders - Little Smoothie'
})
</script>

<style scoped>
.customer-orders-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
}

.back-button {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: rgba(255,255,255,0.2);
  transition: background 0.3s;
  flex-shrink: 0;
}

.back-button:hover {
  background: rgba(255,255,255,0.3);
}

.header h1 {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  margin: 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 4px solid rgba(245, 87, 108, 0.2);
  border-left-color: #f5576c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 3rem 2rem;
  background: #ffebee;
  border-radius: 12px;
  color: #c62828;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 2rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  border-left: 4px solid #e0e0e0;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.order-card.queued {
  border-left-color: #ffc107;
}

.order-card.blending {
  border-left-color: #4facfe;
}

.order-card.ready {
  border-left-color: #28a745;
}

.order-card.picked_up {
  border-left-color: #6c757d;
}

.order-card.draft {
  border-left-color: #9e9e9e;
  opacity: 0.8;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.order-header h3 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1.5rem;
}

.order-date {
  margin: 0;
  color: #999;
  font-size: 0.9rem;
}

.order-price {
  text-align: right;
}

.price-label {
  display: block;
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 0.25rem;
}

.price-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #f5576c;
}

.order-details {
  margin-bottom: 1.5rem;
  padding: 1rem 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f5f5f5;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row.highlight {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border-bottom: none;
}

.detail-row .label {
  font-weight: 600;
  color: #666;
  min-width: 120px;
}

.detail-row .value {
  color: #333;
  text-align: right;
  flex: 1;
}

.note-row {
  font-style: italic;
  color: #666;
}

.note-row .value {
  text-align: left;
  margin-top: 0.25rem;
}

.order-status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.order-status-badge.queued {
  background: #fff3cd;
  color: #856404;
}

.order-status-badge.blending {
  background: #d1ecf1;
  color: #0c5460;
}

.order-status-badge.ready {
  background: #d4edda;
  color: #155724;
}

.order-status-badge.picked_up {
  background: #e2e3e5;
  color: #383d41;
}

.order-status-badge.draft {
  background: #e9ecef;
  color: #495057;
}

.order-status-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.status-message {
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
}

.status-message.info {
  background: #fff3cd;
  color: #856404;
}

.status-message.blending {
  background: #d1ecf1;
  color: #0c5460;
}

.status-message.success {
  background: #d4edda;
  color: #155724;
}

.status-message.draft {
  background: #e9ecef;
  color: #495057;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

@media (max-width: 768px) {
  .header {
    padding: 1rem 1rem;
  }

  .header h1 {
    font-size: 1.3rem;
    padding: 0 1rem;
    max-width: calc(100% - 8rem);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .back-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }

  .container {
    padding: 1.5rem 1rem;
  }

  .order-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .order-price {
    text-align: left;
    width: 100%;
  }
  
  .order-status-badge {
    align-self: flex-start;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .detail-row .label {
    min-width: auto;
  }
  
  .detail-row .value {
    text-align: left;
  }
}
</style>

