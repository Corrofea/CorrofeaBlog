/* ============================================
   Header Loader — 白夜書簡 · 蚀羽版
   动态注入导航栏 + 绑定语言/主题切换
   ============================================ */

const Header = (() => {
  async function load() {
    try {
      const resp = await fetch('components/header.html');
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
    var langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', async function () {
        await I18n.toggle();
        updateLangButton();
        if (typeof reloadPost === 'function') await reloadPost();
        if (typeof renderPostList === 'function') await renderPostList();
      });
    }

    var themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        Theme.toggle();
        updateThemeButton();
      });
    }

    updateLangButton();
    updateThemeButton();
  }

  function updateLangButton() {
    var zh = document.querySelector('.lang-zh');
    var en = document.querySelector('.lang-en');
    var cur = I18n.lang();
    if (zh) zh.classList.toggle('active', cur === 'zh');
    if (en) en.classList.toggle('active', cur === 'en');
  }

  function updateThemeButton() {
    var btn = document.getElementById('btn-theme-toggle');
    if (btn) btn.textContent = Theme.current() === 'dark' ? '☀' : '☾';
  }

  return { load: load, updateLangButton: updateLangButton, updateThemeButton: updateThemeButton };
})();

window.Header = Header;
