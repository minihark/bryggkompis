export type Language = 'sv' | 'en';

export interface MaltItem {
  id: string;
  name: string;
  brand: string; // e.g. Weyermann, Crisp, Castle Malting
  amountKg: number;
  ebc: number; // Color rating
  potential: number; // Extract potential e.g. 1.037 (37 pts)
  type: 'base' | 'caramel' | 'roasted' | 'adjunct';
  notes?: string;
}

export type HopUsage = 'boil' | 'whirlpool' | 'dryhop';

export interface HopItem {
  id: string;
  name: string;
  amountGrams: number;
  alphaAcid: number; // e.g. 13.5%
  timeMinutes: number; // 60, 15, 5, 0 (whirlpool), or days for dry hop
  usage: HopUsage;
  aromaTags: string[]; // e.g. ['Citrus', 'Grapefruit', 'Pine']
}

export interface YeastItem {
  id: string;
  name: string;
  brand: string; // Fermentis, Lallemand
  attenuationPercent: number; // e.g. 78%
  tempMinC: number;
  tempMaxC: number;
  form: 'dry' | 'liquid';
  flavorNotes: string;
}

export interface ExtraItem {
  id: string;
  name: string;
  amount: string; // e.g. "1 tablett", "100 g"
  timeMinutes?: number;
  purpose: string;
}

export interface BeerStyle {
  id: string;
  name: string;
  nameSv: string;
  tagline: string;
  taglineSv: string;
  description: string;
  descriptionSv: string;
  targetOg: [number, number];
  targetFg: [number, number];
  targetAbv: [number, number];
  targetIbu: [number, number];
  targetEbc: [number, number];
  recommendedMashTempC: number;
  flavorVibes: string[];
  defaultMalts: Omit<MaltItem, 'id'>[];
  defaultHops: Omit<HopItem, 'id'>[];
  defaultYeast: YeastItem;
}

export interface Recipe {
  id: string;
  name: string;
  styleId: string;
  batchSizeL: number;
  boilTimeMin: number;
  efficiencyPercent: number;
  mashTempC: number;
  malts: MaltItem[];
  hops: HopItem[];
  yeast: YeastItem;
  extras: ExtraItem[];
  notes: string;
  createdAt: string;
}

export interface BrewCalculations {
  og: number;
  fg: number;
  abv: number;
  ibu: number;
  ebc: number;
  srm: number;
  colorHex: string;
  totalGrainKg: number;
  totalHopsG: number;
  mashWaterL: number;
  spargeWaterL: number;
  totalWaterL: number;
  estimatedCostSek: number;
}
