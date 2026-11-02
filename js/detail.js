// Moto Ijo · model page (v7, 1 Nov 2026). Two entry points, one renderer:
//  - goda-<slug>.html: static page written by tools/prerender.mjs, <body data-slug="<slug>">. The article already holds
//    the markup pageHTML() makes (data-html = its hash), so this script keeps it (no second paint) and only wires the
//    sticky bar. When data or code changed after the last prerender, the hash differs and the page renders fresh.
//  - produk-detail.html?m=<slug>: the older JS route. Renders the same page and points the canonical at goda-<slug>.html.
// The model stage is the hero (price + actions above the fold), then the brochure photo, the full spec list from
// data/models.js, a short Q&A built from the same data (also the FAQPage JSON-LD on the static page), related models
// from the same series and the "Belum yakin?" block. Null values in the data do not render.
// CTA pass (1 Nov 2026): one test ride control and one WhatsApp control per screen. The bar has one button (test ride) and
// a quiet WhatsApp link; on wide screens it takes turns with the nav (whose own button is "Jadwalkan test ride").
import { MODELS, SERIES, bySlug } from '../data/models.js';
import { SITE, CICIL, cicilan, wa, icon, arrow, MITRA, mitraBy, mitraWords } from './site.js';
import { esc, stageHTML, swatchesHTML, fmt, waStock, testRideHref, detailHref, seriesLabel } from './stage.js';
import { cardHTML, askHTML, quietFloat, fill } from './produk.js';

export const ORIGIN = 'https://motoijo.com/';
const TEST_RIDE_HOURS = 'jam 09.00 sampai 15.00';   // client, 22 Okt 2026 (docs/facts.md): test ride gratis, slot 09.00–15.00
const rupiah = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const lower = s => s.charAt(0).toLowerCase() + s.slice(1);
const soft = s => /^[A-Z][a-z]+([\s-]|$)/.test(s) ? lower(s) : s;   // "Cakram ganda" → "cakram ganda", "NFC" and "IoT Start" stay
const pct = x => String(Math.round(x * 10000) / 100).replace('.', ',');
const rangeWords = m => m.rangeKm == null ? null : `${m.rangeApprox ? 'sekitar ' : ''}${m.rangeKm} km`;

// title (≤ 60) and description (120–155): the first candidate that fits wins; the same values go into the static <head>
export function metaFor(m) {
  const full = `${m.name}${m.type ? ' ' + m.type : ''}`;
  const titles = [`${full}: ${m.price ? 'harga dan spesifikasi' : 'spesifikasi dan warna'} | Moto Ijo`, `${full} | Moto Ijo`];
  const title = titles.find(t => t.length <= 60) || titles[titles.length - 1];
  const specs = [rangeWords(m) && `jarak tempuh ${rangeWords(m)}`, m.speedKmh && `kecepatan ${m.speedKmh} km/jam`, m.powerW && `motor ${m.powerW} W`].filter(Boolean).join(', ');
  const price = m.price ? `Mulai ${m.price}.` : 'Tanya harga lewat WhatsApp.';
  const descs = [
    `${full}: ${specs}. ${price} Test ride gratis di Moto Ijo, Palmerah, Jakarta Barat.`,
    `${full}: ${specs}. ${price} Test ride gratis di Moto Ijo Palmerah.`,
    `${full}: ${specs}. ${price} Coba di Moto Ijo Palmerah.`,
    `${full}, ${seriesLabel(m)}: ${specs}, baterai ${m.battery}. ${price} Test ride gratis di Moto Ijo, Palmerah, Jakarta Barat.`,
    `${full}, ${seriesLabel(m)}: ${specs}, baterai ${m.battery}. ${price} Test ride gratis di Moto Ijo Palmerah.`,
  ];
  const fits = d => d.length >= 120 && d.length <= 155;
  const desc = descs.find(fits) || descs.filter(d => d.length <= 155).sort((a, b) => b.length - a.length)[0] || descs[0].slice(0, 155);
  return { title, desc, canonical: ORIGIN + detailHref(m), image: ORIGIN + (m.life || m.img) };
}

// breadcrumb, shown on the page and mirrored as BreadcrumbList JSON-LD by tools/prerender.mjs
export const crumbs = m => [
  { name: 'Beranda', href: 'index.html', url: ORIGIN },
  { name: 'Produk', href: 'produk.html', url: ORIGIN + 'produk.html' },
  { name: SERIES[m.series].label, href: `produk.html#${m.series}`, url: ORIGIN + `produk.html#${m.series}` },
  { name: m.short, url: ORIGIN + detailHref(m) },
];

// Q&A from the data only: { q, a (HTML), link (optional, not a test ride or WhatsApp control: the bar and the closing block
// carry those, one of each per screen) }. Shown on the page;
// tools/prerender.mjs copies the visible question and answer text (not the action link) into the FAQPage JSON-LD.
export function faqItems(m) {
  const items = [];
  items.push(m.price
    ? { q: `Berapa harga ${m.name}?`, a: `Mulai ${esc(m.price)}, menurut ${esc(m.priceSource || 'daftar harga Moto Ijo')}. Tanya harga terbaru dan stok lewat WhatsApp ${SITE.waDisplay}.` }
    : { q: `Berapa harga ${m.name}?`, a: `Harganya belum ada di daftar harga kami. Tanya harga dan stok lewat WhatsApp ${SITE.waDisplay}.` });
  if (m.rangeKm != null || m.speedKmh != null) {
    const parts = [m.rangeKm != null && `jarak tempuhnya ${rangeWords(m)}`, m.speedKmh != null && `kecepatan maksimalnya ${m.speedKmh} km/jam`].filter(Boolean);
    items.push({ q: `Berapa jarak tempuh dan kecepatan ${m.name}?`, a: `${parts.join(' dan ').replace(/^./, c => c.toUpperCase())}, menurut brosur Moto Ijo edisi September 2026.` });
  }
  if (m.battery || m.powerW) {
    const extra = [m.brake && `Remnya ${soft(m.brake)}.`, m.tyre && `Bannya ${soft(m.tyre)}.`, m.features?.length && `Fiturnya: ${m.features.map(soft).join(', ')}.`].filter(Boolean).join(' ');
    items.push({ q: `Baterai dan motor apa yang dipakai ${m.name}?`, a: `${[m.battery && `Baterai ${esc(m.battery)}`, m.powerW && `motor listrik ${m.powerW} W`].filter(Boolean).join(' dan ')}.${extra ? ' ' + esc(extra) : ''}` });
  }
  items.push({ q: `Di mana bisa test ride ${m.name}?`, a: `Di showroom Moto Ijo, ${esc(SITE.address)}, ${esc(lower(SITE.landmark))}. Test ride gratis, setiap hari ${TEST_RIDE_HOURS}. Kami konfirmasi jadwalnya lewat WhatsApp.` });
  if (m.priceNum) {
    const dp = Math.round(m.priceNum * CICIL.dpPct / 100);
    const r = cicilan(m.priceNum, dp, CICIL.tenor);
    items.push({ q: `Berapa cicilan ${m.name} per bulan?`, a: `Contohnya, dengan DP ${CICIL.dpPct}% (${rupiah(dp)}) dan tenor ${CICIL.tenor} bulan, cicilannya sekitar ${rupiah(r.bulan)} per bulan. Itu lewat Kredivo, dengan bunga ${pct(CICIL.rate)}% per bulan dan biaya penanganan ${pct(CICIL.handling)}%. Lewat BSI Hasanah Card (cicilan 0%), sekitar ${rupiah(cicilan(m.priceNum, dp, CICIL.tenor, mitraBy('bsi')).bulan)} per bulan, belum termasuk ujrah kartu. Bisa juga lewat Shopee PayLater. Angka akhir dari penyedia cicilannya.`, link: `<a class="link" href="simulasi-cicilan.html?m=${m.slug}">Hitung cicilan ${esc(m.short)}${icon('arrow-right')}</a>` });
  }
  return items;
}

const specRows = m => [
  ['Seri', seriesLabel(m)],
  ['Tipe', m.type],
  ['Jarak tempuh', fmt.range(m)?.plain],
  ['Kecepatan', fmt.speed(m)?.plain],
  ['Baterai', m.battery],
  ['Motor', fmt.power(m)?.plain],
  ['Rem', m.brake],
  ['Ban', m.tyre],
  ['Fitur', m.features?.length ? m.features.join(', ') : null],
].filter(([, v]) => v != null && v !== '');
// phones (≤ 700 px, css/produk.css) show these four rows and fold the rest behind "Lihat semua spesifikasi"
const KEY_SPECS = new Set(['Jarak tempuh', 'Kecepatan', 'Baterai', 'Motor']);

// up to 4 others from the same series, closest in price first (catalogue order when there is no price)
function related(m) {
  const pool = MODELS.filter(x => x.series === m.series && x.slug !== m.slug);
  const idx = x => MODELS.indexOf(x);
  const d = x => (m.priceNum != null && x.priceNum != null) ? Math.abs(x.priceNum - m.priceNum) : 1e12 + Math.abs(idx(x) - idx(m));
  return [...pool].sort((a, b) => d(a) - d(b)).slice(0, 4).sort((a, b) => idx(a) - idx(b));
}

// the whole article as one string (also what tools/prerender.mjs writes into goda-<slug>.html)
export function pageHTML(m) {
  const s = SERIES[m.series];
  const rel = related(m);
  const rows = specRows(m);
  const cr = crumbs(m);
  return `
  <div class="pd-hero">
    <div class="wrap">
      <nav class="pd-crumb" aria-label="Lokasi halaman">
        ${cr.slice(0, -1).map(c => `<a href="${c.href}">${esc(c.name)}</a>${icon('chevron-right')}`).join('\n        ')}
        <span aria-current="page">${esc(cr[cr.length - 1].name)}</span>
      </nav>
      ${stageHTML(m, { h: 'h1', eager: true, detail: false, id: 'pd-h' })}
    </div>
  </div>

  ${m.life ? `<div class="wrap pd-life-wrap${m.life === m.img ? ' pd-life-wrap--dup' : ''}"><figure class="pd-life"><img src="${esc(m.life)}" srcset="${esc(m.life.replace(/\.webp$/, '-600.webp'))} 600w, ${esc(m.life)} 1200w" sizes="(max-width: 1440px) 94vw, 1344px" alt="${esc(m.name)} dalam brosur GODA" width="1200" height="531" loading="lazy" decoding="async"></figure></div>` : ''}

  <section class="pd-spec" aria-labelledby="spec-h">
    <div class="wrap pd-spec__in">
      <div class="pd-spec__head">
        <h2 class="pd-h2" id="spec-h">Spesifikasi ${esc(m.short)}</h2>
        ${m.priceNum ? `<a class="link pd-cicil" href="simulasi-cicilan.html?m=${m.slug}">${icon('calculator')}Hitung cicilan${icon('arrow-right')}</a>` : ''}
      </div>
      <dl class="spec" id="spec-${m.slug}">
        ${rows.map(([k, v]) => `<div class="spec__row${KEY_SPECS.has(k) ? ' spec__row--key' : ''}"><dt>${k}</dt><dd class="num">${esc(v)}</dd></div>`).join('')}
        ${m.colors?.length ? `<div class="spec__row spec__row--sw"><dt>Warna</dt><dd>${swatchesHTML(m, { names: true })}</dd></div>` : ''}
      </dl>
      ${rows.some(([k]) => !KEY_SPECS.has(k)) || m.colors?.length ? `<button class="pd-more" type="button" data-more hidden aria-expanded="false" aria-controls="spec-${m.slug}">Lihat semua spesifikasi${icon('chevron-down')}</button>` : ''}
    </div>
  </section>

  <section class="pd-spec pd-faq" aria-labelledby="faq-h">
    <div class="wrap pd-spec__in">
      <div class="pd-spec__head">
        <h2 class="pd-h2" id="faq-h">Tanya jawab soal ${esc(m.short)}</h2>
      </div>
      <div class="pd-qa">
        ${faqItems(m).map((x, i) => `<div class="pd-qa__i"><h3 class="pd-qa__q" id="pd-qa-${i}">${esc(x.q)}</h3><button class="pd-qa__tg" type="button" data-qa hidden aria-expanded="false" aria-controls="pd-qa-${i}-a" aria-labelledby="pd-qa-${i}">${icon('plus')}</button><p class="pd-qa__a" id="pd-qa-${i}-a">${x.a}</p>${x.link || ''}</div>`).join('\n        ')}
      </div>
    </div>
  </section>

  ${rel.length ? `<section class="pd-rel" aria-labelledby="rel-h">
    <div class="wrap">
      <div class="pd-head">
        <h2 class="pd-h2" id="rel-h">Model lain di ${esc(s.label)}</h2>
        <a class="link" href="produk.html">Semua model${icon('arrow-right')}</a>
      </div>
      <ul class="rel-grid">${rel.map(x => cardHTML(x, { h: 'h3' })).join('')}</ul>
    </div>
  </section>` : ''}

  <section class="ask pd-ask" aria-labelledby="ask-h">${askHTML({
    h: `Mau coba ${esc(m.short)} dulu?`,
    p: 'Datang ke showroom Palmerah. Test ride gratis.',
    tr: testRideHref(m),
    waText: `Halo Moto Ijo, saya mau tanya soal ${m.name}.`,
  })}</section>

  <div class="buybar f-aspal" data-buybar inert>
    <div class="wrap buybar__in">
      <img class="buybar__img" src="${esc(m.img)}" alt="" width="80" height="60" onerror="this.remove()">
      <p class="buybar__name"><span>${esc(m.name)}</span><span class="num">${m.price ? `Mulai ${esc(m.price)}` : 'Harga lewat WhatsApp'}</span></p>
      <a class="link buybar__wa" href="${waStock(m)}" target="_blank" rel="noopener">${icon('brand-whatsapp')}<span class="t">${m.price ? 'Tanya stok' : 'Tanya harga'}</span><span class="sr"> ${esc(m.name)} lewat WhatsApp</span></a>
      <a class="btn btn--sm buybar__go" href="${testRideHref(m)}"><span class="bb-l">Jadwalkan test ride</span><span class="bb-s">Test ride</span>${arrow()}</a>
    </div>
  </div>`;
}

/* ---------- runtime (only in a page with the article) ---------- */
const root = typeof document !== 'undefined' && document.querySelector('[data-detail]');

function setMeta({ title, desc, canonical }) {
  document.title = title;
  const set = (sel, attr, v) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, v); };
  set('meta[name="description"]', 'content', desc);
  set('meta[property="og:title"]', 'content', title);
  set('meta[property="og:description"]', 'content', desc);
  set('meta[name="twitter:title"]', 'content', title);
  set('meta[name="twitter:description"]', 'content', desc);
  if (canonical) { set('link[rel="canonical"]', 'href', canonical); set('meta[property="og:url"]', 'content', canonical); }
}

function render(m) {
  setMeta(metaFor(m));
  const html = pageHTML(m);
  fill(root, html);   // static page made from the current data and code: the markup stays as it is

  // sticky action bar: on once the stage buttons leave the top of the screen, off over the closing block.
  // Wide screens (nav button shown, shell.css > 1240px): off while the nav is in view, so one test ride button shows at a time.
  const bar = root.querySelector('[data-buybar]'); const cta = root.querySelector('[data-stage-cta]'); const end = root.querySelector('.pd-ask');
  const wide = matchMedia('(min-width: 1241px)'), body = document.body;
  let pastCta = false, atEnd = false, navUp = false;
  const sync = () => { const on = pastCta && !atEnd && !(wide.matches && navUp); bar.classList.toggle('is-on', on); bar.inert = !on; body.classList.toggle('has-buybar', on); };
  const readNav = () => { const up = !body.classList.contains('nav-away'); if (up !== navUp) { navUp = up; sync(); } };
  if (cta) new IntersectionObserver(([e]) => { pastCta = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }).observe(cta);
  new IntersectionObserver(([e]) => { atEnd = e.isIntersecting || e.boundingClientRect.top < 0; sync(); }, { rootMargin: '0px 0px -30% 0px' }).observe(end);
  new MutationObserver(readNav).observe(body, { attributes: true, attributeFilter: ['class'] });
  wide.addEventListener('change', sync);
  readNav();
  quietFloat();

  // phones only (the controls are [hidden] above 700 px, css/produk.css): the spec list folds to its key rows and
  // the Q&A to its questions. The full text stays in the page, so crawlers and the FAQPage JSON-LD read the same words.
  const more = root.querySelector('[data-more]');
  if (more) more.addEventListener('click', () => {
    const on = more.getAttribute('aria-expanded') !== 'true';
    more.setAttribute('aria-expanded', on);
    root.querySelector('.spec').classList.toggle('is-all', on);
  });
  const qaToggle = it => { const b = it.querySelector('[data-qa]'); const on = !it.classList.contains('is-open'); it.classList.toggle('is-open', on); b.setAttribute('aria-expanded', on); };
  root.querySelectorAll('.pd-qa__i').forEach(it => {
    it.querySelector('[data-qa]')?.addEventListener('click', () => qaToggle(it));
    it.querySelector('.pd-qa__q').addEventListener('click', () => { if (it.querySelector('[data-qa]')?.offsetParent) qaToggle(it); });
  });
}

function fallback() {
  setMeta({ title: 'Model tidak ditemukan | Moto Ijo', desc: `Model itu tidak ada di katalog Moto Ijo. Lihat ${MODELS.length} model GODA atau tanya lewat WhatsApp.` });
  const r = document.createElement('meta'); r.name = 'robots'; r.content = 'noindex'; document.head.appendChild(r);
  root.innerHTML = `<section class="pd-miss">
    <div class="wrap pd-miss__in">
      <h1 class="pd-h1">Model tidak ditemukan</h1>
      <p class="t-lead">Model itu tidak ada di katalog kami. Pilih dari ${MODELS.length} model GODA, atau tanya lewat WhatsApp.</p>
      <div class="btns">
        <a class="btn" href="produk.html">Lihat semua model${arrow()}</a>
        <a class="link" href="${wa()}" target="_blank" rel="noopener">${icon('brand-whatsapp')}Tanya lewat WhatsApp</a>
      </div>
    </div>
  </section>`;
}

if (root) {
  const slug = document.body.dataset.slug || new URLSearchParams(location.search).get('m');
  const m = slug && bySlug(slug);
  if (m) render(m); else fallback();
}
