# 架构说明 · 蚀羽 CorrofeaBlog

> 羽落逢蚀 · 蚀羽版 — 纯静态个人技术博客的文件架构、设计决策与数据流

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
├── public/                     ← ★ Nginx root，唯一部署目录
│   ├── index.html              #   首页：数据内嵌，同步渲染
│   ├── post.html               #   文章详情：通用模板
│   ├── about.html              #   关于页
│   ├── archive.html            #   归档页（按年份分组）
│   ├── tags.html               #   标签页（按标签聚合）
│   ├── projects.html           #   项目展示页
│   ├── 404.html
│   ├── styles/
│   │   └── bundle.css          #   ★ 合并版 CSS（build.py 生成）
│   ├── scripts/                #   JavaScript（模块化）
│   │   ├── lib/marked.min.js
│   │   ├── utils/i18n.js       #   ★ 国际化引擎
│   │   ├── utils/router.js
│   │   ├── utils/posts.js      #   ★ 文章加载器
│   │   ├── utils/marked-setup.js
│   │   ├── components/         #   header.js, footer.js, theme.js, comments.js
│   │   └── main.js             #   ★ 总入口
│   ├── posts/
│   │   ├── zh/*.md             #   中文文章
│   │   └── en/*.md             #   英文文章
│   ├── i18n/                   #   翻译 JSON
│   ├── components/             #   HTML 片段（header, footer）
│   ├── assets/                 #   图片 / 字体 / 文件
│   ├── demos/                  #   托管项目 Demo
│   ├── posts-index.json        #   ★ 文章索引（build.py 生成）
│   ├── projects.json           #   项目索引
│   ├── robots.txt
│   └── sitemap.xml
│
├── src/                        ← ★ 源文件（不部署）
│   └── styles/                 #   CSS 模块，build.py 读取
│       ├── reset.css
│       ├── variables.css
│       ├── typography.css
│       ├── layout.css
│       ├── components/         #   header.css, footer.css, card.css, ...
│       └── pages/              #   home.css, archive.css, about.css, ...
│
├── docs/                       ← 文档
├── nginx/
│   └── corrofea.conf           # Nginx 部署配置
├── scripts/
│   └── build.py                # 构建脚本
├── .gitignore
└── README.md
```
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

CSS 源文件在 `src/styles/` 下按模块编辑（14 个文件），`build.py` 将其合并为 `public/styles/bundle.css`。单文件一次请求即可加载全部样式，无 `@import` 依赖链。

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
