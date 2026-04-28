import OpenAI from "openai";

// Initialize Groq. 
// Note: dangerouslyAllowBrowser is required when running API calls directly from the frontend.
const groq = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: import.meta.env?.VITE_GROQ_API_KEY, 
  dangerouslyAllowBrowser: true 
});

/**
 * Calculates smart matches using Groq (Llama 3) for the Volunteer Hub.
 * Maintains compatibility with existing Dashboard logic.
 */
export async function calculateSmartMatches(volunteerProfile, openTasks) {
  if (!openTasks || openTasks.length === 0) return [];

  try {
    const prompt = `
      Act as an Emergency Relief Coordinator for an NGO platform called "Lighthouse".
      Your goal is to match a volunteer to the most suitable emergency tasks.

      VOLUNTEER PROFILE:
      - Skills: ${volunteerProfile.skills?.join(', ')}
      - Base Location: ${JSON.stringify(volunteerProfile.baseLocation)}
      - Max Travel Radius: ${volunteerProfile.maxTravelDistance} miles

      OPEN TASKS:
      ${openTasks.map(task => `
        - Task ID: ${task.id}
        - Name: ${task.taskName}
        - Required Skills: ${task.requiredSkills?.join(', ')}
        - Coordinates: ${JSON.stringify(task.coordinates)}
      `).join('\n')}

      OUTPUT INSTRUCTIONS:
      Return a strict JSON array of objects. Each object must have:
      - taskId (string)
      - matchScore (number 0-100)
      - reasoning (string, max 15 words)

      DO NOT include markdown. ONLY the JSON array.
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are an AI assistant for Lighthouse. You must return only a raw JSON array of match objects." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
    });

    const text = response.choices[0].message.content;
    const cleanedText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedText);

  } catch (error) {
    console.error("Lighthouse AI Error:", error);
    return calculateDeterministicFallback(volunteerProfile, openTasks);
  }
}

/**
 * Calculates best volunteers for a specific task (NGO Side).
 */
export async function findBestVolunteersForTask(task, volunteers) {
  if (!volunteers || volunteers.length === 0) return [];

  try {
    const prompt = `
      Act as an NGO Dispatcher for "Lighthouse".
      Your goal is to find the best volunteers for a specific emergency task.

      TASK DETAILS:
      - Name: ${task.taskName}
      - Required Skills: ${task.requiredSkills?.join(', ')}

      POTENTIAL VOLUNTEERS:
      ${volunteers.map(vol => `
        - Volunteer ID: ${vol.id}
        - Name: ${vol.name}
        - Skills: ${vol.skills?.join(', ')}
        - Availability: ${JSON.stringify(vol.availability || {})}
      `).join('\n')}

      OUTPUT INSTRUCTIONS:
      Return a strict JSON array of objects. Each object must have:
      - volunteerId (string)
      - matchScore (number 0-100)
      - reasoning (string, max 15 words)

      DO NOT include markdown. ONLY the JSON array.
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: "You are an AI assistant for the 'Lighthouse' NGO portal. Match volunteers to tasks based on skills and time availability. Provide a score. If a volunteer does NOT match the required skills or time, give them a '0% Match' score and explicitly state: 'Alternative Volunteer: Has different skills and availability.' Keep it to 2 sentences max. Format: '[Score]% Match: [Name]. Reason: [Explanation].' You must return only a raw JSON array of match objects." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
    });

    const text = response.choices[0].message.content;
    const cleanedText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedText);

  } catch (error) {
    console.error("NGO AI Matching failed:", error);
    return calculateNgoFallback(task, volunteers);
  }
}

function calculateNgoFallback(task, volunteers) {
  return volunteers.map(vol => {
    const taskSkills = task.requiredSkills || [];
    const volSkills = vol.skills || [];
    const overlap = taskSkills.filter(s => volSkills.includes(s)).length;
    const skillScore = taskSkills.length > 0 ? (overlap / taskSkills.length) * 100 : 0;

    return {
      volunteerId: vol.id,
      matchScore: Math.round(skillScore),
      reasoning: "Matched based on skill overlap (Fallback)."
    };
  });
}

function calculateDeterministicFallback(volunteerProfile, openTasks) {
  return openTasks.map(task => {
    const taskSkills = task.requiredSkills || [];
    const userSkills = volunteerProfile.skills || [];
    const overlap = taskSkills.filter(s => userSkills.includes(s)).length;
    const skillScore = taskSkills.length > 0 ? (overlap / taskSkills.length) * 100 : 0;
    const distanceScore = 80; 

    return {
      taskId: task.id,
      matchScore: Math.round((skillScore * 0.6) + (distanceScore * 0.4)),
      reasoning: "Matched based on skill overlap (Fallback)."
    };
  });
}
