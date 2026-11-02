// Moto Ijo line-up = the client's brochure "Motoijo Brochure New" (New Product, September 2026), 2 series, 13 models.
// Prices: Moto Ijo price list sent by the client, 31 Okt 2026 (×1000). price null = not on the list: the UI says "Tanya harga lewat WhatsApp".
// Removed 31 Okt 2026 (no longer sold): M1 Laser, Starship GD299, Venus GD270, Cyber Lite GD120S.
// img = product cut-out (assets/img/models/ or the older assets/img/goda/), life = brochure photo crop (assets/img/brochure/).
// colors: names + hex sampled from the brochure swatches (approximate). Never show a price or spec that is not in this file.
export const SERIES = {
  motorbike: { key: 'motorbike', label: 'Motorbike Series', line: 'Motor 600–800 W, kecepatan 40–50 km/jam, jarak tempuh ±40–50 km' },
  motorcycle: { key: 'motorcycle', label: 'Motorcycle Series', line: 'Motor 2000–3000 W, kecepatan 75–100 km/jam, jarak tempuh 65–100 km, baterai lithium 64–72V' },
};
export const MODELS = [
 {
  "id": "B1",
  "slug": "try-lite-gd005s",
  "name": "GODA Try Lite",
  "short": "Try Lite",
  "series": "motorbike",
  "category": "Motorbike Series",
  "type": "005S",
  "tagline": "Start easy, ride Lite",
  "rangeKm": 40,
  "rangeApprox": true,
  "speedKmh": 40,
  "battery": "48V 12Ah",
  "powerW": 600,
  "brake": null,
  "tyre": null,
  "features": [],
  "colors": [
   {
    "name": "Hitam",
    "hex": "#16171C"
   },
   {
    "name": "Putih",
    "hex": "#F2F2F2"
   },
   {
    "name": "Merah",
    "hex": "#D2332F"
   }
  ],
  "badge": null,
  "specs": [
   {
    "label": "Jarak tempuh",
    "value": "±40 km"
   },
   {
    "label": "Kecepatan",
    "value": "40 km/jam"
   },
   {
    "label": "Baterai",
    "value": "48V 12Ah"
   },
   {
    "label": "Motor",
    "value": "600 W"
   }
  ],
  "price": "Rp 3.899.000",
  "priceNum": 3899000,
  "priceSource": "daftar harga Moto Ijo, 31 Okt 2026",
  "img": "assets/img/models/try-lite-gd005s.webp",
  "life": "assets/img/brochure/try-lite-gd005s.webp"
 },
 {
  "id": "B2",
  "slug": "apollo-lite-118s",
  "name": "GODA Apollo Lite",
  "short": "Apollo Lite",
  "series": "motorbike",
  "category": "Motorbike Series",
  "type": "118S",
  "tagline": "Bagasi ganda, E-ABS, 3 mode tenaga",
  "rangeKm": 40,
  "rangeApprox": true,
  "speedKmh": 40,
  "battery": "48V 12Ah",
  "powerW": 600,
  "brake": null,
  "tyre": null,
  "features": [
   "Bagasi ganda",
   "E-ABS",
   "3 mode tenaga"
  ],
  "colors": [
   {
    "name": "Merah",
    "hex": "#D2332F"
   },
   {
    "name": "Hijau gelap",
    "hex": "#2A2F29"
   },
   {
    "name": "Putih",
    "hex": "#F2F2F2"
   }
  ],
  "badge": null,
  "specs": [
   {
    "label": "Jarak tempuh",
    "value": "±40 km"
   },
   {
    "label": "Kecepatan",
    "value": "40 km/jam"
   },
   {
    "label": "Baterai",
    "value": "48V 12Ah"
   },
   {
    "label": "Motor",
    "value": "600 W"
   }
  ],
  "price": "Rp 3.799.000",
  "priceNum": 3799000,
  "priceSource": "daftar harga Moto Ijo, 31 Okt 2026",
  "img": "assets/img/models/apollo-lite-118s.webp",
  "life": "assets/img/brochure/apollo-lite-118s.webp"
 },
 {
  "id": "B3",
  "slug": "sky-gd007",
  "name": "GODA Sky",
  "short": "Sky",
  "series": "motorbike",
  "category": "Motorbike Series",
  "type": "007",
  "tagline": "Sky is your family partner",
  "rangeKm": 45,
  "rangeApprox": true,
  "speedKmh": 40,
  "battery": "48V 12Ah",
  "powerW": 650,
  "brake": null,
  "tyre": null,
  "features": [],
  "colors": [
   {
    "name": "Merah muda",
    "hex": "#F4C7CE"
   },
   {
    "name": "Merah",
    "hex": "#D2332F"
   },
   {
    "name": "Hitam",
    "hex": "#16171C"
   },
   {
    "name": "Ungu muda",
    "hex": "#C9B8EE"
   },
   {
    "name": "Putih",
    "hex": "#F5F5F5"
   }
  ],
  "badge": null,
  "specs": [
   {
    "label": "Jarak tempuh",
    "value": "±45 km"
   },
   {
    "label": "Kecepatan",
    "value": "40 km/jam"
   },
   {
    "label": "Baterai",
    "value": "48V 12Ah"
   },
   {
    "label": "Motor",
    "value": "650 W"
   }
  ],
  "price": "Rp 4.299.000",
  "priceNum": 4299000,
  "priceSource": "daftar harga Moto Ijo, 31 Okt 2026",
  "img": "assets/img/models/sky-gd007.webp",
  "life": "assets/img/brochure/sky-gd007.webp"
 },
 {
  "id": "B4",
  "slug": "aura-gd008",
  "name": "GODA Aura",
  "short": "Aura",
  "series": "motorbike",
  "category": "Motorbike Series",
  "type": "008",
  "tagline": "Let your aura shine",
  "rangeKm": 45,
  "rangeApprox": true,
  "speedKmh": 40,
  "battery": "48V 12Ah",
  "powerW": 650,
  "brake": null,
  "tyre": null,
  "features": [],
  "colors": [
   {
    "name": "Oranye",
    "hex": "#F26921"
   },
   {
    "name": "Hitam",
    "hex": "#16171C"
   },
   {
    "name": "Merah muda",
    "hex": "#F6CFC8"
   },
   {
    "name": "Biru",
    "hex": "#2F5FA9"
   },
   {
    "name": "Merah",
    "hex": "#C3262D"
   }
  ],
  "badge": null,
  "specs": [
   {
    "label": "Jarak tempuh",
    "value": "±45 km"
   },
   {
    "label": "Kecepatan",
    "value": "40 km/jam"
   },
   {
    "label": "Baterai",
    "value": "48V 12Ah"
   },
   {
    "label": "Motor",
    "value": "650 W"
   }
  ],
  "price": "Rp 4.599.000",
  "priceNum": 4599000,
  "priceSource": "daftar harga Moto Ijo, 31 Okt 2026",
  "img": "assets/img/models/aura-gd008.webp",
  "life": "assets/img/brochure/aura-gd008.webp"
 },
 {
  "id": "B5",
  "slug": "obelisk-g11",
  "name": "GODA Obelisk",
  "short": "Obelisk",
  "series": "motorbike",
  "category": "Motorbike Series",
  "type": "G11",
  "tagline": "Awaken the light",
  "rangeKm": 40,
  "rangeApprox": false,
  "speedKmh": 40,
  "battery": "48V 12Ah",
  "powerW": 650,
  "brake": null,
  "tyre": null,
  "features": [],
  "colors": [
   {
    "name": "Hitam",
    "hex": "#16171C"
   },
   {
    "name": "Merah",
    "hex": "#C3262D"
   },
   {
    "name": "Oranye",
    "hex": "#F39A3C"
   },
   {
    "name": "Merah muda",
    "hex": "#D96A9F"
   },
   {
    "name": "Putih",
    "hex": "#F2F2F2"
   }
  ],
  "badge": null,
  "specs": [
   {
    "label": "Jarak tempuh",
    "value": "40 km"
   },
   {
    "label": "Kecepatan",
    "value": "40 km/jam"
   },
   {
    "label": "Baterai",
    "value": "48V 12Ah"
   },
   {
    "label": "Motor",
    "value": "650 W"
   }
  ],
  "price": null,
  "priceNum": null,
  "priceSource": null,
  "img": "assets/img/brochure/obelisk-g11.webp",
  "life": "assets/img/brochure/obelisk-g11.webp"
 },
 {
  "id": "B6",
  "slug": "garuda-002x",
  "name": "GODA Garuda X",
  "short": "Garuda X",
  "series": "motorbike",
  "category": "Motorbike Series",
  "type": "GD002X",
  "tagline": "X marks the future",
  "rangeKm": 50,
  "rangeApprox": true,
  "speedKmh": 40,
  "battery": "48V 12Ah",
  "powerW": 700,
  "brake": null,
  "tyre": null,
  "features": [],
  "colors": [
   {
    "name": "Abu-abu",
    "hex": "#C9CCD3"
   },
   {
    "name": "Biru",
    "hex": "#7C9AD6"
   },
   {
    "name": "Hitam",
    "hex": "#2A2D34"
   },
   {
    "name": "Hijau sage",
    "hex": "#8DA58D"
   }
  ],
  "badge": null,
  "specs": [
   {
    "label": "Jarak tempuh",
    "value": "±50 km"
   },
   {
    "label": "Kecepatan",
    "value": "40 km/jam"
   },
   {
    "label": "Baterai",
    "value": "48V 12Ah"
   },
   {
    "label": "Motor",
    "value": "700 W"
   }
  ],
  "price": null,
  "priceNum": null,
  "priceSource": null,
  "img": "assets/img/models/garuda-002x.webp",
  "life": "assets/img/brochure/garuda-002x.webp"
 },
 {
  "id": "B7",
  "slug": "oberon-gd10",
  "name": "GODA Oberon",
  "short": "Oberon",
  "series": "motorbike",
  "category": "Motorbike Series",
  "type": "GD10",
  "tagline": "Made for every move",
  "rangeKm": 40,
  "rangeApprox": false,
  "speedKmh": 40,
  "battery": "48V 12Ah",
  "powerW": 650,
  "brake": null,
  "tyre": null,
  "features": [],
  "colors": [
   {
    "name": "Merah muda",
    "hex": "#E9B7D4"
   },
   {
    "name": "Putih",
    "hex": "#E4E4E6"
   },
   {
    "name": "Ungu",
    "hex": "#B38FCC"
   },
   {
    "name": "Biru",
    "hex": "#8FB6DD"
   },
   {
    "name": "Hijau sage",
    "hex": "#8FA880"
   }
  ],
  "badge": null,
  "specs": [
   {
    "label": "Jarak tempuh",
    "value": "40 km"
   },
   {
    "label": "Kecepatan",
    "value": "40 km/jam"
   },
   {
    "label": "Baterai",
    "value": "48V 12Ah"
   },
   {
    "label": "Motor",
    "value": "650 W"
   }
  ],
  "price": null,
  "priceNum": null,
  "priceSource": null,
  "img": "assets/img/models/oberon-gd10.webp",
  "life": "assets/img/brochure/oberon-gd10.webp"
 },
 {
  "id": "B8",
  "slug": "lemon-gd001",
  "name": "GODA Lemon",
  "short": "Lemon",
  "series": "motorbike",
  "category": "Motorbike Series",
  "type": "001",
  "tagline": "So light, so sweet",
  "rangeKm": 45,
  "rangeApprox": true,
  "speedKmh": 40,
  "battery": "48V 12Ah",
  "powerW": 650,
  "brake": null,
  "tyre": null,
  "features": [],
  "colors": [
   {
    "name": "Krem",
    "hex": "#F4EBCC"
   },
   {
    "name": "Kuning",
    "hex": "#F4D849"
   },
   {
    "name": "Merah muda",
    "hex": "#F5C9CA"
   },
   {
    "name": "Biru",
    "hex": "#AACDEB"
   },
   {
    "name": "Mint",
    "hex": "#BFD9C0"
   }
  ],
  "badge": null,
  "specs": [
   {
    "label": "Jarak tempuh",
    "value": "±45 km"
   },
   {
    "label": "Kecepatan",
    "value": "40 km/jam"
   },
   {
    "label": "Baterai",
    "value": "48V 12Ah"
   },
   {
    "label": "Motor",
    "value": "650 W"
   }
  ],
  "price": "Rp 5.699.000",
  "priceNum": 5699000,
  "priceSource": "Klien via WhatsApp, 2 Nov 2026",
  "img": "assets/img/models/lemon-gd001.webp",
  "life": "assets/img/brochure/lemon-gd001.webp"
 },
 {
  "id": "B9",
  "slug": "sunray-g16",
  "name": "GODA Sunray",
  "short": "Sunray",
  "series": "motorbike",
  "category": "Motorbike Series",
  "type": "G16",
  "tagline": "Warna stylish, sistem cerdas",
  "rangeKm": 50,
  "rangeApprox": false,
  "speedKmh": 50,
  "battery": "48V 20Ah",
  "powerW": 800,
  "brake": null,
  "tyre": null,
  "features": [],
  "colors": [
   {
    "name": "Peach",
    "hex": "#F4C6B7"
   },
   {
    "name": "Merah marun",
    "hex": "#7F1F2B"
   },
   {
    "name": "Biru",
    "hex": "#8FD3EA"
   },
   {
    "name": "Oranye",
    "hex": "#F8B36E"
   }
  ],
  "badge": null,
  "specs": [
   {
    "label": "Jarak tempuh",
    "value": "50 km"
   },
   {
    "label": "Kecepatan",
    "value": "50 km/jam"
   },
   {
    "label": "Baterai",
    "value": "48V 20Ah"
   },
   {
    "label": "Motor",
    "value": "800 W"
   }
  ],
  "price": "Rp 6.599.000",
  "priceNum": 6599000,
  "priceSource": "daftar harga Moto Ijo, 31 Okt 2026",
  "img": "assets/img/models/sunray-g16.webp",
  "life": "assets/img/brochure/sunray-g16.webp"
 },
 {
  "id": "C1",
  "slug": "altair-g17",
  "name": "GODA Altair",
  "short": "Altair",
  "series": "motorcycle",
  "category": "Motorcycle Series",
  "type": "G17",
  "tagline": "Chase the momentum",
  "rangeKm": 65,
  "rangeApprox": false,
  "speedKmh": 75,
  "battery": "64V 30Ah",
  "powerW": 2000,
  "brake": "Cakram + tromol",
  "tyre": "Tubeless 3.00-10",
  "features": [
   "NFC Tap & Go",
   "Jok terbuka otomatis",
   "Baterai LFP"
  ],
  "colors": [
   {
    "name": "Tosca",
    "hex": "#7FE0D7"
   },
   {
    "name": "Abu-abu",
    "hex": "#A9AEB4"
   },
   {
    "name": "Krem",
    "hex": "#EEE3C5"
   }
  ],
  "badge": null,
  "specs": [
   {
    "label": "Jarak tempuh",
    "value": "65 km"
   },
   {
    "label": "Kecepatan",
    "value": "75 km/jam"
   },
   {
    "label": "Baterai",
    "value": "64V 30Ah"
   },
   {
    "label": "Motor",
    "value": "2000 W"
   }
  ],
  "price": "Rp 13.499.000",
  "priceNum": 13499000,
  "priceSource": "daftar harga Moto Ijo, 31 Okt 2026",
  "img": "assets/img/models/altair-g17.webp",
  "life": "assets/img/brochure/altair-g17.webp"
 },
 {
  "id": "C2",
  "slug": "luna-gd003",
  "name": "GODA Luna",
  "short": "Luna",
  "series": "motorcycle",
  "category": "Motorcycle Series",
  "type": "GD003",
  "tagline": "Move smart, go further",
  "rangeKm": 90,
  "rangeApprox": false,
  "speedKmh": 75,
  "battery": "64V 30Ah",
  "powerW": 2000,
  "brake": "Cakram ganda",
  "tyre": "Tubeless 90/80-12",
  "features": [
   "IoT Start",
   "One-touch start",
   "SGS & SDS",
   "Speedometer digital"
  ],
  "colors": [
   {
    "name": "Krem",
    "hex": "#E6D6C7"
   },
   {
    "name": "Perak",
    "hex": "#D6D7DB"
   },
   {
    "name": "Hijau",
    "hex": "#3F6C4F"
   },
   {
    "name": "Biru",
    "hex": "#8DC1E6"
   }
  ],
  "badge": null,
  "specs": [
   {
    "label": "Jarak tempuh",
    "value": "90 km"
   },
   {
    "label": "Kecepatan",
    "value": "75 km/jam"
   },
   {
    "label": "Baterai",
    "value": "64V 30Ah"
   },
   {
    "label": "Motor",
    "value": "2000 W"
   }
  ],
  "price": "Rp 13.999.000",
  "priceNum": 13999000,
  "priceSource": "daftar harga Moto Ijo, 31 Okt 2026",
  "img": "assets/img/models/luna-gd003.webp",
  "life": "assets/img/brochure/luna-gd003.webp"
 },
 {
  "id": "C3",
  "slug": "kingkong-gd199",
  "name": "GODA Mecha Kingkong",
  "short": "Mecha Kingkong",
  "series": "motorcycle",
  "category": "Motorcycle Series",
  "type": "GD199",
  "tagline": "Power your own style",
  "rangeKm": 100,
  "rangeApprox": false,
  "speedKmh": 85,
  "battery": "72V 23Ah",
  "powerW": 2000,
  "brake": "Cakram terhubung (linked disc)",
  "tyre": "Tubeless 120/70-10",
  "features": [
   "Tuas rem bisa diatur",
   "Rem cakram terhubung",
   "Baterai LFP"
  ],
  "colors": [
   {
    "name": "Merah muda",
    "hex": "#F4C1D4"
   },
   {
    "name": "Putih",
    "hex": "#F2F2F2"
   },
   {
    "name": "Hitam",
    "hex": "#1A1A1A"
   }
  ],
  "badge": null,
  "specs": [
   {
    "label": "Jarak tempuh",
    "value": "100 km"
   },
   {
    "label": "Kecepatan",
    "value": "85 km/jam"
   },
   {
    "label": "Baterai",
    "value": "72V 23Ah"
   },
   {
    "label": "Motor",
    "value": "2000 W"
   }
  ],
  "price": "Rp 16.999.000",
  "priceNum": 16999000,
  "priceSource": "daftar harga Moto Ijo, 31 Okt 2026",
  "img": "assets/img/models/kingkong-gd199.webp",
  "life": "assets/img/brochure/kingkong-gd199.webp"
 },
 {
  "id": "C4",
  "slug": "centurion-g18",
  "name": "GODA Centurion",
  "short": "Centurion",
  "series": "motorcycle",
  "category": "Motorcycle Series",
  "type": "G18",
  "tagline": "Enter your next level",
  "rangeKm": 100,
  "rangeApprox": false,
  "speedKmh": 100,
  "battery": "64V 40Ah",
  "powerW": 3000,
  "brake": "Cakram ganda",
  "tyre": "Tubeless 90/90-10",
  "features": [
   "NFC",
   "SSPO",
   "Boost mode",
   "Speedometer digital"
  ],
  "colors": [
   {
    "name": "Hitam",
    "hex": "#16171C"
   },
   {
    "name": "Putih",
    "hex": "#F5F5F5"
   },
   {
    "name": "Biru",
    "hex": "#3AB6E9"
   }
  ],
  "badge": null,
  "specs": [
   {
    "label": "Jarak tempuh",
    "value": "100 km"
   },
   {
    "label": "Kecepatan",
    "value": "100 km/jam"
   },
   {
    "label": "Baterai",
    "value": "64V 40Ah"
   },
   {
    "label": "Motor",
    "value": "3000 W"
   }
  ],
  "price": "Rp 17.499.000",
  "priceNum": 17499000,
  "priceSource": "daftar harga Moto Ijo, 31 Okt 2026",
  "img": "assets/img/models/centurion-g18.webp",
  "life": "assets/img/brochure/centurion-g18.webp"
 }
];
export const bySlug = s => MODELS.find(m => m.slug === s);
export const MAX = { rangeKm: 100, speedKmh: 100, powerW: 3000 };   // for spec meters
