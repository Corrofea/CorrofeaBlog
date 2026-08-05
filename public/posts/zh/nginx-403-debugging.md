---
title: 如何在服务器上折腾 Nginx 以及为什么会 403
title_en: Taming Nginx on a Server and Why You Get 403
date: 2025-08-02
tags: ["Linux", "Nginx", "运维"]
summary: 从文件权限到 SELinux，一次 Nginx 403 排错的完整记录。
summary_en: From file permissions to SELinux — a complete debugging journey of the dreaded Nginx 403.
draft: false
---

# 如何在服务器上折腾 Nginx 以及为什么会 403

> 2025.08.02 | Linux · Nginx · 运维

## 故事的开始

`403 Forbidden`。

屏幕上这三个单词，是每一个第一次配 Nginx 的人都会收到的欢迎礼物。你明明把文件放进去了，路径也对，配置文件也 reload 了，但它就是不给看。

这篇文章记录一次完整的 Nginx 403 排错过程，从最浅到最深。

## 第一层：文件权限

```bash
ls -la /var/www/blog/
```

Nginx 的 worker process 通常以 `www-data`（Debian/Ubuntu）或 `nginx`（CentOS/RHEL）用户运行。如果你的文件 owner 是 `root:root` 并且权限是 `600`，Nginx 根本读不到。

**修复**：
```bash
chown -R www-data:www-data /var/www/blog/
chmod -R 755 /var/www/blog/
```

## 第二层：目录的 x 权限

很多人不知道：Linux 目录的 `x`（执行）权限对于目录来说意味着"可以进入"。即使文件本身有读权限，如果它的上级目录没有 `x` 权限，你照样 403。

```
/home/user/blog/   ← 这个目录必须对 Nginx 有 x 权限
```

## 第三层：SELinux

如果你用的是 CentOS/RHEL，而且没有第一时间关掉 SELinux（这是对的），那么你还得处理 SELinux 上下文：

```bash
ls -Z /var/www/blog/
chcon -R -t httpd_sys_content_t /var/www/blog/
```

或者更稳妥的做法：
```bash
semanage fcontext -a -t httpd_sys_content_t "/var/www/blog(/.*)?"
restorecon -R /var/www/blog/
```

## 第四层：index 指令

Nginx 配置中：

```nginx
location / {
    index index.html index.htm;
}
```

如果你请求的是一个目录，但没有指定 `index` 文件，也没有开启 `autoindex`，Nginx 会返回 403。这其实是一个安全设计——不列出目录内容。

## 第五层：try_files 的陷阱

```nginx
location / {
    try_files $uri $uri/ =404;
}
```

这个配置看起来无害，但如果你的 URL 是一个目录且没有结尾的 `/`，Nginx 会尝试 `$uri/` 然后找 index 文件。找不到？403。

## 总结

Nginx 的 403 本质上是一层又一层的安全闸门。每当你觉得"它应该能访问啊"，就往上追一层：

```
文件权限 → 目录 x 权限 → SELinux 上下文 → index/try_files 配置
```

这四层全过了，你的页面就能被看到了。

---

*永远不要用 `777` 解决权限问题。*
