// De raad onder het doel (werklijst vraag 58, B; Marcel, 29 sep: "B onder het doel"). Linksboven staat het doel,
// "26 van 50 mensen · nog geen kapel · nog geen smidse" (js/treden.js), en daaronder één regel die zegt wat nu tussen
// jou en een dorp staat, met de toets erbij. Het is geen rij opdrachten die je afwerkt, maar wat nu telt: de eerste
// raad uit T.RADEN die nu geldt. Zo blijft niemand op een stap hangen, komt een toets pas als je hem nodig hebt, en
// blijft het na de eerste weken nuttig. Het zijn de eerste weken als opdrachten (vraag 47), herschreven.
//
// Of er een gezin komt, vraagt de raad aan de groei zelf (T.waaromGeenGezin en T.volgendeGezinDag, js/gebouwen.js),
// en of het hout en het eten de winter halen aan het dorp (T.houtVoorDeWinter en T.etenVoorDeWinter,
// js/behoeften.js): de raad zegt wat het spel doet, en rekent niet naast het spel.
//
// Een toets staat tussen haken, [B]: in het vak wordt dat een toets (<kbd>, js/ui.js).
//
// Zonder scherm, en dus getoetst (test/raad.test.cjs). js/main.js zet hem onder het doel (T.ui.opdracht), en de
// speeltest schrijft op welke raad de bouwer hoe lang zag (gereedschap/speeltest/speler.js). Uit te zetten in de
// spelregels ("Raad", js/opties.js).
(function (T) {
  'use strict';

  T.RAAD_INSTELLINGEN = {
    // Of de raad er staat (de spelregel "Raad").
    aan: true,
    // Zoveel dagen vóór de inner komt, zegt de raad het.
    innerVooraf: 3,
    // Zoveel dagen vóór de winter zegt de raad het als het hout of het eten hem niet haalt: vanaf 1 herfstmaand, net
    // als het dorp zelf (T.BEHOEFTEN_INSTELLINGEN.winterVooraf).
    winterVooraf: 90,
    // Zoveel dagen na een aanval van de rovers zegt de raad wat een wachthuis doet, als er geen is.
    roversNa: 10,
    // Zoveel dagen nadat een voorval voorbijging dat een raadsman had beslist, als je er een had (js/voorvallen.js: je
    // was weg), zegt de raad: kies een raadsman (js/raadsman.js).
    raadsmanNa: 10,
  };
  const IN = () => T.RAAD_INSTELLINGEN;

  const dagNu = (D) => Math.floor(D.kalender.dag);
  const over = (n) => (n <= 1 ? 'morgen' : `over ${n} dagen`);
  const maandIdx = (naam) => T.MAANDEN.findIndex((m) => m.naam === naam);
  const heeft = (D, soort) => (D.gebouwen || []).some((g) => g.soort === soort);

  // Hoeveel mensen het doel nog vraagt (js/treden.js), of 0 als er geen trede meer te halen is.
  function mensenNodig(D) {
    const trede = T.volgendeTrede(D);
    return trede ? Math.max(0, T.TREDEN_INSTELLINGEN[trede].mensen - (D.bevolking || 0)) : 0;
  }

  // Over hoeveel dagen de inner komt (T.INNER_INSTELLINGEN.komt), als dat binnen `binnen` dagen is; anders null.
  function innerOver(D, binnen) {
    const komt = T.INNER_INSTELLINGEN.komt;
    for (let n = 1; n <= binnen; n++) {
      const d = T.datumVanDag(dagNu(D) + n);
      if (T.MAANDEN[d.maand].naam === komt.maand && d.dagVanMaand === komt.dag) return n;
    }
    return null;
  }

  // Van na Sint-Maarten tot 1 lentemaand, als er gezaaid wordt: de tijd waarin wat in een kelder ligt, niemand voedt.
  function naSintMaarten(D) {
    const d = T.datumVanDag(D.kalender.dag);
    const sm = T.SINT_MAARTEN;
    return (d.maand === sm.maand && d.dagVanMaand > sm.dag) || d.maand > sm.maand || d.maand < maandIdx('lentemaand');
  }

  // Het hout of het eten (`voorDeWinter`: T.houtVoorDeWinter of T.etenVoorDeWinter) haalt de winter niet, en die
  // is binnen winterVooraf dagen, of al begonnen. Eerst de dagen tot de winter: dat is goedkoop, het eten niet.
  const haaltHetNiet = (D, voorDeWinter) => T.dagenTotDeWinter(D.kalender.dag) <= IN().winterVooraf && !voorDeWinter(D, D.kalender.dag).haalt;
  // Hoe ver het komt, zoals het dorp het zegt (js/behoeften.js): "26 van de 90 dagen". Zo weet je of één houthakker
  // genoeg is; de bouwer die alleen hoorde dat het niet genoeg was, bouwde er een na de ander (29 sep).
  const haalt = (v) => `${v.dagen} van de ${v.winter} dagen`;

  // De marskramer staat op het plein, op zijn laatste ronde vóór de heer komt (js/handel.js).
  function marskramerInDeHerfst(D) {
    const m = D.marskramer;
    return !!(m && m.staat && !m.weg && T.HANDEL_INSTELLINGEN.bezoeken[m.bezoek] && T.HANDEL_INSTELLINGEN.bezoeken[m.bezoek].naam === 'herfst');
  }

  // De raden, van wat het zwaarst weegt naar wat het minst weegt. `als(S)` zegt of hij nu geldt, `tekst(S)` wat er
  // dan staat. Wat aan een dag hangt, gaat voor; dan de winter; dan de eerste dag; dan de groei.
  T.RADEN = [
    {
      id: 'inner',
      als: (D) => innerOver(D, IN().innerVooraf) != null,
      tekst: (D) => `De inner komt ${over(innerOver(D, IN().innerVooraf))}. Wat hij niet ziet, telt de heer niet.`,
    },
    {
      id: 'heerGoud',
      als: (D) => marskramerInDeHerfst(D) && (D.voorraad.goud || 0) < (T.eisVanDeHeer(D).per.goud || 0),
      tekst: (D) => `De heer wil ${Math.ceil(T.eisVanDeHeer(D).per.goud)} goud, en je hebt er ${Math.floor(D.voorraad.goud || 0)}. De marskramer koopt graan, zolang hij er is.`,
    },
    {
      id: 'rovers',
      als: (D) => D.rovers && D.rovers.laatsteAanval != null && dagNu(D) - D.rovers.laatsteAanval < IN().roversNa && !heeft(D, 'wachthuis'),
      tekst: () => `De rovers komen terug. Een wachthuis [B] geeft je ${T.telwoord(T.GEBOUWEN.wachthuis.handen)} man die meevechten.`,
    },
    {
      id: 'hout',
      als: (D) => haaltHetNiet(D, T.houtVoorDeWinter),
      tekst: (D) => `Het hout haalt ${haalt(T.houtVoorDeWinter(D, D.kalender.dag))} van de winter: ${heeft(D, 'houthakker') ? 'nog een houthakker [B] hakt erbij' : 'bouw een houthakker [B]'}.`,
    },
    {
      id: 'eten',
      als: (D) => haaltHetNiet(D, T.etenVoorDeWinter),
      // Wat helpt, zegt het dorp ook (js/behoeften.js): een jager, als vlees een maag vult.
      tekst: (D) => `Het eten haalt ${haalt(T.etenVoorDeWinter(D, D.kalender.dag))} van de winter${T.BEHOEFTEN_INSTELLINGEN.vleesIsEten ? `: een jager [B] schiet ${T.GEBOUWEN.jager.maakt.uit.vlees} vlees per dag` : ''}.`,
    },
    {
      id: 'kelders',
      als: (D) => naSintMaarten(D) && !(D.heer && D.heer.bezoek) && T.verstoptTotaal(D).graan >= 1,
      tekst: (D) => `In de kelders ligt nog ${Math.floor(T.verstoptTotaal(D).graan)} graan. Dat eet niemand en zaait niemand.`,
    },
    {
      // Marcel koos het zo (vraag 67, B): de raad zegt het zodra er een voorval voorbijging dat een raadsman had
      // beslist (vraag 68, B: je was weg), en de knop Raadsman (R) opent het venster (js/raadsmanvenster.js).
      id: 'raadsman',
      als: (D) => T.RAADSMAN_INSTELLINGEN.aan && !T.raadsmanVan(D) && D.voorvallen && D.voorvallen.laatstVoorbij != null
        && dagNu(D) - D.voorvallen.laatstVoorbij < IN().raadsmanNa,
      tekst: () => 'Wat je mist als je weg bent, gaat voorbij: kies een raadsman [R].',
    },
    {
      id: 'tijd',
      als: (D) => D.kalender.dag < 1 && !(D.kalender.snelheid > 1),
      tekst: () => 'Een dag duurt lang: [+] zet de tijd sneller, en [Z] is slapen tot de ochtend.',
    },
    {
      id: 'plaats',
      als: (D) => mensenNodig(D) > 0 && T.waaromGeenGezin(D).includes('plaats'),
      tekst: () => (T.ERVEN_INSTELLINGEN.dorpBouwtZelf
        ? 'Er komt geen gezin: het dorp is vol. Wijs een erf aan: [B], dan Erf.'
        : 'Er komt geen gezin: het dorp is vol. Bouw een hut of een huis: [B].'),
    },
    {
      id: 'tevreden',
      als: (D) => mensenNodig(D) > 0 && T.waaromGeenGezin(D).includes('tevreden'),
      tekst: (D) => `Er komt geen gezin: het dorp is ${Math.round(D.behoeften.tevredenheid * 100)}% tevreden, en een gezin wil ${Math.round(T.BEHOEFTEN_INSTELLINGEN.groeiDrempel * 100)}%.`,
    },
    {
      id: 'graan',
      als: (D) => mensenNodig(D) > 0 && T.waaromGeenGezin(D).includes('graan'),
      tekst: () => `Er komt geen gezin: er ligt minder dan ${T.GEBOUWEN_INSTELLINGEN.graanBufferVoorGroei} graan.`,
    },
    {
      id: 'gezin',
      als: (D) => mensenNodig(D) > 0,
      tekst: (D) => `Het volgende gezin komt ${over(T.volgendeGezinDag(D) - dagNu(D))}.`,
    },
  ];

  // De raad van nu: { id, tekst }, of null. Alleen in het gehucht zelf (een wereld met een plein, waar de heer
  // komt), en niet als de spelregel hem uitzette.
  T.raadNu = function (D) {
    if (!IN().aan || !(D.wereld && D.wereld.plein) || !D.kalender || !D.voorraad) return null;
    for (const r of T.RADEN) if (r.als(D)) return { id: r.id, tekst: r.tekst(D) };
    return null;
  };
})(globalThis.Spel = globalThis.Spel || {});
