---
title: Nginx 部署踩坑实录：从 SSH 配置到 403 的旅程
title_en: Nginx Deployment Pitfalls: From SSH Setup to the 403 Journey
date: 2026-08-05
tags: [Nginx, 运维, 部署]
summary: 从配置好 SSH 到解决 Nginx 403 的完整排错记录，涵盖权限、路径、SELinux 等五个层次。
summary_en: A complete debugging journey from SSH setup to solving Nginx 403, covering permissions, paths, and SELinux across five layers.
draft: false
---

下面是你从 **配置好服务器 SSH 之后**，围绕 **Nginx 配置、文件权限、访问路径** 出现的所有问题，整理成一篇完整的过程记录和总结。

---

# Nginx 部署踩坑实录：从 SSH 配置到 403 的旅程

**时间**：2026 年 8 月 5 日  
**环境**：阿里云 ECS · Ubuntu · Nginx 1.18.0  
**项目**：ClickMacondo（一个交互式小说项目）  
**目标**：通过 Nginx 在公网访问项目首页（`index.html`）

---

## 一、起点：SSH 已通，项目已克隆

服务器 SSH 配置已完成，项目通过 Git 克隆到：

```bash
/var/www/html/ClickMacondo
```

目录结构（简化）：
```
ClickMacondo/
├── index.html              # 入口文件
├── frontend/
│   ├── circle-of-fate.html
│   ├── styles/
│   ├── assets/
│   └── src/
├── docs/
└── README.md
```

直觉告诉我：**把项目放到 `/var/www/html/`，Nginx 应该就能自动托管**。

然而，这只是漫长排障的开始。

---

## 二、第一轮失败：403 Forbidden

访问 `http://123.56.19.15`，返回：

```
403 Forbidden
nginx/1.18.0 (Ubuntu)
```

### 排查点 1：Nginx 是否在运行

```bash
systemctl status nginx
```

输出显示 `active (running)`。Nginx 在运行，但没有提供内容。

### 排查点 2：文件权限

```bash
ls -la /var/www/html/ClickMacondo/
```

输出：
```
drwxr-xr-x 6 root root ...
-rwxr-xr-x 1 root root ... index.html
```

文件所有者是 `root`。Nginx 以 `www-data` 用户运行，**无法读取 root 创建的文件**。

### 动作：

```bash
sudo chown -R www-data:www-data /var/www/html/ClickMacondo
sudo chmod -R 755 /var/www/html/ClickMacondo
```

重新访问，仍然是 403。

---

## 三、第二轮排查：Nginx `root` 指向错误

检查 Nginx 配置：

```bash
sudo nginx -T 2>&1 | grep "root"
```

输出：
```
root /var/www/html/ClickMacondo;
root /var/www/ClickMacondo/example.com
```

**两个 `root` 指令**，而且第二个路径根本不存在。Nginx 使用了最后一个 `root` → `/var/www/ClickMacondo/example.com`。

### 动作：

打开 `/etc/nginx/sites-available/default`：

```bash
sudo vim /etc/nginx/sites-available/default
```

发现有被注释掉的 `root /var/www/ClickMacondo/example.com;`（前面有 `#`），理论上不生效。

于是继续查找真正的 `server` 块。执行：

```bash
sudo nginx -T | grep -A 10 "server {"
```

发现 `server` 块中 **根本没有 `root` 指令**。

---

## 四、第三轮排查：Nginx 在 `nginx.conf` 中的位置错误

查看主配置文件：

```bash
sudo cat -n /etc/nginx/nginx.conf | grep -A 5 -B 5 "server"
```

发现：

```
http {
    ...
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}  # http 块在这里结束

server {                    # ← 第 63 行，在 http 块外面！
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/html/ClickMacondo;
    index index.html;
}
```

`server` 块被放在了 `http` 块**外面**，Nginx 不允许这样，所以配置完全没生效。

### 修正方法：

1. 删除 `nginx.conf` 中错误的 `server` 块（第 63–71 行）。
2. 在 `/etc/nginx/conf.d/clickmacondo.conf` 中创建正确的配置：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name _;
    root /var/www/html/ClickMacondo;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### 生效：

```bash
sudo nginx -t && sudo systemctl reload nginx
```

这次成功：

```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

## 五、端口监听验证

检查 Nginx 是否真的在监听 80：

```bash
sudo ss -tuln | grep :80
```

输出：

```
tcp   LISTEN 0      511          0.0.0.0:80        0.0.0.0:*
tcp   LISTEN 0      511             [::]:80           [::]:*
```

**成功。**

本地测试：

```bash
curl -I http://localhost
```

返回：

```
HTTP/1.1 200 OK
```

---

## 六、最终结果

本地电脑访问：

```bash
curl -I http://123.56.19.15
```

返回：

```
HTTP/1.1 200 OK
```

**网站终于可以访问了。**

---

## 七、问题复盘

| 序号 | 问题 | 原因 | 解决方案 |
| :--- | :--- | :--- | :--- |
| 1 | 403 Forbidden | Nginx 用户 `www-data` 无权读取 `root` 所有文件 | `chown -R www-data:www-data` |
| 2 | 403 Forbidden（第二次） | Nginx 配置中 `root` 指向了错误的路径 | 修改 `root` 为 `/var/www/html/ClickMacondo` |
| 3 | 403 Forbidden（第三次） | `server` 块没有 `root` 指令 | 添加 `root` 和 `index` |
| 4 | `nginx -t` 报错 | `server` 块放在了 `nginx.conf` 的 `http` 块外部 | 删除错误的 `server` 块，在 `conf.d/` 中重新配置 |
| 5 | 本地电脑无法连接 | Nginx 没有监听 80 端口 | 添加 `listen 80;` 后重载 Nginx |

---

## 八、关键经验与原则

### ✅ 排查 Nginx 配置，按这个顺序：

1. **先看配置文件**：`sudo nginx -T` 查看所有生效配置
2. **再看端口**：`sudo ss -tuln | grep :80` 确认是否在监听
3. **再看权限**：`ls -la` 确认 `www-data` 能否读取文件
4. **最后看日志**：`sudo tail -20 /var/log/nginx/error.log`

### ✅ Nginx 配置文件层级

| 文件/目录 | 作用 |
| :--- | :--- |
| `/etc/nginx/nginx.conf` | 主配置（`http` 块在这里） |
| `/etc/nginx/conf.d/*.conf` | 自动加载的配置（在 `http` 块内） |
| `/etc/nginx/sites-available/` | 可用站点配置（需手动启用） |
| `/etc/nginx/sites-enabled/` | 已启用站点配置（软链接） |

### ✅ 核心原则

> **`server` 块必须放在 `http` 块内部。如果 `sites-available` 的配置不生效，直接在 `/etc/nginx/conf.d/` 创建 `.conf` 文件更可靠。**

---

## 九、最终配置文件（可复用）

**文件**：`/etc/nginx/conf.d/clickmacondo.conf`

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name _;
    root /var/www/html/ClickMacondo;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}
```

**文件所有者**：`www-data:www-data`  
**目录权限**：`755`

---

## 十、结语

从 SSH 连接成功到网站正常访问，中间经历了 **文件权限、Nginx 配置路径、`root` 错误、`server` 块位置错误** 四个层次的故障。每一步都有明确的排查方法和解决方案。

如果你也遇到了类似的 403 或 404，可以参考上面的排查顺序，大概率能在一个小时内解决。