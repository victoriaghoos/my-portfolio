---
title: Mission control voor een wereld uit sync
date: 2026-11-24
type: hackathon
location: A Room with a ZOO, Antwerpen
excerpt: Eén dag Hack The Future, een fantasiewereld die uit elkaar valt en een mission control-app vanaf nul. Wat een hackathon me leerde over software bouwen, en over ze tonen.
cover: /notes-media/hackathon-2026-11-24/achrona-decor.webp
coverAlt: Het neonbord van Hack The Future tussen een geschilderd bos, bomen en rotsen, verlicht in paars en groen
draft: false
---

> "Achrona heeft nood aan een digitaal hoofdkwartier om The Desync te bestrijden."

Zo begon Guardians of the Grid, de challenge die Jonas Lesage en ik kozen op Hack The Future 2026, een dag hacken in A Room with a ZOO in Antwerpen.

## Het event

Hack The Future is een jaarlijkse hackathon voor IT- en creatieve studenten, georganiseerd door de Cronos Groep. Elke editie heeft een thema, en dit jaar was dat "The Curse of Achrona": een fantasiewereld waarin een kracht die The Desync heet alles uit sync trekt. De locatie speelde mee, met geschilderde bossen, bomen, rotsen en een plasmalamp onder het neonbord. De eerste dag was voor IT-studenten, de tweede voor creatieve studenten, en elk team werkte aan een challenge van een partnerbedrijf.

![Het programma van de dag op het grote scherm tijdens de verwelkoming](/notes-media/hackathon-2026-11-24/programme.webp)

De dag zelf was kort: 's ochtends een verwelkoming en een briefing, rond de middag ongeveer vijf uur hacken, vanaf vier uur de pitches, en daarna de prijsuitreiking en het diner.

## De challenge

Onze challenge kwam van Optis: bouw met TypeScript, React en TanStack een realtime mission control center voor Achrona. Breng de belangrijkste statistieken live in kaart, spoor afwijkingen vroeg op en geef operators wat ze nodig hebben om de glitches te stoppen.

## Wat we bouwden

In onze app melden guardians **echoes**: wat ze zien gebeuren in Achrona. De app maakt van elke echo een **glitch**, die vier stappen doorloopt, van LEAKED tot FIXED. Een meter toont hoeveel magie Achrona nog heeft, en zakt die onder 30%, dan schakelt de hele app over op een rood lockdownthema.

Mijn deel was de levenscyclus van echo naar glitch en de AI erachter. De AI groepeert dubbele meldingen tot één glitch, bepaalt type, ernst en locatie, filtert vage of ongepaste meldingen eruit, en wijst kritieke glitches automatisch toe aan een defender. Jonas bouwde het dashboard en de visuals: de grafieken, de sterrenkaart en de meter, allemaal in gewone SVG.

We focusten op wat een echte gebruiker zou merken. Het werkt op een gsm, het heeft sneltoetsen, het blijft offline werken, en de AI heeft een ingebouwde rule engine, zodat ze ook zonder API-key werkt. Een demo die wifi of een betaalde key nodig heeft, is een demo die op het podium kan mislukken.

## Wat ik meeneem

**Lees de beoordeling voor je de eerste lijn code schrijft.** Creativiteit telde voor 40% van de score, functionaliteit voor 30%. Wij staken de meeste tijd in hoe de app werkt. De teams die opvielen, staken die in hoe ze aanvoelt: een verhaal, visuals en een wereld waar de jury in kon stappen.

**Een demo is een verhaal, geen lijst features.** In een paar minuten op het podium ziet een jury wat beweegt en wat verrast. Niemand ziet hoe snel een pagina laadt op een trage gsm, tenzij je het toont.

**Eén dag is genoeg voor meer dan ik dacht.** Met een duidelijke verdeling van het werk vanaf het begin kunnen twee mensen in een paar uur een werkende app met AI bouwen.

## Wat kon beter

Hoe teams beoordeeld worden, hangt af van het bedrijf achter de challenge. Bij een vriend die een andere challenge deed, keek de jury wel naar zijn code, maar de jury van onze challenge beoordeelde alleen wat ze in de pitch zag, en dat kwam vooral neer op hoe verzorgd en opvallend een app eruitzag. De code zag ze nooit, dus structuur en best practices telden niet mee. Responsiveness, toegankelijkheid en performance ook niet, terwijl net dat een app bruikbaar maakt in het echt. Als elk team een link naar zijn code moest geven, zoals sommige challenges al vragen, en de jury elke app een minuut op haar eigen gsm zou openen, zou dat werk ook meetellen.

## Met vrienden

Tussen al het hacken door was er nog tijd voor een foto met vrienden voor het neonbord.

![Mijn vrienden en ik voor het bord van Hack The Future](/notes-media/hackathon-2026-11-24/friends.webp)

## Zou ik terug gaan?

Waarschijnlijk niet uit eigen keuze. Dit was mijn tweede Hack The Future, na een eerste tijdens mijn graduaat programmeren, en beide keren bevestigden hetzelfde: competitie en een deadline van een paar uur zijn niet waar ik het best werk. Ik bouw liever zorgvuldig aan iets dat lang moet meegaan. Toch toonde een volledige app bouwen in één dag me wat een goed geplande verdeling kan doen, en de les over het verhaal achter je werk neem ik voortaan mee in elke demo.
