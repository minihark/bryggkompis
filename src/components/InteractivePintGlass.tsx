import React from 'react';
import { playBubble, playCheersClink } from '../utils/audio';

interface InteractivePintGlassProps {
  colorHex: string;
  ebc: number;
  abv: number;
  ibu: number;
}

export const InteractivePintGlass: React.FC<InteractivePintGlassProps> = ({
  colorHex,
  ebc,
  abv,
  ibu,
}) => {
  const handleClick = () => {
    playCheersClink();
    playBubble();
  };

  return (
    <div
      onClick={handleClick}
      title="Klicka på glaset för ett 'Skål!' och kolsyre-bubblor!"
      className="relative flex flex-col items-center justify-center p-4 cursor-pointer select-none group transition-transform hover:scale-105 active:scale-95"
    >
      {/* Pint Glass Outer Frame */}
      <div className="relative w-28 h-48 sm:w-32 sm:h-52">
        {/* Glass Silhouette */}
        <div className="absolute inset-0 border-4 border-slate-600/60 rounded-b-3xl bg-slate-900/40 backdrop-blur-sm overflow-hidden shadow-2xl ring-1 ring-white/10">
          {/* Glass Highlight Reflection Left */}
          <div className="absolute top-2 left-2 w-2 h-40 bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-full z-20 pointer-events-none" />

          {/* Liquid Body */}
          <div
            className="absolute bottom-0 inset-x-0 top-6 transition-colors duration-500 flex flex-col justify-end"
            style={{ backgroundColor: colorHex }}
          >
            {/* Ambient lighting inside liquid */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />

            {/* Rising Carbonation Bubbles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
              <span className="absolute bottom-2 left-1/4 w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDuration: '1.2s' }} />
              <span className="absolute bottom-4 left-1/2 w-1 h-1 bg-white/70 rounded-full animate-bounce" style={{ animationDuration: '0.8s' }} />
              <span className="absolute bottom-1 left-3/4 w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDuration: '1.5s' }} />
              <span className="absolute bottom-8 left-1/3 w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" style={{ animationDuration: '1.1s' }} />
            </div>

            {/* Beer Foam Head (Skumkrona) */}
            <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-amber-50 to-amber-100/90 shadow-md flex items-center justify-center border-b border-amber-200/40">
              {/* Foam cloud bubbles */}
              <div className="w-full flex justify-around -top-2 relative">
                <span className="w-4 h-3 bg-amber-50 rounded-full" />
                <span className="w-5 h-3.5 bg-amber-50 rounded-full" />
                <span className="w-6 h-4 bg-amber-50 rounded-full" />
                <span className="w-4 h-3 bg-amber-50 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Heavy Glass Base */}
        <div className="absolute -bottom-2 inset-x-4 h-3 bg-slate-500/80 rounded-b-xl shadow-lg" />
      </div>

      {/* Glass Badges */}
      <div className="mt-4 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
            {ebc} EBC
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
            {abv}% ABV
          </span>
          <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-bold">
            {ibu} IBU
          </span>
        </div>
        <span className="text-[10px] text-slate-400 group-hover:text-amber-400 transition-colors">
          Klicka för skål! 🍻
        </span>
      </div>
    </div>
  );
};
