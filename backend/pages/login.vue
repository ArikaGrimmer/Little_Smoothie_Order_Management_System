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
          <span>or</span>
        </div>

        <!-- Demo Login Options -->
        <div class="demo-login-section">
          <p class="demo-label">Try as Demo User:</p>
          <div class="demo-buttons">
            <button 
              @click="signInAsDemo('customer')"
              :disabled="loading.demoCustomer"
              class="login-btn demo-btn demo-customer-btn"
            >
              <span class="btn-icon">👤</span>
              <span>{{ loading.demoCustomer ? 'Signing in...' : 'Demo Customer' }}</span>
            </button>
            <button 
              @click="signInAsDemo('operator')"
              :disabled="loading.demoOperator"
              class="login-btn demo-btn demo-operator-btn"
            >
              <span class="btn-icon">👨‍🍳</span>
              <span>{{ loading.demoOperator ? 'Signing in...' : 'Demo Operator' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="route.query.error" class="error-message">
        <p v-if="route.query.error === 'github_auth_failed'">
          ❌ GitHub authentication failed. This is usually caused by a "state mismatch" error.
        </p>
        <p v-else-if="route.query.error === 'github_config_missing'">
          ❌ GitHub OAuth is not configured. Please set NUXT_OAUTH_GITHUB_CLIENT_ID and NUXT_OAUTH_GITHUB_CLIENT_SECRET in your .env file.
        </p>
        <p v-else>
          ❌ An error occurred during authentication.
        </p>
        <p v-if="route.query.error === 'github_auth_failed'" style="margin-top: 0.5rem; font-size: 0.85rem;">
          <strong>Try this:</strong> Clear your browser cookies for this site, close other tabs, and try again.
        </p>
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

const route = useRoute()
const router = useRouter()
const { loggedIn } = useUserSession()
const loading = ref({
  github: false,
  demoCustomer: false,
  demoOperator: false
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

async function signInAsDemo(role: 'customer' | 'operator') {
  const loadingKey = role === 'customer' ? 'demoCustomer' : 'demoOperator'
  loading.value[loadingKey] = true
  
  try {
    const response = await $fetch('/api/auth/demo', {
      method: 'POST',
      body: { role }
    })
    
    if (response.ok) {
      // Use full page reload to ensure session is properly read
      window.location.href = '/'
    } else {
      throw new Error('Demo login failed')
    }
  } catch (error: any) {
    console.error('Demo login error:', error)
    alert(`Failed to sign in as demo ${role}. Please try again.`)
    loading.value[loadingKey] = false
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

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: #999;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e0e0e0;
}

.divider span {
  padding: 0 1rem;
  font-size: 0.9rem;
}

.demo-login-section {
  margin-top: 1rem;
}

.demo-label {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.demo-buttons {
  display: flex;
  gap: 0.75rem;
}

.demo-btn {
  flex: 1;
}

.demo-customer-btn {
  border-color: #f093fb;
  color: #f5576c;
}

.demo-customer-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.demo-operator-btn {
  border-color: #4facfe;
  color: #00f2fe;
}

.demo-operator-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
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

.error-message {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #ffebee;
  border: 1px solid #ef5350;
  border-radius: 8px;
  color: #c62828;
  font-size: 0.9rem;
  text-align: center;
}

.error-message p {
  margin: 0;
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

