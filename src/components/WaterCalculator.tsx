import React, { useState } from 'react';
import { BrewCalculations, Language } from '../types';

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
  const [targetCo2Vols, setTargetCo2Vols] = useState<number>(2.4);

  // Strike water thermodynamic formula (grain at 20°C): Tw = (0.2 / R) * (T2 - T1) + T2
  const waterToGrainRatio =
    metrics.totalGrainKg > 0 ? metrics.mashWaterL / metrics.totalGrainKg : 3.0;
  const strikeTempC = Number(
    (mashTempC + (0.41 / Math.max(2, waterToGrainRatio)) * (mashTempC - 20)).toFixed(1)
  );

  // Priming sugar (table sugar / sucrose at 20°C fermenter residual ~0.85 vols CO2)
  const primingGramsPerL = Math.max(0, (targetCo2Vols - 0.85) * 4.0);
  const totalPrimingSugarG = Math.round(primingGramsPerL * batchSizeL);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between border-b border-[#D8CEBE] pb-2">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#B85D19] font-bold block">
            04 • LIQUOR & CARBONATION
          </span>
          <h3 className="font-display font-bold text-lg text-[#1E1610]">
            {lang === 'sv' ? 'Mäskvatten & Kolsyresättning' : 'Mash Water & Priming'}
          </h3>
        </div>
        <span className="font-mono text-xs text-[#5C4B3B]">
          Totalt {metrics.totalWaterL} L vatten
        </span>
      </div>

      <div className="p-3.5 rounded bg-[#FBF9F5] border border-[#D8CEBE] space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded bg-[#EFE9DC] border border-[#D8CEBE]">
            <div className="font-mono text-[10px] uppercase text-[#5C4B3B]">
              {lang === 'sv' ? 'Mäskvatten' : 'Strike Water'}
            </div>
            <div className="font-mono font-bold text-base text-[#1E1610] mt-0.5">
              {metrics.mashWaterL} L
            </div>
            <div className="font-mono text-[10px] text-[#B85D19] font-semibold">
              Värm till {strikeTempC}°C
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#EFE9DC] border border-[#D8CEBE]">
            <div className="font-mono text-[10px] uppercase text-[#5C4B3B]">
              {lang === 'sv' ? 'Lakvatten' : 'Sparge Water'}
            </div>
            <div className="font-mono font-bold text-base text-[#1E1610] mt-0.5">
              {metrics.spargeWaterL} L
            </div>
            <div className="font-mono text-[10px] text-[#5C4B3B]">
              77°C lakning
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#EFE9DC] border border-[#D8CEBE]">
            <div className="font-mono text-[10px] uppercase text-[#5C4B3B]">
              {lang === 'sv' ? 'Primingsocker' : 'Priming Sugar'}
            </div>
            <div className="font-mono font-bold text-base text-[#B85D19] mt-0.5">
              {totalPrimingSugarG} g
            </div>
            <div className="font-mono text-[10px] text-[#5C4B3B]">
              {primingGramsPerL.toFixed(1)} g/L ({targetCo2Vols} vol)
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#E6DEC8] text-xs text-[#5C4B3B] print:hidden">
          <span>{lang === 'sv' ? 'Kolsyrenivå (flaskjäsning):' : 'Carbonation (CO₂ vols):'}</span>
          <div className="flex items-center gap-1">
            {[2.0, 2.4, 2.7].map((v) => (
              <button
                key={v}
                onClick={() => setTargetCo2Vols(v)}
                className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold transition cursor-pointer ${
                  targetCo2Vols === v
                    ? 'bg-[#B85D19] text-[#FBF9F5]'
                    : 'bg-[#EFE9DC] text-[#5C4B3B] hover:text-[#1E1610]'
                }`}
              >
                {v} vol
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
