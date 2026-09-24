import React from 'react';
import { GOAL_MOOD_META, type GoalMood } from '../lib/goalMood';

/* =========================================================
   GoalMoodMascot — the compact flat mascot that sits on each
   goal card. Its face is driven entirely by the mood derived
   in lib/goalMood.ts (done / ahead / onTrack / behind), so the
   expression is never invented at the call site.
   ========================================================= */

interface GoalMoodMascotProps {
  mood: GoalMood;
  /** Layout box the mascot occupies; the art scales inside it. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Box size (px) + art scale, so the mascot never overflows its slot. */
const MASCOT_SIZES = {
  sm: { box: 48, scale: 1 },
  md: { box: 64, scale: 1.3 },
  lg: { box: 96, scale: 1.9 },
} as const;

const BODY_TONE: Record<GoalMood, string> = {
  done: 'bg-secondary shadow-[0_4px_0_0_#065f46]',
  ahead: 'bg-primary shadow-[0_4px_0_0_#ad3300]',
  onTrack: 'bg-primary shadow-[0_4px_0_0_#ad3300]',
  behind: 'bg-primary-fixed shadow-[0_4px_0_0_#f9a61f]',
};

const ACCENT_TONE: Record<GoalMood, string> = {
  done: 'text-secondary-deep',
  ahead: 'text-primary-on',
  onTrack: 'text-primary-on',
  behind: 'text-primary-deep',
};

export const GoalMoodMascot: React.FC<GoalMoodMascotProps> = ({ mood, size = 'sm', className = '' }) => {
  const meta = GOAL_MOOD_META[mood];
  const isHappy = mood === 'done' || mood === 'ahead';
  const { box, scale } = MASCOT_SIZES[size];

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center ${className}`}
      style={{ width: box, height: box }}
      role="img"
      aria-label={meta.mascotLabel}
      title={meta.mascotLabel}
    >
    <div
      className={`relative w-12 h-12 rounded-full flex items-center justify-center ${BODY_TONE[mood]}`}
      style={{ transform: `scale(${scale})` }}
    >
      {/* Horns — perks up when ahead/done */}
      <span
        className={`absolute -top-1 left-1.5 w-2.5 h-3.5 rounded-t-full bg-primary-dark ${
          isHappy ? '-rotate-12' : 'rotate-6'
        }`}
      />
      <span
        className={`absolute -top-1 right-1.5 w-2.5 h-3.5 rounded-t-full bg-primary-dark ${
          isHappy ? 'rotate-12' : '-rotate-6'
        }`}
      />

      <div className="flex flex-col items-center gap-0.5">
        {/* Eyes */}
        {mood === 'done' ? (
          /* Content closed-eye arcs */
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2.5 h-2.5 border-t-2 border-b-2 border-current rounded-full" />
            <span className="w-2.5 h-2.5 border-t-2 border-b-2 border-current rounded-full" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-surface rounded-full flex items-center justify-center">
              <span className={`w-1.5 h-1.5 rounded-full bg-ink ${mood === 'behind' ? 'translate-y-px' : ''}`} />
            </span>
            <span className="w-2.5 h-2.5 bg-surface rounded-full flex items-center justify-center">
              <span className={`w-1.5 h-1.5 rounded-full bg-ink ${mood === 'behind' ? 'translate-y-px' : ''}`} />
            </span>
          </div>
        )}

        {/* Mouth */}
        {mood === 'behind' ? (
          <span className="w-3.5 h-1.5 border-t-2 border-current rounded-t-full" />
        ) : mood === 'onTrack' ? (
          <span className="w-3 h-1.5 border-b-2 border-current rounded-b-full" />
        ) : (
          <span className="w-4 h-2.5 border-b-2 border-current rounded-b-full" />
        )}
      </div>

      {/* Cheeks on the cheerful moods */}
      {isHappy && (
        <>
          <span className="absolute bottom-2.5 left-1 w-1.5 h-1 rounded-full bg-berry opacity-40" />
          <span className="absolute bottom-2.5 right-1 w-1.5 h-1 rounded-full bg-berry opacity-40" />
        </>
      )}

      {/* Behind: a small sweat drop */}
      {mood === 'behind' && (
        <span className="absolute -top-0.5 -right-0.5 material-symbols-outlined text-[13px] text-ocean">
          water_drop
        </span>
      )}

      {/* Done: celebration badge */}
      {mood === 'done' && (
        <span
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface flex items-center justify-center ${ACCENT_TONE[mood]}`}
        >
          <span className="material-symbols-outlined text-[15px]">check_circle</span>
        </span>
      )}
    </div>
    </div>
  );
};
