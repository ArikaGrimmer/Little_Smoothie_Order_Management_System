<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <UCard>
        <template #header>
          <div class="text-center">
            <h2 class="text-3xl font-extrabold text-gray-900">
              🥤 Welcome to Little Smoothie
            </h2>
            <p class="mt-2 text-sm text-gray-600">
              Sign in to manage your smoothie orders
            </p>
          </div>
        </template>

        <div class="space-y-3">
          <!-- Google OAuth -->
          <UButton
            @click="signInWithGoogle"
            :loading="loading.google"
            block
            size="lg"
            variant="outline"
            class="flex items-center justify-center gap-2"
          >
            <UIcon name="i-simple-icons-google" class="w-5 h-5" />
            <span>Continue with Google</span>
          </UButton>

          <!-- Microsoft OAuth -->
          <UButton
            @click="signInWithMicrosoft"
            :loading="loading.microsoft"
            block
            size="lg"
            variant="outline"
            class="flex items-center justify-center gap-2"
          >
            <UIcon name="i-simple-icons-microsoft" class="w-5 h-5" />
            <span>Continue with Microsoft</span>
          </UButton>

          <!-- GitHub OAuth -->
          <UButton
            @click="signInWithGitHub"
            :loading="loading.github"
            block
            size="lg"
            variant="outline"
            class="flex items-center justify-center gap-2"
          >
            <UIcon name="i-simple-icons-github" class="w-5 h-5" />
            <span>Continue with GitHub</span>
          </UButton>

          <!-- GitLab OAuth -->
          <UButton
            @click="signInWithGitLab"
            :loading="loading.gitlab"
            block
            size="lg"
            variant="outline"
            class="flex items-center justify-center gap-2"
          >
            <UIcon name="i-simple-icons-gitlab" class="w-5 h-5" />
            <span>Continue with GitLab</span>
          </UButton>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or for demo</span>
            </div>
          </div>

          <!-- Demo Login (for development) -->
          <UButton
            @click="signInDemo"
            :loading="loading.demo"
            block
            size="lg"
            color="primary"
          >
            Demo Login (Customer & Operator)
          </UButton>
        </div>

        <template #footer>
          <div class="text-center">
            <p class="text-xs text-gray-500">
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: false,
  layout: false
})

const { loggedIn } = useUserSession()
const loading = ref({
  google: false,
  microsoft: false,
  github: false,
  gitlab: false,
  demo: false
})

// Redirect if already logged in
watch(loggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    navigateTo('/')
  }
}, { immediate: true })

async function signInWithGoogle() {
  loading.value.google = true
  try {
    await navigateTo('/api/auth/google', { external: true })
  } catch (error) {
    console.error('Google login error:', error)
  } finally {
    loading.value.google = false
  }
}

async function signInWithMicrosoft() {
  loading.value.microsoft = true
  try {
    await navigateTo('/api/auth/microsoft', { external: true })
  } catch (error) {
    console.error('Microsoft login error:', error)
  } finally {
    loading.value.microsoft = false
  }
}

async function signInWithGitHub() {
  loading.value.github = true
  try {
    await navigateTo('/api/auth/github', { external: true })
  } catch (error) {
    console.error('GitHub login error:', error)
  } finally {
    loading.value.github = false
  }
}

async function signInWithGitLab() {
  loading.value.gitlab = true
  try {
    await navigateTo('/api/auth/gitlab', { external: true })
  } catch (error) {
    console.error('GitLab login error:', error)
  } finally {
    loading.value.gitlab = false
  }
}

async function signInDemo() {
  loading.value.demo = true
  try {
    await $fetch('/api/auth/demo', {
      method: 'POST'
    })
    
    await navigateTo('/')
  } catch (error) {
    console.error('Demo login error:', error)
  } finally {
    loading.value.demo = false
  }
}
</script>

