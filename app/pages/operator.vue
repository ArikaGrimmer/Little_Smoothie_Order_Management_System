<template>
  <UContainer class="py-8">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-blue-600">
              Operator Dashboard - {{ (user as any)?.name }}
            </h1>
            <p class="text-gray-600">Manage and process smoothie orders</p>
          </div>
          <UButton @click="refresh" icon="i-heroicons-arrow-path" variant="outline" :loading="loading">
            Refresh Orders
          </UButton>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <UCard>
            <div class="text-center">
              <p class="text-3xl font-bold text-yellow-600">{{ queuedCount }}</p>
              <p class="text-sm text-gray-600">Queued</p>
            </div>
          </UCard>
          <UCard>
            <div class="text-center">
              <p class="text-3xl font-bold text-blue-600">{{ blendingCount }}</p>
              <p class="text-sm text-gray-600">Blending</p>
            </div>
          </UCard>
          <UCard>
            <div class="text-center">
              <p class="text-3xl font-bold text-green-600">{{ doneCount }}</p>
              <p class="text-sm text-gray-600">Done</p>
            </div>
          </UCard>
          <UCard>
            <div class="text-center">
              <p class="text-3xl font-bold text-primary-600">{{ totalOrders }}</p>
              <p class="text-sm text-gray-600">Total</p>
            </div>
          </UCard>
        </div>

        <!-- Orders List -->
        <div>
          <h2 class="text-xl font-semibold mb-4">All Orders</h2>
          
          <div v-if="orders.length === 0" class="text-center py-12 text-gray-500">
            <UIcon name="i-heroicons-clipboard-document-list" class="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No orders to process.</p>
            <p class="text-sm">Orders will appear here when customers place them.</p>
          </div>

          <div v-else class="space-y-4">
            <UCard 
              v-for="order in filteredOrders" 
              :key="order.id"
              :class="{
                'border-l-4 border-l-yellow-500': order.status === 'queued',
                'border-l-4 border-l-blue-500': order.status === 'blending',
                'border-l-4 border-l-green-500': order.status === 'done'
              }"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <!-- Order Status and ID -->
                  <div class="flex items-center gap-2 mb-3">
                    <UBadge :color="getStatusColor(order.status)" size="lg">
                      {{ order.status }}
                    </UBadge>
                    <span class="text-sm text-gray-500 font-mono">
                      Order #{{ order.id?.slice(-6) }}
                    </span>
                    <span class="text-xs text-gray-400">
                      {{ formatDate(order.createdAt) }}
                    </span>
                  </div>

                  <!-- Customer Info -->
                  <div class="mb-2">
                    <p class="text-sm text-gray-600">Customer</p>
                    <p class="font-semibold">{{ order.customerId }}</p>
                  </div>

                  <!-- Order Details -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p class="text-xs text-gray-600">Base</p>
                      <p class="text-sm font-medium">{{ order.baseId }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-600">Size</p>
                      <p class="text-sm font-medium">{{ order.sizeId }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-600">Sweetness</p>
                      <p class="text-sm font-medium capitalize">{{ order.sweetness }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-600">Ice</p>
                      <p class="text-sm font-medium capitalize">{{ order.iceLevel }}</p>
                    </div>
                  </div>

                  <!-- Fruits -->
                  <div v-if="order.fruitIds.length" class="mb-3">
                    <p class="text-xs text-gray-600 mb-1">Fruits</p>
                    <div class="flex flex-wrap gap-1">
                      <UBadge 
                        v-for="fruitId in order.fruitIds" 
                        :key="fruitId"
                        size="sm"
                        variant="subtle"
                        color="primary"
                      >
                        {{ fruitId }}
                      </UBadge>
                    </div>
                  </div>

                  <!-- Special Instructions -->
                  <div v-if="order.extraNote" class="mb-3">
                    <p class="text-xs text-gray-600">Special Instructions</p>
                    <p class="text-sm italic">{{ order.extraNote }}</p>
                  </div>

                  <!-- Operator Assigned -->
                  <div v-if="order.operatorId" class="text-sm text-gray-600">
                    <UIcon name="i-heroicons-user" class="inline w-4 h-4" />
                    Operator: {{ order.operatorId }}
                  </div>
                </div>

                <!-- Price and Actions -->
                <div class="flex flex-col items-end justify-between min-w-[120px]">
                  <div class="text-right mb-4">
                    <p class="text-2xl font-bold text-primary-600">
                      ${{ order.price.toFixed(2) }}
                    </p>
                  </div>

                  <!-- Action Buttons based on status -->
                  <div class="flex flex-col gap-2 w-full">
                    <!-- Queued -> Start Blending -->
                    <UButton
                      v-if="order.status === 'queued'"
                      @click="startBlending(order.id)"
                      color="blue"
                      block
                      :loading="updatingOrders.has(order.id)"
                    >
                      <template #leading>
                        <UIcon name="i-heroicons-play" />
                      </template>
                      Start Blending
                    </UButton>

                    <!-- Blending -> Mark Done (only if current operator is assigned) -->
                    <UButton
                      v-else-if="order.status === 'blending'"
                      @click="markDone(order.id)"
                      color="green"
                      block
                      :loading="updatingOrders.has(order.id)"
                    >
                      <template #leading>
                        <UIcon name="i-heroicons-check" />
                      </template>
                      Mark Done
                    </UButton>

                    <!-- Done -->
                    <UBadge v-else-if="order.status === 'done'" color="green" size="lg">
                      ✓ Completed
                    </UBadge>
                  </div>
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

// Check if user has operator role
const { user } = useUserSession()

if (!(user.value as any)?.roles?.includes('operator')) {
  throw createError({
    statusCode: 403,
    statusMessage: 'Access denied. Operator role required.'
  })
}

const operatorId = computed(() => (user.value as any)?.email || (user.value as any)?.id || '')

const orders = ref<SmoothieOrder[]>([])
const loading = ref(false)
const updatingOrders = ref(new Set<string>())

// Filter out draft orders (operators shouldn't see drafts)
const filteredOrders = computed(() => 
  orders.value.filter(order => order.status !== 'draft')
)

// Statistics
const queuedCount = computed(() => 
  filteredOrders.value.filter(o => o.status === 'queued').length
)

const blendingCount = computed(() => 
  filteredOrders.value.filter(o => o.status === 'blending').length
)

const doneCount = computed(() => 
  filteredOrders.value.filter(o => o.status === 'done').length
)

const totalOrders = computed(() => filteredOrders.value.length)

function getStatusColor(status: string): string {
  switch (status) {
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
    // Fetch all orders
    orders.value = await $fetch('/api/orders')
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  } finally {
    loading.value = false
  }
}

async function startBlending(orderId: string) {
  if (!operatorId.value) return

  updatingOrders.value.add(orderId)
  try {
    await $fetch(`/api/order/${orderId}/update-status`, {
      method: 'PUT',
      body: {
        status: 'blending',
        operatorId: operatorId.value
      }
    })
    await refresh()
  } catch (error) {
    console.error('Failed to start blending:', error)
    alert('Failed to update order')
  } finally {
    updatingOrders.value.delete(orderId)
  }
}

async function markDone(orderId: string) {
  if (!operatorId.value) return

  updatingOrders.value.add(orderId)
  try {
    await $fetch(`/api/order/${orderId}/update-status`, {
      method: 'PUT',
      body: {
        status: 'done',
        operatorId: operatorId.value
      }
    })
    await refresh()
  } catch (error) {
    console.error('Failed to mark done:', error)
    alert('Failed to update order')
  } finally {
    updatingOrders.value.delete(orderId)
  }
}

// Load data when component mounts
onMounted(() => {
  refresh()
})
</script>

