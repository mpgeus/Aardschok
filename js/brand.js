// De brand (werklijst vraag 144, 3; Marcel, 9 okt: "Ziekte en brand als status is ook goed. We hebben dan nog wel vuur
// nodig en huizen die 'afgefikt' zijn als art. Dan kunnen ze weer worden opgebouwd").
//
// Brandgevaar is een status (T.OORZAKEN in js/voorvallen.js): in de droogte (js/weer.js), en groot brandgevaar in een
// ernstige droogte of een droogte in een vol dorp. Dan komt het voorval "de brand" vaker. Als het begint (het uur dat wie
// het zegt, je komt zoeken), staat het huis van wie het betreft echt in brand (g.brand, en op zijn voorwerp v.brand, voor
// js/tekenen.js: vlammen, rook en licht). Met de emmers (doe.blus) is het een uur na je antwoord uit, en blijft het huis
// meestal staan; anders brandt het af. Wat afbrandt, is een zwarte ruïne (de bouwfase "dakgebinte", verkoold) die een paar dagen smeult;
// het gezin woont bij de buren, en daarna bouwt het zijn huis weer op, met hout uit de voorraad, in de bouwfasen, zoals
// een huis dat doorgroeit (js/behoeften.js). Zonder hout wacht het. Bij groot brandgevaar, en als niemand blust, slaat
// het vuur soms over op het dichtste huis ernaast, één keer per brand (T.slaatOver; Marcel, 10 okt: "Ja, zo"). De
// spelregel "Brand"; de getallen in T.BRAND_INSTELLINGEN.
(function (T) {
  'use strict';

  T.BRAND_INSTELLINGEN = {
    // Brandt er echt een huis als de brand komt (de spelregel "Brand")?
    aan: true,
    // Zo lang brandt het, in uren, voor het afgebrand is, als niemand iets doet; met de emmers is het blusUren na je antwoord
    // uit, of niet, en laat je het branden, dan is het na blusUren afgebrand.
    brandUren: 6,
    blusUren: 1,
    // De kans dat de emmers het huis redden; bij brandgevaar minder: maal (1 - gevaar maal het niveau).
    redKans: 0.65,
    gevaar: 0.25,
    // Zo veel dagen ligt het puin er (de eerste rookDagen smeult het), en dan bouwt het gezin het weer op: met zoveel van
    // het hout dat het huis kostte (hooguit minHout minder), vanaf de bouwfase herbouwVanFase.
    puinDagen: 3,
    rookDagen: 2,
    herbouwHout: 0.5,
    minHout: 5,
    herbouwVanFase: 1,
    // De bouwfase die verkoold de ruïne is (3: het dakgebinte, de balken zonder dak).
    puinFase: 3,
    // Het vuur slaat over (Marcel, 10 okt: "Ja, zo"): alleen bij groot brandgevaar, als niemand blust, met deze kans, op
    // het dichtste woonhuis dat hooguit zoveel tegels van het brandende huis staat, als dat afbrandt; en dat huis slaat
    // niet verder over.
    overslaan: { kans: 0.5, afstand: 5 },
    // Het licht van een brandend huis (js/zien.js), zoals een lantaarn, maar groter.
    licht: { straal: 9, sterkte: 1 },
    // Het beeld (js/tekenen.js): zoveel vlammen en rookwolkjes per huis, hoe hoog ze komen (pixels op zoom 1), de kleur
    // waarmee de ruïne verkoold is, en hoeveel gloeiende sintels er in het puin liggen zolang het smeult.
    beeld: { tongen: 9, vlammen: 150, vlamHoog: 120, rook: 70, rookHoog: 320, verkool: 'rgba(20, 14, 10, 0.76)', sintels: 18 },
  };
  const IN = () => T.BRAND_INSTELLINGEN;
  const dagNu = (D) => (D.kalender ? D.kalender.dag : 0);

  // Het brandgevaar: 0 geen, 1 brandgevaar (droogte, niet in de winter), 2 groot brandgevaar (ernstige droogte, of
  // droogte in een vol dorp).
  T.brandgevaarNiveau = function (D, dag = dagNu(D)) {
    if (!IN().aan) return 0;
    const droog = T.droogteNiveau(D);
    if (!droog || T.datumVanDag(dag).seizoen === 'winter') return 0;
    return droog >= 2 || (D.woonruimte != null && D.bevolking >= D.woonruimte) ? 2 : 1;
  };

  // Het huis dat brandt: van wie het voorval betreft (L.ander), of van wie het zegt. Een woonhuis dat klaar is, met een
  // tekening, en niet de herberg of het huis van de schout.
  function huisVanDeBrand(D, L) {
    for (const p of [L.ander, L.wie]) {
      const g = p && p.huis;
      if (kanBranden(g)) return g;
    }
    return null;
  }
  const kanBranden = (g) => !!(g && g.klaar && g.voorwerp && !g.brand && !g.voorwerp.inAanbouw && T.GEBOUWEN[g.soort] && T.standVan(g));
  T.brandendeHuizen = (D) => (D.gebouwen || []).filter((g) => g.brand);
  const naamVan = (D, g) => {
    const p = D.bewoners && D.bewoners.mensen.find((m) => m.huis === g);
    return p ? T.naamVanBewoner(p) : 'een gezin';
  };

  // Met de emmers (doe.blus in een antwoord, js/voorvallen.js), of laat je het branden (doe.brand 'laat'): vanaf nu nog
  // blusUren. Ook als het vuur nog moet beginnen.
  T.blusBrand = (D) => antwoord(D, 'blus');
  T.laatBranden = (D) => antwoord(D, 'laat');
  function antwoord(D, wat) {
    const L = D.voorvallen && D.voorvallen.lopend;
    if (L) L.brandAntwoord = wat;
    const g = L && L.brandHuis;
    if (g && g.brand && g.brand.fase === 'brandt') Object.assign(g.brand, { antwoord: wat, op: dagNu(D) });
  }

  // De kans dat de emmers het redden, nu.
  T.redKans = (D) => IN().redKans * Math.max(0, 1 - IN().gevaar * T.brandgevaarNiveau(D));

  // Elk beeld (T.werkDorpBij, js/dorp.js, vóór de voorvallen): het vuur begint als het voorval begint, en brandt tot het
  // uit is of het huis afgebrand.
  T.werkBrandBij = function (S, D) {
    if (!IN().aan || !D.gebouwen) return;
    const nu = dagNu(D);
    const L = D.voorvallen && D.voorvallen.lopend;
    if (L && L.id === 'brand' && !L.brandBegon && nu >= L.vanaf) {
      L.brandBegon = true;
      const g = huisVanDeBrand(D, L);
      if (g) {
        L.brandHuis = g;
        steekAan(g, nu, { antwoord: L.brandAntwoord });
      }
    }
    for (const g of D.gebouwen) {
      const B = g.brand;
      if (!B || B.fase !== 'brandt') continue;
      const uren = (nu - B.sinds) * 24;
      const naam = naamVan(D, g);
      const naAntwoord = B.antwoord && (nu - B.op) * 24 >= IN().blusUren;
      if (B.antwoord === 'blus' && naAntwoord && T.vastLot(D, Math.floor(B.sinds * 24), 1441) < T.redKans(D)) {
        delete g.brand;
        delete g.voorwerp.brand;
        T.zeg(D, `Het vuur is uit: het huis van ${naam} staat nog.`, 'goed');
        T.schrijfOp(D, 'brand', { tekst: `Het huis van ${naam} brandde, maar de emmers redden het.` });
        continue;
      }
      if (naAntwoord || uren >= IN().brandUren) {
        const buur = !B.overgeslagen && B.antwoord !== 'blus' && T.slaatOver(D, g, B);
        g.brand = { fase: 'puin', sinds: nu };
        g.voorwerp.brand = 'puin';
        const tekst = `Het huis van ${naam} is afgebrand. Ze wonen bij de buren tot het weer staat.`;
        T.zeg(D, tekst, 'gevaar');
        T.schrijfOp(D, 'brand', { tekst });
        if (buur) {
          steekAan(buur, nu, { antwoord: B.antwoord, overgeslagen: true });
          const over = `Het vuur slaat over op het huis van ${naamVan(D, buur)}.`;
          T.zeg(D, over, 'gevaar');
          T.schrijfOp(D, 'brand', { tekst: over });
        }
      }
    }
  };

  // Een huis vat vlam: het brandt vanaf nu (g.brand, en op zijn voorwerp voor js/tekenen.js).
  function steekAan(g, nu, meer = {}) {
    g.brand = { fase: 'brandt', sinds: nu, antwoord: meer.antwoord || null, op: nu, ...(meer.overgeslagen ? { overgeslagen: true } : {}) };
    g.voorwerp.brand = 'brandt';
    // Een huis dat al op de kaart stond, kent zijn tekening nog niet bij naam: die is nodig voor de ruïne en het weer
    // opbouwen in de bouwfasen (js/tekenen.js, zoals zetGebouwVoorwerp in js/gebouwen.js).
    if (!g.voorwerp.tekeningNaam && g.tekening) g.voorwerp.tekeningNaam = g.tekening.split('/').pop();
  }

  // Slaat het vuur van dit huis over, nu het afbrandt (B: zijn brand)? Bij groot brandgevaar, met de kans uit de
  // instellingen (een vast lot, zodat de speeltest hetzelfde jaar speelt), op het dichtste woonhuis dat kan branden en
  // hooguit `afstand` tegels van zijn voet staat. Geeft dat huis, of null. Wie blust of het overgeslagen vuur zelf, vraagt
  // het niet (T.werkBrandBij).
  T.slaatOver = function (D, g, B) {
    const O = IN().overslaan;
    if (T.brandgevaarNiveau(D) < 2 || T.vastLot(D, Math.floor(B.sinds * 24), 1447) >= O.kans) return null;
    const a = T.voetVanGebouw(g);
    let beste = null;
    let kortst = Infinity;
    for (const h of D.gebouwen) {
      if (h === g || !kanBranden(h)) continue;
      const b = T.voetVanGebouw(h);
      const tussen = Math.max(0, b.x - (a.x + a.b), a.x - (b.x + b.b), b.y - (a.y + a.h), a.y - (b.y + b.h));
      if (tussen <= O.afstand && tussen < kortst) {
        kortst = tussen;
        beste = h;
      }
    }
    return beste;
  };

  // Hoeveel hout het weer opbouwen kost.
  T.herbouwHout = function (g) {
    const k = (T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].kosten) || {};
    return Math.max(IN().minHout, Math.ceil((k.hout || 0) * IN().herbouwHout));
  };

  // Elke nacht (T.tikGebouwenDag, js/gebouwen.js): na de dagen puin bouwt het gezin zijn huis weer op, als er hout is.
  T.tikBrandDag = function (D, dag) {
    for (const g of D.gebouwen || []) {
      const B = g.brand;
      if (!B || B.fase !== 'puin' || dag < B.sinds + IN().puinDagen) continue;
      const hout = T.herbouwHout(g);
      const naam = naamVan(D, g);
      if ((D.voorraad.hout || 0) < hout) {
        if (!B.wacht) T.zeg(D, `${naam} wil zijn huis weer opbouwen, maar er is geen ${hout} hout.`, 'gevaar');
        B.wacht = true;
        continue;
      }
      T.wijzigVoorraad(D, 'hout', -hout);
      const v = g.voorwerp;
      const bouwtijd = T.GEBOUWEN[g.soort].bouwtijd || 1;
      delete g.brand;
      delete v.brand;
      Object.assign(v, { inAanbouw: true, klaarOp: Math.floor(dag) + bouwtijd, bouwtijd, vanFase: IN().herbouwVanFase });
      T.zeg(D, `${naam} bouwt het huis weer op, met ${hout} hout.`, 'goed');
    }
  };

  // Het licht van wat brandt (T.lichtBronnen, js/zien.js): op het midden van het huis.
  T.brandLicht = function (D) {
    return T.brandendeHuizen(D)
      .filter((g) => g.brand.fase === 'brandt')
      .map((g) => {
        const voet = T.voetVanGebouw(g);
        return { x: voet.x + voet.b / 2, y: voet.y + voet.h / 2, straal: IN().licht.straal, sterkte: IN().licht.sterkte, soort: 'brand' };
      });
  };

  // Smeult het puin nog (voor de rook in js/tekenen.js)?
  T.smeult = (D, g) => !!(g.brand && (g.brand.fase === 'brandt' || dagNu(D) < g.brand.sinds + IN().rookDagen));
})(globalThis.Spel = globalThis.Spel || {});
