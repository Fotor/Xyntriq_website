/* ============================================================================
 * Xyntriq: contributor dashboard (contributor-dashboard.html)
 * Auth gate: no Supabase session -> redirect to contributors.html.
 * Reads the same real config as the signup page (assets/supabase-config.js);
 * the live project uses EMAIL auth (phone auth is disabled: audited
 * 2026-08-18), so the profile line shows the user's email.
 * Views: Profile summary / LATAM project feed / Earnings (mock ledger).
 * ==========================================================================*/
(function () {
  'use strict';

  var CONFIGURED = Boolean(window.XYNTRIQ_SUPABASE_CONFIGURED);
  var notice = document.getElementById('dash-notice');
  var dash = document.getElementById('dash');

  function ready(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }

  if (!CONFIGURED) {
    ready(notice);
    hide(dash);
    return;
  }

  if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
    ready(notice);
    hide(dash);
    return;
  }

  var supabase = window.supabase.createClient(
    window.XYNTRIQ_SUPABASE.url,
    window.XYNTRIQ_SUPABASE.anonKey
  );

  // ---- Auth gate -----------------------------------------------------------
  supabase.auth.getSession().then(function (res) {
    if (res.error || !res.session) {
      window.location.replace('contributors.html');
      return;
    }
    init(supabase, res.session);
  }).catch(function () {
    window.location.replace('contributors.html');
  });

  // ---- Views ---------------------------------------------------------------
  function init(supabase, session) {
    // tabs
    var tabs = document.querySelectorAll('.dash-tab');
    var panels = document.querySelectorAll('.dash-panel');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        panels.forEach(function (p) {
          p.classList.toggle('active', p.id === tab.getAttribute('data-panel'));
        });
      });
    });

    // profile data
    var setText = function (id, value) {
      var el = document.getElementById(id);
      if (el) el.textContent = value || 'Not set';
    };

    var user = session.user;
    setText('pf-phone', (user.email || user.phone || user.phone_number || ''));

    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      .then(function (res) {
        var p = res.data;
        if (res.error) p = null;
        if (p) {
          setText('pf-name', p.full_name);
          setText('pf-country', p.country);
          setText('pf-languages', Array.isArray(p.languages) ? p.languages.join(', ') : '');
          setText('pf-experience', Array.isArray(p.experience_tags) ? p.experience_tags.join(', ') : '');
          setText('pf-status', p.status || 'new');
          var badge = document.getElementById('pf-status');
          if (badge) {
            badge.className = 'pill ' + (p.status === 'active' ? 'active' : p.status === 'paused' ? 'new' : 'new');
          }
        }
        ready(dash);
      })
      .catch(function () { ready(dash); });
  }
})();
