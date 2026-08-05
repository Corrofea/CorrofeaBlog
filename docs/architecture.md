# 架构说明 · 蚀羽 CorrofeaBlog

> 白夜書簡 · 蚀羽版 — 纯静态个人技术博客的文件架构、设计决策与数据流

## 设计原则

1. **零构建**：无框架、无打包工具，任何文本编辑器即可维护
2. **零网络依赖（首页）**：首页数据内嵌 HTML，不依赖 fetch
3. **数据驱动**：文章和项目用 JSON/Markdown 管理，页面是通用模板
4. **分层清晰**：CSS 分模块 → 合并为单文件；JS 按职责拆分
5. **双语一等公民**：中英切换零刷新，所有内容字段支持双语

## 目录全景

```
CorrofeaBlog/
│
├── index.html              # 首页：数据内嵌，同步渲染文章列表
├── post.html               # 文章详情：通用模板，?slug=xxx 加载 MD
├── about.html              # 关于页（静态 + i18n）
├── archive.html            # 归档页（按年份分组）
├── tags.html               # 标签页（按标签聚合）
├── projects.html           # 项目展示页
│
├── posts/                  # ★ 博客文章（Markdown）
│   ├── zh/                 #   中文文章 .md
│   └── en/                 #   英文文章 .md
├── posts-index.json        # ★ 文章索引（元数据注册表）
├── projects.json           # ★ 项目索引（元数据注册表）
│
├── styles/                 # CSS
│   ├── reset.css           #   Reset
│   ├── variables.css       #   设计变量（颜色、间距、深浅色）
│   ├── typography.css      #   排版系统
│   ├── layout.css          #   布局
│   ├── components/         #   组件样式（header, footer, card, button 等）
│   ├── pages/              #   页面样式（home, archive, about, projects）
│   ├── main.css            #   开发用入口（@import 全部）
│   └── bundle.css          # ★ 生产用单文件（cat 合并，无 @import）
│
├── scripts/                # JavaScript
│   ├── lib/
│   │   └── marked.min.js   #   Markdown 解析器
│   ├── utils/
│   │   ├── i18n.js         #   ★ 国际化引擎（预加载优先，fetch 兜底）
│   │   ├── router.js       #   URL 参数解析
│   │   ├── posts.js        #   ★ 文章加载器（同步 + 异步双模式）
│   │   └── marked-setup.js #   marked 配置（图片懒加载、链接处理）
│   ├── components/
│   │   ├── header.js       #   导航栏注入 + 按钮事件
│   │   ├── footer.js       #   页脚注入
│   │   ├── theme.js        #   ★ 深浅色主题切换
│   │   └── comments.js     #   评论系统预留
│   └── main.js             #   ★ 总入口：初始化调度 + 超时兜底
│
├── i18n/                   # 翻译文件（其他页面 fetch 使用）
│   ├── zh.json
│   └── en.json
│
├── components/             # 共享 HTML 片段（JS fetch 后注入）
│   ├── header.html
│   ├── footer.html
│   └── comment-section.html
│
├── assets/                 # 静态资源
│   ├── images/common/      #   站点图片（logo, avatar, favicon）
│   ├── images/blog/        #   文章配图（按 slug 分目录）
│   ├── fonts/              #   自托管字体（预留）
│   └── files/              #   可下载文件（简历等）
│
├── demos/                  # ★ 托管项目 Demo（网页游戏等）
│
├── nginx/
│   └── corrofea.conf       # Nginx 部署配置
│
├── docs/                   # 文档
│   ├── architecture.md     #   本文
│   └── usage.md            #   用法手册
│
├── robots.txt
├── sitemap.xml
├── .gitignore
└── README.md
```

## 数据流

### 首页渲染（零 fetch）

```
index.html
  ├── <script>window.__I18N__ = {...}</script>   ← 翻译数据内嵌
  ├── <script>window.__POSTS__ = [...]</script>   ← 文章索引内嵌
  │
  ├── i18n.js  → init() → 读 __I18N__ → 同步完成
  ├── posts.js → publishedSync() → 读 __POSTS__ → 同步返回
  │
  └── 页面脚本 → renderPostList() → 即时渲染 5 篇文章卡片
```

零网络请求，打开即显示。`publishedSync()` 与 `I18n.init()` 均不涉及 `fetch()`。

### 文章详情渲染

```
post.html?slug=xxx
  │
  ├── posts.js → getBySlug() → 从 __POSTS__ 或 fetch(/posts-index.json) 获取元数据
  ├── 渲染标题、日期、标签
  ├── posts.js → renderContent() → fetch(/posts/{lang}/xxx.md) → marked 解析 → 注入 <article>
  └── comments.js → 预留占位
```

文章内容（Markdown）仍需 fetch，因为正文太长不适合内嵌。8 秒超时兜底。

### 语言切换

```
用户点击 "EN"
  → I18n.toggle()
    → switchLang()
      → 读 window.__I18N__[target] （已有，同步）
      → apply() → 遍历 [data-i18n] 替换文本
      → 派发 'language-changed' 事件
        → renderPostList() 用新语言重新渲染卡片
        → Header.updateLangButton()
```

零网络请求，所有语言数据已内嵌或缓存在 I18n 模块中。

### 主题切换

```
用户点击 "☾"
  → Theme.toggle()
    → 读取当前 data-theme 属性
    → 设置为相反值
    → localStorage 存储偏好
    → CSS 变量自动切换（1.2s transition）
```

纯 CSS 变量驱动，JS 只改一个属性。

## 关键设计决策

### 为什么首页内嵌数据？

`fetch()` 没有默认超时，网络波动时请求可能挂起数分钟。首页作为访问入口，必须 100% 可靠。内嵌 5 篇文章的 JSON 约 3KB，对 HTML 体积影响微乎其微，换来绝对的加载可靠性。

其他页面（about, archive, tags, projects）体积小、访问频率低，仍使用 fetch，也都有超时兜底。

### 为什么 CSS 合并为 bundle.css？

`@import` 创建加载依赖链：一个文件 404/超时 → 后续文件可能不加载。合并为单文件后一次请求即可，14 个源文件保留用于分模块编辑。

### 为什么是 IIFE 而非 ES Module？

`<script type="module">` 是异步的，执行顺序不可控。IIFE 模式确保 `i18n.js` → `posts.js` → `main.js` 严格按序执行，各模块通过 `window.Xxx` 暴露。

### JS 模块职责边界

| 模块 | 职责 | 不负责 |
|------|------|--------|
| `i18n.js` | 翻译存储、获取、DOM 替换 | 页面渲染 |
| `posts.js` | 文章数据加载、MD 渲染 | UI 构建 |
| `theme.js` | 主题状态管理 | 样式定义 |
| `header.js` | DOM 注入 + 按钮事件 | 导航数据结构 |
| `main.js` | 初始化顺序编排 + 超时兜底 | 具体业务逻辑 |
| 页面内联脚本 | 页面特定渲染逻辑 | 跨页面共享 |

## 扩展点

| 功能 | 修改位置 | 方式 |
|------|---------|------|
| 评论系统 | `scripts/components/comments.js` | 替换为空实现，注入 Giscus/Waline 脚本 |
| 代码高亮 | `scripts/lib/` + `marked-setup.js` | 放入 highlight.js，配置 marked renderer |
| 本地字体 | `styles/typography.css` | 添加 `@font-face`，替换 `--font-*` 变量 |
| RSS | 新建 `scripts/utils/rss.js` | 读取 `posts-index.json` 生成 XML |
| 全文搜索 | 新建 `scripts/components/search.js` | 客户端对 `posts-index.json` 做全文匹配 |
| 新页面 | 新建 `xxx.html` + `styles/pages/xxx.css` | 复用 header/footer 组件 + i18n 引擎 |
