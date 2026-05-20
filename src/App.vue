<script setup lang="ts">
import { theme } from 'ant-design-vue'
import BasicLayout from '@/layouts/BasicLayout.vue'

const themeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#1c1917',
    colorSuccess: '#15803d',
    colorWarning: '#ca8a04',
    colorError: '#dc2626',
    colorInfo: '#57534e',
    borderRadius: 10,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    colorBgContainer: '#ffffff',
    colorBgLayout: '#faf9f7',
    colorBorder: '#e7e5e4',
    colorText: '#1c1917',
    colorTextSecondary: '#57534e',
  },
}
</script>

<template>
  <a-config-provider :theme="themeConfig">
    <BasicLayout />
  </a-config-provider>
</template>
