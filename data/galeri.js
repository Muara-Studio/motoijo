// Moto Ijo · galeri.js: real photos of the showroom, the workshop and after-sales, for tentang, servis and garansi.
// Owner: agent RESEARCH (1 Nov 2026). Sources and rejected candidates: docs/research-galeri-ulasan.md. Every item is a real photo with its source; nothing staged or generated.
// kind: 'showroom' | 'servis' | 'garansi' | 'serah-terima'. src paths are relative to the site root; w/h are the file's
// real pixel size; small = a ~600px-wide copy for thumbnails (same aspect). source = where the photo came from.
export const GALERI = [
  { src: 'assets/img/showroom/showroom-depan.webp', small: 'assets/img/showroom/showroom-depan-720.webp', w: 1244, h: 1698, kind: 'showroom', alt: 'Tampak depan showroom: papan oranye GODA di atas Kimora Boutique, motor listrik berjajar di bawah tenda GODA', source: 'foto dari klien, 1 Nov 2026' },
  { src: 'assets/img/showroom/showroom-3.webp', w: 925, h: 1400, kind: 'showroom', alt: 'Motor listrik GODA merah dan hitam di lantai showroom', source: 'Google Maps, foto pemilik' },
  { src: 'assets/img/showroom/showroom-4.webp', w: 720, h: 1280, kind: 'showroom', alt: 'Logo GODA di dinding showroom dengan dua sepeda listrik', source: 'Google Maps, cuplikan video pemilik (Sep 2024)' },
  { src: 'assets/img/showroom/showroom-5.webp', w: 1050, h: 1400, kind: 'showroom', alt: 'Skuter listrik GODA warna krem di dalam showroom', source: 'Google Maps, foto pemilik' },
  { src: 'assets/img/galeri/showroom-dalam.webp', small: 'assets/img/galeri/showroom-dalam-600.webp', w: 1067, h: 865, kind: 'showroom', alt: 'Lantai showroom dilihat dari dalam ke arah jalan: meja kecil, deretan sepeda listrik terbungkus plastik, dan unit di teras', source: 'Google Maps, foto pemilik (dipotong)' },
];
export const byKind = (...k) => GALERI.filter(g => k.includes(g.kind));
