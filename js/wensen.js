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
    // 25 was te klein voor het gehucht, waar de boerderijen aan de rand staan). Een kapel 40 (vraag 87, c; Marcel, 2 okt):
    // met 30 haalde één kapel in het gehucht hooguit vier van de zes huizen die er een willen, met 40 zijn er 50 plekken
    // die ze alle zes halen.
    kring: { put: 12, kapel: 40, herberg: 30, markt: 30 },
    // Doorgroeien (vraag 80, C; 2b): heeft een huis T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen op rij alles, dan groeit het
    // door naar de volgende stand, en dat kost bouwstof uit de voorraad, naar wat het wordt (zo krijgt steen een doel).
    bouwstof: { huis: { hout: 8 }, stenenHuis: { steen: 12 } },
    // Achteruitgaan (vraag 85, c; de spelregel "Achteruitgaan"): 'zacht' (de standaard, zoals in Anno 1602: een gezin
    // trekt pas weg uit een huis onder de vertrekdrempel, en dat gebeurt alleen als het eten of het brandhout mist) of
    // 'streng' (mist een huis missenDagen op rij iets, dan trekt zijn gezin weg; hooguit één huis per dag).
    achteruit: 'zacht',
    missenDagen: 30,
    // Wat een mens van elke stand aan belasting opbrengt, als die wet is aangenomen (js/wetten.js): zoveel keer wat de
    // wet per mens vraagt. Wie in geen huis met een stand woont (de schout en zijn huis, de herbergierster), telt als 1.
    belasting: { keuters: 1, dorpelingen: 2, ambachtslieden: 3, boeren: 1 },
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

  // ---------------------------------------------------------------------------------------------
  // Wat de huizen missen, en wat helpt
  // ---------------------------------------------------------------------------------------------

  // Wanneer je een gebouw kunt bouwen dat nu nog niet in het bouwmenu staat (T.GEBOUW_TREDEN, js/gebouwen.js).
  const PAS = { dorp: 'pas in een dorp', marktrecht: 'pas met marktrecht', stad: 'pas in een stad' };
  const naamVan = (soort) => T.GEBOUWEN[soort].naam;
  const nogNiet = (soort) => ({ kan: false, bouw: null, tekst: `een ${naamVan(soort)} bouw je ${PAS[T.GEBOUWEN[soort].trede] || 'later'}` });
  const of = (namen) => (namen.length < 2 ? namen.join('') : `${namen.slice(0, -1).join(', ')} of ${namen[namen.length - 1]}`);

  // "vijf boerderijen en een huis": hoeveel huizen van elke soort, de soort met de meeste eerst.
  function wieTekst(perSoort) {
    return T.opsomming(Object.entries(perSoort).sort((a, b) => b[1] - a[1])
      .map(([soort, n]) => `${T.telwoord(n)} ${n === 1 ? naamVan(soort) : T.GEBOUWEN[soort].meervoud || naamVan(soort)}`));
  }

  // Waarom wat er staat niet genoeg maakt, kort, zoals de muis op het gebouw het zegt (T.gebouwToestand, js/gebouwen.js).
  function waaromTeWeinig(g) {
    const soort = T.GEBOUWEN[g.soort];
    const de = `de ${soort.naam}`;
    if (g.stilWant) return `${de} staat stil: ${g.stilWant}`;
    if (soort.handen > 0 && !g.handen) return `${de} heeft geen handen`;
    if (g.tekort) return `${de} heeft ${g.werkte > 0 ? 'te weinig' : 'geen'} ${g.tekort}`;
    return `${de} maakt te weinig`;
  }

  // Wat helpt, uit de soorten die het maken (een visser of een jager voor vlees of vis, een houthakker voor hout): { kan,
  // bouw, tekst }. Wat in dit seizoen stilligt (de visser in de winter), helpt nu niet. Wordt er een gebouwd, dan wacht
  // je daarop; staat er een en is het niet genoeg, dan nog een, of waarom niet; en wat je nog niet kunt bouwen, wanneer
  // wel.
  function watHelpt(D, soorten) {
    const seizoen = D.kalender ? T.datumVanDag(D.kalender.dag).seizoen : null;
    const staan = (D.gebouwen || []).filter((g) => soorten.includes(g.soort));
    const inBouw = staan.find((g) => !g.klaar);
    if (inBouw) return { kan: false, bouw: null, tekst: `de ${naamVan(inBouw.soort)} wordt gebouwd` };
    const helpen = soorten.filter((s) => T.inBouwmenu(D, s) && !(T.GEBOUWEN[s].stilIn && seizoen && T.GEBOUWEN[s].stilIn[seizoen]));
    if (helpen.length) {
      const er = helpen.find((s) => staan.some((g) => g.soort === s));
      if (er) return { kan: true, bouw: er, tekst: `nog een ${naamVan(er)} [B]` };
      return { kan: true, bouw: helpen[0], tekst: `bouw ${of(helpen.map((x) => `een ${naamVan(x)}`))} [B]` };
    }
    if (staan.length) return { kan: false, bouw: null, tekst: waaromTeWeinig(staan[0]) };
    return nogNiet(soorten[0]);
  }

  // Wat de huizen missen, en wat helpt (werklijst vraag 86, a, en 87; Marcel, 2 okt: "a ja b ja"), voor de raad onder
  // het doel (js/raad.js), het rapport van de raadsman (js/ochtendrapport.js) en de bouwer van de speeltest
  // (gereedschap/speeltest/speler.js): zo zeggen ze alle drie hetzelfde. Uit wat elk huis op de laatste dag wilde en had
  // (g.wensen, T.onthoudWensen hieronder), zoals de balk het zegt, dus vóór de eerste nacht weet het dorp het nog niet;
  // alleen een plek in de buurt kijkt naar nu, zodat een put die vandaag klaar is, meteen telt.
  //
  // Eerst de huizen die een maand alles hadden en op bouwstof wachten (js/behoeften.js), dan wat de meeste mensen
  // missen. Elk: { soort ('bouwstof' of 'wens'), id, huizen, mensen, kan, bouw, tekst }. `kan`: je kunt er nu iets aan
  // doen (iets uit het bouwmenu helpt, en er wordt er nog geen gebouwd); `bouw`: wat (een soort uit T.GEBOUWEN); `tekst`:
  // de zin, met [B] waar het bouwmenu helpt. Geen eten of brandhout: dat zeggen de winter en de oorzaken.
  T.watDeHuizenMissen = function (D) {
    const huizen = (D.gebouwen || []).filter((g) => g.wensen && g.wensen.mensen > 0);
    const uit = [];

    // Op bouwstof wachten: per soort huis. Is de bouwstof er nu, dan groeit het vannacht, en hoeft niemand iets.
    const wachten = {};
    for (const g of huizen) {
      if (!g.wachtOpBouwstof) continue;
      const kosten = IN().bouwstof[T.GEBOUWEN[g.soort].wordt] || {};
      if (T.kanBetalen(D, kosten)) continue;
      const w = wachten[g.soort] || (wachten[g.soort] = { huizen: [], kosten });
      w.huizen.push(g);
    }
    for (const soort of Object.keys(wachten)) {
      const { huizen: lijst, kosten } = wachten[soort];
      const n = lijst.length;
      const mist = Object.keys(kosten).filter((wat) => (D.voorraad[wat] || 0) < kosten[wat]);
      const makers = Object.keys(T.GEBOUWEN).filter((s) => T.GEBOUWEN[s].maakt && mist.some((wat) => T.GEBOUWEN[s].maakt.uit[wat]));
      const h = makers.length ? watHelpt(D, makers) : { kan: false, bouw: null, tekst: '' };
      const zin = `${T.hoofdletter(wieTekst({ [soort]: n }))} ${n === 1 ? 'kan' : 'kunnen'} een ${naamVan(T.GEBOUWEN[soort].wordt)} worden, maar er is geen ${T.opsomming(mist.map((wat) => `${kosten[wat]} ${wat}`))}`;
      uit.push({
        soort: 'bouwstof', id: `bouwstof:${soort}`, huizen: n, mensen: lijst.reduce((m, g) => m + g.wensen.mensen, 0),
        kan: h.kan, bouw: h.bouw, tekst: h.tekst ? `${zin}: ${h.tekst}.` : `${zin}.`,
      });
    }

    // Wat er gemist wordt, per wens: welke huizen (per soort) en hoeveel mensen. Een plek telt zoals nu: een put die
    // vandaag klaar kwam, telt al, en een huis in de kring van een plek in aanbouw wacht daarop.
    const wensen = [];
    for (const id of Object.keys(T.WENSEN)) {
      const wens = T.WENSEN[id];
      if (BASIS.includes(id)) continue;
      const straal = wens.plek ? IN().kring[wens.plek] : null;
      const klaar = wens.plek ? T.plekkenVan(D, wens.plek) : null;
      const inBouw = wens.plek ? (D.gebouwen || []).filter((g) => g.soort === wens.plek && !g.klaar).map((g) => T.voetVanGebouw(g)) : null;
      const perSoort = {};
      let n = 0;
      let mensen = 0;
      let wacht = 0;
      for (const g of huizen) {
        if (!T.wensenVanStand(g.wensen.stand).includes(id)) continue;
        if (wens.plek) {
          const voet = T.voetVanGebouw(g);
          if (klaar.some((r) => T.inDeKring(voet, r, straal))) continue;
          if (inBouw.some((r) => T.inDeKring(voet, r, straal))) {
            wacht++;
            continue;
          }
        } else if (gedekt(g.wensen.heeft[id] != null ? g.wensen.heeft[id] : 1)) continue;
        perSoort[g.soort] = (perSoort[g.soort] || 0) + 1;
        n++;
        mensen += g.wensen.mensen;
      }
      if (!n && !wacht) continue;
      const wie = n ? perSoort : null;
      wensen.push({ id, wens, straal, wie, n, mensen, wacht });
    }
    wensen.sort((a, b) => b.mensen - a.mensen || b.n - a.n);
    for (const w of wensen) {
      const binnen = w.straal ? ` binnen ${w.straal} tegels` : '';
      if (!w.n) {
        // Alle huizen die het missen, wachten op een plek in aanbouw: dat zegt het rapport, en er valt niets te doen.
        const zin = `${T.hoofdletter(T.telwoord(w.wacht))} ${w.wacht === 1 ? 'huis wacht' : 'huizen wachten'} op ${w.wens.naam}: er wordt er een gebouwd.`;
        uit.push({ soort: 'wens', id: w.id, huizen: w.wacht, mensen: 0, kan: false, bouw: null, tekst: zin });
        continue;
      }
      const zin = `${T.hoofdletter(wieTekst(w.wie))} ${w.n === 1 ? 'wil' : 'willen'} ${w.wens.naam}${binnen}`;
      let h;
      if (w.wens.plek) {
        // Een plek die je kunt bouwen, zeg je met de toets erachter: "Vijf hutten willen een put binnen 12 tegels [B]." Een
        // die er al staat, ligt te ver: de herberg van het gehucht helpt een huis buiten zijn kring niet.
        h = T.inBouwmenu(D, w.wens.plek) ? { kan: true, bouw: w.wens.plek, tekst: null } : nogNiet(w.wens.plek);
      } else {
        const makers = Object.keys(T.GEBOUWEN).filter((s) => T.GEBOUWEN[s].maakt && w.wens.goed.some((goed) => T.GEBOUWEN[s].maakt.uit[goed]));
        makers.sort((a, b) => w.wens.goed.findIndex((goed) => T.GEBOUWEN[a].maakt.uit[goed]) - w.wens.goed.findIndex((goed) => T.GEBOUWEN[b].maakt.uit[goed]));
        h = watHelpt(D, makers);
      }
      uit.push({
        soort: 'wens', id: w.id, huizen: w.n, mensen: w.mensen, kan: h.kan, bouw: h.bouw,
        tekst: h.tekst ? `${zin}: ${h.tekst}.` : `${zin} [B].`,
      });
    }
    return uit;
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

  // Voor hoeveel mensen het dorp belasting betaalt (de wet, js/wetten.js): een hogere stand betaalt meer (vraag 80, C),
  // naar de standen van de laatste dag (D.behoeften.standen). Zonder wensen per huis is dat gewoon iedereen.
  T.belastbaar = function (D) {
    const st = D.behoeften && D.behoeften.standen;
    let n = D.bevolking || 0;
    if (!st) return n;
    for (const s of Object.keys(st)) n += st[s].mensen * ((IN().belasting[s] || 1) - 1);
    return n;
  };

  // Wat een huis wilde en had op de laatste dag die tikte (T.tikBehoeftenDag): op het huis zelf, zodat het venster van een
  // huis (2c) en het doorgroeien (2b) het kunnen lezen, en het wordt bewaard met het spel. Een huis zonder mensen heeft
  // niets.
  T.onthoudWensen = function (D, wensen) {
    const bij = new Map(((wensen && wensen.huizen) || []).map((h) => [h.g, h]));
    for (const g of D.gebouwen || []) {
      const h = bij.get(g);
      if (h) g.wensen = { stand: h.stand, mensen: h.mensen, heeft: h.heeft, alles: h.alles, tevredenheid: h.tevredenheid };
      else if (g.wensen) delete g.wensen;
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
