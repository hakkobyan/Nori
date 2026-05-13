import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const MODEL =
  process.env.GEMINI_MODEL ||
  process.env.GOOGLE_AI_MODEL ||
  process.env.VERTEX_MODEL ||
  "gemini-2.5-flash";

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

function createAiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "global";

  if (apiKey && project) {
    return new GoogleGenAI({
      vertexai: true,
      apiKey,
    });
  }

  if (apiKey) {
    return new GoogleGenAI({ apiKey });
  }

  if (project) {
    return new GoogleGenAI({
      vertexai: true,
      project,
      location,
    });
  }

  return null;
}

export async function POST(request) {
  const ai = createAiClient();

  if (!ai) {
    return Response.json(
      {
        error:
          "AI is not configured. Set GOOGLE_API_KEY with GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION for Vertex AI, or use GEMINI_API_KEY for direct Gemini API access.",
      },
      { status: 500 },
    );
  }

  try {
    const { message, uploads = [], history = [] } = await request.json();

    if (!message?.trim()) {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: toVertexContents(history),
      config: {
        temperature: 0.5,
        systemInstruction: `You are a friendly AI study buddy inside a learning application.

The learner has uploaded these materials:
${buildPromptContext(uploads)}

Your job is to help the learner understand the material in a relaxed, human way.

Tone rules:
- sound like a smart friend, not a formal tutor
- keep replies short
- usually write 1 to 4 short sentences
- only go longer if the user explicitly asks for depth
- avoid giant paragraphs and long lectures
- use simple wording
- use natural contractions like "it's", "that's", "you're", "let's" when it fits
- short casual wording is good when it still stays clear
- use a light, natural tone
- sometimes use 1 emoji, but keep it subtle and not in every message
- avoid sounding robotic, academic, or overly motivational

Style rules:
- break ideas into small chunks
- focus on the single most helpful next step
- if explaining something, keep it compact first
- if the topic is big, give a tiny overview and ask if they want more
- if quizzing, ask one or two questions at a time
- if summarizing, keep it tight and easy to scan
- if the learner seems confused, simplify immediately
- do not dump everything at once

Behavior rules:
- stay grounded in the uploaded materials when possible
- be practical and conversational
- ask brief follow-up questions when helpful
- prioritize clarity over completeness
- prefer short phrases and a few sentences over long text blocks
- never send a huge wall of text unless the user directly asks for a deep answer

Good response pattern:
- quick reaction
- short explanation or answer
- one gentle follow-up or next-step question when useful`,
      },
    });

    return Response.json({
      reply:
        response.text ||
        "I could not generate a text reply from Vertex AI for that request.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Vertex AI request failed.";

    return Response.json({ error: message }, { status: 500 });
  }
}
