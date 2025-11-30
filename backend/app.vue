<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import './assets/css/main.css'

useHead({
  titleTemplate: '%s | Little Smoothie',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'Little Smoothie Order Management System' }
  ]
})
</script>
