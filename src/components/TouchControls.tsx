import React from 'react';
import { VehicleInput, VehicleConfig } from '../types';

interface TouchControlsProps {
  inputState: VehicleInput;
  setInputState: React.Dispatch<React.SetStateAction<VehicleInput>>;
  onTriggerHorn: () => void;
  currentVehicle: VehicleConfig;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  setInputState,
  onTriggerHorn,
  currentVehicle,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3 sm:p-6">
      {/* Top Bar Spacer */}
      <div />

      {/* Bottom Controls Bar */}
      <div className="flex items-end justify-between w-full pointer-events-auto">
        {/* Left Side: Steering Controls */}
        <div className="flex items-center gap-3">
          {/* Steer Left */}
          <button
            type="button"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/80 active:bg-amber-400 active:scale-95 backdrop-blur-md shadow-lg border-2 border-slate-200 flex items-center justify-center text-3xl sm:text-4xl text-slate-800 transition-transform touch-none select-none"
            onPointerDown={(e) => {
              e.preventDefault();
              setInputState((prev: VehicleInput) => ({ ...prev, steer: -1 }));
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setInputState((prev: VehicleInput) => ({ ...prev, steer: 0 }));
            }}
            onPointerLeave={() => {
              setInputState((prev: VehicleInput) => ({ ...prev, steer: 0 }));
            }}
          >
            ◀
          </button>

          {/* Steer Right */}
          <button
            type="button"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/80 active:bg-amber-400 active:scale-95 backdrop-blur-md shadow-lg border-2 border-slate-200 flex items-center justify-center text-3xl sm:text-4xl text-slate-800 transition-transform touch-none select-none"
            onPointerDown={(e) => {
              e.preventDefault();
              setInputState((prev: VehicleInput) => ({ ...prev, steer: 1 }));
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setInputState((prev: VehicleInput) => ({ ...prev, steer: 0 }));
            }}
            onPointerLeave={() => {
              setInputState((prev: VehicleInput) => ({ ...prev, steer: 0 }));
            }}
          >
            ▶
          </button>

          {/* Honk Horn Button */}
          <button
            type="button"
            className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-amber-100/90 active:bg-amber-300 active:scale-90 backdrop-blur-md shadow-md border-2 border-amber-300 flex items-center justify-center text-2xl sm:text-3xl transition-transform touch-none select-none ml-1"
            onClick={onTriggerHorn}
          >
            {currentVehicle.hornEmoji}
          </button>
        </div>

        {/* Right Side: Driving, Jump & Special Action */}
        <div className="flex items-end gap-3">
          {/* Action / Jump Column */}
          <div className="flex flex-col gap-2.5 items-center">
            {/* Special Action (Water / Nitro) */}
            <button
              type="button"
              className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-sky-500/90 active:bg-sky-400 active:scale-95 text-white shadow-md border-2 border-sky-300 flex items-center justify-center text-2xl transition-transform touch-none select-none"
              onClick={onTriggerHorn}
              title={currentVehicle.traits.specialNameSv}
            >
              {currentVehicle.traits.special === 'water' ? '💦' : currentVehicle.traits.special === 'nitro' ? '🔥' : '⚡'}
            </button>

            {/* Jump Button */}
            <button
              type="button"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-indigo-500/90 active:bg-indigo-400 active:scale-90 text-white shadow-lg border-2 border-indigo-300 flex items-center justify-center text-2xl sm:text-3xl transition-transform touch-none select-none"
              onPointerDown={(e) => {
                e.preventDefault();
                setInputState((prev: VehicleInput) => ({ ...prev, jump: true }));
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                setInputState((prev: VehicleInput) => ({ ...prev, jump: false }));
              }}
              onPointerLeave={() => {
                setInputState((prev: VehicleInput) => ({ ...prev, jump: false }));
              }}
            >
              🦘
            </button>
          </div>

          {/* Reverse Pedal */}
          <button
            type="button"
            className="w-16 h-18 sm:w-20 sm:h-22 rounded-2xl sm:rounded-3xl bg-rose-500/85 active:bg-rose-400 active:scale-95 text-white backdrop-blur-md shadow-lg border-2 border-rose-300 flex flex-col items-center justify-center gap-1 transition-transform touch-none select-none"
            onPointerDown={(e) => {
              e.preventDefault();
              setInputState((prev: VehicleInput) => ({ ...prev, throttle: -1 }));
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setInputState((prev: VehicleInput) => ({ ...prev, throttle: 0 }));
            }}
            onPointerLeave={() => {
              setInputState((prev: VehicleInput) => ({ ...prev, throttle: 0 }));
            }}
          >
            <span className="text-xl sm:text-2xl">🛑</span>
            <span className="text-xs font-black uppercase tracking-wider">Back</span>
          </button>

          {/* Gas Pedal */}
          <button
            type="button"
            className="w-20 h-22 sm:w-24 sm:h-26 rounded-3xl bg-emerald-500 active:bg-emerald-400 active:scale-95 text-white backdrop-blur-md shadow-xl border-3 border-emerald-300 flex flex-col items-center justify-center gap-1 transition-transform touch-none select-none"
            onPointerDown={(e) => {
              e.preventDefault();
              setInputState((prev: VehicleInput) => ({ ...prev, throttle: 1 }));
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setInputState((prev: VehicleInput) => ({ ...prev, throttle: 0 }));
            }}
            onPointerLeave={() => {
              setInputState((prev: VehicleInput) => ({ ...prev, throttle: 0 }));
            }}
          >
            <span className="text-3xl sm:text-4xl">🚀</span>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Gas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
