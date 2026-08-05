# 用法手册 · 蚀羽 CorrofeaBlog

> 如何写文章、加项目、改样式、部署上线

## 快速开始

```bash
# 本地预览
cd CorrofeaBlog
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 写文章（优化版）

### 只需 3 步

**1. 创建 Markdown 文件（含 YAML 头部）**

在 `posts/zh/` 和 `posts/en/` 下各创建一个同名 `.md` 文件：

```markdown
---
title: 我的新文章标题
title_en: My New Post Title
date: 2025-08-10
tags: [前端, JavaScript]
summary: 一句话摘要，会显示在首页卡片上。
summary_en: One-line summary shown on the home page card.
draft: false
---

# 我的新文章标题

正文开始……
```

中英文各一份，`slug` 就是文件名（不含 `.md`）。

图片放在 `assets/images/blog/{slug}/`：

```markdown
![配图](my-new-post/screenshot.png)
```

**2. 运行构建脚本**

```bash
python3 scripts/build.py
```

这行命令自动完成三件事：
- 扫描 `posts/zh/` 和 `posts/en/` 下所有 `.md`，解析 YAML frontmatter
- 生成 `posts-index.json`
- 更新 `index.html` 中的 `window.__POSTS__` 数据
- 重新合并 `styles/bundle.css`

**3. 预览**

```bash
python3 -m http.server 8080
```

打开 `http://localhost:8080` 即可看到新文章。

### YAML frontmatter 字段说明

| 字段 | 说明 |
|------|------|
| `title` | 中文标题 |
| `title_en` | 英文标题 |
| `date` | `YYYY-MM-DD` 格式，用于排序和显示 |
| `tags` | 标签数组：`[前端, JavaScript]` |
| `summary` | 中文摘要，首页卡片显示 |
| `summary_en` | 英文摘要 |
| `draft` | `true` 时首页和归档隐藏，`false` 时公开 |

### 旧文章迁移

如果你的 `.md` 文件还没有 YAML frontmatter，运行：

```bash
python3 scripts/build.py
```

脚本会为缺少 frontmatter 的文件使用默认值（标题取自正文第一行 `#`）。

## 部署

上传后即生效——`post.html?slug=my-new-post` 自动加载对应 MD 文件。

### 首页预加载更新（重要）

如果你看到首页没有新文章，需要更新 `index.html` 中的 `window.__POSTS__` 数据。这是因为首页为了加载可靠性，文章列表数据是直接内嵌在 HTML 中的。

**方法**：在 `index.html` 中找到 `window.__POSTS__ = [...]` 这行，将 `posts-index.json` 的完整内容复制替换进去（推荐做法）。

或者写一个简单的脚本自动同步（未来可做）。

## 添加项目

编辑 `projects.json`：

```json
{
  "slug": "my-web-game",
  "title": { "zh": "我的网页游戏", "en": "My Web Game" },
  "description": {
    "zh": "一个基于 Canvas 的 roguelike 游戏。",
    "en": "A Canvas-based roguelike game."
  },
  "tech": ["HTML5 Canvas", "JavaScript"],
  "github": "https://github.com/corrofea/my-game",
  "demo": "/demos/my-web-game/",
  "type": "game",
  "featured": true
}
```

| 字段 | 说明 |
|------|------|
| `type` | `game` / `tool` / `library` / `website` / `other`，决定卡片上的类型徽章 |
| `featured` | `true` 时排在列表最前面 |
| `demo` | 如果项目托管在本站，填 `/demos/project-name/`；否则填外部 URL 或 `null` |

托管 Demo：把项目文件放入 `demos/` 目录，部署后即可通过 `/demos/project-name/` 访问。Nginx 已配置好 `/demos/` 路径。

## 修改样式

### 工作流

1. 编辑 `styles/` 下的分模块文件（`variables.css`, `typography.css`, `components/*.css`, `pages/*.css`）
2. 重新合并为 `bundle.css`：

```bash
cd styles
cat reset.css variables.css typography.css layout.css \
    components/header.css components/footer.css components/navbar.css \
    components/card.css components/button.css components/post.css \
    pages/home.css pages/archive.css pages/projects.css pages/about.css \
    > bundle.css
```

### 修改配色

编辑 `styles/variables.css`，修改 CSS 变量：

```css
:root, [data-theme="light"] {
  --color-bg:     #F9F7F4;   /* 浅色背景 */
  --color-text:   #2C2C2C;   /* 浅色正文 */
  --color-accent: #8B6F5C;   /* 强调色 */
  /* ... */
}
[data-theme="dark"] {
  --color-bg:     #1A1A1F;   /* 深色背景 */
  --color-text:   #E8E4DC;   /* 深色正文 */
  --color-accent: #B8A69A;   /* 强调色 */
  /* ... */
}
```

修改后重新合并 `bundle.css` 并部署。

### 修改字体

编辑 `styles/typography.css`：

```css
:root {
  --font-heading: "Your Heading Font", "Noto Serif SC", serif;
  --font-body:    "Your Body Font", "Georgia", serif;
  --font-code:    "Your Code Font", monospace;
}
```

如果要使用本地字体（不依赖 Google Fonts）：

1. 把字体文件放入 `assets/fonts/`
2. 在 `typography.css` 顶部添加 `@font-face` 声明
3. 修改 `--font-*` 变量使用本地字体名
4. 删除 HTML 中的 Google Fonts `<link>` 标签

## 添加新页面

1. 复制任一现有页面（如 `about.html`）作为模板
2. 修改内容区域
3. 在 `styles/pages/` 下创建对应 CSS 文件
4. 重新合并 `bundle.css`
5. 在 `scripts/main.js` 的 `switch(page)` 中添加 case
6. 在 `components/header.html` 导航栏中添加链接
7. 在 `i18n/zh.json` 和 `i18n/en.json` 中添加翻译

## 部署

### 首次部署

```bash
# 1. 上传文件到服务器
scp -r * user@your-server:/var/www/corrofea/

# 2. 配置 Nginx
sudo cp nginx/corrofea.conf /etc/nginx/sites-available/corrofea
sudo ln -s /etc/nginx/sites-available/corrofea /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 更新部署

```bash
# 增量上传
rsync -avz --delete ./ user@your-server:/var/www/corrofea/
```

### HTTPS（Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d corrofea.com -d www.corrofea.com
```

然后取消 `nginx/corrofea.conf` 中 HTTPS server block 的注释。

## 配置评论

1. 在 GitHub 仓库开启 Discussions
2. 安装 [Giscus](https://giscus.app/) 并获取配置
3. 编辑 `scripts/components/comments.js`，取消注释中的 Giscus 代码，填入你的参数
4. 部署

## 添加代码高亮

1. 下载 highlight.js 放到 `scripts/lib/highlight.min.js`
2. 下载主题 CSS 放到 `styles/highlight.css`，合并到 `bundle.css`
3. 编辑 `scripts/utils/marked-setup.js`，在 `marked.setOptions()` 中配置 highlight 回调

## 常见问题

### 首页打开空白

1. 确保用 `python3 -m http.server` 而非直接双击打开 HTML（`file://` 协议有限制）
2. 检查浏览器控制台是否有错误
3. 清除浏览器缓存（Ctrl+Shift+R 强制刷新）

### 修改了 posts-index.json 但首页不更新

运行 `python3 scripts/build.py` 即可同步 `index.html`。`posts-index.json` 由构建脚本自动生成，不应手动编辑。

### 添加了 .md 文件但首页不显示

1. 确认 .md 文件有正确的 YAML frontmatter（`---` 包裹的元数据）
2. 运行 `python3 scripts/build.py`
3. 确认 `draft: false`

### 文章详情页打不开

确保 URL 参数正确：`post.html?slug=xxx`，`xxx` 与 MD 文件名一致（不含 `.md`）。

### bundle.css 修改后不生效

清除浏览器缓存。生产环境 Nginx 配置了 CSS 7 天缓存，更新后可以用 `?v=2` 参数强制刷新，或等待缓存过期。
