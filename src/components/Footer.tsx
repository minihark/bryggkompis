import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#D8CEBE] bg-[#EFE9DC]/60 py-5 px-4 mt-10 text-center text-xs text-[#5C4B3B] print:hidden">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
        <div className="flex items-center gap-3">
          <span>BRYGGKOMPIS • HARKCO BRYGGSTUDIO (GÖTEBORG)</span>
          <a
            href="https://vakt.apps.harkco.se"
            target="_blank"
            rel="noopener noreferrer"
            title="Bryggkompis Status på Harkco Vakt"
            className="inline-block hover:opacity-90 transition-opacity"
          >
            <img
              src="https://vakt.apps.harkco.se/badge/brygg.svg"
              alt="Bryggkompis: operational"
              height="20"
              className="h-5 inline-block"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </a>
        </div>
        <span>RECEPTBLAD • MÄSKVATTEN • PRIMING • CO-OP SYNK</span>
      </div>
    </footer>
  );
};
