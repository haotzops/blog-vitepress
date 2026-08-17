import type { DefaultTheme } from 'vitepress'

export const nav: DefaultTheme.Config['nav'] = [
    { text: '首页', link: '/' },
    { text: '我的简历', link: 'https://cv.haotzops.com' },
    { text: 'fullops', link: '/fullops/' },
    { text: '自托管', link: '/self-hosted/' },
    { text: '插件开发', link: '/plugin-dev/' },
    { text: '关于我', link: '/about' },
]
