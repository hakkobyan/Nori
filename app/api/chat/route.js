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
        systemInstruction: `You are an AI tutor inside a learning workspace.

The learner has uploaded these materials:
${buildPromptContext(uploads)}

Rules:
- Teach conversationally and clearly.
- Stay grounded in the uploaded materials when possible.
- If the user asks for help studying, quiz, explain, simplify, compare, or reinforce.
- Be concise but helpful.`,
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
