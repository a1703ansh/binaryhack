import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  ShieldCheck, 
  Bike, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  X,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEarnWise } from '../context/EarnWiseContext';
import { SavingsGoal } from '../types';

export const GoalsView: React.FC = () => {
  const { goals, addGoal } = useEarnWise();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(10000);
  const [currentAmount, setCurrentAmount] = useState<number>(1000);
  const [deadline, setDeadline] = useState('December 2027');
  const [priority, setPriority] = useState<SavingsGoal['priority']>('Medium');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addGoal({
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      deadline,
      priority,
      category: 'General',
      icon: 'Target'
    });

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {}

    setName('');
    setIsModalOpen(false);
  };

  const getIcon = (category: SavingsGoal['category']) => {
    switch (category) {
      case 'Emergency': return ShieldCheck;
      case 'Vehicle': return Bike;
      case 'Festival': return Sparkles;
      default: return Target;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Target className="w-4 h-4" />
            <span>Targeted Savings</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Financial Goals & Buffers</h1>
          <p className="text-xs text-slate-400">
            Auto-Save streams micro-surplus directly into targeted emergency and maintenance pools
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Goals Grid (Step 13 Specification) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {goals.map(goal => {
          const Icon = getIcon(goal.category);
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

          return (
            <div 
              key={goal.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                    goal.priority === 'High' 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {goal.priority} Priority
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{goal.name}</h3>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      ₹{goal.currentAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 font-mono"> / ₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="text-base font-bold font-mono text-white">{percent}%</span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Target: {goal.deadline}</span>
                </div>
                <span className="text-emerald-400 font-medium">Auto-Funded</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Goal Priority Strategy Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-300 space-y-1">
          <strong className="text-white text-sm block">Intelligent Micro-Waterfall Allocation</strong>
          <p className="text-slate-400 leading-relaxed">
            When an auto-save triggers, EarnWise automatically routes 70% of the funds to your primary <strong>Emergency Fund</strong> until the 3-month survival buffer is secured. The remaining 30% flows into your <strong>Vehicle Maintenance Fund</strong> to ensure your primary livelihood asset never stalls.
          </p>
        </div>
      </div>

      {/* Create Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Create Savings Goal</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. New Smartphone / Bike Insurance"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={e => setTargetAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Starting Amount (₹)</label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={e => setCurrentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Deadline</label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    placeholder="e.g. August 2027"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
              >
                Create Goal & Enable Auto-Fund
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
