import React, { useState } from 'react';
import { BEER_STYLES } from '../data/styles';
import { BeerStyle, Language } from '../types';
import { RecipeDetailsModal } from './RecipeDetailsModal';
import {
  Dices,
  Sparkles,
  Check,
  ArrowRight,
  Flame,
  Lightbulb,
  Eye,
  ChevronDown,
  ChevronUp,
  Wheat,
  Flower2,
  FlaskConical,
} from 'lucide-react';
import { playCanPop, playClick } from '../utils/audio';
import confetti from 'canvas-confetti';
import { srmToHexColor } from '../utils/brewingMath';

interface BrainstormSectionProps {
  currentStyleId: string;
  onSelectStyle: (style: BeerStyle) => void;
  lang: Language;
}

const FUN_BRAINSTORM_IDEAS = [
  {
    title: 'Gothenburg Archipelago Cold IPA',
    titleSv: 'Göteborgs Skärgårds-Cold IPA',
    vibe: 'Krispig pilsnermaltbas med W-34/70 lagerjäst fermenterad vid 16°C och massiv torrhumling med Citra & Simcoe.',
    styleId: 'west-coast-ipa',
    highlightHops: 'Citra & Simcoe',
    highlightMalt: 'Barke Pilsner + Carapils',
  },
  {
    title: 'Disig Mango & Guava Haze-Bomb',
    titleSv: 'Disig Mango & Guava Haze-Bomb',
    vibe: 'Dubbel havre- och vetegiva med LalBrew Verdant och Galaxy/Mosaic. Tropisk fruktexplosion med silkeslen munskänsla.',
    styleId: 'neipa-hazy',
    highlightHops: 'Galaxy & Mosaic',
    highlightMalt: 'Extra Pale + Flaked Oats + Vete',
  },
  {
    title: 'Bror-i-lag Espresso Fireside Stout',
    titleSv: 'Bror-i-lag Espresso Höststout',
    vibe: 'Rik mörk chokladmalt och Crisp rostat korn med havre för sammetslen skumkrona.',
    styleId: 'hoststout',
    highlightHops: 'Magnum & Cascade',
    highlightMalt: 'Maris Otter + Choklad + Rostat korn',
  },
  {
    title: 'Snabb-Kveik inför Fredagskvällen',
    titleSv: 'Snabb-Kveik inför Fredagskvällen',
    vibe: 'Jäs vid 38°C med norsk Voss Kveik på onsdag, kolsyresätt på fredag. Apelsinzest & Citra utan kylskåpskrav!',
    styleId: 'kveik-express',
    highlightHops: 'Citra & Idaho 7',
    highlightMalt: 'Pale Ale + Wienermalt',
  },
  {
    title: 'Tjeckisk Drömpilsner med Saaz',
    titleSv: 'Tjeckisk Drömpilsner med Saaz',
    vibe: '100% tysk Weyermann Barke Pilsnermalt, 3 humlegivor klassisk tjeckisk Saaz och krispig tysk lagerjäsning.',
    styleId: 'skargardspilsner',
    highlightHops: 'Saaz & Magnum',
    highlightMalt: '100% Barke Pilsnermalt',
  },
  {
    title: 'Bror-i-lag All-Day Session Pale',
    titleSv: 'Bror-i-lag All-Day Session Pale',
    vibe: 'Lättdrucken 4.7% APA med nötigt brittisk Maris Otter-malt och citrusfrisk Amarillo & Cascade.',
    styleId: 'bror-session-pale',
    highlightHops: 'Amarillo & Cascade',
    highlightMalt: 'Crisp Maris Otter + Biscuit',
  },
];

export const BrainstormSection: React.FC<BrainstormSectionProps> = ({
  currentStyleId,
  onSelectStyle,
  lang,
}) => {
  const [randomIdea, setRandomIdea] = useState<typeof FUN_BRAINSTORM_IDEAS[0] | null>(null);
  const [inspectingStyle, setInspectingStyle] = useState<BeerStyle | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const handleRollDice = () => {
    playCanPop();
    const idx = Math.floor(Math.random() * FUN_BRAINSTORM_IDEAS.length);
    setRandomIdea(FUN_BRAINSTORM_IDEAS[idx]);
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  };

  const handleApplyStyle = (style: BeerStyle) => {
    playCanPop();
    onSelectStyle(style);
    try {
      confetti({
        particleCount: 45,
        spread: 75,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  };

  const toggleExpand = (e: React.MouseEvent, styleId: string) => {
    e.stopPropagation();
    playClick();
    setExpandedCards((prev) => ({ ...prev, [styleId]: !prev[styleId] }));
  };

  const handleInspect = (e: React.MouseEvent, style: BeerStyle) => {
    e.stopPropagation();
    playClick();
    setInspectingStyle(style);
  };

  return (
    <div className="bg-brew-900/60 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
      {/* Header with Dice Roll */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {lang === 'sv' ? 'Idé- & Stil-Studio' : 'Brainstorm & Style Studio'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'sv'
              ? 'Klicka på en stil för att se fullständiga receptdetaljer (malter, humlegivor, jäst & mäskning) eller slumpa fram en idé!'
              : 'Explore complete recipes (malts, hops, yeast & mash profile) or roll for ideas!'}
          </p>
        </div>

        <button
          onClick={handleRollDice}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
        >
          <Dices className="w-4 h-4" />
          <span>{lang === 'sv' ? 'Slumpa Öl-idé! 🎲' : 'Roll Brew Idea! 🎲'}</span>
        </button>
      </div>

      {/* Random Idea Spotlight Banner (if active) */}
      {randomIdea && (
        <div className="bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-brew-900/80 border border-amber-500/40 rounded-3xl p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                  {lang === 'sv' ? 'Inspirationsidé för Bryggdagen:' : 'Brainstorm Match:'}
                </span>
              </div>
              <h3 className="text-xl font-black text-white">
                {lang === 'sv' ? randomIdea.titleSv : randomIdea.title}
              </h3>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                🌾 {randomIdea.highlightMalt}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                🌿 {randomIdea.highlightHops}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {randomIdea.vibe}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-slate-800/80">
            {/* View Details Button */}
            <button
              onClick={() => {
                const matched = BEER_STYLES.find((s) => s.id === randomIdea.styleId);
                if (matched) setInspectingStyle(matched);
              }}
              className="px-4 py-2 rounded-xl bg-brew-950 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{lang === 'sv' ? 'Se Receptdetaljer & Ingredienser' : 'View Recipe Details'}</span>
            </button>

            {/* Load Button */}
            <button
              onClick={() => {
                const matchedStyle = BEER_STYLES.find((s) => s.id === randomIdea.styleId);
                if (matchedStyle) handleApplyStyle(matchedStyle);
              }}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{lang === 'sv' ? 'Ladda recept i kalkylatorn ⚡' : 'Load into Calculator ⚡'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Style Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BEER_STYLES.map((style) => {
          const isSelected = style.id === currentStyleId;
          const isExpanded = !!expandedCards[style.id];
          const avgEbc = (style.targetEbc[0] + style.targetEbc[1]) / 2;
          const colorHex = srmToHexColor(avgEbc / 1.97);

          return (
            <div
              key={style.id}
              className={`p-4 sm:p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-400/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
                  : 'bg-brew-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/30 flex-shrink-0"
                      style={{ backgroundColor: colorHex }}
                      title={`${style.targetEbc[0]}-${style.targetEbc[1]} EBC`}
                    />
                    <h3 className="font-bold text-base text-white">
                      {lang === 'sv' ? style.nameSv : style.name}
                    </h3>
                  </div>

                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black uppercase flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{lang === 'sv' ? 'Aktiv' : 'Active'}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-amber-300/90 font-medium mb-2">
                  {lang === 'sv' ? style.taglineSv : style.tagline}
                </p>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {lang === 'sv' ? style.descriptionSv : style.description}
                </p>

                {/* Target Specs Chips */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 py-2 border-y border-slate-800/80">
                  <span className="font-bold text-emerald-400">
                    {style.targetAbv[0]}–{style.targetAbv[1]}% ABV
                  </span>
                  <span>•</span>
                  <span className="font-bold text-sky-400">
                    {style.targetIbu[0]}–{style.targetIbu[1]} IBU
                  </span>
                  <span>•</span>
                  <span className="font-bold text-amber-400">
                    {style.targetEbc[0]}–{style.targetEbc[1]} EBC
                  </span>
                </div>

                {/* Inline Quick Ingredients Accordion */}
                {isExpanded && (
                  <div className="mt-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs animate-in fade-in duration-200">
                    {/* Malts Summary */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1 mb-1">
                        <Wheat className="w-3 h-3" />
                        <span>Maltnota:</span>
                      </span>
                      <div className="space-y-0.5 text-slate-300">
                        {style.defaultMalts.map((m, i) => (
                          <div key={i} className="flex justify-between text-[11px]">
                            <span>{m.name}</span>
                            <span className="font-mono text-slate-400">{m.amountKg} kg</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hops Summary */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1 mb-1">
                        <Flower2 className="w-3 h-3" />
                        <span>Humlegivor:</span>
                      </span>
                      <div className="space-y-0.5 text-slate-300">
                        {style.defaultHops.map((h, i) => (
                          <div key={i} className="flex justify-between text-[11px]">
                            <span>{h.name}</span>
                            <span className="font-mono text-slate-400">
                              {h.amountGrams}g ({h.usage === 'dryhop' ? 'Torrhumling' : `${h.timeMinutes}m`})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Yeast */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1 mb-1">
                        <FlaskConical className="w-3 h-3" />
                        <span>Jäst:</span>
                      </span>
                      <div className="text-[11px] text-slate-300">
                        {style.defaultYeast.name} ({style.defaultYeast.attenuationPercent}% utjäsning)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {/* Toggle Quick Ingredients Inline */}
                <button
                  onClick={(e) => toggleExpand(e, style.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <span>{isExpanded ? (lang === 'sv' ? 'Mindre' : 'Less') : (lang === 'sv' ? 'Ingredienser' : 'Ingredients')}</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <div className="flex items-center gap-1.5">
                  {/* Full Details Modal Button */}
                  <button
                    onClick={(e) => handleInspect(e, style)}
                    className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-amber-300 text-xs font-semibold transition cursor-pointer"
                    title={lang === 'sv' ? 'Se fullständiga receptdetaljer' : 'View full recipe breakdown'}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {/* Load/Apply Button */}
                  <button
                    onClick={() => handleApplyStyle(style)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>{lang === 'sv' ? 'Välj recept' : 'Apply'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipe Details Full Modal */}
      <RecipeDetailsModal
        style={inspectingStyle}
        isOpen={!!inspectingStyle}
        onClose={() => setInspectingStyle(null)}
        onApplyStyle={handleApplyStyle}
        lang={lang}
      />
    </div>
  );
};
