import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Initialization with Multi-Tier Resilience
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

const groq = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: import.meta.env.VITE_GROQ_API_KEY || "",
  dangerouslyAllowBrowser: true 
});

/**
 * Shared Helper: Multi-Tier LLM Execution
 * Tries Gemini (Primary), then Groq (Fallback), then Local (Failsafe)
 */
async function runMultiTierAi(systemInstruction, userPrompt, fallbackResult) {
  try {
    // TIER 1: GEMINI 1.5 FLASH (Primary)
    console.log("Attempting Gemini API Match...");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction 
    });
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    return parseJsonResponse(text);

  } catch (geminiError) {
    console.warn("⚠️ Gemini API failed. Triggering Fallback 1 (Groq)...", geminiError);
    
    try {
      // TIER 2: GROQ LLAMA 3 (Fallback)
      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
      });
      const text = response.choices[0].message.content;
      return parseJsonResponse(text);

    } catch (groqError) {
      console.error("🚨 Groq API failed. Triggering Fallback 2 (Local)...", groqError);
      // TIER 3: LOCAL FALLBACK (Failsafe)
      return fallbackResult;
    }
  }
}

/**
 * Helper to ensure we always return a valid JSON array
 */
function parseJsonResponse(text) {
  try {
    const cleanedText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("Failed to parse AI JSON response:", text);
    throw new Error("Invalid AI Response Format");
  }
}

/**
 * VOLUNTEER SIDE: Match a volunteer to multiple open tasks.
 */
export async function calculateSmartMatches(volunteerProfile, openTasks) {
  if (!openTasks || openTasks.length === 0) return [];

  const systemInstruction = `
    You are an AI assistant for the 'Lighthouse' NGO platform. 
    Match a volunteer to a list of tasks.
    Return a strict JSON array of objects. Each object must have:
    - taskId (string)
    - matchScore (number 0-100)
    - reasoning (string, max 15 words)
    DO NOT include markdown. ONLY the JSON array.
  `;

  const userPrompt = `
    VOLUNTEER: ${JSON.stringify(volunteerProfile)}
    TASKS: ${JSON.stringify(openTasks)}
  `;

  const fallback = openTasks.map(task => ({
    taskId: task.id,
    matchScore: 50,
    reasoning: "Fallback System Engaged: Please review volunteer profiles manually."
  }));

  return await runMultiTierAi(systemInstruction, userPrompt, fallback);
}

/**
 * NGO SIDE: Match multiple volunteers to a specific task.
 */
export async function findBestVolunteersForTask(task, volunteers) {
  if (!volunteers || volunteers.length === 0) return [];

  const systemInstruction = `
    You are an AI assistant for the 'Lighthouse' NGO portal. 
    Match available volunteers to a specific emergency task.
    Return a strict JSON array of objects. Each object must have:
    - volunteerId (string)
    - matchScore (number 0-100)
    - reasoning (string, max 15 words)
    DO NOT include markdown. ONLY the JSON array.
  `;

  const userPrompt = `
    TASK: ${JSON.stringify(task)}
    VOLUNTEERS: ${JSON.stringify(volunteers)}
  `;

  const fallback = volunteers.map(vol => ({
    volunteerId: vol.id,
    matchScore: 0,
    reasoning: "Fallback System Engaged: Please review volunteer profiles manually."
  }));

  return await runMultiTierAi(systemInstruction, userPrompt, fallback);
}
