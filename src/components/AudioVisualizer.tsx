'use client';

import React from 'react';

interface Props {
  isActive: boolean;
  mode: 'listening' | 'speaking' | 'idle';
}

export default function AudioVisualizer({ isActive, mode }: Props) {
  return (
    <div className="flex items-center justify-center space-x-1.5 h-12 my-2">
      {[...Array(7)].map((_, i) => {
        let heightClass = 'h-3 bg-slate-700';

        if (isActive) {
          if (mode === 'listening') {
            heightClass = 'wave-bar bg-gradient-to-t from-emerald-500 to-teal-300';
          } else if (mode === 'speaking') {
            heightClass = 'wave-bar bg-gradient-to-t from-orange-500 to-amber-300';
          }
        }

        return (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-300 ${heightClass}`}
            style={{
              animationDelay: `${(i % 5) * 0.15}s`
            }}
          />
        );
      })}
    </div>
  );
}
