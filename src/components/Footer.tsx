import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#D8CEBE] bg-[#EFE9DC]/60 py-5 px-4 mt-10 text-center text-xs text-[#5C4B3B] print:hidden">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px]">
        <span>BRYGGKOMPIS • HARKCO BRYGGSTUDIO (GÖTEBORG)</span>
        <span>RECEPTBLAD • MÄSKVATTEN • PRIMING • CO-OP SYNK</span>
      </div>
    </footer>
  );
};
