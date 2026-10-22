// Moto Ijo · bandingkan.html?m=a,b,c: up to 3 GODA models side by side.
// Slots sync to the URL and to localStorage. Values from SPEC (facts.md §2). v5: price + WhatsApp per column,
// the "coba di Palmerah" block, a WhatsApp/test-ride bar on phones.
import { wa, icon } from './site.js';
import { MODELS, bySlug, SPEC, esc, priceHTML, priceAmount, priceFrom, isMotor, val, isUnknown, plateHTML, cmpStore, waStock, askHTML } from './produk.js';

const box = document.querySelector('[data-compare]');
const empty = document.querySelector('[data-empty]');
const key = document.querySelector('[data-key]');
const waBtn = document.querySelector('[data-wa-compare]');
const trBtn = document.querySelector('[data-tr-compare]');
const ask = document.querySelector('[data-ask]');
const WA_DEFAULT = 'Halo Moto Ijo, saya masih bingung pilih model GODA. Bisa bantu?';
ask.innerHTML = askHTML({
  h: 'Coba langsung di Palmerah sebelum memutuskan',
  p: 'Pilih jadwal test ride, lalu datang ke showroom. Mau tanya stok dulu? Chat kami di WhatsApp.',
  waText: WA_DEFAULT,
  waLabel: 'Tanya stok lewat WhatsApp',
});
const askWa = ask.querySelector('[data-ask-wa]');
// phone bar (WhatsApp + test ride) steps aside once the closing block is on screen
const mbar = document.querySelector('[data-cmpbar-m]');
new IntersectionObserver(([e]) => { const off = e.isIntersecting || e.boundingClientRect.top < 0; mbar.classList.toggle('is-off', off); mbar.inert = off; }, { rootMargin: '0px 0px -20% 0px' }).observe(ask);
// compact column header: a fixed bar that appears once the big column heads scroll away
const miniBar = document.createElement('div'); miniBar.className = 'cmp-mini'; miniBar.setAttribute('aria-hidden', 'true');
miniBar.innerHTML = '<div class="wrap"><div class="cmp-mini__in"></div></div>'; document.body.appendChild(miniBar);
const miniIn = miniBar.querySelector('.cmp-mini__in');
let headOut = false, tableIn = false;
const miniSync = () => miniBar.classList.toggle('is-on', headOut && tableIn);
const navH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
const ioHead = new IntersectionObserver(([e]) => { headOut = !e.isIntersecting && e.boundingClientRect.top < navH(); miniSync(); }, { rootMargin: `-${navH()}px 0px 0px 0px` });
const ioTable = new IntersectionObserver(([e]) => { tableIn = e.isIntersecting; miniSync(); }, { rootMargin: `-${navH() + 120}px 0px 0px 0px` });
function miniWatch() { ioHead.disconnect(); const h = box.querySelector('.cmp__row--head'); if (h) ioHead.observe(h); }
ioTable.observe(box);

const fromUrl = (new URLSearchParams(location.search).get('m') || '').split(',').filter(bySlug);
const saved = fromUrl.length ? fromUrl : cmpStore.get();
// nothing chosen yet: start with the first two catalogue models so the table is never empty on arrival
// default pair = the two models with every compare row published (reviewer, 22 Okt), so the table compares real numbers
const start = [...new Set(saved.length ? saved : ['venus-gd270', 'aura-gd008'].filter(bySlug))].slice(0, 3);
const slots = [0, 1, 2].map(i => start[i] || null);

const ROWS = [
  ['Jenis', (m) => m.category],
  ['Daya dinamo', (m, s) => s.cmp.dinamo, 'top'],
  ['Baterai', (m, s) => s.cmp.baterai],
  ['Jarak tempuh', (m, s) => s.cmp.jarak, 'top'],
  ['Kecepatan maks.', (m, s) => s.cmp.kecepatan, 'top'],
];
const num = v => typeof v === 'string' && !/atau|\//.test(v) ? parseFloat(v.replace(/[^\d.]/g, '')) : NaN;

const options = cur => {
  const taken = slots.filter(x => x && x !== cur);
  const opt = m => `<option value="${m.slug}"${m.slug === cur ? ' selected' : ''}${taken.includes(m.slug) ? ' disabled' : ''}>${esc(m.short)}</option>`;
  return `<option value="">${cur ? 'Kosongkan kolom' : 'Pilih model'}</option>
    <optgroup label="Motor listrik">${MODELS.filter(isMotor).map(opt).join('')}</optgroup>
    <optgroup label="Sepeda listrik">${MODELS.filter(m => !isMotor(m)).map(opt).join('')}</optgroup>`;
};

function render() {
  const ms = slots.map(s => s && bySlug(s));
  const any = ms.some(Boolean);
  empty.hidden = any;

  const head = ms.map((m, i) => `<div class="cmp__col" role="columnheader">
    <label class="cmp__pick"><span class="sr">Model kolom ${i + 1}</span>
      <select data-slot="${i}">${options(slots[i])}</select>${icon('chevron-down')}</label>
    ${m ? `${plateHTML(m, { cls: 'cmp__plate' })}
      <div class="cmp__who">
        <h2 class="cmp__name"><a href="produk-detail.html?m=${m.slug}">${esc(m.short)}</a></h2>
        <button type="button" class="cmp__rm" data-rm="${i}" aria-label="Hapus ${esc(m.name)} dari perbandingan">${icon('x')}</button>
      </div>
      ${priceHTML(m)}
      <div class="cmp__act">
        <a class="btn btn--sm" href="${waStock(m)}" target="_blank" rel="noopener">${icon('brand-whatsapp')}${m.price ? 'Tanya stok' : 'Tanya harga'}<span class="sr"> ${esc(m.name)} lewat WhatsApp</span></a>
        <a class="link" href="test-ride.html?m=${m.slug}">Test ride<span class="sr"> ${esc(m.name)}</span>${icon('arrow-right')}</a>
      </div>`
    : `<div class="cmp__blank">${icon('plus')}<span>Pilih model</span></div>`}
  </div>`).join('');

  const mini = ms.map(m => `<div class="cmp__minicol">${m ? `<img src="${m.img}" alt="" width="64" height="48"><span><b>${esc(SPEC[m.slug].word)}</b><em class="num">${m.price ? (priceFrom(m) ? 'mulai ' : '') + esc(priceAmount(m)) : 'Tanya harga'}</em></span>` : ''}</div>`).join('');

  // a row where no chosen model has a known value compares nothing, so it stays out; unknown or conflicting cells ask on WhatsApp
  const rows = ROWS.map(([label, get, mark]) => {
    const vs = ms.map(m => m ? get(m, SPEC[m.slug]) : undefined);
    if (!vs.some(v => v !== undefined && !isUnknown(v))) return '';
    let top = -1;
    if (mark) { const ns = vs.map(num); const ok = ns.filter(n => !isNaN(n)); if (ok.length > 1 && new Set(ok).size > 1) top = Math.max(...ok); }
    return `<div class="cmp__row" role="row"><div class="cmp__label" role="rowheader">${label}</div>${vs.map((v, i) =>
      `<div class="cmp__cell${num(v) === top ? ' is-top' : ''}" role="cell">${v === undefined ? '' : val(v, ms[i], label)}</div>`).join('')}</div>`;
  }).join('');

  box.innerHTML = `<div class="cmp__row cmp__row--head" role="row"><div class="cmp__label cmp__label--head" role="columnheader"><span class="sr">Spesifikasi</span></div>${head}</div>
    ${any ? rows : ''}`;
  miniIn.innerHTML = `<div></div>${mini}`; miniWatch();

  key.hidden = !box.querySelector('.is-top');
  const picked = ms.filter(Boolean); const names = picked.map(m => m.name);
  const waText = names.length > 1 ? `Halo Moto Ijo, saya sedang membandingkan ${names.slice(0, -1).join(', ')}${names.length > 2 ? ',' : ''} dan ${names.at(-1)}. Mana yang ada stok di showroom?`
    : names.length ? `Halo Moto Ijo, apakah ${names[0]} ada stok di showroom Palmerah?` : WA_DEFAULT;
  waBtn.href = askWa.href = wa(waText);
  trBtn.href = picked.length === 1 ? `test-ride.html?m=${picked[0].slug}` : 'test-ride.html';
  const filled = slots.filter(Boolean);
  history.replaceState(null, '', filled.length ? `?m=${filled.join(',')}` : location.pathname);
  cmpStore.set(filled);
}

box.addEventListener('change', e => {
  const sel = e.target.closest('[data-slot]'); if (!sel) return;
  slots[+sel.dataset.slot] = sel.value || null; render();
  box.querySelector(`[data-slot="${sel.dataset.slot}"]`)?.focus();
});
box.addEventListener('click', e => {
  const b = e.target.closest('[data-rm]'); if (!b) return;
  slots[+b.dataset.rm] = null; render();
  box.querySelector(`[data-slot="${b.dataset.rm}"]`)?.focus();
});

render();
