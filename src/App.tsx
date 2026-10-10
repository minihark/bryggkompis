import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Layers,
  Wheat,
  Flower2,
  FlaskConical,
  ShoppingBag,
  Flame,
  Lightbulb,
  Users,
  CheckCircle2,
  AlertCircle,
  Share2,
  Radio,
  Sliders,
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
  notes: 'Planerad bryggdag med bror-i-lag. Ingredienser köps hos Ölkompaniet i Göteborg!',
  createdAt: new Date().toISOString(),
};

type StudioTab = 'ideas' | 'malt' | 'hops' | 'yeast_water' | 'shopping' | 'brewday';

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

  // Active layer tab
  const [activeTab, setActiveTab] = useState<StudioTab>('ideas');

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
  const [isCoopModalOpen, setIsCoopModalOpen] = useState(false);
  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false);
  const [isBrewDayModalOpen, setIsBrewDayModalOpen] = useState(false);

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

  // Style info for targets
  const currentStyle = BEER_STYLES.find((s) => s.id === recipe.styleId) || BEER_STYLES[0];

  // Trigger Co-op Cheers
  const handleTriggerCheers = (msg?: string) => {
    coop.sendCheers(msg);
  };

  // Handle style change
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
      id: 'ideas',
      labelSv: 'Idéer & Stil',
      labelEn: 'Ideas & Style',
      icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'malt',
      labelSv: 'Maltnota',
      labelEn: 'Grain Bill',
      icon: <Wheat className="w-4 h-4 text-amber-300" />,
      badge: `${metrics.totalGrainKg} kg`,
    },
    {
      id: 'hops',
      labelSv: 'Humleschema',
      labelEn: 'Hop Schedule',
      icon: <Flower2 className="w-4 h-4 text-emerald-400" />,
      badge: `${metrics.ibu} IBU`,
    },
    {
      id: 'yeast_water',
      labelSv: 'Jäst & Vatten',
      labelEn: 'Yeast & Liquor',
      icon: <FlaskConical className="w-4 h-4 text-sky-400" />,
      badge: `${metrics.mashWaterL + metrics.spargeWaterL}L`,
    },
    {
      id: 'shopping',
      labelSv: 'Inköpslista',
      labelEn: 'Shopping Cart',
      icon: <ShoppingBag className="w-4 h-4 text-yellow-400" />,
      badge: `Ölkompaniet`,
    },
    {
      id: 'brewday',
      labelSv: 'Bryggdag',
      labelEn: 'Brew Day',
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

      {/* Optional Full Screen Shopping & Brew Day Modals when opened via navbar */}
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

      {/* PERSISTENT STICKY TOP HUD (Zero-scroll Recipe Stats & Quick Co-op Toast) */}
      <section className="sticky top-16 z-30 bg-brew-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl w-full transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 space-y-2.5 sm:space-y-3">
          {/* Row 1: Recipe Name, Style Badge, Batch Size, and Big Co-op Cheers Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
            {/* Title & Style Tag */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex-shrink-0">
                {recipe.styleId}
              </span>
              <input
                type="text"
                value={recipe.name}
                onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
                className="text-sm sm:text-lg lg:text-xl font-black bg-transparent border-b border-transparent hover:border-slate-700 focus:border-amber-500 text-white focus:outline-none transition py-0.5 truncate flex-1 min-w-0"
                title="Klicka för att byta namn på ölet"
                placeholder={lang === 'sv' ? 'Namnge ert öl...' : 'Name your beer...'}
              />
            </div>

            {/* Batch Size Pills & Big Cheers Button */}
            <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
              {/* Batch sizes */}
              <div className="flex items-center gap-1 bg-brew-950/80 border border-slate-800 rounded-xl p-1">
                {[10, 20, 25, 30].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => handleBatchSizeChange(sz)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                      recipe.batchSizeL === sz
                        ? 'bg-amber-500 text-stone-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {sz}L
                  </button>
                ))}
              </div>

              {/* Live Co-op Skål Button in HUD */}
              <button
                onClick={() => handleTriggerCheers()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 active:scale-95 text-stone-950 font-black text-xs shadow-md shadow-amber-500/25 transition cursor-pointer"
                title={lang === 'sv' ? 'Skåla i realtid på båda skärmarna!' : 'Toast together in real time!'}
              >
                <span className="text-sm animate-bounce">🍻</span>
                <span className="hidden sm:inline">{lang === 'sv' ? 'SKÅL MED BROR!' : 'CHEERS CO-OP!'}</span>
                <span className="sm:hidden">SKÅL!</span>
              </button>
            </div>
          </div>

          {/* Row 2: Live Metrics HUD Bar + Mini Pint Glass Swatch */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-0.5 no-scrollbar">
            {/* Mini Glass Color & Bubbles indicator */}
            <div
              onClick={() => handleTriggerCheers()}
              className="flex items-center gap-2 bg-brew-950/90 border border-slate-800 rounded-2xl px-2.5 py-1.5 cursor-pointer hover:border-amber-500/40 transition flex-shrink-0"
              title="Klicka på glaset för skål!"
            >
              <div
                className="w-5 h-7 rounded-b-md border-2 border-slate-500/60 overflow-hidden relative shadow-inner"
                style={{ backgroundColor: metrics.colorHex }}
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-amber-100" />
                <span className="absolute bottom-1 left-1 w-1 h-1 bg-white/70 rounded-full animate-ping opacity-60" />
              </div>
              <div className="text-left hidden md:block">
                <div className="text-[10px] uppercase font-bold text-slate-400">Färg</div>
                <div className="text-xs font-mono font-bold text-amber-300">{metrics.ebc} EBC</div>
              </div>
            </div>

            {/* Metrics Chips Grid */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
              {/* OG */}
              <div className="bg-brew-950/80 border border-slate-800 rounded-xl px-2.5 py-1 text-center min-w-[62px] sm:min-w-[70px]">
                <div className="text-[9px] uppercase font-bold text-slate-400">{t.og}</div>
                <div className="text-xs sm:text-sm font-black font-mono text-white">{metrics.og.toFixed(3)}</div>
              </div>

              {/* FG */}
              <div className="bg-brew-950/80 border border-slate-800 rounded-xl px-2.5 py-1 text-center min-w-[62px] sm:min-w-[70px]">
                <div className="text-[9px] uppercase font-bold text-slate-400">{t.fg}</div>
                <div className="text-xs sm:text-sm font-black font-mono text-white">{metrics.fg.toFixed(3)}</div>
              </div>

              {/* ABV */}
              <div className="bg-brew-950/80 border border-emerald-500/30 rounded-xl px-2.5 py-1 text-center min-w-[62px] sm:min-w-[70px]">
                <div className="text-[9px] uppercase font-bold text-emerald-400">{t.abv}</div>
                <div className="text-xs sm:text-sm font-black font-mono text-emerald-300">{metrics.abv.toFixed(1)}%</div>
              </div>

              {/* IBU */}
              <div className="bg-brew-950/80 border border-sky-500/30 rounded-xl px-2.5 py-1 text-center min-w-[62px] sm:min-w-[70px]">
                <div className="text-[9px] uppercase font-bold text-sky-400">{t.ibu}</div>
                <div className="text-xs sm:text-sm font-black font-mono text-sky-300">{metrics.ibu}</div>
              </div>

              {/* EBC */}
              <div className="bg-brew-950/80 border border-amber-500/30 rounded-xl px-2.5 py-1 text-center min-w-[62px] sm:min-w-[70px]">
                <div className="text-[9px] uppercase font-bold text-amber-400">{t.ebc}</div>
                <div className="text-xs sm:text-sm font-black font-mono text-amber-300">{metrics.ebc}</div>
              </div>

              {/* Water Liquor Volume */}
              <div className="hidden lg:flex flex-col justify-center bg-brew-950/80 border border-slate-800 rounded-xl px-3 py-1 text-left min-w-[120px]">
                <div className="text-[9px] uppercase font-bold text-slate-400">Vattenvolym</div>
                <div className="text-xs font-mono font-bold text-slate-200">
                  {metrics.mashWaterL}L Mäsk • {metrics.spargeWaterL}L Lak
                </div>
              </div>

              {/* Co-op Room Status Tag */}
              <button
                onClick={() => setIsCoopModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 bg-brew-950/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl px-2.5 py-1 ml-auto text-xs font-semibold text-slate-300 cursor-pointer"
                title="Klicka för att se anslutna bryggare och dela rumslänk"
              >
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="font-mono text-amber-300 text-[11px] font-bold">Rum: {coop.roomId}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  {peers.length > 1 ? `${peers.length} aktiva` : '1'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* LAYERED STUDIO NAVIGATION TABS (Zero-scroll Layer Switching) */}
      <section className="bg-brew-950 border-b border-slate-800/80 sticky top-[138px] sm:top-[146px] z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClick();
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex-shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                      : 'bg-brew-900/80 hover:bg-brew-850 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{lang === 'sv' ? tab.labelSv : tab.labelEn}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
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
        </div>
      </section>

      {/* MAIN STUDIO WORKSPACE LAYER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* Layer 1: Idéer & Stil */}
        {activeTab === 'ideas' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Quick Pint Glass & Style Summary Card */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
              <div className="lg:col-span-1 bg-brew-900/60 border border-slate-800 rounded-3xl p-4 flex items-center justify-center shadow-xl">
                <InteractivePintGlass
                  colorHex={metrics.colorHex}
                  ebc={metrics.ebc}
                  abv={metrics.abv}
                  ibu={metrics.ibu}
                />
              </div>
              <div className="lg:col-span-3">
                <MetricsCards metrics={metrics} styleId={recipe.styleId} lang={lang} />
              </div>
            </div>

            {/* Brainstorm & Style Selector */}
            <BrainstormSection
              currentStyleId={recipe.styleId}
              onSelectStyle={handleSelectStyle}
              lang={lang}
            />
          </div>
        )}

        {/* Layer 2: Maltnota */}
        {activeTab === 'malt' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <MaltSection
              malts={recipe.malts}
              onChange={(malts) => setRecipe({ ...recipe, malts })}
              lang={lang}
            />
          </div>
        )}

        {/* Layer 3: Humleschema */}
        {activeTab === 'hops' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <HopSection
              hops={recipe.hops}
              onChange={(hops) => setRecipe({ ...recipe, hops })}
              lang={lang}
            />
          </div>
        )}

        {/* Layer 4: Jäst & Vatten (Unified Fermentation & Liquor Station) */}
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

        {/* Layer 5: Inköpslista (Direct Ölkompaniet Cart Planner) */}
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

        {/* Layer 6: Bryggdag (Interactive Checklist & Boil Timer with Co-op Sync) */}
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
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
