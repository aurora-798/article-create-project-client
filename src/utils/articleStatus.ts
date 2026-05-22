type ArticleStatusLike = Pick<API.ArticleVO, 'status' | 'phase'>

export interface ArticleDisplayStatus {
  key: string
  text: string
  className: string
  canContinue: boolean
}

/**
 * 展示状态要结合 phase 判断，避免把等待用户确认的任务误展示为“生成中”。
 */
export const getArticleDisplayStatus = (article: ArticleStatusLike | null | undefined): ArticleDisplayStatus => {
  const status = article?.status || ''
  const phase = article?.phase || ''

  if (status === 'COMPLETED') {
    return { key: 'COMPLETED', text: '已完成', className: 'moyu-status-completed', canContinue: false }
  }

  if (status === 'FAILED') {
    return { key: 'FAILED', text: '失败', className: 'moyu-status-failed', canContinue: false }
  }

  if (status === 'PENDING') {
    return { key: 'PENDING', text: '等待中', className: 'moyu-status-pending', canContinue: false }
  }

  if (status === 'PROCESSING') {
    if (phase === 'TITLE_SELECTING') {
      return { key: 'TITLE_SELECTING', text: '待选择标题', className: 'moyu-status-pending', canContinue: true }
    }

    if (phase === 'OUTLINE_EDITING') {
      return { key: 'OUTLINE_EDITING', text: '待确认大纲', className: 'moyu-status-pending', canContinue: true }
    }

    const phaseTextMap: Record<string, string> = {
      TITLE_GENERATING: '生成标题中',
      OUTLINE_GENERATING: '生成大纲中',
      CONTENT_GENERATING: '生成正文中',
    }

    return {
      key: phase || 'PROCESSING',
      text: phaseTextMap[phase] || '生成中',
      className: 'moyu-status-processing',
      canContinue: false,
    }
  }

  return { key: status || 'UNKNOWN', text: status || '-', className: 'moyu-status-default', canContinue: false }
}

export const canContinueArticle = (article: ArticleStatusLike | null | undefined) =>
  getArticleDisplayStatus(article).canContinue
