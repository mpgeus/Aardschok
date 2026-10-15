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
// In een zin mag {woord} staan: dat vult het spel in (T.GESPREK_WOORDEN in js/gesprek.js), zoals
// {gisteravond}, wie er gisteravond in de herberg zat (js/herberg.js).
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
  };
})(globalThis.Spel = globalThis.Spel || {});
