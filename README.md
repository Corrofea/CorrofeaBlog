# 蚀羽 · corrofea

> 羽落逢蚀 · 蚀羽版 — 被时间侵蚀的羽毛，个人技术博客

## 功能一览

- 🪶 **羽落占 · 片羽签** — 每日运势抽签，6 级概率，宜忌哲言
- 🔍 **搜索面板** — 标题/摘要/标签实时筛选 + 标签过滤 + 年份过滤
- 📖 **阅读进度条** — 页面顶部 2px 进度线
- 🖼️ **图片灯箱** — 点击放大，Esc / 点击背景关闭
- 📋 **代码复制** — 一键复制代码块，HTTP/HTTPS 双兼容
- 🌓 **深浅主题** — CSS 变量驱动，1.2s 平滑过渡
- 🌐 **中英双语** — 零刷新切换，数据内嵌
- 📂 **模块化 CSS** — `src/styles/` 分模块编辑，`build.py` 合并为单文件

## 文件架构

```
CorrofeaBlog/
├── public/                       ← ★ 唯一部署目录（Nginx root）
│   ├── index.html                   首页（仪表盘 + 抽签 + 搜索 + 文章）
│   ├── post.html                    文章详情（?slug=xxx 加载 MD）
│   ├── about.html                   关于
│   ├── archive.html                 归档（按年份分组）
│   ├── tags.html                    标签（按标签聚合）
│   ├── projects.html                项目展示
│   ├── 404.html
│   ├── styles/bundle.css            合并版 CSS（build.py 生成）
│   ├── scripts/
│   │   ├── lib/                     marked.js, mermaid.js
│   │   ├── utils/                   i18n.js, posts.js, router.js, marked-setup.js
│   │   ├── components/              header.js, footer.js, theme.js, comments.js
│   │   │                            fortune.js, search.js
│   │   └── main.js                  ★ 总入口
│   ├── data/
│   │   ├── posts-index.json         文章索引（build.py 生成）
│   │   ├── projects.json            项目数据
│   │   └── fortunes.json            ★ 抽签签文数据池
│   ├── posts/zh/  posts/en/         Markdown 文章
│   ├── i18n/                        翻译 JSON（zh.json, en.json）
│   ├── components/                  HTML 片段（header, footer）
│   ├── assets/                      图片 / 字体 / 文件
│   ├── demos/                       托管项目 Demo
│   └── *.json *.xml *.txt           数据与配置
│
├── src/                           ← 源文件（不部署）
│   └── styles/                      CSS 分模块，build.py 读取合并
│       ├── reset.css, variables.css, typography.css, layout.css
│       ├── components/              header, footer, navbar, card, button
│       │                            post, fortune, search
│       └── pages/                   home, about, archive, tags, projects
│
├── docs/                          ← 文档
│   ├── architecture.md
│   ├── usage.md
│   └── features.md
├── nginx/                         ← 服务器配置
├── scripts/
│   ├── build.py                   ← 构建脚本（CSS 合并 + 文章索引）
│   └── new-post.py                ← 草稿转正
├── .gitignore
└── README.md
```

## 技术栈

纯静态 HTML/CSS/JS，无框架、无构建工具。唯一"构建"是 CSS 合并 + 文章索引生成。

- **Markdown + YAML frontmatter**：元数据跟随文章，`build.py` 自动生成索引
- **国际化**：数据内嵌 HTML，一键切换无刷新
- **主题**：CSS 变量驱动深浅色，1.2s 平滑过渡
- **数据驱动**：文章、项目、签文全部 JSON/Markdown 管理

## 本地预览

```bash
python3 -m http.server 8080 -d public
```

## 写文章

```bash
# 1. 创建 .md 文件（带 YAML 头部）
#    public/posts/zh/my-post.md
#    public/posts/en/my-post.md

# 2. 构建
python3 scripts/build.py

# 3. 预览
python3 -m http.server 8080 -d public
```

详见 [docs/usage.md](docs/usage.md)。

## 修改样式

编辑 `src/styles/` 下的 CSS 模块，然后：

```bash
python3 scripts/build.py   # 自动合并 → public/styles/bundle.css
```

## 管理签文

编辑 `public/data/fortunes.json`，按等级分组，每条包含 `good`（宜）、`bad`（忌）、`quote`（哲言）。

概率调整见 `public/scripts/components/fortune.js` 中的 `WEIGHTS` 数组。

## 部署

```bash
# 只传 public/ 目录
rsync -avz public/ user@server:/var/www/corrofea/public/

# Nginx
sudo cp nginx/corrofea.conf /etc/nginx/sites-available/corrofea
sudo ln -s /etc/nginx/sites-available/corrofea /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## License

MIT
