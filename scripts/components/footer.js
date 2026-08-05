/* ============================================
   Footer Loader — 白夜書簡 · 蚀羽版
   动态注入页脚
   ============================================ */

const Footer = (() => {
  async function load() {
    try {
      const resp = await fetch('/components/footer.html');
      if (!resp.ok) return;
      const html = await resp.text();

      const container = document.getElementById('site-footer');
      if (!container) return;
      container.innerHTML = html;
    } catch (e) {
      console.warn('[Footer] Failed to load footer template.', e);
    }
  }

  return { load };
})();

window.Footer = Footer;
