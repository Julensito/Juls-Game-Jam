/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const timeBlocks = [
    { label: 'Días', value: timeLeft.days, color: 'text-purple-400' },
    { label: 'Horas', value: timeLeft.hours, color: 'text-cyan-400' },
    { label: 'Minutos', value: timeLeft.minutes, color: 'text-indigo-400' },
    { label: 'Segundos', value: timeLeft.seconds, color: 'text-emerald-400 shadow-emerald-500/10' }
  ];

  if (timeLeft.isOver) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-950/20 border border-red-500/30 rounded-xl max-w-md mx-auto">
        <span className="text-red-400 font-mono font-medium text-sm tracking-wide">
          ⏳ ¡La Game Jam ha finalizado! La fase de entrega está cerrada.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5 py-2">
      <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">Tiempo restante para finalizar:</p>
      <div className="flex gap-3 md:gap-4 justify-center items-center">
        {timeBlocks.map((block, index) => (
          <div key={block.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="px-3.5 py-2 md:px-5 md:py-3 bg-slate-900/80 border border-slate-800 rounded-lg min-w-[64px] md:min-w-[80px] flex items-center justify-center shadow-lg shadow-black/40">
                <span className={`text-2xl md:text-3xl font-bold font-mono ${block.color} tabular-nums transition-all`}>
                  {String(block.value).padStart(2, '0')}
                </span>
              </div>
              <span className="text-[10px] md:text-xs text-slate-400 mt-1.5 font-sans font-medium">
                {block.label}
              </span>
            </div>
            {index < 3 && (
              <span className="text-amber-500 text-xl font-bold font-mono ml-3 md:ml-4 animate-pulse leading-none -translate-y-3">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
