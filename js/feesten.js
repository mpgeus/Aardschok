// De feesten (werklijst vraag 97; Marcel, 3 okt: "Wel met 1 of 2 feesten erin voor de demo", en bij het plan: het
// oogstfeest "Ja, een hele dag vrij", en het tweede feest "De meiboom"). Zeg je ja op een feest, dan viert het hele dorp
// het op het plein. Bij een groot feest (feest: 'dag' in een antwoord, js/gesprekken.js) werkt de dag erna niemand, en
// staat iedereen er van het begin van het werk tot bedtijd; bij een klein feest (feest: 'avond') alleen 's avonds,
// vanavond nog als het kan. Er brandt licht op het plein (T.feestLicht, voor T.lichtBronnen in js/zien.js), de
// herbergierster tapt, en de schout kan erbij gaan staan. Wat het kost (graan, bier, hout), staat in het antwoord; een
// hele dag kost ook een dag werk: de werkplaatsen maken niets (T.vrijeDag, in T.tikGebouwenDag) en de boeren maaien niet
// (T.werkOogstBij). Wie er die avond is, gaat niet naar de herberg (T.herbergGasten). Regels zonder scherm; toetsen in
// test/feesten.test.cjs.
//
// Welke feesten er zijn, staat in T.FEESTEN; wanneer ze komen, bij de voorvallen (js/voorvallen.js, soort 'feest'): het
// oogstfeest na de oogst, en de meiboom op 30 grasmaand, een vaste dag (op), zodat hij morgen, op 1 bloeimaand, staat.
// Met de spelregel "Feesten" op "Alleen de stemming" is een feest wat het vóór 3 okt was: een gesprek en een stemming.
//
// D.feesten:
//   komt     het feest dat komt of nu is: { id, dag, heel, midden, begonnen }, of null. heel: de hele dag (anders de
//            avond); midden: waar het dorp zich verzamelt, gezet als het feest begint (T.feestBegint)
//   boom     de meiboom die op het plein staat: { x, y, tot }, of null
//   gevierd  de feesten die er waren: [{ id, dag, heel }], de laatste tien
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js).
  T.FEESTEN_INSTELLINGEN = {
    // Viert het dorp een feest op het plein, of is het alleen een stemming, zoals vóór 3 okt (de spelregel "Feesten").
    vieren: true,
    // Hoe ver om het midden het dorp staat, in tegels: wie er is, staat binnen deze kring.
    kring: 5,
    // Het licht van een feest 's avonds, rond het midden: zo ver (tegels) en zo fel (0 tot 1), voor de gloed
    // (js/tekenen.js) en wie wat ziet (js/zien.js).
    lichtStraal: 6,
    lichtSterkte: 0.6,
    // Zoveel dagen blijft de meiboom staan.
    meiboomDagen: 30,
  };
  const IN = () => T.FEESTEN_INSTELLINGEN;

  // De feesten, en wat er dan op het plein komt te staan (voorwerp, T.VOORWERPEN in js/wereld.js).
  T.FEESTEN = {
    oogstfeest: { naam: 'het oogstfeest' },
    meiboom: { naam: 'de meiboom', voorwerp: 'meiboom' },
  };

  T.nieuweFeesten = () => ({ komt: null, boom: null, gevierd: [] });
  const feestenVan = (D) => D.feesten || (D.feesten = T.nieuweFeesten());

  // Waar het dorp zich verzamelt: de tegel van het plein (T.pleinTegels, js/wereld.js) het dichtst bij zijn midden waar
  // niets staat en niemand: begaanbaar, geen voorwerp, en niet de plek van de marskramer (T.pleinVan, js/bewoners.js).
  // Null als de kaart geen plein heeft.
  function middenVan(w) {
    const tegels = T.pleinTegels(w);
    if (!tegels.length) return null;
    const mx = tegels.reduce((s, t) => s + t.x, 0) / tegels.length;
    const my = tegels.reduce((s, t) => s + t.y, 0) / tegels.length;
    const kraam = T.pleinVan(w);
    let beste = null;
    let afstand = Infinity;
    for (const t of tegels) {
      if (kraam && t.x === kraam.x && t.y === kraam.y) continue;
      if (!T.isBegaanbaar(w, t.x, t.y) || T.voorwerpOp(w, t.x, t.y) || T.wezenOp(w, t.x, t.y)) continue;
      const a = Math.hypot(t.x - mx, t.y - my);
      if (a < afstand) {
        afstand = a;
        beste = t;
      }
    }
    return beste && { x: beste.x, y: beste.y };
  }

  // De tegels van het plein rond het midden, binnen de kring, zonder het midden zelf: één keer per kaart en midden.
  const KRING = new WeakMap();
  function kringVan(w, midden) {
    const sleutel = `${midden.x},${midden.y},${IN().kring}`;
    const k = KRING.get(w);
    if (k && k.sleutel === sleutel) return k.tegels;
    const tegels = T.pleinTegels(w).filter((t) => {
      const r = Math.max(Math.abs(t.x - midden.x), Math.abs(t.y - midden.y));
      return r >= 1 && r <= IN().kring;
    });
    KRING.set(w, { sleutel, tegels });
    return tegels;
  }

  // ---------------------------------------------------------------------------------------------
  // Wanneer
  // ---------------------------------------------------------------------------------------------

  // Er komt een feest (een antwoord met feest: 'dag' of 'avond', js/voorvallen.js): een hele dag, de dag na `nu`, of een
  // avond, vanavond nog als er nog een uur van de avond over is. Is het vandaag, dan begint het meteen (T.feestBegint).
  // Geeft het feest, of null als de spelregel zegt dat het dorp niet viert.
  T.zetFeest = function (D, id, hoe, nu) {
    if (!IN().vieren || !T.FEESTEN[id]) return null;
    const heel = hoe === 'dag';
    const vandaag = Math.floor(nu);
    const dag = !heel && T.uurVanDag(nu) < T.dagindeling(nu).slapen - 1 ? vandaag : vandaag + 1;
    const F = feestenVan(D);
    F.komt = { id, dag, heel, midden: null, begonnen: false };
    if (dag === vandaag) T.feestBegint(D, F.komt, true);
    return F.komt;
  };

  // Een feest begint (zijn dag is er, of het is vanavond): het dorp kiest zijn midden, zet er neer wat erbij hoort (de
  // meiboom), en zegt het, tenzij het antwoord het al zei (stil).
  T.feestBegint = function (D, f, stil) {
    const F = feestenVan(D);
    const w = D.wereld;
    const soort = T.FEESTEN[f.id];
    f.begonnen = true;
    f.midden = w ? middenVan(w) : null;
    if (soort.voorwerp === 'meiboom' && f.midden) {
      haalBoomWeg(D);
      T.zetVoorwerp(w, { soort: 'meiboom', x: f.midden.x, y: f.midden.y });
      F.boom = { x: f.midden.x, y: f.midden.y, tot: f.dag + IN().meiboomDagen };
    }
    if (stil) return;
    T.zeg(D, f.heel ? `Vandaag viert het dorp ${soort.naam} op het plein. Er wordt niet gewerkt.` : `Vanavond viert het dorp ${soort.naam} op het plein.`);
  };

  function haalBoomWeg(D) {
    const F = D.feesten;
    const w = D.wereld;
    if (!F || !F.boom) return;
    const v = w && w.voorwerpen.find((x) => x.soort === 'meiboom' && x.x === F.boom.x && x.y === F.boom.y);
    if (v) T.haalVoorwerpWeg(w, v);
    F.boom = null;
  }

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js): een feest van gisteren is gevierd (het dagboek schrijft het op, voor het
  // rapport); een meiboom die zijn dagen stond, gaat weg; en begint vandaag een feest, dan begint het.
  T.tikFeestenDag = function (D, dag) {
    const F = D.feesten;
    if (!F) return;
    const f = F.komt;
    if (f && f.dag < dag) {
      F.gevierd.push({ id: f.id, dag: f.dag, heel: f.heel });
      if (F.gevierd.length > 10) F.gevierd.shift();
      F.komt = null;
      const naam = T.FEESTEN[f.id].naam;
      T.schrijfOp(D, 'feest', { tekst: f.heel ? `Het hele dorp vierde ${naam} op het plein; er werd niet gewerkt.` : `Het dorp vierde ${naam} op het plein, 's avonds.` });
    }
    if (F.boom && dag >= F.boom.tot) haalBoomWeg(D);
    if (F.komt && F.komt.dag === dag && !F.komt.begonnen) T.feestBegint(D, F.komt);
  };

  // Het feest van nu (`nu`: de dag met het uur erachter), of null: op zijn dag, vanaf het begin van het werk (een hele dag)
  // of het begin van de avond (in de oogst later, zoals de herberg), tot bedtijd (js/dag.js).
  T.feestOp = function (D, nu) {
    const f = D.feesten && D.feesten.komt;
    if (!f || !f.begonnen || Math.floor(nu) !== f.dag) return null;
    const d = T.dagindeling(nu);
    const begin = f.heel ? d.werkBegin : T.isOogstDag(nu) ? d.werkEindOogst : d.werkEind;
    const u = T.uurVanDag(nu);
    return u >= begin && u < d.slapen ? f : null;
  };

  // Is dag `dag` een hele feestdag? Dan werkt niemand: de werkplaatsen maken niets (T.tikGebouwenDag) en de boeren maaien
  // niet (T.werkOogstBij, js/akkers.js).
  T.vrijeDag = function (D, dag) {
    const f = D.feesten && D.feesten.komt;
    return !!(f && f.heel && f.dag === Math.floor(dag));
  };

  // Is er op de avond van dag `dag` een feest, een hele dag of een avond? Dan gaat niemand naar de herberg
  // (T.herbergGasten, js/herberg.js): het bier van die avond staat in het antwoord.
  T.feestAvond = function (D, dag) {
    const f = D.feesten && D.feesten.komt;
    return !!(f && f.dag === Math.floor(dag));
  };

  // ---------------------------------------------------------------------------------------------
  // Waar, en het licht
  // ---------------------------------------------------------------------------------------------

  // Waar iemand op een feest staat (T.dagAnker, js/dag.js): het hele dorp rond het midden, elk op zijn eigen plek in de
  // kring (zijn nummer kiest hem, zoals T.plekOpHetPlein), een kind wat ruimer, en de herbergierster naast het midden,
  // aan de tap. Wie net komt (p.komt), gaat eerst naar zijn huis. Anders null.
  T.feestAnker = function (D, e) {
    const f = D.kalender && T.feestOp(D, D.kalender.dag);
    if (!f || !f.midden) return null;
    const p = T.bewonerVan(D, e);
    if (!p || p.komt) return null;
    const w = D.wereld;
    if (p.huis && p.huis === T.herbergVan(D)) return { x: f.midden.x + 1, y: f.midden.y, straal: 1 };
    const tegels = kringVan(w, f.midden);
    if (!tegels.length) return { x: f.midden.x, y: f.midden.y, straal: IN().kring };
    const t = tegels[(Math.imul((p.id | 0) + 1, 2654435761) >>> 0) % tegels.length];
    return { x: t.x, y: t.y, straal: p.leeftijd === 'kind' ? 2 : 1 };
  };

  // Het licht van een feest (T.lichtBronnen, js/zien.js): rond het midden, zolang het feest duurt. Een lijst, leeg als er
  // geen feest is; de gloed tekent js/tekenen.js alleen 's avonds.
  T.feestLicht = function (D) {
    const f = D.kalender && T.feestOp(D, D.kalender.dag);
    if (!f || !f.midden) return [];
    return [{ x: f.midden.x, y: f.midden.y, straal: IN().lichtStraal, sterkte: IN().lichtSterkte }];
  };

  // Wat een feest in een antwoord kost, voor het venster (T.prijsVanKeuze, js/voorvallen.js): '' als het dorp niet viert.
  T.feestPrijs = function (hoe) {
    if (!IN().vieren) return '';
    return hoe === 'dag' ? 'morgen werkt niemand' : "'s avonds feest op het plein";
  };
})(globalThis.Spel = globalThis.Spel || {});
