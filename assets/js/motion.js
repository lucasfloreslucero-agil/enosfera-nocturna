/* Movimiento: Lenis + GSAP (ScrollTrigger y SplitText), siguiendo la guía "Landing Twin".
   Sin JavaScript o con "reducir movimiento", la página se ve completa y estática. */
(function () {
  'use strict';

  var root = document.documentElement;
  var nav = document.getElementById('nav');
  var modal = document.getElementById('modal');
  var lenis = null;

  /* ---------- Navbar: se esconde al bajar y vuelve al subir ---------- */
  var lastY = window.scrollY;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (Math.abs(y - lastY) < 4) return;
    nav.classList.toggle('is-hidden', y > lastY && y > 120);
    lastY = y;
  }, { passive: true });

  /* ---------- Anclas internas con scroll suave ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    var target = id.length > 1 && document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else target.scrollIntoView();
    history.replaceState(null, '', id);
  });

  /* ---------- Con el modal abierto, el fondo no se mueve ---------- */
  if (modal) {
    new MutationObserver(function () {
      if (!lenis) return;
      if (modal.open) lenis.stop(); else lenis.start();
    }).observe(modal, { attributes: true, attributeFilter: ['open'] });
  }

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  var mm = gsap.matchMedia();

  mm.add({
    motion: '(prefers-reduced-motion: no-preference)',
    wide: '(min-width: 992px)'
  }, function (ctx) {
    if (!ctx.conditions.motion) return;
    var wide = ctx.conditions.wide;

    root.classList.add('has-motion');
    if (wide) root.classList.add('has-pin');

    /* Smooth scroll sincronizado con ScrollTrigger */
    if (window.Lenis) {
      lenis = new Lenis({ lerp: 0.1 });
      window.enosferaLenis = lenis; // para depurar desde la consola
      lenis.on('scroll', ScrollTrigger.update);
      var raf = function (t) { lenis.raf(t * 1000); };
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    /* Hero: título por líneas con máscara, luego el resto */
    var h1 = document.querySelector('.hero-title__h1');
    if (window.SplitText && h1) {
      SplitText.create(h1, {
        type: 'lines', mask: 'lines', linesClass: 'h1-line', autoSplit: true,
        onSplit: function (self) {
          h1.classList.add('is-split');
          return gsap.from(self.lines, { yPercent: 100, duration: 1.1, ease: 'power3.out', stagger: 0.08 });
        }
      });
    }
    gsap.from('.hero .eyebrow', { opacity: 0, y: 16, duration: 0.8, ease: 'power2.out' });
    gsap.from('.hero__fade:not(.eyebrow)', { opacity: 0, y: 16, duration: 0.8, ease: 'power2.out', stagger: 0.1, delay: 0.3 });
    gsap.from('.hero__media', { opacity: 0, y: 48, duration: 1.4, ease: 'power3.out', delay: 0.45 });

    /* Reveal al entrar: se repite cada vez que el bloque vuelve a entrar desde abajo */
    gsap.set('[data-reveal]', { opacity: 0, y: 24 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%',
      onEnter: function (els) {
        gsap.fromTo(els, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.08, overwrite: true });
      }
    });

    /* Diagrama: las líneas naranjas se dibujan con el scroll */
    if (wide) {
      document.querySelectorAll('.diagram__lines path').forEach(function (p) {
        var len = p.getTotalLength();
        gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, {
          strokeDashoffset: 0, ease: 'none',
          scrollTrigger: { trigger: '#diagram', start: 'top 75%', end: 'top 30%', scrub: 0.8 }
        });
      });
    }

    /* Cómo funciona: lista sticky con imágenes en crossfade (scrub 0.8, fases superpuestas) */
    if (wide) {
      var imgs = gsap.utils.toArray('.built__img');
      var items = gsap.utils.toArray('.built__item');
      gsap.set(imgs, { opacity: function (i) { return i ? 0 : 1; }, x: function (i) { return i ? 20 : 0; } });
      var active = 0;
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.built', start: 'top top', end: '90% 90%', scrub: 0.8,
          onUpdate: function (self) {
            var i = self.progress < 0.31 ? 0 : self.progress < 0.68 ? 1 : 2;
            if (i === active) return;
            active = i;
            items.forEach(function (it, n) { it.classList.toggle('is-active', n === i); });
          }
        }
      });
      tl.to(imgs[0], { opacity: 0, x: 20, ease: 'none', duration: 0.05 }, 0.28)
        .fromTo(imgs[1], { opacity: 0, x: 20 }, { opacity: 1, x: 0, ease: 'none', duration: 0.05 }, 0.28)
        .to(imgs[1], { opacity: 0, x: 20, ease: 'none', duration: 0.04 }, 0.66)
        .fromTo(imgs[2], { opacity: 0, x: 20 }, { opacity: 1, x: 0, ease: 'none', duration: 0.04 }, 0.66)
        .to({}, { duration: 0.3 }, 0.7);
    }

    /* Story: el fondo pasa de gris claro a negro y las frases se suceden con blur */
    var blocks = gsap.utils.toArray('.story__block');
    gsap.set(blocks.slice(1), { opacity: 0, filter: 'blur(8px)' });
    var st = gsap.timeline({ scrollTrigger: { trigger: '.story', start: 'top top', end: 'bottom bottom', scrub: 2 } });
    st.to('.story', { backgroundColor: '#000000', ease: 'none', duration: 3 }, 0.6)
      .to(blocks[0], { opacity: 0, filter: 'blur(8px)', ease: 'sine.in', duration: 1.2 }, 2.2)
      .to(blocks[1], { opacity: 1, filter: 'blur(0px)', ease: 'power1.inOut', duration: 1.2 }, 3.3)
      .to(blocks[1], { opacity: 0, filter: 'blur(8px)', ease: 'sine.in', duration: 1 }, 5.3)
      .to(blocks[2], { opacity: 1, filter: 'blur(0px)', ease: 'power1.inOut', duration: 1.2 }, 6.2)
      .to(blocks[2], { opacity: 0, filter: 'blur(8px)', ease: 'sine.in', duration: 1 }, 8.2)
      .to(blocks[3], { opacity: 1, filter: 'blur(0px)', ease: 'power1.inOut', duration: 1.2 }, 9.1)
      .to({}, { duration: 1 }, 10.3);

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });

    return function () {
      root.classList.remove('has-motion', 'has-pin');
      if (lenis) { lenis.destroy(); lenis = null; }
    };
  });
})();
