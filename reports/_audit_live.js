/* Read-only audit of the LIVE Supabase project (no writes, no auth actions).
 * Queries REST API per table + OpenAPI spec + auth settings endpoint. */
const SUPABASE_URL = 'https://hfqacugptqghkwgaxsex.supabase.co';
const ANON_KEY = 'sb_publishable_GpBrZiax2pFHpnNbAdXlEg_mtC1H_Uh';
const HEADERS = {
  'apikey': ANON_KEY,
  'Authorization': 'Bearer ' + ANON_KEY,
  'Accept': 'application/json'
};

const CANDIDATE_TABLES = [
  'profiles', 'levels', 'daily_hours', 'recordings', 'requests',
  'contributors', 'videos', 'submissions', 'payouts', 'bonuses',
  'users', 'tasks', 'projects', 'applications', 'sessions'
];

const results = {
  url: SUPABASE_URL,
  auditedAt: new Date().toISOString(),
  openApi: null,
  authSettings: null,
  tables: []
};

async function tryGet(path, label) {
  try {
    const res = await fetch(SUPABASE_URL + path, { headers: HEADERS });
    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch (_) { body = text.slice(0, 500); }
    return { label, status: res.status, ok: res.ok, body };
  } catch (err) {
    return { label, status: 0, ok: false, error: String(err && err.message || err) };
  }
}

function columnsFromRow(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
  return Object.keys(row).map(k => k + ':' + (row[k] === null ? 'null' : Array.isArray(row[k]) ? 'array' : typeof row[k]));
}

(async () => {
  // 1) OpenAPI spec
  const spec = await tryGet('/rest/v1/', 'openapi');
  results.openApi = { status: spec.status, ok: spec.ok };
  if (spec.ok && spec.body && spec.body.paths) {
    const paths = spec.body.paths;
    results.openApi.paths = Object.keys(paths)
      .filter(p => p !== '/' )
      .map(p => p.replace(/^\//, ''))
      .filter(name => !name.includes('{'))
      .sort();
    results.openApi.definitions = [];
    if (spec.body.components && spec.body.components.schemas) {
      for (const [name, def] of Object.entries(spec.body.components.schemas)) {
        const props = def.properties ? Object.keys(def.properties) : [];
        results.openApi.definitions.push({ name, columns: props });
      }
    }
  } else {
    results.openApi.error = spec.error || (spec.body && spec.body.message) || ('HTTP ' + spec.status);
  }

  // 2) Auth settings (read-only config probe: reveals phone/email providers)
  const auth = await tryGet('/auth/v1/settings', 'auth-settings');
  results.authSettings = { status: auth.status, ok: auth.ok };
  if (auth.ok && auth.body) {
    results.authSettings.data = {
      external: auth.body.external || null,
      disableSignup: auth.body.disable_signup ?? null,
      mailerAutoconfirm: auth.body.mailer_autoconfirm ?? null,
      phoneAutoconfirm: auth.body.phone_autoconfirm ?? null,
      smsProvider: auth.body.sms_provider ?? null,
      smsEnabled: auth.body.sms_enabled ?? null
    };
  } else {
    results.authSettings.error = auth.error || (auth.body && auth.body.message) || ('HTTP ' + auth.status);
  }

  // 3) Candidate tables
  for (const t of CANDIDATE_TABLES) {
    const r = await tryGet('/rest/v1/' + encodeURIComponent(t) + '?select=*&limit=1', 'table:' + t);
    const entry = {
      table: t,
      status: r.status,
      exists: r.ok,
      message: null,
      sampleColumns: null,
      countNote: null
    };
    if (r.ok) {
      const rows = Array.isArray(r.body) ? r.body : [];
      entry.sampleColumns = rows.length ? columnsFromRow(rows[0]) : [];
      entry.countNote = rows.length === 0 ? 'exists but empty (0 rows)' : 'has rows';
    } else {
      const msg = r.error || (r.body && (r.body.message || r.body.code)) || ('HTTP ' + r.status);
      entry.message = String(msg).slice(0, 300);
      // 404 vs RLS-blocked vs other
      if (r.status === 404) entry.reason = 'table does not exist (404)';
      else if (r.status === 401) entry.reason = 'unauthorized (401)';
      else if (r.status === 403) entry.reason = 'RLS / permission blocked (403)';
      else entry.reason = 'HTTP ' + r.status;
    }
    results.tables.push(entry);
  }

  const fs = require('fs');
  const path = require('path');
  const out = path.join(__dirname, 'supabase-live-audit.json');
  fs.writeFileSync(out, JSON.stringify(results, null, 2), 'utf8');
  console.log('WROTE ' + out);
  console.log(JSON.stringify(results, null, 2));
})().catch(err => {
  console.error('FATAL', err);
  process.exit(1);
});
