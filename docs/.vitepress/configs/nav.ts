import type { DefaultTheme } from "vitepress";

export const nav: DefaultTheme.Config["nav"] = [
  { text: "首页", link: "/" },
  { text: "我的简历", link: "https://cv.haotzops.com" },
  {
    text: "fullops",
    items: [
      { text: "导览", link: "/fullops/" },
      { text: "项目亮点", link: "/fullops/awesome/" },
      { text: "项目特性细节", link: "/fullops/design/" },
    ],
  },
  {
    text: "自托管",
    items: [
      { text: "导览", link: "/self-hosted/" },
      { text: "NAS", link: "/self-hosted/nas" },
      { text: "VPS", link: "/self-hosted/vps" },
    ],
  },
  {
    text: "插件开发",
    items: [
      { text: "导览", link: "/plugin-dev/" },
      { text: "Pi Coding Agent", link: "/plugin-dev/pi-coding-agent" },
      { text: "Zed IDE", link: "/plugin-dev/zed-ide" },
      { text: "Obsidian", link: "/plugin-dev/obsidian" },
    ],
  },
  { text: "关于我", link: "/about" },
];
