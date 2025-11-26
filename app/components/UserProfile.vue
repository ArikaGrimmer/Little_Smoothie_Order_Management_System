<template>
  <UDropdown :items="menuItems">
    <UButton
      variant="ghost"
      class="flex items-center space-x-2"
    >
      <UAvatar
        :src="(user as any)?.avatar"
        :alt="(user as any)?.name"
        size="sm"
      />
      <span class="hidden sm:block">{{ (user as any)?.name }}</span>
      <UIcon name="i-heroicons-chevron-down-20-solid" class="w-4 h-4" />
    </UButton>
  </UDropdown>
</template>

<script setup lang="ts">
const { user } = useUserSession()

const menuItems = computed(() => [
  [{
    label: (user.value as any)?.email || '',
    slot: 'account',
    disabled: true
  }],
  [{
    label: 'Profile',
    icon: 'i-heroicons-user-circle',
    click: () => navigateTo('/profile')
  }],
  [{
    label: 'Sign out',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: logout
  }]
])

async function logout() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    // Force a full page refresh to clear all session state
    window.location.href = '/'
  } catch (error) {
    console.error('Logout error:', error)
    // Even if logout fails, redirect to clear UI state
    window.location.href = '/'
  }
}
</script>

