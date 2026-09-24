import React, { useState } from 'react';
import { Mail, Lock, User, Briefcase, Loader2, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ClientError } from '../api/client';
import { MascotMonster, MonsterMood } from '../components/MascotMonster';

type Mode = 'login' | 'register';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  // Mascot interactive state (mood is derived at render, see below)
  const [moodOverride, setMoodOverride] = useState<MonsterMood | null>(null);
  const [failedFlash, setFailedFlash] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [inputCharCount, setInputCharCount] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);

  // Form validity
  const emailValid = EMAIL_RE.test(email.trim());
  const passwordValid = password.length >= (mode === 'register' ? 8 : 1);
  const nameValid = mode !== 'register' || name.trim().length > 0;
  const formValid = emailValid && passwordValid && nameValid;

  // Friendly default mood: calm by default, angry only on failed flash / error or invalid submit
  const mood: MonsterMood = failedFlash || error ? 'angry' : moodOverride ?? (formValid && !isPasswordFocused ? 'happy' : 'calm');

  // Presentation-only password strength readout (never gates submission, only for create account)
  const strength = (() => {
    if (mode !== 'register' || !password) return null;
    if (password.length < 6) {
      return { pct: 28, label: 'grrr! too weak! needs 6+ characters', text: 'text-rose-100', bar: 'bg-rose-400' };
    }
    const hasNum = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasUp = /[A-Z]/.test(password);
    const variety = [hasNum, hasSpecial, hasUp].filter(Boolean).length;
    if (password.length >= 8 && (variety >= 2 || password.length >= 12)) {
      return { pct: 100, label: 'ahhh, perfect & strong!', text: 'text-emerald-100', bar: 'bg-emerald-300' };
    }
    return { pct: 64, label: 'getting better... add numbers or symbols', text: 'text-amber-100', bar: 'bg-amber-300' };
  })();

  const triggerAngryFlash = () => {
    setMoodOverride('angry');
    setIsBouncing(true);
    setFailedFlash(false);
    window.setTimeout(() => {
      setFailedFlash(true);
      setMoodOverride(null);
    }, 20);
    window.setTimeout(() => setFailedFlash(false), 800);
    window.setTimeout(() => setIsBouncing(false), 550);
  };

  const handleChange = (field: 'name' | 'email' | 'occupation', value: string) => {
    setInputCharCount(value.length);
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (field === 'occupation') setOccupation(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    setIsBouncing(true);
    window.setTimeout(() => setIsBouncing(false), 500);

    try {
      if (mode === 'register') {
        await register(name, email, password, occupation);
      } else {
        await login(email, password);
      }
      // Redirect is deliberately delayed ~600ms inside AuthContext so the happy
      // mascot can flash before the app shell mounts.
      setMoodOverride('happy');
    } catch (err) {
      triggerAngryFlash();
      setError(err instanceof ClientError ? err.message : 'Invalid credentials. Check your password!');
      setBusy(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setFailedFlash(false);
    setMoodOverride(null);
  };

  const handlePokeMonster = () => {
    setIsBouncing(true);
    setMoodOverride((prev) => (prev === 'calm' ? 'angry' : 'calm'));
    window.setTimeout(() => setIsBouncing(false), 500);
  };

  const fieldClasses =
    'w-full bg-transparent text-sm sm:text-base text-ink placeholder-ink-subtle p-0 m-0 font-light focus:outline-none';

  return (
    <div className="min-h-screen bg-[#3aa6e9] font-questrial flex flex-col items-center px-4 pt-8 sm:pt-12 pb-6 relative overflow-x-hidden select-none antialiased">
      {/* Soft sky atmosphere */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[420px] rounded-full bg-white/20 blur-[110px]" />

      {/* Header: exact reference copy */}
      <header className="relative z-10 text-center flex flex-col items-center">
        <h1 className="text-white text-5xl sm:text-6xl md:text-7xl font-extralight tracking-tight leading-tight lowercase">
          welcome,
        </h1>
        <p className="text-white text-lg sm:text-2xl font-light tracking-wide mt-1.5 opacity-90 lowercase">
          let&rsquo;s get signed in!
        </p>
      </header>

      {/* Monster Scene */}
      <div className="relative w-full max-w-md flex flex-col items-center flex-1 mt-6 sm:mt-8">
        {/* Mascot peeking from BEHIND the sign in box div */}
        <div aria-hidden="true" className="relative -mb-12 z-0">
          <MascotMonster
            mood={mood}
            isCoveringEyes={isPasswordFocused}
            isPeeking={showPassword && isPasswordFocused}
            inputCharCount={inputCharCount}
            isBouncing={isBouncing}
            celebrate={mood === 'happy' && !isPasswordFocused}
            onMonsterClick={handlePokeMonster}
            size="lg"
            className="cursor-pointer"
          />
        </div>

        {/* Sign in box div in FRONT of mascot */}
        <div
          className={`relative z-10 w-full bg-[#e8780c] p-2.5 sm:p-3 rounded-[20px] shadow-xl transition-colors duration-300 border-2 ${
            failedFlash ? 'border-rose-500 anim-angry-flash' : 'border-transparent'
          }`}
        >
          {/* White credentials card */}
          <div className="w-full bg-white rounded-xl overflow-hidden flex flex-col transition-all duration-300">
            {/* Mode switcher (existing auth state) */}
            <div className="flex gap-1.5 px-3.5 py-2.5 border-b border-gray-100">
              {(['login', 'register'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    mode === m ? 'bg-[#eb4e13] text-white shadow-[0_2px_0_0_#b93807]' : 'text-ink-muted hover:bg-gray-100'
                  }`}
                >
                  {m === 'login' ? 'sign in' : 'create account'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} id="credentials-form" className="flex flex-col">
              {mode === 'register' && (
                <>
                  <div className="relative flex items-center px-3.5 py-2 sm:py-2.5">
                    <User className="absolute left-3.5 w-4 h-4 text-ink-subtle" aria-hidden="true" />
                    <input
                      type="text"
                      required
                      aria-label="Your name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      onFocus={() => setIsPasswordFocused(false)}
                      className={`${fieldClasses} pl-8`}
                    />
                  </div>
                  <div className="w-full h-px bg-gray-200" />
                  <div className="relative flex items-center px-3.5 py-2 sm:py-2.5">
                    <Briefcase className="absolute left-3.5 w-4 h-4 text-ink-subtle" aria-hidden="true" />
                    <input
                      type="text"
                      aria-label="Occupation"
                      placeholder="Occupation (e.g. Swiggy Rider, Freelancer)"
                      value={occupation}
                      onChange={(e) => handleChange('occupation', e.target.value)}
                      onFocus={() => setIsPasswordFocused(false)}
                      className={`${fieldClasses} pl-8`}
                    />
                  </div>
                  <div className="w-full h-px bg-gray-200" />
                </>
              )}

              <div className="relative flex items-center px-3.5 py-2 sm:py-2.5">
                <Mail className="absolute left-3.5 w-4 h-4 text-ink-subtle" aria-hidden="true" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  aria-label="Email address"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onFocus={() => setIsPasswordFocused(false)}
                  className={`${fieldClasses} pl-8`}
                />
              </div>
              <div className="w-full h-px bg-gray-200" />

              <div className="relative flex items-center px-3.5 py-2 sm:py-2.5">
                <Lock className="absolute left-3.5 w-4 h-4 text-ink-subtle" aria-hidden="true" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={mode === 'register' ? 8 : 1}
                  autoComplete="current-password"
                  aria-label="Password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setInputCharCount(e.target.value.length);
                  }}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className={`${fieldClasses} pl-8 pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password (mascot will peek!)'}
                  title={showPassword ? 'Hide password' : 'Show password (mascot will peek!)'}
                  tabIndex={-1}
                  className="absolute right-3.5 p-1 text-ink-subtle hover:text-ink cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>

          {/* Presentation-only password strength readout */}
          {strength && (
            <div className="w-full px-1 pt-2 transition-all duration-300" aria-hidden="true">
              <div className="flex items-center justify-between text-[11px] font-medium pt-1 pb-1.5 text-white">
                <span className="lowercase">strength</span>
                <span className={`font-medium drop-shadow-sm lowercase ${strength.text}`}>{strength.label}</span>
              </div>
              <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden flex">
                <div className={`h-full rounded-full transition-all duration-300 ${strength.bar}`} style={{ width: `${strength.pct}%` }} />
              </div>
            </div>
          )}

          {/* Error region (aria-live) */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-2.5 px-3.5 py-2 rounded-xl bg-white/95 border-2 border-rose-500/60 text-rose-700 text-xs font-medium flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Submit action: go button */}
        <div className="relative flex justify-center items-center mt-4">
          <button
            form="credentials-form"
            type="submit"
            disabled={busy}
            className="relative z-10 bg-[#eb4e13] hover:bg-[#d9440c] active:scale-95 disabled:opacity-70 text-white text-base sm:text-lg font-light px-10 py-2.5 rounded-full shadow-[0_4px_0_0_#b93807] active:translate-y-0.5 active:shadow-[0_2px_0_0_#b93807] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eb4e13] cursor-pointer lowercase"
          >
            {busy ? (mood === 'happy' ? <Check className="w-5 h-5 inline" aria-hidden="true" /> : <Loader2 className="w-5 h-5 inline animate-spin" aria-hidden="true" />) : 'go'}
          </button>
        </div>

        {/* Footer links (reference copy) */}
        <nav aria-label="Account recovery" className="mt-5 flex items-center space-x-2 text-xs sm:text-sm text-white/95 font-light">
          <button type="button" title="Not wired in this prototype" className="hover:underline transition-all cursor-pointer lowercase">
            forgot password?
          </button>
          <span className="opacity-70">·</span>
          <button type="button" onClick={() => switchMode('register')} className="hover:underline transition-all cursor-pointer lowercase">
            create account
          </button>
        </nav>
      </div>

      {/* Existing demo quick-fill (logic unchanged, restyled) */}
      {mode === 'login' && (
        <button
          type="button"
          onClick={() => {
            setEmail('demo@earnwise.app');
            setPassword('demo1234');
            setError(null);
            setFailedFlash(false);
            setMoodOverride(null);
          }}
          className="mt-5 px-4 py-2 rounded-full bg-white/25 backdrop-blur-sm text-white text-xs font-medium border border-white/40 hover:bg-white/40 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">bolt</span>
          <span className="lowercase">quick-fill demo: demo@earnwise.app / demo1234</span>
        </button>
      )}

      <p className="mt-4 text-[11px] text-white/70 lowercase">
        click the monster to see angry &amp; calm states!
      </p>
    </div>
  );
};