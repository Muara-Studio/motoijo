// Moto Ijo · info pages (showroom, tentang, promo, panduan, artikel, 404).
// shell.js mounts nav, footer, search, reveals and Lenis. This file hydrates links from the shared facts and runs the one filter.
import { SITE, wa } from './site.js';

const page = document.body.dataset.page;

/* 404 pages can be served from a deeper path: keep in-page anchors on the current URL (the head sets <base href="/">). */
if (page === '404' && location.pathname.split('/').filter(Boolean).length > 1) {
  document.querySelectorAll('a[href^="#"]').forEach(a => a.setAttribute('href', location.pathname + a.getAttribute('href')));
}

/* links: WhatsApp, maps and social come from SITE, so the facts live in one file */
document.querySelectorAll('a[data-wa]').forEach(a => { a.href = wa(a.dataset.wa || undefined); });
document.querySelectorAll('a[data-maps]').forEach(a => { a.href = SITE.maps; });
const lower = s => s.charAt(0).toLowerCase() + s.slice(1);
document.querySelectorAll('[data-site]').forEach(el => {
  const k = el.dataset.site;
  if (k === 'hoursLower') el.textContent = lower(SITE.hours);
  else if (k === 'landmarkLower') el.textContent = lower(SITE.landmark);
  else if (SITE[k]) el.textContent = SITE[k];
});

/* tentang: the two series lines (count, power, speed) come from data/models.js, so they follow the line-up */
const seriesEls = document.querySelectorAll('[data-series]');
if (seriesEls.length) import('../data/models.js').then(({ SERIES, MODELS }) => {
  const span = (list, k, unit) => { const v = list.map(m => m[k]); const lo = Math.min(...v), hi = Math.max(...v); return `${lo === hi ? lo : `${lo}–${hi}`} ${unit}`; };
  seriesEls.forEach(li => {
    const s = SERIES[li.dataset.series], list = MODELS.filter(m => m.series === li.dataset.series), out = li.querySelector('[data-series-line]');
    if (!s || !list.length || !out) return;
    const lithium = /lithium/i.test(s.line) ? ', baterai lithium' : '';
    out.textContent = `${list.length} model, ${span(list, 'powerW', 'W')}, ${span(list, 'speedKmh', 'km/jam')}${lithium}`;
  });
});
document.querySelectorAll('a[data-social]').forEach(a => { a.href = SITE.social[a.dataset.social] || a.href; });

/* tentang: one WhatsApp control per screen, the shell's float steps aside while a WhatsApp link in <main> is in view
   (CSS: body.wa-inview .wafloat in info.css; same helper as quietFloat in produk.js) */
if (page === 'tentang' && 'IntersectionObserver' in window) {
  const on = new Set();
  const io = new IntersectionObserver(es => {
    es.forEach(e => (e.isIntersecting ? on.add(e.target) : on.delete(e.target)));
    document.body.classList.toggle('wa-inview', on.size > 0);
  });
  document.querySelectorAll('main a[href*="wa.me"]').forEach(a => io.observe(a));
}

/* panduan hub: category filter over the featured article and the "segera" rows */
if (page === 'panduan') {
  const bar = document.querySelector('[data-filter]');
  if (bar) {
    bar.hidden = false;
    const items = [...document.querySelectorAll('[data-cat-item]')];
    const heads = [...document.querySelectorAll('[data-soon-sec]')];
    const count = bar.querySelector('[data-count]');
    const apply = cat => {
      let on = 0, soon = 0;
      items.forEach(el => { const show = cat === 'all' || el.dataset.catItem === cat; el.hidden = !show; if (show) (el.dataset.state === 'soon' ? soon++ : on++); });
      heads.forEach(s => { s.hidden = soon === 0; });
      bar.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.cat === cat)));
      count.textContent = `${on} tersedia, ${soon} segera`;
    };
    bar.addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) apply(c.dataset.cat); });
    apply('all');
  }
}
