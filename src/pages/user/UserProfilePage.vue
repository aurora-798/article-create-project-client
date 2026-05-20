<template>
  <div class="profile-page">
    <main class="profile-main">
      <a-card :bordered="false" class="profile-card">
        <a-descriptions title="账号信息" :column="1" class="account-info">
          <a-descriptions-item label="账号">{{ loginUserStore.loginUser.userAccount }}</a-descriptions-item>
          <a-descriptions-item label="角色">{{ roleText }}</a-descriptions-item>
          <a-descriptions-item label="剩余配额">{{ quotaText }}</a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <a-form :model="formState" layout="vertical" @finish="handleSubmit">
          <a-form-item
            name="userName"
            label="昵称"
            :rules="[{ required: true, message: '请输入昵称' }]"
          >
            <a-input v-model:value="formState.userName" placeholder="请输入昵称" size="large" />
          </a-form-item>
          <a-form-item name="userAvatar" label="头像">
            <UserAvatarUpload
              v-model="formState.userAvatar"
              :fallback-text="avatarText"
              :avatar-size="88"
            />
          </a-form-item>
          <a-form-item name="userProfile" label="个人简介">
            <a-textarea
              v-model:value="formState.userProfile"
              placeholder="介绍一下自己"
              :rows="5"
              show-count
              :maxlength="200"
            />
          </a-form-item>
          <div class="form-actions">
            <a-button @click="resetForm">重置</a-button>
            <a-button type="primary" html-type="submit" :loading="submitting">保存资料</a-button>
          </div>
        </a-form>
      </a-card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { updateMyUser } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { USER_ROLE_ADMIN, USER_ROLE_VIP } from '@/constant/user.ts'
import UserAvatarUpload from '@/components/UserAvatarUpload.vue'

const loginUserStore = useLoginUserStore()
const submitting = ref(false)

const formState = reactive<API.UserUpdateMyRequest>({
  userName: '',
  userAvatar: '',
  userProfile: '',
})

const syncForm = () => {
  const loginUser = loginUserStore.loginUser
  formState.userName = loginUser.userName ?? ''
  formState.userAvatar = loginUser.userAvatar ?? ''
  formState.userProfile = loginUser.userProfile ?? ''
}

const avatarText = computed(() => formState.userName?.slice(0, 1) || '墨')

const roleText = computed(() => {
  const role = loginUserStore.loginUser.userRole
  if (role === USER_ROLE_ADMIN) return '管理员'
  if (role === USER_ROLE_VIP) return 'VIP 会员'
  return '普通用户'
})

const quotaText = computed(() => {
  const role = loginUserStore.loginUser.userRole
  if (role === USER_ROLE_ADMIN || role === USER_ROLE_VIP) {
    return '无限次'
  }
  return `${loginUserStore.loginUser.quota ?? 0} 次`
})

const resetForm = () => {
  syncForm()
}

const handleSubmit = async (values: API.UserUpdateMyRequest) => {
  submitting.value = true
  try {
    const res = await updateMyUser(values)
    if (res.data.code === 200) {
      await loginUserStore.fetchLoginUser()
      syncForm()
      message.success('资料已更新')
    } else {
      message.error('保存失败，' + res.data.message)
    }
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await loginUserStore.fetchLoginUser()
  syncForm()
})
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - var(--header-height));
  background: var(--color-background-secondary);
  padding: 48px 0 56px;
}

.profile-main {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 var(--page-padding);
}

.profile-card {
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.profile-card :deep(.ant-card-body) {
  padding: 32px;
}

.account-info :deep(.ant-descriptions-title) {
  font-size: 18px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 640px) {
  .profile-page {
    padding-top: 28px;
  }

  .profile-card :deep(.ant-card-body) {
    padding: 24px;
  }
}
</style>
