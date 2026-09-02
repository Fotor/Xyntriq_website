// XYNTRIQ · shared interactions
document.addEventListener('DOMContentLoaded', () => {
  // footer year
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // scroll reveal (staggered)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => {
    const sibs = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
    el.style.transitionDelay = (sibs.indexOf(el) % 4) * 70 + 'ms';
    io.observe(el);
  });

  // active nav link
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === page || (page === 'index.html' && href === 'index.html')) a.classList.add('active');
  });
});

// Smooth Canvas Scrub Hero (Apple-style buttery motion)
(function () {
  var track = document.getElementById('heroTrack');
  var canvas = document.getElementById('heroScrub');
  var poster = document.getElementById('heroPoster');
  if (!track || !canvas) return;

  // Touch / small screens: skip the frame scrub entirely (9MB+ of WebP frames
  // + per-scroll canvas decode). Show the preloaded poster with a CSS zoom.
  var coarse = (window.matchMedia && (matchMedia('(pointer: coarse)').matches || matchMedia('(max-width: 900px)').matches)) || (window.innerWidth <= 900);
  if (coarse) {
    track.classList.add('hero-static');
    return;
  }

  var N = 192, DIR = 'assets/video/scrub-frames-v3/';
  var frames = [];
  var lastDrawn = -1;
  var cw = 0, ch = 0;
  window.__scrubF = 0;

  function resizeCanvas() {
    try {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = Math.max(1, Math.round(rect.width * dpr));
      ch = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
    } catch (e) { /* keep defaults */ }
  }

  function draw(f, force) {
    f = Math.max(0, Math.min(N - 1, f));
    if (!force && Math.abs(f - lastDrawn) <= 0.02) return;
    window.__scrubF = f;
    lastDrawn = f;
    if (!cw || !ch) resizeCanvas();
    if (!cw || !ch) return;
    try {
      var ctx = canvas.getContext('2d', { alpha: false });
      var idx = Math.floor(f), frac = f % 1;
      var img1 = frames[idx];
      if (!img1 || !img1.complete) return;
      var scale = Math.max(cw / 960, ch / 540);
      var sw = cw / scale, sh = ch / scale;
      var sx = (960 - sw) / 2, sy = (540 - sh) / 2;
      ctx.drawImage(img1, sx, sy, sw, sh, 0, 0, cw, ch);
      if (frac > 0.01) {
        var img2 = frames[Math.min(N - 1, idx + 1)];
        if (img2 && img2.complete) {
          ctx.globalAlpha = frac;
          ctx.drawImage(img2, sx, sy, sw, sh, 0, 0, cw, ch);
          ctx.globalAlpha = 1;
        }
      }
    } catch (e) { /* never block scrubbing */ }
  }

  // preload ALL frames immediately (batched, no lazy wait) for buttery scrubbing
  var PRE = 24;
  for (var i = 1; i <= N; i++) {
    (function (idx) {
      var img = new Image();
      img.onload = function () {
        if (idx === 1) { draw(0, true); if (poster) poster.style.display = 'none'; }
      };
      frames.push(img);
    })(i);
  }
  var startAt = 1;
  function loadNext() {
    var end = Math.min(N, startAt + PRE - 1);
    for (var j = startAt; j <= end; j++) {
      frames[j - 1].src = DIR + String(j).padStart(5, '0') + '.webp';
    }
    startAt = end + 1;
    if (startAt <= N) setTimeout(loadNext, 50);
  }
  // Defer the 9MB frame download: the poster already covers the first viewport.
  // Start loading on the user's first scroll, or shortly after full page load.
  var started = false;
  function startLoad() {
    if (started) return;
    started = true;
    window.removeEventListener('scroll', startLoad);
    loadNext();
  }
  window.addEventListener('scroll', startLoad, { passive: true, once: true });
  window.addEventListener('load', function () { setTimeout(startLoad, 800); });

  var target = 0, current = 0, raf = null;

  function update() {
    var scrollMax = Math.max(1, track.offsetHeight + track.offsetTop - window.innerHeight);
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    var p = Math.max(0, Math.min(1, y / scrollMax));
    target = p * (N - 1);
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function tick() {
    raf = null;
    var diff = target - current;
    if (Math.abs(diff) < 0.001) { current = target; draw(current); return; }
    current += diff * 0.22;
    draw(current);
    raf = requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('wheel', update, { passive: true });
  document.addEventListener('touchmove', update, { passive: true });
  window.addEventListener('resize', function () { resizeCanvas(); update(); }, { passive: true });
  window.addEventListener('load', update);
  resizeCanvas();
  update();
})();

// scroll progress bar (top of page)
(function () {
  var bar = document.getElementById('scrollProgress');
  if (!bar) return;
  function up() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', up, { passive: true });
  window.addEventListener('resize', up, { passive: true });
  window.addEventListener('load', up);
  up();
})();

// auto-play videos when scrolled into view (muted)
(function () {
  var vids = document.querySelectorAll('video[data-autoplay]');
  if (!vids.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) {
        if (v.dataset.src && !v.getAttribute('src')) { v.src = v.dataset.src; v.load(); }
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.45 });
  vids.forEach(function (v) { io.observe(v); });
})();

// custom play overlay for videos
(function () {
  document.querySelectorAll('.play-overlay').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var v = btn.parentElement.querySelector('video');
      if (v) { v.play(); btn.classList.add('hidden'); }
    });
  });
})();

// mobile menu toggle (burger)
(function () {
  var btn = document.getElementById('menuBtn');
  var menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  function close() {
    menu.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') close();
  });
  document.addEventListener('click', function (e) {
    if (menu.classList.contains('open') && !menu.contains(e.target) && e.target !== btn) close();
  });
})();


// Premium interactions: cursor-tracked card glow + 3D tilt + magnetic buttons (skipped for reduced motion)
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.card, .p-card, .why-col').forEach(function (c) {
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      c.style.transform = 'perspective(900px) rotateX(' + (-y * 7).toFixed(2) + 'deg) rotateY(' + (x * 7).toFixed(2) + 'deg) translateY(-4px)';
    });
    c.addEventListener('mouseleave', function () { c.style.transform = ''; });
  });
  document.querySelectorAll('.cta, .nav-cta').forEach(function (b) {
    b.addEventListener('mousemove', function (e) {
      var r = b.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) * 0.18;
      var y = (e.clientY - r.top - r.height / 2) * 0.28;
      b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    });
    b.addEventListener('mouseleave', function () { b.style.transform = ''; });
  });
})();
