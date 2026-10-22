import React, { useState } from 'react';
import { 
  Apple, 
  Flame, 
  Droplet, 
  Plus, 
  Camera, 
  Sparkles, 
  Trash2, 
  Clock, 
  ChevronRight, 
  PieChart, 
  Check, 
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FoodItem, MealType, UserProfile } from '../types';

interface NutritionViewProps {
  userProfile: UserProfile;
  foodItems: FoodItem[];
  waterMl: number;
  onAddFoodItem: (item: Omit<FoodItem, 'id'>) => void;
  onDeleteFoodItem: (id: string) => void;
  onUpdateWater: (deltaMl: number) => void;
  onResetWater: () => void;
  caloriesBurnedToday: number;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  userProfile,
  foodItems,
  waterMl,
  onAddFoodItem,
  onDeleteFoodItem,
  onUpdateWater,
  onResetWater,
  caloriesBurnedToday,
}) => {
  const [activeMealFilter, setActiveMealFilter] = useState<MealType | 'todos'>('todos');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerText, setScannerText] = useState('');
  const [selectedMealForAdd, setSelectedMealForAdd] = useState<MealType>('almuerzo');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    name: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    portion: string;
    tip: string;
  } | null>(null);

  // Calorie & macro calculations
  const targetCalories = userProfile.dailyCalorieTarget ? userProfile.dailyCalorieTarget * 3.5 : 2400; // Baseline daily intake
  const targetProtein = userProfile.targetProteinG || Math.round(userProfile.weightKg * 1.8);
  const targetCarbs = userProfile.targetCarbsG || Math.round(userProfile.weightKg * 3.2);
  const targetFat = userProfile.targetFatG || Math.round(userProfile.weightKg * 0.9);
  const targetWater = userProfile.targetWaterMl || 2500;

  const totalCaloriesConsumed = foodItems.reduce((acc, f) => acc + f.calories, 0);
  const totalProteinConsumed = foodItems.reduce((acc, f) => acc + f.proteinG, 0);
  const totalCarbsConsumed = foodItems.reduce((acc, f) => acc + f.carbsG, 0);
  const totalFatConsumed = foodItems.reduce((acc, f) => acc + f.fatG, 0);

  const caloriesRemaining = Math.max(0, Math.round(targetCalories - totalCaloriesConsumed + caloriesBurnedToday));
  const caloriePercent = Math.min(100, Math.round((totalCaloriesConsumed / targetCalories) * 100));
  const waterPercent = Math.min(100, Math.round((waterMl / targetWater) * 100));

  const mealLabels: Record<MealType, string> = {
    desayuno: 'Desayuno',
    almuerzo: 'Almuerzo',
    merienda: 'Merienda',
    cena: 'Cena',
    snack: 'Snacks & Supl.',
  };

  const handleScanFood = async (presetText?: string) => {
    const textToScan = presetText || scannerText;
    if (!textToScan.trim()) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      const res = await fetch('/api/ai-food-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodDescription: textToScan,
          mealType: selectedMealForAdd,
        }),
      });

      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      console.error('Scan error:', err);
      // Fallback
      setScanResult({
        name: textToScan,
        calories: 320,
        proteinG: 22,
        carbsG: 32,
        fatG: 10,
        portion: '1 ración (~200g)',
        tip: 'Aporte balanceado para mantener los niveles de energía.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmAddScan = () => {
    if (!scanResult) return;

    onAddFoodItem({
      name: scanResult.name,
      mealType: selectedMealForAdd,
      calories: scanResult.calories,
      proteinG: scanResult.proteinG,
      carbsG: scanResult.carbsG,
      fatG: scanResult.fatG,
      portion: scanResult.portion,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.6 },
    });

    setScanResult(null);
    setScannerText('');
    setIsScannerOpen(false);
  };

  const filteredItems = activeMealFilter === 'todos' 
    ? foodItems 
    : foodItems.filter(f => f.mealType === activeMealFilter);

  const quickScanExamples = [
    '2 huevos revueltos con 1 tostada y aguacate',
    '150g pechuga de pollo con arroz basmati y brócoli',
    'Batido de proteína whey con 1 plátano y leche de avena',
    '200g salmón a la plancha con patata asada y ensalada',
    'Porridge de avena con frutos rojos y nueces',
  ];

  return (
    <div className="space-y-6 pb-24 max-w-xl mx-auto px-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            <Apple className="w-5 h-5 text-[#b6f047]" />
            Nutrición & Macros
          </h1>
          <p className="text-xs text-gray-400">Balance calórico, macronutrientes y escáner IA</p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center gap-1.5 bg-[#b6f047] hover:bg-[#a5db3d] text-black font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-md shadow-[#b6f047]/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Escanear Comida</span>
        </button>
      </div>

      {/* Main Energy Balance Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-b from-[#141d29] to-[#0d131d] border border-[#233144] shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Presupuesto Calórico Diario</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-mono font-bold text-white tracking-tight">{caloriesRemaining}</span>
              <span className="text-xs font-semibold text-gray-400">kcal restantes</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-medium text-gray-400">Consumidas</span>
            <div className="font-mono text-base font-bold text-[#b6f047]">{totalCaloriesConsumed} <span className="text-xs text-gray-400 font-normal">/ {targetCalories}</span></div>
          </div>
        </div>

        {/* Dynamic visual progress track */}
        <div className="relative w-full h-3.5 bg-[#090d14] rounded-full overflow-hidden p-0.5 border border-[#1f2d3f] mb-4">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-[#b6f047] to-[#10b981] transition-all duration-500 shadow-sm shadow-[#b6f047]/30"
            style={{ width: `${caloriePercent}%` }}
          />
        </div>

        {/* Balance breakdown pills */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1f2b3b] text-center">
          <div className="bg-[#0b0f17] p-2.5 rounded-xl border border-[#1c2738]">
            <span className="text-[10px] text-gray-400 block">Objetivo</span>
            <span className="font-mono text-sm font-bold text-white">{targetCalories}</span>
          </div>
          <div className="bg-[#0b0f17] p-2.5 rounded-xl border border-[#1c2738]">
            <span className="text-[10px] text-gray-400 block">Consumidas</span>
            <span className="font-mono text-sm font-bold text-[#b6f047]">{totalCaloriesConsumed}</span>
          </div>
          <div className="bg-[#0b0f17] p-2.5 rounded-xl border border-[#1c2738]">
            <span className="text-[10px] text-orange-400 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3" /> Quemadas
            </span>
            <span className="font-mono text-sm font-bold text-orange-400">+{caloriesBurnedToday}</span>
          </div>
        </div>
      </div>

      {/* Macronutrient Distribution (Proteína, Carbos, Grasas) */}
      <div className="p-4 rounded-2xl bg-[#101722] border border-[#1e2a3b] space-y-3">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <PieChart className="w-3.5 h-3.5 text-[#b6f047]" />
          Objetivos de Macronutrientes
        </h3>

        <div className="space-y-3">
          {/* Protein */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-gray-200">Proteína</span>
              <span className="font-mono text-gray-400">
                <span className="text-white font-bold">{totalProteinConsumed}g</span> / {targetProtein}g
              </span>
            </div>
            <div className="w-full h-2 bg-[#0a0f16] rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalProteinConsumed / targetProtein) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-gray-200">Carbohidratos</span>
              <span className="font-mono text-gray-400">
                <span className="text-white font-bold">{totalCarbsConsumed}g</span> / {targetCarbs}g
              </span>
            </div>
            <div className="w-full h-2 bg-[#0a0f16] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#b6f047] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalCarbsConsumed / targetCarbs) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-gray-200">Grasas Saludables</span>
              <span className="font-mono text-gray-400">
                <span className="text-white font-bold">{totalFatConsumed}g</span> / {targetFat}g
              </span>
            </div>
            <div className="w-full h-2 bg-[#0a0f16] rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalFatConsumed / targetFat) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Water Tracking Section */}
      <div className="p-4 rounded-2xl bg-[#101722] border border-[#1e2a3b] relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Droplet className="w-4 h-4 fill-cyan-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Hidratación Diaria</h3>
              <p className="text-[11px] text-gray-400">Meta recomendada: {targetWater} ml</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-base font-bold text-cyan-400">{waterMl}</span>
            <span className="text-xs text-gray-400 font-normal"> / {targetWater} ml</span>
          </div>
        </div>

        {/* Water Progress bar */}
        <div className="w-full h-2.5 bg-[#090d14] rounded-full overflow-hidden mb-3 border border-[#192434]">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${waterPercent}%` }}
          />
        </div>

        {/* Quick add water buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateWater(250)}
            className="flex-1 py-1.5 px-2 bg-[#162232] hover:bg-[#1e2e44] border border-[#273950] rounded-xl text-xs font-medium text-cyan-300 transition flex items-center justify-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>250 ml (Vaso)</span>
          </button>
          <button
            onClick={() => onUpdateWater(500)}
            className="flex-1 py-1.5 px-2 bg-[#162232] hover:bg-[#1e2e44] border border-[#273950] rounded-xl text-xs font-medium text-cyan-300 transition flex items-center justify-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>500 ml (Botella)</span>
          </button>
          <button
            onClick={onResetWater}
            title="Reiniciar contador de agua"
            className="p-2 bg-[#162232] hover:bg-[#202b3a] border border-[#273950] rounded-xl text-gray-400 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Meals Log Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Comidas Registradas ({foodItems.length})
          </h3>

          {/* Filter pills */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
            {(['todos', 'desayuno', 'almuerzo', 'merienda', 'cena', 'snack'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveMealFilter(filter)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                  activeMealFilter === filter
                    ? 'bg-[#b6f047] text-black font-semibold'
                    : 'bg-[#141b26] text-gray-400 hover:text-white border border-[#202c3d]'
                }`}
              >
                {filter === 'todos' ? 'Todas' : mealLabels[filter]}
              </button>
            ))}
          </div>
        </div>

        {/* List of food items */}
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-[#101722] border border-[#1d2737] rounded-2xl">
            <Apple className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-gray-400">No hay comidas registradas en esta categoría hoy.</p>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="mt-3 text-xs text-[#b6f047] hover:underline font-semibold"
            >
              + Escanear o registrar alimento
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#111823] border border-[#1e2b3c] flex items-center justify-between hover:border-[#2b3d55] transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#182332] text-[#b6f047] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {item.mealType.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white line-clamp-1">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                      <span className="capitalize text-[#b6f047] font-medium">{mealLabels[item.mealType]}</span>
                      <span>·</span>
                      <span>{item.portion}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {item.time}</span>
                    </div>
                    <div className="flex gap-2 mt-1.5 text-[10px]">
                      <span className="bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded">P: {item.proteinG}g</span>
                      <span className="bg-lime-900/30 text-lime-300 px-1.5 py-0.5 rounded">C: {item.carbsG}g</span>
                      <span className="bg-amber-900/30 text-amber-300 px-1.5 py-0.5 rounded">G: {item.fatG}g</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white">{item.calories} <span className="text-[10px] text-gray-400 font-normal">kcal</span></span>
                  <button
                    onClick={() => onDeleteFoodItem(item.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition"
                    title="Eliminar comida"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Food Scanner & Logger Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0f1520] border border-[#243347] rounded-3xl p-5 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#1f2b3b]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#b6f047]/10 text-[#b6f047] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Escáner Nutricional IA</h3>
                  <p className="text-[11px] text-gray-400">Describe tu plato o comida para cálculo instantáneo</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsScannerOpen(false);
                  setScanResult(null);
                }}
                className="text-gray-400 hover:text-white text-xs px-2 py-1"
              >
                Cerrar
              </button>
            </div>

            {/* Meal Type Selection */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">Destino de la comida</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {(['desayuno', 'almuerzo', 'merienda', 'cena', 'snack'] as MealType[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMealForAdd(m)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium capitalize transition ${
                      selectedMealForAdd === m
                        ? 'bg-[#b6f047] text-black font-bold'
                        : 'bg-[#151e2b] text-gray-300 border border-[#222f42]'
                    }`}
                  >
                    {mealLabels[m]}
                  </button>
                ))}
              </div>
            </div>

            {/* Input form */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                ¿Qué has comido? (ej. cantidades, ingredientes o plato)
              </label>
              <textarea
                value={scannerText}
                onChange={(e) => setScannerText(e.target.value)}
                placeholder="Ejemplo: 200g pechuga de pollo a la plancha, 1 taza de arroz blanco y ensalada de tomate con aceite de oliva..."
                rows={3}
                className="w-full bg-[#090d14] border border-[#233145] rounded-2xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#b6f047]"
              />
            </div>

            {/* Quick preset suggestions */}
            <div>
              <span className="text-[10px] text-gray-400 block mb-1">Sugerencias rápidas:</span>
              <div className="flex flex-wrap gap-1.5">
                {quickScanExamples.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setScannerText(ex);
                      handleScanFood(ex);
                    }}
                    className="text-[10px] bg-[#141d29] hover:bg-[#1a2535] text-gray-300 border border-[#233144] px-2 py-1 rounded-lg transition"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={() => handleScanFood()}
              disabled={isScanning || !scannerText.trim()}
              className="w-full py-3 bg-[#b6f047] hover:bg-[#a5db3d] disabled:opacity-50 text-black font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#b6f047]/20"
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Analizando nutrientes con IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Estimar Calorías & Macros</span>
                </>
              )}
            </button>

            {/* Scan Result Card */}
            {scanResult && (
              <div className="p-4 rounded-2xl bg-[#141d2a] border border-[#2c3d54] space-y-3 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white">{scanResult.name}</h4>
                    <p className="text-[11px] text-gray-400">{scanResult.portion}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-mono font-bold text-[#b6f047]">{scanResult.calories}</span>
                    <span className="text-xs text-gray-400 block">kcal</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-[#0b0f17] p-2 rounded-xl border border-[#202b3c]">
                    <span className="text-[10px] text-blue-400 block font-semibold">Proteína</span>
                    <span className="font-mono font-bold text-white">{scanResult.proteinG}g</span>
                  </div>
                  <div className="bg-[#0b0f17] p-2 rounded-xl border border-[#202b3c]">
                    <span className="text-[10px] text-lime-400 block font-semibold">Carbos</span>
                    <span className="font-mono font-bold text-white">{scanResult.carbsG}g</span>
                  </div>
                  <div className="bg-[#0b0f17] p-2 rounded-xl border border-[#202b3c]">
                    <span className="text-[10px] text-amber-400 block font-semibold">Grasas</span>
                    <span className="font-mono font-bold text-white">{scanResult.fatG}g</span>
                  </div>
                </div>

                {scanResult.tip && (
                  <div className="p-2.5 rounded-xl bg-[#0d131d] border border-[#202d3f] flex items-start gap-2 text-[11px] text-gray-300">
                    <Info className="w-3.5 h-3.5 text-[#b6f047] shrink-0 mt-0.5" />
                    <span>{scanResult.tip}</span>
                  </div>
                )}

                <button
                  onClick={handleConfirmAddScan}
                  className="w-full py-2.5 bg-[#b6f047] hover:bg-[#a5db3d] text-black font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Añadir a mi {mealLabels[selectedMealForAdd]}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
