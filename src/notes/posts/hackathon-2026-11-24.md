---
title: Mission control for a world out of sync
date: 2026-11-24
type: hackathon
location: A Room with a ZOO, Antwerp
excerpt: One day at Hack The Future, a fantasy world falling apart and a mission control app built from scratch. What a hackathon taught me about building software, and about showing it.
cover: /notes-media/hackathon-2026-11-24/achrona-decor.webp
coverAlt: The Hack The Future neon sign between a painted forest, trees and rocks, lit in purple and green
draft: false
---

> "Achrona needs a digital headquarters to fight The Desync."

That was the first line of Guardians of the Grid, the challenge Jonas Lesage and I picked at Hack The Future 2026, a day of hacking at A Room with a ZOO in Antwerp.

## The event

Hack The Future is a yearly hackathon for IT and creative students, organised by the Cronos Group. Every edition has a theme, and this year it was "The Curse of Achrona": a fantasy world where a force called The Desync is pulling everything out of sync. The venue played along, with painted forests, trees, rocks and a plasma lamp under the neon sign. The first day was for IT students, the second for creative students, and every team worked on a challenge set by a partner company.

![The programme of the day on the big screen during the welcome](/notes-media/hackathon-2026-11-24/programme.webp)

The day itself was short: a welcome and a briefing in the morning, about five hours of hacking around lunch, pitches from four o'clock, and then the prize ceremony and dinner.

## The challenge

Our challenge came from Optis: build a realtime mission control center for Achrona with TypeScript, React and TanStack. Show the vital statistics live, spot anomalies early and give operators what they need to stop the glitches.

## What we built

In our app, guardians report **echoes**: what they see happening in Achrona. The app turns each echo into a **glitch**, which moves through four steps, from LEAKED to FIXED. A gauge shows how much magic Achrona has left, and when it drops below 30%, the whole app switches to a red lockdown theme.

My part was the echo → glitch lifecycle and the AI behind it. The AI groups duplicate reports into one glitch, classifies their type, severity and location, filters out vague or inappropriate reports, and assigns critical glitches to a defender automatically. Jonas built the dashboard and the visuals: the charts, the star map and the gauge, all in plain SVG.

We focused on what a real user would notice. It works on a phone, it has keyboard shortcuts, it keeps working offline, and the AI has a built-in rule engine, so it still works without an API key. A demo that needs Wi-Fi or a paid key is a demo that can fail on stage.

## What I took away

**Read the scoring before you write the first line of code.** Creativity counted for 40% of the score, functionality for 30%. We spent most of our time on how the app works. The teams that stood out spent theirs on how it feels: a story, visuals and a world the jury could step into.

**A demo is a story, not a feature list.** In a few minutes on stage, a jury sees what moves and what surprises. Nobody sees how fast a page loads on a slow phone unless you show it.

**One day is enough for more than I expected.** With a clear split of the work from the start, two people can build a working app with AI behind it in a few hours.

## What could be better

How teams are judged depends on the company behind the challenge. A friend who did another challenge had his code reviewed, but the jury of ours only judged what they saw in the pitch, and that mostly came down to how polished and eye-catching an app looked. They never saw the code, so structure and best practices didn't count. Responsiveness, accessibility and performance didn't count either, while they're what makes an app usable in real life. Asking every team for a link to their code, as some challenges already do, and letting the jury open each app on their own phone for a minute, would make that work count too.

## With friends

Between all the hacking, there was still time for a photo with friends in front of the neon sign.

![My friends and me in front of the Hack The Future sign](/notes-media/hackathon-2026-11-24/friends.webp)

## Would I go again?

Probably not by choice. This was my second Hack The Future, after one during my associate degree in programming, and both times confirmed the same thing: competition and a deadline of a few hours aren't where I do my best work. I'd rather build something carefully that has to last. Still, building a complete app in one day showed me what a well-planned split can do, and the lesson about telling the story behind your work is one I'll take into every demo from now on.
