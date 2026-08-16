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
    const assetOut = path.join(out, 'ressources');
    await fs.mkdir(assetOut, { recursive: true });
    await fs.copyFile(
      path.join(root, 'assets', 'host-node-aligned-a-16x9-v2.png'),
      path.join(assetOut, 'host-node-aligned-a-16x9-v2.png')
    );
  }
}

function articleTemplate(entry, slug) {
  const url = `${base}/journal/${slug}.html`;
  const description = (entry.body || entry.title).replace(/\s+/g, ' ').slice(0, 158);
  const paragraphs = String(entry.body || '').split(/\n\n|\n/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('\n');
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
<link rel="canonical" href="${url}"><link rel="stylesheet" href="/site-core.css">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(entry.title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}">
<script type="application/ld+json">${schema}</script>
<style>${staticStyles()}</style></head><body><header class="plain-nav"><a href="/">LISBON <b>FINALS</b></a><a href="/log.html">← Captain's Log</a></header>
<main class="article-shell"><div class="article-kicker">${esc(entry.category || 'Field note')} · ${esc(entry.date)} ${esc(entry.time || '')}</div>
<h1>${esc(entry.title)}</h1><div class="article-rule"></div><article>${paragraphs}</article>
<footer>— The Captain · 38°46'N · 009°08'W · Lisbon, Portugal</footer></main></body></html>`;
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
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Noise Report — ${esc(month)} ${report.year} · Lisbon Finals</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${url}"><link rel="stylesheet" href="/site-core.css">
<meta property="og:type" content="article"><meta property="og:title" content="Noise Report — ${esc(month)} ${report.year}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}">
<script type="application/ld+json">${schema}</script><style>${staticStyles()}</style></head><body><header class="plain-nav"><a href="/">LISBON <b>FINALS</b></a><a href="/noise-report.html">← Noise Reports</a></header>
<main class="article-shell"><div class="article-kicker">LPPT Lisbon · Independent monthly observation</div><h1>Noise Report<br><em>${esc(month)} ${report.year}</em></h1><div class="article-rule"></div>
<section class="metric-grid"><div><b>${Number(report.total_flights || 0).toLocaleString('en')}</b><span>Observed flights</span></div><div><b>${esc(report.avg_db)} dB</b><span>Average SPL reading</span></div><div><b>${esc(report.max_db)} dB</b><span>Highest reading</span></div><div><b>${Number(report.night_flights || 0).toLocaleString('en')}</b><span>Night operations</span></div></section>
<article><p>${insight}</p><p class="method-note">Independent observations from one fixed residential terrace. These figures are not official airport totals or certified airport noise mapping.</p></article>
${report.pdf_url ? `<a class="download" href="${esc(report.pdf_url)}" target="_blank" rel="noopener noreferrer">Download the complete PDF report →</a>` : ''}
<footer>Lisbon Finals · Local evidence · CC BY 4.0</footer></main></body></html>`;
}

function staticStyles() {
  return `:root{--bg:#07090d;--white:#f0ede8;--amber:#f5a623;--muted:rgba(240,237,232,.58);--border:rgba(245,166,35,.2)}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--white);font-family:Arial,sans-serif}.plain-nav{height:78px;padding:0 clamp(22px,5vw,74px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}.plain-nav a{color:var(--white);text-decoration:none;font:600 12px monospace;letter-spacing:.14em}.plain-nav b,.article-kicker,em{color:var(--amber)}.article-shell{width:min(820px,calc(100% - 40px));margin:0 auto;padding:90px 0}.article-kicker{font:11px monospace;letter-spacing:.14em;text-transform:uppercase}h1{font:clamp(48px,8vw,88px)/.96 Georgia,serif;font-weight:400;margin:24px 0}h1 em{font-weight:400}.article-rule{height:1px;background:var(--border);margin:38px 0}article{font:18px/1.8 Georgia,serif;color:rgba(240,237,232,.84)}article p{margin:0 0 26px}.method-note{padding:20px;border-left:2px solid var(--amber);color:var(--muted)}footer{margin-top:54px;padding-top:24px;border-top:1px solid var(--border);font:11px/1.7 monospace;color:var(--muted)}.metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 0 46px}.metric-grid div{padding:20px 14px;border:1px solid var(--border);background:rgba(245,166,35,.03)}.metric-grid b,.metric-grid span{display:block}.metric-grid b{font:28px Georgia,serif;color:var(--amber)}.metric-grid span{font:10px/1.4 monospace;color:var(--muted);margin-top:8px}.download{display:inline-block;margin-top:18px;padding:14px 18px;border:1px solid var(--amber);color:var(--amber);text-decoration:none;font:11px monospace;letter-spacing:.1em;text-transform:uppercase}@media(max-width:700px){.article-shell{padding:58px 0}.metric-grid{grid-template-columns:repeat(2,1fr)}}`;
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
