import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { InteractivePintGlass } from './components/InteractivePintGlass';
import { MetricsCards } from './components/MetricsCards';
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
import { getTranslation } from './utils/translations';
import { playCanPop, playClick, playCheersClink } from './utils/audio';
import { coop, CheersEvent, PeerInfo } from './utils/coop';
import {
  Wheat,
  Flower2,
  FlaskConical,
  ShoppingBag,
  Flame,
  Lightbulb,
  Users,
  ChevronDown,
  Sparkles,
  Share2,
} from 'lucide-react';

const STORAGE_KEY_RECIPE = 'bryggkompis_recipe_v1';
const STORAGE_KEY_LANG = 'bryggkompis_lang_v1';
const STORAGE_KEY_STEPS = 'bryggkompis_steps_v1';

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
  notes: 'Planerad hembryggning med bror-i-lag. Ingredienser från Ölkompaniet i Göteborg!',
  createdAt: new Date().toISOString(),
};

type StudioTab = 'malt' | 'hops' | 'yeast_water' | 'shopping' | 'brewday';

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

  // Active formulation layer tab
  const [activeTab, setActiveTab] = useState<StudioTab>('malt');

  // Modals
  const [isRecipePickerOpen, setIsRecipePickerOpen] = useState(false);
  const [isCoopModalOpen, setIsCoopModalOpen] = useState(false);
  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false);
  const [isBrewDayModalOpen, setIsBrewDayModalOpen] = useState(false);

  // Completed steps on brew day (synchronized across peers)
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

  // Avoid echoing recipe back when received from peer
  const isReceivingRecipeSync = useRef(false);

  // Setup Co-op listeners
  useEffect(() => {
    const unsubCheers = coop.onCheers((cheers) => {
      setLastCheers(cheers);
    });

    const unsubPeers = coop.onPeers((peersList) => {
      setPeers(peersList);
    });

    const unsubStatus = coop.onStatus((connected) => {
      setIsConnected(connected);
    });

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

  // Save changes to localStorage & broadcast recipe updates to peer
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

  const t = getTranslation(lang);

  // Real-time calculations
  const metrics = calculateBrewMetrics(
    recipe.batchSizeL,
    recipe.efficiencyPercent,
    recipe.malts,
    recipe.hops,
    recipe.yeast
  );

  const currentStyle = BEER_STYLES.find((s) => s.id === recipe.styleId) || BEER_STYLES[0];

  // Trigger Co-op Cheers
  const handleTriggerCheers = (msg?: string) => {
    coop.sendCheers(msg);
  };

  // Handle style change from Recipe Picker Menu
  const handleSelectStyle = (style: BeerStyle) => {
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

  // Brew Day Step Toggle with Co-op Broadcast
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
      `Dela co-op länk: ${coop.getShareUrl()}`,
      'Planerat med Bryggkompis (Ölkompaniet.se): https://brygg.apps.harkco.se',
    ].join('\n');

    navigator.clipboard.writeText(summary);
    alert(lang === 'sv' ? 'Receptet kopierades till urklipp! Skicka det till din bror-i-lag!' : 'Recipe copied to clipboard!');
  };

  const tabs: { id: StudioTab; labelSv: string; labelEn: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'malt',
      labelSv: '1. Maltnota',
      labelEn: '1. Grain Bill',
      icon: <Wheat className="w-4 h-4 text-amber-300" />,
      badge: `${metrics.totalGrainKg} kg`,
    },
    {
      id: 'hops',
      labelSv: '2. Humleschema',
      labelEn: '2. Hop Schedule',
      icon: <Flower2 className="w-4 h-4 text-emerald-400" />,
      badge: `${metrics.ibu} IBU`,
    },
    {
      id: 'yeast_water',
      labelSv: '3. Jäst & Vatten',
      labelEn: '3. Yeast & Liquor',
      icon: <FlaskConical className="w-4 h-4 text-sky-400" />,
      badge: `${metrics.mashWaterL + metrics.spargeWaterL}L`,
    },
    {
      id: 'shopping',
      labelSv: '4. Inköpslista',
      labelEn: '4. Shopping Cart',
      icon: <ShoppingBag className="w-4 h-4 text-yellow-400" />,
      badge: `Ölkompaniet`,
    },
    {
      id: 'brewday',
      labelSv: '5. Bryggdag',
      labelEn: '5. Brew Day',
      icon: <Flame className="w-4 h-4 text-orange-400" />,
      badge: `${Object.values(completedSteps).filter(Boolean).length}/10`,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-brew-950 text-slate-100">
      {/* Top Navbar */}
      <Navbar
        lang={lang}
        onLanguageChange={setLang}
        onOpenShoppingList={() => setIsShoppingModalOpen(true)}
        onOpenBrewDay={() => setIsBrewDayModalOpen(true)}
        onOpenRecipePicker={() => setIsRecipePickerOpen(true)}
        onExport={handleExport}
        onOpenCoop={() => setIsCoopModalOpen(true)}
        onCheers={() => handleTriggerCheers()}
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

      {/* Dedicated Recipe & Style Picker Menu Modal */}
      <RecipePickerModal
        isOpen={isRecipePickerOpen}
        onClose={() => setIsRecipePickerOpen(false)}
        currentStyleId={recipe.styleId}
        onSelectStyle={handleSelectStyle}
        lang={lang}
      />

      {/* Co-op Room & Invite Modal */}
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

      {/* Shopping & Brew Day Modals */}
      <ShoppingListModal
        isOpen={isShoppingModalOpen}
        onClose={() => setIsShoppingModalOpen(false)}
        recipe={recipe}
        metrics={metrics}
        lang={lang}
      />

      <BrewDayChecklist
        isOpen={isBrewDayModalOpen}
        onClose={() => setIsBrewDayModalOpen(false)}
        recipe={recipe}
        metrics={metrics}
        lang={lang}
        externalCompletedSteps={completedSteps}
        onStepToggle={handleStepToggle}
      />

      {/* MAIN CONTAINER (Spacious, Room to Breathe!) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7 sm:space-y-8">
        {/* RECIPE HERO HEADER CARD */}
        <section className="bg-brew-900/85 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Ambient Amber Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Title, Style Button & Notes */}
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Recipe & Style Picker Menu Trigger */}
                <button
                  onClick={() => {
                    playClick();
                    setIsRecipePickerOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 font-extrabold text-xs transition cursor-pointer shadow-sm group"
                  title="Klicka för att välja en annan ölstil eller receptidé"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>{lang === 'sv' ? currentStyle.nameSv : currentStyle.name}</span>
                  <ChevronDown className="w-3 h-3 text-amber-400/80" />
                  <span className="text-[10px] text-amber-400/70 uppercase font-bold tracking-wider ml-1">
                    ({lang === 'sv' ? 'Byt stil' : 'Change style'})
                  </span>
                </button>

                {/* Co-op indicator */}
                <button
                  onClick={() => setIsCoopModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="font-mono text-[11px]">Rum: {coop.roomId}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {peers.length > 1 ? `(${peers.length} aktiva)` : ''}
                  </span>
                </button>
              </div>

              {/* Recipe Name */}
              <input
                type="text"
                value={recipe.name}
                onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
                className="w-full text-2xl sm:text-4xl lg:text-5xl font-black bg-transparent border-b border-transparent hover:border-slate-700 focus:border-amber-500 text-white focus:outline-none transition py-1"
                placeholder={lang === 'sv' ? 'Namnge ert öl...' : 'Name your beer...'}
              />

              {/* Recipe Notes */}
              <input
                type="text"
                value={recipe.notes}
                onChange={(e) => setRecipe({ ...recipe, notes: e.target.value })}
                className="w-full text-xs sm:text-sm text-slate-400 bg-transparent border-b border-transparent hover:border-slate-800 focus:border-amber-500 focus:outline-none transition py-0.5"
                placeholder={lang === 'sv' ? 'Anteckningar inför bryggdagen med bror-i-lag...' : 'Brew day notes...'}
              />
            </div>

            {/* Quick Batch Controls & Big Cheers Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 bg-brew-950/80 border border-slate-800/80 rounded-2xl p-4 flex-shrink-0">
              {/* Batch Size Selection */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                  {t.batchSize}
                </span>
                <div className="flex items-center gap-1.5">
                  {[10, 20, 25, 30, 50].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleBatchSizeChange(size)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                        recipe.batchSizeL === size
                          ? 'bg-amber-500 text-stone-950 shadow-md font-black ring-1 ring-amber-400'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      {size}L
                    </button>
                  ))}
                </div>
              </div>

              {/* Mash Temp & Efficiency */}
              <div className="flex items-center gap-3 sm:border-l sm:border-slate-800 sm:pl-3.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                <div>
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
                      className="w-16 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-center font-mono text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-slate-400">°C</span>
                  </div>
                </div>

                <div className="border-l border-slate-800 pl-3">
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
                      className="w-14 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-center font-mono text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </div>
              </div>

              {/* Big Co-op Cheers Button */}
              <div className="pt-2 sm:pt-0 sm:border-l sm:border-slate-800 sm:pl-3.5 flex items-center">
                <button
                  onClick={() => handleTriggerCheers()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 active:scale-95 text-stone-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition cursor-pointer"
                  title="Skåla i realtid på båda skärmarna!"
                >
                  <span className="text-base animate-bounce">🍻</span>
                  <span>{lang === 'sv' ? 'SKÅL MED BROR!' : 'CHEERS!'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* HERO CANVAS: FULL INTERACTIVE PINT GLASS & METRICS GAUGES */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Pint Glass on the left: Full, tactile, bubbling! */}
          <div className="lg:col-span-1 bg-brew-900/60 border border-slate-800 rounded-3xl p-5 flex items-center justify-center shadow-xl">
            <InteractivePintGlass
              colorHex={metrics.colorHex}
              ebc={metrics.ebc}
              abv={metrics.abv}
              ibu={metrics.ibu}
            />
          </div>

          {/* Metrics Gauges on the right: Full cards with target ranges */}
          <div className="lg:col-span-3">
            <MetricsCards metrics={metrics} styleId={recipe.styleId} lang={lang} />
          </div>
        </section>

        {/* STUDIO LAYER NAVIGATION TABS */}
        <section className="border-b border-slate-800/80 pb-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClick();
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition flex-shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400 font-extrabold'
                      : 'bg-brew-900/80 hover:bg-brew-850 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{lang === 'sv' ? tab.labelSv : tab.labelEn}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-stone-950/20 text-stone-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ACTIVE FORMULATION STUDIO WORKSPACE */}
        <section className="space-y-6">
          {/* Layer 1: Maltnota */}
          {activeTab === 'malt' && (
            <div className="animate-in fade-in duration-200">
              <MaltSection
                malts={recipe.malts}
                onChange={(malts) => setRecipe({ ...recipe, malts })}
                lang={lang}
              />
            </div>
          )}

          {/* Layer 2: Humleschema */}
          {activeTab === 'hops' && (
            <div className="animate-in fade-in duration-200">
              <HopSection
                hops={recipe.hops}
                onChange={(hops) => setRecipe({ ...recipe, hops })}
                lang={lang}
              />
            </div>
          )}

          {/* Layer 3: Jäst & Vatten (Unified Fermentation & Liquor Planning) */}
          {activeTab === 'yeast_water' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
              <div>
                <YeastSection
                  yeast={recipe.yeast}
                  onChange={(yeast) => setRecipe({ ...recipe, yeast })}
                  lang={lang}
                />
              </div>
              <div>
                <WaterCalculator
                  metrics={metrics}
                  batchSizeL={recipe.batchSizeL}
                  mashTempC={recipe.mashTempC}
                  lang={lang}
                />
              </div>
            </div>
          )}

          {/* Layer 4: Inköpslista (Direct Ölkompaniet Cart Planner) */}
          {activeTab === 'shopping' && (
            <div className="animate-in fade-in duration-200">
              <ShoppingListModal
                isOpen={true}
                recipe={recipe}
                metrics={metrics}
                lang={lang}
                embedded={true}
              />
            </div>
          )}

          {/* Layer 5: Bryggdag (Checklist & Countdown Timer with Co-op Sync) */}
          {activeTab === 'brewday' && (
            <div className="animate-in fade-in duration-200">
              <BrewDayChecklist
                isOpen={true}
                recipe={recipe}
                metrics={metrics}
                lang={lang}
                embedded={true}
                externalCompletedSteps={completedSteps}
                onStepToggle={handleStepToggle}
              />
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
