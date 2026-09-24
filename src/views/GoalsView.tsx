import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { useEarnWise } from '../context/EarnWiseContext';
import { type SavingsGoal } from '@earnwise/shared';
import { Currency } from '../lib/currency';
import { Button, Input, MaterialIcon, Modal } from '../components/ui';
import { GoalMoodMascot } from '../components/GoalMascot';
import { GOAL_MOOD_META, getGoalMood, goalProgressPercent, type GoalMood } from '../lib/goalMood';

/* =========================================================
   Goals — "Flat Mascot Playful" restyle.
   Money math and CRUD are untouched: percent/remaining are the
   same expressions as before, and create/edit/delete go through
   the existing context + API paths.
   ========================================================= */

interface CategoryMeta {
  icon: string;
  overline: string;
  bar: string;
  bevel: string;
  ring: string;
}

const CATEGORY_META: Record<SavingsGoal['category'], CategoryMeta> = {
  Emergency: {
    icon: 'savings',
    overline: 'Base Floor Target',
    bar: 'bg-primary',
    bevel: 'shadow-[0_6px_0_0_#845400]',
    ring: 'bg-primary-fixed text-primary-deep',
  },
  Vehicle: {
    icon: 'two_wheeler',
    overline: 'Vehicle Maintenance',
    bar: 'bg-ocean',
    bevel: 'shadow-[0_6px_0_0_#006686]',
    ring: 'bg-ocean-faint text-ocean-ondeep',
  },
  Festival: {
    icon: 'celebration',
    overline: 'Festival & Gifting',
    bar: 'bg-berry',
    bevel: 'shadow-[0_6px_0_0_#ad3300]',
    ring: 'bg-berry-fixed text-berry-ondeep',
  },
  Family: {
    icon: 'family_restroom',
    overline: 'Family Milestone',
    bar: 'bg-secondary',
    bevel: 'shadow-[0_6px_0_0_#065f46]',
    ring: 'bg-secondary/15 text-secondary-deep',
  },
  General: {
    icon: 'flag',
    overline: 'Custom Milestone',
    bar: 'bg-primary-dim',
    bevel: 'shadow-[0_6px_0_0_#d8c3ad]',
    ring: 'bg-surface-container text-ink-muted',
  },
};

const PRIORITY_LABEL: Record<SavingsGoal['priority'], string> = {
  High: 'High',
  Medium: 'Medium',
  Low: 'Normal',
};

const PRIORITY_CHIP: Record<SavingsGoal['priority'], string> = {
  High: 'bg-berry-fixed text-berry-ondeep shadow-[0_2px_0_0_#842500]',
  Medium: 'bg-primary-fixed text-primary-deep shadow-[0_2px_0_0_#845400]',
  Low: 'bg-surface-container text-ink-muted shadow-[0_2px_0_0_#857461]',
};

const CATEGORIES: SavingsGoal['category'][] = ['Emergency', 'Vehicle', 'Festival', 'Family', 'General'];
const PRIORITIES: SavingsGoal['priority'][] = ['High', 'Medium', 'Low'];

interface GoalBarProps {
  percent: number;
  barClass: string;
}

/**
 * Progress bar with the design's inner milestone sliver.
 * The fill animates 0 → value purely in CSS (.goal-bar-fill); the global
 * prefers-reduced-motion rule collapses that to the final width.
 */
const GoalBar: React.FC<GoalBarProps> = ({ percent, barClass }) => (
  <div
    className="w-full h-4 bg-surface-highest rounded-full overflow-hidden p-0.5 shadow-inner relative"
    role="progressbar"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={percent}
  >
    <div
      className={`goal-bar-fill h-full ${barClass} rounded-full relative`}
      style={{ width: `${percent}%`, '--goal-fill': `${percent}%` } as React.CSSProperties}
    >
      <span className="absolute right-0 top-0 bottom-0 w-1.5 bg-surface opacity-60 rounded-full" />
    </div>
  </div>
);

export const GoalsView: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useEarnWise();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(10000);
  const [currentAmount, setCurrentAmount] = useState<number>(1000);
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<SavingsGoal['priority']>('Medium');
  const [category, setCategory] = useState<SavingsGoal['category']>('General');

  const moods = useMemo(() => goals.map((g) => getGoalMood(g)), [goals]);

  // Header mascot mood — derived from the goal set, not hardcoded.
  const headerMood: GoalMood = moods.includes('done')
    ? 'done'
    : moods.includes('behind')
      ? 'behind'
      : moods.includes('ahead')
        ? 'ahead'
        : 'onTrack';

  const urgentCount = moods.filter((m) => m === 'behind').length;

  const resetForm = () => {
    setName('');
    setTargetAmount(10000);
    setCurrentAmount(1000);
    setDeadline('');
    setPriority('Medium');
    setCategory('General');
  };

  const openCreate = () => {
    resetForm();
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (goal: SavingsGoal) => {
    setName(goal.name);
    setTargetAmount(goal.targetAmount);
    setCurrentAmount(goal.currentAmount);
    setDeadline(goal.deadline);
    setPriority(goal.priority);
    setCategory(goal.category);
    setEditingId(goal.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      deadline: deadline.trim(),
      priority,
      category,
    };

    setIsSaving(true);
    try {
      if (editingId) {
        await updateGoal(editingId, payload);
      } else {
        await addGoal({ ...payload, icon: 'Target' });
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch {
          // canvas-confetti is best-effort
        }
      }
      closeModal();
      resetForm();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    setIsSaving(true);
    try {
      await deleteGoal(goalId);
      setConfirmingDeleteId(null);
      if (editingId === goalId) closeModal();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ── Hero: header + peeking mascot ─────────────────────── */}
      <section className="relative flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-surface text-ocean font-ui text-[11px] font-semibold uppercase tracking-wider shadow-[0_3px_0_0_#006686]">
              Smart Target Piggy
            </span>
            <span className="flex items-center gap-1.5 text-surface font-ui text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="font-currency tabular-nums">{goals.length}</span>
              <span>{goals.length === 1 ? 'Goal' : 'Goals'} Active</span>
            </span>
            {urgentCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-berry text-white font-ui text-[11px] font-semibold">
                <span className="font-currency tabular-nums">{urgentCount}</span> behind pace
              </span>
            )}
          </div>

          <h1 className="font-questrial text-3xl sm:text-4xl lg:text-[2.75rem] leading-none text-surface lowercase tracking-tight">
            savings goals,
          </h1>
          <p className="font-questrial text-base text-surface/95 max-w-xl">
            every gig delivery inches you closer to what matters
          </p>
        </div>

        <div className="self-center lg:self-end shrink-0 pt-3">
          <div className="relative flex flex-col items-center">
            <div className="absolute -top-7 bg-surface px-3 py-1 rounded-full shadow-[0_3px_0_0_#ad3300] text-[11px] font-bold text-ink whitespace-nowrap z-20 flex items-center gap-1.5 border border-primary/20">
              <span>{headerMood === 'done' ? 'All Goals Crushed! 🎉' : headerMood === 'ahead' ? 'Ahead of Schedule! 🚀' : headerMood === 'behind' ? 'Catch-Up Active ⚡' : 'Piggy on Track! 🎯'}</span>
            </div>
            <GoalMoodMascot mood={headerMood} size="lg" />
          </div>
        </div>
      </section>

      {/* ── Auto-funded waterfall policy banner ───────────────── */}
      <div className="w-full bg-surface rounded-card p-5 lg:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_6px_0_0_#006686]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-ocean-faint flex items-center justify-center shrink-0 shadow-[0_3px_0_0_#006686]">
            <MaterialIcon name="waterfall_chart" className="text-ocean text-2xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-questrial text-xl text-ink">Auto-Funded Waterfall</span>
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-on font-ui text-[11px] font-semibold">
                70/30 Model
              </span>
            </div>
            <p className="font-questrial text-sm text-ink-muted max-w-2xl">
              Every auto-save tops up your <strong className="text-ink">Emergency</strong> goal with 70% and your{' '}
              <strong className="text-ink">Vehicle</strong> goal with 30% — each stopping once its target is reached.
            </p>
          </div>
        </div>

        <Button variant="danger" size="lg" onClick={openCreate} className="w-full md:w-auto rounded-full shrink-0">
          <MaterialIcon name="add_circle" className="text-xl" />
          <span className="font-ui">create new goal</span>
        </Button>
      </div>

      {/* ── Goal cards / empty state ───────────────────────────── */}
      {goals.length === 0 ? (
        <div className="w-full bg-surface rounded-card p-8 flex flex-col items-center text-center gap-3 shadow-[0_6px_0_0_#d8c3ad]">
          <GoalMoodMascot mood="onTrack" size="md" />
          <h2 className="font-questrial text-xl text-ink">no goals yet</h2>
          <p className="font-questrial text-sm text-ink-muted max-w-md">
            Set your first target and EarnWise starts micro-funding it automatically from every payout.
          </p>
          <Button variant="danger" size="lg" onClick={openCreate} className="rounded-full mt-1">
            <MaterialIcon name="add_circle" className="text-xl" />
            <span className="font-ui">create your first goal</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const meta = CATEGORY_META[goal.category] ?? CATEGORY_META.General;
            const mood = getGoalMood(goal);
            const moodMeta = GOAL_MOOD_META[mood];
            const percent = goalProgressPercent(goal);
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div
                key={goal.id}
                className={`relative bg-surface rounded-card p-5 flex flex-col justify-between ${meta.bevel} transition-transform hover:-translate-y-1`}
              >
                <div>
                  {/* Priority + mood strip */}
                  <div className="flex items-center justify-between mb-4 gap-2">
                    <span className={`px-2.5 py-1 rounded-full font-ui text-[11px] font-semibold flex items-center gap-1 ${PRIORITY_CHIP[goal.priority]}`}>
                      <MaterialIcon name={goal.priority === 'High' ? 'shield' : 'flag'} className="text-sm" />
                      Priority: {PRIORITY_LABEL[goal.priority]}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full font-ui text-[11px] font-semibold flex items-center gap-1 ${meta.ring}`}>
                      <MaterialIcon name={moodMeta.icon} className="text-sm" />
                      {moodMeta.label}
                    </span>
                  </div>

                  {/* Title + mood mascot */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <span className="font-ui text-[10px] uppercase tracking-wider text-ink-subtle">
                        {meta.overline}
                      </span>
                      <h3 className="font-questrial text-xl text-ink leading-tight break-words">{goal.name}</h3>
                      <p className="font-questrial text-sm text-ink-muted mt-0.5">{moodMeta.caption}</p>
                    </div>
                    <GoalMoodMascot mood={mood} />
                  </div>

                  {/* Currency figures */}
                  <div className="bg-surface-container rounded-btn p-3.5 flex items-baseline justify-between">
                    <div>
                      <div className="font-ui text-[11px] text-ink-subtle">Current saved</div>
                      <div className="font-currency tabular-nums text-2xl text-primary-deep font-bold leading-tight">
                        <Currency value={goal.currentAmount} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-ui text-[11px] text-ink-subtle">Target</div>
                      <div className="font-currency tabular-nums text-base text-ink font-semibold">
                        <Currency value={goal.targetAmount} />
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="flex flex-col gap-1.5 mt-3">
                    <div className="flex justify-between items-center font-ui text-[11px]">
                      <span className="font-bold text-ink">
                        <span className="font-currency tabular-nums">{percent}%</span> completed
                      </span>
                      <span className="text-ink-subtle font-currency tabular-nums">
                        <Currency value={remaining} /> remaining
                      </span>
                    </div>
                    <GoalBar percent={percent} barClass={meta.bar} />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-bevel-neutral flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-ui text-[11px] text-ink-muted min-w-0">
                    <MaterialIcon name="calendar_month" className="text-sm text-ink-faint" />
                    <span className="truncate">Target: {goal.deadline || '—'}</span>
                  </div>

                  {confirmingDeleteId === goal.id ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="danger"
                        size="sm"
                        className="rounded-full"
                        disabled={isSaving}
                        onClick={() => handleDelete(goal.id)}
                      >
                        Confirm
                      </Button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(null)}
                        className="px-2 py-1.5 rounded-full font-ui text-[11px] font-semibold text-ink-muted hover:bg-surface-high cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEdit(goal)}
                        aria-label={`Edit ${goal.name}`}
                        className="px-2.5 py-1.5 rounded-full font-ui text-[11px] font-semibold bg-ocean-faint text-ocean-ondeep shadow-[0_3px_0_0_#006686] active:translate-y-0.5 cursor-pointer flex items-center gap-1"
                      >
                        <MaterialIcon name="edit" className="text-sm" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(goal.id)}
                        aria-label={`Delete ${goal.name}`}
                        className="w-7 h-7 rounded-full flex items-center justify-center bg-surface-high text-danger hover:bg-danger-light cursor-pointer"
                      >
                        <MaterialIcon name="delete" className="text-sm" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 70/30 waterfall explainer (mechanism only — no invented amounts) ── */}
      <div className="w-full bg-surface rounded-card p-5 lg:p-6 flex flex-col gap-4 shadow-[0_6px_0_0_#006686]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <span className="font-ui text-[11px] text-ocean uppercase tracking-wider font-semibold">
              Automated Intelligence
            </span>
            <h2 className="font-questrial text-xl text-ink">How the 70/30 Waterfall Works</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-ui text-[11px] text-ink-muted">
              <span className="w-3 h-3 rounded-full bg-primary" /> 70% Emergency goal
            </span>
            <span className="flex items-center gap-1.5 font-ui text-[11px] text-ink-muted">
              <span className="w-3 h-3 rounded-full bg-ocean" /> 30% Vehicle goal
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-surface-container rounded-btn p-4 shadow-[0_3px_0_0_#d8c3ad]">
            <div className="flex items-center justify-between">
              <span className="font-ui text-[10px] uppercase tracking-wider text-ink-subtle">Stage 1</span>
              <MaterialIcon name="payments" className="text-primary text-xl" />
            </div>
            <div className="font-questrial text-lg text-ink mt-1">Auto-save lands</div>
            <p className="font-questrial text-sm text-ink-muted mt-1">
              Each processed payout books a safe auto-save amount before anything is marked spendable.
            </p>
          </div>

          <div className="bg-primary-fixed rounded-btn p-4 shadow-[0_3px_0_0_#845400]">
            <div className="flex items-center justify-between">
              <span className="font-ui text-[10px] uppercase tracking-wider text-primary-deep font-bold">Stage 2</span>
              <MaterialIcon name="security" className="text-primary-deep text-xl" />
            </div>
            <div className="font-questrial text-lg text-primary-on mt-1">70% Emergency first</div>
            <p className="font-questrial text-sm text-primary-deep mt-1">
              Routes to your Emergency goal until its target is fully secured.
            </p>
          </div>

          <div className="bg-ocean-faint rounded-btn p-4 shadow-[0_3px_0_0_#006686]">
            <div className="flex items-center justify-between">
              <span className="font-ui text-[10px] uppercase tracking-wider text-ocean-ondep font-bold">Stage 3</span>
              <MaterialIcon name="star" className="text-ocean text-xl" />
            </div>
            <div className="font-questrial text-lg text-ink mt-1">30% Vehicle goals</div>
            <p className="font-questrial text-sm text-ink-muted mt-1">
              Keeps your earning asset maintained alongside the emergency floor.
            </p>
          </div>
        </div>
      </div>

      {/* ── Create / edit modal ───────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Savings Goal' : 'Create Savings Goal'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="goal-name"
            label="Goal Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. New Smartphone / Bike Insurance"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="goal-target"
              label="Target Amount (₹)"
              type="number"
              min={1}
              required
              className="font-currency tabular-nums"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
            />
            <Input
              id="goal-current"
              label={editingId ? 'Current Saved (₹)' : 'Starting Amount (₹)'}
              type="number"
              min={0}
              className="font-currency tabular-nums"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="goal-deadline"
              label="Target Deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="e.g. August 2027"
            />
            <div>
              <label htmlFor="goal-category" className="block font-ui font-semibold text-ink-muted mb-1.5 text-sm">
                Category
              </label>
              <select
                id="goal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as SavingsGoal['category'])}
                className="w-full py-2.5 px-4 rounded-input bg-surface border-2 border-bevel-neutral font-ui text-ink focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <p className="mt-1 font-ui text-[11px] text-ink-subtle">
                Only Emergency and Vehicle goals receive the automatic 70/30 funding.
              </p>
            </div>
          </div>

          <div>
            <span className="block font-ui font-semibold text-ink-muted mb-1.5 text-sm">Priority Allocation Tier</span>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={priority === p}
                  onClick={() => setPriority(p)}
                  className={`px-4 py-2 rounded-full font-ui text-xs font-semibold transition-all cursor-pointer ${
                    priority === p
                      ? 'bg-primary text-primary-on shadow-[0_3px_0_0_#ad3300]'
                      : 'bg-surface-container text-ink-muted shadow-[0_3px_0_0_#857461] hover:bg-surface-high'
                  }`}
                >
                  {PRIORITY_LABEL[p]}
                  {p === 'High' ? ' (Next in waterfall)' : p === 'Medium' ? ' (Parallel)' : ' (Change roundup)'}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-1">
            <Button type="submit" variant="danger" size="lg" full loading={isSaving} className="rounded-full">
              <MaterialIcon name="verified" className="text-xl" />
              <span className="font-ui">
                {editingId ? 'Save changes' : 'Confirm & start daily split'}
              </span>
            </Button>
          </div>

          {editingId && (
            <div className="pt-1 border-t border-bevel-neutral">
              {confirmingDeleteId === editingId ? (
                <div className="flex items-center gap-2 pt-3">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    full
                    disabled={isSaving}
                    onClick={() => handleDelete(editingId)}
                  >
                    Yes, delete this goal
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    full
                    onClick={() => setConfirmingDeleteId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDeleteId(editingId)}
                  className="mt-3 w-full py-2.5 rounded-full font-ui text-xs font-semibold text-danger bg-danger-light hover:brightness-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MaterialIcon name="delete" className="text-base" />
                  Delete goal
                </button>
              )}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
