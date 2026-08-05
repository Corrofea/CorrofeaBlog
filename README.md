# 蚀羽 · corrofea

> 白夜书简 · 蚀羽版 — 被时间侵蚀的羽毛，个人技术博客

## 文件架构

```
CorrofeaBlog/
├── public/                  ← ★ 唯一部署目录（Nginx root）
│   ├── index.html              首页（数据内嵌，零 fetch）
│   ├── post.html               文章详情（?slug=xxx 加载 MD）
│   ├── about.html              关于 / archive.html 归档
│   ├── tags.html               标签 / projects.html 项目
│   ├── 404.html
│   ├── styles/bundle.css       合并版 CSS（build.py 生成）
│   ├── scripts/                JS（模块化）
│   ├── posts/zh/  posts/en/    Markdown 文章
│   ├── i18n/                   翻译 JSON
│   ├── components/             HTML 片段
│   ├── assets/                 图片 / 字体 / 文件
│   ├── demos/                  托管项目 Demo
│   └── *.json *.xml *.txt      数据与配置
│
├── src/                      ← 源文件（不部署）
│   └── styles/                  CSS 分模块，build.py 读取合并
│
├── docs/                     ← 文档
├── nginx/                    ← 服务器配置
├── scripts/
│   └── build.py              ← 构建脚本
├── .gitignore
└── README.md
```

## 技术栈

纯静态 HTML/CSS/JS，无框架。唯一"构建"是 CSS 合并 + 文章索引生成。

- **Markdown + YAML frontmatter**：元数据跟随文章，`build.py` 自动生成索引
- **国际化**：数据内嵌 HTML，一键切换无刷新
- **主题**：CSS 变量驱动深浅色，1.2s 平滑过渡

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
