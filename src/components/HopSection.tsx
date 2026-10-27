import React, { useState } from 'react';
import { HopItem, HopUsage, Language } from '../types';
import { CATALOG_HOPS } from '../data/ingredients';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { playCanPop, playClick } from '../utils/audio';

interface HopSectionProps {
  hops: HopItem[];
  onChange: (hops: HopItem[]) => void;
  lang: Language;
}

export const HopSection: React.FC<HopSectionProps> = ({
  hops,
  onChange,
  lang,
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const totalHopsG = hops.reduce((sum, h) => sum + h.amountGrams, 0);

  const handleAddCatalogHop = (catHop: typeof CATALOG_HOPS[0]) => {
    playCanPop();
    const newItem: HopItem = {
      id: `hop-${Date.now()}`,
      name: catHop.name,
      amountGrams: 30,
      alphaAcid: catHop.alphaAcid,
      timeMinutes: 15,
      usage: 'boil',
      aromaTags: catHop.aromaTags,
    };
    onChange([...hops, newItem]);
    setIsAdding(false);
  };

  const handleUpdate = (id: string, updates: Partial<HopItem>) => {
    onChange(hops.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  const handleRemove = (id: string) => {
    playClick();
    onChange(hops.filter((h) => h.id !== id));
  };

  return (
    <div className="space-y-3.5">
      {/* Section Header */}
      <div className="flex items-baseline justify-between border-b border-[#D8CEBE] pb-2">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#2D5A27] font-bold block">
            02 • KETTLE & DRY HOPS
          </span>
          <h3 className="font-display font-bold text-lg text-[#1E1610]">
            {lang === 'sv' ? 'Humleschema' : 'Hop Schedule'}{' '}
            <span className="font-mono text-xs font-normal text-[#5C4B3B]">
              ({totalHopsG} g)
            </span>
          </h3>
        </div>

        <button
          onClick={() => {
            playClick();
            setIsAdding(!isAdding);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#E6EFE4] hover:bg-[#D6E5D3] border border-[#2D5A27]/30 text-xs font-semibold text-[#2D5A27] transition cursor-pointer print:hidden"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{lang === 'sv' ? 'Tillsätt humle' : 'Add Hops'}</span>
        </button>
      </div>

      {/* Catalog Hop Picker */}
      {isAdding && (
        <div className="p-3 rounded bg-[#EFE9DC] border border-[#2D5A27]/50 space-y-2 print:hidden">
          <div className="flex items-center justify-between text-xs font-bold text-[#1E1610]">
            <span>{lang === 'sv' ? 'Välj humle (Ölkompaniet):' : 'Pick hops:'}</span>
            <button
              onClick={() => setIsAdding(false)}
              className="text-[#5C4B3B] hover:text-[#1E1610] cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {CATALOG_HOPS.map((ch) => (
              <button
                key={ch.name}
                onClick={() => handleAddCatalogHop(ch)}
                className="p-2 rounded bg-[#FBF9F5] border border-[#D8CEBE] hover:border-[#2D5A27] text-left transition flex items-center justify-between text-xs cursor-pointer"
              >
                <div>
                  <div className="font-bold text-[#1E1610]">{ch.name}</div>
                  <div className="text-[10px] text-[#5C4B3B]">
                    {ch.alphaAcid}% AA • {ch.aromaTags.slice(0, 2).join(', ')}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#2D5A27] font-bold">
                  {ch.pricePer100gSek} kr
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hop Additions Ledger */}
      <div className="divide-y divide-[#E6DEC8] border border-[#D8CEBE] rounded bg-[#FBF9F5]">
        {hops.map((h) => (
          <div
            key={h.id}
            className="px-3 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#F7F3EB]/70 transition"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D5A27] shrink-0" />
                <span className="font-bold text-sm text-[#1E1610] truncate">
                  {h.name}
                </span>
                <span className="font-mono text-[11px] text-[#2D5A27] font-semibold">
                  ({h.alphaAcid}% AA)
                </span>
                <a
                  href={`https://www.olkompaniet.se/search?q=${encodeURIComponent(h.name + ' humle')}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Sök hos Ölkompaniet.se"
                  className="text-[#8A7765] hover:text-[#2D5A27] transition print:hidden"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="text-[11px] text-[#5C4B3B] pl-4 truncate">
                {h.aromaTags.join(' • ')}
              </div>
            </div>

            {/* Timing, Usage & Grams */}
            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
              <select
                value={h.usage}
                onChange={(e) => handleUpdate(h.id, { usage: e.target.value as HopUsage })}
                className="bg-[#EFE9DC] border border-[#C7B9A3] rounded px-2 py-1 text-xs text-[#1E1610] font-medium focus:outline-none"
              >
                <option value="boil">{lang === 'sv' ? 'Kok' : 'Boil'}</option>
                <option value="whirlpool">Whirlpool</option>
                <option value="dryhop">{lang === 'sv' ? 'Torr' : 'Dry'}</option>
              </select>

              {h.usage !== 'whirlpool' && (
                <div className="flex items-center bg-[#EFE9DC] border border-[#C7B9A3] rounded px-1.5 py-1">
                  <input
                    type="number"
                    step={h.usage === 'dryhop' ? 1 : 5}
                    min="0"
                    max="120"
                    value={h.timeMinutes}
                    onChange={(e) =>
                      handleUpdate(h.id, { timeMinutes: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-10 bg-transparent text-right font-mono text-xs font-bold text-[#1E1610] focus:outline-none pr-0.5"
                  />
                  <span className="text-[10px] font-mono text-[#5C4B3B]">
                    {h.usage === 'dryhop' ? 'd' : 'm'}
                  </span>
                </div>
              )}

              <div className="flex items-center bg-[#EFE9DC] border border-[#C7B9A3] rounded px-2 py-1">
                <input
                  type="number"
                  step="5"
                  min="5"
                  max="500"
                  value={h.amountGrams}
                  onChange={(e) =>
                    handleUpdate(h.id, { amountGrams: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-12 bg-transparent text-right font-mono text-sm font-bold text-[#1E1610] focus:outline-none pr-0.5"
                />
                <span className="text-xs font-mono text-[#5C4B3B]">g</span>
              </div>

              <button
                onClick={() => handleRemove(h.id)}
                className="p-1.5 text-[#8A7765] hover:text-[#B85D19] transition cursor-pointer print:hidden"
                title="Ta bort humle"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
