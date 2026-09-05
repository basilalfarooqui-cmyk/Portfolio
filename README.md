# Portfolio — Basil Al Farooqui

Single-page portfolio. Plain HTML, CSS and vanilla JavaScript — no build step, no
dependencies to install. Open `index.html` in a browser and it runs.

**Live:** https://basilalfarooqui-cmyk.github.io/Portfolio/

## Stack

- Plain HTML / CSS / vanilla JS
- [GSAP](https://gsap.com) + ScrollTrigger + MotionPathPlugin via CDN, for the two
  scroll-linked sequences
- Google Fonts: Instrument Serif (display), Archivo (body), JetBrains Mono (technical labels)

## The two scroll sequences

Both are bound to scroll position with ScrollTrigger's `scrub` — neither autoplays.

1. **ID card drop** — a badge falls from above the viewport, rotating from back-facing
   to front through a real 3D `rotateY`, fading in as it travels, and settling with a
   bounce. Scroll control returns to the browser once it lands.
2. **Paper rocket timeline** — an inline SVG paper plane flies a curved path, nose
   following the tangent, with three timeline entries fading in as it reaches each point.

Under `prefers-reduced-motion: reduce`, both drop to their final states and the
scroll-linked motion is not created at all.

## Adding photos

Drop these into `assets/images/`, using exactly these filenames:

| File | Used by |
|---|---|
| `profile-photo.jpg` | ID card + About section |
| `project-hora.jpg` | HORA project row |
| `project-smart-home.jpg` | Smart Home project row |
| `project-rc-car.jpg` | Bluetooth RC Car project row |
| `favicon.png` | Browser tab icon |

Until a file exists, its frame renders as a clean tinted placeholder rather than a
broken-image icon, so the page never looks broken.

## Structure

```
index.html    markup, inline SVG paper rocket
style.css     design tokens, layout, responsive, reduced-motion
script.js     ScrollTrigger sequences, tilt, accordion, contact stub
```
