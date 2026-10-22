import React, { useState } from 'react';
import { 
  Scale, 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  Plus, 
  Calendar, 
  Flame, 
  Zap, 
  ChevronRight, 
  Check, 
  Ruler, 
  Sparkles,
  Heart,
  Camera,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, WeightEntry, BodyMeasurement } from '../types';

interface BodyMetricsViewProps {
  userProfile: UserProfile;
  weightEntries: WeightEntry[];
  measurements: BodyMeasurement[];
  onAddWeightEntry: (entry: Omit<WeightEntry, 'id'>) => void;
  onAddMeasurement: (measurement: Omit<BodyMeasurement, 'id'>) => void;
  onUpdateProfileWeight: (newWeight: number) => void;
}

export const BodyMetricsView: React.FC<BodyMetricsViewProps> = ({
  userProfile,
  weightEntries,
  measurements,
  onAddWeightEntry,
  onAddMeasurement,
  onUpdateProfileWeight,
}) => {
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isMeasureModalOpen, setIsMeasureModalOpen] = useState(false);

  // Weight form state
  const [inputWeight, setInputWeight] = useState(userProfile.weightKg);
  const [inputBodyFat, setInputBodyFat] = useState(16.5);
  const [inputMuscleMass, setInputMuscleMass] = useState(35.0);
  const [inputNotes, setInputNotes] = useState('');

  // Measure form state
  const [inputChest, setInputChest] = useState(103);
  const [inputWaist, setInputWaist] = useState(81.5);
  const [inputHips, setInputHips] = useState(97);
  const [inputBiceps, setInputBiceps] = useState(36.8);
  const [inputThigh, setInputThigh] = useState(57.5);

  // Sort weight entries by date
  const sortedWeights = [...weightEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latestWeight = sortedWeights[sortedWeights.length - 1]?.weightKg || userProfile.weightKg;
  const firstWeight = sortedWeights[0]?.weightKg || userProfile.weightKg;
  const weightChangeTotal = +(latestWeight - firstWeight).toFixed(1);

  // Metabolic calculations
  const heightM = userProfile.heightCm / 100;
  const bmi = +(latestWeight / (heightM * heightM)).toFixed(1);

  let bmiCategory = 'Normopeso';
  let bmiColor = 'text-green-400';
  if (bmi < 18.5) {
    bmiCategory = 'Bajo peso';
    bmiColor = 'text-blue-400';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Sobrepeso muscular';
    bmiColor = 'text-amber-400';
  } else if (bmi >= 30) {
    bmiCategory = 'Obesidad';
    bmiColor = 'text-red-400';
  }

  // TMB Mifflin St Jeor estimate (assuming approx 28y male)
  const bmr = Math.round(10 * latestWeight + 6.25 * userProfile.heightCm - 5 * 28 + 5);
  // TDEE with moderate-to-high activity (1.55 factor)
  const tdee = Math.round(bmr * 1.55);

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    onAddWeightEntry({
      date: new Date().toISOString().split('T')[0],
      weightKg: inputWeight,
      bodyFatPct: inputBodyFat,
      muscleMassKg: inputMuscleMass,
      notes: inputNotes || undefined,
    });
    onUpdateProfileWeight(inputWeight);

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
    });

    setIsWeightModalOpen(false);
  };

  const handleSaveMeasure = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMeasurement({
      date: new Date().toISOString().split('T')[0],
      chestCm: inputChest,
      waistCm: inputWaist,
      hipsCm: inputHips,
      bicepsCm: inputBiceps,
      thighCm: inputThigh,
    });

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
    });

    setIsMeasureModalOpen(false);
  };

  // Min and max for SVG line scaling
  const minWeight = Math.min(...sortedWeights.map(w => w.weightKg)) - 1;
  const maxWeight = Math.max(...sortedWeights.map(w => w.weightKg)) + 1;

  const getSvgY = (val: number) => {
    const range = maxWeight - minWeight || 1;
    return 80 - ((val - minWeight) / range) * 60;
  };

  const svgPoints = sortedWeights.map((w, idx) => {
    const x = 20 + (idx / Math.max(1, sortedWeights.length - 1)) * 260;
    const y = getSvgY(w.weightKg);
    return `${x},${y}`;
  }).join(' ');

  const latestMeasure = measurements[measurements.length - 1];

  return (
    <div className="space-y-6">
      {/* Weight Summary Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-b from-[#131b27] to-[#0c121b] border border-[#233144] shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Peso Corporal Actual</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-mono font-bold text-white tracking-tight">{latestWeight}</span>
              <span className="text-sm font-semibold text-gray-400">kg</span>
              <span className={`text-xs font-semibold flex items-center gap-0.5 ml-2 ${weightChangeTotal <= 0 ? 'text-green-400' : 'text-blue-400'}`}>
                {weightChangeTotal <= 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                {weightChangeTotal > 0 ? `+${weightChangeTotal}` : weightChangeTotal} kg
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsWeightModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#b6f047] hover:bg-[#a5db3d] text-black font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-md shadow-[#b6f047]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Peso</span>
          </button>
        </div>

        {/* Weight Evolution SVG Sparkline */}
        <div className="mt-4 bg-[#090d14] p-3 rounded-2xl border border-[#1b2636]">
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
            <span>Evolución (Últimos pesajes)</span>
            <span className="font-mono text-xs text-white">{firstWeight} kg → {latestWeight} kg</span>
          </div>

          <svg viewBox="0 0 300 90" className="w-full h-24 overflow-visible">
            {/* Grid horizontal lines */}
            <line x1="10" y1="20" x2="290" y2="20" stroke="#1f2a3a" strokeDasharray="3,3" />
            <line x1="10" y1="50" x2="290" y2="50" stroke="#1f2a3a" strokeDasharray="3,3" />
            <line x1="10" y1="80" x2="290" y2="80" stroke="#1f2a3a" strokeDasharray="3,3" />

            {/* Path line */}
            <polyline
              fill="none"
              stroke="#b6f047"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={svgPoints}
            />

            {/* Points */}
            {sortedWeights.map((w, idx) => {
              const x = 20 + (idx / Math.max(1, sortedWeights.length - 1)) * 260;
              const y = getSvgY(w.weightKg);
              return (
                <g key={w.id}>
                  <circle cx={x} cy={y} r="4" fill="#090d14" stroke="#b6f047" strokeWidth="2" />
                  <text x={x} y={y - 8} fill="#9ca3af" fontSize="9" textAnchor="middle" fontFamily="monospace">
                    {w.weightKg}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Metabolic Card (IMC, TMB, TDEE) */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#111723] border border-[#1e2b3c] text-center">
          <span className="text-[10px] text-gray-400 font-semibold uppercase block">IMC (BMI)</span>
          <div className="text-xl font-mono font-bold text-white mt-0.5">{bmi}</div>
          <span className={`text-[10px] font-semibold block mt-0.5 ${bmiColor}`}>{bmiCategory}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#111723] border border-[#1e2b3c] text-center">
          <span className="text-[10px] text-gray-400 font-semibold uppercase block">TMB Basal</span>
          <div className="text-xl font-mono font-bold text-[#b6f047] mt-0.5">{bmr}</div>
          <span className="text-[10px] text-gray-400 block mt-0.5">kcal / reposo</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#111723] border border-[#1e2b3c] text-center">
          <span className="text-[10px] text-gray-400 font-semibold uppercase block">Gasto Total (TDEE)</span>
          <div className="text-xl font-mono font-bold text-cyan-400 mt-0.5">{tdee}</div>
          <span className="text-[10px] text-gray-400 block mt-0.5">kcal mantenimiento</span>
        </div>
      </div>

      {/* Body Measurements Section */}
      <div className="p-4 rounded-2xl bg-[#111723] border border-[#1e2b3c] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-[#b6f047]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Perímetros Corporales (cm)</h3>
          </div>
          <button
            onClick={() => setIsMeasureModalOpen(true)}
            className="text-xs text-[#b6f047] hover:underline font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </button>
        </div>

        {latestMeasure ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="p-2.5 rounded-xl bg-[#0b0f16] border border-[#1c2737] text-center">
              <span className="text-[10px] text-gray-400 block">Pecho</span>
              <span className="font-mono text-base font-bold text-white">{latestMeasure.chestCm || '--'}</span>
              <span className="text-[9px] text-gray-400 block">cm</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0b0f16] border border-[#1c2737] text-center">
              <span className="text-[10px] text-gray-400 block">Cintura</span>
              <span className="font-mono text-base font-bold text-white">{latestMeasure.waistCm || '--'}</span>
              <span className="text-[9px] text-gray-400 block">cm</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0b0f16] border border-[#1c2737] text-center">
              <span className="text-[10px] text-gray-400 block">Cadera</span>
              <span className="font-mono text-base font-bold text-white">{latestMeasure.hipsCm || '--'}</span>
              <span className="text-[9px] text-gray-400 block">cm</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0b0f16] border border-[#1c2737] text-center">
              <span className="text-[10px] text-gray-400 block">Bíceps</span>
              <span className="font-mono text-base font-bold text-[#b6f047]">{latestMeasure.bicepsCm || '--'}</span>
              <span className="text-[9px] text-gray-400 block">cm</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0b0f16] border border-[#1c2737] text-center">
              <span className="text-[10px] text-gray-400 block">Muslo</span>
              <span className="font-mono text-base font-bold text-white">{latestMeasure.thighCm || '--'}</span>
              <span className="text-[9px] text-gray-400 block">cm</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400">Sin medidas registradas aún.</p>
        )}
      </div>

      {/* Weight History Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
          Historial de Pesajes
        </h3>
        <div className="space-y-1.5">
          {[...weightEntries].reverse().map((w) => (
            <div
              key={w.id}
              className="p-3 rounded-2xl bg-[#101621] border border-[#1e2a3b] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <div>
                  <span className="text-white font-medium block">
                    {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(w.date))}
                  </span>
                  {w.notes && <span className="text-[10px] text-gray-400">{w.notes}</span>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {w.bodyFatPct && (
                  <span className="bg-lime-950/30 text-lime-400 border border-lime-800/40 text-[10px] px-2 py-0.5 rounded-md">
                    {w.bodyFatPct}% Grasa
                  </span>
                )}
                <span className="font-mono font-bold text-sm text-white">{w.weightKg} kg</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Weight */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSaveWeight} className="w-full max-w-sm bg-[#0e141f] border border-[#233144] rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Nuevo Registro de Peso</h3>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={inputWeight}
                onChange={(e) => setInputWeight(Number(e.target.value))}
                className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#b6f047]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">% Grasa Estimada</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputBodyFat}
                  onChange={(e) => setInputBodyFat(Number(e.target.value))}
                  className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#b6f047]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Masa Muscular (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputMuscleMass}
                  onChange={(e) => setInputMuscleMass(Number(e.target.value))}
                  className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#b6f047]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Notas / Sensaciones</label>
              <input
                type="text"
                placeholder="Ej. Pesaje en ayunas tras cardio..."
                value={inputNotes}
                onChange={(e) => setInputNotes(e.target.value)}
                className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#b6f047]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsWeightModalOpen(false)}
                className="py-2.5 px-4 bg-[#151e2b] text-gray-300 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#b6f047] hover:bg-[#a5db3d] text-black text-xs font-bold rounded-xl transition"
              >
                Guardar Pesaje
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Add Measurements */}
      {isMeasureModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSaveMeasure} className="w-full max-w-sm bg-[#0e141f] border border-[#233144] rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Actualizar Medidas (cm)</h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Pecho</label>
                <input
                  type="number"
                  step="0.5"
                  value={inputChest}
                  onChange={(e) => setInputChest(Number(e.target.value))}
                  className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Cintura</label>
                <input
                  type="number"
                  step="0.5"
                  value={inputWaist}
                  onChange={(e) => setInputWaist(Number(e.target.value))}
                  className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Cadera</label>
                <input
                  type="number"
                  step="0.5"
                  value={inputHips}
                  onChange={(e) => setInputHips(Number(e.target.value))}
                  className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Bíceps</label>
                <input
                  type="number"
                  step="0.5"
                  value={inputBiceps}
                  onChange={(e) => setInputBiceps(Number(e.target.value))}
                  className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Muslo</label>
              <input
                type="number"
                step="0.5"
                value={inputThigh}
                onChange={(e) => setInputThigh(Number(e.target.value))}
                className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-xs font-mono text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsMeasureModalOpen(false)}
                className="py-2.5 px-4 bg-[#151e2b] text-gray-300 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#b6f047] hover:bg-[#a5db3d] text-black text-xs font-bold rounded-xl transition"
              >
                Guardar Medidas
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
