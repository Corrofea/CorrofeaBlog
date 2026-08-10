# 用法手册 · 蚀羽 CorrofeaBlog

## 快速开始

```bash
cd CorrofeaBlog
python3 -m http.server 8080 -d public
# 浏览器打开 http://localhost:8080
```

## 文件结构速览

```
public/                         ← 部署目录（Nginx root）
├── index.html                  ← 首页（Hero + 仪表盘 + 文章）
├── post.html                   ← 文章详情（?slug=xxx）
├── archive.html                ← 归档 / tags.html 标签
├── projects.html               ← 项目 / about.html 关于
├── 404.html / robots.txt / sitemap.xml
│
├── scripts/                    ← JS
│   ├── config.js               ←   ★ 站点配置（CDN、评论等）
│   ├── lib/                    ←   第三方库（marked.js, mermaid.js）
│   ├── utils/                  ←   核心模块（i18n, posts, router）
│   ├── components/             ←   组件（header, footer, theme, fortune, search）
│   └── main.js                 ←   总入口
│
├── styles/bundle.css           ← 合并版 CSS（build.py 生成）
├── data/
│   ├── posts-index.json        ← 文章索引（build.py 生成）
│   ├── projects.json           ← 项目数据
│   └── fortunes.json           ← ★ 签文数据池
├── posts/zh/  posts/en/        ← Markdown 文章
├── i18n/                       ← 翻译文件
├── components/                 ← HTML 片段（header, footer）
├── assets/                     ← 图片 / 字体 / 文件
└── demos/                      ← 托管项目 Demo

src/styles/                     ← CSS 源文件（分模块编辑，build.py 读取合并）
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

## 草稿

先把想法丢进 `drafts/`，随便写，不需要 YAML frontmatter。写完再一键转正。

```bash
cp drafts/TEMPLATE.md drafts/我的想法.md
```

草稿不会被部署（`drafts/` 已加入 `.gitignore`）。

### 转正

```bash
python3 scripts/new-post.py drafts/我的想法.md
```

也支持一键指定：

```bash
python3 scripts/new-post.py drafts/我的想法.md --slug my-post --tags "前端,Nginx" --date 2025-08-10
```

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

渲染后自动拼接完整路径，懒加载、自适应。支持点击放大灯箱预览。

## 管理签文

编辑 `public/data/fortunes.json`，按等级分组。每条签文包含：

```json
{
  "level": "大吉",
  "good": "宜：部署到生产环境",
  "bad": "忌：反复修改一行样式",
  "quote": "羽落无声，万物归位。今日代码如流水，一次通过。"
}
```

### 概率配置

编辑 `public/scripts/components/fortune.js`，找到 `WEIGHTS` 数组：

| 等级 | 权重 | 概率 |
|------|------|------|
| 大吉 | 5 | 5% |
| 中吉 | 10 | 10% |
| 小吉 | 20 | 20% |
| 中平 | 30 | 30% |
| 凶 | 25 | 25% |
| 大凶 | 10 | 10% |

调概率只需改权重数字，总和建议保持 100。

## 修改样式

编辑 `src/styles/` 下的分模块文件，然后：

```bash
python3 scripts/build.py   # 自动合并 → public/styles/bundle.css
```

### 配色

编辑 `src/styles/variables.css`，修改后重建。

### 字体

编辑 `src/styles/typography.css`，修改 `--font-heading` / `--font-body` / `--font-code` 变量。本地字体放入 `public/assets/fonts/`，添加 `@font-face` 声明即可。

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

## 文艺化表达一览

博客 UI 中使用的蚀羽主题文艺化表达。修改 `public/i18n/zh.json` 和 `public/i18n/en.json` 即可替换。

| 场景 | 中文 | 英文 |
|------|------|------|
| 首页无文章 | 羽毛还在生长…… | Feathers are still growing... |
| 文章加载中 | 羽笔蘸墨中…… | — |
| 404 页面 | 这片羽毛被风吹走了。 | — |
| 文章不存在（无 slug） | 羽落无声 | — |
| 文章不存在（索引无匹配） | 此羽未落 | — |
| 文章加载失败 | 这片羽毛被风吹散了。 | This feather was scattered by the wind. |
| JS 初始化异常 | 羽翼未丰 | — |
| 崩溃后提示 | 这片羽毛还未落下，请稍后再试。 | — |
| 归档无文章 | 时光还未留下痕迹。 | Time has left no trace yet. |
| 标签无标签 | 暂无标签。 | No tags yet. |
| 项目无项目 | 还没有项目展示。 | No projects to show yet. |
| 关于页格言 | 代码会过时，羽毛会风化，但蚀痕本身就是意义。 | Code becomes obsolete, feathers weather away, but the marks of erosion themselves carry meaning. |

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
