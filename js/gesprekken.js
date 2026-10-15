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
// feest: 'dag' of 'avond' (het dorp viert het op het plein, js/feesten.js). Wat dat is, staat boven in js/voorvallen.js;
// het venster zegt de prijs vooraf.
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
      naam: 'the merchant',
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
    // De waard: wie in de herberg werkt (js/herberg.js; spel.md, "Zaken waar de mensen zelf heen gaan"; Marcel koos op
    // 27 sep dat er in de herberg gepraat wordt, vraag 38). Hij weet wie er gisteravond zat. herbergGasten en
    // herbergDroog zet js/herberg.js elke nacht; {gisteravond} vult het spel in met de namen van wie er zat. Tot ronde 2
    // van het snoeien (stap 6, 12 okt) voerde de herbergierster dit gesprek, die in het gehucht dat er al was in de
    // herberg woonde; in het lege begin werkt er een bewoner, en die voert het nu (Marcel: "Naar de waard";
    // js/verkennen.js).
    waard: {
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
            { zeg: 'And the merchant?', naar: 'marskramer', als: { vlag: 'marskramerOpBezoek' } },
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
