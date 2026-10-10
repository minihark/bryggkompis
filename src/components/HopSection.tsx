import React, { useState } from 'react';
import { HopItem, HopUsage, Language } from '../types';
import { CATALOG_HOPS } from '../data/ingredients';
import { Plus, Trash2, ExternalLink, Sparkles, Flower2 } from 'lucide-react';
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
    <div className="bg-brew-900/60 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Flower2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              {lang === 'sv' ? 'Humleschema & Aromgivor' : 'Hop Schedule & Additions'}
            </h3>
            <p className="text-xs text-slate-400">
              {totalHopsG}g {lang === 'sv' ? 'humle totalt (Pellets från Ölkompaniet)' : 'total hops (Pellets from Ölkompaniet)'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playClick();
            setIsAdding(!isAdding);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{lang === 'sv' ? 'Tillsätt Humle' : 'Add Hops'}</span>
        </button>
      </div>

      {/* Adding Catalog Hop Dropdown */}
      {isAdding && (
        <div className="p-4 rounded-2xl bg-brew-950/80 border border-emerald-500/30 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
            <span>{lang === 'sv' ? 'Välj humle från Ölkompaniets sortiment:' : 'Pick hops from Ölkompaniet:'}</span>
            <button
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
            {CATALOG_HOPS.map((ch) => (
              <button
                key={ch.name}
                onClick={() => handleAddCatalogHop(ch)}
                className="p-2.5 rounded-xl bg-brew-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-left transition flex items-center justify-between text-xs cursor-pointer group"
              >
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-emerald-300">
                    {ch.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {ch.alphaAcid}% Alfasyra • {ch.aromaTags.slice(0, 2).join(', ')}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  {ch.pricePer100gSek} kr
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hops List */}
      <div className="space-y-2.5">
        {hops.map((h) => {
          return (
            <div
              key={h.id}
              className="p-3.5 sm:p-4 rounded-2xl bg-brew-950/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              {/* Hop Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100">{h.name}</span>
                  <a
                    href={`https://www.olkompaniet.se/search?q=${encodeURIComponent(h.name + ' humle')}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Sök hos Ölkompaniet.se"
                    className="text-slate-500 hover:text-emerald-400 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-bold">
                    {h.alphaAcid}% AA
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {h.aromaTags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Controls: Usage type, Timing, Grams */}
              <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center">
                {/* Usage Selector */}
                <select
                  value={h.usage}
                  onChange={(e) => handleUpdate(h.id, { usage: e.target.value as HopUsage })}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-none"
                >
                  <option value="boil">{lang === 'sv' ? 'Kok (Boil)' : 'Boil'}</option>
                  <option value="whirlpool">{lang === 'sv' ? 'Whirlpool / Hop Stand' : 'Whirlpool'}</option>
                  <option value="dryhop">{lang === 'sv' ? 'Torrhumling (Dry hop)' : 'Dry hop'}</option>
                </select>

                {/* Timing input */}
                {h.usage === 'boil' && (
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
                    <input
                      type="number"
                      step="5"
                      min="0"
                      max="120"
                      value={h.timeMinutes}
                      onChange={(e) =>
                        handleUpdate(h.id, { timeMinutes: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-12 bg-transparent text-right font-mono text-xs text-white focus:outline-none pr-1"
                    />
                    <span className="text-[11px] text-slate-400">min</span>
                  </div>
                )}

                {h.usage === 'dryhop' && (
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="14"
                      value={h.timeMinutes}
                      onChange={(e) =>
                        handleUpdate(h.id, { timeMinutes: parseInt(e.target.value, 10) || 1 })
                      }
                      className="w-10 bg-transparent text-right font-mono text-xs text-white focus:outline-none pr-1"
                    />
                    <span className="text-[11px] text-slate-400">dagar</span>
                  </div>
                )}

                {/* Grams input */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
                  <input
                    type="number"
                    step="5"
                    min="5"
                    max="500"
                    value={h.amountGrams}
                    onChange={(e) =>
                      handleUpdate(h.id, { amountGrams: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-14 bg-transparent text-right font-mono text-sm font-bold text-white focus:outline-none pr-1"
                  />
                  <span className="text-xs font-bold text-slate-400">g</span>
                </div>

                <button
                  onClick={() => handleRemove(h.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
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
