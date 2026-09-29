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
  };
  const IN = () => T.RAAD_INSTELLINGEN;

  const dagNu = (S) => Math.floor(S.kalender.dag);
  const over = (n) => (n <= 1 ? 'morgen' : `over ${n} dagen`);
  const maandIdx = (naam) => T.MAANDEN.findIndex((m) => m.naam === naam);
  const heeft = (S, soort) => (S.gebouwen || []).some((g) => g.soort === soort);

  // Hoeveel mensen het doel nog vraagt (js/treden.js), of 0 als er geen trede meer te halen is.
  function mensenNodig(S) {
    const trede = T.volgendeTrede(S);
    return trede ? Math.max(0, T.TREDEN_INSTELLINGEN[trede].mensen - (S.bevolking || 0)) : 0;
  }

  // Over hoeveel dagen de inner komt (T.INNER_INSTELLINGEN.komt), als dat binnen `binnen` dagen is; anders null.
  function innerOver(S, binnen) {
    const komt = T.INNER_INSTELLINGEN.komt;
    for (let n = 1; n <= binnen; n++) {
      const d = T.datumVanDag(dagNu(S) + n);
      if (T.MAANDEN[d.maand].naam === komt.maand && d.dagVanMaand === komt.dag) return n;
    }
    return null;
  }

  // Van na Sint-Maarten tot 1 lentemaand, als er gezaaid wordt: de tijd waarin wat in een kelder ligt, niemand voedt.
  function naSintMaarten(S) {
    const d = T.datumVanDag(S.kalender.dag);
    const sm = T.SINT_MAARTEN;
    return (d.maand === sm.maand && d.dagVanMaand > sm.dag) || d.maand > sm.maand || d.maand < maandIdx('lentemaand');
  }

  // Het hout of het eten (`voorDeWinter`: T.houtVoorDeWinter of T.etenVoorDeWinter) haalt de winter niet, en die
  // is binnen winterVooraf dagen, of al begonnen. Eerst de dagen tot de winter: dat is goedkoop, het eten niet.
  const haaltHetNiet = (S, voorDeWinter) => T.dagenTotDeWinter(S.kalender.dag) <= IN().winterVooraf && !voorDeWinter(S, S.kalender.dag).haalt;
  // Hoe ver het komt, zoals het dorp het zegt (js/behoeften.js): "26 van de 90 dagen". Zo weet je of één houthakker
  // genoeg is; de bouwer die alleen hoorde dat het niet genoeg was, bouwde er een na de ander (29 sep).
  const haalt = (v) => `${v.dagen} van de ${v.winter} dagen`;

  // De marskramer staat op het plein, op zijn laatste ronde vóór de heer komt (js/handel.js).
  function marskramerInDeHerfst(S) {
    const m = S.marskramer;
    return !!(m && m.staat && !m.weg && T.HANDEL_INSTELLINGEN.bezoeken[m.bezoek] && T.HANDEL_INSTELLINGEN.bezoeken[m.bezoek].naam === 'herfst');
  }

  // De raden, van wat het zwaarst weegt naar wat het minst weegt. `als(S)` zegt of hij nu geldt, `tekst(S)` wat er
  // dan staat. Wat aan een dag hangt, gaat voor; dan de winter; dan de eerste dag; dan de groei.
  T.RADEN = [
    {
      id: 'inner',
      als: (S) => innerOver(S, IN().innerVooraf) != null,
      tekst: (S) => `De inner komt ${over(innerOver(S, IN().innerVooraf))}. Wat hij niet ziet, telt de heer niet.`,
    },
    {
      id: 'heerGoud',
      als: (S) => marskramerInDeHerfst(S) && (S.voorraad.goud || 0) < (T.eisVanDeHeer(S).per.goud || 0),
      tekst: (S) => `De heer wil ${Math.ceil(T.eisVanDeHeer(S).per.goud)} goud, en je hebt er ${Math.floor(S.voorraad.goud || 0)}. De marskramer koopt graan, zolang hij er is.`,
    },
    {
      id: 'rovers',
      als: (S) => S.rovers && S.rovers.laatsteAanval != null && dagNu(S) - S.rovers.laatsteAanval < IN().roversNa && !heeft(S, 'wachthuis'),
      tekst: () => `De rovers komen terug. Een wachthuis [B] geeft je ${T.telwoord(T.GEBOUWEN.wachthuis.handen)} man die meevechten.`,
    },
    {
      id: 'hout',
      als: (S) => haaltHetNiet(S, T.houtVoorDeWinter),
      tekst: (S) => `Het hout haalt ${haalt(T.houtVoorDeWinter(S, S.kalender.dag))} van de winter: ${heeft(S, 'houthakker') ? 'nog een houthakker [B] hakt erbij' : 'bouw een houthakker [B]'}.`,
    },
    {
      id: 'eten',
      als: (S) => haaltHetNiet(S, T.etenVoorDeWinter),
      // Wat helpt, zegt het dorp ook (js/behoeften.js): een jager, als vlees een maag vult.
      tekst: (S) => `Het eten haalt ${haalt(T.etenVoorDeWinter(S, S.kalender.dag))} van de winter${T.BEHOEFTEN_INSTELLINGEN.vleesIsEten ? `: een jager [B] schiet ${T.GEBOUWEN.jager.maakt.uit.vlees} vlees per dag` : ''}.`,
    },
    {
      id: 'kelders',
      als: (S) => naSintMaarten(S) && !(S.heer && S.heer.bezoek) && T.verstoptTotaal(S).graan >= 1,
      tekst: (S) => `In de kelders ligt nog ${Math.floor(T.verstoptTotaal(S).graan)} graan. Dat eet niemand en zaait niemand.`,
    },
    {
      id: 'tijd',
      als: (S) => S.kalender.dag < 1 && !(S.kalender.snelheid > 1),
      tekst: () => 'Een dag duurt lang: [+] zet de tijd sneller, en [Z] is slapen tot de ochtend.',
    },
    {
      id: 'plaats',
      als: (S) => mensenNodig(S) > 0 && T.waaromGeenGezin(S).includes('plaats'),
      tekst: () => (T.ERVEN_INSTELLINGEN.dorpBouwtZelf
        ? 'Er komt geen gezin: het dorp is vol. Wijs een erf aan: [B], dan Erf.'
        : 'Er komt geen gezin: het dorp is vol. Bouw een hut of een huis: [B].'),
    },
    {
      id: 'tevreden',
      als: (S) => mensenNodig(S) > 0 && T.waaromGeenGezin(S).includes('tevreden'),
      tekst: (S) => `Er komt geen gezin: het dorp is ${Math.round(S.behoeften.tevredenheid * 100)}% tevreden, en een gezin wil ${Math.round(T.BEHOEFTEN_INSTELLINGEN.groeiDrempel * 100)}%.`,
    },
    {
      id: 'graan',
      als: (S) => mensenNodig(S) > 0 && T.waaromGeenGezin(S).includes('graan'),
      tekst: () => `Er komt geen gezin: er ligt minder dan ${T.GEBOUWEN_INSTELLINGEN.graanBufferVoorGroei} graan.`,
    },
    {
      id: 'gezin',
      als: (S) => mensenNodig(S) > 0,
      tekst: (S) => `Het volgende gezin komt ${over(T.volgendeGezinDag(S) - dagNu(S))}.`,
    },
  ];

  // De raad van nu: { id, tekst }, of null. Alleen in het gehucht zelf (een wereld met een plein, waar de heer
  // komt), en niet als de spelregel hem uitzette.
  T.raadNu = function (S) {
    if (!IN().aan || !(S.wereld && S.wereld.plein) || !S.kalender || !S.voorraad) return null;
    for (const r of T.RADEN) if (r.als(S)) return { id: r.id, tekst: r.tekst(S) };
    return null;
  };
})(globalThis.Spel = globalThis.Spel || {});
