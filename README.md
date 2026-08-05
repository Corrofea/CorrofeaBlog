# 蚀羽 · corrofea

> 白夜書簡 · 蚀羽版 — 被时间侵蚀的羽毛，个人技术博客

## 技术栈

纯静态 HTML/CSS/JS，无框架，无构建工具。

- **Markdown 撰写**：文章放在 `posts/{zh,en}/` 下，在 `posts-index.json` 登记元数据即自动上线
- **国际化**：JS 驱动的一键中英切换，无页面刷新
- **主题**：浅色/深色双模式，CSS 变量 + 1.2s 平滑过渡
- **部署**：任意静态服务器，Nginx 配置见 `nginx/` 目录

## 目录结构

```
├── index.html           # 首页
├── post.html            # 文章详情（?slug=xxx）
├── about.html           # 关于页
├── archive.html         # 归档页
├── tags.html            # 标签页
├── posts/               # Markdown 博客文章
│   ├── zh/              # 中文文章
│   └── en/              # 英文文章
├── posts-index.json     # 文章索引
├── styles/              # CSS 源文件（分模块编辑）
│   └── bundle.css       # ★ 线上使用的合并文件
├── scripts/             # JavaScript
├── i18n/                # 翻译文件
├── components/          # 共享 HTML 片段
├── assets/              # 图片、字体、文件
├── nginx/               # Nginx 配置
└── robots.txt / sitemap.xml
```

## 写文章

1. 在 `posts/zh/` 和 `posts/en/` 下创建同名 `.md` 文件（如 `my-post.md`）
2. 在 `posts-index.json` 中添加条目：

```json
{
  "slug": "my-post",
  "title": { "zh": "文章标题", "en": "Post Title" },
  "date": "2025-08-05",
  "tags": ["标签1", "标签2"],
  "summary": { "zh": "摘要", "en": "Summary" },
  "draft": false
}
```

3. 部署 → 自动生效

## 修改样式

CSS 源文件在 `styles/` 下按模块拆分（`variables.css`, `typography.css`, `components/*.css`, `pages/*.css`）。修改后需要重新生成合并文件：

```bash
# 合并所有 CSS → bundle.css
cd styles
cat reset.css variables.css typography.css layout.css \
    components/header.css components/footer.css components/navbar.css \
    components/card.css components/button.css components/post.css \
    pages/home.css pages/archive.css pages/projects.css pages/about.css \
    > bundle.css
```

页面引用的是 `styles/bundle.css`，单个文件无 `@import` 链，加载稳定可靠。

## 部署

```bash
# 复制到服务器
scp -r ./* user@server:/var/www/corrofea/

# Nginx
sudo cp nginx/corrofea.conf /etc/nginx/sites-available/corrofea
sudo ln -s /etc/nginx/sites-available/corrofea /etc/nginx/sites-enabled/
sudo nginx -t && sudo nginx -s reload
```

## 本地预览

```bash
cd CorrofeaBlog
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 后续扩展

- [ ] 评论系统（`scripts/components/comments.js` 预留了接口，接入 Giscus 即可）
- [ ] 代码高亮（在 `scripts/lib/` 添加 highlight.js 并在 `marked-setup.js` 配置）
- [ ] RSS 订阅（基于 `posts-index.json` 生成）
- [ ] 搜索（客户端 JS，基于 `posts-index.json`）
- [ ] 本地字体库（替换 `styles/typography.css` 中的 Google Fonts）

## License

MIT
