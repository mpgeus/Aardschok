'use strict';
// bouwfasen-sdf.cjs: een huis in aanbouw, uit de huizenbouwer die niet waterpas is (huis-sdf.cjs).
//
//   node gereedschap/pixelart/bouwfasen-sdf.cjs             alles: het vel en de twee proefplaten
//   node gereedschap/pixelart/bouwfasen-sdf.cjs fase <n>    één fase (1..7), om te kijken
//
// Waarom (ontwerp/beeld.md, "Bouwen: een huis dat groeit", "Nog steeds nep"): de fases uit
// bouwfasen.cjs staan op de rechte huis() van dorp.cjs, en een recht huis blijft nep hoe je het ook
// opbouwt. Marcel: "Het bouwproces moet realistisch zijn en overeenkomstig met het type gebouw.
// Detail is wat dit spel overeind houdt." Hier groeit het huis naar zichzelf toe: elke fase is
// hetzelfde huis uit huis-sdf.cjs, met hetzelfde zaad, dus dezelfde scheve balk, dezelfde
// doorzakkende nok en dezelfde leunende schoorsteen. Wat nog niet gebouwd is laten we weg, wat half
// is snijden we af (langs de stenen, de lagen riet en de bundels), en wat alleen tijdens het bouwen
// bestaat komt erbij: paaltjes met een touw, de stapels, een steiger, de sporen, de latten, de
// meiboom.
//
// Het huis is een vakwerkhuis met riet (één type, als proef), en de volgorde is die van de
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
// Hoe: fase() vraagt huis() om hetzelfde huis (met o.balkDiep, zodat een gebint zonder vulling
// echte balken heeft; het afgewerkte huis ziet daar niets van) en neemt daaruit wat er al staat:
// het vakwerk (liggers, stijlen), de kozijnen, het riet, de nok, de windveren, de schoorsteen. De
// romp (muur en plint in één veld) vervangen we door een ring: een muur met een dikte en een open
// bovenkant, met gaten waar de deur en de ramen komen. Daaruit komen de plint (half of heel), het
// vlechtwerk en het leem. Nieuw zijn: de achtermuren (die ziet de camera van het afgewerkte huis
// nooit, dus huis() tekent er geen vakwerk op), de dekbalken, het dak in aanbouw (in het stelsel
// van het dak zelf: vlak() hieronder, zodat sporen en latten de doorzakking van de nok volgen), de
// steiger, de ladders, de meiboom, de grond en de stapels.
//
// Een ander type huis vraagt: een ander ZAAD/SPEC; bij een L of T per vleugel een ring en een dak
// (ring() en vlak() rekenen nu met één vleugel); bij veldsteen, planken of een blokhut een eigen
// volgorde (beeld.md), met dezelfde bouwstenen (de plint in lagen, de steiger, de stapels).
//
// Uitvoer, alles in gereedschap/pixelart/uit/bouwfasen-sdf/ (nog niet in tegels/ of het spel):
//   vel.png + vel.json   de zeven fases in cellen van dezelfde maat met hetzelfde anker (de
//                        achterste voethoek, een halve tegel boven het midden van die tegel, zoals
//                        tegels.json), zonder gras en zonder grondschaduw
//   proef.png            alle fases op gras naast elkaar, zo groot als het spel ze tekent
//   proef-x2.png         drie fases twee keer vergroot, voor de details

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

// ---------------------------------------------------------------- het huis

// Zaad 4: een rechthoek van 7 × 5 met de deur rechts in de lange muur, een raam links ervan en
// een in de gevel, en de schoorsteen rechts op het dak. Zaad 3 is net zo'n huis, maar met een
// schoor tegen de gevel: iemand heeft de muur overeind gehouden, en dat hoort bij een oud huis,
// niet bij een nieuw. De uitbouwen staan er uitgeschreven, zodat andere kansen in huis-sdf.cjs dit
// huis later niet veranderen.
const ZAAD = 4;
const SPEC = {
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

const FASEN = ['uitzetten', 'voet', 'gebint', 'kap', 'riet', 'leem', 'af'];

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
// zonder); binnen wel, anders brandt de zon op de vloer van een huis met een dak.
function grondPatroon(H, C, fase) {
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
  // spaanders: vanaf het gebint, lichte splinters van twee à drie pixels
  if (fase >= 3) {
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

function materialen(H, W0) {
  const diepe = 0.12;
  const houtHi = 6.6 - (H.hout === 'schors' ? 0.8 : 0);
  return {
    ...W0.mat,
    grond: { ramp: 'aarde', lo: 1.1, hi: 5.4, schaduw: false, omlijn: false, patroon: (C) => grondPatroon(H, C, W0.fase) },
    grondBinnen: { ramp: 'aarde', lo: 1.1, hi: 5.4, schaduwKracht: 0.3, omlijn: false, patroon: (C) => grondPatroon(H, C, W0.fase) },
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

// Waar alles staat, in eenheden rond het midden van het huis (x langs de nok, y ernaar toe). De
// camera kijkt van +x+y: de lange muur met de deur is de voorkant (links in beeld), de gevel met
// het raam de rechterkant. De stapels liggen waar ze het huis niet verbergen: links voorbij de
// linkerhoek, rechts voorbij de rechterhoek, en de leemkuil voor de gevel.
function plaats(H) {
  const V = H.vleugels[0];
  const { ha, hq } = V;
  return {
    V,
    ha,
    hq,
    stenen: { c: [ha + 44, -hq + 6], r: 34 },
    balken: { c: [-ha - 52, hq - 18], hoek: 90 * GRAAD },
    riet: { c: [-ha + 10, hq + 78], hoek: 4 * GRAAD },
    tenen: { c: [ha + 66, 12], hoek: 93 * GRAAD },
    kuil: { c: [ha + 50, hq + 42], rx: 26, ry: 20 },
    steiger: { u: [8, 66, 124], uit: 52, vloer: 86 },
  };
}

// De grond: vertrapte aarde rond het huis en onder de stapels, met een rafelige rand, en de
// leemkuil erin.
function grond(W, H, B, fase) {
  const { ha, hq } = B;
  const K_ = B.kuil;
  const vlekken = [
    [0, 0, ha + 34, hq + 36, 40],
    [B.stenen.c[0], B.stenen.c[1], 46, 44, 30],
    [B.balken.c[0] + 6, B.balken.c[1] + 10, 42, 96, 30],
    [B.riet.c[0] + 20, B.riet.c[1] - 10, 86, 40, 30],
    [K_.c[0] - 6, K_.c[1] - 8, 50, 58, 30],
  ];
  const vorm = (x, y) => {
    let d = Infinity;
    for (const [cx, cy, hx, hy, r] of vlekken) d = Math.min(d, doos2(x - cx, y - cy, hx, hy, r));
    return d + (ruis2(x * 0.035, y * 0.035, H.zaad + 401) - 0.5) * 16 + (ruis2(x * 0.11, y * 0.11, H.zaad + 402) - 0.5) * 5;
  };
  const kuil = (x, y) => (Math.hypot((x - K_.c[0]) / K_.rx, (y - K_.c[1]) / K_.ry) - 1) * Math.min(K_.rx, K_.ry);
  const kom = (x, y, z, e = 0) => sdf.ellipsoide(x - K_.c[0], y - K_.c[1], z, K_.rx + e, K_.ry + e, 10 + e);
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
  voeg(g, { f: (x, y, z) => Math.max(-kom(x, y, z), kom(x, y, z, 3), z), g: [K_.c[0], K_.c[1], -5, K_.rx + 8], m: 'kluit', deel: nieuwDeel() });
  const peil = [-2, -3, -3.5, -4, -5, -7.5][fase - 1];
  voeg(g, { f: (x, y, z) => Math.max(kom(x, y, z, -0.3), z - peil), g: [K_.c[0], K_.c[1], -5, K_.rx + 6], m: 'klei', deel: nieuwDeel() });
  // de uitgegraven aarde ernaast: een lage wal van kluiten achter de kuil
  const wal = W.groep('kluiten');
  const nK = fase <= 2 ? 14 : fase <= 4 ? 11 : 7;
  for (let i = 0; i < nK; i++) {
    const R = (k) => rnd(i, k, H.zaad + 411);
    const t = 0.3 + (2.3 * i) / nK + (R(1) - 0.5) * 0.2;
    const rr = 1.22 + 0.2 * R(2);
    const c = [K_.c[0] - Math.cos(t) * K_.rx * rr, K_.c[1] - Math.sin(t) * K_.ry * rr, 0.6];
    const sz = 2.6 + 2.4 * R(3);
    voeg(wal, { f: (x, y, z) => sdf.ellipsoide(x - c[0], y - c[1], z - c[2], sz * 1.25, sz, sz * 0.55), g: [c[0], c[1], c[2], sz * 1.3 + 1], m: 'kluit', deel: nieuwDeel() });
  }
  // graspollen die de rand van de bouwplaats breken, en een paar die binnen zijn blijven staan
  let np = 0;
  for (let i = 0; i < 400 && np < 46; i++) {
    const R = (k) => rnd(i, k, H.zaad + 421);
    const x = -300 + 600 * R(1);
    const y = -240 + 480 * R(2);
    const v = vorm(x, y);
    if (v > -1 || v < -9 - (i % 5 === 0 ? 20 : 0)) continue;
    if (Math.abs(x) < V.ha + 26 && Math.abs(y) < V.hq + 26) continue;
    if (kuil(x, y) < 8) continue;
    np++;
    const pollen = W.groep('pol');
    const n = 4 + (i % 3);
    for (let j = 0; j < n; j++) {
      const hoek = R(3 + j) * Math.PI * 2;
      const lang = 5 + 4 * R(10 + j);
      const vt = [x + Math.cos(hoek) * 1.2, y + Math.sin(hoek) * 1.2, -0.5];
      const tp = [x + Math.cos(hoek) * lang * 0.55, y + Math.sin(hoek) * lang * 0.55, lang * 0.8];
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
    hout(g, [-ha + 30, hq + 30, 1.2], [-ha + 120, hq + 42, 1.2], 1.2, 1.2, [0, 0, 1], 41, 'hout', 0.5);
  } else {
    // de draad van de metselaar, strak van hoek tot hoek, net buiten de muur op de laag die hij legt
    const h = E(3 * RIJ + 2);
    const buiten = 2.5;
    const hk = (sa, sq) => [...V.wereld(sa * (ha + buiten) + V.hellA * h, sq * (hq + buiten) + V.hellQ * h), h];
    touw(g, hk(-1, 1), hk(1, 1), 0.8, 0.95);
    touw(g, hk(1, 1), hk(1, -1), 0.8, 0.95);
  }
}

// Het hout op de stapel: eiken balken op twee klossen, met telmerken, en de ronde sporen ernaast.
function balkenStapel(W, H, B, fase) {
  const g = W.groep('balken');
  const [cx, cy] = B.balken.c;
  const h = B.balken.hoek;
  const ca = Math.cos(h);
  const sa = Math.sin(h);
  const P = (l, d, z) => [cx + l * ca - d * sa, cy + l * sa + d * ca, z];
  // wat er nog ligt: [balken in de onderste laag, in de tweede, ronde sporen]
  const voorraad = [[5, 4, 5], [5, 4, 5], [3, 1, 4], [2, 0, 0], [1, 0, 0], [1, 0, 0]][fase - 1];
  const lang = 150;
  // de klossen
  for (const l of [-lang * 0.3, lang * 0.3]) hout(g, P(l, -34, 3.2), P(l + 1.5, 36, 3.6), 4.2, 3.3, [0, 0, 1], 60 + l, 'stapelhout', 1.2);
  const r = 7.2;
  let merk = 1;
  const laag = (n, z0, d0, zaad) => {
    for (let i = 0; i < n; i++) {
      const R = (k) => rnd(i, k, zaad);
      const d = d0 + i * (2 * r + 1.6) + (R(1) - 0.5) * 2;
      const l0 = -lang / 2 + (R(2) - 0.5) * 16;
      const l1 = lang / 2 + (R(3) - 0.5) * 16;
      const p = hout(g, P(l0, d, z0 + r + (R(4) - 0.5) * 0.8), P(l1, d + (R(5) - 0.5) * 3, z0 + r + (R(6) - 0.5) * 0.8), r, r * 0.95, [0, 0, 1], zaad * 10 + i, 'stapelhout', 1.4);
      p.merk = 1 + (merk++ % 4);
    }
  };
  const [n0, n1, nS] = voorraad;
  laag(n0, 6.6, -30, 3);
  if (n1) laag(n1, 6.6 + 2 * r, -23, 4);
  // de sporen: lange ronde palen, naast de balken
  for (let i = 0; i < nS; i++) {
    const R = (k) => rnd(i, k, H.zaad + 521);
    const d = 50 + i * 9.2;
    const z = 4.6 + (i % 2) * 0.3;
    paal(g, P(-118 + R(1) * 8, d, z), P(112 + R(2) * 8, d + (R(3) - 0.5) * 6, z + 0.4), 4.4, 90 + i);
  }
}

// Een hoop veldstenen: ronde keien, grijs met een warme en een koele hier en daar.
function stenenHoop(W, H, B, fase) {
  const g = W.groep('stenen');
  const n = [34, 16, 6, 4, 3, 3][fase - 1];
  const [cx, cy] = B.stenen.c;
  const R0 = B.stenen.r;
  const hoogte = [26, 17, 9, 7, 6, 6][fase - 1];
  for (let i = 0; i < n; i++) {
    const R = (k) => rnd(i, k, H.zaad + 531);
    const hoek = R(1) * Math.PI * 2;
    const rr = Math.sqrt(R(2)) * R0 * (fase === 1 ? 1 : 0.8);
    const x = cx + Math.cos(hoek) * rr;
    const y = cy + Math.sin(hoek) * rr * 0.9;
    const s = 5.2 + 3.6 * R(3);
    const zBerg = hoogte * Math.max(0, 1 - (rr / R0) ** 2);
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

// Schoven riet op een stapel, de stoppels naar buiten, en bossen tenen.
function rietEnTenen(W, H, B, fase) {
  const g = W.groep('schoven');
  const [cx, cy] = B.riet.c;
  const h = B.riet.hoek;
  const ca = Math.cos(h);
  const sa = Math.sin(h);
  const P = (l, d, z) => [cx + l * ca - d * sa, cy + l * sa + d * ca, z];
  const lagen = [[6, 5, 3], [6, 5, 3], [6, 5, 3], [6, 5, 2], [4, 2, 0], [2, 0, 0]][fase - 1];
  const r = 7;
  lagen.forEach((n, j) => {
    for (let i = 0; i < n; i++) {
      const R = (k) => rnd(i * 5 + j, k, H.zaad + 541);
      const d = -((n - 1) * (2 * r - 0.8)) / 2 + i * (2 * r - 0.8) + (R(1) - 0.5) * 3;
      const z = r * 0.92 + j * (2 * r - 3.2);
      const l = 50 + (R(2) - 0.5) * 10;
      const om = i % 2 ? 1 : -1; // de stoppels om en om naar buiten
      bundel(g, P(-om * l + (R(3) - 0.5) * 6, d, z + (R(4) - 0.5)), P(om * l + (R(5) - 0.5) * 6, d + (R(6) - 0.5) * 3, z), r, 'schoof', i * 13 + j);
    }
  });
  // bossen tenen: roeden van wilgen, elk bos met twee banden
  const t = W.groep('tenen');
  const [tx, ty] = B.tenen.c;
  const th = B.tenen.hoek;
  const tc = Math.cos(th);
  const ts = Math.sin(th);
  const n = [4, 4, 4, 4, 2, 0][fase - 1];
  for (let i = 0; i < n; i++) {
    const R = (k) => rnd(i, k, H.zaad + 551);
    const d = i * 11 - 16;
    const z0 = i === 3 ? 7.5 : 0;
    const l = 60 + R(1) * 8;
    const P = (ll, dd, z) => [tx + ll * tc - dd * ts, ty + ll * ts + dd * tc, z];
    // zes roeden, dik bij de voet en dun naar de top, een beetje door elkaar
    for (let j = 0; j < 6; j++) {
      const hoek = (j / 6) * Math.PI * 2 + R(2);
      const dd = d + Math.cos(hoek) * 2.2;
      const zz = z0 + 3 + Math.sin(hoek) * 2.2;
      const eind = l + (R(3 + j) - 0.5) * 14;
      const A = P(-eind, dd + (R(10 + j) - 0.5) * 3, zz + (R(20 + j) - 0.5));
      const Bp = P(l * 0.95, dd, zz);
      voeg(t, { f: (x, y, z) => sdf.rondeKegel(x, y, z, A[0], A[1], A[2], Bp[0], Bp[1], Bp[2], 0.75, 1.35), g: [(A[0] + Bp[0]) / 2, (A[1] + Bp[1]) / 2, (A[2] + Bp[2]) / 2, eind + 2], m: 'teen', deel: 800 + i * 10 + j, toon: ((j * 3 + i) % 5 - 2) * 0.35 });
    }
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
// rietdekker doet één dakvlak tegelijk: achter ligt pas de eerste laag.
function halfRiet(H, V, f0) {
  const bijLadder = -72;
  const rand = (a, voor) => {
    const K_ = voor ? 3 : 1;
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
  // de ladder tegen de legger, links
  const [lx, ly] = V.wereld(eerst.a - 30, eerst.q + 34);
  const [tx, ty] = V.wereld(eerst.a - 22, eerst.q - 2);
  ladder(g, [lx, ly, 0], [tx, ty, zL + 30], 17, 19, 120);
  return { zH, staand };
}

// ---------------------------------------------------------------- de fases

function fase(n) {
  const W0 = HS.huis(ZAAD, n === 7 ? SPEC : { ...SPEC, balkDiep: DIEP });
  W0.fase = n;
  if (n === 7) return W0;
  DEEL = 2000;
  const H = W0.H;
  const V = H.vleugels[0];
  const B = plaats(H);
  const W = new Wereld();
  W.H = H;
  W.fase = n;
  W.mat = materialen(H, W0);
  const van = (naam) => W0.groepen.filter((g) => g.naam === naam);
  const neem = (naam) => van(naam).forEach((g) => W.groepen.push(g));

  grond(W, H, B, n);
  if (n <= 2) uitzetten(W, H, B, n);
  balkenStapel(W, H, B, n);
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

// ---------------------------------------------------------------- renderen

// Het beeld van één fase: groot genoeg voor alles, met de oorsprong van de wereld op (OX, OY). Het
// anker is dan voor elke fase hetzelfde.
const BEELD = { b: 900, h: 760, OX: 450, OY: 470 };
const WARM = {
  mos: ['mos', [1, 2, 3, 4, 5, 5]],
  aarde: ['zand', [0, 0, 1, 2, 3, 4, 5]],
};

function render(n) {
  const t0 = Date.now();
  const W = fase(n);
  const B = new K.Beeld(BEELD.b, BEELD.h, BEELD.OX, BEELD.OY);
  T.tekenWereld(B, W);
  if (n === 7) B.lichten.push(...W.lichten);
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B, { warm: WARM });
  K.verwarm(B, 1.8);
  K.omlijn(B);
  return { p: K.Plaat.van(K.kwantiseer(B)), ms: Date.now() - t0 };
}

if (!isMainThread && workerData === 'fase') {
  parentPort.on('message', ({ n }) => {
    const r = render(n);
    parentPort.postMessage({ n, b: r.p.b, h: r.p.h, px: r.p.px, ms: r.ms });
  });
}

function renderAlle(nummers) {
  return new Promise((klaar, fout) => {
    const uit = {};
    let volgende = 0;
    let gedaan = 0;
    const draden = Math.max(1, Math.min(nummers.length, os.cpus().length - 1));
    const werkers = [];
    const geef = (w) => {
      if (volgende < nummers.length) w.postMessage({ n: nummers[volgende++] });
    };
    for (let i = 0; i < draden; i++) {
      const w = new Worker(__filename, { workerData: 'fase' });
      w.on('error', fout);
      w.on('message', (m) => {
        const p = new K.Plaat(m.b, m.h);
        p.px = m.px;
        uit[m.n] = p;
        console.log(`fase ${m.n} ${FASEN[m.n - 1]}`.padEnd(20), `${(m.ms / 1000).toFixed(1)} s`);
        if (++gedaan === nummers.length) {
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

async function alles() {
  fs.mkdirSync(UIT, { recursive: true });
  const t0 = Date.now();
  const nummers = [1, 2, 3, 4, 5, 6, 7];
  const platen = await renderAlle(nummers);
  const lijst = nummers.map((n) => platen[n]);
  // één cel voor alle fases, met een rand van twee pixels
  const k = kaderVan(lijst);
  const cx0 = k.x0 - 2;
  const cy0 = k.y0 - 2;
  const cb = k.x1 - k.x0 + 5;
  const ch = k.y1 - k.y0 + 5;
  const cellen = lijst.map((p) => p.uitsnede(cx0, cy0, cb, ch));
  // het anker: de achterste voethoek van de muren (tegels.json: een halve tegel boven het midden
  // van die tegel), voor elke fase op dezelfde plek in de cel
  const H = HS.maten(ZAAD, SPEC);
  const V = H.vleugels[0];
  const [hx, hy] = V.wereld(-V.ha, -V.hq);
  const B0 = new K.Beeld(1, 1, BEELD.OX, BEELD.OY);
  const [ax, ay] = K.naarScherm(B0, hx, hy, 0);
  const anker = [Math.round(ax - cx0), Math.round(ay - cy0) + 16];
  // het vel: de zeven cellen naast elkaar
  const vel = new K.Plaat(cb * cellen.length, ch);
  cellen.forEach((c, i) => vel.plak(c, i * cb, 0));
  fs.writeFileSync(path.join(UIT, 'vel.png'), K.png(vel, 1, null));
  const data = {
    uitleg:
      'Een vakwerkhuis met riet in aanbouw (bouwfasen-sdf.cjs, huis-sdf.cjs zaad ' + ZAAD + '): zeven cellen van dezelfde maat, de laatste is het afgewerkte huis. ' +
      'anker is het punt in elke cel dat op T.naarScherm(x, y) van de achterste tegel komt (de achterste voethoek, een halve tegel boven het midden van die tegel), zoals tegels.json. ' +
      'beslaat is de voet van de muren in tegels; de bouwplaats (grond, stapels, steiger) steekt daar buiten.',
    bestand: 'vel.png',
    breedte: vel.b,
    hoogte: vel.h,
    beslaat: [SPEC.b, SPEC.d],
    anker,
    cellen: cellen.map((c, i) => ({ x: i * cb, y: 0, b: cb, h: ch, naam: FASEN[i] })),
  };
  fs.writeFileSync(path.join(UIT, 'vel.json'), JSON.stringify(data, null, 1) + '\n');
  // de proefplaat: alles op gras, op ware grootte
  const onder = gras(cb, ch, BEELD.OX - cx0, BEELD.OY - cy0);
  const STROOK = 22;
  const proef = new K.Plaat(cb * cellen.length, ch + STROOK);
  cellen.forEach((c, i) => {
    proef.plak(onder, i * cb, STROOK);
    proef.plak(c, i * cb, STROOK);
    schrijf(proef, `${i + 1} ${FASEN[i]}`, i * cb + 8, 5);
  });
  fs.writeFileSync(path.join(UIT, 'proef.png'), K.png(proef, 1, '#0e0a14'));
  // drie fases twee keer vergroot: het gebint, het riet en het leem
  const kies = [3, 5, 6];
  const x2 = new K.Plaat(cb * 2 * kies.length, ch * 2 + STROOK);
  kies.forEach((n, i) => {
    const c = new K.Plaat(cb, ch);
    c.plak(onder, 0, 0);
    c.plak(cellen[n - 1], 0, 0);
    x2.plak(vergroot(c, 2), i * cb * 2, STROOK);
    schrijf(x2, `${n} ${FASEN[n - 1]} x2`, i * cb * 2 + 8, 5);
  });
  fs.writeFileSync(path.join(UIT, 'proef-x2.png'), K.png(x2, 1, '#0e0a14'));
  console.log(`cel ${cb}×${ch}, anker ${anker.join(', ')}; vel ${vel.b}×${vel.h}; ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  console.log(`  ${path.relative(process.cwd(), UIT)}/: vel.png, vel.json, proef.png, proef-x2.png`);
}

// een klein lettertype voor de opschriften (5 × 7)
const LETTERS = {
  a: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  b: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  d: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  e: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  f: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  g: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
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
  x: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
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
  const wat = process.argv[2];
  if (wat === 'fase') {
    // één fase, om te kijken: schrijft uit/bouwfasen-sdf/fase-<n>.png (en -x2)
    fs.mkdirSync(UIT, { recursive: true });
    const n = Number(process.argv[3] || 1);
    const r = render(n);
    const k = kaderVan([r.p]);
    const c = r.p.uitsnede(k.x0 - 2, k.y0 - 2, k.x1 - k.x0 + 5, k.y1 - k.y0 + 5);
    fs.writeFileSync(path.join(UIT, `fase-${n}.png`), K.png(c, 1, '#0e0a14'));
    console.log(`fase ${n} ${FASEN[n - 1]}: ${(r.ms / 1000).toFixed(1)} s, ${c.b}×${c.h}`);
  } else alles();
}

module.exports = { fase, FASEN, ZAAD, SPEC };
