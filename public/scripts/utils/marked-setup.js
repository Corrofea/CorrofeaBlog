/* ============================================
   Marked Setup — 白夜书简 · 蚀羽版
   配置 marked.js：图片路径(CDN-ready)、懒加载、代码高亮预留
   ============================================ */

var MarkedSetup = (function () {
  var _initialized = false;
  var _currentSlug = '';

  function init(slug) {
    if (_initialized) return;
    if (typeof marked === 'undefined') {
      console.warn('[MarkedSetup] marked.js not loaded yet.');
      return;
    }
    if (slug) _currentSlug = slug;

    var renderer = new marked.Renderer();
    var cfg = window.__CONFIG__ || {};
    var imageBase = cfg.imageBase || '/assets/images/blog';

    /* ---- 图片：CDN-ready + 懒加载 + 按 slug 分目录 ---- */
    renderer.image = function (href, title, text) {
      var src = href || '';
      // Full URL (http/https) → pass through (already CDN or external)
      if (src.indexOf('http://') === 0 || src.indexOf('https://') === 0) {
        // keep as-is
      }
      // Absolute path (/...) → prepend imageBase
      else if (src.indexOf('/') === 0) {
        src = imageBase + src;
      }
      // Relative path (image.png) → prepend imageBase/slug/
      else {
        src = imageBase + '/' + _currentSlug + '/' + src;
      }
      var titleAttr = title ? ' title="' + title + '"' : '';
      var altAttr = text ? ' alt="' + text + '"' : '';
      return '<img src="' + src + '"' + altAttr + titleAttr + ' loading="lazy" decoding="async" />';
    };

    /* ---- 链接：外部链接新窗口打开 ---- */
    renderer.link = function (href, title, text) {
      var isExternal = href && (href.indexOf('http://') === 0 || href.indexOf('https://') === 0);
      var target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      var titleAttr = title ? ' title="' + title + '"' : '';
      return '<a href="' + href + '"' + titleAttr + target + '>' + text + '</a>';
    };

    /* ---- 代码块：mermaid 图表 / 无高亮（后续接入 highlight.js 在此配置） ---- */
    var origCode = renderer.code.bind(renderer);
    renderer.code = function (code, lang, escaped) {
      if (lang === 'mermaid') {
        return '<pre class="mermaid">' + code + '</pre>';
      }
      return origCode(code, lang, escaped);
    };

    marked.setOptions({
      renderer: renderer,
      gfm: true,
      breaks: false,
      smartLists: true,
      smartypants: true,
    });

    _initialized = true;
  }

  return { init: init };
})();

window.MarkedSetup = MarkedSetup;
