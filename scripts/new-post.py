#!/usr/bin/env python3
"""
Convert a draft into a proper blog post.

Usage:
  python3 scripts/new-post.py drafts/my-draft.md
  python3 scripts/new-post.py drafts/my-draft.md --slug my-post --tags "前端,JS" --date 2025-08-10

The script will:
1. Read the draft file
2. Extract the title from the first # heading
3. Prompt for missing info (tags, date, summary)
4. Create public/posts/zh/{slug}.md with YAML frontmatter
5. Create a skeleton public/posts/en/{slug}.md
6. Offer to run build.py
"""

import os, sys, re, json
from pathlib import Path
from datetime import date as dt_date

ROOT = Path(__file__).parent.parent

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/new-post.py drafts/your-draft.md [--slug xxx] [--tags a,b] [--date YYYY-MM-DD]")
        sys.exit(1)

    draft_path = Path(sys.argv[1])
    if not draft_path.exists():
        print(f"Error: {draft_path} not found")
        sys.exit(1)

    # Parse --flags
    args = {}
    for a in sys.argv[2:]:
        if a.startswith('--') and '=' in a:
            k, v = a[2:].split('=', 1)
            args[k] = v

    # Read draft
    content = draft_path.read_text(encoding='utf-8')

    # Extract title
    title = ''
    m = re.search(r'^#\s+(.+)', content, re.MULTILINE)
    if m:
        title = m.group(1).strip()

    # Extract description (text between > and next heading or blank line)
    desc = ''
    m2 = re.search(r'^>\s*(.+?)(?:\n\n|\n#)', content, re.MULTILINE | re.DOTALL)
    if m2:
        desc = m2.group(1).strip().replace('\n> ', ' ').replace('\n>', ' ')

    # Slug: from filename or --slug
    slug = args.get('slug', draft_path.stem)

    # Date: from --date or today
    date_str = args.get('date', dt_date.today().strftime('%Y-%m-%d'))

    # Tags: from --tags or prompt
    tags = args.get('tags', '')

    print(f"\n  Draft: {draft_path.name}")
    print(f"  Title: {title}")
    print(f"  Slug:  {slug}")
    print(f"  Date:  {date_str}")
    print(f"  Desc:  {desc[:80]}{'...' if len(desc) > 80 else ''}")

    if not tags:
        print()
        tags = input("  Tags (comma separated): ").strip()
    tags_list = [t.strip() for t in tags.split(',') if t.strip()]

    # Build frontmatter
    fm = f"""---
title: {title}
title_en: {title}
date: {date_str}
tags: {json.dumps(tags_list, ensure_ascii=False)}
summary: {desc}
summary_en: {desc}
draft: false
---

"""
    # Strip frontmatter from draft content if present, and the title line
    body = content
    body = re.sub(r'^---[\s\S]*?---\s*\n', '', body)  # strip existing frontmatter
    body = re.sub(r'^#\s+.+\n', '', body, count=1)     # strip title (will be re-added)
    body = body.strip()

    # Remove the description line if it matches
    if desc:
        body = re.sub(r'^>\s*' + re.escape(desc.split('\n')[0]) + r'.*?\n\n?', '', body, count=1, flags=re.DOTALL)
        body = body.strip()

    final_content = fm + f"# {title}\n\n" + body + '\n'

    # Write zh post
    zh_dir = ROOT / 'public' / 'posts' / 'zh'
    zh_dir.mkdir(parents=True, exist_ok=True)
    zh_file = zh_dir / f'{slug}.md'
    zh_file.write_text(final_content, encoding='utf-8')
    print(f"\n  Created: {zh_file}")

    # Write en skeleton
    en_dir = ROOT / 'public' / 'posts' / 'en'
    en_dir.mkdir(parents=True, exist_ok=True)
    en_file = en_dir / f'{slug}.md'
    en_fm = f"""---
title: {title}
title_en: {title}
date: {date_str}
tags: {json.dumps(tags_list, ensure_ascii=False)}
summary: {desc}
summary_en: {desc}
draft: false
---

# {title}

> English version coming soon.
"""
    en_file.write_text(en_fm, encoding='utf-8')
    print(f"  Created: {en_file}")

    # Create image directory
    img_dir = ROOT / 'public' / 'assets' / 'images' / 'blog' / slug
    img_dir.mkdir(parents=True, exist_ok=True)
    (img_dir / '.gitkeep').touch()
    print(f"  Created: {img_dir}/")

    # Offer to build
    print()
    ans = input("  Run build.py now? [Y/n]: ").strip().lower()
    if ans != 'n':
        os.system(f'cd {ROOT} && python3 scripts/build.py')
    else:
        print("  Skipped. Run: python3 scripts/build.py")

    print(f"\n  Done. Preview: python3 -m http.server 8080 -d public")
    print(f"  URL: post.html?slug={slug}")


if __name__ == '__main__':
    main()
