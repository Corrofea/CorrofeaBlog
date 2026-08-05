/* Posts Loader — 蚀羽版. Preloaded data first, fetch fallback. */
var Posts = (function () {
  var _index = null;
  var _loading = false;

  /* Sync: use preloaded data immediately */
  function publishedSync() {
    var data = window.__POSTS__;
    if (data && data.length) {
      _index = data;
    }
    if (!_index) return [];
    return _index.filter(function (p) { return !p.draft; })
      .sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
  }

  /* Async: fetch from network (backup for pages without preload) */
  async function loadIndex() {
    if (_index) return _index;
    if (window.__POSTS__ && window.__POSTS__.length) {
      _index = window.__POSTS__;
      return _index;
    }
    if (_loading) {
      // Wait for existing load
      return new Promise(function (resolve) {
        var check = setInterval(function () {
          if (_index) { clearInterval(check); resolve(_index); }
        }, 100);
      });
    }
    _loading = true;
    try {
      var r = await fetchTimeout('posts-index.json', 8000);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      _index = await r.json();
    } catch (e) {
      console.warn('[Posts] fetch failed:', e.message || e);
      _index = _index || [];
    } finally {
      _loading = false;
    }
    return _index;
  }

  function fetchTimeout(url, ms) {
    var c = new AbortController();
    var t = setTimeout(function () { c.abort(); }, ms || 8000);
    return fetch(url, { signal: c.signal }).finally(function () { clearTimeout(t); });
  }

  async function published() {
    var all = await loadIndex();
    return all.filter(function (p) { return !p.draft; })
      .sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
  }

  async function getBySlug(slug) {
    var all = await loadIndex();
    return all.find(function (p) { return p.slug === slug; }) || null;
  }

  async function byTag(tag) {
    var all = await published();
    return all.filter(function (p) { return (p.tags || []).indexOf(tag) !== -1; });
  }

  async function allTags() {
    var all = await published();
    var map = {};
    all.forEach(function (p) {
      (p.tags || []).forEach(function (t) { map[t] = (map[t] || 0) + 1; });
    });
    return Object.entries(map).sort(function (a, b) { return b[1] - a[1]; })
      .map(function (e) { return { name: e[0], count: e[1] }; });
  }

  async function years() {
    var all = await published();
    var map = {};
    all.forEach(function (p) {
      var y = p.date.substring(0, 4);
      map[y] = (map[y] || 0) + 1;
    });
    return Object.entries(map).sort(function (a, b) { return b[0].localeCompare(a[0]); })
      .map(function (e) { return { year: e[0], count: e[1] }; });
  }

  async function renderContent(slug, lang) {
    try {
      var r = await fetchTimeout('posts/' + lang + '/' + slug + '.md', 8000);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var md = await r.text();
      MarkedSetup.init();
      return marked.parse(md);
    } catch (e) {
      console.warn('[Posts] renderContent failed:', e.message || e);
      return null;
    }
  }

  function localize(post, field, lang) {
    if (!post) return '';
    var v = post[field];
    if (typeof v === 'object' && v !== null) return v[lang] || v['zh'] || v['en'] || '';
    return v || '';
  }

  function formatDate(d) {
    if (!d) return '';
    var dt = new Date(d);
    return dt.getFullYear() + '.' + String(dt.getMonth() + 1).padStart(2, '0') + '.' + String(dt.getDate()).padStart(2, '0');
  }

  function readingTime(text, lang) {
    if (!text) return '1 min';
    var mins = lang === 'zh' ? Math.max(1, Math.ceil(text.length / 400))
      : Math.max(1, Math.ceil(text.split(/\s+/).length / 250));
    return mins + ' min';
  }

  async function nextPost(slug) {
    var all = await published();
    var idx = all.findIndex(function (p) { return p.slug === slug; });
    return idx > 0 ? all[idx - 1] : null;
  }

  return {
    publishedSync: publishedSync, loadIndex: loadIndex, published: published,
    getBySlug: getBySlug, byTag: byTag, allTags: allTags, years: years,
    renderContent: renderContent, localize: localize, formatDate: formatDate,
    readingTime: readingTime, nextPost: nextPost
  };
})();
window.Posts = Posts;
