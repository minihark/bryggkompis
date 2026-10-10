import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { playCanPop, playCheersClink } from '../utils/audio';
import { CheersEvent } from '../utils/coop';
import { Sparkles, Beer, Heart } from 'lucide-react';

interface CheersOverlayProps {
  lastCheers: CheersEvent | null;
  onDismiss: () => void;
  myUserName: string;
}

export const CheersOverlay: React.FC<CheersOverlayProps> = ({
  lastCheers,
  onDismiss,
  myUserName,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastCheers) return;

    setVisible(true);

    // Audio effect
    playCanPop();
    setTimeout(() => {
      playCheersClink();
    }, 120);

    // Dynamic amber & gold beer confetti explosion
    try {
      confetti({
        particleCount: 90,
        spread: 100,
        origin: { y: 0.55 },
        colors: ['#f59e0b', '#d97706', '#fbbf24', '#fef3c7', '#ffffff'],
        shapes: ['circle', 'square'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 60,
          origin: { x: 0.1, y: 0.7 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff'],
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 60,
          origin: { x: 0.9, y: 0.7 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff'],
        });
      }, 250);
    } catch (e) {}

    // Auto dismiss after 3.8 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 3800);

    return () => clearTimeout(timer);
  }, [lastCheers]);

  if (!visible || !lastCheers) return null;

  const isMe = lastCheers.user.toLowerCase() === myUserName.toLowerCase();

  return (
    <div
      onClick={() => {
        setVisible(false);
        onDismiss();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer select-none"
    >
      <div className="relative max-w-md w-full bg-gradient-to-b from-brew-900 via-brew-950 to-stone-950 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(245,158,11,0.35)] overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
        {/* Amber radial glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/30 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Clinking Beer Pints */}
        <div className="relative h-36 flex items-center justify-center my-2">
          {/* Left Pint */}
          <div className="text-6xl sm:text-7xl transition-transform duration-300 transform -translate-x-4 rotate-12 animate-bounce">
            🍺
          </div>

          {/* Impact Sparkle / Foam Splash */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-3xl sm:text-4xl animate-ping opacity-90">✨</span>
            <span className="absolute text-2xl -top-2 animate-pulse">💥</span>
          </div>

          {/* Right Pint */}
          <div className="text-6xl sm:text-7xl transition-transform duration-300 transform translate-x-4 -rotate-12 animate-bounce" style={{ animationDelay: '0.1s' }}>
            🍻
          </div>
        </div>

        {/* Cheers Title Banner */}
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-xs tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isMe ? 'Du utbringade en skål!' : `${lastCheers.user} utbringade en skål!`}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent tracking-tight">
            SKÅL FÖR BRYGGDAGEN!
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-medium">
            {isMe
              ? 'Båda era skärmar klingar och kolsyran bubblar! 🍻'
              : `"${lastCheers.user}" skålar med dig just nu! Båda era skärmar firar!`}
          </p>

          {lastCheers.message && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 font-medium text-sm italic">
              "{lastCheers.message}"
            </div>
          )}

          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>Klicka var som helst för att fortsätta brygga</span>
          </div>
        </div>
      </div>
    </div>
  );
};
