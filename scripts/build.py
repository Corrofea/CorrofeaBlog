#!/usr/bin/env python3
"""
CorrofeaBlog Build Script
==========================
1. Scan public/posts/zh/*.md and public/posts/en/*.md
2. Parse YAML frontmatter for metadata
3. Generate public/posts-index.json
4. Inject __POSTS__ into public/index.html
5. Merge src/styles/ → public/styles/bundle.css

Usage:
  python3 scripts/build.py

After adding .md files to public/posts/{zh,en}/, run this once.
"""

import json, re, os, glob
from pathlib import Path

ROOT = Path(__file__).parent.parent

# ----- 1. Parse YAML frontmatter from .md files -----

def parse_frontmatter(filepath):
    """Extract YAML-like frontmatter from markdown file.
    Expected format:
    ---
    title: 中文标题
    title_en: English Title
    date: 2025-08-05
    tags: [tag1, tag2]
    summary: 中文摘要
    summary_en: English summary
    draft: false
    ---
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match --- frontmatter ---
    m = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not m:
        print(f"  WARN: no frontmatter found in {filepath}, skipping")
        return None

    fm_text = m.group(1)
    data = {}
    for line in fm_text.strip().split('\n'):
        line = line.strip()
        if ':' not in line:
            continue
        key, _, val = line.partition(':')
        key = key.strip()
        val = val.strip()

        # Parse list [a, b, c]
        if val.startswith('[') and val.endswith(']'):
            val = [v.strip().strip('"').strip("'") for v in val[1:-1].split(',') if v.strip()]
        # Parse boolean
        elif val.lower() in ('true', 'false'):
            val = val.lower() == 'true'
        # Strip quotes
        elif val.startswith('"') or val.startswith("'"):
            val = val[1:-1]

        data[key] = val

    # Validate required fields
    required = ['title', 'date']
    for field in required:
        if field not in data:
            title_en = data.get('title_en', data.get('title', '?'))
            # Auto-fill date from filename or filesystem
            if field == 'date':
                data['date'] = '2025-01-01'
                print(f"  WARN: no date in {filepath}, using default")

    return data

# ----- 2. Build posts index -----

def build_index():
    print("Scanning posts...")
    zh_dir = ROOT / 'public' / 'posts' / 'zh'
    en_dir = ROOT / 'public' / 'posts' / 'en'

    posts = {}
    for lang_dir, lang in [(zh_dir, 'zh'), (en_dir, 'en')]:
        for md_file in sorted(lang_dir.glob('*.md')):
            slug = md_file.stem
            fm = parse_frontmatter(md_file)
            if fm is None:
                continue
            if slug not in posts:
                posts[slug] = {
                    'slug': slug,
                    'title': {},
                    'date': fm.get('date', ''),
                    'tags': fm.get('tags', []),
                    'summary': {},
                    'draft': fm.get('draft', False)
                }
            posts[slug]['title'][lang] = fm.get('title', slug)
            posts[slug]['summary'][lang] = fm.get('summary', fm.get('title', ''))
            if fm.get('date') and fm['date'] > posts[slug]['date']:
                posts[slug]['date'] = fm['date']
            # Merge tags from both languages
            for t in fm.get('tags', []):
                if t not in posts[slug]['tags']:
                    posts[slug]['tags'].append(t)

    # Sort by date descending
    result = sorted(posts.values(), key=lambda p: p['date'], reverse=True)
    return result

# ----- 3. Write posts-index.json -----

def write_index(posts):
    out = ROOT / 'public' / 'data' / 'posts-index.json'
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    print(f"  posts-index.json: {len(posts)} posts")

# ----- 4. Inject into index.html and post.html -----

def inject_posts(posts):
    json_str = json.dumps(posts, ensure_ascii=False)
    new_block = f'window.__POSTS__ = {json_str};'
    pattern = r'window\.__POSTS__\s*=\s*\[.*?\];'

    for page in ['index.html', 'post.html']:
        html_file = ROOT / 'public' / page
        if not html_file.exists():
            print(f"  WARN: {page} not found")
            continue
        with open(html_file, 'r', encoding='utf-8') as f:
            html = f.read()
        if re.search(pattern, html, re.DOTALL):
            html = re.sub(pattern, new_block, html, flags=re.DOTALL)
        else:
            print(f"  WARN: window.__POSTS__ not found in {page}")
            continue
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"  {page}: __POSTS__ updated with {len(posts)} posts")

# ----- 5. Cache buster: add ?v=TIMESTAMP to CSS/JS references -----

def cache_bust():
    import time
    stamp = str(int(time.time()))
    html_files = list((ROOT / 'public').glob('*.html'))
    for f in html_files:
        text = f.read_text(encoding='utf-8')
        # Replace .css and .js references with versioned URLs
        text = re.sub(r'(src|href)="(scripts/[^"]+\.js)"', rf'\1="\2?v={stamp}"', text)
        text = re.sub(r'(src|href)="(styles/[^"]+\.css)"', rf'\1="\2?v={stamp}"', text)
        f.write_text(text, encoding='utf-8')
    print(f'  cache-bust: ?v={stamp} added to {len(html_files)} files')

# ----- 6. Regenerate bundle.css -----

def build_css():
    src_dir = ROOT / 'src' / 'styles'
    out_dir = ROOT / 'public' / 'styles'
    out_dir.mkdir(parents=True, exist_ok=True)
    files = [
        'reset.css', 'variables.css', 'typography.css', 'layout.css',
        'components/header.css', 'components/footer.css', 'components/navbar.css',
        'components/card.css', 'components/button.css', 'components/post.css',
        'pages/home.css', 'pages/archive.css', 'pages/projects.css', 'pages/about.css'
    ]
    bundle = out_dir / 'bundle.css'
    header = '/* CorrofeaBlog Bundle CSS — auto-generated by build.py */\n\n'

    with open(bundle, 'w', encoding='utf-8') as out:
        out.write(header)
        for fname in files:
            fpath = src_dir / fname
            if fpath.exists():
                out.write(f'/* === {fname} === */\n')
                out.write(fpath.read_text(encoding='utf-8'))
                out.write('\n')
            else:
                print(f"  WARN: {fpath} not found, skipped")
    print(f"  public/styles/bundle.css: regenerated ({bundle.stat().st_size} bytes)")

# ----- Main -----

if __name__ == '__main__':
    os.chdir(ROOT)
    print("Build: CorrofeaBlog\n")

    # Build posts
    posts = build_index()
    write_index(posts)
    inject_posts(posts)

    # Build CSS
    build_css()

    # Cache bust
    cache_bust()

    print(f"\nDone. {len(posts)} posts indexed.")
    print("Run: python3 -m http.server 8080 -d public")
