// De mist (B2c, vraag 117, stap 3; Marcel, 13 okt: "A2, B1, C ok"; het plan in ontwerp/kaarten.md, "Het hele eiland").
// Zwart is wat niemand van jou zag, grijs wat je zag maar nu niet ziet, en helder waar je mensen en je gebouwen kijken:
// elk een kring om zich heen. Het grijs is het land zoals het nu is (de grond, de bomen, de gebouwen), zonder wie er
// loopt (B1). Bij het begin ken je een kring om je plek (C2).
//
// Wat je kent, is spelstaat (in S, en bewaard): per dorp (`D.gekend`, want elke speler heeft zijn eigen mist; werklijst
// vraag 170, stap 6a), per stuk (T.stukNummer) een bitpatroon van 64 rijen van twee getallen van 32 bits, of `true` als
// je het hele stuk kent. Zo blijft het bewaarde spel klein, ook als je het hele eiland verkent. Wat je nu ziet, is het
// niet: dat rekent T.werkMistBij elke tik uit waar de mensen en de gebouwen van het dorp staan. Een kaart die niet op
// het eiland ligt (een toets met een losse kaart) heeft geen mist. Het scherm vraagt de mist van je eigen dorp (S.dorp).
//
// Het land gaat open waar je mensen komen (T.werkStukkenBij, js/wereld.js), verder dan iemand kijkt (openRond), dus wat
// je ziet, ligt al klaar. Het tekenen staat in js/tekenen.js (tekenMist, en mistOverLijst voor wat erop staat).
(function (T) {
  'use strict';

  T.MIST_INSTELLINGEN = {
    // Hoe ver ze kijken, in tegels, hemelsbreed (een kring, zonder iets ertussen): de aanvoerder, wie in het dorp woont, de
    // ossenkar, en een gebouw dat af is (gerekend vanaf de rand van zijn voet; het plein ook). Marcel, 13 okt: "C ok".
    zicht: { aanvoerder: 12, dorpeling: 7, kar: 7, gebouw: 6 },
    // Wat je bij het begin kent: een kring van zoveel tegels om het midden van je land (C2), ongeveer je land van vóór
    // B2.
    beginKring: 50,
    // Het grijs (A2: "donkerder en ontkleurd"): zoveel van de kleur gaat eruit (0 niets, 1 helemaal grijs), en zoveel
    // donkerder (0 niets, 1 zwart). Het zwart is de kleur van het niets tussen de bomen (js/tekenen.js, de achtergrond).
    ontkleurd: 0.75,
    donker: 0.45,
    zwart: [14, 19, 16],
    // De rand van wat je ziet loopt zacht af over zoveel tegels (alleen het beeld; wie zichtbaar is, zegt de kring).
    rand: 1.5,
  };
  const IN = () => T.MIST_INSTELLINGEN;

  const STUK = 64; // T.STUK, maar die is er pas als js/wereld.js geladen is; het bitpatroon hangt aan 64
  const RIJ = 2; // getallen van 32 bits per rij van een stuk
  const VERSIE = new WeakMap(); // dorp → hoe vaak er land bij kwam dat het kent (voor het tekenen; geen spelstaat)
  const ZIEN = new WeakMap(); // dorp → [{ x, y, r }]: wie er nu kijkt (geen spelstaat: het volgt uit S)
  const LAATST = new WeakMap(); // wezen of gebouw → waar het het laatst keek (dan markeert het niet elk beeld opnieuw)

  // Kent dorp D tegel (x, y) van zijn kaart? Buiten het eiland en op een kaart uit Tiled: ja.
  T.kentTegel = function (D, x, y) {
    if (!T.opEiland(D.wereld)) return true;
    if (!(x >= 0 && y >= 0 && x < T.EILAND_INSTELLINGEN.maat && y < T.EILAND_INSTELLINGEN.maat)) return false;
    const rij = D.gekend.get(T.stukNummer(Math.floor(x / STUK), Math.floor(y / STUK)));
    if (rij === true) return true;
    if (!rij) return false;
    const lx = x % STUK;
    return ((rij[(y % STUK) * RIJ + (lx >> 5)] >>> (lx & 31)) & 1) === 1;
  };

  // Ken de kring van r tegels om (cx, cy): elke tegel waarvan het midden er hemelsbreed binnen ligt. Geeft true als er
  // iets bij kwam.
  T.kenKring = function (D, cx, cy, r) {
    if (!T.opEiland(D.wereld)) return false;
    const maat = T.EILAND_INSTELLINGEN.maat;
    const r2 = r * r;
    const geraakt = new Set();
    let bij = false;
    for (let y = Math.max(0, Math.ceil(cy - r)); y <= Math.min(maat - 1, Math.floor(cy + r)); y++) {
      const dx = Math.sqrt(Math.max(0, r2 - (y - cy) * (y - cy)));
      const x1 = Math.min(maat - 1, Math.floor(cx + dx));
      const ly = (y % STUK) * RIJ;
      for (let x = Math.max(0, Math.ceil(cx - dx)); x <= x1; ) {
        const eind = Math.min(x1, (Math.floor(x / STUK) + 1) * STUK - 1);
        const n = T.stukNummer(Math.floor(x / STUK), Math.floor(y / STUK));
        let rij = D.gekend.get(n);
        if (rij === true) {
          x = eind + 1;
          continue;
        }
        if (!rij) D.gekend.set(n, (rij = new Array(STUK * RIJ).fill(0)));
        for (; x <= eind; x++) {
          const lx = x % STUK;
          const i = ly + (lx >> 5);
          const b = 1 << (lx & 31);
          if (rij[i] & b) continue;
          rij[i] |= b;
          bij = true;
          geraakt.add(n);
        }
      }
    }
    // Een stuk dat je helemaal kent, wordt `true`: dat bewaart in een paar tekens.
    for (const n of geraakt) if (D.gekend.get(n).every((v) => v === -1)) D.gekend.set(n, true);
    if (bij) VERSIE.set(D, (VERSIE.get(D) || 0) + 1);
    return bij;
  };
  // Hoe vaak er land bij kwam dat het dorp kent: wie iets uit D.gekend bijhoudt (het tekenen), ziet zo dat het veranderde.
  T.mistVersie = (D) => VERSIE.get(D) || 0;

  // Bij het begin kent een dorp een kring om het midden van zijn land (C2; T.nieuwDorp in js/dorp.js).
  T.kenHetBegin = function (D, vak) {
    T.kenKring(D, vak.x + (vak.b - 1) / 2, vak.y + (vak.h - 1) / 2, IN().beginKring);
  };

  // Wie er kijkt: de mensen van het dorp (T.isVanDorp, dezelfde als wie het land open maakt), de gebouwen van het dorp die af zijn, en
  // het plein (zoals een gebouw: het is van het dorp, ook als er niemand staat), elk met zijn kring, [{ x, y, r, van }]
  // (van: het wezen, het gebouw of het plein; D.plek.plein zijn de hoeken van het plein, hier de rechthoek eromheen).
  function wieKijken(S, D) {
    const Z = IN().zicht;
    const uit = [];
    for (const e of D.wereld.wezens) {
      if (!T.isVanDorp(D, e)) continue;
      uit.push({ x: e.x, y: e.y, r: e === D.aanvoerder ? Z.aanvoerder : e.kar ? Z.kar : Z.dorpeling, van: e });
    }
    for (const g of D.gebouwen || []) {
      if (!g.klaar) continue;
      const v = T.voetVanGebouw(g);
      uit.push({ x: v.x + (v.b - 1) / 2, y: v.y + (v.h - 1) / 2, r: Z.gebouw + Math.max(v.b, v.h) / 2, van: g });
    }
    const plein = D.plek.plein;
    if (plein && plein.length) {
      const xs = plein.map((p) => p[0]);
      const ys = plein.map((p) => p[1]);
      const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
      uit.push({ x: (x0 + x1) / 2, y: (y0 + y1) / 2, r: Z.gebouw + Math.max(x1 - x0 + 1, y1 - y0 + 1) / 2, van: plein });
    }
    return uit;
  }

  // Elk beeld, voor elk dorp (T.werkDorpBij): wie er kijkt, en wat hij ziet, ken je voortaan. Wie niet van tegel
  // veranderde sinds de vorige keer, markeert niets opnieuw.
  T.werkMistBij = function (S, D) {
    if (!T.opEiland(D.wereld)) return;
    const kijkers = wieKijken(S, D);
    ZIEN.set(D, kijkers);
    for (const k of kijkers) {
      const plek = Math.round(k.x) + ',' + Math.round(k.y) + ',' + k.r;
      if (LAATST.get(k.van) === plek) continue;
      LAATST.set(k.van, plek);
      T.kenKring(D, Math.round(k.x), Math.round(k.y), k.r);
    }
  };

  // Ziet dorp D tegel (x, y) nu? Buiten het eiland en op een kaart uit Tiled: ja.
  T.zietNu = function (D, x, y) {
    if (!T.opEiland(D.wereld)) return true;
    for (const k of ZIEN.get(D) || []) {
      const dx = x - Math.round(k.x);
      const dy = y - Math.round(k.y);
      if (dx * dx + dy * dy <= k.r * k.r) return true;
    }
    return false;
  };
  // Wie er nu kijkt, [{ x, y, r }], voor het tekenen (de heldere kringen in het grijs).
  T.wieKijken = (D) => ZIEN.get(D) || [];

  // Zie je dit wezen? Je eigen mensen altijd; een ander (een beest, een rover, een bezoeker, de mensen van een ander dorp)
  // alleen waar je nu kijkt.
  T.zieJeWezen = (S, e) => T.isVanDorp(S.dorp, e) || T.zietNu(S.dorp, e.tx, e.ty);

  // Je bouwt alleen op land dat je kent (een gebouw en een veld): waarom het vak r dat niet is, of null.
  T.waaromOnbekendLand = function (D, r) {
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.b; x++) {
        if (!T.kentTegel(D, x, y)) return T.t('You do not know that land yet: you build only where your people have been.');
      }
    }
    return null;
  };
})(globalThis.Spel = globalThis.Spel || {});
