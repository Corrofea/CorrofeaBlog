/* ============================================
   Search — 羽落逢蚀 · 蚀羽版
   搜索标题/摘要/标签，支持标签筛选 & 年份过滤
   ============================================ */

const Search = (() => {
  let _query = '';
  let _tagFilter = null;
  let _yearFilter = null;
  let _timer = null;
  let _posts = [];

  /* Build HTML for the search panel */
  function buildPanel(posts) {
    _posts = posts;
    const tags = collectTags(posts);
    const years = collectYears(posts);

    return '' +
      '<div class="search-panel" id="search-panel">' +
      /* 搜索输入 */
      '<div class="search-input-wrap">' +
      '<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
      '<input class="search-input" id="search-input" type="text" placeholder="搜索文章标题、摘要、标签…" autocomplete="off">' +
      '<button class="search-clear" id="search-clear" aria-label="清除">✕</button>' +
      '</div>' +
      /* 筛选行：标签 + 年份 */
      '<div class="search-filters" id="search-filters">' +
      '<div class="search-filter-label">标签</div>' +
      '<div class="search-tags" id="search-tags">' +
      tags.map(t => '<button class="search-tag" data-tag="' + t + '">' + t + '</button>').join('') +
      '</div>' +
      '<div class="search-filter-label">年份</div>' +
      '<div class="search-years" id="search-years">' +
      '<button class="search-year active" data-year="">全部</button>' +
      years.map(y => '<button class="search-year" data-year="' + y + '">' + y + '</button>').join('') +
      '</div>' +
      '</div>' +
      /* 结果区 */
      '<div class="search-results" id="search-results">' +
      '<div class="search-hint">输入关键词或点击标签开始搜索</div>' +
      '</div>' +
      '</div>';
  }

  function collectTags(posts) {
    const set = new Set();
    posts.forEach(p => (p.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort();
  }

  function collectYears(posts) {
    const set = new Set();
    posts.forEach(p => set.add(p.date.substring(0, 4)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }

  /* Bind events after DOM is inserted */
  function bindEvents(langFn) {
    const input = document.getElementById('search-input');
    const clear = document.getElementById('search-clear');
    const tagsEl = document.getElementById('search-tags');
    const yearsEl = document.getElementById('search-years');

    if (input) {
      input.addEventListener('input', function () {
        _query = this.value.trim().toLowerCase();
        if (clear) clear.style.display = _query ? 'flex' : 'none';
        scheduleSearch(langFn);
      });
    }

    if (clear) {
      clear.addEventListener('click', function () {
        _query = '';
        if (input) { input.value = ''; input.focus(); }
        clear.style.display = 'none';
        doSearch(langFn);
      });
    }

    if (tagsEl) {
      tagsEl.addEventListener('click', function (e) {
        const btn = e.target.closest('.search-tag');
        if (!btn) return;
        const tag = btn.dataset.tag;
        if (_tagFilter === tag) {
          _tagFilter = null;
          btn.classList.remove('active');
        } else {
          const prev = tagsEl.querySelector('.search-tag.active');
          if (prev) prev.classList.remove('active');
          _tagFilter = tag;
          btn.classList.add('active');
        }
        doSearch(langFn);
      });
    }

    if (yearsEl) {
      yearsEl.addEventListener('click', function (e) {
        const btn = e.target.closest('.search-year');
        if (!btn) return;
        const prev = yearsEl.querySelector('.search-year.active');
        if (prev) prev.classList.remove('active');
        _yearFilter = btn.dataset.year || null;
        btn.classList.add('active');
        doSearch(langFn);
      });
    }
  }

  function scheduleSearch(langFn) {
    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(function () { doSearch(langFn); }, 200);
  }

  /* Core search logic */
  function doSearch(langFn) {
    const results = document.getElementById('search-results');
    if (!results) return;

    let filtered = _posts.slice();

    // Year filter
    if (_yearFilter) {
      filtered = filtered.filter(p => p.date.startsWith(_yearFilter));
    }

    // Tag filter
    if (_tagFilter) {
      filtered = filtered.filter(p => (p.tags || []).includes(_tagFilter));
    }

    // Text search
    if (_query) {
      const q = _query;
      filtered = filtered.filter(p => {
        const title = (localize(p, 'title', langFn) || '').toLowerCase();
        const summary = (localize(p, 'summary', langFn) || '').toLowerCase();
        const tags = (p.tags || []).join(' ').toLowerCase();
        return title.includes(q) || summary.includes(q) || tags.includes(q);
      });

      // Highlight matches
      filtered = filtered.map(p => {
        const title = localize(p, 'title', langFn) || '';
        const summary = localize(p, 'summary', langFn) || '';
        return Object.assign({}, p, {
          _title: highlight(title, _query),
          _summary: highlight(summary, _query)
        });
      });
    } else {
      filtered = filtered.map(p => {
        const title = localize(p, 'title', langFn) || '';
        const summary = localize(p, 'summary', langFn) || '';
        return Object.assign({}, p, { _title: title, _summary: summary });
      });
    }

    // Render results
    if (!_query && !_tagFilter && !_yearFilter) {
      results.innerHTML = '<div class="search-hint">输入关键词或点击标签开始搜索</div>';
    } else if (filtered.length === 0) {
      results.innerHTML = '<div class="search-hint">未找到匹配的文章</div>';
    } else {
      results.innerHTML = filtered.slice(0, 8).map(p => {
        const date = formatDate(p.date);
        const tags = (p.tags || []).map(t => '<span class="search-result-tag">#' + t + '</span>').join('');
        const snippet = p._summary.length > 120 ? p._summary.substring(0, 120) + '…' : p._summary;
        return '' +
          '<a class="search-result-item" href="post.html?slug=' + p.slug + '">' +
          '<span class="search-result-title">' + p._title + '</span>' +
          '<span class="search-result-meta">' + date + ' ' + tags + '</span>' +
          '<span class="search-result-snippet">' + snippet + '</span>' +
          '</a>';
      }).join('');
      if (filtered.length > 8) {
        results.innerHTML += '<div class="search-hint" style="margin-top:0.6rem">还有 ' + (filtered.length - 8) + ' 条结果，请缩小搜索范围</div>';
      }
    }
  }

  /* Simple highlight: wrap matching text in <mark> (case-insensitive) */
  function highlight(text, query) {
    try {
      const re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      return text.replace(re, '<mark>$1</mark>');
    } catch (e) {
      return text;
    }
  }

  function localize(post, field, langFn) {
    if (!post) return '';
    const v = post[field];
    if (typeof v === 'object' && v !== null) {
      const lang = typeof langFn === 'function' ? langFn() : 'zh';
      return v[lang] || v['zh'] || v['en'] || '';
    }
    return v || '';
  }

  function formatDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    return dt.getFullYear() + '.' + String(dt.getMonth() + 1).padStart(2, '0') + '.' + String(dt.getDate()).padStart(2, '0');
  }

  return { buildPanel, bindEvents };
})();
