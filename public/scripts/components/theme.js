/* ============================================
   Theme Switcher — 白夜書簡 · 蚀羽版
   浅色/深色一键切换，跟随系统偏好
   平滑过渡 1.2s（由 CSS variables.css 控制）
   ============================================ */

const Theme = (() => {
  const KEY = 'corrofea-theme';

  /* ---- Detect system preference ---- */
  function systemPrefers() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  /* ---- Init ---- */
  function init() {
    const stored = localStorage.getItem(KEY);
    let theme;

    if (stored === 'light' || stored === 'dark') {
      theme = stored;
    } else {
      theme = systemPrefers();
    }

    apply(theme);

    // Listen for system changes (only if user hasn't manually chosen)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(KEY)) {
        apply(e.matches ? 'dark' : 'light');
      }
    });
  }

  /* ---- Apply theme ---- */
  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: theme } }));
  }

  /* ---- Toggle ---- */
  function toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(KEY, next);
    apply(next);
  }

  /* ---- Get current ---- */
  function current() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  return { init, toggle, current };
})();

/* Expose globally */
window.Theme = Theme;
