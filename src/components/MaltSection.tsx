import React, { useState } from 'react';
import { MaltItem, Language } from '../types';
import { CATALOG_MALTS } from '../data/ingredients';
import { Plus, Trash2, ExternalLink, Wheat } from 'lucide-react';
import { playCanPop, playClick } from '../utils/audio';
import { srmToHexColor } from '../utils/brewingMath';

interface MaltSectionProps {
  malts: MaltItem[];
  onChange: (malts: MaltItem[]) => void;
  lang: Language;
}

export const MaltSection: React.FC<MaltSectionProps> = ({
  malts,
  onChange,
  lang,
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const totalGrainKg = malts.reduce((sum, m) => sum + m.amountKg, 0);

  const handleAddCatalogMalt = (catMalt: typeof CATALOG_MALTS[0]) => {
    playCanPop();
    const newItem: MaltItem = {
      id: `malt-${Date.now()}`,
      name: catMalt.name,
      brand: catMalt.brand,
      amountKg: 1.0,
      ebc: catMalt.ebc,
      potential: catMalt.potential,
      type: catMalt.type,
    };
    onChange([...malts, newItem]);
    setIsAdding(false);
  };

  const handleUpdateAmount = (id: string, amountKg: number) => {
    onChange(
      malts.map((m) =>
        m.id === id ? { ...m, amountKg: Math.max(0.05, Number(amountKg.toFixed(2))) } : m
      )
    );
  };

  const handleRemove = (id: string) => {
    playClick();
    onChange(malts.filter((m) => m.id !== id));
  };

  return (
    <div className="bg-brew-900/60 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Wheat className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              {lang === 'sv' ? 'Maltnota & Förjäsbart' : 'Grain Bill & Fermentables'}
            </h3>
            <p className="text-xs text-slate-400">
              {totalGrainKg.toFixed(2)} kg {lang === 'sv' ? 'totalt från Ölkompaniet' : 'total from Ölkompaniet'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playClick();
            setIsAdding(!isAdding);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{lang === 'sv' ? 'Tillsätt Malt' : 'Add Grain'}</span>
        </button>
      </div>

      {/* Allocation visual progress bar */}
      {totalGrainKg > 0 && (
        <div className="space-y-1.5">
          <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden flex ring-1 ring-slate-800">
            {malts.map((m) => {
              const pct = (m.amountKg / totalGrainKg) * 100;
              const color = srmToHexColor(m.ebc / 1.97);
              return (
                <div
                  key={m.id}
                  style={{ width: `${pct}%`, backgroundColor: color }}
                  title={`${m.name}: ${pct.toFixed(1)}%`}
                  className="h-full transition-all duration-300"
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Adding Catalog Malt Selector Dropdown */}
      {isAdding && (
        <div className="p-4 rounded-2xl bg-brew-950/80 border border-amber-500/30 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span>{lang === 'sv' ? 'Välj malt från Ölkompaniets sortiment:' : 'Pick malt from Ölkompaniet:'}</span>
            <button
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
            {CATALOG_MALTS.map((cm) => (
              <button
                key={cm.name}
                onClick={() => handleAddCatalogMalt(cm)}
                className="p-2.5 rounded-xl bg-brew-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 text-left transition flex items-center justify-between text-xs cursor-pointer group"
              >
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-amber-300">
                    {cm.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {cm.brand} • {cm.ebc} EBC
                  </div>
                </div>
                <span className="text-[11px] font-mono text-amber-400 font-semibold">
                  {cm.pricePerKgSek} kr/kg
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Malts List Table / Cards */}
      <div className="space-y-2">
        {malts.map((m) => {
          const pct = totalGrainKg > 0 ? (m.amountKg / totalGrainKg) * 100 : 0;
          const color = srmToHexColor(m.ebc / 1.97);

          return (
            <div
              key={m.id}
              className="p-3 sm:p-4 rounded-2xl bg-brew-950/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full border border-white/30 flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: color }}
                  title={`${m.ebc} EBC`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{m.name}</span>
                    <a
                      href={`https://www.olkompaniet.se/search?q=${encodeURIComponent(m.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Sök hos Ölkompaniet.se"
                      className="text-slate-500 hover:text-amber-400 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {m.brand} • {m.ebc} EBC • {pct.toFixed(1)}% av mäsken
                  </div>
                </div>
              </div>

              {/* Controls: Kg input & delete */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.05"
                    max="50"
                    value={m.amountKg}
                    onChange={(e) => handleUpdateAmount(m.id, parseFloat(e.target.value) || 0)}
                    className="w-16 bg-transparent text-right font-mono text-sm text-white focus:outline-none pr-1"
                  />
                  <span className="text-xs font-bold text-slate-400">kg</span>
                </div>

                <button
                  onClick={() => handleRemove(m.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
