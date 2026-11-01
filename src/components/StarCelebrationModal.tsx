import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/soundEngine';
import { X, Award, Sparkles, Printer } from 'lucide-react';
import { VehicleConfig } from '../types';

interface StarCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  starsCount: number;
  totalStars: number;
  currentVehicle: VehicleConfig;
  lang: 'sv' | 'en';
}

export const StarCelebrationModal: React.FC<StarCelebrationModalProps> = ({
  isOpen,
  onClose,
  starsCount,
  totalStars,
  currentVehicle,
  lang,
}) => {
  const [driverName, setDriverName] = useState(() => {
    try {
      return localStorage.getItem('oriket_driver_name') || (lang === 'sv' ? 'Mästerföraren' : 'Master Driver');
    } catch {
      return 'Mästerföraren';
    }
  });

  useEffect(() => {
    if (isOpen) {
      sounds.playStarCollect(starsCount);
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
      });
      sounds.playVoiceClip('bra_jobbat', 'Bra jobbat!', lang);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-[#FFFDF9] rounded-3xl border-4 border-amber-300 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-2xl bg-white/90 border-2 border-amber-200 text-amber-900 flex items-center justify-center shadow-sm active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Card */}
        <div className="p-6 sm:p-8 text-center flex flex-col items-center bg-gradient-to-b from-amber-50 to-white">
          <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-amber-300 flex items-center justify-center text-4xl mb-3 shadow-inner">
            🏆
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-amber-600 mb-1">
            {lang === 'sv' ? 'Officiellt Körkort' : 'Official Driver License'}
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-amber-950 font-display">
            {lang === 'sv' ? 'Örikets Guld-Certifikat' : 'Island Gold Certificate'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 mb-4">
            {lang === 'sv'
              ? 'Tilldelas för mästerlig körning och upptäckarglädje i 3D!'
              : 'Awarded for masterful 3D exploration and driving joy!'}
          </p>

          {/* Name Plate */}
          <div className="w-full p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 mb-4 shadow-sm">
            <span className="text-xs text-amber-800 font-bold block mb-1">
              {lang === 'sv' ? 'Förarens Namn:' : "Driver's Name:"}
            </span>
            <input
              type="text"
              value={driverName}
              onChange={(e) => {
                setDriverName(e.target.value);
                try {
                  localStorage.setItem('oriket_driver_name', e.target.value);
                } catch {}
              }}
              className="w-full text-center text-lg sm:text-xl font-black text-amber-950 bg-white border-2 border-amber-300 rounded-xl py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-400 font-display"
              placeholder="Skriv ditt namn..."
            />
          </div>

          {/* Badges Row */}
          <div className="grid grid-cols-2 gap-3 w-full mb-5">
            <div className="p-3 rounded-2xl bg-white border-2 border-slate-200 flex flex-col items-center">
              <span className="text-2xl mb-1">⭐</span>
              <span className="text-xs text-slate-500 font-bold">
                {lang === 'sv' ? 'Stjärnor' : 'Stars'}
              </span>
              <span className="text-base font-black text-slate-800">
                {starsCount} / {totalStars}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white border-2 border-slate-200 flex flex-col items-center">
              <span className="text-2xl mb-1">{currentVehicle.emoji}</span>
              <span className="text-xs text-slate-500 font-bold">
                {lang === 'sv' ? 'Favoritfordon' : 'Favorite Ride'}
              </span>
              <span className="text-xs font-black text-slate-800 truncate max-w-full">
                {lang === 'sv' ? currentVehicle.nameSv : currentVehicle.nameEn}
              </span>
            </div>
          </div>

          {/* Close / Action Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-amber-400 active:bg-amber-500 text-amber-950 font-black text-base shadow-lg transition-transform active:scale-95"
          >
            {lang === 'sv' ? 'Jippi! Tillbaka till ön 🚗' : 'Hooray! Back to the Island 🚗'}
          </button>
        </div>
      </div>
    </div>
  );
};
