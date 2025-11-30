<template>
  <div class="operator-menu-page" style="min-height: 100vh; background: #f5f7fa;">
      <header class="header">
        <NuxtLink to="/operator" class="back-button">← Back to Dashboard</NuxtLink>
        <h1>📋 Menu Management</h1>
        <UserProfile />
      </header>

      <div class="container">
      <div class="actions-bar">
        <button @click="showAddModal = true" class="btn btn-primary">
          + Add New Item
        </button>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading menu items...</p>
        <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">If this takes too long, check the browser console for errors.</p>
      </div>

      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="loadMenuItems" class="btn btn-secondary">Retry</button>
      </div>

      <div v-else-if="menuItems.length === 0" class="empty-state">
        <p>No menu items found. Click "Add New Item" to create your first smoothie!</p>
      </div>

      <div v-else class="menu-items-list">
        <div 
          v-for="item in menuItems" 
          :key="item.id"
          :class="['menu-item-row', { unavailable: !item.isAvailable }]"
        >
          <div class="item-image">
            <img :src="item.image" :alt="item.name" />
            <span v-if="!item.isAvailable" class="sold-out-badge">Sold Out</span>
          </div>
          
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
            <div class="item-meta">
              <span class="category-badge">{{ item.category }}</span>
              <span class="price">${{ item.basePrice.toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="item-actions">
            <button 
              @click="toggleAvailability(item)" 
              :class="['btn', item.isAvailable ? 'btn-warning' : 'btn-success']"
            >
              {{ item.isAvailable ? 'Mark Sold Out' : 'Mark Available' }}
            </button>
            <button @click="editItem(item)" class="btn btn-secondary">
              Edit
            </button>
            <button @click="deleteItem(item)" class="btn btn-danger">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingItem" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingItem ? 'Edit Menu Item' : 'Add New Menu Item' }}</h2>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Name *</label>
            <input v-model="formData.name" type="text" placeholder="e.g., Tropical Paradise" />
          </div>
          
          <div class="form-group">
            <label>Description *</label>
            <textarea v-model="formData.description" placeholder="Describe the smoothie..." rows="3"></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Base Price *</label>
              <input v-model.number="formData.basePrice" type="number" step="0.01" placeholder="9.99" />
            </div>
            
            <div class="form-group">
              <label>Category *</label>
              <select v-model="formData.category">
                <option value="fruit">Fruity</option>
                <option value="berry">Berry</option>
                <option value="green">Green</option>
                <option value="protein">Protein</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Image URL</label>
            <input v-model="formData.image" type="text" placeholder="https://..." />
          </div>
          
          <div class="form-group">
            <label>Ingredients (comma-separated)</label>
            <input v-model="ingredientsText" type="text" placeholder="Banana, Strawberry, Yogurt" />
          </div>
          
          <div class="form-group">
            <label>Health Benefits (comma-separated)</label>
            <input v-model="healthBenefitsText" type="text" placeholder="Vitamin C, Energy Boost" />
          </div>
          
          <div class="form-group">
            <label>Allergens (comma-separated)</label>
            <input v-model="allergensText" type="text" placeholder="dairy, nuts" />
          </div>
          
          <div class="form-group checkbox-group">
            <label>
              <input v-model="formData.isFeatured" type="checkbox" />
              Featured Item
            </label>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button @click="saveItem" class="btn btn-primary" :disabled="!isFormValid">
            {{ editingItem ? 'Update' : 'Add' }} Item
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// IMMEDIATE LOG - This should run as soon as the script loads
console.log('🔵 [Menu Management] SCRIPT SETUP STARTING...')

// definePageMeta must be at the very top, before imports
definePageMeta({
  middleware: 'operator'
})

console.log('🔵 [Menu Management] definePageMeta set')

import { ref, computed, onMounted } from 'vue'

console.log('🔵 [Menu Management] Vue imports loaded')

interface MenuItem {
  id: string
  name: string
  description: string
  basePrice: number
  category: string
  image: string
  ingredients: string[]
  healthBenefits: string[]
  isAvailable: boolean
  isFeatured: boolean
  allergens: string[]
}

console.log('🔵 [Menu Management] Creating reactive refs...')

const menuItems = ref<MenuItem[]>([])
const loading = ref(true)
const error = ref('')
const showAddModal = ref(false)
const editingItem = ref<MenuItem | null>(null)

console.log('🔵 [Menu Management] Reactive refs created')

const formData = ref({
  name: '',
  description: '',
  basePrice: 0,
  category: 'fruit',
  image: '',
  ingredients: [] as string[],
  healthBenefits: [] as string[],
  allergens: [] as string[],
  isAvailable: true,
  isFeatured: false
})

const ingredientsText = ref('')
const healthBenefitsText = ref('')
const allergensText = ref('')

const isFormValid = computed(() => {
  return formData.value.name && formData.value.description && formData.value.basePrice > 0
})

async function loadMenuItems() {
  loading.value = true
  error.value = ''
  try {
    console.log('[Menu Management] Fetching menu items from /api/menu-items')
    const response = await $fetch('/api/menu-items') as any
    console.log('[Menu Management] Response:', response)
    if (response.ok) {
      menuItems.value = (response.items || []) as MenuItem[]
      console.log(`[Menu Management] Loaded ${menuItems.value.length} menu items`)
    } else {
      error.value = 'Failed to load menu items. Please try again.'
      console.error('[Menu Management] Response not ok:', response)
    }
  } catch (e: any) {
    console.error('[Menu Management] Error loading menu items:', e)
    if (e.statusCode === 403) {
      error.value = 'Access denied. You need operator role to manage menu items. Please check your user roles.'
    } else if (e.statusCode === 401) {
      error.value = 'Please log in to access menu management.'
    } else {
      error.value = `Failed to load menu items: ${e.message || 'Unknown error'}`
    }
  } finally {
    loading.value = false
  }
}

function editItem(item: MenuItem) {
  editingItem.value = item
  formData.value = {
    name: item.name,
    description: item.description,
    basePrice: item.basePrice,
    category: item.category,
    image: item.image,
    ingredients: [...item.ingredients],
    healthBenefits: [...item.healthBenefits],
    allergens: [...item.allergens],
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured
  }
  ingredientsText.value = item.ingredients.join(', ')
  healthBenefitsText.value = item.healthBenefits.join(', ')
  allergensText.value = item.allergens.join(', ')
}

async function toggleAvailability(item: MenuItem) {
  try {
    const response = await $fetch(`/api/operator/menu-items/${item.id}`, {
      method: 'PUT',
      body: { isAvailable: !item.isAvailable }
    })
    
    if (response.ok) {
      await loadMenuItems()
    }
  } catch (e) {
    console.error('Error updating availability:', e)
    alert('Failed to update availability')
  }
}

async function deleteItem(item: MenuItem) {
  if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return
  
  try {
    await $fetch(`/api/operator/menu-items/${item.id}`, {
      method: 'DELETE'
    })
    
    await loadMenuItems()
  } catch (e) {
    console.error('Error deleting item:', e)
    alert('Failed to delete item')
  }
}

async function saveItem() {
  // Parse comma-separated lists
  formData.value.ingredients = ingredientsText.value.split(',').map(s => s.trim()).filter(Boolean)
  formData.value.healthBenefits = healthBenefitsText.value.split(',').map(s => s.trim()).filter(Boolean)
  formData.value.allergens = allergensText.value.split(',').map(s => s.trim()).filter(Boolean)
  
  try {
    if (editingItem.value) {
      // Update existing item
      await $fetch(`/api/operator/menu-items/${editingItem.value.id}`, {
        method: 'PUT',
        body: formData.value
      })
    } else {
      // Create new item
      await $fetch('/api/operator/menu-items', {
        method: 'POST',
        body: formData.value
      })
    }
    
    await loadMenuItems()
    closeModal()
  } catch (e) {
    console.error('Error saving item:', e)
    alert('Failed to save item')
  }
}

function closeModal() {
  showAddModal.value = false
  editingItem.value = null
  formData.value = {
    name: '',
    description: '',
    basePrice: 0,
    category: 'fruit',
    image: '',
    ingredients: [],
    healthBenefits: [],
    allergens: [],
    isAvailable: true,
    isFeatured: false
  }
  ingredientsText.value = ''
  healthBenefitsText.value = ''
  allergensText.value = ''
}

console.log('🔵 [Menu Management] Setting up onMounted hook...')

onMounted(() => {
  console.log('🟢 [Menu Management] ===== PAGE MOUNTED =====')
  console.log('🟢 [Menu Management] Vue component is mounted!')
  console.log('🟢 [Menu Management] Loading menu items...')
  console.log('🟢 [Menu Management] Current state - loading:', loading.value, 'error:', error.value, 'items:', menuItems.value.length)
  
  // Remove debug banner after 5 seconds
  setTimeout(() => {
    const debugBanner = document.querySelector('[style*="background: red"]')
    if (debugBanner) {
      console.log('🟢 [Menu Management] Removing debug banner')
      debugBanner.remove()
    }
  }, 5000)
  
  console.log('🟢 [Menu Management] Calling loadMenuItems()...')
  loadMenuItems().then(() => {
    console.log('🟢 [Menu Management] Load complete - loading:', loading.value, 'error:', error.value, 'items:', menuItems.value.length)
  }).catch((err) => {
    console.error('🔴 [Menu Management] Load failed:', err)
  })
})

console.log('🔵 [Menu Management] onMounted hook registered')

// Final log to confirm script setup completed
console.log('🔵 [Menu Management] SCRIPT SETUP COMPLETE')

useHead({
  title: 'Menu Management - Operator'
})
</script>

<style scoped>
.operator-menu-page {
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

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.actions-bar {
  margin-bottom: 2rem;
  display: flex;
  justify-content: flex-end;
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 4px solid rgba(79, 172, 254, 0.2);
  border-left-color: #4facfe;
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
  margin: 2rem 0;
}

.error-message p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  font-size: 1.1rem;
  background: white;
  border-radius: 12px;
  margin: 2rem 0;
}

.menu-items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.menu-item-row {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 1.5rem;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.menu-item-row.unavailable {
  opacity: 0.7;
  background: #f5f5f5;
}

.item-image {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sold-out-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(220, 53, 69, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.item-details h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.item-details p {
  color: #666;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.item-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.category-badge {
  padding: 0.25rem 0.75rem;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
}

.price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #4facfe;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-size: 0.9rem;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-warning {
  background: #ff9800;
  color: white;
}

.btn-warning:hover {
  background: #f57c00;
}

.btn-success {
  background: #4caf50;
  color: white;
}

.btn-success:hover {
  background: #388e3c;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover {
  background: #d32f2f;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 2rem;
  height: 2rem;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #4facfe;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@media (max-width: 968px) {
  .menu-item-row {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .item-image {
    margin: 0 auto;
  }
  
  .item-actions {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

