import React, { useState } from 'react';
import { MaltItem, Language } from '../types';
import { CATALOG_MALTS } from '../data/ingredients';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
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
      amountKg: 0.5,
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
    <div className="space-y-3.5">
      {/* Section Header */}
      <div className="flex items-baseline justify-between border-b border-[#D8CEBE] pb-2">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#B85D19] font-bold block">
            01 • FERMENTABLES
          </span>
          <h3 className="font-display font-bold text-lg text-[#1E1610]">
            {lang === 'sv' ? 'Maltnota' : 'Grain Bill'}{' '}
            <span className="font-mono text-xs font-normal text-[#5C4B3B]">
              ({totalGrainKg.toFixed(2)} kg)
            </span>
          </h3>
        </div>

        <button
          onClick={() => {
            playClick();
            setIsAdding(!isAdding);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EFE9DC] hover:bg-[#E4DAC7] border border-[#C7B9A3] text-xs font-semibold text-[#1E1610] transition cursor-pointer print:hidden"
        >
          <Plus className="w-3.5 h-3.5 text-[#B85D19]" />
          <span>{lang === 'sv' ? 'Tillsätt malt' : 'Add Malt'}</span>
        </button>
      </div>

      {/* Grain Color Proportional Strip */}
      {totalGrainKg > 0 && (
        <div className="h-2 w-full bg-[#EFE9DC] rounded-xs overflow-hidden flex border border-[#D8CEBE]">
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
      )}

      {/* Catalog Malt Picker */}
      {isAdding && (
        <div className="p-3 rounded bg-[#EFE9DC] border border-[#B85D19]/50 space-y-2 print:hidden">
          <div className="flex items-center justify-between text-xs font-bold text-[#1E1610]">
            <span>{lang === 'sv' ? 'Välj malt (Ölkompaniet):' : 'Pick malt:'}</span>
            <button
              onClick={() => setIsAdding(false)}
              className="text-[#5C4B3B] hover:text-[#1E1610] cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {CATALOG_MALTS.map((cm) => (
              <button
                key={cm.name}
                onClick={() => handleAddCatalogMalt(cm)}
                className="p-2 rounded bg-[#FBF9F5] border border-[#D8CEBE] hover:border-[#B85D19] text-left transition flex items-center justify-between text-xs cursor-pointer"
              >
                <div>
                  <div className="font-bold text-[#1E1610]">{cm.name}</div>
                  <div className="text-[10px] text-[#5C4B3B]">
                    {cm.brand} • {cm.ebc} EBC
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#B85D19] font-bold">
                  {cm.pricePerKgSek} kr/kg
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Malt Ledger Rows */}
      <div className="divide-y divide-[#E6DEC8] border border-[#D8CEBE] rounded bg-[#FBF9F5]">
        {malts.map((m) => {
          const pct = totalGrainKg > 0 ? (m.amountKg / totalGrainKg) * 100 : 0;
          const color = srmToHexColor(m.ebc / 1.97);

          return (
            <div
              key={m.id}
              className="px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-[#F7F3EB]/70 transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-[#1E1610]/30 shrink-0"
                  style={{ backgroundColor: color }}
                  title={`${m.ebc} EBC`}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#1E1610] truncate">
                      {m.name}
                    </span>
                    <a
                      href={`https://www.olkompaniet.se/search?q=${encodeURIComponent(m.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Sök hos Ölkompaniet.se"
                      className="text-[#8A7765] hover:text-[#B85D19] transition print:hidden"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="text-[11px] text-[#5C4B3B] font-mono">
                    {m.brand} • {m.ebc} EBC • {pct.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Weight Input & Remove */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center bg-[#EFE9DC] border border-[#C7B9A3] rounded px-2 py-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.05"
                    max="50"
                    value={m.amountKg}
                    onChange={(e) =>
                      handleUpdateAmount(m.id, parseFloat(e.target.value) || 0)
                    }
                    className="w-14 bg-transparent text-right font-mono text-sm font-bold text-[#1E1610] focus:outline-none pr-1"
                  />
                  <span className="text-xs font-mono text-[#5C4B3B]">kg</span>
                </div>

                <button
                  onClick={() => handleRemove(m.id)}
                  className="p-1.5 text-[#8A7765] hover:text-[#B85D19] transition cursor-pointer print:hidden"
                  title="Ta bort malt"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
