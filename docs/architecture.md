# 架构说明 · 蚀羽 CorrofeaBlog

> 羽落逢蚀 · 蚀羽版 — 纯静态个人技术博客的文件架构、设计决策与数据流

## 设计原则

1. **零构建**：无框架、无打包工具，任何文本编辑器即可维护
2. **零网络依赖（首页）**：首页数据内嵌 HTML，不依赖 fetch
3. **数据驱动**：文章、项目、签文用 JSON/Markdown 管理，页面是通用模板
4. **分层清晰**：CSS 分模块 → 合并为单文件；JS 按职责拆分
5. **双语一等公民**：中英切换零刷新，所有内容字段支持双语

## 目录全景

```
CorrofeaBlog/
│
├── public/                        ← ★ Nginx root，唯一部署目录
│   ├── index.html                 #   首页：Hero + 仪表盘（搜索+抽签）+ 文章列表
│   ├── post.html                  #   文章详情：卡片布局 + 目录 + 灯箱 + 进度条
│   ├── about.html                 #   关于页
│   ├── archive.html               #   归档页（按年份分组）
│   ├── tags.html                  #   标签页（按标签聚合）
│   ├── projects.html              #   项目展示页
│   ├── 404.html
│   ├── styles/
│   │   └── bundle.css             #   ★ 合并版 CSS（build.py 生成）
│   ├── scripts/
│   │   ├── config.js              #   站点配置（CDN、评论）
│   │   ├── main.js                #   ★ 总入口（初始化编排 + 超时兜底）
│   │   ├── lib/
│   │   │   ├── marked.min.js      #   Markdown 解析器
│   │   │   └── mermaid.min.js     #   图表渲染
│   │   ├── utils/
│   │   │   ├── i18n.js            #   ★ 国际化引擎（数据内嵌优先，fetch 兜底）
│   │   │   ├── posts.js           #   ★ 文章加载器（同步/异步双模式）
│   │   │   ├── router.js          #   URL 参数解析 + 页面识别
│   │   │   └── marked-setup.js    #   marked 渲染配置
│   │   └── components/
│   │       ├── header.js          #   导航栏加载 + 语言/主题按钮
│   │       ├── footer.js          #   页脚加载
│   │       ├── theme.js           #   深浅主题切换
│   │       ├── comments.js        #   评论系统占位
│   │       ├── fortune.js         #   ★ 每日抽签（羽落占 → 片羽签）
│   │       └── search.js          #   ★ 搜索面板（实时筛选 + 标签/年份过滤）
│   ├── data/
│   │   ├── posts-index.json       #   ★ 文章索引（build.py 生成）
│   │   ├── projects.json          #   项目数据
│   │   └── fortunes.json          #   ★ 签文数据池（6 等级，各含宜忌哲言）
│   ├── posts/
│   │   ├── zh/*.md                #   中文文章
│   │   └── en/*.md                #   英文文章
│   ├── i18n/
│   │   ├── zh.json                #   中文翻译
│   │   └── en.json                #   英文翻译
│   ├── components/
│   │   ├── header.html            #   导航栏 HTML 片段
│   │   ├── footer.html            #   页脚 HTML 片段
│   │   └── comment-section.html   #   评论区 HTML 片段
│   ├── assets/images/             #   图片（avatar、博客配图）
│   ├── demos/                     #   托管项目 Demo
│   ├── robots.txt
│   └── sitemap.xml
│
├── src/                           ← ★ 源文件（不部署）
│   └── styles/
│       ├── reset.css              #   CSS Reset
│       ├── variables.css          #   设计变量（颜色、排版、间距）
│       ├── typography.css         #   排版基础（字体、标题、段落）
│       ├── layout.css             #   布局（容器、留白）
│       ├── components/
│       │   ├── header.css         #   导航栏样式
│       │   ├── footer.css         #   页脚样式
│       │   ├── navbar.css         #   导航菜单
│       │   ├── card.css           #   文章卡片
│       │   ├── button.css         #   按钮
│       │   ├── post.css           #   文章详情（卡片 + TOC + 灯箱 + 进度条）
│       │   ├── fortune.css        #   抽签卡片
│       │   └── search.css         #   搜索面板
│       └── pages/
│           ├── home.css           #   首页（Hero + 仪表盘双栏）
│           ├── about.css          #   关于页
│           ├── archive.css        #   归档页
│           ├── projects.css       #   项目页
│           └── tags.css           #   （标签页复用 archive 样式）
│
├── docs/
│   ├── architecture.md            #   本文
│   ├── usage.md                   #   用法手册
│   └── features.md                #   功能索引
├── nginx/
│   └── corrofea.conf              #   Nginx 部署配置
├── scripts/
│   ├── build.py                   #   构建脚本
│   └── new-post.py                #   草稿转正脚本
├── drafts/                        #   草稿目录（gitignored）
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
  ├── i18n.js   → init() → 读 __I18N__ → 同步完成
  ├── posts.js  → publishedSync() → 读 __POSTS__ → 同步返回
  ├── search.js → buildPanel(posts) → 插入搜索面板 HTML
  ├── fortune.js → render(container) → 读 localStorage → 渲染抽签卡片
  │
  └── renderPostList() → 即时渲染文章卡片
```

零网络请求，打开即显示。所有数据已内嵌在 HTML 中。

### 抽签数据流

```
首页加载
  → Fortune.render(container)
    → localStorage 检查今日日期
    ├── 已有今日签文 → 直接渲染「片羽签」结果
    └── 无今日签文 → 渲染「羽落占」按钮
        → 用户点击
          → fetch('data/fortunes.json') 加载签文库
          → 加权随机选等级 + 从该等级随机选签文
          → 存入 localStorage（日期锁定）
          → 渲染结果（§ 等级 § + 哲言 + 宜忌 + 日期）
```

签文数据首次使用时才 fetch，之后缓存于内存。

### 搜索数据流

```
首页加载
  → Search.buildPanel(posts) → 读取标签列表和年份列表 → 构建面板 HTML
  → Search.bindEvents(langFn)
    → 输入：200ms 防抖 → doSearch()
    → 标签点击：切换激活 → doSearch()
    → 年份点击：切换激活 → doSearch()
    → doSearch() → 文本匹配 + 标签过滤 + 年份过滤 → 渲染结果卡片
```

纯客户端搜索，基于 `window.__POSTS__` 预加载数据，无需网络请求。

### 语言切换

```
用户点击语言按钮
  → I18n.toggle()
    → switchLang()
      → 读 window.__I18N__[target] （同步）
      → apply() → 遍历 [data-i18n] 替换文本
      → 派发 'language-changed' 事件
        → renderPostList() 用新语言重新渲染
        → Header.updateLangButton()
```

### 主题切换

```
用户点击 "☾"
  → Theme.toggle()
    → 设置 html[data-theme] = 相反值
    → localStorage 持久化
    → CSS 变量自动切换（1.2s transition）
    → 派发 'theme-changed' 事件
      → Fortune 更新等级文字颜色
      → Mermaid 重新渲染
```

## JS 模块职责边界

| 模块 | 职责 | 不负责 |
|------|------|--------|
| `i18n.js` | 翻译存储、获取、DOM 文本替换 | 页面渲染逻辑 |
| `posts.js` | 文章数据加载（同步/异步）、MD 渲染 | UI 构建 |
| `theme.js` | 主题状态管理、localStorage 持久化 | 样式定义 |
| `router.js` | URL 参数解析、页面识别 | 页面渲染 |
| `header.js` | 导航栏 DOM 注入 + 按钮事件绑定 | 导航数据结构 |
| `footer.js` | 页脚 DOM 注入 | 内容数据 |
| `search.js` | 搜索面板构建、实时筛选、结果渲染 | 文章数据加载 |
| `fortune.js` | 签文随机抽取、localStorage 日期锁定、卡片渲染 | 签文数据管理 |
| `main.js` | 初始化顺序编排 + 超时兜底 | 具体业务逻辑 |
| 页面内联脚本 | 页面特定渲染逻辑 | 跨页面共享 |

## 关键设计决策

### 为什么首页内嵌数据？

`fetch()` 没有默认超时，网络波动时请求可能挂起。首页作为入口，必须 100% 可靠。内嵌文章 JSON 约 3KB，换来绝对的加载可靠性。

### 为什么 CSS 合并为 bundle.css？

16 个 CSS 源文件分模块编辑，`build.py` 合并为单文件。一次请求加载全部样式，无 `@import` 依赖链。

### 为什么 localStorage 而非账号系统？

抽签系统用 `localStorage` 记录当日签文，无需注册登录。每个浏览器独立，清空缓存后当日可重抽。

### 为什么是 IIFE 而非 ES Module？

`<script type="module">` 是异步的，执行顺序不可控。IIFE 模式确保 `i18n.js` → `posts.js` → `main.js` 严格按序执行，各模块通过 `window.Xxx` 暴露。

### 抽签概率设计

权重总和 100，在 `fortune.js` 中定义：

| 等级 | 权重 | 概率 |
|------|------|------|
| 大吉 | 5 | 5% |
| 中吉 | 10 | 10% |
| 小吉 | 20 | 20% |
| 中平 | 30 | 30% |
| 凶 | 25 | 25% |
| 大凶 | 10 | 10% |

## 扩展点

| 功能 | 修改位置 | 方式 |
|------|---------|------|
| 评论系统 | `scripts/components/comments.js` | 替换为空实现，注入 Giscus/Waline |
| 代码高亮 | `scripts/lib/` + `marked-setup.js` | 放入 highlight.js，配置 marked renderer |
| 本地字体 | `styles/typography.css` | 添加 `@font-face`，替换 `--font-*` 变量 |
| RSS | 新建 `scripts/utils/rss.js` | 读取 `posts-index.json` 生成 XML |
| 新抽签等级 | `fortune.js` 的 `WEIGHTS` + `fortunes.json` | 加等级 + 权重 + 签文数据 |
| 新页面 | 新建 `xxx.html` + `styles/pages/xxx.css` | 复用 header/footer + i18n 引擎 |
