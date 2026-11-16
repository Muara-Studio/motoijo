// Moto Ijo · stage.js (v6, 31 Okt 2026): the shared model stage and its parts, after second-ride.de's "Configure now" block.
// Usage: load css/stage.css on the page, then `import { stageHTML, metersHTML, swatchesHTML, priceHTML } from './stage.js'`.
// Every function takes one model object from data/models.js and returns an HTML string; nothing runs on import, so any page
// can use it. stageHTML(m, { h, eager, detail, tone, id }) is the big block: cut-out on a soft stage, series, name, type +
// tagline, price, meters, swatches, an orange "Tanya stok" WhatsApp button, "Jadwalkan test ride" (test-ride.html?m=<slug>)
// and a "Lihat detail" link (detail: false hides it; ride: false drops the test-ride button where the page carries its own;
// h: 'h1' on the detail page; eager: true for the LCP image;
// tone: 'dark' for an aspal ground). metersHTML(m, { compact }) draws jarak tempuh, kecepatan and motor as bars against MAX
// (bars are aria-hidden, the values are text). swatchesHTML(m, { names, compact }) lists m.colors as dots, names as labels.
// priceHTML(m) gives "Mulai Rp …" or, when price is null, a "Tanya harga" WhatsApp link. Null values never render.
// Helpers also exported: esc, fmt (text values), imgAttrs (src + fallback), waStock/waStockText, detailHref, testRideHref, seriesLabel. The stage's
// button row carries [data-stage-cta], so a page can watch it for a sticky action bar.
import { SERIES, MAX } from '../data/models.js';
import { wa, icon } from './site.js';

export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// model page = the static file tools/prerender.mjs writes per model (goda-<slug>.html, readable without JS; SEO 1 Nov 2026).
// produk-detail.html?m=<slug> still renders the same page and points its canonical here.
export const detailHref = m => `goda-${m.slug}.html`;
export const testRideHref = m => `test-ride.html?m=${m.slug}`;
export const seriesLabel = m => SERIES[m.series]?.label || m.category || '';

// image attributes for a model picture: a brochure photo (path in /brochure/) fills its box (class is-life); a cut-out
// that fails to load swaps once to m.life, so no broken box shows. Paths are reduced to safe characters.
const safePath = p => String(p || '').replace(/[^\w\/.\-]/g, '');
export const isPhoto = p => /\/brochure\//.test(p || '');
export function imgAttrs(m) {
  const life = safePath(m.life);
  const photo = isPhoto(m.img);
  const fb = life && !photo ? ` onerror="this.onerror=null;this.classList.add('is-life');this.src='${life}'"` : '';
  return `src="${safePath(m.img)}"${photo ? ' class="is-life"' : ''}${fb}`;
}

// WhatsApp texts: each one names the model
export const waStockText = m => m.price
  ? `Halo Moto Ijo, apakah ${m.name} ada stok di showroom Palmerah?`
  : `Halo Moto Ijo, berapa harga ${m.name} dan apakah ada stok?`;
export const waPriceText = m => `Halo Moto Ijo, berapa harga ${m.name}? Apakah ada stok?`;
export const waStock = m => wa(waStockText(m));

// spec values as text (null → null, so callers can skip the row)
const APPROX = '<span aria-hidden="true">±</span><span class="sr">sekitar </span>';
export const fmt = {
  range: m => m.rangeKm == null ? null : { v: `${m.rangeApprox ? APPROX : ''}${m.rangeKm}`, u: 'km', plain: `${m.rangeApprox ? '±' : ''}${m.rangeKm} km` },
  speed: m => m.speedKmh == null ? null : { v: `${m.speedKmh}`, u: 'km/jam', plain: `${m.speedKmh} km/jam` },
  power: m => m.powerW == null ? null : { v: `${m.powerW}`, u: 'W', plain: `${m.powerW} W` },
};
export const METERS = [
  { key: 'range', label: 'Jarak tempuh', field: 'rangeKm', max: () => MAX.rangeKm },
  { key: 'speed', label: 'Kecepatan', field: 'speedKmh', max: () => MAX.speedKmh },
  { key: 'power', label: 'Motor', field: 'powerW', max: () => MAX.powerW },
];

export function metersHTML(m, { compact = false } = {}) {
  const rows = METERS.map(k => {
    const f = fmt[k.key](m);
    if (!f) return '';
    const p = Math.max(0.04, Math.min(1, m[k.field] / k.max())).toFixed(3);
    return `<div class="mt mt--${k.key}">
      <dt class="mt__k">${k.label}</dt>
      <dd class="mt__v num">${f.v}<span class="mt__u"> ${f.u}</span></dd>
      <dd class="mt__bar" aria-hidden="true"><span class="mt__fill" style="--p:${p}"></span></dd>
    </div>`;
  }).join('');
  return rows ? `<dl class="meters${compact ? ' meters--compact' : ''}">${rows}</dl>` : '';
}

export function swatchesHTML(m, { names = false, compact = false } = {}) {
  const c = (m.colors || []).filter(x => x && x.hex);
  if (!c.length) return '';
  const label = `${c.length} pilihan warna ${m.name}`;
  return `<ul class="sw${compact ? ' sw--compact' : ''}${names ? ' sw--names' : ''}" aria-label="${esc(label)}">${c.map(x =>
    `<li class="sw__i" style="--c:${esc(x.hex)}" title="${esc(x.name)}"><span class="sw__dot" aria-hidden="true"></span><span class="${names ? 'sw__n' : 'sr'}">${esc(x.name)}</span></li>`
  ).join('')}</ul>`;
}

export function priceHTML(m, { cls = '' } = {}) {
  if (!m.price) return `<p class="st-price st-price--ask ${cls}">Harga lewat WhatsApp</p>`;   // the button below asks for price and stock (review 31 Okt: no double WhatsApp ask)
  return `<p class="st-price ${cls}"><span class="st-price__k">Mulai</span> <span class="st-price__v num">${esc(m.price)}</span></p>`;
}

export function stageHTML(m, { h = 'h2', eager = false, detail = true, ride = true, tone = 'light', id = `st-${m.slug}`, cls = '' } = {}) {
  const sub = [m.type ? `Tipe ${esc(m.type)}` : '', m.tagline ? esc(m.tagline) : ''].filter(Boolean).join('<span class="stage__sep" aria-hidden="true"> · </span>');
  return `<section class="stage${tone === 'dark' ? ' stage--dark' : ''} ${cls}" data-slug="${m.slug}" data-series="${m.series}" aria-labelledby="${id}">
    <div class="stage__pic">
      <img ${imgAttrs(m)} alt="${esc(m.name)}" width="800" height="600" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
    </div>
    <div class="stage__txt">
      <div class="stage__head">
        <p class="stage__series">${esc(seriesLabel(m))}</p>
        <${h} class="stage__name" id="${id}">${esc(m.name)}</${h}>
        ${sub ? `<p class="stage__sub">${sub}</p>` : ''}
      </div>
      ${priceHTML(m, { cls: 'stage__price' })}
      <div class="stage__spec">
        ${metersHTML(m)}
        ${swatchesHTML(m)}
      </div>
      <div class="stage__cta${ride ? '' : ' stage__cta--one'}" data-stage-cta>
        <a class="btn st-wa" href="${m.price ? waStock(m) : wa(waPriceText(m))}" target="_blank" rel="noopener">${icon('brand-whatsapp')}${m.price ? 'Tanya stok' : '<span class="st-long">Tanya harga dan stok</span><span class="st-short" aria-hidden="true">Tanya harga</span>'}<span class="sr"> ${esc(m.name)} lewat WhatsApp</span></a>
        ${ride ? `<a class="btn st-line" href="${testRideHref(m)}">${icon('calendar-event')}<span class="st-long">Jadwalkan test ride</span><span class="st-short" aria-hidden="true">Test ride</span></a>` : ''}
      </div>
      ${detail ? `<a class="link stage__more" href="${detailHref(m)}">Lihat detail<span class="sr"> ${esc(m.name)}</span>${icon('arrow-right')}</a>` : ''}
    </div>
  </section>`;
}
