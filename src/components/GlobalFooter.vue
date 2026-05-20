<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="@/assets/logo.svg" alt="墨语" class="footer-logo" />
        <span class="footer-name">墨语</span>
        <span class="footer-dot">·</span>
        <span class="footer-tagline">智能写作，下笔成章</span>
      </div>
      <p class="footer-copy">
        © {{ year }} 墨语
        <span class="sep">|</span>
        <a
          href="http://blog.codepure.cn"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-link"
        >
          Sh's 工作台
        </a>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.site-footer {
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
  padding: 28px var(--page-padding);
}

.footer-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-logo {
  width: 24px;
  height: 24px;
  border-radius: 6px;
}

.footer-name {
  font-family: 'Noto Serif SC', serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 0.06em;
}

.footer-dot {
  color: var(--color-text-muted);
}

.footer-tagline {
  font-size: 13px;
  color: var(--color-text-muted);
}

.footer-copy {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted);
}

.sep {
  margin: 0 8px;
  opacity: 0.5;
}

.footer-link {
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--color-accent);
}
</style>
