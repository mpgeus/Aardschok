// De wensen van de mensen, per stand (werklijst vraag 79, 80, 82 en 85; Marcel, 1 okt 2026; ontwerp/spel.md, "De wensen
// van de mensen, per stand"). Zoals in Anno 1602: elk huis met mensen heeft een stand naar zijn soort (een hut keuters,
// een huis dorpelingen, een stenen huis ambachtslieden, en een boerderij boeren), en elke stand wil iets. Goederen die
// zijn mensen elke dag gebruiken (bier, vlees of vis, brood, laken), en plekken in de buurt, in een kring om het gebouw
// (een put, een kapel, de herberg, een markt). Een stand wil wat de stand eronder wil, en meer. Eten en brandhout gaan
// voor het hele dorp, zoals ze gingen (js/behoeften.js).
//
// Elk huis heeft zo zijn eigen tevredenheid, en die van het dorp is het gemiddelde, naar mensen: T.berekenTevredenheid
// (js/behoeften.js) vraagt het hier, zodat de groei, het werk, de voorvallen en de raad gewoon doorwerken. Een huis dat
// alles heeft, is super gelukkig: daarvan groeit het door (vraag 80, 2b).
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
    // weeft 2 laken. Laken 0,005 (Marcel, 2 okt, werklijst vraag 91, c; was 0,01): de wol komt van de schapen, eens per
    // jaar, en de heer vraagt er 20 per schaapskooi; acht schapen gaven laken voor vier à vijf ambachtslieden, en een
    // volle kooi (20 schapen) dekt er nu zo'n 33. Brood 0,01 (Marcel, 3 okt, werklijst vraag 95, a; was 0,03): een brood
    // kost een graan, en met 0,03 kostte het brood van één stenen huis 86 graan per jaar, zodat de akkers na het zaaigraan
    // er hooguit vier voedden; nu tien à elf. Wel moet er druk blijven om genoeg eten ("Het mag niet te makkelijk").
    // Wijn 0,02 (Marcel, 10 okt: "0,02 is goed"): één wijnboerderij plukt 300 wijn per jaar, en de heer wil er 10, dus dat
    // is genoeg voor zo'n 40 ambachtslieden.
    perMens: { bier: 0.05, vleesOfVis: 0.02, brood: 0.01, laken: 0.005, wijn: 0.02 },
    // Hoe zwaar een wens weegt in hoe blij een huis is (de rest, hierboven), naast de andere: 1, behalve brood (Marcel,
    // 2 okt, werklijst vraag 92, a: "brood is wel minder lekker en levert minder blijheid op"). Een huis zonder brood
    // is dus blijer dan een huis zonder laken; alles hebben, en dus super gelukkig zijn, vraagt het brood wel.
    blijheid: { brood: 0.5 },
    // De kring om een plek, in tegels, van het midden van het huis tot het midden van de plek (vraag 80, B; vraag 85, b:
    // 25 was te klein voor het gehucht, waar de boerderijen aan de rand staan). Een kapel 40 (vraag 87, c; Marcel, 2 okt):
    // met 30 haalde één kapel in het gehucht hooguit vier van de zes huizen die er een willen, met 40 zijn er 50 plekken
    // die ze alle zes halen. De herberg en de markt hebben geen kring (null): één is genoeg voor het hele dorp (Marcel,
    // 3 okt, werklijst vraag 96, a: "1 markt 1 herberg voor nu"; in de speeltest van vraag 95 pasten er maar drie erven
    // binnen 30 tegels van de herberg, en wie verder woonde, miste hem altijd). De spelregel "De herberg en de markt" op
    // "Binnen een kring" zet ze op 30, zoals tot 3 okt.
    kring: { put: 12, kapel: 40, herberg: null, markt: null },
    // Doorgroeien (vraag 80, C; 2b): heeft een huis T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen op rij alles, dan groeit het
    // door naar de volgende stand, en dat kost bouwstof uit de voorraad, naar wat het wordt (zo krijgt steen een doel).
    bouwstof: { huis: { hout: 8 }, stenenHuis: { steen: 12 }, woontoren: { steen: 20 }, herberg: { hout: 16 } },
    // Achteruitgaan (vraag 85, c; de spelregel "Achteruitgaan"): 'zacht' (de standaard, zoals in Anno 1602: een gezin
    // trekt pas weg uit een huis onder de vertrekdrempel, en dat gebeurt alleen als het eten of het brandhout mist) of
    // 'streng' (mist een huis missenDagen op rij iets, dan trekt zijn gezin weg; hooguit één huis per dag).
    achteruit: 'zacht',
    missenDagen: 30,
    // Wat een mens van elke stand aan belasting opbrengt, als die wet is aangenomen (js/wetten.js): zoveel keer wat de
    // wet per mens vraagt. Wie in geen huis met een stand woont (de schout en zijn huis), telt als 1.
    belasting: { keuters: 1, dorpelingen: 2, ambachtslieden: 3, boeren: 1 },
  };
  const IN = () => T.WENSEN_INSTELLINGEN;

  // Wat er te wensen valt. Het eten en het brandhout gelden voor het hele dorp (js/behoeften.js; het brandhout alleen in
  // de winter). Een goed (`goed`) komt uit de voorraad, en kan meer soorten zijn: de eerste gaat het eerst op (vis vóór
  // vlees, want vlees vult ook een maag). Een plek (`plek`) is een soort uit T.GEBOUWEN die klaar is, in de kring om het
  // huis; een put telt ook als hij op de kaart staat.
  T.WENSEN = {
    eten: { naam: T.t('food') },
    brandhout: { naam: T.t('firewood') },
    put: { naam: T.t('a well'), plek: 'put' },
    // Bier, en voor de ambachtslieden wijn erbij (werklijst vraag 136; Marcel, 10 okt: "Inwoners willen wijn en bier.
    // Afwisseling. Je kunt niet leven op 1 ding", en "B1"): twee wensen, dus wijn telt niet als bier. Van 8 tot 10 okt was
    // het één wens, drank, die bier of wijn nam; toen vroeg het dorp nooit om een wijnboerderij.
    bier: { naam: T.t('ale'), goed: ['bier'] },
    wijn: { naam: T.t('wine'), goed: ['wijn'] },
    vleesOfVis: { naam: T.t('meat or fish'), goed: ['vis', 'vlees'] },
    kapel: { naam: T.t('a chapel'), plek: 'kapel' },
    herberg: { naam: T.t('the inn'), plek: 'herberg' },
    brood: { naam: T.t('bread'), goed: ['brood'] },
    laken: { naam: T.t('cloth'), goed: ['laken'] },
    markt: { naam: T.t('a market'), plek: 'markt' },
  };

  // De standen, van laag naar hoog: elke stand wil wat de stand ervoor wil, en `wil` erbij, zoals in Anno. `huis` is de
  // soort uit T.GEBOUWEN waar hij woont. De boeren staan ernaast (`los`): hun boerderij groeit niet, en ze willen alleen
  // wat hier staat (vraag 85, b: de herberg niet, "voor nu").
  T.STANDEN = {
    keuters: { naam: T.t('cottars'), huis: 'hut', wil: ['eten', 'brandhout', 'put'] },
    dorpelingen: { naam: T.t('villagers'), huis: 'huis', wil: ['bier', 'vleesOfVis', 'kapel', 'herberg'] },
    ambachtslieden: { naam: T.t('craftsmen'), huis: 'stenenHuis', ook: ['woontoren'], wil: ['brood', 'laken', 'wijn', 'markt'] },
    boeren: { naam: T.t('farmers'), huis: 'boerderij', ook: ['wijnboerderij'], los: true, wil: ['eten', 'brandhout', 'kapel'] },
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
  // waard. Een werkplaats heeft geen stand.
  T.standVan = function (g) {
    if (!g || g.huis === 'schout') return null;
    for (const s of Object.keys(T.STANDEN)) if (T.STANDEN[s].huis === g.soort || (T.STANDEN[s].ook || []).includes(g.soort)) return s;
    return null;
  };

  const midden = (r) => ({ x: r.x + r.b / 2, y: r.y + r.h / 2 });

  // Ligt de plek `r` in de kring van `straal` tegels om de rechthoek `huis`? Van midden tot midden. Zonder kring (null,
  // zoals de herberg en de markt: één is genoeg voor het hele dorp) telt elke plek.
  T.inDeKring = function (huis, r, straal) {
    if (straal == null) return true;
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

  // De stand onder deze op de ladder (de keuters onder de dorpelingen), of null: de onderste, en de boeren, die ernaast
  // staan.
  T.standOnder = function (stand) {
    const i = ladder().indexOf(stand);
    return i > 0 ? ladder()[i - 1] : null;
  };

  // Hoeveel mensen er nu minstens deze stand hebben: wie in een huis van die stand woont, of van een stand erboven (de
  // boeren staan ernaast en tellen alleen voor zichzelf). Voor de treden (js/treden.js; Marcel, 2 okt, vraag 90, A): een
  // dorp bij 20 dorpelingen. Een huis dat versteent, blijft meetellen: anders werd een gehucht waar de huizen te vroeg
  // versteenden, nooit een dorp.
  T.mensenVanStand = function (D, stand) {
    const vanaf = ladder().indexOf(stand);
    const telt = (s) => (vanaf < 0 ? s === stand : ladder().indexOf(s) >= vanaf);
    let n = 0;
    for (const [g, m] of mensenPerHuis(D)) if (telt(T.standVan(g))) n += m;
    return n;
  };

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
          const w = IN().blijheid[id] != null ? IN().blijheid[id] : 1;
          rest += heeft * w;
          n += w;
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
  T.watDeKringBereikt = (D, soort, plek) => T.kringTeller(D, soort)(plek);

  // Hetzelfde voor veel plekken na elkaar (T.plekVoor, js/bouwen.js, vraagt het voor elke tegel van de kaart): welke
  // huizen het willen en of ze er al een hebben, staat één keer vast, en per plek wordt alleen nog geteld. Geeft een
  // functie van de plek, of een die null geeft als deze soort geen kring heeft. (Tot ronde 2 van het snoeien telde
  // `straks` ook het huis dat een hut op een erf zou worden; de erven zijn weg.)
  T.kringTeller = function (D, soort) {
    const wens = Object.keys(T.WENSEN).find((id) => T.WENSEN[id].plek === soort);
    const straal = IN().kring[soort];
    if (!wens || !straal) return () => null;
    const er = T.plekkenVan(D, soort);
    const tel = mensenPerHuis(D);
    const willen = [];
    for (const g of D.gebouwen || []) {
      if (!tel.get(g) || !T.huisWil(g, wens)) continue;
      const voet = T.voetVanGebouw(g);
      willen.push({ voet, heeft: er.some((p) => T.inDeKring(voet, p, straal)) });
    }
    return (plek) => {
      let huizen = 0;
      let zonder = 0;
      for (const h of willen) {
        if (!T.inDeKring(h.voet, plek, straal)) continue;
        huizen++;
        if (!h.heeft) zonder++;
      }
      return { wens, straal, huizen, zonder };
    };
  };

  // Wil dit huis (of een gebouw van deze soort, { soort }) deze wens: wat zijn stand wil. (Tot ronde 2 van het snoeien
  // wilde een hut op een erf ook al wat het huis wil dat hij wordt; de erven zijn weg.)
  T.huisWil = function (g, wens) {
    const stand = T.standVan(g);
    return !!stand && T.wensenVanStand(stand).includes(wens);
  };

  // Waar nog een plek met een kring kan komen, en wie hem nog mist (werklijst vraag 117, 2d; Marcel, 8 okt: "A ja", en voor
  // de kapel "Prima"): de plekken op de kaart waar er een kan komen (T.kanHierKomen, js/bouwen.js: op open grond of na
  // het rooien), die er al staan, en de huizen die hem willen en er geen in hun kring hebben, elk met de plekken die het
  // zouden halen. Geeft { straal, wens, er, plekken, zonder: [{ r, wie, plekken }] }, of null zonder kring. Geen
  // spelstaat, maar wat uit de kaart en de gebouwen volgt, dus één keer per stand van het dorp en per dag, zoals
  // T.meegroeiGrond (js/behoeften.js).
  const KRINGGROND = new WeakMap(); // dorp → { soort: { sleutel, grond } }
  T.kringGrond = function (D, soort) {
    const wens = Object.keys(T.WENSEN).find((id) => T.WENSEN[id].plek === soort);
    const straal = IN().kring[soort];
    if (!wens || !straal) return null;
    let sleutel = `${straal}:${T.kaartVersie(D.wereld)}:${Math.floor((D.kalender && D.kalender.dag) || 0)}:${(D.gebouwen || []).length}`;
    let perSoort = KRINGGROND.get(D);
    if (!perSoort) KRINGGROND.set(D, (perSoort = {}));
    const oud = perSoort[soort];
    if (oud && oud.sleutel === sleutel) return oud.grond;
    const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort)) || T.GEBOUWEN[soort].voet;
    // De plekken pas als iemand ze nodig heeft (een huis dat er straks geen haalt): een kapel over de hele kaart kost meer
    // dan een put, en meestal staat er al een binnen 40 tegels.
    let alle = null;
    const plekkenNu = () => alle || (alle = plekkenVoor(D, soort, voet));
    const er = T.plekkenVan(D, soort);
    const zonder = [];
    // `r`: waar het huis staat, voor wie het naleest.
    const mist = (r, wie) => {
      if (er.some((p) => T.inDeKring(r, p, straal))) return;
      zonder.push({ r, wie, plekken: plekkenNu().filter((p) => T.inDeKring(r, p, straal)) });
    };
    const tel = mensenPerHuis(D);
    for (const g of D.gebouwen || []) {
      if (!tel.get(g) || !T.huisWil(g, wens)) continue;
      mist(T.voetVanGebouw(g), T.huisVan(D, g));
    }
    const grond = { straal, wens, er, zonder, get plekken() { return plekkenNu(); } };
    perSoort[soort] = { sleutel, grond };
    return grond;
  };

  // Komt hier iets waar een gezin gaat wonen, haalt dat gezin dan straks elke plek met een kring die het wil (een put, een
  // kapel), en neemt het geen ander huis de laatste plek ervoor af? Voor een gebouw met een gezin (T.waaromPastHetNiet,
  // js/gebouwen.js: de wijnboerderij, vraag 136; Marcel, 10 okt: "Wijn haalt kapel"; tot ronde 2 van het snoeien ook een
  // erf, werklijst vraag 117, 2d). `nieuw` zegt wat er komt, elk als rechthoek { x, y, b, h }: `grond`, wat
  // het neemt (daar komt geen put of kapel meer); `vast`, waar het looppad van een put of kapel niet over kan (de hele
  // voet van een wijnboerderij, want haar ranken staan in de weg); `huis`, waar het gezin woont, voor de kring. Verder
  // `wil(wens)`: wil het die (T.huisWil); `wie(wens)`: hoe het in de zin heet; en `dit`: wat de plek neemt. Geeft de
  // reden, of null.
  T.waaromGeenKringPlek = function (D, nieuw) {
    const { grond, vast, huis, wil, wie, dit } = nieuw;
    for (const soort of Object.keys(IN().kring)) {
      const k = T.kringGrond(D, soort);
      if (!k) continue;
      const gebouw = T.eenNaam(T.GEBOUWEN[soort].naam);
      const n = T.GEBOUWEN_INSTELLINGEN.looppad;
      const raakt = (a, c) => a.x < c.x + c.b && c.x < a.x + a.b && a.y < c.y + c.h && c.y < a.y + a.h;
      const blijft = (q) => !raakt(q, grond) && !raakt({ x: q.x - n, y: q.y - n, b: q.b + 2 * n, h: q.h + 2 * n }, vast);
      // ver weg komt een plek er niet bij: dat scheelt de wortel
      const dichtBij = (q) => Math.abs(q.x - huis.x) <= k.straal + huis.b + q.b && Math.abs(q.y - huis.y) <= k.straal + huis.h + q.h;
      const haalt = (q) => dichtBij(q) && T.inDeKring(huis, q, k.straal);
      if (wil(k.wens) && !k.er.some(haalt) && !k.plekken.some((q) => haalt(q) && blijft(q))) {
        return T.t('{wie} will not be able to reach {gebouw} later: there is none within {straal} tiles, and no room left for one.',
          { wie: wie(k.wens), gebouw, straal: k.straal });
      }
      for (const h of k.zonder) {
        if (h.plekken.length && h.plekken.every((q) => !blijft(q))) {
          return T.t('Then {wie} will not be able to get {gebouw} later: {dit} takes the last spot for it.', { wie: h.wie, gebouw, dit });
        }
      }
    }
    return null;
  };

  // Elke plek op de kaart waar een gebouw van deze soort met voet `voet` kan komen (T.kanHierKomen). Eerst per tegel of
  // er ooit een voet op kan (niet op het plein, niet wat vaststaat en niet te rooien is, niet op grond waar niet gebouwd
  // wordt) en of er een looppad over kan (te belopen of te rooien), elk met een
  // optelsom erover: een plek waar het ergens niet kan, valt dan in één stap af, en alleen de rest vraagt het aan
  // T.kanHierKomen. Dezelfde plekken als elke tegel afvragen, maar vele malen sneller (een kapel over de hele kaart
  // kostte 1,2 tot 1,8 s). Buiten de kaart kan geen voet (daar staat alles vast, js/wereld.js), wel een looppad.
  function plekkenVoor(D, soort, voet) {
    const w = D.wereld;
    const vak = T.kaartVak(w);
    const H = vak.h;
    const B = vak.b;
    const n = T.GEBOUWEN_INSTELLINGEN.looppad;
    const geenVoet = new Int32Array((B + 1) * (H + 1));
    const geenPad = new Int32Array((B + 1) * (H + 1));
    for (let y = vak.y; y < vak.y + H; y++) {
      let rijVoet = 0;
      let rijPad = 0;
      for (let x = vak.x; x < vak.x + B; x++) {
        const rooi = !!T.ontginWerkOp(w, x, y);
        if (T.opHetPlein(w, x, y) || (T.isVast(w, x, y) && !rooi) || T.waaromNietOpDezeGrond(D, x, y)) rijVoet++;
        if (!(T.isBegaanbaar(w, x, y, { deurenOpenen: true }) || rooi)) rijPad++;
        const i = (y - vak.y + 1) * (B + 1) + (x - vak.x) + 1;
        geenVoet[i] = geenVoet[i - B - 1] + rijVoet;
        geenPad[i] = geenPad[i - B - 1] + rijPad;
      }
    }
    // hoeveel tegels van het vak (x0, y0)-(x1, y1), binnen de kaart, in de optelsom `som` meetellen
    const telIn = (som, x0, y0, x1, y1) => {
      x0 = Math.max(vak.x, x0) - vak.x; y0 = Math.max(vak.y, y0) - vak.y; x1 = Math.min(vak.x + B, x1) - vak.x; y1 = Math.min(vak.y + H, y1) - vak.y;
      return som[y1 * (B + 1) + x1] - som[y0 * (B + 1) + x1] - som[y1 * (B + 1) + x0] + som[y0 * (B + 1) + x0];
    };
    const plekken = [];
    for (let y = vak.y; y + voet.h <= vak.y + H; y++) {
      for (let x = vak.x; x + voet.b <= vak.x + B; x++) {
        if (telIn(geenVoet, x, y, x + voet.b, y + voet.h)) continue;
        if (telIn(geenPad, x - n, y - n, x + voet.b + n, y + voet.h + n) > telIn(geenPad, x, y, x + voet.b, y + voet.h)) continue;
        if (T.kanHierKomen(D, soort, x, y, voet)) plekken.push({ x, y, b: voet.b, h: voet.h });
      }
    }
    return plekken;
  }

  // Hetzelfde in een zin, voor bij de muis: "Within 30 tiles: 6 houses that want a chapel. They have none now."
  T.kringTekst = function (D, soort, plek) {
    const k = T.watDeKringBereikt(D, soort, plek);
    if (!k) return null;
    const wens = T.WENSEN[k.wens].naam;
    if (!k.huizen) return T.t('No one living within {straal} tiles wants {wens}.', { straal: k.straal, wens });
    const een = k.huizen === 1;
    const wie = T.t('{n|one house that wants {wens}|# houses that want {wens}}', { n: k.huizen, wens });
    let nu;
    if (!k.zonder) nu = een ? T.t('It already has one.') : T.t('They already have one.');
    else if (k.zonder === k.huizen) nu = een ? T.t('It has none now.') : T.t('They have none now.');
    else nu = T.t('{n|# of them has|# of them have} none now.', { n: k.zonder });
    return T.t('Within {straal} tiles: {wie}. {nu}', { straal: k.straal, wie, nu });
  };

  // ---------------------------------------------------------------------------------------------
  // Wat de huizen missen, en wat helpt
  // ---------------------------------------------------------------------------------------------

  // Wanneer je een gebouw kunt bouwen dat nu nog niet in het bouwmenu staat (T.GEBOUW_TREDEN, js/gebouwen.js).
  const naamVan = (soort) => T.GEBOUWEN[soort].naam;
  function nogNiet(soort) {
    const gebouw = T.eenNaam(naamVan(soort));
    const trede = T.GEBOUWEN[soort].trede;
    const tekst = trede === 'dorp' ? T.t('{gebouw} can only be built in a village', { gebouw })
      : trede === 'marktrecht' ? T.t('{gebouw} can only be built in a market town', { gebouw })
        : trede === 'stad' ? T.t('{gebouw} can only be built in a town', { gebouw })
          : T.t('{gebouw} can only be built later', { gebouw });
    return { kan: false, bouw: null, tekst };
  }
  const of = (namen) => (namen.length < 2 ? namen.join('')
    : T.t('{lijst} or {laatste}', { lijst: namen.slice(0, -1).join(', '), laatste: namen[namen.length - 1] }));

  // "five farms and a house": hoeveel huizen van elke soort, de soort met de meeste eerst.
  function wieTekst(perSoort) {
    return T.opsomming(Object.entries(perSoort).sort((a, b) => b[1] - a[1])
      .map(([soort, n]) => (n === 1 ? T.eenNaam(naamVan(soort))
        : T.t('{getal} {gebouw}', { getal: T.telwoord(n), gebouw: T.GEBOUWEN[soort].meervoud || naamVan(soort) }))));
  }

  // Waarom wat er staat niet genoeg maakt, kort, zoals de muis op het gebouw het zegt (T.gebouwToestand, js/gebouwen.js).
  function waaromTeWeinig(g) {
    const soort = T.GEBOUWEN[g.soort];
    const gebouw = soort.naam;
    if (g.stilWant) return T.t('the {gebouw} is idle: {reden}', { gebouw, reden: g.stilWant });
    if (soort.handen > (g.handen || 0)) {
      return g.handen ? T.t('the {gebouw} has too few hands', { gebouw }) : T.t('the {gebouw} has no hands', { gebouw });
    }
    if (g.tekort) {
      const waar = T.waarNaam(g.tekort);
      return g.werkte > 0 ? T.t('the {gebouw} has too little {waar}', { gebouw, waar }) : T.t('the {gebouw} has no {waar}', { gebouw, waar });
    }
    return T.t('the {gebouw} makes too little', { gebouw });
  }

  // De ketens (werklijst vraag 90, D; Marcel, 2 okt: "d ja"): wat een werkplaats nodig heeft (T.GEBOUWEN[x].maakt.in), en
  // wie dat maakt. Brood komt van de bakkerij, die meel nodig heeft van de molen; laken van de weverij, met wol van de
  // schapen. Wat geen werkplaats maakt, komt van buiten het bouwmenu: daar valt niets voor te bouwen.
  const makersVan = (wat) => Object.keys(T.GEBOUWEN).filter((s) => T.maaktGoed(s, wat));
  const VAN = {
    graan: () => T.t('grain comes from the fields'),
    wol: () => T.t('wool comes from the sheep, in {maand}', { maand: T.MAANDEN.find((m) => m.naam === 'zomermaand').toon }),
  };

  // Wat een werkplaats die je gaat bouwen nodig heeft en nergens gemaakt wordt, en wel te bouwen is: een bakkerij zonder
  // molen. Die noemt de raad er meteen bij ("bouw een bakkerij en een molen [B]"), zodat je de keten in één keer ziet.
  function ookNodig(D, soort) {
    const nodig = (T.GEBOUWEN[soort].maakt && T.GEBOUWEN[soort].maakt.in) || {};
    const erbij = [];
    for (const wat of Object.keys(nodig)) {
      const makers = makersVan(wat);
      if (!makers.length || (D.voorraad[wat] || 0) >= nodig[wat] || (D.gebouwen || []).some((g) => makers.includes(g.soort))) continue;
      const kan = makers.find((s) => T.magGebouwd(D, s));
      if (kan) erbij.push(kan);
    }
    return erbij;
  }

  // Hoe de raad zegt wat helpt: bouw het, met [B] (het bouwmenu). `nog`: er staat er al een, dus `wat` is de kale naam
  // ("hunter" wordt "another hunter"); anders heeft `wat` zijn lidwoord ("a bakery and a mill"; voor twee gebouwen heeft
  // het Engels geen ander werkwoord, dus `meer` is vervallen).
  function helptZin(wat, nog) {
    return nog ? T.t('another {wat} [B]', { wat }) : T.t('build {wat} [B]', { wat });
  }

  // Wat helpt, uit de soorten die het maken (een visser of een jager voor vlees of vis, een houthakker voor hout): { kan,
  // bouw, tekst }. Wat in dit seizoen stilligt (de visser in de winter), helpt nu niet. Wordt er een gebouwd, dan wacht
  // je daarop. Staat er een die niet genoeg heeft van wat hij nodig heeft, dan helpt wie dat maakt (de keten: "de
  // bakkerij heeft geen meel, bouw een molen [B]"), en wie te weinig handen heeft, helpt nog een niet. Anders nog een,
  // of waarom niet; en wat je nog niet kunt bouwen, wanneer wel. `keten`: hoe diep in een keten (een molen voor een
  // bakkerij is 1).
  function watHelpt(D, soorten, keten = 0) {
    const seizoen = D.kalender ? T.datumVanDag(D.kalender.dag).seizoen : null;
    const staan = (D.gebouwen || []).filter((g) => soorten.includes(g.soort));
    const inBouw = staan.find((g) => !g.klaar);
    if (inBouw) return { kan: false, bouw: null, tekst: T.t('the {gebouw} is being built', { gebouw: naamVan(inBouw.soort) }) };
    const stil = (soort) => T.stilOp(T.GEBOUWEN[soort], D.kalender ? D.kalender.dag : null, seizoen);
    const werken = staan.filter((g) => !stil(g.soort));
    const zonder = werken.find((g) => g.tekort);
    if (zonder) {
      const waarom = waaromTeWeinig(zonder);
      const makers = makersVan(zonder.tekort);
      if (makers.length && keten < 2) {
        const h = watHelpt(D, makers, keten + 1);
        const tekst = h.kan ? T.t('{waarom}, {hulp}', { waarom, hulp: h.tekst }) : T.t('{waarom}, and {hulp}', { waarom, hulp: h.tekst });
        return { kan: h.kan, bouw: h.bouw, tekst };
      }
      return { kan: false, bouw: null, tekst: VAN[zonder.tekort] && !keten ? T.t('{waarom}, and {reden}', { waarom, reden: VAN[zonder.tekort]() }) : waarom };
    }
    const zonderHanden = werken.find((g) => T.GEBOUWEN[g.soort].handen > (g.handen || 0));
    if (zonderHanden) return { kan: false, bouw: null, tekst: waaromTeWeinig(zonderHanden) };
    // Wat er bij kan. Wat in dit seizoen stilligt (een visser in de winter), helpt nu niet. Wat alleen in zijn maanden oogst
    // (de wijnboerderij, `alleenIn`), helpt ook daarbuiten, zolang er geen staat: zijn oogst moet er dan zijn. Staat er
    // een, dan zegt het vooruitkijken of er meer bij moeten (T.wijnNaDePluk in js/wijngaard.js), want wat
    // de huizen nu missen, maakt een nieuwe pas bij de volgende pluk goed (vraag 136; tot 10 okt vroeg het dorp er nooit
    // een, en daarna pas als de wijn al op was).
    const helpt = (s) => T.magGebouwd(D, s) && (T.GEBOUWEN[s].alleenIn ? !staan.some((g) => g.soort === s) : !stil(s));
    const helpen = soorten.filter(helpt);
    if (helpen.length) {
      const er = helpen.find((s) => staan.some((g) => g.soort === s));
      if (er) return { kan: true, bouw: er, tekst: helptZin(naamVan(er), true) };
      const erbij = helpen.length === 1 ? ookNodig(D, helpen[0]) : [];
      const een = (x) => T.eenNaam(naamVan(x));
      const wat = T.opsomming(helpen.length === 1 ? [helpen[0], ...erbij].map(een) : [of(helpen.map(een))]);
      return { kan: true, bouw: helpen[0], ook: erbij, tekst: helptZin(wat, false) };
    }
    if (staan.length) return { kan: false, bouw: null, tekst: waaromTeWeinig(staan[0]) };
    return nogNiet(soorten[0]);
  }

  // Wat helpt tegen een wens die gemist wordt, voor de raad (T.watDeHuizenMissen hieronder) en het briefje van een huis
  // (T.huisToestand): { kan, bouw, ook, tekst }. Een plek die je kunt bouwen, zeg je met de toets erachter, dus zonder
  // tekst ("Vijf hutten willen een put binnen 12 tegels [B]."); een die er al staat, ligt te ver: de herberg van het
  // gehucht helpt een huis buiten zijn kring niet. Een goed: wie het maakt (watHelpt).
  function hulpVoorWens(D, wens) {
    if (wens.plek) return T.magGebouwd(D, wens.plek) ? { kan: true, bouw: wens.plek, tekst: null } : nogNiet(wens.plek);
    const makers = Object.keys(T.GEBOUWEN).filter((s) => wens.goed.some((goed) => T.maaktGoed(s, goed)));
    makers.sort((a, b) => wens.goed.findIndex((goed) => T.maaktGoed(a, goed)) - wens.goed.findIndex((goed) => T.maaktGoed(b, goed)));
    return watHelpt(D, makers);
  }

  // Wat de huizen missen, en wat helpt (werklijst vraag 86, a, en 87; Marcel, 2 okt: "a ja b ja"), voor de raad onder
  // het doel (js/raad.js), het rapport van de raadsman (js/ochtendrapport.js) en de bouwer van de speeltest
  // (gereedschap/speeltest/speler.js): zo zeggen ze alle drie hetzelfde. Uit wat elk huis op de laatste dag wilde en had
  // (g.wensen, T.onthoudWensen hieronder), zoals de balk het zegt, dus vóór de eerste nacht weet het dorp het nog niet;
  // alleen een plek in de buurt kijkt naar nu, zodat een put die vandaag klaar is, meteen telt.
  //
  // Eerst de huizen die een maand alles hadden en op bouwstof wachten (js/behoeften.js), dan wat de meeste mensen
  // missen. Elk: { soort ('bouwstof' of 'wens'), id, huizen, mensen, kan, bouw, ook, tekst }. `kan`: er is nu iets
  // aan te doen (iets wat al gebouwd mag worden helpt, en er wordt er nog geen gebouwd); `bouw`: wat (een soort uit
  // T.GEBOUWEN); `ook`: wat de keten erbij nodig heeft (een molen bij een bakkerij; vraag 96, b), anders leeg; `tekst`:
  // de zin met wat helpt, met [B] waar het bouwmenu helpt. Geen eten of brandhout: dat zeggen de winter en de oorzaken.
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
      const zin = T.t('{wie} can become {gebouw}, but the stores do not hold {lijst}', {
        wie: T.hoofdletter(wieTekst({ [soort]: n })),
        gebouw: T.eenNaam(naamVan(T.GEBOUWEN[soort].wordt)),
        lijst: T.opsomming(mist.map((wat) => T.hoeveel(kosten[wat], wat))),
      });
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
      if (!w.n) {
        // Alle huizen die het missen, wachten op een plek in aanbouw: dat zegt het rapport, en er valt niets te doen.
        const woorden = { getal: T.hoofdletter(T.telwoord(w.wacht)), wens: w.wens.naam };
        const zin = w.wacht === 1 ? T.t('{getal} house is waiting for {wens}: one is being built.', woorden)
          : T.t('{getal} houses are waiting for {wens}: one is being built.', woorden);
        uit.push({ soort: 'wens', id: w.id, huizen: w.wacht, mensen: 0, kan: false, bouw: null, tekst: zin });
        continue;
      }
      const wie = T.hoofdletter(wieTekst(w.wie));
      const wens = w.wens.naam;
      const zin = w.straal
        ? T.t('{n|{wie} wants {wens} within {straal} tiles|{wie} want {wens} within {straal} tiles}', { n: w.n, wie, wens, straal: w.straal })
        : T.t('{n|{wie} wants {wens}|{wie} want {wens}}', { n: w.n, wie, wens });
      const h = hulpVoorWens(D, w.wens);
      uit.push({
        soort: 'wens', id: w.id, huizen: w.n, mensen: w.mensen, kan: h.kan, bouw: h.bouw, ook: h.ook || [],
        tekst: h.tekst ? `${zin}: ${h.tekst}.` : `${zin} [B].`,
      });
    }
    return uit;
  };

  // Wat een huis laat zien (2c, werklijst vraag 100; Marcel, 3 okt: "100 ja"): het teken bij zijn deur (js/tekenen.js), en
  // het briefje als de muis erop staat (js/hud.js). Uit wat het op de laatste dag wilde en had (g.wensen, T.onthoudWensen
  // hieronder), net als de raad. Null voor een huis zonder mensen. Geeft:
  //   stand, mensen, tevredenheid (0 tot 1), wie (de namen van wie er woont)
  //   wensen: [{ id, naam, heeft, helpt }], in de volgorde van zijn stand (eten en brandhout eerst); `helpt` zegt wat
  //           helpt als het mist ("bouw een visser of een jager [B]"), anders null; voor eten en brandhout zegt dat de raad
  //   teken: wat het als eerste mist, 'bouwstof' als het een maand alles had en op bouwstof wacht, of null
  //   groei: { dagen, nodig, wordt, kosten }: hoe ver het is met doorgroeien (js/behoeften.js), of null op de hoogste stand
  // Wat een huis als eerste mist, voor het teken bij zijn deur (js/tekenen.js): de eerste wens van zijn stand die het niet
  // heeft, 'bouwstof' als het een maand alles had en op bouwstof wacht, of null. Licht, want het scherm vraagt het elk beeld.
  T.tekenVanHuis = function (g) {
    const w = g && g.wensen;
    if (!w || !w.mensen) return null;
    const id = T.wensenVanStand(w.stand).find((x) => !gedekt(w.heeft[x] != null ? w.heeft[x] : 1));
    return id || (g.wachtOpBouwstof ? 'bouwstof' : null);
  };

  T.huisToestand = function (D, g) {
    const w = g && g.wensen;
    if (!w || !w.mensen) return null;
    const wensen = T.wensenVanStand(w.stand).map((id) => {
      const wens = T.WENSEN[id];
      const heeft = gedekt(w.heeft[id] != null ? w.heeft[id] : 1);
      let helpt = null;
      if (!heeft && !BASIS.includes(id)) {
        const h = hulpVoorWens(D, wens);
        const straal = wens.plek && IN().kring[wens.plek];
        if (h.tekst) helpt = h.tekst;
        else helpt = straal ? T.t('build one within {straal} tiles [B]', { straal }) : T.t('build one [B]');
      }
      return { id, naam: wens.naam, heeft, helpt };
    });
    const soort = T.GEBOUWEN[g.soort];
    const wordt = soort && soort.wordt && T.GEBOUWEN[soort.wordt];
    return {
      stand: w.stand, mensen: w.mensen, tevredenheid: w.tevredenheid,
      wie: ((D.bewoners && D.bewoners.mensen) || []).filter((p) => p.huis === g).map(T.naamVanBewoner),
      wensen,
      teken: T.tekenVanHuis(g),
      // Hoe ver het is met doorgroeien, en waarom het niet groeit terwijl het alles heeft (het gezin rooit eerst, of er
      // staat iets in de weg; T.waaromGroeitHetNiet in js/behoeften.js, werklijst vraag 130, c).
      groei: wordt
        ? { dagen: g.groeiDagen || 0, nodig: T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen, wordt: wordt.naam, kosten: IN().bouwstof[soort.wordt] || {}, waarom: T.waaromGroeitHetNiet(D, g) }
        : null,
    };
  };

  // De huizen nemen hun goederen uit de voorraad, zoals T.berekenWensen ze verdeelde (vanuit T.tikBehoeftenDag, vóór het
  // eten). Wat eten is (brood, vis, vlees), eten ze op: zoveel eet het dorp daarna minder aan graan (vraag 92, a; Marcel,
  // 2 okt: "A ja"). Geeft { bederfelijk: hoeveel vis en vlees er gebruikt werd, voor het zout (js/behoeften.js,
  // pasBederfToe), gegeten: hoeveel graan dat eten vulde (T.voedtAlsGraan) }.
  T.gebruikGoederen = function (D, wensen) {
    let bederfelijk = 0;
    let gegeten = 0;
    for (const id of Object.keys(wensen.goederen)) {
      let nodig = Object.values(wensen.goederen[id]).reduce((n, s) => n + s.krijgt, 0);
      for (const soort of T.WENSEN[id].goed) {
        const neem = Math.min(nodig, Math.max(0, D.voorraad[soort] || 0));
        if (neem <= 0) continue;
        T.wijzigVoorraad(D, soort, -neem);
        nodig -= neem;
        if (T.BEHOEFTEN_INSTELLINGEN.bederfelijk.includes(soort)) bederfelijk += neem;
        gegeten += neem * T.voedtAlsGraan(soort);
      }
    }
    return { bederfelijk, gegeten };
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
