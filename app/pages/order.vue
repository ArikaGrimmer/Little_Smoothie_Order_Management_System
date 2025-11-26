<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Header -->
    <div class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
      <UContainer>
        <div class="flex items-center justify-between py-4">
          <UButton 
            icon="i-heroicons-arrow-left" 
            variant="ghost" 
            @click="navigateTo('/customer')"
          >
            Back
          </UButton>
          <h1 class="text-lg font-semibold dark:text-white">Build Your Smoothie</h1>
          <div class="w-16"></div>
        </div>
      </UContainer>
    </div>

    <UContainer class="py-6 pb-32">
      <!-- Hero Section -->
      <div class="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 p-8 text-white text-center">
        <div class="relative z-10">
          <div class="text-6xl mb-4">🥤</div>
          <h2 class="text-2xl font-bold mb-2">Craft Your Perfect Smoothie</h2>
          <p class="text-white/90">Fresh, healthy, and delicious</p>
        </div>
        <div class="absolute inset-0 bg-black/10"></div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-600" />
        <p class="mt-4 text-gray-600">Loading menu...</p>
      </div>

      <!-- Order Builder -->
      <div v-else class="space-y-6">
        <!-- Step 1: Base -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 class="font-bold text-lg dark:text-white">Choose Your Base</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Required</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 gap-3">
            <div
              v-for="base in bases"
              :key="base.id"
              @click="form.baseId = base.id"
              :class="[
                'relative p-4 rounded-xl border-2 cursor-pointer transition-all',
                form.baseId === base.id
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              ]"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="text-2xl">🥛</div>
                  <div>
                    <p class="font-semibold dark:text-white">{{ base.name }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${{ base.price.toFixed(2) }}</p>
                  </div>
                </div>
                <UIcon 
                  v-if="form.baseId === base.id"
                  name="i-heroicons-check-circle-solid" 
                  class="w-6 h-6 text-primary-600"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Fruits -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h3 class="font-bold text-lg dark:text-white">Add Fruits</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Optional - Select multiple</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="fruit in fruits"
              :key="fruit.id"
              @click="toggleFruit(fruit.id)"
              :class="[
                'relative p-4 rounded-xl border-2 cursor-pointer transition-all',
                selectedFruits.includes(fruit.id)
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 dark:border-pink-400'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              ]"
            >
              <div class="text-center">
                <div class="text-3xl mb-2">{{ getFruitEmoji(fruit.id) }}</div>
                <p class="font-semibold text-sm dark:text-white">{{ fruit.name }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">+${{ fruit.extraPrice.toFixed(2) }}</p>
              </div>
              <UIcon 
                v-if="selectedFruits.includes(fruit.id)"
                name="i-heroicons-check-circle-solid" 
                class="absolute top-2 right-2 w-5 h-5 text-pink-500"
              />
            </div>
          </div>
        </div>

        <!-- Step 3: Size -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h3 class="font-bold text-lg">Select Size</h3>
              <p class="text-sm text-gray-600">Required</p>
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="size in sizes"
              :key="size.id"
              @click="form.sizeId = size.id"
              :class="[
                'relative p-4 rounded-xl border-2 cursor-pointer transition-all text-center',
                form.sizeId === size.id
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <div class="text-2xl mb-1">{{ getSizeIcon(size.id) }}</div>
              <p class="font-semibold text-sm">{{ size.name.split(' ')[0] }}</p>
              <p class="text-xs text-gray-600">{{ size.multiplier }}x</p>
              <UIcon 
                v-if="form.sizeId === size.id"
                name="i-heroicons-check-circle-solid" 
                class="absolute top-2 right-2 w-5 h-5 text-primary-600"
              />
            </div>
          </div>
        </div>

        <!-- Step 4: Customization -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <h3 class="font-bold text-lg">Customize</h3>
              <p class="text-sm text-gray-600">Optional preferences</p>
            </div>
          </div>
          
          <div class="space-y-4">
            <!-- Sweetness -->
            <div>
              <label class="block text-sm font-medium mb-2">Sweetness Level</label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="level in sweetnessLevels"
                  :key="level.value"
                  @click="form.sweetness = level.value"
                  :class="[
                    'p-3 rounded-lg border-2 text-sm font-medium transition-all',
                    form.sweetness === level.value
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  {{ level.label }}
                </button>
              </div>
            </div>

            <!-- Ice Level -->
            <div>
              <label class="block text-sm font-medium mb-2">Ice Level</label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="level in iceLevels"
                  :key="level.value"
                  @click="form.iceLevel = level.value"
                  :class="[
                    'p-3 rounded-lg border-2 text-sm font-medium transition-all',
                    form.iceLevel === level.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  {{ level.label }}
                </button>
              </div>
            </div>

            <!-- Special Instructions -->
            <div>
              <label class="block text-sm font-medium mb-2">Special Instructions</label>
              <UTextarea 
                v-model="form.extraNote" 
                placeholder="Any special requests? (e.g., extra blended)"
                :rows="3"
              />
            </div>
          </div>
        </div>
      </div>
    </UContainer>

    <!-- Sticky Footer with Price and Actions -->
    <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-40">
      <UContainer>
        <div class="py-4">
          <!-- Price Breakdown -->
          <div class="mb-3 space-y-1">
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Base ({{ getBaseName(form.baseId) }})</span>
              <span>${{ getBasePrice().toFixed(2) }}</span>
            </div>
            <div v-if="selectedFruits.length > 0" class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Fruits ({{ selectedFruits.length }})</span>
              <span>+${{ getFruitsPrice().toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Size ({{ getSizeName(form.sizeId) }})</span>
              <span>×{{ getSizeMultiplier() }}</span>
            </div>
            <div class="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-700 dark:text-white">
              <span>Total</span>
              <span class="text-primary-600 dark:text-primary-400">${{ calculatePrice().toFixed(2) }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <UButton 
              @click="saveDraft" 
              :loading="saving" 
              variant="outline"
              size="lg"
              class="flex-1"
            >
              Save Draft
            </UButton>
            <UButton 
              @click="submitOrder" 
              :loading="submitting" 
              color="primary"
              size="lg"
              class="flex-1"
              :disabled="!canSubmit"
            >
              Add to Order
            </UButton>
          </div>
        </div>
      </UContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SmoothieOrder } from '~/../../shared/types/order'
import type { SmoothieBase, SmoothieFruit, SmoothieSize } from '~/../../shared/types/smoothie'

const { user } = useUserSession()
const customerId = computed(() => (user.value as any)?.email || (user.value as any)?.id || '')

const bases = ref<SmoothieBase[]>([])
const fruits = ref<SmoothieFruit[]>([])
const sizes = ref<SmoothieSize[]>([])
const loading = ref(false)
const saving = ref(false)
const submitting = ref(false)

const selectedFruits = ref<string[]>([])

const form = ref({
  baseId: '',
  sizeId: '',
  sweetness: 'regular' as 'none' | 'low' | 'regular' | 'extra',
  iceLevel: 'regular' as 'none' | 'less' | 'regular' | 'extra',
  extraNote: ''
})

const sweetnessLevels = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'regular', label: 'Regular' },
  { value: 'extra', label: 'Extra' }
]

const iceLevels = [
  { value: 'none', label: 'None' },
  { value: 'less', label: 'Less' },
  { value: 'regular', label: 'Regular' },
  { value: 'extra', label: 'Extra' }
]

const canSubmit = computed(() => {
  return form.value.baseId && form.value.sizeId
})

function toggleFruit(fruitId: string) {
  const index = selectedFruits.value.indexOf(fruitId)
  if (index > -1) {
    selectedFruits.value.splice(index, 1)
  } else {
    selectedFruits.value.push(fruitId)
  }
}

function getBaseName(id: string): string {
  return bases.value.find(b => b.id === id)?.name || 'Select base'
}

function getFruitName(id: string): string {
  return fruits.value.find(f => f.id === id)?.name || id
}

function getSizeName(id: string): string {
  return sizes.value.find(s => s.id === id)?.name || 'Select size'
}

function getSizeIcon(id: string): string {
  const icons: Record<string, string> = {
    small: '🥤',
    medium: '🥤',
    large: '🥤',
    xlarge: '🥤'
  }
  return icons[id] || '🥤'
}

function getFruitEmoji(id: string): string {
  const emojis: Record<string, string> = {
    strawberry: '🍓',
    banana: '🍌',
    blueberry: '🫐',
    mango: '🥭',
    pineapple: '🍍',
    raspberry: '🍇',
    peach: '🍑',
    kiwi: '🥝'
  }
  return emojis[id] || '🍎'
}

function getBasePrice(): number {
  const base = bases.value.find(b => b.id === form.value.baseId)
  return base?.price || 0
}

function getFruitsPrice(): number {
  return selectedFruits.value.reduce((sum, fruitId) => {
    const fruit = fruits.value.find(f => f.id === fruitId)
    return sum + (fruit?.extraPrice || 0)
  }, 0)
}

function getSizeMultiplier(): number {
  const size = sizes.value.find(s => s.id === form.value.sizeId)
  return size?.multiplier || 1.0
}

function calculatePrice(): number {
  const basePrice = getBasePrice()
  const fruitsPrice = getFruitsPrice()
  const multiplier = getSizeMultiplier()
  return Number(((basePrice + fruitsPrice) * multiplier).toFixed(2))
}

async function loadData() {
  loading.value = true
  try {
    bases.value = await $fetch('/api/menu/bases')
    fruits.value = await $fetch('/api/menu/fruits')
    sizes.value = await $fetch('/api/menu/sizes')

    // Set defaults
    if (bases.value.length > 0 && !form.value.baseId) {
      form.value.baseId = bases.value[0].id
    }
    if (sizes.value.length > 0 && !form.value.sizeId) {
      form.value.sizeId = sizes.value[1]?.id || sizes.value[0].id // Default to medium if available
    }

    // Try to load draft
    const draftResponse = await $fetch(`/api/customer/${customerId.value}/draft-order`)
    if (draftResponse && (draftResponse as any).order) {
      const draft = (draftResponse as any).order
      form.value = {
        baseId: draft.baseId,
        sizeId: draft.sizeId,
        sweetness: draft.sweetness,
        iceLevel: draft.iceLevel,
        extraNote: draft.extraNote || ''
      }
      selectedFruits.value = [...draft.fruitIds]
    }
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    loading.value = false
  }
}

async function saveDraft() {
  if (!canSubmit.value) {
    alert('Please select a base and size')
    return
  }

  saving.value = true
  try {
    const response = await $fetch(`/api/customer/${customerId.value}/draft-order`, {
      method: 'PUT',
      body: {
        baseId: form.value.baseId,
        fruitIds: selectedFruits.value,
        sweetness: form.value.sweetness,
        iceLevel: form.value.iceLevel,
        sizeId: form.value.sizeId,
        extraNote: form.value.extraNote
      }
    })
    
    if ((response as any).ok) {
      alert('Draft saved successfully! ✅')
    }
  } catch (error) {
    console.error('Failed to save draft:', error)
    alert('Failed to save draft')
  } finally {
    saving.value = false
  }
}

async function submitOrder() {
  // First save as draft
  await saveDraft()
  
  if (!canSubmit.value) {
    return
  }

  submitting.value = true
  try {
    await $fetch('/api/customer/submit-draft', {
      method: 'POST'
    })
    
    alert('Order submitted successfully! 🎉')
    navigateTo('/customer')
  } catch (error) {
    console.error('Failed to submit order:', error)
    alert('Failed to submit order')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (customerId.value) {
    loadData()
  }
})
</script>

