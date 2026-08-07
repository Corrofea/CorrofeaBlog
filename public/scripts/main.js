/* ============================================
   Main Entry — 羽落逢蚀 · 蚀羽版
   初始化顺序: Theme -> i18n -> Header/Footer -> Page Logic
   所有阶段都有超时兜底，绝不死等
   ============================================ */

(function () {

  /* ---- Helper: timeout a promise ---- */
  function withTimeout(promise, ms, label) {
    ms = ms || 5000;
    return Promise.race([
      promise,
      new Promise(function (resolve) {
        setTimeout(function () {
          console.warn('[Main] Timeout: ' + (label || 'unnamed'));
          resolve();
        }, ms);
      })
    ]);
  }

  /* ---- Helper: run a page init function with timeout ---- */
  async function runPageInit(fn, timeoutMs) {
    if (typeof fn !== 'function') return;
    try {
      await withTimeout(fn(), timeoutMs || 6000, 'page init');
    } catch (e) {
      console.warn('[Main] Page init error:', e.message || e);
    }
  }

  /* ---- Force display: clear loading pseudos ---- */
  function forceDisplay() {
    // Populate any empty dynamic containers so :empty::after "Loading..." disappears
    var containers = ['post-list', 'archive-content', 'tags-content', 'projects-list'];
    containers.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.innerHTML.trim() === '') {
        el.innerHTML = '<p style="text-align:center;color:var(--color-text-muted);padding:2rem 0;font-style:italic;font-family:var(--font-heading)">---</p>';
      }
    });
  }

  /* ---- Actual init ---- */
  async function doInit() {
    // 1. Theme (sync, immediate)
    Theme.init();

    // 2. i18n (5s timeout)
    await withTimeout(I18n.init(), 5000, 'i18n');

    // 3. Header & Footer (5s timeout each, fire together)
    await withTimeout(Promise.all([
      Header.load(),
      Footer.load()
    ]), 5000, 'header/footer');

    // 4. Apply i18n after components are injected
    I18n.apply();

    // 5. Page-specific init (6s timeout)
    var page = Router.page();
    var slug = Router.get('slug');

    switch (page) {
      case 'index':
        await runPageInit(window.initHome, 6000);
        break;
      case 'post':
        await runPageInit(function () { return window.initPost(slug); }, 8000);
        break;
      case 'archive':
        await runPageInit(window.initArchive, 6000);
        break;
      case 'tags':
        await runPageInit(window.initTags, 6000);
        break;
      case 'projects':
        await runPageInit(window.initProjects, 6000);
        break;
      case 'about':
        await runPageInit(window.initAbout, 3000);
        break;
    }

    // 6. Back-to-top
    initBackToTop();

    // 7. Language change listener
    I18n.onChange(function () {
      Header.updateLangButton();
    });
  }

  /* ---- Bootstrap with total 10s safety net ---- */
  withTimeout(doInit(), 10000, 'total init').then(function () {
    forceDisplay();
    try {
      console.log('%c🪶 蚀羽 · corrofea %c羽落逢蚀',
        'color: #8B6F5C; font-size: 1.2em;',
        'color: #A09890;');
    } catch (e) {}
  });

  /* ---- Back to top button ---- */
  function initBackToTop() {
    var btn = document.getElementById('btn-back-to-top');
    if (!btn) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          if (window.scrollY > 400) {
            btn.classList.add('visible');
          } else {
            btn.classList.remove('visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
