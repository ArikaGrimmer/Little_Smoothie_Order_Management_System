<template>
  <UContainer class="py-8">
    <!-- Hero Section -->
    <div class="mb-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold mb-2">
            Welcome back, {{ (user as any)?.name }}! 👋
          </h1>
          <p class="text-white/90">Ready to order your perfect smoothie?</p>
        </div>
      </div>
      
      <UButton 
        to="/order" 
        color="white" 
        size="xl"
        class="mt-4"
      >
        <template #leading>
          <UIcon name="i-heroicons-plus-circle" class="w-6 h-6" />
        </template>
        Create New Order
      </UButton>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">Your Orders</h2>
          <UButton @click="refresh" icon="i-heroicons-arrow-path" variant="outline" :loading="loading">
            Refresh
          </UButton>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Order History -->
        <div>
          <h2 class="text-xl font-semibold mb-4">Your Orders</h2>
          <div v-if="orders.length === 0" class="text-center py-8 text-gray-500">
            No orders yet. Create your first smoothie order above!
          </div>
          <div v-else class="space-y-4">
            <UCard v-for="order in orders" :key="order.id" class="relative">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <UBadge :color="getStatusColor(order.status)">
                      {{ order.status }}
                    </UBadge>
                    <span class="text-sm text-gray-500">
                      {{ formatDate(order.createdAt) }}
                    </span>
                  </div>
                  <p class="text-sm">
                    <span class="font-semibold">{{ getBaseName(order.baseId) }}</span>
                    - {{ getSizeName(order.sizeId) }}
                  </p>
                  <p class="text-sm text-gray-600">
                    {{ order.fruitIds.map(id => getFruitName(id)).join(', ') || 'No fruits' }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-bold">${{ order.price.toFixed(2) }}</p>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import type { SmoothieOrder } from '~/../../shared/types/order'
import type { SmoothieBase, SmoothieFruit, SmoothieSize } from '~/../../shared/types/smoothie'

// Auth is handled by global middleware

const { user } = useUserSession()
const customerId = computed(() => (user.value as any)?.email || (user.value as any)?.id || '')

const orders = ref<SmoothieOrder[]>([])
const bases = ref<SmoothieBase[]>([])
const fruits = ref<SmoothieFruit[]>([])
const sizes = ref<SmoothieSize[]>([])
const loading = ref(false)

function getBaseName(id: string): string {
  return bases.value.find(b => b.id === id)?.name || id
}

function getFruitName(id: string): string {
  return fruits.value.find(f => f.id === id)?.name || id
}

function getSizeName(id: string): string {
  return sizes.value.find(s => s.id === id)?.name || id
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'draft': return 'gray'
    case 'queued': return 'yellow'
    case 'blending': return 'blue'
    case 'done': return 'green'
    default: return 'gray'
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

async function refresh() {
  loading.value = true
  try {
    // Fetch menu data (for displaying order details)
    bases.value = await $fetch('/api/menu/bases')
    fruits.value = await $fetch('/api/menu/fruits')
    sizes.value = await $fetch('/api/menu/sizes')

    // Fetch order history
    orders.value = await $fetch('/api/customer-orders')
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

// Load data when component mounts
onMounted(() => {
  if (customerId.value) {
    refresh()
  }
})
</script>

