import React from 'react';
import { Language } from '../types';
import { ShoppingBag, Flame, Share2, Sparkles, Languages, Check, Beer } from 'lucide-react';
import { playCanPop, playCheersClink, playClick } from '../utils/audio';
import confetti from 'canvas-confetti';
import { getTranslation } from '../utils/translations';

interface NavbarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenShoppingList: () => void;
  onOpenBrewDay: () => void;
  onExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageChange,
  onOpenShoppingList,
  onOpenBrewDay,
  onExport,
}) => {
  const t = getTranslation(lang);

  const handleSkal = () => {
    playCanPop();
    playCheersClink();
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-brew-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/30">
            🍺
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-amber-200 via-white to-amber-400 bg-clip-text text-transparent">
                Bryggkompis
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Ölkompaniet
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {lang === 'sv' ? 'Receptplanerare för dig och din bror-i-lag' : 'Brew recipe planner for you and your brother-in-law'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Fun "Skål!" Cheers Button */}
          <button
            onClick={handleSkal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition cursor-pointer"
            title="Klicka för Skål!"
          >
            <span>🍻</span>
            <span>{t.skal}</span>
          </button>

          {/* Inköpslista */}
          <button
            onClick={() => {
              playClick();
              onOpenShoppingList();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-brew-900/70 hover:bg-brew-850 hover:border-amber-500/40 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{t.shoppingList}</span>
            <span className="md:hidden">Inköp</span>
          </button>

          {/* Bryggdag */}
          <button
            onClick={() => {
              playClick();
              onOpenBrewDay();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-brew-900/70 hover:bg-brew-850 hover:border-orange-500/40 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden md:inline">{t.brewDay}</span>
            <span className="md:hidden">Bryggdag</span>
          </button>

          {/* Export Recipe */}
          <button
            onClick={() => {
              playClick();
              onExport();
            }}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-800 bg-brew-900/70 hover:bg-brew-850 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs"
            title="Dela eller kopiera recept"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t.exportRecipe}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => {
              playClick();
              onLanguageChange(lang === 'sv' ? 'en' : 'sv');
            }}
            className="px-2.5 py-1.5 rounded-xl border border-slate-800 bg-brew-900/70 hover:bg-brew-850 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1"
            title="Byt språk / Switch Language"
          >
            <span>{lang === 'sv' ? '🇸🇪 SV' : '🇬🇧 EN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
