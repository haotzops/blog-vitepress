<script setup>
import { onMounted } from 'vue'
import { useRouter, withBase } from 'vitepress'

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

let navigated = false // 防止同一次挂载内重复跳转

function pickRandom() {
  return articles[Math.floor(Math.random() * articles.length)]
}

onMounted(() => {
  if (navigated) return
  const target = pickRandom()
  if (!target) return
  navigated = true

  // VitePress 2.0 重写了 router.go()：当目标地址 === 当前地址时
  // （changeRoute 返回 false）不会加载新页面，原来的“先 replaceState
  // 再 go()”hack 因而失效，页面会卡在加载提示。
  // 2.0 的 go() 新增 replace 选项：会自行 replaceState 替换当前 /random
  // 历史条目（不进栈，“返回”不会回到 /random 重新随机）并正常加载目标文章。
  const href = withBase(target)
  router.go(href, { replace: true })
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
