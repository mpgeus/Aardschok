// De gesprekken, als gewone gegevens. Dit bestand is bedoeld om in te schrijven zonder te
// programmeren: nieuwe tekst, een nieuwe keuze of een nieuwe knoop erbij, in dezelfde vorm als
// wat er al staat. De regels die hierover beslissen (welke regel geldt, welke keuzes je ziet)
// staan in gesprek.js.
//
// Vorm van één gesprek:
//   T.GESPREKKEN.<id> = {
//     naam: 'the lord',     // boven het gesprek
//     portret: 'heer',      // bestandsnaam van het portret; weg laten als die er nog niet is
//     start: 'welkom',      // met welke knoop het gesprek begint
//     situaties: [...],     // alleen voor de schrijver; het spel leest ze nooit (zie hieronder)
//     knopen: { <knoop-id>: { tekst: [...], keuzes: [...] }, ... },
//   }
//
// 'situaties' is van gereedschap/gesprekken.html en van niemand anders. Een gesprek dat over vijf
// momenten in het verhaal gaat, staat hier als één hoop regels met voorwaarden ernaast, en dat is
// niet te lezen — dus kijkt de schrijver door één situatie tegelijk en tekent hij het gesprek
// zoals het dán loopt. Een situatie is een toestand, opgeschreven in dezelfde woorden als een
// voorwaarde, zodat er maar één woordenlijst is:
//
//   situaties: [{ naam: 'Hij komt innen', als: { vlag: 'heerOpBezoek' } }]
//
// Wat hier ontkent (nietVlag, nietHeeft, nietQuest) hoeft niets te doen: de toestand begint leeg.
// De fasen van een quest staan er vanzelf bij bij wie hem geeft, en staan daarom niet in deze
// lijst.
//
// Een knoop heeft:
//   tekst  — een lijstje regels. De eerste regel waarvan de voorwaarde (als) klopt, wint. Een
//            regel zonder 'als' klopt altijd, en hoort daarom onderaan als vangnet.
//   keuzes — een lijstje antwoorden. Een keuze zonder 'als' is altijd te zien, met 'als' alleen
//            als die voorwaarde klopt. Een keuze heeft 'naar' (de volgende knoop) óf
//            'sluit: true' (het gesprek stopt); 'doe' mag erbij, voor een gevolg.
//
// Een voorwaarde (als) mag hebben:
//   vlag: 'naam'              — waar als die vlag gezet is (of een lijstje: dan allemaal)
//   nietVlag: 'naam'          — waar als die vlag NIET gezet is (of een lijstje: dan geen ervan)
//   heeft: 'ding'              — waar als je dat in je inventaris hebt (of een lijstje: allemaal)
//   nietHeeft: 'ding'          — waar als je dat niet hebt (of een lijstje: geen ervan)
//   quest: 'bakker'            — waar als die quest loopt; met fase: 'zoeken' (of een lijstje
//                                 fasen) alleen in die fase, met weg: 'marskramer' alleen als je
//                                 hem zo oploste
//   nietQuest: 'bakker'        — waar als die quest nog niet begonnen is
//   questAf: 'bakker'          — waar als die quest af is
//   goud: 10                   — waar als je er minstens tien hebt
//
// Een gevolg (doe) mag hebben: zetVlag en/of wisVlag (één naam, of een lijstje), geef en/of neem
// (een voorwerp in je tas of eruit), goud: 20 of goud: -15, en quest: 'bakker' met fase: 'zoeken'
// of weg: 'marskramer' (quest zonder allebei begint hem). Zie js/quests.js voor de quests zelf.
// En handel: true opent het handelsvenster van de marskramer (js/handel.js, js/hud.js), en
// heer: true het venster waarin je de heer betaalt op Sint-Maarten (js/heer.js, js/hud.js).
//
// Een voorval (js/voorvallen.js) is een gesprek dat de ander begint, onder dezelfde naam als in T.VOORVALLEN. Zijn
// naam is '{wie}': wie het je komt zeggen. Een antwoord mag daar ook hebben: graan: -20 (of hout, bier, ijzer, ...),
// tevreden: 5, gunst: -3, verban: 'ander', sterfkans: 30, gezin: 1, schaap: -2, voorval: 'x' (een vervolg) en
// feest: 'dag' of 'avond' (het dorp viert het op het plein, js/feesten.js), blus: true of brand: 'laat' (de brand,
// js/brand.js) en koorts: 40 (de koorts gaat zo vaak over als 40 op 100, js/koorts.js). Wat dat is, staat boven in
// js/voorvallen.js; het venster zegt de prijs vooraf.
//
// In een zin mag {woord} staan: dat vult het spel in (T.GESPREK_WOORDEN in js/gesprek.js), zoals
// {gisteravond}, wie er gisteravond in de herberg zat (js/herberg.js), en in een voorval {wie} en {ander}.
//
// De zinnen zijn Engels (vraag 147; de woorden en de toon: ontwerp/engels.md; de speler is "reeve"), als gewone tekst
// en niet in T.t, want de gespreksschrijver schrijft dit blok terug. Het spel vertaalt ze bij het tonen
// (T.vulWoordenIn in js/gesprek.js, met T.tGegevens uit js/taal.js), en npm run teksten leest ze hier voor een
// vertaler. De situaties zijn alleen voor de schrijver, en blijven Nederlands.
(function (T) {
  'use strict';

  T.GESPREKKEN = {
    // De marskramer trekt van dorp tot dorp en koopt ook. In het gehucht komt hij drie keer per jaar
    // langs, en daar handel je met hem (js/handel.js; spel.md, "Handel"). De vlaggen
    // marskramerOpBezoek, marskramerLente, -Zomer, -Herfst, marskramerBode (op bestelling, js/bode.js) en marskramerVertrekt zet js/handel.js
    // zolang hij er is. (Tot 25 sep verkocht hij in het oude spel ook vuurklei voor de bakker.)
    marskramer: {
      naam: 'the peddler',
      start: 'welkom',
      situaties: [
        { naam: 'In het gehucht, grasmaand', als: { vlag: ['marskramerOpBezoek', 'marskramerLente'] } },
        { naam: 'In het gehucht, hooimaand', als: { vlag: ['marskramerOpBezoek', 'marskramerZomer'] } },
        { naam: 'In het gehucht, wijnmaand', als: { vlag: ['marskramerOpBezoek', 'marskramerHerfst'] } },
        { naam: 'In het gehucht, hij vertrekt', als: { vlag: ['marskramerOpBezoek', 'marskramerVertrekt'] } },
        { naam: 'In het gehucht, op bestelling (de bode)', als: { vlag: ['marskramerOpBezoek', 'marskramerBode'] } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'marskramerVertrekt' }, zeg: 'My donkey is already facing the road, reeve. Until next time.' },
            // Hij kwam op je brief (de bode, js/bode.js; werklijst vraag 143).
            { als: { vlag: 'marskramerBode' }, zeg: 'You sent for me, reeve, and here I am. The road was long and my donkey is tired: you will see that in the price. But what you asked for, I have with me, or as much of it as could be had.' },
            { als: { vlag: 'marskramerLente' }, zeg: 'April, and the roads are passable again. Anyone who still has grain is rich: everywhere else it has run out. I pay well for it.' },
            { als: { vlag: 'marskramerZomer' }, zeg: 'July. Everything is growing and nobody has a penny. And I have seen enough wool this week: everyone has just finished shearing.' },
            { als: { vlag: 'marskramerHerfst' }, zeg: 'October, my last round before winter. After Martinmas the roads are mud, soon the brook freezes over, and then you will not see me again until April. Salt for the fish, iron for the smith: now, or not until spring.' },
            { zeg: "Everything that fits in a cart, and a few things that don't. Look all you like." },
          ],
          keuzes: [
            { zeg: 'Show me what you have.', sluit: true, als: { vlag: 'marskramerOpBezoek', nietVlag: 'marskramerVertrekt' }, doe: { handel: true } },
            { zeg: 'Any news?', naar: 'nieuws', als: { vlag: 'marskramerOpBezoek' } },
            { zeg: 'Another time.', sluit: true },
          ],
        },
        // Hij komt ook op het kasteel (spel.md, "Handel", voor later): wat hij daar hoort, vertelt
        // hij hier. En omgekeerd, maar dat zegt hij niet.
        nieuws: {
          tekst: [
            { als: { vlag: 'marskramerLente' }, zeg: 'Your lord bought a mirror from me. He wanted to see how rich he looks. Now he wants another, for the back.' },
            { als: { vlag: 'marskramerZomer' }, zeg: 'At the castle they are counting the days to Martinmas. I heard the lord say your hamlet looks prosperous. He did not mean it as a compliment.' },
            { als: { vlag: 'marskramerHerfst' }, zeg: 'They say the lord wants more this year. They say that every year. And every year they are right.' },
            { zeg: "Nothing you don't already know, reeve. And what you don't know, I don't know either. It's healthier that way." },
          ],
          keuzes: [
            { zeg: 'Show me what you have.', sluit: true, als: { vlag: 'marskramerOpBezoek', nietVlag: 'marskramerVertrekt' }, doe: { handel: true } },
            { zeg: 'Until next time.', sluit: true },
          ],
        },
      },
    },
    // De heer (js/heer.js, ontwerp/spel.md "Sint-Maarten"): hij komt op Sint-Maarten zelf innen.
    // Hij is de grap: verward, ijdel, en hij telt slecht; hij spreekt over zichzelf als Wij. Zijn
    // soldaten zijn geen grap. heerOpBezoek, heerSchuld, heerBetaald en heerVertrekt zet js/heer.js.
    heer: {
      naam: 'the lord',
      start: 'welkom',
      situaties: [
        { naam: 'Sint-Maarten: hij wacht op zijn geld', als: { vlag: 'heerOpBezoek' } },
        { naam: '…en je bleef hem vorig jaar wat schuldig', als: { vlag: ['heerOpBezoek', 'heerSchuld'] } },
        { naam: 'Je hebt betaald', als: { vlag: ['heerOpBezoek', 'heerBetaald'] } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'heerBetaald' }, zeg: 'We have counted it all. Twice, in fact, and it came out different both times, so it must be right. Until next year, reeve. Keep the hamlet tidy. And poor. No, rich. Rich is better for Us.' },
            { als: { vlag: 'heerSchuld' }, zeg: 'Reeve! We never forget anything. Except what We forget, but not this: you still owe Us from last year. With the fine on top. The fine is the best part.' },
            { zeg: 'Reeve! What a... hamlet. Small. Muddy. It smells of cow. But on the way We saw a new roof, and a new roof costs money. Let Us see what you have for Us.' },
          ],
          keuzes: [
            { zeg: 'Here is what the hamlet owes you, my lord.', sluit: true, als: { vlag: 'heerOpBezoek', nietVlag: 'heerBetaald' }, doe: { heer: true } },
            { zeg: 'How was the journey, my lord?', naar: 'reis', als: { nietVlag: 'heerBetaald' } },
            { zeg: 'A safe journey home, my lord.', sluit: true, als: { vlag: 'heerBetaald' } },
            { zeg: 'One moment, my lord.', sluit: true, als: { nietVlag: 'heerBetaald' } },
          ],
        },
        reis: {
          tekst: [
            { zeg: 'Dreadful. Your road is full of holes. We had them counted: a hundred and seven. We shall have to raise a toll for that. To have them filled, or to have them counted again. One or the other.' },
          ],
          keuzes: [
            { zeg: 'Here is what the hamlet owes you, my lord.', sluit: true, als: { vlag: 'heerOpBezoek', nietVlag: 'heerBetaald' }, doe: { heer: true } },
            { zeg: 'One moment, my lord.', sluit: true },
          ],
        },
      },
    },
    // Zijn soldaten: twee, en wie te weinig geeft, houdt ze de winter over (soldatenInHuis).
    soldaat: {
      naam: 'a soldier',
      start: 'welkom',
      situaties: [
        { naam: 'Met de heer mee', als: { vlag: 'heerOpBezoek' } },
        { naam: 'Ingekwartierd tot de lente', als: { vlag: 'soldatenInHuis' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'soldatenInHuis' }, zeg: 'We stay until spring, the lord says. What are we eating tonight? And tomorrow? And the day after?' },
            { zeg: 'We are only here to count, reeve. And to help anyone who counts wrong to count better.' },
          ],
          keuzes: [
            { zeg: 'Good day.', sluit: true },
          ],
        },
      },
    },
    // De herbergierster (js/herberg.js; spel.md, "Zaken waar de mensen zelf heen gaan"; Marcel koos op
    // 27 sep dat er in de herberg gepraat wordt, vraag 38). Ze weet wie er gisteravond zat. herbergGasten en
    // herbergDroog zet js/herberg.js elke nacht; {gisteravond} vult het spel in met de namen van wie er zat.
    herbergierster: {
      naam: 'the innkeeper',
      start: 'welkom',
      situaties: [
        { naam: 'Gisteravond zat er volk', als: { vlag: 'herbergGasten' } },
        { naam: 'De herberg staat droog', als: { vlag: 'herbergDroog' } },
        { naam: 'De marskramer logeert hier', als: { vlag: 'marskramerOpBezoek' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'herbergDroog' }, zeg: 'Not a drop to pour, reeve. Without grain I brew nothing, and what I have left is for the houses. An empty inn hears everything and knows nothing.' },
            { als: { vlag: 'herbergGasten' }, zeg: 'At my tables last night: {gisteravond}. The weather, the rent, and who is walking out with whom. Nothing you need to know, and everything I like to know.' },
            { zeg: "Quiet last night. Nobody came. Then I pour for myself, and I'm a poor customer." },
          ],
          keuzes: [
            { zeg: 'And the peddler?', naar: 'marskramer', als: { vlag: 'marskramerOpBezoek' } },
            { zeg: 'Keep your ears open.', sluit: true },
          ],
        },
        marskramer: {
          tekst: [
            { zeg: 'He sleeps upstairs while his stall is on the square. He pays with a ribbon or a little mirror, and talks for three. What he tells them at the castle, he heard here first.' },
          ],
          keuzes: [
            { zeg: 'Keep your ears open.', sluit: true },
          ],
        },
      },
    },
    // De karakters van de boeren (T.KARAKTERS, js/mensen.js). Bij elk spel trekt elke boer er een
    // (js/boeren.js), en voert hij het gesprek van zijn karakter; de naam boven het gesprek is die
    // van de boer zelf (js/dialoog.js). Daarom zegt geen van deze zinnen hij of zij, tenzij het
    // karakter het vastlegt (de weduwe, de vroedvrouw). Ze onthouden wat Sint-Maarten bracht:
    // schandpaal<Karakter> als jij hem aanwees (js/heer.js, T.schandpaalVlag), schoutAanDeSchandpaal
    // als je er zelf stond, en briefVanDeHeer en soldatenInHuis zolang die er zijn.
    zanger: {
      naam: 'the singer',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de zanger aan de schandpaal', als: { vlag: 'schandpaalZanger' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalZanger' }, zeg: "Three days in the pillory, and nobody sang. I don't sing any more either, reeve. Not for you." },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'You stood in the pillory yourself. We made a song about it, reeve. Not a mocking one.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Those two soldiers sing along in the barn. Out of tune. And they eat for six.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: "How much does he want this year? No, don't tell me. I'd rather sing a while longer." },
            { zeg: 'Come to the barn tonight, reeve. We sing until the lamp runs dry.' },
          ],
          keuzes: [
            { zeg: 'Good day.', sluit: true },
          ],
        },
      },
    },
    weduwe: {
      naam: 'the widow',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de weduwe aan de schandpaal', als: { vlag: 'schandpaalWeduwe' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalWeduwe' }, zeg: 'For three days my children watched their mother in the pillory. They ask whether you wanted it so. What am I to tell them?' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'You stood there yourself, instead of one of us. The children brought you bread. That was forbidden, so they did it in the dark.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: "There's a soldier sleeping in my hay. He eats what my children should have eaten, and he doesn't even say thank you." },
            { als: { vlag: 'briefVanDeHeer' }, zeg: "There's a letter from the lord, I hear. I have three mouths to feed, reeve. Remember that when you start counting." },
            { zeg: 'Three children, one field, and no husband any more. I manage, reeve. I have to.' },
          ],
          keuzes: [
            { zeg: 'Good day.', sluit: true },
          ],
        },
      },
    },
    woekeraar: {
      naam: 'the moneylender',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de woekeraar aan de schandpaal', als: { vlag: 'schandpaalWoekeraar' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalWoekeraar' }, zeg: 'In the pillory. Me. The only one here who always has the rent on time. Remember this, reeve: whoever owes me pays double from now on. And everyone here owes me.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'You stood there yourself. Foolish. You could have named me. I would have forgiven you, at a modest rate of interest.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Two soldiers, all winter. I sell them grain. Who else is buying, reeve?' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'The letter has come. If the hamlet comes up short, come to me. I like to lend. At a reasonable rate.' },
            { zeg: "Need grain, reeve? I'll lend it to you. Ten sacks now, twelve after the harvest. That isn't usury, that's arithmetic." },
          ],
          keuzes: [
            { zeg: 'Good day.', sluit: true },
          ],
        },
      },
    },
    vroedvrouw: {
      naam: 'the midwife',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de vroedvrouw aan de schandpaal', als: { vlag: 'schandpaalVroedvrouw' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalVroedvrouw' }, zeg: 'I brought half this lane into the world, and half this lane watched me stand in the pillory. They looked away, reeve. You did not.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: "You stood there yourself. I rubbed salve on your wrists afterwards. I don't do that for every reeve." },
            { als: { vlag: 'soldatenInHuis' }, zeg: "Those soldiers are staying until spring, they say. I'm counting the months. That's my trade." },
            { als: { vlag: 'briefVanDeHeer' }, zeg: "A letter from the lord. That man was born once too, reeve. I don't know who has that on her conscience." },
            { zeg: 'Two babies this month, and both healthy. A few more years, and this hamlet is a village.' },
          ],
          keuzes: [
            { zeg: 'Good day.', sluit: true },
          ],
        },
      },
    },
    heethoofd: {
      naam: 'the hothead',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette het heethoofd aan de schandpaal', als: { vlag: 'schandpaalHeethoofd' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalHeethoofd' }, zeg: "Three days in the pillory. I remember the faces, reeve. The soldiers'. And yours." },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: "You stood there yourself, and you looked him in the eye. If it ever comes to it, reeve, I'll stand beside you. Not behind you. Beside you." },
            { als: { vlag: 'soldatenInHuis' }, zeg: "Two soldiers, with a sword and a big mouth. I can't take the sword off them. Not yet." },
            { als: { vlag: 'briefVanDeHeer' }, zeg: "A letter. He writes, we pay. One day we'll write him a letter, reeve." },
            { zeg: "That servant of the lord's? He fell. Against my fist. It happens." },
          ],
          keuzes: [
            { zeg: 'Good day.', sluit: true },
          ],
        },
      },
    },
    vrome: {
      naam: 'the pious one',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de vrome aan de schandpaal', als: { vlag: 'schandpaalVrome' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalVrome' }, zeg: 'Three days in the pillory, and I prayed for whoever put me there. That is worse than cursing, reeve. Think about that.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'You stood there yourself, like a saint. Or like a fool. With saints, you only know afterwards.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Those soldiers curse at my table. I pray for them. Out loud, so they hear it.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'A letter from the lord. I pray for him every night, reeve: that he gets what he deserves.' },
            { zeg: 'God sees everything, reeve. Luckily the lord is not God. He only sees money.' },
          ],
          keuzes: [
            { zeg: 'Good day.', sluit: true },
          ],
        },
      },
    },
    roddelaar: {
      naam: 'the gossip',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de roddelaar aan de schandpaal', als: { vlag: 'schandpaalRoddelaar' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalRoddelaar' }, zeg: 'In the pillory! Me! And do you know what I saw from there, reeve? Everything. Who laughed, who looked away. I forget nothing. You know that.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'You stood there yourself. The whole hamlet is talking about it. So am I, of course. But I only say good things. Mostly.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: "That tall soldier looks at our grain rather often. No, you didn't hear that from me." },
            { als: { vlag: 'briefVanDeHeer' }, zeg: "The letter's come, hasn't it? I already know what's in it. Everyone knows. Except you, by the look of it." },
            { zeg: "Have you heard, reeve? No? Then I'll tell you. But don't pass it on. Unless there's something in it for you." },
          ],
          keuzes: [
            { zeg: 'Good day.', sluit: true },
          ],
        },
      },
    },
    grijsaard: {
      naam: 'the elder',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de oudste aan de schandpaal', als: { vlag: 'schandpaalGrijsaard' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalGrijsaard' }, zeg: "At my age, in the pillory. I have outlived three lords, reeve. I'll outlive you too." },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: "You stood there yourself. I've seen that only once before, and that reeve later became mayor. Or he was hanged. I mix them up." },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Soldiers in winter. Under the second lord too. They ate the dog that time. Keep your dog indoors, reeve.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: "Another letter. The first lord didn't write, he just came. The second couldn't write. This one writes. I don't know which is worse." },
            { zeg: "I've seen three lords come and go, reeve. Each one fatter than the last, and the grain thinner." },
          ],
          keuzes: [
            { zeg: 'Good day.', sluit: true },
          ],
        },
      },
    },
    nieuwkomer: {
      naam: 'the newcomer',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de nieuwkomer aan de schandpaal', als: { vlag: 'schandpaalNieuwkomer' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalNieuwkomer' }, zeg: "One year here, and already in the pillory. In the next village it took longer. No, don't ask." },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: "You stood there yourself. In the next village the reeve never did that. The reeve there did other things. That's why I'm here." },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Soldiers. I know soldiers. In the next village I knew a few. They know me too. Not these ones, I hope.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: "A letter from the lord? The one in the next village wrote letters too. Until he stopped. No, don't ask." },
            { zeg: "Why I left the next village? The grass is greener here. And I wasn't welcome there any more. Mostly that." },
          ],
          keuzes: [
            { zeg: 'Good day.', sluit: true },
          ],
        },
      },
    },
    drinker: {
      naam: 'the drinker',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de drinker aan de schandpaal', als: { vlag: 'schandpaalDrinker' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalDrinker' }, zeg: 'Three days in the pillory, without a drop. Do you know how long three days are without a drop, reeve? I do.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: "You stood there yourself! I'll drink to that. To you, reeve. And to the pillory. And to the lord, may he choke on it." },
            { als: { vlag: 'soldatenInHuis' }, zeg: "Those soldiers drink my ale. I don't know which is worse: that they drink it, or that they don't even like it." },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'A letter. You read it, reeve. I only read the bottom of my tankard.' },
            { zeg: 'I drink no more than anyone else, reeve. I just drink more often.' },
          ],
          keuzes: [
            { zeg: 'Good day.', sluit: true },
          ],
        },
      },
    },
    // De voorvallen (js/voorvallen.js, werklijst vraag 65): een gesprek dat de ander begint, als hij de schout
    // komt zoeken. {wie} is wie het zegt, {ander} over wie het gaat; wat een antwoord kost, zegt het venster vooraf.
    // Wanneer er een komt en over wie, staat in T.VOORVALLEN.
    diefstal: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: 'Reeve, {ander} took two hens from my coop. I saw him go, with the feathers still on his sleeve. What will you do about it?' },
          ],
          keuzes: [
            { zeg: "Banish him. Thieves don't belong here.", sluit: true, doe: { tevreden: 3, verban: 'ander' } },
            { zeg: 'He pays for them, and a fine of one gold for the chest.', sluit: true, doe: { goud: 1, tevreden: 2, voorval: ['diefstalWrok', 'niets'] } },
            { zeg: 'Let him go. They were only hens.', sluit: true, doe: { tevreden: -3, voorval: ['diefstalWeer', 'diefDank'] } },
          ],
        },
      },
    },
    diefstalWeer: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "Reeve, it's {ander} again. This time from the village barn: a sack of grain. He says he found it. In the barn." },
          ],
          keuzes: [
            { zeg: "That's enough. Banish him.", sluit: true, doe: { tevreden: 4, verban: 'ander' } },
            { zeg: 'He brings it back, and works a month for nothing.', sluit: true, doe: { tevreden: 1 } },
            { zeg: 'He must be hungry. Let him keep it.', sluit: true, doe: { graan: -10, tevreden: -4 } },
          ],
        },
      },
    },
    diefstalWrok: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "Reeve, last night someone smashed the shutters on your house. The neighbours saw {ander} walking off. He hasn't forgotten that fine, he says." },
          ],
          keuzes: [
            { zeg: 'He pays for the shutters, and another fine.', sluit: true, doe: { goud: 1, tevreden: 1, voorval: ['diefstalWrok', 'niets', 'niets'] } },
            { zeg: 'Banish him.', sluit: true, doe: { tevreden: 2, verban: 'ander' } },
            { zeg: 'Leave it. They were old shutters.', sluit: true, doe: { tevreden: -1 } },
          ],
        },
      },
    },
    diefDank: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "Reeve. Remember {ander}'s hens? You let me go. I have something for you: a hare. I know where there are more, but that's in the lord's forest." },
          ],
          keuzes: [
            { zeg: 'Thank you. Give it to {ander}.', sluit: true, doe: { tevreden: 2 } },
            { zeg: "I'll take it. And the other hares too.", sluit: true, doe: { vlees: 8, gunst: -2 } },
            { zeg: "From the lord's forest? Take it back.", sluit: true, doe: { gunst: 2 } },
          ],
        },
      },
    },
    vechtpartij: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: 'Look at my eye, reeve. That was {ander}, last night at the inn. Over nothing. Well, over a joke about his mother. But it was a good joke.' },
          ],
          keuzes: [
            { zeg: '{ander} pays a fine of two gold, for the chest.', sluit: true, doe: { goud: 2, tevreden: 1 } },
            { zeg: 'No ale for either of them for a month.', sluit: true, doe: { bier: 5, tevreden: -1 } },
            { zeg: 'A joke about his mother? Then you had it coming.', sluit: true, doe: { tevreden: -2 } },
          ],
        },
      },
    },
    akkergrens: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: '{ander} has ploughed three furrows over the boundary. My boundary, reeve. My grandfather laid that stone there himself. Well, rolled it.' },
          ],
          keuzes: [
            { zeg: 'The stone stays where it lies.', sluit: true, doe: { tevreden: 1, voorval: ['akkergrensWraak', 'niets'] } },
            { zeg: 'Whoever ploughs the land may keep it.', sluit: true, doe: { tevreden: -2 } },
            { zeg: "I'll have it measured, with the lord's chain.", sluit: true, doe: { goud: -2, tevreden: 2 } },
          ],
        },
      },
    },
    akkergrensWraak: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "Reeve, there's a dead cat in my well. I'm not saying who did it. {ander}. So I'm not saying." },
          ],
          keuzes: [
            { zeg: '{ander} fishes it out, and pays a fine.', sluit: true, doe: { goud: 1, tevreden: 1 } },
            { zeg: 'A dead cat. It could have been anyone.', sluit: true, doe: { tevreden: -2 } },
          ],
        },
      },
    },
    stroper: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "I saw {ander} in the lord's forest, with a hare under his coat. If the lord hears of it, we all pay. I'm only saying, reeve." },
          ],
          keuzes: [
            { zeg: "I'll report him to the lord.", sluit: true, doe: { tevreden: -3, gunst: 4 } },
            { zeg: 'He shares that hare with the village, and keeps his mouth shut.', sluit: true, doe: { vlees: 3, gunst: -2 } },
            { zeg: 'I heard nothing. And neither did you.', sluit: true, doe: { gunst: -1 } },
          ],
        },
      },
    },
    heks: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: '{ander} is a witch, reeve. She looked at my cow, and since then it gives sour milk. Everyone says so. Well, I say so.' },
          ],
          keuzes: [
            { zeg: 'Nonsense. Go home.', sluit: true, doe: { tevreden: -1 } },
            { zeg: "Let her look after your cow for a week. Then we'll see.", sluit: true, doe: { tevreden: 1 } },
            { zeg: 'Banish her. To be safe.', sluit: true, doe: { tevreden: 3, verban: 'ander' } },
          ],
        },
      },
    },
    woeker: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: '{ander} wants my cow, for a debt of three gold. I borrowed two. Without the cow my children have no milk, reeve.' },
          ],
          keuzes: [
            { zeg: 'A debt is a debt.', sluit: true, doe: { tevreden: -3 } },
            { zeg: "I'll pay it from the chest.", sluit: true, doe: { goud: -3, tevreden: 3 } },
            { zeg: 'Two borrowed, two paid back. The rest is usury.', sluit: true, doe: { tevreden: 2, voorval: 'woekerWraak' } },
          ],
        },
      },
    },
    woekerWraak: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "Tomorrow I'm going to the castle, reeve. To talk. About you, and everything I know about you. Unless you have something to say to me." },
          ],
          keuzes: [
            { zeg: 'Here, five gold. Now keep your mouth shut.', sluit: true, doe: { goud: -5 } },
            { zeg: "Go, then. The lord won't believe a moneylender.", sluit: true, doe: { gunst: -6 } },
          ],
        },
      },
    },
    lening: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "Reeve, my roof leaks, and it always rains here. Could you lend me three gold? You'll have it back in a few weeks. Truly." },
          ],
          keuzes: [
            { zeg: 'Here, three gold.', sluit: true, doe: { goud: -3, voorval: ['leningTerug', 'leningTerug', 'leningUitstel'] } },
            { zeg: 'The gold in the chest belongs to the lord.', sluit: true, doe: { tevreden: -1 } },
          ],
        },
      },
    },
    leningTerug: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: 'Here is your gold, reeve. Four: three of yours, and one for the waiting.' },
          ],
          keuzes: [
            { zeg: 'Thank you.', sluit: true, doe: { goud: 4 } },
            { zeg: 'Keep the extra one.', sluit: true, doe: { goud: 3, tevreden: 1 } },
          ],
        },
      },
    },
    leningUitstel: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: 'Reeve, about that gold. The roof cost more than I thought. And it still leaks. Could I have a little longer?' },
          ],
          keuzes: [
            { zeg: 'A few more weeks, then.', sluit: true, doe: { voorval: 'leningTerug' } },
            { zeg: 'Then you work it off: a week of chopping wood.', sluit: true, doe: { hout: 10, tevreden: -1 } },
            { zeg: 'Forget the debt.', sluit: true, doe: { tevreden: 2 } },
          ],
        },
      },
    },
    vreemdeling: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "There's a family at the bridge, reeve. A man, a woman and their children. They come from the south, where there is war. They want to stay here." },
          ],
          keuzes: [
            { zeg: "Let them stay. There's work enough.", sluit: true, doe: { graan: -10, gezin: 1 } },
            { zeg: "We don't have enough ourselves. Send them on.", sluit: true, doe: { tevreden: -1 } },
          ],
        },
      },
    },
    smid: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "There's a smith from the town, reeve. His guild won't have him any more: he struck the guildmaster. With a hammer. But his horseshoes are the best for miles around, and he wants to live here." },
          ],
          keuzes: [
            { zeg: 'Welcome. But here we only strike iron.', sluit: true, doe: { ijzer: 5, gezin: 1 } },
            { zeg: 'A smith who strikes people? No.', sluit: true },
          ],
        },
      },
    },
    zaaigraan: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "My seed grain has gone mouldy, reeve. All of it. No seed, no harvest. Can the village lend me twenty grain? You'll have it back after the harvest." },
          ],
          keuzes: [
            { zeg: 'Twenty grain.', sluit: true, doe: { graan: -20, voorval: 'zaaigraanTerug' } },
            { zeg: "Then you'll have to find it yourself.", sluit: true, doe: { tevreden: -2 } },
          ],
        },
      },
    },
    zaaigraanTerug: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: 'The harvest is in, reeve. Here is your grain: thirty. Twenty, and ten because you said yes.' },
          ],
          keuzes: [
            { zeg: 'Thank you.', sluit: true, doe: { graan: 30 } },
            { zeg: 'Twenty is enough.', sluit: true, doe: { graan: 20, tevreden: 1 } },
          ],
        },
      },
    },
    weduweDak: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "My roof leaks, reeve, and I have no husband to mend it. The neighbours are busy, they say. With what, I don't know." },
          ],
          keuzes: [
            { zeg: "I'll send two men, with wood.", sluit: true, doe: { hout: -6, tevreden: 3 } },
            { zeg: 'Everyone is busy.', sluit: true, doe: { tevreden: -2 } },
          ],
        },
      },
    },
    brand: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "Fire, reeve! {ander}'s roof is on fire! The thatch burns like straw. It is straw." },
          ],
          keuzes: [
            { zeg: 'Everyone to the buckets!', sluit: true, doe: { blus: true, tevreden: 2 } },
            { zeg: 'Let it burn. They can build again.', sluit: true, doe: { brand: 'laat', tevreden: -5 } },
          ],
        },
      },
    },
    ziekte: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "There's fever in the village, reeve. First next door, now in our house too. The midwife says it comes from the well. There's something in it. Something dead." },
          ],
          keuzes: [
            { zeg: 'Have the well emptied and cleaned.', sluit: true, doe: { goud: -2, koorts: 40 } },
            { zeg: 'Drink ale, not water, until it passes.', sluit: true, doe: { bier: -15, koorts: 70 } },
            { zeg: 'Pray. That helps too.', sluit: true, doe: { koorts: 100 } },
          ],
        },
      },
    },
    zaaigraanHonger: {
      naam: '{wie}',
      start: 'begin',
      // De honger komt aan het zaaigraan in de graanschuur (js/graanschuur.js; werklijst vraag 132; Marcel, 8 okt: "bij
      // honger grijpen mensen alles aan. Je moet mensen inzetten om het warenhuis te beschermen").
      knopen: {
        begin: {
          tekst: [
            { zeg: 'Reeve, the people are hungry. They are talking about the granary. If they eat the seed grain now, the fields stay empty in spring.' },
          ],
          keuzes: [
            { zeg: 'Put men at the granary. The seed grain stays where it is.', sluit: true, doe: { bewaak: 1, vertrouwen: -3 } },
            { zeg: 'Give them half, and guard the rest.', sluit: true, doe: { bewaak: 0.5, vertrouwen: -1 } },
            { zeg: 'Let them eat. Hunger is worse.', sluit: true, doe: { tevreden: 2 } },
          ],
        },
      },
    },
    wolven: {
      naam: '{wie}',
      start: 'begin',
      // Met beesten in het bos (js/beesten.js; werklijst vraag 116, stap 2b) namen de wolven het schaap echt, en komt dit
      // de ochtend erna: dan is de jacht een jacht te voet, met de mannen naar de roedel (stap 3b), en doet het hek wat het
      // zegt. Zonder beesten komt het zomaar, en zegt het antwoord wat het kost, zoals voor 7 okt.
      situaties: [
        { naam: 'De wolven namen een schaap', als: { vlag: 'wolvenNamenSchaap' } },
        { naam: 'Zonder beesten in het bos', als: { nietVlag: 'wolvenNamenSchaap' } },
      ],
      knopen: {
        begin: {
          tekst: [
            { zeg: "Wolves, reeve! Last night, at the sheep. They took one, and they'll be back. Wolves always come back." },
          ],
          keuzes: [
            { zeg: 'A hunt. {ander} knows where they are.', sluit: true, als: { vlag: 'wolvenNamenSchaap' }, doe: { tevreden: 2, jacht: true } },
            { zeg: 'A higher fence round the sheep.', sluit: true, als: { vlag: 'wolvenNamenSchaap' }, doe: { hout: -12, hek: true } },
            { zeg: 'It was only one sheep.', sluit: true, als: { vlag: 'wolvenNamenSchaap' } },
            { zeg: 'A hunt. {ander} knows where they are.', sluit: true, als: { nietVlag: 'wolvenNamenSchaap' }, doe: { tevreden: 2, sterfkans: 15, schaap: -1 } },
            { zeg: 'A higher fence round the sheep.', sluit: true, als: { nietVlag: 'wolvenNamenSchaap' }, doe: { hout: -12, schaap: -1 } },
            { zeg: 'It was only one sheep.', sluit: true, als: { nietVlag: 'wolvenNamenSchaap' }, doe: { schaap: -4 } },
          ],
        },
      },
    },
    storm: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: 'The storm has blown half the roof off the barn, reeve. If it rains, the grain gets wet. And it will rain. It always rains here.' },
          ],
          keuzes: [
            { zeg: 'Repair it, right away.', sluit: true, doe: { hout: -10 } },
            { zeg: 'It will hold for a while yet.', sluit: true, doe: { graan: -30 } },
          ],
        },
      },
    },
    muizen: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: 'There are mice in the grain, reeve. Lots of mice. Fat mice. They look at you when you come in.' },
          ],
          keuzes: [
            { zeg: 'Get a cat. Or three.', sluit: true, doe: { goud: -1, graan: -8 } },
            { zeg: 'Everyone spends a day catching mice.', sluit: true, doe: { graan: -5, tevreden: -2 } },
            { zeg: 'Mice have to eat too.', sluit: true, doe: { graan: -25 } },
          ],
        },
      },
    },
    heler: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "There's a man at the bridge with a cart full of iron, reeve. Dirt cheap. He won't say where it comes from, but there's a coat of arms on it. The lord's." },
          ],
          keuzes: [
            { zeg: 'Buy it. All of it.', sluit: true, doe: { goud: -2, ijzer: 10, gunst: -5 } },
            { zeg: 'Have him locked up, and send the iron to the lord.', sluit: true, doe: { tevreden: -1, gunst: 5 } },
            { zeg: 'Send him away.', sluit: true },
          ],
        },
      },
    },
    vondst: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: 'Look, reeve! I was digging and found a pot. With coins in it. Old coins, with a king on them nobody knows.' },
          ],
          keuzes: [
            { zeg: 'Those go in the village chest.', sluit: true, doe: { goud: 4 } },
            { zeg: 'A find belongs to the lord. He gets them.', sluit: true, doe: { gunst: 6 } },
            { zeg: 'Keep them. And tell no one.', sluit: true, doe: { tevreden: 1 } },
          ],
        },
      },
    },
    zwerver: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "There's a vagrant by the well, reeve. He wants to work for his food. He says he can chop wood. He also says he was once a knight." },
          ],
          keuzes: [
            { zeg: 'A week of chopping wood, for bread.', sluit: true, doe: { graan: -5, hout: 15 } },
            { zeg: 'Send him on.', sluit: true },
          ],
        },
      },
    },
    wijsheid: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "I have outlived three lords, reeve. Do you want to know how? Give me a jug of ale, and I'll tell you." },
          ],
          keuzes: [
            { zeg: 'A jug of ale, then.', naar: 'raad', doe: { bier: -1 } },
            { zeg: 'Another time.', sluit: true },
          ],
        },
        raad: {
          tekst: [
            { zeg: "Never let them see what you have, and always let them see what you don't. An empty barn, a thin child. The lord likes thin children: they cost him nothing." },
          ],
          keuzes: [
            { zeg: 'Thank you.', sluit: true, doe: { gunst: 3 } },
          ],
        },
      },
    },
    bruiloft: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "Reeve, {ander} is getting married! To a girl from the next village. The whole village will come, if the village pays for the ale. That's tradition. Since today." },
          ],
          keuzes: [
            { zeg: 'A feast! Ale and bread for everyone.', sluit: true, doe: { graan: -15, bier: -10, tevreden: 6 } },
            { zeg: 'A small feast, with what there is.', sluit: true, doe: { graan: -5, tevreden: 2 } },
            { zeg: 'You can marry without a feast.', sluit: true, doe: { tevreden: -2 } },
          ],
        },
      },
    },
    oogstfeest: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "The harvest is in, reeve! In the old days we held a feast then, with everything that goes with it. What's been eaten, the lord can't count, my father always said." },
          ],
          keuzes: [
            { zeg: 'A great feast.', sluit: true, doe: { graan: -40, bier: -15, tevreden: 8, feest: 'dag' } },
            { zeg: 'A small feast.', sluit: true, doe: { graan: -15, tevreden: 3, feest: 'avond' } },
            { zeg: 'No feast. The lord is counting too.', sluit: true, doe: { tevreden: -3 } },
          ],
        },
      },
    },
    klok: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: 'Reeve, our chapel has no bell. How is God to know when we pray? For four gold the smith in the town will cast one.' },
          ],
          keuzes: [
            { zeg: 'A bell, of the best bronze.', sluit: true, doe: { goud: -4, tevreden: 4 } },
            { zeg: 'God will know without one.', sluit: true, doe: { tevreden: -1 } },
          ],
        },
      },
    },
    lied: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "I've made a song, reeve. About the lord. It rhymes with pig. May I sing it tonight, at the inn?" },
          ],
          keuzes: [
            { zeg: 'Sing it. Loudly.', sluit: true, doe: { tevreden: 4, gunst: -4 } },
            { zeg: 'Sing it quietly. And not the last verse.', sluit: true, doe: { tevreden: 2, gunst: -1 } },
            { zeg: 'No singing.', sluit: true, doe: { tevreden: -1 } },
          ],
        },
      },
    },
    meiboom: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "Reeve, tomorrow is the first of May. We've picked out a birch in the forest, the straightest there is. May we set it up on the square, with ribbons in it? Then we'll dance round it until dark." },
          ],
          keuzes: [
            { zeg: 'Put it up. Tomorrow nobody works.', sluit: true, doe: { hout: -2, tevreden: 5, feest: 'dag' } },
            { zeg: 'After work, then.', sluit: true, doe: { hout: -2, tevreden: 2, feest: 'avond' } },
            { zeg: 'A tree is wood, and the forest belongs to the lord.', sluit: true, doe: { tevreden: -3 } },
          ],
        },
      },
    },
    kerstboom: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "Reeve, in four days it is Christmas Eve. There's a fir in the forest that is just right. May we set it up on the square, with apples and straw stars in it and candles on it? Then on Christmas Eve we'll sing round it." },
          ],
          keuzes: [
            { zeg: "Put it up. On Christmas Eve I'll sing along.", sluit: true, doe: { hout: -2, tevreden: 4, feest: 'avond' } },
            { zeg: 'A tree is wood, and the forest belongs to the lord.', sluit: true, doe: { tevreden: -3 } },
          ],
        },
      },
    },
    standbeeld: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: 'A messenger came from the lord, reeve. The lord wants a statue of himself, on our square, by Easter. In oak, because marble is for the emperor, and he is modest.' },
          ],
          keuzes: [
            { zeg: 'Then he shall have a statue.', sluit: true, doe: { hout: -20, tevreden: -2, gunst: 6 } },
            { zeg: 'A scarecrow, in one of his old coats.', sluit: true, doe: { hout: -3, tevreden: 3, gunst: -3 } },
            { zeg: 'Easter is a long way off.', sluit: true, doe: { gunst: -3 } },
          ],
        },
      },
    },
    jacht: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "The lord's messenger was here, reeve. The lord is coming to hunt, in our forest. The village provides the beaters, and the food. And the wine, but we have none." },
          ],
          keuzes: [
            { zeg: 'Beaters and food, and ale instead of wine.', sluit: true, doe: { graan: -20, bier: -10, gunst: 5 } },
            { zeg: 'Only the beaters.', sluit: true, doe: { gunst: -2 } },
            { zeg: 'Tell him the game is all gone.', sluit: true, doe: { gunst: -5 } },
          ],
        },
      },
    },
    ramen: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: "The lord's messenger read it out on the square: there is to be a tax on windows. A penny a window. He is counting them now." },
          ],
          keuzes: [
            { zeg: 'Pay it.', sluit: true, doe: { goud: -2 } },
            { zeg: 'Everyone boards up their windows. Today.', sluit: true, doe: { hout: -8, tevreden: -2 } },
            { zeg: "Let him count. He can't count.", sluit: true, doe: { gunst: -4 } },
          ],
        },
      },
    },
  };
})(globalThis.Spel = globalThis.Spel || {});
