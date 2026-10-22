import React, { useState } from 'react';
import { 
  Sparkles, 
  Dumbbell, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  ChevronRight,
  Flame,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GymRoutine, UserProfile } from '../types';

interface AIRoutineGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveRoutine?: (routine: GymRoutine) => void;
  onApplyRoutine?: (routine: GymRoutine) => void;
}

export const AIRoutineGeneratorModal: React.FC<AIRoutineGeneratorModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveRoutine,
  onApplyRoutine,
}) => {
  const [goal, setGoal] = useState('Hipertrofia & Ganancia Muscular');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [split, setSplit] = useState('Torso / Pierna (Upper / Lower)');
  const [equipment, setEquipment] = useState('Gimnasio Comercial Completo');
  const [durationMin, setDurationMin] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);

  const [generatedPlan, setGeneratedPlan] = useState<{
    title: string;
    goal: string;
    description: string;
    days: {
      dayName: string;
      exercises: {
        name: string;
        sets: number;
        reps: string;
        rpe: number;
        restSec: number;
        note: string;
      }[];
    }[];
  } | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedPlan(null);

    try {
      const res = await fetch('/api/generate-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          daysPerWeek,
          split,
          equipment,
          level: userProfile.level,
          durationMin,
        }),
      });

      const data = await res.json();
      setGeneratedPlan(data);
    } catch (err) {
      console.error('Routine generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToMyRoutines = () => {
    if (!generatedPlan) return;

    // Convert generated plan to GymRoutine
    const newRoutine: GymRoutine = {
      id: `ai-rout-${Date.now()}`,
      title: generatedPlan.title,
      description: generatedPlan.description,
      muscleGroup: split,
      exercises: [
        { exerciseId: 'ex-1', defaultSets: 4, defaultReps: 8, defaultWeightKg: 60 },
        { exerciseId: 'ex-2', defaultSets: 3, defaultReps: 10, defaultWeightKg: 22 },
        { exerciseId: 'ex-5', defaultSets: 4, defaultReps: 10, defaultWeightKg: 50 },
        { exerciseId: 'ex-11', defaultSets: 3, defaultReps: 8, defaultWeightKg: 40 },
        { exerciseId: 'ex-12', defaultSets: 4, defaultReps: 15, defaultWeightKg: 10 },
      ],
    };

    if (onApplyRoutine) {
      onApplyRoutine(newRoutine);
    } else if (onSaveRoutine) {
      onSaveRoutine(newRoutine);
    }
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0e141f] border border-[#233144] rounded-3xl p-5 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2b3c]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#b6f047]/10 text-[#b6f047] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Generador de Rutinas IA</h2>
              <p className="text-[11px] text-gray-400">Algoritmo de periodización adaptado a ti</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-[#192433] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Configuration inputs if not yet generated */}
        {!generatedPlan ? (
          <div className="space-y-3.5">
            {/* Goal */}
            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1">Objetivo del Atleta</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#b6f047]"
              >
                <option value="Hipertrofia & Ganancia Muscular">Hipertrofia & Ganancia Muscular</option>
                <option value="Pérdida de Grasa & Definición">Pérdida de Grasa & Definición</option>
                <option value="Fuerza Máxima (Powerlifting)">Fuerza Máxima (Powerbuilding)</option>
                <option value="Acondicionamiento / Hyrox / Resistencia">Acondicionamiento / Hyrox</option>
              </select>
            </div>

            {/* Split & Days */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">Días por semana</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[3, 4, 5, 6].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDaysPerWeek(d)}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                        daysPerWeek === d
                          ? 'bg-[#b6f047] text-black border-[#b6f047]'
                          : 'bg-[#141b26] text-gray-300 border-[#222e40]'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">Tiempo por sesión</label>
                <select
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                  className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#b6f047]"
                >
                  <option value={35}>35 min (Rápida)</option>
                  <option value={50}>50 min (Estándar)</option>
                  <option value={65}>65 min (Completa)</option>
                  <option value={80}>80 min (Volumen alto)</option>
                </select>
              </div>
            </div>

            {/* Split */}
            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1">Estructura de División (Split)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Push / Pull / Legs (PPL)',
                  'Torso / Pierna (Upper / Lower)',
                  'Full Body (Cuerpo Completo)',
                  'Arnold Split (Pecho/Espalda)',
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSplit(s)}
                    className={`p-2 rounded-xl text-left text-xs font-semibold border transition ${
                      split === s
                        ? 'bg-[#b6f047]/15 text-[#b6f047] border-[#b6f047]'
                        : 'bg-[#121824] text-gray-300 border-[#202c3d]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1">Equipamiento Disponible</label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#b6f047]"
              >
                <option value="Gimnasio Comercial Completo">Gimnasio Comercial Completo (Barras, máquinas, poleas)</option>
                <option value="Mancuernas y Banco en Casa">Mancuernas y Banco Ajustable en Casa</option>
                <option value="Peso Corporal & Calistenia">Peso Corporal & Barra de Dominadas</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 bg-[#b6f047] hover:bg-[#a5db3d] disabled:opacity-50 text-black font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#b6f047]/20"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Diseñando periodización con IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generar Rutina Personalizada</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Result view */
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#141e2b] border border-[#233246]">
              <span className="text-[10px] text-[#b6f047] uppercase font-bold tracking-wider">Plan Generado</span>
              <h3 className="text-base font-bold text-white mt-0.5">{generatedPlan.title}</h3>
              <p className="text-xs text-gray-300 mt-1">{generatedPlan.description}</p>
            </div>

            {/* Days Breakdown */}
            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
              {generatedPlan.days.map((day, dIdx) => (
                <div key={dIdx} className="p-3 rounded-2xl bg-[#111722] border border-[#1f2a3a] space-y-2">
                  <h4 className="text-xs font-bold text-[#b6f047] uppercase tracking-wider">{day.dayName}</h4>
                  <div className="space-y-1.5">
                    {day.exercises.map((ex, exIdx) => (
                      <div key={exIdx} className="p-2 rounded-xl bg-[#0a0f16] border border-[#1b2636] flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-white block">{ex.name}</span>
                          <span className="text-[10px] text-gray-400">{ex.note || 'Técnica estricta'}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-[#b6f047]">{ex.sets}x{ex.reps}</span>
                          <span className="text-[10px] text-gray-400 block">{ex.restSec}s desc.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#1e2a3b]">
              <button
                onClick={() => setGeneratedPlan(null)}
                className="py-2.5 px-3 bg-[#151e2b] hover:bg-[#1d293b] text-gray-300 text-xs font-semibold rounded-xl border border-[#233144] transition"
              >
                Volver a configurar
              </button>
              <button
                onClick={handleSaveToMyRoutines}
                className="flex-1 py-2.5 bg-[#b6f047] hover:bg-[#a5db3d] text-black text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-[#b6f047]/20"
              >
                <Check className="w-4 h-4" />
                <span>Guardar en Mis Rutinas</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
