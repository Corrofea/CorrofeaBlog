# 功能索引 · 蚀羽 CorrofeaBlog

> 每个功能的全部关联文件一览。改功能前先查这张表，不会漏文件。

---

## 首页 Hero 首屏

全屏头像 + 大标题 + 副标题 + 浮动引导箭头（点击下翻）

| 角色 | 文件 |
|------|------|
| HTML | `public/index.html` |
| CSS | `src/styles/pages/home.css` |
| JS | `public/index.html`（内联 onclick） |
| 图片 | `public/assets/images/common/avatar.webp` |

---

## 仪表盘双栏

搜索面板（61.8%）+ 片羽签（38.2%），黄金分割比例

| 角色 | 文件 |
|------|------|
| HTML | `public/index.html` |
| CSS（布局）| `src/styles/pages/home.css` |
| CSS（搜索）| `src/styles/components/search.css` |
| CSS（抽签）| `src/styles/components/fortune.css` |

---

## 羽落占 · 片羽签（每日抽签）

每日首次可抽签，等级 + 哲言 + 宜忌，localStorage 日期锁定

| 角色 | 文件 |
|------|------|
| 签文数据 | `public/data/fortunes.json` |
| 抽签逻辑 | `public/scripts/components/fortune.js` |
| 卡片样式 | `src/styles/components/fortune.css` |
| 入口 | `public/index.html`（`#fortune-container` + initHome 调用） |

**编辑指南：**
- 加签文 → `fortunes.json`（按等级分组加条目）
- 调概率 → `fortune.js` 中的 `WEIGHTS` 数组
- 改样式 → `fortune.css`

---

## 搜索面板

实时搜索标题/摘要/标签，支持标签筛选 + 年份过滤

| 角色 | 文件 |
|------|------|
| 搜索逻辑 | `public/scripts/components/search.js` |
| 面板样式 | `src/styles/components/search.css` |
| 入口 | `public/index.html`（`#search-panel-container` + initHome 调用） |
| 数据源 | `window.__POSTS__`（build.py 内嵌） |

---

## 文章详情页

卡片式阅读 + 侧边目录 + Markdown 渲染

| 角色 | 文件 |
|------|------|
| HTML | `public/post.html` |
| CSS（卡片+目录+灯箱+进度条）| `src/styles/components/post.css` |
| 文章加载 | `public/scripts/utils/posts.js` |
| Markdown 渲染 | `public/scripts/lib/marked.min.js` |
| Mermaid 图表 | `public/scripts/lib/mermaid.min.js` |
| 文章数据 | `public/posts/zh/*.md`, `public/posts/en/*.md` |
| 数据索引 | `window.__POSTS__`（build.py 内嵌） |

---

## 代码复制

点击代码块右上角复制按钮，HTTP/HTTPS 双兼容

| 角色 | 文件 |
|------|------|
| HTML + JS | `public/post.html`（内联 `addCopyButtons` 函数） |
| CSS | `src/styles/components/post.css`（`.copy-btn`） |

---

## 图片灯箱

点击文章内图片 → 全屏深色遮罩放大预览

| 角色 | 文件 |
|------|------|
| HTML | `public/post.html`（`#lightbox` 遮罩层） |
| CSS | `src/styles/components/post.css`（`.lightbox`） |

---

## 阅读进度条

页面顶部 2px 进度线，基于全页滚动位置

| 角色 | 文件 |
|------|------|
| HTML | `public/post.html`（`#progress-bar`） |
| CSS | `src/styles/components/post.css`（`.progress-bar`） |

---

## 深浅主题切换

CSS 变量驱动，1.2s 平滑过渡，跟随系统偏好

| 角色 | 文件 |
|------|------|
| 主题逻辑 | `public/scripts/components/theme.js` |
| 设计变量 | `src/styles/variables.css` |
| 按钮 | `public/components/header.html` + `header.js` |

---

## 中英双语

零刷新切换，数据内嵌

| 角色 | 文件 |
|------|------|
| 引擎 | `public/scripts/utils/i18n.js` |
| 中文翻译 | `public/i18n/zh.json` |
| 英文翻译 | `public/i18n/en.json` |
| 内嵌数据 | `public/index.html`（`window.__I18N__`） |
| 语言按钮 | `public/components/header.html` + `header.js` |

---

## 文章归档

按年份分组展示

| 角色 | 文件 |
|------|------|
| HTML + JS | `public/archive.html`（内联 `renderArchive`） |
| CSS | `src/styles/pages/archive.css` |
| 数据 | `window.__POSTS__` + `Posts.published()` |

---

## 标签页

按标签聚合，展开标签下文章列表

| 角色 | 文件 |
|------|------|
| HTML + JS | `public/tags.html`（内联 `renderTags`） |
| CSS | 复用 `archive.css` |
| 数据 | `window.__POSTS__` + `Posts.allTags()` |

---

## 项目展示

项目卡片展示（GitHub 链接 + Demo 链接）

| 角色 | 文件 |
|------|------|
| HTML + JS | `public/projects.html`（内联 `renderProjects`） |
| CSS | `src/styles/pages/projects.css` |
| 数据 | `public/data/projects.json` |

---

## 关于页

个人介绍 + 格言 + GitHub 链接

| 角色 | 文件 |
|------|------|
| HTML + JS | `public/about.html`（内联 `renderAbout`） |
| CSS | `src/styles/pages/about.css` |
| 数据 | `window.__I18N__`（about 字段） |

---

## 导航栏

站点标识 + 导航链接 + 主题/语言按钮（首页浮于 Hero 之上）

| 角色 | 文件 |
|------|------|
| HTML | `public/components/header.html` |
| JS | `public/scripts/components/header.js` |
| CSS | `src/styles/components/header.css` |

---

## 页脚

版权行 + "羽落逢蚀" 标识

| 角色 | 文件 |
|------|------|
| HTML | `public/components/footer.html` |
| JS | `public/scripts/components/footer.js` |
| CSS | `src/styles/components/footer.css` |

---

## 构建脚本

CSS 合并 + 文章索引生成 + 数据内嵌注入 + 缓存版本号

| 角色 | 文件 |
|------|------|
| 脚本 | `scripts/build.py` |
| CSS 源文件 | `src/styles/`（16 个文件，按顺序合并） |
| 输出 | `public/styles/bundle.css` + `public/data/posts-index.json` + HTML 注入 |

---

## 设计变量

全站颜色、间距、字体等设计 token

| 角色 | 文件 |
|------|------|
| 变量定义 | `src/styles/variables.css` |
| 排版 | `src/styles/typography.css` |
| 布局 | `src/styles/layout.css` |
