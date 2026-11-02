// Moto Ijo · tentang.js (1 Nov 2026): the "Tentang" page.
// 1. Google-Maps-style photo grid from data/galeri.js (new photos appear without code changes) + a lightbox carousel.
// 2. "Buka sekarang" line from SITE.hours, Jakarta time.  3. Line-up and tenor lines from the data.
// 4. Reviews from data/ulasan.js (topic 'pelayanan'), hidden while the array is empty.
// shell.js mounts nav and footer; info.js fills [data-site], [data-maps], [data-wa] and hides the WhatsApp float.
import { SITE, CICIL } from './site.js';
import { GALERI, byKind } from '../data/galeri.js';
import { MODELS, SERIES } from '../data/models.js';
import { ULASAN_RINGKAS, byTopic } from '../data/ulasan.js';
import { dragX } from './drag.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const icon = n => `<svg class="i" aria-hidden="true"><use href="assets/icons.svg#i-${n}"></use></svg>`;

/* ---------- 1. photos ---------- */
// Cover = the first showroom photo (the storefront today). After it, one photo of each kind in turn,
// so servis and serah-terima photos reach the five visible cells as soon as they are in the data.
const KINDS = ['showroom', 'serah-terima', 'servis', 'garansi'];
function order(list) {
  const ok = list.filter(g => g && g.src && g.w && g.h);
  if (!ok.length) return [];
  const cover = ok.find(g => g.kind === 'showroom') || ok[0];
  const rest = ok.filter(g => g !== cover);
  const kinds = [...new Set([...KINDS, ...rest.map(g => g.kind)])];
  const queues = kinds.map(k => rest.filter(g => g.kind === k)).filter(q => q.length);
  const out = [cover];
  while (queues.some(q => q.length)) queues.forEach(q => { if (q.length) out.push(q.shift()); });
  return out;
}
const PHOTOS = order(GALERI);
const N = PHOTOS.length;
const label = (g, i) => `Buka foto ${i + 1} dari ${N}: ${g.alt}`;

function cellHTML(g, i) {
  const pos = g.pos ? `; --pos: ${esc(g.pos)}` : '';
  const img = i === 0
    ? `<img src="${esc(g.src)}"${g.small ? ` srcset="${esc(g.small)} 720w, ${esc(g.src)} ${g.w}w" sizes="(max-width: 860px) 260px, (max-width: 1100px) 50vw, 32vw"` : ''} alt="" width="${g.w}" height="${g.h}" fetchpriority="high" decoding="async">`
    : `<img src="${esc(g.small || g.src)}" alt="" width="${g.w}" height="${g.h}" loading="lazy" decoding="async">`;
  return `<button class="tt-cell" type="button" data-i="${i}" data-src="${esc(g.src)}" style="--ar: ${g.w} / ${g.h}${pos}" aria-label="${esc(label(g, i))}">${img}</button>`;
}

const gal = document.querySelector('[data-gal]');
const grid = gal && gal.querySelector('[data-gal-grid]');
if (grid) {
  if (!N) gal.classList.add('is-empty');
  else {
    // keep the static first paint when it already matches the data; otherwise rebuild (the cover node is kept if unchanged)
    const have = [...grid.children].map(c => c.dataset.src).join('|');
    if (have !== PHOTOS.map(g => g.src).join('|')) {
      const keep = grid.firstElementChild && grid.firstElementChild.dataset.src === PHOTOS[0].src ? grid.firstElementChild : null;
      grid.innerHTML = PHOTOS.map((g, i) => (i === 0 && keep ? '' : cellHTML(g, i))).join('');
      if (keep) grid.prepend(keep);
      [...grid.children].forEach((c, i) => c.setAttribute('aria-label', label(PHOTOS[i], i)));
    }
    grid.dataset.n = String(Math.min(N, 5));
    gal.querySelector('[data-gal-count]').textContent = N;
    grid.addEventListener('click', e => { const c = e.target.closest('.tt-cell'); if (c) open(+c.dataset.i, c); });
    gal.querySelector('[data-gal-all]').addEventListener('click', e => open(0, e.currentTarget));
    // phone strip: a mouse can drag it too (touch scrolls natively)
    let sx = 0, mouse = false;
    grid.addEventListener('pointerdown', e => { mouse = e.pointerType === 'mouse'; }, true);
    dragX(grid, { start: () => { sx = grid.scrollLeft; }, move: dx => { if (mouse) grid.scrollLeft = sx - dx; }, end: () => {} });
  }
}

/* lightbox: one <dialog>, built on first open. Arrows, Esc (native), swipe or mouse drag, thumbnails; focus returns. */
let lb, stage, track, slides, thumbs, cap, count, prev, next, cur = 0, opener = null;
function build() {
  lb = document.createElement('dialog');
  lb.className = 'tt-lb';
  lb.setAttribute('aria-label', 'Foto Moto Ijo');
  lb.setAttribute('aria-roledescription', 'galeri foto');
  lb.innerHTML = `
    <div class="tt-lb__top"><p class="tt-lb__count num" data-lb-count></p><button class="tt-lb__x" type="button" data-lb-close aria-label="Tutup foto">${icon('x')}</button></div>
    <div class="tt-lb__stage">
      <div class="tt-lb__track">${PHOTOS.map((g, i) => `<figure class="tt-lb__slide" role="group" aria-roledescription="foto" aria-label="Foto ${i + 1} dari ${N}"><img data-src="${esc(g.src)}" alt="${esc(g.alt)}" width="${g.w}" height="${g.h}" decoding="async"></figure>`).join('')}</div>
      <button class="tt-lb__nav tt-lb__nav--prev" type="button" data-lb-prev aria-label="Foto sebelumnya">${icon('chevron-right')}</button>
      <button class="tt-lb__nav tt-lb__nav--next" type="button" data-lb-next aria-label="Foto berikutnya">${icon('chevron-right')}</button>
    </div>
    <p class="tt-lb__cap" data-lb-cap aria-live="polite"></p>
    <div class="tt-lb__thumbs" role="group" aria-label="Semua foto">${PHOTOS.map((g, i) => `<button class="tt-lb__thumb" type="button" data-lb-go="${i}" aria-label="Foto ${i + 1}: ${esc(g.alt)}"><img src="${esc(g.small || g.src)}" alt="" width="${g.w}" height="${g.h}" loading="lazy" decoding="async"></button>`).join('')}</div>`;
  document.body.append(lb);
  stage = lb.querySelector('.tt-lb__stage');
  track = lb.querySelector('.tt-lb__track');
  slides = [...lb.querySelectorAll('.tt-lb__slide')];
  thumbs = [...lb.querySelectorAll('.tt-lb__thumb')];
  cap = lb.querySelector('[data-lb-cap]');
  count = lb.querySelector('[data-lb-count]');
  prev = lb.querySelector('[data-lb-prev]');
  next = lb.querySelector('[data-lb-next]');

  lb.querySelector('[data-lb-close]').addEventListener('click', () => lb.close());
  prev.addEventListener('click', () => go(cur - 1));
  next.addEventListener('click', () => go(cur + 1));
  lb.querySelector('.tt-lb__thumbs').addEventListener('click', e => { const t = e.target.closest('[data-lb-go]'); if (t) go(+t.dataset.lbGo); });
  lb.addEventListener('keydown', e => {
    const k = { ArrowLeft: cur - 1, ArrowRight: cur + 1, Home: 0, End: N - 1 }[e.key];
    if (k === undefined) return;
    e.preventDefault(); go(k);
  });
  lb.addEventListener('close', () => { if (opener && opener.isConnected) opener.focus({ preventScroll: true }); opener = null; });

  // drag: the track follows the pointer (it gives way at the first and last photo), then settles on a photo
  dragX(stage, {
    move: dx => { const edge = (cur === 0 && dx > 0) || (cur === N - 1 && dx < 0); track.style.setProperty('--dx', `${edge ? dx * .3 : dx}px`); },
    end: (dx, v) => { const far = Math.abs(dx) > stage.clientWidth * .16 || v > .45; go(cur + (far ? (dx < 0 ? 1 : -1) : 0)); },
  }, 'button');
}

function go(i) {
  cur = Math.max(0, Math.min(N - 1, i));
  track.style.setProperty('--i', cur);
  track.style.setProperty('--dx', '0px');
  [cur - 1, cur, cur + 1].forEach(k => { const img = slides[k] && slides[k].querySelector('img'); if (img && !img.getAttribute('src')) img.src = img.dataset.src; });
  slides.forEach((s, k) => { const on = k === cur; s.inert = !on; s.setAttribute('aria-hidden', String(!on)); });
  thumbs.forEach((t, k) => t.setAttribute('aria-current', String(k === cur)));
  const t = thumbs[cur], row = t.parentElement;
  if (row.scrollWidth > row.clientWidth) row.scrollTo({ left: t.offsetLeft - (row.clientWidth - t.offsetWidth) / 2, behavior: 'auto' });
  count.textContent = `${cur + 1} / ${N}`;
  cap.textContent = PHOTOS[cur].alt;
  prev.setAttribute('aria-disabled', String(cur === 0));
  next.setAttribute('aria-disabled', String(cur === N - 1));
}

function open(i, from) {
  if (!N) return;
  if (!lb) build();
  opener = from || null;
  track.classList.add('is-instant');
  lb.showModal();
  go(i);
  track.getBoundingClientRect();
  requestAnimationFrame(() => track.classList.remove('is-instant'));
  lb.querySelector('[data-lb-close]').focus();
}

// closing photo: a serah-terima (handover) photo when the data has one; the static showroom photo otherwise
const endImg = document.querySelector('[data-end-pic] img');
const hand = byKind('serah-terima').find(g => g.src && g.w && g.h);
if (endImg && hand && endImg.getAttribute('src') !== hand.src) {
  Object.assign(endImg, { src: hand.small || hand.src, alt: hand.alt || '', width: hand.w, height: hand.h });
  if (hand.pos) endImg.style.setProperty('--pos', hand.pos);
}

/* map: src after the load event, when the main thread is idle (the embed runs about 1 MB of Google script) */
const map = document.querySelector('.tt-map iframe[data-src]');
if (map) {
  const go = () => { map.src = map.dataset.src; };
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 2000 }) : setTimeout(go, 400));
  if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
}

/* ---------- 2. open now (Jakarta time), from SITE.hours "Setiap hari, 08.30–20.00" ---------- */
const openEl = document.querySelector('[data-open]');
const hm = SITE.hours.match(/^Setiap hari\D*(\d{1,2})\.(\d{2})\D+(\d{1,2})\.(\d{2})/);
if (openEl && hm) {
  const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()).split(':').map(Number);
  const now = h * 60 + m, from = +hm[1] * 60 + +hm[2], to = +hm[3] * 60 + +hm[4];
  openEl.innerHTML = now >= from && now < to
    ? `<b class="is-open">Buka sekarang</b>, tutup pukul ${hm[3]}.${hm[4]}`
    : `<b>Sedang tutup</b>, buka lagi pukul ${hm[1].padStart(2, '0')}.${hm[2]}`;
}

/* ---------- 3. lines from the data ---------- */
const lineup = document.querySelector('[data-lineup]');
if (lineup) {
  const parts = Object.values(SERIES).map(s => [s.label, MODELS.filter(x => x.series === s.key).length]).filter(([, n]) => n);
  if (parts.length) lineup.textContent = `${parts.map(([l, n]) => `${l} (${n} model)`).join(' dan ')}.`;
}
const tenors = document.querySelector('[data-tenors]');
if (tenors && CICIL.tenors.length) {
  const t = CICIL.tenors;
  tenors.textContent = t.length > 1 ? `${t.slice(0, -1).join(', ')}, atau ${t[t.length - 1]}` : String(t[0]);
}

/* ---------- 4. reviews ---------- */
const rev = document.querySelector('[data-reviews]');
const picks = byTopic('pelayanan').slice(0, 3);
if (rev && picks.length) {
  const star = icon('star-filled');
  const text = u => u.text || u.quote || u.excerpt || u.isi || '';
  const stars = u => Math.max(0, Math.min(5, Math.round(+(u.stars ?? u.rating ?? u.bintang ?? 5))));
  rev.querySelector('[data-rev-rating]').textContent = ULASAN_RINGKAS.rating;
  rev.querySelector('[data-rev-count]').textContent = `dari ${ULASAN_RINGKAS.count} ulasan`;
  rev.querySelector('.tt-stars').innerHTML = star.repeat(5);
  if (ULASAN_RINGKAS.url) rev.querySelector('[data-rev-url]').href = ULASAN_RINGKAS.url;
  rev.querySelector('[data-reviews-list]').innerHTML = picks.filter(text).map(u => `<li class="tt-quote">
    <span class="tt-stars" role="img" aria-label="${stars(u)} dari 5 bintang">${star.repeat(stars(u))}</span>
    <blockquote><p>${esc(text(u))}</p></blockquote>
    <p class="tt-quote__by"><b>${esc(u.name || u.author || u.nama || '')}</b><span>${esc(u.date || u.when || u.tanggal || '')}</span></p></li>`).join('');
  rev.hidden = false;
}
