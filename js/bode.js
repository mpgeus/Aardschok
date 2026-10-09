// De bode naar de marskramer (werklijst vraag 143; Marcel, 9 okt: "misschien kunnen we de Schout de mogelijkheid geven om
// een beroep te doen om een extra marskramer om in te kunnen kopen in een moeilijke periode?", "soort van brief sturen
// met een bode", en op het plan: "1. Alleen bij een status 2. Ja vind ik goed idee. 3. Ja, je vraagt om goederen, enkele
// keer heeft hij iets niet. 4. Ja voor nu maar mee beginnen; in de winterperiode of in het donker misschien ook
// bescherming mee?").
//
// Speelt er een status waarin kopen helpt (honger, kou, droogte; T.OORZAKEN in js/voorvallen.js), dan schrijf je bij je
// huis een brief aan de marskramer, met wat je van hem wilt (het papier `bode` in js/brieven.js), en een dorpeling zonder
// werk brengt hem (T.stuurBode): hij loopt de weg af (T.stuurWeg, js/bewoners.js) en krijgt loon uit de kas. Na een paar
// dagen (in de winter langer) staat de marskramer op het plein, buiten zijn vaste rondes, met wat je vroeg
// (T.marskramerOpBestelling in js/handel.js): soms heeft hij iets niet of maar de helft, en alles kost meer dan anders,
// in de winter nog meer. In de winter kun je een weerbare man meesturen ter bescherming; zonder haalt de bode het soms
// niet, en komt hij terug zonder marskramer. Wat er onderweg is, staat in `D.bode`; elke nacht kijkt T.tikBodeDag of ze
// er zijn. De spelregel "De bode"; de getallen in T.BODE_INSTELLINGEN.
(function (T) {
  'use strict';

  T.BODE_INSTELLINGEN = {
    // Kan de schout een bode sturen (de spelregel "De bode")?
    aan: true,
    // Bij welke statussen (T.OORZAKEN): alleen als er iets speelt waar kopen bij helpt.
    statussen: ['honger', 'kou', 'droogte'],
    // Het loon van de bode, en van zijn begeleider, in goud uit de kas.
    loon: 0.3,
    // Na zoveel dagen staat de marskramer op het plein (de bode heen, en samen terug), en zo lang blijft hij.
    dagen: { gewoon: 6, winter: 10 },
    blijftDagen: 5,
    // Zoveel keer de gewone prijs (hij weet dat je hem nodig hebt, en de weg was lang).
    prijsMaal: { gewoon: 1.5, winter: 2 },
    // De kans dat hij iets wat je vroeg niet heeft, en dat hij er maar de helft van heeft.
    nietBijZich: 0.15,
    halfBijZich: 0.25,
    // In de winter, zonder begeleider: de kans dat de bode het niet haalt (de sneeuw, de wolven).
    winterKwijt: 0.35,
    // Wat je kunt vragen: per pak van `per` stuks, de gewone prijs in goud per pak, en hooguit zoveel pakken.
    waren: {
      graan: { per: 10, prijs: 5, hooguit: 8 },
      zout: { per: 5, prijs: 5, hooguit: 6 },
      hout: { per: 20, prijs: 2, hooguit: 5 },
      ijzer: { per: 1, prijs: 3, hooguit: 12 },
    },
  };
  const IN = () => T.BODE_INSTELLINGEN;

  const dagNu = (D) => (D.kalender ? Math.floor(D.kalender.dag) : 0);
  const inWinter = (dag) => T.datumVanDag(dag).seizoen === 'winter';
  const vanSchout = (p) => !!(p.huis && p.huis.huis === 'schout');

  // Wie de brief kan brengen: een volwassene of jongere, geen boer en niet van het huis van de schout, die er nu is; wie geen
  // werk heeft eerst.
  function wieBrengtHem(D, behalve = []) {
    if (!D.bewoners) return null;
    const kan = D.bewoners.mensen.filter((p) => (p.leeftijd === 'volwassen' || p.leeftijd === 'jong') && !p.wie && !vanSchout(p) && !p.weg && !p.komt && !behalve.includes(p));
    kan.sort((a, b) => (!!a.werk - !!b.werk) || (a.id - b.id));
    return kan[0] || null;
  }

  // De status die het toelaat, of null.
  T.statusVoorDeBode = function (D, dag = dagNu(D)) {
    return T.oorzakenNu(D, dag).find((o) => IN().statussen.includes(o.id)) || null;
  };

  // Kan de schout nu een bode sturen? { kan, reden, status, winter, dagen, maal, loon }. `zichtbaar`: of de knop er moet
  // staan (er speelt een status, en er is niemand onderweg).
  T.kanBodeSturen = function (D) {
    const dag = dagNu(D);
    const winter = inWinter(dag);
    const uit = { kan: false, zichtbaar: false, winter, dagen: IN().dagen[winter ? 'winter' : 'gewoon'], maal: IN().prijsMaal[winter ? 'winter' : 'gewoon'], loon: IN().loon };
    if (!IN().aan || !D.wereld || !D.wereld.marskramer) return { ...uit, reden: 'Hier komt geen marskramer.' };
    const status = T.statusVoorDeBode(D, dag);
    uit.status = status;
    if (D.bode) return { ...uit, reden: `De bode is onderweg; de marskramer komt rond ${T.datumVanDag(D.bode.komt).tekst}.` };
    if (D.marskramer) return { ...uit, reden: 'De marskramer is er al.' };
    if (!status) return { ...uit, reden: 'Alleen in een moeilijke tijd: honger, kou of droogte.' };
    uit.zichtbaar = true;
    if (!wieBrengtHem(D)) return { ...uit, reden: 'Er is niemand om de brief te brengen.' };
    if ((D.voorraad.goud || 0) < IN().loon) return { ...uit, reden: `De bode wil ${IN().loon * 10} zilver voor de tocht.` };
    return { ...uit, kan: true };
  };

  // Stuur de bode met deze bestelling ({ goed: pakken }); met `begeleider` gaat er een weerbare man mee (in de winter).
  // Geeft { kan, reden } of { kan: true, bode, begeleider, komt }.
  T.stuurBode = function (D, bestelling, begeleider = false) {
    const k = T.kanBodeSturen(D);
    if (!k.kan) return k;
    const vraag = {};
    for (const wat of Object.keys(bestelling || {})) {
      const W = IN().waren[wat];
      const n = Math.min(W ? W.hooguit : 0, Math.floor(bestelling[wat] || 0));
      if (n > 0) vraag[wat] = n;
    }
    if (!Object.keys(vraag).length) return { kan: false, reden: 'Schrijf in de brief wat hij moet brengen.' };
    const dag = dagNu(D);
    const bode = wieBrengtHem(D);
    const mee = begeleider ? T.weerbareMannen(D).find((p) => p !== bode) || null : null;
    if (begeleider && !mee) return { kan: false, reden: 'Er is geen weerbare man om mee te sturen.' };
    const loon = IN().loon * (mee ? 2 : 1);
    if ((D.voorraad.goud || 0) < loon) return { kan: false, reden: `De bode en zijn begeleider willen samen ${Math.round(loon * 10)} zilver.` };
    T.wijzigVoorraad(D, 'goud', -loon);
    const wie = mee ? [bode, mee] : [bode];
    T.stuurWeg(D, wie, 'bode');
    const kwijt = k.winter && !mee && T.vastLot(D, dag, 143) < IN().winterKwijt;
    D.bode = { verstuurd: dag, komt: dag + k.dagen, winter: k.winter, wie, bestelling: vraag, kwijt };
    const naam = T.naamVanBewoner(bode);
    T.zeg(D, `${naam} gaat met je brief de weg op${mee ? `, met ${T.naamVanBewoner(mee)} erbij` : ''}. De marskramer kan er rond ${T.datumVanDag(D.bode.komt).tekst} zijn.`, 'goed');
    T.schrijfOp(D, 'bode', { tekst: `${naam} ging met je brief naar de marskramer.` });
    return { kan: true, bode, begeleider: mee, komt: D.bode.komt };
  };

  // Elke nacht (T.tikGebouwenDag, js/gebouwen.js): zijn ze er? Staat de gewone marskramer nog op het plein, dan wachten ze
  // een dag.
  T.tikBodeDag = function (D, dag) {
    const B = D.bode;
    if (!B || dag < B.komt) return;
    if (D.marskramer) {
      B.komt = dag + 1;
      return;
    }
    D.bode = null;
    const naam = T.naamVanBewoner(B.wie[0]);
    if (B.kwijt) {
      T.komtTerug(D, B.wie, { tekst: `${naam} is terug, zonder marskramer: de sneeuw lag te hoog, en in het bos waren wolven.`, soort: 'gevaar' });
      return;
    }
    const r = T.marskramerOpBestelling(D, B.bestelling, dag, B.winter);
    const niet = r.niet.length ? ` ${T.hoofdletter(T.opsomming(r.niet))} had hij niet.` : '';
    T.komtTerug(D, B.wie, { tekst: `${naam} is terug van de marskramer.${niet}`, soort: 'goed' });
  };
})(globalThis.Spel = globalThis.Spel || {});
