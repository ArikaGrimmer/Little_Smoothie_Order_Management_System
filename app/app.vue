<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Main app component
useHead({
  title: 'Little Smoothie Order Management',
  meta: [
    { name: 'description', content: 'Order and manage smoothies with ease' }
  ],
  htmlAttrs: {
    class: 'h-full'
  },
  bodyAttrs: {
    class: 'h-full bg-gray-50 dark:bg-gray-900'
  }
})
</script>
