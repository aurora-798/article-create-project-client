<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/loginUser'
import { listArticle } from '@/api/articleController'
import dayjs from 'dayjs'
import {
  ArrowRightOutlined,
  FileTextOutlined,
  OrderedListOutlined,
  EditOutlined,
  PictureOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons-vue'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const topic = ref('')
const recentArticles = ref<API.ArticleVO[]>([])
const loadingArticles = ref(false)

const goToCreate = () => {
  if (topic.value.trim()) {
    router.push({ path: '/create', query: { topic: topic.value } })
  } else {
    router.push('/create')
  }
}

const goToList = () => {
  router.push('/article/list')
}

const viewArticle = (article: API.ArticleVO) => {
  router.push(`/article/${article.taskId}`)
}

const loadRecentArticles = async () => {
  if (!loginUserStore.loginUser.id) return

  loadingArticles.value = true
  try {
    const res = await listArticle({ pageNum: 1, pageSize: 6 })
    recentArticles.value = res.data.data?.records || []
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    loadingArticles.value = false
  }
}

const formatTime = (time: string) => {
  return dayjs(time).format('MM-DD HH:mm')
}

const features = [
  {
    icon: FileTextOutlined,
    title: '智能标题',
    description: '分析选题意图，生成多组吸睛标题供你选择',
  },
  {
    icon: OrderedListOutlined,
    title: '结构大纲',
    description: '自动规划章节脉络，逻辑清晰、层次分明',
  },
  {
    icon: EditOutlined,
    title: '流式正文',
    description: '实时呈现创作过程，所见即所得的流畅体验',
  },
  {
    icon: PictureOutlined,
    title: '智能配图',
    description: '自动匹配高质量图片，图文一体完美呈现',
  },
  {
    icon: ThunderboltOutlined,
    title: '高效产出',
    description: '数分钟完成万字长文，效率提升十倍',
  },
  {
    icon: ClockCircleOutlined,
    title: '创作归档',
    description: '历史记录随时查阅，支持导出与管理',
  },
]

onMounted(() => {
  loadRecentArticles()
})
</script>

<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">墨语 · AI 写作</p>
          <h1 class="hero-title">
            落笔成章<br />
            <em>让好文章自然发生</em>
          </h1>
          <p class="hero-desc">
            从选题到成稿，墨语以多智能体协作完成标题、大纲、正文与配图，为你节省大量写作时间。
          </p>

          <div class="compose-box">
            <a-input
              v-model:value="topic"
              placeholder="输入选题，例如：2026 年 AI 如何重塑职场竞争力"
              size="large"
              class="topic-field"
              @press-enter="goToCreate"
            />
            <a-button type="primary" size="large" class="start-btn" @click="goToCreate">
              开始创作
              <ArrowRightOutlined />
            </a-button>
          </div>
          <p class="hero-hint">工作总结 · 演讲稿 · 分析报告 · 心得体会</p>
        </div>

        <div class="hero-visual" aria-hidden="true">
          <div class="visual-card card-1">
            <span class="card-label">标题生成</span>
            <p class="card-text">「AI 时代，普通人如何破局？」</p>
          </div>
          <div class="visual-card card-2">
            <span class="card-label">大纲结构</span>
            <ul>
              <li>一、时代背景</li>
              <li>二、核心能力</li>
              <li>三、行动指南</li>
            </ul>
          </div>
          <div class="visual-card card-3">
            <span class="card-label">正文流式</span>
            <div class="typing-lines">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="section-inner">
        <header class="section-head">
          <h2>核心能力</h2>
          <p>一站式 AI 写作工作流，覆盖创作全流程</p>
        </header>
        <div class="feature-grid">
          <article v-for="(feature, index) in features" :key="index" class="feature-item">
            <div class="feature-icon">
              <component :is="feature.icon" />
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section
      v-if="loginUserStore.loginUser.id && recentArticles.length > 0"
      class="recent"
    >
      <div class="section-inner">
        <header class="recent-head">
          <div>
            <h2>最近创作</h2>
            <p>继续你未完成的灵感</p>
          </div>
          <a-button type="link" class="view-all" @click="goToList">
            查看全部
            <ArrowRightOutlined />
          </a-button>
        </header>

        <a-spin :spinning="loadingArticles">
          <div class="article-grid">
            <article
              v-for="article in recentArticles"
              :key="article.id"
              class="article-item"
              @click="viewArticle(article)"
            >
              <div class="article-cover">
                <img
                  v-if="article.coverImage"
                  :src="article.coverImage"
                  :alt="article.mainTitle"
                />
                <div v-else class="cover-empty">
                  <FileTextOutlined />
                </div>
              </div>
              <div class="article-body">
                <h4>{{ article.mainTitle || article.topic }}</h4>
                <div class="article-meta">
                  <time>
                    <ClockCircleOutlined />
                    {{ article.createTime ? formatTime(article.createTime) : '' }}
                  </time>
                  <span
                    :class="['moyu-status-badge', `moyu-status-${article.status?.toLowerCase()}`]"
                  >
                    {{
                      article.status === 'COMPLETED'
                        ? '已完成'
                        : article.status === 'PROCESSING'
                          ? '生成中'
                          : '等待中'
                    }}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </a-spin>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
}

/* Hero */
.hero {
  padding: 56px var(--page-padding) 72px;
  border-bottom: 1px solid var(--color-border);
}

.hero-grid {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

.eyebrow {
  display: inline-block;
  margin: 0 0 20px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-accent);
  background: var(--color-accent-muted);
  border-radius: var(--radius-full);
}

.hero-title {
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 700;
  line-height: 1.15;
  margin: 0 0 20px;
  color: var(--color-text);
}

.hero-title em {
  font-style: normal;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.hero-desc {
  font-size: 16px;
  line-height: 1.75;
  color: var(--color-text-secondary);
  margin: 0 0 32px;
  max-width: 480px;
}

.compose-box {
  display: flex;
  gap: 10px;
  max-width: 520px;
  padding: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.topic-field {
  flex: 1;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  font-size: 15px;
}

.start-btn {
  height: 48px !important;
  padding: 0 24px !important;
  border-radius: var(--radius-lg) !important;
  display: inline-flex !important;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.hero-hint {
  margin: 14px 0 0;
  font-size: 13px;
  color: var(--color-text-muted);
}

/* Hero visual */
.hero-visual {
  position: relative;
  min-height: 360px;
}

.visual-card {
  position: absolute;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  box-shadow: var(--shadow-lg);
}

.card-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 10px;
}

.card-text {
  margin: 0;
  font-family: 'Noto Serif SC', serif;
  font-size: 15px;
  color: var(--color-text);
  line-height: 1.5;
}

.card-1 {
  top: 0;
  left: 0;
  width: 72%;
  z-index: 3;
}

.card-2 {
  top: 120px;
  right: 0;
  width: 65%;
  z-index: 2;
}

.card-2 ul {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.card-3 {
  bottom: 0;
  left: 15%;
  width: 70%;
  z-index: 1;
}

.typing-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.typing-lines span {
  display: block;
  height: 8px;
  background: var(--color-background-tertiary);
  border-radius: 4px;
}

.typing-lines span:nth-child(1) { width: 100%; }
.typing-lines span:nth-child(2) { width: 85%; }
.typing-lines span:nth-child(3) { width: 60%; }

/* Features */
.features {
  padding: 72px var(--page-padding);
  background: var(--color-background-secondary);
}

.section-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.section-head {
  margin-bottom: 40px;
}

.section-head h2 {
  font-size: 28px;
  margin: 0 0 8px;
}

.section-head p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 15px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.feature-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  transition: all var(--transition-normal);
  cursor: default;
}

.feature-item:hover {
  border-color: var(--color-text-muted);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.feature-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-tertiary);
  border-radius: var(--radius-md);
  font-size: 20px;
  color: var(--color-text);
  margin-bottom: 16px;
}

.feature-item h3 {
  font-size: 16px;
  margin: 0 0 8px;
}

.feature-item p {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* Recent */
.recent {
  padding: 64px var(--page-padding) 80px;
}

.recent-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
}

.recent-head h2 {
  font-size: 24px;
  margin: 0 0 4px;
}

.recent-head p {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.view-all {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-accent) !important;
  font-weight: 500;
  padding: 0;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.article-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.article-item:hover {
  box-shadow: var(--shadow-card-hover);
  border-color: var(--color-text-muted);
}

.article-cover {
  height: 130px;
  background: var(--color-background-tertiary);
  overflow: hidden;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.9);
}

.cover-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: var(--color-text-muted);
}

.article-body {
  padding: 16px 18px 18px;
}

.article-body h4 {
  font-family: 'Noto Serif SC', serif;
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 12px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-meta time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
}

@media (max-width: 992px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .hero-visual {
    min-height: 280px;
  }

  .feature-grid,
  .article-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 40px 16px 56px;
  }

  .compose-box {
    flex-direction: column;
    border-radius: var(--radius-lg);
  }

  .start-btn {
    width: 100%;
    justify-content: center;
  }

  .hero-visual {
    display: none;
  }

  .feature-grid,
  .article-grid {
    grid-template-columns: 1fr;
  }

  .recent-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
