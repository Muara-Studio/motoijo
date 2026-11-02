// Moto Ijo · bandingkan.html?m=a,b,c (v6, 31 Okt 2026): up to 3 GODA models side by side, values from data/models.js only.
// Slots sync to the URL and localStorage. Per column: picker, cut-out, name, price; then meters (jarak tempuh,
// kecepatan, motor) and the rest of the spec rows. A row that no chosen model has is left out; a gap in one column
// reads "Belum tercantum". Default pair: Aura vs Altair (one per series). The highest number per meter row is marked (green bar, bold value).
// CTA pass (1 Nov 2026): no buttons inside the table and no phone bar. The closing block holds the one test ride button and
// the one WhatsApp link, and its WhatsApp message names the models being compared.
import { MODELS, SERIES, bySlug, MAX } from '../data/models.js';
import { wa, icon } from './site.js';
import { esc, fmt, swatchesHTML, priceHTML, detailHref, testRideHref, seriesLabel, imgAttrs } from './stage.js';
import { askHTML, cmpStore, quietFloat } from './produk.js';

const box = document.querySelector('[data-compare]');
const ask = document.querySelector('[data-ask]');
const key = document.querySelector('[data-key]');
const WA_DEFAULT = 'Halo Moto Ijo, saya masih bingung pilih model GODA. Bisa bantu?';

const fromUrl = (new URLSearchParams(location.search).get('m') || '').split(',').filter(bySlug);
const saved = fromUrl.length ? fromUrl : cmpStore.get();
const start = [...new Set(saved.length ? saved : ['aura-gd008', 'altair-g17'].filter(bySlug))].slice(0, 3);
const slots = [0, 1, 2].map(i => start[i] || null);

const METER = [
  ['Jarak tempuh', 'range', 'rangeKm', MAX.rangeKm],
  ['Kecepatan', 'speed', 'speedKmh', MAX.speedKmh],
  ['Motor', 'power', 'powerW', MAX.powerW],
];
const TEXT = [
  ['Seri', m => seriesLabel(m)],
  ['Baterai', m => m.battery],
  ['Rem', m => m.brake],
  ['Ban', m => m.tyre],
  ['Fitur', m => m.features?.length ? m.features.join(', ') : null],
];
const gapCell = () => '<span class="cmp__na">Belum tercantum</span>';

const meterCell = (m, label, key, field, max, top) => {
  const f = fmt[key](m);
  if (!f) return gapCell();
  const p = Math.max(0.04, Math.min(1, m[field] / max)).toFixed(3);
  return `<div class="mt mt--${key} mt--cell${top ? ' is-top' : ''}"><span class="mt__v num">${f.v}<span class="mt__u"> ${f.u}</span>${top ? '<span class="sr"> (tertinggi)</span>' : ''}</span><span class="mt__bar" aria-hidden="true"><span class="mt__fill" style="--p:${p}"></span></span></div>`;
};

const options = cur => {
  const taken = slots.filter(x => x && x !== cur);
  const opt = m => `<option value="${m.slug}"${m.slug === cur ? ' selected' : ''}${taken.includes(m.slug) ? ' disabled' : ''}>${esc(m.short)}</option>`;
  return `<option value="">${cur ? 'Kosongkan kolom' : 'Tambah model'}</option>` +
    Object.values(SERIES).map(s => `<optgroup label="${esc(s.label)}">${MODELS.filter(m => m.series === s.key).map(opt).join('')}</optgroup>`).join('');
};

const headCol = (m, i) => {
  const pick = `<label class="cmp__pick"><span class="sr">Model kolom ${i + 1}</span><select data-slot="${i}">${options(m?.slug || null)}</select>${icon('chevron-down')}</label>`;
  if (!m) return `<div class="cmp__col" role="columnheader">${pick}<div class="cmp__blank">${icon('plus')}<span>Tambah model</span></div></div>`;
  return `<div class="cmp__col" role="columnheader">
    ${pick}
    <a class="cmp__plate" href="${detailHref(m)}" tabindex="-1" aria-hidden="true"><img ${imgAttrs(m)} alt="" width="800" height="600" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async"></a>
    <div class="cmp__who">
      <p class="cmp__name"><a href="${detailHref(m)}">${esc(m.name)}</a></p>
      ${m.type ? `<p class="cmp__type">Tipe ${esc(m.type)}</p>` : ''}
    </div>
    ${priceHTML(m, { cls: 'cmp__price' })}
  </div>`;
};

function render() {
  const ms = slots.map(s => s && bySlug(s));
  const chosen = ms.filter(Boolean);
  const row = (label, cells, cls = '') => `<div class="cmp__row ${cls}" role="row"><div class="cmp__label" role="rowheader">${label}</div>${cells.map(c => `<div class="cmp__cell" role="cell">${c}</div>`).join('')}</div>`;
  const rows = [];
  METER.forEach(([label, key, field, max]) => {
    const vals = chosen.map(m => m[field]).filter(v => v != null);
    if (!vals.length) return;
    const hi = Math.max(...vals), differ = new Set(vals).size > 1;
    rows.push(row(label, ms.map(m => m ? meterCell(m, label, key, field, max, differ && m[field] === hi) : ''), `cmp__row--meter${differ ? ' is-diff' : ''}`));
  });
  TEXT.forEach(([label, get]) => {
    if (chosen.some(m => get(m))) rows.push(row(label, ms.map(m => m ? (get(m) ? esc(get(m)) : gapCell()) : '')));
  });
  if (chosen.some(m => m.colors?.length)) rows.push(row('Warna', ms.map(m => m ? swatchesHTML(m, { compact: true }) : ''), 'cmp__row--sw'));

  // phones (≤ 700 px, css/produk.css): two columns while the third slot is empty, and a slim strip with the model names
  // that sticks under the nav once the head row has scrolled away. [hidden] keeps the strip out of wider screens.
  const stick = `<div class="cmp__stick" hidden aria-hidden="true"><div class="cmp__stick-in">${ms.map(m => `<p class="cmp__stick-c">${m ? `<img src="${esc(m.img)}" alt="" width="80" height="60" loading="lazy" decoding="async"><span>${esc(m.short)}</span>` : ''}</p>`).join('')}</div></div>`;
  box.dataset.cols = ms[2] ? 3 : 2;
  box.innerHTML = `${stick}<div class="cmp__row cmp__row--head" role="row"><div class="cmp__label cmp__label--head" role="columnheader"><span class="sr">Spesifikasi</span></div>${ms.map(headCol).join('')}</div>${rows.join('')}`;
  stuck();

  if (key) key.hidden = !box.querySelector('.is-diff');
  // store + URL + the closing block's links (WhatsApp text names the chosen models, test ride opens on the first)
  const list = slots.filter(Boolean);
  cmpStore.set(list);
  history.replaceState(null, '', list.length ? `?m=${list.join(',')}` : location.pathname);
  const names = chosen.map(m => m.name);
  const txt = names.length > 1 ? `Halo Moto Ijo, saya sedang membandingkan ${names.slice(0, -1).join(', ')} dan ${names.at(-1)}. Apakah ada stok?` : names.length ? `Halo Moto Ijo, apakah ${names[0]} ada stok di showroom Palmerah?` : WA_DEFAULT;
  const askWa = ask.querySelector('.ask__wa'), askTr = ask.querySelector('.ask__tr');
  if (askWa) askWa.href = wa(txt);
  if (askTr) askTr.href = chosen.length ? testRideHref(chosen[0]) : 'test-ride.html';
}

// the name strip shows while the head row is above the nav and the table is still under it
let ticking = false;
function stuck() {
  ticking = false;
  const head = box.querySelector('.cmp__row--head'), s = box.querySelector('.cmp__stick');
  if (!head || !s || !s.offsetParent) return;
  const top = s.getBoundingClientRect().top + 1, end = box.getBoundingClientRect().bottom;
  box.classList.toggle('is-stuck', head.getBoundingClientRect().bottom < top && end > top + 72);
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(stuck); } }, { passive: true });
addEventListener('resize', stuck, { passive: true });

box.addEventListener('change', e => {
  const sel = e.target.closest('select[data-slot]');
  if (!sel) return;
  slots[+sel.dataset.slot] = sel.value || null;
  render();
  box.querySelector(`select[data-slot="${sel.dataset.slot}"]`)?.focus();
});

ask.innerHTML = askHTML({ h: 'Coba langsung sebelum memutuskan', p: 'Datang ke showroom Palmerah. Test ride gratis.', waText: WA_DEFAULT });
render();
quietFloat();
