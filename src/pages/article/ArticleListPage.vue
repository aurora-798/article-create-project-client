<template>
  <div class="article-list-page">
    <section class="page-hero">
      <div class="hero-copy">
        <p class="hero-kicker">创作档案</p>
        <h1>历史记录</h1>
        <p>回看你的创作成果，继续编辑、导出或整理每一篇文章。</p>
      </div>
      <div class="hero-action">
        <span class="action-label">文章总数</span>
        <strong>{{ pagination.total }}</strong>
        <a-button type="primary" size="large" @click="goToCreate" class="create-btn">
          <template #icon>
            <PlusOutlined />
          </template>
          创作新文章
        </a-button>
      </div>
    </section>

    <div class="container">
      <!-- 搜索筛选栏 -->
      <div class="filter-bar">
        <div class="filter-left">
          <a-input-search
              v-model:value="searchKeyword"
              placeholder="搜索文章标题..."
              style="width: 280px"
              @search="handleSearch"
              @change="handleSearchChange"
              allow-clear
              class="search-input"
          >
            <template #prefix>
              <SearchOutlined class="search-icon" />
            </template>
          </a-input-search>

          <a-range-picker
              v-model:value="dateRange"
              :placeholder="['开始日期', '结束日期']"
              @change="handleDateChange"
              class="date-picker"
          />

          <a-select
              v-model:value="statusFilter"
              placeholder="全部状态"
              style="width: 150px"
              allow-clear
              popup-class-name="status-select-popup"
              @change="handleStatusChange"
              class="status-select"
          >
            <a-select-option value="">
              <span class="status-option status-option-all">
                <span class="status-option-dot"></span>
                全部状态
              </span>
            </a-select-option>
            <a-select-option value="COMPLETED">
              <span class="status-option status-option-completed">
                <span class="status-option-dot"></span>
                已完成
              </span>
            </a-select-option>
            <a-select-option value="PROCESSING">
              <span class="status-option status-option-processing">
                <span class="status-option-dot"></span>
                生成中
              </span>
            </a-select-option>
            <a-select-option value="PENDING">
              <span class="status-option status-option-pending">
                <span class="status-option-dot"></span>
                等待中
              </span>
            </a-select-option>
            <a-select-option value="FAILED">
              <span class="status-option status-option-failed">
                <span class="status-option-dot"></span>
                失败
              </span>
            </a-select-option>
          </a-select>
        </div>

        <div class="filter-right">
          <span class="total-count">共 {{ pagination.total }} 篇文章</span>
        </div>
      </div>

      <!-- 表格卡片 -->
      <a-card :bordered="false" class="table-card">
        <a-table
            :columns="columns"
            :data-source="dataSource"
            :loading="loading"
            :pagination="pagination"
            @change="handleTableChange"
            row-key="id"
            class="article-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'title'">
              <div class="title-cell" @click="viewArticle(record)">
                <div class="main-title">{{ record.mainTitle || record.topic || '-' }}</div>
                <div class="sub-title">{{ record.subTitle || '-' }}</div>
              </div>
            </template>

            <template v-else-if="column.key === 'status'">
              <span :class="['moyu-status-badge', `moyu-status-${record.status?.toLowerCase()}`]">
                {{ getStatusText(record.status) }}
              </span>
            </template>

            <template v-else-if="column.key === 'createTime'">
              <span class="time-text">{{ formatDate(record.createTime) }}</span>
            </template>

            <template v-else-if="column.key === 'action'">
              <div class="action-group">
                <a-button type="link" size="small" @click="viewArticle(record)" class="action-btn view-btn">
                  <EyeOutlined />
                  查看
                </a-button>
                <a-button type="link" size="small" @click="exportArticle(record)" class="action-btn export-btn">
                  <DownloadOutlined />
                  导出
                </a-button>
                <a-popconfirm
                    title="确定要删除这篇文章吗?"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="deleteArticle(record)"
                >
                  <a-button type="link" size="small" danger class="action-btn delete-btn">
                    <DeleteOutlined />
                    删除
                  </a-button>
                </a-popconfirm>
              </div>
            </template>
          </template>

          <!-- 空状态 -->
          <template #emptyText>
            <div class="empty-state">
              <FileTextOutlined class="empty-icon" />
              <p class="empty-title">暂无文章</p>
              <p class="empty-desc">开始创作您的第一篇文章吧</p>
              <a-button type="primary" @click="goToCreate">
                <PlusOutlined />
                创作新文章
              </a-button>
            </div>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'
import { listArticle, deleteArticle as deleteArticleApi, getArticle } from '@/api/articleController'
import dayjs, { type Dayjs } from 'dayjs'

const router = useRouter()

// 搜索筛选
const searchKeyword = ref('')
const dateRange = ref<[Dayjs, Dayjs] | null>(null)
const statusFilter = ref<string>('')

const columns = [
  {
    title: '选题',
    dataIndex: 'topic',
    key: 'topic',
    width: 180,
    ellipsis: true,
  },
  {
    title: '标题',
    key: 'title',
    width: 280,
  },
  {
    title: '状态',
    key: 'status',
    width: 110,
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 160,
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
  },
]

const loading = ref(false)
const dataSource = ref<API.ArticleVO[]>([])
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`,
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await listArticle({
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
      // 如果后端支持，可以传递搜索参数
      // keyword: searchKeyword.value,
      // status: statusFilter.value,
    })
    const pageData = res.data.data
    let records = pageData?.records || []

    // 前端过滤（如果后端不支持）
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      records = records.filter((item: API.ArticleVO) =>
          item.mainTitle?.toLowerCase().includes(keyword) ||
          item.topic?.toLowerCase().includes(keyword)
      )
    }

    if (statusFilter.value) {
      records = records.filter((item: API.ArticleVO) => item.status === statusFilter.value)
    }

    if (dateRange.value) {
      const [start, end] = dateRange.value
      records = records.filter((item: API.ArticleVO) => {
        const createTime = dayjs(item.createTime)
        return createTime.isAfter(start.startOf('day')) && createTime.isBefore(end.endOf('day'))
      })
    }

    dataSource.value = records
    pagination.value.total = pageData?.totalRow || 0
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.value.current = 1
  loadData()
}

const handleSearchChange = () => {
  // 如果搜索框清空，也触发搜索
  if (!searchKeyword.value) {
    handleSearch()
  }
}

const handleDateChange = () => {
  pagination.value.current = 1
  loadData()
}

const handleStatusChange = () => {
  pagination.value.current = 1
  loadData()
}

// 表格变化
const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}

// 查看文章
const viewArticle = (record: API.ArticleVO) => {
  if (!record.taskId) {
    message.error('文章任务不存在')
    return
  }
  router.push(`/article/${record.taskId}`)
}

// 导出文章
const exportArticle = async (record: API.ArticleVO) => {
  if (!record.taskId) {
    message.error('文章任务不存在')
    return
  }

  try {
    const res = await getArticle({ taskId: record.taskId })
    const article = res.data.data
    if (!article) {
      message.error('文章数据不存在')
      return
    }

    let markdown = `# ${article.mainTitle}\n\n`
    markdown += `> ${article.subTitle}\n\n`

    if (article.fullContent) {
      markdown += article.fullContent
    } else {
      markdown += article.content || ''
    }

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${article.mainTitle || '文章'}.md`
    a.click()
    URL.revokeObjectURL(url)

    message.success('导出成功')
  } catch (error: any) {
    message.error(error.message || '导出失败')
  }
}

// 删除文章
const deleteArticle = async (record: API.ArticleVO) => {
  try {
    const res = await deleteArticleApi({ id: record.id })
    if (res.data.code === 200) {
      message.success('删除成功')
      loadData()
    } else {
      message.error(res.data.message || '删除失败')
    }
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

// 跳转创作页面
const goToCreate = () => {
  router.push('/create')
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    PENDING: '等待中',
    PROCESSING: '生成中',
    COMPLETED: '已完成',
    FAILED: '失败',
  }
  return textMap[status] || status
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.article-list-page {
  background:
    radial-gradient(circle at 12% 8%, rgba(180, 83, 9, 0.08), transparent 28%),
    linear-gradient(180deg, var(--color-background) 0%, var(--color-background-secondary) 100%);
  min-height: 100vh;
  padding: 32px var(--page-padding) 60px;

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

    &::after {
      content: '史';
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
    font-weight: 700;
    color: var(--color-text);
  }

  .hero-copy p:last-child {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 15px;
    line-height: 1.8;
  }

  .hero-action {
    position: relative;
    z-index: 1;
    min-width: 190px;
    padding: 18px 20px;
    border-radius: var(--radius-xl);
    background: var(--color-background-secondary);
    border: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .action-label {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  .hero-action strong {
    font-size: 24px;
    line-height: 1;
    color: var(--color-text);
    margin: 0;
  }

  .create-btn {
    height: 44px;
    padding: 0 24px;
    font-size: 15px;
    font-weight: 600;
    border-radius: var(--radius-lg);
    background: var(--gradient-primary) !important;
    border: none !important;
    color: white !important;
    box-shadow: var(--shadow-md) !important;
    transition: opacity var(--transition-normal) !important;

    &:hover,
    &:focus,
    &:active {
      background: var(--gradient-primary) !important;
      border: none !important;
      color: white !important;
      box-shadow: var(--shadow-md) !important;
      opacity: 0.92;
    }

    :deep(.ant-wave) {
      display: none;
    }
  }

  .container {
    max-width: var(--content-max-width);
    margin: 0 auto;
  }

  // 筛选栏
  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 16px 20px;
    background: var(--color-surface);
    border-radius: var(--radius-2xl);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-md);
  }

  .filter-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .search-input {
    :deep(.ant-input-affix-wrapper) {
      border-radius: var(--radius-md);
      border-color: var(--color-border);

      &:hover, &:focus {
        border-color: var(--color-primary);
      }
    }

    .search-icon {
      color: var(--color-text-muted);
    }
  }

  .date-picker {
    :deep(.ant-picker) {
      border-radius: var(--radius-md);
    }
  }

  .status-select {
    :deep(.ant-select-selector) {
      min-height: 38px;
      padding: 3px 12px !important;
      border-radius: var(--radius-full) !important;
      background: var(--color-background) !important;
      border-color: var(--color-border) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
    }

    :deep(.ant-select-selection-item) {
      display: flex;
      align-items: center;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text);
    }

    :deep(.ant-select-arrow) {
      color: var(--color-text-muted);
    }
  }

  .filter-right {
    .total-count {
      font-size: 14px;
      color: var(--color-text-secondary);
    }
  }

  .table-card {
    border-radius: var(--radius-2xl);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-lg);
    overflow: hidden;

    :deep(.ant-card-body) {
      padding: 0;
    }
  }

  .article-table {
    :deep(.ant-table-thead > tr > th) {
      background: var(--color-background-secondary);
      font-weight: 600;
      font-size: 13px;
      color: var(--color-text-secondary);
      border-bottom: 1px solid var(--color-border);
      padding: 14px 16px;
    }

    :deep(.ant-table-tbody > tr > td) {
      padding: 16px;
      border-bottom: 1px solid var(--color-border-light);
    }

    :deep(.ant-table-tbody > tr:hover > td) {
      background: rgba(28, 25, 23, 0.02);
    }

    :deep(.ant-table-pagination) {
      margin: 16px;
    }
  }

  .title-cell {
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      .main-title {
        color: var(--color-primary);
      }
    }

    .main-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--color-text);
      transition: color var(--transition-fast);
      line-height: 1.4;
    }

    .sub-title {
      font-size: 13px;
      color: var(--color-text-muted);
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .time-text {
    color: var(--color-text-secondary);
    font-size: 13px;
  }

  .action-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .action-btn {
    font-size: 13px;
    padding: 4px 8px;
    height: auto;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: all var(--transition-fast);

    &.view-btn {
      color: var(--color-primary);

      &:hover {
        color: var(--color-primary-dark);
      }
    }

    &.export-btn {
      color: var(--color-text-secondary);

      &:hover {
        color: var(--color-text);
      }
    }

    &.delete-btn {
      &:hover {
        color: #DC2626;
      }
    }
  }

  // 空状态
  .empty-state {
    padding: 60px 20px;
    text-align: center;

    .empty-icon {
      font-size: 48px;
      color: var(--color-text-muted);
      margin-bottom: 16px;
    }

    .empty-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text);
      margin: 0 0 8px;
    }

    .empty-desc {
      font-size: 14px;
      color: var(--color-text-muted);
      margin: 0 0 20px;
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

:global(.status-select-popup) {
  padding: 8px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}

:global(.status-select-popup .ant-select-item) {
  border-radius: var(--radius-md);
  min-height: 36px;
  padding: 6px 8px;
}

:global(.status-select-popup .ant-select-item-option-selected) {
  background: var(--color-background-secondary) !important;
  font-weight: 700;
}

:global(.status-option) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 600;
}

:global(.status-option-dot) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-text-muted);
}

:global(.status-option-completed .status-option-dot) {
  background: #166534;
}

:global(.status-option-processing .status-option-dot) {
  background: #b45309;
  box-shadow: 0 0 0 4px rgba(180, 83, 9, 0.12);
}

:global(.status-option-pending .status-option-dot) {
  background: #78716c;
}

:global(.status-option-failed .status-option-dot) {
  background: #b91c1c;
}

@media (max-width: 992px) {
  .article-list-page {
    .filter-bar {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }

    .filter-left {
      flex-wrap: wrap;
    }

    .filter-right {
      text-align: right;
    }
  }
}

@media (max-width: 768px) {
  .article-list-page {
    padding: 20px 16px 36px;

    .page-hero {
      flex-direction: column;
      align-items: flex-start;
      padding: 26px 24px;
    }

    .hero-action {
      width: 100%;
    }

    .hero-copy h1 {
      font-size: 28px;
    }

    .create-btn {
      width: 100%;
    }

    .filter-left {
      flex-direction: column;
      width: 100%;

      .search-input,
      .date-picker,
      .status-select {
        width: 100% !important;
      }
    }
  }
}
</style>