import React, { useState } from 'react';
import { Recipe, BrewCalculations, Language } from '../types';
import { CATALOG_MALTS, CATALOG_HOPS, CATALOG_YEASTS } from '../data/ingredients';
import { X, ExternalLink, ShoppingBag, Copy, Check, DollarSign } from 'lucide-react';
import { playClick, playCanPop } from '../utils/audio';

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  metrics: BrewCalculations;
  lang: Language;
}

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({
  isOpen,
  onClose,
  recipe,
  metrics,
  lang,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Aggregate malts into kg
  const maltItems = recipe.malts.map((m) => {
    const kgBags = Math.ceil(m.amountKg);
    const cat = CATALOG_MALTS.find((c) => c.name.toLowerCase().includes(m.name.toLowerCase()));
    const pricePerKg = cat ? cat.pricePerKgSek : 32;
    const cost = kgBags * pricePerKg;
    const query = cat ? cat.searchQuery : `${m.name} malt`;
    return {
      name: m.name,
      amountNeeded: m.amountKg,
      bagsToBuy: `${kgBags} kg`,
      cost,
      searchUrl: `https://www.olkompaniet.se/search?q=${encodeURIComponent(query)}`,
    };
  });

  // Aggregate hops into 100g bags
  const hopGroups = new Map<string, number>();
  recipe.hops.forEach((h) => {
    hopGroups.set(h.name, (hopGroups.get(h.name) || 0) + h.amountGrams);
  });

  const hopItems = Array.from(hopGroups.entries()).map(([name, grams]) => {
    const bags100g = Math.max(1, Math.ceil(grams / 100));
    const cat = CATALOG_HOPS.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));
    const pricePerBag = cat ? cat.pricePer100gSek : 85;
    const cost = bags100g * pricePerBag;
    const query = cat ? cat.searchQuery : `${name} humle 100g`;
    return {
      name,
      gramsNeeded: grams,
      bagsToBuy: `${bags100g} x 100g påse`,
      cost,
      searchUrl: `https://www.olkompaniet.se/search?q=${encodeURIComponent(query)}`,
    };
  });

  // Yeast
  const yeastCat = CATALOG_YEASTS.find((y) => y.name === recipe.yeast.name);
  const yeastCost = yeastCat ? yeastCat.priceSek : 55;
  const yeastItem = {
    name: recipe.yeast.name,
    amount: '1 påse (11.5g)',
    cost: yeastCost,
    searchUrl: `https://www.olkompaniet.se/search?q=${encodeURIComponent(
      yeastCat ? yeastCat.searchQuery : recipe.yeast.name
    )}`,
  };

  const totalCost =
    maltItems.reduce((s, m) => s + m.cost, 0) +
    hopItems.reduce((s, h) => s + h.cost, 0) +
    yeastCost +
    20; // Protafloc tabletter

  const handleCopy = () => {
    playClick();
    const textLines = [
      `🛒 INKÖPSLISTA ÖLKOMPANIET.SE — ${recipe.name.toUpperCase()}`,
      `Bryggvolym: ${recipe.batchSizeL} Liter • Estimerad kostnad: ~${totalCost} kr`,
      '',
      '🌾 MALT (Köp hela kilon):',
      ...maltItems.map((m) => `- ${m.name}: ${m.bagsToBuy} (Recept: ${m.amountNeeded} kg)`),
      '',
      '🌿 HUMLE (100g påsar):',
      ...hopItems.map((h) => `- ${h.name}: ${h.bagsToBuy} (Recept: ${h.gramsNeeded} g)`),
      '',
      '🧪 JÄST & EXTRA:',
      `- ${yeastItem.name}: 1 påse`,
      '- Protafloc klarningsmedel: 1 tablett',
      '',
      'Beställ på: https://www.olkompaniet.se',
    ];

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-brew-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {lang === 'sv' ? 'Inköpslista Ölkompaniet' : 'Ölkompaniet Shopping List'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'sv'
                  ? `Avrundat till butikens förpackningar (1kg malt, 100g humle) för ${recipe.name}`
                  : `Packaged quantities for ${recipe.name}`}
              </p>
            </div>
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
          {/* Malt Bill */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>🌾 {lang === 'sv' ? 'Malt & Råfrukt' : 'Grain Bill'}</span>
            </h4>
            <div className="divide-y divide-slate-800/60 bg-brew-950/70 rounded-2xl border border-slate-800 p-2">
              {maltItems.map((m) => (
                <div
                  key={m.name}
                  className="p-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200 block">{m.name}</span>
                    <span className="text-[11px] text-slate-400">
                      Recept: {m.amountNeeded} kg &rarr; Köp:{' '}
                      <strong className="text-amber-300">{m.bagsToBuy}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-300">~{m.cost} kr</span>
                    <a
                      href={m.searchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition"
                      title="Sök hos Ölkompaniet"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hops */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>🌿 {lang === 'sv' ? 'Humle (100g Pellets)' : 'Hops (100g Pellets)'}</span>
            </h4>
            <div className="divide-y divide-slate-800/60 bg-brew-950/70 rounded-2xl border border-slate-800 p-2">
              {hopItems.map((h) => (
                <div
                  key={h.name}
                  className="p-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200 block">{h.name}</span>
                    <span className="text-[11px] text-slate-400">
                      Recept: {h.gramsNeeded} g &rarr; Köp:{' '}
                      <strong className="text-emerald-300">{h.bagsToBuy}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-300">~{h.cost} kr</span>
                    <a
                      href={h.searchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 transition"
                      title="Sök hos Ölkompaniet"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yeast & Finings */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <span>🧪 {lang === 'sv' ? 'Jäst & Klarning' : 'Yeast & Finings'}</span>
            </h4>
            <div className="divide-y divide-slate-800/60 bg-brew-950/70 rounded-2xl border border-slate-800 p-2 text-xs">
              <div className="p-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">{yeastItem.name}</span>
                  <span className="text-[11px] text-slate-400">1 påse torrjäst</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-300">~{yeastItem.cost} kr</span>
                  <a
                    href={yeastItem.searchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-purple-500/20 text-slate-400 hover:text-purple-300 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="p-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Protafloc Klarningsmedel</span>
                  <span className="text-[11px] text-slate-400">1 tablett tillsätts sista 15 min av koket</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-300">~20 kr</span>
                  <a
                    href="https://www.olkompaniet.se/search?q=protafloc"
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-purple-500/20 text-slate-400 hover:text-purple-300 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Total & Summary Box */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider block">
                {lang === 'sv' ? 'Estimerat butikspris:' : 'Total estimated cost:'}
              </span>
              <span className="text-[11px] text-slate-400">
                {lang === 'sv' ? 'Hämta i butik i Göteborg eller beställ online' : 'Store pickup in Gothenburg or online order'}
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-amber-300">
              ~{totalCost} kr
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-brew-950/80 flex items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? (lang === 'sv' ? 'Kopierat!' : 'Copied!') : (lang === 'sv' ? 'Kopiera Inköpslista' : 'Copy Shopping List')}</span>
          </button>

          <a
            href="https://www.olkompaniet.se"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <span>{lang === 'sv' ? 'Öppna Ölkompaniet.se' : 'Open Ölkompaniet.se'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
