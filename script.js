/* ============================================================
   Basil Farooqui — portfolio
   All scroll-linked motion is GSAP ScrollTrigger with `scrub`,
   so every sequence tracks scroll position directly. Nothing
   autoplays. ScrollTriggers are created top-to-bottom in page
   order so refresh() recalculates them in the right sequence.
   ============================================================ */

(function () {
  'use strict';

  var hasGSAP = typeof window.gsap !== 'undefined' &&
                typeof window.ScrollTrigger !== 'undefined';

  /* If the CDN is unreachable, the page still renders fully —
     nothing is hidden by CSS, only by JS. Bail out quietly. */
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    if (typeof window.MotionPathPlugin !== 'undefined') {
      gsap.registerPlugin(MotionPathPlugin);
    }
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ==========================================================
     SCROLL-LINKED SEQUENCES
     Created inside matchMedia so they are built (and reverted)
     according to viewport + motion preference.
     ========================================================== */
  if (hasGSAP) {
    var mm = gsap.matchMedia();

    /* ---------- 1 & 2: hero fade + ID card drop ---------- */
    mm.add('(prefers-reduced-motion: no-preference)', function () {

      /* -- 1. HERO: fades out as scrolling begins, tied to progress -- */
      gsap.to('.hero__inner', {
        opacity: 0,
        y: -46,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom 45%',
          scrub: true
        }
      });

      gsap.to('.hero__scroll', {
        opacity: 0,
        y: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom 80%',
          scrub: true
        }
      });

      /* -- 2. ID CARD DROP — the signature moment --
         The stage is pinned; the card (a child) is what animates,
         never the pinned element itself. Falls, flips from
         back-facing to front-facing through a real 3D rotateY,
         fades in, then settles with a bounce rather than a hard stop. */
      var cardTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#idcard',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          pin: '.idcard__stage',
          pinSpacing: false,
          anticipatePin: 1
        }
      });

      cardTl
        .fromTo('#idCard',
          {
            yPercent: -148,
            rotationY: 180,
            rotationZ: -9,
            autoAlpha: 0
          },
          {
            yPercent: 8,
            rotationY: 0,
            rotationZ: 0,
            autoAlpha: 1,
            duration: 0.82,
            /* linear travel: an eased-in fall would keep the card
               off-screen for most of the section and the user would
               scroll a long way seeing nothing */
            ease: 'none'
          })
        /* slight overshoot correction — reads as it settling into place */
        .to('#idCard', {
          yPercent: 0,
          duration: 0.18,
          ease: 'bounce.out'
        });
    });


    /* ---------- 3: paper rocket timeline (desktop) ----------
       Below 760px the flight path is hidden by CSS and the stops
       become a plain vertical list, so no trigger is built there. */
    mm.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', function () {

      var rocket = document.getElementById('rocket');
      var drawn  = document.getElementById('flightPathDrawn');
      var stops  = gsap.utils.toArray('[data-stop]');

      if (!rocket || !drawn) return;

      gsap.set(stops, { autoAlpha: 0, y: 18, scale: 0.97 });

      var journeyTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#journey',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          pin: '.journey__stage',
          pinSpacing: false,
          anticipatePin: 1
        }
      });

      /* rocket flies the curve, nose following the tangent */
      if (typeof window.MotionPathPlugin !== 'undefined') {
        journeyTl.to(rocket, {
          motionPath: {
            path: '#flightPath',
            align: '#flightPath',
            alignOrigin: [0.5, 0.5],
            autoRotate: true
          },
          ease: 'none',
          duration: 1
        }, 0);
      } else {
        /* plugin unavailable — still travel the section, just linearly */
        journeyTl.fromTo(rocket,
          { xPercent: 0, yPercent: 0, x: '8%', y: '2%' },
          { x: '88%', y: '92%', ease: 'none', duration: 1 }, 0);
      }

      /* accent trail draws itself in behind the rocket */
      var len = drawn.getTotalLength ? drawn.getTotalLength() : 0;
      if (len) {
        gsap.set(drawn, { strokeDasharray: len, strokeDashoffset: len });
        journeyTl.to(drawn, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0);
      }

      /* each entry appears as the rocket reaches its point on the path */
      var marks = [0.15, 0.45, 0.75];
      stops.forEach(function (el, i) {
        journeyTl.to(el, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.13,
          ease: 'power2.out'
        }, marks[i]);
      });
    });
  }


  /* ==========================================================
     SKILLS — cursor tilt, desktop pointers only
     ========================================================== */
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (hasGSAP && finePointer && !reduced) {
    gsap.utils.toArray('[data-tilt]').forEach(function (col) {
      var MAX = 5; /* degrees — restrained, this is not the loud moment */

      col.addEventListener('mousemove', function (e) {
        var r  = col.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width  - 0.5;
        var py = (e.clientY - r.top)  / r.height - 0.5;

        gsap.to(col, {
          rotateY: px * MAX * 2,
          rotateX: -py * MAX * 2,
          y: -4,
          duration: 0.45,
          ease: 'power2.out',
          transformPerspective: 900,
          overwrite: 'auto'
        });
      });

      col.addEventListener('mouseleave', function () {
        gsap.to(col, {
          rotateX: 0,
          rotateY: 0,
          y: 0,
          duration: 0.55,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      });
    });
  }


  /* ==========================================================
     PROJECTS — expandable problem / process / outcome
     ========================================================== */
  document.querySelectorAll('.proj__head').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;

    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));

      /* no animation when motion is reduced or GSAP is unavailable */
      if (!hasGSAP || reduced) {
        panel.hidden = isOpen;
        return;
      }

      if (isOpen) {
        gsap.to(panel, {
          height: 0,
          opacity: 0,
          duration: 0.32,
          ease: 'power2.in',
          onComplete: function () {
            panel.hidden = true;
            panel.style.height = '';
            panel.style.opacity = '';
            ScrollTrigger.refresh();
          }
        });
      } else {
        panel.hidden = false;
        gsap.fromTo(panel,
          { height: 0, opacity: 0 },
          {
            height: 'auto',
            opacity: 1,
            duration: 0.44,
            ease: 'power2.out',
            onComplete: function () {
              panel.style.height = 'auto';
              ScrollTrigger.refresh();
            }
          });
      }
    });
  });


  /* ==========================================================
     CONTACT — behaviour intentionally not wired up yet
     ========================================================== */
  function handleConnect() {
    // TODO: wire up contact method once decided
  }

  var connectBtn  = document.getElementById('connectBtn');
  var contactNote = document.getElementById('contactNote');

  if (connectBtn && contactNote) {
    var noteTimer;

    connectBtn.addEventListener('click', function () {
      handleConnect();

      contactNote.textContent = 'Coming soon';
      contactNote.classList.add('is-shown');

      clearTimeout(noteTimer);
      noteTimer = setTimeout(function () {
        contactNote.classList.remove('is-shown');
      }, 2600);
    });
  }


  /* ==========================================================
     Recalculate trigger positions once late-loading things
     (fonts, images) have changed the layout.
     ========================================================== */
  if (hasGSAP) {
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }

    /* broken/late images shift layout too — images are dropped in later */
    document.querySelectorAll('img').forEach(function (img) {
      if (img.complete) return;
      img.addEventListener('load',  function () { ScrollTrigger.refresh(); });
      img.addEventListener('error', function () { ScrollTrigger.refresh(); });
    });
  }


  /* ==========================================================
     Photos get dropped into assets/images/ later. Until they
     exist, hide the broken-image glyph so the tinted container
     reads as a deliberate empty frame instead of a broken page.
     ========================================================== */
  document.querySelectorAll('img').forEach(function (img) {
    function markMissing() { img.style.opacity = '0'; }
    function markPresent() { img.style.opacity = ''; }

    if (img.complete) {
      if (!img.naturalWidth) markMissing();
    } else {
      img.addEventListener('error', markMissing);
      img.addEventListener('load', markPresent);
    }
  });

})();
