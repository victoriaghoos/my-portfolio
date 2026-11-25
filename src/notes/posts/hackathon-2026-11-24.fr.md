---
title: Un centre de contrôle pour un monde désynchronisé
date: 2026-11-24
type: hackathon
location: A Room with a ZOO, Anvers
excerpt: Une journée à Hack The Future, un monde imaginaire qui se désagrège et une application de centre de contrôle construite de zéro. Ce qu’un hackathon m’a appris sur la façon de construire un logiciel, et de le montrer.
cover: /notes-media/hackathon-2026-11-24/achrona-decor.webp
coverAlt: L’enseigne lumineuse de Hack The Future entre une forêt peinte, des arbres et des rochers, éclairés en violet et en vert
draft: false
---

> « Achrona a besoin d’un quartier général numérique pour combattre The Desync. »

C’était la première phrase de Guardians of the Grid, le défi que Jonas Lesage et moi avons choisi à Hack The Future 2026, une journée de hacking à A Room with a ZOO, à Anvers.

## L’événement

Hack The Future est un hackathon annuel pour les étudiants en informatique et en filières créatives, organisé par le groupe Cronos. Chaque édition a un thème, et cette année c’était « The Curse of Achrona » : un monde imaginaire où une force appelée The Desync désynchronise tout. Le lieu jouait le jeu, avec des forêts peintes, des arbres, des rochers et une lampe à plasma sous l’enseigne lumineuse. Le premier jour était pour les étudiants en informatique, le second pour les étudiants créatifs, et chaque équipe travaillait sur un défi proposé par une entreprise partenaire.

![Le programme de la journée sur le grand écran pendant l’accueil](/notes-media/hackathon-2026-11-24/programme.webp)

La journée elle-même était courte : un accueil et un briefing le matin, environ cinq heures de hacking autour de midi, les pitchs à partir de seize heures, puis la remise des prix et le dîner.

## Le défi

Notre défi venait d’Optis : construire un centre de contrôle en temps réel pour Achrona, avec TypeScript, React et TanStack. Afficher les statistiques vitales en direct, repérer les anomalies tôt et donner aux opérateurs ce qu’il leur faut pour arrêter les glitchs.

## Ce que nous avons construit

Dans notre application, les gardiens signalent des **échos** : ce qu’ils voient se passer à Achrona. L’application transforme chaque écho en **glitch**, qui passe par quatre étapes, de LEAKED à FIXED. Une jauge montre combien de magie il reste à Achrona, et quand elle descend sous 30 %, toute l’application passe à un thème rouge de confinement.

Ma partie, c’était le cycle de vie de l’écho au glitch et l’IA derrière. L’IA regroupe les signalements en double en un seul glitch, en détermine le type, la gravité et le lieu, écarte les signalements vagues ou inappropriés, et attribue automatiquement les glitchs critiques à un défenseur. Jonas a construit le tableau de bord et les visuels : les graphiques, la carte des étoiles et la jauge, le tout en SVG simple.

Nous nous sommes concentrés sur ce qu’un vrai utilisateur remarquerait. Elle fonctionne sur téléphone, elle a des raccourcis clavier, elle continue de fonctionner hors ligne, et l’IA a un moteur de règles intégré, ce qui lui permet de fonctionner même sans clé d’API. Une démo qui dépend du Wi-Fi ou d’une clé payante est une démo qui peut échouer sur scène.

## Ce que je retiens

**Lire les critères d’évaluation avant d’écrire la première ligne de code.** La créativité comptait pour 40 % de la note, la fonctionnalité pour 30 %. Nous avons passé l’essentiel de notre temps sur le fonctionnement de l’application. Les équipes qui se sont démarquées ont passé le leur sur l’expérience : une histoire, des visuels et un monde dans lequel le jury pouvait entrer.

**Une démo est une histoire, pas une liste de fonctionnalités.** En quelques minutes sur scène, un jury voit ce qui bouge et ce qui surprend. Personne ne voit la vitesse de chargement d’une page sur un téléphone lent, à moins de la montrer.

**Une journée suffit pour plus que je ne le pensais.** Avec une répartition claire du travail dès le départ, deux personnes peuvent construire en quelques heures une application qui fonctionne, avec de l’IA derrière.

## Ce qui pourrait être mieux

La façon dont les équipes sont évaluées dépend de l’entreprise derrière le défi. Un ami qui a fait un autre défi a vu son code examiné, mais le jury de notre défi n’a évalué que ce qu’il voyait pendant le pitch, c’est-à-dire surtout à quel point une application était soignée et accrocheuse. Il n’a jamais vu le code, donc la structure et les bonnes pratiques ne comptaient pas. Le responsive, l’accessibilité et la performance non plus, alors que c’est justement ce qui rend une application utilisable dans la vraie vie. Si chaque équipe devait donner un lien vers son code, comme certains défis le demandent déjà, et si le jury ouvrait chaque application une minute sur son propre téléphone, ce travail compterait aussi.

## Entre amis

Entre deux sessions de hacking, il restait du temps pour une photo entre amis devant l’enseigne lumineuse.

![Mes amis et moi devant l’enseigne de Hack The Future](/notes-media/hackathon-2026-11-24/friends.webp)

## Est-ce que j’y retournerais ?

Probablement pas de mon plein gré. C’était mon deuxième Hack The Future, après un premier pendant mon graduat en programmation, et les deux fois ont confirmé la même chose : la compétition et une échéance de quelques heures, ce n’est pas là que je travaille le mieux. Je préfère construire avec soin quelque chose qui doit durer. Malgré tout, construire une application complète en une journée m’a montré ce que permet une répartition bien pensée, et la leçon sur l’histoire derrière son travail, je l’emporterai désormais dans chaque démo.
