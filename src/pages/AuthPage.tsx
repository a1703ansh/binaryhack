import React, { useState } from 'react';
import { Mail, Lock, User, Briefcase, ArrowRight, Loader2, Eye, EyeOff, Sparkles, Flame, Smile } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ClientError } from '../api/client';
import { MascotMonster, MonsterMood } from '../components/MascotMonster';

type Mode = 'login' | 'register';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [occupation, setOccupation] = useState('Delivery Partner');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Mascot interactive state
  const [mood, setMood] = useState<MonsterMood>('calm');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [inputCharCount, setInputCharCount] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 500);

    try {
      if (mode === 'register') {
        await register(name, email, password, occupation);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setMood('angry');
      setError(err instanceof ClientError ? err.message : 'Invalid credentials. Check your password!');
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setMood('calm');
  };

  const handlePokeMonster = () => {
    setIsBouncing(true);
    setMood((prev) => (prev === 'calm' ? 'angry' : 'calm'));
    setTimeout(() => setIsBouncing(false), 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-questrial">
      {/* Background radial atmosphere */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-sky-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-amber-500/10 blur-[100px]" />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Mood Switcher Bar */}
        <div className="flex items-center gap-2 mb-3 bg-slate-900/90 border border-slate-800 rounded-full px-3 py-1 text-xs shadow-lg">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Prototype Mood:</span>
          <button
            type="button"
            onClick={() => setMood('calm')}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold transition-all ${
              mood === 'calm'
                ? 'bg-amber-500 text-slate-950 shadow-[0_2px_0_0_#ad3300]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            Calm
          </button>
          <button
            type="button"
            onClick={() => setMood('angry')}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold transition-all ${
              mood === 'angry'
                ? 'bg-rose-500 text-white shadow-[0_2px_0_0_#872600]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Angry
          </button>
        </div>

        {/* Interactive Emotional Monster Mascot */}
        <div className="relative -mb-6 z-20">
          <MascotMonster
            mood={mood}
            isCoveringEyes={isPasswordFocused}
            isPeeking={showPassword && isPasswordFocused}
            inputCharCount={inputCharCount}
            isBouncing={isBouncing}
            onMonsterClick={handlePokeMonster}
            size="md"
          />
        </div>

        {/* Main Card */}
        <div className="w-full bg-slate-900 border-4 border-[#ad3300] rounded-3xl shadow-[0_10px_0_0_#872600] p-6 sm:p-7 relative z-10 bg-gradient-to-b from-slate-900 to-slate-950">
          {/* Header text */}
          <div className="text-center mb-5">
            <h1 className="font-bold text-2xl tracking-tight text-white flex items-center justify-center gap-2">
              <span>EarnWise</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {mood === 'angry'
                ? 'Grrr! The monster is demanding your login!'
                : 'Your playful micro-savings & tax copilot'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 pb-4 mb-5 border-b border-slate-800">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  mode === m
                    ? 'bg-amber-500 text-slate-950 shadow-[0_3px_0_0_#ad3300]'
                    : 'text-slate-400 hover:text-white bg-slate-800/50'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
            {mode === 'register' && (
              <>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setInputCharCount(e.target.value.length);
                    }}
                    onFocus={() => setIsPasswordFocused(false)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border-2 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Occupation (e.g. Swiggy Rider, Freelancer)"
                    value={occupation}
                    onChange={(e) => {
                      setOccupation(e.target.value);
                      setInputCharCount(e.target.value.length);
                    }}
                    onFocus={() => setIsPasswordFocused(false)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border-2 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setInputCharCount(e.target.value.length);
                }}
                onFocus={() => setIsPasswordFocused(false)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border-2 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={mode === 'register' ? 8 : 1}
                placeholder={mode === 'register' ? 'Password (min 8 chars)' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border-2 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                title={showPassword ? 'Hide password' : 'Show password (mascot will peek!)'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border-2 border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <Flame className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Tactile 3D Bevel Button */}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-full font-bold bg-[#e84e12] hover:bg-[#ff5714] text-white shadow-[0_5px_0_0_#872600] active:translate-y-1 active:shadow-[0_2px_0_0_#872600] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>{mode === 'login' ? 'Let\'s Go!' : 'Create My Account'}</span>
            </button>
          </form>

          {mode === 'login' && (
            <button
              type="button"
              onClick={() => {
                setEmail('demo@earnwise.app');
                setPassword('demo1234');
                setError(null);
                setMood('calm');
              }}
              className="mt-4 w-full py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition-colors"
            >
              ⚡ Quick Fill Demo: demo@earnwise.app / demo1234
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-5 text-[11px] text-slate-400">
          <span>Click the monster or toggle mood above to see angry & calm states!</span>
        </div>
      </div>
    </div>
  );
};