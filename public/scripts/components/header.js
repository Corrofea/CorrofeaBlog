/* ============================================
   Header Loader — 白夜書簡 · 蚀羽版
   动态注入导航栏 + 绑定语言/主题切换
   ============================================ */

const Header = (() => {
  async function load() {
    try {
      const resp = await fetch('/components/header.html');
      if (!resp.ok) return;
      const html = await resp.text();

      const container = document.getElementById('site-header');
      if (!container) return;
      container.innerHTML = html;

      // After injection, bind events
      bindEvents();
    } catch (e) {
      console.warn('[Header] Failed to load header template.', e);
    }
  }

  function bindEvents() {
    // Language toggle
    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', async () => {
        await I18n.toggle();
        updateLangButton();
        // Reload post content if on post page
        if (typeof reloadPost === 'function') {
          await reloadPost();
        }
        // Re-render post list if on home/archive
        if (typeof renderPostList === 'function') {
          await renderPostList();
        }
      });
    }

    // Theme toggle
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        Theme.toggle();
        updateThemeButton();
      });
    }

    updateLangButton();
    updateThemeButton();
  }

  function updateLangButton() {
    const btn = document.getElementById('btn-lang-toggle');
    if (btn) {
      btn.textContent = I18n.lang() === 'zh' ? 'EN' : '中';
    }
  }

  function updateThemeButton() {
    const btn = document.getElementById('btn-theme-toggle');
    if (btn) {
      btn.textContent = Theme.current() === 'dark' ? '☀' : '☾';
    }
  }

  // Re-expose for external calls
  return { load, updateLangButton, updateThemeButton };
})();

window.Header = Header;
