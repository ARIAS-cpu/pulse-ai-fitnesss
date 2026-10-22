import React, { useState } from 'react';
import { 
  Dumbbell, 
  Calculator, 
  Target, 
  Flame, 
  Layers, 
  X, 
  Activity, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

interface GymToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GymToolsModal: React.FC<GymToolsModalProps> = ({ isOpen, onClose }) => {
  const [activeTool, setActiveTool] = useState<'plates' | 'one_rm' | 'pace'>('plates');

  // Plate calculator state
  const [barbellWeight, setBarbellWeight] = useState<number>(20);
  const [targetBarbellWeight, setTargetBarbellWeight] = useState<number>(100);

  // 1RM calculator state
  const [liftWeight, setLiftWeight] = useState<number>(85);
  const [liftReps, setLiftReps] = useState<number>(6);

  // Pace calculator state
  const [runningDistanceKm, setRunningDistanceKm] = useState<number>(10);
  const [runningTimeMinutes, setRunningTimeMinutes] = useState<number>(50);

  if (!isOpen) return null;

  // PLATE CALCULATOR LOGIC
  const availablePlates = [
    { weight: 25, color: '#ef4444', label: '25kg (Rojo)' },
    { weight: 20, color: '#3b82f6', label: '20kg (Azul)' },
    { weight: 15, color: '#eab308', label: '15kg (Amarillo)' },
    { weight: 10, color: '#22c55e', label: '10kg (Verde)' },
    { weight: 5, color: '#ffffff', label: '5kg (Blanco)' },
    { weight: 2.5, color: '#6b7280', label: '2.5kg (Negro)' },
    { weight: 1.25, color: '#9ca3af', label: '1.25kg (Cromado)' },
  ];

  const weightPerSide = Math.max(0, (targetBarbellWeight - barbellWeight) / 2);

  let remainingSideWeight = weightPerSide;
  const plateBreakdown: { weight: number; count: number; color: string }[] = [];

  for (const plate of availablePlates) {
    if (remainingSideWeight >= plate.weight) {
      const count = Math.floor(remainingSideWeight / plate.weight);
      plateBreakdown.push({ weight: plate.weight, count, color: plate.color });
      remainingSideWeight = +(remainingSideWeight - count * plate.weight).toFixed(2);
    }
  }

  // 1RM LOGIC (Epley formula: 1RM = weight * (1 + reps / 30))
  const calculated1RM = liftReps === 1 
    ? liftWeight 
    : Math.round(liftWeight * (1 + liftReps / 30));

  const percentageZones = [
    { pct: 100, reps: '1 rep', desc: '1RM Máximo' },
    { pct: 95, reps: '2 reps', desc: 'Fuerza Máxima' },
    { pct: 90, reps: '3-4 reps', desc: 'Fuerza Pura' },
    { pct: 85, reps: '5-6 reps', desc: 'Fuerza / Hipertrofia' },
    { pct: 80, reps: '7-8 reps', desc: 'Hipertrofia Óptima' },
    { pct: 75, reps: '9-10 reps', desc: 'Hipertrofia Moderada' },
    { pct: 70, reps: '11-12 reps', desc: 'Resistencia Muscular' },
    { pct: 65, reps: '15+ reps', desc: 'Técnica / Congestión' },
  ];

  // PACE CALCULATOR LOGIC
  const totalSeconds = runningTimeMinutes * 60;
  const paceSecondsPerKm = runningDistanceKm > 0 ? totalSeconds / runningDistanceKm : 0;
  const paceMinutes = Math.floor(paceSecondsPerKm / 60);
  const paceRemSeconds = Math.round(paceSecondsPerKm % 60);
  const speedKmH = runningTimeMinutes > 0 ? +((runningDistanceKm / runningTimeMinutes) * 60).toFixed(2) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0e141f] border border-[#233144] rounded-3xl p-5 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2b3c]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#b6f047]/10 text-[#b6f047] flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Herramientas Pro de Gym</h2>
              <p className="text-[11px] text-gray-400">Calculadoras biomecánicas y de rendimiento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-[#192433] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tool selector tabs */}
        <div className="grid grid-cols-3 bg-[#131b26] p-1 rounded-xl border border-[#202c3d]">
          <button
            onClick={() => setActiveTool('plates')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg transition ${
              activeTool === 'plates' ? 'bg-[#b6f047] text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Discos de Barra
          </button>
          <button
            onClick={() => setActiveTool('one_rm')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg transition ${
              activeTool === 'one_rm' ? 'bg-[#b6f047] text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Calculadora 1RM
          </button>
          <button
            onClick={() => setActiveTool('pace')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg transition ${
              activeTool === 'pace' ? 'bg-[#b6f047] text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Ritmo Cardio
          </button>
        </div>

        {/* TOOL 1: BARBELL PLATE CALCULATOR */}
        {activeTool === 'plates' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">Tipo de Barra</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBarbellWeight(20)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition ${
                      barbellWeight === 20 
                        ? 'bg-[#b6f047] text-black border-[#b6f047]' 
                        : 'bg-[#151e2b] text-gray-300 border-[#233144]'
                    }`}
                  >
                    20 kg (Olímpica)
                  </button>
                  <button
                    onClick={() => setBarbellWeight(15)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition ${
                      barbellWeight === 15 
                        ? 'bg-[#b6f047] text-black border-[#b6f047]' 
                        : 'bg-[#151e2b] text-gray-300 border-[#233144]'
                    }`}
                  >
                    15 kg (Técnica)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">Peso Total Deseado</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="2.5"
                    min={barbellWeight}
                    value={targetBarbellWeight}
                    onChange={(e) => setTargetBarbellWeight(Math.max(barbellWeight, Number(e.target.value)))}
                    className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#b6f047]"
                  />
                  <span className="text-xs font-semibold text-gray-400">kg</span>
                </div>
              </div>
            </div>

            {/* Quick weight selector chips */}
            <div className="flex flex-wrap gap-1.5">
              {[60, 80, 100, 120, 140, 160].map((w) => (
                <button
                  key={w}
                  onClick={() => setTargetBarbellWeight(w)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-mono transition border ${
                    targetBarbellWeight === w
                      ? 'bg-[#b6f047]/20 text-[#b6f047] border-[#b6f047]'
                      : 'bg-[#141b25] text-gray-400 border-[#222e40] hover:text-white'
                  }`}
                >
                  {w} kg
                </button>
              ))}
            </div>

            {/* Visual Barbell Representation */}
            <div className="p-4 rounded-2xl bg-[#090d14] border border-[#1f2b3c] flex flex-col items-center justify-center min-h-[110px] relative overflow-hidden">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Carga por cada lado: <span className="text-[#b6f047] font-mono text-sm">{weightPerSide} kg</span>
              </div>

              {/* Bar and sleeves */}
              <div className="flex items-center justify-center w-full max-w-sm h-14 relative">
                {/* Left Plates */}
                <div className="flex items-center justify-end gap-1 flex-1 pr-2">
                  {plateBreakdown.flatMap(p => Array.from({ length: p.count }, (_, i) => (
                    <div
                      key={`l-${p.weight}-${i}`}
                      style={{ backgroundColor: p.color, height: `${Math.min(52, 26 + p.weight * 1.1)}px` }}
                      className="w-3 rounded-sm border border-black/40 shadow-sm flex items-center justify-center"
                      title={`${p.weight} kg`}
                    />
                  )))}
                </div>

                {/* Bar Center */}
                <div className="w-16 h-3 bg-gradient-to-b from-gray-300 to-gray-500 rounded-sm shrink-0 border border-gray-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-[7px] text-black font-bold">
                    {barbellWeight}kg
                  </div>
                </div>

                {/* Right Plates */}
                <div className="flex items-center justify-start gap-1 flex-1 pl-2">
                  {plateBreakdown.flatMap(p => Array.from({ length: p.count }, (_, i) => (
                    <div
                      key={`r-${p.weight}-${i}`}
                      style={{ backgroundColor: p.color, height: `${Math.min(52, 26 + p.weight * 1.1)}px` }}
                      className="w-3 rounded-sm border border-black/40 shadow-sm flex items-center justify-center"
                      title={`${p.weight} kg`}
                    />
                  )))}
                </div>
              </div>
            </div>

            {/* Plate list per side */}
            <div className="p-3.5 rounded-2xl bg-[#131b26] border border-[#1f2b3c] space-y-2">
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                Coloca en cada lado de la barra:
              </span>

              {plateBreakdown.length === 0 ? (
                <p className="text-xs text-gray-400">Solo la barra sin discos adicionales.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {plateBreakdown.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#0c121b] p-2 rounded-xl border border-[#1d2737]">
                      <div 
                        className="w-3.5 h-3.5 rounded-full border border-black/40"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="text-xs font-semibold text-white">
                        {p.count}x disco de {p.weight} kg
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TOOL 2: 1RM ESTIMATOR & ZONES */}
        {activeTool === 'one_rm' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">Peso Levantado</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="2.5"
                    value={liftWeight}
                    onChange={(e) => setLiftWeight(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#b6f047]"
                  />
                  <span className="text-xs font-semibold text-gray-400">kg</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">Repeticiones (1-12)</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={liftReps}
                  onChange={(e) => setLiftReps(Math.max(1, Math.min(15, Number(e.target.value))))}
                  className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#b6f047]"
                />
              </div>
            </div>

            {/* Calculated 1RM Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#121c2a] to-[#1a273a] border border-[#26374d] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Tu 1RM Estimado</span>
                <div className="text-3xl font-mono font-bold text-[#b6f047]">{calculated1RM} <span className="text-sm text-gray-300 font-normal">kg</span></div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-300 block">Fórmula de Epley</span>
                <span className="text-[11px] text-[#b6f047] font-semibold">Precisión: ~97%</span>
              </div>
            </div>

            {/* Training Zones Table */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Porcentajes de Carga para Entrenar
              </span>
              <div className="grid grid-cols-2 gap-2">
                {percentageZones.map((z) => {
                  const targetKg = Math.round((calculated1RM * z.pct) / 100);
                  return (
                    <div key={z.pct} className="p-2.5 rounded-xl bg-[#111824] border border-[#1d293b] flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{z.pct}% <span className="text-[10px] text-gray-400 font-normal">({z.reps})</span></div>
                        <div className="text-[10px] text-gray-400">{z.desc}</div>
                      </div>
                      <div className="font-mono text-sm font-bold text-[#b6f047]">
                        {targetKg} kg
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TOOL 3: RUNNING & CARDIO PACE */}
        {activeTool === 'pace' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">Distancia Objetivo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={runningDistanceKm}
                    onChange={(e) => setRunningDistanceKm(Math.max(0.5, Number(e.target.value)))}
                    className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#b6f047]"
                  />
                  <span className="text-xs font-semibold text-gray-400">km</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">Tiempo Total (minutos)</label>
                <input
                  type="number"
                  value={runningTimeMinutes}
                  onChange={(e) => setRunningTimeMinutes(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#090d14] border border-[#233144] rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#b6f047]"
                />
              </div>
            </div>

            {/* Quick Distances */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '5K', km: 5 },
                { label: '10K', km: 10 },
                { label: '21K (Media)', km: 21.1 },
                { label: '42K (Maratón)', km: 42.2 },
              ].map((d) => (
                <button
                  key={d.label}
                  onClick={() => setRunningDistanceKm(d.km)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition border ${
                    runningDistanceKm === d.km
                      ? 'bg-[#b6f047]/20 text-[#b6f047] border-[#b6f047]'
                      : 'bg-[#141b25] text-gray-400 border-[#222e40] hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Pace & Speed Metric Display */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#111824] border border-[#1f2b3c] text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Ritmo Medio Requerido</span>
                <div className="text-2xl font-mono font-bold text-[#b6f047] mt-1">
                  {paceMinutes}:{paceRemSeconds.toString().padStart(2, '0')}
                  <span className="text-xs text-gray-400 font-normal ml-1">min/km</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#111824] border border-[#1f2b3c] text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Velocidad Media</span>
                <div className="text-2xl font-mono font-bold text-white mt-1">
                  {speedKmH}
                  <span className="text-xs text-gray-400 font-normal ml-1">km/h</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
