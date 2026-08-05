# The Trials of ICP Filing for a Personal Blog

> 2025.07.15 | Blog · DevOps · ICP Filing

## Why a Personal Blog Needs ICP Filing

In mainland China, any website using a domestic server with a bound domain name requires ICP (Internet Content Provider) filing. This includes personal blogs hosted on Alibaba Cloud or Tencent Cloud.

If you use an overseas server, technically you don't need filing, but access speed and stability will suffer. Since my readers are primarily in China, I decided to go through the proper process.

## Process Overview

The entire filing process has three main stages:

### Stage 1: Provider Review (1–3 days)

Submit materials through your cloud provider's filing system:
- Front and back of your ID card
- A photo of you holding your ID card
- Domain certificate
- Website filing authenticity verification form

The easiest pitfall here: **photo requirements**. The "holding ID card" photo must clearly show the text on the ID, with no face obstructions. Shoot in natural light, no beauty filters.

### Stage 2: Provincial Regulator Review (7–20 business days)

Once the provider approves, materials are submitted to the provincial communications administration. All you can do at this stage is wait. There is no way to accelerate it.

During review, the domain must not resolve to the server. Your website stays at 404 until filing is approved.

### Stage 3: Public Security Filing (within 30 days of approval)

After receiving your ICP number, you must also complete public security bureau filing. Many people miss this step, but under the *Computer Information Network and Internet Security Protection Regulations*, failure to comply can result in warnings or even fines.

## Pitfalls I Encountered

1. **Domain real-name verification**: Before filing, your domain must complete real-name verification. `.com` domains typically verify instantly after purchase, but `.cn` domains require uploaded ID review — this time difference can cost you an extra day.

2. **Site name restrictions**: My first attempt — "蚀羽 · Tech Notes" — was rejected. Personal filing site names must avoid sensitive terms. I eventually used "蚀羽的个人空间."

3. **Don't touch server config during review**: If you change your server IP or switch hosts during the regulator review, your filing gets bounced back to square one. I made this exact mistake — migrated my server out of boredom and had to start over.

4. **"Interactive service" checkbox in public security filing**: If your blog has comments, you must check "interactive service." No comments? Select "non-interactive." For personal blogs, I strongly recommend non-interactive to reduce review complexity.

## Timeline

```
Day  1 : Submitted to provider for initial review
Day  3 : Initial review passed, submitted to provincial regulator
Day 14 : Regulator approved, ICP number issued
Day 16 : Public security filing completed
```

About two and a half weeks total — faster than expected.

## After Getting Your ICP Number

Once approved, you must place the ICP number in your site footer, linked to the MIIT filing lookup site:

```html
<a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">
  粤ICP备XXXXXXXX号
</a>
```

Plus the public security bureau icon and number. These are mandatory — none can be omitted.

---

*The biggest cost of ICP filing isn't the time — it's the uncertainty during the wait.*
