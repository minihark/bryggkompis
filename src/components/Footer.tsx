import React from 'react';
import { ExternalLink, Beer } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-brew-950/80 py-8 px-4 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
            <span>🍺 Bryggkompis</span>
          </div>
          <span className="text-slate-700">•</span>
          <span>Baserat på sortimentet hos <a href="https://www.olkompaniet.se" target="_blank" rel="noreferrer" className="text-amber-400/90 hover:underline">Ölkompaniet.se</a></span>
        </div>

        {/* Center: Ecosystem */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
          <a
            href="https://puls.apps.harkco.se"
            target="_blank"
            rel="noreferrer"
            className="hover:text-amber-300 transition"
          >
            Puls (XRPL Monitor)
          </a>
          <a
            href="https://portfolio.apps.harkco.se"
            target="_blank"
            rel="noreferrer"
            className="hover:text-amber-300 transition"
          >
            Portfolio
          </a>
          <a
            href="https://fakt.apps.harkco.se"
            target="_blank"
            rel="noreferrer"
            className="hover:text-amber-300 transition"
          >
            Fakt
          </a>
          <a
            href="https://stamplunch.apps.harkco.se"
            target="_blank"
            rel="noreferrer"
            className="hover:text-amber-300 transition"
          >
            Stamplunch
          </a>
        </div>

        {/* Right */}
        <div className="text-slate-400">
          &copy; {new Date().getFullYear()} Harkco. Bryggt med passion & hantverk i Göteborg.
        </div>
      </div>
    </footer>
  );
};
