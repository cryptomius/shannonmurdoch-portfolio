(function () {
  const container = document.querySelector('.slideshow-container');
  if (!container) return;

  const slides = Array.from(container.querySelectorAll('.slide'));
  const dots = Array.from(document.querySelectorAll('.slide-dots .dot'));
  const prevBtn = container.querySelector('.slide-prev');
  const nextBtn = container.querySelector('.slide-next');
  const interval = 5000;
  let currentIndex = 0;
  let autoTimer = null;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === currentIndex));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
  }

  function next() { showSlide(currentIndex + 1); }
  function prev() { showSlide(currentIndex - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, interval);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function resetAuto() {
    stopAuto();
    startAuto();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { showSlide(i); resetAuto(); });
  });

  container.addEventListener('mouseenter', stopAuto);
  container.addEventListener('mouseleave', startAuto);
  container.addEventListener('focusin', stopAuto);
  container.addEventListener('focusout', startAuto);

  document.addEventListener('keydown', (event) => {
    if (event.target.closest('input, textarea')) return;
    if (event.key === 'ArrowLeft') { prev(); resetAuto(); }
    if (event.key === 'ArrowRight') { next(); resetAuto(); }
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduceMotion.matches) {
    startAuto();
  }
})();
