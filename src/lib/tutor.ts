export type Level = "beginner" | "intermediate" | "advanced";

export type Scenario = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  role: string;
  opener: string;
};

export const SCENARIOS: Scenario[] = [
  {
    id: "small-talk",
    emoji: "☕",
    title: "Charla casual",
    description: "Habla de tu día con un amigo nuevo.",
    role: "a friendly new friend chatting over coffee",
    opener: "Hey! Nice to meet you. How's your day going so far?",
  },
  {
    id: "job-interview",
    emoji: "💼",
    title: "Entrevista de trabajo",
    description: "Practica una entrevista en inglés.",
    role: "a professional but kind hiring manager interviewing the learner",
    opener: "Hi, thanks for coming in today. Could you start by telling me a little about yourself?",
  },
  {
    id: "restaurant",
    emoji: "🍝",
    title: "En el restaurante",
    description: "Pide comida y resuelve problemas.",
    role: "a waiter at a busy restaurant in New York",
    opener: "Good evening! Welcome in. Can I get you something to drink while you look at the menu?",
  },
  {
    id: "travel",
    emoji: "✈️",
    title: "En el aeropuerto",
    description: "Check-in, equipaje y controles.",
    role: "an airline check-in agent at the airport",
    opener: "Hello! Where are you flying to today? Can I see your passport, please?",
  },
  {
    id: "doctor",
    emoji: "🩺",
    title: "En el médico",
    description: "Explica síntomas y entiende indicaciones.",
    role: "a family doctor during a routine appointment",
    opener: "Hi there, come on in and have a seat. What brings you in today?",
  },
];

export function getScenario(id: string): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}

const LEVEL_GUIDE: Record<Level, string> = {
  beginner:
    "The learner is a beginner (A1-A2). Use very short sentences, common words, and speak slowly and clearly.",
  intermediate:
    "The learner is intermediate (B1-B2). Use natural everyday English with some idioms, explained if needed.",
  advanced:
    "The learner is advanced (C1-C2). Speak naturally at native speed, use idioms and nuanced vocabulary.",
};

export function buildSystemPrompt(scenario: Scenario, level: Level, learnerName?: string) {
  return `You are an English conversation tutor role-playing as ${scenario.role}.
${LEVEL_GUIDE[level]}
${learnerName ? `The learner's name is ${learnerName}.` : ""}
The learner's native language is Spanish.

Rules:
- Stay in character and keep the conversation going: reply in 1-3 short sentences and usually end with a question.
- Always reply in English.
- Separately, review ONLY the learner's last message for grammar, vocabulary and naturalness.

Respond with a JSON object exactly like:
{
  "reply": "your in-character answer in English",
  "feedback": {
    "ok": true | false,
    "corrected": "a corrected, natural version of the learner's last message (empty string if it was already good)",
    "explanation": "a brief explanation in Spanish of the main mistake or a tip to sound more natural (max 2 sentences)",
    "score": an integer 0-100 rating the learner's last message
  }
}`;
}
