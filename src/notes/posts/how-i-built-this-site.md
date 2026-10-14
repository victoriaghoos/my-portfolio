---
title: How I built this site
date: 2026-10-14
type: site
location: victoriaghoos.com
excerpt: A hand-built React and Three.js portfolio with a procedural night sky, a 3D navigation hub and no template or CMS in sight.
draft: false
---

This site is built from scratch. There's no template, CMS or site builder behind it: the intro, the night sky, the 3D hub and every portfolio section are my own code. I wanted a portfolio that would also be my strongest front-end project, so the site itself is the demo.

## The stack

- **React 18 + TypeScript**, bundled with **Vite**, as a single-page app with React Router
- **Three.js** through **React Three Fiber** and **Drei** for the 3D scenes
- The **Canvas 2D API** for the procedural backgrounds
- **Framer Motion** for transitions, **SCSS** for styling (one stylesheet per section)
- **i18next** for switching between English, Dutch, French and Japanese at runtime
- **Vitest** and **React Testing Library** for tests, **Oxlint** and **Prettier** for linting and formatting
- **GitHub Actions** runs lint, type checking, the format check, the tests and a production build on every push and pull request
- **Netlify** hosts it on my own domain, victoriaghoos.com

## The intro

The site opens with a short video and a typewriter greeting. Once the typing loop finishes, a CSS overlay animation hands over to the main page. You can skip it with a button or the Escape key. A flag in `sessionStorage` makes sure you only see it once per visit. With `prefers-reduced-motion` turned on, the video is replaced by a still image and the intro exits after a couple of seconds. Every exit path has a failsafe timer, so the page can't get stuck if an animation event never fires.

## The night sky

The background of the main page is drawn from scratch on a canvas every frame:

- **Nebula.** Fractal Perlin noise (fBm, four octaves) mapped onto a colour ramp. Computing noise per pixel per frame is far too slow, so I bake it once into a half-resolution offscreen canvas and only drift that texture slowly across the screen.
- **Stars.** Three depth layers with different sizes, brightness and parallax, plus a tilted "galactic band" with its own denser star scatter. Star colours are weighted the way real skies look: mostly white and blue-white, with the occasional warm one.
- **Extras.** Two aurora curtains, random shooting stars, a vignette, and a cheap bloom pass: I copy the frame into a canvas a third of the size, blur it and blend it back on top.
- **Shockwave.** Click on empty space and a shockwave ripples out. Stars near the wavefront get pushed away and spring back to their original positions with damped velocity.

The loop is capped at 30 fps and stops entirely as soon as the section scrolls out of view.

## The 3D navigation hub

On desktop, the navigation is a WebGL scene: five panels orbit a central hologram of my avatar.

- **Rotation.** You can drag to rotate the ring. The drag direction flips depending on whether you grab the front or the back half, so the panels always follow your cursor. The opening spin decays with a frame-rate-independent factor, so it feels the same at 60 Hz and 144 Hz.
- **Video on hover.** Hovering a panel swaps its icon for a looping video texture. The video doesn't load until you hover, and the texture only updates while it's actually visible.
- **Labels.** Each label is raycast against the hologram's plane every frame, so it hides when its panel passes behind the hologram.
- **Constellations.** Every panel lights up a constellation drawn in particles: a cat, a book, a flower, a camera and a headset. I made these with a small Node script that parses an SVG with Three's `SVGLoader`, samples points along its paths and writes them to JSON. In the scene they are rendered as a single `THREE.Points` object with additive blending.

On touch devices and small screens, the 3D hub is replaced by a plain menu grid. Dragging a 3D ring with your thumb is a worse experience than just tapping a button.

## The sections

Each section below the hub has its own look, but they share the same night sky so they read as one site.

- **About.** A floating "hologram" avatar with orbit rings.
- **Skills.** A sakura scene with falling petals.
- **Projects.** Cards styled like a lo-fi music player, with an animated audio visualiser.
- **Resume.** A flipbook you can page through.
- **Contact.** Clouds rendered in WebGL.

All the twinkling star fields run through one custom hook, `useCanvasAnimationLoop`. It handles device pixel ratio, resizing, an `IntersectionObserver` that pauses the loop off-screen, and `prefers-reduced-motion`, where it draws a single static frame instead of animating.

## Performance

A page this heavy on animation gets slow fast, and mine did. Some of what fixed it:

- **Vite migration.** Moving from Create React App to Vite took the dev server cold start from 30–60 seconds down to under half a second.
- **Point clouds.** The constellations started out as 55.2 MB of JSON. A downsampling script brought them to 1.7 MB with no visible difference.
- **Assets.** I compressed the screenshots to WebP, replaced Google Fonts with self-hosted `@fontsource` packages, and self-hosted the 3D environment map and the cloud texture.
- **Lazy loading.** Every section is code-split and lazy-loaded, and the panel videos and background music use `preload="none"`.
- **Pausing.** WebGL scenes switch to `frameloop="never"` when they're off-screen, and canvas loops pause the same way.
- **Caching.** Hashed build assets are served with immutable cache headers.

Altogether, this took the desktop Lighthouse score from 25 to 85.

## Accessibility

Because so much of the page moves, `prefers-reduced-motion` is respected everywhere: the intro, the canvas loops, the petals and the floating effects. Controls are real buttons with ARIA labels and can be reached with the keyboard, and the background music only plays when you turn it on, never on its own.

## Hosting and domain

I bought victoriaghoos.com through Namecheap and pointed it to Netlify, which hosts the production build and handles HTTPS. Since this is a single-page app, one redirect rule sends every route to `index.html`, so a link like this page works when you open it directly.
