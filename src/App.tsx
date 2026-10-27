import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { MaltSection } from './components/MaltSection';
import { HopSection } from './components/HopSection';
import { YeastSection } from './components/YeastSection';
import { WaterCalculator } from './components/WaterCalculator';
import { ShoppingListModal } from './components/ShoppingListModal';
import { BrewDayChecklist } from './components/BrewDayChecklist';
import { RecipePickerModal } from './components/RecipePickerModal';
import { CheersOverlay } from './components/CheersOverlay';
import { CoopModal } from './components/CoopModal';
import { Footer } from './components/Footer';
import { Recipe, Language, BeerStyle } from './types';
import { BEER_STYLES } from './data/styles';
import { calculateBrewMetrics } from './utils/brewingMath';
import { playClick } from './utils/audio';
import { coop, CheersEvent, PeerInfo } from './utils/coop';
import {
  Flame,
  Printer,
  Share2,
  ChevronDown,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

const STORAGE_KEY_RECIPE = 'bryggkompis_recipe_v1';
const STORAGE_KEY_LANG = 'bryggkompis_lang_v1';
const STORAGE_KEY_STEPS = 'bryggkompis_steps_v1';

const INITIAL_STYLE = BEER_STYLES[0];

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
  notes: 'Planerad hembryggning med bror-i-lag. Ingredienser från Ölkompaniet i Göteborg!',
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

  // Primary 2-mode focus: Recipe Sheet vs Brew Day Timer
  const [activeMode, setActiveMode] = useState<'recipe' | 'brewday'>('recipe');

  // Quiet Drawers / Modals
  const [isRecipePickerOpen, setIsRecipePickerOpen] = useState(false);
  const [isCoopModalOpen, setIsCoopModalOpen] = useState(false);
  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false);

  // Completed steps on brew day
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STEPS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // Co-op & Real-time state
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastCheers, setLastCheers] = useState<CheersEvent | null>(null);
  const isReceivingRecipeSync = useRef(false);

  useEffect(() => {
    const unsubCheers = coop.onCheers((cheers) => setLastCheers(cheers));
    const unsubPeers = coop.onPeers((peersList) => setPeers(peersList));
    const unsubStatus = coop.onStatus((connected) => setIsConnected(connected));
    const unsubRecipe = coop.onRecipe((incomingRecipe) => {
      isReceivingRecipeSync.current = true;
      setRecipe(incomingRecipe);
      setTimeout(() => {
        isReceivingRecipeSync.current = false;
      }, 500);
    });
    const unsubStep = coop.onStep((stepId, completed) => {
      setCompletedSteps((prev) => {
        const next = { ...prev, [stepId]: completed };
        try {
          localStorage.setItem(STORAGE_KEY_STEPS, JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    });

    setIsConnected(coop.isConnected);
    setPeers(coop.peers);

    return () => {
      unsubCheers();
      unsubPeers();
      unsubStatus();
      unsubRecipe();
      unsubStep();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECIPE, JSON.stringify(recipe));
    } catch (e) {}

    if (!isReceivingRecipeSync.current) {
      coop.broadcastRecipe(recipe);
    }
  }, [recipe]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch (e) {}
  }, [lang]);

  const metrics = calculateBrewMetrics(
    recipe.batchSizeL,
    recipe.efficiencyPercent,
    recipe.malts,
    recipe.hops,
    recipe.yeast
  );

  const currentStyle = BEER_STYLES.find((s) => s.id === recipe.styleId) || BEER_STYLES[0];
  const completedStepsCount = Object.values(completedSteps).filter(Boolean).length;

  const handleTriggerCheers = (msg?: string) => {
    coop.sendCheers(msg);
  };

  const handleSelectStyle = (style: BeerStyle) => {
    const scale = recipe.batchSizeL / 20;
    setRecipe({
      ...recipe,
      name: lang === 'sv' ? `${style.nameSv} (Brygglogg)` : `${style.name} (Brew Log)`,
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

  const handleBatchSizeChange = (newSize: number) => {
    playClick();
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

  const handleStepToggle = (stepId: string, completed: boolean) => {
    setCompletedSteps((prev) => {
      const next = { ...prev, [stepId]: completed };
      try {
        localStorage.setItem(STORAGE_KEY_STEPS, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    coop.broadcastStepToggle(stepId, completed);
  };

  const handleExport = () => {
    playClick();
    const summary = [
      `🍺 ${recipe.name.toUpperCase()} 🍺`,
      `Stil: ${recipe.styleId} • Volym: ${recipe.batchSizeL} L • Effektivitet: ${recipe.efficiencyPercent}%`,
      `OG: ${metrics.og} • FG: ${metrics.fg} • ABV: ${metrics.abv}% • IBU: ${metrics.ibu} • EBC: ${metrics.ebc}`,
      `Mäskvatten: ${metrics.mashWaterL}L (${recipe.mashTempC}°C) • Lakvatten: ${metrics.spargeWaterL}L (77°C)`,
      '',
      'MALTNOTA:',
      ...recipe.malts.map((m) => `  - ${m.amountKg} kg ${m.name} (${m.brand})`),
      '',
      'HUMLESCHEMA:',
      ...recipe.hops.map(
        (h) => `  - ${h.amountGrams}g ${h.name} (${h.usage === 'dryhop' ? `${h.timeMinutes} d torrhumling` : `${h.timeMinutes} min ${h.usage}`})`
      ),
      '',
      `JÄST: ${recipe.yeast.name} (${recipe.yeast.brand})`,
      `Anteckningar: ${recipe.notes}`,
      `Co-op länk: ${coop.getShareUrl()}`,
    ].join('\n');

    navigator.clipboard.writeText(summary);
    alert(lang === 'sv' ? 'Receptbladet kopierades till urklipp!' : 'Recipe sheet copied to clipboard!');
  };

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-[#F7F3EB] text-[#1E1610]">
      {/* Warm Craft Brewery Top Bar */}
      <Navbar
        lang={lang}
        onLanguageChange={setLang}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        completedStepsCount={completedStepsCount}
        onOpenShoppingList={() => setIsShoppingModalOpen(true)}
        onOpenRecipePicker={() => setIsRecipePickerOpen(true)}
        onOpenCoop={() => setIsCoopModalOpen(true)}
        peersCount={peers.length}
        currentRoom={coop.roomId}
        isConnected={isConnected}
      />

      {/* Synchronized Co-op Cheers Overlay */}
      <CheersOverlay
        lastCheers={lastCheers}
        onDismiss={() => setLastCheers(null)}
        myUserName={coop.userName}
      />

      {/* Quiet Drawers / Modals */}
      <RecipePickerModal
        isOpen={isRecipePickerOpen}
        onClose={() => setIsRecipePickerOpen(false)}
        currentStyleId={recipe.styleId}
        onSelectStyle={handleSelectStyle}
        lang={lang}
      />

      <CoopModal
        isOpen={isCoopModalOpen}
        onClose={() => setIsCoopModalOpen(false)}
        peers={peers}
        isConnected={isConnected}
        currentRoom={coop.roomId}
        userName={coop.userName}
        onUpdateUser={(name) => coop.setUserName(name)}
        onUpdateRoom={(room) => coop.setRoomId(room)}
        onTriggerCheers={(msg) => handleTriggerCheers(msg)}
        lang={lang}
      />

      <ShoppingListModal
        isOpen={isShoppingModalOpen}
        onClose={() => setIsShoppingModalOpen(false)}
        recipe={recipe}
        metrics={metrics}
        lang={lang}
      />

      {/* MAIN WORKSPACE */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8">
        {activeMode === 'recipe' ? (
          /* THE SINGLE ACTIVE RECIPE SHEET (85% Visual Weight) */
          <article className="bg-[#FBF9F5] border border-[#D8CEBE] rounded-lg shadow-xs overflow-hidden">
            {/* Top Copper Rule */}
            <div className="h-1.5 w-full bg-[#B85D19]" />

            {/* 1. Recipe Sheet Masthead */}
            <div className="p-5 sm:p-7 border-b border-[#D8CEBE] flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      playClick();
                      setIsRecipePickerOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#EFE9DC] hover:bg-[#E4DAC7] border border-[#C7B9A3] font-mono text-[11px] font-bold uppercase tracking-wider text-[#B85D19] transition cursor-pointer print:border-none"
                  >
                    <span>{lang === 'sv' ? currentStyle.nameSv : currentStyle.name}</span>
                    <ChevronDown className="w-3 h-3 print:hidden" />
                  </button>

                  <span className="font-mono text-[11px] text-[#8A7765]">
                    • BRYGGLOGG #{recipe.id.slice(-4).toUpperCase()}
                  </span>
                </div>

                <input
                  type="text"
                  value={recipe.name}
                  onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
                  className="w-full font-display font-bold text-2xl sm:text-4xl text-[#1E1610] bg-transparent border-b border-transparent hover:border-[#D8CEBE] focus:border-[#B85D19] focus:outline-none py-0.5"
                  placeholder={lang === 'sv' ? 'Namnge brygden...' : 'Name your brew...'}
                />

                <input
                  type="text"
                  value={recipe.notes}
                  onChange={(e) => setRecipe({ ...recipe, notes: e.target.value })}
                  className="w-full font-serif italic text-xs sm:text-sm text-[#5C4B3B] bg-transparent border-b border-transparent hover:border-[#D8CEBE] focus:border-[#B85D19] focus:outline-none py-0.5"
                  placeholder={lang === 'sv' ? 'Brygganteckningar...' : 'Brewer notes...'}
                />
              </div>

              {/* Compact Batch Size, Mash Temp & Print/Cheers Controls */}
              <div className="flex flex-wrap items-center gap-3 self-start lg:self-end print:hidden">
                <div className="flex items-center bg-[#EFE9DC] border border-[#C7B9A3] p-0.5 rounded">
                  {[10, 20, 25, 30].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleBatchSizeChange(size)}
                      className={`px-2.5 py-1 rounded-xs font-mono text-xs font-bold transition cursor-pointer ${
                        recipe.batchSizeL === size
                          ? 'bg-[#1E1610] text-[#F7F3EB]'
                          : 'text-[#5C4B3B] hover:text-[#1E1610]'
                      }`}
                    >
                      {size}L
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 bg-[#EFE9DC] border border-[#C7B9A3] rounded px-2.5 py-1">
                  <span className="font-mono text-[10px] uppercase text-[#5C4B3B]">Mäsk:</span>
                  <input
                    type="number"
                    min="62"
                    max="72"
                    step="0.5"
                    value={recipe.mashTempC}
                    onChange={(e) =>
                      setRecipe({ ...recipe, mashTempC: parseFloat(e.target.value) || 66 })
                    }
                    className="w-11 bg-transparent text-right font-mono text-xs font-bold text-[#1E1610] focus:outline-none"
                  />
                  <span className="font-mono text-xs text-[#5C4B3B]">°C</span>
                </div>

                <button
                  onClick={() => window.print()}
                  className="p-2 rounded bg-[#EFE9DC] hover:bg-[#E4DAC7] border border-[#C7B9A3] text-[#1E1610] transition cursor-pointer"
                  title={lang === 'sv' ? 'Skriv ut A4 Brygglogg' : 'Print A4 Brew Sheet'}
                >
                  <Printer className="w-4 h-4 text-[#B85D19]" />
                </button>

                <button
                  onClick={handleExport}
                  className="p-2 rounded bg-[#EFE9DC] hover:bg-[#E4DAC7] border border-[#C7B9A3] text-[#1E1610] transition cursor-pointer"
                  title={lang === 'sv' ? 'Kopiera recept till urklipp' : 'Copy recipe'}
                >
                  <Share2 className="w-4 h-4 text-[#5C4B3B]" />
                </button>

                <button
                  onClick={() => handleTriggerCheers()}
                  className="px-3 py-1.5 rounded bg-[#B85D19] hover:bg-[#9E4D12] text-[#FBF9F5] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  title="Skåla i realtid med bryggarkompisen"
                >
                  <span>🍻</span>
                  <span>{lang === 'sv' ? 'Skål!' : 'Cheers!'}</span>
                </button>
              </div>
            </div>

            {/* 2. Unified Brewer's Specification Ledger Strip (Replaces multi-card gauges) */}
            <div className="bg-[#EFE9DC] border-b border-[#D8CEBE] px-5 sm:px-7 py-3.5 grid grid-cols-2 sm:grid-cols-6 gap-3 items-center">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#5C4B3B]">
                  ALKOHOL (ABV)
                </div>
                <div className="font-mono font-bold text-lg text-[#B85D19]">
                  {metrics.abv}%
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#5C4B3B]">
                  STARTDENSITET (OG)
                </div>
                <div className="font-mono font-bold text-lg text-[#1E1610]">
                  {metrics.og}
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#5C4B3B]">
                  SLUTDENSITET (FG)
                </div>
                <div className="font-mono font-bold text-lg text-[#1E1610]">
                  {metrics.fg}
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#5C4B3B]">
                  BESKA (IBU)
                </div>
                <div className="font-mono font-bold text-lg text-[#2D5A27]">
                  {metrics.ibu} IBU
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span
                  className="w-7 h-7 rounded-full border-2 border-[#1E1610]/40 shadow-inner shrink-0"
                  style={{ backgroundColor: metrics.colorHex }}
                  title={`${metrics.ebc} EBC`}
                />
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#5C4B3B]">
                    FÄRG (EBC)
                  </div>
                  <div className="font-mono font-bold text-lg text-[#1E1610]">
                    {metrics.ebc}
                  </div>
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#5C4B3B]">
                  VATTEN (MÄSK/LAK)
                </div>
                <div className="font-mono font-bold text-sm text-[#1E1610]">
                  {metrics.mashWaterL}L + {metrics.spargeWaterL}L
                </div>
              </div>
            </div>

            {/* 3. Main Recipe Sheet Body: Malt & Hops Side-by-Side + Yeast & Water Below */}
            <div className="p-5 sm:p-7 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                <MaltSection
                  malts={recipe.malts}
                  onChange={(malts) => setRecipe({ ...recipe, malts })}
                  lang={lang}
                />

                <HopSection
                  hops={recipe.hops}
                  onChange={(hops) => setRecipe({ ...recipe, hops })}
                  lang={lang}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 pt-2 border-t border-[#E6DEC8]">
                <YeastSection
                  yeast={recipe.yeast}
                  onChange={(yeast) => setRecipe({ ...recipe, yeast })}
                  lang={lang}
                />

                <WaterCalculator
                  metrics={metrics}
                  batchSizeL={recipe.batchSizeL}
                  mashTempC={recipe.mashTempC}
                  lang={lang}
                />
              </div>
            </div>

            {/* 4. Sheet Footer Bar: Quiet Shopping Trigger + Single Primary CTA to Start Brew Day */}
            <div className="bg-[#EFE9DC] border-t border-[#D8CEBE] px-5 sm:px-7 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
              <button
                onClick={() => {
                  playClick();
                  setIsShoppingModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-[#FBF9F5] hover:bg-white border border-[#C7B9A3] text-xs font-bold text-[#1E1610] transition cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#B85D19]" />
                <span>
                  {lang === 'sv'
                    ? `Öppna Inköpslista (${metrics.totalGrainKg} kg malt, ${recipe.hops.reduce((s, h) => s + h.amountGrams, 0)}g humle)`
                    : 'Open Shopping List'}
                </span>
              </button>

              <button
                onClick={() => {
                  playClick();
                  setActiveMode('brewday');
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-[#B85D19] hover:bg-[#9E4D12] text-[#FBF9F5] font-display font-bold text-sm tracking-wide shadow-xs transition cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                <span>
                  {lang === 'sv'
                    ? `Till Bryggdag & Kokklocka (${completedStepsCount}/10)`
                    : `Start Brew Day & Timer (${completedStepsCount}/10)`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ) : (
          /* STEP-BY-STEP BREW DAY PROTOCOL & TIMER */
          <BrewDayChecklist
            isOpen={true}
            embedded={true}
            recipe={recipe}
            metrics={metrics}
            lang={lang}
            externalCompletedSteps={completedSteps}
            onStepToggle={handleStepToggle}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
