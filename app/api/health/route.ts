export const runtime = "nodejs";

export async function GET() {
  return new Response(JSON.stringify({
    ok: true,
    hasDeepSeekKey: Boolean(process.env.DEEPSEEK_API_KEY),
    time: new Date().toISOString(),
  }), { headers: { "Content-Type": "application/json" } });
}