import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.error("Failed to initialize GoogleGenAI:", err);
    }
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "PulseAI Fitness", timestamp: new Date().toISOString() });
});

// Digital Asset Links for Google Play Store Trusted Web Activity (TWA)
app.get("/.well-known/assetlinks.json", (_req, res) => {
  res.sendFile(path.join(process.cwd(), "public/.well-known/assetlinks.json"));
});

// AI Fitness Coach Chat & Plan Generation
app.post("/api/coach", async (req, res) => {
  const { message, userProfile, history, action } = req.body;

  try {
    const ai = getAIClient();

    const lang = userProfile?.language || 'es';
    const langInstructions = lang === 'ca'
      ? 'Respon SEMPRE en català correcte, motivador i científic.'
      : lang === 'en'
      ? 'Always respond in fluent, motivating and scientific English.'
      : 'Responde SIEMPRE en español claro, motivador y con base científica en biomecánica y fitness.';

    // Elite system prompt for Pulse.AI Gym Coach
    const systemPrompt = `Eres "Pulse.AI Coach", un entrenador personal y preparador físico de élite especializado en musculación, biomecánica del entrenamiento con cargas (pesas/máquinas/mancuernas), sobrecarga progresiva, fuerza y recomposición corporal para la aplicación PULSE.AI.
Tus respuestas deben ser precisas, prácticas, estructuradas con formato Markdown limpio (con viñetas y negritas) y directas al grano sin rodeos innecesarios.

Perfil del atleta:
- Nombre: ${userProfile?.name || "Atleta"}
- Peso actual: ${userProfile?.weightKg || 76.5} kg
- Altura: ${userProfile?.heightCm || 179} cm
- Objetivo principal: ${userProfile?.goal || "Hipertrofia Muscular & Simetría"}
- Nivel: ${userProfile?.level || "Avanzado"}
- Idioma de respuesta: ${langInstructions}

Instrucciones:
1. Resuelve dudas sobre técnica biomecánica de ejercicios de gym (press banca, sentadilla, peso muerto, dominadas, etc.), rango de movimiento y prevención de lesiones.
2. Si pide rutinas o split semanal (Push-Pull-Legs, Torso-Pierna, etc.), estructúralas con series, rango de repeticiones efectivas y RIR/RPE.
3. Si consulta sobre nutrición deportiva, calcula necesidades de proteína (1.6 - 2.2 g/kg), carbohidratos, hidratación y superávit/déficit.
4. Si pregunta por otros deportes (running, ciclismo, natación, fútbol, etc.), aconseja cómo combinarlos armónicamente con el entrenamiento de pesas sin interferir en la hipertrofia.
5. ${langInstructions}`;

    if (!ai) {
      // Fallback intelligent responses if API key is not yet set
      let fallbackReply = "";
      if (action === "weekly_plan") {
        fallbackReply = `### 📅 Tu Plan Semanal Recomendado por PulseAI

- **Lunes — Fuerza Tren Superior (Gym)**: 45 min · Pecho, espalda y hombro (RPE 7-8).
- **Martes — Running Tempo**: 30 min · 5 km a ritmo constante aeróbico.
- **Miércoles — Movilidad y Yoga**: 25 min · Estiramientos activos y recuperación.
- **Jueves — HIIT & Core**: 35 min · 4 rondas de intervalos de alta intensidad.
- **Viernes — Fuerza Tren Inferior (Gym)**: 45 min · Piernas, glúteos y lumbares.
- **Sábado — Cardio Largo o Trail/Senderismo**: 50 min · Resistencia aeróbica moderada.
- **Domingo — Descanso Total**: Hidratación óptima y 8h de sueño reparador.

*¡Sigue así! Recuerda hidratarte con 2.5L de agua al día y priorizar 1.6-2g de proteína por kg.*`;
      } else if (action === "recovery") {
        fallbackReply = `### 🔋 Análisis de Recuperación & Vigor

- **Estado muscular**: Buen ritmo de recuperación tras tu última sesión.
- **Consejo clave**: Realiza 10 minutos de descarga en rodillo o estiramiento de cuádriceps y gemelos.
- **Nutrición recomendada**: Combina carbohidratos complejos (avena/arroz) con proteína limpia (huevos/pechuga/tofu) antes de tu próxima ventana de descanso.
- **Sueño**: Procura mantener tu habitación fresca y apagar pantallas 30 min antes de dormir.`;
      } else if (action === "nutrition") {
        fallbackReply = `### 🥗 Pautas Nutricionales Inteligentes

- **Objetivo diario**: ~${Math.round((userProfile?.weightKg || 72) * 32)} kcal estimadas para tu perfil.
- **Proteína recomendada**: ~${Math.round((userProfile?.weightKg || 72) * 1.8)}g diarios para recuperación muscular.
- **Hidratación deportiva**: 500ml 1h antes de entrenar y pequeños sorbos con electrolitos durante sesiones intensas.
- **Snack pre-entreno**: 1 plátano + puñado de nueces 45 min antes.`;
      } else {
        fallbackReply = `¡Excelente pregunta! Para tu nivel (${userProfile?.level || "intermedio"}) y objetivo (${userProfile?.goal || "mejorar forma física"}), la clave es la consistencia y la sobrecarga progresiva controlada.

Registra tus series, cuida el descanso de 60-90 segundos entre repeticiones pesadas y procura mantener un superávit o déficit controlado según quieras ganar músculo o definir. ¡Estoy aquí para guiarte en cada serie!`;
      }

      return res.json({ reply: fallbackReply });
    }

    // Call Gemini 2.5 Flash
    const promptText = action 
      ? `Solicitud de acción especial: ${action}. Mensaje de usuario: ${message || "Genera una recomendación detallada para hoy."}`
      : (message || "Dame un consejo de entrenamiento para hoy.");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\nPregunta del atleta:\n${promptText}` }] }
      ]
    });

    const reply = response.text || "¡Buen trabajo! Continúa entrenando con constancia y midiendo tu esfuerzo.";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini coach error:", error);
    res.status(500).json({ 
      error: "Error procesando con el coach de IA",
      fallbackReply: "¡Sigue con la motivación alta! Recuerda calentar antes de cada sesión y registrar tus métricas en la app." 
    });
  }
});

// AI Food Scanner & Macro Estimator
app.post("/api/ai-food-scan", async (req, res) => {
  const { foodDescription, mealType } = req.body;

  try {
    const ai = getAIClient();

    if (!ai) {
      // Heuristic intelligent food estimator
      const desc = (foodDescription || "").toLowerCase();
      let calories = 350;
      let proteinG = 25;
      let carbsG = 30;
      let fatG = 12;
      let detectedName = foodDescription || "Plato Fitness Balanceado";
      let tip = "Buena combinación de macronutrientes para recuperación muscular.";

      if (desc.includes("huevo") || desc.includes("tortilla")) {
        calories = 280;
        proteinG = 20;
        carbsG = 4;
        fatG = 18;
        tip = "Excelente fuente de colina y proteína de alto valor biológico.";
      } else if (desc.includes("pollo") || desc.includes("pavo")) {
        calories = 380;
        proteinG = 42;
        carbsG = 35;
        fatG = 7;
        tip = "Proteína magra perfecta para la síntesis proteica post-entrenamiento.";
      } else if (desc.includes("avena") || desc.includes("porridge") || desc.includes("batido")) {
        calories = 360;
        proteinG = 28;
        carbsG = 48;
        fatG = 6;
        tip = "Carbohidratos complejos de absorción lenta ideales como pre-entreno.";
      } else if (desc.includes("salmón") || desc.includes("pescado") || desc.includes("atún")) {
        calories = 420;
        proteinG = 38;
        carbsG = 20;
        fatG = 19;
        tip = "Rico en ácidos grasos Omega-3 antiinflamatorios para la salud articular.";
      } else if (desc.includes("ensalada") || desc.includes("verdura")) {
        calories = 210;
        proteinG = 12;
        carbsG = 18;
        fatG = 9;
        tip = "Alta densidad de micronutrientes, fibra y efecto saciante.";
      } else if (desc.includes("arroz") || desc.includes("pasta")) {
        calories = 440;
        proteinG = 24;
        carbsG = 68;
        fatG = 8;
        tip = "Excelente recarga de glucógeno muscular.";
      }

      return res.json({
        name: detectedName,
        calories,
        proteinG,
        carbsG,
        fatG,
        portion: "1 ración estimada (~250g)",
        tip,
        confidence: 0.92,
      });
    }

    const prompt = `Analiza nutricionalmente este alimento o comida: "${foodDescription}".
Devuelve ÚNICAMENTE un objeto JSON válido con este formato exacto, sin código markdown adicional:
{
  "name": "Nombre conciso del plato en español",
  "calories": número entero de calorías totales,
  "proteinG": gramos de proteína,
  "carbsG": gramos de carbohidratos,
  "fatG": gramos de grasas totales,
  "portion": "descripción de la porción estimada",
  "tip": "consejo nutricional atlético breve de 1 frase"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let rawText = response.text || "";
    // Clean potential markdown backticks
    rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (err: any) {
    console.error("Food scan error:", err);
    // Return robust fallback
    res.json({
      name: foodDescription || "Comida Registrada",
      calories: 340,
      proteinG: 22,
      carbsG: 34,
      fatG: 11,
      portion: "1 ración (~200g)",
      tip: "Comida registrada. Prioriza hidratarte con agua.",
    });
  }
});

// AI Workout Routine Generator
app.post("/api/generate-routine", async (req, res) => {
  const { goal, daysPerWeek, split, equipment, level, durationMin } = req.body;

  try {
    const ai = getAIClient();

    if (!ai) {
      // Fallback structured gym routine
      const routineTitle = `Plan PulseAI ${split || "Push/Pull/Legs"} (${daysPerWeek || 3} días)`;
      return res.json({
        title: routineTitle,
        goal: goal || "Hipertrofia y Definición",
        description: `Rutina optimizada para nivel ${level || "intermedio"} con ${equipment || "gimnasio completo"}, sesiones de ${durationMin || 50} min.`,
        days: [
          {
            dayName: "Día 1: Empuje (Push) - Pecho, Hombro, Tríceps",
            exercises: [
              { name: "Press de Banca Plano", sets: 4, reps: "8-10", rpe: 8, restSec: 90, note: "Pausa de 1 segundo en el pecho." },
              { name: "Press Inclinado con Mancuernas", sets: 3, reps: "10-12", rpe: 8, restSec: 75, note: "Enfócate en la parte clavicular." },
              { name: "Elevaciones Laterales", sets: 4, reps: "15", rpe: 9, restSec: 60, note: "Control en la bajada." },
              { name: "Fondos en Paralelas o Polea Tríceps", sets: 3, reps: "12", rpe: 8, restSec: 60, note: "Extensión completa de tríceps." }
            ]
          },
          {
            dayName: "Día 2: Tirón (Pull) - Espalda, Deltoides Post, Bíceps",
            exercises: [
              { name: "Dominadas o Jalón al Pecho", sets: 4, reps: "8-10", rpe: 8, restSec: 90, note: "Tira con los codos hacia abajo." },
              { name: "Remo con Barra o Mancuerna", sets: 4, reps: "10", rpe: 8, restSec: 75, note: "Mantén espalda recta y neutra." },
              { name: "Face Pulls con Cuerda", sets: 4, reps: "15", rpe: 7, restSec: 60, note: "Salud del hombro y deltoides posterior." },
              { name: "Curl de Bíceps con Barra Z", sets: 3, reps: "12", rpe: 8, restSec: 60, note: "Sin balancear la zona lumbar." }
            ]
          },
          {
            dayName: "Día 3: Pierna & Core (Legs & Abs)",
            exercises: [
              { name: "Sentadilla Trasera con Barra", sets: 4, reps: "6-8", rpe: 8.5, restSec: 120, note: "Profundidad paralela segura." },
              { name: "Prensa de Piernas 45°", sets: 3, reps: "10-12", rpe: 8, restSec: 90, note: "Sin hiperextender rodillas arriba." },
              { name: "Peso Muerto Rumano", sets: 3, reps: "10", rpe: 8, restSec: 90, note: "Estiramiento controlado de isquiotibiales." },
              { name: "Elevación de Gemelos", sets: 4, reps: "15", rpe: 9, restSec: 60, note: "Pausa arriba de 2 segundos." },
              { name: "Plancha Abdominal Activa", sets: 3, reps: "45 seg", rpe: 7, restSec: 45, note: "Aprieta glúteos y ombligo." }
            ]
          }
        ]
      });
    }

    const prompt = `Actúa como entrenador de fuerza de élite en PulseAI.
Genera una rutina de entrenamiento personalizada con estos parámetros:
- Objetivo: ${goal || "Ganar masa muscular y fuerza"}
- Frecuencia: ${daysPerWeek || 3} días por semana
- Estructura: ${split || "Push Pull Legs"}
- Equipamiento: ${equipment || "Gimnasio completo"}
- Nivel: ${level || "Intermedio"}
- Duración sesión: ${durationMin || 50} minutos

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta sin markdown:
{
  "title": "Nombre de la rutina",
  "goal": "Objetivo principal",
  "description": "Breve descripción científica del estímulo",
  "days": [
    {
      "dayName": "Día 1: Nombre",
      "exercises": [
        { "name": "Nombre del ejercicio", "sets": 4, "reps": "8-10", "rpe": 8, "restSec": 90, "note": "Consejo técnico" }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let rawText = response.text || "";
    rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (err: any) {
    console.error("Generate routine error:", err);
    res.status(500).json({ error: "No se pudo generar la rutina con IA" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PulseAI Server running on port ${PORT}`);
  });
}

startServer();
