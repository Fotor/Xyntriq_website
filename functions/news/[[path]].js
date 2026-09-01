// Stork Wire proxy: serves the XYNTRIQ news feed at /news from stork.ai.
// Matches /news and /news/* ([[path]] catch-all). Always returns 200 (never redirects),
// per Stork's install requirement. Reversible: delete this file and rebuild.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const rest = url.pathname.replace(/^\/news/, "");
  const target = "https://www.stork.ai/wire/weylatkd2uzk7tb7v" + rest + url.search;
  const headers = { "Host": "www.stork.ai" };
  const ua = context.request.headers.get("user-agent");
  if (ua) headers["User-Agent"] = ua;
  try {
    const res = await fetch(target, { headers, redirect: "manual" });
    const body = await res.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        "content-type": res.headers.get("content-type") || "text/html; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  } catch (e) {
    return new Response("News feed temporarily unavailable.", { status: 502, headers: { "content-type": "text/plain" } });
  }
}
