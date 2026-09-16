// =============================================================================
// XYNTRIQ - Cloudflare Pages Functions middleware   (functions/_middleware.js)
// -----------------------------------------------------------------------------
// WHAT THIS DOES
//   (a) HARD-404s internal build files that must never be served publicly
//       (Python build scripts, agent/dev docs, the legacy draft page).
//   (b) Gives /404 and /404.html a real HTTP 404 status - they used to answer
//       200, which let Google index the error page.
//   (c) Reserves a clearly-marked ANALYTICS EXTENSION POINT (see
//       withExtensions() at the bottom) for injecting analytics later.
//
// SAFETY CONTRACT (do not break)
//   * next() always runs first, so any response we replace is the site's own
//     response - never a hand-built substitute for a normal page.
//   * Everything after that runs inside try/catch: on ANY unexpected error the
//     ORIGINAL response is returned unchanged.
//   * Only GET and HEAD are inspected. Form POSTs, API calls and every other
//     method are returned untouched.
//   * Only the exact paths listed below are affected. /assets/*, the
//     functions/news/[[path]].js proxy, redirects and all real pages pass
//     through byte-for-byte.
//
// HOW TO EXTEND
//   Edit withExtensions() at the bottom of this file. It is currently a no-op
//   identity function that returns the response unchanged.
// =============================================================================

export async function onRequest(context) {
  const { request, env, next } = context;

  // Start from the site's own response. This is our safe fallback value, so
  // nothing below can ever make a normal page worse than it is today.
  const original = await next();

  try {
    const method = (request.method || "GET").toUpperCase();

    // Never touch form POSTs, API calls, or anything that is not a read.
    if (method !== "GET" && method !== "HEAD") {
      return withExtensions(original, context);
    }

    const path = normalizePath(new URL(request.url).pathname);
    const mustBlock = isBlocked(path);
    const isSoft404 = path === "/404" || path === "/404.html";

    // Everything that is not on the list: unchanged, untouched.
    if (!mustBlock && !isSoft404) {
      return withExtensions(original, context);
    }

    try {
      return await notFoundResponse(original, env, method === "HEAD");
    } catch (_) {
      // Even if the 404 lookup fails, never fall back to the internal file.
      return branded404(null, method === "HEAD");
    }
  } catch (_) {
    // CRITICAL SAFETY: anything unexpected above -> original response as-is.
    return original;
  }
}

// -----------------------------------------------------------------------------
// 1. WHAT TO BLOCK  (exact paths, case-insensitive, trailing slash ignored)
// -----------------------------------------------------------------------------
const BLOCKED_PATHS = new Set([
  "/serve.py",
  "/inline_css.py",
  "/inline_fonts.py",
  "/branding_fix.py",
  "/top_everything.py",
  "/aeo_geo.py",
  "/aeo_geo2.py",
  "/fix_mobile.py",
  "/form_funnel.py",
  "/strip_audio.py",
  "/font_css_inline.txt",
  "/readme.md",
  "/agents.md",
  "/cname",
  "/request-sample.html" // legacy draft page
]);

// Any *.py sitting at the site root. The [^/] keeps /assets/* and /news/*
// out of scope, so this can never catch a real asset.
const ROOT_PYTHON = /^\/[^/]+\.py$/;

function normalizePath(pathname) {
  const p = String(pathname || "/").toLowerCase().replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

function isBlocked(path) {
  return BLOCKED_PATHS.has(path) || ROOT_PYTHON.test(path);
}

// -----------------------------------------------------------------------------
// 2. THE 404 RESPONSE - HTTP 404 status + the site's own 404 page
// -----------------------------------------------------------------------------
const NOT_FOUND_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "x-robots-tag": "noindex, nofollow", // belt and braces: never index an error page
  "cache-control": "no-store"
};

async function notFoundResponse(original, env, headOnly) {
  if (headOnly) return branded404(null, true);

  let body = null;

  // Prefer the real /404.html so the page always matches the live design.
  // env.ASSETS serves static assets directly and does not re-enter this
  // middleware, so there is no recursion.
  try {
    if (env && env.ASSETS && typeof env.ASSETS.fetch === "function") {
      const assetUrl = new URL("/404.html", (original && original.url) || "https://xyntriq.in/");
      const res = await env.ASSETS.fetch(new Request(assetUrl.toString(), { method: "GET" }));
      if (res && res.ok) body = await res.text();
    }
  } catch (_) {
    body = null;
  }

  // Fallback for /404 itself: the original response already IS the 404 page
  // (served with a 200), so reuse its body. The content-type guard means an
  // internal file such as serve.py can never be used as the 404 body.
  if (!body && original && original.status === 200 && typeof original.clone === "function") {
    try {
      const ctype = original.headers.get("content-type") || "";
      if (ctype.indexOf("text/html") !== -1) body = await original.clone().text();
    } catch (_) {
      body = null;
    }
  }

  return branded404(body, false);
}

function branded404(body, headOnly) {
  return new Response(headOnly ? null : (body || FALLBACK_404_HTML), {
    status: 404,
    headers: NOT_FOUND_HEADERS
  });
}

// Minimal branded page, used only if /404.html cannot be read at runtime.
const FALLBACK_404_HTML =
  "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">" +
  "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
  "<meta name=\"robots\" content=\"noindex\">" +
  "<title>Page Not Found | XYNTRIQ</title></head>" +
  "<body style=\"margin:0;background:#0F172A;color:#F8FAFC;" +
  "font-family:Roboto,-apple-system,'Segoe UI',sans-serif;display:flex;" +
  "min-height:100vh;align-items:center;justify-content:center\">" +
  "<main style=\"text-align:center;padding:32px\">" +
  "<p style=\"letter-spacing:.28em;font-size:12px;color:#94A3B8;margin:0 0 12px\">XYNTRIQ</p>" +
  "<h1 style=\"font-size:64px;margin:0 0 8px;color:#14b8a6\">404</h1>" +
  "<h2 style=\"font-size:20px;margin:0 0 12px\">That page moved or never existed</h2>" +
  "<p style=\"color:#94A3B8;margin:0 0 24px\">The page you are looking for is not here.</p>" +
  "<p><a href=\"/\" style=\"color:#14b8a6;margin-right:16px\">Back to Home</a>" +
  "<a href=\"/services\" style=\"color:#14b8a6;margin-right:16px\">Our Services</a>" +
  "<a href=\"/contact\" style=\"color:#14b8a6\">Contact Us</a></p>" +
  "</main></body></html>";

// -----------------------------------------------------------------------------
// 3. ANALYTICS EXTENSION POINT  (reserved - currently a no-op)
// -----------------------------------------------------------------------------
// Every request that is not blocked flows through here before it is returned.
// Keep any future addition additive and HTML-200-only, for example:
//
//   const ctype = response.headers.get("content-type") || "";
//   if (response.status === 200 && ctype.indexOf("text/html") !== -1) {
//     const html = await response.text();
//     return new Response(html.replace("</body>", SNIPPET + "</body>"), response);
//   }
//
// Never touch /assets/*, non-HTML responses, or the /news proxy output.
function withExtensions(response, _context) {
  return response;
}
