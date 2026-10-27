import React from 'react';
import { Language } from '../types';
import { ShoppingBag, Users, Flame, FileText } from 'lucide-react';
import { playClick } from '../utils/audio';

interface NavbarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  activeMode: 'recipe' | 'brewday';
  onModeChange: (mode: 'recipe' | 'brewday') => void;
  completedStepsCount: number;
  onOpenShoppingList: () => void;
  onOpenRecipePicker: () => void;
  onOpenCoop: () => void;
  peersCount?: number;
  currentRoom?: string;
  isConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageChange,
  activeMode,
  onModeChange,
  completedStepsCount,
  onOpenShoppingList,
  onOpenRecipePicker,
  onOpenCoop,
  peersCount = 1,
  currentRoom = 'BROR',
  isConnected = false,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-[#D8CEBE] bg-[#F7F3EB]/95 backdrop-blur-sm w-full print:hidden">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Left: Craft Brewery Brand & Style Picker Trigger */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => {
              playClick();
              onModeChange('recipe');
            }}
            className="flex items-center gap-2 text-left cursor-pointer group"
          >
            <span className="w-7 h-7 rounded bg-[#1E1610] text-[#F7F3EB] flex items-center justify-center text-sm shadow-xs">
              🍺
            </span>
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-[#1E1610] group-hover:text-[#B85D19] transition-colors">
              Bryggkompis
            </span>
          </button>

          <span className="text-[#C7B9A3] hidden sm:inline">/</span>

          <button
            onClick={() => {
              playClick();
              onOpenRecipePicker();
            }}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-[#5C4B3B] hover:text-[#B85D19] transition cursor-pointer"
          >
            <span>{lang === 'sv' ? 'Byt ölstil & recept' : 'Change beer style'}</span>
            <span className="text-[10px] text-[#B85D19]">▾</span>
          </button>
        </div>

        {/* Center: Primary 2-Mode Switch (Receptblad vs Bryggdag & Klocka) */}
        <div className="flex items-center bg-[#EFE9DC] border border-[#D8CEBE] p-0.5 rounded">
          <button
            onClick={() => {
              playClick();
              onModeChange('recipe');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xs text-xs font-bold transition cursor-pointer ${
              activeMode === 'recipe'
                ? 'bg-[#1E1610] text-[#F7F3EB] shadow-2xs'
                : 'text-[#5C4B3B] hover:text-[#1E1610]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'sv' ? 'Receptblad' : 'Recipe Sheet'}</span>
          </button>

          <button
            onClick={() => {
              playClick();
              onModeChange('brewday');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xs text-xs font-bold transition cursor-pointer ${
              activeMode === 'brewday'
                ? 'bg-[#B85D19] text-[#FBF9F5] shadow-2xs'
                : 'text-[#5C4B3B] hover:text-[#1E1610]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{lang === 'sv' ? 'Bryggdag & Klocka' : 'Brew Day'}</span>
            <span
              className={`font-mono text-[10px] px-1 rounded ${
                activeMode === 'brewday'
                  ? 'bg-black/20 text-white'
                  : 'bg-[#D8CEBE]/70 text-[#1E1610]'
              }`}
            >
              {completedStepsCount}/10
            </span>
          </button>
        </div>

        {/* Right: Quiet Drawers (Inköpslista & Co-op Room) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playClick();
              onOpenShoppingList();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#FBF9F5] border border-[#D8CEBE] hover:border-[#B85D19] text-xs font-semibold text-[#1E1610] transition cursor-pointer"
            title={lang === 'sv' ? 'Öppna inköpslista (Ölkompaniet)' : 'Open shopping list'}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#B85D19]" />
            <span className="hidden md:inline">{lang === 'sv' ? 'Inköpslista' : 'Shopping'}</span>
          </button>

          <button
            onClick={() => {
              playClick();
              onOpenCoop();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#FBF9F5] border border-[#D8CEBE] hover:border-[#B85D19] text-xs font-mono font-semibold text-[#1E1610] transition cursor-pointer"
            title={lang === 'sv' ? `Co-op rum: ${currentRoom}` : `Co-op room: ${currentRoom}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-[#2D5A27]' : 'bg-[#B85D19]'
              }`}
            />
            <span className="hidden sm:inline">{currentRoom}</span>
            {peersCount > 1 && (
              <span className="text-[10px] text-[#2D5A27] font-bold">({peersCount})</span>
            )}
            <Users className="w-3.5 h-3.5 text-[#5C4B3B] sm:hidden" />
          </button>

          <button
            onClick={() => {
              playClick();
              onLanguageChange(lang === 'sv' ? 'en' : 'sv');
            }}
            className="hidden lg:inline-flex px-2 py-1.5 rounded bg-[#EFE9DC] border border-[#D8CEBE] hover:border-[#B85D19] font-mono text-[11px] font-bold text-[#5C4B3B] hover:text-[#1E1610] transition cursor-pointer"
          >
            {lang === 'sv' ? 'SV' : 'EN'}
          </button>
        </div>
      </div>
    </header>
  );
};
