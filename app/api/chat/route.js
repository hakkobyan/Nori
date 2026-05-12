import { GoogleGenAI } from "@google/genai";

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "global";
const MODEL = process.env.VERTEX_MODEL || "gemini-2.5-flash";

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

export async function POST(request) {
  if (!PROJECT) {
    return Response.json(
      {
        error:
          "Vertex AI is not configured yet. Set GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, and application default credentials.",
      },
      { status: 500 },
    );
  }

  try {
    const { message, uploads = [], history = [] } = await request.json();

    if (!message?.trim()) {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }

    const ai = new GoogleGenAI({
      vertexai: true,
      project: PROJECT,
      location: LOCATION,
    });

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
