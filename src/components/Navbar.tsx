import React, { useState } from 'react';
import { Language } from '../types';
import {
  ShoppingBag,
  Flame,
  Share2,
  Menu,
  X,
  Languages,
  Check,
  Beer,
  Sparkles,
} from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = getTranslation(lang);

  const handleSkal = () => {
    playCanPop();
    playCheersClink();
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-brew-950/90 backdrop-blur-md w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-lg sm:text-xl shadow-md shadow-amber-500/20 ring-1 ring-amber-400/30 flex-shrink-0">
            🍺
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-amber-200 via-white to-amber-400 bg-clip-text text-transparent truncate">
                Bryggkompis
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
                Ölkompaniet
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block truncate">
              {lang === 'sv'
                ? 'Receptplanerare för dig och din bror-i-lag'
                : 'Brew recipe planner for you and your brother-in-law'}
            </p>
          </div>
        </div>

        {/* Desktop Controls (hidden on mobile, visible on sm/md+) */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-2.5">
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
            className="p-2 rounded-xl border border-slate-800 bg-brew-900/70 hover:bg-brew-850 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs"
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

        {/* Mobile Header Bar (compact, fits every phone!) */}
        <div className="flex sm:hidden items-center gap-1.5">
          {/* Quick Skål! on mobile */}
          <button
            onClick={handleSkal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-black text-xs shadow-sm active:scale-95 transition"
          >
            <span>🍻</span>
            <span>Skål!</span>
          </button>

          {/* Quick Inköpslista Icon */}
          <button
            onClick={() => {
              playClick();
              onOpenShoppingList();
            }}
            className="p-2 rounded-xl border border-slate-800 bg-brew-900 text-amber-400 active:scale-95 transition"
            title="Inköpslista"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          {/* Quick Bryggdag Icon */}
          <button
            onClick={() => {
              playClick();
              onOpenBrewDay();
            }}
            className="p-2 rounded-xl border border-slate-800 bg-brew-900 text-orange-400 active:scale-95 transition"
            title="Bryggdag"
          >
            <Flame className="w-4 h-4" />
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => {
              playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="p-2 rounded-xl border border-slate-800 bg-brew-900 text-slate-300 active:scale-95 transition"
            title="Öppna meny"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown (when hamburger is opened) */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-800/80 bg-brew-950/95 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                playClick();
                setMobileMenuOpen(false);
                onOpenShoppingList();
              }}
              className="p-3 rounded-xl bg-brew-900 border border-slate-800 text-left flex items-center gap-2.5 text-xs font-semibold text-slate-200 active:bg-brew-850"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>{t.shoppingList}</span>
            </button>

            <button
              onClick={() => {
                playClick();
                setMobileMenuOpen(false);
                onOpenBrewDay();
              }}
              className="p-3 rounded-xl bg-brew-900 border border-slate-800 text-left flex items-center gap-2.5 text-xs font-semibold text-slate-200 active:bg-brew-850"
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span>{t.brewDay}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <button
              onClick={() => {
                playClick();
                setMobileMenuOpen(false);
                onExport();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 active:bg-slate-850"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.exportRecipe}</span>
            </button>

            <button
              onClick={() => {
                playClick();
                onLanguageChange(lang === 'sv' ? 'en' : 'sv');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-amber-300 active:bg-slate-850"
            >
              <span>{lang === 'sv' ? '🇸🇪 Svenska' : '🇬🇧 English'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
