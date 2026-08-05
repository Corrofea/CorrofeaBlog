/* i18n Engine — 蚀羽版. Preloaded data first, fetch fallback. */
var I18n = (function () {
  var _lang = 'zh';
  var _translations = null;
  var _listeners = [];

  function detect() {
    var s = localStorage.getItem('corrofea-lang');
    if (s === 'zh' || s === 'en') return s;
    return (navigator.language || '').indexOf('zh') === 0 ? 'zh' : 'en';
  }

  /* Try preloaded window.__I18N__ first (sync), fallback to fetch (async) */
  function init() {
    _lang = detect();
    var pre = window.__I18N__;
    if (pre && pre[_lang]) {
      _translations = pre[_lang];
    } else {
      // Will be loaded async; apply() renders whatever we have
      loadFallback(_lang);
    }
    apply();
    return _lang;
  }

  /* Async fallback loader (if data wasn't preloaded) */
  async function loadFallback(lang) {
    try {
      var r = await fetchTimeout('i18n/' + lang + '.json', 5000);
      if (r.ok) { _translations = await r.json(); _lang = lang; return; }
    } catch (e) {}
    var fb = lang === 'zh' ? 'en' : 'zh';
    try {
      var r2 = await fetchTimeout('i18n/' + fb + '.json', 5000);
      if (r2.ok) { _translations = await r2.json(); _lang = fb; return; }
    } catch (e2) {}
    _translations = _translations || {};
  }

  function fetchTimeout(url, ms) {
    var c = new AbortController();
    var t = setTimeout(function () { c.abort(); }, ms || 5000);
    return fetch(url, { signal: c.signal }).finally(function () { clearTimeout(t); });
  }

  function apply() {
    document.documentElement.lang = _lang;
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      var v = get(key);
      if (v !== undefined) els[i].textContent = v;
    }
    document.dispatchEvent(new CustomEvent('language-changed', { detail: { lang: _lang } }));
    for (var j = 0; j < _listeners.length; j++) _listeners[j](_lang);
  }

  function get(key) {
    if (!_translations) return undefined;
    var parts = key.split('.');
    var v = _translations;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }

  async function switchLang(target) {
    if (target === _lang) return;
    localStorage.setItem('corrofea-lang', target);
    var pre = window.__I18N__;
    if (pre && pre[target]) {
      _translations = pre[target];
      _lang = target;
    } else {
      _lang = target;
      await loadFallback(target);
    }
    apply();
  }

  async function toggle() { await switchLang(_lang === 'zh' ? 'en' : 'zh'); }

  function lang() { return _lang; }
  function t(key) { var v = get(key); return v !== undefined ? v : key; }
  function onChange(fn) { _listeners.push(fn); }

  return { init: init, switchLang: switchLang, toggle: toggle, lang: lang, t: t, get: get, apply: apply, onChange: onChange };
})();
window.I18n = I18n;
