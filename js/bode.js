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
// in de winter nog meer.
//
// Onderweg kan hij onderschept worden (Marcel, 9 okt: "De bode moet "onderschept" kunnen worden. dat maakt het spannend.
// Je moet wel bescherming mee kunnen sturen", en "iedereen kan dood"): door de rovers uit het bos, vaker naarmate hun
// bende groter is, in de winter en in het donker vaker; of door de mannen van de heer, die je brief meenemen (dan weet
// de heer dat je goud hebt om te kopen). Je stuurt tot drie weerbare mannen mee: tegen de rovers vechten ze, een
// veteraan telt dubbel en wapens helpen, en wie vecht, kan gewond raken of sneuvelen, de bode ook. Wie hem onderschept,
// valt vast bij het vertrekken (T.stuurBode, `D.bode.onderschept`); hoe het afloopt, als de dag van terugkomen er is
// (T.bodeOnderweg). Wat er onderweg is, staat in `D.bode`; elke nacht kijkt T.tikBodeDag of ze er zijn. De spelregel
// "De bode"; de getallen in T.BODE_INSTELLINGEN.
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
    // Onderweg (werklijst vraag 143, het vervolg). De rovers uit het bos: de kans dat ze hem onderscheppen is `basis` plus
    // `perRover` per man van hun bende, maal `winter` in de winter en `donker` als hij in het donker vertrekt, en hooguit
    // `hooguit`. Ze zijn dan met `aanvallers` man, of met hun bende als die groter is.
    rovers: { basis: 0.06, perRover: 0.05, winter: 1.6, donker: 1.6, hooguit: 0.8, aanvallers: 2 },
    // Zo vaak houden de rovers hem aan op je eigen kaart, bij de uitgang (de hinderlaag, js/rovers.js), als hij nog op de
    // kaart is: vanaf `afstand` tegels van de uitgang komen ze, en na `uren` uur, als de schout niet kwam, loopt het af
    // zoals onderweg. Anders gebeurt het buiten beeld, en hoor je het als hij terug is.
    opDeKaart: 0.5,
    hinderlaag: { afstand: 10, uren: 1.5 },
    // De mannen van de heer: de kans is `basis` plus `perArgwaan` maal de argwaan van de inner (0 tot 1). Ze nemen de
    // brief mee; de argwaan gaat omhoog en de gunst omlaag. Met hen vecht niemand: weerstand tegen de heer is het ergste.
    heer: { basis: 0.04, perArgwaan: 0.2, argwaan: 0.1, gunst: 5 },
    // Bescherming: hooguit zoveel mannen mee. In het gevecht telt de bode `bode`, een man 1 en een veteraan `veteraan`, en
    // met een wapen voor elke man alles maal `wapens`; de kans dat ze de rovers afslaan is hun kracht gedeeld door hun
    // kracht plus het aantal rovers.
    meeHooguit: 3,
    kracht: { bode: 0.5, man: 1, veteraan: 2, wapens: 1.5 },
    // Wie vocht en het afsloeg: per man de kans dat hij sneuvelt, of gewond raakt; en de kans dat er een rover sneuvelt.
    afgeslagen: { dood: 0.08, gewond: 0.25, roverDood: 0.5 },
    // Wie beroofd werd: per man (de bode ook) de kans dat hij sneuvelt; wie leeft, is gewond.
    beroofd: { dood: 0.2 },
    // Wie gewond is, ligt zoveel dagen in bed (p.gewond, p.thuisTot; T.blijftThuis in js/bewoners.js).
    gewondDagen: 3,
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

  const bende = (D) => (D.rovers && D.rovers.bende ? D.rovers.bende.length : 0);
  const inHetDonker = (D) => T.lichtVan(D.kalender.dag).nacht >= 0.5;

  // De kans dat de rovers en de mannen van de heer hem onderscheppen, als hij nu vertrekt.
  T.bodeGevaar = function (D, winter = inWinter(dagNu(D)), donker = inHetDonker(D)) {
    const R = IN().rovers;
    const H = IN().heer;
    const rovers = Math.min(R.hooguit, (R.basis + R.perRover * bende(D)) * (winter ? R.winter : 1) * (donker ? R.donker : 1));
    const argwaan = (D.inner && D.inner.argwaan) || 0;
    return { rovers, heer: H.basis + H.perArgwaan * argwaan, bende: bende(D), winter, donker };
  };

  // Hoe sterk wie onderweg is, tegen de rovers: de bode, en wie meegaat.
  T.bodeKracht = function (D, mee) {
    const K = IN().kracht;
    let kracht = K.bode;
    for (const p of mee) kracht += p.veteraan ? K.veteraan : K.man;
    if (mee.length && T.wapensInHetDorp(D) >= mee.length) kracht *= K.wapens;
    return kracht;
  };
  const roversMet = (D) => Math.max(IN().rovers.aanvallers, bende(D));
  // De kans dat ze de rovers afslaan.
  T.bodeSlaatAf = (D, mee) => {
    const k = T.bodeKracht(D, mee);
    return k / (k + roversMet(D));
  };

  // Wie er mee zou gaan als je `n` mannen meestuurt (de weerbare mannen, niet de bode zelf).
  T.bodeBegeleiders = function (D, n, bode = wieBrengtHem(D)) {
    return T.weerbareMannen(D).filter((p) => p !== bode).slice(0, Math.max(0, Math.min(IN().meeHooguit, n | 0)));
  };

  // Het gevaar in woorden, voor de brief: met `n` mannen erbij.
  T.bodeGevaarTekst = function (D, n) {
    const g = T.bodeGevaar(D);
    const mee = T.bodeBegeleiders(D, n);
    const woord = (k) => (k < 0.1 ? 'klein' : k < 0.25 ? 'reëel' : k < 0.45 ? 'groot' : 'heel groot');
    const waarom = [g.bende ? `een bende van ${g.bende} in het bos` : 'rovers van buiten', g.winter ? 'de winter' : '', g.donker ? 'het donker' : ''].filter(Boolean);
    const af = Math.round(T.bodeSlaatAf(D, mee) * 100);
    const met = mee.length
      ? `Met ${T.opsomming(mee.map((p) => T.naamVanBewoner(p)))} erbij slaan ze de rovers in ${af} van de 100 keer af.`
      : `Alleen slaat de bode ze in ${af} van de 100 keer af.`;
    return `Het gevaar onderweg is ${woord(g.rovers)} (${T.opsomming(waarom)}). ${met}`;
  };

  // Stuur de bode met deze bestelling ({ goed: pakken }); met `mee` gaan er zoveel weerbare mannen mee (true is één).
  // Geeft { kan, reden } of { kan: true, bode, begeleiders, begeleider, komt }.
  T.stuurBode = function (D, bestelling, mee = 0) {
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
    const aantal = mee === true ? 1 : Math.min(IN().meeHooguit, Math.max(0, mee | 0));
    const begeleiders = T.bodeBegeleiders(D, aantal, bode);
    if (begeleiders.length < aantal) return { kan: false, reden: aantal === 1 ? 'Er is geen weerbare man om mee te sturen.' : `Er zijn geen ${T.telwoord(aantal)} weerbare mannen om mee te sturen.` };
    const loon = IN().loon * (1 + begeleiders.length);
    if ((D.voorraad.goud || 0) < loon) return { kan: false, reden: `De bode en wie meegaat, willen samen ${Math.round(loon * 10)} zilver.` };
    T.wijzigVoorraad(D, 'goud', -loon);
    const wie = [bode, ...begeleiders];
    T.stuurWeg(D, wie, 'bode');
    // Wie hem onderschept, valt nu: het uur waarop hij vertrekt, telt (het donker).
    const g = T.bodeGevaar(D, k.winter);
    const uur = Math.floor(D.kalender.dag * 24);
    const onderschept = T.vastLot(D, uur, 1431) < g.heer ? 'heer' : T.vastLot(D, uur, 1432) < g.rovers ? 'rovers' : null;
    D.bode = { verstuurd: D.kalender.dag, komt: dag + k.dagen, winter: k.winter, wie, bestelling: vraag, onderschept };
    // Op je eigen kaart: de rovers wachten hem op bij de uitgang (js/rovers.js), als er niet al rovers op de kaart zijn.
    const R = D.rovers || (D.rovers = T.nieuweRovers());
    if (onderschept === 'rovers' && bode.wezen && T.wegInEnUit(D.wereld) && !R.aanval && T.vastLot(D, uur, 1435) < IN().opDeKaart) {
      D.bode.hinderlaag = true;
      R.aanval = { soort: 'hinderlaag', dag, fase: 'wacht' };
    }
    const naam = T.naamVanBewoner(bode);
    const met = begeleiders.length ? `, met ${T.opsomming(begeleiders.map((p) => T.naamVanBewoner(p)))} erbij` : '';
    T.zeg(D, `${naam} gaat met je brief de weg op${met}. De marskramer kan er rond ${T.datumVanDag(D.bode.komt).tekst} zijn.`, 'goed');
    T.schrijfOp(D, 'bode', { tekst: `${naam} ging met je brief naar de marskramer${met}.` });
    return { kan: true, bode, begeleiders, begeleider: begeleiders[0] || null, komt: D.bode.komt };
  };

  // De bode en wie meegaat, vertrekken samen: wie bij de uitgang is (T.werkBewonersBij, js/bewoners.js), wacht op wie van
  // hen nog op de kaart loopt.
  T.wachtOpDeAnderen = function (D, e) {
    const B = D.bode;
    if (!B || B.wie.length < 2 || !e.bewoner || !B.wie.includes(e.bewoner)) return false;
    return B.wie.some((p) => p.wezen && p.wezen !== e && !p.wezen.dood && D.wereld.wezens.includes(p.wezen) && T.afstand(e.vertrekt, { x: p.wezen.tx, y: p.wezen.ty }) > 2);
  };

  // Gewond: een paar dagen in bed (de wolven doen het net zo, js/beesten.js, dat ze ook weer beter maakt).
  function gewond(p, dag) {
    p.gewond = true;
    p.thuisTot = Math.floor(dag) + 1 + IN().gewondDagen;
  }

  // Hoe het onderweg afliep, op de dag dat ze terug zijn (of de marskramer komt): { door, afgeslagen, dood, gewond,
  // roverDood }. `door` is null (niemand hield hem aan), 'heer' of 'rovers'.
  T.bodeOnderweg = function (D, B, dag) {
    const uit = { door: B.onderschept || null, afgeslagen: false, dood: [], gewond: [], roverDood: false };
    if (uit.door !== 'rovers') return uit;
    const bode = B.wie[0];
    const mee = B.wie.slice(1);
    const kan = (p) => D.bewoners && D.bewoners.mensen.includes(p);
    const kanaal = Math.floor(B.verstuurd * 24);
    uit.afgeslagen = T.vastLot(D, kanaal, 1433) < T.bodeSlaatAf(D, mee.filter(kan));
    const A = IN().afgeslagen;
    B.wie.forEach((p, i) => {
      if (!kan(p)) return;
      const r = T.vastLot(D, kanaal, 1440 + i);
      if (uit.afgeslagen) {
        if (p === bode) return; // wie vocht, waren de mannen
        if (r < A.dood) uit.dood.push(p);
        else if (r < A.dood + A.gewond) uit.gewond.push(p);
      } else if (r < IN().beroofd.dood) uit.dood.push(p);
      else uit.gewond.push(p);
    });
    if (uit.afgeslagen && T.vastLot(D, kanaal, 1434) < A.roverDood) uit.roverDood = true;
    return uit;
  };

  // Een rover van de bende sneuvelt (de bode en zijn mannen sloegen ze af): de bende is er een kleiner.
  function roverSneuvelt(D) {
    const R = D.rovers;
    if (!R || !R.bende.length) return null;
    const lid = R.bende[R.bende.length - 1];
    T.roverVerslagen(D, { lid: lid.id });
    return lid;
  }

  const namen = (lijst) => T.opsomming(lijst.map((p) => T.naamVanBewoner(p)));

  // Wat de rovers deden, op de bewoners: wie sneuvelde, wie gewond is, en een rover van de bende die sneuvelde (of het
  // poppetje van de rover op de kaart, `rovers`). Geeft de zin erover, en wie er nog leeft van wie onderweg was.
  function verliezen(D, B, o, dag, rovers = []) {
    let over = '';
    if (o.dood.length) {
      T.wijzigBevolking(D, -o.dood.length, 'gesneuveld', null, o.dood);
      over += ` ${T.hoofdletter(namen(o.dood))} ${o.dood.length === 1 ? 'kwam' : 'kwamen'} om.`;
    }
    for (const p of o.gewond) gewond(p, dag);
    if (o.gewond.length) over += ` ${T.hoofdletter(namen(o.gewond))} ${o.gewond.length === 1 ? 'is' : 'zijn'} gewond.`;
    if (o.roverDood) {
      const e = rovers.find((r) => !r.dood);
      if (e) {
        e.dood = true;
        e.leven = 0;
      }
      const lid = e ? D.rovers.bende.find((l) => l.id === e.lid) : roverSneuvelt(D);
      if (e && lid) T.roverVerslagen(D, e);
      over += lid ? ` ${lid.naam}, die bij de rovers was, sneuvelde.` : ' Een van de rovers sneuvelde.';
    }
    const leeft = B.wie.filter((p) => D.bewoners && D.bewoners.mensen.includes(p));
    return { over, leeft };
  }

  // Beroofd: wie nog leeft, komt terug, zonder marskramer.
  function beroofd(D, B, over, leeft) {
    D.bode = null;
    const tekst = leeft.length
      ? `${T.naamVanBewoner(leeft[0])} is terug, zonder marskramer: rovers hielden ${B.wie.length > 1 ? 'hen' : 'hem'} op de weg aan en namen alles.${over}`
      : `De bode komt niet terug: rovers hielden ${B.wie.length > 1 ? 'hen' : 'hem'} op de weg aan.${over}`;
    if (leeft.length) T.komtTerug(D, leeft, { tekst, soort: 'gevaar' });
    else T.zeg(D, tekst, 'gevaar');
    T.schrijfOp(D, 'bode', { tekst });
  }

  // De hinderlaag op je eigen kaart (js/rovers.js, de aanval met soort 'hinderlaag'): het uur is om, en de schout kwam
  // niet. Hoe het afloopt, zegt het lot zoals onderweg (T.bodeOnderweg). Geeft of ze de rovers afsloegen.
  T.bodeAangehouden = function (D, rovers) {
    const B = D.bode;
    if (!B) return false;
    const dag = D.kalender.dag;
    const o = T.bodeOnderweg(D, B, dag);
    const { over, leeft } = verliezen(D, B, o, dag, rovers);
    if (!o.afgeslagen) {
      beroofd(D, B, over, leeft);
      return false;
    }
    B.onderschept = null;
    B.wie = leeft;
    B.aanval = ` Bij de uitgang van het dorp hielden rovers hen aan, maar ze sloegen ze af.${over}`;
    T.zeg(D, `${T.naamVanBewoner(leeft[0] || B.wie[0])} en de anderen slaan de rovers af, en gaan verder.${over}`, 'goed');
    return true;
  };

  // De schout versloeg de rovers van de hinderlaag (T.naGevecht, js/rovers.js): de weg is vrij. Wie in het gevecht viel,
  // is al geteld (T.sneuvelt).
  T.bodeWegVrij = function (D) {
    const B = D.bode;
    if (!B) return;
    B.onderschept = null;
    B.wie = B.wie.filter((p) => D.bewoners && D.bewoners.mensen.includes(p));
    B.aanval = ' Bij de uitgang van het dorp hielden rovers hen aan, en de schout sloeg ze af.';
    if (!B.wie.length) D.bode = null;
  };

  // Elke nacht (T.tikGebouwenDag, js/gebouwen.js): zijn ze er? Staat de gewone marskramer nog op het plein, dan wachten ze
  // een dag; staan ze nog in de hinderlaag op de kaart, ook.
  T.tikBodeDag = function (D, dag) {
    const B = D.bode;
    if (!B || dag < B.komt) return;
    const o = T.bodeOnderweg(D, B, dag);
    const metMarskramer = !o.door || o.afgeslagen;
    if ((metMarskramer && D.marskramer) || B.hinderlaag) {
      B.komt = dag + 1;
      return;
    }
    D.bode = null;
    const naam = T.naamVanBewoner(B.wie[0]);
    if (o.door === 'heer') {
      T.zetArgwaan(D, IN().heer.argwaan, 'De heer las je brief aan de marskramer');
      T.wijzigGunst(D, -IN().heer.gunst, 'De heer las je brief aan de marskramer: je had goud om te kopen');
      const tekst = `${naam} is terug, zonder marskramer: de mannen van de heer hielden hem aan en namen je brief mee. Nu weet de heer dat je goud hebt om te kopen.`;
      T.komtTerug(D, B.wie, { tekst, soort: 'gevaar' });
      T.schrijfOp(D, 'bode', { tekst });
      return;
    }
    const { over, leeft } = verliezen(D, B, o, dag);
    if (o.door === 'rovers' && !o.afgeslagen) {
      beroofd(D, B, over, leeft);
      return;
    }
    const r = T.marskramerOpBestelling(D, B.bestelling, dag, B.winter);
    const niet = r.niet.length ? ` ${T.hoofdletter(T.opsomming(r.niet))} had hij niet.` : '';
    const aanval = o.door === 'rovers' ? ` Onderweg vielen rovers hen aan, maar ze sloegen ze af.${over}` : B.aanval || '';
    const tekst = `${leeft.length ? T.naamVanBewoner(leeft[0]) : naam} is terug van de marskramer.${aanval}${niet}`;
    if (leeft.length) T.komtTerug(D, leeft, { tekst, soort: aanval ? 'gevaar' : 'goed' });
    else T.zeg(D, tekst, 'gevaar');
    T.schrijfOp(D, 'bode', { tekst });
  };
})(globalThis.Spel = globalThis.Spel || {});
