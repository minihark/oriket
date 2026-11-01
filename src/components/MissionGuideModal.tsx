import React from 'react';
import { X, CheckCircle2, Circle, Compass, Sparkles } from 'lucide-react';

interface MissionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  starsCount: number;
  totalStars: number;
  lang: 'sv' | 'en';
}

export const MissionGuideModal: React.FC<MissionGuideModalProps> = ({
  isOpen,
  onClose,
  starsCount,
  totalStars,
  lang,
}) => {
  if (!isOpen) return null;

  const missions = [
    {
      id: 'stars',
      icon: '⭐',
      titleSv: 'Samla guldstjärnor på ön',
      titleEn: 'Collect gold stars on the island',
      descSv: `Du har hittat ${starsCount} av ${totalStars} stjärnor! De finns på hustak, ramper och stränder.`,
      descEn: `You found ${starsCount} of ${totalStars} stars! Look on roofs, ramps, and shores.`,
      done: starsCount >= totalStars,
    },
    {
      id: 'fire',
      icon: '🚒',
      titleSv: 'Släck lägereldarna med Buster',
      titleEn: 'Put out campfires with Buster',
      descSv: 'Kör fram till elden och tuta eller tryck på vattenknappen för att spruta vatten!',
      descEn: 'Drive near the fire and press the water button to spray water!',
      done: false,
    },
    {
      id: 'ramp',
      icon: '🦘',
      titleSv: 'Gör ett mega-hopp på berget',
      titleEn: 'Do a mega jump on the mountain',
      descSv: 'Kör över turbo-plattan i full fart och flyg över stuntrampen!',
      descEn: 'Hit the speed boost pad and fly off the wooden stunt ramp!',
      done: true,
    },
    {
      id: 'animals',
      icon: '🐮',
      titleSv: 'Hälsa på djuren vid ladugården',
      titleEn: 'Visit the farm animals at the barn',
      descSv: 'Kör till den röda ladan med Ture och tuta så hoppar korna och fåren!',
      descEn: 'Drive to the red barn with Ture and honk your horn to make them jump!',
      done: false,
    },
    {
      id: 'boat',
      icon: '🚤',
      titleSv: 'Ta en båttur runt fyren',
      titleEn: 'Take a boat ride around the lighthouse',
      descSv: 'Byt till speedbåten Sally och kör ett varv ute i havet vid fyren!',
      descEn: 'Switch to Sally the speedboat and cruise around the lighthouse in the bay!',
      done: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-[#FFFDF9] rounded-3xl border-4 border-amber-300 shadow-2xl flex flex-col overflow-hidden relative max-h-[90dvh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-amber-100 flex items-center justify-between bg-amber-50/70">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🧭</span>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-amber-950 font-display">
                {lang === 'sv' ? 'Uppdrag & Karta' : 'Missions & Map'}
              </h2>
              <p className="text-xs sm:text-sm text-amber-800 font-medium">
                {lang === 'sv' ? 'Utforska skärgården i din egen takt!' : 'Explore the archipelago at your own pace!'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white border-2 border-amber-200 text-amber-900 flex items-center justify-center shadow-sm active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5">
          {missions.map((m) => (
            <div
              key={m.id}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                m.done
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-white border-amber-200 shadow-sm'
              }`}
            >
              <span className="text-3xl sm:text-4xl">{m.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-sm sm:text-base font-black text-slate-800">
                    {lang === 'sv' ? m.titleSv : m.titleEn}
                  </h3>
                  {m.done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-amber-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  {lang === 'sv' ? m.descSv : m.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-amber-100 bg-amber-50/50 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-amber-900">
            {lang === 'sv' ? 'Stjärnor:' : 'Stars:'} {starsCount} / {totalStars}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-amber-400 active:bg-amber-500 text-amber-950 font-black text-sm shadow-md transition-transform active:scale-95"
          >
            {lang === 'sv' ? 'Kör vidare! 🚗' : 'Keep Driving! 🚗'}
          </button>
        </div>
      </div>
    </div>
  );
};
