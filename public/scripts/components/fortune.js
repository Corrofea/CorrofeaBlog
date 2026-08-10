/* ============================================
   Fortune — 羽落占 · 片羽签
   每日抽签系统：首次打开可抽签，当日结果保留
   ============================================ */

const Fortune = (() => {
  const STORAGE_KEY = 'corrofea-fortune';

  /* 等级概率权重：大吉5 中吉10 小吉20 中平30 凶25 大凶10 */
  const WEIGHTS = [
    { level: '大吉', weight: 5 },
    { level: '中吉', weight: 10 },
    { level: '小吉', weight: 20 },
    { level: '中平', weight: 30 },
    { level: '凶',   weight: 25 },
    { level: '大凶', weight: 10 }
  ];

  const themeColors = {
    '大吉': { light: '#8B6914', dark: '#D4A843' },
    '中吉': { light: '#5C3D2A', dark: '#D2B8A2' },
    '小吉': { light: '#6B5E4F', dark: '#B8A898' },
    '中平': { light: '#7A7268', dark: '#A09890' },
    '凶':   { light: '#8A8078', dark: '#787068' },
    '大凶': { light: '#9A9088', dark: '#686058' }
  };

  let _data = null;

  /* Load fortunes.json */
  async function loadData() {
    if (_data) return _data;
    try {
      const r = await fetch('data/fortunes.json');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      _data = await r.json();
    } catch (e) {
      console.warn('[Fortune] Failed to load fortunes.json:', e.message || e);
      _data = [];
    }
    return _data;
  }

  /* Today's date as locale string */
  function today() {
    const d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  /* Weighted random level selection */
  function randomLevel() {
    const total = WEIGHTS.reduce((s, w) => s + w.weight, 0);
    let r = Math.random() * total;
    for (let i = 0; i < WEIGHTS.length; i++) {
      r -= WEIGHTS[i].weight;
      if (r <= 0) return WEIGHTS[i].level;
    }
    return WEIGHTS[WEIGHTS.length - 1].level;
  }

  /* Pick random fortune from data for a given level */
  function randomFortune(data, level) {
    const pool = data.filter(f => f.level === level);
    if (!pool.length) return data[Math.floor(Math.random() * data.length)];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* Get stored fortune or null */
  function getStored() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const stored = JSON.parse(raw);
      if (stored.date === today()) return stored;
      return null;
    } catch (e) {
      return null;
    }
  }

  /* Store fortune */
  function save(fortune) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: today(),
      level: fortune.level,
      good: fortune.good,
      bad: fortune.bad,
      quote: fortune.quote
    }));
  }

  /* Build the card HTML for pre-draw state */
  function buildPreDraw() {
    return '<div class="fortune-card" id="fortune-card">' +
      '<div class="fortune-card-inner">' +
      '<div class="fortune-title">羽落占</div>' +
      '<div class="fortune-draw-btn" id="fortune-draw-btn">' +
      '<span class="fortune-feather">🪶</span>' +
      '<span>轻触此羽，抽取今日运势</span>' +
      '</div>' +
      '</div></div>';
  }

  /* Build the card HTML for post-draw state */
  function buildResult(fortune) {
    const colors = themeColors[fortune.level] || themeColors['中平'];
    const levelColor = document.documentElement.getAttribute('data-theme') === 'dark'
      ? colors.dark : colors.light;

    return '<div class="fortune-card fortune-card--result" id="fortune-card">' +
      '<div class="fortune-card-inner">' +
      '<div class="fortune-title fortune-title--result">片羽签</div>' +
      '<div class="fortune-level" style="color:' + levelColor + '">' + fortune.level + '</div>' +
      '<div class="fortune-quote">' + fortune.quote + '</div>' +
      '<div class="fortune-advice">' +
      '<div class="fortune-advice-item fortune-good"><span class="fortune-label">宜</span>' + fortune.good + '</div>' +
      '<div class="fortune-advice-item fortune-bad"><span class="fortune-label">忌</span>' + fortune.bad + '</div>' +
      '</div>' +
      '<div class="fortune-date">' + today() + '</div>' +
      '</div></div>';
  }

  /* Render into container */
  function render(container) {
    const stored = getStored();
    if (stored) {
      container.innerHTML = buildResult(stored);
    } else {
      container.innerHTML = buildPreDraw();
      const btn = document.getElementById('fortune-draw-btn');
      if (btn) {
        btn.addEventListener('click', async function () {
          const data = await loadData();
          if (!data.length) return;
          const fortune = randomFortune(data, randomLevel());
          save(fortune);
          container.innerHTML = buildResult(fortune);
        });
      }
    }

    // Listen for theme changes to update result level color
    document.addEventListener('theme-changed', function () {
      const stored = getStored();
      if (!stored) return;
      const colors = themeColors[stored.level] || themeColors['中平'];
      const el = document.querySelector('.fortune-level');
      if (el) {
        el.style.color = document.documentElement.getAttribute('data-theme') === 'dark'
          ? colors.dark : colors.light;
      }
    });
  }

  return { render };
})();
