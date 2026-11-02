// Moto Ijo · produk (v6, 31 Okt 2026): katalog page + shared bits for detail and bandingkan.
// Line-up, prices and specs come only from data/models.js (13 models, 2 series). The model stage, meters, swatches and
// price live in js/stage.js. The katalog code runs only on body[data-page="produk"].
import { MODELS, SERIES, MAX, bySlug } from '../data/models.js';
import { SITE, wa, icon, arrow } from './site.js';
import { esc, metersHTML, swatchesHTML, priceHTML, detailHref, imgAttrs } from './stage.js';

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const SERIES_KEYS = Object.keys(SERIES);
export const inSeries = k => MODELS.filter(m => m.series === k);
const rupiah = n => 'Rp ' + n.toLocaleString('id-ID');
export const fromPrice = k => { const p = inSeries(k).map(m => m.priceNum).filter(n => n != null); return p.length ? rupiah(Math.min(...p)) : null; };

// Prerendered markup (tools/prerender.mjs) stays when it came from the same HTML string the script would write now:
// no second paint, no image swap. The key is a hash of that string, stamped as data-html on the container, so runtime
// decoration (js/motion.js adds the road and animates the meters before this runs) does not count as a change.
export const htmlKey = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); };
export function fill(el, html) { const k = htmlKey(html); if (el.dataset.html === k) return false; el.innerHTML = html; el.dataset.html = k; return true; }

// product card (katalog, related models): one action, the whole card opens the detail page (CTA pass, 1 Nov 2026:
// the per-card "Tanya stok" and "Detail" buttons are gone; WhatsApp stays one tap away in the float and the closing block)
export function cardHTML(m, { eager = false, h = 'h3' } = {}) {
  const href = detailHref(m);
  return `<li class="pc" data-slug="${m.slug}">
    <div class="pc__pic"><img ${imgAttrs(m)} width="800" height="600" alt="" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></div>
    <div class="pc__body">
      <div class="pc__head">
        <${h} class="pc__name"><a href="${href}"><span class="sr">GODA </span>${esc(m.short)}<span class="sr">, lihat detail</span></a></${h}>
        ${m.type ? `<p class="pc__type">Tipe ${esc(m.type)}</p>` : ''}
      </div>
      ${priceHTML(m, { cls: 'pc__price' })}
      ${metersHTML(m, { compact: true })}
      ${swatchesHTML(m, { compact: true })}
    </div>
  </li>`;
}

/* ---------- trust: one small proof list, values from SITE ---------- */
const STAR = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M 12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/></svg>';
export const PROOF = {
  rating: () => `<li class="is-star">${STAR}<span><a href="${SITE.maps}" target="_blank" rel="noopener">${esc(SITE.rating.replace(' Google Maps', ''))}</a> di Google Maps</span></li>`,
  alamat: () => `<li>${icon('map-pin')}<span>${esc(SITE.addressShort)}, ${esc(SITE.landmark.charAt(0).toLowerCase() + SITE.landmark.slice(1))}</span></li>`,
  jam: () => `<li>${icon('clock')}<span>Buka ${esc(SITE.hours.replace(/^Setiap hari,?\s*/i, 'setiap hari '))}</span></li>`,
  resmi: () => `<li>${icon('shield-check')}<span>Distributor resmi GODA</span></li>`,
};
export const proofHTML = (keys, cls = '') => `<ul class="proof ${cls}">${keys.map(k => PROOF[k]()).join('')}</ul>`;

/* ---------- "Belum yakin?": one button (test ride) and one quiet WhatsApp link, one showroom photo, rating, landmark ---------- */
export function askHTML({ id = 'ask-h', h = 'Belum yakin pilih yang mana?', p = 'Coba dulu di showroom Palmerah. Test ride gratis.', tr = 'test-ride.html', waText = 'Halo Moto Ijo, saya masih bingung pilih model GODA. Bisa bantu?', proof = ['rating', 'alamat', 'jam'] } = {}) {
  return `<div class="wrap">
    <div class="ask__card">
      <img class="ask__pic" src="assets/img/showroom/showroom-5.webp" alt="Skuter listrik GODA warna krem di dalam showroom Moto Ijo" width="1050" height="1400" loading="lazy" decoding="async">
      <div class="ask__txt">
        <h2 class="ask__h" id="${id}">${h}</h2>
        <p class="ask__p">${p}</p>
        <div class="ask__btns">
          <a class="btn ask__tr" href="${tr}">Jadwalkan test ride${arrow()}</a>
          <a class="link ask__wa" href="${wa(waText)}" target="_blank" rel="noopener">${icon('brand-whatsapp')}Tanya lewat WhatsApp</a>
        </div>
      </div>
      ${proofHTML(proof, 'ask__proof')}
    </div>
  </div>`;
}

/* ---------- one WhatsApp control per screen: the shell's float steps aside while a WhatsApp link in <main> is in view.
   CSS: body.wa-inview .wafloat (produk.css). Watches the links present when called. ---------- */
export function quietFloat(scope = document.querySelector('main')) {
  if (!scope || !('IntersectionObserver' in window)) return;
  const on = new Set();
  const io = new IntersectionObserver(es => {
    es.forEach(e => (e.isIntersecting ? on.add(e.target) : on.delete(e.target)));
    document.body.classList.toggle('wa-inview', on.size > 0);
  });
  scope.querySelectorAll('a[href*="wa.me"]').forEach(a => io.observe(a));
}

/* ---------- compare store (localStorage, max 3; bandingkan.html) ---------- */
const KEY = 'mi-compare';
export const cmpStore = {
  get() { try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a.filter(bySlug).slice(0, 3) : []; } catch { return []; } },
  set(a) { try { localStorage.setItem(KEY, JSON.stringify(a.filter(bySlug).slice(0, 3))); } catch {} },
};

/* ============ KATALOG (produk.html) ============ */
const SORTS = {
  katalog: null,
  'harga-naik': (a, b) => (a.priceNum ?? Infinity) - (b.priceNum ?? Infinity),
  'harga-turun': (a, b) => (b.priceNum ?? -Infinity) - (a.priceNum ?? -Infinity),
  jarak: (a, b) => (b.rangeKm ?? 0) - (a.rangeKm ?? 0),
  kecepatan: (a, b) => (b.speedKmh ?? 0) - (a.speedKmh ?? 0),
};

// where a series sits on the line-up scale: min–max of its models against MAX (bars aria-hidden, values as text)
function seriesMetersHTML(k) {
  const a = inSeries(k);
  const span = (field, label, unit, max, approx) => {
    const v = a.map(m => m[field]).filter(n => n != null);
    if (!v.length) return '';
    const lo = Math.min(...v), hi = Math.max(...v);
    const ap = approx && a.some(m => m.rangeApprox && (m[field] === lo || m[field] === hi));
    const txt = lo === hi ? `${lo}` : `${lo}–${hi}`;
    return `<div class="mt mt--span"><dt class="mt__k">${label}</dt><dd class="mt__v num">${ap ? '<span aria-hidden="true">±</span><span class="sr">sekitar </span>' : ''}${txt}<span class="mt__u"> ${unit}</span></dd><dd class="mt__bar" aria-hidden="true"><span class="mt__fill" style="--a:${(lo / max).toFixed(3)};--p:${(hi / max).toFixed(3)}"></span></dd></div>`;
  };
  return `<dl class="meters kat-ser__mt">${span('rangeKm', 'Jarak tempuh', 'km', MAX.rangeKm, true)}${span('speedKmh', 'Kecepatan', 'km/jam', MAX.speedKmh)}${span('powerW', 'Motor', 'W', MAX.powerW)}</dl>`;
}

function groupHTML(k, sort, first) {
  const s = SERIES[k];
  let a = inSeries(k);
  if (SORTS[sort]) a = [...a].sort(SORTS[sort]);
  const from = fromPrice(k);
  return `<section class="kat-grp" data-series="${k}" aria-labelledby="ser-${k}">
    <div class="kat-grid">
      <header class="kat-ser">
        <p class="kat-ser__n num">${a.length} model</p>
        <h2 class="kat-ser__h" id="ser-${k}">${esc(s.label)}</h2>
        <p class="kat-ser__line">${esc(s.line)}.</p>
        ${seriesMetersHTML(k)}
        ${from ? `<p class="kat-ser__from"><span>Mulai</span> <b class="num">${from}</b></p>` : ''}
      </header>
      <ul class="kat-cards">${a.map((m, i) => cardHTML(m, { eager: first && i < 4 })).join('')}</ul>
    </div>
  </section>`;
}

// the catalogue markup for a filter and sort (also what tools/prerender.mjs writes into produk.html for crawlers without JS)
export const katalogHTML = (f = 'semua', s = 'katalog') => (f === 'semua' ? SERIES_KEYS : [f]).map((k, i) => groupHTML(k, s, i === 0)).join('');

function katalog() {
  const list = document.querySelector('[data-list]');
  const chips = [...document.querySelectorAll('[data-filter]')];
  const sort = document.querySelector('[data-sort]');
  const sortBox = sort.closest('.kat-sort');
  const state = { f: 'semua', s: 'katalog' };
  const fromHash = () => { const h = location.hash.slice(1); state.f = SERIES[h] ? h : 'semua'; };

  const render = () => {
    const html = katalogHTML(state.f, state.s);
    fill(list, html);
    chips.forEach(c => c.setAttribute('aria-pressed', c.dataset.filter === state.f));
    sortBox.classList.toggle('is-set', state.s !== 'katalog');
  };
  // after a switch or sort, bring the grid top back under the sticky bar when it has scrolled away
  const toTop = () => {
    const bar = document.querySelector('.kat-bar');
    const navH = document.body.classList.contains('nav-away') ? 0 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0;
    const y = list.getBoundingClientRect().top + scrollY - bar.offsetHeight - navH - 8;
    if (scrollY > y + 4) scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  };
  const update = () => { (!reduced && document.startViewTransition) ? document.startViewTransition(render) : render(); toTop(); };

  chips.forEach(c => c.addEventListener('click', () => {
    state.f = c.dataset.filter;
    history.replaceState(null, '', state.f === 'semua' ? location.pathname : `#${state.f}`);
    update();
  }));
  sort.addEventListener('change', () => { state.s = sort.value; update(); });
  // deep links (nav, footer, tentang): produk.html#motorbike / #motorcycle open with that series selected and in view
  const listTop = document.querySelector('.kat-list');
  const toSeries = (smooth) => { if (state.f !== 'semua') listTop.scrollIntoView({ block: 'start', behavior: smooth && !reduced ? 'smooth' : 'auto' }); };
  addEventListener('hashchange', () => { fromHash(); (!reduced && document.startViewTransition) ? document.startViewTransition(render) : render(); toSeries(true); });

  document.querySelectorAll('[data-n]').forEach(n => { n.textContent = n.dataset.n === 'semua' ? MODELS.length : inSeries(n.dataset.n).length; });
  fromHash(); render();
  if (state.f !== 'semua') { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; requestAnimationFrame(() => toSeries(false)); }
  const ask = document.querySelector('[data-ask]');
  if (ask) fill(ask, askHTML());
  quietFloat();
}

if (document.body.dataset.page === 'produk') katalog();
