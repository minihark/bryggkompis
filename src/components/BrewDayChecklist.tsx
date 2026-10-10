import React, { useState, useEffect } from 'react';
import { Recipe, BrewCalculations, Language } from '../types';
import { X, Play, Pause, RotateCcw, CheckCircle2, Circle, Clock, Flame, Sparkles } from 'lucide-react';
import { playClick, playCanPop, playCheersClink } from '../utils/audio';
import confetti from 'canvas-confetti';

interface BrewDayChecklistProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  metrics: BrewCalculations;
  lang: Language;
}

export const BrewDayChecklist: React.FC<BrewDayChecklistProps> = ({
  isOpen,
  onClose,
  recipe,
  metrics,
  lang,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Boil timer state (in seconds)
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

  if (!isOpen) return null;

  const toggleStep = (id: string) => {
    playClick();
    const willComplete = !completedSteps[id];
    setCompletedSteps((prev) => ({ ...prev, [id]: willComplete }));
    if (willComplete && Object.keys(completedSteps).length >= 9) {
      playCheersClink();
    }
  };

  const steps = [
    {
      id: 'step-1',
      title: lang === 'sv' ? '1. Värm mäskvatten' : '1. Heat Strike Water',
      desc:
        lang === 'sv'
          ? `Mät upp ${metrics.mashWaterL} Liter vatten. Värm till ca ${recipe.mashTempC + 4}°C.`
          : `Measure ${metrics.mashWaterL}L water. Heat to ~${recipe.mashTempC + 4}°C.`,
    },
    {
      id: 'step-2',
      title: lang === 'sv' ? '2. Inmäskning & Rör om' : '2. Mash In',
      desc:
        lang === 'sv'
          ? `Rör i ${metrics.totalGrainKg} kg krossad malt noggrant. Säkerställ inga klumpar och kontrollera måltemperatur ${recipe.mashTempC}°C.`
          : `Stir in ${metrics.totalGrainKg}kg crushed malt thoroughly. Target ${recipe.mashTempC}°C.`,
    },
    {
      id: 'step-3',
      title: lang === 'sv' ? '3. Rastra (60 minuter)' : '3. Mash Rest (60 min)',
      desc:
        lang === 'sv'
          ? 'Låt stå med lock och isolering i 60 minuter för full försockring av stärkelsen.'
          : 'Hold temperature with lid on for 60 minutes for complete starch conversion.',
    },
    {
      id: 'step-4',
      title: lang === 'sv' ? '4. Utmäskning (76°C)' : '4. Mash Out (76°C)',
      desc:
        lang === 'sv'
          ? 'Höj temperaturen till 76°C i 10 minuter för att stoppa enzymaktiviteten och göra vörten mer lättflytande.'
          : 'Raise temp to 76°C for 10 min to stop enzymes and ease lautering.',
    },
    {
      id: 'step-5',
      title: lang === 'sv' ? '5. Recirkulering & Lakning' : '5. Sparge & Collect Wort',
      desc:
        lang === 'sv'
          ? `Recirkulera (vorlauf) tills vörten rinner klar. Laka med ${metrics.spargeWaterL} Liter 78°C varmt vatten över malten ner i kokkärlet.`
          : `Recirculate until clear. Sparge with ${metrics.spargeWaterL}L at 78°C into boil kettle.`,
    },
    {
      id: 'step-6',
      title: lang === 'sv' ? '6. Uppkok & Skumning' : '6. Bring to Boil',
      desc:
        lang === 'sv'
          ? 'Koka upp vörten till rullande kok. Skumma av det översta proteinet (hot break) för renare öl.'
          : 'Bring to a rolling boil and skim hot break foam.',
    },
    {
      id: 'step-7',
      title: lang === 'sv' ? '7. Kok & Humlegivor' : '7. Hop Additions',
      desc:
        lang === 'sv'
          ? `Koka i ${recipe.boilTimeMin} min. Tillsätt humlen enligt schemat (${recipe.hops.length} givor). Tillsätt Protafloc sista 15 min.`
          : `Boil for ${recipe.boilTimeMin} min. Add hops according to schedule. Add Protafloc at 15 min.`,
    },
    {
      id: 'step-8',
      title: lang === 'sv' ? '8. Whirlpool & Kylning' : '8. Whirlpool & Chill',
      desc:
        lang === 'sv'
          ? 'Skapa whirlpool för att samla humlerester i mitten. Kyl snabbt ner vörten till < 20°C (eller 35°C för Kveik) med kylspiral.'
          : 'Whirlpool and chill rapidly with wort chiller to < 20°C.',
    },
    {
      id: 'step-9',
      title: lang === 'sv' ? '9. Mät OG & Pitsta Jäst' : '9. Measure OG & Pitch Yeast',
      desc:
        lang === 'sv'
          ? `Mät OG med hydrometer (mål: ${metrics.og}). Häll över till rengjord jäshink, syresätt kraftigt och pitsta ${recipe.yeast.name}.`
          : `Measure OG (target: ${metrics.og}). Aerate wort and pitch ${recipe.yeast.name}.`,
    },
    {
      id: 'step-10',
      title: lang === 'sv' ? '10. Jäslås på & Skål!' : '10. Airlock & Cheers!',
      desc:
        lang === 'sv'
          ? 'Fyll jäsröret med desinfektionsmedel eller sprit. Ställ mörkt i jästemperatur. Skåla för en väl genomförd bryggdag!'
          : 'Fill airlock with sanitizer. Store at ferment temp. Celebrate with a cheers!',
    },
  ];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-brew-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {lang === 'sv' ? 'Bryggdagsprotokoll' : 'Brew Day Protocol'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'sv' ? `Steg-för-steg checklista för ${recipe.name}` : `Step-by-step for ${recipe.name}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Interactive Boil Timer Widget */}
          <div className="bg-brew-950/80 border border-orange-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-orange-400 tracking-wider">
                  {lang === 'sv' ? 'Kok- & Giv-Timer' : 'Boil Countdown Timer'}
                </span>
                <div className="text-3xl font-black font-mono text-white mt-0.5">
                  {formatTime(timerSeconds)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playClick();
                  setIsTimerRunning(!isTimerRunning);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  isTimerRunning
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'bg-orange-600 hover:bg-orange-500 text-white shadow-md'
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isTimerRunning ? (lang === 'sv' ? 'Pausa' : 'Pause') : (lang === 'sv' ? 'Starta Timer' : 'Start Timer')}</span>
              </button>

              <button
                onClick={() => {
                  playClick();
                  setIsTimerRunning(false);
                  setTimerSeconds(recipe.boilTimeMin * 60);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                title="Återställ timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Checklist Steps */}
          <div className="space-y-2.5">
            {steps.map((st) => {
              const done = !!completedSteps[st.id];
              return (
                <div
                  key={st.id}
                  onClick={() => toggleStep(st.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    done
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400 opacity-70'
                      : 'bg-brew-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button className="mt-0.5 flex-shrink-0 text-emerald-400">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 fill-emerald-500/20 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                    )}
                  </button>

                  <div className="space-y-0.5">
                    <div
                      className={`text-sm font-bold ${
                        done ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {st.title}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-brew-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {Object.values(completedSteps).filter(Boolean).length} / {steps.length}{' '}
            {lang === 'sv' ? 'steg avklarade' : 'steps complete'}
          </span>

          <button
            onClick={() => {
              playCheersClink();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            {lang === 'sv' ? 'Klar för idag!' : 'Close Checklist'}
          </button>
        </div>
      </div>
    </div>
  );
};
