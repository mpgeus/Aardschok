// De inner: de man van de heer die in oogstmaand komt kijken (ontwerp/spel.md, "Rijk worden en arm lijken: de inner").
// Sinds 11 okt (vraag 151, optie 1, deel B1) telt hij niets meer: er is geen rapport, geen argwaan, geen geschenk en geen
// korting, en de heer rekent op wat er is (js/heer.js, T.eisVanDeHeer). Wat rest is zijn bezoek, tot deel B2 hem helemaal
// weghaalt. Twee helften, net als js/heer.js:
//   - de regels, zonder scherm (test/inner.test.cjs): wanneer hij komt (T.tikInnerDag) en wat hij ziet (T.innerKijkt: in een
//     rechte lijn, tot zoveel tegels, en huizen en schuren houden zijn blik tegen), want daar loopt hij langs.
//   - zijn komen en gaan als poppetje (T.werkInnerBij): loopt de schout naast hem, dan volgt hij de schout; anders loopt hij
//     zijn eigen ronde, langs wat hij nog niet zag, tot zonsondergang. Wie met hem praat, houdt hem op (afleiden).
//
// Alleen waar ook de heer komt: een wereld met een plein (js/heer.js). Daarbuiten blijft dit stil.
(function (T) {
  'use strict';

  // Alle getallen in één blok, om samen met Marcel bij te stellen (ook in de werkbank van de
  // spelregels, js/opties.js). Een eerste gok.
  T.INNER_INSTELLINGEN = {
    // Hij komt midden in de oogst, en je hoort het zoveel dagen vooraf.
    komt: { maand: 'oogstmaand', dag: 15 },
    aankondiging: 10,
    // Zo ver kijkt hij, in tegels, in een rechte lijn; huizen en schuren houden zijn blik tegen.
    zicht: 7,
    // Zijn bezoek duurt tot zonsondergang, min zoveel uur (Marcel, 27 sep, vraag 42: hij moet voor
    // donker terug zijn op het kasteel). Alleen ziet hij in die tijd het hele gehucht. (Tot 27 sep liep hij
    // 90 stappen, en praten kostte hem niets.)
    wegVoorDonker: 0,
    // Afleiden: wie met hem praat, houdt hem op. Hij staat stil en kijkt niet, en de dag loopt door.
    // Zoveel uur per bezoek; daarna kijkt hij door, ook als je nog praat.
    praatUren: 3,
    // Staat hij naast een schout die niet verder loopt, dan wacht hij zoveel uur. Daarna kijkt hij zelf
    // verder, en volgt hij zoveel uur niemand (eigenGang). Anders hield wie stilstond hem net zo op als
    // wie met hem praatte.
    wachtUren: 0.5,
    eigenGang: 1,
    // Loop je zo dichtbij, dan volgt hij jou; loop je verder weg dan volgLos, dan gaat hij zijn eigen
    // ronde weer.
    volgAfstand: 2,
    volgLos: 5,
  };

  const IN = () => T.INNER_INSTELLINGEN;
  const maandIdx = (naam) => T.MAANDEN.findIndex((m) => m.naam === naam);
  const inJaar = (maand, dag) => maand * T.DAGEN_PER_MAAND + (dag - 1);
  const uurNu = (D) => (D.kalender ? D.kalender.dag * 24 : 0);
  const sleutel = (x, y) => x + ',' + y;


  T.nieuweInner = function () {
    return {
      bezoek: null, // zijn bezoek nu, zie T.innerKomt
    };
  };

  // Waar hij kan komen: een wereld met een plein, net als de heer (js/heer.js).
  function magKomen(D) {
    const w = D.wereld;
    return !!(w && (w.heer || w.marskramer));
  }

  // ---------------------------------------------------------------------------------------------
  // Wat hij ziet
  // ---------------------------------------------------------------------------------------------

  // De voet van een gebouw: waar hij staat en hoe groot hij is (T.voetVanGebouw, js/gebouwen.js).
  const voetVan = (g) => T.voetVanGebouw(g);

  // Wat hij kan zien: gebouwen met een tekening.
  function zichtbaarGebouw(g) {
    const soort = T.GEBOUWEN && T.GEBOUWEN[g.soort];
    return !!(soort && soort.tekening);
  }

  // Ziet hij deze tegel van waar hij staat? Binnen zijn zicht, en niets ertussen (T.zietTegel,
  // js/wereld.js: de begin- en eindtegel tellen niet mee, dus een muur zelf zie je wel).
  const ziet = (w, van, x, y, zicht) => T.zietTegel(w, van, { x, y }, zicht);

  // Ziet hij een tegel van dit gebouw? Dan ziet hij het gebouw.
  function zietGebouw(w, van, g, zicht) {
    const v = voetVan(g);
    for (let dy = 0; dy < v.h; dy++) {
      for (let dx = 0; dx < v.b; dx++) if (ziet(w, van, v.x + dx, v.y + dy, zicht)) return true;
    }
    return false;
  }

  // Eén keer rondkijken vanaf `van`: wat hij nu ziet, komt in zijn bezoek. Geeft de namen van de
  // gebouwen die hij voor het eerst zag, voor een melding.
  T.innerKijkt = function (D, van) {
    const b = D.inner && D.inner.bezoek;
    const w = D.wereld;
    if (!b || !w) return [];
    const nieuw = [];
    for (const g of D.gebouwen || []) {
      if (b.gebouwen.has(g) || !zichtbaarGebouw(g) || !zietGebouw(w, van, g, IN().zicht)) continue;
      b.gebouwen.add(g);
      nieuw.push(T.GEBOUWEN[g.soort].naam);
    }
    for (const akker of w.akkers || []) {
      for (const t of T.akkerTegels(akker)) {
        const k = sleutel(t.x, t.y);
        if (!b.tegels.has(k) && ziet(w, van, t.x, t.y, IN().zicht)) b.tegels.add(k);
      }
    }
    return nieuw;
  };

  // Is er nog iets wat hij wil zien? Een gebouw dat hij nog niet zag, of een akker waarvan hij nog
  // minder dan de helft zag. [{ x, y }] van waar het is, of een lege lijst.
  function nogTeZien(D) {
    const b = D.inner.bezoek;
    const doelen = [];
    const overslaan = b.overslaan || new Set();
    for (const g of D.gebouwen || []) {
      if (b.gebouwen.has(g) || !zichtbaarGebouw(g) || overslaan.has(g)) continue;
      const v = voetVan(g);
      doelen.push({ x: v.x + Math.floor(v.b / 2), y: v.y + Math.floor(v.h / 2), gebouw: g });
    }
    for (const akker of (D.wereld && D.wereld.akkers) || []) {
      if (overslaan.has(akker)) continue;
      const tegels = T.akkerTegels(akker);
      const gezien = tegels.filter((t) => b.tegels.has(sleutel(t.x, t.y))).length;
      if (gezien < tegels.length / 2) doelen.push({ x: akker.x + Math.floor(akker.b / 2), y: akker.y + Math.floor(akker.h / 2), akker });
    }
    return doelen;
  }
  T.innerNogTeZien = (D) => nogTeZien(D);

  // ---------------------------------------------------------------------------------------------
  // De dagen: aankondiging, komst en vertrek
  // ---------------------------------------------------------------------------------------------

  T.innerKomt = function (D, dag) {
    const I = D.inner || (D.inner = T.nieuweInner());
    I.bezoek = {
      komtOp: dag,
      tot: null, // tot wanneer hij blijft (de dag, met het uur achter de komma), zodra hij er is
      gepraat: 0, // hoeveel uur je hem aan de praat hield (afleiden), en of het genoeg was
      uitgepraat: false,
      gebouwen: new Set(), tegels: new Set(), wezen: null, weg: false, laatste: null, volgt: false,
      overslaan: new Set(), // wat hij niet kon bereiken
      aankomst: {
        tekst: 'De inner van de heer komt kijken. Loop met hem mee, of laat hem zijn gang gaan.',
        soort: 'gevaar',
        naarGewoon: true,
      },
    };
    if (T.zetVlag) T.zetVlag(D, 'innerOpBezoek');
    // Hij komt overdag (js/dag.js, T.bezoekerKomtAan): valt zijn dag 's nachts in, dan zegt het
    // bericht het pas als hij de kaart op loopt (T.werkInnerBij). Zonder wereld om in te lopen (een
    // toets) meteen. Tot 26 sep stond de tijd stil zolang hij er was, omdat meelopen bij een dag van
    // 2,5 seconde weken kostte; sinds de dag duurt zijn bezoek een dag, en loopt de tijd door.
    if (!kanLopen(D)) I.bezoek.meteen = true;
    T.bezoekerKomtAan(D, I.bezoek);
  };

  // Hij gaat, met een melding. Zonder poppetje om de kaart af te lopen is hij meteen weg.
  T.innerVertrekt = function (D) {
    const I = D.inner;
    const b = I && I.bezoek;
    if (!b || b.weg) return false;
    b.weg = true;
    T.zeg(D, 'De inner vertrekt.');
    // Klaar met kijken: een praatje met hem verandert er niets meer aan (js/gesprekken.js).
    T.zetVlag(D, 'innerKlaar');
    if (!b.wezen) haalWeg(D);
    return true;
  };

  function haalWeg(D) {
    const I = D.inner;
    const b = I && I.bezoek;
    if (!b) return;
    if (b.wezen && D.wereld) {
      const i = D.wereld.wezens.indexOf(b.wezen);
      if (i >= 0) D.wereld.wezens.splice(i, 1);
    }
    for (const v of ['innerOpBezoek', 'innerUitgepraat', 'innerKlaar']) T.wisVlag(D, v);
    I.bezoek = null;
  }

  // Eén dag. Wordt aangeroepen vanuit T.tikGebouwenDag (js/gebouwen.js, stap 0).
  T.tikInnerDag = function (D, dag) {
    if (!magKomen(D) || D.einde) return;
    const I = D.inner || (D.inner = T.nieuweInner());
    const d = T.datumVanDag(dag);
    const komt = inJaar(maandIdx(IN().komt.maand), IN().komt.dag);
    const nu = inJaar(d.maand, d.dagVanMaand);
    const aankondiging = ((komt - IN().aankondiging) % T.DAGEN_PER_JAAR + T.DAGEN_PER_JAAR) % T.DAGEN_PER_JAAR;
    if (IN().aankondiging > 0 && nu === aankondiging && !I.bezoek) {
      T.zeg(D, `Over ${IN().aankondiging} dagen komt de inner van de heer kijken.`);
    }
    if (nu === komt && !I.bezoek) T.innerKomt(D, dag);
  };

  // ---------------------------------------------------------------------------------------------
  // Zijn komen en gaan in de wereld: elk beeld (js/main.js, werkBij)
  // ---------------------------------------------------------------------------------------------

  function kanLopen(D) {
    return !!(D.wereld && D.wereld.wezens && T.maakMens && T.wegInEnUit(D.wereld) && T.zoekPad);
  }

  // Een vrije tegel waar hij kan staan, zo dicht mogelijk bij (x, y), maar minstens `vanaf` ervan
  // (een gebouw zelf is vast, en op de schout kan hij niet staan). Van de tegels even ver kiest hij
  // die aan zijn eigen kant, zodat hij niet om de schout heen hoeft te lopen.
  function staanBij(D, e, x, y, vanaf) {
    const w = D.wereld;
    for (let r = vanaf || 0; r <= 4; r++) {
      let beste = null;
      let bij = Infinity;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          if (!T.isBegaanbaar(w, x + dx, y + dy, { wezensBlokkeren: true, wie: e })) continue;
          const a = Math.hypot(x + dx - e.tx, y + dy - e.ty);
          if (a < bij) {
            bij = a;
            beste = { x: x + dx, y: y + dy };
          }
        }
      }
      if (beste) return beste;
    }
    return null;
  }

  // Een weg om wat vaststaat; wie er onderweg staat, lost hij onderweg op (js/lopen.js).
  function loopNaar(D, e, doel) {
    const pad = T.zoekRoute(D.wereld, { x: e.tx, y: e.ty }, doel, {});
    if (pad && pad.length) T.geefRoute(e, pad, doel);
    return !!(pad && pad.length);
  }

  // Wie met de schout meeloopt, loopt naast hem: staat hij er niet, of loopt de schout door, dan een
  // nieuw pad naar een vrije tegel naast hem. `opnieuw`: in elk geval een nieuw pad (hij liep nog niet
  // mee). Voor de inner (hieronder), en voor wie de schout volgt (js/voorvallen.js, js/rovers.js, js/beesten.js).
  T.loopNaastDeSchout = function (D, e, opnieuw) {
    const h = D.schout;
    const afstand = T.afstand({ x: h.tx, y: h.ty }, { x: e.tx, y: e.ty });
    const eind = e.pad[e.pad.length - 1];
    if (opnieuw || (afstand > 1 && !(eind && T.afstand(eind, { x: h.tx, y: h.ty }) <= 1))) {
      e.pad = [];
      const naast = afstand > 1 && staanBij(D, e, h.tx, h.ty, 1);
      if (naast) loopNaar(D, e, naast);
    }
  };

  // Loop naar een vrije tegel zo dicht mogelijk bij (x, y) (op minstens `vanaf`). Geeft of het kan.
  T.loopNaarBij = function (D, e, x, y, vanaf) {
    const plek = staanBij(D, e, x, y, vanaf || 0);
    return !!(plek && loopNaar(D, e, plek));
  };

  // Tot wanneer hij blijft: de eerstvolgende zonsondergang (js/dag.js), min wegVoorDonker, als dag met
  // het uur achter de komma. Roep je hem 's nachts (Spel.debug.inner), dan is dat die van morgen.
  // Zonder kalender (een toets zonder dag) blijft hij tot hij alles zag.
  function totZonsondergang(D) {
    if (!D.kalender) return Infinity;
    const nu = D.kalender.dag;
    for (let d = Math.floor(nu); ; d++) {
      const tot = d + (T.zonVan(d).onder - IN().wegVoorDonker) / 24;
      if (tot > nu) return tot;
    }
  }

  // Praat de schout nog met hem, dan houdt dat gesprek op (js/dialoog.js). Zonder scherm (een toets)
  // staat er niets open.
  function stopGesprek(S, D, e) {
    if (S.modus === 'dialoog' && S.spreektMet === e && T.sluitDialoog) T.sluitDialoog(S);
  }

  T.werkInnerBij = function (S, D) {
    const I = D.inner;
    const b = I && I.bezoek;
    if (!b || !magKomen(D)) return;
    const w = D.wereld;
    // Geen weg de kaart op (of niets om mee te lopen): dan kijkt hij één keer rond vanaf het plein en
    // gaat hij. Anders bleef hij er, en stond de tijd voorgoed stil.
    if (!kanLopen(D)) {
      if (!b.weg) {
        T.innerKijkt(D, w.heer || w.marskramer);
        T.innerVertrekt(D);
      }
      return;
    }
    const uitgang = T.wegInEnUit(w);
    if (!b.wezen) {
      if (b.weg) return;
      // Overdag, vanaf het bezoekuur, met zijn bericht (js/dag.js).
      if (!T.bezoekerKomtAan(D, b)) return;
      const e = T.maakMens('inner', uitgang.x, uitgang.y, 0);
      e.dwaalt = false; // hij loopt waar hij heen wil, niet waar het dwalen hem brengt
      b.wezen = e;
      b.tot = totZonsondergang(D);
      w.wezens.push(e);
      return;
    }
    const e = b.wezen;
    if (b.weg) {
      // Naar de weg, en daar is hij weg.
      if (e.tx === uitgang.x && e.ty === uitgang.y && !e.pad.length && !e.onderweg) haalWeg(D);
      else if (!e.pad.length && !e.onderweg) loopNaar(D, e, uitgang);
      return;
    }
    // De zon gaat onder: hij moet voor donker terug zijn op het kasteel.
    const nu = uurNu(D);
    if (b.tot != null && nu >= b.tot * 24) {
      T.zeg(D, 'De zon gaat onder, en de inner moet voor donker terug zijn op het kasteel.');
      stopGesprek(S, D, e);
      T.innerVertrekt(D);
      return;
    }
    // Afleiden: wie met hem praat, houdt hem op. Hij staat stil en kijkt niet, en de dag loopt door. Tot
    // hij genoeg gepraat heeft (praatUren per bezoek): dan kijkt hij door, ook als je nog praat.
    if (S.modus === 'dialoog' && S.spreektMet === e && !b.uitgepraat) {
      if (b.praatVan != null) b.gepraat += nu - b.praatVan;
      b.praatVan = nu;
      b.stilSinds = null; // praten is geen wachten
      if (b.gepraat < IN().praatUren) return;
      b.uitgepraat = true;
      T.zetVlag(S, 'innerUitgepraat');
      T.zeg(D, '"Genoeg gepraat, schout. Ik moet kijken, en voor donker terug zijn."');
      stopGesprek(S, D, e);
    }
    b.praatVan = null;
    // Bij elke nieuwe tegel: rondkijken.
    const hier = sleutel(e.tx, e.ty);
    if (hier !== b.laatste) {
      b.laatste = hier;
      b.stilSinds = null;
      const nieuw = T.innerKijkt(D, { x: e.tx, y: e.ty });
      if (nieuw.length) T.zeg(D, `De inner kijkt naar: ${nieuw.join(', ')}.`);
    } else if (b.volgt && !e.onderweg && !e.pad.length) {
      // Naast een schout die niet verder loopt, wacht hij niet eeuwig: daarna kijkt hij zelf verder, en
      // volgt hij een tijd niemand. In uren op de klok, dus op elke snelheid even lang.
      if (b.stilSinds == null) b.stilSinds = nu;
      else if (nu - b.stilSinds >= IN().wachtUren) {
        b.stilSinds = null;
        b.eigenTot = nu + IN().eigenGang;
        T.zeg(D, 'De inner wacht niet langer op je, en kijkt zelf verder.');
      }
    }
    const doelen = nogTeZien(D);
    if (!doelen.length) {
      T.innerVertrekt(D);
      return;
    }
    if (e.onderweg) return;
    // Loopt de schout naast hem, dan volgt hij de schout; loopt die weg, of wachtte hij te lang op hem,
    // dan gaat hij zijn eigen gang. Is de schout op reis (js/land.js), dan is er niemand om te volgen.
    const h = T.schoutIsWeg(D) ? null : D.schout;
    const afstand = h ? T.afstand({ x: h.tx, y: h.ty }, { x: e.tx, y: e.ty }) : Infinity;
    const volgde = b.volgt;
    if (b.eigenTot != null && nu < b.eigenTot) b.volgt = false;
    else if (afstand <= IN().volgAfstand) b.volgt = true;
    else if (afstand > IN().volgLos) b.volgt = false;
    // Volgt hij, dan houdt hij de pas van de schout bij: hij draaft erachteraan. Anders zijn eigen maat.
    const eigen = (T.MENSEN && T.MENSEN.inner && T.MENSEN.inner.snelheid) || e.snelheid;
    e.snelheid = b.volgt && h ? Math.max(eigen, T.snelheidVan(h)) : eigen;
    if (b.volgt) {
      // Hij laat zijn eigen ronde los, en loopt naar de schout; loopt die door, dan loopt hij mee
      // naar waar de schout nu is. (Hij staat nu op een tegel, dus zijn pad mag weg.)
      T.loopNaastDeSchout(D, e, !volgde);
      return;
    }
    if (volgde) e.pad = []; // de schout liep weg: zijn eigen ronde weer, vanaf hier
    if (e.pad.length) return;
    // Zijn eigen ronde: naar wat het dichtstbij nog te zien is.
    let beste = null;
    let bij = Infinity;
    for (const d of doelen) {
      const a = T.afstand({ x: e.tx, y: e.ty }, d);
      if (a < bij) {
        bij = a;
        beste = d;
      }
    }
    // Niet te bereiken (ingesloten, of de weg staat vol): dan slaat hij het over.
    if (!beste || !T.loopNaarBij(D, e, beste.x, beste.y, 0)) b.overslaan.add(beste.gebouw || beste.akker);
  };
})(globalThis.Spel = globalThis.Spel || {});
