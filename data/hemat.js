// Moto Ijo: assumptions for the "hemat vs motor bensin" calculator (home, reusable on inner pages).
// Source of truth: docs/facts-hemat.md section 8 (agent FACTS-2, 22 Okt 2026). Change numbers there first.
// The page never shows sources or dates; the "Cara hitung" disclosure explains the assumptions in words.
export const HEMAT = {
  sourced: true,
  daysPerMonth: 26,          // riding days per month (facts-hemat.md example)
  listrik: {
    rpPerKwh: 1444.70,       // PLN R-1 1300 VA, per kWh
    kwhPerKm: 0.0282,        // M1 Laser: 1,2 kWh battery / 50 km / 85% charger efficiency
    label: 'GODA M1 Laser',
  },
  bensin: {
    rpPerLiter: 10000,       // Pertalite per litre
    kmPerLiter: 50,          // 110 cc automatic scooter
    label: 'motor matic 110 cc',
  },
  kmChips: [10, 20, 30, 50],
  kmDefault: 30,
  kmMin: 5,
  kmMax: 100,
};

// One month of riding at `km` per day: cost of each, and the saving.
export function hitungHemat(km, h = HEMAT) {
  const perBulan = km * h.daysPerMonth;
  const bensin = perBulan / h.bensin.kmPerLiter * h.bensin.rpPerLiter;
  const listrik = perBulan * h.listrik.kwhPerKm * h.listrik.rpPerKwh;
  return { km, perBulan, bensin, listrik, hematBulan: bensin - listrik, hematTahun: (bensin - listrik) * 12 };
}
