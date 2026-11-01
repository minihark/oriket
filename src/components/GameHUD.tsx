import React from 'react';
import { VehicleConfig, VehicleId } from '../types';
import { VEHICLES } from '../vehicles/vehicleConfigs';
import { Volume2, VolumeX, RotateCcw, MapPin, Award } from 'lucide-react';
import { sounds } from '../audio/soundEngine';

interface GameHUDProps {
  currentVehicle: VehicleConfig;
  onSelectVehicle: (v: VehicleConfig) => void;
  starsCount: number;
  totalStars: number;
  onOpenMissions: () => void;
  onOpenDiploma: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  lang: 'sv' | 'en';
  onToggleLang: () => void;
  onRespawn: () => void;
  bannerMessage: string | null;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  currentVehicle,
  onSelectVehicle,
  starsCount,
  totalStars,
  onOpenMissions,
  onOpenDiploma,
  isMuted,
  onToggleMute,
  lang,
  onToggleLang,
  onRespawn,
  bannerMessage,
}) => {
  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none select-none z-30 p-2 sm:p-4 flex flex-col items-center gap-2">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between pointer-events-auto">
        {/* Star Counter Pill */}
        <button
          type="button"
          onClick={onOpenMissions}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white/90 active:bg-amber-100 backdrop-blur-md shadow-md border-2 border-amber-300 transition-transform active:scale-95"
        >
          <span className="text-xl sm:text-2xl animate-pulse">⭐</span>
          <div className="text-left leading-tight">
            <span className="text-xs font-bold text-amber-900 block">
              {lang === 'sv' ? 'Guldstjärnor' : 'Gold Stars'}
            </span>
            <span className="text-sm sm:text-base font-black text-amber-950 font-display">
              {starsCount} / {totalStars}
            </span>
          </div>
        </button>

        {/* Center: Vehicle Quick Switcher Dock */}
        <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-2xl bg-white/85 backdrop-blur-md shadow-md border-2 border-slate-200">
          {VEHICLES.map((v) => {
            const isSelected = v.id === currentVehicle.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  if (!isSelected) {
                    onSelectVehicle(v);
                    sounds.startEngine(v.id);
                    sounds.playHorn(v.honkSound);
                  }
                }}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl transition-all ${
                  isSelected
                    ? 'bg-amber-400 scale-105 shadow-md border-2 border-amber-500'
                    : 'bg-slate-100/80 active:bg-slate-200 text-slate-700'
                }`}
                title={lang === 'sv' ? v.nameSv : v.nameEn}
              >
                {v.emoji}
              </button>
            );
          })}
        </div>

        {/* Right Settings Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Trophy / Diploma Button if 5+ stars */}
          {starsCount >= 5 && (
            <button
              type="button"
              onClick={onOpenDiploma}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400 active:bg-amber-500 text-amber-950 shadow-md border-2 border-amber-300 flex items-center justify-center transition-transform active:scale-95"
              title={lang === 'sv' ? 'Se Diplom!' : 'View Trophy!'}
            >
              <Award className="w-5 h-5 text-amber-950 fill-amber-950" />
            </button>
          )}

          {/* Reset Position Button */}
          <button
            type="button"
            onClick={onRespawn}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/85 active:bg-slate-100 text-slate-700 shadow-md border-2 border-slate-200 flex items-center justify-center transition-transform active:scale-95"
            title={lang === 'sv' ? 'Ställ bilen rätt' : 'Respawn car'}
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/85 active:bg-slate-100 text-slate-700 shadow-md border-2 border-slate-200 flex items-center justify-center transition-transform active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />}
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={onToggleLang}
            className="h-10 sm:h-11 px-2.5 rounded-xl bg-white/85 active:bg-slate-100 text-slate-800 font-black text-xs sm:text-sm shadow-md border-2 border-slate-200 flex items-center justify-center"
          >
            {lang === 'sv' ? '🇸🇪 SV' : '🇬🇧 EN'}
          </button>
        </div>
      </div>

      {/* Floating Animated Banner Toast */}
      {bannerMessage && (
        <div className="pointer-events-none mt-1 px-4 py-2 rounded-2xl bg-slate-900/85 backdrop-blur-md border-2 border-amber-300 text-amber-300 font-black text-sm sm:text-base shadow-xl animate-bounce">
          {bannerMessage}
        </div>
      )}
    </div>
  );
};
