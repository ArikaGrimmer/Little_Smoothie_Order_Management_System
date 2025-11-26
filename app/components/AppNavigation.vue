<template>
  <nav class="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <UContainer class="py-4">
      <div class="flex items-center justify-between">
        <NuxtLink to="/" class="text-xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
          🥤 Little Smoothie Order Management
        </NuxtLink>

        <div class="flex items-center space-x-4">
          <!-- Main Navigation -->
          <div class="hidden md:flex items-center space-x-2">
            <!-- Login Button (only when not logged in) -->
            <UButton v-if="!loggedIn" to="/login" variant="solid" color="primary">
              Sign In
            </UButton>

            <!-- Customer Button (only when logged in) -->
            <UButton v-if="loggedIn" to="/customer" variant="ghost">
              <template #leading>
                <UIcon name="i-heroicons-shopping-bag" />
              </template>
              My Orders
            </UButton>

            <!-- Operator Button (only for users with operator role) -->
            <UButton
              v-if="hasOperatorRole"
              to="/operator"
              variant="ghost"
            >
              <template #leading>
                <UIcon name="i-heroicons-clipboard-document-list" />
              </template>
              Operator Dashboard
            </UButton>
          </div>

          <!-- Dark Mode Toggle -->
          <ClientOnly>
            <UButton
              :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
              color="gray"
              variant="ghost"
              aria-label="Toggle dark mode"
              @click="toggleDarkMode"
            />
          </ClientOnly>

          <!-- User Profile (only when logged in) -->
          <div v-if="loggedIn">
            <UserProfile />
          </div>
        </div>
      </div>
    </UContainer>
  </nav>
</template>

<script setup lang="ts">
const { loggedIn, user } = useUserSession()
const colorMode = useColorMode()

const hasOperatorRole = computed(() => {
  return (user.value as any)?.roles?.includes('operator') || false
})

const isDark = computed(() => colorMode.value === 'dark')

function toggleDarkMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

