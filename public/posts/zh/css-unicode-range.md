---
title: CSS 中的 unicode-range：让中英文自动用不同字体
title_en: CSS unicode-range: Making Chinese and English Use Different Fonts Automatically
date: 2025-07-20
tags: ["CSS", "排版", "前端"]
summary: 利用 unicode-range 实现中英文混排时自动切换字体，无需 JS。
summary_en: Using unicode-range to automatically switch fonts for mixed CJK and Latin text — no JavaScript needed.
draft: false
---

# CSS 中的 unicode-range：让中英文自动用不同字体

> 2025.07.20 | CSS · 排版 · 前端

## 问题的起点

中文网页有一个永恒的排版痛点：中文字体和英文字体的选择是冲突的。

- 中文字体（如 Noto Serif SC）通常也包含拉丁字符，但设计上往往不如专门的西文字体好看
- 西文字体（如 Georgia）通常不包含中文字符
- 如果在中英文混合段落中统一使用一种字体，总会有一部分文字看起来不对劲

传统的解决方案是用 JS 检测字符然后包裹 `<span>` 标签——但这样做太重了。

## unicode-range 是什么

`@font-face` 规则中有一个不太起眼的属性：`unicode-range`。它指定了该字体文件覆盖的 Unicode 字符范围。

```css
@font-face {
  font-family: 'MySerif';
  src: local('Georgia');
  unicode-range: U+0000-024F, U+1E00-1EFF; /* 拉丁字符 */
}

@font-face {
  font-family: 'MySerif';
  src: local('Noto Serif SC');
  unicode-range: U+4E00-9FFF, U+3000-303F; /* CJK 字符 */
}
```

然后只需要：

```css
body {
  font-family: 'MySerif', serif;
}
```

浏览器会自动根据每个字符的 Unicode 码点选择合适的字体文件。中文用 Noto Serif SC，英文用 Georgia，完全不需要 JS。

## 实际应用中的细节

### 1. 标点符号归属

中文引号 `「」` 和英文引号 `""` 需要分到正确的范围。中文标点在 `U+3000-303F`（CJK 符号和标点），英文标点在 `U+0000-024F`（基本拉丁）。

```css
/* 补充中文标点 */
unicode-range: U+3000-303F, U+FF00-FFEF;
```

### 2. 数字的处理

数字（`0-9`）在拉丁范围内。如果你希望数字和西文一起使用某种等宽或风格化的字体，可以把它们分出来：

```css
unicode-range: U+0030-0039; /* 仅数字 */
```

### 3. 多个字体组合

你可以叠加多个 `@font-face` 声明，构建完整的字体栈。在我的博客（你现在正在看的这个）中：

```css
--font-heading: 'Cormorant Garamond', 'Noto Serif SC', serif;
```

其中标题的西文部分由 Cormorant Garamond 处理，中文部分由 Noto Serif SC 处理，完全自动，零 JS。

## 浏览器的 unicode-range 策略

浏览器在处理 `unicode-range` 时使用了一种聪明的策略：它不会预加载所有声明的字体文件，而是先解析文本内容，只下载实际需要的字符范围的字体。

这就是为什么即使声明了多个大体积的中文字体，首屏加载也不会被拖慢。

## 这算不算"被遗忘的 CSS 特性"

`unicode-range` 在 CSS Fonts Module Level 3 中就已经标准化了，但大多数开发者似乎并不了解它的存在。可能是因为中英文混排的需求在西文主导的 CSS 社区中讨论较少。

但这恰恰是它应该在中文前端圈被广泛传播的原因。

---

*一个好的排版，读者不会注意到字体切换，正如一个好的魔术。*
