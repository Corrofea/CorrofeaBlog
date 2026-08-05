---
title: From Interactive Fiction to Deployment: A Tech Note on One Hundred Years of Solitude
title_en: From Interactive Fiction to Deployment: A Tech Note on One Hundred Years of Solitude
date: 2025-08-05
tags: ["前端", "Node.js", "部署"]
summary: Built an interactive fiction with Twine and documented the entire deployment journey.
summary_en: Built an interactive fiction with Twine and documented the entire deployment journey.
draft: false
---

# From Interactive Fiction to Deployment: A Tech Note on *One Hundred Years of Solitude*

> Written 2025.08.05 | Frontend · Node.js · Deployment

## Origins

I recently reread Márquez's *One Hundred Years of Solitude*. This time, a thought struck me: what if the Buendía family saga became an interactive narrative experience? Readers could wander through different eras of Macondo, touching the threads of fates destined to repeat.

Once the idea took hold, I couldn't let it go.

## Choosing the Tool

There are many interactive fiction tools — Ink, Twine, Ren'Py. I settled on Twine for one reason: it produces a pure HTML file, no runtime required, deployable anywhere.

For a personal blog, nothing beats the peace of mind that comes from "drop a file and it just works."

## Implementation

Twine uses the Harlowe story format. Each passage is essentially an HTML fragment, and navigation between passages uses `[[link text->target passage]]` syntax.

```javascript
// Embedding custom logic in Twine
<<set $hasReadManuscript = false>>
<<if $hasReadManuscript>>
  You recognize Melquíades' handwriting.
<<else>>
  These symbols mean nothing to you.
<<endif>>
```

The interesting part was deployment. I didn't want to expose the Twine editor to readers, so I wrote a simple post-processing script that strips Twine-specific markers from the generated HTML, leaving only the clean interactive logic.

## A Small Nginx Gotcha

After dropping the HTML onto Nginx, I noticed that passage navigation uses `#` anchors. Nginx doesn't log anything after `#` in access logs by default — it's client-side behavior. If you want to track reading paths, you need to send events manually from JavaScript.

## Closing Thoughts

Interactive fiction and blogging share an essential similarity: both construct a narrative space. The difference is that a blog's path is linear, while interactive fiction's path is a web.

When readers get lost in Macondo's rain forest, they might come closer to Colonel Buendía's lived experience than any linear narrative could convey.

---

*Next: The "why" behind every Nginx configuration quirk*
