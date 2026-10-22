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
document.querySelectorAll('[data-site]').forEach(el => {
  const k = el.dataset.site;
  if (k === 'hoursLower') el.textContent = SITE.hours.charAt(0).toLowerCase() + SITE.hours.slice(1);
  else if (SITE[k]) el.textContent = SITE[k];
});
document.querySelectorAll('a[data-social]').forEach(a => { a.href = SITE.social[a.dataset.social] || a.href; });

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
