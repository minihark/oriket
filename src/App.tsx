import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VehicleConfig, VehicleId, VehicleInput } from './types';
import { VEHICLES } from './vehicles/vehicleConfigs';
import { GameCanvas3D } from './components/GameCanvas3D';
import { TouchControls } from './components/TouchControls';
import { GameHUD } from './components/GameHUD';
import { MissionGuideModal } from './components/MissionGuideModal';
import { StarCelebrationModal } from './components/StarCelebrationModal';
import { sounds } from './audio/soundEngine';

export const App: React.FC = () => {
  // Vehicle Selection
  const [currentVehicle, setCurrentVehicle] = useState<VehicleConfig>(VEHICLES[0]);

  // Stars Collection State (persisted in localStorage)
  const [starsCollected, setStarsCollected] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('oriket_stars');
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set<string>();
  });

  // Modal States
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [isDiplomaOpen, setIsDiplomaOpen] = useState(false);

  // Audio & Language Settings
  const [isMuted, setIsMuted] = useState(false);
  const [lang, setLang] = useState<'sv' | 'en'>('sv');

  // Driving Input State
  const [inputState, setInputState] = useState<VehicleInput>({
    throttle: 0,
    steer: 0,
    jump: false,
    handbrake: false,
    action: false,
  });

  const [hornTrigger, setHornTrigger] = useState(0);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const bannerTimerRef = useRef<number | null>(null);

  const showBanner = useCallback((text: string) => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    setBannerMessage(text);
    bannerTimerRef.current = window.setTimeout(() => {
      setBannerMessage(null);
    }, 3200);
  }, []);

  // Handle Star Collection
  const handleStarCollected = useCallback((starId: string, totalCount: number) => {
    setStarsCollected((prev) => {
      const next = new Set(prev);
      next.add(starId);
      try {
        localStorage.setItem('oriket_stars', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });

    if (totalCount === 20) {
      setTimeout(() => {
        setIsDiplomaOpen(true);
      }, 1000);
    }
  }, []);

  // Keyboard Controls Integration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // Driving
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        setInputState((prev: VehicleInput) => ({ ...prev, throttle: 1 }));
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        setInputState((prev: VehicleInput) => ({ ...prev, throttle: -1 }));
      } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        setInputState((prev: VehicleInput) => ({ ...prev, steer: -1 }));
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        setInputState((prev: VehicleInput) => ({ ...prev, steer: 1 }));
      } else if (e.key === ' ') {
        setInputState((prev: VehicleInput) => ({ ...prev, jump: true }));
      } else if (e.key === 'Shift') {
        setInputState((prev: VehicleInput) => ({ ...prev, handbrake: true }));
      } else if (e.key === 'e' || e.key === 'E') {
        setHornTrigger((prev) => prev + 1);
      } else if (e.key === 'h' || e.key === 'H') {
        setHornTrigger((prev) => prev + 1);
      } else if (e.key === '1') {
        setCurrentVehicle(VEHICLES[0]);
      } else if (e.key === '2') {
        setCurrentVehicle(VEHICLES[1]);
      } else if (e.key === '3') {
        setCurrentVehicle(VEHICLES[2]);
      } else if (e.key === '4') {
        setCurrentVehicle(VEHICLES[3]);
      } else if (e.key === '5') {
        setCurrentVehicle(VEHICLES[4]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        setInputState((prev: VehicleInput) => ({ ...prev, throttle: 0 }));
      } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft' || e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        setInputState((prev: VehicleInput) => ({ ...prev, steer: 0 }));
      } else if (e.key === ' ') {
        setInputState((prev: VehicleInput) => ({ ...prev, jump: false }));
      } else if (e.key === 'Shift') {
        setInputState((prev: VehicleInput) => ({ ...prev, handbrake: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Gamepad Loop Integration
  useEffect(() => {
    let animId: number;
    const pollGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0];
      if (gp) {
        // Axis 0: Left Stick X
        const steerAxis = Math.abs(gp.axes[0]) > 0.15 ? gp.axes[0] : 0;
        // Triggers or Buttons for Gas & Brake
        const gas = gp.buttons[7]?.value || (gp.buttons[0]?.pressed ? 1 : 0);
        const brake = gp.buttons[6]?.value || (gp.buttons[1]?.pressed ? 1 : 0);
        const jump = gp.buttons[2]?.pressed || gp.buttons[3]?.pressed || false;

        setInputState((prev: VehicleInput) => ({
          ...prev,
          steer: steerAxis,
          throttle: gas > 0.1 ? gas : brake > 0.1 ? -brake : 0,
          jump,
        }));
      }
      animId = requestAnimationFrame(pollGamepad);
    };
    animId = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Respawn Handler
  const handleRespawn = useCallback(() => {
    showBanner(lang === 'sv' ? 'Bilen ställs på vägen! 🚗' : 'Car reset to road! 🚗');
    sounds.playJump(1.2);
    setCurrentVehicle((prev) => ({ ...prev }));
  }, [lang, showBanner]);

  return (
    <main className="w-screen h-screen relative bg-slate-950 overflow-hidden select-none">
      {/* 3D Game Canvas */}
      <GameCanvas3D
        currentVehicle={currentVehicle}
        onStarCollected={handleStarCollected}
        starsCollected={starsCollected}
        inputState={inputState}
        hornTrigger={hornTrigger}
        lang={lang}
        onShowMessage={showBanner}
      />

      {/* Floating HUD */}
      <GameHUD
        currentVehicle={currentVehicle}
        onSelectVehicle={setCurrentVehicle}
        starsCount={starsCollected.size}
        totalStars={20}
        onOpenMissions={() => setIsMissionsOpen(true)}
        onOpenDiploma={() => setIsDiplomaOpen(true)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(sounds.toggleMute())}
        lang={lang}
        onToggleLang={() => setLang((l) => (l === 'sv' ? 'en' : 'sv'))}
        onRespawn={handleRespawn}
        bannerMessage={bannerMessage}
      />

      {/* Touch Controls (Mobile / Tablet friendly) */}
      <TouchControls
        inputState={inputState}
        setInputState={setInputState}
        onTriggerHorn={() => setHornTrigger((prev) => prev + 1)}
        currentVehicle={currentVehicle}
      />

      {/* Mission Guide Modal */}
      <MissionGuideModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
        starsCount={starsCollected.size}
        totalStars={20}
        lang={lang}
      />

      {/* Star Celebration & Diploma Modal */}
      <StarCelebrationModal
        isOpen={isDiplomaOpen}
        onClose={() => setIsDiplomaOpen(false)}
        starsCount={starsCollected.size}
        totalStars={20}
        currentVehicle={currentVehicle}
        lang={lang}
      />
    </main>
  );
};
