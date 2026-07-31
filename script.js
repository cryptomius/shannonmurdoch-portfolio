/* ==========================================================================
   shannonmurdoch.com — progressive enhancement
   Everything here is optional: the site is fully readable and navigable
   with JavaScript disabled.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------------ */
  function initNav() {
    var toggle = document.querySelector('.nav__toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    function close() {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        close();
        toggle.focus();
      }
    });

    // Reset when we leave the mobile breakpoint
    var mq = window.matchMedia('(min-width: 52.01rem)');
    var onChange = function (e) { if (e.matches) close(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ------------------------------------------------------------------------
     Header hairline on scroll
     ------------------------------------------------------------------------ */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------------
     Testimonial carousel
     Responsive: page size derives from measured slide width, so the same
     markup works at 1 / 2 / 3 columns.
     ------------------------------------------------------------------------ */
  function initCarousel(root) {
    var viewport = root.querySelector('.tst__viewport');
    var track = root.querySelector('.tst__track');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.tst__slide'));
    var prev = root.querySelector('[data-tst="prev"]');
    var next = root.querySelector('[data-tst="next"]');
    var dotList = root.querySelector('.tst__dots');
    if (!viewport || !track || slides.length === 0) return;

    var index = 0;
    var perView = 1;
    var pages = 1;

    function measure() {
      var vw = viewport.clientWidth;
      var sw = slides[0].getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      perView = Math.max(1, Math.round((vw + gap) / (sw + gap)));
      pages = Math.max(1, slides.length - perView + 1);
      if (index > pages - 1) index = pages - 1;
    }

    function buildDots() {
      if (!dotList) return;
      dotList.innerHTML = '';
      for (var i = 0; i < pages; i++) {
        var li = document.createElement('li');
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'tst__dot';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', 'Testimonial ' + (i + 1) + ' of ' + pages);
        b.dataset.index = String(i);
        li.appendChild(b);
        dotList.appendChild(li);
      }
      dotList.addEventListener('click', function (e) {
        var btn = e.target.closest('.tst__dot');
        if (btn) go(parseInt(btn.dataset.index, 10));
      });
    }

    function render() {
      var sw = slides[0].getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      track.style.transform = 'translate3d(' + (-index * (sw + gap)) + 'px,0,0)';

      slides.forEach(function (s, i) {
        var visible = i >= index && i < index + perView;
        s.setAttribute('aria-hidden', visible ? 'false' : 'true');
        var focusables = s.querySelectorAll('a, button');
        Array.prototype.forEach.call(focusables, function (el) {
          if (visible) el.removeAttribute('tabindex');
          else el.setAttribute('tabindex', '-1');
        });
      });

      if (dotList) {
        Array.prototype.forEach.call(dotList.querySelectorAll('.tst__dot'), function (d, i) {
          d.setAttribute('aria-selected', String(i === index));
        });
      }
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index >= pages - 1;
    }

    function go(i) {
      index = Math.max(0, Math.min(i, pages - 1));
      render();
    }

    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(index - 1); }
      else if (e.key === 'ArrowRight') { go(index + 1); }
    });

    // Touch swipe
    var startX = 0, startY = 0, dragging = false;
    viewport.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY; dragging = true;
    }, { passive: true });
    viewport.addEventListener('touchend', function (e) {
      if (!dragging) return;
      dragging = false;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
    }, { passive: true });

    function rebuild() { measure(); buildDots(); render(); }

    root.classList.add('is-ready');
    rebuild();

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(rebuild, 150);
    });
  }

  /* ------------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------------
     Reading progress (case study pages)
     ------------------------------------------------------------------------ */
  function initProgress() {
    var bar = document.querySelector('.progress__bar');
    if (!bar) return;
    var ticking = false;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------------
     In-page TOC active state
     ------------------------------------------------------------------------ */
  function initToc() {
    var toc = document.querySelector('.toc');
    if (!toc || !('IntersectionObserver' in window)) return;
    var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
    if (!links.length) return;

    var map = {};
    var targets = [];
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) { map[el.id] = a; targets.push(el); }
    });
    if (!targets.length) return;

    function setActive(id) {
      links.forEach(function (a) { a.classList.remove('is-active'); });
      if (map[id]) map[id].classList.add('is-active');
    }

    var io = new IntersectionObserver(function (entries) {
      var best = null;
      entries.forEach(function (e) {
        if (e.isIntersecting && (!best || e.boundingClientRect.top < best.boundingClientRect.top)) best = e;
      });
      if (best) setActive(best.target.id);
    }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });

    targets.forEach(function (el) { io.observe(el); });
    setActive(targets[0].id);
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  function boot() {
    initNav();
    initHeader();
    initReveal();
    initProgress();
    initToc();
    Array.prototype.forEach.call(document.querySelectorAll('[data-carousel]'), initCarousel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
