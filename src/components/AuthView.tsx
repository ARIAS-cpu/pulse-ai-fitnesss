import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, ShieldCheck, Zap, Mail, Lock, User, Target, ChevronRight, Globe } from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/translations';
import { UserProfile } from '../types';

interface AuthViewProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onLoginSuccess: (profile: Partial<UserProfile>) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  currentLanguage,
  onSelectLanguage,
  onLoginSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('alex.moreno@symmetry.fit');
  const [password, setPassword] = useState('symmetry2026');
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('Hipertrofia Muscular & Simetría');
  const [level, setLevel] = useState('Avanzado');
  const [rememberMe, setRememberMe] = useState(true);

  const t = TRANSLATIONS[currentLanguage];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      email: email || 'atleta@pulse.ai',
      name: name || (email ? email.split('@')[0] : 'Atleta Pulse.AI'),
      goal,
      level,
      language: currentLanguage,
    });
  };

  const handleQuickDemo = () => {
    onLoginSuccess({
      email: 'alex.moreno@pulse.ai',
      name: 'Alex Moreno',
      goal: 'Hipertrofia Muscular & Rendimiento',
      level: 'Avanzado',
      language: currentLanguage,
    });
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-between relative overflow-hidden px-4 py-8 select-none">
      {/* Dynamic background ambient glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#b6f047]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Language Selector */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#b6f047] flex items-center justify-center text-black shadow-lg shadow-[#b6f047]/20 font-black tracking-tighter">
            P
          </div>
          <span className="font-extrabold tracking-widest text-sm text-white uppercase">
            PULSE<span className="text-[#b6f047]">.AI</span>
          </span>
        </div>

        {/* Language selector pill */}
        <div className="flex items-center gap-1 bg-[#121721] border border-[#232d3f] p-1 rounded-full text-xs">
          <Globe className="w-3.5 h-3.5 text-gray-400 ml-1.5" />
          <button
            type="button"
            onClick={() => onSelectLanguage('es')}
            className={`px-2 py-0.5 rounded-full font-bold transition-all ${
              currentLanguage === 'es'
                ? 'bg-[#b6f047] text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ES
          </button>
          <button
            type="button"
            onClick={() => onSelectLanguage('ca')}
            className={`px-2 py-0.5 rounded-full font-bold transition-all ${
              currentLanguage === 'ca'
                ? 'bg-[#b6f047] text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            CA
          </button>
          <button
            type="button"
            onClick={() => onSelectLanguage('en')}
            className={`px-2 py-0.5 rounded-full font-bold transition-all ${
              currentLanguage === 'en'
                ? 'bg-[#b6f047] text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto my-auto z-10 pt-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161d2b] border border-[#232f45] text-xs text-[#b6f047] font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pulse.AI Fitness Ecosystem v3.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
            PULSE<span className="text-[#b6f047]">.AI</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-xs mx-auto">
            {t.auth.subtitle}
          </p>
        </motion.div>

        {/* Tab Selector */}
        <div className="bg-[#0f141f] p-1 rounded-xl border border-[#1e2738] flex gap-1 mb-5">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'login'
                ? 'bg-[#b6f047] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.auth.loginTab}
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'register'
                ? 'bg-[#b6f047] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.auth.registerTab}
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-[#0f141f] border border-[#1e2738] rounded-2xl p-5 shadow-2xl relative">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {tab === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                    {t.auth.nameLabel}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.auth.namePlaceholder}
                      className="w-full bg-[#151c2a] border border-[#26334a] rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#b6f047]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                      {t.auth.levelLabel}
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full bg-[#151c2a] border border-[#26334a] rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#b6f047]"
                    >
                      <option value="Principiante">Principiante (0-1 año)</option>
                      <option value="Intermedio">Intermedio (1-3 años)</option>
                      <option value="Avanzado">Avanzado (3+ años)</option>
                      <option value="Élite">Competidor / Élite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                      {t.auth.goalLabel}
                    </label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="w-full bg-[#151c2a] border border-[#26334a] rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#b6f047]"
                    >
                      <option value="Hipertrofia Muscular">Hipertrofia (Masa)</option>
                      <option value="Fuerza Máxima (Powerlifting)">Fuerza (1RM)</option>
                      <option value="Definición & Pérdida de Grasa">Definición</option>
                      <option value="Recomposición Corporal">Recomposición</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder}
                  className="w-full bg-[#151c2a] border border-[#26334a] rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#b6f047]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                  {t.auth.passwordLabel}
                </label>
                {tab === 'login' && (
                  <span className="text-[10px] text-[#b6f047] cursor-pointer hover:underline">
                    ¿Olvidada?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  className="w-full bg-[#151c2a] border border-[#26334a] rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#b6f047]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-[#151c2a] border-[#26334a] text-[#b6f047] focus:ring-0"
                />
                <span>Recordar sesión</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#b6f047] hover:bg-[#a5e035] text-black font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#b6f047]/20 transition-all active:scale-[0.98]"
            >
              <span>{tab === 'login' ? t.auth.loginButton : t.auth.registerButton}</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1e2738]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#0f141f] px-2 text-gray-500 font-bold">O acceso instantáneo</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full bg-[#161f2e] hover:bg-[#1c273a] text-white border border-[#2d3b52] font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Zap className="w-3.5 h-3.5 text-[#b6f047] fill-[#b6f047]" />
            <span>{t.auth.demoButton}</span>
          </button>
          <p className="text-[10px] text-gray-500 text-center mt-2">
            {t.auth.demoDescription}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-md mx-auto text-center text-gray-500 text-[10px] z-10">
        <p>Pulse.AI Fitness &amp; Gym Intelligence &copy; 2026. Diseñado para atletas exigentes.</p>
      </div>
    </div>
  );
};
