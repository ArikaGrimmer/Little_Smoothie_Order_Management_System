<template>
  <UContainer class="py-8">
    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold">Profile</h1>
      </template>

      <div class="space-y-6">
        <!-- User Info -->
        <div class="flex items-center space-x-4">
          <UAvatar
            :src="(user as any)?.avatar"
            :alt="(user as any)?.name"
            size="xl"
          />
          <div>
            <h2 class="text-xl font-bold">{{ (user as any)?.name }}</h2>
            <p class="text-gray-600">{{ (user as any)?.email }}</p>
          </div>
        </div>

        <!-- Account Details -->
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-600">Authentication Provider</p>
            <p class="font-semibold capitalize">{{ (user as any)?.provider }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-600">User ID</p>
            <p class="font-mono text-sm">{{ (user as any)?.id }}</p>
          </div>

          <div v-if="(user as any)?.roles">
            <p class="text-sm text-gray-600 mb-2">Roles</p>
            <div class="flex gap-2">
              <UBadge 
                v-for="role in (user as any)?.roles" 
                :key="role"
                color="primary"
              >
                {{ role }}
              </UBadge>
            </div>
          </div>

          <div v-if="(user as any)?.organizations && (user as any)?.organizations.length">
            <p class="text-sm text-gray-600 mb-2">GitHub Organizations</p>
            <div class="flex flex-wrap gap-2">
              <UBadge 
                v-for="org in (user as any)?.organizations" 
                :key="org"
                variant="subtle"
              >
                {{ org }}
              </UBadge>
            </div>
          </div>

          <div v-if="(user as any)?.groups && (user as any)?.groups.length">
            <p class="text-sm text-gray-600 mb-2">GitLab Groups</p>
            <div class="flex flex-wrap gap-2">
              <UBadge 
                v-for="group in (user as any)?.groups" 
                :key="group"
                variant="subtle"
              >
                {{ group }}
              </UBadge>
            </div>
          </div>
        </div>

        <!-- Session Info -->
        <div v-if="session" class="pt-4 border-t">
          <p class="text-sm text-gray-600">Logged in at</p>
          <p class="text-sm">{{ new Date((session as any).loggedInAt).toLocaleString() }}</p>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
const { user, session } = useUserSession()
</script>

