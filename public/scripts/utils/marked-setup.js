/* ============================================
   Marked Setup — 白夜書簡 · 蚀羽版
   配置 marked.js：图片路径、代码高亮预留、懒加载
   ============================================ */

const MarkedSetup = (() => {
  let _initialized = false;

  function init() {
    if (_initialized) return;
    if (typeof marked === 'undefined') {
      console.warn('[MarkedSetup] marked.js not loaded yet.');
      return;
    }

    /* ---- Configure renderer ---- */
    const renderer = new marked.Renderer();

    /* ---- 图片：自动添加懒加载 + 处理相对路径 ---- */
    const origImage = renderer.image.bind(renderer);
    renderer.image = function (href, title, text) {
      // Handle relative image paths
      let src = href;
      if (src && !src.startsWith('http') && !src.startsWith('/')) {
        // Relative to assets/images/blog/
        src = `/assets/images/blog/${src}`;
      }
      const titleAttr = title ? ` title="${title}"` : '';
      const altAttr = text ? ` alt="${text}"` : '';
      return `<img src="${src}"${altAttr}${titleAttr} loading="lazy" decoding="async" />`;
    };

    /* ---- 链接：外部链接新窗口打开 ---- */
    const origLink = renderer.link.bind(renderer);
    renderer.link = function (href, title, text) {
      const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
      const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      const titleAttr = title ? ` title="${title}"` : '';
      return `<a href="${href}"${titleAttr}${target}>${text}</a>`;
    };

    /* ---- 代码块：无高亮（后续可在此接入 highlight.js） ---- */
    // renderer.code = function(code, infostring, escaped) { ... }

    marked.setOptions({
      renderer,
      gfm: true,
      breaks: false,
      smartLists: true,
      smartypants: true,
    });

    _initialized = true;
  }

  return { init };
})();

/* Expose globally */
window.MarkedSetup = MarkedSetup;
