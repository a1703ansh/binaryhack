import React, { useEffect, useState, useRef } from 'react';

export type MonsterMood = 'calm' | 'angry' | 'happy' | 'surprised';

interface MascotMonsterProps {
  mood?: MonsterMood;
  isCoveringEyes?: boolean;
  isPeeking?: boolean;
  inputCharCount?: number;
  isBouncing?: boolean;
  onMonsterClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MascotMonster: React.FC<MascotMonsterProps> = ({
  mood = 'calm',
  isCoveringEyes = false,
  isPeeking = false,
  inputCharCount = 0,
  isBouncing = false,
  onMonsterClick,
  className = '',
  size = 'md',
}) => {
  const monsterRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  // Natural blinking cycle
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (!isCoveringEyes) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 160);
      }
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [isCoveringEyes]);

  // Track mouse coordinates for dynamic eye tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isCoveringEyes && !isPeeking) return;
      if (!monsterRef.current) return;

      const rect = monsterRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy) || 1;

      // Max pupil travel radius: 10px
      const maxRadius = 10;
      const radius = Math.min(dist * 0.05, maxRadius);
      const px = (dx / dist) * radius;
      const py = (dy / dist) * radius;

      setPupilOffset({ x: px, y: py });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isCoveringEyes, isPeeking]);

  // Adjust pupil position if input characters are being typed
  useEffect(() => {
    if (inputCharCount > 0 && !isCoveringEyes) {
      const xShift = Math.min(Math.max((inputCharCount - 15) * 0.45, -7), 7);
      const yShift = 3; // Look down slightly at the text input
      setPupilOffset({ x: xShift, y: yShift });
    }
  }, [inputCharCount, isCoveringEyes]);

  const isAngry = mood === 'angry';

  // Sizing styles
  const sizeScales = {
    sm: 'scale-75 -mb-4',
    md: 'scale-100',
    lg: 'scale-110',
  };

  return (
    <div
      ref={monsterRef}
      onClick={onMonsterClick}
      className={`relative select-none flex flex-col items-center justify-end ${sizeScales[size]} ${
        isAngry ? 'anim-rumble' : 'anim-calm'
      } ${isBouncing ? 'anim-bounce' : ''} ${className}`}
      style={{ width: '280px', height: '200px' }}
    >
      {/* Steam particles when angry */}
      {isAngry && (
        <div className="absolute -top-6 w-full flex justify-between px-6 pointer-events-none z-30">
          <div className="w-4 h-4 rounded-full bg-slate-300/80 blur-[1px] steam-bubble-1" />
          <div className="w-5 h-5 rounded-full bg-slate-300/70 blur-[1px] steam-bubble-2" />
        </div>
      )}

      {/* Horns */}
      <div className="absolute -top-1 w-full flex justify-between px-10 pointer-events-none z-10">
        {/* Left Horn */}
        <div
          className={`w-9 h-14 bg-amber-800 rounded-t-full border-2 border-amber-950 transition-transform duration-400 ${
            isAngry ? '-rotate-35 scale-110' : '-rotate-20'
          }`}
          style={{ transformOrigin: 'bottom center' }}
        />
        {/* Right Horn */}
        <div
          className={`w-9 h-14 bg-amber-800 rounded-t-full border-2 border-amber-950 transition-transform duration-400 ${
            isAngry ? 'rotate-35 scale-110' : 'rotate-20'
          }`}
          style={{ transformOrigin: 'bottom center' }}
        />
      </div>

      {/* Main Monster Body */}
      <div
        className={`relative w-56 h-40 rounded-t-[90px] rounded-b-[40px] flex flex-col items-center justify-start pt-6 border-4 shadow-xl monster-transition cursor-pointer ${
          isAngry
            ? 'bg-gradient-to-b from-[#e84e12] to-[#c23b08] border-[#872600] shadow-rose-900/40'
            : 'bg-gradient-to-b from-[#f89a1c] to-[#e47d0d] border-[#ad3300] shadow-amber-950/30'
        }`}
      >
        {/* Forehead furrow wrinkles (angry) */}
        {isAngry && (
          <div className="flex gap-1.5 -mt-2 mb-1">
            <span className="w-2.5 h-1 bg-[#872600] rounded-full rotate-12 opacity-80" />
            <span className="w-2.5 h-1 bg-[#872600] rounded-full -rotate-12 opacity-80" />
          </div>
        )}

        {/* Eyes Section */}
        <div className="relative flex items-center justify-center gap-7 mt-1">
          {/* Left Eyebrow */}
          <div
            className={`eyebrow-physics absolute w-9 h-2 bg-[#872600] rounded-full -top-3.5 left-0 z-20 ${
              isAngry ? 'rotate-25 translate-y-1.5' : isBlinking ? '-translate-y-0.5' : 'rotate-0'
            }`}
          />
          {/* Right Eyebrow */}
          <div
            className={`eyebrow-physics absolute w-9 h-2 bg-[#872600] rounded-full -top-3.5 right-0 z-20 ${
              isAngry ? '-rotate-25 translate-y-1.5' : isBlinking ? '-translate-y-0.5' : 'rotate-0'
            }`}
          />

          {/* Left Eye */}
          <div className="relative w-11 h-11 bg-white rounded-full border-2 border-[#872600] overflow-hidden flex items-center justify-center shadow-inner">
            {/* Top eyelid for blink / squint */}
            <div
              className={`absolute top-0 left-0 w-full transition-all duration-150 z-10 ${
                isAngry ? 'bg-[#e84e12]' : 'bg-[#f89a1c]'
              }`}
              style={{
                height: isBlinking ? '100%' : isAngry ? '35%' : '0%',
              }}
            />
            {/* Pupil */}
            <div
              className="w-3 h-3 bg-slate-950 rounded-full transition-transform duration-75 relative pointer-events-none"
              style={{
                transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
              }}
            >
              {/* Pupil light reflection */}
              <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full" />
            </div>
          </div>

          {/* Right Eye */}
          <div className="relative w-11 h-11 bg-white rounded-full border-2 border-[#872600] overflow-hidden flex items-center justify-center shadow-inner">
            {/* Top eyelid for blink / squint */}
            <div
              className={`absolute top-0 left-0 w-full transition-all duration-150 z-10 ${
                isAngry ? 'bg-[#e84e12]' : 'bg-[#f89a1c]'
              }`}
              style={{
                height: isBlinking ? '100%' : isAngry ? '35%' : isPeeking ? '15%' : '0%',
              }}
            />
            {/* Pupil */}
            <div
              className="w-3 h-3 bg-slate-950 rounded-full transition-transform duration-75 relative pointer-events-none"
              style={{
                transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
              }}
            >
              {/* Pupil light reflection */}
              <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full" />
            </div>
          </div>
        </div>

        {/* Blush Cheeks */}
        <div className="w-full flex justify-between px-6 -mt-1 pointer-events-none">
          <div className="w-5 h-2.5 rounded-full bg-rose-400/40 blur-[0.5px]" />
          <div className="w-5 h-2.5 rounded-full bg-rose-400/40 blur-[0.5px]" />
        </div>

        {/* Mouth Expression */}
        <div className="mt-2 flex items-center justify-center">
          {isAngry ? (
            /* Angry Gritted Snarl */
            <div className="w-12 h-5 bg-[#872600] rounded-md border border-[#521600] flex items-center justify-around px-1 overflow-hidden">
              <div className="w-2 h-3 bg-white rounded-t-sm" />
              <div className="w-2 h-3 bg-white rounded-t-sm" />
              <div className="w-2 h-3 bg-white rounded-t-sm" />
              <div className="w-2 h-3 bg-white rounded-t-sm" />
            </div>
          ) : (
            /* Happy Calm Smile with Tongue */
            <div className="relative w-10 h-5 bg-[#872600] rounded-b-full overflow-hidden border border-[#521600]">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-3 bg-rose-400 rounded-t-full" />
            </div>
          )}
        </div>
      </div>

      {/* Paws (Hands covering eyes or resting) */}
      <div className="absolute bottom-0 w-full flex justify-center pointer-events-none z-30">
        {/* Left Paw */}
        <div
          className={`paw-hand left-10 ${
            isAngry ? 'bg-[#e84e12] border-2 border-[#872600]' : 'bg-[#f89a1c] border-2 border-[#ad3300]'
          } ${isCoveringEyes ? 'paw-left-cover' : 'paw-left-rest'}`}
        >
          {/* Claws / Knuckles */}
          <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-[#ad3300]/50" />
          <div className="absolute top-0.5 left-4 w-2 h-2 rounded-full bg-[#ad3300]/50" />
          <div className="absolute top-1 left-6 w-2 h-2 rounded-full bg-[#ad3300]/50" />
        </div>

        {/* Right Paw */}
        <div
          className={`paw-hand right-10 ${
            isAngry ? 'bg-[#e84e12] border-2 border-[#872600]' : 'bg-[#f89a1c] border-2 border-[#ad3300]'
          } ${
            isCoveringEyes
              ? isPeeking
                ? 'paw-right-peek'
                : 'paw-right-cover'
              : 'paw-right-rest'
          }`}
        >
          {/* Claws / Knuckles */}
          <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-[#ad3300]/50" />
          <div className="absolute top-0.5 left-4 w-2 h-2 rounded-full bg-[#ad3300]/50" />
          <div className="absolute top-1 left-6 w-2 h-2 rounded-full bg-[#ad3300]/50" />
        </div>
      </div>
    </div>
  );
};
