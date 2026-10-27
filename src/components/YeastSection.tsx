import React from 'react';
import { YeastItem, Language } from '../types';
import { CATALOG_YEASTS } from '../data/ingredients';
import { ExternalLink, Thermometer } from 'lucide-react';
import { playClick } from '../utils/audio';

interface YeastSectionProps {
  yeast: YeastItem;
  onChange: (yeast: YeastItem) => void;
  lang: Language;
}

export const YeastSection: React.FC<YeastSectionProps> = ({
  yeast,
  onChange,
  lang,
}) => {
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playClick();
    const found = CATALOG_YEASTS.find((y) => y.name === e.target.value);
    if (found) {
      onChange({
        id: `yeast-${Date.now()}`,
        name: found.name,
        brand: found.brand,
        attenuationPercent: found.attenuationPercent,
        tempMinC: found.tempMinC,
        tempMaxC: found.tempMaxC,
        form: found.form,
        flavorNotes: found.flavorNotes,
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between border-b border-[#D8CEBE] pb-2">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#B85D19] font-bold block">
            03 • FERMENTATION
          </span>
          <h3 className="font-display font-bold text-lg text-[#1E1610]">
            {lang === 'sv' ? 'Jäststam & Utjäsning' : 'Yeast Strain & Attenuation'}
          </h3>
        </div>

        <a
          href={`https://www.olkompaniet.se/search?q=${encodeURIComponent(yeast.name + ' jäst')}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#B85D19] hover:underline print:hidden"
        >
          <span>Ölkompaniet</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="p-3.5 rounded bg-[#FBF9F5] border border-[#D8CEBE] space-y-3">
        <div>
          <select
            value={yeast.name}
            onChange={handleSelect}
            className="w-full bg-[#EFE9DC] border border-[#C7B9A3] rounded px-3 py-2 text-sm font-bold text-[#1E1610] focus:outline-none focus:border-[#B85D19] cursor-pointer"
          >
            {CATALOG_YEASTS.map((y) => (
              <option key={y.name} value={y.name}>
                {y.name} ({y.brand}) — {y.attenuationPercent}% utjäsning
              </option>
            ))}
          </select>
          <p className="text-xs font-serif italic text-[#5C4B3B] mt-2 leading-relaxed">
            “{yeast.flavorNotes}”
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6DEC8] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#5C4B3B]">
              {lang === 'sv' ? 'Utjäsning:' : 'Attenuation:'}
            </span>
            <input
              type="range"
              min="65"
              max="92"
              step="1"
              value={yeast.attenuationPercent}
              onChange={(e) =>
                onChange({ ...yeast, attenuationPercent: parseInt(e.target.value, 10) })
              }
              className="w-24 accent-[#B85D19] cursor-pointer print:hidden"
            />
            <span className="font-mono font-bold text-[#B85D19]">
              {yeast.attenuationPercent}%
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#5C4B3B]">
            <Thermometer className="w-3.5 h-3.5 text-[#B85D19]" />
            <span>{lang === 'sv' ? 'Jästemp:' : 'Temp:'}</span>
            <strong className="font-mono text-[#1E1610]">
              {yeast.tempMinC}–{yeast.tempMaxC}°C
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
