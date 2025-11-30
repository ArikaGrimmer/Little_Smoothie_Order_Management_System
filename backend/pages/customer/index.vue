<template>
  <div class="customer-page">
    <header class="header">
      <NuxtLink to="/" class="back-button">← Back</NuxtLink>
      <h1>🥤 Order Your Smoothie</h1>
      <UserProfile />
    </header>

    <div class="container">
      <!-- Selected Menu Item Display -->
      <div v-if="selectedMenuItem" class="selected-item-banner">
        <div class="selected-item-image">
          <img :src="selectedMenuItem.image" :alt="selectedMenuItem.name" />
        </div>
        <div class="selected-item-info">
          <h2>{{ selectedMenuItem.name }}</h2>
          <p class="item-description">{{ selectedMenuItem.description }}</p>
          <div class="item-tags">
            <span v-for="benefit in selectedMenuItem.healthBenefits" :key="benefit" class="tag">
              {{ benefit }}
            </span>
          </div>
          <div class="base-price">Base Price: ${{ selectedMenuItem.basePrice.toFixed(2) }}</div>
        </div>
      </div>

      <div v-if="loading" class="loading">Loading menu...</div>
      
      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <div v-else class="order-section">
        <!-- Menu Selection -->
        <div class="menu-panel">
          <h2>{{ selectedMenuItem ? 'Customize Your Order' : 'Build Your Smoothie' }}</h2>
          
          <!-- Base Selection -->
          <div class="menu-group">
            <h3>1. Choose Base</h3>
            <div class="menu-items">
              <div
                v-for="base in menu.bases"
                :key="base.id"
                class="menu-item"
                :class="{ selected: order.baseId === base.id }"
                @click="order.baseId = base.id"
              >
                <div class="item-name">{{ base.name }}</div>
                <div class="item-price">${{ base.price.toFixed(2) }}</div>
              </div>
            </div>
          </div>

          <!-- Size Selection -->
          <div class="menu-group">
            <h3>2. Choose Size</h3>
            <div class="menu-items">
              <div
                v-for="size in menu.sizes"
                :key="size.id"
                class="menu-item"
                :class="{ selected: order.sizeId === size.id }"
                @click="order.sizeId = size.id"
              >
                <div class="item-name">{{ size.name }}</div>
                <div class="item-description">{{ size.multiplier }}x price</div>
              </div>
            </div>
          </div>

          <!-- Fruit Selection -->
          <div class="menu-group">
            <h3>3. Add Fruits (Optional)</h3>
            <div class="menu-items">
              <div
                v-for="fruit in menu.fruits"
                :key="fruit.id"
                class="menu-item"
                :class="{ selected: order.fruitIds.includes(fruit.id) }"
                @click="toggleFruit(fruit.id)"
              >
                <div class="item-name">{{ fruit.name }}</div>
                <div class="item-price">+${{ fruit.extraPrice.toFixed(2) }}</div>
              </div>
            </div>
          </div>

          <!-- Customization -->
          <div class="menu-group">
            <h3>4. Customization</h3>
            <div class="custom-options">
              <div class="option">
                <label>Sweetness: {{ order.sweetness }}%</label>
                <input type="range" v-model.number="order.sweetness" min="0" max="100" step="25">
              </div>
              <div class="option">
                <label>Ice Level: {{ order.iceLevel }}%</label>
                <input type="range" v-model.number="order.iceLevel" min="0" max="100" step="25">
              </div>
              <div class="option">
                <label>Extra Notes:</label>
                <textarea v-model="order.extraNote" placeholder="Any special requests..."></textarea>
              </div>
            </div>
          </div>

          <div class="actions">
            <button @click="saveDraft" class="btn btn-secondary" :disabled="!canSave">
              Save Draft
            </button>
            <button @click="submitOrder" class="btn btn-primary" :disabled="!canSubmit">
              Submit Order - ${{ calculatedPrice.toFixed(2) }}
            </button>
          </div>
        </div>

        <!-- Order Status -->
        <div class="status-panel">
          <h2>Order Status</h2>
          <div v-if="currentOrder" class="current-order">
            <div class="status-badge" :class="currentOrder.status">
              {{ currentOrder.status }}
            </div>
            <div class="order-details">
              <p><strong>Order ID:</strong> {{ currentOrder.id }}</p>
              <p><strong>Price:</strong> ${{ currentOrder.price?.toFixed(2) }}</p>
              <div v-if="currentOrder.status === 'queued'" class="info">
                Your order is in the queue!
              </div>
              <div v-if="currentOrder.status === 'blending'" class="info">
                🎉 Your smoothie is being prepared!
              </div>
              <div v-if="currentOrder.status === 'ready'" class="info success">
                ✅ Your smoothie is ready for pickup!
              </div>
            </div>
          </div>
          <div v-else class="no-order">
            No active order. Build your smoothie above!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface MenuItem {
  id: string
  name: string
  price?: number
  extraPrice?: number
  multiplier?: number
}

interface Menu {
  bases: MenuItem[]
  fruits: MenuItem[]
  sizes: MenuItem[]
}

interface MenuItemFull {
  id: string
  name: string
  description: string
  basePrice: number
  category: string
  image: string
  ingredients: string[]
  healthBenefits: string[]
  isAvailable: boolean
}

interface Order {
  baseId: string
  fruitIds: string[]
  sizeId: string
  sweetness: number
  iceLevel: number
  extraNote: string
}

// Get customer ID from authenticated session
// Use user.id (persistent database ID) instead of email
const { user } = useUserSession()
const customerId = computed(() => (user.value as any)?.id || (user.value as any)?.email || 'guest')

const route = useRoute()
const router = useRouter()

const menu = ref<Menu>({ bases: [], fruits: [], sizes: [] })
const selectedMenuItem = ref<MenuItemFull | null>(null)
const order = ref<Order>({
  baseId: '',
  fruitIds: [],
  sizeId: '',
  sweetness: 100,
  iceLevel: 100,
  extraNote: ''
})

const currentOrder = ref<any>(null)
const loading = ref(true)
const error = ref('')

const calculatedPrice = computed(() => {
  // If a menu item is selected, use its base price
  const basePrice = selectedMenuItem.value 
    ? selectedMenuItem.value.basePrice 
    : order.value.baseId 
      ? (menu.value.bases.find(b => b.id === order.value.baseId)?.price || 0)
      : 0
  
  if (!order.value.sizeId) return basePrice
  
  const size = menu.value.sizes.find(s => s.id === order.value.sizeId)
  const fruits = menu.value.fruits.filter(f => order.value.fruitIds.includes(f.id))
  
  if (!size) return basePrice
  
  const fruitCost = fruits.reduce((sum, f) => sum + (f.extraPrice || 0), 0)
  return (basePrice + fruitCost) * size.multiplier!
})

const canSave = computed(() => {
  return (selectedMenuItem.value || order.value.baseId) && order.value.sizeId
})

const canSubmit = computed(() => {
  return canSave.value && calculatedPrice.value > 0
})

async function loadSelectedMenuItem() {
  const itemId = route.query.item as string
  if (!itemId) return
  
  try {
    const response = await $fetch(`/api/menu-items/${itemId}`)
    if (response.ok && response.item) {
      selectedMenuItem.value = response.item
    }
  } catch (e) {
    console.error('Error loading selected item:', e)
  }
}

function clearSelection() {
  selectedMenuItem.value = null
  router.push('/customer')
}

function toggleFruit(fruitId: string) {
  const index = order.value.fruitIds.indexOf(fruitId)
  if (index > -1) {
    order.value.fruitIds.splice(index, 1)
  } else {
    order.value.fruitIds.push(fruitId)
  }
}

async function loadMenu() {
  try {
    const response = await fetch('/api/menu')
    const data = await response.json()
    if (data.ok) {
      menu.value = data
    }
  } catch (e) {
    error.value = 'Failed to load menu'
  } finally {
    loading.value = false
  }
}

async function loadDraftOrder() {
  try {
    const response = await fetch(`/api/customer/${customerId.value}/draft-order`)
    const data = await response.json()
    if (data.order) {
      currentOrder.value = data.order
      // Populate form with draft data
      if (data.order.status === 'draft') {
        order.value = {
          baseId: data.order.baseId || '',
          fruitIds: data.order.fruitIds || [],
          sizeId: data.order.sizeId || '',
          sweetness: data.order.sweetness || 100,
          iceLevel: data.order.iceLevel || 100,
          extraNote: data.order.extraNote || ''
        }
      }
    }
  } catch (e) {
    console.error('Failed to load draft order:', e)
  }
}

async function saveDraft() {
  if (!canSave.value) return false
  
  try {
    const payload = {
      ...order.value,
      menuItemId: selectedMenuItem.value?.id || null,
      menuItemName: selectedMenuItem.value?.name || null,
      basePrice: selectedMenuItem.value?.basePrice || null,
      calculatedPrice: calculatedPrice.value
    }
    
    const response = await fetch(`/api/customer/${customerId.value}/draft-order`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await response.json()
    if (data.ok) {
      currentOrder.value = data.order
      return true
    }
    return false
  } catch (e) {
    console.error('Failed to save draft:', e)
    return false
  }
}

async function submitOrder() {
  if (!canSubmit.value) return
  
  try {
    // First save the draft to ensure it's up to date with menu item info
    const saveResult = await saveDraft()
    if (!saveResult) {
      alert('Failed to save draft. Please try again.')
      return
    }
    
    // Small delay to ensure draft is saved
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Now submit the draft
    const response = await fetch(`/api/customer/${customerId.value}/submit-draft-order`, {
      method: 'POST'
    })
    const data = await response.json()
    
    if (data.ok && data.order) {
      // Update current order with the submitted order (status should be "queued")
      currentOrder.value = data.order
      
      console.log('Order submitted successfully, status:', data.order.status)
      
      alert('Order submitted successfully!')
      
      // Clear the selected menu item
      selectedMenuItem.value = null
      
      // Reset form
      order.value = {
        baseId: '',
        fruitIds: [],
        sizeId: '',
        sweetness: 100,
        iceLevel: 100,
        extraNote: ''
      }
      
      // Clear currentOrder after a moment so user can start a new order
      setTimeout(() => {
        currentOrder.value = null
      }, 3000)
    } else {
      throw new Error(data.statusMessage || 'Failed to submit order')
    }
  } catch (e: any) {
    console.error('Submit order error:', e)
    const errorMessage = e.data?.statusMessage || e.message || 'Failed to submit order'
    alert(`Failed to submit order: ${errorMessage}`)
  }
}

// Auto-save draft when order changes
watch(order, async () => {
  if (canSave.value && currentOrder.value?.status === 'draft') {
    // Debounced auto-save could be added here
  }
}, { deep: true })

onMounted(async () => {
  await Promise.all([
    loadMenu(),
    loadDraftOrder(),
    loadSelectedMenuItem()
  ])
})

useHead({
  title: 'Little Smoothie - Customer'
})
</script>

<style scoped>
.customer-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.customer-id {
  font-size: 0.9rem;
  opacity: 0.9;
}

.container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.selected-item-banner {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 2rem;
  align-items: center;
  position: relative;
}

.selected-item-image {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
}

.selected-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selected-item-info h2 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1.8rem;
}

.item-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.item-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.base-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #667eea;
}

.change-item-btn {
  padding: 0.75rem 1.5rem;
  background: #f0f0f0;
  color: #333;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.change-item-btn:hover {
  background: #e0e0e0;
  border-color: #d0d0d0;
}

@media (max-width: 968px) {
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

  .selected-item-banner {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 1.5rem;
  }
  
  .selected-item-image {
    margin: 0 auto;
    width: 150px;
    height: 150px;
  }
  
  .item-tags {
    justify-content: center;
  }
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
}

.order-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.menu-panel, .status-panel {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
}

.menu-group {
  margin-bottom: 2rem;
}

h3 {
  color: #555;
  margin-bottom: 1rem;
}

.menu-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.menu-item {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.menu-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.menu-item.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.item-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.item-price, .item-description {
  font-size: 0.9rem;
  opacity: 0.8;
}

.custom-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.option input[type="range"] {
  width: 100%;
}

.option textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #d0d0d0;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.status-badge.draft {
  background: #fff3cd;
  color: #856404;
}

.status-badge.queued {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.blending {
  background: #d4edda;
  color: #155724;
}

.status-badge.ready {
  background: #d4edda;
  color: #155724;
}

.order-details {
  margin-top: 1rem;
}

.order-details p {
  margin: 0.5rem 0;
}

.info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.info.success {
  background: #d4edda;
  border-left-color: #28a745;
}

.no-order {
  text-align: center;
  padding: 2rem;
  color: #999;
}

@media (max-width: 968px) {
  .order-section {
    grid-template-columns: 1fr;
  }
}
</style>


