// Moto Ijo · motion.js (1 Nov 2026): the shared motion layer, loaded by js/shell.js on every page (it adds css/motion.css).
// Rule (muara-taste): every motion explains the product. Transform and opacity only (clip on images only), no scroll
// listeners, and prefers-reduced-motion = everything still, final state at once.
//   arrive(img, { dir, travel, stopAt, fade })  a bike arrives with weight: it lags its stage (dir ±1; 0 = it is already
//       there), then stops with a nose dip and a small rebound of the fork, then settles. The cut-outs face left.
//   road(pic)                 adds the lane dashes under a stage picture (.st-road, styled in css/stage.css)
//   runRoad(road, kmh, { delay })  the dashes run at the model's top speed, brake, stop; returns the stop time in ms
//   meters(root, { delay })   spec meters fill; the range meter (ten battery cells) charges one cell at a time
//   hold(root)                keeps meters empty until meters() runs (used before a stage scrolls into view)
//   odo(el, text)             a number rolls like an odometer; the real value stays as text for screen readers
// Automatic on every page: meters fill when they scroll into view, and a model stage outside the home stage pulls up
// (road + nose dip + charge) the first time it is seen. Opt-in, css only: data-shutter on a photo frame (css/motion.css).
import { MODELS } from '../data/models.js';

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GLIDE = 'cubic-bezier(.22, 1, .36, 1)', SWAY = 'cubic-bezier(.45, 0, .55, 1)';

// css/motion.css comes after first paint (it holds no layout); odo() waits for it before it builds its digit wheels
let cssReady = false;
{
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.href = new URL('../css/motion.css', import.meta.url).href;
  l.onload = () => { cssReady = true; };
  document.head.append(l);
}

/* ---------- a bike arrives ---------- */
export function arrive(img, { dir = 0, travel = 6, stopAt = 1300, fade = false } = {}) {
  if (reduced || !img || !img.animate) return null;
  img._arrive?.cancel();
  const lagEnd = dir ? Math.min(620, stopAt) : 0, T = stopAt + 520, o = ms => Math.min(1, Math.max(0, ms / T));
  const kf = dir
    ? [{ offset: 0, transform: `translateX(${dir * travel}%)`, ...(fade && { opacity: 0 }), easing: GLIDE }, { offset: o(lagEnd), transform: 'none', ...(fade && { opacity: 1 }) }]
    : [{ offset: 0, transform: 'none' }];
  const brake = o(Math.max(lagEnd, stopAt - 260));
  if (brake > kf.at(-1).offset) kf.push({ offset: brake, transform: 'none' });
  kf.at(-1).easing = 'cubic-bezier(.5, 0, .75, 0)';                                                       // braking builds
  kf.push({ offset: o(stopAt + 40), transform: 'translateX(-.5%) rotate(-1.3deg)', easing: SWAY },          // the nose dips as it stops
    { offset: o(stopAt + 260), transform: 'translateX(.1%) rotate(.4deg)', easing: SWAY },                  // the fork rebounds
    { offset: 1, transform: 'none' });
  img._arrive = img.animate(kf, { duration: T });
  return img._arrive;
}

/* ---------- the road under a stage ---------- */
export function road(pic) {
  if (!pic || pic.querySelector('.st-road')) return pic && pic.querySelector('.st-road');
  const r = document.createElement('span');
  r.className = 'st-road'; r.setAttribute('aria-hidden', 'true'); r.innerHTML = '<i></i>';
  pic.append(r);
  return r;
}
// speed in stage widths per second = 1.1 × km/jam / 100: GODA Centurion (100 km/jam) runs 2.5× as fast as Try Lite (40 km/jam)
export function runRoad(r, kmh, { delay = 0 } = {}) {
  const strip = r && r.firstElementChild;
  if (reduced || !strip || !kmh || !strip.animate) return 0;
  const w = r.clientWidth; if (!w) return 0;
  const P = Math.max(36, Math.round(w / 13));                 // one dash + gap
  r.style.setProperty('--period', `${P}px`);
  const CRUISE = .7, BRAKE = .6, v = w * 1.1 * kmh / 100;
  const D = Math.max(1, Math.round(v * (CRUISE + BRAKE / 2) / P)) * P;   // whole periods: the last frame matches the rest frame
  const d1 = D * CRUISE / (CRUISE + BRAKE / 2);
  strip._run?.cancel();
  strip._run = strip.animate([
    { offset: 0, transform: 'translateX(0)', easing: 'linear' },
    { offset: CRUISE / (CRUISE + BRAKE), transform: `translateX(${d1.toFixed(1)}px)`, easing: 'cubic-bezier(.5, 1, .89, 1)' },   // even braking
    { offset: 1, transform: `translateX(${D}px)` }], { duration: (CRUISE + BRAKE) * 1000, delay });
  return delay + (CRUISE + BRAKE) * 1000;
}

/* ---------- spec meters ---------- */
const fills = root => root ? (root.matches?.('.mt__fill') ? [root] : [...root.querySelectorAll('.mt__fill')]) : [];
export function hold(root) {
  if (reduced) return;
  fills(root).forEach(f => { f._in?.cancel(); f.style.animation = 'none'; f.style.transform = 'scaleX(0)'; });
}
export function meters(root, { delay = 0, per = 64 } = {}) {
  fills(root).forEach(f => {
    f._in?.cancel(); f.style.animation = 'none'; f.style.transform = '';
    if (reduced || !f.animate) return;
    if (f.closest('.mt--range')) {
      // a battery: ten cells, each lights in turn (the bar's mask draws the cells, css/stage.css)
      const cells = (parseFloat(f.style.getPropertyValue('--p')) || 1) * 10, n = Math.max(1, Math.ceil(cells - .01));
      const kf = [{ offset: 0, transform: 'scaleX(0)', easing: 'step-end' }];
      for (let k = 1; k <= n; k++) kf.push({ offset: k / n, transform: `scaleX(${Math.min(1, k / cells).toFixed(4)})`, easing: 'step-end' });
      f._in = f.animate(kf, { duration: n * per, delay, fill: 'backwards' });
    } else {
      f._in = f.animate([{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 900, delay, easing: GLIDE, fill: 'backwards' });
    }
  });
}

/* ---------- odometer ---------- */
const escH = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const WHEEL = '<span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>';
const isD = c => c >= '0' && c <= '9';
const shape = s => [...s].map(c => isD(c) ? '#' : c).join('');
export function odo(el, text) {
  if (!el) return;
  text = String(text);
  const st = el._odo;
  if (st && st.text === text) return;
  // the first value, reduced motion, or no stylesheet yet: plain text
  if (reduced || !cssReady || (!st && !el.dataset.odo)) { el._odo = null; el.dataset.odo = '1'; el.textContent = text; return; }
  const from = st ? st.text : el.textContent;
  let wheels;
  if (st && shape(st.text) === shape(text)) {
    st.sr.textContent = text; wheels = st.wheels;
  } else {
    // new layout: build the wheels at the old digits (aligned on the right), then roll them to the new ones
    const a = [...from], b = [...text], pad = b.length - a.length;
    let k = b.filter(isD).length;
    el.innerHTML = `<span class="sr"></span><span class="odo" aria-hidden="true">${b.map((c, i) => {
      if (!isD(c)) return `<span class="odo__c">${escH(c)}</span>`;
      const p = a[i - pad], d0 = p && isD(p) ? +p : 0;
      return `<span class="odo__d"><span class="odo__w" style="--i:${--k};transform:translateY(${-d0 * 10}%)">${WHEEL}</span></span>`;
    }).join('')}</span>`;
    const sr = el.firstElementChild; sr.textContent = text;
    wheels = [...el.querySelectorAll('.odo__w')];
    el._odo = { sr, wheels };
    getComputedStyle(wheels[0] || el).transform;                // commit the start position, so the change below rolls
  }
  const ds = [...text].filter(isD);
  wheels.forEach((w, i) => { w.style.transform = `translateY(${-ds[i] * 10}%)`; });
  el._odo.text = text;
}

/* ---------- automatic, every page ---------- */
const bySlug = s => MODELS.find(m => m.slug === s);
function auto() {
  if (reduced || !('IntersectionObserver' in window)) return;
  // meters outside the home stage (catalogue cards, compare, detail) fill when they come into view
  const bars = [...document.querySelectorAll('.mt__bar')].filter(b => !b.closest('[data-lineup]') && !b.closest('.stage'));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); meters(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  bars.forEach(b => { hold(b); io.observe(b); });
  // a model stage outside the home stage (detail page): the bike pulls up the first time it is seen
  document.querySelectorAll('.stage').forEach(s => {
    if (s.closest('[data-lineup]')) return;
    const pic = s.querySelector('.stage__pic'), img = pic && pic.querySelector('img'), m = bySlug(s.dataset.slug);
    if (!pic || !img || !m) return;
    const photo = img.classList.contains('is-life');
    const r = photo ? null : road(pic);
    hold(s.querySelector('.meters'));
    const so = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || (e.intersectionRatio < .5 && e.intersectionRect.height < innerHeight * .45)) return;
      so.disconnect();
      if (r && !pic.classList.contains('is-life')) arrive(img, { stopAt: runRoad(r, m.speedKmh) || 1300 });
      meters(s.querySelector('.meters'), { delay: 200 });
    }, { threshold: [0, .25, .5, .75] });
    so.observe(pic);
  });
}
// module scripts run before DOMContentLoaded (readyState is already 'interactive'), and the page scripts render after this
// module, so wait for DOMContentLoaded; 'load' covers a late import
let autoDone = false;
const autoOnce = () => { if (!autoDone) { autoDone = true; auto(); } };
if (document.readyState === 'complete') autoOnce(); else { document.addEventListener('DOMContentLoaded', autoOnce, { once: true }); addEventListener('load', autoOnce, { once: true }); }
