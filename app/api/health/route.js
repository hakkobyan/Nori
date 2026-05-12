export const runtime = "nodejs";

export async function GET() {
  const apiKeyPresent = Boolean(
    process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
  );
  const project = process.env.GOOGLE_CLOUD_PROJECT || null;
  const location = process.env.GOOGLE_CLOUD_LOCATION || null;
  const model =
    process.env.GEMINI_MODEL ||
    process.env.GOOGLE_AI_MODEL ||
    process.env.VERTEX_MODEL ||
    "gemini-2.5-flash";

  return Response.json({
    ok: apiKeyPresent || Boolean(project),
    apiKeyPresent,
    project,
    location,
    model,
    mode:
      apiKeyPresent && project
        ? "vertex-api-key"
        : apiKeyPresent
          ? "gemini-api-key"
          : project
            ? "vertex-adc"
            : "missing",
  });
}
