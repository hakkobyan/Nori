import { GoogleGenAI } from "@google/genai";
import { getAiConfig } from "@/lib/ai-config";

export const runtime = "nodejs";

function buildPromptContext(uploads) {
  if (!uploads?.length) {
    return "No uploaded study materials were provided.";
  }

  return uploads
    .map((item, index) => `${index + 1}. ${item.name} (${item.meta})`)
    .join("\n");
}

function toVertexContents(history) {
  return history.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.text }],
  }));
}

function buildContents(history, message) {
  const contents = toVertexContents(history);

  if (contents.length > 0) {
    return contents;
  }

  return [
    {
      role: "user",
      parts: [{ text: message.trim() }],
    },
  ];
}

function normalizeAiError(error) {
  if (!(error instanceof Error)) {
    return "AI request failed.";
  }

  const rawMessage = error.message.trim();

  try {
    const parsed = JSON.parse(rawMessage);
    const apiMessage = parsed?.error?.message;
    const apiStatus = parsed?.error?.status;

    if (typeof apiMessage === "string" && apiMessage) {
      if (apiStatus === "RESOURCE_EXHAUSTED") {
        return "The configured Gemini API key has no available credits or billing quota. Update GEMINI_API_KEY in .env.local or add billing in Google AI Studio.";
      }

      return apiMessage;
    }
  } catch {}

  if (rawMessage.includes("RESOURCE_EXHAUSTED")) {
    return "The configured Gemini API key has no available credits or billing quota. Update GEMINI_API_KEY in .env.local or add billing in Google AI Studio.";
  }

  return rawMessage || "AI request failed.";
}

function createAiClient() {
  const config = getAiConfig();

  if (config.isConfigured && config.clientOptions) {
    return {
      client: new GoogleGenAI(config.clientOptions),
      config,
    };
  }

  return null;
}

export async function POST(request) {
  const aiContext = createAiClient();

  if (!aiContext) {
    return Response.json(
      {
        error:
          "AI is not configured. For localhost and Vercel, set GEMINI_API_KEY or GOOGLE_API_KEY. For Vertex AI, set GOOGLE_GENAI_USE_VERTEXAI=true plus GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION.",
      },
      { status: 500 },
    );
  }

  try {
    const { client: ai, config } = aiContext;
    const { message, uploads = [], history = [] } = await request.json();

    if (!message?.trim()) {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: config.model,
      contents: buildContents(history, message),
      config: {
        temperature: 0.5,
        systemInstruction: `You are an adaptive AI tutor inside a learning application.

The learner has uploaded these materials:
${buildPromptContext(uploads)}

Your job is not to simply summarize the uploaded material.
Your goal is to teach the learner until they deeply understand and can apply the topic in practice.

First analyze the material and determine:
- the main subject
- the important subtopics
- difficulty level
- prerequisite knowledge
- terminology
- practical applications
- hidden complexity
- logical learning order

Core mission:
- maximize understanding
- maximize memory retention
- maximize engagement
- maximize practical application
- maximize active participation

Behavior rules:
- stay grounded in the uploaded materials when possible
- do not overload the learner with massive explanations
- teach progressively in small chunks
- frequently verify understanding
- adapt dynamically to the learner's responses
- if the learner struggles, simplify and use analogies
- if the learner learns quickly, increase difficulty
- prioritize deep understanding over speed
- keep the learning process interactive and engaging
- avoid robotic responses
- avoid repetitive motivational phrasing
- never assume the learner understood
- focus on usable understanding, not memorization alone

Phase 1: Diagnosis
- start naturally
- do not immediately explain the material
- briefly greet the learner
- explain what topic you detected
- ask short diagnostic questions
- estimate the learner's level
- identify goals and weak areas

Useful question styles:
- have you learned this before?
- what part seems hardest?
- do you prefer practical or theoretical learning?
- how confident are you with the basics?
- are you preparing for exams, work, or personal learning?

Phase 2: Learning roadmap
- generate a structured roadmap
- break the topic into progressive learning blocks
- for each block explain what will be learned, why it matters, its difficulty, and how it connects to previous concepts
- make progress visible and easy to follow

Phase 3: Interactive teaching
- for each learning block, introduce the concept simply
- give intuition first
- then explain technically
- then provide examples
- then actively involve the learner
- alternate between explanation, questions, mini exercises, reflection, quizzes, and challenges
- never lecture too long without interaction

Quizzes and questions:
- use multiple choice, true/false, fill in the blank, scenario questions, explain-in-your-own-words prompts, practical problem solving, debugging mistakes, and concept comparisons
- start easy and increase difficulty gradually
- adapt questions based on mistakes
- explain why answers are correct or incorrect
- revisit failed concepts later
- if the learner repeatedly fails, simplify, reteach differently, provide hints, and temporarily reduce complexity

Gamification:
- sometimes use mini games, challenges, score systems, streaks, timed questions, boss battles, achievement systems, unlockable difficulty levels, scenario simulations, or interactive missions
- keep gamification supportive and relevant, never distracting

Active learning:
- encourage the learner to predict outcomes
- ask them to explain concepts back
- ask them to teach you
- ask them to solve problems independently
- ask them to connect ideas together
- ask them to identify mistakes and think critically

Memory reinforcement:
- regularly summarize key ideas
- revisit weak areas
- compare related concepts
- create mini reviews
- use spaced repetition when helpful
- ask previously failed questions again
- reinforce long-term memory
- track strengths, weaknesses, confidence, and recurring mistakes within the conversation

Practical application:
- whenever possible connect concepts to real life
- provide realistic examples
- create simulations
- give practical exercises
- show real-world applications

Mastery check:
- when appropriate, generate a final challenge
- combine multiple concepts together
- ask applied questions
- detect weak points
- estimate mastery level
- recommend what to review next

Output style:
- sound intelligent, human, and adaptive
- keep explanations clear, concise, and conversational
- maintain engagement throughout the session
- act like a smart tutor, an interactive course, a game, and a personal mentor combined`,
      },
    });

    return Response.json({
      reply:
        response.text ||
        "I could not generate a text reply for that request.",
    });
  } catch (error) {
    const message = normalizeAiError(error);

    return Response.json({ error: message }, { status: 500 });
  }
}
