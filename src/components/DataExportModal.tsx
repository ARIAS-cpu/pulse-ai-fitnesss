import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  Trash2, 
  FileSpreadsheet, 
  FileCode, 
  Check, 
  X, 
  Database,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { ActivityRecord, FoodItem, WeightEntry, UserProfile } from '../types';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityRecord[];
  foodItems: FoodItem[];
  weightEntries: WeightEntry[];
  userProfile: UserProfile;
  onResetData: () => void;
}

export const DataExportModal: React.FC<DataExportModalProps> = ({
  isOpen,
  onClose,
  activities,
  foodItems,
  weightEntries,
  userProfile,
  onResetData,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Export JSON
  const handleExportJSON = () => {
    const fullBackup = {
      exportDate: new Date().toISOString(),
      app: 'PulseAI Fitness',
      userProfile,
      activities,
      foodItems,
      weightEntries,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pulseai_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess('Copia de seguridad en JSON descargada con éxito');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // Export CSV (Activities)
  const handleExportActivitiesCSV = () => {
    const headers = ['ID', 'Deporte', 'Titulo', 'DuracionMinutos', 'DistanciaKm', 'Calorias', 'PulsacionesMedias', 'Fecha', 'Notas'];
    const rows = activities.map(a => [
      a.id,
      a.sport,
      `"${(a.title || '').replace(/"/g, '""')}"`,
      a.durationMinutes,
      a.distanceKm || 0,
      a.calories,
      a.heartRateAvg || '',
      a.date,
      `"${(a.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `pulseai_actividades_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess('Historial de actividades en CSV descargado');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0e141f] border border-[#233144] rounded-3xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-[#1f2b3c]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#b6f047]/10 text-[#b6f047] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Gestión & Exportación de Datos</h2>
              <p className="text-[11px] text-gray-400">Tus datos te pertenecen: exporta o respalda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-[#192433] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {downloadSuccess && (
          <div className="p-3 rounded-xl bg-green-950/40 border border-green-700/50 text-green-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Data statistics */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-[#131b26] border border-[#1f2c3d]">
            <span className="text-gray-400 block text-[10px]">Entrenamientos</span>
            <span className="font-mono text-base font-bold text-white">{activities.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#131b26] border border-[#1f2c3d]">
            <span className="text-gray-400 block text-[10px]">Comidas</span>
            <span className="font-mono text-base font-bold text-[#b6f047]">{foodItems.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#131b26] border border-[#1f2c3d]">
            <span className="text-gray-400 block text-[10px]">Pesajes</span>
            <span className="font-mono text-base font-bold text-white">{weightEntries.length}</span>
          </div>
        </div>

        {/* Export options */}
        <div className="space-y-2">
          <button
            onClick={handleExportJSON}
            className="w-full p-3 bg-[#131b26] hover:bg-[#1a2535] border border-[#212f42] rounded-2xl flex items-center justify-between text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Copia de Seguridad Completa (JSON)</h4>
                <p className="text-[11px] text-gray-400">Incluye perfil, entrenamientos, comidas y peso</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-gray-400 group-hover:text-[#b6f047] transition" />
          </button>

          <button
            onClick={handleExportActivitiesCSV}
            className="w-full p-3 bg-[#131b26] hover:bg-[#1a2535] border border-[#212f42] rounded-2xl flex items-center justify-between text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Exportar Actividades (CSV / Excel)</h4>
                <p className="text-[11px] text-gray-400">Compatible con hojas de cálculo y Strava</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-gray-400 group-hover:text-[#b6f047] transition" />
          </button>
        </div>

        {/* Reset Danger Zone */}
        <div className="pt-2 border-t border-[#1f2b3c]">
          <button
            onClick={() => {
              if (window.confirm('¿Deseas restaurar todos los datos a los valores de muestra iniciales?')) {
                onResetData();
                onClose();
              }
            }}
            className="w-full py-2.5 px-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Datos de Demostración</span>
          </button>
        </div>
      </div>
    </div>
  );
};
