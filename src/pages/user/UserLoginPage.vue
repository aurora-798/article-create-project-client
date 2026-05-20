<template>
  <div class="auth-page">
    <aside class="auth-brand">
      <RouterLink to="/" class="brand-link">
        <img src="@/assets/logo.svg" alt="墨语" class="brand-logo" />
        <span class="brand-name">墨语</span>
      </RouterLink>
      <h2 class="brand-headline">智能写作<br />下笔成章</h2>
      <p class="brand-desc">登录后继续你的创作之旅，历史文章与配额同步可用。</p>
    </aside>

    <main class="auth-main">
      <div class="auth-card">
        <h1 class="auth-title">欢迎回来</h1>
        <p class="auth-subtitle">登录你的墨语账号</p>

        <a-form :model="formState" name="basic" autocomplete="off" layout="vertical" @finish="handleSubmit">
          <a-form-item name="userAccount" label="账号" :rules="[{ required: true, message: '请输入账号' }]">
            <a-input v-model:value="formState.userAccount" placeholder="请输入账号" size="large" />
          </a-form-item>
          <a-form-item
            name="userPassword"
            label="密码"
            :rules="[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码长度不能小于 8 位' },
            ]"
          >
            <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" size="large" />
          </a-form-item>
          <div class="auth-extra">
            没有账号？
            <RouterLink to="/user/register" class="auth-link">立即注册</RouterLink>
          </div>
          <a-form-item class="submit-item">
            <a-button type="primary" html-type="submit" size="large" block>登录</a-button>
          </a-form-item>
        </a-form>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { userLogin } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

const router = useRouter()
const loginUserStore = useLoginUserStore()

const handleSubmit = async (values: API.UserLoginRequest) => {
  const res = await userLogin(values)
  if (res.data.code === 200 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    router.push({ path: '/', replace: true })
  } else {
    message.error('登录失败，' + res.data.message)
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - var(--header-height));
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.auth-brand {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 64px 56px;
  background: var(--gradient-primary);
  color: #faf9f7;
  position: relative;
  overflow: hidden;
}

.auth-brand::after {
  content: '墨';
  position: absolute;
  right: -20px;
  bottom: -40px;
  font-family: 'Noto Serif SC', serif;
  font-size: 280px;
  font-weight: 700;
  opacity: 0.06;
  line-height: 1;
  pointer-events: none;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
  text-decoration: none;
  color: inherit;
}

.brand-logo {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
}

.brand-name {
  font-family: 'Noto Serif SC', serif;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.brand-headline {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 20px;
  position: relative;
  z-index: 1;
}

.brand-desc {
  font-size: 15px;
  line-height: 1.7;
  opacity: 0.75;
  max-width: 320px;
  margin: 0;
  position: relative;
  z-index: 1;
}

.auth-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  background: var(--color-background);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.auth-title {
  font-size: 26px;
  margin: 0 0 6px;
}

.auth-subtitle {
  margin: 0 0 32px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.auth-extra {
  text-align: right;
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.auth-link {
  color: var(--color-accent);
  font-weight: 500;
  margin-left: 4px;
}

.auth-link:hover {
  color: var(--color-accent-light);
}

.submit-item {
  margin-top: 8px;
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-brand {
    display: none;
  }

  .auth-main {
    padding: 32px 20px;
  }

  .auth-card {
    padding: 28px 24px;
  }
}
</style>
