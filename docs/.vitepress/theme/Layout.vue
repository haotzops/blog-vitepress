<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import TechOrbit from './components/TechOrbit.vue' // 首页 Hero Logo hover 彩蛋（技术栈轨道）
import { nextTick, provide } from 'vue'

const { isDark } = useData()

const enableTransitions = () =>
  'startViewTransition' in document &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches

provide('toggle-appearance', async (event?: MouseEvent | { clientX?: number; clientY?: number }) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value
    return
  }

  // 动画锚点：优先用真实点击坐标（鼠标点击时始终准确，刷新后第一次点击亦然）。
  // 键盘合成 click（clientX/clientY 为 0）或坐标无效时，才回退到「可见」的主题
  // 切换按钮中心（需过滤掉移动端菜单里 display:none 的隐藏实例）。
  // 优先用真实点击坐标（鼠标点击时始终准确）。
  // 键盘合成 click（clientX/clientY 为 0）或坐标无效时，才回退到「可见」的主题
  // 切换按钮中心（需过滤掉移动端菜单里 display:none 的隐藏实例）。
  let x = event?.clientX ?? NaN
  let y = event?.clientY ?? NaN
  if (!Number.isFinite(x) || !Number.isFinite(y) || (x === 0 && y === 0)) {
    const visibleBtn = Array.from(
      document.querySelectorAll<HTMLElement>('.VPSwitchAppearance')
    ).find((btn) => {
      const r = btn.getBoundingClientRect()
      return r.width > 0 && r.height > 0
    })
    // 找不到可见实例时，兜底到任意一个切换按钮；再兜底到可视区域中心。
    // 切记勿退化为「导航栏顶部中心」（innerWidth/2, y=0），那会让收缩中心明显错位。
    const fallback = visibleBtn ?? document.querySelector<HTMLElement>('.VPSwitchAppearance')
    const rect = fallback?.getBoundingClientRect()
    x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
  }

  const maxRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y)
  )
  const clip0 = `circle(0px at ${x}px ${y}px)`
  const clipFull = `circle(${maxRadius}px at ${x}px ${y}px)`

  const transition = document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  })
  await transition.ready

  // 两个方向统一为“收缩”：旧画面在顶层，clip-path 从全屏 (clipFull)
  // 收缩到按钮 (clip0)，露出底层完整显示（不裁剪）的新画面。
  document.documentElement.animate(
    { clipPath: [clipFull, clip0] },
    {
      duration: 300,
      easing: 'ease-in',
      fill: 'forwards',
      pseudoElement: '::view-transition-old(root)'
    }
  )
})
</script>

<template>
  <DefaultTheme.Layout>
    <template #home-hero-image>
      <TechOrbit />
    </template>
  </DefaultTheme.Layout>
</template>

<style>
/* TechOrbit 气泡轨道需要溢出可见（配合 #home-hero-image 插槽替换默认 Hero 图片） */
.VPHero .image,
.VPHero .image-container {
  overflow: visible;
}

::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

/* 统一收缩：旧画面（切换前）恒定在顶层、从全屏收缩，露出底层新画面；
   新画面在底层完整显示，不裁剪。 */
::view-transition-old(root) {
  z-index: 9999;
}

::view-transition-new(root) {
  z-index: 1;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}
</style>
