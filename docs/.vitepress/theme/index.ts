import DefaultTheme from 'vitepress/theme';
import './style/index.css'
import 'virtual:group-icons.css' //代码组样式
import { BProgress } from '@bprogress/core' // 进度条组件
import '@bprogress/core/css' // 进度条样式
import { h } from 'vue' // h函数
import { useData , useRoute, inBrowser } from 'vitepress'
import CopyOrDownloadAsMarkdownButtons from 'vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue'
import RandomArticle from './components/RandomArticle.vue' // 随机一篇文章
import Layout from './Layout.vue' // 自定义 Layout（切换主题时的 View Transitions 动画）
import confetti from 'canvas-confetti' // 纸屑特效

import { onMounted, watch, nextTick } from 'vue';

// 彩虹背景动画样式
let homePageStyle: HTMLStyleElement | undefined

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({app , router }) {
    // 每页 复制/下载 为 Markdown 按钮
    app.component('CopyOrDownloadAsMarkdownButtons', CopyOrDownloadAsMarkdownButtons)
    app.component('RandomArticle', RandomArticle) // 随机一篇文章
    // 首页「随机一篇文章」按钮：点击时绽放 Custom Shapes 形状纸屑
    if (inBrowser) {
      watch(
        () => router.route.path,
        () => nextTick(() => bindRandomConfetti()),
        { immediate: true },
      )
    }
    //彩虹动画
    if (typeof window !== 'undefined') {
      watch(
        () => router.route.data.relativePath,
        () => updateHomePageStyle(location.pathname === '/'),
        { immediate: true },
      )
    }

    // 顶部进度条 + 页面切换动效（移植 fuwari 的 Swup 过渡：
    // 旧内容淡出下移 → 新内容上浮淡入，正文元素依次延迟浮现）
    if (inBrowser) {
      BProgress.configure({ showSpinner: false })
      const PAGE_LEAVE_MS = 200 // 淡出动画时长（fuwari: 200ms）
      const PAGE_ENTER_MS = 300 // 入场动画时长（fuwari: 300ms）

      router.onBeforeRouteChange = async () => {
        BProgress.start() // 开始进度条

        // 旧页面内容淡出 + 下移；await 动画结束再继续导航
        document.documentElement.classList.add('page-leaving')
        await new Promise((r) => setTimeout(r, PAGE_LEAVE_MS + 20))
        // 保持隐藏，等待新页面替换（防止旧内容闪现）
        document.documentElement.classList.add('page-leaving-done')
        document.documentElement.classList.remove('page-leaving')
      }
      router.onAfterRouteChanged = async () => {
        BProgress.done() // 停止进度条

        // 新内容上浮淡入（含正文子元素依次延迟）
        const html = document.documentElement
        // 先停掉退出动画、保持隐藏，直到新 DOM 渲染完成；
        // 再在同一帧内恢复显示并加 page-entering，避免新内容“闪一帧”
        html.classList.remove('page-leaving')
        html.classList.add('page-leaving-done')
        await nextTick() // 等待新页面 DOM 渲染完成
        html.classList.remove('page-leaving-done')
        html.classList.add('page-entering')
        window.setTimeout(
          () => html.classList.remove('page-entering'),
          PAGE_ENTER_MS + 50,
        )
      }
    }
  },
};

// 首页 hero「随机一篇文章」按钮：绑定 canvas-confetti Custom Shapes 形状纸屑效果
// 参考 https://www.kirilv.com/canvas-confetti/#paths
function bindRandomConfetti(tries = 0) {
  if (location.pathname !== '/') return
  const btn = Array.from(document.querySelectorAll<HTMLAnchorElement>('.VPHero .VPButton'))
    .find((el) => el.textContent?.includes('随机一篇文章'))
  if (!btn) {
    // home 布局是异步渲染的，最多重试 20 次（约 1s）
    if (tries < 20) setTimeout(() => bindRandomConfetti(tries + 1), 50)
    return
  }
  if (btn.dataset.confettiBound) return
  btn.dataset.confettiBound = '1'
  btn.addEventListener('click', fireShapesConfetti)
}

// canvas-confetti Custom Shapes：南瓜/圣诞树/爱心 SVG 形状纸屑，从顶部喷洒落下
let customShapes: ReturnType<typeof confetti.shapeFromPath>[] | undefined
function fireShapesConfetti() {
  // SVG path 解析开销较大，首次解析后缓存复用
  if (!customShapes) {
    // 南瓜，https://thenounproject.com/icon/pumpkin-5253388/
    const pumpkin = confetti.shapeFromPath({
      path: 'M449.4 142c-5 0-10 .3-15 1a183 183 0 0 0-66.9-19.1V87.5a17.5 17.5 0 1 0-35 0v36.4a183 183 0 0 0-67 19c-4.9-.6-9.9-1-14.8-1C170.3 142 105 219.6 105 315s65.3 173 145.7 173c5 0 10-.3 14.8-1a184.7 184.7 0 0 0 169 0c4.9.7 9.9 1 14.9 1 80.3 0 145.6-77.6 145.6-173s-65.3-173-145.7-173zm-220 138 27.4-40.4a11.6 11.6 0 0 1 16.4-2.7l54.7 40.3a11.3 11.3 0 0 1-7 20.3H239a11.3 11.3 0 0 1-9.6-17.5zM444 383.8l-43.7 17.5a17.7 17.7 0 0 1-13 0l-37.3-15-37.2 15a17.8 17.8 0 0 1-13 0L256 383.8a17.5 17.5 0 0 1 13-32.6l37.3 15 37.2-15c4.2-1.6 8.8-1.6 13 0l37.3 15 37.2-15a17.5 17.5 0 0 1 13 32.6zm17-86.3h-82a11.3 11.3 0 0 1-6.9-20.4l54.7-40.3a11.6 11.6 0 0 1 16.4 2.8l27.4 40.4a11.3 11.3 0 0 1-9.6 17.5z',
      matrix: new DOMMatrix([0.020491803278688523, 0, 0, 0.020491803278688523, -7.172131147540983, -5.9016393442622945]),
    })
    // 圣诞树，https://thenounproject.com/icon/pine-tree-1471679/
    const tree = confetti.shapeFromPath({
      path: 'M120 240c-41,14 -91,18 -120,1 29,-10 57,-22 81,-40 -18,2 -37,3 -55,-3 25,-14 48,-30 66,-51 -11,5 -26,8 -45,7 20,-14 40,-30 57,-49 -13,1 -26,2 -38,-1 18,-11 35,-25 51,-43 -13,3 -24,5 -35,6 21,-19 40,-41 53,-67 14,26 32,48 54,67 -13,-1 -23,-3 -35,-6 15,18 32,32 51,43 -13,3 -26,2 -38,1 17,19 36,35 56,49 -19,1 -33,-2 -45,-7 19,21 42,37 67,51 -19,6 -37,5 -56,3 25,18 53,30 82,40 -30,17 -79,13 -120,-1l0 41 -31 0 0 -41z',
      matrix: new DOMMatrix([0.03597122302158273, 0, 0, 0.03597122302158273, -4.856115107913669, -5.071942446043165]),
    })
    // 爱心，https://thenounproject.com/icon/heart-1545381/
    const heart = confetti.shapeFromPath({
      path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
      matrix: new DOMMatrix([0.03333333333333333, 0, 0, 0.03333333333333333, -5.566666666666666, -5.533333333333333]),
    })
    customShapes = [pumpkin, tree, heart]
  }

  const defaults = {
    scalar: 2,
    spread: 180,
    particleCount: 30,
    origin: { y: -0.1 },
    startVelocity: -35,
    zIndex: 200,
  }
  confetti({ ...defaults, shapes: [customShapes[0]], colors: ['#ff9a00', '#ff7400', '#ff4d00'] })
  confetti({ ...defaults, shapes: [customShapes[1]], colors: ['#8d960f', '#be0f10', '#445404'] })
  confetti({ ...defaults, shapes: [customShapes[2]], colors: ['#f93963', '#a10864', '#ee0b93'] })
}

// 彩虹背景动画样式
function updateHomePageStyle(value: boolean) {
  if (value) {
    if (homePageStyle) return

    homePageStyle = document.createElement('style')
    homePageStyle.innerHTML = `
    :root {
      animation: rainbow 12s linear infinite;
    }`
    document.body.appendChild(homePageStyle)
  } else {
    if (!homePageStyle) return

    homePageStyle.remove()
    homePageStyle = undefined
  }
}

