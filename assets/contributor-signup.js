/* ============================================================================
 * XYNTRIQ: contributor signup (contributors.html)
 * Flow: 1) details + 18+ validation -> 2) email+password sign-up (Supabase
 *       email auth) -> 3) profile upsert -> 4) redirect to dashboard.
 *
 * LIVE BACKEND REALITY (audited 2026-08-18, read-only):
 *   • Auth providers on the live project: Email = ENABLED, Phone = DISABLED.
 *     -> the site now uses email+password (the phone OTP flow was removed).
 *   • The `profiles` table exists but is RLS-blocked for the anon key, and
 *     the additive migration (supabase/migrations/0001_profiles.sql) has not
 *     been run on the live project.
 *
 * DEV MODE (default): ENABLE_LIVE_SIGNUP = false. The form validates
 * everything client-side and then reports "Signup ready: requires running
 * the migration + enabling email auth" instead of writing to the live DB or
 * sending auth emails. This is intentional: during development we must not
 * create auth users, send emails, or write rows to the live project.
 * Set ENABLE_LIVE_SIGNUP = true ONLY after the migration has been run in the
 * Supabase SQL editor and you are ready to accept real signups.
 * ==========================================================================*/
(function () {
  'use strict';

  var ENABLE_LIVE_SIGNUP = false; // <-- flip to true after running the migration
  var CONFIGURED = Boolean(window.XYNTRIQ_SUPABASE_CONFIGURED);
  var supabase = null;
  if (CONFIGURED && typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabase = window.supabase.createClient(
      window.XYNTRIQ_SUPABASE.url,
      window.XYNTRIQ_SUPABASE.anonKey
    );
  }

  var form = document.getElementById('signup-form');
  if (!form) return; // page is not contributors.html

  var notice = document.getElementById('supabase-notice');
  var msgEl = document.getElementById('sf-msg');
  var dobInput = document.getElementById('sf-dob');
  var dobError = document.getElementById('sf-dob-error');
  var countrySel = document.getElementById('sf-country');
  var consentBox = document.getElementById('sf-consent');
  var submitBtn = document.getElementById('sf-submit');

  function show(el, message, ok) {
    if (!el) return;
    el.textContent = message || '';
    el.hidden = false;
    el.classList.remove('ok', 'err');
    if (ok === true) el.classList.add('ok');
    if (ok === false) el.classList.add('err');
  }

  function hide(el) { if (el) el.hidden = true; }

  function ageFromDateOfBirth(value) {
    var d = new Date(value + 'T00:00:00');
    if (isNaN(d.getTime())) return -1;
    var now = new Date();
    var age = now.getFullYear() - d.getFullYear();
    var m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim());
  }

  // ---- Step 1: validate details, then sign up (or report "ready" stub) -----
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hide(msgEl);

    if (!CONFIGURED || !supabase) {
      if (notice) notice.hidden = false;
      show(msgEl, 'Signup is not available yet. Supabase is not configured. Please use the pre-onboarding form instead.', false);
      return;
    }

    var name = String(document.getElementById('sf-name').value || '').trim();
    var dob = String(dobInput.value || '');
    var country = String(countrySel.value || '');
    var email = String(document.getElementById('sf-email').value || '').trim();
    var password = String(document.getElementById('sf-password').value || '');

    // 18+ validation: inline error, do not proceed
    var age = ageFromDateOfBirth(dob);
    if (age < 18) {
      if (dobError) dobError.hidden = false;
      if (dobInput) dobInput.focus();
      return;
    }
    if (dobError) dobError.hidden = true;

    if (!name) { show(msgEl, 'Please enter your full name.', false); return; }
    if (!country) { show(msgEl, 'Please select your country.', false); return; }
    if (!isValidEmail(email)) { show(msgEl, 'Please enter a valid email address.', false); return; }
    if (password.length < 8) { show(msgEl, 'Password must be at least 8 characters.', false); return; }
    if (!consentBox || !consentBox.checked) {
      show(msgEl, 'Please confirm the consent statement to continue.', false);
      return;
    }

    var payload = {
      id: null, // filled with auth user id on live signup
      email: email,
      full_name: name,
      country: country,
      date_of_birth: dob,
      age_verified: true,
      status: 'new'
    };

    if (ENABLE_LIVE_SIGNUP) {
      liveSignup(payload, password);
      return;
    }

    // ---- Dev stub: nothing is written to the live DB / no auth email --------
    console.info('[xyntriq-signup] DEV MODE (ENABLE_LIVE_SIGNUP=false): signup validated OK but NOT submitted to the live Supabase project. Payload:', payload);
    console.info('[xyntriq-signup] Would call: supabase.auth.signUp({ email, password }) then upsert profiles row { id: user.id, full_name, country, date_of_birth, age_verified, status }.');
    console.info('[xyntriq-signup] Next steps: run supabase/migrations/0001_profiles.sql in the Supabase SQL editor, confirm Email auth provider is enabled (it is: external.email = true per audit), then set ENABLE_LIVE_SIGNUP = true.');
    show(msgEl, 'Signup ready. Requires running the migration + enabling email auth. Your details were validated; no account was created yet. Meanwhile you can apply via the pre-onboarding form.', true);
  });

  // ---- Live path (only when ENABLE_LIVE_SIGNUP = true) ----------------------
  function liveSignup(payload, password) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account…';

    supabase.auth.signUp({ email: payload.email, password: password })
      .then(function (res) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create account';
        if (res.error) {
          show(msgEl, 'Could not create your account: ' + (res.error.message || 'unknown error') + '.', false);
          return;
        }
        var user = res.data && res.data.user;
        if (!user) {
          show(msgEl, 'Account created. Check your email for the confirmation link, then sign in from the dashboard.', true);
          return;
        }
        // Upsert the profile row using only columns that exist on the live
        // table or that the additive migration adds (no phone column write).
        payload.id = user.id;
        supabase.from('profiles').upsert(payload, { onConflict: 'id' })
          .then(function (up) {
            if (up.error) {
              console.warn('[xyntriq-signup] Auth OK but profile upsert failed:', up.error);
              show(msgEl, 'Account created, but saving your profile failed: ' + up.error.message + '. You can retry from the dashboard.', false);
            } else {
              window.location.replace('contributor-dashboard.html');
            }
          })
          .catch(function () {
            window.location.replace('contributor-dashboard.html');
          });
      })
      .catch(function (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create account';
        show(msgEl, 'Could not reach the signup service: ' + (err && err.message ? err.message : 'network error') + '.', false);
      });
  }

  // Keys not configured: show the notice up front instead of failing silently
  if (!CONFIGURED) {
    if (notice) notice.hidden = false;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signup unavailable';
    }
  }
})();
