/* ============================================
   Comments Placeholder — 白夜書簡 · 蚀羽版
   预留评论系统接口
   后续接入 Giscus / Disqus / Waline 只需修改此文件
   ============================================ */

const Comments = (() => {
  /* ---- Init comment section ---- */
  function init(containerId) {
    const container = document.getElementById(containerId || 'comments');
    if (!container) return;

    // 当前为空实现 — 仅渲染占位
    // 后续接入示例 (Giscus):
    //
    // const script = document.createElement('script');
    // script.src = 'https://giscus.app/client.js';
    // script.setAttribute('data-repo', 'corrofea/corrofea-blog-comments');
    // script.setAttribute('data-repo-id', '...');
    // script.setAttribute('data-category', 'General');
    // script.setAttribute('data-category-id', '...');
    // script.setAttribute('data-mapping', 'pathname');
    // script.setAttribute('data-theme', Theme.current());
    // script.setAttribute('data-lang', I18n.lang());
    // script.crossOrigin = 'anonymous';
    // script.async = true;
    // container.appendChild(script);

    // 当前：不渲染任何内容，评论区为空
  }

  return { init };
})();

window.Comments = Comments;
