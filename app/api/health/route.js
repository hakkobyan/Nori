import { getAiConfig } from "@/lib/ai-config";

export const runtime = "nodejs";

export async function GET() {
  const config = getAiConfig();

  return Response.json({
    ok: config.isConfigured,
    apiKeyPresent: config.mode === "gemini-api-key",
    project: config.project,
    location: config.location,
    model: config.model,
    mode: config.mode,
  });
}
