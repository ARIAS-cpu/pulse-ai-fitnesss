import React from 'react';
import { Home, Dumbbell, Sparkles, TrendingUp, User } from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/translations';

export type TabType = 'profile' | 'home' | 'workout' | 'coach' | 'progress';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  currentLanguage: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage].nav;

  const tabs: Array<{ id: TabType; label: string; icon: React.FC<{ className?: string }>; isCenterAction?: boolean }> = [
    { id: 'profile', label: t.profile, icon: User },
    { id: 'home', label: t.home, icon: Home },
    { id: 'workout', label: t.workout, icon: Dumbbell, isCenterAction: true },
    { id: 'coach', label: t.coach, icon: Sparkles },
    { id: 'progress', label: t.progress, icon: TrendingUp },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0e16]/95 backdrop-blur-xl border-t border-[#1e2738] px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] pt-2 shadow-2xl">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isCenterAction) {
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className="flex flex-col items-center justify-center -mt-6 group focus:outline-none px-2"
              >
                <div
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 active:scale-90 ${
                    isActive
                      ? 'bg-[#b6f047] text-black ring-4 ring-[#b6f047]/30 shadow-[#b6f047]/50 scale-105'
                      : 'bg-[#151e2c] border border-[#26374f] text-[#b6f047] hover:bg-[#1a2538] hover:border-[#b6f047]/50 shadow-black/80'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span
                  className={`text-[10px] font-black mt-1 uppercase tracking-wider transition ${
                    isActive ? 'text-[#b6f047]' : 'text-gray-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-[#b6f047]'
                  : 'text-gray-400 hover:text-gray-200 active:scale-95'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-[#b6f047]/15' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span
                className={`text-[10px] font-extrabold mt-0.5 uppercase tracking-wider ${
                  isActive ? 'text-[#b6f047]' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
