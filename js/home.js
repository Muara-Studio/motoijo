// Moto Ijo · home v7 (1 Nov 2026). Facts from js/site.js + data/*.js; nothing on this page hard-codes a price.
// 1. facts  1b. hero banners  2. model stage per series (the signature, shared component js/stage.js)  3. hemat  4. cicilan  5. dock.
// Motion: transform/opacity only, no scroll listeners; reduced motion = no transitions. Carousels follow a mouse drag as well as touch.
// v9 motion (1 Nov 2026, js/motion.js): the hero banner on show pushes in slowly and its caption arrives line by line; a model
// arrives on the stage with weight (road dashes at its top speed, nose dip, settle) and its range cells charge; the calculator
// results roll like an odometer; the calculator bike rolls in the same way.
import { SITE, wa, CICIL, cicilan, MITRA, mitraBy, mitraWords } from './site.js';
import { SERIES, MODELS, bySlug } from '../data/models.js';
import { HEMAT, hitungHemat } from '../data/hemat.js';
import { stageHTML, esc, fmt, seriesLabel, detailHref } from './stage.js';
import { dragX } from './drag.js';
import { arrive, road, runRoad, meters, hold, odo } from './motion.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rp = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const rpRibu = n => rp(Math.round(n / 1000) * 1000);
const rpJuta = n => n >= 1e6 ? `Rp ${(Math.round(n / 1e5) / 10).toLocaleString('id-ID')} juta` : rpRibu(n);
const minPrice = ms => { const p = ms.map(m => m.priceNum).filter(Boolean); return p.length ? Math.min(...p) : null; };
const span = (ms, f) => { const v = ms.map(m => m[f]).filter(x => x != null); const a = Math.min(...v), b = Math.max(...v); return a === b ? `${a}` : `${a}–${b}`; };
const ORDER = ['motorbike', 'motorcycle'];
const inSeries = k => MODELS.filter(m => m.series === k);
const DEFAULT_MODEL = 'aura-gd008';   // mid-range Motorbike Series model for both calculators

/* ---------- 1. facts from SITE + data ---------- */
$$('[data-wa]').forEach(a => { a.href = wa(a.dataset.wa || undefined); });
$$('[data-maps]').forEach(a => { a.href = SITE.maps; });
$$('[data-site]').forEach(el => { if (SITE[el.dataset.site]) el.textContent = SITE[el.dataset.site]; });
if (SITE.exclusive) $$('[data-exclusive]').forEach(el => { el.textContent = SITE.exclusiveLine + '.'; });
{ const p = minPrice(MODELS); if (p) $$('[data-min-juta]').forEach(el => { el.textContent = `${Math.floor(p / 1e6)} jutaan`; }); }
$$('[data-count-models]').forEach(el => { el.textContent = MODELS.length; });
// FAQ answers come from the same data as the rest of the page
$$('[data-series-line]').forEach(el => { const s = SERIES[el.dataset.seriesLine]; if (s) el.textContent = s.line; });
$$('[data-faq="mitra"]').forEach(el => { el.textContent = mitraWords(); });
$$('[data-faq="tenors"]').forEach(el => { const t = CICIL.tenors; el.textContent = t.length > 1 ? `${t.slice(0, -1).join(', ')}, atau ${t.at(-1)}` : `${t[0]}`; });

// a cut-out that has not landed yet falls back to the brochure photo of the same model
function fallback(img, m) {
  img.addEventListener('error', () => {
    if (!m.life || img.dataset.fell) return;
    img.dataset.fell = 1; img.src = m.life; img.parentElement.classList.add('is-life');
  }, { once: true });
  if (img.complete && img.naturalWidth === 0 && img.currentSrc) img.dispatchEvent(new Event('error'));
}

/* ---------- 1b. hero banners: short crossfade (no sliding wipe), autoplay with a progress segment per slide ---------- */
(() => {
  const hero = $('[data-carousel]'); if (!hero) return;
  const view = $('[data-hview]', hero), slides = $$('.slide', hero), segs = $$('.seg', hero);
  const live = $('[data-hero-live]', hero), pauseBtn = $('[data-hpause]', hero);
  // the caption of a banner comes from data/models.js: series, name, price, three facts, one action
  slides.forEach(sl => {
    const m = bySlug(sl.dataset.model || ''), cap = $('[data-cap]', sl);
    if (!m || !cap) return;
    const facts = [fmt.power(m), fmt.speed(m), fmt.range(m)].filter(Boolean).map(f => f.plain).join(' · ');
    cap.innerHTML = `<div class="cap__t">
        <p class="cap__k">${esc(seriesLabel(m))}</p>
        <p class="cap__name"><span>${esc(m.name)}</span>${m.price ? `<span class="cap__price"><span>Mulai</span> <strong class="num">${esc(m.price)}</strong></span>` : ''}</p>
        <p class="cap__facts num">${esc(facts)}</p>
      </div>
      <a class="btn btn--light cap__btn" href="${detailHref(m)}">Lihat detail<span class="sr"> ${esc(m.name)}</span><span class="btn__arrow"><svg class="i" aria-hidden="true"><use href="assets/icons.svg#i-arrow-right"></use></svg></span></a>`;
  });
  const names = segs.map(t => t.getAttribute('aria-label'));
  let cur = 0, userPaused = false, pending = null;
  const reasons = new Set();
  const setInert = () => slides.forEach((s, k) => { s.inert = k !== cur; });
  setInert();
  const paused = (reason, on) => { on ? reasons.add(reason) : reasons.delete(reason); hero.classList.toggle('is-paused', reasons.size > 0); };
  if (reduced) { hero.classList.add('is-still'); userPaused = true; pauseBtn.setAttribute('aria-pressed', 'true'); pauseBtn.setAttribute('aria-label', 'Putar otomatis'); }
  const media = sl => $('.slide__media', sl);
  const capLines = sl => { const c = $('.slide__cap', sl), t = $('.cap__t, .cap__proof', c); return [...(t ? t.children : []), ...$$('.cap__btn', c)].filter(el => getComputedStyle(el).display !== 'none'); };

  // settle a running fade (at once when forced, so a quick second tap never stacks two slides). Only script animations are
  // cancelled: the css push on the picture keeps its clock. A natural finish lets the new caption finish arriving.
  const stop = sl => sl.getAnimations({ subtree: true }).forEach(a => { if (a.constructor === Animation) a.cancel(); });
  function settle(force = true) {
    if (!pending) return;
    const { out, inn, fade } = pending; pending = null;
    fade.onfinish = null; fade.cancel();
    out.classList.remove('is-on'); inn.classList.add('is-on'); inn.classList.remove('is-enter');
    stop(out); if (force) stop(inn);
  }
  function go(i, announce = false) {
    i = (i + slides.length) % slides.length;
    if (i === cur) return;
    settle();
    const out = slides[cur], inn = slides[i];
    segs[cur].removeAttribute('aria-current');
    segs.forEach((t, k) => t.classList.toggle('is-done', k < i));
    segs[i].setAttribute('aria-current', 'true');
    cur = i; setInert();
    if (announce) live.textContent = `Sorotan ${i + 1} dari ${slides.length}: ${names[i]}`;
    if (reduced) { out.classList.remove('is-on'); inn.classList.add('is-on'); return; }
    // the new slide fades in over the old one (opacity only); its picture starts its slow push (css, .is-enter)
    inn.classList.add('is-enter');
    const fade = inn.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.4,0,.2,1)' });
    // captions never overlap: the old one leaves first; the new one arrives a line at a time (series, name and price, facts, action)
    $('.slide__cap', out).animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'linear', fill: 'forwards' });
    capLines(inn).forEach((el, k) => el.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
      { duration: 460, delay: 170 + k * 70, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
    pending = { out, inn, fade };
    fade.onfinish = () => settle(false);
  }
  segs.forEach((t, k) => $('b', t).addEventListener('animationend', () => { if (k === cur && !userPaused) go(cur + 1); }));
  segs.forEach((t, k) => t.addEventListener('click', () => go(k, true)));
  $('[data-hnext]', hero).addEventListener('click', () => go(cur + 1, true));
  $('[data-hprev]', hero).addEventListener('click', () => go(cur - 1, true));
  pauseBtn.addEventListener('click', () => {
    userPaused = !userPaused;
    pauseBtn.setAttribute('aria-pressed', String(userPaused));
    pauseBtn.setAttribute('aria-label', userPaused ? 'Putar otomatis' : 'Jeda putar otomatis');
    hero.classList.toggle('is-still', userPaused);
    if (!userPaused) { const b = $('b', segs[cur]); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; }
  });
  if (matchMedia('(hover: hover)').matches) { view.addEventListener('mouseenter', () => paused('hover', true)); view.addEventListener('mouseleave', () => paused('hover', false)); }
  hero.addEventListener('focusin', () => paused('focus', true));
  hero.addEventListener('focusout', e => { if (!hero.contains(e.relatedTarget)) paused('focus', false); });
  document.addEventListener('visibilitychange', () => paused('hidden', document.hidden));
  new IntersectionObserver(([e]) => paused('away', !e.isIntersecting), { threshold: .35 }).observe(hero);
  hero.addEventListener('keydown', e => {
    if (e.target.closest('.hero__ctl') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); go(cur + (e.key === 'ArrowRight' ? 1 : -1), true); }
  });
  // drag or swipe the picture: it follows a little, then the next (or previous) banner fades in
  dragX(view, {
    start: () => { settle(); paused('drag', true); },
    // only the photo follows (the headline stays put); it grows a little so no edge shows. translate/scale are separate
    // properties, so they add to the CSS push on the same image instead of replacing it
    move: dx => { const img = $('img', slides[cur]); img.style.scale = '1.07'; img.style.translate = `${clamp(dx * .2, -48, 48).toFixed(1)}px 0`; },
    end: (dx, v) => {
      paused('drag', false);
      const img = $('img', slides[cur]), step = Math.abs(dx) > 60 || v > .45 ? (dx < 0 ? 1 : -1) : 0;
      if (!reduced) img.animate([{ translate: img.style.translate, scale: '1.07' }, { translate: '0 0', scale: '1' }], { duration: 360, easing: 'cubic-bezier(.22,1,.36,1)' });
      img.style.translate = ''; img.style.scale = '';
      if (step) go(cur + step, true);
    },
  }, 'select, input, textarea, .slide__cap, .hero__ctl');
})();

/* ---------- 2. the model stage: series switch → one model at a time, the next one peeks in ---------- */
(() => {
  const root = $('[data-lineup]'); if (!root) return;
  const serBox = $('[data-series]', root), stage = $('[data-stage]', root), view = $('[data-view]', root), track = $('[data-track]', root);
  const rail = $('[data-rail]', root), count = $('[data-count]', root), live = $('[data-stage-live]', root);
  const prev = $('[data-prev]', root), next = $('[data-next]', root);
  const peek = document.createElement('button');
  peek.type = 'button'; peek.className = 'lu__peek'; peek.tabIndex = -1; peek.setAttribute('aria-hidden', 'true');
  view.append(peek);

  let series = ORDER[0], models = [], slides = [], chips = [], cur = 0, seen = reduced;

  serBox.innerHTML = ORDER.map(k => {
    const ms = inSeries(k), p = minPrice(ms), s = SERIES[k];
    return `<button type="button" class="ser" data-ser="${k}" aria-pressed="${k === series}">
      <span class="ser__top"><span class="ser__l">${esc(s.label)}</span><span class="ser__n">${ms.length} model</span></span>
      <span class="ser__x num">${span(ms, 'powerW')} W · ${span(ms, 'speedKmh')} km/jam</span>
      ${p ? `<span class="ser__p">Mulai <strong class="num">${rp(p)}</strong></span>` : `<span class="ser__p">Tanya harga</span>`}
    </button>`;
  }).join('');

  function place(animate) {
    const s = slides[cur]; if (!s) return;
    if (!animate) track.classList.add('is-still');
    track.style.transform = `translate3d(${-s.offsetLeft}px,0,0)`;
    if (!animate) { void track.offsetWidth; track.classList.remove('is-still'); }
  }
  function warm(i) {   // the current model and its neighbours load now; the rest stay lazy
    for (const k of [i - 1, i, i + 1, i + 2]) { const img = slides[k] && $('.stage__pic img', slides[k]); if (img && img.loading === 'lazy') img.loading = 'eager'; }
  }
  function go(i, { animate = !reduced, announce = false } = {}) {
    i = clamp(i, 0, models.length - 1);
    const was = cur;
    cur = i;
    slides.forEach((s, k) => { s.classList.toggle('is-on', k === i); s.classList.toggle('is-next', k === i + 1); s.inert = k !== i; });
    chips.forEach((c, k) => c.setAttribute('aria-current', String(k === i)));
    count.textContent = `${i + 1} / ${models.length}`;
    prev.disabled = i === 0; next.disabled = i === models.length - 1; peek.hidden = next.disabled;
    warm(i); place(animate);
    const c = chips[i]; if (c) { const li = c.parentElement, left = li.offsetLeft - rail.clientWidth / 2 + li.offsetWidth / 2; rail.scrollTo({ left, behavior: animate ? 'smooth' : 'auto' }); }
    if (announce) live.textContent = `${models[i].name}, ${i + 1} dari ${models.length}`;
    if (animate && i !== was) play(i, i > was ? 1 : -1);
  }
  // the model arrives (js/motion.js): it lags its stage a little, the road runs at its top speed (Centurion 100 km/jam runs
  // 2.5× as fast as Try Lite 40 km/jam), it stops with a nose dip; then the range cells charge. dir 0 = it pulls up in place.
  function play(i, dir) {
    const s = slides[i]; if (!s || reduced) return;
    seen = true;
    const pic = $('.stage__pic', s), img = $('img', pic);
    if (!pic.classList.contains('is-life') && !img.classList.contains('is-life')) arrive(img, { dir, stopAt: runRoad($('.st-road', pic), models[i].speedKmh, { delay: dir ? 200 : 0 }) || 1300 });
    meters($('.meters', s), { delay: 240 });
  }
  function build(k, { start = 0, announce = false } = {}) {
    series = k; models = inSeries(k);
    $$('[data-ser]', serBox).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ser === k)));
    track.innerHTML = models.map((m, i) => `<div class="lu__slide" role="group" aria-roledescription="slide" aria-label="${i + 1} dari ${models.length}: ${esc(m.name)}">${stageHTML(m, { h: 'h3', id: `lu-${m.slug}`, ride: false })}</div>`).join('');
    rail.innerHTML = models.map((m, i) => `<li><button type="button" class="rl" data-go="${i}" aria-current="false">
      <span class="rl__img"><img src="${esc(m.img)}" alt="" width="124" height="83" loading="lazy" decoding="async"></span>
      <span class="rl__n">${esc(m.short)}</span><span class="rl__p num">${m.price ? esc(m.price) : 'Tanya harga'}</span></button></li>`).join('');
    slides = $$('.lu__slide', track); chips = $$('[data-go]', rail);
    slides.forEach((s, i) => { fallback($('.stage__pic img', s), models[i]); road($('.stage__pic', s)); });
    chips.forEach((c, i) => fallback($('img', c), models[i]));
    go(start, { animate: false });
    if (announce) live.textContent = `${SERIES[k].label}: ${models.length} model. ${models[start].name}, ${start + 1} dari ${models.length}`;
    if (announce) play(start, 1);                       // a new series: its first model drives in
    else if (!seen) hold($('.meters', slides[start]));  // until the stage is seen, its meters wait empty
  }

  serBox.addEventListener('click', e => { const b = e.target.closest('[data-ser]'); if (b && b.dataset.ser !== series) build(b.dataset.ser, { announce: true }); });
  // a tap on the rail brings the stage into view when it has scrolled away (phone)
  const reveal = () => {
    const r = view.getBoundingClientRect(), nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
    if (r.top < 0) scrollTo({ top: scrollY + r.top - nav - 12, behavior: reduced ? 'auto' : 'smooth' });
  };
  rail.addEventListener('click', e => { const c = e.target.closest('[data-go]'); if (c) { go(+c.dataset.go, { announce: true }); reveal(); } });
  prev.addEventListener('click', () => go(cur - 1, { announce: true }));
  next.addEventListener('click', () => go(cur + 1, { announce: true }));
  peek.addEventListener('click', () => go(cur + 1, { announce: true }));
  stage.addEventListener('keydown', e => {
    if (e.target.matches('input, select, textarea') || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    e.preventDefault(); go(cur + (e.key === 'ArrowRight' ? 1 : -1), { announce: true });
    if (e.target.closest('[data-go]')) chips[cur].focus({ preventScroll: true });
  });
  // press and drag (mouse) or swipe (touch): the row follows the pointer, then settles on the nearest model
  let base = 0;
  dragX(view, {
    start: () => { base = -slides[cur].offsetLeft; track.classList.add('is-still'); },
    move: dx => {
      const edge = (cur === 0 && dx > 0) || (cur === models.length - 1 && dx < 0);   // rubber band at the ends
      track.style.transform = `translate3d(${base + (edge ? dx / 3 : dx)}px,0,0)`;
    },
    end: (dx, v) => {
      track.classList.remove('is-still');
      const w = slides[cur].offsetWidth, step = Math.abs(dx) > w * .16 || v > .5 ? (dx < 0 ? 1 : -1) : 0;
      go(cur + step, { announce: step !== 0 });
    },
  });
  // the rail: a mouse can drag it sideways too (touch scrolls it natively)
  {
    let rx = null, rl0 = 0, moved = false;
    rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0 || rail.scrollWidth <= rail.clientWidth) return; rx = e.clientX; rl0 = rail.scrollLeft; moved = false; });
    rail.addEventListener('pointermove', e => {
      if (rx === null) return;
      const dx = e.clientX - rx;
      if (!moved && Math.abs(dx) > 6) { moved = true; rail.setPointerCapture(e.pointerId); rail.classList.add('is-drag'); }
      if (moved) rail.scrollLeft = rl0 - dx;
    });
    const stop = () => { if (rx === null) return; rx = null; rail.classList.remove('is-drag'); if (moved) setTimeout(() => { moved = false; }, 60); };
    rail.addEventListener('pointerup', stop); rail.addEventListener('pointercancel', stop);
    rail.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    rail.addEventListener('dragstart', e => e.preventDefault());
  }
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => place(false), 120); });
  // the first time the stage is in view, the model on it pulls up: road at its speed, nose dip, cells charge
  if (!seen && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || (e.intersectionRatio < .55 && e.intersectionRect.height < innerHeight * .5)) return;
      io.disconnect(); if (!seen) play(cur, 0);
    }, { threshold: [0, .3, .55, .8] });
    io.observe(view);
  }

  // a link like index.html?seri=motorcycle&m=luna-gd003#model opens on that model
  const q = new URLSearchParams(location.search), want = bySlug(q.get('m') || '');
  const k0 = want ? want.series : (ORDER.includes(q.get('seri')) ? q.get('seri') : ORDER[0]);
  build(k0, { start: want ? Math.max(0, inSeries(k0).indexOf(want)) : 0 });
})();

/* ---------- 2b. "Sekali cas, sampai mana?": the line-up's ranges as rings around the showroom ----------
   Ring radius (straight line) = range ÷ 2 (pergi-pulang) ÷ ROAD. Places are approximate centres (lat, lon); distance is
   straight-line × ROAD, shown as "± km lewat jalan". Rough on purpose, and the caption says so. */
const ROAD = 1.3;
const HOME = { lat: -6.2071251, lon: 106.7877288 };   // SITE geo, the showroom
// [name, lat, lon, label side ('l' = left of the dot), minor = label hidden on phones]
const PLACES = [
  ['Blok M', -6.2443, 106.7997, 'r', 1], ['Bintaro', -6.2725, 106.7244], ['Monas', -6.1754, 106.8272], ['Ancol', -6.1229, 106.8337, 'r', 1],
  ['Ragunan', -6.3105, 106.8204, 'l', 1], ['Kelapa Gading', -6.1588, 106.9056, 'r', 1], ['Tanjung Priok', -6.1045, 106.8805],
  ['Taman Mini', -6.3025, 106.8952], ['Bandara Soetta', -6.1256, 106.6559], ['Tangerang', -6.1783, 106.6319, 'r', 1], ['BSD', -6.3019, 106.6522],
  ['Cibubur', -6.3683, 106.8936], ['Bekasi', -6.2383, 106.9756], ['Depok', -6.4025, 106.7942], ['Cikarang', -6.2614, 107.1527, 'l'], ['Bogor', -6.5971, 106.8060],
];
// Jakarta Bay, rough: enough to read north and the sea
const COAST = [[-6.02, 106.40], [-6.03, 106.55], [-6.08, 106.70], [-6.10, 106.745], [-6.105, 106.77], [-6.11, 106.79], [-6.12, 106.81], [-6.122, 106.84],
  [-6.095, 106.88], [-6.10, 106.94], [-6.10, 106.965], [-6.05, 107.00], [-5.95, 107.03], [-5.90, 107.20]];
const KX = 111.32 * Math.cos(HOME.lat * Math.PI / 180), KY = 110.57;
const km = (lat, lon) => [(lon - HOME.lon) * KX, (HOME.lat - lat) * KY];   // x east, y south, in km
(() => {
  const root = $('[data-jauh]'); if (!root) return;
  const pick = $('[data-jauh-pick]', root), out = $('[data-jauh-out]', root), box = $('[data-jauh-map]', root), mdl = $('[data-jauh-models]', root);
  // one choice per range value, with the models that share it
  const groups = [...MODELS.reduce((g, m) => { if (m.rangeKm) { const k = m.rangeKm; g.has(k) || g.set(k, []); g.get(k).push(m); } return g; }, new Map())]
    .sort((a, b) => a[0] - b[0]);
  const places = PLACES.map(([name, lat, lon, side = 'r', minor = 0]) => { const [x, y] = km(lat, lon); return { name, x, y, side, minor, d: Math.hypot(x, y) }; });
  const V = { x0: -42, y0: -24, w: 90, h: 70 }, S = 10;   // view in km; S = SVG units per km
  const P = (x, y) => `${((x - V.x0) * S).toFixed(1)},${((y - V.y0) * S).toFixed(1)}`;
  const sea = `M${P(V.x0, V.y0)} L${P(V.x0, km(...COAST[0])[1])} ${COAST.map(c => 'L' + P(...km(...c))).join(' ')} L${P(V.x0 + V.w, km(...COAST.at(-1))[1])} L${P(V.x0 + V.w, V.y0)} Z`;
  const maxR = groups.at(-1)[0] / 2 / ROAD;
  const cx = (0 - V.x0) * S, cy = (0 - V.y0) * S;
  box.innerHTML = `<svg viewBox="0 0 ${V.w * S} ${V.h * S}" role="img" aria-labelledby="jauh-t"><title id="jauh-t">Peta jarak dari showroom Moto Ijo</title>
    <path class="jm__sea" d="${sea}"/>
    <text class="jm__seal" x="${(V.w * S * .12).toFixed(0)}" y="${(5 * S).toFixed(0)}">Laut Jawa</text>
    ${[10, 20, 30, 40].map(r => `<circle class="jm__grid" cx="${cx}" cy="${cy}" r="${r * S}"/>`).join('')}
    <circle class="jm__ring" cx="${cx}" cy="${cy}" r="${(maxR * S).toFixed(1)}" data-ring/>
    ${places.map((p, i) => `<g class="jm__pl${p.minor ? ' is-minor' : ''}" data-pl="${i}" transform="translate(${P(p.x, p.y)})"><circle r="7"/><text x="${p.side === 'l' ? -12 : 12}" y="7" text-anchor="${p.side === 'l' ? 'end' : 'start'}">${esc(p.name)}</text></g>`).join('')}
    <g class="jm__home" transform="translate(${cx},${cy})"><circle class="jm__pulse" r="16"/><circle r="11"/></g>
    <g class="jm__key" transform="translate(30,${(V.h * S - 64).toFixed(0)})"><circle class="jm__key-home" cx="8" cy="0" r="9"/><text x="26" y="7">Showroom Moto Ijo</text><circle class="jm__key-in" cx="8" cy="34" r="7"/><text x="26" y="41">Bisa pergi-pulang</text></g>
    <g class="jm__scale" transform="translate(${(V.w * S - 40 - 10 * S).toFixed(0)},${(V.h * S - 30).toFixed(0)})"><path d="M0 0 H${10 * S}"/><text x="${5 * S}" y="-10" text-anchor="middle">10 km</text></g>
  </svg>`;
  const ring = $('[data-ring]', box), pls = $$('[data-pl]', box);
  pick.innerHTML = groups.map(([r, ms]) => `<button type="button" class="jp" role="radio" aria-checked="false" data-r="${r}">
    <span class="jp__r num">${ms.some(m => m.rangeApprox) ? '±' : ''}${r} km</span><span class="jp__m">${esc(ms.map(m => m.short).join(', '))}</span></button>`).join('');
  const btns = $$('[data-r]', pick);
  function set(r, focus) {
    const R = r / 2 / ROAD, inside = places.filter(p => p.d <= R).sort((a, b) => b.d - a.d);
    btns.forEach(b => { const on = +b.dataset.r === r; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    ring.style.transform = `scale(${(R / maxR).toFixed(4)})`;
    pls.forEach((g, i) => { const p = places[i], on = p.d <= R; g.classList.toggle('is-in', on); g.style.transitionDelay = reduced ? '0ms' : `${Math.round(120 + p.d / R * 380)}ms`; });
    const g = groups.find(([k]) => k === r); if (mdl && g) mdl.textContent = g[1].map(m => m.short).join(', ');   // phone: the chips show only the km
    const far = inside[0];
    out.innerHTML = inside.length
      ? `Pergi-pulang ke <strong>${inside.length} tempat</strong> di peta. Paling jauh <strong>${esc(far.name)}</strong>, sekitar <span class="num">${Math.round(far.d * ROAD)}</span> km sekali jalan.`
      : 'Cukup untuk keliling sekitar Palmerah.';
  }
  pick.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b) set(+b.dataset.r); });
  pick.addEventListener('keydown', e => {
    const i = btns.findIndex(b => b.getAttribute('aria-checked') === 'true'), k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (k) { e.preventDefault(); set(+btns[clamp(i + k, 0, btns.length - 1)].dataset.r, true); }
  });
  const start = (groups.find(([, ms]) => ms.some(m => m.slug === DEFAULT_MODEL)) || groups[0])[0];
  set(start);
  // the first time the map shows, the ring grows from the showroom
  if (!reduced) {
    root.classList.add('is-wait');
    new IntersectionObserver(([e], io) => { if (e.isIntersecting) { io.disconnect(); requestAnimationFrame(() => root.classList.remove('is-wait')); } }, { threshold: .35 }).observe(box);
  }
})();

/* ---------- 3. hemat vs motor bensin, for a model the visitor picks ----------
   kWh per km from the wall = battery (V × Ah) / 85% charger efficiency / range (docs/facts-hemat.md §4: same method as before). */
const CHARGER_EFF = 0.85;   // our assumption, facts-hemat.md §4.2
function kwhPerKm(m) {
  const b = /(\d+(?:[.,]\d+)?)\s*V\s*(\d+(?:[.,]\d+)?)\s*Ah/i.exec(m.battery || '');
  if (!b || !m.rangeKm) return null;
  return (parseFloat(b[1].replace(',', '.')) * parseFloat(b[2].replace(',', '.')) / 1000) / CHARGER_EFF / m.rangeKm;
}
// the chosen model's cut-out beside a calculator heading: the new bike rolls in, the old one rolls out
function calcPic(box, m) {
  if (!box || !m || box.dataset.slug === m.slug) return;
  box.dataset.slug = m.slug;
  const photo = /\/brochure\//.test(m.img || '');
  const img = new Image(400, 300);
  img.alt = ''; img.decoding = 'async'; img.draggable = false;
  img.src = (m.img || '').replace(/\.webp$/, photo ? '-600.webp' : '-400.webp');
  img.onerror = () => { img.onerror = null; img.src = m.img; };
  if (photo) img.className = 'is-life';
  const old = [...box.querySelectorAll('img')];
  box.append(img);
  if (reduced || !old.length) { old.forEach(o => o.remove()); return; }
  old.forEach(o => { o._arrive?.cancel(); o.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(-28%)', opacity: 0 }], { duration: 260, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }).finished.then(() => o.remove(), () => o.remove()); });
  // the new bike drives in from the right and stops with a nose dip, like the model stage (a brochure photo only slides in)
  if (photo) img.animate([{ transform: 'translateX(32%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 560, delay: 120, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
  else arrive(img, { dir: 1, travel: 36, stopAt: 560, fade: true });
}

const options = (list, text) => ORDER.map(k => {
  const ms = list.filter(m => m.series === k);
  return ms.length ? `<optgroup label="${esc(SERIES[k].label)}">${ms.map(m => `<option value="${m.slug}">${esc(text(m))}</option>`).join('')}</optgroup>` : '';
}).join('');

(() => {
  const box = $('[data-hemat]'); if (!box) return;
  const sel = $('[data-he-model]', box), range = $('[data-km-range]', box), out = $('[data-km-out]', box), chipBox = $('[data-km-chips]', box);
  const f = k => $(`[data-h="${k}"]`, box);
  const list = MODELS.filter(kwhPerKm);
  sel.innerHTML = options(list, m => m.short);
  sel.value = list.some(m => m.slug === DEFAULT_MODEL) ? DEFAULT_MODEL : list[0].slug;
  chipBox.innerHTML = HEMAT.kmChips.map(n => `<button type="button" class="chip" data-km="${n}" aria-pressed="false">${n} km</button>`).join('');
  const chips = $$('[data-km]', chipBox);
  range.min = HEMAT.kmMin; range.max = HEMAT.kmMax; range.value = HEMAT.kmDefault;
  f('cara').textContent = `Perkiraan biaya bensin dan listrik saja, untuk ${HEMAT.daysPerMonth} hari jalan sebulan. Listrik dihitung dari baterai dan jarak tempuh model ini.`;
  let km = HEMAT.kmDefault;
  function update() {
    km = clamp(Math.round(km), HEMAT.kmMin, HEMAT.kmMax);
    const m = bySlug(sel.value);
    const r = hitungHemat(km, { ...HEMAT, listrik: { ...HEMAT.listrik, kwhPerKm: kwhPerKm(m), label: m.name } });
    out.textContent = `${km} km`;
    range.value = km; range.style.setProperty('--p', `${(km - HEMAT.kmMin) / (HEMAT.kmMax - HEMAT.kmMin) * 100}%`);
    range.setAttribute('aria-valuetext', `${km} kilometer per hari`);
    chips.forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.km === km)));
    odo(f('bulan'), rpRibu(r.hematBulan));   // rolls like an odometer; the value stays as text
    f('bensin').textContent = rpRibu(r.bensin) + ' / bulan';
    f('listrik').textContent = rpRibu(r.listrik) + ' / bulan';
    f('listrik-lab').textContent = m.name;
    calcPic($('[data-calc-pic]', box), m);
    f('tahun').textContent = rpJuta(r.hematTahun);
    $('[data-bar="bensin"]', box).style.setProperty('--w', 1);
    $('[data-bar="listrik"]', box).style.setProperty('--w', Math.max(.02, r.listrik / r.bensin).toFixed(3));
  }
  sel.addEventListener('change', update);
  range.addEventListener('input', () => { km = +range.value; update(); });
  chipBox.addEventListener('click', e => { const c = e.target.closest('[data-km]'); if (c) { km = +c.dataset.km; update(); } });
  update();
})();

/* ---------- 4. cicilan, kira-kira (the site's one formula: CICIL + cicilan() in site.js) ---------- */
(() => {
  const box = $('[data-cicil]'); if (!box) return;
  const sel = $('[data-ci-model]', box), tenorBox = $('[data-ci-tenors]', box), mitraSel = $('[data-ci-mitra]', box);
  mitraSel.innerHTML = MITRA.map(x => `<option value="${x.key}">${esc(x.label)}</option>`).join('');
  const priced = MODELS.filter(m => m.priceNum);
  sel.innerHTML = options(priced, m => `${m.short} · ${m.price}`);
  sel.value = priced.some(m => m.slug === DEFAULT_MODEL) ? DEFAULT_MODEL : priced[0].slug;
  tenorBox.innerHTML = CICIL.tenors.map(n => `<button type="button" class="chip" data-tenor="${n}" aria-pressed="false">${n} bulan</button>`).join('');
  const st = { dp: CICIL.dpPct, tenor: CICIL.tenor };
  const f = k => $(`[data-ci="${k}"]`, box);
  function update() {
    const m = bySlug(sel.value), price = m.priceNum;
    const mt = mitraBy(mitraSel.value), dpRp = Math.round(price * st.dp / 100), r = cicilan(price, dpRp, st.tenor, mt);
    const ongkos = r.bunga + (r.pokok - (price - dpRp));   // bunga + biaya penanganan
    f('biaya').textContent = mt.rate ? `Bunga dan biaya penanganan sekitar ${rp(ongkos)} selama ${st.tenor} bulan.` : 'Cicilan 0%, ujrah bulanan kartu belum termasuk.';
    f('mitra').textContent = mt.label; f('mitra-v').textContent = mt.label;
    odo(f('bulan'), rp(r.bulan));
    f('dp').textContent = st.dp ? `DP ${rp(dpRp)}, ${st.tenor} kali bayar` : `Tanpa DP, ${st.tenor} kali bayar`;
    f('wa').href = wa(`Halo Moto Ijo, saya mau cicil ${m.name} lewat ${mt.label}, DP ${st.dp}%, tenor ${st.tenor} bulan. Bisa dibantu?`);
    calcPic($('[data-calc-pic]', box), m);
    $$('[data-dp]', box).forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.dp === st.dp)));
    $$('[data-tenor]', box).forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.tenor === st.tenor)));
  }
  sel.addEventListener('change', update);
  mitraSel.addEventListener('change', update);
  $$('[data-dp]', box).forEach(c => c.addEventListener('click', () => { st.dp = +c.dataset.dp; update(); }));
  tenorBox.addEventListener('click', e => { const c = e.target.closest('[data-tenor]'); if (c) { st.tenor = +c.dataset.tenor; update(); } });
  update();
})();

/* ---------- 5. dock: steps aside while a big test-ride button of the page shows (and, on desktop, at the footer's end).
   On desktop it also waits while the nav (with its own test-ride button) is on screen: one test-ride button at a time. ---------- */
(() => {
  const body = document.body, seen = new Set(), end = $('.foot__end');
  const io = new IntersectionObserver(es => {
    es.forEach(e => e.isIntersecting ? seen.add(e.target) : seen.delete(e.target));
    body.classList.toggle('own-cta', seen.size > 0);
  }, { rootMargin: '0px 0px -30% 0px' });   // a section that only peeks in at the bottom (phone first screen) does not hide the dock
  $$('[data-own-cta]').forEach(el => io.observe(el));
  if (end) new IntersectionObserver(([e]) => body.classList.toggle('at-foot', e.isIntersecting)).observe(end);
})();
