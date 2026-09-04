# ✨ Victoria’s Interactive Cosmos | Portfolio

Welcome to the repository for my interactive portfolio! This website showcases my skills, projects, and experience in an engaging and modern way.

## About the Portfolio

This portfolio is a React single-page application exploring time-based animation, particle systems, procedural rendering, and real-time 3D graphics in the browser. It combines React state and Framer Motion for eased, state-driven transitions; memoized pseudo-random particle fields animated through parametric keyframes; custom canvas effects including Perlin noise-driven nebula rendering, light orbs, and lightweight motion physics; and WebGL scenes built with React Three Fiber and Drei for clouds, stars, lighting, and fog. Styling is handled with responsive SCSS layering, while i18next powers runtime language switching across English, Dutch, French, and Japanese.

## 💡 About Me & Name Usage

- **Victoria Ghoos** is my current legal and preferred name, which I use on both academic/professional and personal projects.
- **Victoria Marinus** is my former legal name and may still appear on some older accounts or materials/posts.

Regardless of which name you come across, it's always **me** behind the work! 😊

## 🛠️ Technologies Used

- **Frontend:** React.js, TypeScript, SCSS
- **Animations:** Framer Motion
- **3D & Graphics:** Three.js, @react-three/fiber, @react-three/drei
- **Testing:** Vitest, React Testing Library
- **Tooling:** Oxlint, Prettier, TypeScript (`tsc --noEmit`), GitHub Actions CI
- **Hosting:** Netlify
- **Version Control:** Git & GitHub

## 🔗 Live Demo

Check out my portfolio live at: [victoriaghoos.com](https://victoriaghoos.com/)

## 🛠️ Setup & Installation

To run this project locally:

```bash
git clone https://github.com/victoriaghoos/my-portfolio.git
cd my-portfolio
npm install
npm run dev
```

Other available scripts:

```bash
npm run build
npm run test
npm run lint
npm run typecheck
npm run format
```

## 🌌 Main Features

- **Animated Landing Page:** React video with typewriter intro and a timed or skip-able transition, leading into the main 3D cosmos experience.
- **Interactive 3D Cosmos Navigation:** Once past the intro, a custom React Three Fiber scene featuring a rotating hologram-avatar hub, orbiting interactive panels with video-texture previews, and constellation reveals on hover with inertial drag rotation, click-triggered shockwave physics, and a procedurally generated night sky (Perlin-noise nebula, parallax star layers, galactic band, and bloom) built entirely with the Canvas API.
- **About Section:** Framer Motion–animated bio with hologram-style avatar and content for education, goals, and interests.
- **Skills Section:** Sakura‑themed skills galaxy built with React, Framer Motion, and SCSS, grouping languages, frameworks, backend, frontend, mobile/desktop, DevOps, and tooling.
- **Projects Section:** Lofi music-player–inspired cards using React, Framer Motion, and Lucide icons, with tech‑stack tags, internship/classified highlights, and an animated audio visualizer.
- **Resume Section:** Interactive React flipbook, letting visitors “page through” experience and education.
- **Socials Section:** 3D cloud-and-stars scene rendered with React Three Fiber and Drei, with animated sky and direct links to LinkedIn, GitHub, and email.
- **Internationalization:** i18next-powered multi-language UI (English, Dutch, French, Japanese).

## ⚡ Performance & Accessibility

- Visibility-gated animation loops (IntersectionObserver + rAF) so canvas/WebGL rendering pauses when scrolled out of view
- Respects `prefers-reduced-motion` throughout
- Code-split, lazy-loaded sections; profiled and optimized for Core Web Vitals (LCP)
- Keyboard-navigable controls with ARIA labeling

## 🏆 Sample Projects

- **BaseballLive** (Blazor, SignalR, C#): Real-time match updates using websockets. _(Solo project, 2024)_
- **Vrije Teid!** (Flutter, Dart, Firebase): Mobile app for community activity management. _(Group effort, 2024)_
- **Search Infrastructure** (OpenSearch, Docker): Large-scale data retrieval optimization. _(Internship, 2025, classified)_

## 🧑‍💻 Skills Overview

- **Programming Languages:** C#, Python, JavaScript, TypeScript, SQL, PHP
- **Backend Development:** .NET, ASP.NET MVC, Laravel, REST APIs, SignalR, OpenSearch, Node.js, EF Core, JWT
- **Frontend & UI Development:** React, Three.js, HTML, CSS, Tailwind CSS, Vue.js, SCSS, Blazor, .NET MAUI, WPF
- **DevOps & Infrastructure:** Docker, Kubernetes, Linux, Virtual Machines, CI/CD, Terraform, Azure
- **Tooling & Version Control:** Git, GitHub, GitLab, Postman, Swagger

## 📬 Contact & Socials

- [LinkedIn](https://www.linkedin.com/in/victoriaghoos/)
- [GitHub](https://github.com/victoriaghoos)
- [Email](mailto:ghoosvictoria@gmail.com)

---

> © 2026 Victoria Ghoos. All rights reserved.
