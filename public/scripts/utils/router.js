/* ============================================
   Router — 白夜書簡 · 蚀羽版
   轻量 URL 参数解析
   ============================================ */

const Router = (() => {
  /* ---- Parse URL query string ---- */
  function params() {
    const p = {};
    const search = window.location.search.substring(1);
    if (!search) return p;
    search.split('&').forEach(pair => {
      const [key, val] = pair.split('=');
      p[decodeURIComponent(key)] = decodeURIComponent(val || '');
    });
    return p;
  }

  /* ---- Get single param ---- */
  function get(key) {
    return params()[key];
  }

  /* ---- Build URL with params ---- */
  function build(base, obj) {
    const qs = Object.entries(obj)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    return qs ? `${base}?${qs}` : base;
  }

  /* ---- Navigate ---- */
  function go(url) {
    window.location.href = url;
  }

  /* ---- Current page name (without .html) ---- */
  function page() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return filename.replace('.html', '');
  }

  return { params, get, build, go, page };
})();

/* Expose globally */
window.Router = Router;
