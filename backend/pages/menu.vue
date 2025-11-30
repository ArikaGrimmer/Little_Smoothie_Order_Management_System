<template>
  <div class="menu-page">
    <header class="header">
      <NuxtLink to="/" class="back-button">← Back</NuxtLink>
      <h1>🥤 Our Menu</h1>
      <UserProfile />
    </header>

    <div class="container">
      <div class="menu-intro">
        <h2>Discover Our Smoothies</h2>
        <p>Fresh, healthy, and delicious smoothies made with organic ingredients</p>
      </div>

      <!-- Category Filter -->
      <div class="filters">
        <button 
          @click="selectedCategory = null" 
          :class="['filter-btn', { active: selectedCategory === null }]"
        >
          All
        </button>
        <button 
          v-for="category in categories" 
          :key="category.value"
          @click="selectedCategory = category.value" 
          :class="['filter-btn', { active: selectedCategory === category.value }]"
        >
          {{ category.label }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading delicious smoothies...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="loadMenuItems" class="retry-btn">Try Again</button>
      </div>

      <!-- Menu Items Grid -->
      <div v-else class="menu-grid">
        <div 
          v-for="item in filteredItems" 
          :key="item.id"
          :class="['menu-item-card', { 'sold-out': !item.isAvailable }]"
        >
          <div class="item-image-wrapper">
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div v-if="!item.isAvailable" class="sold-out-overlay">
              <span>Sold Out</span>
            </div>
            <div v-if="item.isFeatured" class="featured-badge">⭐ Featured</div>
          </div>
          
          <div class="item-content">
            <h3 class="item-name">{{ item.name }}</h3>
            <p class="item-description">{{ item.description }}</p>
            
            <div class="item-details">
              <div class="item-ingredients">
                <span class="label">Ingredients:</span>
                <span class="value">{{ item.ingredients.slice(0, 3).join(', ') }}{{ item.ingredients.length > 3 ? '...' : '' }}</span>
              </div>
              
              <div v-if="item.healthBenefits.length" class="item-benefits">
                <span 
                  v-for="benefit in item.healthBenefits.slice(0, 2)" 
                  :key="benefit"
                  class="benefit-tag"
                >
                  {{ benefit }}
                </span>
              </div>
            </div>
            
            <div class="item-footer">
              <div class="item-price">
                <span class="price-label">From</span>
                <span class="price-value">${{ item.basePrice.toFixed(2) }}</span>
              </div>
              
              <button 
                @click="selectItem(item)"
                :disabled="!item.isAvailable"
                class="select-btn"
              >
                {{ item.isAvailable ? 'Order Now' : 'Unavailable' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && !error && filteredItems.length === 0" class="empty-state">
        <p>No smoothies found in this category.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

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
  nutritionInfo: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

const menuItems = ref<MenuItem[]>([])
const selectedCategory = ref<string | null>(null)
const loading = ref(true)
const error = ref('')

const categories = [
  { value: 'fruit', label: 'Fruity' },
  { value: 'berry', label: 'Berry' },
  { value: 'green', label: 'Green' },
  { value: 'protein', label: 'Protein' }
]

const filteredItems = computed(() => {
  if (!selectedCategory.value) {
    return menuItems.value
  }
  return menuItems.value.filter(item => item.category === selectedCategory.value)
})

async function loadMenuItems() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/menu-items')
    if (response.ok) {
      menuItems.value = response.items
    }
  } catch (e: any) {
    error.value = 'Failed to load menu items. Please try again.'
    console.error('Error loading menu:', e)
  } finally {
    loading.value = false
  }
}

function selectItem(item: MenuItem) {
  // Navigate to order page with selected item
  navigateTo(`/customer?item=${item.id}`)
}

onMounted(() => {
  loadMenuItems()
})

useHead({
  title: 'Menu - Little Smoothie'
})
</script>

<style scoped>
.menu-page {
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
  margin: 0;
  font-size: 1.8rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.menu-intro {
  text-align: center;
  margin-bottom: 3rem;
}

.menu-intro h2 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.menu-intro p {
  font-size: 1.2rem;
  color: #666;
}

.filters {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.filter-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-left-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 3rem;
  background: #ffebee;
  border-radius: 12px;
  color: #c62828;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.menu-item-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.menu-item-card:hover:not(.sold-out) {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.menu-item-card.sold-out {
  opacity: 0.7;
}

.item-image-wrapper {
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sold-out-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
}

.featured-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.item-content {
  padding: 1.5rem;
}

.item-name {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.item-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.item-details {
  margin-bottom: 1.5rem;
}

.item-ingredients {
  margin-bottom: 0.75rem;
}

.item-ingredients .label {
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.item-ingredients .value {
  color: #666;
  font-size: 0.9rem;
}

.item-benefits {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.benefit-tag {
  padding: 0.25rem 0.75rem;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.item-price {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 0.75rem;
  color: #999;
  text-transform: uppercase;
}

.price-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #667eea;
}

.select-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.select-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .header {
    padding: 1rem 1rem;
  }

  .header h1 {
    font-size: 1.4rem;
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

  .menu-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .menu-intro {
    margin-bottom: 2rem;
  }

  .menu-intro h2 {
    font-size: 1.75rem;
  }

  .menu-intro p {
    font-size: 1rem;
  }
  
  .filters {
    gap: 0.5rem;
    margin-bottom: 2rem;
  }
  
  .filter-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}
</style>

