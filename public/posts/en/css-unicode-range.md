---
title: CSS unicode-range: Making Chinese and English Use Different Fonts Automatically
title_en: CSS unicode-range: Making Chinese and English Use Different Fonts Automatically
date: 2025-07-20
tags: ["CSS", "排版", "前端"]
summary: Using unicode-range to automatically switch fonts for mixed CJK and Latin text — no JavaScript needed.
summary_en: Using unicode-range to automatically switch fonts for mixed CJK and Latin text — no JavaScript needed.
draft: false
---

# CSS unicode-range: Making Chinese and English Use Different Fonts Automatically

> 2025.07.20 | CSS · Typography · Frontend

## The Starting Problem

Chinese websites have an eternal typography pain point: choosing fonts for Chinese and Latin characters is inherently conflicting.

- Chinese fonts (like Noto Serif SC) typically include Latin glyphs, but their Latin design is often less refined than dedicated Western typefaces
- Western fonts (like Georgia) usually don't include Chinese characters
- Using a single font for mixed CJK-Latin paragraphs always leaves some characters looking out of place

The traditional solution is JS-based character detection with `<span>` wrapping — but that's far too heavy.

## What Is unicode-range

The `@font-face` rule has an understated property: `unicode-range`. It specifies which Unicode character ranges a given font file covers.

```css
@font-face {
  font-family: 'MySerif';
  src: local('Georgia');
  unicode-range: U+0000-024F, U+1E00-1EFF; /* Latin */
}

@font-face {
  font-family: 'MySerif';
  src: local('Noto Serif SC');
  unicode-range: U+4E00-9FFF, U+3000-303F; /* CJK */
}
```

Then simply:

```css
body {
  font-family: 'MySerif', serif;
}
```

The browser automatically selects the right font based on each character's Unicode codepoint. Chinese gets Noto Serif SC, English gets Georgia — no JavaScript required.

## Details That Matter in Practice

### 1. Punctuation Assignment

Chinese quotes `「」` and English quotes `""` need to land in the correct ranges. Chinese punctuation is in `U+3000-303F` (CJK Symbols), English punctuation in `U+0000-024F` (Basic Latin).

```css
/* Add Chinese punctuation */
unicode-range: U+3000-303F, U+FF00-FFEF;
```

### 2. Numerals

Digits (`0-9`) fall under the Latin range. If you want numbers to use a specific monospaced or stylized font alongside Western text, separate them:

```css
unicode-range: U+0030-0039; /* digits only */
```

### 3. Multi-Font Composition

You can stack multiple `@font-face` declarations to build a full font stack. On this very blog:

```css
--font-heading: 'Cormorant Garamond', 'Noto Serif SC', serif;
```

Heading Latin text is handled by Cormorant Garamond, Chinese by Noto Serif SC — fully automatic, zero JavaScript.

## Browser unicode-range Strategy

Browsers use a clever strategy with `unicode-range`: they don't preload all declared font files. Instead, they parse the text content first and only download font files for the character ranges actually needed.

This is why declaring multiple large Chinese font files doesn't slow down first paint.

## A "Forgotten CSS Feature"?

`unicode-range` was standardized in CSS Fonts Module Level 3, but most developers seem unaware of it. Perhaps because CJK-Latin typesetting needs are less discussed in a Western-dominated CSS community.

But that's precisely why it deserves more attention in Chinese frontend circles.

---

*Good typography is like a good magic trick: the reader never notices the font switch.*
