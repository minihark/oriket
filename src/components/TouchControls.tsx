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
    <div
      className="fixed inset-0 pointer-events-none select-none z-20 flex flex-col justify-between"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))',
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 1rem))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 1rem))',
      }}
    >
      {/* Top Spacer */}
      <div />

      {/* Bottom Controls Bar */}
      <div className="flex items-end justify-between w-full pointer-events-auto">
        {/* Left Side: Steering Controls & Horn */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Steer Left */}
          <button
            type="button"
            className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl bg-white/85 active:bg-amber-400 active:scale-95 backdrop-blur-md shadow-xl border-2 border-slate-200 flex items-center justify-center text-2xl sm:text-3xl text-slate-800 transition-transform touch-none select-none"
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
            className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl bg-white/85 active:bg-amber-400 active:scale-95 backdrop-blur-md shadow-xl border-2 border-slate-200 flex items-center justify-center text-2xl sm:text-3xl text-slate-800 transition-transform touch-none select-none"
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
            className="w-12 h-12 sm:w-15 sm:h-15 rounded-2xl sm:rounded-3xl bg-amber-200/90 active:bg-amber-400 active:scale-90 backdrop-blur-md shadow-lg border-2 border-amber-300 flex items-center justify-center text-2xl sm:text-3xl transition-transform touch-none select-none ml-1"
            onClick={onTriggerHorn}
          >
            {currentVehicle.hornEmoji}
          </button>
        </div>

        {/* Right Side: Driving, Jump & Special Action */}
        <div className="flex items-end gap-2 sm:gap-3">
          {/* Action / Jump Column */}
          <div className="flex flex-col gap-2 items-center">
            {/* Special Action (Water / Nitro) */}
            <button
              type="button"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sky-500/90 active:bg-sky-400 active:scale-90 text-white shadow-lg border-2 border-sky-300 flex items-center justify-center text-xl sm:text-2xl transition-transform touch-none select-none"
              onClick={onTriggerHorn}
              title={currentVehicle.traits.specialNameSv}
            >
              {currentVehicle.traits.special === 'water' ? '💦' : currentVehicle.traits.special === 'nitro' ? '🔥' : '⚡'}
            </button>

            {/* Jump Button */}
            <button
              type="button"
              className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-indigo-500/90 active:bg-indigo-400 active:scale-90 text-white shadow-lg border-2 border-indigo-300 flex items-center justify-center text-2xl sm:text-3xl transition-transform touch-none select-none"
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
            className="w-14 h-16 sm:w-18 sm:h-20 rounded-2xl sm:rounded-3xl bg-rose-500/90 active:bg-rose-400 active:scale-95 text-white backdrop-blur-md shadow-xl border-2 border-rose-300 flex flex-col items-center justify-center gap-0.5 transition-transform touch-none select-none"
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
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">Back</span>
          </button>

          {/* Gas Pedal */}
          <button
            type="button"
            className="w-17 h-20 sm:w-22 sm:h-24 rounded-3xl bg-emerald-500 active:bg-emerald-400 active:scale-95 text-white backdrop-blur-md shadow-2xl border-3 border-emerald-300 flex flex-col items-center justify-center gap-0.5 transition-transform touch-none select-none"
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
