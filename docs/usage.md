# 用法手册 . 蚀羽 CorrofeaBlog

## 快速开始

```bash
cd CorrofeaBlog
python3 -m http.server 8080 -d public
# 浏览器打开 http://localhost:8080
```

## 文件结构速览

```
public/                     ← 部署目录（Nginx root）
├── index.html              ← 首页
├── post.html               ← 文章详情（?slug=xxx）
├── archive.html            ← 归档 / tags.html 标签 / projects.html 项目
├── about.html / 404.html
├── robots.txt / sitemap.xml
│
├── scripts/                ← JS
│   ├── config.js           ←   ★ 站点配置（CDN、评论等，改这里）
│   ├── lib/                ←   第三方库（marked.js）
│   ├── utils/              ←   核心模块（i18n, posts, router）
│   ├── components/         ←   组件逻辑（header, footer, theme）
│   └── main.js             ←   总入口
│
├── styles/bundle.css       ← 合并版 CSS（build.py 生成）
├── posts/zh/  posts/en/    ← Markdown 文章
├── data/                   ← JSON 数据（build.py 生成）
│   ├── posts-index.json
│   └── projects.json
├── i18n/                   ← 翻译文件
├── components/             ← HTML 片段（header, footer）
├── assets/                 ← 图片 / 字体 / 文件
└── demos/                  ← 托管项目 Demo

src/styles/                 ← CSS 源文件（分模块编辑，build.py 读取合并）
```

## 写文章

### 3 步发布

**1. 创建 .md 文件**

`public/posts/zh/my-post.md` 和 `public/posts/en/my-post.md`：

```markdown
---
title: 文章标题
title_en: Post Title
date: 2025-08-10
tags: [前端, JavaScript]
summary: 一句话摘要，首页卡片显示。
summary_en: One-line summary.
draft: false
---

正文内容（Markdown）……
```

中英文各一份，文件名（不含 `.md`）即 slug，用于 URL。

**2. 运行构建**

```bash
python3 scripts/build.py
```

自动完成：
- 扫描 `public/posts/zh/` 和 `public/posts/en/`，解析 YAML frontmatter
- 生成 `public/data/posts-index.json`
- 向 `public/index.html` 和 `public/post.html` 注入 `__POSTS__`
- 合并 `src/styles/` → `public/styles/bundle.css`

**3. 预览 / 部署**

```bash
python3 -m http.server 8080 -d public        # 本地预览
rsync -avz public/ user@server:/var/www/corrofea/public/   # 部署
```

### YAML frontmatter 字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 中文标题 |
| `title_en` | 否 | 英文标题（缺则回退中文） |
| `date` | 是 | `YYYY-MM-DD`，排序与显示 |
| `tags` | 否 | `[标签1, 标签2]` |
| `summary` | 否 | 中文摘要，首页卡片 |
| `summary_en` | 否 | 英文摘要 |
| `draft` | 否 | `true` 隐藏，`false` 公开（默认 false） |

## 插入图片

将图片放入文章对应目录：

```
public/assets/images/blog/{slug}/
├── cover.jpg
└── screenshot.png
```

Markdown 中用文件名引用：

```markdown
![封面](cover.jpg)
![截图](screenshot.png)
```

渲染后自动拼接完整路径，懒加载、自适应。

**CDN 切换**：编辑 `public/scripts/config.js`，改一行：

```javascript
imageBase: '/assets/images/blog',          // 本地
imageBase: 'https://your-cdn.com/blog',   // CDN（将来启用时）
```

三种路径写法：

| Markdown | 解析 |
|----------|------|
| `![图](photo.png)` | `{imageBase}/{slug}/photo.png` |
| `![图](/common/logo.png)` | `{imageBase}/common/logo.png` |
| `![图](https://cdn.io/x.jpg)` | 原样保留 |

## 添加项目

编辑 `public/data/projects.json`：

```json
{
  "slug": "my-game",
  "title": { "zh": "游戏名", "en": "Game" },
  "description": { "zh": "描述", "en": "Desc" },
  "tech": ["Canvas", "JS"],
  "github": "https://github.com/xxx",
  "demo": "/demos/my-game/",
  "type": "game",
  "featured": true
}
```

| 字段 | 说明 |
|------|------|
| `type` | `game` / `tool` / `library` / `website` / `other` |
| `featured` | `true` 排最前 |
| `demo` | 托管 Demo 路径或外部 URL |

## 修改样式

编辑 `src/styles/` 下的分模块文件，然后：

```bash
python3 scripts/build.py   # 自动合并 → public/styles/bundle.css
```

### 配色

编辑 `src/styles/variables.css`，修改后重建。

### 字体

编辑 `src/styles/typography.css`，修改 `--font-heading` / `--font-body` / `--font-code` 变量。本地字体放入 `public/assets/fonts/`，添加 `@font-face` 声明即可。

## CDN 与站点配置

编辑 `public/scripts/config.js`：

```javascript
window.__CONFIG__ = {
  imageBase: '/assets/images/blog',   // 图片基础路径
  commentProvider: null,              // 后续接入 Giscus 时改为 'giscus'
};
```

## 部署

```bash
# 首次
rsync -avz public/ user@server:/var/www/corrofea/public/
sudo cp nginx/corrofea.conf /etc/nginx/sites-available/corrofea
sudo ln -s /etc/nginx/sites-available/corrofea /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 更新
rsync -avz public/ user@server:/var/www/corrofea/public/

# HTTPS
sudo certbot --nginx -d corrofea.com -d www.corrofea.com
```

## 扩展功能

### 评论系统

1. [Giscus](https://giscus.app/) 获取配置
2. 编辑 `public/scripts/config.js`：`commentProvider: 'giscus'`
3. 编辑 `public/scripts/components/comments.js`，取消注释填入参数

### 代码高亮

1. 放 `highlight.min.js` → `public/scripts/lib/`
2. 编辑 `public/scripts/utils/marked-setup.js`，配置 `marked.setOptions({ highlight: ... })`
3. 主题 CSS 加入 `src/styles/`，重建 bundle

### RSS / 搜索

基于 `public/data/posts-index.json` 实现，客户端 JS 即可。

## 常见问题

### 首页空白

- 必须用 `python3 -m http.server 8080 -d public`，不能双击打开 HTML
- Ctrl+Shift+R 强制刷新清除缓存

### 文章详情页显示「此羽未落」

- 检查 YAML frontmatter 格式是否正确（`---` 开头和结尾）
- 运行 `python3 scripts/build.py` 重建索引
- 检查 URL：`post.html?slug=文件名`（不含 `.md`）

### .md 文件已放好但首页不显示

1. 确认有 YAML frontmatter
2. `python3 scripts/build.py`
3. `draft` 不是 `true`

### bundle.css 修改不生效

强制刷新浏览器。生产环境 Nginx 缓存 7 天，部署后加 `?v=2` 参数强制刷新。
