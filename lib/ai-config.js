const DEFAULT_MODEL = "gemini-2.5-flash";

function readEnv(name) {
  const value = process.env[name];

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isEnabled(value) {
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function getAiConfig() {
  const geminiApiKey = readEnv("GEMINI_API_KEY");
  const googleApiKey = readEnv("GOOGLE_API_KEY");
  const apiKey = geminiApiKey || googleApiKey;
  const project = readEnv("GOOGLE_CLOUD_PROJECT");
  const location = readEnv("GOOGLE_CLOUD_LOCATION") || "global";
  const useVertex =
    isEnabled(readEnv("GOOGLE_GENAI_USE_VERTEXAI")) || (!apiKey && Boolean(project));
  const model =
    readEnv("GEMINI_MODEL") ||
    readEnv("GOOGLE_AI_MODEL") ||
    readEnv("VERTEX_MODEL") ||
    DEFAULT_MODEL;

  if (useVertex) {
    return {
      clientOptions: {
        vertexai: true,
        location,
        project,
      },
      isConfigured: Boolean(project),
      location,
      mode: project ? "vertex" : "missing-vertex-project",
      model,
      project: project || null,
    };
  }

  return {
    clientOptions: apiKey ? { apiKey } : null,
    isConfigured: Boolean(apiKey),
    location: project ? location : null,
    mode: apiKey ? "gemini-api-key" : "missing-api-key",
    model,
    project: project || null,
  };
}
