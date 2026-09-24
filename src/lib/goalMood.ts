import type { SavingsGoal } from '@earnwise/shared';

/* =========================================================
   Per-goal "mascot mood" — derived strictly from data already
   stored on the goal (currentAmount, targetAmount, deadline,
   createdAt). No new persistence, no new math on money.

   Rule (documented in the Step 8 plan):

     done     : currentAmount >= targetAmount
     otherwise:
       elapsed   = now - createdAt
       span      = targetDate - createdAt
       expected% = clamp(elapsed / span * 100, 0, 100)
       ratio     = actual% / expected%
       ahead    : ratio >= 1.15
       onTrack  : 0.85 <= ratio < 1.15
       behind   : ratio < 0.85
     fallback   : deadline unparseable, createdAt missing,
                  targetDate <= createdAt, or < 5% of the window
                  elapsed -> onTrack (no pace claim)
   ========================================================= */

export type GoalMood = 'done' | 'ahead' | 'onTrack' | 'behind';

/** Thresholds for the pace classification (kept here so the rule is auditable). */
export const GOAL_MOOD_THRESHOLDS = { ahead: 1.15, behind: 0.85 } as const;

/**
 * Minimum share of the goal window that must have elapsed before a pace claim is
 * made. Goals usually start pre-funded (seed data, or a partial balance carried
 * over), so a tiny elapsed window makes the ratio explode to "ahead" for nothing.
 * Below this we return "onTrack" and make no claim.
 */
export const GOAL_MOOD_MIN_ELAPSED_PERCENT = 5;

/**
 * Parses the goal's free-text deadline ("June 2027", "April 2027", "2027-06-01").
 * Returns null when it cannot be understood — callers must use the neutral fallback.
 */
export function parseGoalDeadline(deadline: string | undefined | null): Date | null {
  const trimmed = (deadline ?? '').trim();
  if (!trimmed) return null;

  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) return direct;

  // "Month YYYY" / "Month, YYYY" — anchor to the 1st of that month
  const monthYear = trimmed.match(/^([A-Za-z]{3,})\s*,?\s*(\d{4})$/);
  if (monthYear) {
    const parsed = new Date(`${monthYear[1]} 1, ${monthYear[2]}`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

/** Progress toward the goal, clamped to 0–100 exactly like the card's bar. */
export function goalProgressPercent(goal: Pick<SavingsGoal, 'currentAmount' | 'targetAmount'>): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)));
}

export function getGoalMood(goal: SavingsGoal, now: Date = new Date()): GoalMood {
  if (goal.targetAmount <= 0) return 'onTrack';
  if (goal.currentAmount >= goal.targetAmount) return 'done';

  const targetDate = parseGoalDeadline(goal.deadline);
  const createdAt = goal.createdAt ? new Date(goal.createdAt) : null;

  // No reliable time reference → never claim "behind" or "ahead".
  if (!targetDate || !createdAt || Number.isNaN(createdAt.getTime())) return 'onTrack';

  const span = targetDate.getTime() - createdAt.getTime();
  if (span <= 0) return 'onTrack';

  const elapsed = now.getTime() - createdAt.getTime();
  const expected = Math.max(0, Math.min(100, (elapsed / span) * 100));

  // Not enough of the window has passed to judge pace (see the constant above).
  if (expected < GOAL_MOOD_MIN_ELAPSED_PERCENT) return 'onTrack';

  const actual = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const ratio = actual / expected;

  if (ratio >= GOAL_MOOD_THRESHOLDS.ahead) return 'ahead';
  if (ratio < GOAL_MOOD_THRESHOLDS.behind) return 'behind';
  return 'onTrack';
}

export interface GoalMoodMeta {
  /** Short status word shown on the card. */
  label: string;
  /** Sentence describing the pace, grounded in the numbers we have. */
  caption: string;
  /** Subject line for the mood mascot's tooltip. */
  mascotLabel: string;
  /** Material Symbols icon name for the small mood chip. */
  icon: string;
}

export const GOAL_MOOD_META: Record<GoalMood, GoalMoodMeta> = {
  done: {
    label: 'done',
    caption: 'Target reached — fully funded',
    mascotLabel: 'Cheering — this goal is fully funded',
    icon: 'check_circle',
  },
  ahead: {
    label: 'ahead',
    caption: 'Running ahead of schedule',
    mascotLabel: 'Excited — ahead of schedule',
    icon: 'rocket_launch',
  },
  onTrack: {
    label: 'on track',
    caption: 'Pace tracking to plan',
    mascotLabel: 'Content — right on track',
    icon: 'bolt',
  },
  behind: {
    label: 'behind',
    caption: 'Pace behind plan',
    mascotLabel: 'Worried — falling behind pace',
    icon: 'schedule',
  },
};
