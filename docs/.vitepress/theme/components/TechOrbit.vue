<script setup lang="ts">
import { ref } from 'vue'

type StackItem = {
  name: string
  icon: string
  /** 双版本图标：浅色主题用深色版（iconAlt），深色主题用浅色版（icon） */
  iconAlt?: string
  /** 是否需要圆形气泡底：simple-icons 透明图标需要，skill-icons 卡片图标不需要 */
  bubble: boolean
  /** 档位：大 / 中 */
  tier: Tier
  /** 由 buildActiveStacks 填充 */
  size?: number
  radius?: number
  start?: number
}

type Tier = 'L' | 'M'

/**
 * 所有气泡使用完全相同的公转周期，因此角速度一致。
 * 原版 24s，按需求降至 75% 角速度：周期 = 24 / 0.75 = 32s。
 */
const ORBIT_DURATION = 32

/**
 * 两档尺寸与轨道半径（气泡整体比原版放大约 20%）。
 * 半径范围收敛：上限 130（原 152），下限 120（原 112），偏向短半径。
 */
const TIER_CONFIG: Record<Tier, { size: number; radius: number }> = {
  L: { size: 82, radius: 130 },
  M: { size: 74, radius: 120 },
}

/**
 * 每次 hover 弹出固定 6 个：3 大 + 3 中。
 * 档位交错排列（相邻档位轨道半径不同），避免气泡重叠。
 */
const ACTIVE_COUNT = 6
const TIER_ORDER: Tier[] = ['L', 'M', 'L', 'M', 'L', 'M']

/**
 * 17 个候选技术栈，按档位分组。
 *
 * radius 故意不同：同档位半径一致、跨档位半径拉开（138 / 124）。
 * start 表示初始角度，由 buildActiveStacks 按 60° 等分生成。
 */
const tierStacks: Record<Tier, StackItem[]> = {
  L: [
    { name: 'Linux', icon: '/stack/linux-light.svg', iconAlt: '/stack/linux-dark.svg', bubble: false, tier: 'L' },
    { name: 'Docker', icon: '/stack/docker.svg', bubble: false, tier: 'L' },
    { name: 'Kubernetes', icon: '/stack/kubernetes.svg', bubble: false, tier: 'L' },
    { name: 'Go', icon: '/stack/go.svg', bubble: false, tier: 'L' },
    { name: 'Grafana', icon: '/stack/grafana-light.svg', iconAlt: '/stack/grafana-dark.svg', bubble: false, tier: 'L' },
    { name: 'GitHub Actions', icon: '/stack/githubactions-light.svg', iconAlt: '/stack/githubactions-dark.svg', bubble: false, tier: 'L' },
  ],
  M: [
    { name: 'Git', icon: '/stack/git.svg', bubble: false, tier: 'M' },
    { name: 'Prometheus', icon: '/stack/prometheus.svg', bubble: false, tier: 'M' },
    { name: 'MySQL', icon: '/stack/mysql-light.svg', iconAlt: '/stack/mysql-dark.svg', bubble: false, tier: 'M' },
    { name: 'Aliyun', icon: '/stack/aliyun.svg', bubble: true, tier: 'M' },
    { name: 'Nginx', icon: '/stack/nginx.svg', bubble: false, tier: 'M' },
    { name: 'Terraform', icon: '/stack/terraform-light.svg', iconAlt: '/stack/terraform-dark.svg', bubble: false, tier: 'M' },
    { name: 'Ansible', icon: '/stack/ansible.svg', bubble: false, tier: 'M' },
    { name: 'Redis', icon: '/stack/redis-light.svg', iconAlt: '/stack/redis-dark.svg', bubble: false, tier: 'M' },
    { name: 'Vim', icon: '/stack/vim-light.svg', iconAlt: '/stack/vim-dark.svg', bubble: false, tier: 'M' },
    { name: 'Harbor', icon: '/stack/harbor.svg', bubble: true, tier: 'M' },
    { name: 'VMware', icon: '/stack/vmware.svg', bubble: true, tier: 'M' },
  ],
}

const hovered = ref(false)

/**
 * 首次 SSR / hydration 保持确定性：按档位顺序从各组依次取项。
 * 未 hover 时气泡处于收起状态，具体角度不影响视觉。
 */
const initialStacks: StackItem[] = (() => {
  const counts: Record<Tier, number> = { L: 0, M: 0 }

  return TIER_ORDER.map((tier, index) => {
    const pool = tierStacks[tier]
    const config = TIER_CONFIG[tier]
    const item = pool[counts[tier] % pool.length]
    counts[tier] += 1

    return {
      ...item,
      size: config.size,
      radius: config.radius,
      start: index * 60 - 90,
    }
  })
})()

const activeStacks = ref<StackItem[]>(initialStacks)

/**
 * 首次 SSR / hydration 保持确定性。
 * 随机 delay 只在浏览器 pointerenter 时生成。
 */
const enterDelays = ref<number[]>(initialStacks.map(() => 0))

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Fisher–Yates 洗牌 */
function shuffle<T>(arr: T[]): T[] {
  const pool = [...arr]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool
}

/** 从档位池随机取 count 个（不重复） */
function pickFrom(tier: Tier, count: number): StackItem[] {
  return shuffle(tierStacks[tier]).slice(0, count)
}

/**
 * 每次 hover 生成一批：3 大 + 3 中共 6 个。
 *
 * 防重叠设计：
 * - 角度按 360° / 6 = 60° 等分，每气泡仅 ±8° 随机偏移；
 * - TIER_ORDER 档位交错，相邻气泡轨道半径必然不同（130 / 120）。
 */
function buildActiveStacks(): StackItem[] {
  const picks: Record<Tier, StackItem[]> = {
    L: pickFrom('L', 3),
    M: pickFrom('M', 3),
  }

  return TIER_ORDER.map((tier, index) => {
    const item = picks[tier].pop()!
    const config = TIER_CONFIG[tier]
    return {
      ...item,
      size: config.size,
      radius: config.radius,
      start: index * 60 - 90 + randomInt(-8, 8),
    }
  })
}

/**
 * 相邻气泡之间随机间隔 30~50ms。
 * 顺序固定，但每次 hover 的喷出节奏都会略有变化。
 */
function generateEnterDelays() {
  let delay = 0

  enterDelays.value = activeStacks.value.map((_, index) => {
    if (index > 0) {
      delay += randomInt(30, 50)
    }

    return delay
  })
}

/**
 * 防止新气泡瞬间出现：
 * 先替换列表（此时 hovered 仍为 false，新气泡以「收起」状态挂载），
 * 双 rAF 后再置 hovered，保证所有气泡统一从 Logo 中心带过渡喷出。
 */
let pendingHover = false

function handlePointerEnter() {
  pendingHover = true
  activeStacks.value = buildActiveStacks()
  generateEnterDelays()
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (pendingHover) hovered.value = true
    })
  })
}

function handlePointerLeave() {
  pendingHover = false
  hovered.value = false
}
</script>

<template>
  <div
    class="tech-orbit"
    :class="{ 'is-hovered': hovered }"
  >
    <div
      class="orbit-field"
      aria-hidden="true"
    >
      <div
        v-for="(stack, index) in activeStacks"
        :key="stack.name"
        class="orbit-start"
        :style="{
          '--start': `${stack.start}deg`,
          '--enter-delay': `${enterDelays[index]}ms`,
        }"
      >
        <div
          class="orbiter"
          :style="{
            '--orbit-duration': `${ORBIT_DURATION}s`,
          }"
        >
          <div
            class="orbit-position"
            :style="{
              '--radius': `${stack.radius}px`,
            }"
          >
            <div
              class="initial-upright"
              :style="{
                '--start': `${stack.start}deg`,
              }"
            >
              <div
                class="counter-orbit"
                :style="{
                  '--orbit-duration': `${ORBIT_DURATION}s`,
                }"
              >
                <div
                  class="stack-bubble"
                  :class="{ 'has-bubble': stack.bubble }"
                  :style="{
                    '--bubble-size': `${stack.size}px`,
                  }"
                >
                  <template v-if="stack.iconAlt">
                    <img
                      :src="stack.iconAlt"
                      class="icon-theme-dark"
                      :alt="stack.name"
                      draggable="false"
                    >
                    <img
                      :src="stack.icon"
                      class="icon-theme-light"
                      alt=""
                      draggable="false"
                    >
                  </template>
                  <img
                    v-else
                    :src="stack.icon"
                    class="icon-single"
                    :alt="stack.name"
                    draggable="false"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="main-logo"
      @pointerenter="handlePointerEnter"
      @pointerleave="handlePointerLeave"
    >
      <img
        src="/favicon.png"
        alt="haotzops"
        draggable="false"
      >
    </div>
  </div>
</template>

<style scoped>
.tech-orbit {
  position: relative;
  width: 352px;
  height: 352px;
  display: grid;
  place-items: center;
  overflow: visible;
  isolation: isolate;
}

.main-logo {
  position: relative;
  z-index: 10;
  width: 156px;
  height: 156px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.main-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
}

/* 中心 Logo 保持静态：不随 hover 缩放 / 加阴影，避免阴影闪烁 */

.orbit-field {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.orbit-start {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  transform: rotate(var(--start));
}

.orbiter {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  animation:
    tech-orbit-rotate
    var(--orbit-duration)
    linear
    infinite;
  animation-play-state: paused;
}

.tech-orbit.is-hovered .orbiter {
  animation-play-state: running;
}

@keyframes tech-orbit-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.orbit-position {
  position: absolute;
  left: 0;
  top: 0;

  /* 默认收在 Logo 中心 */
  transform: translateX(0);

  /*
   * mouseleave：逐渐加速吸回中心。
   * 无 overshoot / 无回弹。
   */
  transition:
    transform
    270ms
    cubic-bezier(0.55, 0.05, 0.85, 0.35)
    0ms;

  will-change: transform;
}

.tech-orbit.is-hovered .orbit-position {
  transform: translateX(var(--radius));

  /*
   * hover：高初速度，随后平滑减速。
   * 控制点不越出 0~1，因此不会 overshoot。
   */
  transition:
    transform
    430ms
    cubic-bezier(0.16, 0.72, 0.24, 1)
    var(--enter-delay);
}

.initial-upright {
  transform: rotate(calc(-1 * var(--start)));
}

.counter-orbit {
  animation:
    tech-counter-rotate
    var(--orbit-duration)
    linear
    infinite;
  animation-play-state: paused;
}

.tech-orbit.is-hovered .counter-orbit {
  animation-play-state: running;
}

@keyframes tech-counter-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(-360deg);
  }
}

.stack-bubble {
  width: var(--bubble-size);
  height: var(--bubble-size);

  display: flex;
  align-items: center;
  justify-content: center;

  transform:
    translate(-50%, -50%)
    scale(0.28);

  opacity: 0;

  /* 默认无气泡底：skill-icons 图标自带圆角矩形卡片背景 */
  padding: 0;
  border-radius: 0;
  background: none;
  border: none;
  box-shadow: none;
  backdrop-filter: none;

  transition:
    transform
    270ms
    cubic-bezier(0.55, 0.05, 0.85, 0.35)
    0ms,
    opacity
    110ms
    linear
    120ms;

  will-change:
    transform,
    opacity;
}

/* simple-icons 透明单色图标需要圆形气泡底衬托；padding 收窄让图标占比更大 */
.stack-bubble.has-bubble {
  padding: 5px;
  border-radius: 50%;

  background:
    color-mix(
      in srgb,
      var(--vp-c-bg-soft) 88%,
      transparent
    );

  border:
    1px solid
    color-mix(
      in srgb,
      var(--vp-c-divider) 76%,
      transparent
    );

  box-shadow:
    0 6px 20px rgb(0 0 0 / 9%),
    inset 0 1px 0 rgb(255 255 255 / 12%);

  backdrop-filter: blur(10px);
}

.tech-orbit.is-hovered .stack-bubble {
  transform:
    translate(-50%, -50%)
    scale(1);

  opacity: 1;

  transition:
    transform
    400ms
    cubic-bezier(0.16, 0.72, 0.24, 1)
    var(--enter-delay),
    opacity
    150ms
    ease-out
    var(--enter-delay);
}

.stack-bubble img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
}

/* 双版本图标：浅色主题显示深色版（icon-theme-dark），深色主题显示浅色版（icon-theme-light） */
.stack-bubble .icon-theme-dark {
  display: block;
}

.dark .stack-bubble .icon-theme-dark {
  display: none;
}

.stack-bubble .icon-theme-light {
  display: none;
}

.dark .stack-bubble .icon-theme-light {
  display: block;
}

/* 单版本彩色图标：深浅主题都显示 */
.stack-bubble .icon-single {
  display: block;
}

@media (max-width: 639px) {
  .tech-orbit {
    width: 320px;
    height: 320px;
  }

  .orbit-field {
    transform: scale(0.88);
    transform-origin: center;
  }

  .main-logo {
    width: 136px;
    height: 136px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .orbiter,
  .counter-orbit {
    animation: none;
  }

  .orbit-position,
  .stack-bubble {
    transition-duration: 120ms !important;
    transition-delay: 0ms !important;
  }
}
</style>
