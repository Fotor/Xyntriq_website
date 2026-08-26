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

// Hero scroll-scrub video (POV driving footage)
(function () {
  var track = document.getElementById('heroTrack');
  var video = document.getElementById('heroVideo');
  if (!track || !video) return;
  function update() {
    var scrollMax = Math.max(1, track.offsetHeight + track.offsetTop - window.innerHeight);
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    var p = Math.max(0, Math.min(1, y / scrollMax));
    if (video.duration && isFinite(video.duration)) {
      var t = p * video.duration;
      if (Math.abs(video.currentTime - t) > 0.03) video.currentTime = t;
    }
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('wheel', update, { passive: true });
  document.addEventListener('touchmove', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  video.addEventListener('loadedmetadata', update);
  window.addEventListener('load', update);
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
