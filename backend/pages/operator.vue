<template>
  <div>
    <!-- This layout allows nested routes like /operator and /operator/menu -->
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Apply operator middleware to all child routes
definePageMeta({
  middleware: 'operator'
})
</script>
