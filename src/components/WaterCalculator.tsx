import React from 'react';
import { BrewCalculations, Language } from '../types';
import { Droplets, Info } from 'lucide-react';

interface WaterCalculatorProps {
  metrics: BrewCalculations;
  batchSizeL: number;
  mashTempC: number;
  lang: Language;
}

export const WaterCalculator: React.FC<WaterCalculatorProps> = ({
  metrics,
  batchSizeL,
  mashTempC,
  lang,
}) => {
  return (
    <div className="bg-brew-900/60 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
          <Droplets className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-base text-white">
            {lang === 'sv' ? 'Vattenvolymer & Mäskning' : 'Water Volumes & Mash Planning'}
          </h3>
          <p className="text-xs text-slate-400">
            {lang === 'sv'
              ? `Beräknat för ${batchSizeL}L färdig vört med ${metrics.totalGrainKg}kg malt`
              : `Calculated for ${batchSizeL}L final wort with ${metrics.totalGrainKg}kg grain`}
          </p>
        </div>
      </div>

      {/* Grid of 3 Water Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Mäskvatten */}
        <div className="bg-brew-950/70 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
            {lang === 'sv' ? 'Mäskvatten (Strike)' : 'Strike Water'}
          </span>
          <div className="text-2xl font-black font-mono text-sky-400">
            {metrics.mashWaterL} Liter
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {lang === 'sv' ? `Värms till ca ${mashTempC + 4}°C (inmäsk ${mashTempC}°C)` : `Heat to ~${mashTempC + 4}°C`}
          </span>
        </div>

        {/* 2. Lakvatten */}
        <div className="bg-brew-950/70 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
            {lang === 'sv' ? 'Lakvatten (Sparge)' : 'Sparge Water'}
          </span>
          <div className="text-2xl font-black font-mono text-sky-400">
            {metrics.spargeWaterL} Liter
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {lang === 'sv' ? 'Värms till 76°C - 78°C' : 'Heat to 76°C - 78°C'}
          </span>
        </div>

        {/* 3. Totalt */}
        <div className="bg-brew-950/70 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
            {lang === 'sv' ? 'Totalt Bryggvatten' : 'Total Brew Water'}
          </span>
          <div className="text-2xl font-black font-mono text-white">
            {metrics.totalWaterL} Liter
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {lang === 'sv' ? 'Inkluderar kokförlust & absorption' : 'Includes boiloff & absorption'}
          </span>
        </div>
      </div>

      {/* Water Treatment Tip for Gothenburg Tap Water */}
      <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/20 flex items-start gap-3 text-xs text-sky-200">
        <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>{lang === 'sv' ? 'Göteborgs kranvatten-tips:' : 'Water Treatment Tip:'}</strong>{' '}
          {lang === 'sv'
            ? 'Göteborg har mycket mjukt ytvatten (från Göta älv / Lackarebäck). För IPAs ger 4-6g Kalciumsulfat (Gypsum från Ölkompaniet) krispigare humlebeska. För NEIPA & Stouts ger 3-5g Kalciumklorid rundare och mjukare munkänsla!'
            : 'Gothenburg water is naturally soft. Add 4-6g Gypsum for crisp West Coast IPAs, or 3-5g Calcium Chloride for velvety NEIPAs & Stouts!'}
        </p>
      </div>
    </div>
  );
};
