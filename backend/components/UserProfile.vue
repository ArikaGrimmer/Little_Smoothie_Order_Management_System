<template>
  <div class="user-profile">
    <div class="profile-trigger" @click="toggleMenu" ref="triggerRef">
      <img 
        :src="(user as any)?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((user as any)?.name || 'User')}&background=667eea&color=fff`" 
        :alt="(user as any)?.name"
        class="avatar"
      />
      <span class="user-name">{{ (user as any)?.name }}</span>
      <span class="chevron">▼</span>
    </div>

    <div v-if="isOpen" class="dropdown-menu" ref="menuRef">
      <div class="menu-header">
        <p class="user-email">{{ (user as any)?.email }}</p>
        <div class="user-roles">
          <span 
            v-for="role in ((user as any)?.roles || ['customer'])" 
            :key="role"
            class="role-badge"
            :class="`role-${role}`"
          >
            {{ role }}
          </span>
        </div>
      </div>

      <div class="menu-divider"></div>

      <button @click="logout" class="menu-item logout-btn">
        <span>🚪</span>
        <span>Sign out</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const { user } = useUserSession()
const isOpen = ref(false)
const triggerRef = ref<HTMLElement>()
const menuRef = ref<HTMLElement>()

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function handleClickOutside(event: MouseEvent) {
  if (
    isOpen.value &&
    triggerRef.value &&
    menuRef.value &&
    !triggerRef.value.contains(event.target as Node) &&
    !menuRef.value.contains(event.target as Node)
  ) {
    isOpen.value = false
  }
}

async function logout() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    // Force a full page refresh to clear all session state
    window.location.href = '/login'
  } catch (error) {
    console.error('Logout error:', error)
    // Even if logout fails, redirect to clear UI state
    window.location.href = '/login'
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.user-profile {
  position: relative;
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.profile-trigger:hover {
  background: rgba(255, 255, 255, 0.3);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid white;
}

.user-name {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.chevron {
  color: white;
  font-size: 0.7rem;
  transition: transform 0.3s ease;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-header {
  padding: 1rem;
}

.user-email {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  margin-bottom: 0.5rem;
  word-break: break-word;
}

.user-roles {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-customer {
  background: #e6f7ff;
  color: #0066cc;
}

.role-operator {
  background: #e6f9ed;
  color: #00a854;
}

.menu-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 0 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 0.9rem;
}

.menu-item:hover {
  background: #f5f5f5;
}

.logout-btn {
  color: #dc3545;
  font-weight: 600;
  border-radius: 0 0 12px 12px;
}

.logout-btn:hover {
  background: #ffebee;
}

@media (max-width: 640px) {
  .user-name {
    display: none;
  }

  .dropdown-menu {
    right: -0.5rem;
  }
}
</style>

