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

  async function switchToLang(lang) {
    if (I18n.lang() === lang) return;
    await I18n.switchLang(lang);
    updateLangButtons();
    if (typeof reloadPost === 'function') await reloadPost();
    if (typeof renderPostList === 'function') await renderPostList();
  }

  function bindEvents() {
    var zhBtn = document.getElementById('btn-lang-zh');
    var enBtn = document.getElementById('btn-lang-en');
    if (zhBtn) zhBtn.addEventListener('click', function () { switchToLang('zh'); });
    if (enBtn) enBtn.addEventListener('click', function () { switchToLang('en'); });

    var themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        Theme.toggle();
        updateThemeButton();
      });
    }

    updateLangButtons();
    updateThemeButton();
  }

  function updateLangButtons() {
    var zhBtn = document.getElementById('btn-lang-zh');
    var enBtn = document.getElementById('btn-lang-en');
    var cur = I18n.lang();
    if (zhBtn) zhBtn.classList.toggle('active', cur === 'zh');
    if (enBtn) enBtn.classList.toggle('active', cur === 'en');
  }

  function updateThemeButton() {
    var btn = document.getElementById('btn-theme-toggle');
    if (btn) btn.textContent = Theme.current() === 'dark' ? '☀' : '☾';
  }

  return { load: load, updateLangButton: updateLangButtons, updateThemeButton: updateThemeButton };
})();

window.Header = Header;
