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

// Premium interactions: 3D tilt + magnetic buttons (skipped for reduced motion)
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

// scroll progress bar
(function () {
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  var update = function () {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
  update();
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

// smooth scrolling (Lenis): lazy-loaded AFTER first paint, native scroll as fallback
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function bootLenis() {
    var s = document.createElement('script');
    s.src = 'https://unpkg.com/lenis@1.1.13/dist/lenis.min.js';
    s.onload = function () {
      if (!window.Lenis) return;
      var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    };
    document.head.appendChild(s);
  }
  if (document.readyState === 'complete') { setTimeout(bootLenis, 400); }
  else { window.addEventListener('load', function () { setTimeout(bootLenis, 400); }); }
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
