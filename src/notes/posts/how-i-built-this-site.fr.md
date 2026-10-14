---
title: Comment j’ai construit ce site
date: 2026-10-14
type: site
location: victoriaghoos.com
excerpt: Un portfolio fait main en React et Three.js, avec un ciel nocturne procédural, un hub de navigation en 3D et aucun template ni CMS.
draft: false
---

Ce site est construit de A à Z. Il n’y a ni template, ni CMS, ni constructeur de site derrière : l’intro, le ciel nocturne, le hub 3D et toutes les sections du portfolio sont mon propre code. Je voulais un portfolio qui soit aussi mon meilleur projet front-end, donc le site est lui-même la démo.

## La stack

- **React 18 + TypeScript**, bundlé avec **Vite**, en single-page app avec React Router
- **Three.js** via **React Three Fiber** et **Drei** pour les scènes 3D
- L’**API Canvas 2D** pour les arrière-plans procéduraux
- **Framer Motion** pour les transitions, **SCSS** pour le style (une feuille de style par section)
- **i18next** pour passer de l’anglais au néerlandais, au français ou au japonais à la volée
- **Vitest** et **React Testing Library** pour les tests, **Oxlint** et **Prettier** pour le linting et le formatage
- **GitHub Actions** lance le linting, la vérification des types, le contrôle du formatage, les tests et un build de production à chaque push et pull request
- **Netlify** héberge le site sur mon propre domaine, victoriaghoos.com

## L’intro

Le site s’ouvre sur une courte vidéo et un message de bienvenue qui s’écrit tout seul, comme à la machine à écrire. Une fois le texte terminé, une animation d’overlay en CSS fait la transition vers la page principale. On peut passer l’intro avec un bouton ou la touche Échap. Un indicateur dans le `sessionStorage` garantit qu’on ne la voit qu’une fois par visite. Avec `prefers-reduced-motion` activé, la vidéo est remplacée par une image fixe et l’intro se termine au bout de quelques secondes. Chaque façon de quitter l’intro a un minuteur de secours, pour que la page ne reste jamais bloquée si un événement d’animation ne se déclenche pas.

## Le ciel nocturne

L’arrière-plan de la page principale est entièrement redessiné sur un canvas à chaque frame :

- **Nébuleuse.** Du bruit de Perlin fractal (fBm, quatre octaves) appliqué à une rampe de couleurs. Calculer le bruit pixel par pixel à chaque frame serait beaucoup trop lent : je le précalcule donc une seule fois dans un canvas hors écran à demi-résolution, puis je fais simplement dériver cette texture lentement à l’écran.
- **Étoiles.** Trois couches de profondeur avec des tailles, des luminosités et une parallaxe différentes, plus une « bande galactique » inclinée avec sa propre dispersion d’étoiles, plus dense. Les couleurs sont pondérées comme dans un vrai ciel : surtout du blanc et du blanc bleuté, avec de temps en temps une étoile plus chaude.
- **Extras.** Deux rideaux d’aurore boréale, des étoiles filantes aléatoires, un vignettage et un effet de bloom peu coûteux : je copie la frame dans un canvas trois fois plus petit, je la floute, puis je la superpose à l’image.
- **Onde de choc.** Un clic dans le vide déclenche une onde de choc. Les étoiles proches du front d’onde sont repoussées, puis reviennent à leur position d’origine comme un ressort amorti.

La boucle est limitée à 30 fps et s’arrête complètement dès que la section sort de l’écran.

## Le hub de navigation en 3D

Sur desktop, la navigation est une scène WebGL : cinq panneaux tournent autour d’un hologramme central de mon avatar.

- **Rotation.** On peut faire tourner l’anneau en le faisant glisser. Le sens du glissement s’inverse selon qu’on attrape la moitié avant ou arrière, pour que les panneaux suivent toujours le curseur. La rotation d’ouverture ralentit avec un facteur indépendant du framerate, si bien qu’elle donne la même impression à 60 Hz qu’à 144 Hz.
- **Vidéo au survol.** Au survol d’un panneau, son icône est remplacée par une texture vidéo en boucle. La vidéo n’est chargée qu’au survol, et la texture n’est mise à jour que lorsqu’elle est réellement visible.
- **Étiquettes.** À chaque frame, un rayon est lancé de chaque étiquette vers le plan de l’hologramme, pour que l’étiquette disparaisse quand son panneau passe derrière.
- **Constellations.** Chaque panneau allume une constellation de particules : un chat, un livre, une fleur, un appareil photo et un casque audio. Je les ai créées avec un petit script Node qui lit un SVG avec le `SVGLoader` de Three, échantillonne des points le long de ses tracés et les enregistre en JSON. Dans la scène, elles sont affichées sous la forme d’un seul objet `THREE.Points` en blending additif.

Sur les appareils tactiles et les petits écrans, le hub 3D est remplacé par une simple grille de menu. Faire tourner un anneau 3D avec le pouce est moins agréable que de simplement toucher un bouton.

## Les sections

Chaque section sous le hub a sa propre ambiance, mais elles partagent le même ciel nocturne pour que le site reste cohérent.

- **About.** Un avatar « hologramme » flottant entouré d’anneaux en orbite.
- **Skills.** Une scène de sakura avec des pétales qui tombent.
- **Projects.** Des cartes inspirées d’un lecteur de musique lo-fi, avec un visualiseur audio animé.
- **Resume.** Un livre qu’on feuillette page par page.
- **Contact.** Des nuages rendus en WebGL.

Tous les champs d’étoiles scintillantes passent par un seul hook maison, `useCanvasAnimationLoop`. Il gère le device pixel ratio, le redimensionnement, un `IntersectionObserver` qui met la boucle en pause hors écran, et `prefers-reduced-motion`, auquel cas il dessine une seule frame statique au lieu d’animer.

## Performance

Une page aussi riche en animations devient vite lente, et la mienne l’est devenue. Une partie de ce qui a réglé le problème :

- **Migration vers Vite.** Passer de Create React App à Vite a fait tomber le démarrage à froid du serveur de développement de 30 à 60 secondes à moins d’une demi-seconde.
- **Nuages de points.** Les constellations pesaient au départ 55,2 Mo de JSON. Un script de sous-échantillonnage les a ramenées à 1,7 Mo, sans différence visible.
- **Assets.** J’ai compressé les captures d’écran en WebP, remplacé Google Fonts par des paquets `@fontsource` auto-hébergés, et auto-hébergé l’environment map 3D et la texture des nuages.
- **Lazy loading.** Chaque section est découpée (code splitting) et chargée à la demande, et les vidéos des panneaux ainsi que la musique de fond utilisent `preload="none"`.
- **Mise en pause.** Les scènes WebGL passent en `frameloop="never"` quand elles sont hors écran, et les boucles canvas se mettent en pause de la même façon.
- **Cache.** Les assets du build, dont les noms contiennent un hash, sont servis avec des en-têtes de cache immutables.

Au total, le score Lighthouse sur desktop est passé de 25 à 85.

## Accessibilité

Comme beaucoup d’éléments bougent sur la page, `prefers-reduced-motion` est respecté partout : l’intro, les boucles canvas, les pétales et les effets de flottement. Les commandes sont de vrais boutons avec des labels ARIA, accessibles au clavier, et la musique de fond ne joue que si on l’active soi-même, jamais toute seule.

## Hébergement et domaine

J’ai acheté victoriaghoos.com chez Namecheap et je l’ai fait pointer vers Netlify, qui héberge le build de production et gère le HTTPS. Comme il s’agit d’une single-page app, une seule règle de redirection renvoie chaque route vers `index.html`, si bien qu’un lien comme celui de cette page fonctionne aussi quand on l’ouvre directement.
