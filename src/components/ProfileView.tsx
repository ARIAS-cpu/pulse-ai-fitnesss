import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Camera, 
  Ruler, 
  Trophy, 
  Calculator, 
  Plus, 
  Save, 
  Trash2, 
  LogOut, 
  Check, 
  Sparkles, 
  Scale, 
  TrendingUp, 
  Calendar, 
  Upload,
  Globe,
  Share2,
  RotateCcw
} from 'lucide-react';
import { 
  UserProfile, 
  ProgressPhoto, 
  BodyMeasurement, 
  WeightEntry, 
  PersonalRecords 
} from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';

interface ProfileViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  progressPhotos: ProgressPhoto[];
  onAddProgressPhoto: (photo: ProgressPhoto) => void;
  onDeleteProgressPhoto: (id: string) => void;
  measurements: BodyMeasurement[];
  onAddMeasurement: (m: BodyMeasurement) => void;
  weightHistory: WeightEntry[];
  onAddWeightEntry: (w: WeightEntry) => void;
  personalRecords: PersonalRecords;
  onUpdatePersonalRecords: (prs: PersonalRecords) => void;
  onResetAllData?: () => void;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onUpdateProfile,
  progressPhotos,
  onAddProgressPhoto,
  onDeleteProgressPhoto,
  measurements,
  onAddMeasurement,
  weightHistory,
  onAddWeightEntry,
  personalRecords,
  onUpdatePersonalRecords,
  onResetAllData,
  currentLanguage,
  onSelectLanguage,
  onLogout,
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const [activeTab, setActiveTab] = useState<'photos' | 'measurements' | 'prs' | 'weight' | 'calculators' | 'personal'>('personal');

  // Personal form state
  const [name, setName] = useState(userProfile.name);
  const [age, setAge] = useState(userProfile.age || 26);
  const [heightCm, setHeightCm] = useState(userProfile.heightCm);
  const [weightKg, setWeightKg] = useState(userProfile.weightKg);
  const [goal, setGoal] = useState(userProfile.goal);
  const [level, setLevel] = useState(userProfile.level);
  const [savedAlert, setSavedAlert] = useState(false);

  // New photo modal/form state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoAngle, setPhotoAngle] = useState<'front' | 'side' | 'back'>('front');
  const [photoWeight, setPhotoWeight] = useState(userProfile.weightKg);
  const [photoNotes, setPhotoNotes] = useState('');

  // New measurement form state
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const latestM = measurements[measurements.length - 1] || {};
  const [measChest, setMeasChest] = useState(latestM.chestCm || 104);
  const [measWaist, setMeasWaist] = useState(latestM.waistCm || 81);
  const [measHips, setMeasHips] = useState(latestM.hipsCm || 97);
  const [measBicepsL, setMeasBicepsL] = useState(latestM.bicepsLeftCm || 38);
  const [measBicepsR, setMeasBicepsR] = useState(latestM.bicepsRightCm || 38.5);
  const [measThighL, setMeasThighL] = useState(latestM.thighLeftCm || 59);
  const [measThighR, setMeasThighR] = useState(latestM.thighRightCm || 59.5);
  const [measCalves, setMeasCalves] = useState(latestM.calvesCm || 38.5);
  const [measNeck, setMeasNeck] = useState(latestM.neckCm || 40);
  const [measForearms, setMeasForearms] = useState(latestM.forearmsCm || 31);

  // New weight entry state
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState(userProfile.weightKg);
  const [newBodyFat, setNewBodyFat] = useState(14.5);
  const [newMuscleMass, setNewMuscleMass] = useState(62.0);

  // PRs form state
  const [prs, setPrs] = useState<PersonalRecords>(personalRecords);
  const [isEditingPrs, setIsEditingPrs] = useState(false);

  useEffect(() => {
    setPrs(personalRecords);
  }, [personalRecords]);

  // Biometrics Calculations
  const heightM = heightCm / 100;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);
  // FFMI: Fat-Free Mass Index assuming 14% body fat
  const fatFreeMass = weightKg * (1 - 0.14);
  const ffmi = (fatFreeMass / (heightM * heightM)).toFixed(1);
  // Mifflin-St Jeor formula for BMR
  const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  const tdee = Math.round(bmr * 1.55); // Moderate athletic activity
  const waistHeightRatio = latestM.waistCm ? (latestM.waistCm / heightCm).toFixed(2) : '0.45';

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...userProfile,
      name,
      age: Number(age),
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      goal,
      level,
      language: currentLanguage,
    });
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) return;
    const newPhoto: ProgressPhoto = {
      id: `photo-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      url: photoUrl,
      angle: photoAngle,
      weightKg: Number(photoWeight),
      notes: photoNotes,
    };
    onAddProgressPhoto(newPhoto);
    setPhotoUrl('');
    setPhotoNotes('');
    setShowPhotoModal(false);
  };

  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const newM: BodyMeasurement = {
      id: `m-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      chestCm: Number(measChest),
      waistCm: Number(measWaist),
      hipsCm: Number(measHips),
      bicepsLeftCm: Number(measBicepsL),
      bicepsRightCm: Number(measBicepsR),
      thighLeftCm: Number(measThighL),
      thighRightCm: Number(measThighR),
      calvesCm: Number(measCalves),
      neckCm: Number(measNeck),
      forearmsCm: Number(measForearms),
    };
    onAddMeasurement(newM);
    setShowMeasurementModal(false);
  };

  const handleSaveWeightEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: WeightEntry = {
      id: `w-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: Number(newWeight),
      bodyFatPct: Number(newBodyFat),
      muscleMassKg: Number(newMuscleMass),
    };
    onAddWeightEntry(entry);
    setWeightKg(Number(newWeight));
    onUpdateProfile({
      ...userProfile,
      weightKg: Number(newWeight),
    });
    setShowWeightModal(false);
  };

  const handleSavePrs = () => {
    onUpdatePersonalRecords({
      ...prs,
      updatedAt: new Date().toISOString().split('T')[0],
    });
    localStorage.setItem('pulse_prs_manually_set', 'true');
    setIsEditingPrs(false);
  };

  const handleResetPrsToZero = () => {
    const zeroPrs: PersonalRecords = {
      benchPressKg: 0,
      squatKg: 0,
      deadliftKg: 0,
      militaryPressKg: 0,
      pullUpsKg: 0,
      dipsKg: 0,
      legPressKg: 0,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setPrs(zeroPrs);
    onUpdatePersonalRecords(zeroPrs);
    localStorage.removeItem('pulse_prs_manually_set');
    setIsEditingPrs(false);
  };

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-3 sm:px-4 pt-2">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-br from-[#121824] via-[#0d121c] to-[#0a0d14] border border-[#202b3c] rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#b6f047]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#b6f047] to-[#38bdf8] p-0.5 shadow-lg shadow-[#b6f047]/20">
                <img
                  src={userProfile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt={userProfile.name}
                  className="w-full h-full object-cover rounded-[14px]"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#b6f047] text-black font-black text-[10px] px-1.5 py-0.5 rounded-md shadow">
                LVL {userProfile.athleteLevel ?? 1}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {userProfile.name}
                </h1>
                <span className="px-2 py-0.5 bg-[#b6f047]/20 text-[#b6f047] text-[10px] font-extrabold rounded-full uppercase border border-[#b6f047]/30">
                  {userProfile.level}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{userProfile.goal}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-300">
                <span className="flex items-center gap-1 font-semibold text-white">
                  <Scale className="w-3.5 h-3.5 text-[#b6f047]" /> {userProfile.weightKg} kg
                </span>
                <span className="text-gray-500">•</span>
                <span>{userProfile.heightCm} cm</span>
                <span className="text-gray-500">•</span>
                <span>{userProfile.age || 26} años</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Language Selector in Profile */}
            <div className="flex items-center bg-[#182130] border border-[#2b3950] p-1 rounded-xl text-xs">
              <Globe className="w-3.5 h-3.5 text-gray-400 ml-1 mr-1" />
              {(['es', 'ca', 'en'] as Language[]).map((lng) => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => onSelectLanguage(lng)}
                  className={`px-2 py-0.5 rounded-lg font-bold text-[11px] uppercase transition ${
                    currentLanguage === lng
                      ? 'bg-[#b6f047] text-black shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {lng}
                </button>
              ))}
            </div>

            <button
              onClick={onLogout}
              title={t.auth.logout}
              className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-tabs horizontal scroll */}
        <div className="flex items-center gap-1 mt-6 border-t border-[#1d2737] pt-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'personal', label: t.profile.personalData, icon: User },
            { id: 'photos', label: t.profile.photosTab, icon: Camera },
            { id: 'measurements', label: t.profile.measurementsTab, icon: Ruler },
            { id: 'prs', label: t.profile.recordsTab, icon: Trophy },
            { id: 'weight', label: t.profile.currentWeight, icon: Scale },
            { id: 'calculators', label: t.profile.calculatorsTab, icon: Calculator },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#b6f047] text-black shadow-md shadow-[#b6f047]/20 font-black'
                    : 'bg-[#141b27] text-gray-400 hover:text-white hover:bg-[#1c2637]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: PERSONAL INFO */}
      {activeTab === 'personal' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f1420] border border-[#1e283a] rounded-3xl p-5 sm:p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#b6f047]" /> {t.profile.personalData}
              </h2>
              <p className="text-xs text-gray-400">Edita tus datos básicos y objetivos atléticos</p>
            </div>
            {savedAlert && (
              <span className="flex items-center gap-1 text-xs text-[#b6f047] font-bold bg-[#b6f047]/10 px-2.5 py-1 rounded-lg border border-[#b6f047]/30">
                <Check className="w-3.5 h-3.5" /> ¡Guardado!
              </span>
            )}
          </div>

          <form onSubmit={handleSavePersonal} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-[#b6f047]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {t.profile.age}
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-[#b6f047]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {t.profile.height}
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-[#b6f047]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {t.profile.currentWeight}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-[#b6f047]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {t.profile.goal}
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-[#b6f047]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {t.profile.level}
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-[#b6f047]"
                >
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                  <option value="Élite">Élite</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#b6f047] hover:bg-[#a5e035] text-black font-extrabold py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#b6f047]/20 transition"
            >
              <Save className="w-4 h-4" /> {t.profile.saveChanges}
            </button>
          </form>

          {onResetAllData && (
            <div className="mt-6 pt-5 border-t border-[#1e283a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121927]/60 rounded-2xl p-4">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Empezar de Cero (Limpiar Datos)
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Restablece todos los entrenamientos, marcas y progreso a cero para empezar de nuevo con la app vacía.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Deseas reiniciar todos los registros a cero para empezar completamente desde el inicio? Esta acción borrará todas las marcas y actividades.')) {
                    onResetAllData();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-bold transition self-start sm:self-center"
              >
                Reiniciar a Cero
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 2: PROGRESS PHOTOS */}
      {activeTab === 'photos' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#b6f047]" /> {t.profile.photosTab}
              </h2>
              <p className="text-xs text-gray-400">Visualiza tu cambio físico real en el tiempo</p>
            </div>
            <button
              onClick={() => setShowPhotoModal(true)}
              className="bg-[#b6f047] hover:bg-[#a5e035] text-black font-extrabold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-[#b6f047]/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> {t.profile.addPhoto}
            </button>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {progressPhotos.map((photo) => (
              <div
                key={photo.id}
                className="bg-[#0f1420] border border-[#1e283a] rounded-2xl overflow-hidden shadow-xl group hover:border-[#b6f047]/50 transition-all flex flex-col"
              >
                <div className="relative aspect-[3/4] bg-[#07090e] overflow-hidden">
                  <img
                    src={photo.url}
                    alt="Progreso físico"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-black uppercase text-[#b6f047] border border-white/10">
                    {photo.angle === 'front' ? 'Frontal' : photo.angle === 'side' ? 'Perfil' : 'Espalda'}
                  </div>
                  {photo.weightKg && (
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-white border border-white/10">
                      {photo.weightKg} kg
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-500" /> {photo.date}
                      </span>
                    </div>
                    {photo.notes && (
                      <p className="text-xs text-gray-300 line-clamp-2">{photo.notes}</p>
                    )}
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onDeleteProgressPhoto(photo.id)}
                      className="text-gray-500 hover:text-red-400 p-1 transition"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal for adding photo */}
          {showPhotoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#101622] border border-[#24344a] rounded-2xl w-full max-w-md p-5 shadow-2xl">
                <h3 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#b6f047]" /> Subir Foto de Progreso
                </h3>
                <form onSubmit={handleSavePhoto} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">
                      Seleccionar Archivo (Móvil o PC)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1f293d] file:text-white hover:file:bg-[#283650]"
                    />
                  </div>

                  {photoUrl && (
                    <div className="w-24 h-32 rounded-xl overflow-hidden border border-[#2d3a50] mx-auto">
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">
                        Ángulo
                      </label>
                      <select
                        value={photoAngle}
                        onChange={(e) => setPhotoAngle(e.target.value as any)}
                        className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2 px-3 text-white focus:outline-none"
                      >
                        <option value="front">Frontal</option>
                        <option value="side">Perfil Lateral</option>
                        <option value="back">Espalda</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">
                        Peso ese día (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={photoWeight}
                        onChange={(e) => setPhotoWeight(Number(e.target.value))}
                        className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2 px-3 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">
                      Notas del cambio
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Buena congestión en bíceps y deltoides..."
                      value={photoNotes}
                      onChange={(e) => setPhotoNotes(e.target.value)}
                      className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2 px-3 text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPhotoModal(false)}
                      className="px-4 py-2 rounded-xl bg-[#161d2b] text-gray-400 font-bold hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!photoUrl}
                      className="px-4 py-2 rounded-xl bg-[#b6f047] text-black font-extrabold shadow-lg disabled:opacity-50"
                    >
                      Guardar Foto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 3: MEASUREMENTS */}
      {activeTab === 'measurements' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#b6f047]" /> {t.profile.measurementsTab}
              </h2>
              <p className="text-xs text-gray-400">Control métrico milimétrico de cada grupo muscular</p>
            </div>
            <button
              onClick={() => setShowMeasurementModal(true)}
              className="bg-[#b6f047] hover:bg-[#a5e035] text-black font-extrabold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-[#b6f047]/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> {t.profile.addMeasurement}
            </button>
          </div>

          {/* Current Measurements Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { label: t.profile.chest, value: `${latestM.chestCm || 104.5} cm`, key: 'chest' },
              { label: t.profile.waist, value: `${latestM.waistCm || 81.0} cm`, key: 'waist' },
              { label: t.profile.hips, value: `${latestM.hipsCm || 97.0} cm`, key: 'hips' },
              { label: t.profile.bicepsL, value: `${latestM.bicepsLeftCm || 38.2} cm`, key: 'bicepL' },
              { label: t.profile.bicepsR, value: `${latestM.bicepsRightCm || 38.5} cm`, key: 'bicepR' },
              { label: t.profile.thighL, value: `${latestM.thighLeftCm || 59.2} cm`, key: 'thighL' },
              { label: t.profile.thighR, value: `${latestM.thighRightCm || 59.5} cm`, key: 'thighR' },
              { label: t.profile.calves, value: `${latestM.calvesCm || 38.5} cm`, key: 'calves' },
              { label: t.profile.neck, value: `${latestM.neckCm || 40.0} cm`, key: 'neck' },
              { label: t.profile.forearm, value: `${latestM.forearmsCm || 31.0} cm`, key: 'forearms' },
            ].map((item) => (
              <div
                key={item.key}
                className="bg-[#0f1420] border border-[#1e283a] rounded-2xl p-3.5 flex flex-col justify-between shadow-lg hover:border-[#b6f047]/40 transition"
              >
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="text-lg font-black text-white mt-1 text-[#b6f047]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Measurements History Table */}
          <div className="bg-[#0f1420] border border-[#1e283a] rounded-2xl p-4 shadow-xl overflow-x-auto">
            <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider mb-3">
              Historial de Mediciones
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1e283a] text-gray-500">
                  <th className="pb-2 font-bold">Fecha</th>
                  <th className="pb-2 font-bold">Pecho</th>
                  <th className="pb-2 font-bold">Cintura</th>
                  <th className="pb-2 font-bold">Bíceps D/I</th>
                  <th className="pb-2 font-bold">Muslo D/I</th>
                  <th className="pb-2 font-bold">Cuello</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161e2c]">
                {measurements.map((m) => (
                  <tr key={m.id} className="text-gray-300">
                    <td className="py-2.5 font-semibold text-white">{m.date}</td>
                    <td className="py-2.5">{m.chestCm || '--'} cm</td>
                    <td className="py-2.5">{m.waistCm || '--'} cm</td>
                    <td className="py-2.5">
                      {m.bicepsRightCm || m.bicepsCm || '--'} / {m.bicepsLeftCm || '--'} cm
                    </td>
                    <td className="py-2.5">
                      {m.thighRightCm || m.thighCm || '--'} / {m.thighLeftCm || '--'} cm
                    </td>
                    <td className="py-2.5">{m.neckCm || '--'} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add measurement modal */}
          {showMeasurementModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-[#101622] border border-[#24344a] rounded-2xl w-full max-w-lg p-5 shadow-2xl my-auto">
                <h3 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#b6f047]" /> Registrar Nuevas Medidas
                </h3>
                <form onSubmit={handleSaveMeasurement} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">{t.profile.chest} (cm)</label>
                      <input type="number" step="0.5" value={measChest} onChange={e => setMeasChest(Number(e.target.value))} className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2 px-3 text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">{t.profile.waist} (cm)</label>
                      <input type="number" step="0.5" value={measWaist} onChange={e => setMeasWaist(Number(e.target.value))} className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2 px-3 text-white focus:outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">{t.profile.bicepsL} (cm)</label>
                      <input type="number" step="0.5" value={measBicepsL} onChange={e => setMeasBicepsL(Number(e.target.value))} className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2 px-3 text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">{t.profile.bicepsR} (cm)</label>
                      <input type="number" step="0.5" value={measBicepsR} onChange={e => setMeasBicepsR(Number(e.target.value))} className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2 px-3 text-white focus:outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">{t.profile.thighL} (cm)</label>
                      <input type="number" step="0.5" value={measThighL} onChange={e => setMeasThighL(Number(e.target.value))} className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2 px-3 text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">{t.profile.thighR} (cm)</label>
                      <input type="number" step="0.5" value={measThighR} onChange={e => setMeasThighR(Number(e.target.value))} className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2 px-3 text-white focus:outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">{t.profile.hips} (cm)</label>
                      <input type="number" step="0.5" value={measHips} onChange={e => setMeasHips(Number(e.target.value))} className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2 px-2 text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">{t.profile.neck} (cm)</label>
                      <input type="number" step="0.5" value={measNeck} onChange={e => setMeasNeck(Number(e.target.value))} className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2 px-2 text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">{t.profile.calves} (cm)</label>
                      <input type="number" step="0.5" value={measCalves} onChange={e => setMeasCalves(Number(e.target.value))} className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2 px-2 text-white focus:outline-none" />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button type="button" onClick={() => setShowMeasurementModal(false)} className="px-4 py-2 rounded-xl bg-[#161d2b] text-gray-400 font-bold hover:text-white">
                      Cancelar
                    </button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-[#b6f047] text-black font-extrabold shadow-lg">
                      Guardar Medidas
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 4: PERSONAL RECORDS (PRs) */}
      {activeTab === 'prs' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#b6f047]" /> {t.profile.personalRecords}
              </h2>
              <p className="text-xs text-gray-400">Tus marcas máximas estimadas (1RM) en ejercicios básicos</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetPrsToZero}
                className="bg-[#141c28] hover:bg-[#1c2738] text-gray-400 hover:text-white border border-[#233146] font-bold text-xs py-2 px-3 rounded-xl transition flex items-center gap-1.5"
                title="Poner marcas a 0"
              >
                <RotateCcw className="w-3 h-3 text-gray-400" />
                <span className="hidden sm:inline">Poner a 0</span>
              </button>
              <button
                onClick={() => setIsEditingPrs(!isEditingPrs)}
                className="bg-[#1b2536] hover:bg-[#253347] text-white border border-[#2d3d54] font-bold text-xs py-2 px-3.5 rounded-xl transition"
              >
                {isEditingPrs ? 'Cancelar' : t.profile.editRecords}
              </button>
            </div>
          </div>

          {/* Informative clean baseline banner */}
          <div className="bg-[#121926] border border-[#1e2a3c] rounded-2xl p-3.5 flex items-start gap-3">
            <Trophy className="w-4 h-4 text-[#b6f047] shrink-0 mt-0.5" />
            <div className="text-xs text-gray-300">
              <p className="font-bold text-white mb-0.5">Control de Marcas Personales (1RM)</p>
              <p className="text-gray-400 leading-relaxed">
                Empiezas desde cero: tus marcas se registrarán automáticamente cuando completes entrenamientos con peso en <span className="text-[#b6f047] font-semibold">Entrenar</span>, o puedes pulsar <span className="text-white font-bold">"Editar Marcas"</span> para introducir tus marcas actuales.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: t.profile.benchPress, value: prs.benchPressKg, key: 'benchPressKg', target: 120 },
              { label: t.profile.squat, value: prs.squatKg, key: 'squatKg', target: 160 },
              { label: t.profile.deadlift, value: prs.deadliftKg, key: 'deadliftKg', target: 200 },
              { label: t.profile.militaryPress, value: prs.militaryPressKg, key: 'militaryPressKg', target: 80 },
              { label: t.profile.pullUps, value: prs.pullUpsKg, key: 'pullUpsKg', target: 40 },
              { label: t.profile.dips, value: prs.dipsKg, key: 'dipsKg', target: 50 },
              { label: t.profile.legPress, value: prs.legPressKg, key: 'legPressKg', target: 350 },
            ].map((pr) => (
              <div
                key={pr.key}
                className="bg-[#0f1420] border border-[#1e283a] rounded-2xl p-4 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300">{pr.label}</span>
                  <Trophy className="w-4 h-4 text-[#b6f047]/60" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  {isEditingPrs ? (
                    <input
                      type="number"
                      step="0.5"
                      value={prs[pr.key as keyof PersonalRecords] as number}
                      onChange={(e) =>
                        setPrs({
                          ...prs,
                          [pr.key]: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-24 bg-[#161e2c] border border-[#2b394f] rounded-lg px-2 py-1 text-white font-black text-lg focus:outline-none focus:border-[#b6f047]"
                    />
                  ) : pr.value > 0 ? (
                    <>
                      <span className="text-2xl font-black text-[#b6f047]">{pr.value}</span>
                      <span className="text-xs text-gray-400 font-bold">kg</span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-gray-500 italic">0 kg (Sin registrar)</span>
                  )}
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>Meta: {pr.target} kg</span>
                    <span>{pr.value > 0 ? `${Math.round((pr.value / pr.target) * 100)}%` : '0%'}</span>
                  </div>
                  <div className="w-full bg-[#182130] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#b6f047] to-[#38bdf8] h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round(((pr.value || 0) / pr.target) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isEditingPrs && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetPrsToZero}
                className="bg-[#1b2536] hover:bg-[#253347] text-gray-400 hover:text-white font-bold text-xs py-2 px-3.5 rounded-xl border border-[#2d3d54] transition"
              >
                Poner todas a 0 kg
              </button>
              <button
                onClick={handleSavePrs}
                className="bg-[#b6f047] hover:bg-[#a5e035] text-black font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-lg shadow-[#b6f047]/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Guardar Marcas Actualizadas
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 5: WEIGHT & BODY COMPOSITION */}
      {activeTab === 'weight' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#b6f047]" /> {t.profile.currentWeight}
              </h2>
              <p className="text-xs text-gray-400">Control de peso diario y porcentaje graso</p>
            </div>
            <button
              onClick={() => setShowWeightModal(true)}
              className="bg-[#b6f047] hover:bg-[#a5e035] text-black font-extrabold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-[#b6f047]/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> {t.profile.newWeightEntry}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#0f1420] border border-[#1e283a] rounded-2xl p-4 shadow-xl">
              <span className="text-xs font-bold text-gray-400 uppercase">Peso Actual</span>
              <p className="text-2xl font-black text-white mt-1">{weightKg} <span className="text-sm font-bold text-[#b6f047]">kg</span></p>
              <span className="text-[10px] text-gray-400 font-semibold">
                {weightHistory.length > 1
                  ? `${(weightKg - weightHistory[0].weightKg) >= 0 ? '+' : ''}${(weightKg - weightHistory[0].weightKg).toFixed(1)} kg de variación`
                  : 'Primer registro de peso'}
              </span>
            </div>
            <div className="bg-[#0f1420] border border-[#1e283a] rounded-2xl p-4 shadow-xl">
              <span className="text-xs font-bold text-gray-400 uppercase">{t.profile.bodyFat}</span>
              <p className="text-2xl font-black text-white mt-1">14.2 <span className="text-sm font-bold text-[#38bdf8]">%</span></p>
              <span className="text-[10px] text-gray-400">Rango atlético estético</span>
            </div>
            <div className="bg-[#0f1420] border border-[#1e283a] rounded-2xl p-4 shadow-xl">
              <span className="text-xs font-bold text-gray-400 uppercase">{t.profile.muscleMass}</span>
              <p className="text-2xl font-black text-white mt-1">62.8 <span className="text-sm font-bold text-[#b6f047]">kg</span></p>
              <span className="text-[10px] text-emerald-400 font-semibold">+0.8 kg masa magra</span>
            </div>
          </div>

          {/* Weight Log Table */}
          <div className="bg-[#0f1420] border border-[#1e283a] rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider mb-3">
              Registros Históricos de Peso
            </h3>
            <div className="space-y-2">
              {weightHistory.slice(-5).reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#141b27] border border-[#1d2737] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold text-white">{entry.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {entry.bodyFatPct && (
                      <span className="text-gray-400">{entry.bodyFatPct}% grasa</span>
                    )}
                    <span className="font-black text-[#b6f047] text-sm">{entry.weightKg} kg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weight Entry Modal */}
          {showWeightModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#101622] border border-[#24344a] rounded-2xl w-full max-w-sm p-5 shadow-2xl">
                <h3 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#b6f047]" /> {t.profile.newWeightEntry}
                </h3>
                <form onSubmit={handleSaveWeightEntry} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">Peso Hoy (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newWeight}
                      onChange={(e) => setNewWeight(Number(e.target.value))}
                      className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2 px-3 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">% Grasa Estimado (opcional)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newBodyFat}
                      onChange={(e) => setNewBodyFat(Number(e.target.value))}
                      className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2 px-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">Masa Muscular (kg, opcional)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newMuscleMass}
                      onChange={(e) => setNewMuscleMass(Number(e.target.value))}
                      className="w-full bg-[#161d2b] border border-[#253247] rounded-xl py-2 px-3 text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowWeightModal(false)}
                      className="px-4 py-2 rounded-xl bg-[#161d2b] text-gray-400 font-bold hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#b6f047] text-black font-extrabold shadow-lg"
                    >
                      {t.profile.saveWeight}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 6: CALCULATORS */}
      {activeTab === 'calculators' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#b6f047]" /> {t.profile.biometrics}
            </h2>
            <p className="text-xs text-gray-400">Fórmulas científicas calculadas en tiempo real para tu cuerpo</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#0f1420] border border-[#1e283a] rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300">{t.profile.bmi}</span>
                <span className="text-xs font-bold text-[#b6f047]">Normal / Atlético</span>
              </div>
              <p className="text-3xl font-black text-white mt-1">{bmi}</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Índice de masa corporal para {weightKg}kg y {heightCm}cm.
              </p>
            </div>

            <div className="bg-[#0f1420] border border-[#1e283a] rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300">{t.profile.ffmi}</span>
                <span className="text-xs font-bold text-[#38bdf8]">Excelente</span>
              </div>
              <p className="text-3xl font-black text-white mt-1">{ffmi}</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Fat-Free Mass Index: el estándar de oro en culturismo natural para medir desarrollo muscular.
              </p>
            </div>

            <div className="bg-[#0f1420] border border-[#1e283a] rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300">{t.profile.bmr}</span>
                <span className="text-xs font-bold text-orange-400">kcal/día</span>
              </div>
              <p className="text-3xl font-black text-white mt-1">{bmr}</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Tasa Metabólica Basal por fórmula Mifflin-St Jeor (calorías que quemas en reposo total).
              </p>
            </div>

            <div className="bg-[#0f1420] border border-[#1e283a] rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300">{t.profile.tdee}</span>
                <span className="text-xs font-bold text-[#b6f047]">kcal/día</span>
              </div>
              <p className="text-3xl font-black text-white mt-1">{tdee}</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Gasto Energético Diario Total con entrenamiento moderado/intenso.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
