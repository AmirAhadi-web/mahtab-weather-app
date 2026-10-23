export const dynamic = "force-dynamic";

/** Simple liveness probe — Mahtab has no database or external state. */
export async function GET() {
  return Response.json({ ok: true, service: "mahtab" });
}
