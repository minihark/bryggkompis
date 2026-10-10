import React, { useState } from 'react';
import { BEER_STYLES } from '../data/styles';
import { BeerStyle, Language } from '../types';
import { RecipeDetailsModal } from './RecipeDetailsModal';
import {
  X,
  Sparkles,
  Dices,
  Check,
  Eye,
  Wheat,
  Flower2,
  FlaskConical,
  Flame,
  ArrowRight,
  Beer,
} from 'lucide-react';
import { playCanPop, playClick } from '../utils/audio';
import confetti from 'canvas-confetti';
import { srmToHexColor } from '../utils/brewingMath';

interface RecipePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyleId: string;
  onSelectStyle: (style: BeerStyle) => void;
  lang: Language;
}

const BRAINSTORM_RECIPES = [
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
    title: 'Klassisk Krispig Tysk Pilsner',
    titleSv: 'Klassisk Krispig Tysk Pilsner',
    vibe: '100% Barke Pilsnermalt med ädelhumle Hallertauer Mittelfrüh och Saaz. Rent, krispigt och örtigt.',
    styleId: 'tysk-pilsner',
    highlightHops: 'Hallertauer & Saaz',
    highlightMalt: 'Weyermann Barke Pilsner',
  },
  {
    title: 'Somrig Solskens-Witbier',
    titleSv: 'Somrig Solskens-Witbier',
    vibe: 'Korianderfrön, torkat apelsinskal och omältat vete. Svalkande törstsläckare för balkongen.',
    styleId: 'belgisk-wit',
    highlightHops: 'Saaz & Styrian Golding',
    highlightMalt: 'Pilsner + Omältat Vete + Havre',
  },
];

export const RecipePickerModal: React.FC<RecipePickerModalProps> = ({
  isOpen,
  onClose,
  currentStyleId,
  onSelectStyle,
  lang,
}) => {
  const [modalStyleDetails, setModalStyleDetails] = useState<BeerStyle | null>(null);

  if (!isOpen) return null;

  const handleRandomize = () => {
    playCanPop();
    const otherStyles = BEER_STYLES.filter((s) => s.id !== currentStyleId);
    const random = otherStyles[Math.floor(Math.random() * otherStyles.length)] || BEER_STYLES[0];
    onSelectStyle(random);
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.5 },
      });
    } catch (e) {}
    onClose();
  };

  const handlePickStyle = (style: BeerStyle) => {
    playCanPop();
    onSelectStyle(style);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full bg-brew-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-brew-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl shadow-inner">
              💡
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{lang === 'sv' ? 'Recept- & Stilväljare' : 'Recipe & Style Picker'}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Ölkompaniet
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'sv'
                  ? 'Välj en klassisk ölstil eller ett beprövat receptidé för ert nästa brygg'
                  : 'Choose a beer style or curated recipe inspiration for your brew'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomize}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition cursor-pointer"
              title="Slumpa en stil"
            >
              <Dices className="w-4 h-4 text-amber-400" />
              <span>{lang === 'sv' ? 'Slumpa öl' : 'Randomize'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-7">
          {/* Section 1: Standard Beer Styles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>🍺 {lang === 'sv' ? 'Klassiska Ölstilar (BJCP Presets)' : 'Classic Beer Styles'}</span>
              </h3>
              <span className="text-xs text-slate-400">
                {lang === 'sv' ? 'Klicka för att ladda stilen i kalkylatorn' : 'Click to load style'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BEER_STYLES.map((style) => {
                const isSelected = style.id === currentStyleId;
                const avgEbc = (style.targetEbc[0] + style.targetEbc[1]) / 2;
                const colorHex = srmToHexColor(avgEbc / 1.97);

                return (
                  <div
                    key={style.id}
                    onClick={() => handlePickStyle(style)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden group flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/80 shadow-lg shadow-amber-500/10'
                        : 'bg-brew-950/70 border-slate-800 hover:border-slate-700 hover:bg-brew-950'
                    }`}
                  >
                    {/* Color Glow */}
                    <div
                      className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none"
                      style={{ backgroundColor: colorHex }}
                    />

                    <div className="space-y-2 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm flex-shrink-0"
                            style={{ backgroundColor: colorHex }}
                          />
                          <span className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                            {lang === 'sv' ? style.nameSv : style.name}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>{lang === 'sv' ? 'Vald' : 'Active'}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {lang === 'sv' ? (style.taglineSv || style.descriptionSv) : (style.tagline || style.description)}
                      </p>

                      <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-slate-300">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {style.targetAbv[0]}-{style.targetAbv[1]}% ABV
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {style.targetIbu[0]}-{style.targetIbu[1]} IBU
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {avgEbc.toFixed(0)} EBC
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-amber-300 transition-colors">
                      <span>{isSelected ? (lang === 'sv' ? 'Aktiv stil' : 'Active style') : (lang === 'sv' ? 'Välj denna stil' : 'Select style')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Ölkompaniet Curated Recipe Inspirations */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>✨ {lang === 'sv' ? 'Ölkompaniets Beprövade Receptidéer' : 'Curated Recipe Ideas'}</span>
              </h3>
              <span className="text-xs text-slate-400">
                {lang === 'sv' ? 'Färdigkomponerade idéer med ingredienser' : 'Pre-balanced recipes'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {BRAINSTORM_RECIPES.map((idea, idx) => {
                const targetStyle = BEER_STYLES.find((s) => s.id === idea.styleId) || BEER_STYLES[0];
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-brew-950/70 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                          {lang === 'sv' ? idea.titleSv : idea.title}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {targetStyle.name}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {idea.vibe}
                      </p>

                      <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-300">
                        <div className="flex items-center gap-1 bg-brew-900 px-2 py-0.5 rounded-lg border border-slate-800">
                          <Wheat className="w-3 h-3 text-amber-400" />
                          <span>{idea.highlightMalt}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-brew-900 px-2 py-0.5 rounded-lg border border-slate-800">
                          <Flower2 className="w-3 h-3 text-emerald-400" />
                          <span>{idea.highlightHops}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
                      <button
                        onClick={() => {
                          playClick();
                          setModalStyleDetails(targetStyle);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-semibold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === 'sv' ? 'Visa detaljer' : 'View details'}</span>
                      </button>

                      <button
                        onClick={() => handlePickStyle(targetStyle)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm transition cursor-pointer"
                      >
                        <span>{lang === 'sv' ? 'Ladda recept' : 'Load recipe'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-brew-950/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {lang === 'sv'
              ? 'Alla ingredienser finns i sortimentet hos Ölkompaniet i Göteborg'
              : 'All ingredients sourced from Ölkompaniet catalog'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
          >
            {lang === 'sv' ? 'Stäng' : 'Close'}
          </button>
        </div>
      </div>

      {/* Recipe Details Sub-Modal */}
      <RecipeDetailsModal
        style={modalStyleDetails}
        isOpen={!!modalStyleDetails}
        onClose={() => setModalStyleDetails(null)}
        onApplyStyle={(style) => {
          handlePickStyle(style);
          setModalStyleDetails(null);
        }}
        lang={lang}
      />
    </div>
  );
};
