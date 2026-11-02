// Moto Ijo: shared facts used by the shell and pages. Source: docs/facts.md (20 Okt 2026).
// Only verified values here. Unknowns are left out of the UI (Thomas: no "[__ — konfirmasi]" on pages).
export const SITE = {
  name: 'Moto Ijo',
  role: 'Distributor resmi GODA di Palmerah, Jakarta Barat',
  wa: '6281952557572',
  waDisplay: '0819-5255-7572',
  waText: 'Halo Moto Ijo, saya mau tanya soal motor listrik GODA.',
  address: 'Ruko Palmerah Barat Raya No. 12B, Kel. Palmerah, Jakarta Barat 11480',   // brochure, Okt 2026
  addressShort: 'Ruko Palmerah Barat Raya No. 12B',
  landmark: 'Seberang Bank BRI Palmerah',
  wa2Display: '0878-8122-5199',                    // second number on the brochure; CTAs use wa (0819) only
  hours: 'Setiap hari, 08.30–20.00',            // Google Maps, 20 Okt 2026 (Tokopedia lists 09.00–18.00: confirm with client)
  maps: 'https://maps.app.goo.gl/XFvZ4KERAK9xWYGp8',
  rating: '5,0 dari 440 ulasan Google Maps',      // per 1 Nov 2026 (was 433 on 20 Okt)
  // Exclusivity is NOT verified: GODA's locator lists 10 points in DKI Jakarta (2 in Jakarta Barat).
  // Keep false until the client shows proof; when true, pages may use `exclusiveLine`.
  exclusive: false,
  exclusiveLine: 'Distributor resmi GODA untuk Jakarta Barat',
  network: 'Motoijo, Palmerah',                    // name in GODA's official dealer locator
  networkCode: 'GD02-240025',                      // code in GODA's official dealer locator
  social: {
    instagram: 'https://www.instagram.com/moto_ijo/',
    tiktok: 'https://www.tiktok.com/@moto_ijo',
    facebook: 'https://www.facebook.com/profile.php?id=61558130684521',
    tokopedia: 'https://www.tokopedia.com/motoijo',
    shopee: 'https://shopee.co.id/moto_ijo',
  },
};

export const NAV = [
  { href: 'produk.html', label: 'Produk', mega: 'models' },
  { href: 'simulasi-cicilan.html', label: 'Simulasi cicilan' },
  { href: 'test-ride.html', label: 'Test ride' },
  // Showroom, Promo, Panduan hidden from the menu for now (Thomas, 22 Okt 2026); the pages still exist.
  // layanan.html removed 1 Nov 2026 (client); "Lainnya" only opens its panel
  { href: '#lainnya', label: 'Lainnya', children: [
    { href: 'servis.html', label: 'Servis & sparepart', icon: 'tool', line: 'Tanya servis dan suku cadang.' },
    { href: 'garansi.html', label: 'Garansi', icon: 'shield-check', line: 'Garansi dari GODA dan cara klaimnya.' },
    { href: 'tentang.html', label: 'Tentang Moto Ijo', icon: 'building-store', line: 'Distributor resmi GODA di Palmerah.' },
  ] },
];

export const wa = (text = SITE.waText) => `https://wa.me/${SITE.wa}?text=${encodeURIComponent(text)}`;
export const icon = (name, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="assets/icons.svg#i-${name}"></use></svg>`;
export const arrow = () => `<span class="btn__arrow">${icon('arrow-right')}</span>`;

// Cicilan: one formula for the whole site, as on GODA's own simulator (docs/facts.md §3.2):
// biaya penanganan 1% on top of the loan, flat bunga 2,95% per bulan on (pokok + penanganan), tenor 3/6/12 bulan.
export const CICIL = { rate: 0.0295, handling: 0.01, tenors: [3, 6, 12], tenor: 12, dpPct: 20 };
// Cicilan partners the showroom takes (client, 2 Nov 2026: Kredivo, Shopee PayLater, BSI Hasanah Card). Public terms read
// 2 Nov 2026 (docs/facts.md §3.3); estimates only, the partner sets the final number. rate = flat per bulan on (pokok + penanganan).
export const MITRA = [
  { key: 'kredivo', label: 'Kredivo', rate: CICIL.rate, handling: CICIL.handling, terms: 'bunga 2,95% per bulan, biaya penanganan 1%' },
  { key: 'spaylater', label: 'Shopee PayLater', rate: 0.0295, handling: 0.01, terms: 'bunga mulai 2,95% per bulan, biaya penanganan 1%. Angka akhir mengikuti limit dan profilmu di aplikasi Shopee' },
  { key: 'bsi', label: 'BSI Hasanah Card', rate: 0, handling: 0, terms: 'cicilan 0% lewat fitur Smart Spending (minimal Rp500 ribu). Ujrah bulanan dan iuran tahunan kartu belum termasuk' },
];
export const mitraBy = k => MITRA.find(x => x.key === k) || MITRA[0];
export const mitraWords = () => MITRA.slice(0, -1).map(x => x.label).join(', ') + ', atau ' + MITRA.at(-1).label;   // "Kredivo, Shopee PayLater, atau BSI Hasanah Card"
export function cicilan(price, dpRp, tenor, mitra = MITRA[0]) {
  const p = typeof mitra === 'number' ? { rate: mitra, handling: CICIL.handling } : mitra;
  const pokok = Math.max(0, price - dpRp) * (1 + p.handling);
  const bulan = Math.round(pokok * (1 + p.rate * tenor) / tenor);
  return { dp: dpRp, pokok: Math.round(pokok), bulan, bunga: bulan * tenor - Math.round(pokok), total: dpRp + bulan * tenor };
}
