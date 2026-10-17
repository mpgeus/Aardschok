// Het gedeelde stuk van de tekenaars op WebGL2 en WebGPU (gl2weg.js en gpuweg.js; evaluatie.md, "WebGL2 en WebGPU"):
// één atlas als textuurstapel (texture array: alle plaatjes in één textuur, dus geen grens van acht texturen per
// opdracht), en per beeld de rij van wat getekend wordt als getallen, één instantie van PER getallen per plaatje in
// plaats van vier hoeken van tien (js/gl.js). De kaart maakt er zelf de vier hoeken van, en de schaduw (scheef) ook,
// uit dezelfde rij: de schaduwen kosten de processor dan niets extra (snelheid.md, B3).
//
// Twee manieren (inst.vast):
// - 'lijst' (zonder vast): zoals huidig.js, per beeld wat in beeld is, gesorteerd, alles gemengd na elkaar.
// - 'vast' (snelheid.md, B1 en B2): wat stilstaat (gebouwen, bomen, begroeiing) staat één keer in een vaste rij op de
//   kaart, met een diepte per plaatje; de kaart bepaalt met een dieptebuffer wat ervoor staat. Dat mag, want alle kunst
//   heeft alleen helemaal dichte of helemaal doorzichtige pixels (17 okt geteld: 0 van de 9,9 miljoen ertussen). Per
//   beeld alleen wat beweegt (de inwoners, hard, met diepte) en wat zacht is (de rook, en gebouwen die half doorzichtig
//   zijn), dat laatste gesorteerd en zonder diepte te schrijven.
(function (P) {
  'use strict';
  const LAAG = 2048; // een laag van de atlas
  const RAND = 1; // een pixel tussen twee plaatjes
  const PER = 12; // per instantie: dx, dy, dw, dh, u0, v0, u1, v1, laag, alpha, schaduw, diepte
  P.LAAG = LAAG;
  P.PER = PER;

  // De atlas: plaatjes op lagen van LAAG bij LAAG, op planken gepakt. Hij weet alleen waar elk plaatje staat; de tekenaar
  // stuurt wat nieuw is (nieuw) naar zijn eigen textuur. Wat er bij het begin al is, gaat op hoogte gesorteerd (pakIn),
  // zodat de tekenaar weet hoeveel lagen hij nodig heeft; daarna komt er in de reserve bij (de platte tekeningen).
  P.maakAtlas = function () {
    const A = { lagen: Infinity, plek: new Map(), nieuw: [], laag: 0, x: 0, y: 0, plank: 0, versie: 0 };
    A.plekVan = function (img) {
      let p = A.plek.get(img);
      if (p) return p;
      const b = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (!b || !h || b > LAAG || h > LAAG) return null;
      if (A.x + b > LAAG) { A.x = 0; A.y += A.plank + RAND; A.plank = 0; }
      if (A.y + h > LAAG) { A.laag++; A.x = 0; A.y = 0; A.plank = 0; }
      if (A.laag >= A.lagen) return null;
      p = { l: A.laag, x: A.x, y: A.y, b, h, img };
      A.x += b + RAND;
      A.plank = Math.max(A.plank, h);
      A.plek.set(img, p);
      A.nieuw.push(p);
      A.versie++;
      return p;
    };
    return A;
  };
  P.pakIn = function (A, sc) {
    const lijst = [...new Set(sc.dingen.map((d) => d.img).filter(Boolean))];
    lijst.sort((a, b) => (b.naturalHeight || b.height) - (a.naturalHeight || a.height));
    for (const img of lijst) A.plekVan(img);
    return A.laag + 1;
  };

  function schrijf(f, i, d, o, p, z, schaduw) {
    const k = i * PER;
    const s = o.schaal;
    f[k] = d.wx - o.ax * s;
    f[k + 1] = d.wy - o.ay * s;
    f[k + 2] = o.sw * s;
    f[k + 3] = o.sh * s;
    f[k + 4] = (p.x + o.sx) / LAAG;
    f[k + 5] = (p.y + o.sy) / LAAG;
    f[k + 6] = (p.x + o.sx + o.sw) / LAAG;
    f[k + 7] = (p.y + o.sy + o.sh) / LAAG;
    f[k + 8] = p.l;
    f[k + 9] = o.alpha;
    f[k + 10] = schaduw ? 1 : 0;
    f[k + 11] = z;
  }
  // De diepte van 0 (voor) tot 1 (achter): verder naar voren (grotere d) is kleiner. Met 'kleiner of gelijk' wint bij
  // gelijke d wat later komt, zoals bij het sorteren.
  const diepte = (d) => 1 - (d + 2) / (2 * P.N + 6);
  function groei(R, n) {
    if (!R.dyn || R.dyn.length < n * PER) R.dyn = new Float32Array(Math.ceil(Math.max(n, 1024) * 1.5) * PER);
  }

  // De rijen van een beeld, in R (de stand van een tekenaar): R.dyn met R.n instanties (eerst R.nHard hard, dan zacht),
  // en bij 'vast' R.vastData met R.nVast, opnieuw (R.vastNieuw) als de weergave of de atlas veranderde.
  P.rijen = function (sc, cam, b, h, inst, R, A) {
    const v = P.vak(cam, b, h);
    if (inst.vast) return vasteRijen(sc, v, inst, R, A);
    const zicht = R.zicht || (R.zicht = []);
    zicht.length = 0;
    for (const d of sc.dingen) {
      const o = P.weergave(d, inst, v);
      if (o && P.inVak(d, o, v)) zicht.push(d);
    }
    zicht.sort((a, c) => a.d - c.d);
    groei(R, zicht.length);
    let n = 0;
    for (const d of zicht) {
      const p = A.plekVan(d.nu.img);
      if (p) schrijf(R.dyn, n++, d, d.nu, p, 0.5, d.nu.schaduw);
    }
    R.n = n;
    R.nHard = 0;
    R.nVast = 0;
    R.getekend = n;
  };

  function vasteRijen(sc, v, inst, R, A) {
    if (R.vastSleutel !== inst.modus + '|' + A.versie) {
      // Wat stilstaat en dicht is, één keer; de rest (wat beweegt, wat half doorzichtig is) per beeld.
      const los = (R.los = []);
      const vast = [];
      for (const d of sc.dingen) {
        if (d.beweegt || (inst.modus === 'doorzichtig' && d.soort === 'gebouw')) { los.push(d); continue; }
        const o = P.weergave(d, inst, v);
        if (!o) continue;
        if (o.alpha < 1) { los.push(d); continue; }
        if (A.plekVan(o.img)) vast.push(d);
      }
      R.vastData = new Float32Array(vast.length * PER);
      vast.forEach((d, i) => {
        const o = P.weergave(d, inst, v);
        schrijf(R.vastData, i, d, o, A.plekVan(o.img), diepte(d.d), d.schaduw && !o.plat);
      });
      R.nVast = vast.length;
      R.vastNieuw = true;
      R.vastSleutel = inst.modus + '|' + A.versie;
    }
    const hard = R.hard || (R.hard = []);
    const zacht = R.zacht || (R.zacht = []);
    hard.length = 0;
    zacht.length = 0;
    for (const d of R.los) {
      const o = P.weergave(d, inst, v);
      if (!o || !P.inVak(d, o, v)) continue;
      (o.alpha < 1 ? zacht : hard).push(d);
    }
    zacht.sort((a, c) => a.d - c.d);
    groei(R, hard.length + zacht.length);
    let n = 0;
    for (const d of hard) { const p = A.plekVan(d.nu.img); if (p) schrijf(R.dyn, n++, d, d.nu, p, diepte(d.d), d.nu.schaduw); }
    R.nHard = n;
    for (const d of zacht) { const p = A.plekVan(d.nu.img); if (p) schrijf(R.dyn, n++, d, d.nu, p, diepte(d.d), d.nu.schaduw); }
    R.n = n;
    R.getekend = n + R.nVast;
  }
})(globalThis.Proef = globalThis.Proef || {});
