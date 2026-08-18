<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vitepress'

const router = useRouter()

// 构建期收集所有 markdown 页面（eager：直接内联模块，避免运行时异步）
const modules = import.meta.glob('../../../src/**/*.md', { eager: true })

// 非文章页面：首页、本页、以及关于/联系等站点元信息页
const EXCLUDE = new Set([
  '/',
  '/random',
  '/about',
  '/contact',
  '/aboutsite',
])

// 将 glob 的 key（形如 ../../../src/fullops/awesome/how-ai-driven-dev.md）
// 转换为站点路由（/fullops/awesome/how-ai-driven-dev），并处理 index.md → 目录
function toRoute(key) {
  let path = key.replace(/\.md$/, '')
  const idx = path.indexOf('/src/')
  if (idx >= 0) path = path.slice(idx + '/src'.length)
  path = path.replace(/\/index$/, '/')
  if (path === '') path = '/'
  return path
}

const articles = Object.keys(modules)
  .map(toRoute)
  .filter((p) => p && !EXCLUDE.has(p))

function pickRandom() {
  return articles[Math.floor(Math.random() * articles.length)]
}

onMounted(() => {
  const target = pickRandom()
  if (target) {
    router.go(target)
  }
})
</script>

<template>
  <div class="random-loading">
    <p>正在为你随机抽取一篇文章…</p>
  </div>
</template>

<style scoped>
.random-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  color: var(--vp-c-text-2);
  font-size: 1.1rem;
}
</style>
