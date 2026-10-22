import React, { useState } from 'react';
import { X, CheckCircle2, Copy, Check, Download, ExternalLink, Smartphone, Terminal, ShieldCheck, HelpCircle } from 'lucide-react';

interface PlayStoreGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const PlayStoreGuideModal: React.FC<PlayStoreGuideModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pwabuilder' | 'bubblewrap' | 'assetlinks'>('overview');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Custom package and fingerprint inputs
  const [packageName, setPackageName] = useState('app.lovable.pulseai.fitness');
  const [sha256Fingerprint, setSha256Fingerprint] = useState(
    'FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C'
  );

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : appUrl;
  const manifestUrl = `${currentOrigin}/manifest.webmanifest`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const assetLinksJson = JSON.stringify(
    [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: packageName.trim(),
          sha256_cert_fingerprints: [sha256Fingerprint.trim().toUpperCase()],
        },
      },
    ],
    null,
    2
  );

  const downloadAssetLinks = () => {
    const blob = new Blob([assetLinksJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assetlinks.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#101620] border border-[#26354a] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#212c3d] bg-[#0c121b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#b6f047]/10 border border-[#b6f047]/30 flex items-center justify-center text-[#b6f047]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">Publicar PulseAI en Google Play Store</h2>
              <p className="text-xs text-gray-400">Guía completa paso a paso con arquitectura TWA / PWA de Google</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a2332] hover:bg-[#253247] text-gray-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#212c3d] bg-[#0e141e] px-6 gap-2 pt-2">
          {[
            { id: 'overview', label: '1. Verificación' },
            { id: 'pwabuilder', label: '2. Opción A (PWABuilder)' },
            { id: 'bubblewrap', label: '3. Opción B (CLI)' },
            { id: 'assetlinks', label: '4. Digital Asset Links' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-xs font-semibold pb-2.5 px-3 border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-[#b6f047] text-[#b6f047]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-gray-300 leading-relaxed">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-[#151f2e] border border-[#223349] p-4 rounded-xl">
                <h3 className="font-semibold text-white text-base mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#b6f047]" />
                  ¿Cómo se publica esta aplicación en Google Play?
                </h3>
                <p className="text-xs text-gray-300">
                  Google permite publicar aplicaciones web modernas en la Play Store mediante el formato oficial
                  <strong className="text-white"> TWA (Trusted Web Activity)</strong>. Esto empaqueta tu app en un
                  archivo <code className="text-[#b6f047] bg-black/40 px-1.5 py-0.5 rounded">.aab (Android App Bundle)</code>
                  que se instala como cualquier aplicación nativa de Android, con pantalla completa, sin barra de URL
                  y con icono en el menú.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2 text-xs uppercase tracking-wider text-gray-400">
                  Requisitos técnicos cumplidos en esta app:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#141b26] border border-[#1f2c3e]">
                    <CheckCircle2 className="w-4 h-4 text-[#b6f047] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white text-xs">Web App Manifest</p>
                      <p className="text-[11px] text-gray-400">Configurado en /manifest.webmanifest con standalone y orientación vertical.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#141b26] border border-[#1f2c3e]">
                    <CheckCircle2 className="w-4 h-4 text-[#b6f047] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white text-xs">Iconos de Alta Resolución</p>
                      <p className="text-[11px] text-gray-400">Iconos de 192x192, 512x512 y Maskable 512x512 con margen de seguridad Android.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#141b26] border border-[#1f2c3e]">
                    <CheckCircle2 className="w-4 h-4 text-[#b6f047] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white text-xs">Service Worker Offline</p>
                      <p className="text-[11px] text-gray-400">Caché activo de fuentes y recursos para funcionamiento sin conexión.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#141b26] border border-[#1f2c3e]">
                    <CheckCircle2 className="w-4 h-4 text-[#b6f047] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white text-xs">Digital Asset Links</p>
                      <p className="text-[11px] text-gray-400">Ruta /.well-known/assetlinks.json servida para verificación en Play Store.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#121924] p-3.5 rounded-xl border border-[#1e2a3c] flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">URL del Manifest de tu app:</p>
                  <p className="text-xs font-mono text-[#b6f047] truncate max-w-sm sm:max-w-md">{manifestUrl}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(manifestUrl, 'manifest-url')}
                  className="px-3 py-1.5 rounded-lg bg-[#1e2a3c] hover:bg-[#283850] text-xs font-semibold text-white flex items-center gap-1.5 transition"
                >
                  {copiedText === 'manifest-url' ? <Check className="w-3.5 h-3.5 text-[#b6f047]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText === 'manifest-url' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pwabuilder' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#172233] to-[#121a26] border border-[#25364d]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">Método 1: PWABuilder (Sin código)</h3>
                    <p className="text-xs text-gray-300 mt-1">
                      Herramienta oficial recomendada por Google y Microsoft para generar el paquete Android (.aab) en 2 minutos.
                    </p>
                  </div>
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-[#b6f047] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 hover:brightness-110 shrink-0 ml-3"
                  >
                    <span>Abrir PWABuilder</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <ol className="space-y-3">
                <li className="flex gap-3 items-start bg-[#121924] p-3 rounded-lg border border-[#1d293b]">
                  <span className="w-6 h-6 rounded-full bg-[#b6f047]/20 text-[#b6f047] font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <div>
                    <p className="font-semibold text-white text-xs">Pega la URL de tu aplicación</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Ingresa <code className="text-[#b6f047] font-mono">{currentOrigin}</code> en PWABuilder y haz clic en <strong>Start</strong>.
                    </p>
                  </div>
                </li>

                <li className="flex gap-3 items-start bg-[#121924] p-3 rounded-lg border border-[#1d293b]">
                  <span className="w-6 h-6 rounded-full bg-[#b6f047]/20 text-[#b6f047] font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <div>
                    <p className="font-semibold text-white text-xs">Verifica el reporte de compatibilidad</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      PWABuilder verificará automáticamente el Manifest, Service Worker y Seguridad HTTPS en color verde.
                    </p>
                  </div>
                </li>

                <li className="flex gap-3 items-start bg-[#121924] p-3 rounded-lg border border-[#1d293b]">
                  <span className="w-6 h-6 rounded-full bg-[#b6f047]/20 text-[#b6f047] font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <div>
                    <p className="font-semibold text-white text-xs">Haz clic en "Package For Stores" &rarr; "Google Play"</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Define tu Package ID (ej: <code className="text-white">app.lovable.pulseai.fitness</code>) y nombre de la app. Descarga tu archivo <strong>.aab (Android App Bundle)</strong>.
                    </p>
                  </div>
                </li>

                <li className="flex gap-3 items-start bg-[#121924] p-3 rounded-lg border border-[#1d293b]">
                  <span className="w-6 h-6 rounded-full bg-[#b6f047]/20 text-[#b6f047] font-bold text-xs flex items-center justify-center shrink-0">4</span>
                  <div>
                    <p className="font-semibold text-white text-xs">Súbelo a Google Play Console</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      En <a href="https://play.google.com/console" target="_blank" rel="noreferrer" className="text-[#b6f047] underline">Google Play Console</a> crea la ficha de la app, sube el archivo <strong>.aab</strong> en Producción o Prueba Abierta y completa el cuestionario de contenido.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'bubblewrap' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#151f2e] border border-[#223349] rounded-xl flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#b6f047] shrink-0" />
                <p className="text-xs text-gray-300">
                  <strong>Bubblewrap</strong> es la herramienta oficial de línea de comandos del equipo de Google Chrome para generar aplicaciones de Play Store.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-white mb-1">Paso 1: Instala Bubblewrap CLI globalmente</p>
                  <div className="bg-[#0b0e14] border border-[#212936] p-3 rounded-lg font-mono text-xs text-gray-300 flex items-center justify-between">
                    <code>npm i -g @bubblewrap/cli</code>
                    <button
                      onClick={() => copyToClipboard('npm i -g @bubblewrap/cli', 'bw-install')}
                      className="text-gray-400 hover:text-white"
                    >
                      {copiedText === 'bw-install' ? <Check className="w-4 h-4 text-[#b6f047]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-white mb-1">Paso 2: Inicializa el proyecto con el Manifest</p>
                  <div className="bg-[#0b0e14] border border-[#212936] p-3 rounded-lg font-mono text-xs text-[#b6f047] flex items-center justify-between">
                    <code className="break-all">bubblewrap init --manifest={manifestUrl}</code>
                    <button
                      onClick={() => copyToClipboard(`bubblewrap init --manifest=${manifestUrl}`, 'bw-init')}
                      className="text-gray-400 hover:text-white shrink-0 ml-2"
                    >
                      {copiedText === 'bw-init' ? <Check className="w-4 h-4 text-[#b6f047]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Bubblewrap descargará el JDK y el Android SDK automáticamente si no los tienes instalados.</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-white mb-1">Paso 3: Compila el archivo firmado para Play Store</p>
                  <div className="bg-[#0b0e14] border border-[#212936] p-3 rounded-lg font-mono text-xs text-gray-300 flex items-center justify-between">
                    <code>bubblewrap build</code>
                    <button
                      onClick={() => copyToClipboard('bubblewrap build', 'bw-build')}
                      className="text-gray-400 hover:text-white"
                    >
                      {copiedText === 'bw-build' ? <Check className="w-4 h-4 text-[#b6f047]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Esto generará el archivo <strong className="text-white">app-release-signed.aab</strong> listo para subir a Google Play Console.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assetlinks' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#151f2e] border border-[#223349] rounded-xl text-xs text-gray-300">
                <p className="font-semibold text-white mb-1">¿Qué es Digital Asset Links y por qué es obligatorio?</p>
                <p>
                  Google Play exige verificar que eres el dueño del dominio web asociado a la app. Cuando configuras tu
                  huella digital SHA-256 en <code className="text-[#b6f047]">/.well-known/assetlinks.json</code>,
                  Android oculta la barra de dirección del navegador de forma segura en todos los teléfonos.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Package Name de tu App Android:</label>
                  <input
                    type="text"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-[#233144] rounded-lg px-3 py-2 text-xs font-mono text-[#b6f047] focus:outline-none focus:border-[#b6f047]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Huella digital del certificado SHA-256 (De Play Console &rarr; Configuración &rarr; Firma de Apps):
                  </label>
                  <input
                    type="text"
                    value={sha256Fingerprint}
                    onChange={(e) => setSha256Fingerprint(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-[#233144] rounded-lg px-3 py-2 text-xs font-mono text-gray-300 focus:outline-none focus:border-[#b6f047]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">Contenido generado de assetlinks.json:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(assetLinksJson, 'assetlinks-json')}
                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedText === 'assetlinks-json' ? <Check className="w-3.5 h-3.5 text-[#b6f047]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copiar JSON</span>
                      </button>
                      <button
                        onClick={downloadAssetLinks}
                        className="text-xs text-[#b6f047] hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar archivo</span>
                      </button>
                    </div>
                  </div>
                  <pre className="bg-[#0b0e14] border border-[#212936] p-3 rounded-lg font-mono text-[11px] text-gray-300 overflow-x-auto">
                    {assetLinksJson}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#212c3d] bg-[#0c121b] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <HelpCircle className="w-4 h-4 text-[#b6f047]" />
            <span>Todos los activos para Play Store están 100% listos.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1e2a3c] hover:bg-[#283850] text-white font-semibold text-xs transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
