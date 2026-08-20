/* ============================================================================
 * Xyntriq: Supabase configuration
 * ----------------------------------------------------------------------------
 * 1. Create a free Supabase project at https://supabase.com (or open the
 *    existing one).
 * 2. Open your project → Settings → API (or Project Settings → API Keys).
 * 3. COPY the two values below and PASTE them over the placeholders:
 *
 *        Project URL   ->  https://xxxxx.supabase.co        (paste into "url")
 *        anon public   ->  eyJhbGciOi... (long string)      (paste into "anonKey")
 *
 *    ONLY the "anon / public" key belongs here. NEVER paste the `service_role`
 *    secret key into this file: it is committed to GitHub Pages and must stay
 *    public-facing safe (RLS policies protect the data).
 *
 * 4. Do NOT rename or remove `window.XYNTRIQ_SUPABASE`: both
 *    contributors.html and contributor-dashboard.html read it before any
 *    auth logic runs.
 * ==========================================================================*/
window.XYNTRIQ_SUPABASE = {
  url: "https://hfqacugptqghkwgaxsex.supabase.co",
  anonKey: "sb_publishable_GpBrZiax2pFHpnNbAdXlEg_mtC1H_Uh"
};

/* True once the real keys have been pasted in (used by the pages to decide
 * between the live flow and the "Supabase keys not configured" notice). */
window.XYNTRIQ_SUPABASE_CONFIGURED = Boolean(
  window.XYNTRIQ_SUPABASE &&
  window.XYNTRIQ_SUPABASE.url &&
  window.XYNTRIQ_SUPABASE.anonKey &&
  window.XYNTRIQ_SUPABASE.url.indexOf("INSERT_SUPABASE_URL") === -1 &&
  window.XYNTRIQ_SUPABASE.anonKey.indexOf("INSERT_SUPABASE_ANON_KEY") === -1 &&
  /^https?:\/\//.test(window.XYNTRIQ_SUPABASE.url)
);
