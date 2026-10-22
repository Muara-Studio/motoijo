// Moto Ijo · home v5 (GODA family). Hero banners (crossfade), hemat + cicilan calculators, catalogue, the M1 Laser scroll turn
// (canvas frame sequence, config-driven, falls back to the 3D stills), catalogue filter, paint rail.
// Motion rules (docs/perf.md): transform/opacity only, no layout reads per frame, one rAF loop that runs
// only while the signature is on screen, native scrolling.
import { SITE, wa, CICIL, cicilan } from './site.js';
import { MODELS, bySlug } from '../data/models.js';
import { HEMAT, hitungHemat } from '../data/hemat.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const digits = s => Number(String(s).replace(/\D/g, ''));
const rp = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const rpRibu = n => rp(Math.round(n / 1000) * 1000);
const rpJuta = n => n >= 1e6 ? `Rp ${(Math.round(n / 1e5) / 10).toLocaleString('id-ID')} juta` : rpRibu(n);

/* ---------- facts from SITE + data ---------- */
$$('[data-wa]').forEach(a => { a.href = wa(a.dataset.wa || undefined); });
$$('[data-maps]').forEach(a => { a.href = SITE.maps; });
$$('[data-site]').forEach(el => { if (SITE[el.dataset.site]) el.textContent = SITE[el.dataset.site]; });
$$('[data-price]').forEach(el => { const m = bySlug(el.dataset.price); if (m && m.price) el.textContent = m.price.replace(/^mulai\s*/i, ''); });
if (SITE.exclusive) $$('[data-exclusive]').forEach(el => { el.textContent = SITE.exclusiveLine + '.'; });

/* =========================================================== 1. hero banners: short crossfade, nothing slides */
(() => {
  const hero = $('[data-carousel]'); if (!hero) return;
  const view = $('.hero__view', hero), slides = $$('.slide', hero), tabs = $$('.tab', hero);
  const live = $('[data-hero-live]', hero), pauseBtn = $('[data-pause]', hero);
  const names = tabs.map(t => t.textContent.trim());
  let cur = 0, userPaused = false, pending = null;
  const reasons = new Set();
  const setInert = () => slides.forEach((s, k) => { s.inert = k !== cur; });
  setInert();

  function paused(reason, on) {
    on ? reasons.add(reason) : reasons.delete(reason);
    hero.classList.toggle('is-paused', reasons.size > 0);
  }
  if (reduced) { hero.classList.add('is-still'); userPaused = true; pauseBtn.setAttribute('aria-pressed', 'true'); pauseBtn.setAttribute('aria-label', 'Putar otomatis'); }

  // settle a running fade at once, so a quick second tap never stacks two slides
  function settle() {
    if (!pending) return;
    const { out, inn, fade } = pending; pending = null;
    fade.onfinish = null; fade.cancel();
    out.classList.remove('is-on'); inn.classList.add('is-on'); inn.classList.remove('is-enter');
    [out, inn].forEach(sl => { const c = $('.slide__in', sl); c && c.getAnimations().forEach(a => a.cancel()); });
  }
  function go(i, dir = 1, announce = false) {
    i = (i + slides.length) % slides.length;
    if (i === cur) return;
    settle();
    const out = slides[cur], inn = slides[i];
    tabs[cur].removeAttribute('aria-current');
    tabs.forEach((t, k) => t.classList.toggle('is-done', k < i));
    tabs[i].setAttribute('aria-current', 'true');
    cur = i; setInert();
    if (announce) live.textContent = `Sorotan ${i + 1} dari ${slides.length}: ${names[i]}`;
    if (reduced) { out.classList.remove('is-on'); inn.classList.add('is-on'); return; }
    // the new slide fades in over the old one (opacity only); its photo settles from 2% larger
    inn.classList.add('is-enter');
    const fade = inn.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.4,0,.2,1)' });
    const media = $('.slide__media img, .slide__bike', inn);
    media && media.animate([{ transform: 'scale(1.02)' }, { transform: 'none' }], { duration: 900, easing: 'cubic-bezier(.22,1,.36,1)' });
    // copy never overlaps copy: the old text leaves first, the new text arrives in the second half
    const oldCopy = $('.slide__in', out), newCopy = $('.slide__in', inn);
    oldCopy && oldCopy.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'linear', fill: 'forwards' });
    newCopy && newCopy.animate([{ opacity: 0, offset: 0 }, { opacity: 0, offset: .4 }, { opacity: 1 }], { duration: 520, easing: 'linear' });
    pending = { out, inn, fade };
    fade.onfinish = settle;
  }
  // autoplay: the current tab's progress bar is a CSS animation; its end advances the slide
  tabs.forEach((t, k) => $('b', t).addEventListener('animationend', () => { if (k === cur && !userPaused) go(cur + 1, 1); }));
  tabs.forEach((t, k) => t.addEventListener('click', () => go(k, k > cur ? 1 : -1, true)));
  $('[data-next]', hero).addEventListener('click', () => go(cur + 1, 1, true));
  $('[data-prev]', hero).addEventListener('click', () => go(cur - 1, -1, true));
  pauseBtn.addEventListener('click', () => {
    userPaused = !userPaused;
    pauseBtn.setAttribute('aria-pressed', String(userPaused));
    pauseBtn.setAttribute('aria-label', userPaused ? 'Putar otomatis' : 'Jeda putar otomatis');
    hero.classList.toggle('is-still', userPaused);
    if (!userPaused) { const b = $('b', tabs[cur]); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; }
  });
  if (matchMedia('(hover: hover)').matches) { view.addEventListener('mouseenter', () => paused('hover', true)); view.addEventListener('mouseleave', () => paused('hover', false)); }
  hero.addEventListener('focusin', () => paused('focus', true));
  hero.addEventListener('focusout', e => { if (!hero.contains(e.relatedTarget)) paused('focus', false); });
  document.addEventListener('visibilitychange', () => paused('hidden', document.hidden));
  new IntersectionObserver(([e]) => { paused('away', !e.isIntersecting); document.body.classList.toggle('at-hero', e.isIntersecting); }, { threshold: .35 }).observe(hero);
  hero.addEventListener('keydown', e => {
    if (e.target.closest('.hero__bar') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); go(cur + (e.key === 'ArrowRight' ? 1 : -1), e.key === 'ArrowRight' ? 1 : -1, true); }
  });
  // swipe (touch and pen; mouse users have the tabs and arrows)
  let sx = 0, sy = 0, sid = null;
  view.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; sid = e.pointerId; sx = e.clientX; sy = e.clientY; });
  view.addEventListener('pointerup', e => {
    if (e.pointerId !== sid) return; sid = null;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) go(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1, true);
  });
  view.addEventListener('pointercancel', () => { sid = null; });
})();

/* =========================================================== 2a. hemat vs motor bensin */
(() => {
  const box = $('[data-hemat]'); if (!box) return;
  const range = $('[data-km-range]', box), out = $('[data-km-out]', box), chips = $$('[data-km]', box);
  const f = k => $(`[data-h="${k}"]`, box);
  range.min = HEMAT.kmMin; range.max = HEMAT.kmMax; range.value = HEMAT.kmDefault;
  f('cara').textContent = `Hanya biaya bensin dan listrik, untuk ${HEMAT.daysPerMonth} hari jalan sebulan.`;
  function update(km) {
    km = clamp(Math.round(km), HEMAT.kmMin, HEMAT.kmMax);
    const r = hitungHemat(km);
    out.textContent = `${km} km`;
    range.value = km; range.style.setProperty('--p', `${(km - HEMAT.kmMin) / (HEMAT.kmMax - HEMAT.kmMin) * 100}%`);
    range.setAttribute('aria-valuetext', `${km} kilometer per hari`);
    chips.forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.km === km)));
    f('bulan').textContent = rpRibu(r.hematBulan);
    f('bensin').textContent = rpRibu(r.bensin) + ' / bulan';
    f('listrik').textContent = rpRibu(r.listrik) + ' / bulan';
    f('tahun').textContent = rpJuta(r.hematTahun);
    $('[data-bar="bensin"]', box).style.setProperty('--w', 1);
    $('[data-bar="listrik"]', box).style.setProperty('--w', Math.max(.02, r.listrik / r.bensin).toFixed(3));
  }
  range.addEventListener('input', () => update(+range.value));
  chips.forEach(c => c.addEventListener('click', () => update(+c.dataset.km)));
  update(HEMAT.kmDefault);
})();

/* =========================================================== 2b. cicilan, kira-kira (the site's one formula: CICIL + cicilan() in site.js) */
(() => {
  const box = $('[data-cicil]'); if (!box) return;
  const sel = $('[data-ci-model]', box), tenorBox = $('[data-ci-tenors]', box);
  const priced = MODELS.filter(m => m.price);
  sel.innerHTML = priced.map(m => `<option value="${m.slug}">${m.short} · ${m.price.replace(/^mulai\s*/i, '')}</option>`).join('');
  sel.value = 'm1-laser';
  tenorBox.innerHTML = CICIL.tenors.map(n => `<button type="button" class="chip" data-tenor="${n}" aria-pressed="false">${n} bulan</button>`).join('');
  const st = { dp: CICIL.dpPct, tenor: CICIL.tenor };
  const f = k => $(`[data-ci="${k}"]`, box);
  function update() {
    const m = bySlug(sel.value), price = digits(m.price);
    const dpRp = Math.round(price * st.dp / 100), r = cicilan(price, dpRp, st.tenor);
    f('bulan').textContent = rp(r.bulan);
    f('dp').textContent = st.dp ? `DP ${rp(dpRp)}, ${st.tenor} kali bayar` : `Tanpa DP, ${st.tenor} kali bayar`;
    f('link').href = `simulasi-cicilan.html?m=${m.slug}&dp=${st.dp}&tenor=${st.tenor}`;   // the full page opens with the same numbers
    f('wa').href = wa(`Halo Moto Ijo, saya mau cicil ${m.name}, DP ${st.dp}%, tenor ${st.tenor} bulan. Bisa dibantu?`);
    $$('[data-dp]', box).forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.dp === st.dp)));
    $$('[data-tenor]', box).forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.tenor === st.tenor)));
  }
  sel.addEventListener('change', update);
  $$('[data-dp]', box).forEach(c => c.addEventListener('click', () => { st.dp = +c.dataset.dp; update(); }));
  tenorBox.addEventListener('click', e => { const c = e.target.closest('[data-tenor]'); if (c) { st.tenor = +c.dataset.tenor; update(); } });
  update();
})();

/* =========================================================== 3. signature: M1 Laser turn → paint picker */
// Colour model: the turn exists only in Laser Green (frames 1–96); Laser Red exists only as the front end frame.
// So the chosen colour applies to the end pose, where the picker is: red = redT (the choice, tweened) × endMix
// (how far into the end the scroll is). Scrolling back up crossfades red → green on the SAME front pose, then the
// green bike turns on the dark field. Red is never drawn over another pose, so only one bike is ever visible.
const SEQ = {
  manifest: 'assets/seq/m1/manifest.json',
  // fallback while the frame sequence is missing: two 3D stills, cut (never crossfaded) at the middle
  fallback: { frames: ['assets/img/3d/turn-L02-side.webp', 'assets/img/3d/turn-L01-34front.webp'], red: 'assets/img/3d/color-laser-red-L34.webp', w: 1600, h: 1000 },
  // where the bike sits inside every frame (alpha bounds measured on 0001–0096 + end): top 10.3%, bottom 96.6%
  top: .103, bottom: .966,
};
async function loadSeqConfig() {
  // manifest: { count, pad, pattern: "{folder}/{nnnn}.webp", folders: { green, "green-900", ... }, end: { green, red, ... } }
  try {
    const r = await fetch(SEQ.manifest, { cache: 'no-cache' }); if (!r.ok) throw 0;
    const m = await r.json();
    const n = m.count || m.frames || m.n; if (!n) throw 0;
    const small = innerWidth < 760 || innerWidth * Math.min(devicePixelRatio || 1, 2) < 1100;
    const folders = m.folders || {};
    const folder = small && folders['green-900'] ? 'green-900' : 'green';
    const pad = m.pad || 4, pattern = m.pattern || '{folder}/{nnnn}.webp';
    const root = 'assets/seq/m1/';
    const frames = Array.from({ length: n }, (_, k) => root + pattern.replace('{folder}', folder).replace('{nnnn}', String(k + 1).padStart(pad, '0')));
    const end = m.end || {};
    const red = root + (end[small ? 'red-900' : 'red'] || end.red || 'red/end.webp');
    const f = folders[folder] || {};
    return { frames, red, w: f.width || m.width || 1600, h: f.height || m.height || 1000, real: true };
  } catch { return { ...SEQ.fallback, real: false }; }
}

(() => {
  const sig = $('[data-sig]'); if (!sig) return;
  const stage = $('.sig__stage', sig), canvas = $('[data-sig-canvas]', sig), poster = $('[data-sig-poster]', sig);
  const endword = $('.sig__endword', sig), word = $('.sig__word', sig), speed = $('.sig__speed', sig), intro = $('.sig__intro', sig), bike = $('.sig__bike', sig);
  const nums = $$('.sig__num', sig), prog = $$('.sig__prog li', sig), pick = $('[data-pick]', sig);
  const greenBands = $$('.sig__paint--green span', sig), redBands = $$('.sig__paint--red span', sig);
  const speedBars = $$('span', speed), live = $('[data-pick-live]', sig);
  const radios = $$('input[name="m1-warna"]', sig), stock = $('[data-stock]', sig), stockLabel = $('[data-stock-label]', sig);
  const OFF = [.3, .1, 0, .2, .4];                         // band stagger for the paint wipes
  const wipe = (bands, t) => bands.forEach((b, i) => { b.style.transform = `translate3d(${(clamp(t * 1.6 - OFF[i]) - 1) * 101}%,0,0)`; });
  const seg = (v, a, b) => clamp((v - a) / (b - a));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const END = [.76, .84];                                   // scroll window where the chosen colour takes over
  let cfg = SEQ.fallback, player = null;
  let paint = 'green'; sig.dataset.paint = paint;
  let redT = 0, redTarget = 0, redAnim = 0, endMix = 0, shown = -1;

  // one place decides how red the section is; field bands, ink and the canvas all follow it
  function applyPaint() {
    const r = redT * endMix;
    if (player) player.red = r;
    if (r === shown) return; shown = r;
    wipe(redBands, r);
    const isRed = r > .5; if (isRed !== sig.classList.contains('is-red')) sig.classList.toggle('is-red', isRed);
  }

  // a restored form state (reload, back button) may come back with Laser Red checked: start from what is checked
  const checked = radios.find(r => r.checked);
  if (checked && checked.value === 'red') { paint = 'red'; sig.dataset.paint = paint; redT = redTarget = 1; stockLabel.textContent = 'Laser Red'; stock.href = wa('Halo Moto Ijo, apakah GODA M1 Laser warna Laser Red ada stok?'); }
  radios.forEach(r => r.addEventListener('change', () => {
    if (!r.checked) return;
    paint = r.value; sig.dataset.paint = paint;
    const label = paint === 'red' ? 'Laser Red' : 'Laser Green';
    stock.href = wa(`Halo Moto Ijo, apakah GODA M1 Laser warna ${label} ada stok?`);
    stockLabel.textContent = label;
    live.textContent = `Warna dipilih: ${label}`;
    if (reduced) { poster.src = paint === 'red' ? cfg.red : cfg.frames.at(-1); sig.classList.toggle('is-red', paint === 'red'); return; }
    redTarget = paint === 'red' ? 1 : 0; tweenRed();
  }));
  function tweenRed() {
    cancelAnimationFrame(redAnim);
    const from = redT, t0 = performance.now(), d = 760;
    const step = t => {
      const k = clamp((t - t0) / d), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      redT = from + (redTarget - from) * e;
      applyPaint(); player && player.draw();
      if (k < 1) redAnim = requestAnimationFrame(step);
    };
    redAnim = requestAnimationFrame(step);
  }

  if (reduced) { poster.src = paint === 'red' ? cfg.red : cfg.frames.at(-1); poster.loading = 'eager'; sig.classList.toggle('is-red', paint === 'red'); return; }

  /* ---- frame store: blobs for all frames, a small LRU of decoded bitmaps around the playhead.
     Bitmaps are tagged with the width they were decoded at; after a resize the old ones keep drawing
     (scaled) until sharper ones replace them, so the bike never blinks out. ---- */
  function makePlayer(c) {
    const N = c.frames.length, blobs = new Array(N), bmp = new Map(), bad = new Set(), MAX = c.real ? 22 : 8;
    let red = null, want = 0, decoding = false, cw = 0, ch = 0, tw = 0, drawn = '';
    const ctx = canvas.getContext('2d', { alpha: true });
    const fetchBlob = i => blobs[i] || (blobs[i] = fetch(c.frames[i]).then(r => r.ok ? r.blob() : Promise.reject()).catch(() => null));
    const opts = w => ({ resizeWidth: w, resizeHeight: Math.round(w * c.h / c.w), resizeQuality: 'high' });
    const fresh = i => { const e = bmp.get(i); return !!e && e.w === tw; };
    async function decode(i) {
      if (fresh(i)) return;
      const b = await fetchBlob(i); if (!b) { bad.add(i); return; } if (fresh(i)) return;
      const w = tw; let im; try { im = await createImageBitmap(b, opts(w)); } catch { bad.add(i); return; }
      if (w !== tw) { im.close?.(); return; }
      bmp.get(i)?.b.close?.(); bmp.set(i, { b: im, w });
      while (bmp.size > MAX) { // evict the frame farthest from the playhead
        let far = -1, fd = -1; for (const k of bmp.keys()) { const d = Math.abs(k - want); if (d > fd) { fd = d; far = k; } }
        bmp.get(far).b.close?.(); bmp.delete(far);
      }
    }
    async function pump() {
      if (decoding) return; decoding = true;
      for (let guard = 0; guard < 64; guard++) {
        const order = [0, 1, -1, 2, -2, 3, 4, -3, 5, 6, 8, 10, 12].map(d => want + d).filter(k => k >= 0 && k < N && !fresh(k) && !bad.has(k));
        if (!order.length) break;
        await decode(order[0]);
        api.draw();
      }
      decoding = false;
    }
    function nearest(i) { if (bmp.has(i)) return i; for (let d = 1; d < N; d++) { if (bmp.has(i - d)) return i - d; if (bmp.has(i + d)) return i + d; } return -1; }
    const api = {
      f: 0, red: 0,
      size() { // layout size (offsetWidth ignores the bike's scroll transform)
        const dpr = Math.min(devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.5 : 2);
        const w = Math.round(bike.offsetWidth * dpr), h = Math.round(bike.offsetHeight * dpr);
        if (!w || !h || (w === cw && h === ch)) return;
        cw = canvas.width = w; ch = canvas.height = h; tw = Math.min(cw, c.w); drawn = '';
        api.draw(); pump(); api.loadRed();
      },
      async loadRed() {
        const w = tw, r = await fetch(c.red).then(x => x.ok ? x.blob() : null).catch(() => null); if (!r) return;
        try { const im = await createImageBitmap(r, opts(w)); if (w !== tw) { im.close?.(); return; } red?.b.close?.(); red = { b: im, w }; } catch { return; }
        drawn = ''; api.draw();
      },
      warm() { // coarse to fine, so a fast scrub always finds a frame nearby
        const seen = new Set(), order = [];
        for (const s of [8, 4, 2, 1]) for (let i = 0; i < N; i += s) if (!seen.has(i)) { seen.add(i); order.push(i); }
        let k = 0; const next = () => { const batch = order.slice(k, k += 6); if (!batch.length) return; Promise.all(batch.map(fetchBlob)).then(next); }; next();
      },
      draw() {
        if (!cw) return;
        const pos = api.f * (N - 1), last = N - 1;
        want = c.real ? Math.round(pos) : (pos < .5 ? 0 : 1);        // the fallback cuts between its two stills
        const i = nearest(want), r = red ? api.red : 0;
        // red lives only on the end pose: blend it over the green end frame, never over another pose
        let base = i, alpha = 0;
        if (r > 0) {
          if (i === last) alpha = r;
          else if (r >= .5) { base = -1; alpha = 1; }               // end frame not decoded yet: red alone, never two bikes
        }
        const key = `${base}|${Math.round(alpha * 100)}|${base >= 0 ? bmp.get(base).w : 0}`;
        if (key !== drawn && (base >= 0 || alpha > 0)) {
          drawn = key; ctx.clearRect(0, 0, cw, ch);
          if (base >= 0) ctx.drawImage(bmp.get(base).b, 0, 0, cw, ch);
          if (alpha > 0) { ctx.globalAlpha = alpha; ctx.drawImage(red.b, 0, 0, cw, ch); ctx.globalAlpha = 1; }
          if (!sig.classList.contains('is-live')) sig.classList.add('is-live');
        }
        if (!fresh(want) && !bad.has(want)) pump();
      },
      start() { api.size(); want = 0; pump(); },
    };
    return api;
  }

  /* ---- layout: the bike is sized and placed so the intro heading never touches it (any viewport) ---- */
  let top = 0, span = 1, vw = innerWidth, vh = innerHeight;
  function layout() {
    const W = stage.clientWidth, H = stage.clientHeight, narrow = W < 760;
    const below = intro.offsetTop + intro.offsetHeight + (narrow ? 16 : 24);   // first free pixel under the heading
    const room = H - below - H * .03;                                          // to just above the bottom edge
    let bh = (narrow ? W * 1.36 : Math.min(1400, W, H * 1.58)) / 1.6;
    bh = Math.min(bh, room / (SEQ.bottom - SEQ.top));
    const y = Math.max(H * (narrow ? .5 : .54) - bh / 2, below - bh * SEQ.top);
    stage.style.setProperty('--bw', `${Math.round(bh * 1.6)}px`);
    stage.style.setProperty('--btop', `${Math.round(y)}px`);
  }
  const measure = () => {
    layout();
    const r = sig.getBoundingClientRect();
    top = r.top + scrollY; span = Math.max(1, sig.offsetHeight - innerHeight); vw = innerWidth; vh = innerHeight;
    player && player.size();
  };

  /* ---- scroll driver: progress p (0..1) through the pinned section, eased toward the scroll target ---- */
  let target = 0, p = 0, running = false, onScreen = false, last = 0, primed = false;
  function render(p, now) {
    const t = now / 1000;
    // intro + giant word + speed lines
    const io = seg(p, .03, .12);
    intro.style.opacity = 1 - io; intro.style.transform = `translate3d(0,${-io * 40}px,0)`;
    const wx = seg(p, 0, .62);
    word.style.transform = `translate3d(${-wx * vw * .55}px,0,0)`; word.style.opacity = 1 - seg(p, .64, .74);
    const drift = Math.sin(t * .8) * .04;
    speedBars.forEach((b, i) => { b.style.transform = `translate3d(${(-1 + seg(p, 0, .7) * 2.2 + drift * (i % 3 - 1)) * vw * .18}px,0,0) scaleX(${1 + seg(p, .02, .7) * (.6 + i * .12)})`; });
    speed.style.opacity = 1 - seg(p, .66, .74);
    // spec moments
    const win = [[.13, .31], [.33, .51], [.53, .71]];
    nums.forEach((n, i) => {
      const [a, b] = win[i], inn = seg(p, a, a + .05), out = seg(p, b - .05, b);
      const o = inn * (1 - out), dir = i === 1 ? -1 : 1;
      n.style.opacity = o; n.style.transform = `translate3d(${(1 - inn) * 90 * dir - out * 90 * dir}px,0,0)`;
    });
    // green field wipe, then the chosen colour takes the end (see the colour model above)
    wipe(greenBands, seg(p, .72, .84));
    endMix = seg(p, END[0], END[1]); applyPaint();
    // frames
    if (player) { player.f = ease(seg(p, .04, .74)); player.draw(); }
    // bike settles up for the picker
    const lift = ease(seg(p, .74, .9)), narrow = vw < 760;
    bike.style.transform = narrow ? `translate3d(0,${-lift * 26}%,0) scale(${1 + lift * .22})` : `translate3d(0,${-lift * 8}%,0) scale(${1 - lift * .14})`;
    const ew = ease(seg(p, .8, .94));
    endword.style.opacity = ew; endword.style.transform = `translate3d(0,0,0) scale(${.86 + ew * .14})`;
    const pk = seg(p, .82, .92);
    pick.style.opacity = pk; pick.style.transform = `translate3d(0,${(1 - pk) * 40}px,0)`;
    const isPick = p > .8; if (isPick !== sig.classList.contains('is-pick')) { sig.classList.toggle('is-pick', isPick); syncFloat(); }
    const step = p < .13 ? 0 : p < .33 ? 1 : p < .53 ? 2 : p < .74 ? 3 : 4;
    prog.forEach((li, k) => { const on = k === step; if (on !== li.classList.contains('is-on')) li.classList.toggle('is-on', on); });
  }
  // the loop runs while the playhead is catching up; at rest only the speed lines drift (idle state)
  let settled = false;
  function idle(now) {
    const d = Math.sin(now / 1000 * .8) * .04, base = seg(p, 0, .7) * 2.2 - 1, grow = seg(p, .02, .7);
    speedBars.forEach((b, i) => { b.style.transform = `translate3d(${(base + d * (i % 3 - 1)) * vw * .18}px,0,0) scaleX(${1 + grow * (.6 + i * .12)})`; });
  }
  function loop(now) {
    const dt = Math.min(64, now - (last || now)); last = now;
    if (target !== p) {
      p += (target - p) * (1 - Math.pow(.0009, dt / 1000));
      if (Math.abs(target - p) < .0004) p = target;
      render(p, now); settled = false;
    } else if (!settled) { render(p, now); settled = true; }
    else if (p < .74) idle(now);
    if (onScreen) requestAnimationFrame(loop); else { running = false; last = 0; }
  }
  // the WhatsApp float steps aside only while the picker is on screen: pinned, or its section still covers
  // most of the viewport. Read from the scroll position (no layout), so any jump clears it.
  function syncFloat() {
    const y = scrollY, show = sig.classList.contains('is-pick') && y > top - vh * .5 && y < top + span + vh * .6;
    if (show !== document.body.classList.contains('at-pick')) document.body.classList.toggle('at-pick', show);
  }
  const kick = () => {
    target = clamp((scrollY - top) / span);
    syncFloat();
    // a reload mid-section, or a jump (End key, anchor), lands on the state directly instead of replaying the story
    if (!primed || Math.abs(target - p) > .4) { primed = true; p = target; settled = false; }
    if (onScreen && !running) { running = true; requestAnimationFrame(loop); }
  };
  addEventListener('scroll', kick, { passive: true });
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { measure(); kick(); settled = false; }, 150); });
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) { measure(); kick(); } else syncFloat(); }, { rootMargin: '10% 0px' }).observe(sig);
  // keyboard users who tab into the picker jump to the end state
  pick.addEventListener('focusin', () => { if (target < .9) { measure(); scrollTo({ top: top + span * .97, behavior: 'auto' }); } });

  // start loading once the section is near
  new IntersectionObserver(async ([e], obs) => {
    if (!e.isIntersecting) return; obs.disconnect();
    cfg = await loadSeqConfig();
    player = makePlayer(cfg); measure(); player.start(); shown = -1; applyPaint(); settled = false; kick();
    if (cfg.real) { poster.src = cfg.frames[0]; player.warm(); }
  }, { rootMargin: '150% 0px' }).observe(sig);
  measure(); render(0, performance.now());
  if (document.fonts) document.fonts.ready.then(() => { measure(); settled = false; kick(); });   // heading height can change with the webfont
})();

/* =========================================================== 4. catalogue filter */
(() => {
  const grid = $('[data-grid]'); if (!grid) return;
  const cards = $$('.card', grid), tabs = $$('[data-filter]');
  tabs.forEach(t => t.addEventListener('click', () => {
    const f = t.dataset.filter;
    tabs.forEach(x => x.setAttribute('aria-pressed', String(x === t)));
    let k = 0;
    cards.forEach(c => {
      const show = f === 'all' || c.dataset.cat === f; c.hidden = !show;
      if (show && !reduced) c.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: (k++ % 8) * 40, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
    });
  }));
})();

