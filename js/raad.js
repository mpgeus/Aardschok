// De raad onder het doel (werklijst vraag 58, B; Marcel, 29 sep: "B onder het doel"). Linksboven staat het doel,
// "26 van 50 mensen · nog geen kapel · nog geen smidse" (js/treden.js), en daaronder één regel die zegt wat nu tussen
// jou en een dorp staat, met de toets erbij. Het is geen rij opdrachten die je afwerkt, maar wat nu telt: de eerste
// raad uit T.RADEN die nu geldt. Zo blijft niemand op een stap hangen, komt een toets pas als je hem nodig hebt, en
// blijft het na de eerste weken nuttig. Het zijn de eerste weken als opdrachten (vraag 47), herschreven.
//
// Of er een gezin komt, vraagt de raad aan de groei zelf (T.waaromGeenGezin en T.volgendeGezinDag, js/gebouwen.js),
// of het hout en het eten de winter halen aan het dorp (T.houtVoorDeWinter en T.etenVoorDeWinter, js/behoeften.js),
// en wat de huizen missen aan de wensen (T.watDeHuizenMissen, js/wensen.js; vraag 87): de raad zegt wat het spel doet,
// en rekent niet naast het spel.
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
    // Zoveel dagen na een aanval van de rovers zegt de raad wat een wachthuis doet, als er geen is.
    roversNa: 10,
    // Zoveel dagen nadat een voorval voorbijging dat een raadsman had beslist, als je er een had (js/voorvallen.js: je
    // was weg), zegt de raad: kies een raadsman (js/raadsman.js).
    raadsmanNa: 10,
    // Hangt je oproep zoveel dagen op het plein en kan het dorp hem niet betalen, dan zegt de raad wat er mist
    // (js/verzoeken.js).
    oproepNa: 7,
  };
  const IN = () => T.RAAD_INSTELLINGEN;

  const dagNu = (D) => Math.floor(D.kalender.dag);
  const over = (n) => (n <= 1 ? 'morgen' : `over ${n} dagen`);
  const maandIdx = (naam) => T.MAANDEN.findIndex((m) => m.naam === naam);
  const heeft = (D, soort) => (D.gebouwen || []).some((g) => g.soort === soort);
  // Staat elke houthakker stil omdat er binnen zijn bereik geen boom meer staat (T.houthakkerZonderBoom, js/bos.js)?
  const geenBoomMeer = (D) => {
    const hakkers = (D.gebouwen || []).filter((g) => g.klaar && T.GEBOUWEN[g.soort].bos);
    return hakkers.length > 0 && hakkers.every(T.houthakkerZonderBoom);
  };

  // Hoeveel mensen het doel nog vraagt: de volgende trede (js/treden.js), en na de laatste de maat van de winst
  // (js/einde.js; werklijst vraag 102, c).
  const mensenNodig = (D) => (T.volgendeTrede(D) ? T.tredeMensenNodig(D) : T.mensenVoorDeWinst(D));

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

  // Het hout of het eten (`voorDeWinter`: T.houtVoorDeWinter of T.etenVoorDeWinter) haalt de winter niet, en die is
  // in zicht (T.winterInZicht, js/behoeften.js: vanaf 1 herfstmaand, net als het dorp zelf), of al begonnen. Eerst de
  // dagen tot de winter: dat is goedkoop, het eten niet.
  const haaltHetNiet = (D, voorDeWinter) => T.winterInZicht(D.kalender.dag) && !voorDeWinter(D, D.kalender.dag).haalt;
  // Haalt het de winter niet, dan komt er geen gezin (js/gebouwen.js, gezinWachtOpDeWinter): dat zegt de raad erbij.
  const geenGezin = () => (T.GEBOUWEN_INSTELLINGEN.gezinWachtOpDeWinter ? ' Tot het genoeg is, komt er geen gezin.' : '');
  // Hoe ver het komt, zoals het dorp het zegt (js/behoeften.js): "26 van de 90 dagen". Zo weet je of één houthakker
  // genoeg is; de bouwer die alleen hoorde dat het niet genoeg was, bouwde er een na de ander (29 sep).
  const haalt = (v) => `${v.dagen} van de ${v.winter} dagen`;

  // Wat je mist om deze soorten te bouwen: { goud, hout, ... }, goud eerst, of null als je ze kunt betalen. Alles samen,
  // want wie eerst de kapel bouwt, heeft daarna minder voor de smidse.
  function tekortVoor(D, soorten) {
    const mist = { goud: 0, hout: 0 };
    for (const soort of soorten) for (const wat of Object.keys(T.GEBOUWEN[soort].kosten)) mist[wat] = 0;
    for (const wat of Object.keys(mist)) {
      const nodig = soorten.reduce((som, soort) => som + (T.GEBOUWEN[soort].kosten[wat] || 0), 0);
      const tekort = Math.ceil(nodig - (D.voorraad[wat] || 0) - 1e-9);
      if (tekort > 0) mist[wat] = tekort;
      else delete mist[wat];
    }
    return Object.keys(mist).length ? mist : null;
  }

  // Wat je mist voor de gebouwen die het doel nog vraagt (T.doelGebouwen, js/treden.js): { soorten, mist }, of null.
  function tekortVoorHetDoel(D) {
    const soorten = T.doelGebouwen(D);
    const mist = soorten.length ? tekortVoor(D, soorten) : null;
    return mist ? { soorten, mist } : null;
  }

  // Waar het vandaan komt (werklijst vraag 59, C): goud van de marskramer, die graan koopt, en van de belasting; hout
  // van een houthakker, behalve als je juist die wilt bouwen (`voor`).
  function waarVandaan(D, mist, voor) {
    const bronnen = [];
    if (mist.goud) {
      bronnen.push(T.kanHandelen(D) ? 'de marskramer koopt graan, zolang hij er is' : `de marskramer koopt graan in ${T.volgendeMarskramer(D.kalender.dag)}`);
      bronnen.push(T.standVanWet(D, 'belasting') === 'aangenomen' ? 'de belasting brengt elke maand goud' : 'belasting [W] brengt elke maand goud');
    }
    if (mist.hout && voor !== 'houthakker') {
      bronnen.push(heeft(D, 'houthakker') ? 'de houthakker hakt hout' : T.VERZOEKEN_INSTELLINGEN.mensen ? 'een houthakker zou hout hakken' : 'een houthakker [B] hakt hout');
    }
    return bronnen;
  }
  const hoeveelTekst = (mist) => T.opsomming(Object.entries(mist).map(([wat, n]) => `${n} ${wat}`));

  // Bouwen de mensen (js/verzoeken.js, de spelregel "Wie bouwt"; werklijst vraag 103), dan zegt de raad wat zou helpen,
  // zonder [B], en of iemand je er al om vraagt.
  const mensenBouwen = () => T.VERZOEKEN_INSTELLINGEN.mensen;
  // Helpt een jager tegen een winter zonder eten: vlees vult een maag, en er is geen jager die geen hert vindt dat hij mag
  // schieten (T.jagersZonderHerten, js/beesten.js; Marcel, 7 okt, vraag 116, k). In de speeltest van 7 okt vroeg het dorp
  // anders jager na jager, tot er 9 tot 11 stonden, die alleen klein wild schoten.
  const jagerHelpt = (D) => T.BEHOEFTEN_INSTELLINGEN.vleesIsEten && T.jagersZonderHerten(D) === 0;
  const verzoekZin = (D, soort) => (mensenBouwen() && soort ? T.verzoekZin(D, soort) : '');

  // Je oproep op het plein (js/verzoeken.js; vraag 103, c) die er al oproepNa dagen hangt, terwijl het dorp niet kan
  // betalen wat hij kost (met de premie): { soort, mist }, of null.
  function oproepDieWacht(D) {
    if (!mensenBouwen() || !D.verzoeken || !D.verzoeken.oproepen) return null;
    for (const o of D.verzoeken.oproepen) {
      if (dagNu(D) - o.dag < IN().oproepNa) continue;
      const mist = {};
      for (const [wat, n] of Object.entries(T.kostenVanVerzoek({ soort: o.soort, premie: T.VERZOEKEN_INSTELLINGEN.premie }))) {
        const tekort = Math.ceil(n - (D.voorraad[wat] || 0) - 1e-9);
        if (tekort > 0) mist[wat] = tekort;
      }
      if (Object.keys(mist).length) return { soort: o.soort, mist };
    }
    return null;
  }

  // Een huis met mensen dat alles heeft, maar niet kan doorgroeien, ook niet als het gezin eerst rooit (vraag 130, c2):
  // { g, waarom }, of null.
  function huisDatNietGroeit(D) {
    for (const g of D.gebouwen || []) {
      if (!g.wensen || !g.wensen.mensen || !g.wensen.alles || g.groeitNaRooien) continue;
      const waarom = T.waaromGroeitHetNiet(D, g);
      if (waarom) return { g, waarom };
    }
    return null;
  }

  // Het eerste wat de huizen missen waar je nu iets aan kunt doen (T.watDeHuizenMissen, js/wensen.js), van deze soort
  // ('bouwstof' of 'wens'), of null.
  const watNuHelpt = (D, soort) => T.watDeHuizenMissen(D).find((x) => x.soort === soort && x.kan) || null;
  // Wat erbij komt als je niet kunt betalen wat helpt: wat je mist, en waar het vandaan komt. Anders hoor je het niet
  // meer, want de wensen gaan voor wat het doel vraagt.
  function wensTekst(D, x) {
    const vraagt = verzoekZin(D, x.bouw);
    if (vraagt) return `${x.tekst}${vraagt}`;
    const mist = tekortVoor(D, [x.bouw]);
    if (!mist) return x.tekst;
    const bronnen = waarVandaan(D, mist, x.bouw);
    return `${x.tekst} Daarvoor mis je ${hoeveelTekst(mist)}${bronnen.length ? `: ${T.opsomming(bronnen)}` : ''}.`;
  }

  // De marskramer staat op het plein, op zijn laatste ronde vóór de heer komt (js/handel.js).
  function marskramerInDeHerfst(D) {
    const m = D.marskramer;
    return !!(m && m.staat && !m.weg && T.HANDEL_INSTELLINGEN.bezoeken[m.bezoek] && T.HANDEL_INSTELLINGEN.bezoeken[m.bezoek].naam === 'herfst');
  }

  // De raden, van wat het zwaarst weegt naar wat het minst weegt. `als(S)` zegt of hij nu geldt, `tekst(S)` wat er
  // dan staat. Wat aan een dag hangt, gaat voor; dan de winter; dan de eerste dag; dan een vol dorp; dan de wensen
  // (vraag 87); dan het doel en de groei.
  T.RADEN = [
    // Twee bazen (js/bazen.js; werklijst vraag 106): staat een van de twee onder de grens, dan gaat dat voor alles.
    {
      id: 'heerWaarschuwt',
      als: (D) => { const b = T.bazenNu(D); return !!b && b.gunst < T.BAZEN_INSTELLINGEN.waarschuwing; },
      tekst: () => 'De heer gaf je een laatste waarschuwing. Nog één tegenvaller, en je bent je ambt kwijt.',
    },
    {
      id: 'dorpMort',
      als: (D) => { const b = T.bazenNu(D); return !!b && b.vertrouwen < T.BAZEN_INSTELLINGEN.waarschuwing; },
      tekst: () => 'Het dorp mort. Nog één tegenvaller, en ze jagen je weg: zeg eens ja, of geef een feest.',
    },
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
      tekst: (D) => (mensenBouwen()
        ? `De rovers komen terug. Een wachthuis zou je ${T.telwoord(T.GEBOUWEN.wachthuis.handen)} man geven die meevechten.${verzoekZin(D, 'wachthuis')}`
        : `De rovers komen terug. Een wachthuis [B] geeft je ${T.telwoord(T.GEBOUWEN.wachthuis.handen)} man die meevechten.`),
    },
    // De wolven (js/beesten.js; werklijst vraag 116, stap 2b): ze namen een schaap of vielen iemand aan. Wat ertegen helpt:
    // het licht, het hek uit het voorval, en een jager die de roedels klein houdt (stap 3a; is er geen bij de wolven, dan
    // zegt de raad het, met waar hij vandaan komt).
    {
      id: 'wolven',
      als: (D) => T.wolvenBijHetDorp(D, dagNu(D)) != null && D.beesten.gezien.wat !== 'gezien',
      tekst: (D) => {
        const zin = 'Er zijn wolven bij het dorp. Wie \'s avonds alleen in het donker loopt, loopt gevaar; licht houdt ze weg.';
        if (T.jagerBijDeWolven(D)) return zin;
        return mensenBouwen() ? `${zin} Een jager zou de roedels klein houden.${verzoekZin(D, 'jager')}` : `${zin} Een jager [B] houdt de roedels klein.`;
      },
    },
    {
      id: 'hout',
      als: (D) => haaltHetNiet(D, T.houtVoorDeWinter),
      tekst: (D) => {
        const helpt = mensenBouwen()
          ? `${heeft(D, 'houthakker') ? 'nog een houthakker' : 'een houthakker'} zou helpen.${verzoekZin(D, 'houthakker')}`
          : `${heeft(D, 'houthakker') ? 'nog een houthakker [B] hakt erbij' : 'bouw een houthakker [B]'}.`;
        return `Het hout haalt ${haalt(T.houtVoorDeWinter(D, D.kalender.dag))} van de winter: ${helpt}${geenGezin()}`;
      },
    },
    {
      id: 'eten',
      als: (D) => haaltHetNiet(D, T.etenVoorDeWinter),
      // Wat helpt, zegt het dorp ook (js/behoeften.js): een jager, als vlees een maag vult en er herten zijn die hij mag
      // schieten (jagerHelpt; js/beesten.js).
      tekst: (D) => {
        const vlees = T.GEBOUWEN.jager.maakt.uit.vlees;
        const helpt = jagerHelpt(D);
        const jager = mensenBouwen() ? `: een jager zou ${vlees} vlees per dag schieten` : `: een jager [B] schiet ${vlees} vlees per dag`;
        return `Het eten haalt ${haalt(T.etenVoorDeWinter(D, D.kalender.dag))} van de winter${helpt ? jager : ''}.${helpt ? verzoekZin(D, 'jager') : ''}${geenGezin()}`;
      },
    },
    // De houthakker hakt bomen om (js/bos.js; vraag 115): staat er binnen zijn bereik geen boom meer, dan hakt hij niets,
    // tot de boompjes die hij plantte, bomen zijn, en werkt zijn hand zolang elders (vraag 129, e). Haalt het hout de
    // winter niet, dan zegt de raad daarboven dat een houthakker zou helpen.
    {
      id: 'geenBoom',
      als: (D) => geenBoomMeer(D),
      tekst: () => `De houthakker staat stil: er staat geen boom meer binnen ${T.telwoord(T.BOS_INSTELLINGEN.hakStraal)} tegels van zijn schuur, tot zijn boompjes bomen zijn. Zijn hand werkt zolang ergens anders.`,
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
      // Een nieuw spel begint zonder raadsman, en zonder raadsman geen rapport (js/ochtendrapport.js): de eerste dagen
      // zegt de raad het (werklijst vraag 75, c; Marcel: "c ja").
      id: 'rapport',
      als: (D) => T.OCHTENDRAPPORT_INSTELLINGEN.aan && T.RAADSMAN_INSTELLINGEN.aan && !T.raadsmanVan(D)
        && D.kalender.dag >= 1 && dagNu(D) < T.OCHTENDRAPPORT_INSTELLINGEN.raadTot,
      tekst: () => 'Een raadsman brengt je elke ochtend een rapport: kies er een [R].',
    },
    {
      // Groeien en winnen (werklijst vraag 102, c; Marcel, 3 okt: "102 a b c d e ja"): op een vrij erf zet een nieuw
      // gezin een hut, en wie in een hut woont, is niet super gelukkig (js/einde.js). Heeft het dorp de maat van de winst,
      // dan zegt de raad dat je het erf weghaalt (in het bouwmenu, met het erf in de hand, klik je erop; js/main.js).
      // Nieuwe gezinnen trekken dan alleen nog in de plaats die doorgroeiende huizen vrijmaken.
      id: 'geenErf',
      als: (D) => T.maatGehaald(D) && T.vrijeErven(D).length > 0,
      tekst: (D) => {
        const wat = T.vrijeErven(D).length === 1 ? 'het erf' : 'de vrije erven';
        return `Genoeg mensen voor de winst. Op een vrij erf begint een nieuw gezin in een hut, en dan begint de teller opnieuw: haal ${wat} weg ([B], Erf, en klik erop).`;
      },
    },
    {
      // Een huis dat alles heeft, maar niet kan doorgroeien (werklijst vraag 130, c2; Marcel, 6 okt: "Eens alle 3"): voor de
      // winst moet het een stenen huis worden, en zonder de raad zie je niet waarom de teller niet loopt. Waarom, zegt
      // T.waaromGroeitHetNiet (js/behoeften.js), net als het briefje bij het huis.
      id: 'groeitNiet',
      als: (D) => T.maatGehaald(D) && !!huisDatNietGroeit(D),
      tekst: (D) => {
        const { g, waarom } = huisDatNietGroeit(D);
        return `Genoeg mensen voor de winst, maar ${T.huisVan(D, g)} kan geen ${T.GEBOUWEN[T.GEBOUWEN[g.soort].wordt].naam} worden: ${waarom}.`;
      },
    },
    {
      id: 'plaats',
      als: (D) => mensenNodig(D) > 0 && T.waaromGeenGezin(D).includes('plaats'),
      tekst: () => (T.ERVEN_INSTELLINGEN.dorpBouwtZelf
        ? 'Er komt geen gezin: het dorp is vol. Wijs een erf aan: [B], dan Erf.'
        : 'Er komt geen gezin: het dorp is vol. Bouw een hut of een huis: [B].'),
    },
    {
      // De wensen (werklijst vraag 86, a, en 87; Marcel, 2 okt: "a ja"): wat de huizen missen en wat helpt, zoals
      // T.watDeHuizenMissen (js/wensen.js) het zegt, en alleen wat je nu kunt doen. Eerst een huis dat een maand alles had
      // en op bouwstof wacht, dan wat de meeste mensen missen. Vóór wat het doel vraagt, want met de wensen win je (vraag
      // 80): "Vijf boerderijen en een huis willen een kapel binnen 40 tegels [B]."
      id: 'doorgroeien',
      als: (D) => !!watNuHelpt(D, 'bouwstof'),
      tekst: (D) => wensTekst(D, watNuHelpt(D, 'bouwstof')),
    },
    {
      id: 'wens',
      als: (D) => !!watNuHelpt(D, 'wens'),
      tekst: (D) => wensTekst(D, watNuHelpt(D, 'wens')),
    },
    {
      // Wat je mist voor wat het doel vraagt, en waar het vandaan komt (werklijst vraag 59, C; Marcel, 1 okt, vraag 78:
      // "D dat is prima"). De tweede bouwer van de speeltest kwam twee goud tekort voor de smidse (29 sep), en goud komt
      // alleen van de marskramer en de belasting.
      id: 'bouwen',
      als: (D) => !!tekortVoorHetDoel(D),
      tekst: (D) => {
        const { soorten, mist } = tekortVoorHetDoel(D);
        const wat = T.opsomming(soorten.map((soort) => `de ${T.GEBOUWEN[soort].naam}`));
        return `Voor ${wat} mis je ${hoeveelTekst(mist)}: ${T.opsomming(waarVandaan(D, mist))}.`;
      },
    },
    {
      // Je oproep hangt al een week, en niemand kan hem bouwen: het dorp mist wat hij kost (werklijst vraag 103, c).
      id: 'oproep',
      als: (D) => !!oproepDieWacht(D),
      tekst: (D) => {
        const { soort, mist } = oproepDieWacht(D);
        const bronnen = waarVandaan(D, mist, soort);
        return `Je oproep voor een ${T.GEBOUWEN[soort].naam} hangt op het plein, maar het dorp mist ${hoeveelTekst(mist)}${bronnen.length ? `: ${T.opsomming(bronnen)}` : ''}.`;
      },
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

  // Wat het dorp nu zou willen bouwen, in de volgorde van de raad: [{ soort, waarom, voor }], met wat er gemist wordt in
  // `waarom` ("Tien stenen huizen willen laken.") en waarvoor in `voor` ('rovers', 'winter', 'hout', 'bouwstof', 'wens',
  // 'doel'). Voor de verzoeken (js/verzoeken.js; werklijst vraag 103): wat de raad je
  // liet bouwen, vraagt een inwoner je. Alleen wat al gebouwd mag worden (T.magGebouwd, js/gebouwen.js), en niet wat er
  // al gebouwd wordt. Een keten komt één voor één: staat de bakkerij er zonder meel, dan helpt een molen (js/wensen.js).
  T.watTeBouwen = function (D) {
    const uit = [];
    if (!D.kalender || !D.voorraad) return uit;
    const erbij = (soort, waarom, voor) => {
      if (!soort || uit.some((x) => x.soort === soort) || !T.magGebouwd(D, soort)) return;
      if ((D.gebouwen || []).some((g) => g.soort === soort && !g.klaar)) return;
      uit.push({ soort, waarom, voor });
    };
    if (D.rovers && D.rovers.laatsteAanval != null && dagNu(D) - D.rovers.laatsteAanval < IN().roversNa && !heeft(D, 'wachthuis')) {
      erbij('wachthuis', 'De rovers komen terug.', 'rovers');
    }
    if (haaltHetNiet(D, T.houtVoorDeWinter)) erbij('houthakker', `Het hout haalt ${haalt(T.houtVoorDeWinter(D, D.kalender.dag))} van de winter.`, 'winter');
    if (jagerHelpt(D) && haaltHetNiet(D, T.etenVoorDeWinter)) {
      erbij('jager', `Het eten haalt ${haalt(T.etenVoorDeWinter(D, D.kalender.dag))} van de winter.`, 'winter');
    }
    // Er hakt niemand hout: dan stopt alles, want elke hut op een erf (js/erven.js) en elk gebouw kost hout. Dus eerst een
    // houthakker, zoals de bouwer van de speeltest hem er altijd eerst neerzette (vraag 86, b). Zonder dat at het dorp in
    // de eerste speeltest van vraag 103 zijn hout op aan de kapel en de putten, en kon het daarna geen houthakker en geen
    // jager meer betalen.
    // Een houthakker die stilstaat omdat zijn bomen op zijn, is geen reden voor een nieuwe zolang het hout de winter
    // haalt (werklijst vraag 129, e): in de speeltest van 6 okt stonden er zo na vier jaar 8 tot 10, die vooral stilstonden.
    if (!heeft(D, 'houthakker')) erbij('houthakker', 'Er hakt niemand hout, en elke hut en elk gebouw kost hout.', 'hout');
    for (const x of T.watDeHuizenMissen(D)) if (x.kan && x.bouw) erbij(x.bouw, x.zin, x.soort);
    for (const soort of T.doelGebouwen(D)) erbij(soort, `Voor het doel is er een ${T.GEBOUWEN[soort].naam} nodig.`, 'doel');
    return uit;
  };

  // De raad van nu: { id, tekst }, of null. Alleen in het gehucht zelf (een wereld met een plein, waar de heer
  // komt), en niet als de spelregel hem uitzette.
  T.raadNu = function (D) {
    if (!IN().aan || !(D.wereld && D.wereld.plein) || !D.kalender || !D.voorraad) return null;
    for (const r of T.RADEN) if (r.als(D)) return { id: r.id, tekst: r.tekst(D) };
    return null;
  };
})(globalThis.Spel = globalThis.Spel || {});
