<template>
  <div class="admin-page">
    <section class="page-hero">
      <div class="hero-copy">
        <p class="hero-kicker">后台工作台</p>
        <h1>用户管理</h1>
        <p>集中查看平台用户，快速维护头像、昵称、简介与角色权限。</p>
      </div>
      <div class="hero-status">
        <span class="status-label">用户总数</span>
        <strong>{{ total }}</strong>
      </div>
    </section>

    <div class="container">
      <a-card :bordered="false" class="admin-card">
        <a-form layout="inline" :model="searchParams" @finish="doSearch" class="search-form">
          <a-form-item label="账号">
            <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" />
          </a-form-item>
          <a-form-item label="用户名">
            <a-input v-model:value="searchParams.userName" placeholder="输入用户名" />
          </a-form-item>
          <a-form-item label="角色">
            <a-select
              v-model:value="searchParams.userRole"
              allow-clear
              placeholder="选择角色"
              class="role-search"
              :options="roleOptions"
            />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit">搜索</a-button>
          </a-form-item>
        </a-form>

      <a-table
        :columns="columns"
        :data-source="data"
        :pagination="pagination"
        @change="doTableChange"
        class="admin-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'userAvatar'">
            <a-image :src="record.userAvatar" :width="120" />
          </template>
          <template v-else-if="column.dataIndex === 'userRole'">
            <div v-if="record.userRole === 'admin'">
              <a-tag color="default">管理员</a-tag>
            </div>
            <div v-else-if="record.userRole === 'vip'">
              <a-tag color="gold">VIP</a-tag>
            </div>
            <div v-else>
              <a-tag>普通用户</a-tag>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'createTime'">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="primary" @click="openEditModal(record)">编辑</a-button>
              <a-popconfirm title="确认删除该用户？" ok-text="确认" cancel-text="取消" @confirm="doDelete(record.id)">
                <a-button danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
      </a-card>
    </div>

    <a-modal
      v-model:open="editModalOpen"
      title="编辑用户"
      ok-text="保存"
      cancel-text="取消"
      :confirm-loading="updating"
      @ok="doUpdate"
    >
      <a-form ref="editFormRef" :model="editForm" layout="vertical">
        <a-form-item name="userName" label="用户名" :rules="[{ required: true, message: '请输入用户名' }]">
          <a-input v-model:value="editForm.userName" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item name="userAvatar" label="头像">
          <UserAvatarUpload
            v-model="editForm.userAvatar"
            :fallback-text="editAvatarText"
            :avatar-size="72"
          />
        </a-form-item>
        <a-form-item name="userProfile" label="简介">
          <a-textarea v-model:value="editForm.userProfile" placeholder="请输入简介" :rows="4" :maxlength="200" show-count />
        </a-form-item>
        <a-form-item name="userRole" label="用户角色" :rules="[{ required: true, message: '请选择用户角色' }]">
          <a-select v-model:value="editForm.userRole" :options="roleOptions" placeholder="请选择角色" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import { deleteUser, listUserVoByPage, updateUser } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { USER_ROLE_ADMIN, USER_ROLE_USER, USER_ROLE_VIP } from '@/constant/user.ts'
import UserAvatarUpload from '@/components/UserAvatarUpload.vue'

const roleOptions = [
  { label: '普通用户', value: USER_ROLE_USER },
  { label: 'VIP', value: USER_ROLE_VIP },
  { label: '管理员', value: USER_ROLE_ADMIN },
]

const columns = [
  { title: 'id', dataIndex: 'id' },
  { title: '账号', dataIndex: 'userAccount' },
  { title: '用户名', dataIndex: 'userName' },
  { title: '头像', dataIndex: 'userAvatar' },
  { title: '简介', dataIndex: 'userProfile' },
  { title: '用户角色', dataIndex: 'userRole' },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '操作', key: 'action' },
]

const data = ref<API.UserVO[]>([])
const total = ref(0)
const editModalOpen = ref(false)
const updating = ref(false)
const editFormRef = ref<FormInstance>()

const searchParams = reactive<API.UserQueryRequest>({
  pageNum: 1,
  pageSize: 10,
})

const editForm = reactive<API.UserUpdateRequest>({
  id: undefined,
  userName: '',
  userAvatar: '',
  userProfile: '',
  userRole: USER_ROLE_USER,
})

const fetchData = async () => {
  const res = await listUserVoByPage({ ...searchParams })
  if (res.data.data) {
    data.value = res.data.data.records ?? []
    total.value = res.data.data.totalRow ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

const pagination = computed(() => ({
  current: searchParams.pageNum ?? 1,
  pageSize: searchParams.pageSize ?? 10,
  total: total.value,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
}))

const editAvatarText = computed(() => editForm.userName?.slice(0, 1) || '墨')

const doTableChange = (page: { current: number; pageSize: number }) => {
  searchParams.pageNum = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

const doSearch = () => {
  searchParams.pageNum = 1
  fetchData()
}

const openEditModal = (record: API.UserVO) => {
  Object.assign(editForm, {
    id: record.id,
    userName: record.userName ?? '',
    userAvatar: record.userAvatar ?? '',
    userProfile: record.userProfile ?? '',
    userRole: record.userRole ?? USER_ROLE_USER,
  })
  editModalOpen.value = true
}

const doUpdate = async () => {
  await editFormRef.value?.validate()
  updating.value = true
  try {
    const res = await updateUser({ ...editForm })
    if (res.data.code === 200) {
      message.success('更新成功')
      editModalOpen.value = false
      fetchData()
    } else {
      message.error('更新失败，' + res.data.message)
    }
  } finally {
    updating.value = false
  }
}

const doDelete = async (id?: number) => {
  if (!id) return
  const res = await deleteUser({ id })
  if (res.data.code === 200) {
    message.success('删除成功')
    fetchData()
  } else {
    message.error('删除失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.admin-page {
  min-height: calc(100vh - var(--header-height));
  background:
    radial-gradient(circle at 12% 8%, rgba(180, 83, 9, 0.08), transparent 28%),
    linear-gradient(180deg, var(--color-background) 0%, var(--color-background-secondary) 100%);
  padding: 32px var(--page-padding) 48px;
}

.page-hero {
  max-width: var(--content-max-width);
  margin: 0 auto 22px;
  padding: 32px 36px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 32px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
}

.page-hero::after {
  content: '管';
  position: absolute;
  right: -14px;
  bottom: -54px;
  font-family: 'Noto Serif SC', serif;
  font-size: 180px;
  font-weight: 700;
  line-height: 1;
  color: rgba(28, 25, 23, 0.035);
  pointer-events: none;
}

.hero-copy {
  position: relative;
  z-index: 1;
  max-width: 640px;
}

.hero-kicker {
  display: inline-flex;
  margin: 0 0 12px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: var(--color-accent-muted);
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.hero-copy h1 {
  margin: 0 0 10px;
  font-size: clamp(30px, 4vw, 42px);
  line-height: 1.18;
  color: var(--color-text);
}

.hero-copy p:last-child {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.8;
}

.hero-status {
  position: relative;
  z-index: 1;
  min-width: 180px;
  padding: 18px 20px;
  border-radius: var(--radius-xl);
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
}

.status-label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.hero-status strong {
  display: block;
  font-size: 26px;
  line-height: 1;
  color: var(--color-text);
}

.container {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.admin-card {
  border-radius: var(--radius-2xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.admin-card :deep(.ant-card-body) {
  padding: 24px;
}

.search-form {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border-light);
}

.role-search {
  min-width: 140px;
}

.admin-table :deep(.ant-table) {
  border-radius: var(--radius-md);
}

@media (max-width: 768px) {
  .admin-page {
    padding: 20px 16px 36px;
  }

  .page-hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 26px 24px;
  }

  .hero-status {
    width: 100%;
  }
}
</style>
