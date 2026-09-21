// De huizenbouwer uit afstandsfuncties (ontwerp/beeld.md, "Niets is waterpas" en "De huizenbouwer
// op ronde vormen"). Nog geen vervanging van huis(o) in dorp.cjs; dat is ronde 4.
//
// huis(o) in dorp.cjs bouwt uit dozen en vlakken, en een doos is per definitie recht. Hier is alles
// een afstandsveld, zoals de figuren en de toren, en het gaat door de tekenaar van toren.cjs
// (tekenWereld): die kan grote dingen aan en legt één zon over alles, dus het riet werpt zijn
// schaduw op de muur en de schoorsteen op het dak.
//
// Het begon als proefhuis (8 × 6 tegels, één laag, riet). huis(zaad, o) bouwt nu elke vorm:
//
//   vorm       'rechthoek', 'L' of 'T'. Een L of T heeft twee vleugels, elk met een eigen nok.
//              Waar hun daken elkaar raken ligt een kil, en daar loopt het riet door als één pak
//              (zie "Het dak").
//   b, d       de hoofdvleugel in tegels: b langs de nok, d dwars erop. Een L krijgt ook b2 (de
//              breedte van de zijvleugel), d2 (zijn lengte, over de hoofdvleugel heen gemeten),
//              kant (-1 of 1: aan welk eind) en voor (steekt hij naar de kijker toe of van hem
//              af); een T krijgt b2, p2 (hoever de dwarsvleugel uitsteekt), xT en voor.
//   lagen      1; 1.5 (een hogere muur met een zolderbalk, en een zolder in de kap); of 2 (een
//              bovenverdieping die op balkkoppen overkraagt, het vakwerkhuis bij uitstek).
//   nok        'x' of 'y': waar de nok van de hoofdvleugel heen loopt. 'y' spiegelt het hele
//              huis in de diagonaal (x en y wisselen). Spiegelen en niet draaien: zo komt het
//              licht nog steeds van linksboven.
//
// En drie knoppen, standaard alle drie aan:
//
//   scheef     Niets is waterpas. Een nok die in het midden doorzakt, een dakrand die golft,
//              muren die een fractie hellen en uitpuilen, balken van ongelijke dikte, ramen en
//              deur net niet recht of op gelijke hoogte, een leunende schoorsteen, een gelapt
//              stuk riet in een andere tint, een vleugel die niet precies haaks staat. Per zaad
//              anders, en vast.
//   pak        Het dak is een dik, bol pak riet dat over de muren zakt en rond omkrult aan de
//              rand, met lagen die je ziet liggen en een worst als nok. Zonder: twee platen.
//   speelgoed  Speelgoedverhoudingen en harder contrast: dikke balken, grote ramen, deur en
//              stenen, minder maar grotere details; donkere randen, diepe schaduw onder de
//              overstek, fel zonlicht op het riet.
//
// huis(zaad, { knoppen: { pak: false } }) zet er één uit, om te zien wat hij doet.
//
// Assen als in kern.cjs: +x rechtsonder in beeld, +y linksonder, z omhoog, in eenheden (een tegel
// is 45,25; één eenheid hoog is 0,866 pixel). De oorsprong is het midden van het plan. Hoogtes die
// "px" of h heten zijn schermpixels boven de grond.
//
// Elke vleugel heeft een eigen stelsel: a langs de nok, q dwars erop, en +a en +q wijzen allebei
// naar de kijker toe (naar +x of +y). Zo zijn de muur aan de +q-kant (de lange muur onder de goot)
// en de muur aan de +a-kant (de kopgevel) altijd de muren die je ziet, hoe de vleugel ook ligt, en
// hoeft de rest van de bouwer niet te weten of hij gespiegeld is.
'use strict';
const K = require('./kern.cjs');
require('./dorp.cjs'); // meldt de veldsteen-ramp aan bij kern.cjs
const T = require('./toren.cjs');
const { TEGEL, PXH, RAMP, RAMP_LEN, hash, rnd, ruis2, klem, glad, sdf } = K;
const { Wereld, voeg } = T;
const { E, GRAAD, balk, steenOp, steenStap, houtTex } = T.hulp;
const SQ = Math.SQRT1_2;
// de dakhelling: bij 51° lopen de halmen op het scherm schoon 1:2; per zaad een paar graden anders
const HELLING = 51;

// ---------------------------------------------------------------- vormen

// afstand tot een rechthoek in 2D met halve maten hx, hy
function rechthoek(a, v, hx, hy) {
  const qa = Math.abs(a) - hx;
  const qv = Math.abs(v) - hy;
  return qa > 0 || qv > 0 ? Math.hypot(Math.max(qa, 0), Math.max(qv, 0)) : Math.max(qa, qv);
}
// een 2D-vorm (afstand d) als laag van n0 tot n1 langs de normaal
function laag(d, n, n0, n1) {
  const dn = Math.max(n0 - n, n - n1);
  return d > 0 || dn > 0 ? Math.hypot(Math.max(d, 0), Math.max(dn, 0)) : Math.max(d, dn);
}

// Gekopieerd uit toren.cjs (steenKleur wordt daar niet geëxporteerd): één steen op de zeven
// warm, van de rest één op de elf koel, zodat de muur gemengd oogt in plaats van egaal grijs.
function steenKleur(st) {
  if (st.pb < 1 || st.pr < 1) return null;
  if (st.id % 7 === 0) return 'bot';
  if (st.id % 11 === 0) return 'pet';
  return null;
}

// ---------------------------------------------------------------- het plan

// De rechthoeken van het plan, in tegels, met de hoofdvleugel langs x. Een vleugel heeft rt =
// [x0, y0, x1, y1], langs 'x' of 'y' (de richting van zijn nok) en eind = [bij het lage eind, bij
// het hoge eind], elk 'gevel' (een vrije kopgevel), 'hoek' (de hoek van een L: de twee nokken
// komen samen, buiten ligt een ronde schild en binnen een kil) of 'tak' (de voet van een T: die
// nok loopt tegen het dak van de hoofdvleugel aan, met een kil aan weerskanten).
function planVan(H, o) {
  const { rs, sch } = H;
  if (H.vorm === 'L') {
    const b = o.b ?? 10;
    const d = o.d ?? 6;
    const b2 = o.b2 ?? d;
    const d2 = o.d2 ?? 10;
    const kant = o.kant ?? -1;
    const voor = o.voor ?? true;
    const x0 = kant < 0 ? 0 : b - b2;
    // De zijvleugel is als doos alleen het stuk dat uitsteekt, met een kwart tegel overlap. Liep
    // hij door tot de achtergevel, dan lag zijn buitenmuur in het vlak van de kopmuur van de
    // hoofdvleugel, en hield geen van beide daar vakwerk over. Zijn dak loopt wel door tot de knoop.
    const e = 0.25;
    return {
      vleugels: [
        { rt: [0, 0, b, d], langs: 'x', eind: kant < 0 ? ['hoek', 'gevel'] : ['gevel', 'hoek'] },
        voor
          ? { rt: [x0, d - e, x0 + b2, d2], langs: 'y', eind: ['hoek', 'gevel'] }
          : { rt: [x0, d - d2, x0 + b2, e], langs: 'y', eind: ['gevel', 'hoek'] },
      ],
      knoop: { soort: 'hoek', c: [x0 + b2 / 2, d / 2] },
    };
  }
  if (H.vorm === 'T') {
    const b = o.b ?? 11;
    const d = o.d ?? 6;
    const b2 = o.b2 ?? 5;
    const p2 = o.p2 ?? 4;
    const voor = o.voor ?? true;
    const xT = o.xT ?? b / 2 + Math.round(sch * rs(94) * 2) / 2;
    return {
      vleugels: [
        { rt: [0, 0, b, d], langs: 'x', eind: ['gevel', 'gevel'] },
        voor
          ? { rt: [xT - b2 / 2, d / 2, xT + b2 / 2, d + p2], langs: 'y', eind: ['tak', 'gevel'] }
          : { rt: [xT - b2 / 2, -p2, xT + b2 / 2, d / 2], langs: 'y', eind: ['gevel', 'tak'] },
      ],
      knoop: { soort: 'tak', c: [xT, d / 2] },
    };
  }
  const b = o.b ?? 8;
  const d = o.d ?? 6;
  return { vleugels: [{ rt: [0, 0, b, d], langs: 'x', eind: ['gevel', 'gevel'] }], knoop: null };
}

// Van plan naar wereld: het midden van het plan op de oorsprong, gespiegeld als de nok langs y
// loopt, en de tweede vleugel een graad of twee uit het haakse gedraaid om het punt waar de
// nokken elkaar raken.
function vleugelsVan(H, P) {
  const spiegel = H.nok === 'y';
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const v of P.vleugels) {
    x0 = Math.min(x0, v.rt[0]);
    y0 = Math.min(y0, v.rt[1]);
    x1 = Math.max(x1, v.rt[2]);
    y1 = Math.max(y1, v.rt[3]);
  }
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const naarW = (px, py) => {
    const X = (px - mx) * TEGEL;
    const Y = (py - my) * TEGEL;
    return spiegel ? [Y, X] : [X, Y];
  };
  const kn = P.knoop ? naarW(...P.knoop.c) : null;
  const Vs = P.vleugels.map((v, i) => {
    const [a0, b0, a1, b1] = v.rt;
    const lx = v.langs === 'x';
    let A = lx ? [1, 0] : [0, 1];
    let Q = lx ? [0, 1] : [1, 0];
    if (spiegel) {
      A = [A[1], A[0]];
      Q = [Q[1], Q[0]];
    }
    let [cx, cy] = naarW((a0 + a1) / 2, (b0 + b1) / 2);
    let rot = 0;
    if (i > 0 && kn) {
      rot = H.sch * (1 + 1.5 * H.r(96 + i)) * (H.r(98 + i) < 0.5 ? -1 : 1) * GRAAD;
      const c = Math.cos(rot);
      const s = Math.sin(rot);
      const draai = ([x, y]) => [x * c - y * s, x * s + y * c];
      A = draai(A);
      Q = draai(Q);
      const [dx, dy] = draai([cx - kn[0], cy - kn[1]]);
      cx = kn[0] + dx;
      cy = kn[1] + dy;
    }
    const V = {
      i,
      cx,
      cy,
      rot,
      ha: ((lx ? a1 - a0 : b1 - b0) / 2) * TEGEL,
      hq: ((lx ? b1 - b0 : a1 - a0) / 2) * TEGEL,
      Ax: A[0],
      Ay: A[1],
      Qx: Q[0],
      Qy: Q[1],
      eind: v.eind,
    };
    V.lok = (x, y) => {
      const dx = x - V.cx;
      const dy = y - V.cy;
      return [dx * V.Ax + dy * V.Ay, dx * V.Qx + dy * V.Qy];
    };
    V.wereld = (a, q) => [V.cx + a * V.Ax + q * V.Qx, V.cy + a * V.Ay + q * V.Qy];
    // het hele huis helt dezelfde kant op; per vleugel in zijn eigen stelsel
    V.hellA = H.hellX * V.Ax + H.hellY * V.Ay;
    V.hellQ = H.hellX * V.Qx + H.hellY * V.Qy;
    return V;
  });
  let J = null;
  if (kn) {
    const [VA, VB] = Vs;
    J = { soort: P.knoop.soort, x: kn[0], y: kn[1] };
    J.aA = VA.lok(kn[0], kn[1])[0];
    J.aB = VB.lok(kn[0], kn[1])[0];
    // de kant op waar de arm van een vleugel vanaf de knoop loopt
    J.sA = VA.eind[0] === 'hoek' ? 1 : VA.eind[1] === 'hoek' ? -1 : 0;
    J.sB = VB.eind[0] === 'gevel' ? -1 : 1;
    VA.cJ = J.aA;
    VB.cJ = J.aB;
  }
  return { Vs, J };
}

// ---------------------------------------------------------------- de maten per zaad

function maten(zaad = 1, o = {}) {
  const kn = { scheef: true, pak: true, speelgoed: true, ...(o.knoppen || {}) };
  const r = (k) => rnd(zaad * 7919 + 101, k);
  const rs = (k) => r(k) * 2 - 1;
  const sch = kn.scheef ? 1 : 0;
  const sp = kn.speelgoed;
  const pak = kn.pak;
  const H = { zaad, kn, r, rs, sch, sp, pak };
  H.vorm = o.vorm || 'rechthoek';
  H.lagen = o.lagen ?? 1;
  H.nok = o.nok || 'x';

  // --- de hoogtes, in px. voetPx is de voet van het riet (de middellijn van het pak); de rand
  // ervan hangt vóór de muur tot zo'n 36 px lager, en daar ligt de bovenregel.
  const voetPx = H.lagen === 2 ? 306 : H.lagen === 1.5 ? 222 : 166;
  H.voetPx = voetPx;
  H.voetZ = E(voetPx);
  H.muurH = voetPx + 10; // de bovenkant van de muur, verstopt in het riet
  H.zM = E(H.muurH);
  H.plaatH = voetPx - 36; // de bovenregel van een lange muur
  H.trekH = voetPx - 16; // de trekbalk in de gevel
  H.zolderH = H.lagen === 1.5 ? 136 + Math.round(sch * rs(90) * 3) : 0; // de zolderbalk
  H.h1 = H.lagen === 2 ? 144 + Math.round(sch * rs(91) * 2) : 0; // de vloer van de bovenverdieping
  H.kraag = H.lagen === 2 ? (sp ? 12 : 8) + 4 * r(92) : 0; // hoever die overkraagt, in eenheden

  // --- muren: ze hellen een fractie en puilen in het midden wat uit
  H.hellY = sch * (0.016 + 0.014 * r(2)) * (r(3) < 0.7 ? 1 : -1);
  H.hellX = sch * (0.013 + 0.013 * r(4)) * (r(5) < 0.5 ? 1 : -1);
  // steen onder, hout boven; de lijn ertussen ligt niet waterpas
  H.hS = 60 + Math.round(sch * rs(8) * 8);
  H.gSx = (sch * rs(9) * 6) / 181;
  H.gSy = (sch * rs(10) * 4) / 136;
  // het hout: warm eiken of grijs verweerd
  H.hout = sch && r(35) < 0.34 ? 'schors' : 'hout';

  // --- het dak
  H.dik = pak ? 15 : 12; // halve dikte van het pak
  H.hoekig = !pak; // zonder pak: platen met scherpe randen
  H.voetDik = pak ? 0.22 : 0; // de voet is een dikke rol
  H.bol = pak ? 6 : 0; // het schild puilt halverwege uit
  H.ov = 22; // overstek aan de goot
  H.ovg = pak ? 20 : 12; // overstek aan de gevel
  H.kopR = pak ? 8 : 1;
  H.helling = (HELLING + sch * rs(34) * 3) * GRAAD;
  H.sinRef = Math.sin(H.helling);
  H.laagL = sp ? 30 : 20;
  H.laagH = pak ? 1.6 : 0;
  H.worstR = pak ? 18 : 0;
  // de kil en de schild: hoe rond (in eenheden dwars op het dak), en tot hoe ver van de knoop dat
  // afneemt (bij de knoop zelf lopen de nokken in elkaar en moet het scherp blijven)
  H.kilK = pak ? 26 : 8;
  H.heupK = pak ? 24 : 6;
  H.kilR = 70;

  // --- plan en vleugels
  const P = planVan(H, o);
  const { Vs, J } = vleugelsVan(H, P);
  H.vleugels = Vs;
  H.knoop = J;
  for (const V of Vs) dakVleugel(H, V);
  const [VA, VB] = Vs;
  const tanA = Math.tan(H.helling);
  VA.zN = H.voetZ + VA.Qe0 * tanA;
  if (VB) {
    // Bij een L komen de nokken in één punt samen, dus even hoog; een smallere zijvleugel wordt
    // daarvoor steiler. Bij een T mag de dwarsvleugel lager liggen als hij smaller is.
    const gelijk = J.soort === 'hoek' || Math.abs(VB.Qe0 - VA.Qe0) < 8;
    VB.zN = gelijk ? VA.zN : H.voetZ + VB.Qe0 * tanA;
    VA.dempJ = J.aA;
    VA.dempQ = VB.Qe0;
    VB.dempJ = J.aB;
    VB.dempQ = VA.Qe0;
    // De nok van de tweede vleugel volgt die van de eerste waar ze samenkomen: even hoog, of bij een
    // lagere dwarsvleugel even ver eronder. Anders blijft hij bij een doorgezakte hoofdnok boven
    // het dak uitsteken.
    const delta = VA.nokZ(J.aA) - (VA.zN - VB.zN) - VB.nokZ(J.aB);
    const lang = Math.abs(VB.r1 - VB.r0) || 1;
    VB.nokCorr = (a) => delta * klem(1 - Math.abs(a - J.aB) / lang, 0, 1);
  }
  H.zNmax = Math.max(...Vs.map((V) => V.zN));
  H.zTop = H.zNmax + 30;
  // de verdiepingen als dozen: bij twee lagen een bredere doos bovenop
  H.verd =
    H.lagen === 2
      ? [
          { uit: 0, z0: -3, z1: E(H.h1) },
          { uit: H.kraag, z0: E(H.h1), z1: H.zTop },
        ]
      : [{ uit: 0, z0: -3, z1: H.zTop }];
  // onder deze hoogte raakt de onderkant van het riet de muren nergens
  H.zOnderMin = H.voetZ - E(14) - 40;
  // de kopgevels die het riet afsnijden
  H.gevels = [];
  for (const V of Vs) {
    if (V.eind[0] === 'gevel') H.gevels.push({ V, e: -1 });
    if (V.eind[1] === 'gevel') H.gevels.push({ V, e: 1 });
  }

  // --- een gelapt stuk, vers of juist ouder dan de rest, op het voorste schild van de hoofdvleugel
  if (sch) {
    const zone = langste(vrijeZones(H, VA));
    const k0 = 2 + Math.floor(r(22) * 4);
    H.lap = {
      V: VA,
      a: (zone[0] + zone[1]) / 2 + rs(21) * (zone[1] - zone[0]) * 0.25,
      k0,
      k1: k0 + 1 + Math.floor(r(23) * 2),
      hw: 30 + 16 * r(24),
      vers: r(25) < 0.55,
    };
  } else H.lap = null;

  // --- de schoorsteen: op het voorste schild van de hoofdvleugel vlak onder de nok, en hij leunt
  {
    const zones = vrijeZones(H, VA);
    const zone = zones[Math.floor(r(26) * zones.length)] || [-VA.ha * 0.5, VA.ha * 0.5];
    const a = zone[0] + (zone[1] - zone[0]) * (0.2 + 0.6 * r(27));
    H.schoorsteen = {
      V: VA,
      a,
      q: 16 + 14 * r(28),
      s: sp ? 11 : 8,
      la: sch * (0.05 + 0.05 * r(29)) * (r(30) < 0.5 ? -1 : 1),
      lq: sch * (0.03 + 0.04 * r(31)) * (r(32) < 0.5 ? -1 : 1),
      hoog: E(36 + 14 * r(33)),
    };
  }

  // --- de muren die je ziet, in stukken, en wat erin zit
  H.stukken = maakStukken(H);
  H.openingen = [];
  zichtVanStukken(H);
  verdeel(H);
  // een schoor tegen een kopgevel, bij een oud huis
  const gevels = H.stukken.filter((S) => S.zijde === 'a' && S.s === 0 && S.Lu > 120 && S.zicht > 0.5);
  const schoorH = Math.min(118 + 20 * r(71), H.lagen === 2 ? H.h1 - 26 : 140);
  H.schoor = sch && gevels.length && r(68) < 0.5 ? { P: gevels[Math.floor(r(67) * gevels.length)], f: 0.72 + 0.12 * r(69), uit: 44 + 16 * r(70), h: schoorH } : null;
  return H;
}

// De stukken langs de nok van vleugel V waar het dak gewoon dak is: niet bij de kil of de schild,
// niet bij de gevel. Voor de schoorsteen en de lap.
function vrijeZones(H, V) {
  const lo = -V.ha + 30;
  const hi = V.ha - 30;
  if (V.cJ === undefined) return [[lo, hi]];
  const W = H.vleugels.find((X) => X !== V);
  const m = W.Qe0 + 40;
  const zones = [];
  if (V.cJ - m > lo + 20) zones.push([lo, Math.min(hi, V.cJ - m)]);
  if (V.cJ + m < hi - 20) zones.push([Math.max(lo, V.cJ + m), hi]);
  return zones.length ? zones : [[lo, hi]];
}
const langste = (zones) => zones.reduce((a, b) => (b[1] - b[0] > a[1] - a[0] ? b : a));

// Het dak van één vleugel: waar de nok ligt en hoe hij doorzakt, waar de voet ligt en hoe die golft.
function dakVleugel(H, V) {
  const { sch } = H;
  const R = (k) => H.r(300 + 100 * V.i + k);
  const RS = (k) => R(k) * 2 - 1;
  V.qW = V.hq + H.kraag; // de muur waar het dak op rust
  V.aW = V.ha + H.kraag;
  V.Qe0 = V.qW + H.ov; // van de nok tot de voet
  V.XR = V.aW + H.ovg; // van het midden tot de kop
  // de nok loopt van gevel tot gevel, of tot de knoop
  V.r0 = V.eind[0] === 'gevel' ? -V.XR : V.cJ;
  V.r1 = V.eind[1] === 'gevel' ? V.XR : V.cJ;
  V.mid = (V.r0 + V.r1) / 2;
  V.half = (V.r1 - V.r0) / 2;
  // de nok zakt in het midden door, tien tot zestien pixels (naar de lengte)
  const zak = sch * E(10 + 6 * R(11)) * klem(V.half / 201, 0.6, 1.3);
  const nokF = R(12) * 6.3;
  const nokScheef = sch * RS(36) * E(5); // en de ene kant hangt lager dan de andere
  V.nokZ = (a) => {
    const u = klem((a - V.mid) / V.half, -1, 1);
    let z = V.zN - zak * (1 - u * u) + nokScheef * u + sch * E(1.3) * Math.sin(a * 0.034 + nokF);
    if (V.nokCorr) z += V.nokCorr(a);
    return z;
  };
  // de dakrand golft (drie à vier pixels) en de hoeken aan een gevel hangen wat. Bij de knoop
  // dempen de golven uit, zodat de twee voeten in de binnenhoek even hoog samenkomen.
  const golfA = sch * E(2.8 + 1.6 * R(13));
  const golfK = 0.021 + 0.012 * R(14);
  const golfF = R(15) * 6.3;
  const golfF2 = R(17) * 6.3;
  const hoekZak = sch * E(2.5 + 3 * R(16));
  const uitF = R(18) * 6.3;
  V.demp = (a) => (V.dempJ === undefined ? 1 : glad(V.dempQ + 10, V.dempQ + 80, Math.abs(a - V.dempJ)));
  V.voetZ = (a) => {
    const u = klem((a - V.mid) / V.half, -1, 1);
    let z = H.voetZ + V.demp(a) * (golfA * Math.sin(a * golfK + golfF) + sch * E(1.3) * Math.sin(a * 0.09 + golfF2));
    if ((u < 0 && V.eind[0] === 'gevel') || (u > 0 && V.eind[1] === 'gevel')) z -= hoekZak * u ** 4;
    return z;
  };
  V.voetQ = (a) => V.Qe0 + V.demp(a) * sch * 3.2 * Math.sin(a * 0.019 + uitF);
  // lagen riet: een zaagtand van de voet naar de nok, die niet recht loopt
  const lgF1 = R(19) * 6.3;
  const lgF2 = R(20) * 6.3;
  V.laagGolf = (a) => sch * (1.6 * Math.sin(a * 0.043 + lgF1) + 0.9 * Math.sin(a * 0.12 + lgF2));
  // de muren puilen uit
  V.bolQ = sch * (1.8 + 1.6 * R(6));
  V.bolA = sch * (1.4 + 1.3 * R(7));
  V.wF = R(81) * 6.3;
}

// de bovenkant van de steen, in px, als een schuin vlak over het hele huis
const steenLijn = (H, x, y) => H.hS + H.gSx * x - H.gSy * y;

// de muren puilen in het midden uit (as, qs: al terug van de helling)
const bolQ = (H, V, as, z) => V.bolQ * Math.max(0, 1 - (as / V.ha) ** 2) * Math.sin(Math.PI * klem(z / H.zM, 0, 1));
const bolA = (H, V, qs, z) => V.bolA * Math.max(0, 1 - (qs / V.hq) ** 2) * Math.sin(Math.PI * klem(z / V.zN, 0, 1));

// ---------------------------------------------------------------- de muren in stukken

// Welk deel [t0, t1] van het lijnstuk P0-P1 ligt binnen de doos van vleugel W (verdieping S)?
function knip(W, S, P0, P1, marge) {
  const [a0, q0] = W.lok(P0[0], P0[1]);
  const [a1, q1] = W.lok(P1[0], P1[1]);
  const ha = W.ha + S.uit + marge;
  const hq = W.hq + S.uit + marge;
  const da = a1 - a0;
  const dq = q1 - q0;
  let t0 = 0;
  let t1 = 1;
  for (const [p, q] of [
    [-da, a0 + ha],
    [da, ha - a0],
    [-dq, q0 + hq],
    [dq, hq - q0],
  ]) {
    if (Math.abs(p) < 1e-9) {
      if (q < 0) return null;
      continue;
    }
    const t = q / p;
    if (p < 0) {
      if (t > t1) return null;
      if (t > t0) t0 = t;
    } else {
      if (t < t0) return null;
      if (t < t1) t1 = t;
    }
  }
  return t1 > t0 ? [t0, t1] : null;
}
function aftrekken(vrij, [g0, g1]) {
  const uit = [];
  for (const [a, b] of vrij) {
    if (g1 <= a || g0 >= b) uit.push([a, b]);
    else {
      if (g0 > a) uit.push([a, g0]);
      if (g1 < b) uit.push([g1, b]);
    }
  }
  return uit;
}

// Een stuk muur dat je ziet: de +q-kant (zijde 'q', de lange muur) of de +a-kant bij een vrije
// gevel (zijde 'a') van vleugel V, op verdieping s, voor zover geen andere vleugel ervoor staat.
// u loopt in beeld van links naar rechts, in pixels, van 0 tot Lu. pos(u, h, uit) geeft het punt
// op de muur (met helling en uitpuilen), lokAN(x, y, z) omgekeerd [eenheden langs vanaf links,
// eenheden uit de muur]. links/rechts: 'hoek' als de muur daar de hoek om gaat, 'binnen' als hij
// tegen een andere vleugel loopt.
function stuk(H, V, zijde, s, S, mLo, mHi, loBinnen, hiBinnen) {
  const dirU = (zijde === 'q' ? Math.sign(V.Ax - V.Ay) : Math.sign(V.Qx - V.Qy)) || 1;
  const l0 = dirU > 0 ? mLo : mHi;
  const len = mHi - mLo;
  const wand = zijde === 'q' ? V.hq + S.uit : V.ha + S.uit;
  const bol = zijde === 'q' ? (m, z) => bolQ(H, V, m, z) : (m, z) => bolA(H, V, m, z);
  const P = {
    V,
    zijde,
    s,
    S,
    dirU,
    l0,
    len,
    wand,
    Lu: len * SQ,
    links: (dirU > 0 ? loBinnen : hiBinnen) ? 'binnen' : 'hoek',
    rechts: (dirU > 0 ? hiBinnen : loBinnen) ? 'binnen' : 'hoek',
    // een kopmuur is een gevel als het dak erboven ophoudt; bij de hoek van een L loopt het
    // dak eroverheen door en is het een muur onder de goot, zoals een lange muur
    gevel: zijde === 'a' && V.eind[1] === 'gevel',
    N: zijde === 'q' ? [V.Qx, V.Qy] : [V.Ax, V.Ay],
    openingen: [],
  };
  // de coördinaat langs de muur (a of q van de vleugel) bij u
  P.langs = (u) => l0 + (dirU * u) / SQ;
  P.pos = (u, h, uit = 0) => {
    const z = h / PXH;
    const m = P.langs(u);
    const w = wand + bol(m, z) + uit;
    const a = zijde === 'q' ? m : w;
    const q = zijde === 'q' ? w : m;
    const [x, y] = V.wereld(a + V.hellA * z, q + V.hellQ * z);
    return [x, y, z];
  };
  P.lokAN = (x, y, z) => {
    const [a, q] = V.lok(x, y);
    const as = a - V.hellA * z;
    const qs = q - V.hellQ * z;
    const m = zijde === 'q' ? as : qs;
    const w = zijde === 'q' ? qs : as;
    return [(m - l0) * dirU, w - wand - bol(m, z)];
  };
  // de hoek bij een eind van het stuk: tekens (sa, sq) in het stelsel van de vleugel
  P.hoekTekens = (eind) => {
    const m = eind === 'links' ? l0 : l0 + dirU * len;
    return zijde === 'q' ? [Math.sign(m), 1] : [1, Math.sign(m)];
  };
  return P;
}

function maakStukken(H) {
  const uit = [];
  H.verd.forEach((S, s) => {
    for (const V of H.vleugels) {
      for (const zijde of ['q', 'a']) {
        // de voet van een T zit altijd in de hoofdvleugel; de kop bij de hoek van een L kan een
        // gewone muur onder de goot zijn
        if (zijde === 'a' && V.eind[1] === 'tak') continue;
        const ha = V.ha + S.uit;
        const hq = V.hq + S.uit;
        const [m0, m1] = zijde === 'q' ? [-ha, ha] : [-hq, hq];
        const punt = (m) => (zijde === 'q' ? V.wereld(m, hq) : V.wereld(ha, m));
        const P0 = punt(m0);
        const P1 = punt(m1);
        let vrij = [[0, 1]];
        for (const W of H.vleugels) {
          if (W === V) continue;
          const g = knip(W, S, P0, P1, 1.5);
          if (g) vrij = aftrekken(vrij, g);
        }
        for (const [t0, t1] of vrij) {
          if ((t1 - t0) * (m1 - m0) * SQ < 24) continue;
          uit.push(stuk(H, V, zijde, s, S, m0 + t0 * (m1 - m0), m0 + t1 * (m1 - m0), t0 > 1e-4, t1 < 1 - 1e-4));
        }
      }
    }
  });
  return uit;
}

// Ziet de camera punt (x, y, z)? Een straal naar de kijker toe, langs de muren en het dak.
function zichtbaar(H, dak, x, y, z) {
  const vx = -K.V[0];
  const vy = -K.V[1];
  const vz = -K.V[2];
  let t = 0;
  for (let i = 0; i < 120 && t < 1200; i++) {
    const px = x + vx * t;
    const py = y + vy * t;
    const pz = z + vz * t;
    if (pz > H.zTop + 30) return true;
    let d = Infinity;
    for (const V of H.vleugels) {
      const [a, q] = V.lok(px, py);
      const as = a - V.hellA * pz;
      const qs = q - V.hellQ * pz;
      for (const S of H.verd) {
        const hz = (S.z1 - S.z0) / 2;
        d = Math.min(d, sdf.doos(as, qs, pz - (S.z0 + hz), V.ha + S.uit, V.hq + S.uit, hz));
      }
    }
    d = Math.min(Math.max(d, onderDak(H, px, py, pz)), dak(px, py, pz));
    if (d < 0.4) return false;
    t += Math.max(d * 0.9, 0.8);
  }
  return true;
}

// Hoeveel van elk stuk muur de camera ziet (0 tot 1): een ander stuk van het huis kan ervoor
// staan, zoals de dwarsvleugel van een T voor de voorgevel van de hoofdvleugel. Een stuk dat je
// niet ziet krijgt geen deur, geen ramen en geen vakwerk.
function zichtVanStukken(H) {
  const dak = dakVeld(H);
  for (const P of H.stukken) {
    const bovenst = P.s === H.verd.length - 1;
    const top = !bovenst ? H.h1 - 24 : P.gevel ? H.trekH : H.plaatH - 10;
    const lo = P.s === 0 ? 30 : H.h1 + 20;
    let n = 0;
    let ja = 0;
    P.zichtU = [];
    for (let i = 0; i < 9; i++) {
      const u = 6 + ((P.Lu - 12) * i) / 8;
      let zie = 0;
      for (const h of [lo, (lo + top) / 2, top]) {
        const [x, y, z] = P.pos(u, h, 3);
        n++;
        if (zichtbaar(H, dak, x, y, z)) {
          ja++;
          zie++;
        }
      }
      P.zichtU.push([u, zie / 3]);
    }
    P.zicht = ja / n;
  }
}

// De lagen vakwerk op een stuk muur: van onder naar boven, elk met een onderregel, stijlen en
// een bovenregel. lo 'steen' is de steenlijn; boven 'plaat' (de bovenregel onder de goot), 'trek'
// (de trekbalk in een gevel, met de top erboven) of 'regel' (een balk tussen twee lagen).
function registers(H, P) {
  const top = P.gevel ? H.trekH : H.plaatH;
  const bovenst = P.gevel ? 'trek' : 'plaat';
  if (H.lagen === 1.5) {
    return [
      { i: 0, lo: 'steen', hi: H.zolderH, boven: 'regel' },
      { i: 1, lo: H.zolderH, hi: top, boven: bovenst },
    ];
  }
  if (H.lagen === 2) {
    if (P.s === 0) return [{ i: 0, lo: 'steen', hi: H.h1 - 16, boven: 'regel' }];
    return [{ i: 1, lo: H.h1, hi: top, boven: bovenst }];
  }
  return [{ i: 0, lo: 'steen', hi: top, boven: bovenst }];
}

const steenLijnStuk = (H, P, u) => {
  const [x, y] = P.pos(u, 0, 0);
  return steenLijn(H, x, y);
};

// De hoogte (px) van de middellijn van het riet boven een punt van een gevel.
function nokHpx(H, P, u) {
  const [x, y] = P.pos(u, 0, 0);
  const D = plekV(H, P.V, x, y, 0);
  return (D.z0 + (D.uz / D.ux) * Math.abs(D.q)) * PXH;
}

// ---------------------------------------------------------------- deuren en ramen

// Een opening in een stuk muur: een deur of raam, gedraaid in het vlak van de muur. lok geeft
// (a langs de muur, v omhoog, n uit de muur) in eenheden, gedraaid met de opening mee.
function opening(P, u, h0, b, h, hoek, diep, binnen) {
  const hb = b / 2 / SQ;
  const hh = h / 2 / PXH;
  const zc = (h0 + h / 2) / PXH;
  const co = Math.cos(hoek);
  const si = Math.sin(hoek);
  const uc = u / SQ;
  const lok = (x, y, z) => {
    const [al, n] = P.lokAN(x, y, z);
    const a0 = al - uc;
    const v0 = z - zc;
    return [a0 * co + v0 * si, -a0 * si + v0 * co, n];
  };
  const m = P.pos(u, h0 + h / 2, 0);
  return { P, u, h0, b, h, hb, hh, zc, hoek, diep, binnen, lok, m, r2: (Math.hypot(hb, hh) + diep + 18) ** 2 };
}

// Zet de deur en de ramen op de stukken muur. De deur komt op het langste stuk begane grond (een
// lange muur telt zwaarder); ramen vullen wat er over is, met ruimte voor stijlen en schoren.
function verdeel(H) {
  const { sp, sch, r, rs } = H;
  let k = 2000;
  const RS = () => rs(k++);
  const R = () => r(k++);
  const raamB = sp ? 36 : 24;
  const raamH = sp ? 42 : 30;
  const deurB = sp ? 50 : 42;
  const deurH = sp ? 102 : 94;
  const jamb = sp ? 12 : 7;

  let deurStuk = null;
  let beste = -1;
  for (const P of H.stukken) {
    if (P.s !== 0 || P.Lu < 120 || P.zicht < 0.6) continue;
    const w = P.Lu * P.zicht * (P.zijde === 'q' ? 1.6 : 1) * (P.V.i === 0 ? 1.15 : 1);
    if (w > beste) {
      beste = w;
      deurStuk = P;
    }
  }

  const raam = (P, reg, u, h0, b, h, warm, extra = {}) => {
    const w = { P, reg, u, h0, b: b + (sch ? Math.round(RS() * 2) : 0), h: h + (sch ? Math.round(RS() * 3) : 0), hoek: sch * RS() * 2 * GRAAD, warm, ...extra };
    w.op = opening(P, w.u, w.h0, w.b, w.h, w.hoek, sp ? 7 : 5, warm ? 'glasWarm' : 'glas');
    Object.assign(w.op, { reg, raam: w });
    P.openingen.push(w.op);
    H.openingen.push(w.op);
    return w;
  };
  // ramen in de vrije stroken van een laag: zo veel als er ruim passen
  const vul = (P, reg, zones, b, maak) => {
    for (const [z0, z1] of zones) {
      const breed = z1 - z0;
      let n = Math.floor((breed + 40) / (b + 80));
      if (!n && breed >= b + 10) n = 1;
      for (let i = 0; i < n; i++) {
        const stap = breed / n;
        const u = z0 + stap * (i + 0.5) + sch * RS() * Math.min(10, (stap - b) / 3);
        maak(u);
      }
    }
  };
  const vrij = (P, bezet, mL, mR) => {
    let zones = [[P.links === 'binnen' ? 26 : mL, P.Lu - (P.rechts === 'binnen' ? 26 : mR)]];
    for (const [a, b] of bezet) zones = aftrekken(zones, [a, b]);
    return zones.filter(([a, b]) => b > a);
  };

  for (const P of H.stukken) {
    if (!P.zicht) continue;
    const regs = registers(H, P);
    for (const reg of regs) {
      const bezet = [];
      if (reg.lo === 'steen') {
        // de begane grond: eerst de deur
        if (P === deurStuk) {
          const lo = 30 + deurB / 2 + jamb;
          const hi = P.Lu - 30 - deurB / 2 - jamb;
          const u = Math.round(klem(P.Lu * (0.4 + 0.2 * R()), lo, Math.max(lo, hi)));
          const d = { P, u, b: deurB, h: deurH, hoek: sch * RS() * 1.1 * GRAAD, blad: sch * RS() * 2.4 * GRAAD };
          d.op = opening(P, u, 0, d.b, d.h, d.hoek, 7, 'donker');
          Object.assign(d.op, { reg: reg.i, deur: d });
          P.openingen.push(d.op);
          H.openingen.push(d.op);
          H.deur = d;
          bezet.push([u - deurB / 2 - 26, u + deurB / 2 + 26]);
        }
        const warm = P.gevel ? 0.5 : 0.25;
        vul(P, reg.i, vrij(P, bezet, 16, 18), raamB, (u) => raam(P, reg.i, u, steenLijnStuk(H, P, u) + (sp ? 14 : 10) + sch * RS() * 3.5, raamB - (P.gevel ? 2 : 0), raamH - (P.gevel ? 2 : 0), R() < warm));
      } else if (H.lagen === 1.5) {
        if (P.gevel) {
          // de zolder, in de gevel
          vul(P, reg.i, vrij(P, [], 26, 26), raamB - 4, (u) => raam(P, reg.i, u, reg.lo + 14 + sch * RS() * 3, raamB - 4, raamH - 8, R() < 0.45));
        } else if (R() < 0.7) {
          // kleine raampjes in de knieschot, boven de ramen van beneden
          const b = sp ? 24 : 18;
          const h = sp ? 20 : 15;
          const beneden = P.openingen.filter((op) => op.reg === 0);
          for (const op of beneden) {
            if (op.u - b / 2 < 24 || op.u + b / 2 > P.Lu - 24) continue;
            raam(P, reg.i, op.u + sch * RS() * 5, reg.lo + 11 + sch * RS() * 2, b, h, R() < 0.3);
          }
        }
      } else if (H.lagen === 2) {
        // de bovenverdieping: boven de ramen en de deur van beneden, of verdeeld als die er niet zijn
        const beneden = H.stukken.find((Q) => Q.s === 0 && Q.V === P.V && Q.zijde === P.zijde && Q.l0 * Q.dirU <= P.langs(P.Lu / 2) * Q.dirU && P.langs(P.Lu / 2) * Q.dirU <= (Q.l0 + Q.dirU * Q.len) * Q.dirU);
        const ops = beneden ? beneden.openingen : [];
        const h0 = reg.lo + (sp ? 28 : 22);
        const geplaatst = [];
        if (ops.length && R() < 0.75) {
          for (const op of ops) {
            const u = (beneden.langs(op.u) - P.l0) * P.dirU * SQ + sch * RS() * 4;
            if (u - raamB / 2 < 26 || u + raamB / 2 > P.Lu - 26) continue;
            if (geplaatst.some((g) => Math.abs(g - u) < raamB + 30)) continue;
            geplaatst.push(u);
            raam(P, reg.i, u, h0 + sch * RS() * 3, raamB, raamH, R() < 0.35);
          }
        } else vul(P, reg.i, vrij(P, [], 22, 22), raamB, (u) => raam(P, reg.i, u, h0 + sch * RS() * 3, raamB, raamH, R() < 0.35));
      }
      // de top van een gevel: een raam onder de nok, als het past
      if (P.gevel && reg.boven === 'trek') {
        const b = raamB - 6;
        const h = raamH - 4;
        const u = -P.l0 * P.dirU * SQ + sch * RS() * 8; // onder de nok
        const h0 = H.trekH + (H.lagen === 1 ? 46 : 36) + sch * RS() * 4;
        const past = u - b / 2 > 20 && u + b / 2 < P.Lu - 20 && Math.min(nokHpx(H, P, u - b / 2 - 6), nokHpx(H, P, u + b / 2 + 6)) - 24 > h0 + h + 10;
        if (past) raam(P, reg.i, u, h0, b, h, R() < 0.4, { top: true });
      }
    }
  }
}

// ---------------------------------------------------------------- het dak
//
// Elke vleugel heeft een pak riet: een laag van een halve dikte `dik` rond een middellijn die in
// de doorsnede van de nok naar de voet loopt, met lagen erin, een bolling en een rol aan de voet.
// Zo'n pak is overal gegeven, ook buiten de vleugel (als een eindeloze plaat). Het dak van het
// hele huis is daar één pak van, geen stapel losse daken:
//
//   - In de binnenhoek van een L of aan weerskanten van de voet van een T is het dak de
//     vereniging van de twee platen: overal het hoogste. Waar ze elkaar snijden ligt de kil, en
//     een gladde vereniging (smin, straal kilK) maakt die rond: het riet loopt er doorheen, zoals
//     een rieten kil met een ronde goot. Ook de voet wordt één lijn die de hoek om gaat, want
//     "voorbij de voet" wordt met dezelfde weging gemengd: de rol van de ene vleugel houdt op waar
//     het dak van de andere hoger ligt, in plaats van erdoorheen te steken.
//   - In de buitenhoek van een L is het dak de doorsnede: overal het laagste. Dat is een schild,
//     en de gladde doorsnede maakt er een ronde hoek van, zoals riet om een hoek ligt.
//   - De voet van een T loopt tot de nok van de hoofdvleugel en duikt daarachter steil weg onder
//     diens achterschild.
//
// Bij het punt waar de nokken elkaar raken moet het scherp blijven (daar zouden de afrondingen
// het dak optillen), dus nemen kilK en heupK daar af tot nul.

// Plek op het dak van één vleugel: de middellijn loopt in het vlak (|q|, z) van de nok (0, nokZ)
// naar de voet (voetQ, voetZ). langs: afstand vanaf de nok langs de helling, dw: boven de
// middellijn, t: 0 bij de nok, 1 bij de voet, sE: afstand vanaf de voet omhoog, hE: dezelfde
// maar gemeten naar hoogte (zo liggen de lagen van twee vleugels in de kil even hoog), e: voorbij
// de voet, dm: dw met de bolling, de lagen en de lap erin (het oppervlak dat je ziet).
function plekV(H, V, x, y, z) {
  const dx = x - V.cx;
  const dy = y - V.cy;
  const a = dx * V.Ax + dy * V.Ay;
  const q = dx * V.Qx + dy * V.Qy;
  const z0 = V.nokZ(a);
  const q1 = V.voetQ(a);
  const z1 = V.voetZ(a);
  const dz = z1 - z0;
  const L = Math.hypot(q1, dz);
  const ux = q1 / L;
  const uz = dz / L;
  const pz = z - z0;
  const aq = Math.abs(q);
  const langs = aq * ux + pz * uz;
  const dw = -aq * uz + pz * ux;
  const t = klem(langs / L, 0, 1);
  const sE = L - langs;
  const hE = (-sE * uz) / H.sinRef;
  let dm = dw - H.bol * 4 * t * (1 - t);
  if (H.laagH && langs > 0) dm -= laagReliëf(H, V, a, hE);
  if (H.lap && H.lap.V === V) {
    const lw = lapWaarde(H, V, a, hE, q);
    if (lw < 0.2) dm -= 1.6 * glad(0.2, -0.1, lw);
  }
  return { V, a, q, z0, L, ux, uz, langs, dw, dm, t, sE, hE, e: langs - L };
}

// twee plekken gemengd; h is het gewicht van A, dm is al gladgemaakt
function mengP(PA, PB, h, dm) {
  const w = 1 - h;
  const D = h >= 0.5 ? PA : PB;
  return {
    V: D.V,
    a: D.a,
    q: D.q,
    z0: D.z0,
    ux: D.ux,
    uz: D.uz,
    L: PA.L * h + PB.L * w,
    langs: PA.langs * h + PB.langs * w,
    dw: PA.dw * h + PB.dw * w,
    dm,
    t: PA.t * h + PB.t * w,
    sE: PA.sE * h + PB.sE * w,
    hE: PA.hE * h + PB.hE * w,
    e: PA.e * h + PB.e * w,
  };
}
// de gladde vereniging (het hoogste dak wint) en doorsnede (het laagste)
function unie(PA, PB, k) {
  if (k < 0.01) return PA.dm <= PB.dm ? PA : PB;
  const h = klem(0.5 + (0.5 * (PB.dm - PA.dm)) / k, 0, 1);
  if (h >= 1) return PA;
  if (h <= 0) return PB;
  return mengP(PA, PB, h, PB.dm + (PA.dm - PB.dm) * h - k * h * (1 - h));
}
function doorsnede(PA, PB, k) {
  if (k < 0.01) return PA.dm >= PB.dm ? PA : PB;
  const h = klem(0.5 - (0.5 * (PB.dm - PA.dm)) / k, 0, 1);
  if (h >= 1) return PA;
  if (h <= 0) return PB;
  return mengP(PA, PB, h, PB.dm + (PA.dm - PB.dm) * h + k * h * (1 - h));
}

// Plek op het dak van het hele huis.
//
// Ver naast een vleugel (meer dan 60 eenheden voorbij zijn goot) kan die vleugel het niet meer
// winnen; dan rekenen we hem niet uit. Voor de tekenaar krijgt de plek dan wel een plafond `cap`:
// een ondergrens voor de afstand tot dat riet, zodat een straal er nooit overheen stapt.
const NAAST = 60;
function metPlafond(P, cap) {
  P.cap = cap;
  return P;
}
function dakPlek(H, x, y, z) {
  const Vs = H.vleugels;
  if (Vs.length === 1) return plekV(H, Vs[0], x, y, z);
  const [VA, VB] = Vs;
  const J = H.knoop;
  const qA = Math.abs((x - VA.cx) * VA.Qx + (y - VA.cy) * VA.Qy) - VA.Qe0;
  const qB = Math.abs((x - VB.cx) * VB.Qx + (y - VB.cy) * VB.Qy) - VB.Qe0;
  const aA = (x - VA.cx) * VA.Ax + (y - VA.cy) * VA.Ay;
  const aB = (x - VB.cx) * VB.Ax + (y - VB.cy) * VB.Ay;
  const zacht = glad(0, H.kilR, Math.hypot(x - J.x, y - J.y));
  if (J.soort === 'tak') {
    // de voet van de T duikt voorbij de nok van de hoofdvleugel weg
    const voorbij = -J.sB * (aB - J.aB);
    if (voorbij > NAAST || (qB > NAAST && qA < qB)) return metPlafond(plekV(H, VA, x, y, z), voorbij > NAAST ? Infinity : qB - 40);
    if (qA > NAAST && qB < qA) return metPlafond(plekV(H, VB, x, y, z), qA - 40);
    const PB = plekV(H, VB, x, y, z);
    if (voorbij > 0) {
      PB.dm += 1.5 * voorbij;
      PB.dw += 1.5 * voorbij;
    }
    return unie(plekV(H, VA, x, y, z), PB, H.kilK * zacht);
  }
  const inA = J.sA * (aA - J.aA) >= 0;
  const inB = J.sB * (aB - J.aB) >= 0;
  if (inA && !inB) return plekV(H, VA, x, y, z);
  if (inB && !inA) return plekV(H, VB, x, y, z);
  if (inA && inB) {
    if (qB > NAAST && qA < qB) return metPlafond(plekV(H, VA, x, y, z), qB - 40);
    if (qA > NAAST && qB < qA) return metPlafond(plekV(H, VB, x, y, z), qA - 40);
    return unie(plekV(H, VA, x, y, z), plekV(H, VB, x, y, z), H.kilK * zacht);
  }
  return doorsnede(plekV(H, VA, x, y, z), plekV(H, VB, x, y, z), H.heupK * zacht);
}

// Ligt (a, hE) in de lap? Negatief is erin; alleen op het voorste schild. Een lap volgt de lagen:
// twee of drie banen nieuw riet, elk een eind anders breed, zoals iemand het gat heeft gedicht.
function lapWaarde(H, V, a, hE, q) {
  if (!H.lap || H.lap.V !== V || q < 0) return 1;
  const k = Math.floor((hE + V.laagGolf(a)) / H.laagL);
  if (k < H.lap.k0 || k > H.lap.k1) return 1;
  const hw = H.lap.hw * (0.7 + 0.6 * rnd(H.zaad, k, 77));
  const ac = H.lap.a + (rnd(H.zaad, k, 78) - 0.5) * 22;
  return (Math.abs(a - ac) - hw) / 20;
}

// Het reliëf van één laag: bij de stoot (f = 0, de onderkant) snel omhoog, dan langzaam af.
function laagReliëf(H, V, a, hE) {
  if (!H.laagH) return 0;
  const fase = (hE + V.laagGolf(a)) / H.laagL;
  const f = fase - Math.floor(fase);
  const b = 0.2;
  return H.laagH * (f < b ? glad(0, 1, f / b) : 1 - (0.75 * (f - b)) / (1 - b));
}

// De vorm van het pak bij een plek, zonder de kopgevels.
function pakAfstand(H, P) {
  const rT = H.dik * (1 + H.voetDik * P.t * P.t);
  if (H.hoekig) return Math.max(Math.abs(P.dm) - rT, P.e, -P.langs - rT);
  if (P.langs < 0) return Math.hypot(P.langs, P.dm) - rT;
  if (P.e > 0) return Math.hypot(P.e, P.dm) - rT;
  return Math.abs(P.dm) - rT;
}

function dakVeld(H) {
  const rr = H.kopR;
  return (x, y, z) => {
    const P = dakPlek(H, x, y, z);
    let d = pakAfstand(H, P);
    if (P.cap !== undefined && P.cap < d) d = P.cap;
    // de kopse kanten bij de vrije gevels, afgerond afgesneden
    for (const G of H.gevels) {
      const V = G.V;
      const dx = x - V.cx;
      const dy = y - V.cy;
      const bq = G.e * (dx * V.Ax + dy * V.Ay) - (V.XR - rr);
      const a = d + rr;
      if (bq <= Math.min(a, 0)) continue; // de snede verandert hier niets
      if (Math.abs(dx * V.Qx + dy * V.Qy) > V.Qe0 + 60) continue;
      d = Math.min(Math.max(a, bq), 0) + Math.hypot(Math.max(a, 0), Math.max(bq, 0)) - rr;
    }
    return d;
  };
}

// Onder het dak: hoe ver een punt boven de onderkant van het rietpak ligt. De muren en de gevels
// houden daar op, ruim binnen het riet. Zonder bolling, lagen en afronding (dat zit allemaal
// binnen het pak): per vleugel alleen de middellijn, en in de kil de scherpe vereniging, die
// lager ligt dan het ronde riet erboven.
function dwV(V, x, y, z) {
  const dx = x - V.cx;
  const dy = y - V.cy;
  const a = dx * V.Ax + dy * V.Ay;
  const q = dx * V.Qx + dy * V.Qy;
  const z0 = V.nokZ(a);
  const q1 = V.voetQ(a);
  const z1 = V.voetZ(a);
  return (Math.abs(q) * (z0 - z1) + (z - z0) * q1) / Math.hypot(q1, z1 - z0);
}
function onderDak(H, x, y, z) {
  const Vs = H.vleugels;
  let dw;
  if (Vs.length === 1) dw = dwV(Vs[0], x, y, z);
  else {
    const [VA, VB] = Vs;
    const J = H.knoop;
    const aB = (x - VB.cx) * VB.Ax + (y - VB.cy) * VB.Ay;
    const dA = dwV(VA, x, y, z);
    let dB = dwV(VB, x, y, z);
    if (J.soort === 'tak') {
      const voorbij = -J.sB * (aB - J.aB);
      if (voorbij > 0) dB += 1.5 * voorbij;
      dw = Math.min(dA, dB);
    } else {
      const aA = (x - VA.cx) * VA.Ax + (y - VA.cy) * VA.Ay;
      const inA = J.sA * (aA - J.aA) >= 0;
      const inB = J.sB * (aB - J.aB) >= 0;
      dw = inA && inB ? Math.min(dA, dB) : inA ? dA : inB ? dB : Math.max(dA, dB);
    }
  }
  return dw + H.dik * 0.45;
}

// ---------------------------------------------------------------- de patronen

// Diepe schaduw onder de overstek. De slagschaduw van de rand valt in deze hoek grotendeels achter
// de rand zelf, dus dat is niet genoeg: onder het riet komt ook minder hemellicht. Hoeveel
// stappen een muur daar donkerder wordt, oplopend naar de onderkant van het riet (en bij twee
// lagen ook onder de overkraging).
function randSchaduw(H, C) {
  if (C.nz > 0.5) return 0;
  const { x, y, z } = C;
  // een harde baan vlak onder de rand, en daaronder een zachte overgang
  const baan = (afstand, hard, zacht) => (afstand < hard ? 1 : klem(1 - (afstand - hard) / zacht, 0, 1));
  const bovenst = H.verd.length - 1;
  let d = 0;
  for (const P of H.stukken) {
    const [al, n] = P.lokAN(x, y, z);
    if (n < -24 || n > 30 || al < -24 || al > P.len + 24) continue;
    const V = P.V;
    if (P.s < bovenst) {
      // onder de overkraging (en alleen daar: de muur erboven staat verder naar voren)
      if (z > E(H.h1) || n > 8) continue;
      const zLijn = E(H.h1) - 0.82 * H.kraag - 1;
      d = Math.max(d, H.sp ? baan(zLijn - z, E(3), E(9)) : baan(zLijn - z, 0, E(7)));
    } else if (!P.gevel) {
      // Langs een muur onder de goot: gemeten vanaf de lijn waar de rand van het riet de muur in
      // beeld afdekt (de rand steekt naar voren, dus die lijn ligt lager dan de rand zelf). De rol
      // aan de voet raakt de kijkstraal 1,3 straal onder zijn midden. Bij de kop in de hoek van
      // een L ligt daar de goot van de andere vleugel, zonder golven.
      const a = P.langs(al * SQ);
      const zLijn = P.zijde === 'q' ? V.voetZ(a) - 1.3 * H.dik * (1 + H.voetDik) - 0.82 * (V.voetQ(a) - V.qW) : H.voetZ - 1.3 * H.dik * (1 + H.voetDik) - 0.82 * H.ov;
      d = Math.max(d, H.sp ? baan(zLijn - z, E(9), E(14)) : baan(zLijn - z, 0, E(10)));
    } else {
      // langs een gevel: onder het rietpak dat er schuin overheen steekt
      const D = plekV(H, V, x, y, z);
      const zc = D.z0 + (D.uz / D.ux) * Math.abs(D.q);
      const zLijn = zc - H.dik / D.ux - 0.82 * H.ovg;
      d = Math.max(d, H.sp ? baan(zLijn - z, E(7), E(12)) : baan(zLijn - z, 0, E(9)));
    }
  }
  return d * (H.sp ? 2.6 : 1);
}
// een patroon voor een muur of wat erop zit, met die schaduw eronder
function metRand(H, f) {
  return (C) => {
    const dk = randSchaduw(H, C);
    if (!dk) return f(C);
    C.stap -= dk;
    const r = f(C);
    if (typeof r === 'number') return r - dk;
    if (!r) return -dk;
    if (r.stap === undefined) return { ...r, plus: (r.plus || 0) - dk };
    return r;
  };
}

// Riet: lagen die je ziet liggen (onder elke laag een rafelige donkere lijn, naar boven toe
// lichter, zoals op de referentie), en daarin halmen langs de helling: kolommen van één pixel
// breed, in stukjes van vijf tot tien, om en om lichter en donkerder.
function rietPatroon(H, C) {
  const { x, y, z } = C;
  const P = dakPlek(H, x, y, z);
  const V = P.V;
  // de kopse kant bij een vrije gevel: stoppels
  const na = C.nx * V.Ax + C.ny * V.Ay;
  if (Math.abs(na) > 0.6 && P.langs > 0 && V.eind[na > 0 ? 1 : 0] === 'gevel' && Math.abs(P.a) > V.XR - H.kopR - 5) {
    const h = hash(C.px, C.py, H.zaad + 5) % 9;
    return (h < 2 ? -1.4 : h > 6 ? 0.6 : 0) - 0.3;
  }
  const lw = lapWaarde(H, V, P.a, P.hE, P.q);
  const inLap = lw < 0;
  // De zijranden van de lap, precies één pixel: de nieuwe halmen liggen er bovenop, dus de kant
  // naar de zon vangt licht en aan de andere kant zit een schaduwlijn.
  if (H.lap && H.lap.V === V && Math.abs(lw) < 0.2) {
    const buur = (dx, dy, dz) => {
      const Q = dakPlek(H, x + dx, y + dy, z + dz);
      return lapWaarde(H, Q.V, Q.a, Q.hE, Q.q) < 0;
    };
    const rechts = buur(C.dxv[0], C.dxv[1], C.dxv[2]);
    const links = buur(-C.dxv[0], -C.dxv[1], -C.dxv[2]);
    if (!inLap && links) return -2.2; // net rechts van de lap: zijn schaduw
    if (inLap && !links) return 1.2; // de linkerrand in de zon
    if (inLap && !rechts) return -1;
  }
  const fase = (P.hE + V.laagGolf(P.a)) / H.laagL;
  const k = Math.floor(fase);
  const f = fase - k;
  // halmen: vaste kolommen langs de nok (een kolom is op het scherm één pixel breed)
  const kol = Math.floor(P.a / 1.414 + 0.4 * Math.sin(P.sE * 0.07 + k));
  const zk = H.zaad + V.i * 31;
  const spring = hash(kol, 0, zk + 2) % 11;
  const stukL = 4 + (hash(kol, 1, zk) % 6);
  const stuk = Math.floor((P.sE + spring) / stukL);
  const halm = hash(kol, stuk, zk + (inLap ? 17 : 1)) % 12;
  let s = halm < 3 ? -1.4 : halm > 8 ? 1.1 : 0;
  if (H.laagH) {
    // onderaan elke laag een donkere zoom, rafelig: elke halm houdt ergens anders op
    const fu = f * H.laagL;
    const eind = (hash(kol, k, zk + 9) % 6) * 0.9;
    if (fu < 1.6 + eind * 0.5) s = -2.4;
    else if (fu < 1.6 + eind) s = -1.6;
    else s += -0.8 + 1.5 * klem((fu - 1.6) / (H.laagL - 1.6), 0, 1);
  } else {
    // zonder pak: de lagen van rietPixel, alleen als tekening
    if (f < 0.1) s = -2;
    else if (f > 0.88 && halm > 4) s += 1;
  }
  if (inLap) {
    // vers riet is lichter en geler, oud riet grauwer
    return H.lap.vers ? { plus: s + 0.7 } : { ramp: 'riet', plus: s + 0.6 };
  }
  return s;
}

// de nok: een worst van riet met om de zoveel een binding
function nokPatroon(H, C) {
  const V = C.deel.V;
  const a = (C.x - V.cx) * V.Ax + (C.y - V.cy) * V.Ay;
  const band = (((a + 400 + H.zaad * 7) % 46) + 46) % 46;
  if (band < 2) return -1.4;
  const kol = Math.floor(a / 1.414);
  const halm = hash(kol, Math.floor(C.z / 5), H.zaad + 3 + V.i * 31) % 10;
  return halm < 2 ? -1.1 : halm > 7 ? 0.9 : 0;
}

// Stenen, groot en niet waterpas: de rijen golven een pixel of twee en lopen iets schuin.
function steenPatroon(H, C, maat) {
  const { x, y, z, nx, ny } = C;
  let U;
  let zaad;
  if (Math.abs(ny) >= Math.abs(nx)) {
    U = (ny >= 0 ? -x : x) * SQ;
    zaad = H.zaad * 13 + 1;
  } else {
    U = (nx >= 0 ? y : -y) * SQ;
    zaad = H.zaad * 13 + 2;
  }
  const Hp = z * PXH + H.sch * (1.6 * Math.sin(U * 0.043 + H.zaad) + U * 0.012);
  const st = steenOp(U, Hp, 1, 1, zaad, maat[0], maat[1], maat[2]);
  const s = steenStap(st, C.stap, C.px, C.py, { voeg: 2.6, zaad: H.zaad });
  const kl = steenKleur(st);
  if (kl) return { ramp: kl, stap: (s * (RAMP_LEN[RAMP[kl]] - 1)) / (RAMP_LEN[RAMP.veldsteen] - 1) };
  return { stap: s };
}

// pleister: vlekkerig, en onderaan wat vuiler
function pleisterPatroon(H, C) {
  const n = ruis2(C.px * 0.16, C.py * 0.16, H.zaad + 7);
  let s = n > 0.7 ? -0.6 : n < 0.22 ? 0.4 : 0;
  if (hash(C.px, C.py, H.zaad + 8) % 31 === 0) s -= 0.8;
  return s;
}

// kozijnen: nerf langs de lengte van elk stuk
function kozijnPatroon(C) {
  const p = C.deel;
  if (!p.raam) return 0;
  const [a, v] = p.raam.op.lok(C.x, C.y, C.z);
  const staand = Math.abs(a) > p.raam.op.hb && Math.abs(v) < p.raam.op.hh + 2;
  const w = staand ? a : v;
  const l = staand ? v : a;
  const nerf = Math.sin(w * 2.1 + Math.sin(l * 0.12 + p.raam.u) * 2);
  return nerf > 0.8 ? -0.8 : nerf < -0.9 ? 0.5 : 0;
}

// De deur: verticale planken met een naad van één pixel, twee klampen, ijzeren hengsels.
function deurPatroon(H, C) {
  const p = C.deel;
  const [a, v, n] = p.lok(C.x, C.y, C.z);
  if (n < -1) return 0;
  const hb = p.hb;
  const hh = p.hh;
  const plankB = (H.sp ? 9 : 7) / SQ;
  const pa = (a + hb) / plankB;
  const i = Math.floor(pa);
  const fr = (pa - i) * plankB;
  if (fr < 1.414 && i > 0) return -2.2;
  let s = ((hash(i, 3, H.zaad) % 3) - 1) * 0.45;
  // hengsels op de klampen, van de scharnierkant tot ruim over het midden
  for (const vk of [0.52, -0.55]) {
    const dv = v - vk * hh;
    if (Math.abs(dv) < E(2.5) && a < hb * 0.45 - Math.abs(dv) * 1.5) return { ramp: 'ijzer', stap: 2.4 + (dv > 0.8 ? 1 : 0) };
    if (Math.abs(dv) < E(5)) s += dv > E(3.5) ? 0.8 : dv < -E(3.5) ? -1.4 : 0.4;
  }
  // de ring
  const dr = Math.hypot(a - hb * 0.62, v + hh * 0.02);
  if (Math.abs(dr - 3.2) < 0.9) return { ramp: 'ijzer', stap: 3 };
  const nerf = Math.sin(a * 1.9 + Math.sin(v * 0.1 + i) * 2.2 + i * 1.7);
  if (nerf > 0.85) s -= 0.7;
  return s;
}

// glas: donker, met een lichte streep van de lucht linksboven in elk vak
function glasPatroon(C) {
  const p = C.deel;
  if (!p.op) return 0;
  const [a, v] = p.op.lok(C.x, C.y, C.z);
  const ka = a / p.op.hb;
  const kv = v / p.op.hh;
  const la = ka < 0 ? ka + 0.5 : ka - 0.5; // midden van het vak
  const lv = kv < 0 ? kv + 0.5 : kv - 0.5;
  const streep = la * 1.2 + lv * -1.4;
  if (streep > -0.55 && streep < -0.35 && lv > 0) return 2;
  return 0;
}

// ---------------------------------------------------------------- het lichaam

// De muren: per vleugel en per verdieping een doos die helt en uitpuilt, samen onder het riet
// afgesneden, met de deuren en ramen eruit.
function rompVeld(H) {
  const Vs = H.vleugels;
  const verd = H.verd;
  const ops = H.openingen;
  return (x, y, z) => {
    let d = Infinity;
    for (const V of Vs) {
      const dx = x - V.cx;
      const dy = y - V.cy;
      const as = dx * V.Ax + dy * V.Ay - V.hellA * z;
      const qs = dx * V.Qx + dy * V.Qy - V.hellQ * z;
      const bq = bolQ(H, V, as, z);
      const ba = bolA(H, V, qs, z);
      for (const S of verd) {
        const hz = (S.z1 - S.z0) / 2;
        const db = sdf.doos(as, qs, z - (S.z0 + hz), V.ha + S.uit + ba, V.hq + S.uit + bq, hz, 1.5);
        if (db < d) d = db;
      }
    }
    if (z > H.zOnderMin) d = Math.max(d, onderDak(H, x, y, z));
    if (d > 12) return d;
    for (const op of ops) {
      const ex = x - op.m[0];
      const ey = y - op.m[1];
      const ez = z - op.m[2];
      if (ex * ex + ey * ey + ez * ez > op.r2) continue;
      const [a, v, n] = op.lok(x, y, z);
      const gat = laag(rechthoek(a, v, op.hb, op.hh), n, -op.diep, 14);
      if (-gat > d) d = -gat;
    }
    return d;
  };
}

function rompMat(H) {
  const ops = H.openingen;
  const zSteen = E(H.hS + 24);
  return (x, y, z) => {
    for (const op of ops) {
      const ex = x - op.m[0];
      const ey = y - op.m[1];
      const ez = z - op.m[2];
      if (ex * ex + ey * ey + ez * ez > op.r2) continue;
      const [a, v, n] = op.lok(x, y, z);
      if (n < -op.diep + 1.2 && rechthoek(a, v, op.hb, op.hh) < 1) return op.binnen;
    }
    if (z > zSteen) return 'pleister';
    return z * PXH < steenLijn(H, x - H.hellX * z, y - H.hellY * z) ? 'steen' : 'pleister';
  };
}

// ---------------------------------------------------------------- het huis

function huis(zaad = 1, o = {}) {
  const H = maten(zaad, o);
  const { sp, sch, r, rs } = H;
  const W = new Wereld();
  W.H = H;

  // --- materialen. Speelgoed: meer licht op het riet, diepere schaduw overal.
  const diepe = sp ? 0.12 : 0.35;
  const houtHi = (sp ? 6.6 : 5.8) - (H.hout === 'schors' ? 0.8 : 0); // schors heeft een tint minder
  W.mat = {
    // het riet in de zon komt op stap 4 à 5 uit, zodat er boven nog licht en onder nog schaduw past
    riet: { ramp: 'stro', lo: sp ? 0.2 : 1.2, hi: sp ? 4.9 : 5.3, schaduwKracht: sp ? 0.18 : 0.35, patroon: (C) => rietPatroon(H, C) },
    nok: { ramp: 'stro', lo: 0.2, hi: sp ? 4.3 : 4.8, schaduwKracht: diepe, patroon: (C) => nokPatroon(H, C) },
    steen: { ramp: 'veldsteen', lo: sp ? 0.8 : 1.6, hi: sp ? 7.8 : 7, schaduwKracht: diepe, patroon: metRand(H, (C) => steenPatroon(H, C, sp ? [13, 22, 16] : [9, 13, 9])) },
    schoorsteen: { ramp: 'veldsteen', lo: 1, hi: sp ? 7.6 : 7, schaduwKracht: diepe, patroon: (C) => steenPatroon(H, C, sp ? [9, 14, 8] : [7, 10, 6]) },
    drempel: { ramp: 'veldsteen', lo: 1.4, hi: 7, schaduwKracht: diepe },
    pleister: { ramp: 'pleister', lo: sp ? 0.7 : 1.5, hi: sp ? 6.2 : 5.8, schaduwKracht: diepe, patroon: metRand(H, (C) => pleisterPatroon(H, C)) },
    hout: { ramp: H.hout, lo: 0.5, hi: houtHi, schaduwKracht: diepe, patroon: metRand(H, (C) => houtTex(C, false)) },
    kozijn: { ramp: H.hout, lo: 0.8, hi: houtHi + 0.2, schaduwKracht: diepe, patroon: metRand(H, kozijnPatroon) },
    deur: { ramp: H.hout, lo: 0.3, hi: sp ? 4.6 : 4.2, schaduwKracht: diepe, patroon: metRand(H, (C) => deurPatroon(H, C)) },
    windveer: { ramp: H.hout, lo: 0.5, hi: houtHi, schaduwKracht: diepe, patroon: (C) => houtTex(C, false) },
    glas: { ramp: 'pet', lo: 0.4, hi: 2.4, schaduw: false, patroon: metRand(H, glasPatroon) },
    glasWarm: { ramp: 'goud', gloei: (C) => 2.6 + (hash(C.px >> 1, C.py >> 1, 5) % 3) * 0.35 },
    donker: { ramp: 'inkt', lo: 0, hi: 1, schaduw: false },
  };

  // de grenzen van het hele huis, als staande cilinder rond de oorsprong
  let straal = 0;
  let dakStraal = 0;
  for (const V of H.vleugels) {
    const c = Math.hypot(V.cx, V.cy);
    straal = Math.max(straal, c + Math.hypot(V.aW, V.qW));
    dakStraal = Math.max(dakStraal, c + Math.hypot(V.XR + 4, V.Qe0 + H.dik * 2 + 8));
  }
  const helling = Math.hypot(H.hellX, H.hellY) * H.zTop;

  // --- het lichaam: muren en gevels, hellend, uitpuilend, met de openingen eruit
  const romp = W.groep('romp');
  voeg(romp, { f: rompVeld(H), grens: [0, 0, straal + helling + 14, -3, H.zTop + 5], m: rompMat(H), deel: 1 });
  // de drempel: een platte steen voor de deur, niet recht gelegd
  if (H.deur) {
    const P = H.deur.P;
    const [dx, dy] = P.pos(H.deur.u, 0, 7);
    const hoek = sch * rs(80) * 5 * GRAAD;
    const [tx, ty] = [P.V.Ax * (P.zijde === 'q' ? 1 : 0) + P.V.Qx * (P.zijde === 'a' ? 1 : 0), P.V.Ay * (P.zijde === 'q' ? 1 : 0) + P.V.Qy * (P.zijde === 'a' ? 1 : 0)];
    const [nx, ny] = P.N;
    const c = Math.cos(hoek);
    const s = Math.sin(hoek);
    const hx = (H.deur.b / 2 + 6) / SQ;
    voeg(romp, {
      f: (x, y, z) => {
        const px = x - dx;
        const py = y - dy;
        const la = px * tx + py * ty;
        const ln = px * nx + py * ny;
        return sdf.doos(la * c + ln * s, -la * s + ln * c, z - 1.2, hx, 9, 2.6, 1.2);
      },
      g: [dx, dy, 1.2, hx + 12],
      m: 'drempel',
      deel: 9,
    });
  }

  // --- het riet
  const riet = W.groep('riet');
  voeg(riet, {
    f: dakVeld(H),
    grens: [0, 0, dakStraal, H.voetZ - H.dik * 2 - 24, H.zNmax + H.dik + 14],
    m: 'riet',
    deel: 2,
  });
  // De nok: per vleugel een worst die met de nok meezakt, van gevel tot gevel of tot de knoop. De
  // lagere nok van een dwarsvleugel loopt het riet van de hoofdvleugel in: waar hij daaronder
  // verdwijnt houdt hij op, en het laatste stuk wordt hij dunner, zodat hij erin wegzakt in plaats
  // van er als een stam op te liggen.
  if (H.worstR) {
    for (const V of H.vleugels) {
      const nok = W.groep('nok');
      let a0 = V.eind[0] === 'gevel' ? -(V.XR - 17) : V.cJ;
      let a1 = V.eind[1] === 'gevel' ? V.XR - 17 : V.cJ;
      let dun = null;
      const J = H.knoop;
      if (J && J.soort === 'tak' && V.i === 1 && V.zN < H.vleugels[0].zN - 4) {
        const VA = H.vleugels[0];
        const vrijEind = J.sB > 0 ? a1 : a0;
        const boven = (a) => {
          const [x, y] = V.wereld(a, 0);
          const D = plekV(H, VA, x, y, 0);
          const t = klem(Math.abs(D.q) / VA.voetQ(D.a), 0, 1);
          const top = D.z0 + (D.uz / D.ux) * Math.abs(D.q) + (H.dik + H.bol * 4 * t * (1 - t)) / D.ux;
          return V.nokZ(a) + H.dik * 0.75 + H.worstR - top;
        };
        let aB = V.cJ;
        for (let a = vrijEind; J.sB * (a - V.cJ) > 0; a -= J.sB * 2) {
          if (boven(a) < -2) {
            aB = a;
            break;
          }
        }
        if (J.sB > 0) a0 = aB;
        else a1 = aB;
        dun = { aB, s: J.sB };
      }
      const [mx, my] = V.wereld((a0 + a1) / 2, 0);
      const zMin = Math.min(V.nokZ(a0), V.nokZ((a0 + a1) / 2), V.nokZ(a1));
      voeg(nok, {
        f: (x, y, z) => {
          const [a, q] = V.lok(x, y);
          const ac = klem(a, a0, a1);
          let zc = V.nokZ(ac) + H.dik * 0.75;
          let rr = H.worstR * (1 + 0.04 * sch * Math.sin(a * 0.07 + V.wF));
          if (dun) {
            const g = glad(0, 56, dun.s * (ac - dun.aB));
            rr *= 0.7 + 0.3 * g;
            zc -= (1 - g) * 16;
          }
          return Math.hypot(a - ac, q, z - zc) - rr;
        },
        grens: [mx, my, (a1 - a0) / 2 + H.worstR + 4, zMin - 12, V.zN + H.dik + H.worstR + 8],
        m: 'nok',
        deel: 3 + V.i * 100,
        V,
      });
    }
  }

  // --- de schoorsteen
  {
    const S = H.schoorsteen;
    const V = S.V;
    const [sx, sy] = V.wereld(S.a, S.q);
    const D = plekV(H, V, sx, sy, 0);
    const zDak = D.z0 + (D.uz / D.ux) * S.q;
    const z0 = zDak - H.dik * 1.5;
    const z1 = V.nokZ(S.a) + H.dik + S.hoog;
    const hz = (z1 - z0) / 2;
    const sch_ = W.groep('schoorsteen');
    const lok = (x, y, z) => {
      const t = z - z0;
      const [a, q] = V.lok(x, y);
      return [a - (S.a + S.la * t), q - (S.q + S.lq * t)];
    };
    const [gx, gy] = V.wereld(S.a + S.la * hz, S.q + S.lq * hz);
    voeg(sch_, {
      f: (x, y, z) => {
        const [xs, ys] = lok(x, y, z);
        let d = sdf.doos(xs, ys, z - (z0 + hz), S.s, S.s, hz, 1.2);
        d = Math.min(d, sdf.doos(xs, ys, z - (z1 + 2.6), S.s + 2.6, S.s + 2.6, 2.6, 0.8));
        return Math.max(d, -sdf.doos(xs, ys, z - (z1 + 7), S.s - 3.4, S.s - 3.4, 5, 0.5));
      },
      g: [gx, gy, z0 + hz + 3, Math.hypot(S.s + 4, S.s + 4, hz + 6) + Math.abs(S.la * hz) + Math.abs(S.lq * hz) + 2],
      m: (x, y, z) => {
        const [xs, ys] = lok(x, y, z);
        return z > z1 + 3 && Math.max(Math.abs(xs), Math.abs(ys)) < S.s - 2.8 ? 'donker' : 'schoorsteen';
      },
      deel: 4,
    });
  }

  // --- het vakwerk, per stuk muur: liggers en stijlen apart, zodat ze elkaar een lijn geven
  let kb = 1000;
  const dik = (basis) => basis * (sch ? 0.78 + 0.5 * r(kb++) : 1);
  const wiebel = (m = 2.2) => (sch ? rs(kb++) * m : 0);
  let deel = 10;
  // een balk op muur P van (u0, h0) naar (u1, h1), breed in px, uit eenheden voor de muur
  const wandBalk = (groep, P, u0, h0, u1, h1, breed, uit) => {
    const nc = (uit - 2.5) / 2;
    const a = P.pos(u0, h0, nc);
    const b = P.pos(u1, h1, nc);
    const du = Math.abs(u1 - u0);
    const dh = Math.abs(h1 - h0);
    const l = Math.hypot(du, dh) || 1;
    const hb = (breed / 2) * (du / l / PXH + dh / l / SQ);
    const p = balk(a, b, hb, (uit + 2.5) / 2, [P.N[0], P.N[1], 0], sp ? 1.6 : 0.8);
    p.m = 'hout';
    p.deel = deel++;
    p.zaad = kb * 3.1;
    p.toon = sch ? rs(kb++) * 0.6 : 0;
    return voeg(groep, p);
  };
  // een hoekstijl die op twee muren tegelijk staat (één keer per hoek)
  const hoeken = new Set();
  const hoekStijl = (groep, V, S, sa, sq, h0, h1, breed, sleutel) => {
    if (hoeken.has(sleutel)) return;
    hoeken.add(sleutel);
    const half = breed / 2 / SQ;
    const uit = 3;
    const ha = V.ha + S.uit - (half - uit);
    const hq = V.hq + S.uit - (half - uit);
    const c = (h) => {
      const z = h / PXH;
      const [x, y] = V.wereld(sa * ha + V.hellA * z, sq * hq + V.hellQ * z);
      return [x, y, z];
    };
    const p = balk(c(h0), c(h1), half, half, [V.Ax, V.Ay, 0], sp ? 1.6 : 0.8);
    p.m = 'hout';
    p.deel = deel++;
    p.zaad = kb * 3.1;
    p.toon = sch ? rs(kb++) * 0.6 : 0;
    kb++;
    voeg(groep, p);
  };
  const balkH = sp ? 12 : 7;
  const stijlB = sp ? 13 : 7;
  const schoorB = sp ? 10 : 6;
  const jamb = sp ? 12 : 7;
  const maxVak = sp ? 62 : 46;

  for (const P of H.stukken) {
    if (!P.zicht) continue;
    const lig = W.groep('liggers');
    const stl = W.groep('stijlen');
    const Lu = P.Lu;
    const sl = (u) => steenLijnStuk(H, P, u);
    for (const R of registers(H, P)) {
      const ops = P.openingen.filter((op) => op.reg === R.i && !op.raam?.top);
      const deur = ops.find((op) => op.deur);
      const grond = R.lo === 'steen';
      const onder = (u) => (grond ? sl(u) + balkH / 2 : R.lo + balkH / 2);
      const onderTop = (u) => onder(u) + balkH / 2 - 2;
      const boven = R.hi;
      // de onderregel: op de steen, onderbroken door de deur; bij twee lagen ligt die van de
      // bovenverdieping op de balkkoppen
      if (grond) {
        let u0 = -2;
        if (deur) {
          const g0 = deur.u - deur.b / 2 - jamb;
          if (g0 - u0 > 6) wandBalk(lig, P, u0, onder(u0), g0, onder(g0), dik(balkH), 5);
          u0 = deur.u + deur.b / 2 + jamb;
        }
        if (Lu + 2 - u0 > 6) wandBalk(lig, P, u0, onder(u0), Lu + 2, onder(Lu + 2), dik(balkH), 5);
      } else if (H.lagen === 2) {
        wandBalk(lig, P, -2, onder(0) + wiebel(2), Lu + 2, onder(Lu) + wiebel(2), dik(balkH), 5);
      }
      // de bovenregel, de trekbalk of de regel tussen twee lagen
      const b0 = boven + wiebel(3);
      const b1 = boven + wiebel(3);
      if (R.boven === 'trek') wandBalk(lig, P, -2, b0, Lu + 2, b1, dik(balkH + 2), 5.5);
      else wandBalk(lig, P, -2, b0, Lu + 2, b1, dik(balkH), R.boven === 'plaat' ? 4.5 : 5);
      const bovenBij = (u) => b0 + ((b1 - b0) * (u + 2)) / (Lu + 4);
      // de stijlen: op de hoeken, naast de deur en de ramen, en waar een vak te breed wordt
      let posts = [];
      posts.push({ u: P.links === 'hoek' ? 0 : stijlB / 2 + 1, soort: P.links === 'hoek' ? 'hoek' : 'eind', kant: 'links' });
      posts.push({ u: P.rechts === 'hoek' ? Lu : Lu - stijlB / 2 - 1, soort: P.rechts === 'hoek' ? 'hoek' : 'eind', kant: 'rechts' });
      for (const op of ops) {
        if (op.deur) {
          posts.push({ u: op.u - op.b / 2 - jamb / 2, soort: 'deur' });
          posts.push({ u: op.u + op.b / 2 + jamb / 2, soort: 'deur' });
        } else {
          const g = op.b / 2 + (sp ? 10 : 7);
          posts.push({ u: op.u - g, soort: 'raam' });
          posts.push({ u: op.u + g, soort: 'raam' });
        }
      }
      const rang = { hoek: 4, deur: 3, eind: 2, raam: 1, vul: 0 };
      posts.sort((a, b) => a.u - b.u);
      const samen = [];
      for (const p of posts) {
        const vorig = samen[samen.length - 1];
        if (vorig && p.u - vorig.u < 14) {
          if (rang[p.soort] > rang[vorig.soort]) samen[samen.length - 1] = p;
          continue;
        }
        samen.push(p);
      }
      posts = [];
      for (let j = 0; j < samen.length; j++) {
        posts.push(samen[j]);
        const n = samen[j + 1];
        if (!n) break;
        const vak = n.u - samen[j].u;
        const binnenDeur = deur && samen[j].soort === 'deur' && n.soort === 'deur';
        if (vak > maxVak && !binnenDeur) {
          const extra = Math.ceil(vak / maxVak) - 1;
          for (let e = 1; e <= extra; e++) posts.push({ u: samen[j].u + (vak * e) / (extra + 1) + wiebel(3), soort: 'vul' });
        }
      }
      const topStijl = R.boven === 'plaat' ? boven + 16 : boven;
      const latei = deur ? deur.deur.h + (sp ? 7 : 4) : 0;
      for (const p of posts) {
        if (p.soort === 'hoek') {
          const [sa, sq] = P.hoekTekens(p.kant);
          hoekStijl(stl, P.V, P.S, sa, sq, onderTop(p.u), topStijl, dik(stijlB + 2), `${P.V.i},${P.s},${R.i},${sa},${sq}`);
        } else if (p.soort === 'deur') {
          wandBalk(stl, P, p.u + wiebel(1), 0, p.u + wiebel(1.5), latei + wiebel(1.5), dik(jamb), 4);
        } else {
          wandBalk(stl, P, p.u, onderTop(p.u), p.u + wiebel(), topStijl, dik(p.soort === 'raam' ? stijlB - 2 : stijlB), 3.5);
        }
      }
      // de latei over de deur, die er ruim overheen steekt
      if (deur) {
        const dL = deur.u - deur.b / 2;
        const dR = deur.u + deur.b / 2;
        wandBalk(lig, P, dL - jamb - 8, latei + balkH / 2 + wiebel(2), dR + jamb + 8, latei + balkH / 2 + wiebel(2), dik(balkH + 2), 5.5);
      }
      // de vakken: regels boven en onder een raam, schoren bij de hoeken, een regel in de rest
      for (let j = 0; j + 1 < posts.length; j++) {
        const L = posts[j];
        const Rr = posts[j + 1];
        const vak = Rr.u - L.u;
        if (vak < 16) continue;
        const iL = L.u + (L.soort === 'hoek' ? stijlB * 0.75 : stijlB / 2);
        const iR = Rr.u - (Rr.soort === 'hoek' ? stijlB * 0.75 : stijlB / 2);
        if (iR - iL < 8) continue;
        const erin = ops.filter((op) => op.u > L.u && op.u < Rr.u);
        if (erin.some((op) => op.deur)) continue;
        const bodem = Math.max(onderTop(L.u), onderTop(Rr.u)) + 1;
        const dak = Math.min(bovenBij(L.u), bovenBij(Rr.u)) - balkH / 2;
        const hoogte = dak - bodem;
        if (erin.length) {
          for (const op of erin) {
            const oR = op.h0 - (sp ? 13 : 9);
            if (oR - bodem > balkH) wandBalk(lig, P, iL - 1, oR + wiebel(1.5), iR + 1, oR + wiebel(1.5), dik(balkH - 3), 4);
            const bR = op.h0 + op.h + (sp ? 11 : 8);
            if (dak - bR > balkH + 2) wandBalk(lig, P, iL - 1, bR + wiebel(1.5), iR + 1, bR + wiebel(1.5), dik(balkH - 3), 4);
          }
          continue;
        }
        const aanHoek = ['hoek', 'eind'].includes(L.soort) ? 'links' : ['hoek', 'eind'].includes(Rr.soort) ? 'rechts' : null;
        if (aanHoek && hoogte > 34) {
          // een schoor: laag aan de binnenkant, hoog tegen de hoekstijl
          const uLaag = aanHoek === 'links' ? iR - 3 : iL + 3;
          const uHoog = aanHoek === 'links' ? iL + 3 : iR - 3;
          wandBalk(stl, P, uLaag + wiebel(3), bodem + wiebel(1), uHoog + wiebel(2), dak - 5 + wiebel(3), dik(schoorB), 3);
        } else if (hoogte > 44) {
          const hm = bodem + hoogte * (0.42 + 0.14 * r(kb++));
          wandBalk(lig, P, iL - 1, hm + wiebel(2), iR + 1, hm + wiebel(2), dik(balkH - 3), 4);
          if (hoogte > 70 && vak > 34 && r(kb++) < 0.5) {
            // en een schoor in het onderste of bovenste vak
            const onderin = r(kb++) < 0.5;
            const [h0, h1] = onderin ? [bodem, hm - balkH / 2] : [hm + balkH / 2, dak];
            const naarL = r(kb++) < 0.5;
            wandBalk(stl, P, (naarL ? iR - 3 : iL + 3) + wiebel(2), h0 + 1, (naarL ? iL + 3 : iR - 3) + wiebel(2), h1 - 2, dik(schoorB - 1), 3);
          }
        }
      }
      // de top van een gevel: stijlen tot onder het riet, een hanenbalk boven het raam
      if (P.gevel && R.boven === 'trek') {
        const top = P.openingen.find((op) => op.raam?.top);
        const onderNok = (u) => nokHpx(H, P, u) - 10;
        const staand = [];
        const uNok = -P.l0 * P.dirU * SQ;
        if (top) {
          const g = top.b / 2 + (sp ? 9 : 6);
          staand.push(top.u - g, top.u + g);
        } else staand.push(uNok + wiebel(3));
        // meer stijlen naar buiten toe, zolang er hoogte is
        const stap = sp ? 54 : 40;
        for (const kant of [-1, 1]) {
          let u = kant < 0 ? Math.min(...staand) - stap : Math.max(...staand) + stap;
          while (u > 12 && u < Lu - 12 && onderNok(u) - boven > 34) {
            staand.push(u + wiebel(3));
            u += kant * stap;
          }
        }
        for (const u of staand) {
          const t = onderNok(u);
          if (t - (boven + 4) > 14) wandBalk(stl, P, u, boven + 4, u + wiebel(2), t, dik(stijlB - 2), 3.5);
        }
        if (top) {
          const hc = top.h0 + top.h + (sp ? 12 : 8) + wiebel(2);
          let uL = top.u;
          let uR = top.u;
          while (uL > top.u - 60 && onderNok(uL - 4) > hc + 6) uL -= 4;
          while (uR < top.u + 60 && onderNok(uR + 4) > hc + 6) uR += 4;
          if (uR - uL > top.b + 10) wandBalk(lig, P, uL, hc + wiebel(1.5), uR, hc + wiebel(1.5), dik(balkH - 2), 4.5);
        } else if (onderNok(uNok) - boven > 60) {
          // geen raam: twee korte schoren naar de makelaar
          for (const kant of [-1, 1]) {
            const u0 = uNok + kant * (sp ? 34 : 26);
            if (onderNok(u0) - boven < 20) continue;
            wandBalk(stl, P, u0 + wiebel(2), boven + 5, uNok + kant * 6, boven + (onderNok(uNok) - boven) * 0.55, dik(schoorB - 1), 3);
          }
        }
      }
    }
    // de balkkoppen onder de overkraging
    if (H.lagen === 2 && P.s === 0) {
      const tussen = sp ? 17 : 13;
      const hJ = H.h1 - 5;
      const u0 = P.links === 'binnen' ? 14 : 7;
      const u1 = Lu - (P.rechts === 'binnen' ? 14 : 7);
      const n = Math.max(1, Math.round((u1 - u0) / tussen));
      for (let i = 0; i <= n; i++) {
        const u = u0 + ((u1 - u0) * i) / n + wiebel(1.2);
        const a = P.pos(u, hJ + wiebel(0.8), -2);
        const b = P.pos(u, hJ, H.kraag + 1.5);
        const p = balk(a, b, (sp ? 3.4 : 2.5) / SQ, (sp ? 5 : 3.6) / PXH, [0, 0, 1], sp ? 1.2 : 0.6);
        p.m = 'hout';
        p.deel = deel++;
        p.zaad = kb * 3.1;
        p.toon = sch ? rs(kb++) * 0.8 : 0;
        voeg(lig, p);
      }
    }
  }
  // een schoor tegen de gevel: iemand heeft de muur overeind gehouden
  if (H.schoor) {
    const P = H.schoor.P;
    const [bx, by, bz] = P.pos(P.Lu * H.schoor.f, H.schoor.h, 1);
    const Tw = P.zijde === 'q' ? [P.V.Ax * P.dirU, P.V.Ay * P.dirU] : [P.V.Qx * P.dirU, P.V.Qy * P.dirU];
    const voet = [bx + P.N[0] * H.schoor.uit - Tw[0] * 4, by + P.N[1] * H.schoor.uit - Tw[1] * 4, -2];
    const p = T.hulp.stok(voet, [bx, by, bz], sp ? 5.5 : 3.5);
    p.m = 'hout';
    p.deel = deel++;
    voeg(W.groep('schoor'), p);
  }

  // --- de windveren: dikke gebogen planken over de kopse kant van het riet, met een knop in de top.
  // Alleen aan de gevels die je ziet (de +a-kant).
  for (const G of H.gevels) {
    if (G.e < 0) continue;
    const V = G.V;
    const wv = W.groep('windveer');
    const x = V.XR + 1.5;
    for (const kant of [1, -1]) {
      const pts = [];
      const n = 9;
      for (let i = 0; i <= n; i++) {
        const t = -0.07 + (1.13 * i) / n;
        const tt = klem(t, 0, 1);
        const aa = x + (sch ? Math.sin(t * 5 + kant) * 1.2 : 0);
        const q = V.voetQ(aa) * t;
        const [wx, wy] = V.wereld(aa, q);
        const D = plekV(H, V, wx, wy, 0);
        const z0 = V.nokZ(aa);
        const zl = z0 + (V.voetZ(aa) - z0) * t;
        // op het riet: net onder de bovenkant van het pak
        const uit = H.dik * (1 + H.voetDik * tt * tt) - 3 + H.bol * 4 * tt * (1 - tt);
        const [px, py] = V.wereld(aa, kant * (q + -D.uz * uit));
        pts.push([px, py, zl + D.ux * uit]);
      }
      const r0 = sp ? 6 : 3.5;
      for (let i = 0; i < n; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const ra = r0 * (1 + 0.25 * (i / n));
        const rb = r0 * (1 + 0.25 * ((i + 1) / n));
        const p = {
          f: (px, py, pz) => sdf.rondeKegel(px, py, pz, a[0], a[1], a[2], b[0], b[1], b[2], ra, rb),
          g: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 2 + rb + 1],
          m: 'windveer',
          deel: 60 + (kant > 0 ? 0 : 1) + V.i * 100,
          k: i ? 1.2 : undefined,
        };
        // voor de nerf: langs de veer
        const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
        const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L, (b[2] - a[2]) / L];
        p.lok = (px, py, pz) => {
          const dx = px - (a[0] + b[0]) / 2;
          const dy = py - (a[1] + b[1]) / 2;
          const dz = pz - (a[2] + b[2]) / 2;
          const l = dx * u[0] + dy * u[1] + dz * u[2];
          return [l, dx - l * u[0] + (dz - l * u[2]), 0];
        };
        p.L = L;
        p.zaad = i + kant * 5;
        p.toon = 0;
        voeg(wv, p);
      }
    }
    const zk = V.nokZ(x) + H.dik + (H.worstR ? H.worstR * 0.9 : 3);
    const [kx, ky] = V.wereld(x, 0);
    voeg(wv, { f: (px, py, pz) => sdf.bol(px - kx, py - ky, pz - zk, sp ? 7 : 4.5), g: [kx, ky, zk, (sp ? 7 : 4.5) + 1], m: 'windveer', deel: 62 + V.i * 100 });
  }

  // --- ramen: kozijn met een kruis en een vensterbank, en het glas achterin het gat
  const ramen = H.openingen.filter((op) => op.raam).map((op) => op.raam);
  const ramenG = W.groep('ramen');
  ramen.forEach((w, i) => {
    const op = w.op;
    const rw = (sp ? 5 : 3) / SQ; // kozijn, breed
    const rk = (sp ? 3 : 2) / SQ; // kruis
    const bankH = E(sp ? 5 : 3);
    const [cx, cy, cz] = w.P.pos(w.u, w.h0 + w.h / 2);
    const klein = w.b < (sp ? 28 : 20);
    const p = {
      f: (x, y, z) => {
        const [a, v, n] = op.lok(x, y, z);
        const buiten = rechthoek(a, v, op.hb + rw, op.hh + rw * 0.8);
        const binnen = rechthoek(a, v, op.hb, op.hh);
        let d = laag(Math.max(buiten, -binnen), n, -2.5, sp ? 3.2 : 2);
        // het kruis, iets terug in het gat (een klein raampje heeft alleen een middenstijl)
        const kruis = klein ? rechthoek(a, v, rk, op.hh + 0.5) : Math.min(rechthoek(a, v, rk, op.hh + 0.5), rechthoek(a, v - op.hh * 0.18, op.hb + 0.5, rk * 0.85));
        d = Math.min(d, laag(kruis, n, -op.diep + 0.5, -op.diep + 3.5));
        // de vensterbank
        const bank = rechthoek(a, v + op.hh + rw * 0.8 + bankH / 2, op.hb + rw + 3, bankH / 2 + 0.5);
        return Math.min(d, laag(bank, n, -2, sp ? 7 : 4.5));
      },
      g: [cx, cy, cz, Math.hypot(op.hb + rw + 5, op.hh + rw + bankH + 3) + 8],
      m: 'kozijn',
      deel: 400 + i,
    };
    p.raam = w;
    voeg(ramenG, p);
  });
  // Het glas hoort bij de romp (de achterkant van het gat); glasPatroon wil weten welk raam.
  // Daarom krijgt elk glas een eigen dun deel, net voor die achterkant.
  const glas = W.groep('glas');
  ramen.forEach((w, i) => {
    const op = w.op;
    const [cx, cy, cz] = w.P.pos(w.u, w.h0 + w.h / 2);
    voeg(glas, {
      f: (x, y, z) => {
        const [a, v, n] = op.lok(x, y, z);
        return laag(rechthoek(a, v, op.hb + 0.6, op.hh + 0.6), n, -op.diep, -op.diep + 0.8);
      },
      g: [cx, cy, cz, Math.hypot(op.hb, op.hh) + op.diep + 4],
      m: w.warm ? 'glasWarm' : 'glas',
      deel: 600 + i,
      op,
    });
    if (w.warm) {
      const [lx, ly, lz] = w.P.pos(w.u, w.h0 + w.h / 2, 6);
      W.lichten.push({ pos: [lx, ly, lz], r: 28, sterk: 0.9, warm: 1, val: 1.6, zacht: 0.5 });
    }
  });

  // --- de deur, die er net niet recht in hangt
  if (H.deur) {
    const op = H.deur.op;
    const dg = W.groep('deur');
    const hoek = H.deur.blad;
    const co = Math.cos(hoek);
    const si = Math.sin(hoek);
    const hb = op.hb - 1.8;
    const hh = op.hh - 1.2;
    const lok = (x, y, z) => {
      const [a, v, n] = op.lok(x, y, z);
      const vv = v + 0.8;
      return [a * co + vv * si, -a * si + vv * co, n + op.diep - 1.5];
    };
    const [cx, cy, cz] = H.deur.P.pos(H.deur.u, H.deur.h / 2);
    voeg(dg, {
      f: (x, y, z) => {
        const [a, v, n] = lok(x, y, z);
        return laag(rechthoek(a, v, hb, hh), n, -1.5, 1.2);
      },
      g: [cx, cy, cz, Math.hypot(hb, hh) + 10],
      m: 'deur',
      deel: 30,
      lok,
      hb,
      hh,
    });
  }
  return W;
}

// Het proefhuis van de eerste ronde: een rechthoek van 8 × 6 met één laag.
function proefhuis(zaad = 1, o = {}) {
  return huis(zaad, { vorm: 'rechthoek', b: 8, d: 6, lagen: 1, ...o });
}

// Waar de tovenaar kan staan: een eind voor de deur, in tegels.
function voorDeDeur(H, afstand = 1.3) {
  const d = H.deur;
  if (!d) return [0, 0];
  const [x, y] = d.P.pos(d.u, 0, afstand * TEGEL);
  return [x / TEGEL, y / TEGEL];
}

module.exports = { huis, proefhuis, maten, dakPlek, voorDeDeur };
