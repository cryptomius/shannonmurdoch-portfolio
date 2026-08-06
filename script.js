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
     Rotating word in the hero sentence
     The first word carries .is-in from the markup, so with JS off (or under
     prefers-reduced-motion) it simply stays put and the sentence reads normally.
     ------------------------------------------------------------------------ */
  function initWordCycle() {
    if (reduceMotion) return;
    var roots = document.querySelectorAll('[data-word-cycle]');
    if (!roots.length) return;

    var HOLD = 2600;   // time each word is legible
    var FADE = 400;    // must match the CSS transition

    Array.prototype.forEach.call(roots, function (root) {
      var words = root.querySelectorAll('.word-cycle__word');
      if (words.length < 2) return;
      var i = 0;

      setInterval(function () {
        // Don't burn cycles (or desync) while the tab is in the background.
        if (document.hidden) return;

        var outgoing = words[i];
        outgoing.classList.remove('is-in');
        outgoing.classList.add('is-out');

        i = (i + 1) % words.length;
        words[i].classList.remove('is-out');
        words[i].classList.add('is-in');

        // Reset the outgoing word to the "waiting below" state once it's
        // invisible, so it rises into place again on its next turn.
        setTimeout(function () { outgoing.classList.remove('is-out'); }, FADE);
      }, HOLD);
    });
  }


  /* ------------------------------------------------------------------------
     Image lightbox
     Case study figures and phone screenshots are displayed small so the page
     stays readable, which makes their detail hard to see. Clicking one opens
     it as large as the viewport allows; where the file holds more detail
     still, a second click shows it at full size and the stage scrolls.
     Escape, the close button, or a click outside the image all dismiss it
     and return the reader to exactly where they were.

     Only images whose source is meaningfully larger than the size they are
     displayed at become clickable -- opening a lightbox that renders an
     image smaller than the thumbnail would be a worse experience, not a
     better one.
     ------------------------------------------------------------------------ */
  function initLightbox() {
    var GAIN = 1.25; // only offer the zoom when it can show ~25% more detail
    var thumbs = Array.prototype.slice.call(
      document.querySelectorAll('main .figure img, main .phone__screen img')
    );
    if (!thumbs.length) return;

    var lb, stage, img, cap, closeBtn;
    var lastFocus = null, currentThumb = null, savedScroll = 0, isActual = false;

    /* -- eligibility ------------------------------------------------------ */

    function shownWidth(el) {
      var cs = window.getComputedStyle(el);
      return el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    }

    function evaluate(thumb) {
      if (!thumb.complete || !thumb.naturalWidth) return; // re-checked on load
      var worth = thumb.naturalWidth > shownWidth(thumb) * GAIN;
      var host = thumb.closest('.phone__screen') || thumb.closest('.figure');
      thumb.classList.toggle('is-zoomable', worth);
      if (host) host.classList.toggle('has-zoom', worth);
      if (worth) {
        thumb.tabIndex = 0;
        thumb.setAttribute('role', 'button');
        var label = thumb.getAttribute('alt');
        thumb.setAttribute('aria-label', label ? 'View larger: ' + label : 'View larger image');
      } else {
        thumb.removeAttribute('tabindex');
        thumb.removeAttribute('role');
        thumb.removeAttribute('aria-label');
      }
    }

    /* -- scroll lock ------------------------------------------------------
       Plain overflow:hidden on the root drops the scroll position, so the
       body is pinned at its current offset instead and released on close. */

    function lock() {
      var de = document.documentElement;
      savedScroll = window.scrollY || de.scrollTop || 0;
      de.style.setProperty('--sbw', (window.innerWidth - de.clientWidth) + 'px');
      de.style.setProperty('--lb-top', (-savedScroll) + 'px');
      de.classList.add('lb-open');
    }

    function unlock() {
      var de = document.documentElement;
      // The site scrolls smoothly, which would animate this restore and let
      // the focus() below race it. Put the jump back instantly.
      var prev = de.style.scrollBehavior;
      de.style.scrollBehavior = 'auto';
      de.classList.remove('lb-open');
      de.style.removeProperty('--lb-top');
      de.style.removeProperty('--sbw');
      window.scrollTo(0, savedScroll);
      de.style.scrollBehavior = prev;
    }

    /* -- the overlay ------------------------------------------------------ */

    function build() {
      lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.setAttribute('aria-label', 'Enlarged image');
      lb.innerHTML =
        '<div class="lightbox__top">' +
          '<button type="button" class="lightbox__close" aria-label="Close image">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
            ' stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="lightbox__stage"><img class="lightbox__img" alt=""></div>' +
        '<p class="lightbox__cap"></p>';
      document.body.appendChild(lb);

      stage = lb.querySelector('.lightbox__stage');
      img = lb.querySelector('.lightbox__img');
      cap = lb.querySelector('.lightbox__cap');
      closeBtn = lb.querySelector('.lightbox__close');

      closeBtn.addEventListener('click', close);
      lb.addEventListener('click', close); // anywhere off the image dismisses
      img.addEventListener('click', function (e) { e.stopPropagation(); toggleActual(); });
      img.addEventListener('load', measure);
    }

    /* Offer the full-size step only when the fitted view is still showing
       the reader less than the file holds. */
    function measure() {
      var fits = img.naturalWidth <= img.clientWidth + 1 &&
                 img.naturalHeight <= img.clientHeight + 1;
      lb.classList.toggle('can-zoom', !fits);
      img.tabIndex = fits ? -1 : 0;
      var hint = cap.querySelector('.lightbox__hint');
      if (hint) hint.textContent = fits ? '' : 'Click the image to view it at full size';

      /* On a narrow screen the fitted view can be barely bigger than the
         thumbnail it came from, which makes the first tap feel like nothing
         happened. Go straight to full size in that case. */
      if (!fits && !isActual && currentThumb) {
        var tw = currentThumb.getBoundingClientRect().width;
        if (tw && img.getBoundingClientRect().width < tw * 1.25) toggleActual();
      }
    }

    function toggleActual() {
      if (!isActual && !lb.classList.contains('can-zoom')) return;
      isActual = !isActual;
      lb.classList.toggle('is-actual', isActual);
      if (isActual) {
        stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
        stage.scrollTop = 0;
      }
    }

    function open(thumb) {
      if (!lb) build();
      lastFocus = thumb;
      currentThumb = thumb;
      isActual = false;
      lb.classList.remove('is-actual');

      var figure = thumb.closest('figure');
      var fc = figure ? figure.querySelector('figcaption') : null;
      cap.innerHTML = (fc ? fc.innerHTML : (thumb.getAttribute('alt') || '')) +
                      '<span class="lightbox__hint"></span>';

      img.alt = thumb.getAttribute('alt') || '';
      img.src = thumb.currentSrc || thumb.src;

      lock();
      lb.classList.add('is-open');
      if (img.complete) measure();
      closeBtn.focus({ preventScroll: true });
    }

    function close() {
      if (!lb || !lb.classList.contains('is-open')) return;
      lb.classList.remove('is-open', 'is-actual');
      isActual = false;
      currentThumb = null;
      unlock();
      if (lastFocus) { lastFocus.focus({ preventScroll: true }); lastFocus = null; }
    }

    document.addEventListener('keydown', function (e) {
      if (!lb || !lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      // At most two focusable stops, so cycle by hand rather than scan the tree.
      var stops = [closeBtn];
      if (img.tabIndex === 0) stops.push(img);
      var i = stops.indexOf(document.activeElement);
      var next = e.shiftKey ? i - 1 : i + 1;
      if (i === -1 || next < 0 || next >= stops.length) {
        e.preventDefault();
        stops[e.shiftKey ? stops.length - 1 : 0].focus();
      }
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('load', function () { evaluate(thumb); });
      thumb.addEventListener('click', function () {
        if (thumb.classList.contains('is-zoomable')) open(thumb);
      });
      thumb.addEventListener('keydown', function (e) {
        if (!thumb.classList.contains('is-zoomable')) return;
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          open(thumb);
        }
      });
      evaluate(thumb);
    });

    // Column widths change with the viewport, so eligibility can change too.
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () { thumbs.forEach(evaluate); }, 200);
    });
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  function boot() {
    initWordCycle();
    initNav();
    initHeader();
    initReveal();
    initProgress();
    initToc();
    initLightbox();
    Array.prototype.forEach.call(document.querySelectorAll('[data-carousel]'), initCarousel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
