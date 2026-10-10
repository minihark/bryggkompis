import React from 'react';
import { BeerStyle, Language } from '../types';
import { X, Wheat, Flower2, FlaskConical, Thermometer, Check, Sparkles, Droplets, ExternalLink, ArrowRight } from 'lucide-react';
import { srmToHexColor } from '../utils/brewingMath';
import { playCanPop, playClick } from '../utils/audio';
import confetti from 'canvas-confetti';

interface RecipeDetailsModalProps {
  style: BeerStyle | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyStyle: (style: BeerStyle) => void;
  lang: Language;
}

export const RecipeDetailsModal: React.FC<RecipeDetailsModalProps> = ({
  style,
  isOpen,
  onClose,
  onApplyStyle,
  lang,
}) => {
  if (!isOpen || !style) return null;

  const totalGrainKg = style.defaultMalts.reduce((sum, m) => sum + m.amountKg, 0);
  const totalHopsG = style.defaultHops.reduce((sum, h) => sum + h.amountGrams, 0);
  const avgEbc = (style.targetEbc[0] + style.targetEbc[1]) / 2;
  const colorHex = srmToHexColor(avgEbc / 1.97);

  const handleApply = () => {
    playCanPop();
    onApplyStyle(style);
    onClose();
    try {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-brew-900 border border-slate-700 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with beer color accent */}
        <div
          className="relative px-6 py-6 border-b border-slate-800 flex items-start justify-between gap-4"
          style={{
            backgroundImage: `radial-gradient(circle at top right, ${colorHex}25, transparent 70%)`,
          }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full border border-white/40 shadow-sm flex-shrink-0"
                style={{ backgroundColor: colorHex }}
              />
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                {lang === 'sv' ? 'Receptidé & Mått' : 'Recipe Idea Breakdown'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {lang === 'sv' ? style.nameSv : style.name}
            </h2>
            <p className="text-xs sm:text-sm text-amber-300/90 font-medium">
              {lang === 'sv' ? style.taglineSv : style.tagline}
            </p>
          </div>

          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Target Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="bg-brew-950/80 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">ABV</span>
              <span className="text-lg font-black font-mono text-emerald-400">
                {style.targetAbv[0]}–{style.targetAbv[1]}%
              </span>
            </div>
            <div className="bg-brew-950/80 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">IBU (Beska)</span>
              <span className="text-lg font-black font-mono text-sky-400">
                {style.targetIbu[0]}–{style.targetIbu[1]}
              </span>
            </div>
            <div className="bg-brew-950/80 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Färg (EBC)</span>
              <span className="text-lg font-black font-mono text-amber-400">
                {style.targetEbc[0]}–{style.targetEbc[1]}
              </span>
            </div>
            <div className="bg-brew-950/80 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">OG Mål</span>
              <span className="text-lg font-black font-mono text-slate-200">
                {style.targetOg[0].toFixed(3)}
              </span>
            </div>
            <div className="bg-brew-950/80 border border-slate-800 rounded-2xl p-3 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Mäskning</span>
              <span className="text-lg font-black font-mono text-orange-400">
                {style.recommendedMashTempC}°C
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === 'sv' ? style.descriptionSv : style.description}
          </div>

          {/* 1. Malt Bill Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Wheat className="w-4 h-4" />
                <span>{lang === 'sv' ? 'Maltnota (för 20L sats):' : 'Grain Bill (for 20L batch):'}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {totalGrainKg.toFixed(2)} kg totalt
              </span>
            </div>

            <div className="divide-y divide-slate-800/80 bg-brew-950/70 rounded-2xl border border-slate-800 p-2">
              {style.defaultMalts.map((m, idx) => {
                const pct = (m.amountKg / totalGrainKg) * 100;
                const maltColor = srmToHexColor(m.ebc / 1.97);
                return (
                  <div
                    key={idx}
                    className="p-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/30 flex-shrink-0"
                        style={{ backgroundColor: maltColor }}
                        title={`${m.ebc} EBC`}
                      />
                      <div>
                        <span className="font-bold text-slate-100 block">{m.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {m.brand} • {m.ebc} EBC • {pct.toFixed(1)}% av mäsken
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-white text-sm">{m.amountKg} kg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Hop Schedule Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Flower2 className="w-4 h-4" />
                <span>{lang === 'sv' ? 'Humleschema & Givor:' : 'Hop Schedule:'}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {totalHopsG}g humlepellets
              </span>
            </div>

            <div className="divide-y divide-slate-800/80 bg-brew-950/70 rounded-2xl border border-slate-800 p-2">
              {style.defaultHops.map((h, idx) => {
                const isDryhop = h.usage === 'dryhop';
                const isWhirlpool = h.usage === 'whirlpool';
                return (
                  <div
                    key={idx}
                    className="p-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{h.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          {h.alphaAcid}% AA
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {h.aromaTags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded text-slate-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold font-mono text-white text-sm block">
                        {h.amountGrams}g
                      </span>
                      <span className="text-[11px] font-mono text-amber-300">
                        {isDryhop
                          ? `${h.timeMinutes} dagar torrhumling`
                          : isWhirlpool
                          ? 'Whirlpool @ 80°C'
                          : `${h.timeMinutes} min kok`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Yeast Profile */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
              <FlaskConical className="w-4 h-4" />
              <span>{lang === 'sv' ? 'Jäststam & Jäsning:' : 'Yeast Strain:'}</span>
            </div>

            <div className="bg-brew-950/70 rounded-2xl border border-slate-800 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{style.defaultYeast.name}</span>
                  <span className="text-slate-400">({style.defaultYeast.brand})</span>
                </div>
                <p className="text-slate-300 italic">"{style.defaultYeast.flavorNotes}"</p>
              </div>

              <div className="flex items-center gap-3 sm:border-l sm:border-slate-800 sm:pl-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Utjäsning</span>
                  <span className="font-bold font-mono text-purple-400">
                    {style.defaultYeast.attenuationPercent}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Temperatur</span>
                  <span className="font-bold font-mono text-amber-300">
                    {style.defaultYeast.tempMinC}–{style.defaultYeast.tempMaxC}°C
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Flavor Vibes */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {style.flavorVibes.map((vibe) => (
              <span
                key={vibe}
                className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold"
              >
                ✨ {vibe}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-brew-950/80 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
          >
            {lang === 'sv' ? 'Stäng' : 'Close'}
          </button>

          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-stone-950" />
            <span>
              {lang === 'sv' ? 'Ladda detta recept i kalkylatorn ⚡' : 'Load Recipe into Calculator ⚡'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
