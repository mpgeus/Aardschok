'use strict';
// bouwfasen-sdf.cjs: huizen in aanbouw, uit de huizenbouwer die niet waterpas is (huis-sdf.cjs).
//
//   node gereedschap/pixelart/bouwfasen-sdf.cjs                  alles: de vellen in tegels/ en de proefplaten
//   node gereedschap/pixelart/bouwfasen-sdf.cjs hut              alleen die types (de rest van de json blijft)
//   node gereedschap/pixelart/bouwfasen-sdf.cjs fase <n> [type]  één fase (1..7), om te kijken
//   node gereedschap/pixelart/bouwfasen-sdf.cjs ring [type]      alleen de controle van de ring, zonder beeld
//
// Een type heet naar zijn tegel ('huisVakwerkRiet', 'hutVlechtRiet') of naar zijn gebouw in het spel
// ('huis', 'hut'). Zonder type: allemaal.
//
// Waarom (ontwerp/beeld.md, "Bouwen: een huis dat groeit", "Nog steeds nep"): de fases uit
// bouwfasen.cjs staan op de rechte huis() van dorp.cjs, en een recht huis blijft nep hoe je het ook
// opbouwt. Marcel: "Het bouwproces moet realistisch zijn en overeenkomstig met het type gebouw.
// Detail is wat dit spel overeind houdt." Hier groeit een huis naar zichzelf toe: elke fase is
// hetzelfde huis uit huis-sdf.cjs, met hetzelfde zaad, dus dezelfde scheve balk, dezelfde
// doorzakkende nok en dezelfde leunende schoorsteen. Wat nog niet gebouwd is laten we weg, wat half
// is snijden we af (langs de stenen, de lagen riet en de bundels), en wat alleen tijdens het bouwen
// bestaat komt erbij: paaltjes met een touw, de stapels, een steiger, de sporen, de latten, de
// meiboom.
//
// Elk type gaat zoals het echt ging, met zijn eigen fases (beeld.md). Een type is een object (zie
// "de types" onderaan): zijn zaad en SPEC voor huis(), de namen van de fases (de laatste is 'af', de
// tegel), waar elke fase begint, zijn ring met stapels, en maak(n), de wereld van fase n. Wat de
// types delen staat bovenaan: het stelsel van het dak, de muur als ring, de materialen van de
// bouwplaats, de bouwstenen (palen, balken, touw, schoven, ladders) en de bouwplaats zelf (de
// grond, de leemkuil, de stapels op hun ringtegels).
//
// Het vakwerkhuis met riet ('huisVakwerkRiet', het huis in het spel), in de volgorde van de
// timmerman in de late middeleeuwen (beeld.md, vakwerk):
//
//   1 uitzetten   de grond geëffend en vertrapt, paaltjes met een touw op de hoeken; ernaast eiken
//                 balken met telmerken, veldstenen, schoven riet, bossen tenen, een leemkuil
//   2 voet        de lage muur van veldsteen. De metselaar trekt eerst de hoeken op, getrapt, en
//                 legt dan laag voor laag de muur ertussen langs een draad
//   3 gebint      voetbalken, stijlen, regels, schoren en muurplaat: het vakwerk van het afgewerkte
//                 huis, balk voor balk, met lucht in de vakken; de dekbalken erover, de kozijnen
//                 staan er al, en een steiger langs de voorkant
//   4 kap         het hoogste punt: sporen die in de nok kruisen, hanenbalken, de nokgording in de
//                 kruisen, de top van de gevels, en de meiboom
//   5 riet        latten op de sporen, het riet van de voet tot halverwege met de ladder van de
//                 rietdekker en schoven erbij; de vakken dicht met staken en tenen
//   6 leem        leem in de vakken (nog niet gewit), het riet af met de nok, de schoorsteen
//   7 af          het huis zelf, uit huis() zonder iets erbij
//
// Hoe: faseHuis() vraagt huis() om hetzelfde huis (met o.balkDiep, zodat een gebint zonder vulling
// echte balken heeft; het afgewerkte huis ziet daar niets van) en neemt daaruit wat er al staat:
// het vakwerk (liggers, stijlen), de kozijnen, het riet, de nok, de windveren, de schoorsteen. De
// romp (muur en plint in één veld) vervangen we door een ring: een muur met een dikte en een open
// bovenkant, met gaten waar de deur en de ramen komen. Daaruit komen de plint (half of heel), het
// vlechtwerk en het leem. Nieuw zijn: de achtermuren (die ziet de camera van het afgewerkte huis
// nooit, dus huis() tekent er geen vakwerk op), de dekbalken, het dak in aanbouw (in het stelsel
// van het dak zelf: vlak() hieronder, zodat sporen en latten de doorzakking van de nok volgen), de
// steiger, de ladders, de meiboom, de grond en de stapels.
//
// De hut van vlechtwerk met leem ('hutVlechtRiet'): zie "de hut" verderop, met zijn eigen zeven fases
// (uitzetten, palen, vlechtwerk, kap, riet, leem, af).
//
// Een nieuw type vraagt: een zaad en een SPEC; bij een L of T per vleugel een ring en een dak
// (ring() en vlak() rekenen nu met één vleugel); en een eigen volgorde (beeld.md), met dezelfde
// bouwstenen (de plint in lagen, de steiger, de stapels).
//
// De bouwplaats past in één ring van tegels rond de voet (HUIS_RING, HUT_RING): het spel houdt die
// ring vrij zolang er gebouwd wordt, en weet per fase welke ringtegels vol liggen.
//
// Uitvoer, per type een vel (het vakwerkhuis in bouwfasen-sdf.png, de hut in bouwfasen-sdf-hut.png):
//   tegels/bouwfasen-sdf*.png  de fases 1..6 (niet 'af': dat is de tegel in gebouwen.png) in cellen
//                              van dezelfde maat met hetzelfde anker (de achterste voethoek, een
//                              halve tegel boven het midden van die tegel, zoals tegels.json), zonder
//                              gras en zonder grondschaduw, met de vertrapte grond
//   tegels/bouwfasen-sdf.json  per type (onder de naam van zijn tegel): per fase de cel, het anker,
//   + .js                      waar de fase begint (vanaf) en welke ringtegels vol liggen (bezet), en
//                              `bestand`, het vel; het .js voegt de types toe aan T.BOUWFASEN
//   uit/bouwfasen-sdf/proef.png      het vakwerkhuis: alle zeven op gras naast elkaar, op spelgrootte
//   uit/bouwfasen-sdf/proef-x2.png   drie fases twee keer vergroot, voor de details
//   uit/bouwfasen-sdf/ringproef.png  alle zeven op gras met de ringtegels erbij (rood bezet, groen vrij)
//   uit/bouwfasen-sdf/hut-*.png      hetzelfde voor de hut; hut-proef.png met daaronder de hut naast
//                                    het vakwerkhuis, om de maat te vergelijken

const fs = require('fs');
const os = require('os');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const K = require('./kern.cjs');
const D = require('./dorp.cjs');
const T = require('./toren.cjs');
const HS = require('./huis-sdf.cjs');
const { PXH, hash, rnd, ruis2, klem, glad, sdf } = K;
const { Wereld, voeg } = T;
const { balk, stok, steenOp } = T.hulp;
const SQ = Math.SQRT1_2;
const E = (h) => h / PXH;
const GRAAD = Math.PI / 180;

const UIT = path.join(__dirname, 'uit', 'bouwfasen-sdf');

// ---------------------------------------------------------------- het vakwerkhuis: zaad en maten

// Zaad 4: een rechthoek van 7 × 5 met de deur rechts in de lange muur, een raam links ervan en
// een in de gevel, en de schoorsteen rechts op het dak. Zaad 3 is net zo'n huis, maar met een
// schoor tegen de gevel: iemand heeft de muur overeind gehouden, en dat hoort bij een oud huis,
// niet bij een nieuw. De uitbouwen staan er uitgeschreven, zodat andere kansen in huis-sdf.cjs dit
// huis later niet veranderen. Het type zelf (VAKWERKHUIS) staat onderaan, bij "de types".
const HUIS_ZAAD = 4;
const HUIS_SPEC = {
  vorm: 'rechthoek',
  b: 7,
  d: 5,
  lagen: 1,
  wand: 'vakwerk',
  dak: 'riet',
  nok: 'x',
  uit: { kapellen: 0, aanbouw: false, erker: false, balkon: false, trap: false, gevelschoorsteen: false, luiken: 'hout', bakken: 0 },
};

// de maten van het bouwen, in eenheden (een tegel is 45,25; één eenheid hoog is 0,866 pixel)
const DIEP = 9; // zoveel steken de balken van het vakwerk verder de muur in (o.balkDiep)
const PLINT_DIK = 20; // de voet van veldsteen
const MUUR = 12; // vlechtwerk en leem, van binnen tot de buitenkant van de muur
const RIJ = 13; // een laag stenen in px, zoals steenPatroon in huis-sdf.cjs (speelgoed: [13, 22, 16])
const SPOOR = { boven: 19, diep: 10, breed: 9, tip: 17 }; // de sporen: hoe ver onder het midden van het riet
const LAT = { dik: 3.4, breed: 6, tussen: 19 }; // de latten, op de sporen

const HUIS_FASEN = ['uitzetten', 'voet', 'gebint', 'kap', 'riet', 'leem', 'af'];
const HUIS_VANAF = [0, 0.06, 0.2, 0.4, 0.52, 0.8]; // waar elke fase begint, in voortgang 0..1 (js/bouwen.js)

// ---------------------------------------------------------------- het stelsel van het dak

// Een plek in het stelsel van een dakvlak (s = 1 de voorkant, +q; s = -1 de achterkant), zoals
// plekV in huis-sdf.cjs maar zonder de bolling en de lagen van het riet: a langs de nok, langs van
// de nok omlaag, dw loodrecht erop (boven het midden van het riet is positief), sE van de voet
// omhoog. q telt met teken, zodat een spoor voorbij de nok doorloopt en daar de andere kruist.
function vlak(V, x, y, z, s) {
  const dx = x - V.cx;
  const dy = y - V.cy;
  const a = dx * V.Ax + dy * V.Ay;
  const q = (dx * V.Qx + dy * V.Qy) * s;
  const z0 = V.nokZ(a);
  const q1 = V.voetQ(a);
  const dz = V.voetZ(a) - z0;
  const L = Math.hypot(q1, dz);
  const ux = q1 / L;
  const uz = dz / L;
  const pz = z - z0;
  const langs = q * ux + pz * uz;
  return { a, q, z0, L, ux, uz, langs, dw: -q * uz + pz * ux, sE: L - langs };
}
// het omgekeerde: een wereldpunt bij (a, langs, dw) op dakvlak s
function opVlak(V, a, langs, dw, s) {
  const z0 = V.nokZ(a);
  const q1 = V.voetQ(a);
  const dz = V.voetZ(a) - z0;
  const L = Math.hypot(q1, dz);
  const ux = q1 / L;
  const uz = dz / L;
  const q = langs * ux - dw * uz;
  const pz = langs * uz + dw * ux;
  return [...V.wereld(a, q * s), z0 + pz];
}

// ---------------------------------------------------------------- de muur als ring

// afstand tot een afgeronde rechthoek in 2D
function doos2(x, y, hx, hy, r) {
  const qx = Math.abs(x) - hx + r;
  const qy = Math.abs(y) - hy + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

// De muur van het huis als ring: van n0 (binnen, negatief) tot n1 eenheden vanaf de buitenkant van
// de romp in huis(), met dezelfde helling en hetzelfde uitpuilen, en open aan de bovenkant. De
// romp is een dichte doos; een huis in aanbouw is dat niet.
function ring(H, n0, n1) {
  const V = H.vleugels[0];
  return (x, y, z) => {
    const dx = x - V.cx;
    const dy = y - V.cy;
    const as = dx * V.Ax + dy * V.Ay - V.hellA * z;
    const qs = dx * V.Qx + dy * V.Qy - V.hellQ * z;
    const bq = HS.bolQ(H, V, as, z);
    const ba = HS.bolA(H, V, qs, z);
    const buiten = doos2(as, qs, V.ha + ba + n1, V.hq + bq + n1, 1.5);
    const binnen = doos2(as, qs, V.ha + ba + n0, V.hq + bq + n0, 1.5);
    return Math.max(buiten, -binnen, -z - 3);
  };
}
// de gaten van de deur en de ramen, dwars door de muur
function metGaten(H, f) {
  const ops = H.openingen;
  return (x, y, z) => {
    let d = f(x, y, z);
    if (d > 10) return d;
    for (const op of ops) {
      const ex = x - op.m[0];
      const ey = y - op.m[1];
      const ez = z - op.m[2];
      if (ex * ex + ey * ey + ez * ez > op.r2 + 2000) continue;
      const [a, v, n] = op.lok(x, y, z);
      const gat = HS.laag(HS.rechthoek(a, v, op.hb, op.hh), n, -40, 14);
      if (-gat > d) d = -gat;
    }
    return d;
  };
}
// de bovenkant van de steen (px), met de helling van de muur eraf zoals plintLijn in huis-sdf.cjs
const steenBoven = (H, x, y, z) => HS.steenLijn(H, x - H.hellX * z, y - H.hellY * z);
// onder beide dakvlakken, tot bovenop de latten (de muur houdt daar op)
function onderLatten(V, x, y, z) {
  return Math.max(vlak(V, x, y, z, 1).dw, vlak(V, x, y, z, -1).dw) + SPOOR.boven - LAT.dik;
}

// De plint in lagen (fase 2). Een metselaar trekt eerst de hoeken op, getrapt (elke laag een steen
// korter), spant daartussen zijn draad en legt de muur laag voor laag. Hier: de onderste `hele`
// lagen liggen overal, de volgende rond de hoeken en over een stuk van elke muur, en nog één laag
// alleen op de hoeken. Of een steen er ligt hangt aan de steen zelf (steenOp, dezelfde voegen als
// steenPatroon in huis-sdf.cjs), dus de bovenrand loopt langs de stenen en niet met een rechte snede.
function plintInLagen(H, hele) {
  const V = H.vleugels[0];
  const R = (st) => (st.id % 1000) / 1000;
  // hoe ver van de dichtstbijzijnde hoek de laag nog ligt (eenheden), per laag boven de hele
  const reikt = [(st, afst, langs) => afst < 58 + 40 * R(st) || langs, (st, afst) => afst < 22 + 14 * R(st)];
  return (x, y, z) => {
    const dx = x - V.cx;
    const dy = y - V.cy;
    const as = dx * V.Ax + dy * V.Ay - V.hellA * z;
    const qs = dx * V.Qx + dy * V.Qy - V.hellQ * z;
    const langeMuur = Math.abs(qs) - V.hq > Math.abs(as) - V.ha;
    // U zoals steenPatroon hem op de kant die je ziet rekent (buiten op de voormuren, binnen op de
    // achtermuren: allebei met de normaal naar de kijker)
    const U = langeMuur ? -x * SQ : y * SQ;
    const zaadRij = H.zaad * 13 + (langeMuur ? 1 : 2);
    const golf = H.sch * (1.6 * Math.sin(U * 0.043 + H.zaad) + U * 0.012);
    const Hp = z * PXH + golf;
    // de voortgang langs een muur: de lange muren zijn van links af gelegd, de gevels van achteren
    const voortgang = (uc) => (langeMuur ? -uc / SQ < -40 : uc / SQ < -30);
    let d = (Hp - hele * RIJ) / PXH;
    for (let k = 0; k < reikt.length; k++) {
      const rij = hele + k;
      const Hm = (rij + 0.5) * RIJ;
      const ligt = (st) => {
        const uc = (st.u0 + st.u1) / 2;
        const afst = langeMuur ? V.ha - Math.abs(-uc / SQ) : V.hq - Math.abs(uc / SQ);
        return reikt[k](st, afst, k === 0 && voortgang(uc));
      };
      const st = steenOp(U, Hm, 1, 1, zaadRij, RIJ, 22, 16);
      let dU;
      if (ligt(st)) dU = -Math.min(U - st.u0, st.u1 - U);
      else {
        dU = 40;
        let s = st;
        for (let i = 0; i < 3; i++) {
          s = steenOp(s.u0 - 0.01, Hm, 1, 1, zaadRij, RIJ, 22, 16);
          if (ligt(s)) {
            dU = Math.min(dU, U - s.u1);
            break;
          }
        }
        s = st;
        for (let i = 0; i < 3; i++) {
          s = steenOp(s.u1 + 0.01, Hm, 1, 1, zaadRij, RIJ, 22, 16);
          if (ligt(s)) {
            dU = Math.min(dU, s.u0 - U);
            break;
          }
        }
      }
      const dRij = Math.max(dU / SQ, (rij * RIJ - Hp) / PXH, (Hp - (rij + 1) * RIJ) / PXH);
      d = Math.min(d, dRij);
    }
    return d;
  };
}

// ---------------------------------------------------------------- materialen

// De grond van de bouwplaats: vertrapte aarde, met spaanders waar getimmerd is en strootjes bij het
// riet. Buiten het huis krijgt hij geen slagschaduw (het afgewerkte huis staat in het spel ook
// zonder); binnen wel, anders brandt de zon op de vloer van een huis met een dak. Spaanders liggen er
// vanaf fase `spaanders`: bij het vakwerkhuis vanaf het gebint, bij de hut vanaf de palen.
function grondPatroon(H, C, fase, spaanders = 3) {
  const { x, y } = C;
  let s = 0;
  const n = ruis2(x * 0.06, y * 0.06, H.zaad + 301) * 0.6 + ruis2(x * 0.21, y * 0.21, H.zaad + 302) * 0.4;
  if (n > 0.66) s -= 0.45;
  else if (n < 0.3) s += 0.35;
  if (hash(Math.floor(C.px / 2), Math.floor(C.py), H.zaad + 306) % 9 === 0) s -= 0.4;
  // voetstappen: korte donkere ovaaltjes, het dichtst langs de muren en bij de stapels
  const vx = Math.floor(x / 9);
  const vy = Math.floor(y / 9);
  const hv = hash(vx, vy, H.zaad + 303);
  if (hv % 11 === 0) {
    const cx = vx * 9 + 2 + (hv >> 4) % 5;
    const cy = vy * 9 + 2 + (hv >> 8) % 5;
    if (((x - cx) / 3) ** 2 + ((y - cy) / 1.9) ** 2 < 1) s -= 0.9;
  }
  // steentjes
  if (hash(Math.floor(C.px / 2), Math.floor(C.py / 2), H.zaad + 304) % 293 === 0) return { ramp: 'bot', stap: 3 + s };
  // spaanders: lichte splinters van twee à drie pixels
  if (fase >= spaanders) {
    const gx = Math.floor(x / 6);
    const gy = Math.floor(y / 6);
    const hs = hash(gx, gy, H.zaad + 305);
    const dicht = Math.abs(x) < 190 && Math.abs(y) < 150 ? 5 : 13;
    if (hs % dicht === 0) {
      const cx = gx * 6 + 3;
      const cy = gy * 6 + 3;
      const h = ((hs >> 5) % 628) / 100;
      const la = (x - cx) * Math.cos(h) + (y - cy) * Math.sin(h);
      const lb = -(x - cx) * Math.sin(h) + (y - cy) * Math.cos(h);
      if (Math.abs(la) < 2.6 && Math.abs(lb) < 0.8) return { ramp: 'bot', stap: 3.3 + ((hs >> 12) % 3) * 0.5 };
    }
  }
  return s;
}

// De bovenkant van een muur van veldsteen in aanbouw: ronde koppen van stenen in een bed van leem.
function bovenopSteen(H, C) {
  const gx = Math.floor(C.x / 9);
  const gy = Math.floor(C.y / 9);
  let d = 9;
  let id = 0;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const h = hash(gx + i, gy + j, H.zaad + 331);
      const cx = (gx + i) * 9 + 2 + (h % 5);
      const cy = (gy + j) * 9 + 2 + ((h >> 4) % 5);
      const dd = Math.hypot(C.x - cx, C.y - cy) - 3.2 - ((h >> 8) % 3) * 0.6;
      if (dd < d) {
        d = dd;
        id = h;
      }
    }
  }
  if (d > 0) return { ramp: 'aarde', stap: 2.6 + (hash(C.px, C.py, 7) % 3) * 0.3 };
  return { stap: C.stap - 1.6 + ((id >> 12) % 3) * 0.5 + (d > -1 ? -0.6 : 0) };
}

// Vers leem, nog niet gewit: grauw oker, met de vegen van de hand en hier en daar een strootje.
function leemVersPatroon(H, C) {
  const u = (C.x - C.y) * SQ;
  const h = C.z * PXH;
  let s = 0;
  const n = ruis2(u * 0.07, h * 0.07, H.zaad + 311);
  if (n > 0.66) s -= 0.55;
  else if (n < 0.3) s += 0.35;
  if (hash(Math.floor(u / 7), Math.floor(h / 2.6), H.zaad + 312) % 6 === 0) s -= 0.45;
  if (hash(Math.floor(u / 5), Math.floor(h / 3), H.zaad + 313) % 13 === 0) s += 0.5;
  if (hash(Math.floor(C.px), Math.floor(C.py), H.zaad + 314) % 47 === 0) return { ramp: 'stro', stap: 3.4 };
  // onderaan nog nat
  if (h < 90) s -= 0.4 * klem((90 - h) / 20, 0, 1);
  return s;
}

// Vlechtwerk (staken en tenen) in de vakken: het patroon uit huis-sdf.cjs, dat ook de
// vlechtwand tekent waar het leem eraf is.
function tenenPatroon(H, C) {
  const u = (C.x - C.y) * SQ;
  const h = C.z * PXH;
  return HS.vlechtwerk(H, u, h, H.zaad * 5 + 7);
}

// Een schoof riet: halmen in de lengte, fijn gestreept; de onderkant (de stoppels) plat afgesneden,
// donker met lichte puntjes; de toppen dun en licht; en een band van gedraaide tenen.
function schoofPatroon(C) {
  const p = C.deel;
  if (!p.lok) return 0;
  const [l, w, v] = p.lok(C.x, C.y, C.z);
  const hoek = Math.atan2(v, w);
  if (p.band && Math.abs(l - p.band) < 1.5) return { ramp: 'schors', stap: 2.2 + (hash(Math.floor(hoek * 5), 1, p.zaad) % 2) * 0.8 };
  if (l > p.L / 2 - 1.2) return hash(Math.floor(w * 1.4), Math.floor(v * 1.4), p.zaad) % 3 ? -1.9 : -0.3;
  const streep = hash(Math.floor(hoek * 8 + p.zaad), Math.floor(l / 14), 11) % 6;
  let s = streep === 0 ? -1.1 : streep === 1 ? -0.5 : streep === 2 ? 0.5 : 0;
  if (l < -p.L / 2 + 10) s += 0.5; // de toppen lichter
  return s + (p.toon || 0);
}

// ruwe palen: schors in de lengte
function paalPatroon(C) {
  const p = C.deel;
  if (!p.as) return 0;
  const [ax, ay, az] = p.as;
  const t = (C.x - p.a0[0]) * ax + (C.y - p.a0[1]) * ay + (C.z - p.a0[2]) * az;
  const rx = C.x - p.a0[0] - ax * t;
  const ry = C.y - p.a0[1] - ay * t;
  const rz = C.z - p.a0[2] - az * t;
  const hoek = Math.atan2(rz, rx * 0.7 + ry * 0.7);
  const h = hash(Math.floor(hoek * 4 + (p.zaad || 0)), Math.floor(t / 7), 17);
  let s = h % 7 === 0 ? -0.9 : h % 5 === 0 ? 0.5 : 0;
  if (hash(Math.floor(t / 3), 3, p.zaad || 0) % 23 === 0) s -= 0.7;
  return s + (p.toon || 0);
}

// Hout op de stapel, met telmerken: de timmerman zette het gebint eerst op zijn eigen werf in
// elkaar en nummerde elke verbinding met Romeinse cijfers voor hij het uit elkaar haalde. Een paar
// gehakte streepjes bij het eind van de balk.
function telmerkPatroon(C) {
  const p = C.deel;
  if (p.merk && p.lok && C.nz > 0.6) {
    const [l, w] = p.lok(C.x, C.y, C.z);
    const van = p.L / 2 - 16;
    if (l > van && l < van + p.merk * 3 && Math.abs(w) < 3.2 && (l - van) % 3 < 1.1) return { ramp: 'hout', stap: 1 };
  }
  return HS.balkPatroon(C, false);
}

// o.spaanders: vanaf welke fase er spaanders op de grond liggen (grondPatroon)
function materialen(H, W0, o = {}) {
  const diepe = 0.12;
  const houtHi = 6.6 - (H.hout === 'schors' ? 0.8 : 0);
  return {
    ...W0.mat,
    grond: { ramp: 'aarde', lo: 1.1, hi: 5.4, schaduw: false, omlijn: false, patroon: (C) => grondPatroon(H, C, W0.fase, o.spaanders) },
    grondBinnen: { ramp: 'aarde', lo: 1.1, hi: 5.4, schaduwKracht: 0.3, omlijn: false, patroon: (C) => grondPatroon(H, C, W0.fase, o.spaanders) },
    binnen: { ramp: 'aarde', lo: 0.2, hi: 1.4, schaduw: false, omlijn: false },
    tenen: { ramp: 'schors', lo: 0.9, hi: 5.6, schaduwKracht: diepe, patroon: (C) => tenenPatroon(H, C) },
    leemVers: { ramp: 'perkament', lo: 0.5, hi: 4.1, schaduwKracht: diepe, patroon: (C) => leemVersPatroon(H, C) },
    stapelhout: { ramp: H.hout, lo: 0.6, hi: houtHi, schaduwKracht: diepe, patroon: telmerkPatroon },
    paal: { ramp: 'schors', lo: 0.7, hi: 5.9, schaduwKracht: diepe, patroon: paalPatroon },
    touw: { ramp: 'bot', lo: 1.4, hi: 5.2, schaduwKracht: 0.5 },
    horde: { ramp: 'schors', lo: 0.9, hi: 5.6, schaduwKracht: diepe, patroon: (C) => HS.vlechtwerk(H, (C.x - C.y) * SQ, (C.x + C.y) * 0.5, H.zaad + 91) },
    schoof: { ramp: 'stro', lo: 0.5, hi: 4.7, schaduwKracht: 0.25, patroon: schoofPatroon },
    teen: { ramp: 'hout', lo: 1.6, hi: 6.2, schaduwKracht: 0.35, patroon: (C) => (C.deel.toon || 0) + (hash(C.px, C.py >> 1, 23) % 6 === 0 ? -0.8 : 0) },
    band: { ramp: 'schors', lo: 0.3, hi: 2.6, schaduwKracht: 0.4 },
    veldsteen: { ramp: 'veldsteen', lo: 1.5, hi: 7, schaduwKracht: diepe, patroon: (C) => (C.deel.toon || 0) + (hash(C.px, C.py, 5) % 19 === 0 ? -0.8 : 0) },
    klei: { ramp: 'aarde', lo: 0.6, hi: 3.3, schaduwKracht: 0.3, glans: 1.2, glansMacht: 22, patroon: (C) => (ruis2(C.x * 0.2, C.y * 0.2, 17) > 0.62 ? -0.5 : 0) },
    kluit: { ramp: 'aarde', lo: 0.8, hi: 4.6, schaduwKracht: 0.3, patroon: (C) => (hash(C.px >> 1, C.py >> 1, 9) % 5 === 0 ? -0.6 : 0) },
    naald: { ramp: 'den', lo: 0.6, hi: 5.4, schaduwKracht: 0.3, patroon: (C) => (hash(C.px, C.py, 31) % 4 === 0 ? -0.9 : hash(C.px, C.py, 32) % 5 === 0 ? 0.7 : 0) },
    lint: { ramp: 'rood', lo: 2, hi: 7, schaduwKracht: 0.45 },
    lintGeel: { ramp: 'goud', lo: 2, hi: 6.5, schaduwKracht: 0.45 },
    // de steen van de plint, en bovenop een muur in aanbouw het leem waarin hij gelegd wordt
    plintsteen: { ...W0.mat.steen, patroon: (C) => (C.nz > 0.7 ? bovenopSteen(H, C) : W0.mat.steen.patroon(C)) },
    gras: { ramp: 'gras', lo: 1.2, hi: 5.6, schaduwKracht: 0.5, patroon: (C) => (hash(C.px, C.py, 41) % 4 === 0 ? -0.8 : 0) },
  };
}

// ---------------------------------------------------------------- bouwstenen

let DEEL = 2000;
const nieuwDeel = () => DEEL++;

// een ronde paal van a naar b, met schors
function paal(g, a, b, r, zaad = 0, m = 'paal') {
  const p = stok(a, b, r);
  const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  p.as = [(b[0] - a[0]) / L, (b[1] - a[1]) / L, (b[2] - a[2]) / L];
  p.a0 = a;
  p.m = m;
  p.deel = nieuwDeel();
  p.zaad = zaad;
  p.toon = ((hash(zaad, 3, 77) % 5) - 2) * 0.2;
  return voeg(g, p);
}
// een gezaagde of gehakte balk
function hout(g, a, b, hb, hd, op, zaad, m = 'hout', r = 1.2) {
  const p = balk(a, b, hb, hd, op, r);
  p.m = m;
  p.deel = nieuwDeel();
  p.zaad = zaad * 3.1;
  p.toon = ((hash(zaad, 5, 78) % 5) - 2) * 0.25;
  return voeg(g, p);
}
// een touw dat een beetje doorhangt, in stukjes
function touw(g, a, b, zak, r = 1.15) {
  const n = 8;
  const pt = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t - zak * 4 * t * (1 - t)];
  for (let i = 0; i < n; i++) {
    const p = stok(pt(i / n), pt((i + 1) / n), r);
    p.m = 'touw';
    p.deel = nieuwDeel();
    voeg(g, p);
  }
}
// een sjorring om een staande paal: een paar slagen touw
function sjorring(g, c, r) {
  voeg(g, { f: (x, y, z) => Math.min(sdf.torus(x - c[0], y - c[1], z - c[2] - 1.3, r + 0.7, 1.1), sdf.torus(x - c[0], y - c[1], z - c[2] + 1.3, r + 0.7, 1.1)), g: [c[0], c[1], c[2], r + 4], m: 'touw', deel: nieuwDeel() });
}
// Een schoof riet van a (de toppen) naar b (de stoppels): plat afgesneden aan de stoppels, bij de
// band een eind daarboven ingesnoerd, in het midden het dikst, en naar de toppen toe dun en rafelig.
function bundel(g, a, b, r, m, zaad, band = true) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L, (b[2] - a[2]) / L];
  const bandL = L * 0.22;
  const straal = (l, hoek) => {
    const t = (l + L / 2) / L; // 0 bij de toppen, 1 bij de stoppels
    let rr = r * (0.5 + 0.55 * Math.sin(Math.PI * Math.min(1, t * 0.62 + 0.42)));
    rr -= r * 0.16 * Math.max(0, 1 - Math.abs(l - bandL) / 5);
    if (t < 0.3) rr += r * 0.1 * (hash(Math.floor(hoek * 4), Math.floor(l / 3), zaad) % 3 - 1) * (1 - t / 0.3);
    return rr;
  };
  const p = {
    f: (x, y, z) => {
      const [l, w, v] = p.lok(x, y, z);
      return Math.max(Math.hypot(w, v) - straal(l, Math.atan2(v, w)), l - L / 2, -L / 2 - l) * 0.9;
    },
    g: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, L / 2 + r + 1],
    m,
    deel: nieuwDeel(),
    L,
    zaad,
    toon: ((hash(zaad, 9, 79) % 5) - 2) * 0.22,
    band: band ? bandL : 0,
  };
  // lokaal: langs (van het midden naar de stoppels positief), en twee richtingen dwars
  const w0 = Math.abs(u[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const d0 = w0[0] * u[0] + w0[1] * u[1] + w0[2] * u[2];
  let w = [w0[0] - u[0] * d0, w0[1] - u[1] * d0, w0[2] - u[2] * d0];
  const wl = Math.hypot(...w);
  w = w.map((c) => c / wl);
  const v = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
  const m0 = p.g;
  p.lok = (x, y, z) => {
    const px = x - m0[0];
    const py = y - m0[1];
    const pz = z - m0[2];
    return [px * u[0] + py * u[1] + pz * u[2], px * w[0] + py * w[1] + pz * w[2], px * v[0] + py * v[1] + pz * v[2]];
  };
  return voeg(g, p);
}

// ---------------------------------------------------------------- de bouwplaats

// De bouwplaats past in één ring van tegels rond de voet: het spel houdt die ring vrij zolang er
// gebouwd wordt (js/bouwen.js). Een ringtegel heet (dx, dy), gerekend vanaf de achterste voettegel:
// dx van -1 tot b, dy van -1 tot d, en +x en +y liggen vooraan (de camera kijkt van +x+y). De lange
// muur met de deur is de +y-kant (dy = d, links in beeld), de gevel de +x-kant (dx = b).
//
// Elke stapel ligt op vaste ringtegels (van, tot: een rechthoek, beide erbij), en ligt er zolang er
// nog iets van over is: daar kan niemand lopen (`bezet` in tegels/bouwfasen-sdf.json). voorraad
// zegt per fase (1..6) hoeveel er nog ligt; een stapel die slinkt, kan met `rest` op minder tegels
// komen. Wat vroeg opgaat ligt achter het huis: dat zie je zolang de muren laag zijn, en daarna
// hoeft het niet meer. Wat laat opgaat (riet, tenen, leem) ligt vooraan, waar je het ziet slinken.
// De hoektegels blijven leeg, want daar staan eerst de paaltjes. Vooraan (de rij dy = d en de
// kolom dx = b) blijven minstens drie tegels vrij: daar staan de bouwers, en de deur.
//
// Het vakwerkhuis (7 × 5): de sporen, balken en stenen achter, riet, tenen en de leemkuil voor de
// gevel. De steiger staat op de rij dy = d maar is niet bezet: onder een steiger loop je door.
const HUIS_RING = {
  // de ronde sporen voor de kap: drie onder, twee erop, langs de achtermuur
  sporen: { van: [0, -1], tot: [4, -1], voorraad: [5, 5, 4, 0, 0, 0] },
  // een lange hoop veldstenen achter de rechterhoek; wat na de voet overblijft, op één tegel
  stenen: { van: [5, -1], tot: [6, -1], voorraad: [18, 9, 5, 4, 3, 3], rest: { van: [6, -1], tot: [6, -1], vanaf: 3 } },
  // eiken balken met telmerken op twee klossen, achter de achtergevel: [onderste laag, erop]
  balken: { van: [-1, 1], tot: [-1, 4], voorraad: [[3, 2], [3, 2], [2, 1], [2, 0], [1, 0], [1, 0]] },
  // schoven riet, drie lagen, de stoppels om en om naar buiten
  riet: { van: [7, 0], tot: [7, 1], voorraad: [[3, 2, 1], [3, 2, 1], [3, 2, 1], [3, 2, 1], [3, 1, 0], [1, 0, 0]] },
  // bossen tenen voor het vlechtwerk in de vakken
  tenen: { van: [7, 2], tot: [7, 3], voorraad: [4, 4, 4, 4, 2, 0] },
  // de leemkuil, met de uitgegraven kluiten ertegen de gevel op
  kuil: { van: [7, 4], tot: [7, 4], voorraad: [1, 1, 1, 1, 1, 1] },
};
const RAND = 1; // de ring is één tegel breed

// hoeveel er van een stapel ligt in fase n (een getal, of het totaal van de lagen)
const telVoorraad = (st, n) => [].concat(st.voorraad[n - 1]).reduce((a, b) => a + b, 0);
// de tegels waar een stapel in fase n ligt: [van, tot]
const stapelTegels = (st, n) => (st.rest && n >= st.rest.vanaf ? [st.rest.van, st.rest.tot] : [st.van, st.tot]);
// de ringtegels die in fase n vol liggen, als [[dx, dy], ...]
function bezet(ring, n) {
  const uit = new Map();
  for (const st of Object.values(ring)) {
    if (!telVoorraad(st, n)) continue;
    const [van, tot] = stapelTegels(st, n);
    for (let dx = van[0]; dx <= tot[0]; dx++) for (let dy = van[1]; dy <= tot[1]; dy++) uit.set(`${dx},${dy}`, [dx, dy]);
  }
  return [...uit.values()].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}

// Een rechthoek van ringtegels in de wereld (eenheden rond het midden van het huis, dat midden op
// de voet valt): x0..x1, y0..y1, het midden c, de lengte langs de strook en de breedte erdwars,
// en de hoek waaronder de strook ligt (0: langs x, 90°: langs y). spec is de SPEC van het type (b, d).
function strook(spec, van, tot) {
  const X0 = (-spec.b / 2) * K.TEGEL;
  const Y0 = (-spec.d / 2) * K.TEGEL;
  const x0 = X0 + van[0] * K.TEGEL;
  const y0 = Y0 + van[1] * K.TEGEL;
  const x1 = X0 + (tot[0] + 1) * K.TEGEL;
  const y1 = Y0 + (tot[1] + 1) * K.TEGEL;
  const langsX = x1 - x0 >= y1 - y0;
  return { x0, y0, x1, y1, c: [(x0 + x1) / 2, (y0 + y1) / 2], lang: Math.max(x1 - x0, y1 - y0), breed: Math.min(x1 - x0, y1 - y0), hoek: langsX ? 0 : 90 * GRAAD };
}

// Waar alles staat, in eenheden rond het midden van het huis (x langs de nok, y ernaar toe). Zo
// geschreven voor een rechthoek met de nok langs x (TY.spec), waar het stelsel van de vleugel dat
// van de wereld is. B.ring zijn de stapels van het type, B.steiger (als het type er een heeft) de
// plek van de steiger.
function plaats(H, TY) {
  const V = H.vleugels[0];
  const { ha, hq } = V;
  const spec = TY.spec;
  // de buitenrand van de ring: daarbinnen valt alles van de bouwplaats
  const omtrek = strook(spec, [-RAND, -RAND], [spec.b - 1 + RAND, spec.d - 1 + RAND]);
  return {
    V,
    ha,
    hq,
    omtrek,
    ring: TY.ring,
    stapel: (naam, n) => strook(spec, ...stapelTegels(TY.ring[naam], n)),
    steiger: TY.steiger,
    // hoe diep het leem in de kuil staat, en hoeveel kluiten er nog liggen, per fase (grond)
    kuilPeil: TY.kuilPeil || [-1.5, -2.2, -2.6, -3, -3.8, -5.6],
    kluiten: TY.kluiten || [10, 10, 8, 8, 6, 6],
    // waar de meetroede in fase 1 ligt (uitzetten), als het type het zegt
    roede: TY.roede,
  };
}

// De grond: vertrapte aarde over de voet en de ring, met een rafelige rand die binnen de ring blijft
// (de ruis duwt hem tot ruim tien eenheden naar buiten), en de leemkuil erin.
function grond(W, H, B, fase) {
  const { omtrek } = B;
  const sk = B.stapel('kuil', fase);
  const K_ = { c: sk.c, rx: 13, ry: 14 }; // ry langs de gevel: daar is de tegel het ruimst
  const vlekken = [[0, 0, (omtrek.x1 - omtrek.x0) / 2 - 15, (omtrek.y1 - omtrek.y0) / 2 - 15, 26]];
  const vorm = (x, y) => {
    let d = Infinity;
    for (const [cx, cy, hx, hy, r] of vlekken) d = Math.min(d, doos2(x - cx, y - cy, hx, hy, r));
    return d + (ruis2(x * 0.035, y * 0.035, H.zaad + 401) - 0.5) * 16 + (ruis2(x * 0.11, y * 0.11, H.zaad + 402) - 0.5) * 5;
  };
  const kuil = (x, y) => (Math.hypot((x - K_.c[0]) / K_.rx, (y - K_.c[1]) / K_.ry) - 1) * Math.min(K_.rx, K_.ry);
  const kom = (x, y, z, e = 0) => sdf.ellipsoide(x - K_.c[0], y - K_.c[1], z, K_.rx + e, K_.ry + e, 8 + e);
  const top = (x, y) => (ruis2(x * 0.09, y * 0.09, H.zaad + 403) - 0.5) * 0.7;
  const V = B.V;
  const binnen = (x, y) => Math.abs(x) < V.ha - 4 && Math.abs(y) < V.hq - 4;
  const g = W.groep('grond');
  // een dun vel, zonder zijkant: daaromheen ligt het gras van het spel op dezelfde hoogte
  voeg(g, {
    f: (x, y, z) => Math.max(z - top(x, y), -z - 0.7, vorm(x, y) * 0.8, -kuil(x, y)),
    grens: [0, 0, 330, -3, 2],
    m: (x, y, z) => (fase >= 5 && binnen(x, y) ? 'binnen' : binnen(x, y) ? 'grondBinnen' : 'grond'),
    deel: nieuwDeel(),
  });
  // de kuil: een kom in de grond, en het leem erin, nat, dat minder wordt
  const kg = W.groep('kuil');
  voeg(kg, { f: (x, y, z) => Math.max(-kom(x, y, z), kom(x, y, z, 3), z), g: [K_.c[0], K_.c[1], -5, K_.rx + 8], m: 'kluit', deel: nieuwDeel() });
  const peil = B.kuilPeil[fase - 1];
  voeg(kg, { f: (x, y, z) => Math.max(kom(x, y, z, -0.3), z - peil), g: [K_.c[0], K_.c[1], -5, K_.rx + 6], m: 'klei', deel: nieuwDeel() });
  // de uitgegraven aarde ernaast: een lage wal van kluiten tussen de kuil en de gevel (vanaf de
  // camera erachter), die met het leem mee slinkt
  const wal = W.groep('kluiten');
  const nK = B.kluiten[fase - 1];
  for (let i = 0; i < nK; i++) {
    const R = (k) => rnd(i, k, H.zaad + 411);
    const t = -1.05 + (2.1 * i) / Math.max(1, nK - 1) + (R(1) - 0.5) * 0.16;
    const rr = 1.12 + 0.14 * R(2);
    const c = [K_.c[0] - Math.cos(t) * K_.rx * rr, K_.c[1] - Math.sin(t) * K_.ry * rr, 0.6];
    const sz = 2.4 + 2.2 * R(3);
    voeg(wal, { f: (x, y, z) => sdf.ellipsoide(x - c[0], y - c[1], z - c[2], sz * 1.25, sz, sz * 0.55), g: [c[0], c[1], c[2], sz * 1.3 + 1], m: 'kluit', deel: nieuwDeel() });
  }
  // graspollen die de rand van de bouwplaats breken
  let np = 0;
  for (let i = 0; i < 600 && np < 40; i++) {
    const R = (k) => rnd(i, k, H.zaad + 421);
    const x = omtrek.x0 + (omtrek.x1 - omtrek.x0) * R(1);
    const y = omtrek.y0 + (omtrek.y1 - omtrek.y0) * R(2);
    const v = vorm(x, y);
    if (v > -1.5 || v < -9 - (i % 5 === 0 ? 12 : 0)) continue;
    if (Math.abs(x) < V.ha + 18 && Math.abs(y) < V.hq + 18) continue;
    if (kuil(x, y) < 8) continue;
    np++;
    const pollen = W.groep('pol');
    const n = 4 + (i % 3);
    for (let j = 0; j < n; j++) {
      const hoek = R(3 + j) * Math.PI * 2;
      const lang = 5 + 4 * R(10 + j);
      const vt = [x + Math.cos(hoek) * 1.2, y + Math.sin(hoek) * 1.2, -0.5];
      const tp = [x + Math.cos(hoek) * lang * 0.5, y + Math.sin(hoek) * lang * 0.5, lang * 0.8];
      voeg(pollen, { f: (px, py, pz) => sdf.rondeKegel(px, py, pz, vt[0], vt[1], vt[2], tp[0], tp[1], tp[2], 1.1, 0.35), g: [(vt[0] + tp[0]) / 2, (vt[1] + tp[1]) / 2, (vt[2] + tp[2]) / 2, lang + 2], m: 'gras', deel: 900 });
    }
  }
}

// Paaltjes op de hoeken, met het touw ertussen (fase 1), of de draad van de metselaar (fase 2).
function uitzetten(W, H, B, fase) {
  const { V, ha, hq } = B;
  const g = W.groep('paaltjes');
  const hoeken = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const koppen = hoeken.map(([sa, sq], i) => {
    const R = (k) => rnd(i, k, H.zaad + 501);
    const [x, y] = V.wereld(sa * (ha + 11), sq * (hq + 11));
    const h = 26 + 6 * R(1);
    const hel = [(R(2) - 0.5) * 0.16, (R(3) - 0.5) * 0.16];
    const top = [x + hel[0] * h, y + hel[1] * h, h];
    const p = balk([x, y, -3], top, 1.6, 1.6, [0, 0, 1], 0.5);
    p.m = 'hout';
    p.deel = nieuwDeel();
    p.zaad = i * 7.3;
    p.toon = 0.3;
    voeg(g, p);
    return { x, y, hel };
  });
  if (fase === 1) {
    // het touw rond, op een handbreed boven de grond
    for (let i = 0; i < 4; i++) {
      const A = koppen[i];
      const Bk = koppen[(i + 1) % 4];
      const hA = 11;
      touw(g, [A.x + A.hel[0] * hA, A.y + A.hel[1] * hA, hA], [Bk.x + Bk.hel[0] * hA, Bk.y + Bk.hel[1] * hA, hA], 3.2);
    }
    // een meetroede op de grond
    const roede = B.roede || [[-ha + 30, hq + 30], [-ha + 120, hq + 42]];
    hout(g, [...roede[0], 1.2], [...roede[1], 1.2], 1.2, 1.2, [0, 0, 1], 41, 'hout', 0.5);
  } else {
    // de draad van de metselaar, strak van hoek tot hoek, net buiten de muur op de laag die hij legt
    const h = E(3 * RIJ + 2);
    const buiten = 2.5;
    const hk = (sa, sq) => [...V.wereld(sa * (ha + buiten) + V.hellA * h, sq * (hq + buiten) + V.hellQ * h), h];
    touw(g, hk(-1, 1), hk(1, 1), 0.8, 0.95);
    touw(g, hk(1, 1), hk(1, -1), 0.8, 0.95);
  }
}

// Een plek op een strook: l langs de strook, d erdwars, z omhoog.
function opStrook(S) {
  const ca = Math.cos(S.hoek);
  const sa = Math.sin(S.hoek);
  return (l, d, z) => [S.c[0] + l * ca - d * sa, S.c[1] + l * sa + d * ca, z];
}

// Het hout op de stapel: eiken balken op twee klossen, met telmerken. Drie naast elkaar is zo breed
// als een tegel toelaat; de tweede laag ligt in de voegen van de eerste.
function balkenStapel(W, H, B, fase) {
  const [n0, n1] = B.ring.balken.voorraad[fase - 1];
  if (!n0 && !n1) return;
  const g = W.groep('balken');
  const S = B.stapel('balken', fase);
  const P = opStrook(S);
  const lang = 150;
  // de klossen, dwars onder de balken
  for (const l of [-lang * 0.3, lang * 0.3]) hout(g, P(l, -19, 3.2), P(l + 1.5, 19, 3.6), 4.2, 3.3, [0, 0, 1], 60 + l, 'stapelhout', 1.2);
  const r = 6.4;
  const tussen = 2 * r + 1;
  let merk = 1;
  const laag = (n, z0, zaad) => {
    for (let i = 0; i < n; i++) {
      const R = (k) => rnd(i, k, zaad);
      const d = (i - (n - 1) / 2) * tussen + (R(1) - 0.5) * 1.4;
      const l0 = -lang / 2 + (R(2) - 0.5) * 12;
      const l1 = lang / 2 + (R(3) - 0.5) * 12;
      const p = hout(g, P(l0, d, z0 + r + (R(4) - 0.5) * 0.8), P(l1, d + (R(5) - 0.5) * 1.4, z0 + r + (R(6) - 0.5) * 0.8), r, r * 0.95, [0, 0, 1], zaad * 10 + i, 'stapelhout', 1.4);
      p.merk = 1 + (merk++ % 4);
    }
  };
  laag(n0, 6.6, 3);
  if (n1) laag(n1, 6.6 + 2 * r - 1.2, 4);
}

// De sporen voor de kap: lange ronde palen, drie op de grond en twee erop.
function sporenStapel(W, H, B, fase) {
  const n = B.ring.sporen.voorraad[fase - 1];
  if (!n) return;
  const g = W.groep('sporen');
  const S = B.stapel('sporen', fase);
  const P = opStrook(S);
  const r = 4.4;
  const lang = S.lang - 12;
  for (let i = 0; i < n; i++) {
    const R = (k) => rnd(i, k, H.zaad + 521);
    const boven = i >= 3;
    const j = boven ? i - 3 : i;
    const d = boven ? (j - 0.5) * (2 * r + 0.6) : (j - 1) * (2 * r + 0.6);
    const z = r + 0.2 + (boven ? 2 * r - 1.6 : 0) + (i % 2) * 0.3;
    paal(g, P(-lang / 2 + R(1) * 6, d + (R(3) - 0.5) * 1.2, z), P(lang / 2 - R(2) * 6, d + (R(4) - 0.5) * 1.2, z + 0.4), r, 90 + i);
  }
}

// Een hoop veldstenen: ronde keien, grijs met een warme en een koele hier en daar. Een lange hoop
// op zijn strook, in het midden het hoogst.
function stenenHoop(W, H, B, fase) {
  const n = B.ring.stenen.voorraad[fase - 1];
  if (!n) return;
  const g = W.groep('stenen');
  const S = B.stapel('stenen', fase);
  const P = opStrook(S);
  const MAX = 12; // de grootste steen, van het midden tot de rand
  const rl = S.lang / 2 - MAX - 1.5;
  const rd = S.breed / 2 - MAX - 1.5;
  const hoogte = [20, 15, 10, 8, 7, 7][fase - 1];
  for (let i = 0; i < n; i++) {
    const R = (k) => rnd(i, k, H.zaad + 531);
    const hoek = R(1) * Math.PI * 2;
    const rr = Math.sqrt(R(2));
    const s = 5.2 + 3.6 * R(3);
    const zBerg = hoogte * Math.max(0, 1 - rr * rr);
    const [x, y] = P(Math.cos(hoek) * rr * rl, Math.sin(hoek) * rr * rd, 0);
    const z = zBerg + s * 0.45;
    const [a, b, c] = [s * (1 + 0.35 * R(4)), s * (0.85 + 0.3 * R(5)), s * (0.62 + 0.2 * R(6))];
    const draai = R(7) * Math.PI;
    const co = Math.cos(draai);
    const si = Math.sin(draai);
    voeg(g, {
      f: (px, py, pz) => {
        const dx = px - x;
        const dy = py - y;
        return sdf.ellipsoide(dx * co + dy * si, -dx * si + dy * co, pz - z, a, b, c);
      },
      g: [x, y, z, Math.max(a, b, c) + 1],
      m: 'veldsteen',
      deel: nieuwDeel(),
      toon: ((hash(i, 11, H.zaad) % 5) - 2) * 0.45,
    });
  }
}

// Schoven riet op een stapel, de stoppels om en om naar buiten, en bossen tenen.
function rietEnTenen(W, H, B, fase) {
  const lagen = B.ring.riet.voorraad[fase - 1];
  if (lagen.some(Boolean)) {
    const g = W.groep('schoven');
    const S = B.stapel('riet', fase);
    const P = opStrook(S);
    const r = 6.6;
    lagen.forEach((n, j) => {
      for (let i = 0; i < n; i++) {
        const R = (k) => rnd(i * 5 + j, k, H.zaad + 541);
        const d = -((n - 1) * (2 * r - 0.8)) / 2 + i * (2 * r - 0.8) + (R(1) - 0.5) * 2;
        const z = r * 0.92 + j * (2 * r - 3.2);
        const l = 37 + (R(2) - 0.5) * 4;
        const om = (i + j) % 2 ? 1 : -1; // de stoppels om en om naar buiten
        bundel(g, P(-om * l + (R(3) - 0.5) * 4, d, z + (R(4) - 0.5)), P(om * l + (R(5) - 0.5) * 4, d + (R(6) - 0.5) * 2, z), r, 'schoof', i * 13 + j);
      }
    });
  }
  // bossen tenen: roeden van wilgen, elk bos met twee banden; drie naast elkaar, één erop
  const n = B.ring.tenen.voorraad[fase - 1];
  if (!n) return;
  const t = W.groep('tenen');
  const S = B.stapel('tenen', fase);
  const P = opStrook(S);
  for (let i = 0; i < n; i++) {
    const R = (k) => rnd(i, k, H.zaad + 551);
    const d = i < 3 ? (i - 1) * 11 : -5.5;
    const z0 = i < 3 ? 0 : 6.4;
    const l = 34 + R(1) * 4;
    // zes roeden, dik bij de voet en dun naar de top, een beetje door elkaar
    for (let j = 0; j < 6; j++) {
      const hoek = (j / 6) * Math.PI * 2 + R(2);
      const dd = d + Math.cos(hoek) * 2.2;
      const zz = z0 + 3 + Math.sin(hoek) * 2.2;
      const eind = l + (R(3 + j) - 0.5) * 10;
      const A = P(-eind, dd + (R(10 + j) - 0.5) * 3, zz + (R(20 + j) - 0.5));
      const Bp = P(l * 0.95, dd, zz);
      voeg(t, { f: (x, y, z) => sdf.rondeKegel(x, y, z, A[0], A[1], A[2], Bp[0], Bp[1], Bp[2], 0.75, 1.35), g: [(A[0] + Bp[0]) / 2, (A[1] + Bp[1]) / 2, (A[2] + Bp[2]) / 2, eind + 2], m: 'teen', deel: 800 + i * 10 + j, toon: ((j * 3 + i) % 5 - 2) * 0.35 });
    }
    const tc = Math.cos(S.hoek);
    const ts = Math.sin(S.hoek);
    for (const lb of [-l * 0.35, l * 0.45]) {
      const c = P(lb, d, z0 + 3);
      voeg(t, { f: (x, y, z) => { const dx = x - c[0]; const dy = y - c[1]; const al = dx * tc + dy * ts; const ra = Math.hypot(-dx * ts + dy * tc, z - c[2]); return Math.max(Math.abs(ra - 3.6) - 0.9, Math.abs(al) - 1.1); }, g: [c[0], c[1], c[2], 6], m: 'band', deel: 890 + i });
    }
  }
}

// ---------------------------------------------------------------- de muren

// Het vakwerk op de achtermuren. huis() tekent alleen de muren die de camera van het afgewerkte
// huis ziet; zonder vulling kijk je door het gebint naar binnen, en dan moeten de achterste twee
// muren er ook staan. Dezelfde maten als het vakwerk in huis(): een voetbalk op de steen, stijlen,
// een regel, schoren bij de hoeken en een muurplaat (op de gevel een trekbalk), en de hoekstijl
// achter. `top` (fase 4) zet de top van de achtergevel erop.
function achterVakwerk(W, H, B, top) {
  const { V } = B;
  const g = W.groep('achterwerk');
  const balkH = 12;
  const stijlB = 13;
  const R = (k) => rnd(k, 7, H.zaad + 561);
  const w = (k, m) => (R(k) - 0.5) * 2 * m;
  // een punt op een achtermuur: m langs de muur, h in px, n uit de muur (naar buiten)
  const pt = (zijde, m, h, n) => {
    const z = h / PXH;
    if (zijde === 'q') {
      const qs = -(V.hq + HS.bolQ(H, V, m, z) + n);
      return [...V.wereld(m + V.hellA * z, qs + V.hellQ * z), z];
    }
    const as = -(V.ha + HS.bolA(H, V, m, z) + n);
    return [...V.wereld(as + V.hellA * z, m + V.hellQ * z), z];
  };
  const N = { q: [-V.Qx, -V.Qy, 0], a: [-V.Ax, -V.Ay, 0] };
  let k = 1;
  // een balk in de muur, net als wandBalk: van -2,5 - DIEP tot `uit` voor de muur
  const muurBalk = (zijde, m0, h0, m1, h1, breed, uit = 4) => {
    const nc = (uit - 2.5 - DIEP) / 2;
    const dm = Math.abs(m1 - m0) * SQ;
    const dh = Math.abs(h1 - h0);
    const l = Math.hypot(dm, dh) || 1;
    const hb = (breed / 2) * (dm / l / PXH + dh / l / SQ);
    return hout(g, pt(zijde, m0, h0, nc), pt(zijde, m1, h1, nc), hb * (0.85 + 0.3 * R(k++)), (uit + 2.5 + DIEP) / 2, N[zijde], 700 + k++, 'hout', 1.6);
  };
  const plint = (zijde, m) => {
    const [x, y, z] = pt(zijde, m, 0, 0);
    return HS.steenLijn(H, x, y);
  };
  for (const zijde of ['q', 'a']) {
    const half = zijde === 'q' ? V.ha : V.hq;
    const boven = zijde === 'q' ? H.plaatH : H.trekH;
    // de voetbalk en de bovenregel
    muurBalk(zijde, -half - 2, plint(zijde, -half) + balkH / 2 + w(k++, 1), half + 2, plint(zijde, half) + balkH / 2 + w(k++, 1), balkH + 1, 5);
    muurBalk(zijde, -half - 2, boven + w(k++, 2.5), half + 2, boven + w(k++, 2.5), balkH + (zijde === 'a' ? 2 : 0), zijde === 'a' ? 5.5 : 4.5);
    // stijlen
    const n = zijde === 'q' ? 5 : 4;
    const vakken = [];
    let vorige = -half + 6;
    for (let i = 1; i < n; i++) {
      const m = -half + (2 * half * i) / n + w(k++, 5);
      vakken.push([vorige, m]);
      vorige = m;
      const onder = plint(zijde, m) + balkH - 2;
      muurBalk(zijde, m, onder, m + w(k++, 1.5), boven - 4, stijlB + w(k++, 2), 3.5);
    }
    vakken.push([vorige, half - 6]);
    // regels halverwege, en een schoor in het eerste en het laatste vak
    vakken.forEach(([m0, m1], i) => {
      const onder = plint(zijde, m0) + balkH;
      const hoog = boven - balkH / 2;
      if (i === 0 || i === vakken.length - 1) {
        const bijHoek = i === 0 ? m0 : m1;
        const ver = i === 0 ? m1 - 8 : m0 + 8;
        muurBalk(zijde, ver + w(k++, 2), onder + 1, bijHoek + (i === 0 ? 7 : -7), hoog - 5 + w(k++, 2), 10, 3);
      } else {
        const hm = onder + (hoog - onder) * (0.44 + 0.12 * R(k++));
        muurBalk(zijde, m0 + 4, hm + w(k++, 2), m1 - 4, hm + w(k++, 2), balkH - 3, 4);
      }
    });
  }
  // de hoekstijl achter
  const half = (stijlB + 2) / 2 / SQ;
  const ha = V.ha - (half - 3);
  const hq = V.hq - (half - 3);
  const c = (h) => {
    const z = h / PXH;
    return [...V.wereld(-ha + V.hellA * z, -hq + V.hellQ * z), z];
  };
  const [hx, hy] = V.wereld(-V.ha, -V.hq);
  hout(g, c(HS.steenLijn(H, hx, hy) + balkH - 2), c(H.plaatH + 16), half, half, [V.Ax, V.Ay, 0], 790, 'hout', 1.6);
  if (top) {
    // de top van de achtergevel: een makelaar onder de nok en twee stijlen opzij, tot onder de sporen
    const gevel = W.groep('achtergevel');
    const trim = onderSporen(V);
    for (const [m, b] of [[0, stijlB + 1], [-48, stijlB - 2], [46, stijlB - 2]]) {
      const p = muurBalk('a', m + w(k++, 3), H.trekH + 6, m + w(k++, 2), 330, b, 3.5);
      g.delen.pop();
      const f0 = p.f;
      p.f = (x, y, z) => Math.max(f0(x, y, z), trim(x, y, z));
      voeg(gevel, p);
    }
  }
}

// ---------------------------------------------------------------- het dak

// Onder de sporen (negatief): om de top van de gevels af te snijden waar de sporen erop liggen.
function onderSporen(V) {
  return (x, y, z) => Math.max(vlak(V, x, y, z, 1).dw, vlak(V, x, y, z, -1).dw) + SPOOR.boven + SPOOR.diep;
}

// De plekken van de spanten langs de nok: op beide gevels en vijf ertussen, ongeveer om de 52.
function spanten(H, V) {
  const n = 6;
  const a0 = V.ha - 2;
  return Array.from({ length: n + 1 }, (_, i) => -a0 + (2 * a0 * i) / n + (i > 0 && i < n ? (rnd(i, 1, H.zaad + 601) - 0.5) * 5 : 0));
}

// De dekbalken: over de muurplaten, van voormuur tot achtermuur, met de koppen erbuiten. Op de
// gevels doet de trekbalk dat werk.
function dekbalken(W, H, V) {
  const g = W.groep('dekbalken');
  const as = spanten(H, V);
  for (let i = 1; i < as.length - 1; i++) {
    const a = as[i];
    const z = E(H.plaatH + 6 + 5) + (rnd(i, 2, H.zaad + 611) - 0.5) * 1.2;
    const uit = 7 + rnd(i, 3, H.zaad + 611) * 4;
    hout(g, [...V.wereld(a, -V.hq - uit), z], [...V.wereld(a + (rnd(i, 4, H.zaad) - 0.5) * 3, V.hq + uit), z + (rnd(i, 5, H.zaad) - 0.5) * 1.5], 5.2, 5, [V.Ax, V.Ay, 0], 620 + i, 'hout', 1.4);
  }
}

// De kap: per spant twee sporen die in de nok kruisen, een hanenbalk ertussen, en de nokgording
// in de kruisen. Alles in het stelsel van het dak (vlak), dus met de doorzakking van de nok.
function kap(W, H, V) {
  const g = W.groep('kap');
  const { boven, diep, breed, tip } = SPOOR;
  const as = spanten(H, V);
  const dwc = -boven - diep / 2;
  for (const s of [1, -1]) {
    // elk spoor: waar (a), hoe breed, en van waar tot waar langs de helling
    const sporen = as.map((a0, i) => {
      const R = (k) => rnd(i * 2 + (s > 0 ? 0 : 1), k, H.zaad + 621);
      const a = a0 + (R(1) - 0.5) * 1.5;
      const F0 = vlak(V, ...V.wereld(a, 0), V.nokZ(a), 1);
      const eind = (V.voetQ(a) - 5 + dwc * F0.uz) / F0.ux;
      const l0 = -tip - R(2) * 4;
      return { a, lm: (l0 + eind) / 2, hl: (eind - l0) / 2, hw: breed / 2 + (R(3) - 0.5) * 1.2 };
    });
    const bij = (a) => {
      let best = sporen[0];
      for (const sp of sporen) if (Math.abs(sp.a - a) < Math.abs(best.a - a)) best = sp;
      return best;
    };
    const p = {
      f: (x, y, z) => {
        const F = vlak(V, x, y, z, s);
        const sp = bij(F.a);
        return sdf.doos(F.a - sp.a, F.dw - dwc, F.langs - sp.lm, sp.hw, diep / 2, sp.hl, 1.1);
      },
      grens: [V.cx, V.cy, Math.hypot(V.ha + 10, V.voetQ(0) + 10), E(H.plaatH) - 10, V.zN + 30],
      m: 'hout',
      deel: 680 + (s > 0 ? 0 : 1),
      zaad: 5.7 + s,
      toon: 0.1,
      L: 2 * sporen[0].hl,
    };
    p.lok = (x, y, z) => {
      const F = vlak(V, x, y, z, s);
      const sp = bij(F.a);
      return [F.langs - sp.lm, F.a - sp.a, F.dw - dwc];
    };
    voeg(W.groep('sporen'), p);
  }
  as.forEach((a0, i) => {
    // de hanenbalk, op twee derde tussen de muurplaat en de nok, tegen de sporen aan
    const a = a0 + (i === as.length - 1 ? -1 : 1) * (breed / 2 + 3.2);
    const zN = V.nokZ(a);
    const zH = E(H.plaatH + 16) + (zN - SPOOR.boven / 0.66 - E(H.plaatH + 16)) * 0.6;
    const F = vlak(V, ...V.wereld(a, 0), zH, 1);
    // waar de onderkant van de sporen op die hoogte zit
    const qH = (-(boven + diep) - F.dw) / -F.uz + 4;
    const zj = (rnd(i, 9, H.zaad) - 0.5) * 2;
    hout(g, [...V.wereld(a, -qH), zH + zj], [...V.wereld(a, qH), zH - zj], E(10) / 2, 3.2, [V.Ax, V.Ay, 0], 640 + i, 'hout', 1.1);
  });
  // de nokgording: een ronde paal in de kruisen van de sporen, die met de nok meezakt
  const r = 4.6;
  const zG = (a) => V.nokZ(a) + (r - boven) / vlak(V, ...V.wereld(a, 0), V.nokZ(a), 1).ux;
  const a1 = V.ha + 6;
  const p = {
    f: (x, y, z) => {
      const [a, q] = V.lok(x, y);
      const ac = klem(a, -a1, a1);
      return Math.hypot(a - ac, q, z - zG(ac)) - r;
    },
    grens: [V.cx, V.cy, a1 + r + 2, V.zN - 60, V.zN + 20],
    m: 'paal',
    deel: 690,
    as: [V.Ax, V.Ay, 0],
    a0: [...V.wereld(-a1, 0), zG(-a1)],
    zaad: 3,
  };
  voeg(W.groep('nokgording'), p);
}

// De meiboom op het hoogste punt: een sparretje op de nok bij de gevel die je ziet, met een lint.
function meiboom(W, H, V) {
  const g = W.groep('meiboom');
  const a = V.ha - 2;
  const z0 = V.nokZ(a) - SPOOR.boven / 0.64 - 4;
  const voet = [...V.wereld(a + 3, 0), z0];
  const top = [voet[0] + 3, voet[1] - 2, z0 + 104];
  paal(g, voet, top, 2.1, 11);
  // de kroon: drie kransen naalden, onderaan het breedst
  const kr = [[0.56, 13.5], [0.73, 10], [0.88, 6.5]];
  kr.forEach(([t, rr], i) => {
    const c = [voet[0] + (top[0] - voet[0]) * t, voet[1] + (top[1] - voet[1]) * t, voet[2] + (top[2] - voet[2]) * t];
    const hk = rr * 1.25;
    voeg(g, {
      f: (x, y, z) => sdf.rondeKegel(x, y, z, c[0], c[1], c[2] - hk * 0.35, c[0] + 0.5, c[1], c[2] + hk, rr, 1.2),
      g: [c[0], c[1], c[2] + hk * 0.3, rr + hk + 2],
      m: 'naald',
      deel: 740 + i,
    });
  });
  // twee linten die van onder de kroon wapperen, rood en geel, met de wind mee
  const l0 = [voet[0] + (top[0] - voet[0]) * 0.52, voet[1] + (top[1] - voet[1]) * 0.52, voet[2] + (top[2] - voet[2]) * 0.52];
  [['lint', [0, 0, 0], 1], ['lintGeel', [1.5, -1.5, -3], -1]].forEach(([m, o, k], j) => {
    const b = [l0[0] + o[0], l0[1] + o[1], l0[2] + o[2]];
    const pts = [b];
    for (let i = 1; i <= 5; i++) pts.push([b[0] + 6 * i + k * 2 * Math.sin(i * 1.7), b[1] + 7.5 * i - 2 * Math.sin(i * 1.3 + j), b[2] - 5.5 * i - 2.5 * Math.sin(i * 2.1 + j)]);
    for (let i = 0; i + 1 < pts.length; i++) {
      const p = balk(pts[i], pts[i + 1], 2.6 - i * 0.2, 0.7, [1, -1, 0.3], 0.3);
      p.m = m;
      p.deel = 750 + j;
      voeg(g, p);
    }
  });
}

// De latten op de sporen, op beide dakvlakken: om de negentien eenheden, van de voet tot de nok.
function latten(W, H, V) {
  const g = W.groep('latten');
  const { boven } = SPOOR;
  const { dik, breed, tussen } = LAT;
  const a1 = V.XR - 3;
  for (const s of [1, -1]) {
    const F0 = vlak(V, ...V.wereld(0, 0), V.nokZ(0), 1);
    const eind = (V.voetQ(0) - 6 + (-boven + dik / 2) * F0.uz) / F0.ux;
    const n = Math.floor((eind - 5) / tussen) + 1;
    const plek = (k) => eind - k * tussen + (rnd(k, s + 3, H.zaad + 631) - 0.5) * 2.4;
    const dwc = -boven + dik / 2;
    voeg(g, {
      f: (x, y, z) => {
        const F = vlak(V, x, y, z, s);
        const k = klem(Math.round((eind - F.langs) / tussen), 0, n - 1);
        return sdf.doos(F.a, F.dw - dwc, F.langs - plek(k), a1, dik / 2, breed / 2, 0.6);
      },
      grens: [V.cx, V.cy, Math.hypot(a1, V.voetQ(0)) + 4, E(H.plaatH) - 10, V.zN + 10],
      m: 'hout',
      deel: 700 + (s > 0 ? 0 : 1),
      zaad: 5,
      toon: 0.4,
    });
  }
}

// Het riet tot halverwege: laag voor laag van de voet omhoog, zoals de lagen in huis-sdf.cjs
// liggen (hE + laagGolf), met een rafelige rand langs de bundels. Rechts ligt de volgende laag
// al; links, bij de ladder, is de rietdekker er nog mee bezig. Naar de rand toe wordt het pak
// dunner: daar liggen alleen de toppen van de laatste laag, vastgebonden op de latten. Een
// rietdekker doet één dakvlak tegelijk: achter ligt pas de eerste laag. o: hoeveel lagen voor en
// achter, en waar de ladder staat (a).
function halfRiet(H, V, f0, o = {}) {
  const bijLadder = o.bijLadder ?? -72;
  const rand = (a, voor) => {
    const K_ = voor ? o.voor ?? 3 : o.achter ?? 1;
    const b = Math.floor(a / 11);
    const fr = a / 11 - b;
    const j0 = ((hash(b, K_, H.zaad + 641) % 7) - 3) * 1.1;
    const j1 = ((hash(b + 1, K_, H.zaad + 641) % 7) - 3) * 1.1;
    const j = fr > 0.86 ? j0 + (j1 - j0) * glad(0.86, 1, fr) : j0;
    return K_ * H.laagL + j + (voor ? H.laagL * glad(bijLadder - 3, bijLadder + 3, a) : 0);
  };
  return (x, y, z) => {
    const d0 = f0(x, y, z);
    if (d0 > 12) return d0;
    const s = (x - V.cx) * V.Qx + (y - V.cy) * V.Qy >= 0 ? 1 : -1;
    const F = vlak(V, x, y, z, s);
    const hE = (-F.sE * F.uz) / H.sinRef + V.laagGolf(F.a);
    const e = rand(F.a, s > 0);
    const boven = (hE - e) * 0.9;
    // het pak dunner naar de rand toe
    const t = klem(F.langs / F.L, 0, 1);
    const rT = H.dik * (1 + H.voetDik * t * t);
    const onder = -rT + H.bol * 4 * t * (1 - t);
    const lim = onder + 2 * rT * (0.42 + 0.58 * klem((e - hE) / 26, 0, 1));
    return Math.max(d0, boven, (F.dw - lim) * 0.7);
  };
}

// De ladder van de rietdekker, op het riet, van de goot tot net over de rand; en een ladder tegen
// de steiger.
function ladder(g, a, b, breed, sporten, zaad) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L, (b[2] - a[2]) / L];
  // dwars: horizontaal, loodrecht op de ladder
  let w = [-u[1], u[0], 0];
  const wl = Math.hypot(w[0], w[1]) || 1;
  w = [w[0] / wl, w[1] / wl, 0];
  const bw = breed / 2;
  for (const k of [-1, 1]) {
    const A = [a[0] + w[0] * bw * k, a[1] + w[1] * bw * k, a[2]];
    const Bp = [b[0] + w[0] * bw * k + (rnd(k + 2, 1, zaad) - 0.5) * 2, b[1] + w[1] * bw * k, b[2]];
    paal(g, A, Bp, 2.1, zaad + k);
  }
  const n = Math.floor(L / sporten);
  for (let i = 1; i < n; i++) {
    const t = (i * sporten + (rnd(i, 2, zaad) - 0.5) * 3) / L;
    const c = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    const sch = (rnd(i, 3, zaad) - 0.5) * 2.5;
    paal(g, [c[0] - w[0] * (bw + 1.5), c[1] - w[1] * (bw + 1.5), c[2] - sch], [c[0] + w[0] * (bw + 1.5), c[1] + w[1] * (bw + 1.5), c[2] + sch], 1.35, zaad * 10 + i);
  }
}

// ---------------------------------------------------------------- de steiger

// Een steiger van gesjorde palen langs de lange muur: staande palen die elk een tikje hellen, een
// legger eraan gesjord, korte kortelingen van de legger naar de muur, horden van vlechtwerk als
// vloer, een schoor van paal tot paal, en een ladder. De deur blijft vrij.
function steiger(W, H, B, fase) {
  const { V } = B;
  const g = W.groep('steiger');
  const S = B.steiger;
  const zV = E(S.vloer);
  const staand = S.u.map((u, i) => {
    const R = (k) => rnd(i, k, H.zaad + 701);
    const a = u / SQ - V.ha;
    const q = V.hq + S.uit + (R(1) - 0.5) * 6;
    const [x, y] = V.wereld(a, q);
    const hoog = E(206 + 18 * R(2));
    const hel = [(R(3) - 0.5) * 0.05, (R(4) - 0.5) * 0.05];
    const top = [x + hel[0] * hoog, y + hel[1] * hoog, hoog];
    paal(g, [x, y, -2], top, 3.3, 80 + i);
    return { x, y, hel, a, q, op: (z) => [x + hel[0] * z, y + hel[1] * z, z] };
  });
  // de legger, aan de muurkant van de staanders gesjord
  const zL = zV - 6.2;
  const eerst = staand[0];
  const laatst = staand[staand.length - 1];
  const binnen = (p) => [p[0] - V.Qx * 5.4, p[1] - V.Qy * 5.4, p[2]];
  const la = binnen(eerst.op(zL));
  const lb = binnen(laatst.op(zL + 1.5));
  paal(g, [la[0] - V.Ax * 16, la[1] - V.Ay * 16, la[2] - 0.8], [lb[0] + V.Ax * 14, lb[1] + V.Ay * 14, lb[2] + 0.6], 2.8, 88);
  for (const s of staand) sjorring(g, s.op(zL), 3.3);
  // kortelingen: van de legger naar de muur, onder elke hordenrand
  const kort = [];
  for (let i = 0; i < staand.length; i++) {
    const s = staand[i];
    const p0 = binnen(s.op(zL + 5));
    const [mx, my] = V.wereld(s.a + (i === 0 ? 6 : 0), V.hq + 2);
    paal(g, [p0[0] + V.Qx * 6, p0[1] + V.Qy * 6, zL + 5.2], [mx, my, zL + 5.2 + (rnd(i, 5, H.zaad) - 0.5)], 2.4, 90 + i);
    kort.push(s.a);
  }
  // de horden: platte matten van vlechtwerk op de kortelingen
  const zH = zL + 5.2 + 2.4 + 1.6;
  for (let i = 0; i + 1 < kort.length; i++) {
    const a0 = kort[i] - (i === 0 ? 8 : 2);
    const a1 = kort[i + 1] + 3;
    const am = (a0 + a1) / 2;
    const q0 = V.hq + 4;
    const q1 = V.hq + S.uit - 7;
    const qm = (q0 + q1) / 2;
    const [cx, cy] = V.wereld(am, qm);
    const kant = (rnd(i, 7, H.zaad) - 0.5) * 0.02;
    voeg(g, {
      f: (x, y, z) => {
        const [a, q] = V.lok(x, y);
        return sdf.doos(a - am, q - qm, z - zH - (a - am) * kant, (a1 - a0) / 2, (q1 - q0) / 2, 1.5, 1.2);
      },
      g: [cx, cy, zH, Math.hypot((a1 - a0) / 2, (q1 - q0) / 2) + 2],
      m: 'horde',
      deel: nieuwDeel(),
    });
  }
  // een schoor van de voet van de eerste staander naar de top van de laatste
  const sa = eerst.op(E(20));
  const sb = laatst.op(E(196));
  paal(g, [sa[0] + V.Qx * 4, sa[1] + V.Qy * 4, sa[2]], [sb[0] + V.Qx * 4, sb[1] + V.Qy * 4, sb[2]], 2.3, 97);
  sjorring(g, [sb[0], sb[1], sb[2] - 2], 3.3);
  // de ladder links, langs de muur tegen het uiteinde van de legger: zijn voet op de hoektegel
  // (dy = d, dx = -1), zodat hij binnen de ring blijft
  const qL = eerst.q - 5.4;
  const [lx, ly] = V.wereld(-V.ha - K.TEGEL * 0.68, qL);
  const [tx, ty] = V.wereld(eerst.a - 9, qL);
  ladder(g, [lx, ly, 0], [tx, ty, zL + 30], 16, 19, 120);
  return { zH, staand };
}

// ---------------------------------------------------------------- het vakwerkhuis: de fases

function faseHuis(n) {
  const W0 = HS.huis(HUIS_ZAAD, n === 7 ? HUIS_SPEC : { ...HUIS_SPEC, balkDiep: DIEP });
  W0.fase = n;
  if (n === 7) return W0;
  DEEL = 2000;
  const H = W0.H;
  const V = H.vleugels[0];
  const B = plaats(H, VAKWERKHUIS);
  const W = new Wereld();
  W.H = H;
  W.fase = n;
  W.mat = materialen(H, W0);
  const van = (naam) => W0.groepen.filter((g) => g.naam === naam);
  const neem = (naam) => van(naam).forEach((g) => W.groepen.push(g));

  grond(W, H, B, n);
  if (n <= 2) uitzetten(W, H, B, n);
  balkenStapel(W, H, B, n);
  sporenStapel(W, H, B, n);
  stenenHoop(W, H, B, n);
  rietEnTenen(W, H, B, n);

  // de plint
  const romp = van('romp')[0];
  const straal = Math.hypot(V.ha, V.hq) + 30;
  if (n >= 2) {
    const plint = W.groep('plint');
    const r = ring(H, -PLINT_DIK, 0);
    const bovenkant = n === 2 ? plintInLagen(H, 2) : (x, y, z) => z - steenBoven(H, x, y, z) / PXH;
    voeg(plint, { f: metGaten(H, (x, y, z) => Math.max(r(x, y, z), bovenkant(x, y, z))), grens: [0, 0, straal, -4, E(90)], m: 'plintsteen', deel: 1 });
    // de drempel ligt er met de plint
    voeg(plint, romp.delen[1]);
  }
  if (n >= 3) {
    // het vakwerk van het afgewerkte huis; de top van de gevel komt met de kap
    const stukken = H.stukken.filter((P) => P.zicht && !P.U);
    const trim = onderSporen(V);
    const top = W.groep('geveltop');
    let i = 0;
    for (const g of W0.groepen) {
      if (g.naam !== 'liggers' && g.naam !== 'stijlen') continue;
      const P = stukken[Math.floor(i++ / 2)];
      const houd = [];
      for (const p of g.delen) {
        if (P.gevel && p.g[2] > E(H.trekH + 6)) {
          if (n >= 4) {
            const f0 = p.f;
            voeg(top, { ...p, f: (x, y, z) => Math.max(f0(x, y, z), trim(x, y, z)) });
          }
        } else houd.push(p);
      }
      g.delen = houd;
      W.groepen.push(g);
    }
    achterVakwerk(W, H, B, n >= 4);
    neem('ramen');
    dekbalken(W, H, V);
    steiger(W, H, B, n);
  }
  if (n >= 4 && n <= 5) kap(W, H, V);
  if (n === 4 || n === 5) meiboom(W, H, V);
  if (n === 5) {
    latten(W, H, V);
    const riet = van('riet')[0];
    const p = riet.delen[0];
    p.f = halfRiet(H, V, p.f);
    W.groepen.push(riet);
    // de ladder van de rietdekker, op het riet
    const g = W.groep('rietladder');
    const aL = -96;
    const F0 = vlak(V, ...V.wereld(aL, 0), V.nokZ(aL), 1);
    const onderaan = opVlak(V, aL, (V.voetQ(aL) - 4) / F0.ux, 22.5, 1);
    const boven = opVlak(V, aL + 5, F0.L - 3 * H.laagL * 0.95 + 8, 26, 1);
    ladder(g, onderaan, boven, 20, 17, 130);
    // twee schoven op de latten boven de rand, klaar om te leggen: de toppen naar de nok
    const sch = W.groep('schoven op het dak');
    const dwS = -SPOOR.boven + LAT.dik + 6.4;
    const l = F0.L - 150;
    bundel(sch, opVlak(V, -38, l - 44, dwS, 1), opVlak(V, -31, l + 30, dwS, 1), 6.6, 'schoof', 300);
    bundel(sch, opVlak(V, 16, l - 34, dwS + 0.5, 1), opVlak(V, -12, l + 34, dwS, 1), 6.6, 'schoof', 301);
  }
  if (n >= 5) {
    // de vakken dicht: vlechtwerk (fase 5) of leem (fase 6), boven de steen en onder de latten
    const vul = W.groep('vulling');
    const r = ring(H, -MUUR, n === 5 ? -1.4 : 0);
    const f = metGaten(H, (x, y, z) => Math.max(r(x, y, z), steenBoven(H, x, y, z) / PXH - z, onderLatten(V, x, y, z)));
    const binnen = ring(H, -MUUR, -MUUR + 1.2);
    voeg(vul, { f, grens: [0, 0, straal, E(40), V.zN + 20], m: (x, y, z) => (binnen(x, y, z) < 0.8 ? 'binnen' : n === 5 ? 'tenen' : 'leemVers'), deel: 1 });
  }
  if (n === 6) {
    neem('riet');
    neem('nok');
    neem('windveer');
    neem('schoorsteen');
  }
  return W;
}

// ---------------------------------------------------------------- de hut: zaad en maten

// Een hut van vlechtwerk met leem, met riet (beeld.md, "Vlechtwerk met leem, met riet: de hut";
// Marcel, 24 sep: van vlechtwerk, en als eerste na het vakwerkhuis). Een lage hut van één ruimte,
// zoals de armsten in een dorp rond 1323 woonden: hij staat op de grond, zonder stenen voet, en heeft
// geen schoorsteen. De haard ligt midden in de hut, en de rook trekt door een rookgat in het riet.
//
// Zaad 8: 5 × 4, de muur net boven de deur (plaatH 96, de deur 80 hoog), een steil dak (55°, met het
// zaad 56°), een deur van planken rechts in de lange muur, één klein venster in de gevel (een gat met
// een latei en twee staken), en het rookgat links onder de nok. Geen schoor tegen de gevel (die hoort
// bij een oud huis), en de lap in het riet ligt ver van het rookgat. De opgave staat uitgeschreven,
// zodat andere kansen in huis-sdf.cjs deze hut later niet veranderen.
//
//   1 uitzetten   vertrapte grond, de hoeken afgezet met paaltjes en een touw; ernaast de palen
//                 (hoekpalen, sporen, nokpaal, muurplaten), bossen staken, bossen wilgentenen,
//                 schoven riet, en een leemkuil met stro
//   2 palen       de hoekpalen en de staken van de wanden in de grond, de deurstijlen en de drempel;
//                 binnen de haard, een kring van veldstenen
//   3 vlechtwerk  de tenen tussen de staken gevlochten, van onder naar boven: achter al hoger dan
//                 voor, de bovenste rij nog half. De latei boven de deur; het venstertje is een gat
//   4 kap         het hoogste punt: het vlechtwerk tot boven, de muurplaten en twee trekbalken, de
//                 sporen die in de nok kruisen met de nokpaal erin, staken in de gevels tot onder
//                 de sporen, en een tak op de nok. Een ladder tegen de muur
//   5 riet        latten op de sporen, het riet van de voet omhoog (voor tot halverwege, achter pas
//                 de eerste laag), de gevels dichtgevlochten, twee stokken waar het rookgat komt,
//                 een ladder tegen de dakrand en schoven op het dak
//   6 leem        leem met stro op het vlechtwerk, nog nat en donker; de top van de gevel moet nog.
//                 Het riet af, met de nok en het rookgat, en de staken in het venster
//   7 af          de hut zelf, uit huis(): het leem droog en licht, een deur van planken
const HUT_ZAAD = 8;
const HUT_SPEC = {
  vorm: 'rechthoek',
  b: 5,
  d: 4,
  lagen: 1,
  wand: 'lemen',
  dak: 'riet',
  nok: 'x',
  plaatH: 96,
  helling: 55,
  schoorsteen: false,
  rookgat: { a: -0.35, b: 40, l: 24 },
  knop: false,
  deur: { zijde: 'q', f: 0.64, b: 40, h: 80, arm: true },
  ramen: [{ zijde: 'a', f: 0.36, h0: 40, b: 24, h: 21, gat: true }],
  uit: false,
};
const HUT_FASEN = ['uitzetten', 'palen', 'vlechtwerk', 'kap', 'riet', 'leem', 'af'];
const HUT_VANAF = [0, 0.08, 0.2, 0.45, 0.55, 0.8]; // waar elke fase begint, in voortgang 0..1 (js/bouwen.js)

// De ring van de hut (5 × 4; zie HUIS_RING voor hoe je hem leest). De palen liggen achter de hut
// (dat gaat vroeg op), de staken achter de achtergevel; riet en tenen voor de gevel, en de leemkuil
// vooraan links, waar je hem ziet slinken. Vooraan blijven zo vier tegels van de rij vrij (de deur
// en de bouwers), en de ladder van de rietdekker staat daar ook, zonder de tegel te bezetten.
const HUT_RING = {
  // lange ronde palen (sporen, de nokpaal, muurplaten) en kortere dikke (hoekpalen, deurstijlen)
  palen: { van: [0, -1], tot: [4, -1], voorraad: [7, 4, 4, 0, 0, 0] },
  // bossen staken voor de wanden, de punten allemaal dezelfde kant op
  staken: { van: [-1, 0], tot: [-1, 2], voorraad: [3, 1, 0, 0, 0, 0] },
  // schoven riet, drie lagen, de stoppels om en om naar buiten
  riet: { van: [5, 0], tot: [5, 1], voorraad: [[3, 2, 1], [3, 2, 1], [3, 2, 1], [3, 2, 1], [2, 1, 0], [1, 0, 0]] },
  // bossen wilgentenen voor het vlechtwerk (het laatste voor de gevels)
  tenen: { van: [5, 2], tot: [5, 3], voorraad: [4, 4, 3, 2, 1, 0] },
  // de leemkuil met stro erin
  kuil: { van: [0, 4], tot: [0, 4], voorraad: [1, 1, 1, 1, 1, 1] },
};
// het leem in de kuil gaat pas bij het leem op; de kluiten liggen er tot dan
const HUT_KUIL = { peil: [-1.4, -1.4, -1.6, -1.8, -2.2, -5.2], kluiten: [9, 9, 9, 9, 8, 6] };

// de maten, in eenheden
const VLECHT = { binnen: -8, buiten: -3 }; // het vlechtwerk: zo ver achter de buitenkant van de muur
const STAAK = 2.2; // de staken van de wanden: straal
const HUT_SPOOR = 4.2; // de sporen: rond, met schors (straal)

// ---------------------------------------------------------------- de hut: muren, vlechtwerk, staken

// De vier muren van de hut: u (px) in beeld van links naar rechts, en pos(u, h, uit) een punt op de
// muur (met de helling en het uitpuilen van huis()). De twee muren die je ziet zijn de stukken van
// huis() zelf (H.stukken), zodat het vlechtwerk hier precies de tenen zijn die in de afgewerkte hut
// door het dunne leem schijnen (lemenPatroon: dezelfde u, h en hetzelfde zaad); de achtermuren
// krijgen een stelsel van dezelfde vorm.
function hutMuren(H) {
  const V = H.vleugels[0];
  return [['q', 1], ['a', 1], ['q', -1], ['a', -1]].map(([zijde, s], i) => {
    const P = s > 0 ? H.stukken.find((Q) => !Q.U && Q.s === 0 && Q.zijde === zijde) : null;
    if (P) return { zijde, s, gevel: zijde === 'a', Lu: P.Lu, pos: P.pos, u: (x, y, z) => P.lokAN(x, y, z)[0] * SQ, zk: H.zaad * 5 + P.idx * 17, P };
    const half = zijde === 'q' ? V.ha : V.hq;
    const wand = zijde === 'q' ? V.hq : V.ha;
    const dirU = zijde === 'q' ? 1 : -1; // van links naar rechts in beeld
    const l0 = -dirU * half;
    const bol = zijde === 'q' ? (m, z) => HS.bolQ(H, V, m, z) : (m, z) => HS.bolA(H, V, m, z);
    const pos = (u, h, uit = 0) => {
      const z = h / PXH;
      const m = l0 + (dirU * u) / SQ;
      const w = -(wand + bol(m, z) + uit);
      const [a, q] = zijde === 'q' ? [m, w] : [w, m];
      return [...V.wereld(a + V.hellA * z, q + V.hellQ * z), z];
    };
    const u = (x, y, z) => {
      const [a, q] = V.lok(x, y);
      const m = zijde === 'q' ? a - V.hellA * z : q - V.hellQ * z;
      return (m - l0) * dirU * SQ;
    };
    return { zijde, s, gevel: zijde === 'a', Lu: 2 * half * SQ, pos, u, zk: H.zaad * 5 + 40 + i, P: null };
  });
}
// op welke muur ligt (x, y, z): waar het punt het verst naar buiten ligt
function muurVan(M, V, x, y, z) {
  const [a, q] = V.lok(x, y);
  const as = a - V.hellA * z;
  const qs = q - V.hellQ * z;
  if (Math.abs(qs) - V.hq > Math.abs(as) - V.ha) return qs > 0 ? M[0] : M[2];
  return as > 0 ? M[1] : M[3];
}

// Het vlechtwerk: een dunne muur (VLECHT) met de tenen als patroon, en de gaten van de deur en het
// venster. tot(muur) zegt hoe hoog het per muur is: { rijen, u } is zoveel hele rijen tenen en de
// volgende rij tot u (px, van links); { h } tot die hoogte; niets: tot onder de latten. Een rij is zo
// hoog als in vlechtwerk() in huis-sdf.cjs, dus de bovenrand loopt langs een teen.
function vlechtwerkHut(W, H, B, M, tot) {
  const V = B.V;
  const th = H.sp ? 4.2 : 3.4;
  const r = ring(H, VLECHT.binnen, VLECHT.buiten);
  const f = metGaten(H, (x, y, z) => {
    const d = r(x, y, z);
    if (d > 8) return d;
    const muur = muurVan(M, V, x, y, z);
    const t = tot(muur);
    const h = z * PXH;
    let top;
    if (!t) top = -1e9;
    else if (t.h !== undefined) top = (h - t.h) / PXH;
    else {
      // de hele rijen, en de halve erboven (tot u), als twee blokken
      const u = muur.u(x, y, z);
      const heel = (h - t.rijen * th) / PXH;
      const half = Math.max((u - t.u) / SQ, (h - (t.rijen + 1) * th) / PXH, (t.rijen * th - h) / PXH);
      top = Math.min(heel, half);
    }
    return Math.max(d, top, onderLatten(V, x, y, z));
  });
  voeg(W.groep('vlechtwerk'), { f, grens: [0, 0, Math.hypot(V.ha, V.hq) + 20, -4, V.zN + 10], m: 'tenenHut', deel: 1 });
}

// De staken van de wanden: waar in het vlechtwerk (vlechtwerk() in huis-sdf.cjs) een staak zit, om
// de dertien pixels, behalve bij de hoekpalen, in de deur en in het venster. In de gevels steken ze
// vanaf de kap door tot onder de sporen. Hun koppen staan niet even hoog: ze zijn nog niet
// afgezaagd.
function stakenHut(W, H, B, M, fase) {
  const V = B.V;
  const g = W.groep('staken');
  const sb = H.sp ? 13 : 10;
  const jamb = H.sp ? 12 : 7;
  const midden = (VLECHT.binnen + VLECHT.buiten) / 2;
  M.forEach((muur, i) => {
    const ops = H.openingen.filter((op) => muur.P && op.P === muur.P);
    for (let k = 1; k * sb < muur.Lu - 8; k++) {
      const u = k * sb;
      if (u < 9) continue;
      if (ops.some((op) => Math.abs(u - op.u) < op.b / 2 + (op.deur ? jamb : 0) + 2.5)) continue;
      const R = (k2) => rnd(k * 7 + i * 101, k2, H.zaad + 801);
      let top = H.plaatH - 2 + (R(1) - 0.5) * 12;
      if (muur.gevel && fase >= 4) {
        // tot onder de sporen van de gevel
        const onder = (h) => {
          const [x, y, z] = muur.pos(u, h, midden);
          return Math.max(vlak(V, x, y, z, 1).dw, vlak(V, x, y, z, -1).dw) + SPOOR.boven + 2 * HUT_SPOOR + 1.5;
        };
        let lo = H.plaatH;
        let hi = 400;
        for (let j = 0; j < 30; j++) {
          const m = (lo + hi) / 2;
          if (onder(m) < 0) lo = m;
          else hi = m;
        }
        top = lo - R(1) * 5;
      }
      const a = muur.pos(u, -8, midden);
      const b = muur.pos(u + (R(2) - 0.5) * 2.2, top, midden + (R(3) - 0.5) * 1.2);
      paal(g, a, b, STAAK * (0.85 + 0.3 * R(4)), k * 13 + i * 3);
    }
  });
}

// ---------------------------------------------------------------- de hut: het dak

// Waar de sporen liggen langs de nok: vijf paar, op de gevels en drie ertussen.
function sporenHut(H, V) {
  const n = 4;
  const a0 = V.ha - 4;
  return Array.from({ length: n + 1 }, (_, i) => -a0 + (2 * a0 * i) / n + (i > 0 && i < n ? (rnd(i, 1, H.zaad + 811) - 0.5) * 6 : 0));
}
// het midden van een spoor, dwars op het dak: net onder de latten
const SPOOR_DW = -SPOOR.boven - HUT_SPOOR;

// De muurplaten op de lange muren en twee trekbalken erover: ronde palen met schors.
function muurplatenHut(W, H, B, M) {
  const V = B.V;
  const g = W.groep('muurplaat');
  const midden = (VLECHT.binnen + VLECHT.buiten) / 2;
  const r = 4.4;
  const h = H.plaatH + 1 + r * PXH;
  for (const muur of [M[0], M[2]]) {
    const R = (k) => rnd(muur.s + 3, k, H.zaad + 821);
    paal(g, muur.pos(-9, h + (R(1) - 0.5) * 3, midden), muur.pos(muur.Lu + 9, h + (R(2) - 0.5) * 3, midden), r, 61 + muur.s);
  }
  // de trekbalken, bij het tweede en het vierde paar sporen
  const as = sporenHut(H, V);
  [as[1], as[3]].forEach((a, i) => {
    const z = E(h) + 2 * r - 1;
    const R = (k) => rnd(i, k, H.zaad + 823);
    paal(g, [...V.wereld(a + (R(1) - 0.5) * 3, -V.hq - 10), z + (R(2) - 0.5)], [...V.wereld(a + (R(3) - 0.5) * 3, V.hq + 10), z + (R(4) - 0.5)], 3.8, 71 + i);
  });
}

// De kap: per paar twee sporen die in de nok kruisen, van de dakvoet tot een eind voorbij de nok,
// en de nokpaal in de kruisen, die met de nok meezakt. Ronde palen, recht, in het stelsel van het
// dak (vlak), zodat ze onder de latten en het riet van de afgewerkte hut liggen.
function kapHut(W, H, V) {
  const g = W.groep('kap');
  sporenHut(H, V).forEach((a0, i) => {
    for (const s of [1, -1]) {
      const R = (k) => rnd(i * 2 + (s > 0 ? 0 : 1), k, H.zaad + 831);
      const a = a0 + (R(1) - 0.5) * 1.5;
      const F0 = vlak(V, ...V.wereld(a, 0), V.nokZ(a), 1);
      const eind = (V.voetQ(a) - 6 + SPOOR_DW * F0.uz) / F0.ux;
      const r = HUT_SPOOR * (0.9 + 0.2 * R(2));
      paal(g, opVlak(V, a, -9 - R(3) * 5, SPOOR_DW, s), opVlak(V, a + (R(4) - 0.5) * 2, eind, SPOOR_DW, s), r, 100 + i * 2 + (s > 0 ? 0 : 1));
    }
  });
  // de nokpaal, in stukken van spoor tot spoor, zodat hij met de nok meezakt
  const rn = 3.8;
  const as = sporenHut(H, V);
  const zG = (a) => V.nokZ(a) + (rn - SPOOR.boven) / vlak(V, ...V.wereld(a, 0), V.nokZ(a), 1).ux;
  const punten = [-V.ha - 8, ...as.slice(1, -1), V.ha + 8].map((a) => [...V.wereld(a, 0), zG(klem(a, as[0], as[as.length - 1]))]);
  for (let i = 0; i + 1 < punten.length; i++) paal(g, punten[i], punten[i + 1], rn, 120 + i);
}

// De tak op het hoogste punt: een groene tak van een berk, op de nok bij de gevel die je ziet,
// met een lap rood eraan. Ook de armen vieren het hoogste punt; een meiboom hebben ze niet.
function takHut(W, H, V) {
  const g = W.groep('tak');
  const a = V.ha - 6;
  const z0 = V.nokZ(a) - SPOOR.boven / 0.6 + 2;
  const voet = [...V.wereld(a, 0), z0];
  const top = [voet[0] + 10, voet[1] + 7, z0 + 84];
  paal(g, voet, top, 1.9, 21);
  // zijtakjes, en blad in trossen langs de bovenste helft
  const takjes = [[0.45, [-12, 5, 14]], [0.6, [11, -6, 12]], [0.72, [-8, -9, 11]], [0.84, [7, 9, 9]]];
  takjes.forEach(([t, d], i) => {
    const c = [voet[0] + (top[0] - voet[0]) * t, voet[1] + (top[1] - voet[1]) * t, voet[2] + (top[2] - voet[2]) * t];
    const e = [c[0] + d[0], c[1] + d[1], c[2] + d[2]];
    paal(g, c, e, 1.1, 30 + i);
  });
  const trossen = [[0.5, -10, 4, 12, 8], [0.62, 9, -4, 13, 8.5], [0.74, -7, -6, 9, 7.5], [0.86, 6, 7, 8, 7], [0.97, 2, 1, 3, 7.5], [0.36, -13, 5, 19, 6.5], [0.8, -1, -1, 5, 7]];
  trossen.forEach(([t, dx, dy, dz, rr], i) => {
    const c = [voet[0] + (top[0] - voet[0]) * t + dx, voet[1] + (top[1] - voet[1]) * t + dy, voet[2] + (top[2] - voet[2]) * t + dz * 0.4];
    const R = (k) => rnd(i, k, H.zaad + 841);
    const [ra, rb, rc] = [rr * (1 + 0.3 * R(1)), rr * (0.8 + 0.3 * R(2)), rr * (0.62 + 0.2 * R(3))];
    voeg(g, {
      f: (x, y, z) => sdf.ellipsoide(x - c[0], y - c[1], z - c[2], ra, rb, rc) + (hash(Math.floor(x * 0.7), Math.floor(y * 0.7 + z * 0.7), 43 + i) % 3) * 0.45,
      g: [c[0], c[1], c[2], Math.max(ra, rb, rc) + 3],
      m: 'blad',
      deel: 760 + i,
    });
  });
  // een lap rood, aan de tak geknoopt, met de wind mee
  const l0 = [voet[0] + (top[0] - voet[0]) * 0.4, voet[1] + (top[1] - voet[1]) * 0.4, voet[2] + (top[2] - voet[2]) * 0.4];
  const pts = [l0];
  for (let i = 1; i <= 4; i++) pts.push([l0[0] + 5.5 * i + 1.6 * Math.sin(i * 1.7), l0[1] + 6.5 * i - 1.5 * Math.sin(i * 1.3), l0[2] - 4.5 * i - 1.8 * Math.sin(i * 2.1)]);
  for (let i = 0; i + 1 < pts.length; i++) {
    const p = balk(pts[i], pts[i + 1], 2.8 - i * 0.3, 0.7, [1, -1, 0.3], 0.3);
    p.m = 'lint';
    p.deel = 770;
    voeg(g, p);
  }
}

// Twee stokken op de latten waar het rookgat komt, en een dwars eronder: daar legt de rietdekker
// geen riet.
function rookgatRaam(W, H, V) {
  const G = H.rookgat;
  if (!G) return;
  const g = W.groep('rookgat');
  const dw = -SPOOR.boven + LAT.dik + 1.6;
  for (const [k, s] of [[-1, 0], [1, 1]]) {
    const a = G.a + k * (G.hb + 1);
    paal(g, opVlak(V, a, G.l0 - 6, dw, 1), opVlak(V, a + k, G.l1 + 7, dw, 1), 1.7, 140 + s);
  }
  paal(g, opVlak(V, G.a - G.hb - 5, G.l1 + 2, dw + 3, 1), opVlak(V, G.a + G.hb + 5, G.l1 + 3, dw + 3, 1), 1.6, 142);
}

// ---------------------------------------------------------------- de hut: de bouwplaats

// De palen op hun stapel: lange (sporen, de nokpaal, de muurplaten) en korte dikke (de hoekpalen en
// de deurstijlen). De korte gaan het eerst op; wat overblijft ligt zo dat er niets zweeft.
function palenHut(W, H, B, fase) {
  const n = B.ring.palen.voorraad[fase - 1];
  if (!n) return;
  const g = W.groep('palenstapel');
  const S = B.stapel('palen', fase);
  const P = opStrook(S);
  // [laag, plek dwars, lengte (deel van de strook), straal]
  const L = [0.95, 0.93, 0.9, 0.96];
  const legging =
    n >= 7
      ? [[0, -1.5, L[0], 4.4], [0, -0.5, 0.58, 6], [0, 0.5, L[1], 4.3], [0, 1.5, 0.55, 6.2], [1, -1, L[2], 4.2], [1, 0, 0.6, 5.8], [1, 1, L[3], 4.4]]
      : [[0, -1, L[0], 4.4], [0, 0, L[1], 4.3], [0, 1, L[2], 4.2], [1, -0.5, L[3], 4.4]];
  const rOnder = 5;
  legging.forEach(([laag, d, lang, r], i) => {
    const R = (k) => rnd(i, k, H.zaad + 851);
    const l = (S.lang - 8) * lang;
    const l0 = -S.lang / 2 + 4 + (R(1) * (S.lang - 8 - l)) * (lang < 0.7 ? 1 : 0.2);
    const dd = d * (2 * rOnder + 1.2) + (R(2) - 0.5) * 1.2;
    const z = r + (laag ? 2 * rOnder - 1.6 : 0) + (R(3) - 0.5) * 0.4;
    paal(g, P(l0, dd, z), P(l0 + l, dd + (R(4) - 0.5) * 1.5, z + (R(5) - 0.5) * 0.6), r, 150 + i);
  });
}

// Bossen staken: elk een stuk of tien rechte stokken, aan één kant gepunt, met twee banden.
function stakenBossen(W, H, B, fase) {
  const n = B.ring.staken.voorraad[fase - 1];
  if (!n) return;
  const g = W.groep('stakenbos');
  const S = B.stapel('staken', fase);
  const P = opStrook(S);
  const lang = S.lang - 16;
  for (let b = 0; b < n; b++) {
    const d0 = (b - (n - 1) / 2) * 13.5;
    for (let j = 0; j < 10; j++) {
      const R = (k) => rnd(b * 10 + j, k, H.zaad + 861);
      const hoek = (j / 10) * Math.PI * 2 + R(1);
      const rr = j < 7 ? 4 : 1.6;
      const dd = d0 + Math.cos(hoek) * rr;
      const zz = 5.6 + Math.sin(hoek) * rr + (j >= 7 ? 0 : 0);
      const l0 = -lang / 2 + (R(2) - 0.5) * 6;
      const l1 = lang / 2 + (R(3) - 0.5) * 6;
      const A = P(l0, dd, zz);
      const Bp = P(l1 - 7, dd, zz);
      const T_ = P(l1, dd + (R(4) - 0.5), zz);
      const r = 1.3 + 0.35 * R(5);
      voeg(g, { f: (x, y, z) => sdf.capsule(x, y, z, A[0], A[1], A[2], Bp[0], Bp[1], Bp[2], r), g: [(A[0] + Bp[0]) / 2, (A[1] + Bp[1]) / 2, (A[2] + Bp[2]) / 2, lang / 2 + 3], m: 'paal', deel: 880 + b * 12 + j, as: [(Bp[0] - A[0]) / lang, (Bp[1] - A[1]) / lang, 0], a0: A, zaad: j * 3 + b });
      voeg(g, { f: (x, y, z) => sdf.rondeKegel(x, y, z, Bp[0], Bp[1], Bp[2], T_[0], T_[1], T_[2], r, 0.3), g: [(Bp[0] + T_[0]) / 2, (Bp[1] + T_[1]) / 2, zz, 6], m: 'staakpunt', deel: 880 + b * 12 + j });
    }
    // twee banden van gedraaide tenen
    const tc = Math.cos(S.hoek);
    const ts = Math.sin(S.hoek);
    for (const lb of [-lang * 0.28, lang * 0.3]) {
      const c = P(lb, d0, 5.2);
      voeg(g, { f: (x, y, z) => { const dx = x - c[0]; const dy = y - c[1]; const al = dx * tc + dy * ts; const ra = Math.hypot(-dx * ts + dy * tc, z - c[2]); return Math.max(Math.abs(ra - 5.4) - 0.9, Math.abs(al) - 1.2); }, g: [c[0], c[1], c[2], 8], m: 'band', deel: 878 });
    }
  }
}

// Stro in de leemkuil: het wordt door het leem gemengd, dus er liggen halmen op het leem en een
// bosje op de rand. Ze zakken met het leem mee.
function stroInKuil(W, H, B, fase) {
  const S = B.stapel('kuil', fase);
  const peil = B.kuilPeil[fase - 1];
  const g = W.groep('stro');
  const n = fase <= 5 ? 16 : 9;
  for (let i = 0; i < n; i++) {
    const R = (k) => rnd(i, k, H.zaad + 871);
    const hoek = R(1) * Math.PI;
    const rr = Math.sqrt(R(2)) * 9;
    const t = R(3) * Math.PI * 2;
    const c = [S.c[0] + Math.cos(t) * rr * 0.9, S.c[1] + Math.sin(t) * rr, peil + 0.4];
    const l = 4 + 3 * R(4);
    const A = [c[0] - Math.cos(hoek) * l, c[1] - Math.sin(hoek) * l, c[2]];
    const Bp = [c[0] + Math.cos(hoek) * l, c[1] + Math.sin(hoek) * l, c[2] + 0.3];
    voeg(g, { f: (x, y, z) => sdf.capsule(x, y, z, A[0], A[1], A[2], Bp[0], Bp[1], Bp[2], 0.55), g: [c[0], c[1], c[2], l + 1], m: 'stro', deel: 890 + (i % 3) });
  }
  // een bosje op de rand, aan de kant van de hut
  if (fase <= 5) {
    const c = [S.c[0] + 6, S.c[1] - 16, 2.6];
    voeg(g, { f: (x, y, z) => sdf.ellipsoide(x - c[0], y - c[1], z - c[2] + 1.2, 9, 5, 3.6) + (hash(Math.floor(x * 1.4), Math.floor(y * 0.5), 47) % 3) * 0.35, g: [c[0], c[1], c[2], 11], m: 'stro', deel: 893 });
  }
}

// De haard, midden op de vloer: een kring van veldstenen met as erin. Na de kap zie je hem niet
// meer, maar hij ligt er (wat staat, blijft staan).
function haardHut(W, H) {
  const g = W.groep('haard');
  const c = [-26, -22];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const R = (k) => rnd(i, k, H.zaad + 881);
    const t = (i / n) * Math.PI * 2 + R(1) * 0.3;
    const rr = 13 + (R(2) - 0.5) * 2;
    const x = c[0] + Math.cos(t) * rr;
    const y = c[1] + Math.sin(t) * rr;
    const s = 4.2 + 1.6 * R(3);
    voeg(g, { f: (px, py, pz) => sdf.ellipsoide(px - x, py - y, pz - s * 0.35, s * 1.2, s, s * 0.7), g: [x, y, s * 0.35, s * 1.3 + 1], m: 'haardsteen', deel: nieuwDeel(), toon: ((hash(i, 5, H.zaad) % 5) - 2) * 0.4, c });
  }
  voeg(g, { f: (x, y, z) => sdf.ellipsoide(x - c[0], y - c[1], z + 0.2, 10.5, 10.5, 1.5), g: [c[0], c[1], 0, 12], m: 'as', deel: nieuwDeel() });
}

// De ladder: tegen de muurplaat (kap) of tegen de dakrand (riet), zijn voet op de rij vooraan.
function ladderHut(W, H, V, fase) {
  const g = W.groep('rietladder');
  const a = -52;
  const voet = [...V.wereld(a - 4, V.hq + 37), 0];
  const top = fase === 4 ? [...V.wereld(a, V.hq + 3), E(H.plaatH + 26)] : [...V.wereld(a + 2, V.voetQ(a) - 3), V.voetZ(a) + 16];
  ladder(g, voet, top, 16, 19, 160);
}

// Twee schoven op de latten boven de rand van het riet, klaar om te leggen: de toppen naar de nok.
function schovenOpDak(W, H, V) {
  const g = W.groep('schoven op het dak');
  const dwS = -SPOOR.boven + LAT.dik + 6.4;
  const F0 = vlak(V, ...V.wereld(0, 0), V.nokZ(0), 1);
  const l = F0.L - 130;
  bundel(g, opVlak(V, 22, l - 40, dwS, 1), opVlak(V, 30, l + 32, dwS, 1), 6.6, 'schoof', 310);
  bundel(g, opVlak(V, 62, l - 30, dwS + 0.5, 1), opVlak(V, 48, l + 36, dwS, 1), 6.6, 'schoof', 311);
}

// ---------------------------------------------------------------- de hut: de fases

// de materialen van de hut in aanbouw, bovenop die van de bouwplaats
function hutMaterialen(H, M) {
  const V = H.vleugels[0];
  return {
    // de tenen in het vlechtwerk: het patroon van huis-sdf.cjs, per muur in zijn eigen u
    tenenHut: {
      ramp: 'schors',
      lo: 1.5,
      hi: 6.6,
      schaduwKracht: 0.12,
      patroon: (C) => {
        const m = muurVan(M, V, C.x, C.y, C.z);
        return HS.vlechtwerk(H, m.u(C.x, C.y, C.z), C.z * PXH, m.zk);
      },
    },
    // nat leem: dezelfde wand als de afgewerkte hut, maar donker (en met de schaduw van de dakrand)
    leemNat: { ramp: 'aarde', lo: 1.1, hi: 4.9, schaduwKracht: 0.12, glans: 0.7, glansMacht: 16, patroon: HS.metRand(H, (C) => HS.lemenPatroon(H, C, true)) },
    staakpunt: { ramp: 'hout', lo: 1.6, hi: 6.2, schaduwKracht: 0.3 },
    blad: { ramp: 'blad', lo: 1.2, hi: 6.2, schaduwKracht: 0.3, patroon: (C) => (hash(C.px, C.py, 61) % 4 === 0 ? -1.1 : hash(C.px, C.py, 62) % 5 === 0 ? 0.9 : 0) },
    stro: { ramp: 'stro', lo: 1.2, hi: 5.6, schaduwKracht: 0.3, patroon: (C) => (hash(C.px, C.py >> 1, 63) % 3 === 0 ? -1.2 : hash(C.px, C.py, 64) % 4 === 0 ? 0.7 : 0) },
    as: { ramp: 'bot', lo: 0.5, hi: 2.6, schaduwKracht: 0.4, patroon: (C) => (hash(C.px, C.py, 65) % 5 === 0 ? { ramp: 'inkt', stap: 1.2 } : 0) },
    // de stenen van de haard: aan de kant van het vuur zwart van het roet
    haardsteen: {
      ramp: 'veldsteen',
      lo: 1.2,
      hi: 5.4,
      schaduwKracht: 0.12,
      patroon: (C) => {
        const p = C.deel;
        const binnen = p.c ? Math.hypot(C.x - p.c[0], C.y - p.c[1]) < 12.5 : false;
        return (p.toon || 0) + (binnen ? -1.6 : 0) + (hash(C.px, C.py, 66) % 13 === 0 ? -0.8 : 0);
      },
    },
  };
}

function faseHut(n) {
  const W0 = HS.huis(HUT_ZAAD, HUT_SPEC);
  W0.fase = n;
  if (n === 7) return W0;
  DEEL = 2000;
  const H = W0.H;
  const V = H.vleugels[0];
  const B = plaats(H, HUT);
  const M = hutMuren(H);
  const W = new Wereld();
  W.H = H;
  W.fase = n;
  W.mat = { ...materialen(H, W0, { spaanders: 2 }), ...hutMaterialen(H, M) };
  // zolang er geen dak op zit, valt er ook geen schaduw van de dakrand op het hout
  if (n <= 4) W.mat.hout = { ...W.mat.hout, patroon: (C) => HS.balkPatroon(C, false) };
  const van = (naam) => W0.groepen.filter((g) => g.naam === naam);
  const neem = (naam) => van(naam).forEach((g) => W.groepen.push(g));

  // de bouwplaats
  grond(W, H, B, n);
  if (n === 1) uitzetten(W, H, B, n);
  palenHut(W, H, B, n);
  stakenBossen(W, H, B, n);
  rietEnTenen(W, H, B, n);
  stroInKuil(W, H, B, n);

  if (n >= 2) {
    // de hoekpalen van de afgewerkte hut, de staken, de deurstijlen en de drempel, en de haard
    neem('hoekpalen');
    stakenHut(W, H, B, M, n);
    neem('stijlen');
    const drempel = W.groep('drempel');
    voeg(drempel, van('romp')[0].delen[1]);
    haardHut(W, H);
  }
  if (n >= 3) {
    // het vlechtwerk, de latei boven de deur en die boven het venster
    const tot =
      n === 3
        ? (m) => (m.s < 0 ? { rijen: 15, u: m.Lu * 0.7 } : m.gevel ? { rijen: 10, u: m.Lu * 0.45 } : { rijen: 12, u: m.Lu * 0.58 })
        : (m) => (m.gevel && n >= 5 ? null : { h: H.plaatH + 2 });
    vlechtwerkHut(W, H, B, M, tot);
    neem('liggers');
    const latei = van('ramen')[1];
    voeg(W.groep('latei'), latei.delen[latei.delen.length - 1]);
  }
  if (n === 4 || n === 5) {
    // (in fase 6 liggen ze onder het riet en in het leem, net als in de afgewerkte hut)
    muurplatenHut(W, H, B, M);
    kapHut(W, H, V);
    takHut(W, H, V);
    ladderHut(W, H, V, n);
  }
  if (n === 5) {
    latten(W, H, V);
    const riet = van('riet')[0];
    const p = riet.delen[0];
    p.f = halfRiet(H, V, p.f, { bijLadder: -52 });
    W.groepen.push(riet);
    rookgatRaam(W, H, V);
    schovenOpDak(W, H, V);
  }
  if (n === 6) {
    // het leem, nat, over het vlechtwerk; boven in de gevel die je ziet is het nog niet klaar
    const r = ring(H, -MUUR, 0);
    const gevelTop = (u) => 168 + 9 * Math.sin(u * 0.11 + 1.3) + 5 * Math.sin(u * 0.37);
    const f = metGaten(H, (x, y, z) => {
      const d = r(x, y, z);
      if (d > 8) return d;
      let top = onderLatten(V, x, y, z);
      const m = muurVan(M, V, x, y, z);
      if (m === M[1]) top = Math.max(top, (z * PXH - gevelTop(m.u(x, y, z))) / PXH);
      return Math.max(d, top);
    });
    const binnen = ring(H, -MUUR, -MUUR + 1.2);
    voeg(W.groep('leem'), { f, grens: [0, 0, Math.hypot(V.ha, V.hq) + 30, -4, V.zN + 20], m: (x, y, z) => (binnen(x, y, z) < 0.8 ? 'binnen' : 'leemNat'), deel: 1 });
    neem('riet');
    neem('nok');
    neem('windveer');
    // de staken in het venster
    const vs = W.groep('vensterstaken');
    for (const p of van('ramen')[1].delen.slice(0, -1)) voeg(vs, p);
  }
  return W;
}

// ---------------------------------------------------------------- de types

// Een type: alles wat deze bouwer van één soort gebouw weet (zie de kop van dit bestand).
//   tegel       de tegel van het afgewerkte gebouw in tegels/gebouwen.tsx, en zijn sleutel in
//               T.BOUWFASEN.fasen (tegels/bouwfasen-sdf.js)
//   gebouw      de soort in het spel (T.GEBOUWEN in js/gebouwen.js)
//   zaad, spec  het huis in huis-sdf.cjs; b en d van de spec zijn de voet in tegels
//   fasen       de namen van de fases; de laatste is 'af', de tegel
//   vanaf       per fase behalve 'af': de voortgang (0..1) waarop hij begint (js/bouwen.js)
//   ring        de stapels op de ring: { naam: { van, tot, voorraad, rest } } (zie HUIS_RING)
//   stapelVan   welke groep in de wereld op welke stapel ligt (voor de ringproef)
//   bouwplaats  de groepen die op de grond staan en binnen de ring moeten vallen
//   maak(n)     de wereld van fase n (1..fasen.length); de laatste is het huis uit huis()
//   bestand     het vel met de fases, in tegels/
//   proef       het voorvoegsel van zijn proefplaten in uit/bouwfasen-sdf/
//   x2          de fases die op proef-x2.png twee keer vergroot staan
//   uitleg      wat er in de json bij `_lees_dit` staat
//   en naar keuze: steiger (de plek van de steiger), kuilPeil en kluiten (de leemkuil per fase)

// de uitleg in de json: wat het is, en hoe je de velden leest
function uitleg(TY, wat, extra, hoogste) {
  return (
    wat + ', gemaakt door gereedschap/pixelart/bouwfasen-sdf.cjs (huis-sdf.cjs zaad ' + TY.zaad + ') — niet met de hand bijwerken. ' +
    'Afgewerkt is het de tegel ' + JSON.stringify(TY.tegel) + ' in tegels/gebouwen.tsx, uit dezelfde render: zelfde anker, zelfde muren. ' +
    'Per fase (0..5, oplopend in afbouw): x/y/b/h snijdt de cel uit bestand, anker is het punt in die cel dat op T.naarScherm(x, y) van de aangeklikte tegel komt ' +
    '(de achterste voethoek, een halve tegel boven het midden van die tegel, zoals tegels.json), vanaf is de voortgang (0..1) waarop de fase begint, ' +
    'en bezet zijn de ringtegels [dx, dy] waar dan een stapel of de leemkuil ligt, gerekend vanaf de achterste voettegel (dx van -rand tot beslaat[0]-1+rand, dy net zo; ' +
    '+x en +y liggen vooraan). ' + extra +
    'rand is hoe breed de ring is; alles van de bouwplaats valt daarbinnen. hoogstePunt is de fase waarin de kap staat (' + hoogste + ').'
  );
}

const HUIS_STAPEL_VAN = { balken: 'balken', sporen: 'sporen', stenen: 'stenen', schoven: 'riet', tenen: 'tenen', kuil: 'kuil', kluiten: 'kuil' };
const VAKWERKHUIS = {
  tegel: 'huisVakwerkRiet',
  gebouw: 'huis',
  zaad: HUIS_ZAAD,
  spec: HUIS_SPEC,
  fasen: HUIS_FASEN,
  vanaf: HUIS_VANAF,
  ring: HUIS_RING,
  stapelVan: HUIS_STAPEL_VAN,
  bouwplaats: new Set([...Object.keys(HUIS_STAPEL_VAN), 'grond', 'pol', 'paaltjes', 'steiger']),
  // de steiger langs de lange muur, zijn staanders midden op de rij dy = d
  steiger: { u: [8, 66, 124], uit: 34, vloer: 86 },
  maak: faseHuis,
  bestand: 'bouwfasen-sdf.png',
  proef: '',
  x2: [3, 5, 6],
};
VAKWERKHUIS.uitleg = uitleg(VAKWERKHUIS, 'Een vakwerkhuis met riet in aanbouw', 'De steiger staat op de rij dy = beslaat[1] maar is niet bezet: daaronder loop je door. ', 'de meiboom, het pannenbier');

const HUT_STAPEL_VAN = { palenstapel: 'palen', stakenbos: 'staken', schoven: 'riet', tenen: 'tenen', kuil: 'kuil', kluiten: 'kuil', stro: 'kuil' };
const HUT = {
  tegel: 'hutVlechtRiet',
  gebouw: 'hut',
  zaad: HUT_ZAAD,
  spec: HUT_SPEC,
  fasen: HUT_FASEN,
  vanaf: HUT_VANAF,
  ring: HUT_RING,
  stapelVan: HUT_STAPEL_VAN,
  bouwplaats: new Set([...Object.keys(HUT_STAPEL_VAN), 'grond', 'pol', 'paaltjes', 'rietladder']),
  kuilPeil: HUT_KUIL.peil,
  kluiten: HUT_KUIL.kluiten,
  // de meetroede in fase 1: vooraan, rechts van de leemkuil
  roede: [[-14, 116], [62, 127]],
  maak: faseHut,
  bestand: 'bouwfasen-sdf-hut.png',
  proef: 'hut-',
  x2: [3, 5, 6],
};
HUT.uitleg = uitleg(HUT, 'Een hut van vlechtwerk met leem en riet in aanbouw', 'De ladder van de rietdekker staat in fase 4 (riet) op de rij dy = beslaat[1] maar is niet bezet. ', 'de tak op de nok, het pannenbier');

const TYPES = [VAKWERKHUIS, HUT];
// een type bij zijn tegel ('hutVlechtRiet') of zijn gebouw ('hut')
function typeVan(naam) {
  const TY = TYPES.find((t) => t.tegel === naam || t.gebouw === naam);
  if (!TY) throw new Error(`onbekend type ${JSON.stringify(naam)}: kies uit ${TYPES.map((t) => `${t.gebouw} (${t.tegel})`).join(', ')}`);
  return TY;
}

// ---------------------------------------------------------------- renderen

// Het beeld van één fase: groot genoeg voor alles, met de oorsprong van de wereld op (OX, OY). Het
// anker is dan voor elke fase hetzelfde, en voor elk type even groot (de patronen rekenen met de
// pixel op het beeld: een ander beeld gaf een ander huis).
const BEELD = { b: 900, h: 760, OX: 450, OY: 470 };
const WARM = {
  mos: ['mos', [1, 2, 3, 4, 5, 5]],
  aarde: ['zand', [0, 0, 1, 2, 3, 4, 5]],
};

function render(TY, n) {
  const t0 = Date.now();
  const W = TY.maak(n);
  const B = new K.Beeld(BEELD.b, BEELD.h, BEELD.OX, BEELD.OY);
  T.tekenWereld(B, W);
  if (n === TY.fasen.length) B.lichten.push(...W.lichten);
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B, { warm: WARM });
  K.verwarm(B, 1.8);
  K.omlijn(B);
  // de hoogte in de wereld per pixel (NaN waar niets staat), voor de ringproef: een lijn op de grond
  // is alleen te zien waar de grond te zien is
  const z = new Float32Array(B.b * B.h).fill(NaN);
  for (let i = 0; i < B.b * B.h; i++) if (B.ramp[i] >= 0 && B.diep[i] > -1e8) z[i] = B.pos[i * 3 + 2];
  return { p: K.Plaat.van(K.kwantiseer(B)), z, ms: Date.now() - t0 };
}

if (!isMainThread && workerData === 'fase') {
  parentPort.on('message', ({ tegel, n }) => {
    const r = render(typeVan(tegel), n);
    parentPort.postMessage({ tegel, n, b: r.p.b, h: r.p.h, px: r.p.px, z: r.z, ms: r.ms });
  });
}

// Alle taken ({ TY, n }) over een paar draden; geeft { 'tegel n': plaat }.
function renderAlle(taken) {
  return new Promise((klaar, fout) => {
    const uit = {};
    let volgende = 0;
    let gedaan = 0;
    const draden = Math.max(1, Math.min(taken.length, os.cpus().length - 1));
    const werkers = [];
    const geef = (w) => {
      if (volgende >= taken.length) return;
      const { TY, n } = taken[volgende++];
      w.postMessage({ tegel: TY.tegel, n });
    };
    for (let i = 0; i < draden; i++) {
      const w = new Worker(__filename, { workerData: 'fase' });
      w.on('error', fout);
      w.on('message', (m) => {
        const p = new K.Plaat(m.b, m.h);
        p.px = m.px;
        p.z = m.z;
        uit[`${m.tegel} ${m.n}`] = p;
        const TY = typeVan(m.tegel);
        console.log(`${TY.gebouw} fase ${m.n} ${TY.fasen[m.n - 1]}`.padEnd(26), `${(m.ms / 1000).toFixed(1)} s`);
        if (++gedaan === taken.length) {
          for (const x of werkers) x.terminate();
          klaar(uit);
        } else geef(w);
      });
      werkers.push(w);
      geef(w);
    }
  });
}

// het kader van alles wat getekend is, over alle fases heen
function kaderVan(platen) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const p of platen) {
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.b; x++) {
        if (p.px[(y * p.b + x) * 2] < 0) continue;
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
    }
  }
  return { x0, y0, x1, y1 };
}

// een grasveld zo groot als een cel, met de wereld op dezelfde plek: de ondergrond van de proefplaat
function gras(b, h, OX, OY) {
  const B = new K.Beeld(b, h, OX, OY);
  const kaart = D.grondKaart({ zaad: 5 });
  K.tekenDozen(B, [K.doos(-40, -40, 44, 44, -16, 0, D.grondTex(kaart, { dor: true }))]);
  D.grasPollen(B, kaart, { dicht: 0.8 });
  K.belicht(B, { omgeving: () => 0.2 });
  B.zon = new Float32Array(b * h).fill(0.74);
  D.avondlicht(B, { warm: WARM });
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

function vergroot(p, s) {
  const q = new K.Plaat(p.b * s, p.h * s);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      const k = p.lees(x, y);
      if (!k) continue;
      for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) q.zet(x * s + dx, y * s + dy, k[0], k[1]);
    }
  }
  return q;
}

// De achterste voethoek van de muren op het beeld van render(): die komt op het anker, voor elke
// fase en voor de tegel in gebouwen.png. Heel, want de voet is een heel aantal tegels.
function hoekOpScherm(TY) {
  const B0 = new K.Beeld(1, 1, BEELD.OX, BEELD.OY);
  const [ax, ay] = K.naarScherm(B0, (-TY.spec.b / 2) * K.TEGEL, (-TY.spec.d / 2) * K.TEGEL, 0);
  return [Math.round(ax), Math.round(ay)];
}

// Het afgewerkte gebouw voor tegels/gebouwen.png (naar-tiled.cjs): precies de laatste fase, uit
// dezelfde render in hetzelfde beeld als de fases, zodat de muren van tegel en fases op dezelfde
// pixels vallen (de patronen rekenen met de pixel op het beeld, dus een ander beeld gaf een ander
// huis).
function afgewerkt(TY) {
  return { plaat: render(TY, TY.fasen.length).p, hoek: hoekOpScherm(TY), beslaat: [TY.spec.b, TY.spec.d] };
}

// ---------------------------------------------------------------- de ring nagemeten

// Zonder beeld: prik elk deel van de bouwplaats op een rooster van twee eenheden af, vlak boven de
// grond (tot 40 hoog: daar liggen de stapels, en de voet van alles wat hoger is), en kijk of het
// binnen de ring valt, en elke stapel binnen zijn eigen tegels. Geeft per fase de tegels waar elke
// stapel echt ligt, zodat `bezet` en het beeld niet uit elkaar kunnen lopen.
function ringToets(TY, n) {
  const W = TY.maak(n);
  const B = plaats(W.H, TY);
  const T_ = K.TEGEL;
  const X0 = (-TY.spec.b / 2) * T_;
  const Y0 = (-TY.spec.d / 2) * T_;
  const tegel = (x, y) => [Math.floor((x - X0) / T_), Math.floor((y - Y0) / T_)];
  const fouten = [];
  const echt = {}; // stapel -> Set van "dx,dy"
  const STAP = 2;
  for (const g of W.groepen) {
    if (!TY.bouwplaats.has(g.naam)) continue;
    const stapel = TY.stapelVan[g.naam];
    const eigen = stapel ? B.stapel(stapel, n) : null;
    for (const p of g.delen) {
      // het bereik: een bol (g: x, y, z, straal) of een cilinder (grens: x, y, straal, z0, z1)
      if (!p.g && !p.grens) continue;
      const [cx, cy, r, z0, z1] = p.g ? [p.g[0], p.g[1], p.g[3], p.g[2] - p.g[3], p.g[2] + p.g[3]] : p.grens;
      const zs = [];
      for (let z = Math.max(z0, -1.5); z <= Math.min(z1, 40); z += 2.5) zs.push(z);
      if (g.naam === 'grond') zs.splice(0, zs.length, -0.3);
      const f = p.f;
      for (let x = Math.floor((cx - r) / STAP) * STAP + 1; x <= cx + r; x += STAP) {
        for (let y = Math.floor((cy - r) / STAP) * STAP + 1; y <= cy + r; y += STAP) {
          if (!zs.some((z) => f(x, y, z) < 0)) continue;
          const { omtrek } = B;
          if (x < omtrek.x0 - 0.5 || x > omtrek.x1 + 0.5 || y < omtrek.y0 - 0.5 || y > omtrek.y1 + 0.5) fouten.push(`${g.naam} buiten de ring op (${x}, ${y})`);
          if (!stapel) continue;
          if (x < eigen.x0 - 1 || x > eigen.x1 + 1 || y < eigen.y0 - 1 || y > eigen.y1 + 1) fouten.push(`${stapel} buiten zijn tegels op (${x}, ${y})`);
          (echt[stapel] = echt[stapel] || new Set()).add(tegel(x, y).join(','));
        }
      }
    }
  }
  // de tegels die volgens de ring van het type vol liggen, en of er ook echt iets ligt
  const gezegd = new Set(bezet(TY.ring, n).map((t) => t.join(',')));
  const gevonden = new Set(Object.values(echt).flatMap((s_) => [...s_]));
  for (const t of gezegd) if (!gevonden.has(t)) fouten.push(`tegel ${t} heet bezet, maar er ligt niets`);
  const uniek = [...new Set(fouten)];
  return { fouten: uniek, echt };
}

// Hoeveel ringtegels vooraan (de rij dy = d en de kolom dx = b, zonder de hoeken) vrij zijn in fase n:
// daar staan de bouwers, en daar is de deur (minstens drie).
function vrijVooraan(TY, n) {
  const vol = new Set(bezet(TY.ring, n).map((t) => t.join(',')));
  let vrij = 0;
  for (let dx = 0; dx < TY.spec.b; dx++) if (!vol.has(`${dx},${TY.spec.d}`)) vrij++;
  for (let dy = 0; dy < TY.spec.d; dy++) if (!vol.has(`${TY.spec.b},${dy}`)) vrij++;
  return vrij;
}

// ---------------------------------------------------------------- alles

const TEGELS = path.join(__dirname, '..', '..', 'tegels');
const STROOK = 22; // de strook boven een proefplaat, voor de opschriften

// Het vel voor het spel en de proefplaten van één type, uit zijn gerenderde fases (lijst: 1..n).
// Geeft de ingang voor tegels/bouwfasen-sdf.json.
function velEnProeven(TY, lijst) {
  const af = lijst.length;
  const [hx, hy] = hoekOpScherm(TY);

  // het vel voor het spel: de fases behalve 'af' in één rij cellen van dezelfde maat, met een rand
  // van twee pixels, en hetzelfde anker (de achterste voethoek, +16 naar het midden van zijn tegel)
  const bouw = lijst.slice(0, af - 1);
  const kb = kaderVan(bouw);
  const bx0 = kb.x0 - 2;
  const by0 = kb.y0 - 2;
  const bb = kb.x1 - kb.x0 + 5;
  const bh = kb.y1 - kb.y0 + 5;
  const vel = new K.Plaat(bb * bouw.length, bh);
  bouw.forEach((p, i) => vel.plak(p.uitsnede(bx0, by0, bb, bh), i * bb, 0));
  fs.writeFileSync(path.join(TEGELS, TY.bestand), K.png(vel, 1, null));
  const anker = [hx - bx0, hy - by0 + 16];
  const data = {
    _lees_dit: TY.uitleg,
    gebouw: TY.gebouw,
    bestand: TY.bestand,
    beslaat: [TY.spec.b, TY.spec.d],
    rand: RAND,
    hoogstePunt: TY.fasen.indexOf('kap'),
    fasen: bouw.map((p, i) => ({ x: i * bb, y: 0, b: bb, h: bh, anker, naam: TY.fasen[i], vanaf: TY.vanaf[i], bezet: bezet(TY.ring, i + 1) })),
  };

  // de proefplaten: alle fases op gras, in één cel die ook het afgewerkte gebouw omvat
  const k = kaderVan(lijst);
  const cx0 = k.x0 - 2;
  const cy0 = k.y0 - 2;
  const cb = k.x1 - k.x0 + 5;
  const ch = k.y1 - k.y0 + 5;
  const cellen = lijst.map((p) => p.uitsnede(cx0, cy0, cb, ch));
  const onder = gras(cb, ch, BEELD.OX - cx0, BEELD.OY - cy0);
  const proef = new K.Plaat(cb * cellen.length, ch + STROOK);
  cellen.forEach((c, i) => {
    proef.plak(onder, i * cb, STROOK);
    proef.plak(c, i * cb, STROOK);
    schrijf(proef, `${i + 1} ${TY.fasen[i]}`, i * cb + 8, 5);
  });
  // drie fases twee keer vergroot
  const x2 = new K.Plaat(cb * 2 * TY.x2.length, ch * 2 + STROOK);
  TY.x2.forEach((n, i) => {
    const c = new K.Plaat(cb, ch);
    c.plak(onder, 0, 0);
    c.plak(cellen[n - 1], 0, 0);
    x2.plak(vergroot(c, 2), i * cb * 2, STROOK);
    schrijf(x2, `${n} ${TY.fasen[n - 1]} x2`, i * cb * 2 + 8, 5);
  });
  fs.writeFileSync(path.join(UIT, `${TY.proef}proef-x2.png`), K.png(x2, 1, '#0e0a14'));
  // de ringproef: dezelfde fases, met de ringtegels als dunne ruitjes (rood bezet, groen vrij) en
  // de voet in wit. Het paneel is zo groot dat de hele ring erop past. Een lijn ligt op de grond:
  // waar iets hogers ervoor staat (een stapel, een muur), is hij maar zwak te zien.
  const T_ = K.TEGEL;
  const X0 = (-TY.spec.b / 2) * T_;
  const Y0 = (-TY.spec.d / 2) * T_;
  const Bb = new K.Beeld(1, 1, BEELD.OX, BEELD.OY);
  const ringHoeken = [[X0 - RAND * T_, Y0 - RAND * T_], [-X0 + RAND * T_, Y0 - RAND * T_], [-X0 + RAND * T_, -Y0 + RAND * T_], [X0 - RAND * T_, -Y0 + RAND * T_]].map(([x, y]) => K.naarScherm(Bb, x, y, 0));
  const px0 = Math.floor(Math.min(k.x0, ...ringHoeken.map((q) => q[0]))) - 6;
  const py0 = Math.floor(Math.min(k.y0, ...ringHoeken.map((q) => q[1]))) - 6;
  const pb = Math.ceil(Math.max(k.x1, ...ringHoeken.map((q) => q[0]))) + 7 - px0;
  const ph = Math.ceil(Math.max(k.y1, ...ringHoeken.map((q) => q[1]))) + 7 - py0;
  const grasR = gras(pb, ph, BEELD.OX - px0, BEELD.OY - py0);
  const ringProef = new K.Plaat(pb * lijst.length, ph + STROOK);
  lijst.forEach((p, i) => {
    ringProef.plak(grasR, i * pb, STROOK);
    ringProef.plak(p.uitsnede(px0, py0, pb, ph), i * pb, STROOK);
    const n = i + 1;
    schrijf(ringProef, n < af ? `${n} ${TY.fasen[i]} ${bezet(TY.ring, n).length} bezet` : `${n} ${TY.fasen[i]}`, i * pb + 8, 5);
  });
  const rgba = ringProef.rgba('#0e0a14');
  const B0 = new K.Beeld(1, 1, BEELD.OX - px0, BEELD.OY - py0 + STROOK);
  const lijn = (i, a, b, kleur) => {
    const [x0, y0] = K.naarScherm(B0, a[0], a[1], 0);
    const [x1, y1] = K.naarScherm(B0, b[0], b[1], 0);
    const stappen = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2);
    for (let s_ = 0; s_ <= stappen; s_++) {
      const x = Math.round(x0 + ((x1 - x0) * s_) / stappen);
      const y = Math.round(y0 + ((y1 - y0) * s_) / stappen);
      if (x < 0 || y < STROOK || x >= pb || y >= ph + STROOK) continue;
      // wat staat er op die pixel in de render van deze fase, en hoe hoog?
      const z = lijst[i].z[(y - STROOK + py0) * BEELD.b + (x + px0)];
      const dekking = Number.isNaN(z) || z < 1.5 ? 0.85 : 0.22;
      const o = (y * ringProef.b + i * pb + x) * 4;
      for (let c = 0; c < 3; c++) rgba[o + c] = Math.round(rgba[o + c] * (1 - dekking) + kleur[c] * dekking);
    }
  };
  const ruit = (i, xa, ya, xb, yb, kleur) => {
    const h = [[xa, ya], [xb, ya], [xb, yb], [xa, yb]];
    for (let q = 0; q < 4; q++) lijn(i, h[q], h[(q + 1) % 4], kleur);
  };
  const ROOD = [235, 50, 40];
  const GROEN = [70, 235, 90];
  for (let i = 0; i < lijst.length; i++) {
    const n = i + 1;
    const vol = new Set(n < af ? bezet(TY.ring, n).map((t) => t.join(',')) : []);
    const inzet = 3; // eenheden, zodat twee buren elk hun eigen rand houden
    for (let dx = -RAND; dx < TY.spec.b + RAND; dx++) {
      for (let dy = -RAND; dy < TY.spec.d + RAND; dy++) {
        if (dx >= 0 && dx < TY.spec.b && dy >= 0 && dy < TY.spec.d) continue;
        const kleur = vol.has(`${dx},${dy}`) ? ROOD : GROEN;
        ruit(i, X0 + dx * T_ + inzet, Y0 + dy * T_ + inzet, X0 + (dx + 1) * T_ - inzet, Y0 + (dy + 1) * T_ - inzet, kleur);
      }
    }
    ruit(i, X0, Y0, -X0, -Y0, [255, 255, 255]);
  }
  fs.writeFileSync(path.join(UIT, `${TY.proef}ringproef.png`), pngRgba(ringProef.b, ringProef.h, rgba));
  console.log(`tegels/${TY.bestand}: cel ${bb}×${bh}, anker ${anker.join(', ')}, vel ${vel.b}×${vel.h}`);
  for (let n = 1; n < af; n++) console.log(`  ${n} ${TY.fasen[n - 1].padEnd(10)} bezet ${bezet(TY.ring, n).map((t) => `(${t.join(',')})`).join(' ')}  (vooraan ${vrijVooraan(TY, n)} vrij)`);
  return { data, proef, cel: { b: cb, h: ch, x0: cx0, y0: cy0 } };
}

// Onder de proefplaat van een type een rij met het afgewerkte gebouw naast andere afgewerkte
// gebouwen (vergelijk: [[TY, plaat], ...]), op één grasveld en op ware grootte. Ze staan op
// dezelfde diepte (hun middens op één lijn in beeld), zodat je de maat eerlijk vergelijkt.
function metVergelijking(proef, vergelijk) {
  const kaders = vergelijk.map(([, p]) => kaderVan([p]));
  const tussen = 40;
  // elk gebouw in zijn eigen strook, naast elkaar; de oorsprong van de wereld op dezelfde hoogte
  const y0 = Math.min(...kaders.map((k) => k.y0)) - 4;
  const y1 = Math.max(...kaders.map((k) => k.y1)) + 4;
  const h = y1 - y0 + 1;
  const breed = kaders.reduce((s_, k) => s_ + (k.x1 - k.x0 + 1) + tussen, tussen);
  const b = Math.max(proef.b, breed);
  const rij = new K.Plaat(b, h + STROOK);
  let x = tussen + Math.max(0, Math.floor((proef.b - breed) / 2));
  const opschriften = [];
  const stukken = [];
  vergelijk.forEach(([TY, p], i) => {
    const k = kaders[i];
    stukken.push({ p, k, x });
    opschriften.push([`${TY.gebouw} af ${TY.spec.b}x${TY.spec.d}`, x]);
    x += k.x1 - k.x0 + 1 + tussen;
  });
  // één grasveld onder allemaal: per stuk een uitsnede met de wereld op zijn plek
  for (const { k, x: xs } of stukken) {
    const g = gras(k.x1 - k.x0 + 1 + tussen, h, BEELD.OX - k.x0 + tussen / 2, BEELD.OY - y0);
    rij.plak(g, xs - tussen / 2, STROOK);
  }
  for (const { p, k, x: xs } of stukken) rij.plak(p.uitsnede(k.x0, y0, k.x1 - k.x0 + 1, h), xs, STROOK);
  for (const [t, xs] of opschriften) schrijf(rij, t, xs, 5);
  const uit = new K.Plaat(b, proef.h + rij.h);
  uit.plak(proef, 0, 0);
  uit.plak(rij, 0, proef.h);
  return uit;
}

// Alles voor de gekozen types; de ingangen van de andere types in de json blijven staan.
async function alles(kies = TYPES) {
  fs.mkdirSync(UIT, { recursive: true });
  const t0 = Date.now();
  // eerst de ring, zonder beeld: dat is in een paar tellen klaar
  for (const TY of kies) {
    let fout = false;
    for (let n = 1; n < TY.fasen.length; n++) {
      const r = ringToets(TY, n);
      for (const f of r.fouten.slice(0, 8)) console.warn(`  ${TY.gebouw} fase ${n}: ${f}`);
      if (r.fouten.length) fout = true;
      if (vrijVooraan(TY, n) < 3) {
        console.warn(`  ${TY.gebouw} fase ${n}: vooraan maar ${vrijVooraan(TY, n)} tegels vrij`);
        fout = true;
      }
    }
    if (fout) console.warn(`${TY.gebouw}: de bouwplaats past niet in de ring (zie hierboven)`);
    else console.log(`${TY.gebouw}: ring: alles valt binnen de ring, elke stapel op zijn tegels`);
  }

  // de hut vergelijkt zich met het vakwerkhuis: daarvan is dan ook 'af' nodig
  const taken = [];
  for (const TY of kies) for (let n = 1; n <= TY.fasen.length; n++) taken.push({ TY, n });
  if (kies.includes(HUT) && !kies.includes(VAKWERKHUIS)) taken.push({ TY: VAKWERKHUIS, n: VAKWERKHUIS.fasen.length });
  const platen = await renderAlle(taken);
  const plaat = (TY, n) => platen[`${TY.tegel} ${n}`];

  const JSON_PAD = path.join(TEGELS, 'bouwfasen-sdf.json');
  let oud = {};
  try {
    oud = JSON.parse(fs.readFileSync(JSON_PAD, 'utf8'));
  } catch (e) {
    /* nog niets */
  }
  const ingangen = {};
  for (const TY of TYPES) if (oud[TY.tegel]) ingangen[TY.tegel] = oud[TY.tegel];
  for (const TY of kies) {
    const lijst = TY.fasen.map((_, i) => plaat(TY, i + 1));
    const { data, proef } = velEnProeven(TY, lijst);
    ingangen[TY.tegel] = data;
    const vergelijk = TY === HUT ? [[HUT, plaat(HUT, HUT.fasen.length)], [VAKWERKHUIS, plaat(VAKWERKHUIS, VAKWERKHUIS.fasen.length)]] : null;
    fs.writeFileSync(path.join(UIT, `${TY.proef}proef.png`), K.png(vergelijk ? metVergelijking(proef, vergelijk) : proef, 1, '#0e0a14'));
  }
  // in de volgorde van TYPES, dus altijd dezelfde json
  const alle = {};
  for (const TY of TYPES) if (ingangen[TY.tegel]) alle[TY.tegel] = ingangen[TY.tegel];
  const json = JSON.stringify(alle, null, 1);
  fs.writeFileSync(JSON_PAD, json + '\n');
  fs.writeFileSync(
    path.join(TEGELS, 'bouwfasen-sdf.js'),
    '// Gemaakt door gereedschap/pixelart/bouwfasen-sdf.cjs — niet met de hand bijwerken.\n' +
      '// Dezelfde inhoud als bouwfasen-sdf.json, als script, zodat file:// het ook kan lezen. Wordt ná\n' +
      '// tegels/bouwfasen.js geladen en voegt zijn types toe aan T.BOUWFASEN; het vervangt niets.\n' +
      '(function (T) {\n  T.BOUWFASEN = T.BOUWFASEN || { fasen: {} };\n' +
      Object.entries(alle).map(([naam, d]) => '  T.BOUWFASEN.fasen.' + naam + ' = ' + JSON.stringify(d, null, 1).replace(/\n/g, '\n  ') + ';\n').join('') +
      '})(globalThis.Toren = globalThis.Toren || {});\n',
  );
  console.log(`tegels/bouwfasen-sdf.json en .js: ${Object.keys(alle).join(', ')}; ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  console.log(`  ${path.relative(process.cwd(), UIT)}/: ${kies.map((TY) => `${TY.proef}proef.png, ${TY.proef}proef-x2.png, ${TY.proef}ringproef.png`).join('; ')}`);
}

// een PNG uit losse RGBA-bytes (kern.png neemt alleen een Plaat)
function pngRgba(b, h, rgba) {
  const zlib = require('zlib');
  const tabel = new Uint32Array(256).map((_, n) => {
    let c = n;
    for (let k_ = 0; k_ < 8; k_++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const x of buf) c = tabel[(c ^ x) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const stuk = (type, gegevens) => {
    const l = Buffer.alloc(4);
    l.writeUInt32BE(gegevens.length);
    const td = Buffer.concat([Buffer.from(type, 'ascii'), gegevens]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([l, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(b, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((b * 4 + 1) * h);
  for (let y = 0; y < h; y++) rgba.copy(raw, y * (b * 4 + 1) + 1, y * b * 4, (y + 1) * b * 4);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), stuk('IHDR', ihdr), stuk('IDAT', zlib.deflateSync(raw, { level: 9 })), stuk('IEND', Buffer.alloc(0))]);
}

// een klein lettertype voor de opschriften (5 × 7)
const LETTERS = {
  a: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  b: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  c: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  d: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  e: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  f: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  g: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  h: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  i: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  k: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  l: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  m: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  n: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  o: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  p: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  r: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  s: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  t: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  u: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  v: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  w: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  x: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};
function schrijf(p, tekst, x, y, s = 2) {
  for (const ch of tekst.toLowerCase()) {
    const g = LETTERS[ch] || LETTERS[' '];
    for (let j = 0; j < 7; j++) {
      for (let i = 0; i < 5; i++) {
        if (g[j][i] !== '#') continue;
        for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) p.zet(x + i * s + dx, y + j * s + dy, 'perkament', 5);
      }
    }
    x += 6 * s;
  }
}

if (isMainThread && require.main === module) {
  const [wat, ...rest] = process.argv.slice(2);
  if (wat === 'ring') {
    // alleen de controle van de ring, zonder beeld
    for (const TY of rest.length ? rest.map(typeVan) : TYPES) {
      console.log(`${TY.gebouw} (${TY.tegel}, ${TY.spec.b}×${TY.spec.d})`);
      for (let n = 1; n < TY.fasen.length; n++) {
        const r = ringToets(TY, n);
        const echt = Object.entries(r.echt).map(([st, t]) => `${st} ${[...t].sort().map((x) => `(${x})`).join('')}`).join('; ');
        console.log(`fase ${n} ${TY.fasen[n - 1].padEnd(10)} bezet ${bezet(TY.ring, n).map((t) => `(${t.join(',')})`).join('')}  vooraan ${vrijVooraan(TY, n)} vrij`);
        console.log(`  echt: ${echt}`);
        for (const f of r.fouten.slice(0, 12)) console.log(`  FOUT ${f}`);
        if (r.fouten.length > 12) console.log(`  ... en nog ${r.fouten.length - 12}`);
      }
    }
  } else if (wat === 'fase') {
    // één fase, om te kijken: schrijft uit/bouwfasen-sdf/[hut-]fase-<n>.png
    fs.mkdirSync(UIT, { recursive: true });
    const n = Number(rest[0] || 1);
    const TY = typeVan(rest[1] || 'huis');
    const r = render(TY, n);
    const k = kaderVan([r.p]);
    const c = r.p.uitsnede(k.x0 - 2, k.y0 - 2, k.x1 - k.x0 + 5, k.y1 - k.y0 + 5);
    fs.writeFileSync(path.join(UIT, `${TY.proef}fase-${n}.png`), K.png(c, 1, '#0e0a14'));
    console.log(`${TY.gebouw} fase ${n} ${TY.fasen[n - 1]}: ${(r.ms / 1000).toFixed(1)} s, ${c.b}×${c.h}`);
  } else {
    const namen = [wat, ...rest].filter(Boolean);
    alles(namen.length ? TYPES.filter((TY) => namen.map(typeVan).includes(TY)) : TYPES);
  }
}

module.exports = { TYPES, typeVan, render, afgewerkt, hoekOpScherm, ringToets, bezet, BEELD };
