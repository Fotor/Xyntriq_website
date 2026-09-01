// Stork Wire proxy: serves the XYNTRIQ news feed at /news from stork.ai.
// Matches /news and /news/* ([[path]] catch-all). Always returns 200 (never redirects),
// per Stork's install requirement. Reversible: delete this file and rebuild.
// Theme: rewrites Stork's light design to the XYNTRIQ dark theme (main site colors).
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const rest = url.pathname.replace(/^\/news/, "");
  const target = "https://www.stork.ai/wire/weylatkd2uzk7tb7v" + rest + url.search;
  const headers = { "Host": "www.stork.ai" };
  const ua = context.request.headers.get("user-agent");
  if (ua) headers["User-Agent"] = ua;
  try {
    const res = await fetch(target, { headers, redirect: "manual" });
    const ctype = res.headers.get("content-type") || "text/html; charset=utf-8";
    if (ctype.includes("text/html")) {
      const html = await res.text();
      return new Response(applyTheme(html), {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
      });
    }
    const body = await res.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: { "content-type": ctype, "cache-control": "no-store" }
    });
  } catch (e) {
    return new Response("News feed temporarily unavailable.", { status: 502, headers: { "content-type": "text/plain" } });
  }
}

// XYNTRIQ main-site theme (assets/style.css :root): dark navy bg, teal accent.
const THEME =
  ":root{--accent:#14b8a6;--ink:#F8FAFC;--ink2:#94A3B8;--bg:#0F172A;--card:#1E293B;--rule:#334155}";
const EXTRA =
  "body{font-family:'Roboto',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important;" +
  "background:radial-gradient(60% 55% at 8% 0%,rgba(20,184,166,.15),transparent 72%) fixed," +
  "radial-gradient(55% 50% at 92% 8%,rgba(45,212,191,.10),transparent 70%) fixed," +
  "var(--bg)!important}" +
  ".shot.blank{background:linear-gradient(140deg,rgba(20,184,166,.26),rgba(20,184,166,.07))!important}";

function applyTheme(html) {
  let out = html;
  if (/:root\{--accent/.test(out)) {
    out = out.replace(/:root\{--accent[^}]*\}/, THEME);
  } else {
    out = out.replace("</head>", "<style>" + THEME + "</style></head>");
  }
  return out.replace("</style>", EXTRA + "</style>");
}
