// Moto Ijo · produk: shared model data (facts.md §2.2) + helpers for katalog, detail and bandingkan,
// and the katalog page itself (runs only on body[data-page="produk"]).
// Rules: prices only from data/models.js; specs only from facts.md §2. Where GODA's own pages disagree or a value is
// unpublished, pages show a "Tanya di showroom" WhatsApp link that asks for that spec (v5 round 2). Never a bracket placeholder.
import { MODELS, bySlug } from '../data/models.js';
import { SITE, wa, icon, arrow } from './site.js';

export { MODELS, bySlug };

const SRC_SIM = 'https://www.godaindonesia.com/simulasi-cicilan';
const UNPUB = 'Belum dipublikasikan GODA';
const NOT_LISTED = 'Tidak dicantumkan di halaman GODA';
const GARANSI = 'Sparepart hingga 5 tahun, SnK berlaku (klaim GODA)';

// v/u/l = big number, unit, label for the spec strip. beda = [X, Y] marks two GODA pages that disagree (kept as data, shown as an ask).
export const SPEC = {
  'm1-laser': {
    word: 'M1 Laser',
    strip: [{ v: '1500', u: 'W', l: 'Daya dinamo' }, { v: '60V', u: '20Ah', l: 'Baterai' }, { v: '150', u: 'kg', l: 'Beban maksimal' }, { v: '3', u: 'mode', l: 'Mode daya' }],
    rows: [
      ['Kategori', { beda: ['sepeda listrik (menu produk GODA)', 'motor listrik (judul toko GODA)'] }],
      ['Daya dinamo', '1500 W'], ['Baterai', '60V 20Ah'],
      ['Kecepatan maks.', '55 km/jam'],
      ['Jarak tempuh', 'Hingga 70 km'],
      ['Waktu cas', UNPUB], ['Beban maks.', '150 kg'], ['Rem', 'Cakram depan dan belakang'],
      ['Velg', { beda: ['aluminium', 'besi'] }], ['Ukuran ban', UNPUB], ['Dimensi dan bobot', UNPUB],
      ['Fitur', 'SGS, IOT Start, ARS, Boost Mode, Smart Seat, tiga mode daya, E-ABS dan TCS, HAC (bantuan tanjakan), gigi mundur'],
      ['Warna', 'Laser Green, Laser Red'], ['Garansi', GARANSI],
    ],
    cmp: { dinamo: '1500 W', baterai: '60V 20Ah', jarak: 'Hingga 70 km', kecepatan: '55 km/jam', beban: '150 kg', rem: 'Cakram depan dan belakang', ban: null },
    colors: [{ n: 'Laser Green', hex: '#02A242', img: 'assets/img/3d/turn-L01-34front.webp' }, { n: 'Laser Red', hex: '#C20409', img: 'assets/img/3d/color-laser-red-L34.webp' }],
    colorDefault: 0,
    garansi: true,
    cocok: ['Bantuan tanjakan (HAC) untuk jalan menanjak.', 'Gigi mundur untuk parkir yang sempit.', 'Tiga mode daya, jadi tenaga bisa kamu sesuaikan dengan jalannya.'],
    src: ['https://www.godaindonesia.com/product-page/goda-m1-laser-motor-listrik-60v20ah-1500-watt'],
    gallery: [
      { src: 'assets/img/3d/turn-L01-34front.webp', alt: 'GODA M1 Laser warna Laser Green, tampak tiga perempat depan, render 3D', cap: 'Visualisasi 3D, bukan foto produk', fit: 'cover', w: 1600, h: 1000 },
      { src: 'assets/img/3d/color-laser-red-L34.webp', alt: 'GODA M1 Laser warna Laser Red, tampak tiga perempat depan, render 3D', cap: 'Visualisasi 3D, bukan foto produk', fit: 'cover', w: 1600, h: 1000 },
      { src: 'assets/img/3d/turn-L02-side.webp', alt: 'GODA M1 Laser warna Laser Green, tampak samping, render 3D', cap: 'Visualisasi 3D, bukan foto produk', fit: 'cover', w: 1600, h: 1000 },
      { src: 'assets/img/3d/turn-L03-34rear.webp', alt: 'GODA M1 Laser warna Laser Green, tampak tiga perempat belakang, render 3D', cap: 'Visualisasi 3D, bukan foto produk', fit: 'cover', w: 1600, h: 1000 },
      { src: 'assets/img/3d/turn-04-front.webp', alt: 'GODA M1 Laser warna Laser Green, tampak depan, render 3D', cap: 'Visualisasi 3D, bukan foto produk', fit: 'cover', w: 1600, h: 1000 },
      { src: 'assets/img/goda/m1-laser-side.webp', alt: 'GODA M1 Laser warna Laser Green, tampak samping', cap: 'Foto: GODA Indonesia', fit: 'contain', w: 774, h: 583 },
    ],
  },
  'starship-gd299': {
    word: 'Starship',
    strip: [{ v: '3000', u: 'W', l: 'Daya dinamo' }, { v: '80', u: 'km', l: 'Jarak tempuh' }, { v: '80', u: 'km/jam', l: 'Kecepatan maks.' }, { v: '150', u: 'kg', l: 'Beban maksimal' }],
    rows: [
      ['Kategori', 'Motor listrik (menu produk GODA)'], ['Daya dinamo', '3000 W'],
      ['Baterai', { beda: ['72V 32Ah (judul halaman)', '72V 20Ah (rincian)'] }],
      ['Kecepatan maks.', '80 km/jam'], ['Jarak tempuh', '80 km'], ['Waktu cas', UNPUB], ['Beban maks.', '150 kg'],
      ['Rem', 'Cakram'], ['Ukuran ban', '100/80-12'], ['Bagasi', '35 L'], ['Dimensi dan bobot', UNPUB],
      ['Warna', { beda: ['Stellar White, Meteor Gray, Nebula Black (halaman toko)', 'abu-abu, hitam, silver (halaman produk)'] }],
      ['Bonus di halaman GODA', 'Gratis 1 pasang spion'], ['Garansi', GARANSI],
    ],
    cmp: { dinamo: '3000 W', baterai: { beda: ['72V 32Ah', '72V 20Ah'] }, jarak: '80 km', kecepatan: '80 km/jam', beban: '150 kg', rem: 'Cakram', ban: '100/80-12' },
    colors: null, garansi: true,
    src: ['https://www.godaindonesia.com/product-page/goda-new-starship-gd-299-motor-listrik-72v32ah-3000-watt', 'https://www.godaindonesia.com/motorcycle-product/starship'],
  },
  'venus-gd270': {
    word: 'Venus',
    strip: [{ v: '3000', u: 'W', l: 'Daya dinamo' }, { v: '72V', u: '20Ah', l: 'Baterai' }, { v: '50', u: 'km', l: 'Jarak tempuh' }, { v: '80', u: 'km/jam', l: 'Kecepatan maks.' }],
    rows: [
      ['Kategori', 'Motor listrik (menu produk GODA)'], ['Daya dinamo', '3000 W'], ['Baterai', '72V 20Ah'],
      ['Kecepatan maks.', '80 km/jam'], ['Jarak tempuh', '50 km'], ['Waktu cas', UNPUB], ['Beban maks.', '150 kg'],
      ['Rem', 'Cakram'], ['Ukuran ban', '90/90-12'], ['Dimensi dan bobot', UNPUB],
      ['Warna', 'Phantom Black, British Green, Milan Red, White'], ['Bonus di halaman GODA', 'Gratis 1 pasang spion'],
      ['Harga', 'Halaman GODA menulis: harga yang tertera masih off the road'], ['Garansi', GARANSI],
    ],
    cmp: { dinamo: '3000 W', baterai: '72V 20Ah', jarak: '50 km', kecepatan: '80 km/jam', beban: '150 kg', rem: 'Cakram', ban: '90/90-12' },
    colors: [{ n: 'Phantom Black', hex: '#1C1D1F' }, { n: 'British Green', hex: '#2D4A36' }, { n: 'Milan Red', hex: '#D3240C' }, { n: 'White', hex: '#F6F5F1' }],
    colorDefault: 2, garansi: true,
    src: ['https://www.godaindonesia.com/product-page/ceramic-flower-vase'],
  },
  'aura-gd008': {
    word: 'Aura',
    strip: [{ v: '650', u: 'W', l: 'Daya dinamo' }, { v: '48V', u: '12Ah', l: 'Baterai' }, { v: '45', u: 'km', l: 'Jarak tempuh, sekitar' }, { v: '40', u: 'km/jam', l: 'Kecepatan maks.' }],
    rows: [
      ['Kategori', 'Sepeda listrik (menu produk GODA)'], ['Daya dinamo', '650 W'], ['Baterai', '48V 12Ah'],
      ['Kecepatan maks.', '40 km/jam'], ['Jarak tempuh', 'Sekitar 45 km'], ['Waktu cas', UNPUB], ['Dimensi dan bobot', UNPUB],
      ['Fitur', 'Teknologi SGS dan SDS, Smart Seat lewat remote'],
      ['Warna', 'Shadow Black, Urban Blue, Pop Pink, Majestic Red, Flash Orange'],
      ['Klaim kerusakan', 'Halaman GODA mewajibkan video unboxing'],
    ],
    cmp: { dinamo: '650 W', baterai: '48V 12Ah', jarak: 'sekitar 45 km', kecepatan: '40 km/jam', beban: null, rem: null, ban: null },
    colors: [{ n: 'Shadow Black', hex: '#1D1E20' }, { n: 'Urban Blue', hex: '#2F5D9B' }, { n: 'Pop Pink', hex: '#E88BB0' }, { n: 'Majestic Red', hex: '#A8202B' }, { n: 'Flash Orange', hex: '#EE6A1F' }],
    colorDefault: 4,
    src: ['https://www.godaindonesia.com/product-page/goda-new-aura-008-sepeda-listrk-48v12ah'],
  },
  'luna-gd003': {
    word: 'Luna',
    strip: [{ v: '3000', u: 'W', l: 'Daya dinamo' }, { v: '85', u: 'km', l: 'Jarak tempuh' }, { v: '65', u: 'km/jam', l: 'Kecepatan maks.' }],
    rows: [
      ['Kategori', 'Motor listrik (menu produk GODA)'], ['Daya dinamo', '3000 W'],
      ['Baterai', 'Tidak dicantumkan di simulasi GODA. Versi baterai Lithium FE diumumkan di blog GODA, 14 Okt 2026'],
      ['Kecepatan maks.', '65 km/jam'], ['Jarak tempuh', '85 km'], ['Waktu cas', UNPUB], ['Warna', UNPUB],
    ],
    cmp: { dinamo: '3000 W', baterai: null, jarak: '85 km', kecepatan: '65 km/jam', beban: null, rem: null, ban: null },
    colors: null, src: [SRC_SIM],
  },
  'kingkong-gd199': {
    word: 'Kingkong',
    strip: [{ v: '1500', u: 'W', l: 'Daya dinamo' }, { v: '60', u: 'km', l: 'Jarak tempuh' }, { v: '70', u: 'km/jam', l: 'Kecepatan maks.' }],
    rows: [
      ['Kategori', 'Motor listrik (menu produk GODA)'], ['Daya dinamo', '1500 W'],
      ['Baterai', 'Tidak dicantumkan di simulasi GODA. Versi Mecha Kingkong Lithium diumumkan di blog GODA, 14 Okt 2026'],
      ['Kecepatan maks.', '70 km/jam'], ['Jarak tempuh', '60 km'], ['Waktu cas', UNPUB], ['Warna', UNPUB],
    ],
    cmp: { dinamo: '1500 W', baterai: null, jarak: '60 km', kecepatan: '70 km/jam', beban: null, rem: null, ban: null },
    colors: null, src: [SRC_SIM],
  },
  'sunray-g16': {
    word: 'Sunray',
    strip: [{ v: '800', u: 'W', l: 'Daya dinamo' }, { v: '48V', u: '20Ah', l: 'Baterai SLA' }, { v: '50', u: 'km', l: 'Jarak tempuh' }, { v: '50', u: 'km/jam', l: 'Kecepatan, mode 3' }],
    rows: [
      ['Kategori', 'Sepeda listrik (menu produk GODA), Galactic Series'], ['Daya dinamo', '800 W'], ['Baterai', '48V 20Ah SLA'],
      ['Kecepatan maks.', '33, 40, dan 50 km/jam (mode speed 1, 2, 3)'], ['Jarak tempuh', '50 km'], ['Waktu cas', UNPUB],
      ['Ukuran ban', '2.75/10 depan, 3.00/10 belakang'],
      ['Fitur', 'Speedometer digital, Keyless NFC, Smart Seat, lampu LED, spion stainless, mode mundur, sandaran, bagasi jok'],
      ['Warna', 'Blush Pink, Red Plum, Mint Sky, Sunny Yellow'],
    ],
    cmp: { dinamo: '800 W', baterai: '48V 20Ah SLA', jarak: '50 km', kecepatan: '50 km/jam (mode 3)', beban: null, rem: null, ban: '2.75/10 dan 3.00/10' },
    colors: [{ n: 'Blush Pink', hex: '#E9B7BE' }, { n: 'Red Plum', hex: '#7B2A3A' }, { n: 'Mint Sky', hex: '#9FD3CB' }, { n: 'Sunny Yellow', hex: '#F3CF4B' }],
    colorDefault: 1,
    src: ['https://www.godaindonesia.com/post/goda-sunray-resmi-meluncur-sepeda-listrik-stylish-dengan-motor-800-watt'],
  },
};
// The six models GODA lists only in its cicilan simulator share one shape.
const simOnly = (word, w, km, kmh) => ({
  word,
  strip: [{ v: String(w), u: 'W', l: 'Daya dinamo' }, { v: String(km), u: 'km', l: 'Jarak tempuh' }, { v: String(kmh), u: 'km/jam', l: 'Kecepatan maks.' }],
  rows: [['Kategori', 'Sepeda listrik (menu produk GODA)'], ['Daya dinamo', `${w} W`], ['Baterai', NOT_LISTED], ['Kecepatan maks.', `${kmh} km/jam`], ['Jarak tempuh', `${km} km`], ['Waktu cas', UNPUB], ['Warna', UNPUB]],
  cmp: { dinamo: `${w} W`, baterai: null, jarak: `${km} km`, kecepatan: `${kmh} km/jam`, beban: null, rem: null, ban: null },
  colors: null, src: [SRC_SIM],
});
Object.assign(SPEC, {
  'cyber-lite-gd120s': simOnly('Cyber Lite', 550, 40, 40),
  'sky-gd007': simOnly('Sky', 600, 40, 40),
  'try-lite-gd005s': simOnly('Try Lite', 600, 40, 40),
  'garuda-002x': simOnly('Garuda', 650, 50, 40),
  'lemon-gd001': simOnly('Lemon', 650, 40, 40),
});

/* ---------- helpers ---------- */
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const priceNum = m => m.price ? +m.price.replace(/\D/g, '') : null;
export const priceFrom = m => !!m.price && /^mulai/i.test(m.price);
export const priceAmount = m => m.price ? m.price.replace(/^mulai\s*/i, '') : null;
export const priceLabel = () => 'Harga resmi GODA';
export const isMotor = m => m.category === 'Motor listrik';
// spec values: plain text shows; unpublished or conflicting values become a WhatsApp ask for that spec
const bare = t => String(t).replace(/\s*\((klaim GODA)\)/g, '');
export const isUnknown = v => v == null || (typeof v === 'object' && v.beda) || (typeof v === 'string' && /^(Belum dipublikasikan|Tidak dicantumkan)/.test(v));
const ASKQ = {
  'Daya dinamo': 'berapa daya dinamo', 'Baterai': 'berapa kapasitas baterai', 'Kecepatan maks.': 'berapa kecepatan maksimal',
  'Jarak tempuh': 'berapa jarak tempuh', 'Waktu cas': 'berapa lama waktu cas baterai', 'Beban maks.': 'berapa beban maksimal',
  'Rem': 'apa jenis rem', 'Velg': 'apa jenis velg', 'Ukuran ban': 'berapa ukuran ban', 'Dimensi dan bobot': 'berapa dimensi dan bobot',
  'Warna': 'apa saja pilihan warna',
};
export const specAskText = (m, label) => `Halo Moto Ijo, ${ASKQ[label] || `boleh tanya ${label.toLowerCase()}`} ${m.name}?`;
export const specAsk = (m, label) => `<a class="spec-ask" href="${wa(specAskText(m, label))}" target="_blank" rel="noopener">${icon('brand-whatsapp')}Tanya di showroom<span class="sr">: ${esc(label.toLowerCase())} ${esc(m.name)}, lewat WhatsApp</span></a>`;
export const val = (v, m, label) => isUnknown(v) ? (m ? specAsk(m, label) : '') : esc(bare(v));
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// WhatsApp: every prefilled text names the model
export const waStockText = (m, color = '') => m.price
  ? `Halo Moto Ijo, apakah ${m.name}${color ? ` warna ${color}` : ''} ada stok di showroom Palmerah?`
  : `Halo Moto Ijo, berapa harga ${m.name}${color ? ` warna ${color}` : ''} dan apakah ada stok?`;
export const waStock = (m, color) => wa(waStockText(m, color));
export const waAsk = (m, extra = '') => wa(`Halo Moto Ijo, saya mau tanya soal ${m.name}${extra}.`);
export const waPrice = m => wa(`Halo Moto Ijo, berapa harga ${m.name} dan apakah ada stok?`);

// kept for detail.js imports; source lines are not shown on pages (Thomas, 22 Okt)
export const srcText = () => '';
export const specLine = m => m.specs.map(x => x.value).join(' · ');
export const metaLine = m => [m.category, specLine(m)].join(' · ');

// card dot colour per model (same paints as the home catalogue)
export const PAINT = {
  'm1-laser': '#2E9E46', 'starship-gd299': '#8C8A84', 'venus-gd270': '#D9341C', 'aura-gd008': '#E8541F',
  'luna-gd003': '#4F6F4A', 'kingkong-gd199': '#1E1F22', 'sunray-g16': '#6E1F22', 'cyber-lite-gd120s': '#E3262E',
  'sky-gd007': '#9C8FD6', 'try-lite-gd005s': '#1E1F22', 'garuda-002x': '#B8BCBE', 'lemon-gd001': '#A9C8F5',
};
const img400 = src => src.replace(/\.webp$/, '-400.webp');

// price: "Harga resmi GODA" over the amount ("mulai" in front when GODA quotes a from-price), or the WhatsApp ask
export function priceHTML(m, cls = '') {
  if (!m.price) return `<p class="pr ${cls}"><span class="pr__k">Harga</span><span class="pr__v pr__v--ask">Tanya lewat WhatsApp</span></p>`;
  return `<p class="pr ${cls}"><span class="pr__k">${priceLabel(m)}</span><span class="pr__v num">${priceFrom(m) ? '<span class="pr__from">mulai</span> ' : ''}${esc(priceAmount(m))}</span></p>`;
}

// product card (katalog, related models): whole card opens the detail page; the WhatsApp button stays its own link
export function cardHTML(m, { eager = false, h = 'h2' } = {}) {
  const href = `produk-detail.html?m=${m.slug}`;
  return `<li class="pc" style="--paint:${PAINT[m.slug] || 'var(--abu)'}" data-slug="${m.slug}">
    <div class="pc__img"><img src="${m.img}" srcset="${img400(m.img)} 400w, ${m.img} 800w" sizes="(max-width: 760px) 46vw, (max-width: 1199px) 31vw, 320px" width="800" height="590" alt="" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></div>
    <p class="pc__meta"><span class="pc__dot" aria-hidden="true"></span>${esc(m.category)}${m.badge ? '<span class="pc__badge">Best Seller di Moto Ijo</span>' : ''}</p>
    <${h} class="pc__name"><a href="${href}">${esc(m.short)}<span class="sr">, lihat detail</span></a></${h}>
    <p class="pc__spec">${esc(specLine(m))}</p>
    <div class="pc__foot">
      ${priceHTML(m)}
      <div class="pc__btns">
        <a class="btn btn--sm pc__wa" href="${waStock(m)}" target="_blank" rel="noopener">${icon('brand-whatsapp')}${m.price ? 'Tanya stok' : 'Tanya harga'}<span class="sr"> ${esc(m.name)} lewat WhatsApp</span></a>
        <a class="btn btn--sm btn--line pc__more" href="${href}" tabindex="-1" aria-hidden="true">Lihat detail</a>
      </div>
    </div>
  </li>`;
}

// the product plate (bandingkan columns): stone field with a cut-out
export function plateHTML(m, { tag = 'a', eager = false, cls = '' } = {}) {
  const attrs = tag === 'a' ? ` href="produk-detail.html?m=${m.slug}" aria-label="Lihat detail ${esc(m.name)}" tabindex="-1"` : '';
  return `<${tag} class="plate ${cls}"${attrs}>
    <img class="plate__img" src="${m.img}" alt="${esc(m.name)} tampak samping" width="800" height="590" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
  </${tag}>`;
}

/* ---------- trust: one small proof list, values from SITE ---------- */
const STAR = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/></svg>';
const hoursLine = () => `Buka ${SITE.hours.replace(/^Setiap hari,?\s*/i, 'setiap hari ')}`;
export const PROOF = {
  resmi: () => `<li>${icon('shield-check')}<span>Distributor resmi GODA</span></li>`,
  rating: () => `<li class="is-star">${STAR}<span><a href="${SITE.maps}" target="_blank" rel="noopener">${esc(SITE.rating.replace(' Google Maps', ''))}</a> di Google Maps</span></li>`,
  jam: () => `<li>${icon('clock')}<span>${esc(hoursLine())}</span></li>`,
  alamat: () => `<li>${icon('map-pin')}<span>${esc(SITE.addressShort)}, Palmerah</span></li>`,
  garansi: () => `<li>${icon('certificate')}<span>Garansi sparepart hingga 5 tahun (SnK berlaku)</span></li>`,
};
export const proofHTML = (keys, cls = '') => `<ul class="proof ${cls}">${keys.map(k => PROOF[k]()).join('')}</ul>`;

/* ---------- the "coba di Palmerah" block (katalog, detail, bandingkan) ---------- */
export function askHTML({ id = 'ask-h', h, p, tr = 'test-ride.html', waText, waLabel = 'Tanya lewat WhatsApp', proof = ['rating', 'jam', 'resmi', 'alamat'] }) {
  return `<div class="wrap">
    <div class="ask__card">
      <div class="ask__txt">
        <h2 class="ask__h" id="${id}">${h}</h2>
        <p class="ask__p">${p}</p>
        <div class="ask__btns">
          <a class="btn" href="${tr}">Jadwalkan test ride${arrow()}</a>
          <a class="btn btn--line btn--line-light" href="${wa(waText)}" target="_blank" rel="noopener" data-ask-wa>${icon('brand-whatsapp')}${waLabel}</a>
        </div>
        ${proof.length ? proofHTML(proof, 'proof--dark') : ''}
      </div>
      <div class="ask__pics">
        <img src="assets/img/showroom/showroom-2.webp" alt="Ruang pamer Moto Ijo dengan deretan sepeda dan motor listrik GODA" width="1050" height="1400" loading="lazy" decoding="async">
        <img src="assets/img/showroom/showroom-3.webp" alt="Motor listrik GODA merah dan hitam di lantai showroom Moto Ijo" width="925" height="1400" loading="lazy" decoding="async">
      </div>
    </div>
  </div>`;
}

/* ---------- compare store (localStorage, max 3; bandingkan.html) ---------- */
const KEY = 'mi-compare';
export const cmpStore = {
  get() { try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a.filter(bySlug).slice(0, 3) : []; } catch { return []; } },
  set(a) { try { localStorage.setItem(KEY, JSON.stringify(a.slice(0, 3))); } catch {} dispatchEvent(new CustomEvent('mi-compare')); },
  has(s) { return this.get().includes(s); },
  toggle(s) { const a = this.get(); if (a.includes(s)) { this.set(a.filter(x => x !== s)); return 'removed'; } if (a.length >= 3) return 'full'; this.set([...a, s]); return 'added'; },
};

/* ============ KATALOG (produk.html) ============ */
if (document.body.dataset.page === 'produk') katalog();

function katalog() {
  const list = document.querySelector('[data-list]');
  const count = document.querySelector('[data-count-live]');
  const chips = [...document.querySelectorAll('[data-filter]')];
  const sort = document.querySelector('[data-sort]');
  const sortBox = sort.closest('.kat-sort');
  const state = { f: 'semua', s: 'katalog' };

  const fromHash = () => { const h = location.hash.slice(1); state.f = h === 'motor' || h === 'sepeda' ? h : 'semua'; };

  const render = () => {
    let a = MODELS.filter(m => state.f === 'semua' || (state.f === 'motor' ? isMotor(m) : !isMotor(m)));
    if (state.s !== 'katalog') a = [...a].sort((x, y) => { const px = priceNum(x), py = priceNum(y); if (px == null) return 1; if (py == null) return -1; return state.s === 'naik' ? px - py : py - px; });
    list.innerHTML = a.map((m, i) => cardHTML(m, { eager: i < 4 })).join('');
    count.textContent = a.length === MODELS.length ? `${a.length} model` : `${a.length} dari ${MODELS.length} model`;
    chips.forEach(c => c.setAttribute('aria-pressed', c.dataset.filter === state.f));
    sortBox.classList.toggle('is-set', state.s !== 'katalog');
  };
  // after a filter or sort, bring the grid top back under the sticky bar when it has scrolled away
  const toTop = () => {
    const bar = document.querySelector('.kat-bar'); const y = list.getBoundingClientRect().top + scrollY - bar.offsetHeight - 12 - (document.body.classList.contains('nav-away') ? 0 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0);
    if (scrollY > y + 4) scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  };
  const update = () => { (!reduced && document.startViewTransition) ? document.startViewTransition(render) : render(); toTop(); };

  chips.forEach(c => c.addEventListener('click', () => {
    state.f = c.dataset.filter;
    history.replaceState(null, '', state.f === 'semua' ? location.pathname : `#${state.f}`);
    update();
  }));
  sort.addEventListener('change', () => { state.s = sort.value; update(); });
  addEventListener('hashchange', () => { fromHash(); update(); });

  fromHash(); render();
  const ask = document.querySelector('[data-ask]');
  if (ask) ask.innerHTML = askHTML({
    h: 'Belum yakin pilih yang mana?',
    p: 'Datang dan coba langsung di showroom Palmerah. Mau tanya dulu? Chat kami di WhatsApp.',
    waText: 'Halo Moto Ijo, saya masih bingung pilih model GODA. Bisa bantu?',
  });
}

export { SITE };
