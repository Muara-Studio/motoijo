// Moto Ijo · purna.js (1 Nov 2026): servis.html and garansi.html (after-sales).
// layanan.js (loaded first) still owns the shared parts: [data-site] facts, [data-maps], the model picker that writes
// every [data-wa-tpl] WhatsApp link, and the quiet WhatsApp float. This file adds two things:
//   1. servis: the "Servis / Sparepart" switch in the booking steps (changes the WhatsApp template, then lets the picker rewire).
//   2. both pages: the after-sales reel, real Google reviews (data/ulasan.js) and real photos (data/galeri.js) in one carousel.
//      No matching items = no section at all (the <template> stays inert). Controls: buttons, arrow keys, swipe, mouse drag.
import { dragX } from './drag.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const use = (id, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="${id.startsWith('#') ? id : 'assets/icons.svg#i-' + id}"></use></svg>`;

/* ---------- 1. servis: what do you need? ---------- */
(() => {
  const book = $('[data-book]'); if (!book) return;
  const btn = $('[data-book-btn]', book), label = $('[data-book-label]', book), hint = $('[data-book-hint]', book), sel = $('select', book);
  const COPY = {
    servis: ['Booking servis lewat WhatsApp', 'Pesannya sudah terisi. Tinggal tulis keluhannya.'],
    sparepart: ['Tanya sparepart lewat WhatsApp', 'Pesannya sudah terisi. Tinggal tulis nama bagiannya.'],
  };
  const chips = $$('[data-need]', book);
  chips.forEach(b => b.addEventListener('click', () => {
    const need = b.dataset.need; if (!COPY[need]) return;
    chips.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    btn.dataset.waTpl = need;
    [label.textContent, hint.textContent] = COPY[need];
    sel?.dispatchEvent(new Event('change'));   // layanan.js: the picker rewrites every [data-wa-tpl] link with the chosen model
  }));
})();

/* ---------- 2. the after-sales reel ---------- */
const TOPIC = { servis: ['tool', 'Servis'], sparepart: ['#pi-settings', 'Sparepart'], garansi: ['shield-check', 'Garansi'] };
const KIND = { servis: ['tool', 'Servis'], garansi: ['shield-check', 'Klaim garansi'], 'serah-terima': ['#pi-key', 'Serah terima'] };
const pick = (o, ...k) => { for (const x of k) if (o[x] != null && o[x] !== '') return o[x]; return ''; };
const rank = (list, key, order) => list.map((x, i) => [x, i]).sort((a, b) => (order.indexOf(a[0][key]) - order.indexOf(b[0][key])) || a[1] - b[1]).map(a => a[0]);

function quoteCard(u) {
  const text = String(pick(u, 'text', 'quote', 'excerpt', 'kutipan')).trim().replace(/^["“]|["”]$/g, '');
  const stars = clamp(Math.round(Number(pick(u, 'stars', 'rating', 'bintang')) || 0), 0, 5);
  const [ic, tag] = TOPIC[u.topic] || [];
  return `<figure class="pr-card pr-q">
    <div class="pr-q__top">${stars ? `<span class="pr-stars" role="img" aria-label="${stars} dari 5 bintang">${use('star-filled').repeat(stars)}</span>` : '<span></span>'}${tag ? `<span class="pr-q__tag">${use(ic)}${tag}</span>` : ''}</div>
    <blockquote class="pr-q__t"><p>“${esc(text)}”</p></blockquote>
    <figcaption class="pr-q__by"><b>${esc(pick(u, 'name', 'nama', 'author'))}</b><span>${[esc(pick(u, 'date', 'tanggal', 'when')), 'Ulasan Google'].filter(Boolean).join(' · ')}</span></figcaption>
  </figure>`;
}
function photoCard(g) {
  const [ic, tag] = KIND[g.kind] || [];
  const w = +g.w || 900, h = +g.h || 1200, cap = pick(g, 'caption', 'keterangan');
  const set = g.small ? ` srcset="${esc(g.small)} 600w, ${esc(g.src)} ${w}w" sizes="(max-width: 560px) 80vw, 360px"` : '';
  return `<figure class="pr-card pr-p">
    <img src="${esc(g.small || g.src)}"${set} alt="${esc(g.alt)}" width="${w}" height="${h}" loading="lazy" decoding="async" draggable="false">
    <figcaption class="pr-p__cap">${tag ? `<span class="pr-p__tag">${use(ic)}${tag}</span>` : ''}${cap ? `<span class="pr-p__t">${esc(cap)}</span>` : ''}</figcaption>
  </figure>`;
}

async function initReel() {
  const tpl = $('template[data-reel]'); if (!tpl) return;
  const topics = (tpl.dataset.topics || '').split(',').filter(Boolean), kinds = (tpl.dataset.kinds || '').split(',').filter(Boolean);
  let quotes = [], photos = [], summary = null;
  try {   // a broken or missing data file leaves the page as it is: no section, nothing else breaks
    const [u, g] = await Promise.all([import('../data/ulasan.js'), import('../data/galeri.js')]);
    quotes = rank(u.byTopic(...topics), 'topic', topics).filter(x => x && String(pick(x, 'text', 'quote', 'excerpt', 'kutipan')).trim() && pick(x, 'name', 'nama', 'author'));
    photos = rank(g.byKind(...kinds), 'kind', kinds).filter(x => x && x.src);
    summary = u.ULASAN_RINGKAS || null;
  } catch (e) { console.warn('purna: reel data not loaded', e); return; }
  if (!quotes.length && !photos.length) return;

  // photo first, then alternate; whatever is left goes at the end
  const items = [];
  for (let i = 0; i < Math.max(quotes.length, photos.length); i++) {
    if (photos[i]) items.push(photoCard(photos[i]));
    if (quotes[i]) items.push(quoteCard(quotes[i]));
  }
  const node = tpl.content.firstElementChild.cloneNode(true);
  const h = $('[data-reel-h]', node), sub = $('[data-reel-sub]', node), all = $('[data-reel-all]', node);
  node.classList.toggle('pr-reel--q', !photos.length);   // reviews only: cards take the height of the longest quote, not the 4:5 photo box
  h.textContent = quotes.length && photos.length ? 'Dari showroom dan pelanggan.' : quotes.length ? 'Kata pelanggan.' : 'Dari showroom kami.';
  sub.textContent = quotes.length && photos.length ? 'Foto dari showroom Moto Ijo dan ulasan Google pelanggan.'
    : quotes.length ? 'Ulasan Google untuk showroom Moto Ijo di Palmerah.' : 'Foto dari showroom Moto Ijo di Palmerah.';
  if (quotes.length && summary?.url) {
    all.href = summary.url;
    $('[data-reel-all-t]', all).textContent = summary.count ? `Baca ${summary.count} ulasan di Google Maps` : 'Baca semua ulasan di Google Maps';
  } else all.remove();
  const track = $('[data-reel-track]', node);
  track.innerHTML = items.map((html, i) => html.replace('<figure class="pr-card', `<figure role="group" aria-roledescription="slide" aria-label="${i + 1} dari ${items.length}" class="pr-card`)).join('');
  tpl.after(node);
  run(node);
}

function run(root) {
  const view = $('[data-reel-view]', root), track = $('[data-reel-track]', root), bar = $('[data-reel-bar]', root), live = $('[data-reel-live]', root);
  const prev = $('[data-reel-prev]', root), next = $('[data-reel-next]', root);
  const slides = $$('.pr-card', track), n = slides.length;
  let cur = 0, maxX = 0, last = 0;

  const xOf = i => Math.min(slides[i].offsetLeft, maxX);
  function measure() {
    const end = slides[n - 1], pad = parseFloat(getComputedStyle(track).paddingRight) || 0;
    maxX = Math.max(0, Math.round(end.offsetLeft + end.offsetWidth + pad - view.clientWidth));
    last = slides.findIndex(s => s.offsetLeft >= maxX - 2); if (last < 0) last = n - 1;
    root.classList.toggle('is-static', maxX === 0);
    view.tabIndex = maxX === 0 ? -1 : 0;
  }
  function paint(x) {
    const total = maxX + view.clientWidth, w = view.clientWidth / total;
    bar.style.width = `${w * 100}%`; bar.style.transform = `translateX(${(x / view.clientWidth) * 100}%)`;
  }
  function go(i, { animate = !reduced, announce = false } = {}) {
    cur = clamp(i, 0, last);
    const x = xOf(cur);
    if (!animate) track.classList.add('is-still');
    track.style.transform = `translate3d(${-x}px,0,0)`;
    if (!animate) { void track.offsetWidth; track.classList.remove('is-still'); }
    prev.disabled = cur === 0; next.disabled = cur >= last;
    paint(x);
    if (announce) {
      const seen = slides.filter(s => s.offsetLeft >= x - 2 && s.offsetLeft + s.offsetWidth <= x + view.clientWidth + 2).length || 1;
      live.textContent = `Kartu ${cur + 1}${seen > 1 ? ` sampai ${Math.min(n, cur + seen)}` : ''} dari ${n}`;
    }
  }
  const nearest = x => slides.reduce((b, s, i) => (Math.abs(xOf(i) - x) < Math.abs(xOf(b) - x) ? i : b), 0);
  const step = () => { const x = xOf(cur); return Math.max(1, slides.filter(s => s.offsetLeft >= x - 2 && s.offsetLeft + s.offsetWidth <= x + view.clientWidth + 2).length - 1); };

  prev.addEventListener('click', () => go(cur - step(), { announce: true }));
  next.addEventListener('click', () => go(cur + step(), { announce: true }));
  view.addEventListener('keydown', e => {
    const to = { ArrowLeft: cur - 1, ArrowRight: cur + 1, Home: 0, End: last }[e.key];
    if (to === undefined || !maxX) return;
    e.preventDefault(); go(to, { announce: true });
  });
  // press and drag (mouse) or swipe (touch, pen): the row follows, rubber-bands at the ends, then settles on a card
  let base = 0;
  dragX(view, {
    start: () => { base = xOf(cur); track.classList.add('is-still'); },
    move: dx => {
      if (!maxX) return;
      let x = base - dx;
      if (x < 0) x /= 3; else if (x > maxX) x = maxX + (x - maxX) / 3;
      track.style.transform = `translate3d(${-x}px,0,0)`; paint(clamp(x, 0, maxX));
    },
    end: (dx, v) => {
      track.classList.remove('is-still');
      if (!maxX) return;
      let i = nearest(clamp(base - dx, 0, maxX));
      if (i === cur && v > .45 && Math.abs(dx) > 12) i = cur + (dx < 0 ? 1 : -1);   // a quick flick moves at least one card
      go(i, { announce: true });
    },
  });
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { measure(); go(cur, { animate: false }); }, 120); });
  // images are lazy: the widths are fixed in CSS, so measuring now is safe
  measure(); go(0, { animate: false });
}

initReel();
