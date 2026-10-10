import React from 'react';
import { BrewCalculations, BeerStyle, Language } from '../types';
import { BEER_STYLES } from '../data/styles';
import { CheckCircle2, AlertCircle, Droplets, Gauge, Sparkles, DollarSign } from 'lucide-react';
import { getTranslation } from '../utils/translations';

interface MetricsCardsProps {
  metrics: BrewCalculations;
  styleId: string;
  lang: Language;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  metrics,
  styleId,
  lang,
}) => {
  const t = getTranslation(lang);
  const currentStyle = BEER_STYLES.find((s) => s.id === styleId) || BEER_STYLES[0];

  const isBetween = (val: number, [min, max]: [number, number]) => val >= min && val <= max;

  const ogValid = isBetween(metrics.og, currentStyle.targetOg);
  const fgValid = isBetween(metrics.fg, currentStyle.targetFg);
  const abvValid = isBetween(metrics.abv, currentStyle.targetAbv);
  const ibuValid = isBetween(metrics.ibu, currentStyle.targetIbu);
  const ebcValid = isBetween(metrics.ebc, currentStyle.targetEbc);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. OG */}
      <div className="bg-brew-900/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <span>{t.og}</span>
          {ogValid ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          )}
        </div>
        <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
          {metrics.og.toFixed(3)}
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-1">
          Mål: {currentStyle.targetOg[0]} - {currentStyle.targetOg[1]}
        </div>
      </div>

      {/* 2. FG */}
      <div className="bg-brew-900/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <span>{t.fg}</span>
          {fgValid ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          )}
        </div>
        <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
          {metrics.fg.toFixed(3)}
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-1">
          Mål: {currentStyle.targetFg[0]} - {currentStyle.targetFg[1]}
        </div>
      </div>

      {/* 3. ABV */}
      <div className="bg-brew-900/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <span>{t.abv}</span>
          {abvValid ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          )}
        </div>
        <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
          {metrics.abv.toFixed(1)}%
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-1">
          Mål: {currentStyle.targetAbv[0]}% - {currentStyle.targetAbv[1]}%
        </div>
      </div>

      {/* 4. IBU */}
      <div className="bg-brew-900/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <span>{t.ibu}</span>
          {ibuValid ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          )}
        </div>
        <div className="text-xl sm:text-2xl font-black font-mono text-sky-400 mt-1">
          {metrics.ibu}
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-1">
          Mål: {currentStyle.targetIbu[0]} - {currentStyle.targetIbu[1]}
        </div>
      </div>

      {/* 5. EBC */}
      <div className="bg-brew-900/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <span>{t.ebc}</span>
          {ebcValid ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="w-4 h-4 rounded-full border border-white/30 shadow-sm flex-shrink-0"
            style={{ backgroundColor: metrics.colorHex }}
          />
          <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">
            {metrics.ebc}
          </span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-1">
          Mål: {currentStyle.targetEbc[0]} - {currentStyle.targetEbc[1]}
        </div>
      </div>

      {/* 6. Est. Cost */}
      <div className="bg-brew-900/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <span>Ölkompaniet</span>
          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-xl sm:text-2xl font-black font-mono text-amber-300 mt-1">
          ~{metrics.estimatedCostSek} kr
        </div>
        <div className="text-[10px] text-slate-400 mt-1">
          {metrics.totalGrainKg} kg malt • {metrics.totalHopsG}g humle
        </div>
      </div>
    </div>
  );
};
