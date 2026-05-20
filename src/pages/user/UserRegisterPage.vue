<template>
  <div class="auth-page">
    <aside class="auth-brand">
      <RouterLink to="/" class="brand-link">
        <img src="@/assets/logo.svg" alt="墨语" class="brand-logo" />
        <span class="brand-name">墨语</span>
      </RouterLink>
      <h2 class="brand-headline">开启你的<br />智能写作之旅</h2>
      <p class="brand-desc">注册即可体验 AI 驱动的全流程文章创作，免费配额即刻可用。</p>
    </aside>

    <main class="auth-main">
      <div class="auth-card">
        <h1 class="auth-title">创建账号</h1>
        <p class="auth-subtitle">加入墨语，开始创作</p>

        <a-form :model="formState" name="basic" autocomplete="off" layout="vertical" @finish="handleSubmit">
          <a-form-item name="userAccount" label="账号" :rules="[{ required: true, message: '请输入账号' }]">
            <a-input v-model:value="formState.userAccount" placeholder="请输入账号" size="large" />
          </a-form-item>
          <a-form-item
            name="userPassword"
            label="密码"
            :rules="[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码不能小于 8 位' },
            ]"
          >
            <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" size="large" />
          </a-form-item>
          <a-form-item
            name="checkPassword"
            label="确认密码"
            :rules="[
              { required: true, message: '请确认密码' },
              { min: 8, message: '密码不能小于 8 位' },
              { validator: validateCheckPassword },
            ]"
          >
            <a-input-password v-model:value="formState.checkPassword" placeholder="请确认密码" size="large" />
          </a-form-item>
          <div class="auth-extra">
            已有账号？
            <RouterLink to="/user/login" class="auth-link">去登录</RouterLink>
          </div>
          <a-form-item class="submit-item">
            <a-button type="primary" html-type="submit" size="large" block>注册</a-button>
          </a-form-item>
        </a-form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { userRegister } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import { reactive } from 'vue'

const router = useRouter()

const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

const validateCheckPassword = (rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value && value !== formState.userPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const handleSubmit = async (values: API.UserRegisterRequest) => {
  const res = await userRegister(values)
  if (res.data.code === 200) {
    message.success('注册成功')
    router.push({ path: '/user/login', replace: true })
  } else {
    message.error('注册失败，' + res.data.message)
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
  content: '语';
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
