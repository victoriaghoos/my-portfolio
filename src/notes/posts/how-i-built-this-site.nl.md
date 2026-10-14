---
title: Hoe ik deze site bouwde
date: 2026-10-14
type: site
location: victoriaghoos.com
excerpt: Een volledig zelfgebouwd portfolio in React en Three.js, met een procedurele sterrenhemel, een 3D-navigatiehub en geen template of CMS.
draft: false
---

Deze site is volledig zelf gebouwd. Er zit geen template, CMS of sitebuilder achter: de intro, de sterrenhemel, de 3D-hub en alle portfoliosecties zijn mijn eigen code. Ik wilde een portfolio dat meteen ook mijn sterkste front-endproject zou zijn, dus de site is zelf de demo.

## De stack

- **React 18 + TypeScript**, gebundeld met **Vite**, als single-page app met React Router
- **Three.js** via **React Three Fiber** en **Drei** voor de 3D-scènes
- De **Canvas 2D API** voor de procedurele achtergronden
- **Framer Motion** voor transities, **SCSS** voor de styling (één stylesheet per sectie)
- **i18next** om tijdens het gebruik te wisselen tussen Engels, Nederlands, Frans en Japans
- **Vitest** en **React Testing Library** voor tests, **Oxlint** en **Prettier** voor linting en formattering
- **GitHub Actions** voert bij elke push en pull request linting, typechecking, de formatcheck, de tests en een productiebuild uit
- **Netlify** host de site op mijn eigen domein, victoriaghoos.com

## De intro

De site opent met een korte video en een begroeting die zichzelf uittypt. Zodra die klaar is, neemt een CSS-overlayanimatie het over naar de hoofdpagina. Je kunt de intro overslaan met een knop of met de Escape-toets. Een vlag in `sessionStorage` zorgt ervoor dat je hem maar één keer per bezoek ziet. Met `prefers-reduced-motion` aan wordt de video vervangen door een stilstaand beeld en sluit de intro na een paar seconden. Elke manier om de intro te verlaten heeft een failsafe-timer, zodat de pagina nooit vastloopt als een animatie-event niet afgaat.

## De sterrenhemel

De achtergrond van de hoofdpagina wordt elke frame van nul getekend op een canvas:

- **Nevel.** Fractale Perlin-noise (fBm, vier octaven) op een kleurverloop. Noise per pixel per frame berekenen is veel te traag, dus ik bak het één keer in een offscreen canvas op halve resolutie en laat die textuur daarna langzaam over het scherm drijven.
- **Sterren.** Drie dieptelagen met verschillende grootte, helderheid en parallax, plus een schuine "melkwegband" met een eigen, dichtere sterrenstrooiing. De kleuren zijn gewogen zoals een echte sterrenhemel: vooral wit en blauwwit, af en toe een warme ster.
- **Extra's.** Twee poollichtgordijnen, willekeurige vallende sterren, een vignet en een goedkope bloom-pass: ik kopieer de frame naar een canvas van een derde van de grootte, blur die en blend hem terug bovenop het beeld.
- **Schokgolf.** Klik op een lege plek en er rimpelt een schokgolf naar buiten. Sterren bij het golffront worden weggeduwd en veren met gedempte snelheid terug naar hun oorspronkelijke plek.

De loop is begrensd op 30 fps en stopt volledig zodra de sectie uit beeld scrolt.

## De 3D-navigatiehub

Op desktop is de navigatie een WebGL-scène: vijf panelen draaien rond een centraal hologram van mijn avatar.

- **Rotatie.** Je kunt de ring rondslepen. De sleeprichting keert om naargelang je de voor- of achterkant vastpakt, zodat de panelen altijd je cursor volgen. De openingsdraai remt af met een factor die onafhankelijk is van de framerate, waardoor hij op 60 Hz en 144 Hz hetzelfde aanvoelt.
- **Video bij hover.** Als je over een paneel hovert, wordt het icoon vervangen door een videotextuur die in een lus speelt. De video laadt pas als je hovert, en de textuur wordt alleen bijgewerkt zolang ze echt zichtbaar is.
- **Labels.** Elke frame wordt er voor elk label een ray gecast naar het vlak van het hologram, zodat het label verdwijnt wanneer het paneel achter het hologram doorschuift.
- **Sterrenbeelden.** Elk paneel licht een sterrenbeeld van deeltjes op: een kat, een boek, een bloem, een camera en een headset. Die heb ik gemaakt met een klein Node-script dat een SVG inleest met de `SVGLoader` van Three, punten langs de paden samplet en ze naar JSON wegschrijft. In de scène worden ze weergegeven als één `THREE.Points`-object met additive blending.

Op touchtoestellen en kleine schermen wordt de 3D-hub vervangen door een gewoon menuraster. Een 3D-ring rondslepen met je duim is een slechtere ervaring dan gewoon op een knop tikken.

## De secties

Elke sectie onder de hub heeft een eigen uitstraling, maar ze delen dezelfde sterrenhemel zodat het één geheel blijft.

- **About.** Een zwevende "hologram"-avatar met baanringen.
- **Skills.** Een sakurascène met vallende bloesemblaadjes.
- **Projects.** Kaarten in de stijl van een lo-fi muziekspeler, met een geanimeerde audiovisualizer.
- **Resume.** Een flipboek dat je kunt doorbladeren.
- **Contact.** Wolken gerenderd in WebGL.

Alle twinkelende sterrenvelden draaien via één eigen hook, `useCanvasAnimationLoop`. Die regelt de device pixel ratio, het herschalen, een `IntersectionObserver` die de loop pauzeert buiten beeld, en `prefers-reduced-motion`, waarbij hij één statische frame tekent in plaats van te animeren.

## Performance

Een pagina met zoveel animatie wordt snel traag, en de mijne werd dat ook. Een deel van wat het oploste:

- **Migratie naar Vite.** De overstap van Create React App naar Vite bracht de cold start van de dev-server van 30 à 60 seconden naar minder dan een halve seconde.
- **Puntenwolken.** De sterrenbeelden begonnen als 55,2 MB aan JSON. Een downsamplingscript bracht dat terug naar 1,7 MB, zonder zichtbaar verschil.
- **Assets.** Ik heb de screenshots naar WebP gecomprimeerd, Google Fonts vervangen door zelf gehoste `@fontsource`-packages, en de 3D-environment map en de wolkentextuur zelf gehost.
- **Lazy loading.** Elke sectie is code-split en wordt lazy geladen, en de paneelvideo's en de achtergrondmuziek gebruiken `preload="none"`.
- **Pauzeren.** WebGL-scènes schakelen over naar `frameloop="never"` zodra ze uit beeld zijn, en de canvas-loops pauzeren op dezelfde manier.
- **Caching.** Gehashte build-assets worden geserveerd met immutable cache headers.

Samen brachten die de Lighthouse-score op desktop van 25 naar 85.

## Toegankelijkheid

Omdat er zoveel beweegt op de pagina, wordt `prefers-reduced-motion` overal gerespecteerd: in de intro, de canvas-loops, de bloesemblaadjes en de zweefeffecten. Bedieningselementen zijn echte knoppen met ARIA-labels en zijn bereikbaar met het toetsenbord, en de achtergrondmuziek speelt alleen als je ze zelf aanzet, nooit vanzelf.

## Hosting en domein

Ik heb victoriaghoos.com gekocht via Namecheap en het domein naar Netlify laten wijzen, dat de productiebuild host en HTTPS regelt. Omdat dit een single-page app is, stuurt één redirectregel elke route naar `index.html`, zodat een link zoals deze pagina ook werkt als je hem rechtstreeks opent.
