import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  RefreshCw, 
  Dumbbell, 
  Apple, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight 
} from 'lucide-react';
import { CoachMessage, UserProfile } from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';

interface CoachViewProps {
  userProfile: UserProfile;
  currentLanguage: Language;
}

export const CoachView: React.FC<CoachViewProps> = ({ userProfile, currentLanguage }) => {
  const t = TRANSLATIONS[currentLanguage];

  const initialGreeting = currentLanguage === 'ca'
    ? `Hola, **${userProfile.name}**! Sóc el teu entrenador d'IA a **PULSE.AI**. Tinc sincronitzades les teves mètriques (${userProfile.weightKg} kg, ${userProfile.heightCm} cm, nivell ${userProfile.level}).\n\nEn què puc donar-te suport avui? Puc analitzar la teva tècnica en exercicis de gym, revisar la teva sobrecàrrega progressiva, ajustar macronutrients o recomanar-te com combinar el gym amb altres esports.`
    : currentLanguage === 'en'
    ? `Hello, **${userProfile.name}**! I am your AI Coach at **PULSE.AI**. I have synchronized your biomechanical metrics (${userProfile.weightKg} kg, ${userProfile.heightCm} cm, ${userProfile.level} level).\n\nHow can I support your fitness goals today? I can critique gym exercise technique, plan progressive overload, calculate macros, or help balance gym with other sports.`
    : `¡Hola, **${userProfile.name}**! Soy tu entrenador de IA en **PULSE.AI**. He sincronizado tus métricas (${userProfile.weightKg} kg, ${userProfile.heightCm} cm, nivel ${userProfile.level}).\n\n¿En qué duda o entrenamiento te doy soporte hoy? Puedo analizar la técnica de cualquier ejercicio de gym, estructurar tu sobrecarga progresiva, ajustar tus macronutrientes o planificar cómo combinar las pesas con otros deportes.`;

  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      content: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string, actionType?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() && !actionType) return;

    const userMsg: CoachMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text || (actionType === 'weekly_plan' ? 'Genera mi plan semanal de gym' : 'Consulta biomecánica'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          action: actionType,
          userProfile: {
            ...userProfile,
            language: currentLanguage,
          },
        }),
      });

      const data = await response.json();
      const replyContent = data.reply || data.fallbackReply || '¡Buen trabajo! Sigue constante con tu sobrecarga progresiva.';

      const coachMsg: CoachMessage = {
        id: `coach-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      const errorMsg: CoachMessage = {
        id: `coach-${Date.now()}`,
        role: 'assistant',
        content: '¡Gran enfoque! Recuerda mantener el RIR en 1-2 en tus series principales y priorizar la técnica biomecánica limpia en cada repetición.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPrompts = t.coach.quickQuestions || [
    'Optimizar mi rutina de hipertrofia',
    'Técnica correcta de press banca',
    'Consejos para superar un estancamiento en sentadilla',
    '¿Cómo calcular mi superávit calórico?',
  ];

  return (
    <div className="space-y-4 pb-24 max-w-3xl mx-auto px-3 sm:px-4 pt-2 flex flex-col h-[calc(100vh-6rem)]">
      {/* Top Coach Header Banner */}
      <div className="bg-gradient-to-r from-[#121926] to-[#0c121b] border border-[#202b3c] rounded-3xl p-4 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#b6f047] to-[#38bdf8] p-0.5 shadow-lg shadow-[#b6f047]/20">
              <div className="w-full h-full bg-[#0a0e16] rounded-[14px] flex items-center justify-center text-[#b6f047]">
                <Bot className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>
            <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a0e16] absolute -bottom-0.5 -right-0.5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">{t.coach.title}</h2>
              <span className="px-2 py-0.5 rounded-md bg-[#b6f047]/15 text-[#b6f047] text-[10px] font-black uppercase border border-[#b6f047]/30">
                IA Activa
              </span>
            </div>
            <p className="text-xs text-gray-400">{t.coach.subtitle}</p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="p-2.5 rounded-xl bg-[#16202e] hover:bg-[#1f2c3e] text-gray-400 hover:text-white border border-[#253449] transition"
          title="Reiniciar chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f1420] border border-[#1e283a] hover:border-[#b6f047]/50 text-xs text-gray-300 hover:text-white whitespace-nowrap transition shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-[#b6f047]" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1 no-scrollbar">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-xl bg-[#172232] border border-[#26374f] flex items-center justify-center text-[#b6f047] shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed shadow-lg ${
                msg.role === 'user'
                  ? 'bg-[#b6f047] text-black font-semibold rounded-tr-sm ml-auto'
                  : 'bg-[#0f1420] border border-[#1e283a] text-gray-200 rounded-tl-sm'
              }`}
            >
              <div className="whitespace-pre-line prose prose-invert max-w-none text-xs">
                {msg.content}
              </div>
              <span
                className={`text-[9px] block mt-2 text-right ${
                  msg.role === 'user' ? 'text-black/60 font-bold' : 'text-gray-500'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-[#b6f047] flex items-center justify-center text-black font-black text-xs shrink-0 mt-1">
                {userProfile.name.charAt(0)}
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-gray-400 bg-[#0f1420] border border-[#1e283a] w-fit px-4 py-2.5 rounded-2xl"
          >
            <Bot className="w-4 h-4 text-[#b6f047] animate-spin" />
            <span>Pulse.AI Coach está pensando...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="shrink-0 bg-[#0f1420] border border-[#1e283a] focus-within:border-[#b6f047] rounded-2xl p-1.5 flex items-center gap-2 shadow-2xl transition-all"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={t.coach.placeholder}
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="w-9 h-9 rounded-xl bg-[#b6f047] hover:bg-[#a5e035] text-black flex items-center justify-center transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
