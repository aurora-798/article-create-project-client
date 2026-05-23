<template>
  <div class="article-detail-page">
    <div class="page-header">
      <div class="header-container">
        <div class="header-actions">
          <a-button @click="goBack" class="back-btn">
            <template #icon>
              <ArrowLeftOutlined />
            </template>
            返回
          </a-button>
          <div class="right-actions">
            <a-button
                v-if="canContinueArticle(article)"
                type="primary"
                @click="continueArticle"
                class="retry-btn"
            >
              继续创作
            </a-button>
            <a-button
                v-if="article?.status === 'FAILED'"
                type="primary"
                danger
                @click="handleRetry"
                class="retry-btn"
            >
              <template #icon>
                <RedoOutlined />
              </template>
              重新创建
            </a-button>
            <a-button
                v-if="article?.status === 'COMPLETED'"
                type="primary"
                @click="exportMarkdown"
                class="export-btn"
            >
              <template #icon>
                <DownloadOutlined />
              </template>
              导出 Markdown
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <a-spin :spinning="loading" tip="加载中...">
        <div v-if="article" class="article-detail-layout">
          <!-- 大纲 -->
          <aside v-if="article.outline && article.outline.length > 0" class="outline-section">
            <h2 class="section-title">
              <OrderedListOutlined class="section-icon" />
              文章大纲
            </h2>
            <div class="outline-list">
              <button
                  v-for="item in article.outline"
                  :key="item.section"
                  type="button"
                  class="outline-item"
                  @click="scrollToOutlineSection(item)"
              >
                <span class="outline-index">{{ item.section }}</span>
                <span class="outline-title">{{ item.title }}</span>
              </button>
            </div>
          </aside>

          <a-card :bordered="false" class="article-card">
            <!-- 标题 -->
            <div class="title-section">
              <h1 class="main-title">{{ article.mainTitle }}</h1>
              <p class="sub-title">{{ article.subTitle }}</p>
              <div class="meta-info">
                <span :class="['moyu-status-badge', getArticleDisplayStatus(article).className]">
                  {{ getArticleDisplayStatus(article).text }}
                </span>
                <span class="time">创建于 {{ article.createTime ? formatDate(article.createTime) : '' }}</span>
              </div>
            </div>

            <a-divider />

            <!-- 完整图文（优先展示） -->
            <div v-if="article.fullContent" class="content-section">
              <div v-html="markdownToHtml(article.fullContent)" class="markdown-content"></div>
            </div>

            <!-- 普通正文（无 fullContent 时展示） -->
            <div v-else-if="article.content" class="content-section">
              <h2 class="section-title">
                <FileTextOutlined class="section-icon" />
                文章正文
              </h2>
              <div v-html="markdownToHtml(article.content)" class="markdown-content"></div>
            </div>

            <!-- 配图（仅在没有 fullContent 时单独展示） -->
            <div v-if="!article.fullContent && article.images && article.images.length > 0" class="images-section">
              <h2 class="section-title">
                <PictureOutlined class="section-icon" />
                文章配图
              </h2>
              <div class="images-grid">
                <div v-for="image in article.images" :key="image.position" class="image-item">
                  <img :src="image.url" :alt="image.description" />
                  <div class="image-info">
                    <span class="badge">{{ image.method }}</span>
                    <span class="keywords">{{ image.keywords }}</span>
                  </div>
                </div>
              </div>
            </div>
          </a-card>

          <!-- 执行日志面板 -->
          <aside v-if="executionStats && executionStats.logs && executionStats.logs.length > 0" class="execution-logs-section">
            <div class="logs-header" @click="showExecutionLogs = !showExecutionLogs">
              <h2 class="section-title">
                <ClockCircleOutlined class="section-icon" />
                执行日志
                <span :class="['moyu-status-badge', 'status-tag-small', getStatusClass(executionStats.overallStatus ?? '')]">
                  {{ executionStats.overallStatus ?? '' }}
                </span>
              </h2>
              <ThunderboltOutlined :class="['toggle-icon', { expanded: showExecutionLogs }]" />
            </div>

            <Transition name="expand">
              <div v-show="showExecutionLogs" class="logs-content">
                <!-- 统计概览 -->
                <div class="stats-summary">
                  <div class="stat-item">
                    <span class="label">总耗时</span>
                    <span class="value">{{ executionStats.totalDurationMs ?? 0 }}ms</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">智能体数量</span>
                    <span class="value">{{ executionStats.agentCount ?? 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">平均耗时</span>
                    <span class="value">
                      {{ executionStats.agentCount && executionStats.totalDurationMs ? Math.round(executionStats.totalDurationMs / executionStats.agentCount) : 0 }}ms
                    </span>
                  </div>
                </div>

                <!-- 智能体时间线 -->
                <div class="agent-timeline">
                  <div
                      v-for="log in executionStats.logs"
                      :key="log.id"
                      :class="['timeline-item', log.status?.toLowerCase()]"
                  >
                    <div class="timeline-indicator">
                      <CheckCircleOutlined v-if="log.status === 'SUCCESS'" class="icon success" />
                      <CloseCircleOutlined v-else-if="log.status === 'FAILED'" class="icon failed" />
                      <LoadingOutlined v-else class="icon running" />
                    </div>
                    <div class="timeline-content">
                      <div class="timeline-header">
                        <span class="agent-name">{{ getAgentDisplayName(log.agentName ?? '') }}</span>
                        <span class="duration">{{ log.durationMs ?? 0 }}ms</span>
                      </div>
                      <div class="timeline-time">
                        {{ log.startTime ? formatDate(log.startTime) : '' }}
                      </div>
                      <div v-if="log.errorMessage" class="error-message">
                        <CloseCircleOutlined /> {{ log.errorMessage }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </aside>
        </div>
      </a-spin>
    </div>

    <a-button
        v-show="showBackTop"
        shape="circle"
        size="large"
        class="back-top-btn"
        aria-label="返回顶部"
        @click="scrollToTop"
    >
      <template #icon>
        <UpOutlined />
      </template>
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  OrderedListOutlined,
  FileTextOutlined,
  PictureOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  RedoOutlined,
  ThunderboltOutlined,
  UpOutlined
} from '@ant-design/icons-vue'
import { getArticle, getExecutionLogs, recreateArticle } from '@/api/articleController'
import { marked } from 'marked'
import dayjs from 'dayjs'
import { canContinueArticle, getArticleDisplayStatus } from '@/utils/articleStatus'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const article = ref<API.ArticleVO | null>(null)
const executionStats = ref<API.AgentExecutionStats | null>(null)
const logsLoading = ref(false)
const showExecutionLogs = ref(false)
const showBackTop = ref(false)

// Markdown 转 HTML
const markdownToHtml = (markdown: string) => {
  const html = marked(markdown) as string
  return addOutlineAnchorsToHtml(html)
}

const normalizeHeadingText = (text: string) => {
  return text.replace(/\s+/g, '').replace(/^[\d一二三四五六七八九十]+[.、．]\s*/, '').toLowerCase()
}

const getOutlineAnchorId = (item: API.OutlineItem) => {
  return `article-section-${item.section ?? normalizeHeadingText(item.title || '')}`
}

const addOutlineAnchorsToHtml = (html: string) => {
  if (!article.value?.outline?.length) {
    return html
  }

  const container = document.createElement('div')
  container.innerHTML = html

  const headings = Array.from(container.querySelectorAll('h2, h3'))
  const usedHeadings = new Set<Element>()

  article.value.outline.forEach((item, index) => {
    const title = item.title || ''
    const normalizedTitle = normalizeHeadingText(title)
    const matchedHeading = headings.find(heading => {
      if (usedHeadings.has(heading)) return false
      const normalizedHeading = normalizeHeadingText(heading.textContent || '')
      return normalizedHeading === normalizedTitle || normalizedHeading.includes(normalizedTitle)
    }) || headings[index]

    if (matchedHeading) {
      matchedHeading.id = getOutlineAnchorId(item)
      usedHeadings.add(matchedHeading)
    }
  })

  return container.innerHTML
}

const scrollToOutlineSection = async (item: API.OutlineItem) => {
  await nextTick()
  const target = document.getElementById(getOutlineAnchorId(item))
  if (!target) return

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

const handleWindowScroll = () => {
  showBackTop.value = window.scrollY > 520
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

// 加载文章
const loadArticle = async () => {
  const taskId = route.params.taskId as string
  if (!taskId) {
    message.error('文章ID不存在')
    return
  }

  loading.value = true
  try {
    const res = await getArticle({ taskId })
    article.value = res.data.data || null
    // 自动加载执行日志
    await loadExecutionLogs(taskId)
  } catch (error) {
    message.error((error as Error).message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 加载执行日志
const loadExecutionLogs = async (taskId: string) => {
  logsLoading.value = true
  try {
    const res = await getExecutionLogs({ taskId })
    executionStats.value = res.data.data || null
  } catch (error) {
    console.error('加载执行日志失败:', error)
  } finally {
    logsLoading.value = false
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 导出 Markdown
const exportMarkdown = () => {
  if (!article.value) return

  let markdown = `# ${article.value.mainTitle}\n\n`
  markdown += `> ${article.value.subTitle}\n\n`

  // 优先使用完整图文
  if (article.value.fullContent) {
    markdown += article.value.fullContent
  } else {
    if (article.value.outline && article.value.outline.length > 0) {
      markdown += `## 目录\n\n`
      article.value.outline.forEach(item => {
        markdown += `${item.section}. ${item.title}\n`
      })
      markdown += `\n---\n\n`
    }

    markdown += article.value.content || ''

    if (article.value.images && article.value.images.length > 0) {
      markdown += `\n\n## 配图\n\n`
      article.value.images.forEach(image => {
        markdown += `![${image.description}](${image.url})\n\n`
      })
    }
  }

  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${article.value.mainTitle}.md`
  a.click()
  URL.revokeObjectURL(url)

  message.success('导出成功')
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 获取状态样式
const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    PENDING: 'moyu-status-pending',
    PROCESSING: 'moyu-status-processing',
    COMPLETED: 'moyu-status-completed',
    FAILED: 'moyu-status-failed',
    SUCCESS: 'moyu-status-success',
    RUNNING: 'moyu-status-running',
    ERROR: 'moyu-status-error',
  }
  return classMap[status] || 'moyu-status-default'
}

// 获取智能体显示名称
const getAgentDisplayName = (agentName: string) => {
  const nameMap: Record<string, string> = {
    'agent1_generate_titles': '生成标题',
    'agent2_generate_outline': '生成大纲',
    'agent3_generate_content': '生成正文',
    'agent4_analyze_image_requirements': '分析配图需求',
    'agent5_generate_images': '生成配图',
    'agent6_merge_content': '图文合成',
    'ai_modify_outline': 'AI修改大纲'
  }
  return nameMap[agentName] || agentName
}

// 继续待确认的文章
const continueArticle = () => {
  if (!article.value?.taskId) {
    message.error('文章任务不存在')
    return
  }

  router.push({
    path: '/create',
    query: {
      taskId: article.value.taskId,
      mode: 'resume'
    }
  })
}

// 重试（重新创建文章）
const handleRetry = () => {
  if (!article.value) return

  Modal.confirm({
    title: '确认重试',
    content: '将使用相同的选题和配置重新创建文章，是否继续？',
    okText: '继续',
    cancelText: '取消',
    onOk: async () => {
      if (!article.value?.taskId) {
        message.error('文章任务不存在')
        return
      }

      try {
        const res = await recreateArticle({
          sourceTaskId: article.value.taskId
        })
        const newTaskId = res.data.data
        if (!newTaskId) {
          throw new Error('重新创建失败：未返回任务ID')
        }

        router.push({
          path: '/create',
          query: {
            taskId: newTaskId,
            mode: 'recreate'
          }
        })
      } catch (error) {
        const err = error as Error
        message.error(err.message || '重新创建失败')
        throw error
      }
    }
  })
}

onMounted(() => {
  loadArticle()
  handleWindowScroll()
  window.addEventListener('scroll', handleWindowScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleWindowScroll)
})
</script>

<style scoped lang="scss">
.article-detail-page {
  background: var(--color-background-secondary);
  min-height: 100vh;
  padding-bottom: 60px;

  .page-header {
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: 20px var(--page-padding);
    margin-bottom: 28px;
  }

  .header-container {
    max-width: var(--content-max-width);
    margin: 0 auto;
  }

  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .right-actions {
    display: flex;
    gap: 12px;
  }

  .back-btn {
    background: white;
    border: 1px solid var(--color-border);
    color: var(--color-text);
    font-size: 13px;
    transition: all var(--transition-fast);
    border-radius: var(--radius-md);

    &:hover {
      background: var(--color-background-secondary);
      border-color: var(--color-border);
      color: var(--color-text);
    }
  }

  .retry-btn {
    background: #ff4d4f;
    color: white;
    border: none;
    font-weight: 600;
    font-size: 13px;
    transition: all var(--transition-fast);
    border-radius: var(--radius-md);

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  }

  .export-btn {
    background: var(--gradient-primary);
    color: white;
    border: none;
    font-weight: 600;
    font-size: 13px;
    transition: all var(--transition-fast);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  }

  .container {
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 var(--page-padding);
  }

  .article-detail-layout {
    display: grid;
    grid-template-columns: minmax(220px, 280px) minmax(0, 1fr) minmax(260px, 320px);
    grid-template-areas: "outline article logs";
    align-items: start;
    gap: 24px;
  }

  .article-card {
    grid-area: article;
    min-width: 0;
    border-radius: var(--radius-xl);
    border: 1px solid rgba(214, 211, 209, 0.86);
    box-shadow: 0 16px 36px rgba(28, 25, 23, 0.08);
    background: #ffffff;
    overflow: hidden;

    :deep(.ant-card-body) {
      padding: 32px;
    }

    :deep(.ant-divider) {
      margin: 24px 0;
      border-color: rgba(120, 113, 108, 0.18);
    }
  }

  .title-section {
    margin-bottom: 0;
    text-align: center;

    .main-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 10px;
      color: var(--color-text);
      line-height: 1.3;
      letter-spacing: -0.5px;
    }

    .sub-title {
      font-size: 16px;
      color: var(--color-text-secondary);
      margin: 0 0 20px;
    }

    .meta-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: var(--color-text-muted);
      font-size: 13px;
    }

    .moyu-status-badge {
      min-height: 26px;
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--color-text);
  }

  .section-icon {
    font-size: 18px;
    color: var(--color-text-secondary);
  }

  .status-tag-small {
    font-size: 11px;
    min-height: 24px;
    padding: 3px 9px;
    margin-left: 8px;
  }

  .outline-section,
  .execution-logs-section {
    border: 1px solid rgba(214, 211, 209, 0.86);
    border-radius: var(--radius-xl);
    box-shadow: 0 16px 36px rgba(28, 25, 23, 0.08);
  }

  /* 执行日志部分 */
  .execution-logs-section {
    grid-area: logs;
    min-width: 0;
    background: #ffffff;
    overflow: hidden;

    .logs-header {
      padding: 14px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: background var(--transition-fast);

      &:hover {
        background: rgba(0, 0, 0, 0.02);
      }

      .section-title {
        margin: 0;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
      }

      .toggle-icon {
        font-size: 14px;
        color: var(--color-text-secondary);
        transition: transform var(--transition-fast);

        &.expanded {
          transform: rotate(180deg);
        }
      }
    }

    .logs-content {
      padding: 0 16px 16px;
    }

    .stats-summary {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
      margin-bottom: 20px;
      padding: 12px;
      background: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border-light);

      .stat-item {
        text-align: center;

        .label {
          display: block;
          font-size: 12px;
          color: var(--color-text-muted);
          margin-bottom: 4px;
        }

        .value {
          display: block;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-primary);
        }
      }
    }

    .agent-timeline {
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 16px;
        top: 12px;
        bottom: 12px;
        width: 2px;
        background: var(--color-border);
      }

      .timeline-item {
        position: relative;
        padding-left: 48px;
        padding-bottom: 20px;

        &:last-child {
          padding-bottom: 0;
        }

        .timeline-indicator {
          position: absolute;
          left: 8px;
          top: 2px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--color-border);

          .icon {
            font-size: 12px;

            &.success {
              color: var(--color-success);
            }

            &.failed {
              color: var(--color-error);
            }

            &.running {
              color: var(--color-primary);
            }
          }
        }

        &.success .timeline-indicator {
          border-color: var(--color-success);
        }

        &.failed .timeline-indicator {
          border-color: var(--color-error);
        }

        .timeline-content {
          background: white;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-light);

          .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 4px;

            .agent-name {
              font-size: 14px;
              font-weight: 600;
              color: var(--color-text);
            }

            .duration {
              font-size: 13px;
              font-weight: 600;
              color: var(--color-primary);
            }
          }

          .timeline-time {
            font-size: 12px;
            color: var(--color-text-muted);
          }

          .error-message {
            margin-top: 8px;
            padding: 8px;
            background: rgba(255, 77, 79, 0.1);
            border-radius: var(--radius-md);
            font-size: 12px;
            color: var(--color-error);
            display: flex;
            align-items: flex-start;
            gap: 6px;

            .anticon {
              flex-shrink: 0;
              margin-top: 2px;
            }
          }
        }
      }
    }
  }

  /* 展开/收起动画 */
  .expand-enter-active,
  .expand-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .expand-enter-from,
  .expand-leave-to {
    opacity: 0;
    max-height: 0;
  }

  .expand-enter-to,
  .expand-leave-from {
    opacity: 1;
    max-height: 2000px;
  }

  .outline-section {
    grid-area: outline;
    min-width: 0;
    padding: 20px;
    background: #ffffff;
    position: sticky;
    top: 92px;
    max-height: calc(100vh - 116px);
    overflow-y: auto;
    align-self: start;

    .outline-list {
      .outline-item {
        width: 100%;
        margin-bottom: 12px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.78);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-light);
        display: flex;
        align-items: flex-start;
        gap: 10px;
        text-align: left;
        cursor: pointer;
        transition: all var(--transition-fast);

        &:hover {
          border-color: var(--color-border);
          background: var(--color-background-secondary);
          transform: translateY(-1px);
        }

        &:focus-visible {
          outline: 2px solid rgba(180, 83, 9, 0.28);
          outline-offset: 2px;
        }

        .outline-index {
          flex-shrink: 0;
          min-width: 22px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-full);
          background: var(--color-accent-muted);
          color: var(--color-accent);
          font-size: 12px;
          font-weight: 700;
        }

        .outline-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
          line-height: 1.55;
        }
      }
    }
  }

  .back-top-btn {
    position: fixed;
    right: 32px;
    bottom: 36px;
    z-index: 20;
    width: 46px;
    height: 46px;
    border: 1px solid rgba(214, 211, 209, 0.9);
    background: #ffffff;
    color: var(--color-accent);
    box-shadow: 0 16px 36px rgba(28, 25, 23, 0.14);
    transition:
      transform var(--transition-fast),
      box-shadow var(--transition-fast),
      color var(--transition-fast);

    &:hover,
    &:focus {
      color: var(--color-primary);
      border-color: var(--color-border);
      transform: translateY(-2px);
      box-shadow: 0 18px 42px rgba(28, 25, 23, 0.18);
    }
  }

  .content-section {
    margin-bottom: 0;
    min-width: 0;

    .markdown-content {
      line-height: 1.8;
      font-size: 15px;
      color: var(--color-text);

      :deep(h2) {
        font-size: 20px;
        font-weight: 600;
        margin: 28px 0 14px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--color-border);
        color: var(--color-text);
        scroll-margin-top: 96px;
      }

      :deep(h3) {
        font-size: 17px;
        font-weight: 600;
        margin: 22px 0 10px;
        color: var(--color-text);
        scroll-margin-top: 96px;
      }

      :deep(p) {
        margin-bottom: 14px;
        text-indent: 2em;
        color: var(--color-text);
      }

      :deep(ul), :deep(ol) {
        margin-bottom: 14px;
        padding-left: 2em;
      }

      :deep(li) {
        margin-bottom: 6px;
        color: var(--color-text);
      }

      :deep(img) {
        display: block;
        max-width: 100%;
        max-height: 600px;
        width: auto;
        height: auto;
        margin: 20px auto;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        object-fit: contain;
      }

      // Mermaid 图表特殊处理（SVG 格式）
      :deep(img[src$=".svg"]) {
        max-width: 800px;
        max-height: 500px;
      }
    }
  }

  .images-section {
    min-width: 0;

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;

      .image-item {
        border-radius: var(--radius-md);
        overflow: hidden;
        border: 1px solid var(--color-border);
        transition: all var(--transition-normal);
        cursor: pointer;

        &:hover {
          border-color: var(--color-text-muted);
          box-shadow: var(--shadow-md);
        }

        img {
          width: 100%;
          height: 160px;
          object-fit: cover;
        }

        .image-info {
          padding: 12px;
          background: white;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .badge {
            padding: 3px 10px;
            background: var(--color-text);
            color: white;
            border-radius: var(--radius-md);
            font-size: 11px;
            font-weight: 500;
          }

          .keywords {
            font-size: 11px;
            color: var(--color-text-muted);
          }
        }
      }
    }
  }
}

@media (max-width: 1100px) {
  .article-detail-page {
    .article-detail-layout {
      grid-template-columns: 1fr;
      grid-template-areas:
        "outline"
        "article"
        "logs";
    }

    .outline-section {
      position: static;
      max-height: none;
      overflow: visible;
    }

    .execution-logs-section {
      .stats-summary {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }
}

@media (max-width: 768px) {
  .article-detail-page {
    .article-card {
      :deep(.ant-card-body) {
        padding: 24px;
      }
    }

    .title-section {
      .main-title {
        font-size: 22px;
      }

      .sub-title {
        font-size: 14px;
      }
    }

    .execution-logs-section {
      .stats-summary {
        grid-template-columns: 1fr;
      }
    }

    .back-top-btn {
      right: 20px;
      bottom: 24px;
    }
  }
}
</style>