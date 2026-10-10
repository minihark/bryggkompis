import { MaltItem, HopItem, YeastItem } from '../types';

export interface CatalogMalt {
  name: string;
  brand: string;
  ebc: number;
  potential: number;
  type: 'base' | 'caramel' | 'roasted' | 'adjunct';
  pricePerKgSek: number;
  description: string;
  searchQuery: string;
}

export interface CatalogHop {
  name: string;
  alphaAcid: number;
  aromaTags: string[];
  pricePer100gSek: number;
  description: string;
  searchQuery: string;
}

export interface CatalogYeast {
  name: string;
  brand: string;
  attenuationPercent: number;
  tempMinC: number;
  tempMaxC: number;
  form: 'dry' | 'liquid';
  priceSek: number;
  flavorNotes: string;
  searchQuery: string;
}

export const CATALOG_MALTS: CatalogMalt[] = [
  // Base Malts
  {
    name: 'Pilsnermalt',
    brand: 'Weyermann',
    ebc: 3.5,
    potential: 1.037,
    type: 'base',
    pricePerKgSek: 29,
    description: 'Klassisk tysk basmalt för krispiga lager, pilsner och ljusa ales.',
    searchQuery: 'Weyermann Pilsnermalt',
  },
  {
    name: 'Barke Pilsnermalt',
    brand: 'Weyermann',
    ebc: 3.5,
    potential: 1.038,
    type: 'base',
    pricePerKgSek: 34,
    description: 'Kulturkorn med fyllig maltkropp och exceptionell skumstabilitet.',
    searchQuery: 'Barke Pilsner Weyermann',
  },
  {
    name: 'Pale Ale Malt',
    brand: 'Weyermann',
    ebc: 6.5,
    potential: 1.037,
    type: 'base',
    pricePerKgSek: 29,
    description: 'Gyllene basmalt perfekt för IPA, APA och brittiska ales.',
    searchQuery: 'Weyermann Pale Ale',
  },
  {
    name: 'Maris Otter Pale Ale',
    brand: 'Crisp',
    ebc: 6.0,
    potential: 1.038,
    type: 'base',
    pricePerKgSek: 36,
    description: 'Legendarisk brittisk malt med rik nötig kexton. Bryggarens favorit!',
    searchQuery: 'Crisp Maris Otter',
  },
  {
    name: 'Extra Pale Maris Otter',
    brand: 'Crisp',
    ebc: 3.5,
    potential: 1.038,
    type: 'base',
    pricePerKgSek: 38,
    description: 'Mycket ljus Maris Otter, optimal för moderna ljusa NEIPAs.',
    searchQuery: 'Extra Pale Maris Otter',
  },
  {
    name: 'Wienermalt (Vienna)',
    brand: 'Weyermann',
    ebc: 8.0,
    potential: 1.036,
    type: 'base',
    pricePerKgSek: 31,
    description: 'Ger bärnstensfärg och mjuk brödig maltighet.',
    searchQuery: 'Weyermann Wienermalt',
  },
  {
    name: 'Münchenermalt Typ 1 (Munich)',
    brand: 'Weyermann',
    ebc: 16.0,
    potential: 1.036,
    type: 'base',
    pricePerKgSek: 31,
    description: 'Ger djup maltighet, arom av nybakat bröd och kopparfärg.',
    searchQuery: 'Weyermann Münchenermalt',
  },
  {
    name: 'Vetemalt Ljus (Wheat)',
    brand: 'Weyermann',
    ebc: 4.5,
    potential: 1.038,
    type: 'base',
    pricePerKgSek: 30,
    description: 'Högt proteininnehåll, ger disighet och fylligt skum i NEIPA/veteöl.',
    searchQuery: 'Weyermann Vetemalt',
  },

  // Adjuncts & Flaked
  {
    name: 'Havregryn (Flaked Torrefied Oats)',
    brand: 'Crisp',
    ebc: 3.0,
    potential: 1.033,
    type: 'adjunct',
    pricePerKgSek: 35,
    description: 'Oumbärlig för sammetslen munkänsla i disiga New England IPAs och Stouts.',
    searchQuery: 'Flaked Oats havregryn',
  },
  {
    name: 'Torrefied Wheat (Puffat vete)',
    brand: 'Crisp',
    ebc: 4.0,
    potential: 1.035,
    type: 'adjunct',
    pricePerKgSek: 32,
    description: 'Ökar skumkronans stabilitet och ger lätt kornig ton.',
    searchQuery: 'Torrefied Wheat',
  },

  // Caramel & Specialty Malts
  {
    name: 'Carapils / Carafoam',
    brand: 'Weyermann',
    ebc: 4.0,
    potential: 1.034,
    type: 'caramel',
    pricePerKgSek: 33,
    description: 'Dextrinmalt som bygger kropp och skum utan att ge färg eller sötma.',
    searchQuery: 'Weyermann Carapils',
  },
  {
    name: 'Château Biscuit',
    brand: 'Castle Malting',
    ebc: 50.0,
    potential: 1.033,
    type: 'caramel',
    pricePerKgSek: 35,
    description: 'Belgisk specialmalt med varm rostad kexarom och varm guldton.',
    searchQuery: 'Chateau Biscuit',
  },
  {
    name: 'Caramunich Typ 2',
    brand: 'Weyermann',
    ebc: 120.0,
    potential: 1.034,
    type: 'caramel',
    pricePerKgSek: 34,
    description: 'Karamellmalt med toner av torkad frukt, knäck och djup bärnsten.',
    searchQuery: 'Weyermann Caramunich',
  },
  {
    name: 'Special B',
    brand: 'Castle Malting',
    ebc: 300.0,
    potential: 1.032,
    type: 'caramel',
    pricePerKgSek: 36,
    description: 'Klassiker i mörka belgare. Russin, dadlar, plommon och mörk sirap.',
    searchQuery: 'Special B Castle',
  },
  {
    name: 'Carafa Special Typ 3 (Avskalad)',
    brand: 'Weyermann',
    ebc: 1400.0,
    potential: 1.030,
    type: 'roasted',
    pricePerKgSek: 39,
    description: 'Avskalad mörkrostad malt. Ger kolsvart färg utan hård strävhet.',
    searchQuery: 'Carafa Special 3',
  },
  {
    name: 'Roasted Barley (Rostat korn)',
    brand: 'Crisp',
    ebc: 1300.0,
    potential: 1.028,
    type: 'roasted',
    pricePerKgSek: 36,
    description: 'Oskalad och hårt rostat korn. Den karakteristiska kaffe/kakao-tonen i Irish Stout.',
    searchQuery: 'Crisp Roasted Barley',
  },
  {
    name: 'Chokladmalt (Chocolate Malt)',
    brand: 'Crisp',
    ebc: 1000.0,
    potential: 1.030,
    type: 'roasted',
    pricePerKgSek: 36,
    description: 'Djup mörk choklad, espressotoner och fyllig brunsvart färg.',
    searchQuery: 'Crisp Chocolate Malt',
  },
];

export const CATALOG_HOPS: CatalogHop[] = [
  {
    name: 'Citra',
    alphaAcid: 13.5,
    aromaTags: ['Citrus', 'Grapefrukt', 'Passionsfrukt', 'Lime'],
    pricePer100gSek: 89,
    description: 'Världens mest populära humle för IPA. Intensiv fräsch citrus & tropisk frukt.',
    searchQuery: 'Citra humle pellets 100g',
  },
  {
    name: 'Mosaic',
    alphaAcid: 12.0,
    aromaTags: ['Blåbär', 'Mango', 'Tallbarr', 'Tropisk'],
    pricePer100gSek: 89,
    description: 'Komplex och mångfacetterad. Aromer av solmogna blåbär, persika och lätt kåda.',
    searchQuery: 'Mosaic humle pellets 100g',
  },
  {
    name: 'Simcoe',
    alphaAcid: 13.0,
    aromaTags: ['Kåda', 'Tallbarr', 'Passionsfrukt', 'Aprikos'],
    pricePer100gSek: 85,
    description: 'Klassiker i västkust-IPA. Underbar kombination av frisk tallbarr och stenfrukt.',
    searchQuery: 'Simcoe humle pellets 100g',
  },
  {
    name: 'Amarillo',
    alphaAcid: 9.0,
    aromaTags: ['Apelsin', 'Blommig', 'Persika'],
    pricePer100gSek: 82,
    description: 'Söt solvarm apelsin, citrusblomma och mild grape.',
    searchQuery: 'Amarillo humle pellets 100g',
  },
  {
    name: 'Cascade',
    alphaAcid: 6.8,
    aromaTags: ['Grapefrukt', 'Blommig', 'Kryddig'],
    pricePer100gSek: 69,
    description: 'Originalet som startade craft beer-revolutionen. Krispig grape och blommor.',
    searchQuery: 'Cascade humle pellets 100g',
  },
  {
    name: 'Centennial',
    alphaAcid: 10.0,
    aromaTags: ['Super-Cascade', 'Citron', 'Blommig'],
    pricePer100gSek: 75,
    description: 'Kallad "Super-Cascade". Ren, krispig citronkaraktär med fin beska.',
    searchQuery: 'Centennial humle pellets 100g',
  },
  {
    name: 'Galaxy',
    alphaAcid: 15.0,
    aromaTags: ['Passionsfrukt', 'Persika', 'Guava'],
    pricePer100gSek: 119,
    description: 'Australisk superstjärna med explosiv tropisk fruktighet för hazy ales.',
    searchQuery: 'Galaxy humle pellets 100g',
  },
  {
    name: 'Nelson Sauvin',
    alphaAcid: 12.5,
    aromaTags: ['Sauvignon Blanc', 'Krusbär', 'Vitt vin'],
    pricePer100gSek: 115,
    description: 'Unik Nya Zeeland-humle med distinkta toner av vitt vin och krusbär.',
    searchQuery: 'Nelson Sauvin humle pellets 100g',
  },
  {
    name: 'Saaz',
    alphaAcid: 3.5,
    aromaTags: ['Örtig', 'Kryddig', 'Ädelhumle'],
    pricePer100gSek: 69,
    description: 'Tjeckisk ädelhumle. Grunden i äkta pilsner med mjuk örtighet och kryddighet.',
    searchQuery: 'Saaz humle pellets 100g',
  },
  {
    name: 'Hallertau Mittelfrüh',
    alphaAcid: 4.0,
    aromaTags: ['Blommig', 'Örtig', 'Mild'],
    pricePer100gSek: 69,
    description: 'Tysk klassiker för lager, veteöl och traditionella ales.',
    searchQuery: 'Hallertau Mittelfruh humle 100g',
  },
  {
    name: 'Magnum',
    alphaAcid: 14.5,
    aromaTags: ['Ren beska', 'Neutral'],
    pricePer100gSek: 65,
    description: 'Den ultimata bitterhumlen. Ger ren och mjuk beska utan att dominera aromen.',
    searchQuery: 'Magnum humle pellets 100g',
  },
  {
    name: 'Columbus (CTZ)',
    alphaAcid: 15.5,
    aromaTags: ['Dank', 'Harts', 'Svartpeppar', 'Citrus'],
    pricePer100gSek: 79,
    description: 'Pungent och kådrik. Utmärkt för både kraftig bittergiva och dank arom.',
    searchQuery: 'Columbus humle pellets 100g',
  },
  {
    name: 'Idaho 7',
    alphaAcid: 13.0,
    aromaTags: ['Marmelad', 'Tangerine', 'Rött te', 'Kåda'],
    pricePer100gSek: 89,
    description: 'Populär i moderna hazy IPAs. Aromer av zesty apelsinmarmelad och tall.',
    searchQuery: 'Idaho 7 humle pellets 100g',
  },
  {
    name: 'Sabro',
    alphaAcid: 14.0,
    aromaTags: ['Kokosnöt', 'Ananas', 'Krämig cederträ'],
    pricePer100gSek: 95,
    description: 'Ovanlig och spännande arom med toner av kokos och tropisk fruktjuice.',
    searchQuery: 'Sabro humle pellets 100g',
  },
];

export const CATALOG_YEASTS: CatalogYeast[] = [
  {
    name: 'SafAle US-05',
    brand: 'Fermentis',
    attenuationPercent: 81,
    tempMinC: 18,
    tempMaxC: 28,
    form: 'dry',
    priceSek: 45,
    flavorNotes: 'Världens mest använda alejäst. Extremt ren profil som låter malten och humlen glänsa.',
    searchQuery: 'SafAle US-05 torrjast',
  },
  {
    name: 'SafAle S-04',
    brand: 'Fermentis',
    attenuationPercent: 75,
    tempMinC: 15,
    tempMaxC: 24,
    form: 'dry',
    priceSek: 45,
    flavorNotes: 'Engelsk alejäst. Mycket snabb flockning (klarnar fort) och mild fruktig esterprofil.',
    searchQuery: 'SafAle S-04 torrjast',
  },
  {
    name: 'SafLager W-34/70',
    brand: 'Fermentis',
    attenuationPercent: 83,
    tempMinC: 9,
    tempMaxC: 15,
    form: 'dry',
    priceSek: 59,
    flavorNotes: 'Klassisk Weihenstephan-stam för krispig tysk pilsner och lager. Mycket ren smak.',
    searchQuery: 'SafLager W-34/70 torrjast',
  },
  {
    name: 'LalBrew Verdant IPA',
    brand: 'Lallemand',
    attenuationPercent: 77,
    tempMinC: 18,
    tempMaxC: 23,
    form: 'dry',
    priceSek: 62,
    flavorNotes: 'Framtagen med Verdant Brewing Co. Toner av aprikos och persika, optimal för NEIPA.',
    searchQuery: 'LalBrew Verdant IPA',
  },
  {
    name: 'LalBrew Voss Kveik',
    brand: 'Lallemand',
    attenuationPercent: 78,
    tempMinC: 25,
    tempMaxC: 40,
    form: 'dry',
    priceSek: 65,
    flavorNotes: 'Norsk gårdskveik. Jäser klart på 2-4 dagar vid 35-40°C med frisk apelsinton. Perfekt utan kylskåp!',
    searchQuery: 'LalBrew Voss Kveik',
  },
  {
    name: 'LalBrew Nottingham',
    brand: 'Lallemand',
    attenuationPercent: 80,
    tempMinC: 10,
    tempMaxC: 22,
    form: 'dry',
    priceSek: 55,
    flavorNotes: 'Mångsidig, pålitlig och snabbjäst. Klarar svalare temperaturer och ger krispiga ales.',
    searchQuery: 'LalBrew Nottingham',
  },
  {
    name: 'SafAle BE-134 (Saison)',
    brand: 'Fermentis',
    attenuationPercent: 90,
    tempMinC: 18,
    tempMaxC: 28,
    form: 'dry',
    priceSek: 49,
    flavorNotes: 'Belgisk saisonjäst med hög utjäsning (torr finish) och kryddiga/peppriga estrar.',
    searchQuery: 'SafAle BE-134 torrjast',
  },
  {
    name: 'SafAle BE-256 (Abbaye)',
    brand: 'Fermentis',
    attenuationPercent: 82,
    tempMinC: 15,
    tempMaxC: 25,
    form: 'dry',
    priceSek: 49,
    flavorNotes: 'Klosteraler, dubbel och tripel. Rika fruktiga estrar och kryddighet.',
    searchQuery: 'SafAle BE-256 torrjast',
  },
  {
    name: 'SafAle WB-06 (Weizen)',
    brand: 'Fermentis',
    attenuationPercent: 86,
    tempMinC: 18,
    tempMaxC: 24,
    form: 'dry',
    priceSek: 45,
    flavorNotes: 'Klassisk veteölsjäst som producerar aromer av banan och kryddnejlika.',
    searchQuery: 'SafAle WB-06 torrjast',
  },
  {
    name: 'LalBrew Philly Sour',
    brand: 'Lallemand',
    attenuationPercent: 75,
    tempMinC: 20,
    tempMaxC: 25,
    form: 'dry',
    priceSek: 79,
    flavorNotes: 'Producerar mjölksyra direkt under primärjäsningen! Enkelt att göra suröl utan kettle souring.',
    searchQuery: 'LalBrew Philly Sour',
  },
];
