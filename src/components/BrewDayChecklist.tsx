import React, { useState, useEffect } from 'react';
import { Recipe, BrewCalculations, Language } from '../types';
import { X, Play, Pause, RotateCcw, CheckCircle2, Circle, Clock } from 'lucide-react';
import { playClick, playCanPop, playCheersClink } from '../utils/audio';
import confetti from 'canvas-confetti';

interface BrewDayChecklistProps {
  isOpen?: boolean;
  onClose?: () => void;
  recipe: Recipe;
  metrics: BrewCalculations;
  lang: Language;
  embedded?: boolean;
  externalCompletedSteps?: Record<string, boolean>;
  onStepToggle?: (stepId: string, completed: boolean) => void;
}

export const BrewDayChecklist: React.FC<BrewDayChecklistProps> = ({
  isOpen = false,
  onClose,
  recipe,
  metrics,
  lang,
  embedded = false,
  externalCompletedSteps,
  onStepToggle,
}) => {
  const [internalCompletedSteps, setInternalCompletedSteps] = useState<Record<string, boolean>>({});
  const completedSteps = externalCompletedSteps ?? internalCompletedSteps;

  const [timerSeconds, setTimerSeconds] = useState(recipe.boilTimeMin * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      playCanPop();
      try {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  if (!isOpen && !embedded) return null;

  const toggleStep = (id: string) => {
    playClick();
    const willComplete = !completedSteps[id];
    if (onStepToggle) {
      onStepToggle(id, willComplete);
    } else {
      setInternalCompletedSteps((prev) => ({ ...prev, [id]: willComplete }));
    }
    if (willComplete && Object.keys(completedSteps).length >= 9) {
      playCheersClink();
    }
  };

  const steps = [
    {
      id: 'step-1',
      title: lang === 'sv' ? '01. Värm mäskvatten (Strike)' : '01. Heat Strike Water',
      desc:
        lang === 'sv'
          ? `Mät upp ${metrics.mashWaterL} L vatten och värm till ca ${recipe.mashTempC + 4}°C.`
          : `Measure ${metrics.mashWaterL}L water and heat to ~${recipe.mashTempC + 4}°C.`,
      presetMin: 20,
    },
    {
      id: 'step-2',
      title: lang === 'sv' ? '02. Inmäskning' : '02. Mash In',
      desc:
        lang === 'sv'
          ? `Rör ner ${metrics.totalGrainKg} kg krossad malt. Kontrollera måltemperatur ${recipe.mashTempC}°C.`
          : `Stir in ${metrics.totalGrainKg}kg crushed malt. Target ${recipe.mashTempC}°C.`,
    },
    {
      id: 'step-3',
      title: lang === 'sv' ? '03. Försockringsrast (60 min)' : '03. Mash Rest (60 min)',
      desc:
        lang === 'sv'
          ? `Håll ${recipe.mashTempC}°C i 60 minuter med locket på.`
          : 'Hold mash temperature for 60 minutes.',
      presetMin: 60,
    },
    {
      id: 'step-4',
      title: lang === 'sv' ? '04. Utmäskning (76°C • 10 min)' : '04. Mash Out (76°C)',
      desc:
        lang === 'sv'
          ? 'Höj till 76°C i 10 minuter inför lakning.'
          : 'Raise temp to 76°C for 10 min.',
      presetMin: 10,
    },
    {
      id: 'step-5',
      title: lang === 'sv' ? '05. Lakning (Sparge)' : '05. Sparge & Lauter',
      desc:
        lang === 'sv'
          ? `Laka långsamt med ${metrics.spargeWaterL} L 77°C vatten ner i kokkärlet.`
          : `Sparge with ${metrics.spargeWaterL}L at 77°C into boil kettle.`,
    },
    {
      id: 'step-6',
      title: lang === 'sv' ? '06. Uppkok & Skumning' : '06. Bring to Boil',
      desc:
        lang === 'sv'
          ? 'Koka upp vörten till rullande kok och skumma av hot break.'
          : 'Bring to a rolling boil and skim foam.',
    },
    {
      id: 'step-7',
      title: lang === 'sv' ? `07. Vörtkok (${recipe.boilTimeMin} min) & Humlegivor` : '07. Boil & Hop Additions',
      desc:
        lang === 'sv'
          ? `Koka i ${recipe.boilTimeMin} min. Följ humleschemat (${recipe.hops.length} givor) och tillsätt Protafloc vid 15 min kvar.`
          : `Boil for ${recipe.boilTimeMin} min. Add hops according to schedule.`,
      presetMin: recipe.boilTimeMin,
    },
    {
      id: 'step-8',
      title: lang === 'sv' ? '08. Whirlpool & Kylning' : '08. Whirlpool & Chill',
      desc:
        lang === 'sv'
          ? `Kyl snabbt ner vörten till ${recipe.yeast.tempMinC + 1}°C med kylspiral.`
          : 'Chill rapidly with wort chiller.',
      presetMin: 20,
    },
    {
      id: 'step-9',
      title: lang === 'sv' ? `09. Mät OG (Mål ${metrics.og}) & Tillsätt Jäst` : '09. Measure OG & Pitch Yeast',
      desc:
        lang === 'sv'
          ? `Kontrollera OG (${metrics.og}), syresätt vörten ordentligt och tillsätt ${recipe.yeast.name}.`
          : `Measure OG (${metrics.og}), aerate and pitch ${recipe.yeast.name}.`,
    },
    {
      id: 'step-10',
      title: lang === 'sv' ? '10. Jäslås på & Skål!' : '10. Airlock & Cheers!',
      desc:
        lang === 'sv'
          ? `Sätt på vattenlås med Star San och ställ i ${recipe.yeast.tempMinC}–${recipe.yeast.tempMaxC}°C.`
          : 'Fit airlock and ferment at target temperature.',
    },
  ];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;

  const contentMarkup = (
    <div
      className={`bg-[#FBF9F5] border border-[#D8CEBE] rounded-lg w-full ${
        embedded ? 'shadow-sm' : 'max-w-2xl shadow-2xl max-h-[90vh] flex flex-col'
      } overflow-hidden`}
    >
      {/* Copper Kettle Timer Bar */}
      <div className="bg-[#1E1610] text-[#F7F3EB] px-5 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-[#B85D19]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded bg-[#B85D19] text-[#FBF9F5] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#D4C7B8]">
              {lang === 'sv' ? 'BRYGGKLOCKA • KOK & MÄSKNING' : 'BREW KETTLE TIMER'}
            </div>
            <div className="font-mono font-bold text-3xl sm:text-4xl text-[#F7F3EB] leading-none mt-1">
              {formatTime(timerSeconds)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Timer Presets */}
          {[
            { label: '60m', secs: 60 * 60 },
            { label: '15m', secs: 15 * 60 },
            { label: '10m', secs: 10 * 60 },
          ].map((p) => (
            <button
              key={p.label}
              onClick={() => {
                playClick();
                setIsTimerRunning(false);
                setTimerSeconds(p.secs);
              }}
              className="px-2.5 py-1.5 rounded bg-[#2E231A] hover:bg-[#45372B] border border-[#5C4B3B] font-mono text-xs text-[#EBE3D8] transition cursor-pointer"
            >
              {p.label}
            </button>
          ))}

          <button
            onClick={() => {
              playClick();
              setIsTimerRunning(!isTimerRunning);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
              isTimerRunning
                ? 'bg-[#EFE9DC] text-[#1E1610]'
                : 'bg-[#B85D19] hover:bg-[#9E4D12] text-[#FBF9F5]'
            }`}
          >
            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isTimerRunning ? (lang === 'sv' ? 'Pausa' : 'Pause') : (lang === 'sv' ? 'Starta' : 'Start')}</span>
          </button>

          <button
            onClick={() => {
              playClick();
              setIsTimerRunning(false);
              setTimerSeconds(recipe.boilTimeMin * 60);
            }}
            className="p-2 rounded bg-[#2E231A] hover:bg-[#45372B] text-[#B5A390] hover:text-white transition cursor-pointer"
            title="Återställ"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {!embedded && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded bg-[#2E231A] text-[#B5A390] hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Step-by-Step Brewer's Protocol */}
      <div className="p-5 sm:p-6 overflow-y-auto space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#D8CEBE]">
          <h3 className="font-display font-bold text-lg text-[#1E1610]">
            {lang === 'sv' ? `Bryggschema — ${recipe.name}` : `Brew Schedule — ${recipe.name}`}
          </h3>
          <span className="font-mono text-xs font-bold text-[#B85D19]">
            {completedCount} / {steps.length} {lang === 'sv' ? 'klara' : 'done'}
          </span>
        </div>

        <div className="divide-y divide-[#E6DEC8] border border-[#D8CEBE] rounded bg-[#F7F3EB]/50">
          {steps.map((st) => {
            const done = !!completedSteps[st.id];
            return (
              <div
                key={st.id}
                onClick={() => toggleStep(st.id)}
                className={`p-3.5 transition cursor-pointer flex items-start justify-between gap-3 ${
                  done
                    ? 'bg-[#EFE9DC]/60 text-[#8A7765]'
                    : 'bg-[#FBF9F5] hover:bg-[#F7F3EB] text-[#1E1610]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button className="mt-0.5 shrink-0">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-[#2D5A27]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#C7B9A3]" />
                    )}
                  </button>
                  <div>
                    <div
                      className={`font-display font-bold text-base ${
                        done ? 'line-through text-[#8A7765]' : 'text-[#1E1610]'
                      }`}
                    >
                      {st.title}
                    </div>
                    <p className="text-xs text-[#5C4B3B] mt-0.5 leading-relaxed">{st.desc}</p>
                  </div>
                </div>

                {st.presetMin && !done && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playClick();
                      setTimerSeconds(st.presetMin! * 60);
                      setIsTimerRunning(true);
                    }}
                    className="px-2 py-1 rounded bg-[#EFE9DC] hover:bg-[#B85D19] hover:text-white border border-[#C7B9A3] font-mono text-[11px] font-bold text-[#1E1610] shrink-0 transition cursor-pointer"
                  >
                    ⏱ {st.presetMin}m
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return contentMarkup;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      {contentMarkup}
    </div>
  );
};
