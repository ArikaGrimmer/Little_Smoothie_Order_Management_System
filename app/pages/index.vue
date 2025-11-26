<template>
  <UContainer class="py-8">
    <!-- Welcome Section -->
    <div class="mb-8">
      <UCard v-if="loggedIn">
        <div class="flex items-center space-x-4">
          <UAvatar
            :src="(user as any)?.avatar"
            :alt="(user as any)?.name"
            size="lg"
          />
          <div>
            <h1 class="text-2xl font-bold dark:text-white">Welcome back, {{ (user as any)?.name }}!</h1>
            <p class="text-gray-600 dark:text-gray-300">Manage your smoothie orders and operations</p>
          </div>
        </div>
      </UCard>

      <UCard v-else>
        <div class="text-center py-8">
          <h1 class="text-3xl font-bold mb-4 dark:text-white">🥤 Little Smoothie Order Management</h1>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            Welcome to our smoothie ordering system. Sign in to place orders or manage operations.
          </p>
          <UButton to="/login" size="lg" color="primary">
            Get Started
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Quick Actions for Logged In Users -->
    <div v-if="loggedIn" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <UCard>
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-shopping-bag" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 class="text-xl font-bold dark:text-white">Customer Portal</h2>
          </div>
        </template>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          Create and manage your smoothie orders
        </p>
        <UButton to="/customer" color="primary" variant="outline">
          Go to Orders
        </UButton>
      </UCard>

      <UCard v-if="hasOperatorRole">
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-clipboard-document-list" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 class="text-xl font-bold dark:text-white">Operator Dashboard</h2>
          </div>
        </template>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          Process and manage smoothie orders
        </p>
        <UButton to="/operator" color="blue" variant="outline">
          Go to Dashboard
        </UButton>
      </UCard>
    </div>

    <!-- Features Section -->
    <UCard>
      <template #header>
        <h2 class="text-2xl font-bold">Features</h2>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center p-4">
          <UIcon name="i-heroicons-sparkles" class="w-12 h-12 mx-auto mb-3 text-primary-600" />
          <h3 class="font-semibold mb-2">Customizable Orders</h3>
          <p class="text-sm text-gray-600">
            Choose your base, fruits, sweetness, ice level, and size
          </p>
        </div>

        <div class="text-center p-4">
          <UIcon name="i-heroicons-clock" class="w-12 h-12 mx-auto mb-3 text-green-600" />
          <h3 class="font-semibold mb-2">Real-time Tracking</h3>
          <p class="text-sm text-gray-600">
            Track your order from draft to completion
          </p>
        </div>

        <div class="text-center p-4">
          <UIcon name="i-heroicons-users" class="w-12 h-12 mx-auto mb-3 text-blue-600" />
          <h3 class="font-semibold mb-2">Operator Dashboard</h3>
          <p class="text-sm text-gray-600">
            Efficient order management for staff
          </p>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  auth: false
})

const { loggedIn, user } = useUserSession()

const hasOperatorRole = computed(() => {
  return (user.value as any)?.roles?.includes('operator') || false
})
</script>

