import React from 'react';
import { Flame, Globe, WifiOff, User } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Language } from '../utils/translations';
import { UserProfile } from '../types';

interface NavbarProps {
  streakDays: number;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  userProfile: UserProfile;
  onNavigateToProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  streakDays,
  currentLanguage,
  onSelectLanguage,
  userProfile,
  onNavigateToProfile,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07090e]/90 backdrop-blur-xl border-b border-[#1b2332] px-3 sm:px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#b6f047] flex items-center justify-center text-black font-black text-sm shadow-lg shadow-[#b6f047]/20">
            P
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-widest text-white uppercase">
                PULSE<span className="text-[#b6f047]">.AI</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-[#b6f047]/15 text-[#b6f047] border border-[#b6f047]/30">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Right actions: Language pill, streak & avatar */}
        <div className="flex items-center gap-2">
          {/* Offline status alert */}
          {!isOnline && (
            <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <WifiOff className="w-3 h-3" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}

          {/* Language Selector */}
          <div className="flex items-center bg-[#111722] border border-[#222e40] p-0.5 rounded-xl text-xs">
            <Globe className="w-3 h-3 text-gray-400 ml-1.5 mr-0.5" />
            {(['es', 'ca', 'en'] as Language[]).map((lng) => (
              <button
                key={lng}
                onClick={() => onSelectLanguage(lng)}
                className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black uppercase transition ${
                  currentLanguage === lng
                    ? 'bg-[#b6f047] text-black shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {lng}
              </button>
            ))}
          </div>

          {/* Streak pill */}
          <div className="flex items-center gap-1 bg-[#111722] border border-[#222e40] px-2 py-1 rounded-xl text-xs font-bold text-white shadow-inner">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <span>{streakDays}d</span>
          </div>

          {/* Profile Avatar quick button */}
          <button
            onClick={onNavigateToProfile}
            className="w-8 h-8 rounded-xl overflow-hidden border border-[#2d3d54] hover:border-[#b6f047] transition shadow-md"
            title="Ver Perfil"
          >
            {userProfile.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full bg-[#182333] flex items-center justify-center text-white text-xs font-bold">
                {userProfile.name.charAt(0)}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
