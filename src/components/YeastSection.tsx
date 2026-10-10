import React from 'react';
import { YeastItem, Language } from '../types';
import { CATALOG_YEASTS } from '../data/ingredients';
import { ExternalLink, FlaskConical, Thermometer } from 'lucide-react';
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
    <div className="bg-brew-900/60 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              {lang === 'sv' ? 'Jäststam & Jäsningsprofil' : 'Yeast Strain & Fermentation'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'sv' ? 'Påverkar slutdensitet (FG), estrar och alkoholhalt' : 'Determines FG, esters and alcohol level'}
            </p>
          </div>
        </div>

        <a
          href={`https://www.olkompaniet.se/search?q=${encodeURIComponent(yeast.name + ' jäst')}`}
          target="_blank"
          rel="noreferrer"
          title="Sök hos Ölkompaniet.se"
          className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold"
        >
          <span>Ölkompaniet</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Selector & Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">
            {lang === 'sv' ? 'Välj jäst från Ölkompaniets sortiment:' : 'Select Yeast from Ölkompaniet:'}
          </label>
          <select
            value={yeast.name}
            onChange={handleSelect}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-semibold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {CATALOG_YEASTS.map((y) => (
              <option key={y.name} value={y.name}>
                {y.name} ({y.brand}) — {y.attenuationPercent}% utjäsning
              </option>
            ))}
          </select>

          <p className="text-xs text-slate-300 italic pt-1 leading-relaxed">
            "{yeast.flavorNotes}"
          </p>
        </div>

        {/* Attenuation Slider & Temp Guide */}
        <div className="space-y-3 bg-brew-950/60 border border-slate-800/80 p-4 rounded-2xl">
          {/* Attenuation */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>{lang === 'sv' ? 'Utjäsning (Attenuation):' : 'Attenuation:'}</span>
              <span className="font-mono text-purple-400 font-bold">
                {yeast.attenuationPercent}%
              </span>
            </div>
            <input
              type="range"
              min="65"
              max="95"
              step="1"
              value={yeast.attenuationPercent}
              onChange={(e) =>
                onChange({ ...yeast, attenuationPercent: parseInt(e.target.value, 10) })
              }
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Fermentation Temp */}
          <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-800">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'sv' ? 'Rekommenderad temperatur:' : 'Recommended temp:'}</span>
            </span>
            <span className="font-mono font-bold text-slate-200">
              {yeast.tempMinC}°C – {yeast.tempMaxC}°C
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
