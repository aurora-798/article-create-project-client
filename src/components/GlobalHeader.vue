<template>
  <header class="site-header">
    <div class="header-inner">
      <RouterLink to="/" class="brand">
        <img src="@/assets/logo.svg" alt="墨语" class="brand-logo" />
        <div class="brand-text">
          <span class="brand-name">墨语</span>
          <span class="brand-tagline">智能写作</span>
        </div>
      </RouterLink>

      <nav class="main-nav">
        <RouterLink
          v-for="item in menuItems"
          :key="item.key"
          :to="item.key"
          :class="['nav-link', { active: selectedKeys.includes(item.key) }]"
        >
          <component :is="item.icon" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="header-actions">
        <div v-if="loginUserStore.loginUser.id" class="user-area">
          <a-dropdown>
            <button type="button" class="user-trigger">
              <a-avatar :src="loginUserStore.loginUser.userAvatar" :size="34" class="user-avatar" />
              <span class="user-name">{{ loginUserStore.loginUser.userName ?? '无名' }}</span>
            </button>
            <template #overlay>
              <a-menu class="user-menu">
                <a-menu-item @click="goProfile" class="menu-item">
                  <UserOutlined />
                  <span>编辑资料</span>
                </a-menu-item>
                <a-menu-item @click="doLogout" class="menu-item-logout">
                  <LogoutOutlined />
                  <span>退出登录</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <RouterLink v-else to="/user/login" class="login-link">登录</RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { userLogout } from '@/api/userController.ts'
import {
  LogoutOutlined,
  UserOutlined,
  HomeOutlined,
  EditOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  BarChartOutlined,
} from '@ant-design/icons-vue'

const loginUserStore = useLoginUserStore()
const router = useRouter()
const selectedKeys = ref<string[]>(['/'])

router.afterEach((to) => {
  selectedKeys.value = [to.path]
})

const originItems = [
  { key: '/', icon: HomeOutlined, label: '首页' },
  { key: '/create', icon: EditOutlined, label: '创作' },
  { key: '/article/list', icon: UnorderedListOutlined, label: '历史' },
  { key: '/admin/userManage', icon: SettingOutlined, label: '管理', admin: true },
  { key: '/admin/statistics', icon: BarChartOutlined, label: '数据', admin: true },
]

const menuItems = computed(() => {
  return originItems.filter((item) => {
    if (item.admin) {
      const loginUser = loginUserStore.loginUser
      return loginUser && loginUser.userRole === 'admin'
    }
    return true
  })
})

const goProfile = async () => {
  await router.push('/user/profile')
}

const doLogout = async () => {
  const res = await userLogout()
  if (res.data.code === 200) {
    loginUserStore.setLoginUser({ userName: '未登录' })
    message.success('退出登录成功')
    await router.push('/user/login')
  } else {
    message.error('退出登录失败，' + res.data.message)
  }
}
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 200;
  height: var(--header-height);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--color-border);
}

.header-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  height: 100%;
  padding: 0 var(--page-padding);
  display: flex;
  align-items: center;
  gap: 32px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.brand:hover {
  opacity: 0.85;
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 0;
  line-height: 1.2;
}

.brand-name {
  font-family: 'Noto Serif SC', serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 0.08em;
}

.brand-tagline {
  font-size: 11px;
  color: var(--color-text-muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.main-nav {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
}

.nav-link:hover {
  color: var(--color-text);
  background: var(--color-background-tertiary);
}

.nav-link.active {
  color: var(--color-text);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2px;
  background: var(--color-accent);
  border-radius: 1px;
}

.nav-icon {
  font-size: 15px;
}

.header-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.user-trigger:hover {
  border-color: var(--color-text-muted);
  box-shadow: var(--shadow-sm);
}

.user-avatar {
  border: none;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.login-link {
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 0 22px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: var(--gradient-primary);
  text-decoration: none;
  transition: all var(--transition-normal);
}

.login-link:hover {
  color: #fff;
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.user-menu {
  border-radius: var(--radius-lg) !important;
  overflow: hidden;
  box-shadow: var(--shadow-lg) !important;
  border: 1px solid var(--color-border);
  padding: 4px;
}

.menu-item,
.menu-item-logout {
  border-radius: var(--radius-md);
}

@media (max-width: 900px) {
  .brand-tagline,
  .nav-label,
  .user-name {
    display: none;
  }

  .header-inner {
    gap: 12px;
    padding: 0 16px;
  }

  .nav-link {
    padding: 8px 12px;
  }
}

@media (max-width: 520px) {
  .main-nav {
    gap: 0;
  }

  .nav-link {
    padding: 8px 10px;
  }
}
</style>
