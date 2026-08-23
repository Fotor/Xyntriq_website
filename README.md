# XYNTRIQ · Website

Static website for **XYNTRIQ** (brand name), an AI data collection company producing consented first-person (POV) video datasets.

## What's inside

- `index.html`: the full site (self-contained: HTML + CSS + structured data).
- SEO meta tags (title, description, Open Graph, canonical).
- AEO: answer-first FAQ for featured snippets / "People Also Ask".
- GEO: a citable "About" blurb used consistently so AI models cite XYNTRIQ.
- JSON-LD structured data (Organization + Service + FAQPage).

## Deploy (GitHub Pages)

1. Create a new repository and push these files.
2. Go to **Settings → Pages → Source → "Deploy from a branch"**, select `main` / root.
3. Your site is live at `https://<username>.github.io/<repo>/`.

## Deploy (Vercel / Netlify)

1. Connect the repository.
2. Build command: *(none: it's static)*. Output directory: `root`.
3. Add your custom domain `xyntriq.in` in the project settings.

## Contributor app (email signup + dashboard)

The contributor flow lives inside this static site: no separate app.

**Live backend (real project, wired 2026-08-18)**
- Project URL: `https://hfqacugptqghkwgaxsex.supabase.co`: already in `assets/supabase-config.js`.
- Key: `sb_publishable_GpBrZiax2pFHpnNbAdXlEg_mtC1H_Uh` (a **publishable** anon key: safe to commit; Row Level Security protects the data). Never paste the `service_role` secret key into this repo.
- Auth reality (read-only audit): **Email provider = enabled**, Phone = disabled, no social logins. The site therefore uses **email + password** signup (the old SMS-OTP flow was removed).

**Files**
- `assets/supabase-config.js`: holds the real Supabase credentials. **This file is already wired: do not re-placeholder it.**
- `contributors.html`: signup form (name, date of birth, country, email, password) with 18+ validation, the India + 18-LATAM country selector, and consent.
- `contributor-dashboard.html`: auth-gated dashboard (profile summary, LATAM project feed, mock earnings ledger).
- `supabase/migrations/0001_profiles.sql`: **non-destructive** additive migration for the live `profiles` table (adds missing columns + country CHECK; never drops/recreates). Header says REVIEW BEFORE RUNNING: it is never auto-run.

**Setup steps (live project)**

1. **Credentials**: already done: `assets/supabase-config.js` holds the real URL + publishable key, and `XYNTRIQ_SUPABASE_CONFIGURED` resolves true.
2. **Run the migration** (manual, reviewed): open the Supabase dashboard → SQL Editor → paste `supabase/migrations/0001_profiles.sql` → Run. It is idempotent and safe to re-run. It only adds columns (`full_name`, `country`, `date_of_birth`, `age_verified`, `languages`, `experience_tags`, `status`) plus the country CHECK constraint and missing RLS policies to the existing `profiles` table.
3. **Email auth provider**: already enabled on the live project (audit: `external.email = true`). Double-check at Authentication → Providers → Email if signups ever stop working.
4. **Flip live signup on**: in `assets/contributor-signup.js`, set `ENABLE_LIVE_SIGNUP = true`. Until then the form validates client-side and reports "Signup ready: requires running the migration + enabling email auth" instead of writing to the live DB or sending auth emails (intentional dev stub: the site must not create auth users / send emails during development).
5. **Deploy**: push to the repo: this is a static GitHub Pages site (custom domain `xyntriq.in` via the existing `CNAME` file). No build step needed. Tip: exclude the `reports/` folder from the published site (it contains internal audit data).

## Notes

- Brand name everywhere is **"XYNTRIQ"** (not "XYNTRIQ AI Labs").
- Contributor pay is **$5 USD per approved video**.
- Keep the "About" blurb (in the footer + `#about` section) identical on LinkedIn and directories: that consistency is what makes AI models cite XYNTRIQ.
