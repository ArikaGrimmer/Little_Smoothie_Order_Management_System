<template>
  <div class="home-page">
    <div class="top-nav">
      <UserProfile />
    </div>
    <div class="container">
      <h1>🥤 Little Smoothie Order System</h1>
      <p class="subtitle">Select your role to continue</p>
      
      <div class="role-cards">
        <NuxtLink to="/menu" class="role-card menu-card">
          <div class="icon">📋</div>
          <h2>Browse Menu</h2>
          <p>Explore our delicious smoothies</p>
        </NuxtLink>
        
        <NuxtLink to="/customer" class="role-card customer-card">
          <div class="icon">👤</div>
          <h2>Quick Order</h2>
          <p>Build a custom smoothie</p>
        </NuxtLink>
        
        <NuxtLink to="/operator" class="role-card operator-card">
          <div class="icon">👨‍🍳</div>
          <h2>Operator</h2>
          <p>Manage orders and menu</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Little Smoothie - Home'
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  position: relative;
}

.top-nav {
  position: absolute;
  top: 1.5rem;
  right: 2rem;
  z-index: 100;
}

.container {
  text-align: center;
  max-width: 800px;
  width: 100%;
}

h1 {
  font-size: 3rem;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  margin-bottom: 3rem;
}

.role-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.role-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem 1.5rem;
  text-decoration: none;
  color: #333;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.role-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.customer-card:hover {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.menu-card:hover {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
}

.operator-card:hover {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

p {
  opacity: 0.8;
  font-size: 1rem;
}

@media (max-width: 640px) {
  h1 {
    font-size: 2rem;
  }
  
  .role-cards {
    grid-template-columns: 1fr;
  }
}
</style>

