// Moto Ijo · kabar.js: the "Kabar dan panduan" row on the home page (rendered into index.html by tools/prerender.mjs).
// GODA posts (godaindonesia.com/blog, read 16 Nov 2026): title kept as GODA wrote it, the line under it is our own short
// summary, the cover is GODA's (assets/img/kabar, permission as for the other GODA images: docs/facts.md §5).
// Two posts are rewritten as Moto Ijo articles (own words, Moto Ijo price and test ride): href points to our page.
// kind: 'goda' (GODA news, links out), 'tips' (GODA how-to, links out), 'motoijo' (our page). date: ISO.
export const KABAR = [
  { kind: 'motoijo', date: '2026-10-30', href: 'kabar-goda-centurion.html', img: 'assets/img/kabar/goda-g18-centurion-motor-listrik-gahar-yang-siap-bikin-kamu-800.webp', w: 800, h: 600,
    title: 'GODA Centurion: motor listrik 3000 W yang tembus 100 km/jam', ex: 'Baterai lithium 64V 40Ah, jarak tempuh 100 km. Spesifikasi dan harganya di Moto Ijo.',
    src: 'https://www.godaindonesia.com/post/goda-g18-centurion-motor-listrik-gahar-yang-siap-bikin-kamu-dilirik-di-jalan' },
  { kind: 'goda', date: '2026-10-14', href: 'https://www.godaindonesia.com/post/goda-rilis-5-motor-listrik-galactic-series-2-seri-jagoan-lithium-fe-buat-dukung-gaya-hidup-bebas',
    img: 'assets/img/kabar/goda-rilis-5-motor-listrik-galactic-series-2-seri-jagoan-lit-800.webp', w: 800, h: 453,
    title: 'GODA Rilis 5 Motor Listrik "Galactic Series" & 2 Seri Jagoan Lithium FE', ex: 'Peluncuran Galactic Series dan dua model berbaterai lithium.' },
  { kind: 'motoijo', date: '2026-09-02', href: 'kabar-goda-sunray.html', img: 'assets/img/kabar/goda-sunray-resmi-meluncur-sepeda-listrik-stylish-dengan-mot-800.webp', w: 800, h: 450,
    title: 'GODA Sunray: skuter retro 800 W, sampai 50 km/jam', ex: 'Tiga mode kecepatan, jarak tempuh 50 km, empat warna pastel. Harganya di Moto Ijo.',
    src: 'https://www.godaindonesia.com/post/goda-sunray-resmi-meluncur-sepeda-listrik-stylish-dengan-motor-800-watt' },
  { kind: 'goda', date: '2026-08-24', href: 'https://www.godaindonesia.com/post/aftersales-goda-makin-dekat-kini-hadir-di-garut-dan-surabaya',
    img: 'assets/img/kabar/aftersales-goda-makin-dekat-kini-hadir-di-garut-dan-surabaya-800.webp', w: 800, h: 533,
    title: 'Aftersales GODA Makin Dekat, Kini Hadir di Garut dan Surabaya', ex: 'Layanan purna jual GODA bertambah di dua kota.' },
  { kind: 'tips', date: '2026-08-14', href: 'https://www.godaindonesia.com/post/pentingnya-memilih-motor-listrik-terbaik',
    img: 'assets/img/kabar/pentingnya-memilih-motor-listrik-terbaik-800.webp', w: 800, h: 450,
    title: 'Motor Listrik Terbaik Bukan Cuma Soal Harga, Perhatikan Aftersales Juga!', ex: 'Sebelum membeli, cek juga servis dan suku cadangnya.' },
  { kind: 'tips', date: '2026-08-11', href: 'https://www.godaindonesia.com/post/berapa-lama-waktu-ideal-ngecas-sepeda-motor-listrik',
    img: 'assets/img/kabar/berapa-lama-waktu-ideal-ngecas-sepeda-motor-listrik-800.webp', w: 800, h: 533,
    title: 'Berapa Lama Durasi Ngecas Sepeda dan Motor Listrik?', ex: 'Lama mengisi baterai dan kebiasaan mengecas yang aman.' },
  { kind: 'tips', date: '2026-08-07', href: 'https://www.godaindonesia.com/post/jenis-jenis-baterai-sepeda-listrik-li-ion-vs-sla-mana-yang-lebih-baik',
    img: 'assets/img/kabar/jenis-jenis-baterai-sepeda-listrik-li-ion-vs-sla-mana-yang-l-800.webp', w: 800, h: 533,
    title: 'Perbedaan Baterai Sepeda Listrik: Lithium vs SLA, Mana yang Lebih Unggul?', ex: 'Beda bobot, umur pakai, dan harga dua jenis baterai.' },
  { kind: 'tips', date: '2026-08-04', href: 'https://www.godaindonesia.com/post/panduan-lengkap-baterai-sepeda-listrik-cara-merawat-mengisi-daya-dan-memperpanjang-umur-pakai',
    img: 'assets/img/kabar/panduan-lengkap-baterai-sepeda-listrik-cara-merawat-mengisi-800.webp', w: 800, h: 533,
    title: 'Panduan Lengkap Baterai Sepeda Listrik', ex: 'Cara merawat dan mengecas baterai supaya awet.' },
  { kind: 'goda', date: '2026-07-28', href: 'https://www.godaindonesia.com/post/atta-halilintar-resmi-menjadi-brand-ambassador-goda-indonesia-bawa-semangat-baru-menuju-era-mobilit',
    img: 'assets/img/kabar/atta-halilintar-resmi-menjadi-brand-ambassador-goda-indonesi-800.webp', w: 800, h: 530,
    title: 'Atta Halilintar Resmi Menjadi Brand Ambassador GODA Indonesia', ex: 'GODA Indonesia mengumumkan brand ambassador barunya.' },
  { kind: 'goda', date: '2026-07-17', href: 'https://www.godaindonesia.com/post/pengguna-goda-di-bandar-lampung-kini-tak-perlu-khawatir-official-service-center-goda-resmi-dibuka-d',
    img: 'assets/img/kabar/pengguna-goda-di-bandar-lampung-kini-tak-perlu-khawatir-offi-800.webp', w: 800, h: 533,
    title: 'Official Service Center GODA Resmi Dibuka di Bandar Lampung', ex: 'Pengguna GODA di Bandar Lampung kini punya service center resmi.' },
  { kind: 'panduan', date: '2026-10-20', href: 'panduan-sepeda-vs-motor-listrik.html', img: 'assets/img/brochure/luna-gd003-600.webp', w: 600, h: 322,
    title: 'Sepeda listrik atau motor listrik? Ini bedanya menurut aturan', ex: 'SIM, STNK, helm, dan batas kecepatan. Biar tidak salah pilih.' },
];
export const KIND = { goda: 'Kabar GODA', tips: 'Tips GODA', motoijo: 'Kabar GODA · Moto Ijo', panduan: 'Panduan Moto Ijo' };
