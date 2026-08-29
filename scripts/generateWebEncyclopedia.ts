/**
 * Web encyclopedia generator (v2.6 batch 4.3).
 *
 * Builds a static, dependency-free site into docs/ from the app's bundled
 * encyclopedia articles (RU + EN) — the only free SEO channel the project
 * has. Served by GitHub Pages from the /docs folder of the master branch
 * (enable in repo Settings → Pages → "Deploy from a branch" → /docs).
 *
 * Run: npm run webenc
 * (compiles this script with scripts/tsconfig.web.json, then executes the
 * emitted JS — article files are plain TS data, so the compiled runtime
 * graph never touches React Native modules.)
 */
import * as fs from 'fs';
import * as path from 'path';
import { articles } from '../src/features/encyclopedia/data/articles';
import type { Article, ArticleCategory } from '../src/features/encyclopedia/types';
import { ru } from '../src/shared/i18n/locales/ru';
import { en } from '../src/shared/i18n/locales/en';

type Lang = 'ru' | 'en';

const SITE_URL = 'https://kur0sava.github.io/diapet/';
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.diapet.app';
const RUSTORE_URL = 'https://www.rustore.ru/catalog/app/com.diapet.app';
const GITHUB_URL = 'https://github.com/kur0sava/diapet';

const OUT_DIR = path.resolve(process.cwd(), 'docs');

const STRINGS = {
  ru: {
    siteTitle: 'DiaPet — диабет у кошек и собак',
    tagline: 'Бесплатное приложение-дневник и энциклопедия диабета для кошек и собак',
    heroLead:
      'Замеры глюкозы, инъекции, кормления и вес — в одном дневнике. Локальный анализатор трендов, PDF-отчёт для ветеринара и энциклопедия из 40+ статей. Без рекламы, данные остаются на вашем устройстве.',
    encyclopedia: 'Энциклопедия',
    catSection: 'Диабет у кошек',
    dogSection: 'Диабет у собак',
    sharedSection: 'Общие статьи',
    download: 'Скачать приложение',
    downloadPlay: 'Google Play',
    downloadRuStore: 'RuStore',
    github: 'GitHub',
    minutes: 'мин',
    backToList: '← Все статьи',
    related: 'Читайте также',
    references: 'Источники',
    otherLang: 'English',
    disclaimer:
      'Материалы носят справочный характер и не заменяют консультацию ветеринарного врача. При любых сомнениях в состоянии питомца обращайтесь к специалисту.',
    footerNote: 'Сделано с заботой о диабетических котах и собаках.',
    categories: ru.encyclopedia.categories as Record<ArticleCategory, string>,
  },
  en: {
    siteTitle: 'DiaPet — diabetes in cats & dogs',
    tagline: 'A free diabetes diary app and encyclopedia for cats and dogs',
    heroLead:
      'Glucose readings, injections, feedings and weight — in one diary. A local trend analyzer, a vet-ready PDF report and a 40+ article encyclopedia. No ads; your data stays on your device.',
    encyclopedia: 'Encyclopedia',
    catSection: 'Diabetes in cats',
    dogSection: 'Diabetes in dogs',
    sharedSection: 'General articles',
    download: 'Get the app',
    downloadPlay: 'Google Play',
    downloadRuStore: 'RuStore',
    github: 'GitHub',
    minutes: 'min',
    backToList: '← All articles',
    related: 'Related articles',
    references: 'References',
    otherLang: 'Русский',
    disclaimer:
      'This content is for reference only and does not replace a consultation with a veterinarian. When in doubt about your pet, see a professional.',
    footerNote: 'Made with care for diabetic cats and dogs.',
    categories: en.encyclopedia.categories as Record<ArticleCategory, string>,
  },
};

// ---------------------------------------------------------------------------
// Markdown → HTML (mirrors the app's ArticleDetail renderer + tables)
// ---------------------------------------------------------------------------

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(s: string): string {
  return escapeHtml(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function mdToHtml(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let list: 'ul' | 'ol' | null = null;
  let table: string[][] | null = null;

  const closeList = () => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  };
  const flushTable = () => {
    if (!table || table.length === 0) {
      table = null;
      return;
    }
    const [head, ...body] = table;
    out.push('<div class="table-wrap"><table>');
    out.push('<thead><tr>' + head.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead>');
    if (body.length > 0) {
      out.push(
        '<tbody>' +
          body
            .map(row => '<tr>' + row.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>')
            .join('') +
          '</tbody>'
      );
    }
    out.push('</table></div>');
    table = null;
  };

  // Drop a leading H1 that duplicates the page title (same as the app)
  const firstIdx = lines.findIndex(l => l.trim() !== '');
  if (firstIdx !== -1 && lines[firstIdx].startsWith('# ') && !lines[firstIdx].startsWith('## ')) {
    lines[firstIdx] = '';
  }

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Table rows
    if (/^\|.*\|$/.test(line.trim())) {
      closeList();
      const cells = line
        .trim()
        .slice(1, -1)
        .split('|')
        .map(c => c.trim());
      // Separator row (|---|---|) — skip
      if (cells.every(c => /^:?-{2,}:?$/.test(c))) continue;
      if (!table) table = [];
      table.push(cells);
      continue;
    }
    flushTable();

    if (line.startsWith('### ')) {
      closeList();
      out.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith('## ')) {
      closeList();
      out.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith('# ')) {
      closeList();
      out.push(`<h2>${inline(line.slice(2))}</h2>`);
    } else if (line.startsWith('> ')) {
      closeList();
      out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
    } else if (line.startsWith('---')) {
      closeList();
      out.push('<hr>');
    } else if (/^\d+\.\s+/.test(line)) {
      if (list !== 'ol') {
        closeList();
        out.push('<ol>');
        list = 'ol';
      }
      out.push(`<li>${inline(line.replace(/^\d+\.\s+/, ''))}</li>`);
    } else if (line.startsWith('- ')) {
      if (list !== 'ul') {
        closeList();
        out.push('<ul>');
        list = 'ul';
      }
      out.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (line.trim() === '') {
      closeList();
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  flushTable();
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Page templates
// ---------------------------------------------------------------------------

const CSS = `
:root {
  --accent: #4f8ef7;
  --accent-dark: #2f6fd8;
  --text: #1c1c1e;
  --text-sec: #6d6d72;
  --border: #e5e5ea;
  --bg: #f8f9fa;
  --card: #ffffff;
}
@media (prefers-color-scheme: dark) {
  :root {
    --text: #f2f2f4;
    --text-sec: #a2a2a8;
    --border: #33343a;
    --bg: #131417;
    --card: #1d1e23;
  }
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: var(--text);
  background: var(--bg);
  line-height: 1.65;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
.wrap { max-width: 860px; margin: 0 auto; padding: 0 20px 48px; }
header.site {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 0; gap: 12px; flex-wrap: wrap;
}
.logo { font-size: 20px; font-weight: 800; color: var(--accent); }
.logo span { color: var(--text); }
.lang-switch { font-size: 14px; }
.hero { padding: 28px 0 8px; }
.hero h1 { font-size: 30px; line-height: 1.25; margin-bottom: 10px; }
.hero p { color: var(--text-sec); font-size: 16px; max-width: 640px; }
.cta-row { display: flex; gap: 10px; flex-wrap: wrap; margin: 22px 0 8px; }
.btn {
  display: inline-block; padding: 11px 20px; border-radius: 12px;
  font-weight: 600; font-size: 15px;
}
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-dark); text-decoration: none; }
.btn-outline { border: 1.5px solid var(--accent); color: var(--accent); }
.btn-outline:hover { text-decoration: none; }
h2.section { font-size: 22px; margin: 34px 0 14px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; }
.card {
  background: var(--card); border: 1px solid var(--border); border-radius: 14px;
  padding: 16px; display: block; color: inherit;
}
.card:hover { border-color: var(--accent); text-decoration: none; }
.card .cat { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: var(--accent); font-weight: 700; }
.card h3 { font-size: 16px; margin: 6px 0; line-height: 1.35; }
.card p { font-size: 13px; color: var(--text-sec); }
.card .meta { font-size: 12px; color: var(--text-sec); margin-top: 8px; }
article { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 28px; margin-top: 8px; }
article h1 { font-size: 28px; line-height: 1.25; margin-bottom: 6px; }
article .meta { color: var(--text-sec); font-size: 13px; margin-bottom: 18px; }
article h2 { font-size: 21px; margin: 26px 0 10px; }
article h3 { font-size: 17px; margin: 20px 0 8px; }
article p { margin: 10px 0; }
article ul, article ol { margin: 10px 0 10px 22px; }
article li { margin: 4px 0; }
article blockquote {
  border-left: 3px solid var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent);
  padding: 10px 14px; border-radius: 8px; margin: 12px 0;
}
article hr { border: none; border-top: 1px solid var(--border); margin: 18px 0; }
.table-wrap { overflow-x: auto; margin: 12px 0; }
table { border-collapse: collapse; font-size: 14px; min-width: 420px; }
th, td { border: 1px solid var(--border); padding: 7px 10px; text-align: left; }
th { background: color-mix(in srgb, var(--accent) 8%, transparent); }
.refs { font-size: 13px; color: var(--text-sec); margin-top: 22px; }
.refs li { margin: 3px 0; }
.disclaimer {
  margin-top: 28px; padding: 14px 16px; border-radius: 12px; font-size: 13px;
  color: var(--text-sec); background: color-mix(in srgb, var(--accent) 6%, transparent);
}
footer.site { margin-top: 36px; padding-top: 18px; border-top: 1px solid var(--border);
  color: var(--text-sec); font-size: 13px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
`;

const FAVICON =
  'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐾</text></svg>';

function pageShell(opts: {
  lang: Lang;
  title: string;
  description: string;
  cssHref: string;
  canonical: string;
  altHref: string;
  altLang: Lang;
  homeHref: string;
  langSwitchHref: string;
  body: string;
}): string {
  const s = STRINGS[opts.lang];
  return `<!DOCTYPE html>
<html lang="${opts.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(opts.title)}</title>
<meta name="description" content="${escapeHtml(opts.description)}">
<link rel="canonical" href="${opts.canonical}">
<link rel="alternate" hreflang="${opts.altLang}" href="${opts.altHref}">
<link rel="icon" href="${FAVICON}">
<link rel="stylesheet" href="${opts.cssHref}">
</head>
<body>
<div class="wrap">
<header class="site">
  <a class="logo" href="${opts.homeHref}">Dia<span>Pet</span></a>
  <a class="lang-switch" href="${opts.langSwitchHref}">${STRINGS[opts.altLang === 'ru' ? 'en' : 'ru'].otherLang}</a>
</header>
${opts.body}
<footer class="site">
  <div>DiaPet · <a href="${GITHUB_URL}">${s.github}</a></div>
  <div>${escapeHtml(s.footerNote)}</div>
</footer>
</div>
</body>
</html>`;
}

function articleCard(a: Article, lang: Lang, hrefPrefix: string): string {
  const s = STRINGS[lang];
  return `<a class="card" href="${hrefPrefix}a/${a.id}.html">
  <div class="cat">${escapeHtml(s.categories[a.category] ?? a.category)}</div>
  <h3>${escapeHtml(a.titleKey[lang])}</h3>
  <p>${escapeHtml(a.summaryKey[lang])}</p>
  <div class="meta">${a.readingTimeMinutes} ${s.minutes}</div>
</a>`;
}

function sortArticles(list: Article[]): Article[] {
  return [...list].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999) || a.category.localeCompare(b.category)
  );
}

function buildIndex(lang: Lang): string {
  const s = STRINGS[lang];
  const isRu = lang === 'ru';
  const base = isRu ? '' : '../';
  const cats = sortArticles(articles.filter(a => a.species === 'cat' || !a.species));
  const dogs = sortArticles(articles.filter(a => a.species === 'dog'));
  const shared = sortArticles(articles.filter(a => a.species === 'all'));

  const section = (title: string, list: Article[]) =>
    list.length > 0
      ? `<h2 class="section">${escapeHtml(title)}</h2>\n<div class="grid">\n${list
          .map(a => articleCard(a, lang, ''))
          .join('\n')}\n</div>`
      : '';

  const body = `
<section class="hero">
  <h1>${escapeHtml(s.tagline)}</h1>
  <p>${escapeHtml(s.heroLead)}</p>
  <div class="cta-row">
    <a class="btn btn-primary" href="${PLAY_URL}">${s.downloadPlay}</a>
    <a class="btn btn-primary" href="${RUSTORE_URL}">${s.downloadRuStore}</a>
    <a class="btn btn-outline" href="${GITHUB_URL}">${s.github}</a>
  </div>
</section>
${section(s.catSection, cats)}
${section(s.dogSection, dogs)}
${section(s.sharedSection, shared)}
<div class="disclaimer">${escapeHtml(s.disclaimer)}</div>`;

  return pageShell({
    lang,
    title: s.siteTitle,
    description: s.tagline,
    cssHref: `${base}style.css`,
    canonical: isRu ? SITE_URL : `${SITE_URL}en/`,
    altHref: isRu ? `${SITE_URL}en/` : SITE_URL,
    altLang: isRu ? 'en' : 'ru',
    homeHref: 'index.html',
    langSwitchHref: isRu ? 'en/index.html' : '../index.html',
    body,
  });
}

function buildArticlePage(a: Article, lang: Lang): string {
  const s = STRINGS[lang];
  const isRu = lang === 'ru';
  const base = isRu ? '../' : '../../';
  const related = (a.relatedArticleIds ?? [])
    .map(id => articles.find(x => x.id === id))
    .filter((x): x is Article => !!x);

  const body = `
<article>
  <p><a href="${base}${isRu ? '' : 'en/'}index.html">${s.backToList}</a></p>
  <h1>${escapeHtml(a.titleKey[lang])}</h1>
  <div class="meta">${escapeHtml(s.categories[a.category] ?? a.category)} · ${a.readingTimeMinutes} ${s.minutes}</div>
  ${mdToHtml(a.contentKey[lang])}
  ${
    related.length > 0
      ? `<h2>${s.related}</h2><ul>${related
          .map(r => `<li><a href="${r.id}.html">${escapeHtml(r.titleKey[lang])}</a></li>`)
          .join('')}</ul>`
      : ''
  }
  ${
    a.references && a.references.length > 0
      ? `<div class="refs"><strong>${s.references}:</strong><ul>${a.references
          .map(r => `<li>${escapeHtml(r[lang])}</li>`)
          .join('')}</ul></div>`
      : ''
  }
</article>
<div class="cta-row" style="margin-top:22px">
  <a class="btn btn-primary" href="${PLAY_URL}">${s.downloadPlay}</a>
  <a class="btn btn-primary" href="${RUSTORE_URL}">${s.downloadRuStore}</a>
</div>
<div class="disclaimer">${escapeHtml(s.disclaimer)}</div>`;

  const canonical = `${SITE_URL}${isRu ? '' : 'en/'}a/${a.id}.html`;
  const altHref = `${SITE_URL}${isRu ? 'en/' : ''}a/${a.id}.html`;

  return pageShell({
    lang,
    title: `${a.titleKey[lang]} — DiaPet`,
    description: a.summaryKey[lang],
    cssHref: `${base}style.css`,
    canonical,
    altHref,
    altLang: isRu ? 'en' : 'ru',
    homeHref: `${base}${isRu ? '' : 'en/'}index.html`,
    langSwitchHref: `${base}${isRu ? 'en/' : ''}a/${a.id}.html`,
    body,
  });
}

function buildSitemap(): string {
  const urls: string[] = [SITE_URL, `${SITE_URL}en/`];
  for (const a of articles) {
    urls.push(`${SITE_URL}a/${a.id}.html`);
    urls.push(`${SITE_URL}en/a/${a.id}.html`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`;
}

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------

function write(rel: string, content: string): void {
  const p = path.join(OUT_DIR, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
}

function main(): void {
  // Clean ONLY generator-owned paths. docs/ also hosts hand-authored files
  // (docs/assets/*, docs/medical/*) — an unconditional rm of docs/ would
  // silently delete them.
  //
  // NB: the legal pages the APP links to are the ones at the REPO ROOT
  // (assets/privacy-policy.html, assets/terms-of-service.html) — verified by
  // fetching https://kur0sava.github.io/diapet/assets/privacy-policy.html.
  // docs/assets/ IS publicly reachable too (/diapet/docs/assets/...), so the
  // stale duplicates that used to sit there published a second, contradicting
  // privacy policy. They are now redirect stubs pointing at the canonical
  // pages — keep it that way. See src/shared/config/legal.ts for the live URLs.
  for (const owned of ['a', 'en', 'index.html', 'style.css', 'sitemap.xml', 'robots.txt']) {
    fs.rmSync(path.join(OUT_DIR, owned), { recursive: true, force: true });
  }

  write('style.css', CSS);
  write('.nojekyll', '');
  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}sitemap.xml\n`);
  write('sitemap.xml', buildSitemap());

  write('index.html', buildIndex('ru'));
  write('en/index.html', buildIndex('en'));
  for (const a of articles) {
    write(`a/${a.id}.html`, buildArticlePage(a, 'ru'));
    write(`en/a/${a.id}.html`, buildArticlePage(a, 'en'));
  }

  console.log(`Generated ${articles.length} articles × 2 languages → ${OUT_DIR}`);
}

main();
