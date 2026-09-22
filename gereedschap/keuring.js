// De keuring van de kaarten: alles wat het spel van een kaart verwacht, nagekeken zonder scherm
// en dus te toetsen (test/keuring.test.cjs). gereedschap/wereld.html zet de uitslag in beeld, met
// een klik die de camera naar de plek toe stuurt.
//
// De verdeling is die uit ontwerp/kaarten.md: Tiled houdt de grond, wij de betekenis. Wat met de
// tékening te maken heeft — een gid die niet bestaat, een boom in de verkeerde laag, twee
// gebouwen over elkaar — kijkt `npm run kaarten` na, want dat kent de tegelvellen op schijf.
// Hier staat alles wat iets betékent: wie er staat, welke quest eraan hangt, welke spreuk erop
// werkt, en waar je heen kunt. Voor Tiled is wezen="bakker" een stuk tekst; hier is het de vraag
// of die bakker een gesprek heeft, of hij niet in een boom staat, en of de leem die hij vraagt
// ergens te vinden is.
//
// Twee vragen, en ze wijzen tegengesteld:
//   T.keurKaart(naam, kaart)  — staat er iets op de kaart dat het spel niet kan gebruiken?
//   T.keurDekking()           — vraagt het spel iets dat op geen enkele kaart staat?
// De tweede is de nuttigste terwijl er nog neergezet moet worden: die zegt wat er nog ontbreekt.
//
// Een klacht is { soort: 'fout' | 'let op', kaart, x, y, tekst }. 'fout' is kapot: het spel doet
// het daar niet. 'let op' werkt wel, maar is waarschijnlijk niet bedoeld. x en y zijn null als de
// klacht nergens op de kaart ligt (dat is bij de dekking zo: wat er níet staat, heeft geen plek).
(function (T) {
  'use strict';

  const lijst = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const BUREN = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

  // De objecten uit een .tmj zoals Marcel ze in Tiled neerzette, met hun tegel en hun
  // eigenschappen. Dezelfde omrekening als js/kaart.js: op een isometrische kaart deelt Tiled
  // x én y door de tegelhoogte (zie de uitleg daar).
  T.kaartObjecten = function (kaart) {
    const th = kaart.tileheight || 32;
    const uit = [];
    for (const laag of kaart.layers || []) {
      if (laag.type !== 'objectgroup') continue;
      for (const obj of laag.objects || []) {
        const eig = {};
        for (const p of obj.properties || []) eig[p.name] = p.value;
        uit.push({
          naam: obj.name || '', laag: laag.name || '', gid: obj.gid || 0,
          x: Math.round(obj.x / th), y: Math.round(obj.y / th), eig,
        });
      }
    }
    return uit;
  };

  // ── Wat er op één kaart staat ──

  // `kaart` is een ingelezen .tmj. Geeft { wereld, klachten } terug: de wereld zoals het spel hem
  // ziet (T.laadKaart, dezelfde inlezer, nooit een eigen kopie) en wat eraan mankeert.
  T.keurKaart = function (naam, kaart, opties) {
    const gebieden = (opties && opties.gebieden) || T.GEBIEDEN || {};
    const klachten = [];
    const fout = (x, y, tekst) => klachten.push({ soort: 'fout', kaart: naam, x, y, tekst });
    const letOp = (x, y, tekst) => klachten.push({ soort: 'let op', kaart: naam, x, y, tekst });

    const w = (opties && opties.wereld) || T.laadKaart(kaart);
    const objecten = T.kaartObjecten(kaart);
    const binnen = (x, y) => x >= 0 && y >= 0 && x < w.b && y < w.h;
    const vast = (x, y) => binnen(x, y) && w.tegels[y][x] === 'muur';
    // Waar liggen de voorwerpen die het spel er werkelijk van maakte? Daarmee kunnen we een
    // object dat T.laadKaart heeft laten vallen herkennen zonder de tegelvellen zelf na te lopen.
    const alleVoorwerpen = [...w.voorwerpen, ...(w.questVoorwerpen || [])];
    const voorwerpOp = (x, y) => alleVoorwerpen.filter((v) => v.x === x && v.y === y);

    let helden = 0;
    const bezet = new Map(); // tegel -> wie er al staat, voor twee mensen op dezelfde plek

    for (const o of objecten) {
      const p = o.eig;
      const waar = o.naam ? `"${o.naam}"` : 'een object';

      if (!binnen(o.x, o.y)) {
        fout(null, null, `${waar} valt buiten de kaart (${o.x}, ${o.y}); het spel slaat het over`);
        continue;
      }

      // ── wie hier staat ──
      if (p.wezen !== undefined) {
        if (!T.WEZENS || !T.WEZENS[p.wezen]) {
          fout(o.x, o.y, `onbekend wezen "${p.wezen}"; het spel slaat het over. Kijk de spelling na tegen T.WEZENS in js/wereld.js`);
        } else {
          if (p.wezen === 'held') helden++;
          if (p.zaad !== undefined) letOp(o.x, o.y, `"${p.wezen}" heeft ook een zaad; het spel neemt het wezen en laat het zaad liggen`);
        }
      }
      if (p.wezen !== undefined || p.zaad !== undefined) {
        const wie = p.wezen !== undefined ? `"${p.wezen}"` : `een dorpeling (zaad ${p.zaad})`;
        if (vast(o.x, o.y)) fout(o.x, o.y, `${wie} staat op een vaste tegel — in een boom, een muur of een huis; hij kan daar niet vandaan`);
        const sleutel = o.x + ',' + o.y;
        if (bezet.has(sleutel)) letOp(o.x, o.y, `${wie} staat op dezelfde tegel als ${bezet.get(sleutel)}`);
        else bezet.set(sleutel, wie);
        if (p.straal !== undefined && !(Number(p.straal) > 0)) {
          letOp(o.x, o.y, `${wie} heeft straal "${p.straal}"; dat is geen getal boven nul, dus hij blijft staan waar hij staat`);
        }
        if (Number(p.straal) > 0 && !BUREN.some(([dx, dy]) => T.isBegaanbaar(w, o.x + dx, o.y + dy))) {
          letOp(o.x, o.y, `${wie} dwaalt (straal ${p.straal}) maar heeft geen enkele begaanbare buurtegel`);
        }
      }

      // ── wat aan een quest hangt ──
      if (p.quest !== undefined) {
        const g = T.questGrendel(String(p.quest));
        const q = g && T.QUESTS ? T.QUESTS[g.quest] : null;
        if (!g) fout(o.x, o.y, `quest="${p.quest}" is niet te lezen; de vorm is quest="bakker:zoeken"`);
        else if (!q) fout(o.x, o.y, `quest="${p.quest}" noemt quest "${g.quest}", en die bestaat niet in js/quests.js`);
        else {
          for (const f of g.fase || []) {
            if (!q.fasen[f]) fout(o.x, o.y, `quest="${p.quest}" noemt fase "${f}", en die heeft "${g.quest}" niet`);
          }
        }
        // T.laadKaart weigert een questvoorwerp dat vast is (dan zou er een muur komen en gaan
        // waar net iemand liep) en laat het gewoon liggen. Dat herken je eraan dat het hier niet
        // in w.questVoorwerpen terecht is gekomen.
        const heeftGrendel = (w.questVoorwerpen || []).some((v) => v.x === o.x && v.y === o.y);
        if (g && q && !heeftGrendel) {
          fout(o.x, o.y, `${waar} is vast en kan dus niet aan een quest hangen; het ligt er nu altijd. Zet er een tegel neer die niet vast is`);
        }
      }

      // ── wat om een spreuk vraagt ──
      if (p.raak !== undefined) {
        const r = T.RAAKPUNTEN && T.RAAKPUNTEN[String(p.raak)];
        if (!r) fout(o.x, o.y, `raak="${p.raak}" bestaat niet in T.RAAKPUNTEN (js/quests.js)`);
        if (!voorwerpOp(o.x, o.y).some((v) => v.raak === String(p.raak))) {
          fout(o.x, o.y, `raak="${p.raak}" staat op een object zonder tegel; alleen een voorwerp uit tegels/ kan een raakpunt zijn`);
        } else if (!BUREN.some(([dx, dy]) => T.isBegaanbaar(w, o.x + dx, o.y + dy))) {
          // Een spreuk vraagt vrij zicht, en dwars door de muur die je wilt raken is er geen.
          fout(o.x, o.y, `raak="${p.raak}" staat nergens naast een begaanbare tegel; je kunt er met geen enkele spreuk bij`);
        }
      }

      // ── waar je heen kunt ──
      if (p.overgang !== undefined) {
        const naar = String(p.overgang);
        if (!gebieden[naar]) {
          fout(o.x, o.y, `overgang naar "${naar}", maar dat gebied bestaat niet. Teken kaarten/${naar}.tmj in Tiled en draai npm run kaarten`);
        }
        if (!T.isBegaanbaar(w, o.x, o.y)) fout(o.x, o.y, `de overgang naar "${naar}" ligt op een tegel waar je niet kunt komen`);
        const o2 = (w.overgangen || []).find((v) => v.x === o.x && v.y === o.y);
        if (!o2 || !o2.komt) {
          letOp(o.x, o.y, `de overgang naar "${naar}" heeft geen "komt"; het spel kiest dan zelf een tegel ernaast om op te landen`);
        } else if (!T.isBegaanbaar(w, o2.komt.x, o2.komt.y)) {
          fout(o2.komt.x, o2.komt.y, `"komt" van de overgang naar "${naar}" wijst naar een tegel waar je niet kunt staan`);
        } else if (o2.komt.x === o.x && o2.komt.y === o.y) {
          fout(o.x, o.y, `"komt" wijst naar de overgangstegel zelf; dan kaats je heen en weer tussen twee gebieden`);
        }
      }
    }

    if (helden > 1) fout(null, null, `er staan ${helden} objecten met wezen="held" op deze kaart; het spel weet dan niet waar je begint`);
    // Een gebied zonder uitgang is een val: daar kom je nooit meer weg. js/gebied.js roept dat
    // ook, maar pas als een speler er staat.
    if (!(w.overgangen || []).length) {
      fout(null, null, 'deze kaart heeft geen enkele overgang — wie er komt, komt er niet meer weg');
    }

    return { wereld: w, klachten };
  };

  // ── Wat het spel vraagt en de wereld niet geeft ──

  // Alle gebieden bij elkaar, ook de toren (die staat in code, js/wereld.js). Deze vraag gaat
  // over het spel als geheel: de bakker mag op elke kaart staan, als hij maar ergens staat.
  function alleWerelden(opties) {
    if (opties && opties.werelden) return opties.werelden;
    const gebieden = (opties && opties.gebieden) || T.GEBIEDEN || {};
    const uit = {};
    for (const [naam, g] of Object.entries(gebieden)) {
      try {
        uit[naam] = g.maak();
      } catch (e) {
        /* een kaart die niet in te lezen is, klaagt al bij T.keurKaart */
      }
    }
    return uit;
  }

  // Alles wat een voorwerp in je tas kan stoppen: een beloning, een gevolg in een gesprek, of
  // gewoon iets dat op een kaart ligt en op te rapen is.
  function bronnenVanVoorwerpen(werelden) {
    const uit = new Set();
    for (const p of Object.values(T.GESPREKKEN || {})) {
      for (const k of Object.values(p.knopen || {})) {
        for (const c of k.keuzes || []) lijst(c.doe && c.doe.geef).forEach((n) => uit.add(n));
      }
    }
    for (const q of Object.values(T.QUESTS || {})) {
      for (const f of Object.values(q.fasen || {})) {
        lijst(f.beloning && f.beloning.geef).forEach((n) => uit.add(n));
        for (const wg of Object.values(f.wegen || {})) lijst(wg.doe && wg.doe.geef).forEach((n) => uit.add(n));
      }
    }
    for (const w of Object.values(werelden)) {
      for (const v of [...w.voorwerpen, ...(w.questVoorwerpen || [])]) uit.add(v.soort);
    }
    return uit;
  }

  T.keurDekking = function (opties) {
    const klachten = [];
    const fout = (tekst) => klachten.push({ soort: 'fout', kaart: null, x: null, y: null, tekst });
    const letOp = (tekst) => klachten.push({ soort: 'let op', kaart: null, x: null, y: null, tekst });
    const werelden = alleWerelden(opties);

    // Wie staat er, en waar dan? De plek erbij, zodat de lijst ook zegt wat er wél goed staat.
    const wezens = new Map();
    const raakpunten = new Map();
    const questVoorwerpen = [];
    for (const [naam, w] of Object.entries(werelden)) {
      for (const e of w.wezens) if (!wezens.has(e.soort)) wezens.set(e.soort, naam);
      for (const v of [...w.voorwerpen, ...(w.questVoorwerpen || [])]) {
        if (v.raak && !raakpunten.has(v.raak)) raakpunten.set(v.raak, naam);
        if (v.grendel) questVoorwerpen.push({ v, kaart: naam });
      }
    }
    const bronnen = bronnenVanVoorwerpen(werelden);

    for (const id of Object.keys(T.GESPREKKEN || {})) {
      if (!wezens.has(id)) fout(`"${id}" heeft een gesprek, maar staat nergens in de wereld. Zet in Tiled een object neer met wezen="${id}"`);
    }
    for (const id of Object.keys(T.RAAKPUNTEN || {})) {
      if (!raakpunten.has(id)) fout(`raakpunt "${id}" wacht op een ${(T.RAAKPUNTEN[id] || {}).spreuk || 'spreuk'}, maar staat nergens. Zet in Tiled raak="${id}" op het ding dat geraakt moet worden`);
    }
    for (const [id, q] of Object.entries(T.QUESTS || {})) {
      if (q.gever && !wezens.has(q.gever)) fout(`quest "${q.naam || id}" komt van "${q.gever}", en die staat nergens in de wereld`);
      for (const [faseId, f] of Object.entries(q.fasen || {})) {
        for (const [wegId, wg] of Object.entries(f.wegen || {})) {
          const nodig = wg.klaarAls && wg.klaarAls.heeft;
          if (nodig && !bronnen.has(nodig)) {
            fout(`"${q.naam || id}" komt uit "${faseId}" langs "${wegId}" zodra je "${nodig}" hebt, maar dat is nergens te krijgen: geen voorwerp op een kaart en geen gesprek dat het geeft`);
          }
        }
      }
    }
    // Een voorwerp dat aan een quest hangt maar niet op te rapen is (T.OPRAPEN in
    // js/verkennen.js), ligt er wel en doet niets: de quest loopt dood.
    if (T.OPRAPEN) {
      for (const { v, kaart } of questVoorwerpen) {
        if (!T.OPRAPEN[v.soort]) {
          letOp(`"${v.soort}" op ${kaart} (${v.x}, ${v.y}) hangt aan quest "${v.grendel.quest}", maar staat niet in T.OPRAPEN (js/verkennen.js), dus je kunt het niet oppakken`);
        }
      }
    }

    return klachten;
  };
})(globalThis.Toren = globalThis.Toren || {});
