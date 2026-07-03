/* SIM Latinoamérica homepage replica — vanilla JS behaviours
   Replaces: jarallax (parallax), Astra sticky header, Elementor entrance
   animations and the ElementsKit video popup from the WordPress site. */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var header = document.getElementById('siteHeader');

  /* ---------- Mobile nav drawer ---------- */
  var navToggle = document.getElementById('navToggle');

  navToggle.addEventListener('click', function () {
    var open = header.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });

  /* ---------- Parallax backgrounds ---------- */
  var layers = Array.prototype.slice.call(document.querySelectorAll('.parallax-bg'));
  var ticking = false;

  function updateParallax() {
    ticking = false;
    var vh = window.innerHeight;
    layers.forEach(function (layer) {
      var rect = layer.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return; // off-screen
      var speed = parseFloat(layer.dataset.parallax) || 0.3;
      // progress: -1 (section below viewport) … 1 (section above viewport)
      var progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      layer.style.transform = 'translate3d(0,' + (-progress * speed * rect.height / 2).toFixed(1) + 'px,0)';
    });
  }

  function requestParallax() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateParallax);
    }
  }

  if (!reducedMotion && layers.length) {
    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax);
    updateParallax();
  }

  /* ---------- Scroll-reveal (IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- YouTube lightbox (Conócenos) ---------- */
  var VIDEO_ID = 'zx8x6J7vPNI';
  var lightbox = document.getElementById('videoLightbox');
  var mount = document.getElementById('videoMount');
  var openBtn = document.getElementById('openVideo');

  function openLightbox() {
    mount.innerHTML = '<iframe src="https://www.youtube.com/embed/' + VIDEO_ID +
      '?autoplay=1&rel=0" title="SIM Latinoamérica" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.hidden = true;
    mount.innerHTML = ''; // stop playback
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-close')) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
})();
