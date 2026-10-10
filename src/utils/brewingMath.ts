import { MaltItem, HopItem, YeastItem, BrewCalculations } from '../types';
import { CATALOG_MALTS, CATALOG_HOPS } from '../data/ingredients';

export function calculateBrewMetrics(
  batchSizeL: number,
  efficiencyPercent: number,
  malts: MaltItem[],
  hops: HopItem[],
  yeast: YeastItem
): BrewCalculations {
  const volumeGallons = Math.max(0.5, batchSizeL * 0.264172);
  const efficiencyFactor = efficiencyPercent / 100;

  // 1. OG (Original Gravity)
  let totalExtractPoints = 0;
  let totalGrainKg = 0;
  let totalMcu = 0;

  malts.forEach((m) => {
    totalGrainKg += m.amountKg;
    const weightLbs = m.amountKg * 2.20462;
    // potential pts e.g. 1.037 -> 37 pts
    const ppg = (m.potential - 1.0) * 1000;
    totalExtractPoints += weightLbs * ppg * efficiencyFactor;

    // Morey equation for Color
    const lovibond = (m.ebc * 0.375) + 0.46;
    totalMcu += (weightLbs * lovibond) / volumeGallons;
  });

  const ppgBatch = totalExtractPoints / volumeGallons;
  const og = 1.0 + ppgBatch / 1000;

  // 2. FG (Final Gravity) from Yeast Attenuation
  const yeastAtt = yeast.attenuationPercent / 100;
  const gravityPoints = (og - 1.0) * 1000;
  const remainingPoints = gravityPoints * (1.0 - yeastAtt);
  const fg = 1.0 + remainingPoints / 1000;

  // 3. ABV %
  const abv = Math.max(0, (og - fg) * 131.25);

  // 4. Color (Morey Equation)
  let srm = 0;
  if (totalMcu > 0) {
    srm = 1.4922 * Math.pow(totalMcu, 0.6859);
  }
  const ebc = srm * 1.97;
  const colorHex = srmToHexColor(srm);

  // 5. IBU (Glenn Tinseth Formula)
  let totalIbu = 0;
  let totalHopsG = 0;

  const bignessFactor = 1.65 * Math.pow(0.000125, og - 1.0);

  hops.forEach((h) => {
    totalHopsG += h.amountGrams;
    if (h.usage === 'dryhop') return;

    let time = h.timeMinutes;
    let utilization = 0;

    if (h.usage === 'whirlpool') {
      // Whirlpool at 80C gives approx 8-10% of 15-min boil utilization
      const timeFactor = (1 - Math.exp(-0.04 * 15)) / 4.15;
      utilization = bignessFactor * timeFactor * 0.12;
    } else {
      // Standard boil
      const timeFactor = (1 - Math.exp(-0.04 * time)) / 4.15;
      utilization = bignessFactor * timeFactor;
    }

    // Glenn Tinseth: IBU = (Grams * (Alpha% / 100) * Utilization * 1000) / Liters
    const hopIbu = (h.amountGrams * (h.alphaAcid / 100) * utilization * 1000) / batchSizeL;
    totalIbu += hopIbu;
  });

  // 6. Water Calculator
  const mashRatioLPerKg = 2.8;
  const grainAbsorptionLPerKg = 0.95;
  const boilLossL = 3.0;
  const kettleDeadSpaceL = 1.5;

  const mashWaterL = totalGrainKg * mashRatioLPerKg;
  const totalWaterNeeded = batchSizeL + (totalGrainKg * grainAbsorptionLPerKg) + boilLossL + kettleDeadSpaceL;
  const spargeWaterL = Math.max(0, totalWaterNeeded - mashWaterL);

  // 7. Cost Estimate (SEK)
  let estimatedCostSek = 0;
  malts.forEach((m) => {
    const catalogItem = CATALOG_MALTS.find((c) => c.name.toLowerCase().includes(m.name.toLowerCase()));
    const pricePerKg = catalogItem ? catalogItem.pricePerKgSek : 32;
    estimatedCostSek += Math.ceil(m.amountKg) * pricePerKg;
  });

  hops.forEach((h) => {
    const catalogItem = CATALOG_HOPS.find((c) => c.name.toLowerCase().includes(h.name.toLowerCase()));
    const pricePer100g = catalogItem ? catalogItem.pricePer100gSek : 85;
    const bags = Math.ceil(h.amountGrams / 100);
    estimatedCostSek += Math.max(1, bags) * pricePer100g;
  });

  // Yeast cost
  estimatedCostSek += 55; // average yeast sachet

  return {
    og: Number(og.toFixed(3)),
    fg: Number(fg.toFixed(3)),
    abv: Number(abv.toFixed(1)),
    ibu: Math.round(totalIbu),
    ebc: Math.round(ebc),
    srm: Number(srm.toFixed(1)),
    colorHex,
    totalGrainKg: Number(totalGrainKg.toFixed(2)),
    totalHopsG,
    mashWaterL: Number(mashWaterL.toFixed(1)),
    spargeWaterL: Number(spargeWaterL.toFixed(1)),
    totalWaterL: Number(totalWaterNeeded.toFixed(1)),
    estimatedCostSek: Math.round(estimatedCostSek),
  };
}

export function srmToHexColor(srm: number): string {
  // SRM color lookup palette
  const colors: [number, string][] = [
    [1, '#F8F753'],
    [2, '#F6F513'],
    [3, '#ECE61A'],
    [4, '#D5BC26'],
    [5, '#BF923B'],
    [6, '#BF813B'],
    [7, '#BC673B'],
    [8, '#8D4C32'],
    [9, '#5D341A'],
    [10, '#261716'],
    [12, '#8D4513'],
    [15, '#682D06'],
    [18, '#521D00'],
    [22, '#3E1000'],
    [26, '#2E0600'],
    [30, '#1E0000'],
    [35, '#120000'],
    [40, '#090000'],
  ];

  if (srm <= 1) return '#F8F753';
  if (srm >= 40) return '#090000';

  for (let i = 0; i < colors.length - 1; i++) {
    if (srm >= colors[i][0] && srm <= colors[i + 1][0]) {
      return colors[i + 1][1];
    }
  }

  return '#F59E0B';
}
