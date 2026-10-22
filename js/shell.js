// Moto Ijo shell (v4, GODA-family): solid dark nav with a Produk mega panel (model thumbnails),
// a "Lainnya" panel, mobile drawer, search, black footer, WhatsApp float, speed-line page wipe, reveals.
// Native scrolling only (Lenis removed: docs/perf.md). Every page: <body data-page="...">.
import { SITE, NAV, wa, icon, arrow } from './site.js';
import { MODELS } from '../data/models.js';

const here = location.pathname.split('/').pop() || 'index.html';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const body = document.body;
const priceLine = m => m.price ? m.price.replace(/^mulai /, 'mulai ') : 'Tanya harga';

/* ---------- nav ---------- */
function megaModels() {
  const group = (cat, title) => `<div class="mega__grp"><p class="mega__h">${title}</p><ul class="mega__models">${MODELS.filter(m => m.category === cat).map(m => `
    <li><a class="mega__m" href="produk-detail.html?m=${m.slug}"><span class="mega__img"><img src="${m.img}" alt="" width="160" height="120" loading="lazy" decoding="async"></span>
    <span class="mega__name">${m.short}</span><span class="mega__price num">${priceLine(m)}</span></a></li>`).join('')}</ul></div>`;
  return `<div class="mega mega--models" id="mega-produk" hidden><div class="mega__in wrap">
    ${group('Motor listrik', 'Motor listrik')}${group('Sepeda listrik', 'Sepeda listrik')}
    <div class="mega__side">
      <a class="mega__all" href="produk.html"><span>Semua model</span>${icon('arrow-right')}</a>
      <a class="mega__all" href="bandingkan.html"><span>Bandingkan model</span>${icon('arrow-right')}</a>
      <a class="mega__all" href="simulasi-cicilan.html"><span>Simulasi cicilan</span>${icon('arrow-right')}</a>
    </div></div></div>`;
}
function megaList(n, id) {
  return `<div class="mega mega--list" id="${id}" hidden><div class="mega__in wrap">${n.children.map(c => `
    <a class="mega__item" href="${c.href}"><span class="shape shape--bulat c-ijo" style="--s:52px">${icon(c.icon)}</span>
    <span><span class="t-title">${c.label}</span><span class="t-small mega__line">${c.line}</span></span></a>`).join('')}
    <a class="mega__showroom" href="${SITE.maps}" target="_blank" rel="noopener"><span class="t-small">Showroom</span><span class="t-title">${SITE.addressShort}</span><span class="t-small">${SITE.hours}</span><span class="link">Lihat rute ${icon('arrow-right')}</span></a>
  </div></div>`;
}
function navHTML() {
  const links = NAV.map((n, i) => {
    const kids = n.children || [];
    const cur = here === n.href || kids.some(c => c.href === here) || (n.mega && /^produk|^bandingkan/.test(here)) ? ' aria-current="page"' : '';
    if (!n.mega && !kids.length) return `<li><a class="nav__a" href="${n.href}"${cur}><span>${n.label}</span></a></li>`;
    const id = n.mega ? 'mega-produk' : `mega-${i}`;
    return `<li class="nav__has"><button class="nav__a" type="button" aria-expanded="false" aria-controls="${id}"${cur}><span>${n.label}</span>${icon('chevron-down')}</button>
      ${n.mega ? megaModels() : megaList(n, id)}</li>`;
  }).join('');
  return `<a class="skip" href="#main">Langsung ke isi</a>
  <header class="nav" data-state="top">
    <div class="nav__bar wrap">
      <a class="nav__logo" href="index.html" aria-label="Moto Ijo, ke beranda">
        <img src="assets/img/motoijo-logo-notagline-white.svg" alt="" width="200" height="39">
      </a>
      <nav aria-label="Utama"><ul class="nav__links">${links}</ul></nav>
      <div class="nav__act">
        <button class="nav__icon" data-search-open aria-label="Buka pencarian">${icon('search')}</button>
        <a class="btn btn--sm nav__cta" href="test-ride.html">Jadwalkan test ride${arrow()}</a>
        <button class="nav__icon nav__burger" aria-label="Buka menu" aria-controls="drawer" aria-expanded="false">${icon('menu-2')}</button>
      </div>
    </div>
  </header>
  <dialog class="drawer f-aspal" id="drawer" aria-label="Menu">
    <div class="drawer__top wrap"><img src="assets/img/motoijo-logo-notagline-white.svg" alt="Moto Ijo" width="150" height="29"><button class="nav__icon" data-drawer-close aria-label="Tutup menu">${icon('x')}</button></div>
    <ul class="drawer__list wrap">${NAV.flatMap(n => n.children ? n.children.filter(c => c.href !== n.href) : [n]).map(n => `<li><a href="${n.href}"${here === n.href ? ' aria-current="page"' : ''}>${n.label}</a></li>`).join('')}</ul>
    <div class="drawer__foot wrap"><a class="btn" href="test-ride.html">Jadwalkan test ride${arrow()}</a><a class="btn btn--ghost btn--icon" href="${wa()}" target="_blank" rel="noopener">${icon('brand-whatsapp')} Chat WhatsApp</a></div>
  </dialog>`;
}

/* ---------- search ---------- */
function searchHTML() {
  return `<dialog class="search" id="search" aria-label="Pencarian">
    <div class="search__panel wrap">
      <label class="sr" for="q">Cari model, layanan, atau panduan</label>
      <div class="search__row">${icon('search')}<input id="q" type="search" placeholder="Cari model, layanan, panduan" autocomplete="off"><button class="nav__icon" data-search-close aria-label="Tutup pencarian">${icon('x')}</button></div>
      <div class="search__res" aria-live="polite"></div>
      <p class="t-small t-muted">Esc untuk menutup.</p>
    </div></dialog>`;
}
const INDEX = [
  ...MODELS.map(m => ({ t: m.name, h: `produk-detail.html?m=${m.slug}`, k: m.category })),
  ...NAV.flatMap(n => n.children ? n.children : [n]).map(n => ({ t: n.label, h: n.href, k: 'Halaman' })),
  { t: 'Bandingkan model', h: 'bandingkan.html', k: 'Produk' },
  { t: 'Sepeda listrik atau motor listrik? Bedanya menurut aturan', h: 'panduan-sepeda-vs-motor-listrik.html', k: 'Panduan' },
];

/* ---------- footer ---------- */
function footerHTML() {
  const col = (t, items) => `<div class="foot__col"><p class="t-ui foot__h">${t}</p><ul>${items.map(([l, h, ext]) => `<li><a href="${h}"${ext ? ' target="_blank" rel="noopener"' : ''}>${l}</a></li>`).join('')}</ul></div>`;
  return `<footer class="foot f-aspal">
    <div class="wrap">
      <div class="foot__top">
        <img src="assets/img/motoijo-logo-white.svg" alt="Moto Ijo, spesialis kendaraan listrik" width="300" height="58">
        <p class="foot__badge">${icon('shield-check')}<span>Distributor resmi GODA di Palmerah, Jakarta Barat</span></p>
      </div>
      <div class="foot__contact">
        <p class="t-lead">Tanya stok atau jadwalkan test ride.</p>
        <a class="foot__wa num" href="${wa()}" target="_blank" rel="noopener">${SITE.waDisplay}</a>
      </div>
      <div class="foot__cols">
        ${col('Produk', [['Semua model', 'produk.html'], ['Motor listrik', 'produk.html#motor'], ['Sepeda listrik', 'produk.html#sepeda'], ['Bandingkan', 'bandingkan.html']])}
        ${col('Layanan', [['Test ride', 'test-ride.html'], ['Simulasi cicilan', 'simulasi-cicilan.html'], ['Servis & sparepart', 'servis.html'], ['Garansi', 'garansi.html']])}
        ${col('Moto Ijo', [['Tentang', 'tentang.html'], ['Rute ke showroom', SITE.maps, 1], ['Chat WhatsApp', wa(), 1]])}
        ${col('Ikuti kami', [['Instagram @moto_ijo', SITE.social.instagram, 1], ['TikTok @moto_ijo', SITE.social.tiktok, 1], ['Shopee Moto Ijo', SITE.social.shopee, 1], ['Google Maps', SITE.maps, 1]])}
        <div class="foot__col"><p class="t-ui foot__h">Showroom</p><p>${SITE.address}</p><p>${SITE.hours}</p></div>
      </div>
      <div class="foot__meta t-small">
        <p>Moto Ijo adalah distributor resmi GODA. Situs ini milik Moto Ijo, bukan situs resmi GODA. Nama GODA, nama model, dan foto produk milik pemiliknya.</p>
        <p class="foot__end"><span>© 2026 Moto Ijo, Palmerah, Jakarta Barat.</span><a class="link" href="#main" data-top>Kembali ke atas ${icon('arrow-up')}</a></p>
      </div>
    </div>
  </footer>
  <a class="wafloat" href="${wa()}" target="_blank" rel="noopener" aria-label="Chat Moto Ijo lewat WhatsApp">${icon('brand-whatsapp')}</a>
  <div class="wipe" aria-hidden="true">${'<span></span>'.repeat(5)}</div>`;
}

/* ---------- mount ---------- */
document.documentElement.classList.remove('no-js');
body.insertAdjacentHTML('afterbegin', navHTML() + searchHTML());
body.insertAdjacentHTML('beforeend', footerHTML());

/* nav state: written only when it changes; the bar steps aside on the way down and returns on the way up */
const nav = document.querySelector('.nav');
let lastY = scrollY, state = '', away = false, ticking = false;
const setNav = () => {
  ticking = false;
  const y = scrollY, s = y > 8 ? 'scrolled' : 'top';
  if (s !== state) { nav.dataset.state = state = s; }
  const open = nav.classList.contains('is-mega') || nav.contains(document.activeElement);
  const a = !open && y > 240 && y > lastY + 2 ? true : (y < lastY - 2 || y < 240 ? false : away);
  if (a !== away) { away = a; nav.classList.toggle('is-away', a); body.classList.toggle('nav-away', a); }
  lastY = y;
};
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(setNav); } }, { passive: true });
setNav();

/* mega panels (click, hover on fine pointers, Escape) */
const hasHover = matchMedia('(hover: hover)').matches;
const panels = [...document.querySelectorAll('.nav__has')].map(li => ({ li, btn: li.querySelector('button'), panel: li.querySelector('.mega') }));
const setPanel = (p, open) => {
  p.btn.setAttribute('aria-expanded', String(open)); p.panel.hidden = !open;
  nav.classList.toggle('is-mega', panels.some(x => !x.panel.hidden));
};
panels.forEach(p => {
  p.btn.addEventListener('click', () => { const open = p.panel.hidden; panels.forEach(x => x !== p && setPanel(x, false)); setPanel(p, open); });
  if (hasHover) {
    let t; p.li.addEventListener('mouseenter', () => { clearTimeout(t); panels.forEach(x => x !== p && setPanel(x, false)); setPanel(p, true); });
    p.li.addEventListener('mouseleave', () => { t = setTimeout(() => setPanel(p, false), 120); });
  }
  p.li.addEventListener('focusout', e => { if (!p.li.contains(e.relatedTarget)) setPanel(p, false); });
});
addEventListener('keydown', e => { if (e.key === 'Escape') panels.forEach(p => { if (!p.panel.hidden) { setPanel(p, false); p.btn.focus(); } }); });

// drawer
const drawer = document.getElementById('drawer'); const burger = document.querySelector('.nav__burger');
burger.addEventListener('click', () => { drawer.showModal(); burger.setAttribute('aria-expanded', 'true'); });
drawer.querySelector('[data-drawer-close]').addEventListener('click', () => drawer.close());
drawer.addEventListener('close', () => burger.setAttribute('aria-expanded', 'false'));

// search
const search = document.getElementById('search'); const q = search.querySelector('input'); const res = search.querySelector('.search__res');
document.querySelectorAll('[data-search-open]').forEach(b => b.addEventListener('click', () => { search.showModal(); q.focus(); render(q.value); }));
search.querySelector('[data-search-close]').addEventListener('click', () => search.close());
addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); document.querySelector('[data-search-open]').click(); } });
const render = v => {
  const hits = INDEX.filter(i => i.t.toLowerCase().includes(v.toLowerCase())).slice(0, 8);
  res.innerHTML = hits.length ? `<ul>${hits.map(i => `<li><a href="${i.h}"><span class="t-title">${i.t}</span><span class="t-small t-muted">${i.k}</span></a></li>`).join('')}</ul>`
    : `<p class="t-lead">Belum ketemu "${v.replace(/[<>&"]/g, '')}". <a class="link" href="${wa('Halo Moto Ijo, saya mencari: ' + v)}" target="_blank" rel="noopener">Tanya lewat WhatsApp ${icon('arrow-right')}</a></p>`;
};
q.addEventListener('input', () => render(q.value));

// back to top
document.querySelector('[data-top]')?.addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); document.getElementById('main')?.focus({ preventScroll: true }); });

// reveals
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

// speed-line page transition (in on arrival, out on internal link click)
const wipe = document.querySelector('.wipe');
if (!reduced && sessionStorage.getItem('mi-wipe')) { wipe.classList.add('is-out'); sessionStorage.removeItem('mi-wipe'); requestAnimationFrame(() => requestAnimationFrame(() => wipe.classList.add('is-leave'))); }
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]'); if (!a || reduced || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
  const url = new URL(a.href, location.href); if (url.origin !== location.origin || url.pathname === location.pathname || a.hasAttribute('download')) return;
  e.preventDefault(); wipe.classList.remove('is-out', 'is-leave'); wipe.classList.add('is-in'); sessionStorage.setItem('mi-wipe', 1);
  setTimeout(() => location.href = a.href, 520);
});
addEventListener('pageshow', e => { if (e.persisted) wipe.classList.remove('is-in', 'is-out', 'is-leave'); });

export { reduced };
