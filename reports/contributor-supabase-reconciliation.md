# XYNTRIQ: Contributor Supabase Reconciliation Report

**Date:** 2026-08-18 · **Project URL:** https://hfqacugptqghkwgaxsex.supabase.co
**Method:** Read-only audit via Supabase REST + auth settings endpoints using the anon/publishable key (`sb_publishable_GpBrZiax2pFHpnNbAdXlEg_mtC1H_Uh`). No rows were inserted/updated/deleted, no tables altered, no auth emails/SMS sent, no migrations run. Raw audit data: [`supabase-live-audit.json`](supabase-live-audit.json).

---

## 1. Live schema audit (STEP 2)

| Table | Status | Columns observed (anon) | Notes |
|---|---|---|---|
| `profiles` | **Exists, RLS-blocked** (HTTP 401 `permission denied for table profiles`) |: (not introspectable with anon key) | Confirmed present; `profiles` reads/writes require an authenticated session. Column additions are handled by the additive migration. |
| `levels` | **Exists, readable** (HTTP 200) | `id:string, position:number, label:string, hours:number, reward:string, created_at:string` | Has rows; a public lookup table for contributor levels (position / hours / reward). |
| `daily_hours` | **Exists, RLS-blocked** (HTTP 401) |: | Matches the deployed app's earnings/level tracking. |
| `recordings` | **Exists, RLS-blocked** (HTTP 401) |: | Matches the deployed app's video-submission tracking. |
| `requests` | **Exists, RLS-blocked** (HTTP 401) |: | Matches the deployed app's request/order model. |
| `contributors`, `videos`, `submissions`, `payouts`, `bonuses`, `users`, `tasks`, `projects`, `applications`, `sessions` | **Do not exist** (HTTP 404 `Could not find the table … in the schema cache`) |: | None of the guessed alternate names exist. |

**Auth settings** (`GET /auth/v1/settings`, read-only):

| Setting | Value | Meaning |
|---|---|---|
| `external.email` | **true** | Email provider ENABLED → email+password signup is live-viable. |
| `external.phone` | **false** | Phone provider DISABLED → SMS OTP flow removed (cannot be verified without sending SMS, and it is off anyway). |
| `external.*` (Google, GitHub, etc.) | all false | No social logins configured. |
| `disable_signup` | false | Public signups allowed. |
| `mailer_autoconfirm` | false | New users need email confirmation. |
| `sms_provider` | twilio | Configured but unused (phone auth off). |

**OpenAPI spec** (`GET /rest/v1/`): HTTP 401 `Secret API key required`: the spec endpoint requires a secret key, so it is not reachable with the anon key. Noted, not a blocker.

**Conclusion:** The live project uses the **email + password** flow (matching the deployed app's bundle). The five real tables are `profiles`, `levels`, `daily_hours`, `recordings`, `requests`; `profiles` and the data tables are properly RLS-locked behind authenticated sessions.

---

## 2. What changed: signup (STEP 4)

**`assets/supabase-config.js`**: real credentials wired in (URL + `sb_publishable_…` anon key). `XYNTRIQ_SUPABASE_CONFIGURED` now resolves `true`.

**`contributors.html`**
- Removed the phone-number + dial-code field and the entire SMS OTP form (`#otp-form`, `#sf-dial`, `#sf-phone`).
- Added **Email** (`#sf-email`) and **Password** (`#sf-password`, min 8 chars) fields.
- Kept: full name, date-of-birth 18+ gate, India + 18-LATAM country selector, consent checkbox (data list updated: phone → email), Google-Form fallback.
- Submit button now reads "Create account"; section intro + notices updated to email wording.

**`assets/contributor-signup.js`** (rewritten)
- Validates client-side: name, 18+ DOB, country, consent, email format, password ≥ 8 chars.
- **Dev stub (default `ENABLE_LIVE_SIGNUP = false`):** on valid submit it reports **"Signup ready: requires running the migration + enabling email auth"** and logs the would-be payload/actions to the console. It does NOT call `auth.signUp()` (which would send a confirmation email: forbidden during dev) and does NOT write to the live DB.
- Live path (only after flipping `ENABLE_LIVE_SIGNUP = true`): `supabase.auth.signUp({ email, password })` then `profiles.upsert({ id: user.id, full_name, country, date_of_birth, age_verified, status })`: **only columns that exist or that the migration adds** (no `phone` write). Errors are handled gracefully, never crash.

## 3. What changed: dashboard (STEP 5)

**`contributor-dashboard.html` / `contributor-dashboard.js`**
- Still reads the same real config (`assets/supabase-config.js` → `window.XYNTRIQ_SUPABASE`), keeps the auth gate (no session → redirect to `contributors.html`), the featured LATAM POV card (US$5/approved video + US$5 first-5-hours bonus; iPhone 12+/Pixel 6+/Galaxy S21+; 18+; WhatsApp; PT/ES; Apply → https://xyntriq.in/contributors.html), and the earnings mock ledger: untouched.
- Profile line now labelled **Email** and displays `user.email` first (phone auth no longer exists on the live project).
- With real keys, anonymous visitors now get redirected to signup (intended live behavior); the profile `select` failure under RLS is caught and the dashboard still renders.

## 4. Migration summary (STEP 3)

**`supabase/migrations/0001_profiles.sql`**: rewritten as a **non-destructive, idempotent** migration (header: *REVIEW BEFORE RUNNING: do not auto-run*):

1. `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS` × 7: `full_name text`, `country text`, `date_of_birth date`, `age_verified boolean default false`, `languages text[] default '{}'`, `experience_tags text[] default '{}'`, `status text default 'new'`.
2. `DO $$` block: adds `profiles_country_check` CHECK (India + the 18 LATAM values) **only if it doesn't already exist**.
3. Enables RLS (idempotent) and creates `profiles_insert_own` / `profiles_select_own` / `profiles_update_own` **only if missing**: no `DROP POLICY`, no `DROP TABLE`, no data loss.
4. Commented-out `CREATE TABLE` block for fresh projects (skipped on the live project, where `profiles` already exists).

## 5. Verification (STEP 6)

- `node --check` passes on all changed JS: `assets/supabase-config.js`, `assets/contributor-signup.js`, `assets/contributor-dashboard.js`.
- No broken relative links on changed pages: `assets/style.css`, `assets/supabase-config.js`, `assets/contributor-signup.js`, `assets/contributor-dashboard.js`, `assets/script.js`, `assets/logo-v2.png`, `assets/favicon.svg` all exist; CDN `@supabase/supabase-js@2` intact.
- No stale OTP/phone/SMS references remain in `contributors.html`.
- **`README.md`** updated: real project URL + publishable-key note, the SQL-editor migration steps, Email-auth-provider note (already enabled), the `ENABLE_LIVE_SIGNUP` flip step, deploy note, and `reports/` exclusion tip.

---

## 6. Exact next actions for the user

1. **Run the migration (manual, required):** Supabase dashboard → SQL Editor → paste `supabase/migrations/0001_profiles.sql` → Run. It is safe/idempotent and only adds missing columns + the country CHECK + RLS policies to the existing `profiles` table.
2. **Confirm Email auth (already on):** Authentication → Providers → Email: verify it is enabled (audit says `external.email = true`). No SMS provider setup is needed anymore.
3. **Flip live signup on:** in `assets/contributor-signup.js` set `ENABLE_LIVE_SIGNUP = true`: only after step 1. Until then the form validates and shows "Signup ready: requires running the migration + enabling email auth" (no auth emails / DB writes from the site during dev).
4. **(Optional) RLS self-check:** after signup, verify a signed-in user can read/update only their own `profiles` row; confirm `levels` stays publicly readable (anon) for the dashboard's level display.
5. **Deploy when ready:** push to the repo (static GitHub Pages, custom domain via `CNAME`); exclude `reports/` from the published site.
6. **Do NOT** paste the `service_role` secret key anywhere in this repo: the publishable key + RLS is the intended public-facing setup.
