import React, { useState } from 'react';
import { X, User, Save, Smartphone, Download, Award, Shield, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenPlayStoreGuide: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onOpenPlayStoreGuide,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#101622] border border-[#24344a] rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#212c3d] bg-[#0c121b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1b2536] border border-[#2b3b52] flex items-center justify-center text-white font-bold">
              AM
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-white">Perfil del Atleta</h2>
              <p className="text-xs text-gray-400">Parámetros biométricos y objetivos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a2332] hover:bg-[#253247] text-gray-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm text-gray-300">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre completo</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-[#0b0e14] border border-[#233144] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#b6f047]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.5"
                value={profile.weightKg}
                onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) })}
                className="w-full bg-[#0b0e14] border border-[#233144] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#b6f047]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Altura (cm)</label>
              <input
                type="number"
                value={profile.heightCm}
                onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })}
                className="w-full bg-[#0b0e14] border border-[#233144] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#b6f047]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Meta diaria (kcal)</label>
              <input
                type="number"
                value={profile.dailyCalorieTarget}
                onChange={(e) => setProfile({ ...profile, dailyCalorieTarget: Number(e.target.value) })}
                className="w-full bg-[#0b0e14] border border-[#233144] rounded-xl px-3.5 py-2 text-xs text-[#b6f047] font-mono font-bold focus:outline-none focus:border-[#b6f047]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Sesiones semanales</label>
              <input
                type="number"
                value={profile.weeklyWorkoutsTarget}
                onChange={(e) => setProfile({ ...profile, weeklyWorkoutsTarget: Number(e.target.value) })}
                className="w-full bg-[#0b0e14] border border-[#233144] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#b6f047]"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1">Objetivo principal</label>
              <input
                type="text"
                value={profile.goal}
                onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                className="w-full bg-[#0b0e14] border border-[#233144] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#b6f047]"
              />
            </div>
          </div>

          {/* Quick Play Store action banner inside profile */}
          <div className="p-3.5 rounded-xl bg-[#141d2a] border border-[#233348] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-[#b6f047]" />
              <div>
                <p className="text-xs font-bold text-white">Publicación en Play Store</p>
                <p className="text-[11px] text-gray-400">Guía de empaquetado y archivos .aab</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPlayStoreGuide();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#b6f047] text-black font-bold text-xs hover:brightness-110 transition"
            >
              Abrir Guía
            </button>
          </div>

          {/* Install as app */}
          {isInstallable && (
            <button
              type="button"
              onClick={install}
              className="w-full py-2.5 rounded-xl bg-[#1a2536] hover:bg-[#233249] text-[#b6f047] border border-[#b6f047]/30 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Instalar PulseAI en pantalla de inicio</span>
            </button>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#b6f047] text-black font-bold text-xs hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5 shadow-lg"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>¡Perfil Actualizado!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
