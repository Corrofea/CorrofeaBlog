---
title: Taming Nginx on a Server and Why You Get 403
title_en: Taming Nginx on a Server and Why You Get 403
date: 2025-08-02
tags: ["Linux", "Nginx", "运维"]
summary: From file permissions to SELinux — a complete debugging journey of the dreaded Nginx 403.
summary_en: From file permissions to SELinux — a complete debugging journey of the dreaded Nginx 403.
draft: false
---

# Taming Nginx on a Server and Why You Get 403

> 2025.08.02 | Linux · Nginx · DevOps

## How It Starts

`403 Forbidden`.

These three words are the welcome gift that every first-time Nginx user receives. You've put the files in the right place, the path is correct, you've reloaded the config — and it still won't serve them.

This post documents a complete Nginx 403 debugging journey, from shallow to deep.

## Layer 1: File Permissions

```bash
ls -la /var/www/blog/
```

Nginx worker processes typically run as `www-data` (Debian/Ubuntu) or `nginx` (CentOS/RHEL). If your files are owned by `root:root` with `600` permissions, Nginx can't read them at all.

**Fix**:
```bash
chown -R www-data:www-data /var/www/blog/
chmod -R 755 /var/www/blog/
```

## Layer 2: Directory Execute Permission

Many don't realize: the `x` (execute) permission on a Linux directory means "can enter." Even if a file itself is readable, you'll get 403 if any parent directory lacks `x` permission for the Nginx user.

```
/home/user/blog/   ← this directory must have x for Nginx
```

## Layer 3: SELinux

If you're on CentOS/RHEL and didn't immediately disable SELinux (good for you), you need to handle SELinux contexts:

```bash
ls -Z /var/www/blog/
chcon -R -t httpd_sys_content_t /var/www/blog/
```

Or the more robust approach:
```bash
semanage fcontext -a -t httpd_sys_content_t "/var/www/blog(/.*)?"
restorecon -R /var/www/blog/
```

## Layer 4: The index Directive

In your Nginx config:

```nginx
location / {
    index index.html index.htm;
}
```

If you request a directory without specifying an `index` file and without enabling `autoindex`, Nginx returns 403. This is actually a security feature — don't list directory contents.

## Layer 5: The try_files Trap

```nginx
location / {
    try_files $uri $uri/ =404;
}
```

This looks harmless, but if your URL is a directory without a trailing `/`, Nginx tries `$uri/` and looks for an index file. Not found? 403.

## Summary

Nginx 403 is essentially layers of security gates. Whenever you think "it should be able to access this," trace one layer up:

```
File permissions → directory x → SELinux context → index/try_files config
```

Pass all four layers, and your page will be served.

---

*Never use `chmod 777` to solve permission problems.*
