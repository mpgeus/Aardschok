// De wensen van de mensen, per stand (werklijst vraag 79, 80, 82 en 85; Marcel, 1 okt 2026; ontwerp/spel.md, "De wensen
// van de mensen, per stand"). Zoals in Anno 1602: elk huis met mensen heeft een stand naar zijn soort (een hut keuters,
// een huis dorpelingen, een stenen huis ambachtslieden, en een boerderij boeren), en elke stand wil iets. Goederen die
// zijn mensen elke dag gebruiken (bier, vlees of vis, brood, laken), en plekken in de buurt, in een kring om het gebouw
// (een put, een kapel, de herberg, een markt). Een stand wil wat de stand eronder wil, en meer. Eten en brandhout gaan
// voor het hele dorp, zoals ze gingen (js/behoeften.js).
//
// Elk huis heeft zo zijn eigen tevredenheid, en die van het dorp is het gemiddelde, naar mensen: T.berekenTevredenheid
// (js/behoeften.js) vraagt het hier, zodat de groei, het werk, de voorvallen en de raad gewoon doorwerken. Een huis dat
// alles heeft, is super gelukkig: daarvan groeit het door (vraag 80, 2b), en daarmee win je (2e).
//
// Goederen: de hoogste stand neemt eerst (Marcel, vraag 85: "een hogere stand eigent zich spullen toe. Dus stel er is te
// weinig bier, dan nemen zij het laatste"). Wat over is, gaat naar de stand eronder, en binnen een stand gelijk op.
//
// Met de spelregel "Wensen" op "Het dorp als geheel" rekent het dorp zoals vóór 1 okt: één getal, met een kapel en de
// afwisseling van groente, vis en vlees (js/behoeften.js). Een dorp zonder bewoners rekent ook zo (de toetsen met een
// kaal dorp, en het gereedschap).
(function (T) {
  'use strict';

  T.WENSEN_INSTELLINGEN = {
    // Per huis (de standaard), of het dorp als geheel, zoals vóór 1 okt (de spelregel "Wensen").
    perHuis: true,
    // Hoe het getal van een huis optelt: eten, brandhout (alleen in de winter; daarbuiten telt het als gedekt) en de rest
    // van zijn wensen samen, elk naar wat ervan gedekt is. Samen 1, zoals de drie gewichten van vóór 1 okt (eten,
    // brandhout en een kerk, T.BEHOEFTEN_INSTELLINGEN): de rest staat waar de kerk stond.
    gewichtEten: 0.5,
    gewichtBrandhout: 0.3,
    gewichtRest: 0.2,
    // Wat een mens per dag gebruikt van een goed dat zijn stand wil (een eerste gok; de speeltest zegt het). De herberg
    // brouwt 8 bier per dag, een jager schiet 1 vlees, een visser vangt 2 vis, een bakkerij bakt 2 brood en een weverij
    // weeft 2 laken.
    perMens: { bier: 0.05, vleesOfVis: 0.02, brood: 0.03, laken: 0.01 },
    // De kring om een plek, in tegels, van het midden van het huis tot het midden van de plek (vraag 80, B; vraag 85, b:
    // 25 was te klein voor het gehucht, waar de boerderijen aan de rand staan).
    kring: { put: 12, kapel: 30, herberg: 30, markt: 30 },
  };
  const IN = () => T.WENSEN_INSTELLINGEN;

  // Wat er te wensen valt. Het eten en het brandhout gelden voor het hele dorp (js/behoeften.js; het brandhout alleen in
  // de winter). Een goed (`goed`) komt uit de voorraad, en kan meer soorten zijn: de eerste gaat het eerst op (vis vóór
  // vlees, want vlees vult ook een maag). Een plek (`plek`) is een soort uit T.GEBOUWEN die klaar is, in de kring om het
  // huis; een put telt ook als hij op de kaart staat.
  T.WENSEN = {
    eten: { naam: 'eten' },
    brandhout: { naam: 'brandhout' },
    put: { naam: 'een put', plek: 'put' },
    bier: { naam: 'bier', goed: ['bier'] },
    vleesOfVis: { naam: 'vlees of vis', goed: ['vis', 'vlees'] },
    kapel: { naam: 'een kapel', plek: 'kapel' },
    herberg: { naam: 'de herberg', plek: 'herberg' },
    brood: { naam: 'brood', goed: ['brood'] },
    laken: { naam: 'laken', goed: ['laken'] },
    markt: { naam: 'een markt', plek: 'markt' },
  };

  // De standen, van laag naar hoog: elke stand wil wat de stand ervoor wil, en `wil` erbij, zoals in Anno. `huis` is de
  // soort uit T.GEBOUWEN waar hij woont. De boeren staan ernaast (`los`): hun boerderij groeit niet, en ze willen alleen
  // wat hier staat (vraag 85, b: de herberg niet, "voor nu").
  T.STANDEN = {
    keuters: { naam: 'keuters', huis: 'hut', wil: ['eten', 'brandhout', 'put'] },
    dorpelingen: { naam: 'dorpelingen', huis: 'huis', wil: ['bier', 'vleesOfVis', 'kapel', 'herberg'] },
    ambachtslieden: { naam: 'ambachtslieden', huis: 'stenenHuis', wil: ['brood', 'laken', 'markt'] },
    boeren: { naam: 'boeren', huis: 'boerderij', los: true, wil: ['eten', 'brandhout', 'kapel'] },
  };

  const ladder = () => Object.keys(T.STANDEN).filter((s) => !T.STANDEN[s].los);
  // Wie het eerst een goed neemt: de hoogste stand eerst, dan de stand eronder, en wie ernaast staat als laatste.
  const volgorde = () => ladder().reverse().concat(Object.keys(T.STANDEN).filter((s) => T.STANDEN[s].los));
  const BASIS = ['eten', 'brandhout'];

  // Alles wat een stand wil, in volgorde: wat de standen eronder willen, en dan zijn eigen.
  T.wensenVanStand = function (stand) {
    const st = T.STANDEN[stand];
    if (!st) return [];
    if (st.los) return st.wil.slice();
    const lijst = [];
    for (const s of ladder()) {
      for (const w of T.STANDEN[s].wil) if (!lijst.includes(w)) lijst.push(w);
      if (s === stand) break;
    }
    return lijst;
  };

  // De stand van een gebouw, of null. Het huis van de schout en de herberg hebben geen wensen: die zijn van jou en van de
  // herbergierster. Een werkplaats heeft geen stand.
  T.standVan = function (g) {
    if (!g || g.huis === 'schout') return null;
    for (const s of Object.keys(T.STANDEN)) if (T.STANDEN[s].huis === g.soort) return s;
    return null;
  };

  const midden = (r) => ({ x: r.x + r.b / 2, y: r.y + r.h / 2 });

  // Ligt de plek `r` in de kring van `straal` tegels om de rechthoek `huis`? Van midden tot midden.
  T.inDeKring = function (huis, r, straal) {
    const a = midden(huis);
    const b = midden(r);
    return Math.hypot(a.x - b.x, a.y - b.y) <= straal + 1e-9;
  };

  // De goederen van vandaag, verdeeld: per wens met een goed, per stand die hem wil, wat die vraagt, wat hij krijgt en
  // welk deel dat is (`dekking`). De hoogste stand neemt eerst, en wat over is, gaat naar de stand eronder.
  function deelGoederen(D, mensenPerStand) {
    const v = D.voorraad || {};
    const uit = {};
    for (const id of Object.keys(T.WENSEN)) {
      const wens = T.WENSEN[id];
      if (!wens.goed) continue;
      let over = wens.goed.reduce((n, s) => n + Math.max(0, v[s] || 0), 0);
      uit[id] = {};
      for (const stand of volgorde()) {
        if (!T.wensenVanStand(stand).includes(id)) continue;
        const vraag = (mensenPerStand[stand] || 0) * (IN().perMens[id] || 0);
        const krijgt = Math.min(over, vraag);
        over -= krijgt;
        uit[id][stand] = { vraag, krijgt, dekking: vraag > 0 ? krijgt / vraag : 1 };
      }
    }
    return uit;
  }

  const gedekt = (x) => x >= 1 - 1e-9;

  // Hoeveel mensen er in elk huis wonen: de bewoners met dat huis (js/bewoners.js). Wie op de heervaart is, telt mee: zijn
  // huis wacht op hem.
  function mensenPerHuis(D) {
    const tel = new Map();
    for (const p of (D.bewoners && D.bewoners.mensen) || []) if (p.huis) tel.set(p.huis, (tel.get(p.huis) || 0) + 1);
    return tel;
  }

  // Wat elk huis wil en heeft, vandaag; puur, zoals T.berekenTevredenheid (js/behoeften.js), dat het vraagt. `basis` is
  // wat voor het hele dorp geldt: `eten` (welk deel er vandaag te eten is), `brandhout` (welk deel er gestookt kan
  // worden; buiten de winter 1), en `erbij` (wat de herberg, de wetten en de voorvallen erbij doen, min wat de heer
  // eraf doet). Geeft null als er geen huis met mensen is: dan rekent het dorp als geheel.
  //   huizen:  per huis met mensen { g, stand, mensen, heeft: { wens: 0..1 }, alles, tevredenheid }
  //   standen: per stand { mensen, huizen, alles (zoveel huizen met alles), tevredenheid (het gemiddelde, naar mensen) }
  //   goederen: wat deelGoederen hierboven gaf; tevredenheid: het gemiddelde van het dorp, naar mensen
  //   gemist: wat er gemist wordt (geen eten of brandhout: dat zegt js/behoeften.js), het meest gemiste eerst, met in
  //   hoeveel huizen en bij hoeveel mensen
  T.berekenWensen = function (D, dag, basis) {
    const tel = mensenPerHuis(D);
    const huizen = [];
    const perStand = {};
    for (const g of D.gebouwen || []) {
      const stand = T.standVan(g);
      const n = tel.get(g) || 0;
      if (!stand || !n) continue;
      huizen.push({ g, stand, mensen: n });
      perStand[stand] = (perStand[stand] || 0) + n;
    }
    if (!huizen.length) return null;

    const goederen = deelGoederen(D, perStand);
    const plekken = {};
    const plekkenVan = (soort) => plekken[soort] || (plekken[soort] = T.plekkenVan(D, soort));
    const standen = {};
    const gemist = {};
    let som = 0;
    let totaal = 0;
    for (const h of huizen) {
      const voet = T.voetVanGebouw(h.g);
      h.heeft = {};
      let rest = 0;
      let n = 0;
      for (const id of T.wensenVanStand(h.stand)) {
        const wens = T.WENSEN[id];
        let heeft;
        if (id === 'eten') heeft = basis.eten;
        else if (id === 'brandhout') heeft = basis.brandhout;
        else if (wens.goed) heeft = goederen[id][h.stand].dekking;
        else heeft = plekkenVan(wens.plek).some((r) => T.inDeKring(voet, r, IN().kring[wens.plek])) ? 1 : 0;
        h.heeft[id] = heeft;
        if (!BASIS.includes(id)) {
          rest += heeft;
          n++;
          if (!gedekt(heeft)) {
            const m = gemist[id] || (gemist[id] = { id, naam: wens.naam, huizen: 0, mensen: 0 });
            m.huizen++;
            m.mensen += h.mensen;
          }
        }
      }
      h.alles = Object.values(h.heeft).every(gedekt);
      const deel = IN().gewichtEten * basis.eten + IN().gewichtBrandhout * basis.brandhout + IN().gewichtRest * (n ? rest / n : 1);
      h.tevredenheid = Math.min(1, Math.max(0, deel + basis.erbij));
      const st = standen[h.stand] || (standen[h.stand] = { mensen: 0, huizen: 0, alles: 0, tevredenheid: 0 });
      st.mensen += h.mensen;
      st.huizen++;
      if (h.alles) st.alles++;
      st.tevredenheid += h.tevredenheid * h.mensen;
      som += h.tevredenheid * h.mensen;
      totaal += h.mensen;
    }
    for (const s of Object.keys(standen)) standen[s].tevredenheid /= standen[s].mensen;
    return {
      huizen, standen, goederen,
      tevredenheid: som / totaal,
      gemist: Object.values(gemist).sort((a, b) => b.mensen - a.mensen || b.huizen - a.huizen),
    };
  };

  // Wat een plek hier zou bereiken, als je hem bouwt (de muis met een put, een kapel, de herberg of een markt in de hand,
  // js/main.js; de kring zelf tekent js/tekenen.js): hoeveel huizen met mensen die hem willen in zijn kring vallen, en
  // hoeveel daarvan er nu nog geen in de buurt hebben. `plek` is de rechthoek waar hij komt. Null voor een soort zonder
  // kring.
  T.watDeKringBereikt = function (D, soort, plek) {
    const wens = Object.keys(T.WENSEN).find((id) => T.WENSEN[id].plek === soort);
    const straal = IN().kring[soort];
    if (!wens || !straal) return null;
    const er = T.plekkenVan(D, soort);
    const tel = mensenPerHuis(D);
    let huizen = 0;
    let zonder = 0;
    for (const g of D.gebouwen || []) {
      const stand = T.standVan(g);
      if (!stand || !tel.get(g) || !T.wensenVanStand(stand).includes(wens)) continue;
      const r = T.voetVanGebouw(g);
      if (!T.inDeKring(r, plek, straal)) continue;
      huizen++;
      if (!er.some((p) => T.inDeKring(r, p, straal))) zonder++;
    }
    return { wens, straal, huizen, zonder };
  };

  // Hetzelfde in een zin, voor bij de muis: "Binnen 30 tegels: 6 huizen die een kapel willen. Ze hebben er nu geen."
  T.kringTekst = function (D, soort, plek) {
    const k = T.watDeKringBereikt(D, soort, plek);
    if (!k) return null;
    const naam = T.WENSEN[k.wens].naam;
    if (!k.huizen) return `Binnen ${k.straal} tegels woont niemand die ${naam} wil.`;
    const een = k.huizen === 1;
    const wie = een ? `één huis dat ${naam} wil` : `${k.huizen} huizen die ${naam} willen`;
    let nu;
    if (!k.zonder) nu = een ? 'Het heeft er al een.' : 'Ze hebben er al een.';
    else if (k.zonder === k.huizen) nu = een ? 'Het heeft er nu geen.' : 'Ze hebben er nu geen.';
    else nu = `${k.zonder} ervan ${k.zonder === 1 ? 'heeft' : 'hebben'} er nu geen.`;
    return `Binnen ${k.straal} tegels: ${wie}. ${nu}`;
  };

  // De huizen nemen hun goederen uit de voorraad, zoals T.berekenWensen ze verdeelde (vanuit T.tikBehoeftenDag, vóór het
  // eten: het vlees dat een dorpeling bij zijn brood wil, eet het dorp niet als graan op). Geeft hoeveel vis en vlees er
  // gebruikt werd, voor het zout (js/behoeften.js, pasBederfToe).
  T.gebruikGoederen = function (D, wensen) {
    let bederfelijk = 0;
    for (const id of Object.keys(wensen.goederen)) {
      let nodig = Object.values(wensen.goederen[id]).reduce((n, s) => n + s.krijgt, 0);
      for (const soort of T.WENSEN[id].goed) {
        const neem = Math.min(nodig, Math.max(0, D.voorraad[soort] || 0));
        if (neem <= 0) continue;
        T.wijzigVoorraad(D, soort, -neem);
        nodig -= neem;
        if (T.BEHOEFTEN_INSTELLINGEN.bederfelijk.includes(soort)) bederfelijk += neem;
      }
    }
    return bederfelijk;
  };

  // Wat een huis wilde en had op de laatste dag die tikte (T.tikBehoeftenDag): op het huis zelf, zodat het venster van een
  // huis (2c) en het doorgroeien (2b) het kunnen lezen, en het wordt bewaard met het spel. Een huis zonder mensen heeft
  // niets.
  T.onthoudWensen = function (D, wensen) {
    const bij = new Map(((wensen && wensen.huizen) || []).map((h) => [h.g, h]));
    for (const g of D.gebouwen || []) {
      const h = bij.get(g);
      if (h) g.wensen = { stand: h.stand, heeft: h.heeft, alles: h.alles, tevredenheid: h.tevredenheid };
      else if (g.wensen) delete g.wensen;
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
