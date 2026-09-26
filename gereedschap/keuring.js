// De keuring van de kaarten: alles wat het spel van een kaart verwacht, nagekeken zonder scherm
// en dus te toetsen (test/keuring.test.cjs). gereedschap/wereld.html zet de uitslag in beeld, met
// een klik die de camera naar de plek toe stuurt.
//
// De verdeling is die uit ontwerp/kaarten.md: Tiled houdt de grond, wij de betekenis. Wat met de
// tékening te maken heeft — een gid die niet bestaat, een boom in de verkeerde laag, twee
// gebouwen over elkaar — kijkt `npm run kaarten` na, want dat kent de tegelvellen op schijf.
// Hier staat alles wat iets betékent: wie er staat, welke quest eraan hangt, en waar je heen
// kunt. Voor Tiled is wie="boer1" een stuk tekst; hier is het de vraag of die boer een gesprek
// heeft, of hij niet in een boom staat, en of wat een quest vraagt ergens te vinden is.
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
  // Wat een ding betékent, en dus niet meer in Tiled hoort te staan (ontwerp/kaarten.md).
  const BETEKENISVELDEN = ['wie', 'wezen', 'zaad', 'staat', 'overgang', 'quest'];
  const DEURSTANDEN = ['open', 'dicht', 'opslot', 'geheim'];

  // Alles wat er op een kaart staat, uit allebei de bronnen: de objecten die Marcel in Tiled
  // neerzette, en de dingen uit kaarten/<naam>.betekenis.json. `bron` zegt waar het vandaan komt,
  // want dat is zelf iets om over te klagen: wat betekenis heeft, hoort niet meer in Tiled.
  // Dezelfde omrekening als js/kaart.js: op een isometrische kaart deelt Tiled x én y door de
  // tegelhoogte (zie de uitleg daar).
  T.kaartObjecten = function (kaart, betekenis) {
    const th = kaart.tileheight || 32;
    const uit = [];
    for (const laag of kaart.layers || []) {
      if (laag.type !== 'objectgroup') continue;
      for (const obj of laag.objects || []) {
        const eig = {};
        for (const p of obj.properties || []) eig[p.name] = p.value;
        uit.push({
          bron: 'tiled', naam: obj.name || '', laag: laag.name || '', gid: obj.gid || 0,
          x: Math.round(obj.x / th), y: Math.round(obj.y / th), eig,
        });
      }
    }
    for (const ding of (betekenis && betekenis.dingen) || []) {
      uit.push({
        bron: 'betekenis', naam: String(ding.tegel || ding.wezen || ding.overgang || ''), laag: '', gid: 0,
        x: Math.round(ding.x), y: Math.round(ding.y), eig: ding,
      });
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

    const betekenis = (opties && opties.betekenis) || (T.BETEKENIS && T.BETEKENIS[naam]) || null;
    const w = (opties && opties.wereld) || T.laadKaart(kaart, betekenis);
    const objecten = T.kaartObjecten(kaart, betekenis);
    const binnen = (x, y) => x >= 0 && y >= 0 && x < w.b && y < w.h;
    const vast = (x, y) => binnen(x, y) && w.tegels[y][x] === 'muur';
    // Waar liggen de voorwerpen die het spel er werkelijk van maakte? Daarmee kunnen we een
    // object dat T.laadKaart heeft laten vallen herkennen zonder de tegelvellen zelf na te lopen.
    const alleVoorwerpen = [...w.voorwerpen, ...(w.questVoorwerpen || [])];
    const voorwerpOp = (x, y) => alleVoorwerpen.filter((v) => v.x === x && v.y === y);

    let schouten = 0;
    const bezet = new Map(); // tegel -> wie er al staat, voor twee mensen op dezelfde plek
    const mensenHier = new Map(); // welke mens waar: dezelfde twee keer neerzetten kan niet
    const gesprekkenHier = new Map(); // welk gesprek waar: twee monden voor één tekst

    for (const o of objecten) {
      const p = o.eig;
      const waar = o.naam ? `"${o.naam}"` : 'een object';

      if (!binnen(o.x, o.y)) {
        fout(null, null, `${waar} valt buiten de kaart (${o.x}, ${o.y}); het spel slaat het over`);
        continue;
      }

      // ── staat het nog in Tiled? ──
      // Tiled tekent alleen nog de grond (ontwerp/kaarten.md). Wat iets betekent, hoort in het
      // betekenisbestand, waar het gereedschap het kan neerzetten en verslepen.
      if (o.bron === 'tiled' && BETEKENISVELDEN.some((v) => p[v] !== undefined)) {
        letOp(o.x, o.y, `${waar} heeft betekenis (${BETEKENISVELDEN.filter((v) => p[v] !== undefined).join(', ')}) maar staat nog in Tiled; het hoort in ${naam}.betekenis.json`);
      }

      // ── een deur, en een geheime doorgang ──
      if (p.staat !== undefined) {
        if (!DEURSTANDEN.includes(String(p.staat))) {
          fout(o.x, o.y, `staat="${p.staat}" is geen deur; het moet ${DEURSTANDEN.join(', ')} zijn`);
        }
        if (p.staat === 'geheim' && !p.als) {
          letOp(o.x, o.y, 'een geheime doorgang zonder "als" is er meteen; zet er een vlag of een questfase op, anders is hij niet geheim');
        }
        if (p.staat === 'geheim' && p.als && p.als.quest && T.QUESTS && !T.QUESTS[p.als.quest]) {
          fout(o.x, o.y, `de geheime doorgang wacht op quest "${p.als.quest}", en die bestaat niet`);
        }
      }

      // ── wie hier staat ──
      // Eén mens uit T.MENSEN (js/mensen.js). Twee keer dezelfde neerzetten kan niet: dan zou
      // dezelfde bakker op twee plekken staan, en weet niemand meer welke de echte is.
      if (p.wie !== undefined) {
        if (!T.MENSEN || !T.MENSEN[p.wie]) {
          fout(o.x, o.y, `onbekende mens "${p.wie}"; het spel slaat hem over. Kijk de lijst na in js/mensen.js`);
        } else if (mensenHier.has(p.wie)) {
          const eerder = mensenHier.get(p.wie);
          fout(o.x, o.y, `"${T.naamVanMens(p.wie)}" staat ook al op (${eerder.x}, ${eerder.y}); één mens kan niet op twee plekken staan`);
        } else {
          mensenHier.set(p.wie, { x: o.x, y: o.y });
        }
      }
      if (p.wezen !== undefined) {
        if (!T.WEZENS || !T.WEZENS[p.wezen]) {
          fout(o.x, o.y, `onbekend wezen "${p.wezen}"; het spel slaat het over. Kijk de spelling na tegen T.WEZENS in js/wereld.js`);
        } else {
          if (p.wezen === 'schout') schouten++;
          if (p.zaad !== undefined) letOp(o.x, o.y, `"${p.wezen}" heeft ook een zaad; het spel neemt het wezen en laat het zaad liggen`);
        }
      }
      if (p.wie !== undefined || p.wezen !== undefined || p.zaad !== undefined) {
        const wie = p.wie !== undefined ? `"${T.naamVanMens(p.wie)}"`
          : p.wezen !== undefined ? `"${p.wezen}"`
          : `een dorpeling (zaad ${p.zaad})`;
        // Twee poppetjes die hetzelfde gesprek voeren, zeggen woord voor woord hetzelfde. Bij de
        // bruid en de bruidegom kan dat expres zijn; meestal is het een vergissing.
        const gesprek = p.wie !== undefined ? T.gesprekVanMens(p.wie) : p.gesprek;
        if (gesprek && T.GESPREKKEN && T.GESPREKKEN[gesprek]) {
          if (gesprekkenHier.has(gesprek)) {
            const eerder = gesprekkenHier.get(gesprek);
            letOp(o.x, o.y, `${wie} voert hetzelfde gesprek "${gesprek}" als wie er op (${eerder.x}, ${eerder.y}) staat; ze zeggen dan precies hetzelfde`);
          } else {
            gesprekkenHier.set(gesprek, { x: o.x, y: o.y });
          }
        }
        // Een eigen gesprek, los van de soort (T.gesprekIdVan in js/gesprek.js). Staat er een
        // naam die niet bestaat, dan zegt hij niets en merk je dat pas als je ernaartoe loopt.
        if (p.gesprek !== undefined && (!T.GESPREKKEN || !T.GESPREKKEN[p.gesprek])) {
          fout(o.x, o.y, `${wie} verwijst naar gesprek "${p.gesprek}", en dat bestaat niet in js/gesprekken.js`);
        }
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

      // ── waar je heen kunt ──
      if (p.overgang !== undefined) {
        const naar = String(p.overgang);
        if (!gebieden[naar] && betekenis && betekenis.proef) {
          // Een proefkaart mag een weg hebben die nog nergens heen leidt: het gehucht, waarvan de
          // weg de wereld in sinds 25 sep bewust nergens uitkomt (js/gebied.js). Wie erop stapt,
          // blijft staan in de mist.
          letOp(o.x, o.y, `overgang naar "${naar}": die kaart is er (nog) niet. Op een proefkaart mag dat; wie erop stapt, blijft staan`);
        } else if (!gebieden[naar]) {
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

    // De vlekvulling kost op de grote kaart een fractie van een seconde. Dat mag bij elke
    // wijziging, maar niet bij elke muisbeweging terwijl je iets versleept: dan vraagt het
    // gereedschap om een snelle keuring en komt deze er bij het loslaten achteraan.
    if (!(opties && opties.snel)) keurBereik(w, fout, letOp);

    if (schouten > 1) fout(null, null, `er staan ${schouten} objecten met wezen="schout" op deze kaart; het spel weet dan niet waar je begint`);
    // Een gebied zonder uitgang is een val: daar kom je nooit meer weg. js/gebied.js roept dat
    // ook, maar pas als een speler er staat.
    if (!(w.overgangen || []).length) {
      fout(null, null, 'deze kaart heeft geen enkele overgang — wie er komt, komt er niet meer weg');
    }

    return { wereld: w, klachten };
  };

  // ── Waar je kunt komen ──

  // Welke tegels kun je vanaf een uitgang belopen? Met de loopregels van het spel zelf
  // (T.bereik in js/pad.js: acht richtingen, geen hoeken afsnijden), en met deuren die je mag
  // openen — een dichte deur is geen muur, een deur op slot wel.
  //
  // Waarom dit nodig is: een poppetje kan op een begaanbare tegel staan die helemaal door bomen
  // is ingesloten, of een heel stuk dorp kan onbereikbaar liggen. Niets zei dat, en je merkt het
  // pas als je er in het spel naartoe loopt en er niet komt.
  // Geeft { kan, los } terug: de verzameling tegels waar je kunt komen ("x,y"), en de vraag of
  // een tegel wél begaanbaar maar níet bereikbaar is. Allebei uit hetzelfde raster, want de vraag
  // twee keer stellen is op de grote kaart een kwart seconde.
  T.bereikbaar = function (w) {
    const gezien = new Set();
    if (!w || !T.bereik) return { kan: gezien, los: () => false };
    // Eén keer de hele kaart aflopen en onthouden wat begaanbaar en wat vast is. T.isBegaanbaar
    // kijkt per tegel de hele lijst voorwerpen af, en de vlekvulling vraagt het acht keer per
    // tegel — dat werd op de grote kaart driekwart seconde, en dit gereedschap keurt bij elke
    // wijziging opnieuw. Nu is het één pass, en de vlekvulling kijkt alleen nog in het raster.
    const binnen = (x, y) => x >= 0 && y >= 0 && x < w.b && y < w.h;
    const kan = [];
    const vastRaster = [];
    for (let y = 0; y < w.h; y++) {
      kan.push(new Uint8Array(w.b));
      vastRaster.push(new Uint8Array(w.b));
      for (let x = 0; x < w.b; x++) {
        kan[y][x] = T.isBegaanbaar(w, x, y, { deurenOpenen: true }) ? 1 : 0;
        vastRaster[y][x] = T.isVast(w, x, y) ? 1 : 0;
      }
    }
    const magBetreden = (x, y) => binnen(x, y) && !!kan[y][x];
    const isVast = (x, y) => !binnen(x, y) || !!vastRaster[y][x];
    // Vanaf elke uitgang: daar komt de speler binnen. De tegel waarop hij landt is `komt`, en
    // anders de uitgang zelf (js/gebied.js zoekt dan zelf een buur).
    for (const o of w.overgangen || []) {
      for (const start of [o.komt, { x: o.x, y: o.y }]) {
        if (!start || !magBetreden(start.x, start.y)) continue;
        gezien.add(start.x + ',' + start.y);
        for (const sleutel of T.bereik(start, w.b * w.h, magBetreden, isVast).keys()) gezien.add(sleutel);
      }
    }
    return { kan: gezien, los: (x, y) => binnen(x, y) && !!kan[y][x] && !gezien.has(x + ',' + y) };
  };

  // Wat er op een onbereikbare tegel staat, en hoeveel tegels er onbereikbaar zijn.
  function keurBereik(w, fout, letOp) {
    if (!(w.overgangen || []).length) return; // geen uitgang: dat is al een fout op zichzelf
    const { kan, los } = T.bereikbaar(w);

    for (const e of w.wezens) {
      if (los(e.tx, e.ty)) fout(e.tx, e.ty, `"${e.soort}" staat op een tegel waar je vanaf geen enkele uitgang kunt komen`);
    }
    for (const v of [...w.voorwerpen, ...(w.questVoorwerpen || [])]) {
      if (!v.grendel) continue;
      if (!kan.has(v.x + ',' + v.y)) fout(v.x, v.y, `"${v.soort}" hangt aan quest "${v.grendel.quest}" maar ligt buiten alles wat je kunt bereiken`);
    }

    let losseTegels = 0;
    let eerste = null;
    for (let y = 0; y < w.h; y++) {
      for (let x = 0; x < w.b; x++) {
        if (!los(x, y)) continue;
        losseTegels++;
        if (!eerste) eerste = { x, y };
      }
    }
    if (losseTegels) {
      letOp(eerste.x, eerste.y, `${losseTegels} tegel(s) zijn begaanbaar maar vanaf geen enkele uitgang te bereiken; de eerste ligt op (${eerste.x}, ${eerste.y})`);
    }
  }

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
    // Het gaat om gesprek-ids, niet om soorten: negentien dorpelingen delen één soort maar kunnen
    // elk hun eigen gesprek voeren (T.gesprekIdVan in js/gesprek.js).
    const wezens = new Map();
    const questVoorwerpen = [];
    for (const [naam, w] of Object.entries(werelden)) {
      for (const e of w.wezens) {
        const id = (T.gesprekIdVan && T.gesprekIdVan(e)) || e.soort;
        if (!wezens.has(id)) wezens.set(id, naam);
        if (!wezens.has(e.soort)) wezens.set(e.soort, naam);
      }
      for (const v of [...w.voorwerpen, ...(w.questVoorwerpen || [])]) {
        if (v.grendel) questVoorwerpen.push({ v, kaart: naam });
      }
    }
    const bronnen = bronnenVanVoorwerpen(werelden);

    // Een aansluiting heeft twee kanten (ontwerp/kaarten.md). Loopt er een overgang van het dorp
    // naar het bos, dan hoort er in het bos een terug te zijn — anders is het een wip waar je
    // wel op komt en niet meer af. Het gereedschap legt ze in één handeling, maar een kaart die
    // met de hand gemaakt is, of waar er later een weggehaald wordt, kan scheef staan.
    for (const [naam, w] of Object.entries(werelden)) {
      if (w.proef) continue; // een proefkaart doet in het spel niet mee
      for (const o of w.overgangen || []) {
        const ander = werelden[o.naar];
        if (!ander || ander.proef) continue; // dat het gebied niet bestaat, zegt T.keurKaart al
        if (!(ander.overgangen || []).some((t) => t.naar === naam)) {
          fout(`de aansluiting van "${naam}" (${o.x}, ${o.y}) naar "${o.naar}" heeft maar één kant: in "${o.naar}" is geen overgang terug naar "${naam}"`);
        }
      }
    }

    // Wie uit de mensenlijst staat er nog nergens? Bij honderd poppetjes is dat de werklijst
    // zelf, dus in één regel en niet één klacht per persoon.
    const geplaatst = new Set();
    for (const w of Object.values(werelden)) for (const e of w.wezens) if (e.wie) geplaatst.add(e.wie);
    // Wie over de weg komt (T.MENSEN[id].bezoeker: de heer en zijn soldaten, js/heer.js), staat op
    // geen kaart, en hoort dus ook niet in dit lijstje.
    const bezoeker = (id) => !!(T.MENSEN && T.MENSEN[id] && T.MENSEN[id].bezoeker);
    const ontbreekt = Object.keys(T.MENSEN || {}).filter((id) => !geplaatst.has(id) && !bezoeker(id));
    if (ontbreekt.length) {
      letOp(`${ontbreekt.length} van de ${Object.keys(T.MENSEN).length} mensen staan nog nergens: ${ontbreekt.join(', ')}`);
    }

    // Het gesprek van een karakter (T.KARAKTERS, js/mensen.js) hoort bij geen kaart: een boer voert
    // het als hij dat karakter trekt (js/boeren.js).
    const karakter = (id) => !!(T.KARAKTERS && T.KARAKTERS[id]);
    for (const id of Object.keys(T.GESPREKKEN || {})) {
      if (!wezens.has(id) && !bezoeker(id) && !karakter(id)) fout(`"${id}" heeft een gesprek, maar staat nergens in de wereld. Zet hem neer met gereedschap/wereld.html`);
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
})(globalThis.Spel = globalThis.Spel || {});
