<template>
  <a-layout class="basic-layout">
    <GlobalHeader />
    <a-layout-content class="main-content">
      <router-view />
    </a-layout-content>
    <GlobalFooter />
  </a-layout>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalFooter from '@/components/GlobalFooter.vue'
</script>

<style scoped>
.basic-layout {
  min-height: 100vh;
  background: var(--color-background);
  position: relative;
}

.basic-layout::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(180, 83, 9, 0.06), transparent),
    radial-gradient(ellipse 60% 40% at 100% 100%, rgba(28, 25, 23, 0.03), transparent);
}

.main-content {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 0;
  background: transparent;
  margin: 0;
}
</style>
