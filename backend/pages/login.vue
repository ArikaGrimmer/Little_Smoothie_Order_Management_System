<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>🥤 Little Smoothie</h1>
        <h2>Sign in to your account</h2>
        <p>Choose your authentication method</p>
      </div>

      <div class="login-methods">
        <!-- GitHub OAuth -->
        <button 
          @click="signInWithGitHub"
          :disabled="loading.github"
          class="login-btn github-btn"
        >
          <span class="btn-icon">🐙</span>
          <span>{{ loading.github ? 'Signing in...' : 'Continue with GitHub' }}</span>
        </button>

        <!-- Divider -->
        <div class="divider">
          <span>Or for demo</span>
        </div>

        <!-- Demo Login (for development) -->
        <button
          @click="signInDemo"
          :disabled="loading.demo"
          class="login-btn demo-btn"
        >
          <span class="btn-icon">👤</span>
          <span>{{ loading.demo ? 'Signing in...' : 'Demo Login' }}</span>
        </button>
      </div>

      <div class="login-footer">
        <p>By signing in, you agree to our terms of service and privacy policy.</p>
      </div>
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
  github: false,
  demo: false
})

// Redirect if already logged in
watch(loggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    navigateTo('/')
  }
}, { immediate: true })

async function signInWithGitHub() {
  loading.value.github = true
  try {
    await navigateTo('/api/auth/github', { external: true })
  } catch (error) {
    console.error('GitHub login error:', error)
    alert('Failed to sign in with GitHub. Please try again.')
  } finally {
    loading.value.github = false
  }
}

async function signInDemo() {
  loading.value.demo = true
  try {
    const response = await $fetch('/api/auth/demo', {
      method: 'POST'
    })

    if (response) {
      await navigateTo('/')
    }
  } catch (error) {
    console.error('Demo login error:', error)
    alert('Failed to sign in with demo. Please try again.')
  } finally {
    loading.value.demo = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-container {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-header h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #666;
  font-size: 1rem;
}

.login-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.5rem;
}

.github-btn {
  border-color: #333;
  color: #333;
}

.github-btn:hover:not(:disabled) {
  background: #333;
  color: white;
}

.demo-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.demo-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.divider {
  position: relative;
  text-align: center;
  margin: 0.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: #e0e0e0;
}

.divider span {
  position: relative;
  background: white;
  padding: 0 1rem;
  color: #999;
  font-size: 0.875rem;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
}

.login-footer p {
  font-size: 0.75rem;
  color: #999;
  line-height: 1.4;
}

@media (max-width: 640px) {
  .login-container {
    padding: 2rem;
  }

  .login-header h1 {
    font-size: 2rem;
  }

  .login-header h2 {
    font-size: 1.25rem;
  }
}
</style>

