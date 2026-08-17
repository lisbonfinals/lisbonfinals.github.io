import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = 'https://www.lisbonfinals.com';
const pages = ['index.html', 'data.html', 'archive.html', 'noise-report.html', 'log.html', 'about.html', 'host-a-node.html'];

const localizedMeta = {
  en: {
    'index.html': ['Lisbon Finals — Every plane over my Lisbon terrace', 'An autonomous terrace station in Lisbon photographing aircraft and recording local noise, vibration and air-quality observations.'],
    'data.html': ['Data — Lisbon Finals · LPPT Intelligence', 'Live flight detections and independent local acoustic observations below the Lisbon Airport approach corridor.'],
    'archive.html': ['Archive — Lisbon Finals', 'Explore the Lisbon Finals historical dataset by aircraft, airline, night operations, noise, vibration and air quality.'],
    'noise-report.html': ['Noise Report — Lisbon Finals', 'Monthly independent acoustic observations from one Lisbon terrace below the LPPT approach corridor.'],
    'log.html': ["Captain's Log — Lisbon Finals", 'Technical updates, field notes and rare aircraft observations from the Lisbon Finals terrace station.'],
    'about.html': ['About — Lisbon Finals', 'How the independent Lisbon Finals terrace station detects, photographs and measures aircraft.'],
    'host-a-node.html': ['Host a Node — Lisbon Finals', 'Live below a flight path? Discover what it takes to host an independent Finals Network observation node.']
  },
  pt: {
    'index.html': ['Lisbon Finals — Cada avião sobre uma varanda em Lisboa', 'Uma estação autónoma numa varanda em Lisboa que fotografa aeronaves e regista localmente ruído, vibração e qualidade do ar.'],
    'data.html': ['Dados — Lisbon Finals · Observação LPPT', 'Deteções de voos e observações acústicas locais independentes sob o corredor de aproximação do Aeroporto de Lisboa.'],
    'archive.html': ['Arquivo — Lisbon Finals', 'Explora o histórico do Lisbon Finals por aeronave, companhia, operações noturnas, ruído, vibração e qualidade do ar.'],
    'noise-report.html': ['Relatório de Ruído — Lisbon Finals', 'Observações acústicas mensais independentes a partir de uma varanda sob o corredor de aproximação LPPT.'],
    'log.html': ['Diário do Capitão — Lisbon Finals', 'Atualizações técnicas, notas de campo e observações raras da estação Lisbon Finals.'],
    'about.html': ['Sobre o projeto — Lisbon Finals', 'Como a estação independente Lisbon Finals deteta, fotografa e mede aeronaves a partir de uma varanda em Lisboa.'],
    'host-a-node.html': ['Instalar um nó — Lisbon Finals', 'Vives sob um corredor aéreo? Descobre o que é necessário para instalar um nó independente da Finals Network.']
  },
  fr: {
    'index.html': ['Lisbon Finals — Chaque avion au-dessus de ma terrasse', 'Une station autonome installée sur une terrasse à Lisbonne qui photographie les avions et mesure localement bruit, vibrations et qualité de l’air.'],
    'data.html': ['Données — Lisbon Finals · Observatoire LPPT', 'Détections de vols et observations acoustiques locales indépendantes sous le couloir d’approche de l’aéroport de Lisbonne.'],
    'archive.html': ['Archives — Lisbon Finals', 'Explore les observations historiques de Lisbon Finals par avion, compagnie, opérations nocturnes, bruit, vibrations et qualité de l’air.'],
    'noise-report.html': ['Rapport de bruit — Lisbon Finals', 'Observations acoustiques mensuelles indépendantes depuis une terrasse sous le couloir d’approche LPPT.'],
    'log.html': ['Journal du Capitaine — Lisbon Finals', 'Mises à jour techniques, notes de terrain et observations rares de la station Lisbon Finals.'],
    'about.html': ['À propos — Lisbon Finals', 'Comment la station indépendante Lisbon Finals détecte, photographie et mesure les avions depuis une terrasse à Lisbonne.'],
    'host-a-node.html': ['Héberger un nœud — Lisbon Finals', 'Tu habites sous un couloir aérien ? Découvre ce qu’il faut pour installer un nœud indépendant de la Finals Network.']
  }
};

const esc = value => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const slugify = value => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

function pagePath(lang, file) {
  const suffix = file === 'index.html' ? '' : file;
  return lang === 'en' ? `/${suffix}` : `/${lang}/${suffix}`;
}

function replaceMeta(html, lang, file) {
  const [title, description] = localizedMeta[lang][file];
  const url = base + pagePath(lang, file);
  return html
    .replace(/<html lang="[^"]+">/, `<html lang="${lang === 'pt' ? 'pt-PT' : lang}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(description)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(description)}">`);
}

async function buildLocalizedPages() {
  for (const lang of ['pt', 'fr']) {
    const out = path.join(root, lang);
    await fs.mkdir(out, { recursive: true });
    for (const file of pages) {
      const source = await fs.readFile(path.join(root, file), 'utf8');
      await fs.writeFile(path.join(out, file), replaceMeta(source, lang, file));
    }
  }
}

const CAT_META = {
  fix:       { emoji: '🛠️', label: 'Fix' },
  capture:   { emoji: '📸', label: 'Capture' },
  hardware:  { emoji: '⚙️', label: 'Hardware' },
  rare:      { emoji: '✈️', label: 'Rare Find' },
  stats:     { emoji: '📊', label: 'Stats' },
  note:      { emoji: '📝', label: 'Note' },
  milestone: { emoji: '🏆', label: 'Milestone' }
};

function chromeStyles() {
  return `:root{--black:#07090d;--dark:#0a0d12;--dark2:#0d1117;--border:#1e2530;--amber:#f5a623;--white:#f0ede8;--sans:'Syne',sans-serif;--mono:'JetBrains Mono',monospace;--serif:'Instrument Serif',serif}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--dark);color:var(--white);font-family:var(--sans);overflow-x:hidden}
a:focus-visible,button:focus-visible{outline:2px solid var(--amber);outline-offset:4px}
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:20px 48px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(to bottom,rgba(7,9,13,.98),transparent);backdrop-filter:blur(4px)}
.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.nav-dot{width:28px;height:28px;border:1.5px solid var(--amber);border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative}
.nav-dot::after{content:'';width:10px;height:12px;background:var(--amber);position:absolute;top:50%;left:50%;transform:translate(-50%,-60%) rotate(-20deg);clip-path:polygon(50% 0%,65% 85%,50% 72%,35% 85%)}
.nav-wordmark{font-size:13px;font-family:var(--mono);font-weight:500;letter-spacing:.12em;color:var(--white);text-transform:uppercase}
.nav-wordmark span{color:var(--amber)}
.nav-links{display:flex;gap:36px;list-style:none;margin-left:auto}
.nav-links a{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:rgba(240,237,232,.55);text-decoration:none;transition:color .2s}
.nav-links a:hover,.nav-links a.nav-active{color:var(--amber)}
.nav-clock-wrap{display:flex;align-items:center;gap:14px;margin-left:36px;padding-left:20px;border-left:1px solid rgba(245,166,35,.12)}
.nav-clock{font-family:var(--mono);font-size:10px;letter-spacing:.1em;color:rgba(245,166,35,.45);white-space:nowrap}
.nav-clock-tz{font-size:8px;letter-spacing:.12em;color:rgba(245,166,35,.22);text-transform:uppercase;margin-left:5px}
.nav-burger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:4px;margin-left:12px}
.nav-burger span{display:block;width:22px;height:1.5px;background:var(--white);border-radius:2px}
.nav-drawer{display:none;flex-direction:column;gap:32px;position:fixed;inset:0;z-index:99;background:rgba(7,9,13,.97);backdrop-filter:blur(12px);align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .25s}
.nav-drawer.open{display:flex;opacity:1;pointer-events:all}
.nav-drawer a{font-family:var(--mono);font-size:14px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:rgba(240,237,232,.6);text-decoration:none;transition:color .2s}
.nav-drawer a:hover{color:var(--white)}
@media (max-width:1150px){.nav-links{display:none}.nav-burger{display:flex}}
@media (max-width:640px){nav{padding-left:20px;padding-right:20px}.nav-clock-wrap{margin-left:auto;padding-left:14px;gap:8px}.nav-clock{display:none}}
.page-footer{border-top:1px solid var(--border);padding:32px 48px;max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.footer-left{font-family:var(--mono);font-size:9px;color:rgba(240,237,232,.28);letter-spacing:.08em}
.footer-back{font-family:var(--mono);font-size:10px;color:var(--amber);text-decoration:none;letter-spacing:.08em}
.footer-back:hover{text-decoration:underline}
@media(max-width:640px){.page-footer{padding:24px 20px}}
.article-shell{width:min(760px,calc(100% - 40px));margin:0 auto;padding:150px 0 90px}
.back-link{display:inline-block;font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:rgba(240,237,232,.4);text-decoration:none;margin-bottom:28px;transition:color .2s}
.back-link:hover{color:var(--amber)}
.article-kicker{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:20px}
.article-date{font-family:var(--mono);font-size:10px;letter-spacing:.1em;color:rgba(240,237,232,.33)}
.log-cat{font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:3px 9px;border-radius:3px;border:1px solid rgba(240,237,232,0.1);color:rgba(240,237,232,0.5)}
.log-cat-fix{border-color:rgba(96,165,250,.3);color:#93c5fd}
.log-cat-capture{border-color:rgba(52,211,153,.3);color:#6ee7b7}
.log-cat-hardware{border-color:rgba(251,146,60,.3);color:#fdb57a}
.log-cat-rare{border-color:rgba(245,166,35,.4);color:var(--amber)}
.log-cat-stats{border-color:rgba(167,139,250,.3);color:#c4b5fd}
.log-cat-note{border-color:rgba(240,237,232,.15);color:rgba(240,237,232,.5)}
.log-cat-milestone{background:var(--amber);border-color:var(--amber);color:#000;font-weight:800;letter-spacing:.18em}
.article-title{font-family:var(--sans);font-weight:800;font-size:clamp(32px,5.5vw,52px);line-height:1.1;letter-spacing:-.02em;color:var(--white)}
.article-rule{height:1px;background:var(--border);margin:32px 0 40px}
.article-body{font-family:var(--sans);font-size:16px;line-height:1.85;color:rgba(240,237,232,.68)}
.article-body p{margin:0 0 24px}
.article-body p:last-child{margin-bottom:0}
.article-sig{margin-top:48px;padding-top:24px;border-top:1px solid var(--border);font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;color:rgba(240,237,232,.33)}
.method-note{margin-top:24px;padding:18px 20px;border-left:2px solid var(--amber);color:rgba(240,237,232,.45);font-size:13px;line-height:1.7;background:rgba(245,166,35,.03)}
.metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);margin:0 0 40px}
.metric-grid div{background:var(--dark2);padding:22px 16px}
.metric-grid b{display:block;font-family:var(--mono);font-size:26px;font-weight:500;color:var(--amber)}
.metric-grid span{display:block;font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(240,237,232,.35);margin-top:8px}
@media(max-width:640px){.metric-grid{grid-template-columns:repeat(2,1fr)}.article-shell{padding:130px 0 70px}}
.dl-btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;letter-spacing:.06em;color:var(--amber);background:transparent;border:1px solid rgba(245,166,35,.3);border-radius:3px;padding:10px 18px;text-decoration:none;margin-top:28px;transition:border-color .2s,background .2s}
.dl-btn:hover{border-color:rgba(245,166,35,.6);background:rgba(245,166,35,.06)}`;
}

function chromeNav(activeHref) {
  const links = [
    ['/', 'Live'], ['/data.html', 'Data'], ['/archive.html', 'Archive'],
    ['/noise-report.html', 'Noise Report'], ['/log.html', "Captain's Log"], ['/about.html', 'About']
  ];
  const navLinks = links.map(([href, label]) =>
    `<li><a href="${href}"${href === activeHref ? ' class="nav-active"' : ''}>${label}</a></li>`).join('');
  const drawerLinks = links.map(([href, label]) => `<a href="${href}" onclick="closeDrawer()">${label}</a>`).join('\n  ');
  return `<nav aria-label="Primary navigation">
  <a href="/" class="nav-logo"><div class="nav-dot"></div><span class="nav-wordmark">LISBON <span>FINALS</span></span></a>
  <ul class="nav-links">${navLinks}</ul>
  <div class="nav-clock-wrap"><span class="nav-clock" id="nav-clock">00:00:00<span class="nav-clock-tz">LIS</span></span></div>
  <button class="nav-burger" id="nav-burger" aria-label="Open menu" aria-controls="nav-drawer" aria-expanded="false"><span></span><span></span><span></span></button>
</nav>
<div class="nav-drawer" id="nav-drawer" aria-label="Mobile navigation">
  ${drawerLinks}
</div>`;
}

function chromeScript() {
  return `document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
const drawer = document.getElementById('nav-drawer');
function closeDrawer() {
  drawer.classList.remove('open');
  document.getElementById('nav-burger')?.setAttribute('aria-expanded', 'false');
}
document.getElementById('nav-burger').addEventListener('click', () => {
  const open = drawer.classList.toggle('open');
  document.getElementById('nav-burger')?.setAttribute('aria-expanded', open ? 'true' : 'false');
});
(function navClock(){
  const el = document.getElementById('nav-clock');
  if (!el) return;
  function tick(){
    const now = new Date();
    const s = now.toLocaleTimeString('pt-PT',{timeZone:'Europe/Lisbon',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
    el.innerHTML = s + '<span class="nav-clock-tz">LIS</span>';
  }
  tick();
  setInterval(tick, 1000);
})();`;
}

function articleTemplate(entry, slug) {
  const url = `${base}/journal/${slug}.html`;
  const description = (entry.body || entry.title).replace(/\s+/g, ' ').slice(0, 158);
  const paragraphs = String(entry.body || '').split(/\n\n|\n/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('\n');
  const cat = CAT_META[entry.category] || { emoji: '📝', label: entry.category || 'Field note' };
  const schema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: entry.title,
    datePublished: `${entry.date}T${entry.time || '12:00'}:00+01:00`, dateModified: `${entry.date}T${entry.time || '12:00'}:00+01:00`,
    mainEntityOfPage: url, url, author: { '@type': 'Person', name: 'The Captain' },
    publisher: { '@type': 'Organization', name: 'Lisbon Finals', url: `${base}/` },
    articleSection: entry.category || 'field note', inLanguage: 'en', spatialCoverage: 'Lisbon, Portugal'
  }).replaceAll('<', '\\u003c');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(entry.title)} — Lisbon Finals</title><meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/site-core.css"><script src="/site-core.js"><\/script>
<meta property="og:type" content="article"><meta property="og:title" content="${esc(entry.title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}">
<script type="application/ld+json">${schema}<\/script>
<style>${chromeStyles()}</style></head><body>
${chromeNav('/log.html')}
<main class="article-shell">
<a href="/log.html" class="back-link">← Captain's Log</a>
<div class="article-kicker"><span class="log-cat log-cat-${esc(entry.category || 'note')}">${cat.emoji} ${esc(cat.label)}</span><span class="article-date">${esc(entry.date)}${entry.time ? ' ' + esc(entry.time) : ''}</span></div>
<h1 class="article-title">${esc(entry.title)}</h1><div class="article-rule"></div>
<article class="article-body">${paragraphs}</article>
<div class="article-sig">— The Captain · 38°46'N · 009°08'W · Lisbon, Portugal</div>
</main>
<footer class="page-footer"><span class="footer-left">LISBON FINALS · lisbonfinals.com</span><a href="/log.html" class="footer-back">← All entries</a></footer>
<script>${chromeScript()}<\/script>
</body></html>`;
}

function reportTemplate(report, slug) {
  const url = `${base}/reports/${slug}.html`;
  const month = report.month_name || slug;
  const description = `Independent Lisbon Finals acoustic report for ${month} ${report.year}: ${report.total_flights} observed flights, ${report.avg_db} dB average and ${report.night_flights} night operations.`;
  const schema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Report', name: `Lisbon Finals Noise Report — ${month} ${report.year}`,
    datePublished: report.generated_at, url, description, inLanguage: 'en',
    publisher: { '@type': 'Organization', name: 'Lisbon Finals', url: `${base}/` },
    spatialCoverage: { '@type': 'Place', name: 'Lisbon, Portugal' },
    isBasedOn: `${base}/data.html`
  }).replaceAll('<', '\\u003c');
  const insight = String(report.insight || '').replace(/<(?!\/?strong\b)[^>]*>/gi, '');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Noise Report — ${esc(month)} ${report.year} · Lisbon Finals</title><meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/site-core.css"><script src="/site-core.js"><\/script>
<meta property="og:type" content="article"><meta property="og:title" content="Noise Report — ${esc(month)} ${report.year}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}">
<script type="application/ld+json">${schema}<\/script>
<style>${chromeStyles()}</style></head><body>
${chromeNav('/noise-report.html')}
<main class="article-shell">
<a href="/noise-report.html" class="back-link">← Noise Reports</a>
<div class="article-kicker"><span class="article-date">LPPT Lisbon · Independent monthly observation</span></div>
<h1 class="article-title">Noise Report <em style="font-family:var(--serif);font-weight:400;font-style:italic;color:rgba(240,237,232,.5)">${esc(month)} ${report.year}</em></h1>
<div class="article-rule"></div>
<section class="metric-grid"><div><b>${Number(report.total_flights || 0).toLocaleString('en')}</b><span>Observed flights</span></div><div><b>${esc(report.avg_db)} dB</b><span>Average SPL reading</span></div><div><b>${esc(report.max_db)} dB</b><span>Highest reading</span></div><div><b>${Number(report.night_flights || 0).toLocaleString('en')}</b><span>Night operations</span></div></section>
<article class="article-body"><p>${insight}</p></article>
<p class="method-note">Independent observations from one fixed residential terrace. These figures are not official airport totals or certified airport noise mapping.</p>
${report.pdf_url ? `<a class="dl-btn" href="${esc(report.pdf_url)}" target="_blank" rel="noopener noreferrer">Download the complete PDF report →</a>` : ''}
<div class="article-sig">Lisbon Finals · Local evidence · CC BY 4.0</div>
</main>
<footer class="page-footer"><span class="footer-left">LISBON FINALS · lisbonfinals.com</span><a href="/noise-report.html" class="footer-back">← All reports</a></footer>
<script>${chromeScript()}<\/script>
</body></html>`;
}

async function readJson(argument, fallbackUrl) {
  if (argument) return JSON.parse(await fs.readFile(argument, 'utf8'));
  const response = await fetch(fallbackUrl);
  if (!response.ok) throw new Error(`${fallbackUrl}: ${response.status}`);
  return response.json();
}

async function buildContent() {
  const journalData = await readJson(process.argv[2], 'https://gist.githubusercontent.com/lisbonfinals/2edb053ac9f9c91047c1b36f706d302c/raw/journal.json');
  const stats = await readJson(process.argv[3], 'https://gist.githubusercontent.com/lisbonfinals/2edb053ac9f9c91047c1b36f706d302c/raw/lisbon_finals.json');
  const entries = Array.isArray(journalData) ? journalData : journalData.entries || [];
  const reports = stats.reports || [];
  const journalOut = path.join(root, 'journal');
  const reportsOut = path.join(root, 'reports');
  await fs.mkdir(journalOut, { recursive: true });
  await fs.mkdir(reportsOut, { recursive: true });

  const journalPages = [];
  for (const entry of entries) {
    const slug = `${entry.date}-${slugify(entry.title)}`;
    await fs.writeFile(path.join(journalOut, `${slug}.html`), articleTemplate(entry, slug));
    journalPages.push({ loc: `${base}/journal/${slug}.html`, lastmod: entry.date, entry, slug });
  }
  const reportPages = [];
  for (const report of reports) {
    const slug = `${report.year}-${String(report.month).padStart(2, '0')}`;
    await fs.writeFile(path.join(reportsOut, `${slug}.html`), reportTemplate(report, slug));
    reportPages.push({ loc: `${base}/reports/${slug}.html`, lastmod: String(report.generated_at || '').slice(0, 10) || `${report.year}-${String(report.month).padStart(2, '0')}-01` });
  }

  const mainUrls = pages.flatMap(file => [
    { loc: base + (file === 'index.html' ? '/' : `/${file}`), lastmod: '2026-08-16' },
    ...['pt', 'fr'].map(lang => ({ loc: base + pagePath(lang, file), lastmod: '2026-08-16' }))
  ]);
  const allUrls = [...mainUrls, ...journalPages, ...reportPages];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls.map(item => `  <url><loc>${esc(item.loc)}</loc><lastmod>${item.lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`;
  await fs.writeFile(path.join(root, 'sitemap.xml'), sitemap);

  const feedEntries = journalPages.slice(0, 20).map(({ entry, loc }) => `<entry><title>${esc(entry.title)}</title><link href="${loc}"/><id>${loc}</id><updated>${entry.date}T${entry.time || '12:00'}:00+01:00</updated><summary>${esc(String(entry.body || '').replace(/\s+/g, ' ').slice(0, 280))}</summary></entry>`).join('\n');
  await fs.writeFile(path.join(root, 'feed.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><title>Lisbon Finals — Captain's Log</title><link href="${base}/feed.xml" rel="self"/><link href="${base}/log.html"/><id>${base}/log.html</id><updated>${entries[0]?.date || '2026-08-16'}T${entries[0]?.time || '12:00'}:00+01:00</updated>${feedEntries}</feed>\n`);
}

await buildLocalizedPages();
await buildContent();
console.log('Built 14 localized pages, static journal/report pages, sitemap.xml and feed.xml');
