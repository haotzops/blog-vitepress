import type { DefaultTheme } from "vitepress";

export const sidebar: DefaultTheme.Config["sidebar"] = {
  // fullops：结构参考 fullops-docs
  "/fullops/": [
    {
      text: "开始",
      items: [
        { text: "快速导览", link: "/fullops/" },
        { text: "FullOps 介绍", link: "/fullops/introduction" },
      ],
    },
    {
      text: "项目亮点",
      items: [
        { text: "精华亮点", link: "/fullops/awesome/" },
        {
          text: "AI 如何驱动项目 90% 开发",
          link: "/fullops/awesome/how-ai-driven-dev",
        },
      ],
    },
    {
      text: "项目特性细节",
      items: [
        { text: "项目特性细节", link: "/fullops/design/" },
        {
          text: "基础设施/应用 的可恢复性",
          link: "/fullops/design/recoverable",
        },
      ],
    },
  ],
  // 自托管
  "/self-hosted/": [
    {
      text: "开始",
      items: [{ text: "全局导览", link: "/self-hosted/" }],
    },
    {
      text: "NAS",
      items: [{ text: "NAS 导览", link: "/self-hosted/nas" }],
    },
    {
      text: "VPS",
      items: [{ text: "VPS 导览", link: "/self-hosted/vps" }],
    },
  ],
  // 插件开发
  "/plugin-dev/": [
    {
      text: "开始",
      items: [{ text: "全局导览", link: "/plugin-dev/" }],
    },
    {
      text: "Pi Coding Agent",
      items: [
        { text: "Pi Packages 导览", link: "/plugin-dev/pi-coding-agent" },
      ],
    },
    {
      text: "Zed IDE",
      items: [{ text: "Zed 插件导览", link: "/plugin-dev/zed-ide" }],
    },
    {
      text: "Obsidian",
      items: [{ text: "Obsidian 导览", link: "/plugin-dev/obsidian" }],
    },
  ],
};
