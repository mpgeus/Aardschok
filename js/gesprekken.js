// De gesprekken, als gewone gegevens. Dit bestand is bedoeld om in te schrijven zonder te
// programmeren: nieuwe tekst, een nieuwe keuze of een nieuwe knoop erbij, in dezelfde vorm als
// wat er al staat. De regels die hierover beslissen (welke regel geldt, welke keuzes je ziet)
// staan in gesprek.js.
//
// Vorm van één gesprek:
//   T.GESPREKKEN.<id> = {
//     naam: 'de heer',      // boven het gesprek
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
// omkopen: 10 geeft de inner tien goud, voor minder op zijn rapport (js/inner.js, T.koopInnerOm).
//
// Een voorval (js/voorvallen.js) is een gesprek dat de ander begint, onder dezelfde naam als in T.VOORVALLEN. Zijn
// naam is '{wie}': wie het je komt zeggen. Een antwoord mag daar ook hebben: graan: -20 (of hout, bier, ijzer, ...),
// tevreden: 5, argwaan: 3, verban: 'ander', sterfkans: 30, gezin: 1, schaap: -2, voorval: 'x' (een vervolg) en
// feest: 'dag' of 'avond' (het dorp viert het op het plein, js/feesten.js). Wat dat is, staat boven in
// js/voorvallen.js; het venster zegt de prijs vooraf.
//
// In een zin mag {woord} staan: dat vult het spel in (T.GESPREK_WOORDEN in js/gesprek.js), zoals
// {gisteravond}, wie er gisteravond in de herberg zat (js/herberg.js), en in een voorval {wie} en {ander}.
(function (T) {
  'use strict';

  T.GESPREKKEN = {
    // De marskramer trekt van dorp tot dorp en koopt ook. In het gehucht komt hij drie keer per jaar
    // langs, en daar handel je met hem (js/handel.js; spel.md, "Handel"). De vlaggen
    // marskramerOpBezoek, marskramerLente, -Zomer, -Herfst en marskramerVertrekt zet js/handel.js
    // zolang hij er is. (Tot 25 sep verkocht hij in het oude spel ook vuurklei voor de bakker.)
    marskramer: {
      naam: 'de marskramer',
      start: 'welkom',
      situaties: [
        { naam: 'In het gehucht, grasmaand', als: { vlag: ['marskramerOpBezoek', 'marskramerLente'] } },
        { naam: 'In het gehucht, hooimaand', als: { vlag: ['marskramerOpBezoek', 'marskramerZomer'] } },
        { naam: 'In het gehucht, wijnmaand', als: { vlag: ['marskramerOpBezoek', 'marskramerHerfst'] } },
        { naam: 'In het gehucht, hij vertrekt', als: { vlag: ['marskramerOpBezoek', 'marskramerVertrekt'] } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'marskramerVertrekt' }, zeg: 'Mijn ezel staat al met zijn kop naar de weg, schout. Tot de volgende keer.' },
            { als: { vlag: 'marskramerLente' }, zeg: 'Grasmaand, en de wegen zijn weer te begaan. Wie nu nog graan heeft, is rijk: overal is het op. Ik betaal er goed voor.' },
            { als: { vlag: 'marskramerZomer' }, zeg: 'Hooimaand. Alles staat te groeien en niemand heeft een stuiver. En wol heb ik deze week genoeg gezien: iedereen heeft net geschoren.' },
            { als: { vlag: 'marskramerHerfst' }, zeg: 'Wijnmaand, mijn laatste ronde vóór de winter. Na Sint-Maarten zijn de wegen modder, straks ligt de beek dicht, en dan ziet u mij pas in grasmaand terug. Zout voor de vis, ijzer voor de smid: nu, of pas in de lente.' },
            { zeg: 'Alles wat in een kar past, en een paar dingen die er niet in passen. Kijkt u gerust.' },
          ],
          keuzes: [
            { zeg: 'Laat zien wat u bij u hebt.', sluit: true, als: { vlag: 'marskramerOpBezoek', nietVlag: 'marskramerVertrekt' }, doe: { handel: true } },
            { zeg: 'Wat is er nieuws?', naar: 'nieuws', als: { vlag: 'marskramerOpBezoek' } },
            { zeg: 'Een andere keer.', sluit: true },
          ],
        },
        // Hij komt ook op het kasteel (spel.md, "Handel", voor later): wat hij daar hoort, vertelt
        // hij hier. En omgekeerd, maar dat zegt hij niet.
        nieuws: {
          tekst: [
            { als: { vlag: 'marskramerLente' }, zeg: 'Uw heer heeft een spiegel van mij gekocht. Hij wilde zien hoe rijk hij eruitziet. Nu wil hij er nog een, voor de achterkant.' },
            { als: { vlag: 'marskramerZomer' }, zeg: 'Op het kasteel tellen ze de dagen tot Sint-Maarten. Ik hoorde de inner zeggen dat uw gehucht er welvarend uitziet. Hij bedoelde het niet als compliment.' },
            { als: { vlag: 'marskramerHerfst' }, zeg: 'Ze zeggen dat de heer dit jaar meer wil. Dat zeggen ze elk jaar. En elk jaar klopt het.' },
            { zeg: 'Niets wat u niet al weet, schout. En wat u niet weet, weet ik ook niet. Dat is gezonder.' },
          ],
          keuzes: [
            { zeg: 'Laat zien wat u bij u hebt.', sluit: true, als: { vlag: 'marskramerOpBezoek', nietVlag: 'marskramerVertrekt' }, doe: { handel: true } },
            { zeg: 'Tot de volgende keer.', sluit: true },
          ],
        },
      },
    },
    // De heer (js/heer.js, ontwerp/spel.md "Sint-Maarten"): hij komt op Sint-Maarten zelf innen.
    // Hij is de grap: verward, ijdel, en hij telt slecht; hij spreekt over zichzelf als Wij. Zijn
    // soldaten zijn geen grap. heerOpBezoek, heerSchuld, heerBetaald en heerVertrekt zet js/heer.js.
    heer: {
      naam: 'de heer',
      start: 'welkom',
      situaties: [
        { naam: 'Sint-Maarten: hij wacht op zijn geld', als: { vlag: 'heerOpBezoek' } },
        { naam: '…en je bleef hem vorig jaar wat schuldig', als: { vlag: ['heerOpBezoek', 'heerSchuld'] } },
        { naam: 'Je hebt betaald', als: { vlag: ['heerOpBezoek', 'heerBetaald'] } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'heerBetaald' }, zeg: 'Wij hebben alles geteld. Twee keer zelfs, en het kwam er twee keer anders uit, dus het klopt vast. Tot volgend jaar, schout. Houd het gehucht netjes. En arm. Nee, rijk. Rijk is beter voor Ons.' },
            { als: { vlag: 'heerSchuld' }, zeg: 'Schout! Wij vergeten nooit iets. Behalve wat Wij vergeten, maar dit niet: u bent Ons nog wat schuldig van vorig jaar. Met de boete erbij. De boete is het mooiste deel.' },
            { zeg: 'Schout! Wat een... gehucht. Klein. Modderig. Het ruikt naar koe. Maar Wij zagen onderweg een nieuw dak, en een nieuw dak kost geld. Laten Wij eens kijken wat u voor Ons hebt.' },
          ],
          keuzes: [
            { zeg: 'Hier is wat het gehucht u verschuldigd is.', sluit: true, als: { vlag: 'heerOpBezoek', nietVlag: 'heerBetaald' }, doe: { heer: true } },
            { zeg: 'Hoe was de reis, heer?', naar: 'reis', als: { nietVlag: 'heerBetaald' } },
            { zeg: 'Goede reis terug, heer.', sluit: true, als: { vlag: 'heerBetaald' } },
            { zeg: 'Een ogenblik, heer.', sluit: true, als: { nietVlag: 'heerBetaald' } },
          ],
        },
        reis: {
          tekst: [
            { zeg: 'Afschuwelijk. Uw weg zit vol gaten. Wij hebben ze laten tellen: honderdzeven. Daar zullen Wij weggeld voor moeten heffen. Om ze te laten dichten, of om ze nog eens te laten tellen. Een van de twee.' },
          ],
          keuzes: [
            { zeg: 'Hier is wat het gehucht u verschuldigd is.', sluit: true, als: { vlag: 'heerOpBezoek', nietVlag: 'heerBetaald' }, doe: { heer: true } },
            { zeg: 'Een ogenblik, heer.', sluit: true },
          ],
        },
      },
    },
    // Zijn soldaten: twee, en wie te weinig geeft, houdt ze de winter over (soldatenInHuis).
    soldaat: {
      naam: 'een soldaat',
      start: 'welkom',
      situaties: [
        { naam: 'Met de heer mee', als: { vlag: 'heerOpBezoek' } },
        { naam: 'Ingekwartierd tot de lente', als: { vlag: 'soldatenInHuis' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'soldatenInHuis' }, zeg: 'We blijven tot de lente, zegt de heer. Wat eten we vanavond? En morgen? En de dag daarna?' },
            { zeg: 'Wij zijn hier alleen om te tellen, schout. En om wie verkeerd telt, te helpen tellen.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    // De inner (js/inner.js, ontwerp/spel.md "Rijk worden en arm lijken"): de man van de heer die in
    // oogstmaand komt tellen. Geen grap zoals zijn heer: hij telt goed, en hij weet het. Wat hij ziet,
    // komt in zijn rapport; wie met hem meeloopt, bepaalt wat hij ziet. innerOpBezoek en
    // innerOnverwacht zet js/inner.js. Praten, afleiden en omkopen komen later (werklijst punt 6).
    inner: {
      naam: 'de inner',
      start: 'welkom',
      situaties: [
        { naam: 'Oogstmaand: hij komt tellen', als: { vlag: 'innerOpBezoek' } },
        { naam: 'Hij komt onverwacht terug', als: { vlag: ['innerOpBezoek', 'innerOnverwacht'] } },
        { naam: 'Hij komt tellen, en je hebt goud', als: { vlag: 'innerOpBezoek', goud: 20 } },
        { naam: 'Hij heeft genoeg gepraat', als: { vlag: ['innerOpBezoek', 'innerUitgepraat'], goud: 20 } },
        { naam: 'Omgekocht tot de helft', als: { vlag: ['innerOpBezoek', 'innerOmgekochtVol'], goud: 20 } },
        { naam: 'Zijn rapport is af', als: { vlag: ['innerOpBezoek', 'innerGeteld'] } },
      ],
      // Afleiden en omkopen (werklijst punt 4, stuk 2; vraag 42, Marcel, 27 sep): zolang je met hem
      // praat, kijkt hij niet en loopt de dag door, tot hij genoeg gepraat heeft (innerUitgepraat). Een
      // geschenk laat hem minder opschrijven (omkopen), tot de helft (innerOmgekochtVol). Is zijn rapport
      // af (innerGeteld), dan verandert een praatje of een geschenk er niets meer aan. De vlaggen zet
      // js/inner.js.
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'innerGeteld' }, zeg: 'Mijn rapport is af, schout. Zijne Genade leest het vanavond. Alleen de getallen: de woorden slaat hij over.' },
            { als: { vlag: 'innerUitgepraat' }, zeg: 'Geen praatjes meer, schout: ik moet tellen, en voor donker terug zijn op het kasteel. Zeg het onderweg maar.' },
            { als: { vlag: 'innerOnverwacht' }, zeg: 'Schout. Ik was toevallig in de buurt. Dat is niet waar: ik kwam speciaal. Zijne Genade vroeg zich af of ik wel goed geteld had. Ik tel altijd goed. Maar ik tel graag twee keer.' },
            { zeg: 'Goedendag, schout. Ik ben de inner van Zijne Genade, en ik kom tellen: de huizen, de schuren, de velden en de kist. Wat ik zie, schrijf ik op. Wat ik opschrijf, betaalt u op Sint-Maarten.' },
          ],
          keuzes: [
            { zeg: 'Loop maar met me mee. Ik laat u alles zien.', als: { nietVlag: 'innerGeteld' }, sluit: true },
            { zeg: 'Wat telt u precies?', als: { nietVlag: ['innerUitgepraat', 'innerGeteld'] }, naar: 'wat' },
            { zeg: 'Hoe gaat het op het kasteel?', als: { nietVlag: ['innerUitgepraat', 'innerGeteld'] }, naar: 'kasteel' },
            { zeg: 'Ik heb iets voor u, voor de moeite.', als: { goud: 5, nietVlag: ['innerOmgekochtVol', 'innerGeteld'] }, naar: 'geschenk' },
            { zeg: 'Tel maar raak.', als: { nietVlag: 'innerGeteld' }, sluit: true },
            { zeg: 'Goede reis.', als: { vlag: 'innerGeteld' }, sluit: true },
          ],
        },
        kasteel: {
          tekst: [
            { zeg: 'Zijne Genade maakt het uitstekend. Vorige week liet hij de vijver leegscheppen, omdat hij er een gouden munt in zag liggen. Het was de maan. Hij heeft de maan nu een brief gestuurd.' },
          ],
          keuzes: [
            { zeg: 'Een brief aan de maan?', naar: 'maan' },
            { zeg: 'Loop maar met me mee.', sluit: true },
          ],
        },
        maan: {
          tekst: [
            { zeg: 'Een aanmaning. De maan staat elke nacht boven zijn land, zegt Zijne Genade, en betaalt nooit iets. Ik moest hem tellen. Eén, schreef ik op. Zijne Genade vond het weinig.' },
          ],
          keuzes: [
            { zeg: 'En wat vindt u er zelf van?', naar: 'zelf' },
            { zeg: 'Loop maar met me mee.', sluit: true },
          ],
        },
        zelf: {
          tekst: [
            { zeg: 'Ik vind niets, schout. Ik tel. Wie iets vindt, komt in de kerker, en daar valt niets te tellen behalve de dagen. Is het al zo laat? We staan hier maar te praten.' },
          ],
          keuzes: [
            { zeg: 'Loop maar met me mee.', sluit: true },
          ],
        },
        geschenk: {
          tekst: [
            { zeg: 'Iets voor mij? Schout, ik ben de inner van Zijne Genade. Wat ik zie, schrijf ik op. Al zie ik niet alles even goed. Mijn ogen zijn niet meer wat ze waren, zeker niet als er iets in mijn hand ligt.' },
          ],
          keuzes: [
            { zeg: 'Vijf goud, voor uw ogen.', als: { goud: 5 }, doe: { omkopen: 5 }, naar: 'bedankt' },
            { zeg: 'Tien goud.', als: { goud: 10 }, doe: { omkopen: 10 }, naar: 'bedankt' },
            { zeg: 'Twintig goud.', als: { goud: 20 }, doe: { omkopen: 20 }, naar: 'bedankt' },
            { zeg: 'Laat maar.', naar: 'welkom' },
          ],
        },
        bedankt: {
          tekst: [
            { als: { vlag: 'innerOmgekochtVol' }, zeg: 'Dank u, schout. Nu ben ik de helft vergeten, en meer kan ik niet vergeten: dan valt het op, en dan hangen we allebei.' },
            { zeg: 'Dank u, schout. Merkwaardig: ik zie ineens een stuk minder dan vanochtend. De leeftijd, zeker.' },
          ],
          keuzes: [
            { zeg: 'Loop maar met me mee.', sluit: true },
          ],
        },
        wat: {
          tekst: [
            { zeg: 'Huizen, want daar wonen zielen, en zielen betalen hoofdgeld. Schuren, want daar ligt graan. Velden, want daar staat graan dat straks in de schuren ligt. En de kist, want Zijne Genade ziet graag goud. Ik weet wat een veld geeft, schout, en de marskramer vertelt me wat hij u betaalde. Ligt er minder in de schuur of in de kist dan ik weet, dan schrijf ik dat ook op.' },
          ],
          keuzes: [
            { zeg: 'En wat u niet ziet?', naar: 'nietGezien' },
            { zeg: 'Loop maar met me mee.', sluit: true },
          ],
        },
        nietGezien: {
          tekst: [
            { zeg: 'Wat ik niet zie, tel ik niet. Dat is geen gunst, schout, dat is boekhouden. Maar ik heb goede ogen, en nog meer geduld dan Zijne Genade. Ongeveer.' },
          ],
          keuzes: [
            { zeg: 'Loop maar met me mee.', sluit: true },
          ],
        },
      },
    },
    // De herbergierster (js/herberg.js; spel.md, "Zaken waar de mensen zelf heen gaan"; Marcel koos op
    // 27 sep dat er in de herberg gepraat wordt, vraag 38). Ze weet wie er gisteravond zat en wat er
    // gezegd werd. herbergGasten, herbergRoddel en herbergDroog zet js/herberg.js elke nacht;
    // {gisteravond} en {roddelaar} vult het spel in met de namen van wie er zat en van wie te veel zei.
    herbergierster: {
      naam: 'de herbergierster',
      start: 'welkom',
      situaties: [
        { naam: 'Gisteravond zat er volk', als: { vlag: 'herbergGasten' } },
        { naam: '…en de roddelaar had het over zijn kelder', als: { vlag: ['herbergGasten', 'herbergRoddel'] } },
        { naam: '…en een getuige vertelde wat hij de schout zag doen', als: { vlag: ['herbergGasten', 'herbergGetuige'] } },
        { naam: 'De herberg staat droog', als: { vlag: 'herbergDroog' } },
        { naam: 'De marskramer logeert hier', als: { vlag: 'marskramerOpBezoek' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'herbergDroog' }, zeg: 'Geen druppel voor de tap, schout. Zonder graan brouw ik niets, en wat ik nog heb, is voor de huizen. Een lege herberg hoort alles en weet niets.' },
            { als: { vlag: 'herbergGetuige' }, zeg: 'Aan de tap gisteravond: {gisteravond}. En {getuige} wist te vertellen dat de schout {gezien}. Ik zeg niet dat het waar is, schout. Ik zeg dat iedereen het nu weet.' },
            { als: { vlag: 'herbergRoddel' }, zeg: 'Aan de tap gisteravond: {gisteravond}. En {roddelaar} had het weer over wat er in de kelder ligt. Hardop, schout. Wat de halve herberg weet, weet de heer met Sint-Maarten.' },
            { als: { vlag: 'herbergGasten' }, zeg: 'Aan de tap gisteravond: {gisteravond}. Het weer, de pacht, en wie er met wie. Niets wat u hoeft te weten, en alles wat ik wil weten.' },
            { zeg: 'Stil gisteravond. Niemand kwam. Dan tap ik voor mezelf, en ik ben een slechte klant.' },
          ],
          keuzes: [
            { zeg: 'En de marskramer?', naar: 'marskramer', als: { vlag: 'marskramerOpBezoek' } },
            { zeg: 'Houd uw oren open.', sluit: true },
          ],
        },
        marskramer: {
          tekst: [
            { zeg: 'Hij slaapt boven, zolang hij op het plein staat. Hij betaalt met een lint of een spiegeltje, en praat voor drie. Wat hij op het kasteel vertelt, heeft hij hier eerst gehoord.' },
          ],
          keuzes: [
            { zeg: 'Houd uw oren open.', sluit: true },
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
      naam: 'de zanger',
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
            { als: { vlag: 'schandpaalZanger' }, zeg: 'Drie dagen aan de paal, en niemand die zong. Ik zing ook niet meer, schout. Niet voor jou.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf, aan die paal. Daar hebben we een lied over gemaakt, schout. Geen spotlied.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Die twee soldaten zingen mee in de schuur. Vals. En ze eten voor zes.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'Hoeveel wil hij dit jaar? Nee, zeg het maar niet. Ik zing liever nog even.' },
            { zeg: 'Kom vanavond naar de schuur, schout. We zingen tot de lamp op is.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    weduwe: {
      naam: 'de weduwe',
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
            { als: { vlag: 'schandpaalWeduwe' }, zeg: 'Mijn kinderen hebben drie dagen naar hun moeder aan de paal gekeken. Ze vragen of jij dat zo wilde. Wat moet ik ze zeggen?' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf, in plaats van een van ons. De kinderen hebben je brood gebracht. Dat mocht niet, dus deden ze het in het donker.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Er slaapt een soldaat in mijn hooi. Hij eet wat mijn kinderen hadden moeten eten, en hij bedankt er niet eens voor.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'Er is een brief van de heer, hoor ik. Ik heb drie monden te voeden, schout. Vergeet dat niet als je gaat tellen.' },
            { zeg: 'Drie kinderen, één akker, en geen man meer. Het gaat, schout. Het moet.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    woekeraar: {
      naam: 'de woekeraar',
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
            { als: { vlag: 'schandpaalWoekeraar' }, zeg: 'Aan de paal. Ik. De enige hier die de pacht altijd op tijd heeft. Onthoud dit, schout: wie mij schuldig is, betaalt voortaan dubbel. En iedereen hier is mij schuldig.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf. Dom. Je had mij kunnen aanwijzen. Ik had het je vergeven, tegen een kleine rente.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Twee soldaten, de hele winter. Ik verkoop ze graan. Aan wie anders, schout?' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'De brief is er. Komt het gehucht tekort, kom dan bij mij. Ik leen graag. Tegen een redelijke rente.' },
            { zeg: 'Graan nodig, schout? Ik leen het je. Tien zakken nu, twaalf na de oogst. Dat is geen woeker, dat is rekenen.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    vroedvrouw: {
      naam: 'de vroedvrouw',
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
            { als: { vlag: 'schandpaalVroedvrouw' }, zeg: 'De halve buurt heb ik ter wereld geholpen, en de halve buurt keek toe hoe ik aan de paal stond. Zij keken weg, schout. Jij niet.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf. Ik heb je polsen ingesmeerd, daarna. Dat doe ik niet voor elke schout.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Die soldaten blijven tot de lente, zeggen ze. Ik tel de maanden. Dat is mijn vak.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'Een brief van de heer. Die man is zelf ook ooit geboren, schout. Ik weet niet wie dat op haar geweten heeft.' },
            { zeg: 'Twee kinderen deze maand, en allebei gezond. Nog een paar jaar, en dit gehucht is een dorp.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    heethoofd: {
      naam: 'het heethoofd',
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
            { als: { vlag: 'schandpaalHeethoofd' }, zeg: 'Drie dagen aan de paal. Ik heb de gezichten onthouden, schout. Van de soldaten. En het jouwe.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf, en je keek hem recht aan. Als het ooit zover komt, schout, dan sta ik naast je. Niet achter je. Naast je.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Twee soldaten, met een zwaard en een grote mond. Het zwaard kan ik ze niet afpakken. Nog niet.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'Een brief. Hij schrijft, wij betalen. Ooit schrijven wij hem een brief, schout.' },
            { zeg: 'Die knecht van de heer? Die viel. Tegen mijn vuist. Dat kan gebeuren.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    vrome: {
      naam: 'de vrome',
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
            { als: { vlag: 'schandpaalVrome' }, zeg: 'Drie dagen aan de paal, en ik heb gebeden voor wie mij daar zette. Dat is erger dan vloeken, schout. Denk daar maar eens over na.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf, als een heilige. Of als een dwaas. Bij heiligen weet je dat pas achteraf.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Die soldaten vloeken aan mijn tafel. Ik bid voor ze. Hardop, zodat ze het horen.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'Een brief van de heer. Ik bid elke avond voor hem, schout: dat hij krijgt wat hij verdient.' },
            { zeg: 'God ziet alles, schout. Gelukkig is de heer niet God. Die ziet alleen geld.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    roddelaar: {
      naam: 'de roddelaar',
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
            { als: { vlag: 'schandpaalRoddelaar' }, zeg: 'Aan de paal! Ik! En weet je wat ik daar zag, schout? Alles. Wie lachte, wie wegkeek. Ik vergeet niets. Dat weet je.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf. Het hele gehucht praat erover. Ik ook, natuurlijk. Maar ik zeg alleen goede dingen. Meestal.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Die lange soldaat kijkt wel erg vaak naar ons graan. Nee, dat heb je niet van mij.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'De brief is er, hè? Ik weet al wat erin staat. Iedereen weet het. Behalve jij, zo te zien.' },
            { zeg: 'Heb je het al gehoord, schout? Nee? Dan vertel ik het je. Maar niet verder vertellen. Tenzij het iets oplevert.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    grijsaard: {
      naam: 'de oudste',
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
            { als: { vlag: 'schandpaalGrijsaard' }, zeg: 'Op mijn leeftijd, aan de paal. Ik heb drie heren overleefd, schout. Ik overleef jou ook.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf. Dat heb ik maar één keer eerder gezien, en die schout werd later burgemeester. Of hij werd opgehangen. Ik haal ze door elkaar.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Soldaten in de winter. Onder de tweede heer ook. Toen aten ze de hond op. Houd je hond binnen, schout.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'Weer een brief. De eerste heer schreef niet, die kwam gewoon. De tweede kon niet schrijven. Deze schrijft. Ik weet niet wat erger is.' },
            { zeg: 'Drie heren heb ik zien komen en gaan, schout. Ze worden steeds dikker, en het graan steeds dunner.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    nieuwkomer: {
      naam: 'de nieuwkomer',
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
            { als: { vlag: 'schandpaalNieuwkomer' }, zeg: 'Een jaar hier, en al aan de paal. In het buurdorp duurde dat langer. Nee, vraag maar niet.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf. In het buurdorp deed de schout dat nooit. Daar deed de schout andere dingen. Daarom ben ik hier.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Soldaten. Die ken ik. In het buurdorp kende ik er een paar. Die kennen mij ook. Hopelijk niet deze.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'Een brief van de heer? Die in het buurdorp schreef ook brieven. Tot hij niet meer schreef. Nee, vraag maar niet.' },
            { zeg: 'Waarom ik uit het buurdorp kwam? Het gras is hier groener. En daar was ik niet meer welkom. Vooral dat laatste.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    drinker: {
      naam: 'de drinker',
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
            { als: { vlag: 'schandpaalDrinker' }, zeg: 'Drie dagen aan de paal, zonder één druppel. Weet je hoe lang drie dagen zijn zonder één druppel, schout? Ik wel.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf! Daar drink ik op. Op jou, schout. En op de paal. En op de heer, dat hij erin stikt.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Die soldaten drinken mijn bier. Ik weet niet wat erger is: dat ze het drinken, of dat ze het niet eens lekker vinden.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'Een brief. Lees jij hem maar, schout. Ik lees alleen de bodem van mijn kroes.' },
            { zeg: 'Ik drink niet meer dan een ander, schout. Ik drink alleen vaker.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
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
            { zeg: 'Schout, {ander} heeft twee kippen uit mijn hok gehaald. Ik zag hem gaan, met de veren nog aan zijn mouw. Wat doet u eraan?' },
          ],
          keuzes: [
            { zeg: 'Verban hem. Wie steelt, hoort hier niet.', sluit: true, doe: { tevreden: 3, verban: 'ander' } },
            { zeg: 'Hij betaalt ze terug, en een goud boete voor de kist.', sluit: true, doe: { goud: 1, tevreden: 2, voorval: ['diefstalWrok', 'niets'] } },
            { zeg: 'Laat hem gaan. Het waren maar kippen.', sluit: true, doe: { tevreden: -3, voorval: ['diefstalWeer', 'diefDank'] } },
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
            { zeg: 'Schout, het is weer {ander}. Nu uit de schuur van het dorp: een zak graan. Hij zegt dat hij hem gevonden heeft. In de schuur.' },
          ],
          keuzes: [
            { zeg: 'Nu is het genoeg. Verban hem.', sluit: true, doe: { tevreden: 4, verban: 'ander' } },
            { zeg: 'Hij brengt het terug, en werkt een maand voor niets.', sluit: true, doe: { tevreden: 1 } },
            { zeg: 'Hij zal wel honger hebben. Laat hem het houden.', sluit: true, doe: { graan: -10, tevreden: -4 } },
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
            { zeg: 'Schout, vannacht heeft iemand de luiken van uw huis ingegooid. De buren zagen {ander} weglopen. Hij is die boete nog niet vergeten, zegt hij.' },
          ],
          keuzes: [
            { zeg: 'Hij betaalt de luiken, en nog een boete.', sluit: true, doe: { goud: 1, tevreden: 1, voorval: ['diefstalWrok', 'niets', 'niets'] } },
            { zeg: 'Verban hem.', sluit: true, doe: { tevreden: 2, verban: 'ander' } },
            { zeg: 'Laat maar. Het waren oude luiken.', sluit: true, doe: { tevreden: -1 } },
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
            { zeg: 'Schout. Weet u nog, de kippen van {ander}? U liet me gaan. Ik heb iets voor u: een haas. Ik weet waar er meer zitten, maar dat is in het bos van de heer.' },
          ],
          keuzes: [
            { zeg: 'Dank je. Geef hem maar aan {ander}.', sluit: true, doe: { tevreden: 2 } },
            { zeg: 'Ik neem hem aan. En die andere hazen ook.', sluit: true, doe: { vlees: 8, argwaan: 2 } },
            { zeg: 'Uit het bos van de heer? Breng hem terug.', sluit: true, doe: { argwaan: -2 } },
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
            { zeg: 'Kijk naar mijn oog, schout. Dat was {ander}, gisteravond in de herberg. Om niks. Nou ja, om een grap over zijn moeder. Maar het was een goeie grap.' },
          ],
          keuzes: [
            { zeg: '{ander} betaalt twee goud boete, voor de kist.', sluit: true, doe: { goud: 2, tevreden: 1 } },
            { zeg: 'Allebei een maand geen bier.', sluit: true, doe: { bier: 5, tevreden: -1 } },
            { zeg: 'Een grap over zijn moeder? Dan had je het verdiend.', sluit: true, doe: { tevreden: -2 } },
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
            { zeg: '{ander} heeft drie voren over de grens geploegd. Mijn grens, schout. Die steen heeft mijn grootvader daar zelf gelegd. Nou ja, gerold.' },
          ],
          keuzes: [
            { zeg: 'De steen blijft waar hij ligt.', sluit: true, doe: { tevreden: 1, voorval: ['akkergrensWraak', 'niets'] } },
            { zeg: 'Wie het land ploegt, mag het houden.', sluit: true, doe: { tevreden: -2 } },
            { zeg: 'Ik laat het opmeten, met de ketting van de heer.', sluit: true, doe: { goud: -2, tevreden: 2 } },
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
            { zeg: 'Schout, er ligt een dode kat in mijn put. Ik zeg niet wie dat gedaan heeft. {ander}. Dat zeg ik dus niet.' },
          ],
          keuzes: [
            { zeg: '{ander} haalt hem eruit, en betaalt een boete.', sluit: true, doe: { goud: 1, tevreden: 1 } },
            { zeg: 'Een dode kat. Dat kan iedereen zijn.', sluit: true, doe: { tevreden: -2 } },
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
            { zeg: 'Ik zag {ander} in het bos van de heer, met een haas onder zijn jas. Als de heer het hoort, zijn we allemaal de klos. Ik zeg het maar, schout.' },
          ],
          keuzes: [
            { zeg: 'Ik geef hem aan bij de heer.', sluit: true, doe: { tevreden: -3, argwaan: -4 } },
            { zeg: 'Hij deelt die haas met het dorp, en houdt zijn mond.', sluit: true, doe: { vlees: 3, argwaan: 2 } },
            { zeg: 'Ik heb niets gehoord. En jij ook niet.', sluit: true, doe: { argwaan: 1 } },
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
            { zeg: '{ander} is een heks, schout. Ze keek naar mijn koe, en sindsdien geeft die zure melk. Iedereen zegt het. Nou ja, ik zeg het.' },
          ],
          keuzes: [
            { zeg: 'Onzin. Ga naar huis.', sluit: true, doe: { tevreden: -1 } },
            { zeg: 'Laat haar een week je koe verzorgen. Dan zien we het wel.', sluit: true, doe: { tevreden: 1 } },
            { zeg: 'Verban haar. Voor de zekerheid.', sluit: true, doe: { tevreden: 3, verban: 'ander' } },
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
            { zeg: '{ander} wil mijn koe, voor een schuld van drie goud. Ik leende er twee. Zonder koe hebben mijn kinderen geen melk, schout.' },
          ],
          keuzes: [
            { zeg: 'Een schuld is een schuld.', sluit: true, doe: { tevreden: -3 } },
            { zeg: 'Ik betaal het uit de kist.', sluit: true, doe: { goud: -3, tevreden: 3 } },
            { zeg: 'Twee geleend, twee terug. De rest is woeker.', sluit: true, doe: { tevreden: 2, voorval: 'woekerWraak' } },
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
            { zeg: 'Morgen ga ik naar de inner, schout. Om te praten. Over u, en over wat er in uw kelder ligt. Tenzij u mij iets te zeggen hebt.' },
          ],
          keuzes: [
            { zeg: 'Hier, vijf goud. En nu je mond dicht.', sluit: true, doe: { goud: -5 } },
            { zeg: 'Ga maar. De inner gelooft geen woekeraar.', sluit: true, doe: { argwaan: 6 } },
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
            { zeg: 'Schout, mijn dak lekt, en het regent hier altijd. Kunt u me drie goud lenen? Over een paar weken krijgt u het terug. Echt waar.' },
          ],
          keuzes: [
            { zeg: 'Hier, drie goud.', sluit: true, doe: { goud: -3, voorval: ['leningTerug', 'leningTerug', 'leningUitstel'] } },
            { zeg: 'Het goud in de kist is van de heer.', sluit: true, doe: { tevreden: -1 } },
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
            { zeg: 'Hier is uw goud, schout. Vier: drie van u, en één voor het wachten.' },
          ],
          keuzes: [
            { zeg: 'Dank je.', sluit: true, doe: { goud: 4 } },
            { zeg: 'Houd die ene maar.', sluit: true, doe: { goud: 3, tevreden: 1 } },
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
            { zeg: 'Schout, over dat goud. Het dak was duurder dan ik dacht. En het lekt nog steeds. Mag ik nog wat langer?' },
          ],
          keuzes: [
            { zeg: 'Nog een paar weken dan.', sluit: true, doe: { voorval: 'leningTerug' } },
            { zeg: 'Dan werk je het af: een week hout hakken.', sluit: true, doe: { hout: 10, tevreden: -1 } },
            { zeg: 'Laat maar zitten.', sluit: true, doe: { tevreden: 2 } },
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
            { zeg: 'Bij de brug staat een gezin, schout. Een man, een vrouw en hun kinderen. Ze komen uit het zuiden, waar oorlog is. Ze willen hier blijven.' },
          ],
          keuzes: [
            { zeg: 'Laat ze blijven. Er is werk genoeg.', sluit: true, doe: { graan: -10, gezin: 1 } },
            { zeg: 'We hebben zelf niet genoeg. Stuur ze door.', sluit: true, doe: { tevreden: -1 } },
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
            { zeg: 'Er is een smid uit de stad, schout. Zijn gilde wil hem niet meer: hij sloeg de gildemeester. Met een hamer. Maar zijn hoefijzers zijn de beste van de streek, en hij wil hier wonen.' },
          ],
          keuzes: [
            { zeg: 'Welkom. Maar hier slaan we alleen op ijzer.', sluit: true, doe: { ijzer: 5, gezin: 1 } },
            { zeg: 'Een smid die slaat? Nee.', sluit: true },
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
            { zeg: 'Mijn zaaigraan is beschimmeld, schout. Allemaal. Zonder zaad geen oogst. Kan het dorp me twintig graan lenen? Na de oogst krijgt u het terug.' },
          ],
          keuzes: [
            { zeg: 'Twintig graan.', sluit: true, doe: { graan: -20, voorval: 'zaaigraanTerug' } },
            { zeg: 'Dan moet je het zelf maar zien te vinden.', sluit: true, doe: { tevreden: -2 } },
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
            { zeg: 'De oogst is binnen, schout. Hier is uw graan: dertig. Twintig, en tien omdat u ja zei.' },
          ],
          keuzes: [
            { zeg: 'Dank je.', sluit: true, doe: { graan: 30 } },
            { zeg: 'Twintig is genoeg.', sluit: true, doe: { graan: 20, tevreden: 1 } },
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
            { zeg: 'Mijn dak lekt, schout, en ik heb geen man die het maakt. De buren hebben het druk, zeggen ze. Met wat, weet ik niet.' },
          ],
          keuzes: [
            { zeg: 'Ik stuur twee mannen, met hout.', sluit: true, doe: { hout: -6, tevreden: 3 } },
            { zeg: 'Iedereen heeft het druk.', sluit: true, doe: { tevreden: -2 } },
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
            { zeg: 'Brand, schout! Het dak van {ander} staat in brand! Het riet brandt als stro. Het is ook stro.' },
          ],
          keuzes: [
            { zeg: 'Iedereen aan de emmers!', sluit: true, doe: { hout: -8, tevreden: 2 } },
            { zeg: 'Laat het branden. Dan bouwen ze maar opnieuw.', sluit: true, doe: { tevreden: -5 } },
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
            { zeg: 'Er is koorts in het dorp, schout. Eerst bij de buren, nu ook bij ons. De vroedvrouw zegt dat het van de put komt. Er ligt iets in. Iets doods.' },
          ],
          keuzes: [
            { zeg: 'Laat de put leeghalen en schoonmaken.', sluit: true, doe: { goud: -2, sterfkans: 10 } },
            { zeg: 'Drink bier, geen water, tot het over is.', sluit: true, doe: { bier: -15, sterfkans: 20 } },
            { zeg: 'Bidden. Dat helpt ook.', sluit: true, doe: { sterfkans: 50 } },
          ],
        },
      },
    },
    wolven: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: 'Wolven, schout! Vannacht bij de schapen. Ze hebben er een meegenomen, en ze komen terug. Wolven komen altijd terug.' },
          ],
          keuzes: [
            { zeg: 'Een jacht. {ander} weet waar ze zitten.', sluit: true, doe: { tevreden: 2, sterfkans: 15, schaap: -1 } },
            { zeg: 'Een hoger hek om de schapen.', sluit: true, doe: { hout: -12, schaap: -1 } },
            { zeg: 'Het was maar één schaap.', sluit: true, doe: { schaap: -4 } },
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
            { zeg: 'De storm heeft het dak van de schuur half weggeblazen, schout. Als het gaat regenen, wordt het graan nat. En het gaat regenen. Het regent hier altijd.' },
          ],
          keuzes: [
            { zeg: 'Repareren, nu meteen.', sluit: true, doe: { hout: -10 } },
            { zeg: 'Het houdt het nog wel even.', sluit: true, doe: { graan: -30 } },
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
            { zeg: 'Er zitten muizen in het graan, schout. Veel muizen. Dikke muizen. Ze kijken je aan als je binnenkomt.' },
          ],
          keuzes: [
            { zeg: 'Haal een kat. Of drie.', sluit: true, doe: { goud: -1, graan: -8 } },
            { zeg: 'Iedereen een dag muizen vangen.', sluit: true, doe: { graan: -5, tevreden: -2 } },
            { zeg: 'Muizen moeten ook eten.', sluit: true, doe: { graan: -25 } },
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
            { zeg: 'Bij de brug staat een man met een kar vol ijzer, schout. Spotgoedkoop. Hij zegt niet waar het vandaan komt, maar er staat een wapen op. Dat van de heer.' },
          ],
          keuzes: [
            { zeg: 'Koop het. Alles.', sluit: true, doe: { goud: -2, ijzer: 10, argwaan: 5 } },
            { zeg: 'Laat hem vastzetten, en stuur het ijzer naar de heer.', sluit: true, doe: { tevreden: -1, argwaan: -5 } },
            { zeg: 'Stuur hem weg.', sluit: true },
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
            { zeg: 'Kijk, schout! Bij het graven vond ik een pot. Met munten erin. Oude munten, met een koning erop die niemand kent.' },
          ],
          keuzes: [
            { zeg: 'Die zijn voor de kist van het dorp.', sluit: true, doe: { goud: 4 } },
            { zeg: 'Een vondst is van de heer. Hij krijgt ze.', sluit: true, doe: { argwaan: -6 } },
            { zeg: 'Houd ze. En zeg het tegen niemand.', sluit: true, doe: { tevreden: 1 } },
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
            { zeg: 'Er zit een zwerver bij de put, schout. Hij wil werken voor zijn eten. Hij zegt dat hij kan houthakken. Hij zegt ook dat hij ooit ridder was.' },
          ],
          keuzes: [
            { zeg: 'Een week houthakken, voor brood.', sluit: true, doe: { graan: -5, hout: 15 } },
            { zeg: 'Stuur hem door.', sluit: true },
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
            { zeg: 'Ik heb drie heren overleefd, schout. Wil je weten hoe? Geef me een kan bier, en ik vertel het je.' },
          ],
          keuzes: [
            { zeg: 'Een kan bier dan.', naar: 'raad', doe: { bier: -1 } },
            { zeg: 'Een andere keer.', sluit: true },
          ],
        },
        raad: {
          tekst: [
            { zeg: 'Laat ze nooit zien wat je hebt, en laat ze altijd zien wat je niet hebt. Een lege schuur, een mager kind. De heer houdt van magere kinderen: die kosten hem niets.' },
          ],
          keuzes: [
            { zeg: 'Dank je.', sluit: true, doe: { argwaan: -3 } },
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
            { zeg: 'Schout, {ander} gaat trouwen! Met een meisje uit het buurdorp. Het hele dorp komt, als het dorp het bier betaalt. Dat is traditie. Sinds vandaag.' },
          ],
          keuzes: [
            { zeg: 'Een feest! Bier en brood voor iedereen.', sluit: true, doe: { graan: -15, bier: -10, tevreden: 6 } },
            { zeg: 'Een klein feest, met wat er is.', sluit: true, doe: { graan: -5, tevreden: 2 } },
            { zeg: 'Trouwen kan ook zonder feest.', sluit: true, doe: { tevreden: -2 } },
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
            { zeg: 'De oogst is binnen, schout! Vroeger hielden we dan een feest, met alles erop en eraan. Wat op is, kan de inner niet tellen, zei mijn vader altijd.' },
          ],
          keuzes: [
            { zeg: 'Een groot feest.', sluit: true, doe: { graan: -40, bier: -15, tevreden: 8, feest: 'dag' } },
            { zeg: 'Een klein feest.', sluit: true, doe: { graan: -15, tevreden: 3, feest: 'avond' } },
            { zeg: 'Geen feest. De heer telt mee.', sluit: true, doe: { tevreden: -3 } },
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
            { zeg: 'Schout, onze kapel heeft geen klok. Hoe weet God dan wanneer we bidden? Voor vier goud giet de smid in de stad er een.' },
          ],
          keuzes: [
            { zeg: 'Een klok, van het beste brons.', sluit: true, doe: { goud: -4, tevreden: 4 } },
            { zeg: 'God weet het zelf wel.', sluit: true, doe: { tevreden: -1 } },
          ],
        },
      },
    },
    bouwverzoek: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: 'Schout, {wil} {gebouw} bouwen, {plek}. {waarom} Het dorp betaalt {kosten}.' },
          ],
          keuzes: [
            { zeg: 'Ja, bouw maar.', sluit: true, doe: { bouw: true, tevreden: 3 } },
            { zeg: 'Nee, nu niet.', sluit: true, doe: { weiger: true, tevreden: -2 } },
          ],
        },
      },
    },
    wapenverzoek: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: 'Schout, ik wil wapens maken, {plek}. {waarom} Het mag niet van de heer, dus het blijft onder ons. Het dorp betaalt {kosten}.' },
          ],
          keuzes: [
            { zeg: 'Ja. Maar laat de inner het niet zien.', sluit: true, doe: { bouw: true, tevreden: 3 } },
            { zeg: 'Nee. Dat is verboden.', sluit: true, doe: { weiger: true, tevreden: -2 } },
          ],
        },
      },
    },
    ontginverzoek: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: 'Schout, ik wil {heide} ontginnen, {stuk}. Het dorp komt graan tekort, en daar groeit nu niets dan hei. Een maand plaggen steken, en volgend voorjaar zaaien we er rogge. Maar {meent}.' },
          ],
          keuzes: [
            { zeg: 'Ja, ontgin het maar.', sluit: true, doe: { ontgin: true } },
            { zeg: 'Nee, de heide is van iedereen.', sluit: true },
          ],
        },
      },
    },
    herbergverzoek: {
      naam: '{wie}',
      start: 'begin',
      knopen: {
        begin: {
          tekst: [
            { zeg: 'Schout, ik wil een tweede herberg beginnen, {plek}. {waarom} Het dorp betaalt {kosten}.' },
          ],
          keuzes: [
            { zeg: 'Ja. Er is plaats voor twee.', sluit: true, doe: { bouw: true, tevreden: 3 } },
            { zeg: 'Nee. Het dorp heeft een herberg.', sluit: true, doe: { weiger: true, bier: 10 } },
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
            { zeg: 'Ik heb een lied gemaakt, schout. Over de heer. Het rijmt op varken. Mag ik het vanavond zingen, in de herberg?' },
          ],
          keuzes: [
            { zeg: 'Zing maar. Hard.', sluit: true, doe: { tevreden: 4, argwaan: 4 } },
            { zeg: 'Zing het zachtjes. En niet het laatste couplet.', sluit: true, doe: { tevreden: 2, argwaan: 1 } },
            { zeg: 'Niet zingen.', sluit: true, doe: { tevreden: -1 } },
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
            { zeg: 'Schout, morgen is het de eerste van bloeimaand. We hebben een berk uitgezocht in het bos, de rechtste die er staat. Mogen we hem op het plein zetten, met linten erin? Dan dansen we eromheen tot het donker is.' },
          ],
          keuzes: [
            { zeg: 'Zet hem maar op. Morgen werkt niemand.', sluit: true, doe: { hout: -2, tevreden: 5, feest: 'dag' } },
            { zeg: 'Na het werk, dan.', sluit: true, doe: { hout: -2, tevreden: 2, feest: 'avond' } },
            { zeg: 'Een boom is hout, en het bos is van de heer.', sluit: true, doe: { tevreden: -3 } },
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
            { zeg: 'Er was een bode van de heer, schout. De heer wil een standbeeld van zichzelf, op ons plein, voor Pasen. Van eik, want marmer is voor de keizer, en hij is bescheiden.' },
          ],
          keuzes: [
            { zeg: 'Dan krijgt hij een standbeeld.', sluit: true, doe: { hout: -20, tevreden: -2, argwaan: -6 } },
            { zeg: 'Een vogelverschrikker, in een oude jas van hem.', sluit: true, doe: { hout: -3, tevreden: 3, argwaan: 3 } },
            { zeg: 'Pasen is nog ver.', sluit: true, doe: { argwaan: 3 } },
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
            { zeg: 'De bode van de heer was er, schout. De heer komt jagen, in ons bos. Het dorp levert de drijvers, en het eten. En de wijn, maar die hebben we niet.' },
          ],
          keuzes: [
            { zeg: 'Drijvers en eten, en bier in plaats van wijn.', sluit: true, doe: { graan: -20, bier: -10, argwaan: -5 } },
            { zeg: 'Alleen de drijvers.', sluit: true, doe: { argwaan: 2 } },
            { zeg: 'Zeg hem dat het wild op is.', sluit: true, doe: { argwaan: 5 } },
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
            { zeg: 'De bode van de heer las voor, op het plein: er komt een belasting op ramen. Een stuiver per raam. Hij is nu aan het tellen.' },
          ],
          keuzes: [
            { zeg: 'Betaal maar.', sluit: true, doe: { goud: -2 } },
            { zeg: 'Iedereen zet planken voor zijn ramen. Vandaag nog.', sluit: true, doe: { hout: -8, tevreden: -2 } },
            { zeg: 'Laat hem tellen. Hij kan niet tellen.', sluit: true, doe: { argwaan: 4 } },
          ],
        },
      },
    },
  };
})(globalThis.Spel = globalThis.Spel || {});
