// Moto Ijo · ulasan.js: short excerpts of real Google Maps reviews of the showroom ("Goda Palmerah Motoijo").
// Owner: agent RESEARCH (1 Nov 2026). Rules: verbatim excerpt of at most ~20 words (cut with "…", never reworded),
// name as first name + initial, stars as Google shows them; when = month/year worked out from Google's relative date (seen) on the read date, topic from the review's own words.
// topic: 'servis' | 'garansi' | 'sparepart' | 'pelayanan' | 'harga' | 'unit'. Empty array = the page hides the block.
// Read 1 Nov 2026 from the public review list of the listing (all 440 loaded, no login). Spelling kept as written.
// Quoting on the site still needs the client's OK (docs/facts.md item 12). Details: docs/research-galeri-ulasan.md.
export const ULASAN_RINGKAS = { rating: '5,0', count: 440, url: 'https://maps.app.goo.gl/XFvZ4KERAK9xWYGp8' };
export const ULASAN = [
  // servis, sparepart, garansi
  { name: 'Mia H.', stars: 5, when: 'Mei 2026', seen: '6 bulan lalu', topic: 'servis', text: 'Recommended.. one place beli sekalian service bisa disatu tempat.. nice', read: '2026-11-01' },
  { name: 'Muhamad I.', stars: 5, when: '2025', seen: 'setahun lalu', topic: 'servis', text: 'Pelayanan baik, barang baik, aftersales bagus', read: '2026-11-01' },
  { name: 'Mutia Z.', stars: 5, when: 'April 2026', seen: '7 bulan lalu', topic: 'servis', text: '…Sepeda listriknya juga langsung dicek dan dicoba dulu sebelum dibawa pulang. overall puas, semoga awet.', read: '2026-11-01' },
  { name: 'Dhelya N.', stars: 5, when: '2024', seen: '2 tahun lalu', topic: 'servis', text: 'Tempat ini menyediakan sepeda dan motor listrik dengan harga terjangkau, servis sangat baik', read: '2026-11-01' },
  { name: 'Fatchu R.', stars: 5, when: '2025', seen: 'setahun lalu', topic: 'servis', text: 'Servis terbaik dan promo amyarrr', read: '2026-11-01' },
  { name: 'Firman S.', stars: 5, when: '2025', seen: 'setahun lalu', topic: 'sparepart', text: "Harga terjangkau, banyak garansi, ada service dan penjualan sparepart juga, sales'y baik dan ramah", read: '2026-11-01' },
  { name: 'Johan E.', stars: 5, when: '2025', seen: 'setahun lalu', topic: 'garansi', text: 'Beli motor disini sangat memuaskan, produck terjamin garansinya.. joss terima kasih toko goda Palmerah moto ijo', read: '2026-11-01' },
  { name: 'Malika A.', stars: 5, when: '2025', seen: 'setahun lalu', topic: 'garansi', text: 'Layanannya bagus, brgnya jg banyak variannya, harga murah, ada garansi, dan kualitas bgs krn distributor dari goda.', read: '2026-11-01' },
  { name: 'Petrus S.', stars: 5, when: 'Januari 2026', seen: '10 bulan lalu', topic: 'garansi', text: 'Pelayanan nya bagus ...ada garansi nya juga...mantap', read: '2026-11-01' },
  { name: 'Reyfan R.', stars: 5, when: '2025', seen: 'setahun lalu', topic: 'garansi', text: 'pelayananan nya baik ramah, kualitasnya juga oke, ada garansi nya juga, mantap pkonya…', read: '2026-11-01' },
  // pelayanan
  { name: 'Sariyah S.', stars: 5, when: 'Oktober 2026', seen: '2 minggu lalu', topic: 'pelayanan', text: '…Pelayananya ramah cara menjelaskannya jg detail dan barang nya jg banyak pilihan', read: '2026-11-01' },
  { name: 'Liya L.', stars: 5, when: 'Oktober 2026', seen: 'sebulan lalu', topic: 'pelayanan', text: 'Pembelian unit bagus baguss , pelayanan seller ramah dan baik untuk penjelasan unit.', read: '2026-11-01' },
  { name: 'Immanuella P.', stars: 5, when: 'Agustus 2026', seen: '3 bulan lalu', topic: 'pelayanan', text: 'Senang bisa beli sepeda listrik pertama disini, sepeda listriknya bagus, staff ramah, dan pelayanan Good…', read: '2026-11-01' },
  { name: 'Syarief B.', stars: 5, when: 'Februari 2026', seen: '9 bulan lalu', topic: 'pelayanan', text: '…Terima kasih atas Service Motoijo yg sangat Friendly & Helpfull.', read: '2026-11-01' },
  { name: 'Galazhar', stars: 5, when: '2025', seen: 'setahun lalu', topic: 'pelayanan', text: '…Pelayanan ramah, proses pembelian cepat dan mudah. Motor yang dibeli sesuai dengan ekspektasi, harga kompetitif dan kualitas terjamin.', read: '2026-11-01' },
  { name: 'Sudinah B.', stars: 5, when: '2025', seen: 'setahun lalu', topic: 'pelayanan', text: '…Terpercaya tokonya amanah the best dah', read: '2026-11-01' },
];
export const byTopic = (...t) => ULASAN.filter(u => t.includes(u.topic));
