---
title: How I built this site
date: 2026-10-14
type: site
location: victoriaghoos.com
excerpt: A hand-built React and Three.js portfolio, no template or CMS — what's under the hood and why.
draft: true
---

<!--
  Verplichte post voor Professional Networking: hoe is de website tot stand gekomen?
  Dit is een eerste versie op basis van je README. Herschrijf gerust in je eigen woorden
  en vul de TODO's in. Zet draft op false zodra hij online mag.
-->

This portfolio is built from scratch: no template, no CMS, no site builder. I wanted a site that doubles as a project in its own right, so the stack is the same one I'd use for a real front-end application.

## The stack

- **React 18 + TypeScript**, bundled with **Vite**, as a single-page application with React Router.
- **Three.js** through **React Three Fiber** and **Drei** for the 3D scenes: the rotating cosmos hub you land on and the clouds in the contact section.
- **Canvas API** for everything 2D: the procedurally generated night sky (Perlin-noise nebula, parallax star layers), the light orbs and the twinkling stars.
- **Framer Motion** for transitions, and **SCSS** for styling, with one stylesheet per section.
- **i18next** for runtime language switching between English, Dutch, French and Japanese.

## Hosting and domain

The site is hosted on **Netlify**, which builds it automatically on every push to the main branch on GitHub. A single redirect rule sends every route to `index.html`, so client-side routes like this page work when you open them directly.

<!-- TODO: waar heb je victoriaghoos.com geregistreerd, en waarom die keuze? -->

## Quality and performance

A site full of animations can easily become slow, so a large part of the work went into keeping it fast:

- Canvas and WebGL loops only run while their section is on screen (IntersectionObserver + `requestAnimationFrame`).
- Every section is code-split and lazy-loaded, and I profiled the page for Core Web Vitals (LCP).
- The site respects `prefers-reduced-motion`, and the controls are keyboard-navigable with ARIA labels.
- **Vitest** and **React Testing Library** for tests, **Oxlint** and **Prettier** for linting and formatting, and a **GitHub Actions** pipeline that runs all of it on every push.

## These notes

The notes you're reading are plain Markdown files in the repository. Vite bundles them at build time, and a small parser reads the title, date and type from the top of each file. Writing a new post means adding one file, with no database and no admin panel.

## What I'd do differently

<!-- TODO: wat zou je nu anders doen? Wat was het moeilijkste? Wat heb je eraan geleerd? -->
