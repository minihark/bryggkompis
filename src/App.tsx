import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InteractivePintGlass } from './components/InteractivePintGlass';
import { MetricsCards } from './components/MetricsCards';
import { BrainstormSection } from './components/BrainstormSection';
import { MaltSection } from './components/MaltSection';
import { HopSection } from './components/HopSection';
import { YeastSection } from './components/YeastSection';
import { WaterCalculator } from './components/WaterCalculator';
import { ShoppingListModal } from './components/ShoppingListModal';
import { BrewDayChecklist } from './components/BrewDayChecklist';
import { Footer } from './components/Footer';
import { Recipe, Language, BeerStyle } from './types';
import { BEER_STYLES } from './data/styles';
import { calculateBrewMetrics } from './utils/brewingMath';
import { getTranslation } from './utils/translations';
import { playCanPop, playClick } from './utils/audio';
import { Settings2, Sparkles, Sliders, Calendar, FileText, Check } from 'lucide-react';

const STORAGE_KEY_RECIPE = 'bryggkompis_recipe_v1';
const STORAGE_KEY_LANG = 'bryggkompis_lang_v1';

const INITIAL_STYLE = BEER_STYLES[0]; // West Coast IPA

const DEFAULT_RECIPE: Recipe = {
  id: 'recipe-west-coast',
  name: 'Göteborgs Västkust-IPA (Harkco & Bror)',
  styleId: INITIAL_STYLE.id,
  batchSizeL: 20,
  boilTimeMin: 60,
  efficiencyPercent: 75,
  mashTempC: INITIAL_STYLE.recommendedMashTempC,
  malts: INITIAL_STYLE.defaultMalts.map((m, i) => ({ ...m, id: `malt-${i}` })),
  hops: INITIAL_STYLE.defaultHops.map((h, i) => ({ ...h, id: `hop-${i}` })),
  yeast: INITIAL_STYLE.defaultYeast,
  extras: [{ id: 'ex-1', name: 'Protafloc', amount: '1 tablett', timeMinutes: 15, purpose: 'Klarning' }],
  notes: 'Planerad bryggdag med bror-i-lag. Ingredienser köps hos Ölkompaniet i Göteborg!',
  createdAt: new Date().toISOString(),
};

export function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved === 'en' || saved === 'sv') return saved;
    } catch (e) {}
    return 'sv';
  });

  const [recipe, setRecipe] = useState<Recipe>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECIPE);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_RECIPE;
  });

  const [isShoppingOpen, setIsShoppingOpen] = useState(false);
  const [isBrewDayOpen, setIsBrewDayOpen] = useState(false);

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECIPE, JSON.stringify(recipe));
    } catch (e) {}
  }, [recipe]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch (e) {}
  }, [lang]);

  const t = getTranslation(lang);

  // Real-time calculations
  const metrics = calculateBrewMetrics(
    recipe.batchSizeL,
    recipe.efficiencyPercent,
    recipe.malts,
    recipe.hops,
    recipe.yeast
  );

  // Handle style change
  const handleSelectStyle = (style: BeerStyle) => {
    // Scale ingredients to current batch size relative to 20L
    const scale = recipe.batchSizeL / 20;
    setRecipe({
      ...recipe,
      name: lang === 'sv' ? `${style.nameSv} (Bryggdag)` : `${style.name} (Brew Day)`,
      styleId: style.id,
      mashTempC: style.recommendedMashTempC,
      malts: style.defaultMalts.map((m, i) => ({
        ...m,
        id: `malt-${Date.now()}-${i}`,
        amountKg: Number((m.amountKg * scale).toFixed(2)),
      })),
      hops: style.defaultHops.map((h, i) => ({
        ...h,
        id: `hop-${Date.now()}-${i}`,
        amountGrams: Math.round(h.amountGrams * scale),
      })),
      yeast: style.defaultYeast,
    });
  };

  // Change Batch Size with automatic scaling
  const handleBatchSizeChange = (newSize: number) => {
    const ratio = newSize / recipe.batchSizeL;
    setRecipe({
      ...recipe,
      batchSizeL: newSize,
      malts: recipe.malts.map((m) => ({
        ...m,
        amountKg: Number((m.amountKg * ratio).toFixed(2)),
      })),
      hops: recipe.hops.map((h) => ({
        ...h,
        amountGrams: Math.round(h.amountGrams * ratio),
      })),
    });
  };

  // Export Recipe
  const handleExport = () => {
    playClick();
    const summary = [
      `🍺 ${recipe.name.toUpperCase()} 🍺`,
      `Stil: ${recipe.styleId} • Volym: ${recipe.batchSizeL} Liter • Effektivitet: ${recipe.efficiencyPercent}%`,
      `OG: ${metrics.og} • FG: ${metrics.fg} • ABV: ${metrics.abv}% • IBU: ${metrics.ibu} • EBC: ${metrics.ebc}`,
      `Mäskvatten: ${metrics.mashWaterL}L (${recipe.mashTempC}°C) • Lakvatten: ${metrics.spargeWaterL}L (78°C)`,
      '',
      '🌾 MALTNOTA:',
      ...recipe.malts.map((m) => `  - ${m.amountKg} kg ${m.name} (${m.brand})`),
      '',
      '🌿 HUMLEGIVOR:',
      ...recipe.hops.map(
        (h) => `  - ${h.amountGrams}g ${h.name} (${h.usage === 'dryhop' ? `${h.timeMinutes} dagar torrhumling` : `${h.timeMinutes} min ${h.usage}`})`
      ),
      '',
      `🧪 JÄST: ${recipe.yeast.name} (${recipe.yeast.brand})`,
      `Anteckningar: ${recipe.notes}`,
      '',
      'Planerat med Bryggkompis (Ölkompaniet.se): https://brygg.apps.harkco.se',
    ].join('\n');

    navigator.clipboard.writeText(summary);
    alert(lang === 'sv' ? 'Receptet kopierades till urklipp! Skicka det till din bror-i-lag!' : 'Recipe copied to clipboard!');
  };

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-brew-950 text-slate-100">
      {/* Top Navbar */}
      <Navbar
        lang={lang}
        onLanguageChange={setLang}
        onOpenShoppingList={() => setIsShoppingOpen(true)}
        onOpenBrewDay={() => setIsBrewDayOpen(true)}
        onExport={handleExport}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-8">
        {/* Recipe Header Card */}
        <div className="bg-brew-900/80 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
            {/* Title & Notes input */}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {recipe.styleId}
                </span>
                <span className="text-xs text-slate-400">
                  {lang === 'sv' ? 'Hembryggning med bror-i-lag' : 'Homebrew Project'}
                </span>
              </div>

              <input
                type="text"
                value={recipe.name}
                onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
                className="w-full text-xl sm:text-3xl lg:text-4xl font-black bg-transparent border-b border-transparent hover:border-slate-700 focus:border-amber-500 text-white focus:outline-none transition py-1"
                placeholder={lang === 'sv' ? 'Namnge ert öl...' : 'Name your beer...'}
              />

              <input
                type="text"
                value={recipe.notes}
                onChange={(e) => setRecipe({ ...recipe, notes: e.target.value })}
                className="w-full text-xs sm:text-sm text-slate-400 bg-transparent border-b border-transparent hover:border-slate-800 focus:border-amber-500 focus:outline-none transition"
                placeholder={lang === 'sv' ? 'Anteckningar inför bryggdagen...' : 'Brew day notes...'}
              />
            </div>

            {/* Quick Batch Controls: Batch Size, Efficiency, Mash Temp */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-brew-950/80 border border-slate-800/80 rounded-2xl p-3 sm:p-4 w-full lg:w-auto">
              {/* Batch Size Pills */}
              <div className="w-full sm:w-auto">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  {t.batchSize}
                </span>
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0">
                  {[10, 20, 25, 30, 50].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleBatchSizeChange(size)}
                      className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg text-xs font-bold transition text-center ${
                        recipe.batchSizeL === size
                          ? 'bg-amber-500 text-stone-950 shadow-sm'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {size}L
                    </button>
                  ))}
                </div>
              </div>

              {/* Mash Temp & Efficiency */}
              <div className="flex items-center gap-3 w-full sm:w-auto sm:border-l sm:border-slate-800 sm:pl-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                {/* Mash Temp */}
                <div className="flex-1 sm:flex-initial">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    {t.mashTemp}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="62"
                      max="72"
                      step="0.5"
                      value={recipe.mashTempC}
                      onChange={(e) =>
                        setRecipe({ ...recipe, mashTempC: parseFloat(e.target.value) || 66 })
                      }
                      className="w-full sm:w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono text-xs font-bold text-white focus:outline-none"
                    />
                    <span className="text-xs text-slate-400">°C</span>
                  </div>
                </div>

                {/* Efficiency */}
                <div className="flex-1 sm:flex-initial border-l border-slate-800 pl-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    {t.efficiency}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="60"
                      max="90"
                      step="1"
                      value={recipe.efficiencyPercent}
                      onChange={(e) =>
                        setRecipe({ ...recipe, efficiencyPercent: parseInt(e.target.value, 10) || 75 })
                      }
                      className="w-full sm:w-14 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono text-xs font-bold text-white focus:outline-none"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Gauges & Interactive Pint Glass Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Pint Glass on the left */}
          <div className="lg:col-span-1 bg-brew-900/60 border border-slate-800 rounded-3xl p-4 flex items-center justify-center shadow-xl">
            <InteractivePintGlass
              colorHex={metrics.colorHex}
              ebc={metrics.ebc}
              abv={metrics.abv}
              ibu={metrics.ibu}
            />
          </div>

          {/* Metrics Gauges on the right */}
          <div className="lg:col-span-3">
            <MetricsCards metrics={metrics} styleId={recipe.styleId} lang={lang} />
          </div>
        </div>

        {/* Brainstorming & Style Studio */}
        <BrainstormSection
          currentStyleId={recipe.styleId}
          onSelectStyle={handleSelectStyle}
          lang={lang}
        />

        {/* Malt Formulation Section */}
        <MaltSection
          malts={recipe.malts}
          onChange={(malts) => setRecipe({ ...recipe, malts })}
          lang={lang}
        />

        {/* Hop Schedule Formulation Section */}
        <HopSection
          hops={recipe.hops}
          onChange={(hops) => setRecipe({ ...recipe, hops })}
          lang={lang}
        />

        {/* Yeast Formulation Section */}
        <YeastSection
          yeast={recipe.yeast}
          onChange={(yeast) => setRecipe({ ...recipe, yeast })}
          lang={lang}
        />

        {/* Water Volumes Calculator */}
        <WaterCalculator
          metrics={metrics}
          batchSizeL={recipe.batchSizeL}
          mashTempC={recipe.mashTempC}
          lang={lang}
        />
      </main>

      {/* Modals */}
      <ShoppingListModal
        isOpen={isShoppingOpen}
        onClose={() => setIsShoppingOpen(false)}
        recipe={recipe}
        metrics={metrics}
        lang={lang}
      />

      <BrewDayChecklist
        isOpen={isBrewDayOpen}
        onClose={() => setIsBrewDayOpen(false)}
        recipe={recipe}
        metrics={metrics}
        lang={lang}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
