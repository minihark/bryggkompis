import React from 'react';
import { BEER_STYLES } from '../data/styles';
import { BeerStyle, Language } from '../types';
import { Dices, Sparkles, Check, ArrowRight, Flame, Lightbulb } from 'lucide-react';
import { playCanPop, playClick } from '../utils/audio';
import confetti from 'canvas-confetti';

interface BrainstormSectionProps {
  currentStyleId: string;
  onSelectStyle: (style: BeerStyle) => void;
  lang: Language;
}

const FUN_BRAINSTORM_IDEAS = [
  {
    title: 'Gothenburg Archipelago Cold IPA',
    titleSv: 'Göteborgs Skärgårds-Cold IPA',
    vibe: 'Pilsnermalt bas, W-34/70 lagerjäst vid 16°C, och massiv torrhumling med Citra och Simcoe!',
    styleId: 'west-coast-ipa',
  },
  {
    title: 'Disig Mango & Guava Haze-Bomb',
    titleSv: 'Disig Mango & Guava Haze-Bomb',
    vibe: 'Dubbel havre-givning med LalBrew Verdant och Galaxy/Mosaic. Tropisk fruktexplosion!',
    styleId: 'neipa-hazy',
  },
  {
    title: 'Bror-i-lag Espresso Fireside Stout',
    titleSv: 'Bror-i-lag Espresso Höststout',
    vibe: 'Rik chokladmalt och rostat korn med kallbryggt kaffe tillsatt vid sekundärjäsning.',
    styleId: 'hoststout',
  },
  {
    title: 'Snabb-Kveik inför Fredagskvällen',
    titleSv: 'Snabb-Kveik inför Fredagskvällen',
    vibe: 'Jäs vid 38°C med Voss Kveik på onsdag, kolsyresätt på fredag. Apelsinzest & Citra!',
    styleId: 'kveik-express',
  },
  {
    title: 'Tjeckisk Drömpilsner med Saaz',
    titleSv: 'Tjeckisk Drömpilsner med Saaz',
    vibe: '100% tysk Weyermann Barke Pilsnermalt, 3 humlegivor Saaz och mjuk tysk lagerjäsning.',
    styleId: 'skargardspilsner',
  },
];

export const BrainstormSection: React.FC<BrainstormSectionProps> = ({
  currentStyleId,
  onSelectStyle,
  lang,
}) => {
  const [randomIdea, setRandomIdea] = React.useState<typeof FUN_BRAINSTORM_IDEAS[0] | null>(null);

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
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}
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
              ? 'Hitta inspiration för ert bryggprojekt. Välj en beprövad stil eller slumpa en galen idé!'
              : 'Find inspiration for your next brew. Pick a proven style or randomize an idea!'}
          </p>
        </div>

        <button
          onClick={handleRollDice}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
        >
          <Dices className="w-4 h-4" />
          <span>{lang === 'sv' ? 'Slumpa Öl-idé!' : 'Roll Brew Idea!'}</span>
        </button>
      </div>

      {/* Random Idea Spotlight Banner (if active) */}
      {randomIdea && (
        <div className="bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-brew-900/80 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                {lang === 'sv' ? 'Idé-Förslag för Er:' : 'Inspiration Match:'}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              {lang === 'sv' ? randomIdea.titleSv : randomIdea.title}
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">{randomIdea.vibe}</p>
          </div>

          <button
            onClick={() => {
              const matchedStyle = BEER_STYLES.find((s) => s.id === randomIdea.styleId);
              if (matchedStyle) handleApplyStyle(matchedStyle);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <span>{lang === 'sv' ? 'Ladda detta recept' : 'Apply Recipe'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Style Cards Carousel/Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {BEER_STYLES.map((style) => {
          const isSelected = style.id === currentStyleId;
          return (
            <div
              key={style.id}
              onClick={() => handleApplyStyle(style)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-400/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
                  : 'bg-brew-950/70 border-slate-800 hover:border-slate-700 hover:bg-brew-950'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {lang === 'sv' ? style.nameSv : style.name}
                  </h3>
                  {isSelected && (
                    <span className="p-1 rounded-full bg-amber-500 text-stone-950">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-300/90 font-medium mb-2">
                  {lang === 'sv' ? style.taglineSv : style.tagline}
                </p>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {lang === 'sv' ? style.descriptionSv : style.description}
                </p>
              </div>

              {/* Flavor tags & target specs */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex flex-wrap gap-1">
                  {style.flavorVibes.slice(0, 3).map((vibe) => (
                    <span
                      key={vibe}
                      className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300"
                    >
                      {vibe}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span>{style.targetAbv[0]}-{style.targetAbv[1]}% ABV</span>
                  <span>•</span>
                  <span>{style.targetIbu[0]}-{style.targetIbu[1]} IBU</span>
                  <span>•</span>
                  <span>{style.targetEbc[0]}-{style.targetEbc[1]} EBC</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
