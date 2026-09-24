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
// Ronde 2, het materiaal. Zonder opgave kiest het zaad, met de verhoudingen uit ontwerp/beeld.md
// ("Vooral hout en stro"): riet op zo'n twee derde, leien en spanen op een paar, rode pannen als
// uitzondering, en een wand die bij het dak past (zie DAKEN en WANDEN).
//
//   dak        'riet' (een dik pak), 'spanen', 'leien' of 'pannen' (een dunne plaat met een eigen
//              patroon in rijen, een rij nokpannen of nokplanken, een kilgoot in de kil en een
//              keper op de schild), of 'plat': alleen op steen, een toren met een borstwering.
//   wand       per vleugel (een naam of een lijst): 'vakwerk' (met pleister), 'vlecht' (vakwerk
//              met vlechtwerk en leem), 'planken', 'blokhut' (gestapelde stammen met overstekende
//              hoeken) of 'veldsteen'. Bij twee lagen is 'veldsteen' steen onder en hout boven.
//   hout       'schors' (verweerd grijs) of 'hout' (warmer bruin), voor planken, stammen en balken.
//   plat dak   lagen 2 of 3, kantelen true of false (dan een gladde borstwering).
//
// kiesHuis(zaad) kiest ook de vorm, de maat en de lagen, voor een dorp van willekeurige huizen.
//
// Ronde 3, de uitbouwen (zie "uitbouwen (ronde 3)" verderop): dakkapellen (in het riet een bult,
// op een dun dak een kapel met een zadeldakje), een aanbouw met een eenzijdig dak, een erker op
// klossen, een galerij op palen, een buitentrap naar een opkamer, een schoorsteen op de gevel, en
// luiken en bloembakken. Het zaad kiest ze, met mate; o.uit vraagt ze op of zet ze uit:
//
//   uit        false (geen), of { kapellen: 2, aanbouw: true, erker: true, balkon: true,
//              trap: true, gevelschoorsteen: true, luiken: 'den', bakken: 2 }
//
// Ronde 4b, de hut (bouwfasen-sdf.cjs, 24 sep 2026): de wand 'lemen', staken en tenen met leem
// erop, zonder vakwerk en zonder stenen voet (een hut staat op de grond), met ronde hoekpalen. En
// een paar opgaven die het zaad niet kiest; zonder opgave is het huis precies als voorheen:
//
//   plaatH     de hoogte van de muur (px, waar de bovenregel ligt): laag voor een hut
//   helling    de dakhelling in graden (het zaad doet er nog een paar graden bij of af)
//   schoorsteen false: geen schoorsteen
//   rookgat    { a, b, l }: een rookgat in het riet van het voorste schild, vlak onder de nok. a is
//              waar langs de nok (-1 links, 1 rechts), b hoe breed en l hoe lang (eenheden)
//   deur       { zijde, f, b, h, arm }: de deur op de muur aan die zijde ('q' of 'a'), op f van zijn
//              lengte, zo breed en hoog (px); arm: planken met klampen en een schoor, zonder ijzer,
//              en een houten drempel
//   ramen      [{ zijde, f, h0, b, h, gat }]: precies deze ramen en geen andere; gat: een gat met
//              een latei en twee staken ervoor, zonder kozijn en zonder glas
//   knop       false: geen knop in de top van de windveren
//
// De losse tuinstukken staan in tuin-sdf.cjs, en delen het hout met dit bestand.
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
const { TEGEL, PXH, RAMP, RAMP_LEN, hash, rnd, ruis2, klem, glad, mix, sdf } = K;
const { Wereld, voeg } = T;
const { E, GRAAD, balk, stok, steenOp, steenStap } = T.hulp;
const SQ = Math.SQRT1_2;
// de dakhelling: bij 51° lopen de halmen op het scherm schoon 1:2; per zaad een paar graden anders
const HELLING = 51;

// ---------------------------------------------------------------- materialen

// ontwerp/beeld.md, "Vooral hout en stro": riet op zo'n twee derde, schaliën (leien) en spanen op
// een paar, rode pannen als uitzondering (de herberg, de kapel, een enkel beter huis).
const DAKEN = [
  ['riet', 0.64],
  ['leien', 0.14],
  ['spanen', 0.12],
  ['pannen', 0.1],
];
// Welke wand onder welk dak: stapelhout, ruwe planken en vlechtwerk onder riet en spanen, steen
// en vakwerk onder leien en pannen. Een blokhut met pannen of een plat dak op vakwerk leest vals.
const WANDEN = {
  riet: [['vakwerk', 0.26], ['vlecht', 0.24], ['planken', 0.22], ['blokhut', 0.13], ['veldsteen', 0.15]],
  spanen: [['planken', 0.36], ['blokhut', 0.3], ['vlecht', 0.14], ['vakwerk', 0.2]],
  leien: [['veldsteen', 0.45], ['vakwerk', 0.35], ['planken', 0.2]],
  pannen: [['vakwerk', 0.55], ['veldsteen', 0.45]],
};
// Een dun dak: de maten van een rij (langs de helling, in eenheden) en van een pan, lei of spaan
// (langs de nok), hoe hoog de onderrand van een rij op de rij eronder ligt, en de nok.
const DUN = {
  spanen: { rij: 11, lang: 7, spreiding: 6, stoot: 1.3, golf: 0.5, helling: 50, ramp: null, nokR: 0 },
  leien: { rij: 8.5, lang: 17, spreiding: 10, stoot: 1, golf: 0.3, helling: 53, ramp: 'veldsteen', nokR: 5.2 },
  pannen: { rij: 12.5, pan: 15.5, stoot: 1.6, golf: 0.7, helling: 46, ramp: 'dak', nokR: 6.8, nokL: 23 },
};
// het materiaal van de muur tussen het hout, per wand
const WANDMAT = { vakwerk: 'pleister', vlecht: 'leem', planken: 'plank', blokhut: 'blok', veldsteen: 'steen', lemen: 'lemen' };
// hoe hoog de stenen plint is, als deel van de gewone (H.hS): stammen en planken staan lager, en
// een lemen wand staat zonder voet op de grond (onder nul, ook waar de steenlijn schuin loopt)
const PLINT = { vakwerk: 1, vlecht: 1, planken: 0.72, blokhut: 0.42, veldsteen: 1, lemen: -0.5 };
const HOUTWAND = (w) => w === 'vakwerk' || w === 'vlecht';

// kies uit een lijst [naam, kans] met een getal van 0 tot 1
function kiesUit(lijst, x) {
  const som = lijst.reduce((s, [, p]) => s + p, 0);
  let s = 0;
  for (const [n, p] of lijst) {
    s += p / som;
    if (x < s) return n;
  }
  return lijst[lijst.length - 1][0];
}

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
// Een ronde paal of stok van a naar b, met een lok voor balkPatroon: langs de paal, en rond de paal
// (de boog), zodat de nerf in de lengte loopt. Het ijzer van balkPatroon valt er net buiten.
function rondePaal(a, b, r) {
  const p = T.hulp.stok(a, b, r);
  const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L, (b[2] - a[2]) / L];
  let w = Math.abs(u[2]) > 0.9 ? [1, 0, 0] : [-u[1], u[0], 0];
  const wd = w[0] * u[0] + w[1] * u[1] + w[2] * u[2];
  w = [w[0] - u[0] * wd, w[1] - u[1] * wd, w[2] - u[2] * wd];
  const wl = Math.hypot(...w);
  w = w.map((c) => c / wl);
  const v = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  p.lok = (x, y, z) => {
    const px = x - m[0];
    const py = y - m[1];
    const pz = z - m[2];
    const l = px * u[0] + py * u[1] + pz * u[2];
    return [l, Math.atan2(px * v[0] + py * v[1] + pz * v[2], px * w[0] + py * w[1] + pz * w[2]) * r, 0];
  };
  p.L = L + 14;
  return p;
}

// Gekopieerd uit toren.cjs (steenKleur wordt daar niet geëxporteerd): één steen op de zeven
// warm, van de rest één op de elf koel, zodat de muur gemengd oogt in plaats van egaal grijs. Op
// een hele muur van steen is één op de elf blauw te veel (de veldsteen-les in beeld.md): daar één
// op de drieëntwintig.
function steenKleur(st, heel = false) {
  if (st.pb < 1 || st.pr < 1) return null;
  if (st.id % 7 === 0) return 'bot';
  if (st.id % (heel ? 23 : 11) === 0) return 'pet';
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

// Een getal van 0 tot 1 uit zaad en sleutel, goed gemengd. r() hieronder geeft bij opeenvolgende
// zaden getallen die op elkaar lijken (zaad 1 tot 10 kregen zo allemaal warm hout); voor de keuze
// van het materiaal moet elk zaad echt anders uitvallen.
function meng(a, b) {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((b + 0x7f4a7c15) | 0, 0xc2b2ae35);
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function knoppenVan(zaad, o) {
  const kn = { scheef: true, pak: true, speelgoed: true, ...(o.knoppen || {}) };
  const r = (k) => rnd(zaad * 7919 + 101, k);
  const rs = (k) => r(k) * 2 - 1;
  const kz = (k) => meng(zaad, k);
  return { zaad, kn, r, rs, kz, sch: kn.scheef ? 1 : 0, sp: kn.speelgoed, pak: kn.pak };
}

function maten(zaad = 1, o = {}) {
  if (o.dak === 'plat') return matenToren(zaad, o);
  const H = knoppenVan(zaad, o);
  const { r, rs, kz, sch, sp } = H;
  H.vorm = o.vorm || 'rechthoek';
  H.lagen = o.lagen ?? 1;
  H.nok = o.nok || 'x';

  // --- het materiaal: eerst het dak, dan per vleugel een wand die erbij past. Een zijvleugel is
  // meestal van hetzelfde, maar soms is hij later aangezet in iets anders.
  H.dak = o.dak || kiesUit(DAKEN, kz(501));
  H.D = DUN[H.dak] || null;
  H.dun = !!H.D;
  const nV = H.vorm === 'rechthoek' ? 1 : 2;
  const wandIn = Array.isArray(o.wand) ? o.wand : o.wand ? [o.wand] : null;
  const w0 = wandIn ? wandIn[0] : kiesUit(WANDEN[H.dak], kz(502));
  const anders = WANDEN[H.dak].filter(([n]) => n !== w0);
  const w1 = wandIn ? wandIn[1] ?? w0 : kz(503) < 0.72 || !anders.length ? w0 : kiesUit(anders, kz(504));
  H.wandKeus = [w0, w1].slice(0, nV);
  // bij twee lagen op steen: steen onder, hout boven (de referentie: twee temperaturen per huis)
  const boven = (w) => (w !== 'veldsteen' ? w : o.boven || (H.dak === 'spanen' || (H.dak === 'riet' && kz(505) < 0.4) ? 'planken' : 'vakwerk'));
  H.wandLagen = H.wandKeus.map((w) => (H.lagen === 2 ? [w, boven(w)] : [w]));
  H.hoekStenen = H.wandLagen.some((l) => l.includes('veldsteen'));
  // de spanen op het dak zijn meestal grijs verweerd
  H.dakHout = kz(507) < 0.7 ? 'schors' : 'hout';
  // het hout: warm eiken of grijs verweerd. Bij vakwerk zoals in ronde 1; planken en stammen
  // zijn vaker grijs, want die staan zonder pleister in de regen.
  H.hout = o.hout || (HOUTWAND(w0) ? (sch && r(35) < 0.34 ? 'schors' : 'hout') : kz(506) < 0.5 ? 'schors' : 'hout');

  // --- de hoogtes, in px. plaatH is de bovenregel van een lange muur. voetPx is de voet van het
  // dak (de middellijn van het pak): het riet hangt vóór de muur tot zo'n 36 px lager, en een dun
  // dak ligt hoger, zodat zijn rand in beeld op dezelfde lijn valt als die van het riet.
  const plaatH = o.plaatH ?? (H.lagen === 2 ? 306 : H.lagen === 1.5 ? 222 : 166) - 36;
  const voetPx = plaatH + (H.dun ? 16 : 36);
  H.voetPx = voetPx;
  H.voetZ = E(voetPx);
  H.muurH = voetPx + 10; // de bovenkant van de muur, verstopt onder het dak
  H.zM = E(H.muurH);
  H.plaatH = plaatH;
  H.trekH = plaatH + 20; // de trekbalk in de gevel
  H.zolderH = H.lagen === 1.5 ? 136 + Math.round(sch * rs(90) * 3) : 0; // de zolderbalk
  H.h1 = H.lagen === 2 ? 144 + Math.round(sch * rs(91) * 2) : 0; // de vloer van de bovenverdieping
  H.kraag = H.lagen === 2 ? (sp ? 12 : 8) + 4 * r(92) : 0; // hoever die overkraagt, in eenheden
  // stammen kragen niet over, en een stenen muur ook niet
  if (H.wandLagen.some((l) => l.length > 1 && (l[1] === 'blokhut' || l[1] === 'veldsteen'))) H.kraag = 0;
  // de stammen van een blokhut: rijen van ongelijke dikte, van de plint omhoog (px)
  H.naden = [0];
  for (let i = 0; H.naden[i] < 700; i++) H.naden.push(H.naden[i] + (sp ? 14 : 11) + (hash(i, H.zaad, 523) % 5) * (sch ? 1 : 0.4));

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
  if (H.dun) {
    // Spanen, leien en pannen: een dunne plaat met scherpe randen, zonder bolling en rol. De
    // lagen zijn hier rijen, met een eigen reliëf (dakReliëf) en een eigen patroon.
    H.dik = 4.5;
    H.hoekig = true;
    H.voetDik = 0;
    H.bol = 0;
    H.ov = 20;
    H.ovg = 13;
    H.kopR = 1;
    H.helling = (H.D.helling + sch * rs(34) * 3) * GRAAD;
    H.laagL = H.D.rij;
    H.laagH = 0;
    H.worstR = H.D.nokR;
    H.kilK = 6;
    H.heupK = 3;
  } else {
    const pak = H.pak;
    H.dik = pak ? 15 : 12; // halve dikte van het pak
    H.hoekig = !pak; // zonder pak: platen met scherpe randen
    H.voetDik = pak ? 0.22 : 0; // de voet is een dikke rol
    H.bol = pak ? 6 : 0; // het schild puilt halverwege uit
    H.ov = 22; // overstek aan de goot
    H.ovg = pak ? 20 : 12; // overstek aan de gevel
    H.kopR = pak ? 8 : 1;
    H.helling = ((o.helling ?? HELLING) + sch * rs(34) * 3) * GRAAD;
    H.laagL = sp ? 30 : 20;
    H.laagH = pak ? 1.6 : 0;
    H.worstR = pak ? 18 : 0;
    // de kil en de schild: hoe rond (in eenheden dwars op het dak), en tot hoe ver van de knoop
    // dat afneemt (bij de knoop zelf lopen de nokken in elkaar en moet het scherp blijven)
    H.kilK = pak ? 26 : 8;
    H.heupK = pak ? 24 : 6;
  }
  H.sinRef = Math.sin(H.helling);
  H.kilR = 70;
  // hoe ver de onderrand van het dak in beeld onder de voet valt, in halve diktes (randSchaduw):
  // een ronde rol hangt ver door, een dunne plaat nauwelijks
  H.randK = H.dun ? 0.1 : 1.3 * (1 + H.voetDik);

  // --- plan en vleugels
  const P = planVan(H, o);
  const { Vs, J } = vleugelsVan(H, P);
  H.vleugels = Vs;
  H.knoop = J;
  Vs.forEach((V, i) => (V.wanden = H.wandLagen[i]));
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

  // --- Een gelapt stuk op het voorste schild van de hoofdvleugel, alleen in riet: een paar jaar
  // na de rest is er vers riet overheen gelegd. Een lap is een vlek, geen blok: een onregelmatige
  // omtrek, een rafelige rand waar de nieuwe halmen ophouden, een iets andere tint en een eigen
  // loop van de lagen.
  if (sch && H.dak === 'riet') {
    const zone = langste(vrijeZones(H, VA));
    const k0 = 2 + Math.floor(r(22) * 4);
    const k1 = k0 + 1 + Math.floor(r(23) * 2);
    const hw = 30 + 16 * r(24);
    H.lap = {
      V: VA,
      a: (zone[0] + zone[1]) / 2 + rs(21) * (zone[1] - zone[0]) * 0.25,
      h: ((k0 + k1 + 1) / 2) * H.laagL + rs(25) * 6,
      ra: hw * 0.95,
      rh: ((k1 - k0 + 1) / 2) * H.laagL * 0.85 + 2,
      f1: r(520) * 6.3,
      f2: r(521) * 6.3,
      fase: 0.3 + 0.4 * r(522), // de lagen van de lap lopen niet door in die van de rest
      tint: 0.3 + 0.25 * r(524),
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
  // Een hut heeft geen schoorsteen: de haard ligt midden op de vloer, en de rook trekt door een gat
  // in het riet vlak onder de nok (op het voorste schild, zodat je het ziet).
  if (o.schoorsteen === false) H.schoorsteen = null;
  if (o.rookgat) {
    const g = o.rookgat;
    H.rookgat = { V: VA, a: (g.a ?? 0) * (VA.ha - (g.b ?? 30)), hb: (g.b ?? 30) / 2, l0: H.worstR * 0.75, l1: H.worstR * 0.75 + (g.l ?? 26) };
  } else H.rookgat = null;
  // de knop in de top van de windveren (o.knop false: geen)
  H.knop = o.knop;
  // de deur en de ramen, als ze zijn opgegeven (verdeel)
  H.deurOpgave = o.deur || null;
  H.ramenOpgave = o.ramen || null;

  // --- de uitbouwen (ronde 3): wat het zaad kiest, of wat o.uit vraagt. Wat op het dak zit en de
  // aanbouw eerst, want die veranderen het dak en welke muren je ziet.
  H.extra = [];
  H.deuren = [];
  H.openingen = [];
  H.uitPunten = [];
  H.uitbouw = kiesUitbouwen(H, o);
  aanbouwVan(H);
  uitbouwenOpHetDak(H);

  // --- de muren die je ziet, in stukken, en wat erin zit (na de uitbouwen die het dak en de
  // muren veranderen: dakkapellen en de aanbouw)
  H.stukken = maakStukken(H);
  zichtVanStukken(H);
  uitbouwenOpDeMuren(H);
  verdeel(H);
  verdeelUitbouwen(H);
  luikenEnBakken(H);
  // een schoor tegen een kopgevel, bij een oud huis (niet waar al een trap of schoorsteen staat)
  const gevels = H.stukken.filter((S) => !S.U && !S.bezet.length && S.zijde === 'a' && S.s === 0 && S.Lu > 120 && S.zicht > 0.5 && S.wand !== 'veldsteen');
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

// ---------------------------------------------------------------- de toren met een plat dak

// Een plat dak, alleen op steen (ontwerp/beeld.md): hier een vierkante wachttoren van twee à drie
// lagen. De borstwering kraagt op een rij klossen een eindje over, met kantelen of een gladde
// rand; het dak zelf is een vloer van platte stenen die naar één hoek afloopt, met een luik erin.
// De muren houden niet op onder een dak maar op een vaste hoogte, en daarboven is de toren hol.
function matenToren(zaad, o) {
  const H = knoppenVan(zaad, o);
  const { r, rs, kz, sch, sp } = H;
  H.plat = true;
  H.dak = 'plat';
  H.D = null;
  H.dun = false;
  H.vorm = 'rechthoek';
  H.lagen = o.lagen ?? 3;
  H.nok = o.nok || 'x';
  H.kantelen = o.kantelen ?? true;
  H.wandKeus = ['veldsteen'];
  H.wandLagen = [Array.from({ length: H.lagen }, () => 'veldsteen')];
  H.hoekStenen = true;
  H.hout = o.hout || (kz(506) < 0.5 ? 'schors' : 'hout');
  // de verdiepingen, elk zo'n 130 px en niet allemaal even hoog
  const vl = [0];
  for (let i = 0; i < H.lagen; i++) vl.push(vl[i] + 128 + Math.round(sch * rs(510 + i) * 5));
  H.vloerH = vl;
  H.hDak = vl[H.lagen];
  H.zDak = E(H.hDak);
  H.borstH = 34 + Math.round(sch * rs(514) * 3);
  H.zTop = E(H.hDak + H.borstH);
  H.uitB = sp ? 7 : 5; // hoever de borstwering overkraagt
  H.dikB = sp ? 12 : 9; // hoe dik ze is
  H.zBorst0 = E(H.hDak - 14); // de onderkant van de borstwering
  H.zKlos0 = H.zBorst0 - E(sp ? 15 : 12); // de onderkant van de klossen
  H.talud = sp ? 6 : 4; // de voet loopt schuin uit
  H.zTalud = E(30);
  // de vloer van het dak loopt naar één hoek af
  H.vloerAf = [(r(515) < 0.5 ? -1 : 1) * 0.025, (r(516) < 0.5 ? -1 : 1) * 0.025];
  // wat de rest van de bouwer van een huis verwacht
  Object.assign(H, { voetPx: H.hDak, voetZ: H.zDak, plaatH: H.hDak, trekH: H.hDak, muurH: H.hDak + H.borstH, zolderH: 0, h1: vl[1], kraag: 0 });
  Object.assign(H, { dik: 0, worstR: 0, bol: 0, voetDik: 0, ov: 0, ovg: 0, kopR: 0, randK: 0, hS: 0, gSx: 0, gSy: 0, naden: [0] });
  H.zM = E(H.muurH);
  H.helling = 45 * GRAAD;
  H.sinRef = Math.sin(H.helling);
  // een toren helt minder dan een huis, maar hij helt
  H.hellY = sch * (0.007 + 0.007 * r(2)) * (r(3) < 0.7 ? 1 : -1);
  H.hellX = sch * (0.006 + 0.006 * r(4)) * (r(5) < 0.5 ? 1 : -1);

  const { Vs } = vleugelsVan(H, planVan(H, { b: o.b ?? 4, d: o.d ?? 4 }));
  H.vleugels = Vs;
  H.knoop = null;
  const V = Vs[0];
  V.wanden = H.wandLagen[0];
  Object.assign(V, { qW: V.hq, aW: V.ha, Qe0: V.hq + H.uitB, XR: V.ha + H.uitB, zN: H.zTop, r0: -V.ha, r1: V.ha });
  V.nokZ = () => H.zTop;
  V.voetZ = () => H.zDak;
  V.voetQ = () => V.hq;
  V.bolQ = sch * (1 + 1.2 * r(306));
  V.bolA = sch * (0.9 + 1 * r(307));
  V.wF = r(381) * 6.3;
  H.zNmax = H.zTop;
  H.verd = vl.slice(0, -1).map((h0, i) => ({ uit: 0, z0: i ? E(h0) : -3, z1: E(vl[i + 1]) }));
  H.zOnderMin = Infinity;
  H.gevels = [];
  H.lap = null;
  H.schoorsteen = null;
  H.schoor = null;
  H.kantels = H.kantelen ? kantelsVan(H, V) : [];
  H.banden = vl.slice(1, -1).map((h) => E(h)); // een lijst tussen elke verdieping
  H.extra = [];
  H.deuren = [];
  H.uitPunten = [];
  H.uitbouw = geenUitbouw();
  H.stukken = maakStukken(H);
  H.openingen = [];
  zichtVanStukken(H);
  verdeelToren(H);
  return H;
}

// De kantelen: per zijde van de borstwering de gaten, met op elke hoek een merlon. Niet allemaal
// even breed of even diep, en niet precies op de maat verdeeld.
function kantelsVan(H, V) {
  const { r, sch, sp } = H;
  const mw = sp ? 26 : 22;
  const cw = sp ? 17 : 14;
  const gaten = [];
  let k = 530;
  const R = () => (sch ? r(k++) * 2 - 1 : 0);
  for (const [zijde, teken] of [['q', 1], ['q', -1], ['a', 1], ['a', -1]]) {
    const half = (zijde === 'q' ? V.ha : V.hq) + H.uitB;
    const L = 2 * half;
    const n = Math.max(1, Math.round((L - mw) / (mw + cw)));
    const cwE = (L - (n + 1) * mw) / n;
    for (let i = 0; i < n; i++) {
      const m0 = -half + (i + 1) * mw + i * cwE;
      gaten.push({ zijde, teken, mc: m0 + cwE / 2 + R() * 2, hw: cwE / 2 + R() * 1.5, zBodem: H.zTop - E((sp ? 17 : 14) + R() * 2.5) });
    }
  }
  return gaten;
}

// Deur en ramen van de toren: de deur beneden op de muur die je het best ziet, daarboven smalle
// spleten in dikke muren, en in de bovenste laag soms een echt raam.
function verdeelToren(H) {
  const { sp, sch, r, rs } = H;
  let k = 3000;
  const RS = () => rs(k++);
  const R = () => r(k++);
  const diep = sp ? 15 : 12;
  let deurStuk = null;
  let beste = -1;
  for (const P of H.stukken) {
    if (P.s !== 0 || P.Lu < 90 || P.zicht < 0.6) continue;
    const w = P.Lu * P.zicht * (P.zijde === 'q' ? 1.3 : 1);
    if (w > beste) {
      beste = w;
      deurStuk = P;
    }
  }
  const maak = (P, u, h0, b, h, spleet) => {
    const w = { P, reg: P.s, u, h0, b, h, hoek: sch * RS() * 1.2 * GRAAD, warm: !spleet && R() < 0.4, spleet };
    w.op = opening(P, u, h0, b, h, w.hoek, diep, spleet ? 'donker' : w.warm ? 'glasWarm' : 'glas');
    Object.assign(w.op, { reg: P.s, raam: w });
    P.openingen.push(w.op);
    H.openingen.push(w.op);
  };
  for (const P of H.stukken) {
    if (!P.zicht) continue;
    const h0 = H.vloerH[P.s];
    if (P === deurStuk) {
      const b = sp ? 50 : 42;
      const h = sp ? 100 : 92;
      const u = Math.round(P.Lu * (0.42 + 0.16 * R()));
      const d = { P, u, b, h, hoek: sch * RS() * GRAAD, blad: sch * RS() * 2 * GRAAD };
      d.op = opening(P, u, 0, b, h, d.hoek, diep, 'donker');
      Object.assign(d.op, { reg: 0, deur: d });
      P.openingen.push(d.op);
      H.openingen.push(d.op);
      H.deur = d;
      H.deuren.push(d);
      continue;
    }
    if (P.s === 0) {
      if (R() < 0.6) maak(P, P.Lu * (0.3 + 0.4 * R()), 54 + RS() * 4, sp ? 12 : 9, sp ? 34 : 28, true);
      continue;
    }
    const boven = P.s === H.lagen - 1;
    const n = P.Lu > 230 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const u = (P.Lu * (i + 0.5)) / n + sch * RS() * 12;
      if (boven && R() < 0.65) maak(P, u, h0 + 42 + RS() * 4, sp ? 28 : 22, sp ? 36 : 30, false);
      else maak(P, u, h0 + 40 + RS() * 5, sp ? 12 : 9, sp ? 42 : 36, true);
    }
  }
}

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
  const golfA = sch * E(2.8 + 1.6 * R(13)) * (H.dun ? 0.7 : 1);
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
  // de banen pannen lopen niet recht naar de nok, ze verlopen een pixel of twee
  const pnF = R(40) * 6.3;
  const pnS = RS(41) * 0.012;
  V.panDrift = (h) => sch * (1.5 * Math.sin(h * 0.021 + pnF) + h * pnS);
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
    gevel: !H.plat && zijde === 'a' && V.eind[1] === 'gevel',
    N: zijde === 'q' ? [V.Qx, V.Qy] : [V.Ax, V.Ay],
    openingen: [],
    // de wand van deze muur, en hoever het oppervlak voor de doos ligt (de stammen van een blokhut)
    wand: V.wanden[Math.min(s, V.wanden.length - 1)],
  };
  P.voor = P.wand === 'blokhut' ? blokUit(H) : 0;
  // De hoogtes van deze muur: die van het huis, of bij een uitbouw (U) zijn eigen (X: plaatH,
  // plint(u), zichtLo, zichtTop). De uitbouw tekent zijn eigen hout; het vakwerk van het huis en
  // verdeel() slaan zijn muren over.
  P.X = V.X || H;
  P.U = V.X ? V : null;
  P.bezet = [];
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
        // een aanbouw die deze verdieping helemaal afdekt (zijn dak zit onder de dakrand of onder
        // de overkraging): daarachter is geen muur te zien
        for (const U of H.extra || []) {
          if (!U.dekt || !U.dekt.includes(s)) continue;
          const g = knip(U, GEEN_UIT, P0, P1, 1.5);
          if (g) vrij = aftrekken(vrij, g);
        }
        for (const [t0, t1] of vrij) {
          if ((t1 - t0) * (m1 - m0) * SQ < 24) continue;
          uit.push(stuk(H, V, zijde, s, S, m0 + t0 * (m1 - m0), m0 + t1 * (m1 - m0), t0 > 1e-4, t1 < 1 - 1e-4));
        }
      }
    }
  });
  for (const U of H.extra || []) uit.push(...stukkenVan(H, U));
  uit.forEach((P, i) => (P.idx = i));
  return uit;
}
const GEEN_UIT = { uit: 0 };

// De muren van een uitbouw die je ziet, voor zover ze niet in het huis of een andere uitbouw
// steken. U.S0 is de verdieping van het huis waar hij tegenaan staat.
function stukkenVan(H, U) {
  const uit = [];
  const S = U.verd[0];
  for (const zijde of U.zijden) {
    const [m0, m1] = zijde === 'q' ? [-U.ha, U.ha] : [-U.hq, U.hq];
    const punt = (m) => (zijde === 'q' ? U.wereld(m, U.hq) : U.wereld(U.ha, m));
    const P0 = punt(m0);
    const P1 = punt(m1);
    let vrij = [[0, 1]];
    // een dakkapel staat binnen de vleugel (op het dak): die knipt hij niet
    for (const W of U.knipVleugels === false ? [] : H.vleugels) {
      const g = knip(W, U.S0 || H.verd[0], P0, P1, 1.5);
      if (g) vrij = aftrekken(vrij, g);
    }
    for (const U2 of H.extra) {
      if (U2 === U || !U2.knipt) continue;
      const g = knip(U2, GEEN_UIT, P0, P1, 1.5);
      if (g) vrij = aftrekken(vrij, g);
    }
    for (const [t0, t1] of vrij) {
      if ((t1 - t0) * (m1 - m0) * SQ < 16) continue;
      uit.push(stuk(H, U, zijde, 0, S, m0 + t0 * (m1 - m0), m0 + t1 * (m1 - m0), t0 > 1e-4, t1 < 1 - 1e-4));
    }
  }
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
    for (const U of H.extra) d = Math.min(d, uitDoos(U, px, py, pz), U.dakVeld ? U.dakVeld(px, py, pz) : Infinity);
    if (d < 0.4) return false;
    t += Math.max(d * 0.9, 0.8);
  }
  return true;
}

// Hoeveel van elk stuk muur de camera ziet (0 tot 1): een ander stuk van het huis kan ervoor
// staan, zoals de dwarsvleugel van een T voor de voorgevel van de hoofdvleugel. Een stuk dat je
// niet ziet krijgt geen deur, geen ramen en geen vakwerk.
function zichtVanStukken(H, lijst = H.stukken) {
  const dak = dakVeld(H);
  for (const P of lijst) {
    const bovenst = P.s === H.verd.length - 1;
    let top = !bovenst ? H.h1 - 24 : P.gevel ? H.trekH : H.plaatH - 10;
    let lo = P.s === 0 ? 30 : H.h1 + 20;
    if (H.plat) {
      lo = H.vloerH[P.s] + 24;
      top = H.vloerH[P.s + 1] - 20;
    }
    if (P.U) {
      lo = P.X.zichtLo;
      top = P.X.zichtTop;
    }
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
  // een opgegeven deur (o.deur) staat waar hij gevraagd is, zo groot als gevraagd
  const DO = H.deurOpgave;
  const deurB = DO?.b ?? (sp ? 50 : 42);
  const deurH = DO?.h ?? (sp ? 102 : 94);
  const jamb = sp ? 12 : 7;

  // Wat een uitbouw al van een muur inneemt (een buitentrap, een erker, een gevelschoorsteen, of
  // een deur die er al zit): stroken [u0, u1] die een raam op hoogte h0..h1 moet mijden.
  const voorbezet = (P, h0, h1, marge = 20) => [
    ...P.bezet.filter((b) => b[3] > h0 && b[2] < h1).map((b) => [b[0], b[1]]),
    ...P.openingen.filter((op) => op.vast && op.h0 < h1 && op.h0 + op.h > h0).map((op) => [op.u - op.b / 2 - marge, op.u + op.b / 2 + marge]),
  ];
  // de stroken waar de deur kan staan
  const deurZones = (P) => {
    let zones = [[30 + deurB / 2 + jamb, P.Lu - 30 - deurB / 2 - jamb]];
    for (const [a, b] of voorbezet(P, 0, deurH, 26)) zones = aftrekken(zones, [a - deurB / 2 - jamb, b + deurB / 2 + jamb]);
    return zones.filter(([a, b]) => b >= a);
  };

  let deurStuk = DO ? H.stukken.find((P) => !P.U && P.s === 0 && P.zijde === (DO.zijde || 'q')) || null : null;
  let beste = -1;
  // een huis heeft altijd een voordeur: past hij nergens naast wat er al staat, dan toch op de
  // beste muur
  for (const streng of DO ? [] : [true, false]) {
    for (const P of H.stukken) {
      if (P.U || P.s !== 0 || P.Lu < 120 || P.zicht < 0.6) continue;
      if (streng && (P.bezet.length || P.openingen.length) && !deurZones(P).length) continue;
      const w = P.Lu * P.zicht * (P.zijde === 'q' ? 1.6 : 1) * (P.V.i === 0 ? 1.15 : 1);
      if (w > beste) {
        beste = w;
        deurStuk = P;
      }
    }
    if (deurStuk) break;
  }

  // in stammen en steen zijn de ramen kleiner en de dagkanten dieper
  const kleiner = (P) => (P.wand === 'blokhut' ? 5 : P.wand === 'veldsteen' ? 3 : 0);
  const diepte = (P, basis) => (P.wand === 'veldsteen' ? basis + (sp ? 6 : 4) : basis + P.voor);
  const raam = (P, reg, u, h0, b, h, warm, extra = {}) => {
    const w = { P, reg, u, h0, b: b - kleiner(P) + (sch ? Math.round(RS() * 2) : 0), h: h - kleiner(P) + (sch ? Math.round(RS() * 3) : 0), hoek: sch * RS() * 2 * GRAAD, warm, ...extra };
    w.op = opening(P, w.u, w.h0, w.b, w.h, w.hoek, diepte(P, sp ? 7 : 5), w.gat ? 'donker' : warm ? 'glasWarm' : 'glas');
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
    // hoekstenen en de koppen van de stammen willen ruimte bij de hoek
    const hoekRuim = P.wand === 'veldsteen' ? 12 : P.wand === 'blokhut' ? 10 : 0;
    let zones = [[P.links === 'binnen' ? 26 : mL + hoekRuim, P.Lu - (P.rechts === 'binnen' ? 26 : mR + hoekRuim)]];
    for (const [a, b] of bezet) zones = aftrekken(zones, [a, b]);
    return zones.filter(([a, b]) => b > a);
  };

  // is de strook [u0, u1] vrij van wat een uitbouw inneemt?
  const vrijVan = (bz, u0, u1) => !bz.some(([a, b]) => u1 > a && u0 < b);

  for (const P of H.stukken) {
    if (!P.zicht || P.U) continue;
    const regs = registers(H, P);
    for (const reg of regs) {
      const bezet = [];
      if (reg.lo === 'steen') {
        // de begane grond: eerst de deur
        if (P === deurStuk) {
          const lo = 30 + deurB / 2 + jamb;
          const hi = P.Lu - 30 - deurB / 2 - jamb;
          // op een korte muur staat de deur naar één kant, zodat er aan de andere kant een raam past
          const f = DO?.f !== undefined ? DO.f : P.Lu < 240 ? (R() < 0.5 ? 0.27 : 0.73) + RS() * 0.03 : 0.4 + 0.2 * R();
          let u = Math.round(klem(P.Lu * f, lo, Math.max(lo, hi)));
          // staat er al iets (een buitentrap, een erker): de deur schuift naar de dichtstbijzijnde
          // plek waar hij wel past
          if (P.bezet.length || P.openingen.length) {
            const zones = deurZones(P);
            if (zones.length && !zones.some(([a, b]) => u >= a && u <= b)) {
              let best = null;
              for (const [a, b] of zones) {
                const k = klem(u, a, b);
                if (best === null || Math.abs(k - u) < Math.abs(best - u)) best = k;
              }
              u = Math.round(best);
            }
          }
          const d = { P, u, b: deurB, h: deurH, h0: 0, hoek: sch * RS() * 1.1 * GRAAD, blad: sch * RS() * 2.4 * GRAAD };
          if (DO?.arm) d.arm = true;
          d.op = opening(P, u, 0, d.b, d.h, d.hoek, diepte(P, 7), 'donker');
          Object.assign(d.op, { reg: reg.i, deur: d });
          P.openingen.push(d.op);
          H.openingen.push(d.op);
          H.deur = d;
          H.deuren.unshift(d);
          bezet.push([u - deurB / 2 - 26, u + deurB / 2 + 26]);
        }
        const warm = P.gevel ? 0.5 : 0.25;
        bezet.push(...voorbezet(P, 50, 50 + raamH + 20));
        // opgegeven ramen (o.ramen) komen hieronder, en dan geen andere
        if (!H.ramenOpgave) vul(P, reg.i, vrij(P, bezet, 16, 18), raamB, (u) => raam(P, reg.i, u, steenLijnStuk(H, P, u) + (sp ? 14 : 10) + sch * RS() * 3.5, raamB - (P.gevel ? 2 : 0), raamH - (P.gevel ? 2 : 0), R() < warm));
      } else if (H.lagen === 1.5) {
        const bulten = P.gevel || P.zijde !== 'q' ? [] : bultenOp(P);
        if (P.gevel) {
          // de zolder, in de gevel
          vul(P, reg.i, vrij(P, voorbezet(P, reg.lo, reg.lo + raamH), 26, 26), raamB - 4, (u) => raam(P, reg.i, u, reg.lo + 14 + sch * RS() * 3, raamB - 4, raamH - 8, R() < 0.45));
        } else if (bulten.length) {
          // Dakkapellen in het riet: onder elke bult een raam in de knieschot, zo hoog dat het
          // er half onder de opgetilde dakrand in zit.
          for (const { B, u } of bulten) raam(P, reg.i, u + sch * RS() * 2, B.h0, B.b, B.hr, R() < 0.45, { bult: B });
        } else if (R() < 0.7) {
          // kleine raampjes in de knieschot, boven de ramen van beneden
          const b = sp ? 24 : 18;
          const h = sp ? 20 : 15;
          const beneden = P.openingen.filter((op) => op.reg === 0);
          const bz = voorbezet(P, reg.lo, reg.lo + 30);
          for (const op of beneden) {
            if (op.u - b / 2 < 24 || op.u + b / 2 > P.Lu - 24) continue;
            if (!vrijVan(bz, op.u - b / 2, op.u + b / 2)) continue;
            raam(P, reg.i, op.u + sch * RS() * 5, reg.lo + 11 + sch * RS() * 2, b, h, R() < 0.3);
          }
        }
      } else if (H.lagen === 2) {
        // de bovenverdieping: boven de ramen en de deur van beneden, of verdeeld als die er niet zijn
        const beneden = H.stukken.find((Q) => !Q.U && Q.s === 0 && Q.V === P.V && Q.zijde === P.zijde && Q.l0 * Q.dirU <= P.langs(P.Lu / 2) * Q.dirU && P.langs(P.Lu / 2) * Q.dirU <= (Q.l0 + Q.dirU * Q.len) * Q.dirU);
        const ops = beneden ? beneden.openingen : [];
        const h0 = reg.lo + (sp ? 28 : 22);
        const bz = voorbezet(P, h0 - 4, h0 + raamH + 4);
        const geplaatst = [];
        if (ops.length && R() < 0.75) {
          for (const op of ops) {
            const u = (beneden.langs(op.u) - P.l0) * P.dirU * SQ + sch * RS() * 4;
            if (u - raamB / 2 < 26 || u + raamB / 2 > P.Lu - 26) continue;
            if (geplaatst.some((g) => Math.abs(g - u) < raamB + 30)) continue;
            if (!vrijVan(bz, u - raamB / 2, u + raamB / 2)) continue;
            geplaatst.push(u);
            raam(P, reg.i, u, h0 + sch * RS() * 3, raamB, raamH, R() < 0.35);
          }
        } else vul(P, reg.i, vrij(P, bz, 22, 22), raamB, (u) => raam(P, reg.i, u, h0 + sch * RS() * 3, raamB, raamH, R() < 0.35));
      }
      // de top van een gevel: een raam onder de nok, als het past
      if (P.gevel && reg.boven === 'trek' && !H.ramenOpgave) {
        const b = raamB - 6;
        const h = raamH - 4;
        const u = -P.l0 * P.dirU * SQ + sch * RS() * 8; // onder de nok
        const h0 = H.trekH + (H.lagen === 1 ? 46 : 36) + sch * RS() * 4;
        const past = u - b / 2 > 20 && u + b / 2 < P.Lu - 20 && Math.min(nokHpx(H, P, u - b / 2 - 6), nokHpx(H, P, u + b / 2 + 6)) - 24 > h0 + h + 10 && vrijVan(voorbezet(P, h0, h0 + h), u - b / 2, u + b / 2);
        if (past) raam(P, reg.i, u, h0, b, h, R() < 0.4, { top: true });
      }
    }
  }
  // de opgegeven ramen (o.ramen): precies deze, op de muur aan hun zijde, op f van zijn lengte
  for (const w of H.ramenOpgave || []) {
    const P = H.stukken.find((Q) => !Q.U && Q.s === 0 && Q.zijde === (w.zijde || 'q'));
    if (P) raam(P, 0, P.Lu * w.f, w.h0, w.b, w.h, false, { gat: !!w.gat });
  }
}

// De bulten in het riet boven stuk P (de lange muur van een vleugel), met waar hun raam komt.
function bultenOp(P) {
  const uit = [];
  for (const B of P.V.bulten || []) {
    if (B.kant !== 1) continue;
    const u = (B.a - P.l0) * P.dirU * SQ;
    if (u - B.b / 2 < 18 || u + B.b / 2 > P.Lu - 18) continue;
    uit.push({ B, u });
  }
  return uit;
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
  let pz = z - z0;
  const aq = Math.abs(q);
  // Een dakkapel in het riet is een bult: het dak gaat er omhoog overheen (bultOp). De plek wordt
  // gerekend alsof hij zoveel lager lag, dus de lagen, de voet en de rol gaan met de bult mee en
  // buigen over het raam; de afstand wordt terug geschaald waar het dak steiler oploopt.
  let schaal = 1;
  if (V.bulten) {
    const b = bultOp(V, a, q, ux, uz);
    if (b) {
      pz -= b.z;
      schaal = b.s;
    }
  }
  const langs = aq * ux + pz * uz;
  const dw = (-aq * uz + pz * ux) * schaal;
  const t = klem(langs / L, 0, 1);
  const sE = L - langs;
  const hE = (-sE * uz) / H.sinRef;
  // een uitbouw kan een eigen dak hebben, met eigen maten (zie dakFrame)
  let dm = dw - (V.bol ?? H.bol) * 4 * t * (1 - t);
  if ((V.laagH ?? H.laagH) && langs > 0) dm -= laagReliëf(H, V, a, hE);
  const D = V.D !== undefined ? V.D : H.D;
  if (D && langs > 0) dm -= dakReliëf(H, V, a, hE, D);
  if (H.lap && H.lap.V === V) {
    // het nieuwe riet ligt er dikker op, met een zachte overgang (de rafelige rand is patroon)
    const lw = lapWaarde(H, V, a, hE, q, false);
    if (lw < 3) dm -= 2.2 * glad(3, -5, lw);
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
    return metKil(plekV(H, VA, x, y, z), PB, H.kilK * zacht);
  }
  const inA = J.sA * (aA - J.aA) >= 0;
  const inB = J.sB * (aB - J.aB) >= 0;
  if (inA && !inB) return plekV(H, VA, x, y, z);
  if (inB && !inA) return plekV(H, VB, x, y, z);
  if (inA && inB) {
    if (qB > NAAST && qA < qB) return metPlafond(plekV(H, VA, x, y, z), qB - 40);
    if (qA > NAAST && qB < qA) return metPlafond(plekV(H, VB, x, y, z), qA - 40);
    return metKil(plekV(H, VA, x, y, z), plekV(H, VB, x, y, z), H.kilK * zacht);
  }
  const PA = plekV(H, VA, x, y, z);
  const PB = plekV(H, VB, x, y, z);
  const P = doorsnede(PA, PB, H.heupK * zacht);
  P.heupD = PA.dw - PB.dw;
  return P;
}
// In de kil onthoudt de plek hoe ver hij van de killijn ligt (waar de twee daken even hoog zijn):
// daar ligt bij pannen en leien een goot.
function metKil(PA, PB, k) {
  const P = unie(PA, PB, k);
  P.kilD = PA.dw - PB.dw;
  return P;
}

// Ligt (a, hE) in de lap? Negatief is erin, ongeveer in eenheden; alleen op het voorste schild.
// De omtrek is een vlek met een paar bulten, geen blok. Met rafel houden de halmen van de lap elk
// ergens anders op, het verst aan de onderrand, waar het nieuwe riet over het oude heen hangt.
function lapWaarde(H, V, a, hE, q, rafel = true) {
  const L = H.lap;
  if (!L || L.V !== V || q < 0) return 99;
  const dx = (a - L.a) / L.ra;
  const dy = (hE - L.h) / L.rh;
  const hoek = Math.atan2(dy, dx);
  const rr = 1 + 0.16 * Math.sin(3 * hoek + L.f1) + 0.09 * Math.sin(5 * hoek + L.f2);
  let w = (Math.hypot(dx, dy) - rr) * Math.min(L.ra, L.rh);
  if (rafel) {
    const h = hash(Math.floor(a / 1.414), 5, H.zaad + 41);
    w -= ((h % 9) / 8) * (dy < 0 ? 6 : 2.5) + ((h >> 8) % 3 === 0 ? 1.5 : 0);
  }
  return w;
}

// Het reliëf van één laag: bij de stoot (f = 0, de onderkant) snel omhoog, dan langzaam af.
function laagReliëf(H, V, a, hE) {
  const lh = V.laagH ?? H.laagH;
  if (!lh) return 0;
  const fase = (hE + V.laagGolf(a)) / H.laagL;
  const f = fase - Math.floor(fase);
  const b = 0.2;
  return lh * (f < b ? glad(0, 1, f / b) : 1 - (0.75 * (f - b)) / (1 - b));
}

// Het reliëf van een dun dak. Elke rij ligt met zijn onderrand op de rij eronder (bij de stoot snel
// omhoog, dan langzaam af); holle pannen hebben daarbij een golf dwars op de helling, zodat de rol
// licht vangt en de trog in schaduw ligt.
function dakReliëf(H, V, a, hE, D = H.D) {
  const fase = (hE + V.laagGolf(a) * D.golf) / D.rij;
  const f = fase - Math.floor(fase);
  let r = D.stoot * (f < 0.1 ? glad(0, 1, f / 0.1) : 1 - (0.8 * (f - 0.1)) / 0.9);
  if (D.pan) r += 1.9 * Math.sin((2 * Math.PI * (a + V.panDrift(hE))) / D.pan);
  return r;
}

// De vorm van het pak bij een plek, zonder de kopgevels.
function pakAfstand(H, P) {
  const V = P.V;
  const rT = (V.dik ?? H.dik) * (1 + (V.voetDik ?? H.voetDik) * P.t * P.t);
  if (V.hoekig ?? H.hoekig) return Math.max(Math.abs(P.dm) - rT, P.e, -P.langs - rT);
  if (P.langs < 0) return Math.hypot(P.langs, P.dm) - rT;
  if (P.e > 0) return Math.hypot(P.e, P.dm) - rT;
  return Math.abs(P.dm) - rT;
}

// Het rookgat van een hut (o.rookgat): hoe ver een punt buiten het gat ligt, in eenheden langs het
// voorste schild (negatief is erin). Een afgeronde rechthoek in (a langs de nok, langs de helling
// vanaf de nok), recht door het pak.
function rookgatAfstand(H, x, y, z) {
  const G = H.rookgat;
  const V = G.V;
  if ((x - V.cx) * V.Qx + (y - V.cy) * V.Qy < 0) return 99;
  const P = plekV(H, V, x, y, z);
  const r = 7;
  // de rand is het riet zelf: bundels die elk ergens anders ophouden
  const rafel = (hash(Math.floor(P.a / 4), Math.floor(P.langs / 6), H.zaad + 953) % 5) * 0.7;
  return rechthoek(P.a - G.a, P.langs - (G.l0 + G.l1) / 2, G.hb - r, (G.l1 - G.l0) / 2 - r) - r + rafel;
}
// Roet rond het rookgat: hoeveel stappen het riet en de nok daar donkerder zijn. Het meest aan de
// bovenrand en op de nok erboven, waar de rook langs strijkt; opzij en eronder een smalle rand.
function roet(H, x, y, z) {
  const G = H.rookgat;
  if (!G) return 0;
  const V = G.V;
  const [a, q] = V.lok(x, y);
  if (q < -6 || Math.abs(a - G.a) > G.hb + 26) return 0;
  const g = rookgatAfstand(H, x, y, z);
  const P = plekV(H, V, x, y, z);
  const vlek = ruis2(a * 0.12, P.langs * 0.12, H.zaad + 951) * 0.9;
  // de nok boven het gat: daar strijkt de rook overheen
  if (P.langs < G.l0) {
    const da = Math.abs(a - G.a) - G.hb * 0.8;
    return klem(1 - da / 16, 0, 1) * klem(1 - (G.l0 - P.langs) / 34, 0, 1) * (1.5 + vlek);
  }
  // boven: 1 boven het gat (tot de nok), naar 0 eronder
  const boven = klem(((G.l0 + G.l1) / 2 - P.langs) / 10 + 0.5, 0, 1);
  // in de lengte van de halmen trekt het roet verder omhoog, in strepen
  const streep = (hash(Math.floor(a / 1.414), 3, H.zaad + 955) % 5) * 1.6;
  const k = klem(1 - g / (5 + (19 + streep) * boven), 0, 1);
  return Math.pow(k, 1.3) * (1.5 + vlek) * (0.45 + 0.55 * boven);
}
// Een patroon met roet erop (voor het riet en de nok): een beetje roet maakt het stro donkerder,
// veel roet maakt het grauw (de ramp van schors), zoals riet dat jaren in de rook heeft gehangen.
function metRoet(H, C, r) {
  const k = roet(H, C.x, C.y, C.z);
  if (!k) return r;
  const plus = typeof r === 'number' ? r : r && r.plus !== undefined ? r.plus : 0;
  if (k > 0.55) return { ramp: 'schors', plus: plus * 0.6 - (k - 0.55) * 0.9 + 0.3 };
  if (typeof r === 'number') return r - k;
  if (!r) return -k;
  if (r.stap !== undefined) return { ...r, stap: r.stap - k };
  return { ...r, plus: (r.plus || 0) - k };
}

function dakVeld(H) {
  if (H.plat) return () => 1e9;
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
  // onder een bult in het riet loopt de muur mee omhoog
  if (V.bulten) {
    const b = bultOp(V, a, q);
    if (b) z -= b.z;
  }
  return (Math.abs(q) * (z0 - z1) + (z - z0) * q1) / Math.hypot(q1, z1 - z0);
}
function onderDak(H, x, y, z) {
  if (H.plat) return -1e9;
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

// De bult van een dakkapel in het riet (ontwerp/beeld.md: "dakkapellen die zacht in het riet zijn
// opgenomen"). Geen doos op het dak: boven een raam in de knieschot gaat het riet omhoog, het meest
// aan de voet en naar de nok toe steeds minder, en opzij in een brede, zachte glooiing. Omdat
// plekV de plek rekent alsof hij zoveel lager lag, buigen de lagen riet, de voet en de rol vanzelf
// over het raam heen. Geeft { z: hoeveel hoger (eenheden), s: de schaal voor de afstand } of null;
// ux, uz is de richting van de helling (daarmee blijft het veld ongeveer een echte afstand).
function bultOp(V, a, q, ux = 0.63, uz = -0.78) {
  let best = null;
  for (const B of V.bulten) {
    if (q * B.kant <= 0) continue;
    const da = Math.abs(a - B.a);
    if (da >= B.w + B.flank) continue;
    const aq = Math.abs(q);
    if (aq <= B.q0) continue;
    // opzij: vlak boven het raam, dan een glooiing die zacht in het dak opgaat
    const ta = da <= B.w ? 1 : 1 - (da - B.w) / B.flank;
    const fa = ta * ta * (3 - 2 * ta);
    const dfa = da <= B.w ? 0 : (6 * ta * (1 - ta)) / B.flank;
    // langs de helling: van niets bij q0 tot vol aan de voet (q1)
    const tq = klem((aq - B.q0) / (B.q1 - B.q0), 0, 1);
    const fq = tq * tq * (3 - 2 * tq);
    const dfq = aq < B.q1 ? (6 * tq * (1 - tq)) / (B.q1 - B.q0) : 0;
    const z = B.h * fa * fq;
    if (z <= 0 || (best && best.z >= z)) continue;
    const La = B.h * dfa * fq;
    const Lq = B.h * fa * dfq;
    const g2 = 1 + ux * ux * (La * La + Lq * Lq) + 2 * ux * uz * Lq;
    best = { z, s: Math.min(1, 1 / Math.sqrt(Math.max(g2, 0.2))) };
  }
  return best;
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
    if (P.U) {
      // een uitbouw: onder zijn eigen dakrand (U.randLijn geeft de hoogte van die lijn)
      const zl = P.U.randLijn ? P.U.randLijn(P, al, x, y, z) : null;
      if (zl !== null) d = Math.max(d, H.sp ? baan(zl - z, E(6), E(11)) : baan(zl - z, 0, E(8)));
      continue;
    }
    if (H.plat) {
      // onder de borstwering op zijn klossen, en een smalle schaduw onder elke lijst
      if (z > H.zBorst0) continue;
      const zLijn = H.zKlos0 - 0.82 * H.uitB;
      d = Math.max(d, H.sp ? baan(zLijn - z, E(2), E(9)) : baan(zLijn - z, 0, E(7)));
      for (const zb of H.banden || []) d = Math.max(d, 0.55 * baan(zb - E(3.4) - z, E(1.2), E(2)));
      continue;
    }
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
      let zLijn = P.zijde === 'q' ? V.voetZ(a) - H.randK * H.dik - 0.82 * (V.voetQ(a) - V.qW) : H.voetZ - H.randK * H.dik - 0.82 * H.ov;
      // onder een bult in het riet loopt de rand mee omhoog
      if (V.bulten && P.zijde === 'q') zLijn += bultOp(V, a, V.voetQ(a))?.z || 0;
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
  // het dak van een uitbouw weet zelf waar het ligt (C.deel.plek)
  const P = C.deel.plek ? C.deel.plek(x, y, z) : dakPlek(H, x, y, z);
  const V = P.V;
  // de kopse kant bij een vrije gevel: stoppels
  const na = C.nx * V.Ax + C.ny * V.Ay;
  if (Math.abs(na) > 0.6 && P.langs > 0 && V.eind[na > 0 ? 1 : 0] === 'gevel' && Math.abs(P.a) > V.XR - (V.kopR ?? H.kopR) - 5) {
    const h = hash(C.px, C.py, H.zaad + 5) % 9;
    return (h < 2 ? -1.4 : h > 6 ? 0.6 : 0) - 0.3;
  }
  const lw = lapWaarde(H, V, P.a, P.hE, P.q);
  const inLap = lw < 0;
  // De lap ligt bovenop: onder zijn onderrand de schaduw van de halmen die eroverheen hangen, en
  // opzij, aan de kant van de zon af, een smallere schaduw.
  const L = H.lap;
  const zonKant = L ? (P.a - L.a) * Math.sign(V.Ax - V.Ay) < 0 : false; // links in beeld
  if (L && !inLap && lw < 2.4) {
    if (P.hE < L.h - L.rh * 0.4) return lw < 1.3 ? -2.3 : -1.4;
    if (!zonKant && P.hE < L.h + L.rh * 0.5 && lw < 1.1) return -1.2;
  }
  const fase = (P.hE + V.laagGolf(P.a) + (inLap ? L.fase * H.laagL : 0)) / H.laagL;
  const k = Math.floor(fase);
  const f = fase - k;
  // halmen: vaste kolommen langs de nok (een kolom is op het scherm één pixel breed); in de lap
  // langer en rechter, want het riet is nog niet verweerd
  const kol = Math.floor(P.a / 1.414 + 0.4 * Math.sin(P.sE * 0.07 + k));
  const zk = H.zaad + V.i * 31;
  const spring = hash(kol, 0, zk + 2) % 11;
  const stukL = inLap ? 7 + (hash(kol, 1, zk + 23) % 7) : 4 + (hash(kol, 1, zk) % 6);
  const stuk = Math.floor((P.sE + spring) / stukL);
  const halm = hash(kol, stuk, zk + (inLap ? 17 : 1)) % 12;
  let s = inLap ? (halm < 2 ? -0.9 : halm > 8 ? 1 : 0) : halm < 3 ? -1.4 : halm > 8 ? 1.1 : 0;
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
    // Vers riet is iets lichter, en geler waar een halm licht vangt: het goud van nieuw stro,
    // nog niet grauw geworden. De rand: links in de zon, bovenaan duikt de lap onder de laag
    // erboven, en onderaan vangen de punten van de halmen licht.
    let rand = 0;
    if (lw > -1.6) {
      if (P.hE > L.h + L.rh * 0.55) rand = -1.2;
      else if (P.hE < L.h - L.rh * 0.55) rand = 0.5;
      else rand = zonKant ? 0.9 : -0.9;
    }
    if (halm > 7 && rand === 0 && s > -1) return { ramp: 'goud', plus: s + L.tint - 0.3 };
    return { plus: s + L.tint + rand };
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
  // hoekstenen op een muur van veldsteen
  if (H.hoekStenen && C.nz < 0.5) {
    const m = opMuur(H, x, y, z);
    if (m && m.P.wand === 'veldsteen') {
      const q = hoeksteen(H, m);
      if (q) return q;
    }
  }
  // de toren: lijsten en klossen van gehakte steen
  if (H.plat && z < H.zBorst0 + 0.5 && (z > H.zKlos0 - 0.5 || H.banden.some((zb) => Math.abs(z - zb) < E(2.9)))) {
    const U = (Math.abs(ny) >= Math.abs(nx) ? (ny >= 0 ? -x : x) : nx >= 0 ? y : -y) * SQ;
    const st = steenOp(U, z * PXH, 1, 1, H.zaad * 13 + 7, 60, 26, 12);
    return { stap: steenStap(st, C.stap + 0.5, C.px, C.py, { voeg: 2.2, vlak: true, zaad: H.zaad }) + gehaktPatroon(H, C) };
  }
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
  const kl = steenKleur(st, H.hoekStenen);
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

// Hout op balken en planken, zoals houtTex in toren.cjs, maar met een grovere nerf: op een schuine
// balk in de schaduw gaf een nerf van drie eenheden een dambord (twee pixels per streep is te fijn).
function balkPatroon(C, oud = false) {
  const p = C.deel;
  if (!p.lok) return 0;
  const [u, w] = p.lok(C.x, C.y, C.z);
  if (p.naad && p.naad - Math.abs(w) < 0.9) return w > 0 ? -1.8 : 0.5;
  let s = p.toon ?? 0;
  const nerf = Math.sin(w * 0.85 + Math.sin(u * 0.05 + p.zaad) * 1.7 + p.zaad);
  if (nerf > 0.84) s -= 0.75;
  else if (nerf < -0.9) s += 0.45;
  if (Math.abs(u) > p.L / 2 - 1.2) s -= 0.7;
  if (oud && ruis2(u * 0.08 + p.zaad, w * 0.3, 13) > 0.7) s -= 0.8;
  if (Math.abs(Math.abs(u) - (p.L / 2 - 3.2)) < 0.8 && Math.abs(w) < 0.8) return { ramp: 'ijzer', stap: oud ? 1.4 : 2.6 };
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
  if (p.arm) return armeDeur(H, C, p, a, v);
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

// Een arme deur (o.deur.arm): brede, ruwe planken met twee klampen en een schoor ertussen, van de
// scharnierkant (links) onder naar de klinkkant boven, en geen ijzer: hij hangt aan leren lussen, en
// je trekt hem dicht aan een touw door een gat.
function armeDeur(H, C, p, a, v) {
  const hb = p.hb;
  const hh = p.hh;
  const plankB = (H.sp ? 11 : 9) / SQ;
  const pa = (a + hb) / plankB;
  const i = Math.floor(pa);
  const fr = (pa - i) * plankB;
  if (fr < 1.414 && i > 0) return -2.3;
  let s = ((hash(i, 3, H.zaad) % 3) - 1) * 0.55 - 0.2;
  // de lussen aan de scharnierkant, over de klampen
  const lus = (vk) => Math.abs(v - vk * hh) < E(3) && a < -hb + 5;
  if (lus(0.55) || lus(-0.6)) return { ramp: 'leer', stap: 2.2 + (hash(Math.floor(C.px), Math.floor(C.py), 5) % 2) * 0.8 };
  // de klampen: een lichte bovenkant, een donkere onderkant
  for (const vk of [0.55, -0.6]) {
    const dv = v - vk * hh;
    if (Math.abs(dv) < E(5)) return s + (dv > E(3.5) ? 0.8 : dv < -E(3.5) ? -1.4 : 0.4);
  }
  // de schoor van links onder naar rechts boven, tussen de klampen
  const [a0, v0, a1, v1] = [-hb + 2, -0.6 * hh + E(5), hb - 2, 0.55 * hh - E(5)];
  const L = Math.hypot(a1 - a0, v1 - v0);
  const t = ((a - a0) * (a1 - a0) + (v - v0) * (v1 - v0)) / (L * L);
  const dl = ((a - a0) * (v1 - v0) - (v - v0) * (a1 - a0)) / L;
  if (t > 0 && t < 1 && Math.abs(dl) < E(4.2)) return s + (dl > E(3) ? -1.3 : dl < -E(3) ? 0.7 : 0.35);
  // het gat met het touw, aan de klinkkant
  const dg = Math.hypot(a - hb * 0.6, v - hh * 0.04);
  if (dg < E(1.6)) return -2.6;
  const dr = Math.hypot(a - hb * 0.6, v - hh * 0.04 + E(4.5));
  if (Math.abs(dr - E(4)) < E(1) && v < hh * 0.04 - E(2)) return { ramp: 'bot', stap: 2.6 };
  const nerf = Math.sin(a * 1.7 + Math.sin(v * 0.09 + i) * 2.6 + i * 1.3);
  if (nerf > 0.8) s -= 0.75;
  if (hash(i, Math.floor(v / 9), H.zaad + 3) % 13 === 0) s -= 0.6; // een kwast
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

// ---------------------------------------------------------------- de wanden
//
// Een wand is een patroon op de muur in de wandcoördinaten van zijn stuk: u (px, van links naar
// rechts in beeld) en h (px boven de grond). Het hout van het vakwerk is vorm (de balken); planken,
// leem en stenen zijn patroon; stammen zijn allebei: de muur bolt per stam uit, en op de hoeken
// steken de koppen als eigen vormen naar buiten.

// Op welk stuk muur ligt punt (x, y, z), en waar? Alleen de muren die je ziet hebben stukken; een
// punt daarbuiten krijgt null (en dan een gewoon patroon zonder wandcoördinaten).
function opMuur(H, x, y, z) {
  let beste = null;
  let bn = Infinity;
  let bal = 0;
  for (const P of H.stukken) {
    if (z < P.S.z0 - 1 || z > P.S.z1 + 1) continue;
    const [al, n] = P.lokAN(x, y, z);
    if (al < -4 || al > P.len + 4) continue;
    const an = Math.abs(n - P.voor * 0.5);
    if (an < bn && an < P.voor * 0.5 + 4) {
      bn = an;
      beste = P;
      bal = al;
    }
  }
  return beste ? { P: beste, u: bal * SQ, h: z * PXH } : null;
}

// de bovenkant van de stenen plint onder een wand, in px (plinten van planken en stammen zijn lager)
const plintLijn = (H, wand, x, y) => steenLijn(H, x, y) - H.hS * (1 - (PLINT[wand] ?? 1));
const plintOp = (H, P, u) => {
  if (P.X.plint) return P.X.plint(u, P);
  const [x, y] = P.pos(u, 0, 0);
  return plintLijn(H, P.wand, x, y);
};

// Hoever een stam voor de muur uitsteekt, in eenheden, bij een stam van gewone dikte.
const STAM = (H) => (H.sp ? 16 : 13);
const blokUit = (H) => (STAM(H) / 2 / PXH) * 0.72;
// De stammen: op de lange muren (zijde q) liggen ze tussen de naden, op de kopmuren een halve stam
// hoger, zodat ze op de hoeken om en om in elkaar grijpen. Geeft [h0, h1, k] (px boven de plint).
function stamRij(H, zijde, h) {
  const N = H.naden;
  if (zijde === 'q') {
    let k = 0;
    while (k + 2 < N.length && N[k + 1] <= h) k++;
    return [N[k], N[k + 1], k];
  }
  if (h < (N[0] + N[1]) / 2) return [0, (N[0] + N[1]) / 2, -1];
  let k = 0;
  while (k + 3 < N.length && (N[k + 1] + N[k + 2]) / 2 <= h) k++;
  return [(N[k] + N[k + 1]) / 2, (N[k + 1] + N[k + 2]) / 2, k];
}
// De stammen lopen niet recht: de naden golven een pixel, maar niet bij de hoeken, waar de koppen
// uitsteken. m loopt langs de muur (eenheden), half is de halve lengte.
const stamGolf = (H, m, half, z) => H.sch * 1.1 * Math.sin(m * 0.027 + z * 0.04 + H.zaad) * Math.max(0, 1 - (m / half) ** 2);

// Hoeveel een blokhutmuur op deze plek uitbolt: een halve ellips per stam, met in de naad een
// strook leem die een kwart diep ligt. as, qs: al terug van de helling.
function stamBult(H, V, S, as, qs, x, y, z) {
  const ha = V.ha + S.uit;
  const hq = V.hq + S.uit;
  const zijde = Math.abs(qs) - hq >= Math.abs(as) - ha ? 'q' : 'a';
  const m = zijde === 'q' ? as : qs;
  const hp = z * PXH - plintLijn(H, 'blokhut', x - H.hellX * z, y - H.hellY * z) + stamGolf(H, m, zijde === 'q' ? ha : hq, z);
  if (hp <= 0) return 0;
  const [h0, h1] = stamRij(H, zijde, hp);
  const t = (2 * (hp - h0)) / (h1 - h0) - 1;
  const A = (blokUit(H) * (h1 - h0)) / STAM(H);
  return Math.max(A * Math.sqrt(Math.max(0, 1 - t * t)), A * 0.24);
}

// Planken: staande delen van ongelijke breedte met een kier ertussen, niet allemaal even recht
// (een plank staat een fractie scheef, en daarmee de naad), een vervangen plank die lichter is,
// spijkers waar de regels achter zitten, en onderaan houdt elke plank op een eigen hoogte op.
function plankenVan(H, P) {
  if (P.planken) return P.planken;
  const randen = [];
  const kant = [];
  let u = -4 - (hash(P.idx, 1, H.zaad + 60) % 6);
  const f = rnd(P.idx, 2, H.zaad + 60) * 6.3;
  for (let i = 0; u < P.Lu + 20; i++) {
    randen.push(u);
    kant.push(H.sch * (0.006 * Math.sin(i * 0.9 + f) + 0.002 * ((hash(i, P.idx, H.zaad + 62) % 3) - 1)));
    const h = hash(i, P.idx, H.zaad + 63);
    u += (H.sp ? 9 : 7) + (h % 5) + (h % 11 === 0 ? 5 : 0);
  }
  P.planken = { randen, kant };
  return P.planken;
}
function plankPatroon(H, C) {
  const m = opMuur(H, C.x, C.y, C.z);
  if (!m) return hash(C.px, C.py, 3) % 4 === 0 ? -0.5 : 0;
  const { P, u, h } = m;
  const { randen, kant } = plankenVan(H, P);
  const rand = (i) => randen[i] + kant[i] * (h - 60);
  let i = 0;
  while (i + 2 < randen.length && randen[i + 1] <= u) i++;
  while (i > 0 && u < rand(i)) i--;
  while (i + 2 < randen.length && u >= rand(i + 1)) i++;
  const w = rand(i + 1) - rand(i);
  const x = u - rand(i);
  const hh = hash(i, P.idx, H.zaad + 64);
  // onderaan: elke plank houdt ergens anders op, met een donkere kopse kant en wat aanslag
  const plint = plintOp(H, P, u);
  const eind = plint + (hh >> 5) % 4;
  if (h < eind + 1.2) return -2;
  if (h < plint + 9 && hash(Math.floor(u), Math.floor(h), H.zaad + 65) % 5 === 0) return { ramp: 'mos', stap: 2 };
  let s = ((hh % 5) - 2) * 0.35;
  if (x < 1) return s - 2.4; // de kier
  if (x < 2) s += 0.5; // de rand in de zon
  else if (w - x < 1.3) s -= 0.6;
  // nerf in de lengte en een kwast
  const nerf = Math.sin(x * 1.7 + Math.sin(h * 0.05 + i) * 1.8 + i * 2.1);
  if (nerf > 0.86) s -= 0.6;
  const kh = 30 + ((hh >> 8) % 90);
  if ((hh >> 3) % 3 === 0 && Math.abs(h - kh) < 1.6 && Math.abs(x - w * 0.45) < 1.3) s -= 1.4;
  // spijkers op de regels erachter
  const X = P.X;
  const regels = [plint + 14, X.plaatH - 16];
  if (X.lagen !== 1) regels.push((plint + X.plaatH) / 2);
  for (const hr of regels) if (Math.abs(h - hr - (hh % 3) * 0.4) < 0.7 && Math.abs(x - w / 2) < 0.7) return { ramp: 'ijzer', stap: 2 };
  // een vervangen plank: vers hout, warmer en lichter dan de rest
  if (hh % 13 === 5) return { ramp: 'hout', plus: s + (H.hout === 'schors' ? -0.4 : 0.8) };
  return s;
}

// Vlechtwerk met leem: tussen het vakwerk het vlechtwerk van twijgen om staken, en daarop leem, met
// de vingers aangesmeerd maar nooit overal: in de eerste proef lag het leem bijna overal en las de
// muur als vuil pleister. Nu ligt het vlechtwerk op zo'n derde bloot, zodat je ziet wat het is.
function leemPatroon(H, C) {
  const m = opMuur(H, C.x, C.y, C.z);
  const u = m ? m.u : (C.x - C.y) * SQ;
  const h = m ? m.h : C.z * PXH;
  const zk = H.zaad * 5 + (m ? m.P.idx * 17 : 0);
  const gat = ruis2(u * 0.04, h * 0.055, zk + 71) * 0.72 + ruis2(u * 0.11, h * 0.14, zk + 72) * 0.28 + 0.1 * klem((110 - h) / 50, 0, 1);
  if (gat > 0.55) return vlechtwerk(H, u, h, zk);
  // de rand van het leem: dik aangesmeerd, met een schaduwlijn eronder en een lichte rand erboven
  if (gat > 0.52) return hash(Math.floor(u), Math.floor(h), zk) % 3 ? -1.1 : 0.8;
  let s = 0;
  const n = ruis2(u * 0.06, h * 0.06, zk + 73);
  if (n > 0.7) s -= 0.6;
  else if (n < 0.25) s += 0.5;
  // vegen van de hand: korte liggende streepjes
  if (hash(Math.floor(u / 6), Math.floor(h / 2.4), zk + 74) % 9 === 0) s -= 0.5;
  if (hash(Math.floor(u), Math.floor(h), zk + 75) % 41 === 0) s -= 0.8;
  return s;
}
// Het vlechtwerk zelf: staken om de dertien pixels, en twijgen van vier pixels hoog die om en om
// voor en achter een staak langs gaan, zodat ze van staak tot staak bol staan: licht bovenop, een
// donkere kier eronder, en bij de staak duiken ze weg.
function vlechtwerk(H, u, h, zk) {
  const th = H.sp ? 4.2 : 3.4;
  const rij = Math.floor(h / th);
  const fh = (h - rij * th) / th;
  const sb = H.sp ? 13 : 10;
  const kol = Math.floor(u / sb);
  const fu = (u - kol * sb) / sb;
  // bij staak kol gaat de twijg ervoor langs of erachter, bij de volgende staak andersom
  const voor = (kol + rij) % 2 === 0;
  const diepte = Math.cos(Math.PI * fu) * (voor ? 1 : -1);
  let s = 0.2 + 0.6 * diepte;
  if (fh < 0.22) s = -2.1; // de kier tussen twee twijgen
  else if (fh > 0.72) s += 0.6; // de bovenkant vangt licht
  // de staak, waar de twijg erachter langs gaat
  const naStaak = Math.min(fu, 1 - fu) * sb;
  const erachter = fu < 0.5 ? !voor : voor;
  if (erachter && naStaak < 1.6) s = 0.3 + (fu < 0.5 ? 0.4 : -0.4);
  if (hash(kol, rij, zk + 76) % 7 === 0) s -= 0.5;
  // de twijgen in het andere hout dan de balken, anders lezen ze als een balk
  return { ramp: H.hout === 'schors' ? 'hout' : 'schors', plus: s };
}

// De lemen wand van een hut (ronde 4b): leem met stro, met de hand op het vlechtwerk gesmeerd tot
// het dicht is. Waar het leem dun ligt (onderaan, waar de regen opspat, en op de bulten van de tenen)
// schijnt het vlechtwerk erdoor. Droog is het vaal en licht, met krimpscheuren, strootjes en de
// vegen van de hand; nat (bouwfasen-sdf.cjs, fase leem) is het dezelfde wand, met dezelfde vegen en
// dezelfde dunne plekken, maar donker en zonder scheuren.
function lemenPatroon(H, C, nat = false) {
  const m = opMuur(H, C.x, C.y, C.z);
  const u = m ? m.u : (C.x - C.y) * SQ;
  const h = m ? m.h : C.z * PXH;
  const zk = H.zaad * 5 + (m ? m.P.idx * 17 : 0);
  // waar het leem dun ligt
  const dun = ruis2(u * 0.045, h * 0.06, zk + 81) * 0.72 + ruis2(u * 0.12, h * 0.15, zk + 82) * 0.28 + 0.2 * klem((34 - h) / 30, 0, 1);
  if (dun > 0.77) {
    const v = vlechtwerk(H, u, h, zk);
    return nat ? { ...v, plus: v.plus - 0.5 } : v;
  }
  // de rand van het leem: dik aangesmeerd, met een schaduwlijn eronder en een lichte rand erboven
  if (dun > 0.745) return hash(Math.floor(u), Math.floor(h), zk) % 3 ? -1.2 : 0.7;
  let s = 0;
  const n = ruis2(u * 0.05, h * 0.05, zk + 83);
  if (n > 0.7) s -= 0.65;
  else if (n < 0.26) s += 0.55;
  // de vegen van de hand: liggende bogen, uitgerekte vlekken die een beetje golven
  const veeg = ruis2(u * 0.07 + Math.sin(h * 0.21 + u * 0.05) * 0.35, h * 0.24, zk + 84);
  if (veeg > 0.72) s -= 0.6;
  else if (veeg < 0.22) s += 0.5;
  // korrels zand en klei
  if (hash(Math.floor(C.px), Math.floor(C.py), zk + 90) % 11 === 0) s -= 0.35;
  // stro in het leem: korte lichte streepjes
  if (hash(Math.floor(C.px / 2), Math.floor(C.py), zk + 86) % 67 === 0) return { ramp: 'stro', stap: nat ? 2.2 : C.stap - 0.3 };
  if (nat) {
    // net aangesmeerd: vlekken waar het natter is, en het natst onderaan
    if (ruis2(u * 0.09, h * 0.09, zk + 88) > 0.62) s -= 0.55;
    if (h < 40) s -= 0.5 * klem((40 - h) / 30, 0, 1);
    return s;
  }
  // krimpscheuren: haarlijnen, meest van boven naar onder, in een paar stukken van de muur
  const sc = ruis2(u * 0.055, h * 0.016, zk + 87);
  if (Math.abs(sc - 0.5) < 0.012 && ruis2(u * 0.02, h * 0.02, zk + 89) > 0.6) return s - 1.6;
  // onderaan spat de regen de grond tegen de muur
  if (h < 18) s -= 0.8 * klem((18 - h) / 14, 0, 1);
  return s;
}

// Stammen op de muur: nerf in de lengte, scheuren, een kwast, en in de naden leem of mos.
function blokPatroon(H, C) {
  const p = C.deel;
  if (p.stomp) return stompPatroon(H, C, p.stomp);
  const m = opMuur(H, C.x, C.y, C.z);
  if (!m) return 0;
  const { P, u, h } = m;
  const half = P.zijde === 'q' ? P.V.ha + P.S.uit : P.V.hq + P.S.uit;
  const al = u / SQ;
  const hp = h - plintOp(H, P, u) + stamGolf(H, P.langs(u), half, C.z);
  if (hp < 0) return 0;
  const [h0, h1, k] = stamRij(H, P.zijde, hp);
  const t = (hp - h0) / (h1 - h0);
  const zk = H.zaad + P.V.i * 7 + (P.zijde === 'q' ? 1 : 2);
  // de naad: leem, soms mos
  if (t < 0.13 || t > 0.9) {
    if (ruis2(al * 0.05, k * 0.8, zk + 3) > 0.7) return { ramp: 'mos', stap: klem(C.stap * 0.5, 1, 3) };
    return { ramp: 'perkament', stap: C.stap - 1.4 + (t < 0.06 || t > 0.96 ? -0.8 : 0) };
  }
  return stamHuid(H, k, zk, al, t, C);
}
// de huid van een stam, in de lengte: een eigen toon per stam, nerf, scheuren en een kwast
function stamHuid(H, k, zk, l, t, C) {
  const hs = hash(k, zk, 91);
  let s = ((hs % 5) - 2) * 0.3;
  const nerf = Math.sin(t * 19 + Math.sin(l * 0.06 + k) * 2.2 + k * 1.3);
  if (nerf > 0.85) s -= 0.6;
  // een scheur: een donkere lijn over een eind van de stam
  const sk = Math.floor(l / 23);
  const sh = hash(k, sk, zk + 92);
  if (sh % 4 === 0 && Math.abs(t - (0.35 + (sh % 7) * 0.05)) < 0.06) s -= 1.4;
  // een kwast
  if (sh % 11 === 3 && Math.abs(l - (sk * 23 + 11)) < 1.6 && Math.abs(t - 0.5) < 0.12) s -= 1.6;
  // schors die er nog aan zit, onderop de stam
  if (t > 0.72 && ruis2(l * 0.08, k * 1.7, zk + 93) > 0.66) return { ramp: 'schors', plus: s - 0.4 };
  if (hash(C.px, C.py, zk + 94) % 23 === 0) s -= 0.6;
  return s;
}
// de kop van een stam op de hoek: kopse kant met jaarringen, en de huid van dezelfde stam
function stompPatroon(H, C, st) {
  const [l, dn, dz] = st.lok(C.x, C.y, C.z);
  const rr = Math.hypot(dn / st.A, dz / st.rz);
  if (l > st.l1 - 1.3) {
    if (rr > 0.84) return { ramp: 'schors', stap: C.stap - 1.2 };
    const ring = Math.floor(rr * 5 + 0.15 * Math.sin(Math.atan2(dz, dn) * 3 + st.k)) % 2;
    let s = C.stap + 0.5 + (ring ? -0.6 : 0.2);
    if (rr < 0.14) s -= 1;
    // een krimpscheur van het hart naar buiten
    const hoek = Math.atan2(dz / st.rz, dn / st.A);
    if (st.k % 3 === 0 && Math.abs(hoek - st.scheur) < 0.12 && rr > 0.2) s -= 1.6;
    return { ramp: 'hout', stap: s };
  }
  return stamHuid(H, st.k, st.zk, l * 1.3, (klem(dz / st.rz, -1, 1) + 1) / 2, C);
}

// Hoekstenen op een muur van veldsteen: grote, recht gehakte stenen, om en om lang en kort, en op
// de ene muur lang waar de andere kort is.
function hoeksteen(H, m) {
  const { P, u, h } = m;
  if (h > P.X.plaatH + 8 && !H.plat) return null;
  let du;
  let kant;
  if (P.links === 'hoek' && u < 34) {
    du = u;
    kant = 0;
  } else if (P.rechts === 'hoek' && P.Lu - u < 34) {
    du = P.Lu - u;
    kant = 1;
  } else return null;
  const hc = H.sp ? 17 : 14;
  const rij = Math.floor(h / hc);
  const fh = h - rij * hc;
  const id = hash(rij, P.V.i * 4 + kant * 2 + (P.zijde === 'q' ? 0 : 1), H.zaad + 81);
  const lang = (rij + (P.zijde === 'q' ? 0 : 1) + kant) % 2 === 0;
  const len = (lang ? (H.sp ? 26 : 21) : H.sp ? 14 : 11) + (id % 4) - 1;
  if (du > len) return null;
  if (fh < 1.1 || du > len - 1.1) return { ramp: 'veldsteen', plus: -2.4 };
  let s = 0.7 + ((id >> 4) % 3) * 0.3;
  if (fh > hc - 1.5) s += 0.9;
  if (du < 1.5) s += 0.5;
  return { ramp: 'veldsteen', plus: s };
}

// ---------------------------------------------------------------- de dunne daken
//
// Spanen, leien en pannen liggen in rijen die van de voet naar de nok tellen (hE, doorlopend door
// de kil), en langs de nok (a, per vleugel). In de kil ligt bij pannen en leien een goot van lood.

function dakPatroon(H, C) {
  // het dak van een uitbouw weet zelf waar het ligt, en kan van iets anders zijn (C.deel.plek)
  const P = C.deel.plek ? C.deel.plek(C.x, C.y, C.z) : dakPlek(H, C.x, C.y, C.z);
  // ook aan de kant van het dak van het huis ligt de goot langs een dakkapel
  if (!C.deel.plek && P.kilD === undefined) {
    for (const K of H.kapellen || []) {
      const [a, q] = K.F.lok(C.x, C.y);
      if (a < K.F.aJ - 4 || a > 2 || Math.abs(q) > K.F.voetQ(0) + 2) continue;
      const PK = K.plek(C.x, C.y, C.z);
      if (Math.abs(PK.dw) < H.dik + 6) P.kilD = P.dw - PK.dw;
      break;
    }
  }
  const V = P.V;
  const D = V.D || H.D;
  const dak = V.dak || H.dak;
  // de onderrand en de kopse kant van de plaat
  if (P.e > -1.4 && C.nz < 0.45) return -1.6;
  if (P.dm < -(V.dik ?? H.dik) + 1.5) return { ramp: 'schors', stap: 1.4 };
  // de goot in de kil: een baan lood, met de gezaagde rand van de pannen erlangs in de schaduw
  if (P.kilD !== undefined) {
    const kd = Math.abs(P.kilD);
    const gw = dak === 'spanen' ? 2.6 : 5;
    if (kd < gw) return { ramp: 'veldsteen', stap: klem(C.stap * 0.6 + 0.4, 1, 5) + (kd < 1.2 ? -0.8 : 0) };
    if (kd < gw + 1.6) return -2.2;
  }
  const fase = (P.hE + V.laagGolf(P.a) * D.golf) / D.rij;
  const k = Math.floor(fase);
  const fu = (fase - k) * D.rij;
  const dirA = Math.sign(V.Ax - V.Ay) || 1; // gaat a in beeld naar rechts?
  if (dak === 'pannen') return panPatroon(H, C, P, V, k, fu, dirA, D);
  return schubPatroon(H, C, P, V, fase, dirA, D, dak);
}

// Holle pannen in banen: de vorm (dakReliëf) doet de rol en de trog. Hier de neus onderaan elke
// rij, die onder de rol een pixel lager ligt, een naad tussen de banen, een enkele vervangen pan,
// en mos in de trog van een oude.
function panPatroon(H, C, P, V, k, fu, dirA, D = H.D) {
  const pu0 = (P.a + V.panDrift(P.hE)) / D.pan;
  const j = Math.floor(pu0);
  const pu = pu0 - j;
  const id = hash(k, j, H.zaad * 3 + V.i + 11);
  let s = id % 7 === 0 ? -0.7 : id % 11 === 1 ? 0.6 : 0;
  const neus = pu < 0.5 ? 1.9 : 1.1;
  if (fu < neus) return s - 2.3;
  if (fu < neus + 1.1) s += 0.7;
  // de naad: de trog van de ene pan schuift onder de rol van de volgende
  const naad = dirA > 0 ? pu : 1 - pu;
  if (naad < 0.07) s -= 1.3;
  if (id % 47 === 7) return { plus: s + 1.1 };
  if (id % 61 === 3 && pu > 0.55 && fu < neus + 4 && P.hE < 80) return { ramp: 'den', stap: klem(1 + C.stap * 0.3, 1, 3) };
  return s;
}

// Leien en spanen: stukken van ongelijke breedte in rijen, met de naden verspringend. Geen rij ligt
// op een lijn: elke lei of spaan zit een fractie hoger of lager en een tikje scheef. Onder elke
// rij een schaduwlijn en daarboven de lichte rand, links van elk stuk een naad.
function schubPatroon(H, C, P, V, fase, dirA, D = H.D, dak = H.dak) {
  const lei = dak === 'leien';
  const U = -P.a * dirA; // neemt naar links in beeld toe, zoals bij steenOp
  const zr = H.zaad * 17 + V.i * 5 + (lei ? 3 : 7);
  const Hh = fase * D.rij;
  const scheef = (st) => {
    const mid = (st.u0 + st.u1) / 2;
    const half = (st.u1 - st.u0) / 2;
    return H.sch * ((((st.id >> 5) % 7) - 3) * (lei ? 0.3 : 0.42) + (((st.id >> 9) % 5) - 2) * 0.22 * ((U - mid) / half));
  };
  const st = steenOp(U, Hh, 1, 1, zr, D.rij, D.lang, D.spreiding);
  const pb = st.pb - scheef(st);
  // hangt het stuk erboven hier een fractie overheen? Dan is dit zijn onderrand.
  if (st.pt < 1.3) {
    const bo = steenOp(U, Hh + st.pt + 0.05, 1, 1, zr, D.rij, D.lang, D.spreiding);
    const ob = scheef(bo);
    if (ob < -st.pt) return -ob - st.pt < 1 ? -2.1 : 0.6;
  }
  if (pb < 0) return -2.1; // net onder de rand van een stuk dat hoger begint: zijn schaduw
  const id = st.id;
  let s = lei ? ((id % 3) - 1) * 0.3 : ((id % 5) - 2) * 0.35;
  if (pb < 1) return s - 2.1;
  if (pb < 2.1) s += lei ? 0.7 : 0.5;
  // de naden tussen de stukken: links in de zon, rechts in de schaduw
  if (st.pl < (lei ? 1 : 1.2)) return s - (lei ? 1.9 : 2.4);
  if (st.pl < 2.1) s += 0.5;
  else if (st.pr < 1.2) s -= 0.6;
  if (lei) {
    // een enkele donkere of lichtere lei, heel soms een warmere die er later in is gezet, en oud
    // mos laag op het dak
    if (id % 13 === 0) s -= 0.9;
    else if (id % 23 === 4) s += 0.7;
    if (id % 97 === 6) return { ramp: 'bot', plus: s - 0.6 };
    if (id % 71 === 11 && P.hE < 70 && pb > 2) return { ramp: 'den', stap: klem(1 + C.stap * 0.3, 1, 3) };
    return s;
  }
  // spanen: nerf in de lengte (langs de helling), een enkele verse spaan, oud mos laag op het dak
  const nerf = hash(Math.floor((U - st.u0) / 2.3), id, zr + 1) % 5;
  if (nerf === 0) s -= 0.6;
  if (id % 89 === 5) return { ramp: 'hout', plus: s + (H.dakHout === 'schors' ? -1.4 : 0.7) };
  // oud mos: alleen onderaan de spaan, waar het vocht blijft staan, in kleine plekken laag op het dak
  if (P.hE < 55 && pb < D.rij * 0.45 && ruis2(P.a * 0.09, P.hE * 0.1, zr + 2) > 0.76) return { ramp: 'den', stap: klem(0.8 + C.stap * 0.3, 1, 3) };
  return s;
}

// De nok van een dun dak: nokpannen of nokstenen, met een naad bij elke overlap.
function nokDunPatroon(H, C) {
  const p = C.deel;
  const l = p.langs(C.x, C.y, C.z);
  const L = H.dak === 'pannen' ? H.D.nokL : 19;
  const j = Math.floor(l / L);
  const f = l - j * L;
  const id = hash(j, p.deel, H.zaad + 97);
  let s = ((id % 5) - 2) * 0.3;
  if (f < 1.3) return s - 2;
  if (f < 2.6) s += 0.7;
  if (id % 13 === 2) s -= 0.9;
  return s;
}

// ---------------------------------------------------------------- de toren

// De kantelen als gaten in de borstwering: de afstand tot het dichtstbijzijnde gat.
function kantelGat(H, V, as, qs, z) {
  let d = Infinity;
  for (const g of H.kantels) {
    const m = g.zijde === 'q' ? as : qs;
    const n = (g.zijde === 'q' ? qs : as) * g.teken;
    const nMid = (g.zijde === 'q' ? V.hq : V.ha) + H.uitB - H.dikB / 2;
    d = Math.min(d, sdf.doos(m - g.mc, n - nMid, z - (g.zBodem + 40), g.hw, H.dikB / 2 + 4, 40, 0.6));
  }
  return d;
}
// De klossen onder de borstwering: getrapt, onderaan minder ver uit de muur dan bovenaan.
function klossen(H, V, as, qs, z) {
  const zm = (H.zKlos0 + H.zBorst0) / 2;
  const tus = H.sp ? 21 : 17;
  const u = H.uitB;
  let d = Infinity;
  for (const [m, n, wand, lang] of [
    [as, qs, V.hq, V.ha],
    [as, -qs, V.hq, V.ha],
    [qs, as, V.ha, V.hq],
    [qs, -as, V.ha, V.hq],
  ]) {
    if (n < wand - 4) continue;
    const k = Math.round(m / tus);
    const mm = m - k * tus - H.sch * ((hash(k, wand | 0, H.zaad) % 3) - 1) * 0.8;
    const boven = sdf.doos(mm, n - (wand + u / 2), z - (zm + H.zBorst0) / 2, 4.2, u / 2 + 0.5, (H.zBorst0 - zm) / 2 + 0.5, 0.6);
    const onder = sdf.doos(mm, n - (wand + u * 0.28), z - (H.zKlos0 + zm) / 2, 3.8, u * 0.28 + 0.5, (zm - H.zKlos0) / 2, 0.6);
    d = Math.min(d, Math.max(Math.min(boven, onder), Math.abs(m) - (lang + u - 3)));
  }
  return d;
}
// Het lichaam van de toren: een doos die schuin uitloopt aan de voet, met een lijst tussen elke
// verdieping, de borstwering op zijn klossen, en van boven hol tot op de vloer van het dak.
function torenVeld(H) {
  const V = H.vleugels[0];
  const ops = H.openingen;
  const zB1 = H.zDak + 4;
  return (x, y, z) => {
    const dx = x - V.cx;
    const dy = y - V.cy;
    const as = dx * V.Ax + dy * V.Ay - V.hellA * z;
    const qs = dx * V.Qx + dy * V.Qy - V.hellQ * z;
    const tal = z < H.zTalud ? H.talud * (1 - Math.max(z, 0) / H.zTalud) ** 1.5 : 0;
    const bq = bolQ(H, V, as, z) + tal;
    const ba = bolA(H, V, qs, z) + tal;
    let d = sdf.doos(as, qs, z - (zB1 - 3) / 2, V.ha + ba, V.hq + bq, (zB1 + 3) / 2, 1.5);
    for (const zb of H.banden) if (Math.abs(z - zb) < 10) d = Math.min(d, sdf.doos(as, qs, z - zb, V.ha + ba + 2.6, V.hq + bq + 2.6, E(2.8), 0.8));
    if (z > H.zKlos0 - 3) {
      const top = H.zTop + H.sch * E(1.6) * Math.sin(as * 0.05 + qs * 0.043 + V.wF);
      let dp = sdf.doos(as, qs, z - (H.zBorst0 + top) / 2, V.ha + H.uitB, V.hq + H.uitB, (top - H.zBorst0) / 2, 1);
      if (H.kantels.length && z > H.zTop - E(26)) dp = Math.max(dp, -kantelGat(H, V, as, qs, z));
      d = Math.min(d, dp);
      if (z < H.zBorst0 + 1) d = Math.min(d, klossen(H, V, as, qs, z));
    }
    if (z > H.zDak - 8) {
      const bi = H.uitB - H.dikB;
      const vloer = H.zDak + H.vloerAf[0] * as + H.vloerAf[1] * qs;
      d = Math.max(d, -Math.max(Math.abs(as) - (V.ha + bi), Math.abs(qs) - (V.hq + bi), vloer - z));
    }
    if (d > 16) return d;
    for (const op of ops) {
      const ex = x - op.m[0];
      const ey = y - op.m[1];
      const ez = z - op.m[2];
      if (ex * ex + ey * ey + ez * ez > op.r2) continue;
      const [a, v, n] = op.lok(x, y, z);
      const gat = laag(rechthoek(a, v, op.hb, op.hh), n, -op.diep, 16);
      if (-gat > d) d = -gat;
    }
    return d;
  };
}
// De vloer van het dak: platte stenen, met mos waar het water blijft staan.
function vloerPatroon(H, C) {
  const V = H.vleugels[0];
  const [a, q] = V.lok(C.x, C.y);
  const st = steenOp(q, a, 1, 1, H.zaad * 13 + 5, 22, 24, 16);
  const s = steenStap(st, 0, C.px, C.py, { voeg: 2.2, vlak: true, zaad: H.zaad });
  // waar het water blijft staan is de steen donker, en in de voegen daar groeit wat mos
  const laag = -(H.vloerAf[0] * a + H.vloerAf[1] * q);
  const nat = ruis2(a * 0.05, q * 0.05, H.zaad + 9) + laag * 0.25;
  if (nat > 0.95 && (st.pb < 1 || st.pr < 1)) return { ramp: 'den', stap: klem(1 + C.stap * 0.25, 1, 3) };
  if (nat > 0.82) return s - 1;
  return s;
}
// Gehakte steen (lateien, lijsten, klossen): vlak, met een enkele putje.
function gehaktPatroon(H, C) {
  const h = hash(C.px, C.py, H.zaad + 99);
  return h % 19 === 0 ? -0.8 : h % 23 === 0 ? 0.5 : 0;
}

// ---------------------------------------------------------------- het lichaam

// De muren: per vleugel en per verdieping een doos die helt en uitpuilt, samen onder het riet
// afgesneden, met de deuren en ramen eruit.
function rompVeld(H) {
  if (H.plat) return torenVeld(H);
  const Vs = H.vleugels;
  const verd = H.verd;
  const ops = H.openingen;
  const extra = H.extra || [];
  // een blokhut bolt per stam uit (stamBult)
  const blok = Vs.map((V) => verd.map((S, s) => V.wanden[Math.min(s, V.wanden.length - 1)] === 'blokhut'));
  return (x, y, z) => {
    let d = Infinity;
    for (const V of Vs) {
      const dx = x - V.cx;
      const dy = y - V.cy;
      const as = dx * V.Ax + dy * V.Ay - V.hellA * z;
      const qs = dx * V.Qx + dy * V.Qy - V.hellQ * z;
      const bq = bolQ(H, V, as, z);
      const ba = bolA(H, V, qs, z);
      for (let s = 0; s < verd.length; s++) {
        const S = verd[s];
        const hz = (S.z1 - S.z0) / 2;
        let db = sdf.doos(as, qs, z - (S.z0 + hz), V.ha + S.uit + ba, V.hq + S.uit + bq, hz, 1.5);
        if (blok[V.i][s] && Math.abs(db) < 20) db -= stamBult(H, V, S, as, qs, x, y, z) * klem((20 - Math.abs(db)) / 8, 0, 1);
        if (db < d) d = db;
      }
    }
    if (z > H.zOnderMin) d = Math.max(d, onderDak(H, x, y, z));
    // de uitbouwen: elk onder zijn eigen dak afgesneden, niet onder dat van het huis
    for (const U of extra) {
      const du = uitDoos(U, x, y, z);
      if (du < d) d = du;
    }
    if (d > 12) return d;
    for (const op of ops) {
      const ex = x - op.m[0];
      const ey = y - op.m[1];
      const ez = z - op.m[2];
      if (ex * ex + ey * ey + ez * ez > op.r2) continue;
      const [a, v, n] = op.lok(x, y, z);
      const gat = laag(rechthoek(a, v, op.hb, op.hh), n, -op.diep, op.uitGat ?? 14);
      if (-gat > d) d = -gat;
    }
    return d;
  };
}

// De doos van een uitbouw, hellend, onder zijn eigen dak afgesneden (U.onder).
function uitDoos(U, x, y, z) {
  const dx = x - U.cx;
  const dy = y - U.cy;
  const as = dx * U.Ax + dy * U.Ay - U.hellA * z;
  const qs = dx * U.Qx + dy * U.Qy - U.hellQ * z;
  const S = U.verd[0];
  const hz = (S.z1 - S.z0) / 2;
  let d = sdf.doos(as, qs, z - (S.z0 + hz), U.ha, U.hq, hz, U.rond ?? 1.5);
  if (U.onder && d < 30) d = Math.max(d, U.onder(x, y, z));
  return d;
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
    if (H.plat) {
      if (z < H.zDak - 3) return 'steen';
      const V = H.vleugels[0];
      const [a, q] = V.lok(x, y);
      const bi = H.uitB - H.dikB - 1;
      return Math.abs(a - V.hellA * z) < V.ha + bi && Math.abs(q - V.hellQ * z) < V.hq + bi ? 'dakvloer' : 'steen';
    }
    // op de muur van een uitbouw (een dakkapel staat binnen de vleugel, dus die eerst)
    for (const U of H.extra) {
      const S = U.verd[0];
      if (z < S.z0 - 3 || z > S.z1 + 3) continue;
      const [a, q] = U.lok(x, y);
      const d = Math.max(Math.abs(a - U.hellA * z) - U.ha, Math.abs(q - U.hellQ * z) - U.hq);
      if (d > -3 && d < 2.5) return U.mat(x, y, z);
    }
    // welke vleugel, welke verdieping, en dus welke wand
    let V = H.vleugels[0];
    let bd = Infinity;
    for (const W of H.vleugels) {
      const [a, q] = W.lok(x, y);
      const d = Math.max(Math.abs(a - W.hellA * z) - W.ha, Math.abs(q - W.hellQ * z) - W.hq);
      if (d < bd) {
        bd = d;
        V = W;
      }
    }
    let Ub = null;
    for (const U of H.extra) {
      const S = U.verd[0];
      if (z < S.z0 - 3 || z > S.z1 + 3) continue;
      const [a, q] = U.lok(x, y);
      const d = Math.max(Math.abs(a - U.hellA * z) - U.ha, Math.abs(q - U.hellQ * z) - U.hq);
      if (d < bd) {
        bd = d;
        Ub = U;
      }
    }
    if (Ub) return Ub.mat(x, y, z);
    const s = H.lagen === 2 && z >= E(H.h1) ? 1 : 0;
    const wand = V.wanden[Math.min(s, V.wanden.length - 1)];
    if (wand === 'veldsteen') return 'steen';
    if (s === 0 && z < zSteen && z * PXH < plintLijn(H, wand, x - H.hellX * z, y - H.hellY * z)) return 'steen';
    return WANDMAT[wand];
  };
}

// ---------------------------------------------------------------- uitbouwen (ronde 3)
//
// Wat er aan een huis vastzit en zijn silhouet anders maakt dan dat van de buren (ontwerp/beeld.md,
// "De huizenbouwer op ronde vormen", en de leidende referentie: "dingen die uitsteken"):
//
//   kapellen          in het riet een bult waar de lagen overheen buigen, boven een raam in de
//                     knieschot (bultOp, in plekV); op een dun dak een dakkapel met een eigen
//                     zadeldakje dat met een kil in het dak opgaat
//   aanbouw           tegen de lange muur, met een eenzijdig dak onder de dakrand of de
//                     overkraging door; van planken of steen, later aangezet dan het huis
//   erker             op klossen, met een eigen kapje en een eigen stuk muur (dus met patroon)
//   balkon            een houten galerij op palen langs de bovenverdieping, met een deur erop
//   trap              een stenen buitentrap naar een opkamer, met een deur hoger in de muur
//   gevelschoorsteen  tegen de kopgevel, in plaats van die op het dakschild
//   luiken, bakken    naast en onder de ramen
//
// Het zaad kiest ze, met mate (kiesUitbouwen); o.uit = { kapellen: 2, aanbouw: true, ... } vraagt
// ze op, en o.uit = false zet ze uit (dan is het huis dat van ronde 2).
//
// Een uitbouw met eigen muren (aanbouw, erker, dakkapel op een dun dak) is een U: een doos in een
// eigen stelsel zoals een vleugel (a langs, q dwars, +a en +q naar de kijker toe), met eigen
// hoogtes (U.X), eigen stukken muur (stukkenVan) en een eigen dak F: ook een stelsel met een nok
// en een voet zoals een vleugel, zodat plekV, pakAfstand en de patronen er zonder meer mee werken.
// Het dak van het huis zelf rekent nog steeds op één of twee vleugels; een uitbouw is een eigen
// deel in de wereld, en snijdt zijn muren onder zijn eigen dak af (U.onder).

const UIT_LEEG = { kapellen: 0, aanbouw: false, erker: false, balkon: false, trap: false, gevelschoorsteen: false, luiken: null, bakken: 0 };
function geenUitbouw() {
  return { ...UIT_LEEG };
}
// de kleur van de luiken: meestal kaal hout, soms groen of ossenbloedrood, heel soms blauwgrijs
const kleurLuiken = (H, x) => (x < 0.42 ? H.hout : x < 0.7 ? 'den' : x < 0.9 ? 'rood' : 'pet');

// Wat dit huis krijgt. Van de grote uitbouwen hooguit twee, en de meeste huizen één of geen: een
// huis met alles erop is een catalogus, en dan lijken ze weer op elkaar.
function kiesUitbouwen(H, o) {
  const U = geenUitbouw();
  if (o.uit === false) return U;
  const kz = (k) => H.kz(4000 + k);
  if (o.uit && typeof o.uit === 'object') {
    Object.assign(U, o.uit);
    if (U.kapellen === true) U.kapellen = 2;
    if (U.luiken === true) U.luiken = kleurLuiken(H, kz(1));
    if (U.bakken === true) U.bakken = 2;
    return U;
  }
  const L = H.lagen;
  const kansen = {
    kapellen: L === 1.5 ? 0.55 : 0.1,
    aanbouw: 0.2,
    erker: L === 2 ? 0.3 : 0.12,
    balkon: L === 2 ? 0.26 : 0,
    trap: L === 2 ? 0.05 : 0.12,
    gevelschoorsteen: 0.2,
  };
  const namen = Object.keys(kansen);
  const volgorde = namen.map((n, i) => [n, kz(100 + i)]).sort((a, b) => a[1] - b[1]);
  let groot = 0;
  for (const [n] of volgorde) {
    if (groot >= 2) break;
    if (kz(200 + namen.indexOf(n)) >= kansen[n]) continue;
    U[n] = n === 'kapellen' ? (kz(300) < 0.45 ? 2 : 1) : true;
    groot++;
  }
  if (kz(400) < 0.3) U.luiken = kleurLuiken(H, kz(401));
  if (kz(402) < 0.25) U.bakken = kz(403) < 0.4 ? 2 : 1;
  return U;
}

// Een stelsel zoals een vleugel: middelpunt c, A langs en Q dwars (beide naar de kijker toe).
function stelselV(o) {
  const V = { ...o, cx: o.c[0], cy: o.c[1], Ax: o.A[0], Ay: o.A[1], Qx: o.Q[0], Qy: o.Q[1] };
  V.lok = (x, y) => {
    const dx = x - V.cx;
    const dy = y - V.cy;
    return [dx * V.Ax + dy * V.Ay, dx * V.Qx + dy * V.Qy];
  };
  V.wereld = (a, q) => [V.cx + a * V.Ax + q * V.Qx, V.cy + a * V.Ay + q * V.Qy];
  return V;
}
const draai2 = ([x, y], h) => [x * Math.cos(h) - y * Math.sin(h), x * Math.sin(h) + y * Math.cos(h)];

// Hoe hoog (eenheden) de onderkant van het dak van vleugel V boven plek (a, q) ligt, met de rol aan
// de voet; Infinity waar er geen dak meer boven zit. Aan de voorzichtige kant: de bolling en de
// lagen tillen de onderkant alleen maar op.
function dakOnderkant(H, V, a, q) {
  const aq = Math.abs(q);
  const z0 = V.nokZ(a);
  const q1 = V.voetQ(a);
  const z1 = V.voetZ(a);
  const cos = q1 / Math.hypot(q1, z0 - z1);
  const lift = V.bulten ? bultOp(V, a, q)?.z || 0 : 0;
  if (aq <= q1) return z0 - (aq * (z0 - z1)) / q1 + lift - (H.dik * (1 + H.voetDik * (aq / q1) ** 2)) / cos;
  const rT = H.dik * (1 + H.voetDik);
  const e = aq - q1;
  if (H.hoekig || e >= rT) return Infinity;
  return z1 + lift - Math.sqrt(rT * rT - e * e);
}
// en de bovenkant
function dakBovenkant(H, V, a, q) {
  const aq = Math.abs(q);
  const z0 = V.nokZ(a);
  const q1 = V.voetQ(a);
  const z1 = V.voetZ(a);
  const cos = q1 / Math.hypot(q1, z0 - z1);
  const t = klem(aq / q1, 0, 1);
  return z0 - (Math.min(aq, q1) * (z0 - z1)) / q1 + (H.dik * (1 + H.voetDik * t * t) + H.bol * 4 * t * (1 - t) + (H.laagH || 0)) / cos;
}

// n plekken met een halve breedte hw binnen de zones (langs een nok of een muur), zo ver uit elkaar
// als het uitkomt
function plekkenIn(zones, n, hw, R) {
  const z = zones
    .map(([a, b]) => [a + hw, b - hw])
    .filter(([a, b]) => b >= a)
    .sort((p, q) => q[1] - q[0] - (p[1] - p[0]));
  if (!z.length) return [];
  const [a, b] = z[0];
  if (n >= 2 && b - a >= 2 * hw + 30) {
    const speel = b - a - 2 * hw - 30;
    return [a + speel * 0.25 * R(1), b - speel * 0.25 * R(2)];
  }
  if (n >= 2 && z[1]) return [(a + b) / 2 + (b - a) * 0.3 * (R(1) - 0.5), (z[1][0] + z[1][1]) / 2];
  return [(a + b) / 2 + (b - a) * 0.3 * (R(1) - 0.5)];
}

// --- op het dak

function uitbouwenOpHetDak(H) {
  const n = H.uitbouw.kapellen;
  H.kapellen = [];
  if (!n) return;
  // op de hoofdvleugel, of als daar geen plek is op de andere (de zijvleugel van een L)
  for (const V of H.vleugels) {
    let zones = vrijeZones(H, V);
    // een bult loopt niet tot de nok, dus de schoorsteen staat er niet in de weg; een dakkapel wel
    const S = H.schoorsteen;
    // een bult komt niet boven de aanbouw: daar zit geen knieschot om een raam in te zetten
    const A = H.aanbouw;
    if (A && A.V === V) zones = aftrekken(zones, [A.aC - A.ha - 40, A.aC + A.ha + 40]);
    if (H.dak === 'riet') bultenVan(H, V, zones, n);
    else kapellenVan(H, V, S && S.V === V ? aftrekken(zones, [S.a - 45, S.a + 45]) : zones, n);
    if (H.uitbouw.kapellen) return;
  }
}

// Dakkapellen in het riet: bulten boven een raam in de knieschot. Het raam zit zo hoog dat het er
// half onder de opgetilde dakrand in zit; de bult tilt de rand net genoeg op om het raam met een
// latei erboven vrij te laten, en loopt het dak op tot hij er zacht in opgaat.
function bultenVan(H, V, zones, n) {
  const { sp, sch } = H;
  const R = (k) => H.r(4200 + k);
  const b = sp ? 28 : 22;
  const hr = sp ? 24 : 20;
  const h0 = H.plaatH - (H.lagen === 1 ? 6 : 16) + Math.round(sch * (R(3) - 0.5) * 4);
  const nodig = h0 + hr + (sp ? 9 : 6) + (sp ? 12 : 7) + 10 - H.plaatH;
  const w = (b / 2 + 6) / SQ; // het vlakke stuk boven het raam
  const flank = 80 + 24 * R(4); // de glooiing opzij, ruim twee keer zo breed als hij hoog is
  const Lg = Math.min(V.Qe0 * 0.82, 110 + 25 * R(5)); // hoe ver de bult het dak op loopt
  // twee bulten mogen elkaars glooiing delen: daartussen zakt het riet weer wat
  const plekken = plekkenIn(zones, n, w + flank * 0.45, (k) => R(10 + k));
  const bulten = plekken.map((a, i) => ({
    V,
    a,
    kant: 1,
    w,
    flank: flank * (0.9 + 0.2 * R(20 + i)),
    h: E(nodig) * (1.03 + 0.08 * R(30 + i)),
    q0: V.Qe0 - Lg,
    q1: V.Qe0,
    b,
    hr,
    h0: h0 + Math.round(sch * (R(40 + i) - 0.5) * 3),
  }));
  V.bulten = bulten.length ? bulten : null;
  H.uitbouw.kapellen = bulten.length;
}

// Dakkapellen op een dun dak: een klein huisje op het dak, met de nok haaks op de grote nok, een
// voorgevel van planken met een raam, en een zadeldakje van hetzelfde als het dak, dat achterin
// met een kil in het dak opgaat: voorbij waar zijn nok het dak raakt (aJ) duikt het weg, zoals de
// voet van een T, en langs de kil ligt aan beide kanten een goot van lood (dakPatroon).
function kapellenVan(H, V, zones, n) {
  const { sp, sch } = H;
  const R = (k) => H.r(4300 + k);
  const b = sp ? 24 : 20;
  const hr = sp ? 22 : 20;
  const hqK = (b / 2 + (sp ? 11 : 9)) / SQ + 2; // half zo breed als het raam met zijn lijst
  const ovK = sp ? 7 : 5;
  const ovgK = sp ? 6 : 4;
  // het dakje ligt wat flauwer dan het dak, anders komt zijn nok te hoog
  const tan = Math.tan(H.helling - 8 * GRAAD);
  const plekken = plekkenIn(zones, n, hqK + ovK + 12, (k) => R(10 + k));
  plekken.forEach((aK, i) => {
    const qF = V.hq + 2 - 12 * R(20 + i); // de voorkant, op of net achter de muur
    const zVoor = dakBovenkant(H, V, aK, qF);
    const h0 = zVoor * PXH + (sp ? 6 : 5);
    const voetZK = E(h0 + hr + (sp ? 11 : 9));
    const QeK = hqK + ovK;
    const zNK = voetZK + QeK * tan;
    if (zNK > V.nokZ(aK) - 12) return; // hij moet onder de nok blijven
    // waar zijn nok het dak raakt
    let qJ = qF;
    while (qJ > 4 && dakBovenkant(H, V, aK, qJ) < zNK + H.dik) qJ -= 2;
    const aJ = qJ - qF; // in zijn eigen stelsel (negatief: achter de voorgevel)
    const A = [V.Qx, V.Qy];
    const Q = [V.Ax, V.Ay];
    // het dakje
    const F = stelselV({ c: V.wereld(aK, qF), A, Q });
    const f1 = R(30 + i) * 6.3;
    const zak = sch * E(1.2) * R(33 + i);
    Object.assign(F, {
      i: 30 + i,
      eind: ['tak', 'gevel'],
      XR: ovgK,
      aJ,
      nokZ: (a) => zNK - zak * klem(1 - Math.abs(a - aJ / 2) / Math.max(1, -aJ / 2), 0, 1),
      voetQ: () => QeK,
      voetZ: (a) => voetZK + sch * E(0.8) * Math.sin(a * 0.07 + f1),
      laagGolf: (a) => sch * 1.2 * Math.sin(a * 0.05 + f1),
      panDrift: V.panDrift,
    });
    const plek = (x, y, z) => {
      const P = plekV(H, F, x, y, z);
      const voorbij = F.aJ - P.a;
      if (voorbij > 0) {
        P.dm += 1.5 * voorbij;
        P.dw += 1.5 * voorbij;
      }
      // de kil met het dak van het huis: een goot van lood (dakPatroon)
      if (P.a > F.aJ - 4 && P.a < 2 && Math.abs(P.q) <= QeK + 2) {
        const PH = plekV(H, V, x, y, z);
        if (Math.abs(PH.dw) < H.dik + 6) P.kilD = PH.dw - P.dw;
      }
      return P;
    };
    const veld = (x, y, z) => Math.max(pakAfstand(H, plek(x, y, z)), F.lok(x, y)[0] - F.XR);
    // de muren: van diep in het dak tot onder het dakje
    const lang = -aJ + 14;
    const U = stelselV({ c: F.wereld(-lang / 2, 0), A, Q });
    Object.assign(U, {
      soort: 'kapel',
      i: 12 + i,
      ha: lang / 2,
      hq: hqK,
      hellA: 0,
      hellQ: sch * (R(40 + i) - 0.5) * 0.02,
      bolQ: 0,
      bolA: 0,
      zN: zNK,
      wF: 0,
      eind: ['tak', 'gevel'],
      zijden: ['a', 'q'],
      wanden: ['planken'],
      wand: 'planken',
      verd: [{ uit: 0, z0: zVoor - 40, z1: zNK + 4 }],
      knipVleugels: false,
      geenWaterlijst: true,
      F,
      plek,
      dakVeld: veld,
      raam: { b, h: hr, h0 },
    });
    U.onder = (x, y, z) => dwV(F, x, y, z) + H.dik * 0.45;
    U.X = { lagen: 1, plaatH: voetZK * PXH - 4, trekH: voetZK * PXH, plint: () => zVoor * PXH - 30, zichtLo: h0 + 2, zichtTop: h0 + hr - 2 };
    U.mat = () => 'plank';
    U.randLijn = (P, al, x, y, z) => {
      if (P.zijde === 'q') return voetZK - 0.82 * ovK - 1;
      const D = plekV(H, F, x, y, z);
      return D.z0 + (D.uz / D.ux) * Math.abs(D.q) - H.dik / D.ux - 0.82 * ovgK;
    };
    H.extra.push(U);
    H.kapellen.push(U);
    for (const s of [-1, 1]) H.uitPunten.push([...F.wereld(0, s * QeK), zNK + 12]);
  });
  H.uitbouw.kapellen = H.kapellen.length;
}

// --- de aanbouw

// Tegen de lange muur van de hoofdvleugel, aan een eind, een eindje van de hoek af. Zijn dak is
// eenzijdig en begint in de muur, onder de dakrand (of bij twee lagen onder de overkraging) door,
// zo hoog als het kan zonder het riet te raken; dan zakt het naar buiten af. Een dak van riet kan
// zo flauw niet liggen, dus onder riet is het van spanen: later aangezet, in iets goedkopers.
function aanbouwVan(H) {
  if (!H.uitbouw.aanbouw) return;
  const { sp, sch } = H;
  const R = (k) => H.r(4400 + k);
  const S0 = H.verd[0];
  const geen = () => {
    H.uitbouw.aanbouw = false;
  };
  // het deel van de lange muur van elke vleugel dat vrij ligt, niet achter of in een andere
  // vleugel; de langste wint (bij een L kan dat de zijvleugel zijn)
  let VA = null;
  let zone = null;
  for (const V of H.vleugels) {
    const P0 = V.wereld(-V.ha, V.hq);
    const P1 = V.wereld(V.ha, V.hq);
    let vrij = [[0, 1]];
    for (const W of H.vleugels) {
      if (W === V) continue;
      const g = knip(W, S0, P0, P1, 30);
      if (g) vrij = aftrekken(vrij, g);
    }
    // niet onder een bult in het riet: daar zit een raam in de knieschot
    for (const B of V.bulten || []) {
      const t = (a) => (a + V.ha) / (2 * V.ha);
      vrij = aftrekken(vrij, [t(B.a - B.w - 26), t(B.a + B.w + 26)]);
    }
    for (const [t0, t1] of vrij) {
      const z = [-V.ha + 2 * V.ha * t0, -V.ha + 2 * V.ha * t1, t0 < 1e-4, t1 > 1 - 1e-4];
      if (z[1] - z[0] > 3.4 * TEGEL && (!zone || z[1] - z[0] > zone[1] - zone[0] + 10)) {
        zone = z;
        VA = V;
      }
    }
  }
  if (!zone) return geen();
  // hij neemt niet de hele muur: daarnaast blijft er ruimte, voor een raam of de voordeur (die
  // anders in de gevel of in de andere vleugel komt)
  const bU = Math.min(zone[1] - zone[0] - (H.vleugels.length > 1 ? 1.4 : 2.2) * TEGEL, (2.8 + 1.2 * R(1)) * TEGEL);
  if (bU < 2.3 * TEGEL) return geen();
  const dU = (1.8 + 0.5 * R(2)) * TEGEL; // hoe ver hij voor de muur uitsteekt
  const e = 10; // en zoveel zit hij in de muur
  let kant = R(3) < 0.5 ? -1 : 1;
  if (kant < 0 && !zone[2]) kant = 1;
  else if (kant > 0 && !zone[3]) kant = -1;
  const inset = 10 + 20 * R(4);
  const aC = kant > 0 ? zone[1] - inset - bU / 2 : zone[0] + inset + bU / 2;

  // Hoe hoog de hoge rand kan: onder het dak van het huis door (met de rol), en bij twee lagen
  // onder de overkraging. Zo steil als het kan, maar de buitenmuur moet een deur hoog blijven.
  const qH = VA.hq - 6;
  const qOut = VA.hq + dU;
  const ovU = sp ? 12 : 9;
  const qV = qOut + ovU;
  const dikF = 4.5;
  const onder = (q) => Math.min(...[aC - bU / 2 - 10, aC, aC + bU / 2 + 10].map((a) => dakOnderkant(H, VA, a, q)));
  const kraagOnder = H.lagen === 2 ? E(H.h1) - 7 : Infinity;
  let keus = null;
  for (const tanS of [0.6, 0.53, 0.47, 0.42, 0.37]) {
    const hv = dikF * Math.hypot(1, tanS);
    let zHi = E(sp ? 196 : 186);
    for (let q = qH; q <= qV + 1; q += 3) {
      zHi = Math.min(zHi, onder(q) - 4 - hv + (q - qH) * tanS);
      if (q <= VA.hq + H.kraag + 4) zHi = Math.min(zHi, kraagOnder - hv + (q - qH) * tanS);
    }
    const muur = zHi - (qOut - qH) * tanS - hv;
    if (muur * PXH >= 92) {
      keus = { tanS, zHi, hv, muur };
      break;
    }
  }
  if (!keus) return geen();

  // de doos, een graad of wat uit het haakse, om het punt waar hij aan de muur hangt
  const rot = sch * (0.6 + 1 * R(5)) * (R(6) < 0.5 ? -1 : 1) * GRAAD;
  const A = draai2([VA.Ax, VA.Ay], rot);
  const Q = draai2([VA.Qx, VA.Qy], rot);
  const hq = (dU + e) / 2;
  const [ax, ay] = VA.wereld(aC, VA.hq);
  const U = stelselV({ c: [ax + Q[0] * (hq - e), ay + Q[1] * (hq - e)], A, Q });
  const wand = H.wandKeus[0] === 'veldsteen' && R(10) < 0.4 ? 'veldsteen' : 'planken';
  Object.assign(U, {
    soort: 'aanbouw',
    V: VA,
    aC,
    i: 10,
    ha: bU / 2,
    hq,
    // hij helt een fractie naar buiten, los van het huis
    hellA: sch * (R(7) - 0.5) * 0.016,
    hellQ: sch * (0.006 + 0.01 * R(8)),
    bolQ: 0,
    bolA: 0,
    zN: keus.zHi,
    wF: R(9) * 6.3,
    eind: ['gevel', 'gevel'],
    zijden: ['q', 'a'],
    wanden: [wand],
    wand,
    verd: [{ uit: 0, z0: -3, z1: keus.zHi + 12 }],
    dekt: [0],
    knipt: true,
    S0,
  });

  // het dak: de hoge rand zes eenheden in de muur van het huis, en daar houdt het ook op
  const dakU = H.dun ? H.dak : 'spanen';
  const F = stelselV({ c: U.wereld(0, -hq + e - 6), A, Q });
  const voetQ0 = qV - qH;
  const f1 = R(11) * 6.3;
  const f2 = R(12) * 6.3;
  const f3 = R(13) * 6.3;
  const half = bU / 2;
  Object.assign(F, {
    i: 20,
    eind: ['gevel', 'gevel'],
    XR: half + (sp ? 10 : 8),
    D: DUN[dakU],
    dak: dakU,
    dik: dikF,
    hoekig: true,
    voetDik: 0,
    bol: 0,
    laagH: 0,
    kopR: 1,
    // de hoge rand zakt in het midden wat door, en de voet golft en hangt aan de hoeken
    nokZ: (a) => keus.zHi - sch * E(1.8) * Math.max(0, 1 - (a / half) ** 2) + sch * E(0.7) * Math.sin(a * 0.05 + f1),
    voetQ: (a) => voetQ0 + sch * 1.4 * Math.sin(a * 0.03 + f3),
    voetZ: (a) => keus.zHi - voetQ0 * keus.tanS + sch * E(1.6) * Math.sin(a * 0.035 + f2) - sch * E(2.2) * Math.min(1, (a / half) ** 4),
    laagGolf: (a) => sch * (1.3 * Math.sin(a * 0.047 + f1) + 0.7 * Math.sin(a * 0.13 + f2)),
    panDrift: (h) => sch * 1.2 * Math.sin(h * 0.023 + f3),
  });
  U.F = F;
  U.plek = (x, y, z) => plekV(H, F, x, y, z);
  U.dakVeld = (x, y, z) => {
    const P = plekV(H, F, x, y, z);
    const [a, q] = F.lok(x, y);
    return Math.max(pakAfstand(H, P), Math.abs(a) - F.XR, -q - 3);
  };
  U.onder = (x, y, z) => dwV(F, x, y, z) + dikF * 0.45;
  const plaatH = keus.muur * PXH - 3;
  U.X = {
    lagen: 1,
    plaatH,
    trekH: plaatH,
    plint: (u, P) => {
      const [x, y] = P.pos(u, 0, 0);
      return plintLijn(H, wand, x, y) - 8;
    },
    zichtLo: 26,
    zichtTop: plaatH - 12,
  };
  U.mat = (x, y, z) => (wand === 'veldsteen' || z * PXH < plintLijn(H, wand, x, y) - 8 ? 'steen' : WANDMAT[wand]);
  U.randLijn = (P, al, x, y, z) => {
    if (P.zijde === 'q') return F.voetZ(F.lok(x, y)[0]) - 0.82 * ovU - 1;
    const D = plekV(H, F, x, y, z);
    return D.z0 + (D.uz / D.ux) * Math.abs(D.q) - dikF / D.ux - 0.82 * (sp ? 10 : 8);
  };
  H.extra.push(U);
  H.aanbouw = U;
  for (const s of [-1, 1]) H.uitPunten.push([...F.wereld(s * F.XR, voetQ0), F.voetZ(0) - 8], [...U.wereld(s * U.ha, U.hq), -2]);
}

// --- aan de muren

// het stuk muur van vleugel V aan zijde `zijde` op verdieping s dat je het best ziet
const stukVan = (H, V, zijde, s) =>
  H.stukken.filter((P) => !P.U && P.V === V && P.zijde === zijde && P.s === s && P.zicht > 0.4).sort((a, b) => b.Lu * b.zicht - a.Lu * a.zicht)[0] || null;

// de stroken [u0, u1] van stuk P die vrij zijn op hoogte h0..h1
function vrijeStroken(P, h0, h1, mL = 26, mR = 26) {
  let zones = [[P.links === 'binnen' ? 32 : mL, P.Lu - (P.rechts === 'binnen' ? 32 : mR)]];
  for (const b of P.bezet) if (b[3] > h0 && b[2] < h1) zones = aftrekken(zones, [b[0], b[1]]);
  for (const op of P.openingen) if (op.h0 < h1 && op.h0 + op.h > h0) zones = aftrekken(zones, [op.u - op.b / 2 - 20, op.u + op.b / 2 + 20]);
  return zones.filter(([a, b]) => b > a);
}
// hetzelfde stuk muur op een andere verdieping (voor een erker of een galerij boven de deur)
const stukOnder = (H, P, s) => H.stukken.find((Q) => !Q.U && Q.V === P.V && Q.zijde === P.zijde && Q.s === s && Q.l0 * Q.dirU <= P.langs(P.Lu / 2) * Q.dirU && P.langs(P.Lu / 2) * Q.dirU <= (Q.l0 + Q.dirU * Q.len) * Q.dirU);
// u op stuk Q voor dezelfde plek als u op stuk P
const uOp = (P, u, Q) => (P.langs(u) - Q.l0) * Q.dirU * SQ;

// Een deur of een raam dat een uitbouw zelf zet, voordat verdeel() de rest van de muur vult.
function maakDeur(H, P, u, h0, b, h, o = {}) {
  const d = { P, u, b, h, h0, hoek: o.hoek || 0, blad: o.blad || 0, ...(o.extra || {}) };
  d.op = opening(P, u, h0, b, h, d.hoek, o.diep ?? (P.wand === 'veldsteen' ? 11 : 7), 'donker');
  Object.assign(d.op, { reg: o.reg ?? 0, deur: d, vast: true });
  P.openingen.push(d.op);
  H.openingen.push(d.op);
  H.deuren.push(d);
  return d;
}
function maakRaam(H, P, u, h0, b, h, o = {}) {
  const w = { P, reg: o.reg ?? 0, u, h0, b, h, hoek: o.hoek || 0, warm: !!o.warm, ...(o.extra || {}) };
  w.op = opening(P, u, h0, b, h, w.hoek, o.diep ?? (H.sp ? 7 : 5), w.warm ? 'glasWarm' : 'glas');
  Object.assign(w.op, { reg: w.reg, raam: w, vast: true });
  if (o.uitGat !== undefined) w.op.uitGat = o.uitGat;
  P.openingen.push(w.op);
  H.openingen.push(w.op);
  return w;
}

// Past de voordeur nog ergens? Een huis heeft altijd een voordeur, en een trap, een erker of een
// schoorsteen mag hem niet van zijn laatste muur verdringen. (Dezelfde maten als in verdeel().)
function deurMogelijk(H) {
  const b = H.sp ? 50 : 42;
  const h = H.sp ? 102 : 94;
  const jamb = H.sp ? 12 : 7;
  for (const P of H.stukken) {
    if (P.U || P.s !== 0 || P.Lu < 120 || P.zicht < 0.6) continue;
    let zones = [[30 + b / 2 + jamb, P.Lu - 30 - b / 2 - jamb]];
    for (const z of P.bezet) if (z[3] > 0 && z[2] < h) zones = aftrekken(zones, [z[0] - b / 2 - jamb, z[1] + b / 2 + jamb]);
    for (const op of P.openingen) if (op.vast && op.h0 < h) zones = aftrekken(zones, [op.u - op.b / 2 - 26 - b / 2 - jamb, op.u + op.b / 2 + 26 + b / 2 + jamb]);
    if (zones.some(([p, q]) => q >= p)) return true;
  }
  return false;
}
// zet iets op een muur als de voordeur daarna nog past; anders niet (geeft true als het mag)
function alsDeurPast(H, P, bezet) {
  P.bezet.push(bezet);
  if (deurMogelijk(H)) return true;
  P.bezet.pop();
  return false;
}

function uitbouwenOpDeMuren(H) {
  gevelSchoorsteenVan(H);
  trapVan(H);
  balkonVan(H);
  erkerVan(H);
}

// Een schoorsteen tegen de kopgevel: van de grond af breed (de haard zit erachter), met een
// schuine schouder, en dan een pijp die langs de rand van het dak omhoog gaat en er ruim bovenuit
// steekt, en een beetje leunt. Hij komt in plaats van die op het dakschild.
function gevelSchoorsteenVan(H) {
  if (!H.uitbouw.gevelschoorsteen) return;
  const { sp, sch } = H;
  const R = (k) => H.r(4500 + k);
  let keus = null;
  for (const V of H.vleugels) {
    if (V.eind[1] !== 'gevel') continue;
    const P = stukVan(H, V, 'a', 0);
    if (P && P.Lu >= 150 && !P.bezet.length) {
      // mag hij daar staan zonder de voordeur te verdringen?
      const u = (V.hq * 0.36 * (R(1) < 0.6 ? 1 : -1) - P.l0) * P.dirU * SQ;
      const probeer = [u - 40, u + 40, -10, 1e4];
      if (!alsDeurPast(H, P, probeer)) continue;
      P.bezet.pop();
      keus = { V, P };
      break;
    }
  }
  if (!keus) {
    H.uitbouw.gevelschoorsteen = false;
    return;
  }
  const { V } = keus;
  const C = {
    V,
    w0: sp ? 48 : 40, // breed onderaan (eenheden langs de muur)
    w1: sp ? 30 : 25, // de pijp
    d0: sp ? 25 : 21, // hoe ver hij uit de muur steekt
    kant: R(1) < 0.6 ? 1 : -1,
  };
  C.d1 = C.d0 - 4;
  // bij een overkraging staat hij net zo ver voor de bovenverdieping
  C.d0 += H.kraag;
  C.d1 += H.kraag;
  C.qC = C.kant * V.hq * (0.3 + 0.12 * R(2));
  C.zS0 = E((H.lagen === 2 ? H.h1 : H.trekH) - 26 + 14 * R(3));
  C.zS1 = C.zS0 + E(sp ? 26 : 22);
  // tot ruim boven de rand van het dak waar hij erdoor gaat
  let top = 0;
  for (const dq of [-C.w1 / 2, 0, C.w1 / 2]) top = Math.max(top, dakBovenkant(H, V, V.XR, C.qC + dq), dakBovenkant(H, V, V.ha, C.qC + dq));
  C.zTop = top + E(42 + 14 * R(4));
  C.la = sch * (0.03 + 0.04 * R(5)) * (R(6) < 0.5 ? -1 : 1); // leunt langs de gevel
  C.ln = sch * (0.015 + 0.02 * R(7)); // en een fractie van de muur af
  H.gevelSchoorsteen = C;
  H.schoorsteen = null;
  // de ramen blijven er vandaan, op elke verdieping
  for (const P of H.stukken) {
    if (P.U || P.V !== V || P.zijde !== 'a') continue;
    const u = (C.qC - P.l0) * P.dirU * SQ;
    const hw = (C.w0 / 2) * SQ + 10;
    P.bezet.push([u - hw, u + hw, -10, 1e4]);
  }
  H.uitPunten.push([...V.wereld(V.ha + C.d0, C.qC), C.zTop + 12]);
}

// Een stenen buitentrap naar een opkamer: een deur een halve meter hoger in de muur (de opkamer
// ligt boven een halfverzonken kelder), een bordes ervoor en treden langs de muur omlaag.
function trapVan(H) {
  if (!H.uitbouw.trap) return;
  const { sp, sch } = H;
  const R = (k) => H.r(4600 + k);
  const hD = 40 + Math.round(8 * R(1)); // de drempel van de opkamer
  const nT = Math.max(3, Math.round(hD / (sp ? 10 : 9))); // treden, het bordes meegeteld
  const trU = (sp ? 16 : 13) * SQ; // een trede langs de muur, in px
  const bD = sp ? 44 : 36;
  const topReg = H.lagen === 1 ? H.plaatH : H.lagen === 1.5 ? H.zolderH : H.h1 - 16;
  const hDeur = Math.min(sp ? 84 : 78, topReg - hD - (sp ? 16 : 11));
  const bordes = bD + (sp ? 24 : 18);
  const lang = bordes + (nT - 1) * trU;
  const geen = () => {
    H.uitbouw.trap = false;
  };
  if (hDeur < 62) return geen();
  const kand = [];
  for (const V of H.vleugels) for (const zijde of ['a', 'q']) {
    const P = stukVan(H, V, zijde, 0);
    if (P) kand.push(P);
  }
  kand.sort((a, b) => (b.zijde === 'a' ? 1.4 : 1) * b.Lu - (a.zijde === 'a' ? 1.4 : 1) * a.Lu);
  for (const P of kand) {
    const zones = vrijeStroken(P, 0, hD + hDeur + 12, 30, 30).filter(([a, b]) => b - a >= lang + 8);
    if (!zones.length) continue;
    const [a, b] = zones[0];
    // de treden lopen af naar de kant waar je hun voorkant ziet (naar de kijker toe)
    const Tu = P.zijde === 'q' ? [P.V.Ax, P.V.Ay] : [P.V.Qx, P.V.Qy];
    const dirS = P.dirU * (Tu[0] + Tu[1]) >= 0 ? 1 : -1;
    const speel = b - a - lang;
    const start = a + speel * (0.2 + 0.6 * R(3));
    // het bordes aan het ene eind, de treden naar het andere
    const uB0 = dirS > 0 ? start : start + (nT - 1) * trU;
    const uB1 = uB0 + bordes;
    const uD = (uB0 + uB1) / 2 + sch * (R(4) - 0.5) * 4;
    const [p0, p1] = [Math.min(uB0, dirS > 0 ? uB1 + (nT - 1) * trU : uB0 - (nT - 1) * trU), Math.max(uB1, dirS > 0 ? uB1 + (nT - 1) * trU : uB0 - (nT - 1) * trU)];
    if (!alsDeurPast(H, P, [p0 - 6, p1 + 6, -10, hD + (sp ? 44 : 38)])) continue;
    const d = maakDeur(H, P, uD, hD, bD, hDeur, { hoek: sch * (R(5) - 0.5) * 2 * GRAAD, blad: sch * (R(6) - 0.5) * 4 * GRAAD, extra: { trap: true } });
    const dT = sp ? 30 : 26; // hoe diep, uit de muur
    H.trap = { P, d, uB0, uB1, dirS, nT, hD, dT, trU, uT1: dirS > 0 ? uB1 + (nT - 1) * trU : uB0 - (nT - 1) * trU };
    const [u0, u1] = [p0, p1];
    // een keldergat in de plint, aan de andere kant van de deur
    const uK = dirS > 0 ? uB0 - 26 : uB1 + 26;
    if (R(7) < 0.6 && uK > 30 && uK < P.Lu - 30 && vrijeStroken(P, 4, 24).some(([p, q]) => uK - 14 > p && uK + 14 < q)) {
      const k = maakRaam(H, P, uK, 9 + Math.round(4 * R(8)), sp ? 24 : 20, sp ? 13 : 11, { diep: 10, extra: { kelder: true } });
      k.op.binnen = 'donker';
      H.trap.kelder = k;
    }
    for (const [u, n] of [[u0, dT], [u1, dT]]) H.uitPunten.push([...P.pos(u, 0, n), 0]);
    return;
  }
  geen();
}

// Een houten galerij op palen langs de bovenverdieping (bij twee lagen): een vloer op balkjes die
// uit de muur steken, palen van de grond af aan de buitenkant, een leuning met spijlen, en een
// deur uit de bovenverdieping erop. De ramen van de bovenverdieping blijven.
function balkonVan(H) {
  if (!H.uitbouw.balkon) return;
  const { sp } = H;
  const R = (k) => H.r(4700 + k);
  const geen = () => {
    H.uitbouw.balkon = false;
  };
  if (H.lagen !== 2) return geen();
  const kand = [];
  for (const V of H.vleugels) for (const zijde of ['q', 'a']) {
    const P = stukVan(H, V, zijde, 1);
    if (P && P.Lu >= 180) kand.push(P);
  }
  kand.sort((a, b) => (b.zijde === 'q' ? 1.3 : 1) * b.Lu * b.zicht - (a.zijde === 'q' ? 1.3 : 1) * a.Lu * a.zicht);
  const bD = sp ? 42 : 36;
  const hDeur = sp ? 86 : 80;
  for (const P of kand) {
    const hF = H.h1 + (sp ? 8 : 6);
    const zones = vrijeStroken(P, hF, hF + hDeur, 30, 30).filter(([a, b]) => b - a >= 150);
    if (!zones.length) continue;
    const [a, b] = zones[0];
    const lang = Math.min(b - a, (sp ? 150 : 130) + 80 * R(1));
    const u0 = a + (b - a - lang) * R(2);
    const u1 = u0 + lang;
    const uD = u0 + lang * (R(3) < 0.5 ? 0.28 : 0.72);
    const d = maakDeur(H, P, uD, hF + 2, bD, hDeur, { reg: 1, blad: (R(4) - 0.5) * 3 * GRAAD, extra: { galerij: true } });
    const dB = (sp ? 40 : 34) + 4 * R(5);
    H.balkon = { P, u0, u1, hF, dB, d };
    for (const u of [u0, u1]) H.uitPunten.push([...P.pos(u, hF + 40, dB), E(hF + 40)]);
    return;
  }
  geen();
}

// Een erker op klossen: bij twee lagen op de bovenverdieping, anders op de begane grond, een eind
// boven de grond. Een eigen doos met een eigen stuk muur (zodat hij zijn patroon krijgt), een
// eigen kapje (riet op een rieten huis, anders van het dak zelf), en eronder klossen van hout.
function erkerVan(H) {
  if (!H.uitbouw.erker) return;
  const { sp, sch } = H;
  const R = (k) => H.r(4800 + k);
  const geen = () => {
    H.uitbouw.erker = false;
  };
  const s = H.lagen === 2 ? 1 : 0;
  const hV = s ? H.h1 + (sp ? 12 : 9) : sp ? 50 : 44; // de vloer van de erker
  let hT = hV + (sp ? 78 : 66); // de bovenkant van zijn muren
  const bE = (sp ? 84 : 70) + 16 * R(1); // breed, px langs de muur
  const dE = (sp ? 26 : 22) + 6 * R(2); // hoe ver hij uitsteekt, eenheden
  const e = 8;
  const riet = H.dak === 'riet';
  const tanE = riet ? 0.95 : 0.62;
  const dikE = riet ? 7 : 4.5;
  const ovE = riet ? 6 : 5;
  const hvE = dikE * Math.hypot(1, tanE);
  const kand = [];
  for (const V of H.vleugels) for (const zijde of ['q', 'a']) {
    const P = stukVan(H, V, zijde, s);
    if (P) kand.push(P);
  }
  kand.sort((a, b) => (b.zijde === 'q' ? 1.25 : 1) * b.Lu * b.zicht - (a.zijde === 'q' ? 1.25 : 1) * a.Lu * a.zicht);
  for (const P of kand) {
    const zones = vrijeStroken(P, hV - 40, hT + 20, 30, 30).filter(([a, b]) => b - a >= bE + 10);
    if (!zones.length) continue;
    const [a, b] = zones[0];
    const uC = a + bE / 2 + 5 + (b - a - bE - 10) * (0.3 + 0.4 * R(3));
    // op de begane grond mag hij de voordeur niet verdringen
    if (s === 0) {
      if (!alsDeurPast(H, P, [uC - bE / 2 - 10, uC + bE / 2 + 10, hV - 44, hT + 30])) continue;
      P.bezet.pop();
    }
    // het kapje moet onder het dak van het huis blijven
    const V = P.V;
    const [wx, wy] = P.pos(uC, hT, 0);
    const [am, qm] = V.lok(wx, wy);
    const ruimte = P.gevel ? Infinity : dakOnderkant(H, V, am, qm + 2) - 3 - (E(hT) + hvE + 2 + (dE + 2) * tanE + hvE - 2 * tanE);
    if (ruimte < 0) hT += ruimte * PXH;
    if (hT - hV < (sp ? 62 : 52)) continue;
    // het stelsel: Q uit de muur, A langs de muur (naar de kijker toe)
    const N = P.N;
    const T = P.zijde === 'q' ? [V.Ax, V.Ay] : [V.Qx, V.Qy];
    const [cx0, cy0] = P.pos(uC, (hV + hT) / 2, 0);
    const hq = (dE + e) / 2;
    const U = stelselV({ c: [cx0 + N[0] * (hq - e), cy0 + N[1] * (hq - e)], A: T, Q: N });
    const wandH = P.wand;
    const wand = HOUTWAND(wandH) ? wandH : 'planken';
    Object.assign(U, {
      soort: 'erker',
      i: 14,
      ha: bE / 2 / SQ,
      hq,
      hellA: sch * (R(4) - 0.5) * 0.012,
      hellQ: 0,
      bolQ: 0,
      bolA: 0,
      zN: E(hT),
      wF: 0,
      eind: ['zij', 'zij'],
      zijden: ['q', 'a'],
      wanden: [wand],
      wand,
      verd: [{ uit: 0, z0: E(hV), z1: E(hT) + 6 }],
      S0: P.S,
      host: P,
      uC,
      hV,
      hT,
      dE,
      bE,
    });
    // het kapje: van de muur af naar buiten, zijn onderkant voor op de bovenkant van de erker
    const F = stelselV({ c: U.wereld(0, -hq + e - 2), A: T, Q: N });
    const voetQ0 = dE + 2 + ovE;
    const zHiE = E(hT) + hvE + 2 + (dE + 2) * tanE;
    const f1 = R(5) * 6.3;
    Object.assign(F, {
      i: 40,
      eind: ['gevel', 'gevel'],
      XR: U.ha + (riet ? 6 : 4),
      dik: dikE,
      hoekig: !riet,
      voetDik: riet ? 0.3 : 0,
      bol: riet ? 1.2 : 0,
      laagH: riet ? 1.1 : 0,
      kopR: riet ? 3 : 1,
      nokZ: (a) => zHiE + sch * E(0.8) * Math.sin(a * 0.06 + f1),
      voetQ: () => voetQ0,
      voetZ: (a) => zHiE - voetQ0 * tanE + sch * E(1) * Math.sin(a * 0.08 + f1),
      laagGolf: (a) => sch * 1.2 * Math.sin(a * 0.06 + f1),
      panDrift: (h) => sch * Math.sin(h * 0.03 + f1),
    });
    U.F = F;
    U.plek = (x, y, z) => plekV(H, F, x, y, z);
    U.dakVeld = (x, y, z) => {
      const Pk = plekV(H, F, x, y, z);
      const [a2, q2] = F.lok(x, y);
      let d = Math.max(pakAfstand(H, Pk), -q2 - 2);
      // de kopse kanten, bij riet rond afgesneden
      const bq = Math.abs(a2) - F.XR;
      d = riet ? Math.min(Math.max(d + 2.5, bq), 0) + Math.hypot(Math.max(d + 2.5, 0), Math.max(bq, 0)) - 2.5 : Math.max(d, bq);
      return d;
    };
    U.onder = (x, y, z) => dwV(F, x, y, z) + dikE * 0.45;
    U.X = { lagen: 1, plaatH: hT, trekH: hT, plint: () => hV, zichtLo: hV + 8, zichtTop: hT - 8 };
    U.mat = () => WANDMAT[wand];
    U.randLijn = (Pu, al, x, y, z) => {
      if (Pu.zijde === 'q') return F.voetZ(F.lok(x, y)[0]) - (riet ? 1.3 * dikE : 0.5) - 0.82 * ovE;
      const D = plekV(H, F, x, y, z);
      return D.z0 + (D.uz / D.ux) * Math.abs(D.q) - dikE / D.ux - 0.82 * 4;
    };
    H.extra.push(U);
    H.erker = U;
    const nieuw = stukkenVan(H, U);
    H.stukken.push(...nieuw);
    H.stukken.forEach((Q, i) => (Q.idx = i));
    zichtVanStukken(H, nieuw);
    // de ramen van het huis blijven er vandaan, ook onder de klossen
    P.bezet.push([uC - bE / 2 - 10, uC + bE / 2 + 10, hV - 44, hT + 30]);
    const Po = s ? stukOnder(H, P, 0) : null;
    if (Po) {
      const u = uOp(P, uC, Po);
      Po.bezet.push([u - bE / 2 - 8, u + bE / 2 + 8, H.h1 - 46, H.h1 + 10]);
    }
    for (const sa of [-1, 1]) H.uitPunten.push([...U.wereld(sa * U.ha, U.hq), E(hV) - 30]);
    return;
  }
  geen();
}

// De ramen en deuren in de muren van een uitbouw.
function verdeelUitbouwen(H) {
  const { sp, sch } = H;
  const R = (k) => H.r(5000 + k);
  let k = 0;
  for (const P of H.stukken) {
    if (!P.U || !P.zicht) continue;
    const U = P.U;
    const X = P.X;
    if (U.soort === 'kapel' && P.zijde === 'a') {
      const r = U.raam;
      maakRaam(H, P, P.Lu / 2 + sch * (R(k++) - 0.5) * 3, r.h0, r.b, r.h, { warm: R(k++) < 0.4, hoek: sch * (R(k++) - 0.5) * 2 * GRAAD, extra: { kapel: true } });
    } else if (U.soort === 'aanbouw') {
      if (P.zijde === 'q' && P.Lu >= 90 && X.plaatH >= 84) {
        // een deur aan één kant, een klein raam aan de andere
        const bD = sp ? 40 : 34;
        const hD = Math.min(sp ? 86 : 80, X.plaatH - (sp ? 12 : 9));
        const links = R(k++) < 0.5;
        const uD = links ? 22 + bD / 2 + 6 * R(k++) : P.Lu - 22 - bD / 2 - 6 * R(k++);
        maakDeur(H, P, uD, 0, bD, hD, { hoek: sch * (R(k++) - 0.5) * 2 * GRAAD, blad: sch * (R(k++) - 0.5) * 5 * GRAAD, extra: { aanbouw: true } });
        const uR = links ? P.Lu - 26 - 12 : 26 + 12;
        if (Math.abs(uR - uD) > bD / 2 + 36 && R(k++) < 0.75) maakRaam(H, P, uR, X.plaatH - (sp ? 44 : 38), sp ? 22 : 18, sp ? 22 : 18, { warm: R(k++) < 0.35 });
      } else if (P.zijde === 'a' && P.Lu >= 60 && R(k++) < 0.7) {
        maakRaam(H, P, P.Lu * (0.45 + 0.1 * R(k++)), Math.min(X.plaatH - 34, sp ? 72 : 64), sp ? 20 : 16, sp ? 22 : 18, { warm: R(k++) < 0.3 });
      }
    } else if (U.soort === 'erker') {
      const h = sp ? 44 : 36;
      const h0 = Math.round((U.hV + U.hT) / 2 - h / 2 - 2);
      if (P.zijde === 'q') {
        const b = Math.min(P.Lu - (sp ? 26 : 20), sp ? 58 : 46);
        maakRaam(H, P, P.Lu / 2 + sch * (R(k++) - 0.5) * 3, h0, b, h, { warm: R(k++) < 0.45, hoek: sch * (R(k++) - 0.5) * 1.5 * GRAAD, uitGat: 6, extra: { erker: true } });
      } else if (P.Lu >= (sp ? 30 : 24)) {
        maakRaam(H, P, P.Lu / 2, h0, sp ? 13 : 10, h, { warm: false, uitGat: 5, extra: { erker: true, smal: true } });
      }
    }
  }
}

// Luiken en bloembakken: aan de ramen van het huis (niet in een gevel onder de nok, niet onder een
// bult), alleen waar ze passen zonder over een ander raam of een deur te vallen.
function luikenEnBakken(H) {
  const U = H.uitbouw;
  if (!U.luiken && !U.bakken) return;
  const { sp, sch } = H;
  const rw = sp ? 5 : 3;
  const ramen = H.openingen.filter((op) => op.raam && !op.raam.top && !op.raam.spleet && !op.raam.bult && !op.raam.kelder && !op.P.U && op.P.zicht > 0.3);
  ramen.forEach((op, i) => {
    const w = op.raam;
    const R = (k) => H.r(4900 + i * 13 + k);
    if (U.luiken && w.b >= (sp ? 22 : 16)) {
      const lb = Math.round(w.b / 2 + 2);
      const nodig = w.b / 2 + rw + lb + 3;
      const vrij = w.u - nodig > 6 && w.u + nodig < op.P.Lu - 6;
      const botst = op.P.openingen.some((o2) => o2 !== op && Math.abs(o2.u - w.u) < nodig + o2.b / 2 + 3 && o2.h0 < w.h0 + w.h + 6 && o2.h0 + o2.h > w.h0 - 6);
      if (vrij && !botst) {
        // elk luik een eindje van de muur af gedraaid, en af en toe één dat scheef hangt
        const scheef = sch && R(1) < 0.18 ? (R(2) < 0.5 ? -1 : 1) : 0;
        w.luiken = {
          b: lb,
          kleur: U.luiken,
          open: [-1, 1].map((s, j) => (8 + 16 * R(3 + j)) * GRAAD),
          tilt: [-1, 1].map((s, j) => sch * ((R(5 + j) - 0.5) * 2.4 + (scheef === s ? 5 + 3 * R(7) : 0)) * GRAAD),
        };
      }
    }
  });
  if (U.bakken) {
    // de mooiste ramen beneden, liefst aan de zonkant
    const kand = ramen
      .filter((op) => op.P.s === 0 && op.reg === 0 && op.raam.b >= (sp ? 22 : 16) && op.h0 > 40)
      .map((op) => ({ op, w: op.P.zicht * (1 + (op.P.N[1] - op.P.N[0]) * 0.3) * (1 + H.r(4990 + op.u) * 0.6) }))
      .sort((a, b) => b.w - a.w);
    const kleuren = [['rood', 'goud'], ['magie', 'baard'], ['goud', 'herfst'], ['rood', 'baard'], ['magie', 'rood']];
    kand.slice(0, U.bakken).forEach(({ op }, i) => {
      op.raam.bak = { kleuren: kleuren[Math.floor(H.r(4995 + i) * kleuren.length)], zaad: H.zaad * 31 + i * 7 };
    });
  }
}

// --- de delen van de uitbouwen in de wereld

const bolDeel = (c, r) => ({ f: (x, y, z) => sdf.bol(x - c[0], y - c[1], z - c[2], r), g: [c[0], c[1], c[2], r + 0.5] });

// Stenen treden: de zijkanten gemetseld, de treden vlak en aan de voorkant afgesleten.
function trapPatroon(H, C) {
  if (C.nz > 0.6) {
    const h = hash(C.px, C.py, H.zaad + 61);
    return h % 17 === 0 ? -0.8 : h % 29 === 0 ? 0.6 : 0.2;
  }
  return steenPatroon(H, C, H.sp ? [11, 18, 12] : [9, 13, 9]);
}

// Een luik: staande planken met een naad, twee klampen dwars, en op een geverfd luik hier en daar
// het kale hout waar de verf eraf is.
function luikPatroon(H, C) {
  const p = C.deel.luik;
  if (!p) return 0;
  const [l, v, n] = p.lok(C.x, C.y, C.z);
  if (Math.abs(n) > 0.8 && Math.abs(C.nz) < 0.7 && (l < 0.6 || l > p.lw - 0.6 || Math.abs(v) > p.hv - 0.6)) return -1.3;
  const pb = p.lw / (p.lw > 11 ? 3 : 2);
  const i = Math.floor(l / pb);
  const f = l - i * pb;
  if (f < 0.9 && i > 0) return -1.9;
  let s = ((hash(i, p.j, H.zaad + 23) % 3) - 1) * 0.35;
  for (const vk of [0.62, -0.62]) {
    const dv = v - vk * p.hv;
    if (Math.abs(dv) < E(3.2)) return s + (dv > E(1.6) ? 0.9 : dv < -E(1.6) ? -1.3 : 0.4);
  }
  const nerf = Math.sin(l * 1.9 + Math.sin(v * 0.1 + i) * 2 + i * 1.7);
  if (nerf > 0.85) s -= 0.6;
  if (p.verf && ruis2(l * 0.35 + i * 3, v * 0.16, H.zaad + 21) > 0.7) return { ramp: H.hout, plus: s - 0.4 };
  return s;
}

// T: de hulpjes uit huis() (wandBalk, hoekStijl, omlijsting, dik, wiebel, en de maten van het hout).
function bouwUitbouwen(W, H, T) {
  const { sp, sch } = H;
  const { wandBalk, hoekStijl, omlijsting, dik, wiebel, balkH, stijlB } = T;
  const diepe = sp ? 0.12 : 0.35;
  const houtHi = (sp ? 6.6 : 5.8) - (H.hout === 'schors' ? 0.8 : 0);
  if (H.trap) {
    W.mat.ijzer = { ramp: 'ijzer', lo: 0.8, hi: 4.6, schaduwKracht: diepe };
    W.mat.trap = { ramp: 'veldsteen', lo: 1.3, hi: 7, schaduwKracht: diepe, patroon: (C) => trapPatroon(H, C) };
  }
  // een dun dak van iets anders dan het huis (spanen op een aanbouw onder riet)
  const dunMat = (F) => {
    if (H.dun && (F.dak || H.dak) === H.dak) return 'dak';
    const naam = 'dak_' + F.dak;
    if (!W.mat[naam]) {
      const lichter = F.dak === 'leien' ? 0.6 : 0;
      W.mat[naam] = { ramp: F.D.ramp || H.dakHout, lo: 0.6 + lichter, hi: (sp ? 6.2 : 5.8) + lichter, schaduwKracht: sp ? 0.25 : 0.4, patroon: (C) => dakPatroon(H, C) };
    }
    return naam;
  };
  const hout = (g, p, deel, zaad, toon = 0) => {
    p.m = 'hout';
    p.deel = deel;
    p.zaad = zaad;
    p.toon = sch ? toon : 0;
    return voeg(g, p);
  };
  // een platte plank langs de schuine rand van een dun dak (stelsel F, kant 1 of -1)
  const windveer = (g, F, kant, t0, t1, n, deel) => {
    const x = F.XR + 1.2;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = t0 + ((t1 - t0) * i) / n;
      const z0 = F.nokZ(x);
      pts.push([...F.wereld(x, kant * F.voetQ(x) * t), z0 + (F.voetZ(x) - z0) * t + 1.2]);
    }
    for (let i = 0; i < n; i++) {
      const p = balk(pts[i], pts[i + 1], (F.dik ?? H.dik) + (sp ? 3.2 : 2.4), sp ? 1.7 : 1.2, [F.Ax, F.Ay, 0], 0.5);
      Object.assign(p, { m: 'windveer', deel, zaad: i + kant * 5 + deel, toon: 0 });
      voeg(g, p);
    }
  };

  // --- de aanbouw: zijn dak, een windveer langs de kant die je ziet, en het hout om de deur
  const A = H.aanbouw;
  if (A) {
    const F = A.F;
    const g = W.groep('aanbouw');
    const vq = F.voetQ(0);
    const [gx, gy] = F.wereld(0, vq / 2);
    voeg(g, { f: A.dakVeld, grens: [gx, gy, Math.hypot(F.XR, vq / 2) + 12, F.voetZ(0) - 16, F.nokZ(0) + 16], m: dunMat(F), deel: 700, plek: A.plek });
    windveer(W.groep('aanbouwveer'), F, 1, 0.05, 1.02, 4, 710);
    for (const P of H.stukken) if (P.U === A && P.zicht) omlijsting(P, W.groep('aanbouwhout'), W.groep('aanbouwstijlen'));
  }

  // --- dakkapellen op een dun dak: het dakje, de nok, de windveren en de hoekplanken
  for (const K of H.kapellen || []) {
    const F = K.F;
    const g = W.groep('kapel');
    const QeK = F.voetQ(0);
    const [cx, cy] = F.wereld((F.aJ + F.XR) / 2, 0);
    voeg(g, { f: K.dakVeld, grens: [cx, cy, Math.hypot((F.XR - F.aJ) / 2 + 12, QeK + 8), F.voetZ(0) - 14, F.nokZ(0) + 18], m: dunMat(F), deel: 720 + K.i, plek: K.plek });
    const zOp = (H.dik / Math.cos(H.helling)) * 0.55;
    const a0 = F.aJ + 4;
    const a1 = F.XR - 0.5;
    if (H.dak === 'spanen') {
      const ux = Math.cos(H.helling);
      const uz = Math.sin(H.helling);
      const wB = sp ? 11 : 9;
      for (const kant of [1, -1]) {
        const v = wB / 2 - 1.6;
        const punt = (a) => [...F.wereld(a, kant * v * ux), F.nokZ(a) + H.dik / ux - v * uz + 1.2 + H.D.stoot];
        const p = balk(punt(a0), punt(a1), wB / 2, 1.1, [kant * uz * F.Qx, kant * uz * F.Qy, ux], 0.4);
        Object.assign(p, { m: 'nok', deel: 734 + K.i + (kant > 0 ? 0 : 1), zaad: kant + K.i, toon: 0 });
        voeg(g, p);
      }
    } else if (H.worstR) {
      const rr = H.worstR * 0.8;
      const panL = H.dak === 'pannen' ? H.D.nokL * 0.8 : 0;
      voeg(g, {
        f: (x, y, z) => {
          const [a, q] = F.lok(x, y);
          const ac = klem(a, a0, a1);
          const r = panL ? rr * (0.86 + 0.14 * (((ac - a0) / panL) % 1)) : rr;
          return Math.hypot(a - ac, q, z - (F.nokZ(ac) + zOp)) - r;
        },
        g: [...F.wereld((a0 + a1) / 2, 0), F.nokZ(0) + zOp, (a1 - a0) / 2 + rr + 3],
        m: 'nok',
        deel: 730 + K.i,
        V: F,
        langs: (x, y) => F.lok(x, y)[0] - a0,
      });
    }
    for (const kant of [1, -1]) windveer(g, F, kant, -0.04, 1.03, 3, 740 + K.i * 2 + (kant > 0 ? 0 : 1));
    for (const P of H.stukken) if (P.U === K && P.zicht) omlijsting(P, W.groep('kapelhout'), W.groep('kapelstijlen'));
  }

  // --- de erker: zijn kapje, de klossen eronder, en het hout op zijn muren
  const Er = H.erker;
  if (Er) {
    const F = Er.F;
    const g = W.groep('erker');
    const vq = F.voetQ(0);
    const [gx, gy] = F.wereld(0, vq / 2);
    voeg(g, { f: Er.dakVeld, grens: [gx, gy, Math.hypot(F.XR + 4, vq / 2 + 4) + 8, F.voetZ(0) - 14, F.nokZ(0) + 14], m: H.dak === 'riet' ? 'riet' : 'dak', deel: 750, plek: Er.plek });
    // klossen: drie blokken op elkaar, elk een eind korter, onder de vloer tegen de muur
    const P = Er.host;
    const nK = Er.bE > (sp ? 80 : 70) ? 3 : 2;
    const hK = sp ? 9 : 7;
    const kl = W.groep('klossen');
    for (let j = 0; j < nK; j++) {
      const u = Er.uC + (j / (nK - 1) - 0.5) * (Er.bE - (sp ? 16 : 12)) + wiebel(1);
      for (let k = 0; k < 3; k++) {
        const len = (Er.dE - 1) * (1 - 0.3 * k) + wiebel(1);
        const hc = Er.hV - hK * (k + 0.5);
        hout(kl, balk(P.pos(u, hc, -4), P.pos(u, hc + wiebel(0.6), len), sp ? 4.2 : 3.4, E(hK) / 2 - 0.15, [0, 0, 1], 0.5), 752 + j * 3 + k, 11 + j * 3 + k, H.rs(5200 + j * 3 + k) * 0.6);
      }
    }
    const lig = W.groep('erkerhout');
    const stl = W.groep('erkerstijlen');
    const stukken = H.stukken.filter((Q) => Q.U === Er && Q.zicht);
    if (HOUTWAND(Er.wand)) {
      // vakwerk: hoekstijlen, een regel onder en boven, en stijlen naast de ramen
      for (const sa of [-1, 1]) hoekStijl(stl, Er, Er.verd[0], sa, 1, Er.hV, Er.hT, dik(stijlB), `erker${sa}`);
      for (const Q of stukken) {
        wandBalk(lig, Q, -2, Er.hV + balkH / 2 + wiebel(1), Q.Lu + 2, Er.hV + balkH / 2 + wiebel(1), dik(balkH), 4.5);
        wandBalk(lig, Q, -2, Er.hT - balkH / 2 + wiebel(1), Q.Lu + 2, Er.hT - balkH / 2 + wiebel(1), dik(balkH), 4.5);
        for (const op of Q.openingen) {
          const gg = op.b / 2 + (sp ? 8 : 6);
          for (const s of [-1, 1]) {
            const u = op.u + s * gg;
            if (u > 7 && u < Q.Lu - 7) wandBalk(stl, Q, u, Er.hV + balkH - 2, u + wiebel(1), Er.hT - balkH + 2, dik(stijlB - 2), 3.5);
          }
        }
      }
    } else for (const Q of stukken) omlijsting(Q, lig, stl);
  }

  // --- de galerij: balkjes uit de muur, een vloer van planken, een buitenbalk op palen van de
  // grond af, schoren, en een leuning met spijlen, ook aan de korte kanten
  const B = H.balkon;
  if (B) {
    const g = W.groep('galerij');
    const g2 = W.groep('galerijleuning');
    const { P, u0, u1, hF, dB } = B;
    const N = [P.N[0], P.N[1], 0];
    let k = 800;
    const nJ = Math.max(3, Math.round((u1 - u0) / (sp ? 34 : 30)));
    for (let i = 0; i <= nJ; i++) {
      const u = u0 + 5 + ((u1 - u0 - 10) * i) / nJ + wiebel(1.5);
      hout(g, balk(P.pos(u, hF - 6, -4), P.pos(u, hF - 6 + wiebel(1), dB + 1.5), sp ? 2.6 : 2.1, E(sp ? 6 : 5) / 2, [0, 0, 1], 0.4), k++, i * 3.1, H.rs(5100 + i) * 0.6);
    }
    const nP = 4;
    for (let i = 0; i < nP; i++) {
      const n = ((i + 0.5) * dB) / nP;
      const p = balk(P.pos(u0 - 3 + wiebel(2), hF - 1.4, n), P.pos(u1 + 3 + wiebel(2), hF - 1.4 + wiebel(0.8), n), dB / nP / 2 - 0.25, 1.3, [0, 0, 1], 0.3);
      p.naad = dB / nP / 2 - 0.25;
      hout(g, p, k++, 20 + i * 2.3, H.rs(5120 + i) * 0.7);
    }
    const nR = dB - 2.5;
    hout(g, balk(P.pos(u0 - 4, hF - 5, nR), P.pos(u1 + 4, hF - 5 + wiebel(1), nR), sp ? 2.4 : 2, E(sp ? 7 : 6) / 2, [0, 0, 1], 0.4), k++, 31);
    const nPaal = Math.max(2, Math.round((u1 - u0) / (sp ? 70 : 62)) + 1);
    const hL = sp ? 40 : 34;
    const palen = [];
    for (let i = 0; i < nPaal; i++) {
      const u = u0 + 3 + ((u1 - u0 - 6) * i) / (nPaal - 1);
      hout(g, balk(P.pos(u, -4, nR), P.pos(u + wiebel(2.5), hF + hL + 3, nR + wiebel(1.2)), sp ? 3 : 2.5, sp ? 3 : 2.5, N, 0.6), k++, 40 + i, H.rs(5140 + i) * 0.5);
      palen.push(u);
      const sr = sp ? 22 : 18;
      if (i > 0) hout(g, balk(P.pos(u - 2, hF - 34, nR), P.pos(u - sr, hF - 7, nR), 1.7, 1.7, N, 0.4), k++, 50 + i);
      if (i < nPaal - 1) hout(g, balk(P.pos(u + 2, hF - 34, nR), P.pos(u + sr, hF - 7, nR), 1.7, 1.7, N, 0.4), k++, 60 + i);
    }
    const regel = (a, b, r, zaad) => hout(g2, balk(a, b, r, r, [0, 0, 1], 0.35), k++, zaad);
    regel(P.pos(u0, hF + hL, nR), P.pos(u1, hF + hL + wiebel(1.5), nR), sp ? 2 : 1.7, 70);
    regel(P.pos(u0, hF + 6, nR), P.pos(u1, hF + 6 + wiebel(1), nR), sp ? 1.5 : 1.2, 71);
    for (const u of [u0, u1]) {
      regel(P.pos(u, hF + hL, -1), P.pos(u, hF + hL, nR), sp ? 2 : 1.7, 72);
      regel(P.pos(u, hF + 6, -1), P.pos(u, hF + 6, nR), sp ? 1.5 : 1.2, 73);
    }
    const sb = sp ? 9 : 8;
    for (let u = u0 + sb; u < u1 - sb / 2; u += sb) {
      if (palen.some((pu) => Math.abs(pu - u) < 4)) continue;
      const w = wiebel(0.8);
      hout(g2, balk(P.pos(u + w, hF + 5, nR), P.pos(u - w, hF + hL - 1, nR), sp ? 1.3 : 1.1, sp ? 1.3 : 1.1, N, 0.3), k++, u * 0.37);
    }
    for (const u of [u0, u1]) for (let n = 7; n < nR - 3; n += sb / SQ) hout(g2, balk(P.pos(u, hF + 5, n), P.pos(u, hF + hL - 1, n + wiebel(0.6)), 1.1, 1.1, N, 0.3), k++, n * 0.51);
  }

  // --- de buitentrap: blokken steen van de grond af, een houten leuning, en tralies voor het keldergat
  const Tr = H.trap;
  if (Tr) {
    const g = W.groep('trap');
    const P = Tr.P;
    const { dirS, nT, hD, dT, trU } = Tr;
    const blok = (ua, ub, top, diep, deel) => {
      const hc = (top - 3) / 2;
      const d0 = wiebel(1.2);
      const p = balk(P.pos(ua, hc, diep / 2 - 1 + d0), P.pos(ub, hc, diep / 2 - 1 - d0), diep / 2 + 1, E(top + 3) / 2, [0, 0, 1], sp ? 1.4 : 1);
      Object.assign(p, { m: 'trap', deel });
      voeg(g, p);
    };
    blok(Tr.uB0 - 2, Tr.uB1 + 2, hD, dT, 850);
    for (let i = 1; i < nT; i++) {
      const top = hD - (hD * i) / nT + wiebel(1);
      const ua = dirS > 0 ? Tr.uB1 + (i - 1) * trU : Tr.uB0 - (i - 1) * trU;
      const ub = ua + dirS * trU;
      blok(Math.min(ua, ub) - 0.5, Math.max(ua, ub) + 0.5, top, dT - 2 - (i % 2) * (sp ? 2 : 1.5), 851 + i);
    }
    // de leuning aan de open kant: een paal onderaan, een bij het bordes, een regel ertussen en
    // langs het bordes terug naar de muur
    const lg = W.groep('trapleuning');
    const nL = dT - 3;
    const hL = sp ? 36 : 32;
    const uO = Tr.uT1 - dirS * 4;
    const hO = hD / nT;
    const uB = dirS > 0 ? Tr.uB1 - 3 : Tr.uB0 + 3;
    const uB2 = dirS > 0 ? Tr.uB0 + 3 : Tr.uB1 - 3;
    const paal = (u, h0, h1, zaad) => hout(lg, balk(P.pos(u, h0 - 3, nL), P.pos(u + wiebel(1.5), h1, nL), 2.2, 2.2, [P.N[0], P.N[1], 0], 0.5), 860 + zaad, zaad);
    paal(uO, hO, hO + hL, 1);
    paal(uB, hD, hD + hL + 2, 2);
    paal(uB2, hD, hD + hL + 1, 3);
    const regel = (a, b, zaad) => hout(lg, balk(a, b, 1.7, 1.7, [0, 0, 1], 0.4), 866 + zaad, zaad);
    regel(P.pos(uO, hO + hL - 1, nL), P.pos(uB, hD + hL + 1, nL), 4);
    regel(P.pos(uB, hD + hL + 1, nL), P.pos(uB2, hD + hL, nL), 5);
    regel(P.pos(uB2, hD + hL, nL), P.pos(uB2, hD + hL + wiebel(1), -2), 6);
    if (Tr.kelder) {
      const w = Tr.kelder;
      for (const dx of [-w.b / 4, 0, w.b / 4]) voeg(g, { ...stok(P.pos(w.u + dx, w.h0 + 1, 1.2), P.pos(w.u + dx, w.h0 + w.h - 1, 1.2), 0.9), m: 'ijzer', deel: 870 });
    }
  }

  // --- de schoorsteen tegen de gevel
  const GS = H.gevelSchoorsteen;
  if (GS) {
    const V = GS.V;
    const vorm = (x, y, z) => {
      const [a0, q0] = V.lok(x, y);
      const zl = Math.min(z, GS.zS1);
      const t = Math.max(0, z - GS.zS1);
      const a = a0 - V.hellA * zl - GS.ln * t;
      const q = q0 - V.hellQ * zl - GS.la * t;
      const s = glad(GS.zS0, GS.zS1, z);
      const hw = mix(GS.w0, GS.w1, s) / 2;
      const hd = mix(GS.d0, GS.d1, s) / 2;
      return [a - (V.ha - 5 + hd), q - GS.qC, hw, hd];
    };
    const [cx, cy] = V.wereld(V.ha + GS.d0 / 2, GS.qC);
    const lean = (Math.abs(GS.la) + Math.abs(GS.ln)) * (GS.zTop - GS.zS1);
    voeg(W.groep('gevelschoorsteen'), {
      f: (x, y, z) => {
        const [a, q, hw, hd] = vorm(x, y, z);
        let d = sdf.doos(a, q, z - (GS.zTop - 3) / 2, hd, hw, (GS.zTop + 3) / 2, 1.2) * 0.9;
        d = Math.min(d, sdf.doos(a, q, z - (GS.zTop + 2.4), hd + 2.4, hw + 2.4, 2.4, 0.8));
        return Math.max(d, -sdf.doos(a, q, z - (GS.zTop + 7), hd - 3.2, hw - 3.2, 5, 0.5));
      },
      grens: [cx, cy, Math.hypot(GS.d0 / 2 + 6, GS.w0 / 2 + 6) + lean, -4, GS.zTop + 8],
      m: (x, y, z) => {
        const [a, q, hw, hd] = vorm(x, y, z);
        return z > GS.zTop + 3 && Math.abs(a) < hd - 2.8 && Math.abs(q) < hw - 2.8 ? 'donker' : 'schoorsteen';
      },
      deel: 880,
    });
  }

  // --- luiken naast de ramen: elk een eindje van de muur af gedraaid om zijn scharnier
  const L = H.uitbouw.luiken;
  if (L) {
    const verf = L !== 'hout' && L !== 'schors';
    W.mat.luikVerf = { ramp: L, lo: 0.5, hi: verf ? (sp ? 5.6 : 5.2) : houtHi - 0.3, schaduwKracht: diepe, patroon: metRand(H, (C) => luikPatroon(H, C)) };
    const g = W.groep('luiken');
    let j = 0;
    for (const op of H.openingen) {
      const w = op.raam;
      if (!w || !w.luiken) continue;
      const Lk = w.luiken;
      const rw = (sp ? 5 : 3) / SQ;
      const lw = Lk.b / SQ;
      const hv = op.hh + rw * 0.8;
      [-1, 1].forEach((s, i) => {
        const aH = s * (op.hb + rw + 0.4);
        const nH = 1.3;
        const cf = Math.cos(Lk.open[i]);
        const sf = Math.sin(Lk.open[i]);
        const cp = Math.cos(Lk.tilt[i]);
        const spp = Math.sin(Lk.tilt[i]);
        const lok = (x, y, z) => {
          const [a, v, n] = op.lok(x, y, z);
          const da = (a - aH) * s;
          const dn = n - nH;
          const along = da * cf + dn * sf;
          const across = -da * sf + dn * cf;
          const vv = v - hv;
          return [along * cp + vv * spp * s, -along * spp * s + vv * cp + hv, across];
        };
        const [cx, cy, cz] = w.P.pos(w.u + s * (w.b / 2 + (sp ? 5 : 3) + Lk.b / 2), w.h0 + w.h / 2, 3);
        voeg(g, {
          f: (x, y, z) => {
            const [l, v, n] = lok(x, y, z);
            return sdf.doos(l - lw / 2, v, n, lw / 2, hv, 1.1, 0.4);
          },
          g: [cx, cy, cz, Math.hypot(lw / 2, hv) + 5],
          m: 'luikVerf',
          deel: 900 + (j++ % 80),
          luik: { lok, lw, hv, verf, j },
        });
      });
    }
  }

  // --- bloembakken onder de ramen: een houten bak vol blad, met bloemen erbovenop en wat er
  // over de rand hangt
  const bakken = H.openingen.filter((op) => op.raam && op.raam.bak);
  if (bakken.length) {
    W.mat.bakBlad = { ramp: 'blad', lo: 1.4, hi: 6.2, schaduwKracht: 0.45, patroon: (C) => (hash(C.px, C.py, 41) % 5 === 0 ? -0.9 : hash(C.px, C.py, 42) % 7 === 0 ? 0.7 : 0) };
    for (const op of bakken) {
      const w = op.raam;
      const P = w.P;
      const g = W.groep('bloembak');
      const rwPx = sp ? 5 : 3;
      const bl = w.b + 2 * rwPx + 6;
      const hTop = w.h0 - rwPx - (sp ? 5 : 3);
      const hB = sp ? 9 : 7;
      const nB = sp ? 8 : 6;
      hout(g, balk(P.pos(w.u - bl / 2, hTop - hB / 2, nB / 2 + 0.5), P.pos(w.u + bl / 2, hTop - hB / 2 + wiebel(0.8), nB / 2 + 0.5), nB / 2, E(hB) / 2, [0, 0, 1], 0.5), 950, 7, -0.2);
      const zr = w.bak.zaad;
      let k = 0;
      for (let u = w.u - bl / 2 + 2.5; u <= w.u + bl / 2 - 2.5; u += sp ? 3.4 : 3) {
        for (const n of [1.8, 4.4, 7]) {
          const h = hTop + 1 + rnd(zr, k, 1) * (sp ? 6 : 4.5);
          voeg(g, { ...bolDeel(P.pos(u + (rnd(zr, k, 2) - 0.5) * 2.4, h, n + (rnd(zr, k, 3) - 0.5) * 1.6), (sp ? 2.2 : 1.8) + 1.1 * rnd(zr, k, 4)), m: 'bakBlad', deel: 951, k: 1.1 });
          k++;
        }
        // wat over de voorkant hangt
        if (rnd(zr, k, 5) < 0.45) voeg(g, { ...bolDeel(P.pos(u, hTop - 3 - rnd(zr, k, 6) * (sp ? 8 : 6), nB + 1.2), sp ? 2 : 1.6), m: 'bakBlad', deel: 951, k: 1 });
        k++;
      }
      w.bak.kleuren.forEach((kl, ci) => {
        const naam = 'bloem_' + kl;
        if (!W.mat[naam]) W.mat[naam] = { ramp: kl, lo: 2.4, hi: 6.8, schaduwKracht: 0.55, patroon: (C) => (hash(C.px, C.py, 43) % 4 === 0 ? 0.8 : 0) };
        const n = Math.round(bl / (sp ? 7 : 6));
        for (let i = 0; i < n; i++) {
          const u = w.u - bl / 2 + 4 + (bl - 8) * rnd(zr, 100 + i, 10 + ci);
          const h = hTop + (sp ? 5 : 4) + rnd(zr, 100 + i, 20 + ci) * (sp ? 6 : 4.5);
          voeg(g, { ...bolDeel(P.pos(u, h, 2 + 5 * rnd(zr, 100 + i, 30 + ci)), (sp ? 1.7 : 1.4) + 0.5 * rnd(zr, 100 + i, 40 + ci)), m: naam, deel: 955 + ci });
        }
      });
    }
  }
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
    riet: { ramp: 'stro', lo: sp ? 0.2 : 1.2, hi: sp ? 4.9 : 5.3, schaduwKracht: sp ? 0.18 : 0.35, patroon: H.rookgat ? (C) => metRoet(H, C, rietPatroon(H, C)) : (C) => rietPatroon(H, C) },
    nok: { ramp: 'stro', lo: 0.2, hi: sp ? 4.3 : 4.8, schaduwKracht: diepe, patroon: H.rookgat ? (C) => metRoet(H, C, nokPatroon(H, C)) : (C) => nokPatroon(H, C) },
    steen: { ramp: 'veldsteen', lo: sp ? 0.8 : 1.6, hi: sp ? 7.8 : 7, schaduwKracht: diepe, patroon: metRand(H, (C) => steenPatroon(H, C, sp ? [13, 22, 16] : [9, 13, 9])) },
    schoorsteen: { ramp: 'veldsteen', lo: 1, hi: sp ? 7.6 : 7, schaduwKracht: diepe, patroon: (C) => steenPatroon(H, C, sp ? [9, 14, 8] : [7, 10, 6]) },
    drempel: { ramp: 'veldsteen', lo: 1.4, hi: 7, schaduwKracht: diepe },
    pleister: { ramp: 'pleister', lo: sp ? 0.7 : 1.5, hi: sp ? 6.2 : 5.8, schaduwKracht: diepe, patroon: metRand(H, (C) => pleisterPatroon(H, C)) },
    hout: { ramp: H.hout, lo: 0.5, hi: houtHi, schaduwKracht: diepe, patroon: metRand(H, (C) => balkPatroon(C, false)) },
    kozijn: { ramp: H.hout, lo: 0.8, hi: houtHi + 0.2, schaduwKracht: diepe, patroon: metRand(H, kozijnPatroon) },
    deur: { ramp: H.hout, lo: 0.3, hi: sp ? 4.6 : 4.2, schaduwKracht: diepe, patroon: metRand(H, (C) => deurPatroon(H, C)) },
    windveer: { ramp: H.hout, lo: 0.5, hi: houtHi, schaduwKracht: diepe, patroon: (C) => balkPatroon(C, false) },
    glas: { ramp: 'pet', lo: 0.4, hi: 2.4, schaduw: false, patroon: metRand(H, glasPatroon) },
    glasWarm: { ramp: 'goud', gloei: (C) => 2.6 + (hash(C.px >> 1, C.py >> 1, 5) % 3) * 0.35 },
    donker: { ramp: 'inkt', lo: 0, hi: 1, schaduw: false },
    // de wanden van ronde 2. Leem staat op 'aarde': in de zon wordt dat warm oker (zand), in de
    // schaduw grauw, zoals klei doet.
    leem: { ramp: 'perkament', lo: sp ? 0.9 : 1.3, hi: sp ? 5.4 : 5, schaduwKracht: diepe, patroon: metRand(H, (C) => leemPatroon(H, C)) },
    plank: { ramp: H.hout, lo: 0.6, hi: houtHi + 0.3, schaduwKracht: diepe, patroon: metRand(H, (C) => plankPatroon(H, C)) },
    blok: { ramp: H.hout, lo: 0.4, hi: houtHi + 0.3, schaduwKracht: diepe, patroon: metRand(H, (C) => blokPatroon(H, C)) },
    gehakt: { ramp: 'veldsteen', lo: 1.6, hi: 7.4, schaduwKracht: diepe, patroon: metRand(H, (C) => gehaktPatroon(H, C)) },
    luik: { ramp: H.hout, lo: 0.5, hi: houtHi - 0.4, schaduwKracht: diepe, patroon: (C) => balkPatroon(C, true) },
    // de lemen wand van een hut: droog leem, vaal en licht
    lemen: { ramp: 'zand', lo: sp ? 1.9 : 2.1, hi: sp ? 5.7 : 5.3, schaduwKracht: diepe, patroon: metRand(H, (C) => lemenPatroon(H, C)) },
  };
  if (H.dun) {
    // het dak: pannen rood, leien grijs (niet blauw: zie de veldsteen in beeld.md), spanen hout
    const ramp = H.D.ramp || H.dakHout;
    const lichter = H.dak === 'leien' ? 0.6 : 0;
    W.mat.dak = { ramp, lo: 0.6 + lichter, hi: (sp ? 6.2 : 5.8) + lichter, schaduwKracht: sp ? 0.25 : 0.4, patroon: (C) => dakPatroon(H, C) };
    W.mat.nok = { ramp, lo: 0.5 + lichter, hi: (sp ? 6 : 5.6) + lichter, schaduwKracht: diepe, patroon: (C) => (H.dak === 'spanen' ? balkPatroon(C, true) : nokDunPatroon(H, C)) };
  }
  if (H.plat) W.mat.dakvloer = { ramp: 'veldsteen', lo: 1.2, hi: 6.4, schaduwKracht: diepe, patroon: (C) => vloerPatroon(H, C) };

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
  // door een rookgat kijk je de hut in: daar is het donker
  const rm = rompMat(H);
  const rompM = H.rookgat ? (x, y, z) => (z > H.voetZ && rookgatAfstand(H, x, y, z) < 6 ? 'donker' : rm(x, y, z)) : rm;
  voeg(romp, { f: rompVeld(H), grens: [0, 0, straal + helling + 14, -3, H.zTop + 5], m: rompM, deel: 1 });
  // de drempel van een arme deur: een balk in de muur, tussen de stijlen
  if (H.deur && H.deur.arm) {
    const P = H.deur.P;
    const d = H.deur;
    const breed = d.b / 2 + (sp ? 12 : 7) + 3;
    const p = balk(P.pos(d.u - breed, 2.6, -3), P.pos(d.u + breed, 2.6 + sch * rs(80) * 1.2, -3), 6.5, 3.2, [0, 0, 1], 1.2);
    p.m = 'hout';
    p.deel = 9;
    p.zaad = 9.3;
    p.toon = -0.2;
    voeg(romp, p);
  } else if (H.deur) {
    // de drempel: een platte steen voor de deur, niet recht gelegd
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

  // --- het dak: riet, of een dunne plaat spanen, leien of pannen
  if (!H.plat) {
    const dv = dakVeld(H);
    voeg(W.groep(H.dun ? 'dak' : 'riet'), {
      // een rookgat gaat recht door het pak, haaks op het dak
      f: H.rookgat ? (x, y, z) => Math.max(dv(x, y, z), -rookgatAfstand(H, x, y, z)) : dv,
      grens: [0, 0, dakStraal, H.voetZ - H.dik * 2 - 24, H.zNmax + H.dik + 14],
      m: H.dun ? 'dak' : 'riet',
      deel: 2,
    });
  }
  // De nok: per vleugel een worst die met de nok meezakt, van gevel tot gevel of tot de knoop. De
  // lagere nok van een dwarsvleugel loopt het riet van de hoofdvleugel in: waar hij daaronder
  // verdwijnt houdt hij op, en het laatste stuk wordt hij dunner, zodat hij erin wegzakt in plaats
  // van er als een stam op te liggen. Op een dun dak is de worst een rij nokpannen of nokstenen:
  // dunner, tot de rand van de gevel, en bij pannen elke pan aan zijn onderkant een tikje wijder,
  // zodat je ziet waar de ene over de andere schuift.
  const zOp = H.dun ? (H.dik / Math.cos(H.helling)) * 0.55 : H.dik * 0.75;
  if (H.worstR) {
    for (const V of H.vleugels) {
      const nok = W.groep('nok');
      const eindG = H.dun ? V.XR - 1 : V.XR - 17;
      let a0 = V.eind[0] === 'gevel' ? -eindG : V.cJ;
      let a1 = V.eind[1] === 'gevel' ? eindG : V.cJ;
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
          return V.nokZ(a) + zOp + H.worstR - top;
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
      const panL = H.dak === 'pannen' ? H.D.nokL : 0;
      voeg(nok, {
        f: (x, y, z) => {
          const [a, q] = V.lok(x, y);
          const ac = klem(a, a0, a1);
          let zc = V.nokZ(ac) + zOp;
          let rr = H.dun ? H.worstR : H.worstR * (1 + 0.04 * sch * Math.sin(a * 0.07 + V.wF));
          if (panL) {
            const f = (ac - a0) / panL;
            rr *= 0.86 + 0.14 * (f - Math.floor(f));
          }
          if (dun) {
            const g = glad(0, 56, dun.s * (ac - dun.aB));
            rr *= 0.7 + 0.3 * g;
            zc -= (1 - g) * (H.dun ? 6 : 16);
          }
          return Math.hypot(a - ac, q, z - zc) - rr;
        },
        grens: [mx, my, (a1 - a0) / 2 + H.worstR + 4, zMin - 12, V.zN + H.dik + H.worstR + 8],
        m: 'nok',
        deel: 3 + V.i * 100,
        V,
        langs: (x, y) => V.lok(x, y)[0] - a0,
      });
    }
  }
  // Spanen hebben geen nokpannen maar nokplanken: aan elke kant een plank op het dak, die net over
  // de nok steekt, in stukken die met de doorgezakte nok meebuigen.
  if (H.dak === 'spanen') {
    const ux = Math.cos(H.helling);
    const uz = Math.sin(H.helling);
    const wB = sp ? 13 : 10;
    for (const V of H.vleugels) {
      const nok = W.groep('nok');
      const a0 = V.eind[0] === 'gevel' ? -(V.XR + 0.5) : V.cJ;
      const a1 = V.eind[1] === 'gevel' ? V.XR + 0.5 : V.cJ;
      const n = Math.max(2, Math.round((a1 - a0) / 44));
      for (const kant of [1, -1]) {
        const punt = (a) => {
          const v = wB / 2 - 1.6; // hoe ver het midden van de plank onder de nok ligt, langs het dak
          return [...V.wereld(a, kant * v * ux), V.nokZ(a) + H.dik / ux - v * uz + 1.2 + H.D.stoot];
        };
        for (let i = 0; i < n; i++) {
          const p = balk(punt(a0 + ((a1 - a0) * i) / n), punt(a0 + ((a1 - a0) * (i + 1)) / n), wB / 2, 1.2, [kant * uz * V.Qx, kant * uz * V.Qy, ux], 0.4);
          p.m = 'nok';
          p.deel = 70 + V.i * 100 + i * 2 + (kant > 0 ? 0 : 1);
          p.zaad = i * 3.7 + kant + V.i * 11;
          p.toon = sch ? rs(560 + i * 2 + (kant > 0 ? 0 : 1) + V.i * 20) * 0.5 : 0;
          voeg(nok, p);
        }
      }
    }
  }
  // De keper: op de schild in de buitenhoek van een L een rij nokpannen van de knoop naar de goot,
  // waar de twee daken elkaar raken.
  if (H.dun && H.worstR && H.knoop && H.knoop.soort === 'hoek') {
    const J = H.knoop;
    const [VA, VB] = H.vleugels;
    const R = H.worstR * 0.92;
    const c = R * 0.35;
    const cosT = Math.cos(H.helling) ** 2;
    const sinT = Math.sqrt(1 - cosT * cosT);
    const [bx, by] = VA.wereld(J.aA - J.sA * VB.Qe0, -J.sB * VA.Qe0);
    const zTop = VA.nokZ(J.aA) + zOp;
    const half = Math.hypot(J.x - bx, J.y - by, zTop - H.voetZ) / 2;
    voeg(W.groep('keper'), {
      f: (x, y, z) => {
        const PA = plekV(H, VA, x, y, z);
        const PB = plekV(H, VB, x, y, z);
        const dA = PA.dw - (H.dik - c);
        const dB = PB.dw - (H.dik - c);
        const d = Math.sqrt(Math.max(0, dA * dA + dB * dB - 2 * dA * dB * cosT)) / sinT - R;
        const aA = (x - VA.cx) * VA.Ax + (y - VA.cy) * VA.Ay;
        const aB = (x - VB.cx) * VB.Ax + (y - VB.cy) * VB.Ay;
        return Math.max(d, J.sA * (aA - J.aA) - R * 0.5, J.sB * (aB - J.aB) - R * 0.5, PA.e - 1, PB.e - 1);
      },
      g: [(J.x + bx) / 2, (J.y + by) / 2, (zTop + H.voetZ) / 2, half + R + 8],
      m: 'nok',
      deel: 5,
      langs: (x, y, z) => Math.hypot(x - J.x, y - J.y, (z - zTop) * 0.8),
    });
  }

  // --- de schoorsteen
  if (H.schoorsteen) {
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
  // o.balkDiep: zoveel eenheden verder de muur in. Voor bouwfasen-sdf.cjs, waar het gebint nog
  // zonder vulling staat en de balken dus hun echte dikte moeten tonen. Het afgewerkte huis ziet
  // er niets van: dat stuk zit in de muur (zonder de optie is het huis pixel voor pixel gelijk).
  const achter = o.balkDiep || 0;
  // een balk op muur P van (u0, h0) naar (u1, h1), breed in px, uit eenheden voor de muur
  const wandBalk = (groep, P, u0, h0, u1, h1, breed, uit, m = 'hout') => {
    const nc = (uit - 2.5 - achter) / 2;
    const a = P.pos(u0, h0, nc);
    const b = P.pos(u1, h1, nc);
    const du = Math.abs(u1 - u0);
    const dh = Math.abs(h1 - h0);
    const l = Math.hypot(du, dh) || 1;
    const hb = (breed / 2) * (du / l / PXH + dh / l / SQ);
    const p = balk(a, b, hb, (uit + 2.5 + achter) / 2, [P.N[0], P.N[1], 0], sp ? 1.6 : 0.8);
    p.m = m;
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

  // Om de openingen in een muur zonder vakwerk: stijlen en een latei om de deur, een latei boven
  // elk raam in steen (van hout, of bij de toren van gehakte steen), hoekplanken op planken, en
  // onder de planken een waterlijst op de plint.
  const omlijsting = (P, lig, stl) => {
    const uit = 4 + P.voor;
    const steen = P.wand === 'veldsteen';
    const mLat = H.plat ? 'gehakt' : 'hout';
    for (const op of P.openingen) {
      if (op.deur) {
        const d = op.deur;
        const h0 = d.h0 || 0; // een deur boven een buitentrap zit hoger
        const latei = h0 + d.h + (sp ? 6 : 4);
        if (!steen) {
          for (const kant of [-1, 1]) {
            const u = d.u + kant * (d.b / 2 + jamb / 2);
            wandBalk(stl, P, u + wiebel(1), h0, u + wiebel(1.5), latei + wiebel(1.5), dik(jamb), uit);
          }
        }
        const ov = steen ? 5 : 8;
        wandBalk(lig, P, d.u - d.b / 2 - jamb - ov, latei + balkH / 2 + wiebel(2), d.u + d.b / 2 + jamb + ov, latei + balkH / 2 + wiebel(2), dik(balkH + (steen ? 4 : 2)), steen ? 3.5 : uit + 1, mLat);
      } else if (steen && op.raam) {
        const w = op.raam;
        const top = w.h0 + w.h + (sp ? 6 : 4);
        const ov = w.spleet ? 5 : 9;
        wandBalk(lig, P, w.u - w.b / 2 - ov, top + wiebel(1.2), w.u + w.b / 2 + ov, top + wiebel(1.2), dik(sp ? 10 : 7), 3, mLat);
      }
    }
    if (P.wand !== 'planken') return;
    const top = P.U ? P.X.plaatH + 8 : P.gevel ? H.trekH : H.plaatH + 16;
    for (const kant of ['links', 'rechts']) {
      if (P[kant] !== 'hoek') continue;
      const [sa, sq] = P.hoekTekens(kant);
      const h0 = P.s === 0 ? plintOp(H, P, kant === 'links' ? 0 : P.Lu) - 2 : H.h1;
      hoekStijl(stl, P.V, P.S, sa, sq, h0, top, dik(sp ? 11 : 7), `${P.V.i},${P.s},${sa},${sq}`);
    }
    if (P.U && P.U.geenWaterlijst) return;
    if (P.s === 0) {
      // de waterlijst, onderbroken door de deuren
      let stukken = [[-2, P.Lu + 2]];
      for (const deur of P.openingen.filter((op) => op.deur)) stukken = aftrekken(stukken, [deur.u - deur.b / 2 - jamb, deur.u + deur.b / 2 + jamb]);
      for (const [u0, u1] of stukken) if (u1 - u0 > 6) wandBalk(lig, P, u0, plintOp(H, P, u0) + 2.5 + wiebel(1), u1, plintOp(H, P, u1) + 2.5 + wiebel(1), dik(sp ? 8 : 6), 5);
    } else wandBalk(lig, P, -2, H.h1 + 4 + wiebel(1.5), P.Lu + 2, H.h1 + 4 + wiebel(1.5), dik(balkH), 5);
  };

  for (const P of H.stukken) {
    if (!P.zicht || P.U) continue; // een uitbouw tekent zijn eigen hout (bouwUitbouwen)
    const lig = W.groep('liggers');
    const stl = W.groep('stijlen');
    const Lu = P.Lu;
    const sl = (u) => steenLijnStuk(H, P, u);
    // Planken, stammen en steen hebben geen vakwerk, maar wel een kozijn om de deur, een latei
    // boven de ramen en iets op de hoek.
    if (!HOUTWAND(P.wand)) omlijsting(P, lig, stl);
    for (const R of HOUTWAND(P.wand) ? registers(H, P) : []) {
      const ops = P.openingen.filter((op) => op.reg === R.i && !op.raam?.top);
      const deuren = ops.filter((op) => op.deur);
      const deur = deuren[0];
      const grond = R.lo === 'steen';
      const onder = (u) => (grond ? sl(u) + balkH / 2 : R.lo + balkH / 2);
      const onderTop = (u) => onder(u) + balkH / 2 - 2;
      const boven = R.hi;
      // de onderregel: op de steen, onderbroken door de deur (en door een deur boven een
      // buitentrap, die net boven de steen begint); bij twee lagen ligt die van de bovenverdieping
      // op de balkkoppen
      if (grond) {
        let u0 = -2;
        for (const dop of deuren.filter((op) => (op.deur.h0 || 0) < 70).sort((a, b) => a.u - b.u)) {
          const g0 = dop.u - dop.b / 2 - jamb;
          if (g0 - u0 > 6) wandBalk(lig, P, u0, onder(u0), g0, onder(g0), dik(balkH), 5);
          u0 = dop.u + dop.b / 2 + jamb;
        }
        if (Lu + 2 - u0 > 6) wandBalk(lig, P, u0, onder(u0), Lu + 2, onder(Lu + 2), dik(balkH), 5);
      } else if (H.lagen === 2) {
        wandBalk(lig, P, -2, onder(0) + wiebel(2), Lu + 2, onder(Lu) + wiebel(2), dik(balkH), 5);
      }
      // de bovenregel, de trekbalk of de regel tussen twee lagen
      const b0 = boven + wiebel(3);
      const b1 = boven + wiebel(3);
      const bovenBij = (u) => b0 + ((b1 - b0) * (u + 2)) / (Lu + 4);
      // Onder een bult in het riet zit het raam half boven de bovenregel: die houdt ernaast op,
      // en boven het raam komt een latei, net onder de opgetilde rand.
      const bultRamen = ops.filter((op) => op.raam?.bult).sort((a, b) => a.u - b.u);
      const bultLatei = (op) => op.h0 + op.h + (sp ? 9 : 6);
      if (R.boven === 'trek') wandBalk(lig, P, -2, b0, Lu + 2, b1, dik(balkH + 2), 5.5);
      else if (!bultRamen.length) wandBalk(lig, P, -2, b0, Lu + 2, b1, dik(balkH), R.boven === 'plaat' ? 4.5 : 5);
      else {
        let u0 = -2;
        for (const op of bultRamen) {
          const g = op.b / 2 + (sp ? 10 : 7) + stijlB / 2;
          if (op.u - g - u0 > 6) wandBalk(lig, P, u0, bovenBij(u0), op.u - g, bovenBij(op.u - g), dik(balkH), 4.5);
          u0 = op.u + g;
          const hl = bultLatei(op) + balkH / 2;
          wandBalk(lig, P, op.u - g - 5, hl + wiebel(1.5), op.u + g + 5, hl + wiebel(1.5), dik(balkH), 5);
        }
        if (Lu + 2 - u0 > 6) wandBalk(lig, P, u0, bovenBij(u0), Lu + 2, b1, dik(balkH), 4.5);
      }
      // de stijlen: op de hoeken, naast de deur en de ramen, en waar een vak te breed wordt
      let posts = [];
      posts.push({ u: P.links === 'hoek' ? 0 : stijlB / 2 + 1, soort: P.links === 'hoek' ? 'hoek' : 'eind', kant: 'links' });
      posts.push({ u: P.rechts === 'hoek' ? Lu : Lu - stijlB / 2 - 1, soort: P.rechts === 'hoek' ? 'hoek' : 'eind', kant: 'rechts' });
      for (const op of ops) {
        if (op.deur) {
          posts.push({ u: op.u - op.b / 2 - jamb / 2, soort: 'deur', d: op.deur });
          posts.push({ u: op.u + op.b / 2 + jamb / 2, soort: 'deur', d: op.deur });
        } else {
          const g = op.b / 2 + (sp ? 10 : 7);
          const bult = op.raam?.bult ? op : null;
          posts.push({ u: op.u - g, soort: 'raam', bult });
          posts.push({ u: op.u + g, soort: 'raam', bult });
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
        const binnenDeur = deur && samen[j].soort === 'deur' && n.soort === 'deur' && samen[j].d === n.d;
        if (vak > maxVak && !binnenDeur) {
          const extra = Math.ceil(vak / maxVak) - 1;
          for (let e = 1; e <= extra; e++) posts.push({ u: samen[j].u + (vak * e) / (extra + 1) + wiebel(3), soort: 'vul' });
        }
      }
      const topStijl = R.boven === 'plaat' ? boven + 16 : boven;
      const lateiVan = (d) => (d.h0 || 0) + d.h + (sp ? 7 : 4);
      for (const p of posts) {
        if (p.soort === 'hoek') {
          const [sa, sq] = P.hoekTekens(p.kant);
          hoekStijl(stl, P.V, P.S, sa, sq, onderTop(p.u), topStijl, dik(stijlB + 2), `${P.V.i},${P.s},${R.i},${sa},${sq}`);
        } else if (p.soort === 'deur') {
          wandBalk(stl, P, p.u + wiebel(1), p.d.h0 || 0, p.u + wiebel(1.5), lateiVan(p.d) + wiebel(1.5), dik(jamb), 4);
        } else {
          // naast een raam onder een bult loopt de stijl door tot de latei boven dat raam
          const top = p.bult ? bultLatei(p.bult) + balkH : topStijl;
          wandBalk(stl, P, p.u, onderTop(p.u), p.u + wiebel(), top, dik(p.soort === 'raam' ? stijlB - 2 : stijlB), 3.5);
        }
      }
      // de latei over de deur, die er ruim overheen steekt
      for (const dop of deuren) {
        const latei = lateiVan(dop.deur);
        const dL = dop.u - dop.b / 2;
        const dR = dop.u + dop.b / 2;
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
    if (H.lagen === 2 && P.s === 0 && H.kraag > 1) {
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

  // --- De hoeken van een blokhut: de stammen steken voorbij de hoek uit, om en om van de ene en de
  // andere muur, elk een eind anders lang, met hun kopse kant naar buiten. Een hoek die in een
  // andere vleugel valt, heeft er geen.
  let dStam = 200;
  H.vleugels.forEach((V) => {
    H.verd.forEach((S, s) => {
      if (V.wanden[Math.min(s, V.wanden.length - 1)] !== 'blokhut') return;
      const ha = V.ha + S.uit;
      const hq = V.hq + S.uit;
      const N = H.naden;
      const rijen = {
        q: N.slice(0, -1).map((h, k) => [h, N[k + 1], k]),
        a: [[0, (N[0] + N[1]) / 2, -1], ...N.slice(0, -2).map((h, k) => [(h + N[k + 1]) / 2, (N[k + 1] + N[k + 2]) / 2, k])],
      };
      for (const sa of [-1, 1]) {
        for (const sq of [-1, 1]) {
          const [cx, cy] = V.wereld(sa * ha, sq * hq);
          const binnen = H.vleugels.some((X) => {
            if (X === V) return false;
            const [a, q] = X.lok(cx, cy);
            return Math.abs(a) < X.ha + S.uit + 3 && Math.abs(q) < X.hq + S.uit + 3;
          });
          if (binnen) continue;
          const plint = plintLijn(H, 'blokhut', cx, cy);
          const g = W.groep('blokhoek');
          for (const zijde of ['q', 'a']) {
            for (const [h0, h1, k] of rijen[zijde]) {
              const H0 = plint + h0;
              const H1 = plint + h1;
              const hc = (H0 + H1) / 2;
              if (H1 > H.plaatH + 10) break;
              if (hc / PXH < S.z0 || hc / PXH > S.z1) continue;
              const zc = hc / PXH;
              const rz = (H1 - H0) / 2 / PXH;
              const A = (blokUit(H) * (H1 - H0)) / STAM(H);
              const eigen = zijde === 'q' ? ha : hq;
              const l1 = eigen + A + 5 + (hash(k + 7, sa * 3 + sq, H.zaad + V.i * 13 + (zijde === 'q' ? 0 : 50)) % 7);
              const l0 = eigen - 5;
              const st = { zijde, k, zk: H.zaad + V.i * 7 + (zijde === 'q' ? 1 : 2), A, rz, l1, scheur: rnd(k, sa + 2 * sq, H.zaad + 7) * 6.3 - 3.14 };
              st.lok = (x, y, z) => {
                const [a, q] = V.lok(x, y);
                const as = a - V.hellA * z;
                const qs = q - V.hellQ * z;
                return zijde === 'q' ? [sa * as, qs - sq * hq, z - zc] : [sq * qs, as - sa * ha, z - zc];
              };
              const lm = (l0 + l1) / 2;
              const [mx, my] = zijde === 'q' ? V.wereld(sa * lm + V.hellA * zc, sq * hq + V.hellQ * zc) : V.wereld(sa * ha + V.hellA * zc, sq * lm + V.hellQ * zc);
              voeg(g, {
                f: (x, y, z) => {
                  const [l, dn, dz] = st.lok(x, y, z);
                  const e = (Math.hypot(dn / A, dz / rz) - 1) * Math.min(A, rz);
                  return Math.max(e, l - l1, l0 - l);
                },
                g: [mx, my, zc, Math.hypot((l1 - l0) / 2, Math.max(A, rz)) + 1],
                m: 'blok',
                deel: dStam++,
                stomp: st,
              });
            }
          }
        }
      }
    });
  });

  // --- De toren: een luik in de vloer van het dak, en een spuwer door de borstwering waar het
  // water naartoe loopt.
  if (H.plat) {
    const V = H.vleugels[0];
    const lk = W.groep('luik');
    const bi = V.ha + H.uitB - H.dikB;
    const [la, lq] = [-bi * 0.45 + rs(570) * 6, -(V.hq + H.uitB - H.dikB) * 0.4 + rs(571) * 6];
    const hoek = sch * rs(572) * 6 * GRAAD;
    const [ca, sa_] = [Math.cos(hoek), Math.sin(hoek)];
    const vloer = (a, q) => H.zDak + H.vloerAf[0] * a + H.vloerAf[1] * q;
    const pl = sp ? 8 : 6;
    for (let i = -1; i <= 1; i++) {
      const pa = (a, q) => [...V.wereld(la + a * ca - q * sa_, lq + a * sa_ + q * ca), vloer(la, lq) + 1.3];
      const p = balk(pa(-14, i * (pl + 0.3)), pa(14, i * (pl + 0.3)), pl / 2, 1.1, [0, 0, 1], 0.3);
      p.m = 'luik';
      p.deel = 90 + i;
      p.zaad = i * 5.3 + 2;
      p.toon = rs(573 + i) * 0.5;
      p.naad = pl / 2;
      voeg(lk, p);
    }
    // de spuwer: op de laagste hoek, door de borstwering van een muur die je ziet
    const sa = H.vloerAf[0] < 0 ? 1 : -1;
    const sq = H.vloerAf[1] < 0 ? 1 : -1;
    const opQ = sq > 0 || sa < 0;
    const zS = H.zDak + 1.5;
    const [p0, p1] = opQ
      ? [V.wereld(sa * (V.ha - 18), V.hq + H.uitB - H.dikB - 2), V.wereld(sa * (V.ha - 18), V.hq + H.uitB + 13)]
      : [V.wereld(V.ha + H.uitB - H.dikB - 2, sq * (V.hq - 18)), V.wereld(V.ha + H.uitB + 13, sq * (V.hq - 18))];
    const p = balk([...p0, zS + 1.5], [...p1, zS - 1.5], 3.4, 3, [0, 0, 1], 0.6);
    p.m = 'gehakt';
    p.deel = 95;
    voeg(W.groep('spuwer'), p);
  }

  // --- de windveren: dikke gebogen planken over de kopse kant van het riet, met een knop in de top.
  // Alleen aan de gevels die je ziet (de +a-kant). Op een dun dak een platte plank langs de rand.
  // een schoorsteen tegen de gevel: daar houdt de windveer op
  const GS = H.gevelSchoorsteen;
  const achterSchoorsteen = (V, pa, pb) => {
    if (!GS || GS.V !== V) return false;
    const q = V.lok((pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2)[1];
    return Math.abs(q - GS.qC) < GS.w1 / 2 + 7 && Math.min(pa[2], pb[2]) < GS.zTop + 4;
  };
  for (const G of H.gevels) {
    if (G.e < 0) continue;
    const V = G.V;
    const wv = W.groep('windveer');
    if (H.dun) {
      const x = V.XR + 1.3;
      for (const kant of [1, -1]) {
        const n = 6;
        const pts = [];
        for (let i = 0; i <= n; i++) {
          const t = -0.03 + (1.05 * i) / n;
          const z0 = V.nokZ(x);
          pts.push([...V.wereld(x, kant * V.voetQ(x) * t), z0 + (V.voetZ(x) - z0) * t + 1.2]);
        }
        for (let i = 0; i < n; i++) {
          if (achterSchoorsteen(V, pts[i], pts[i + 1])) continue;
          const p = balk(pts[i], pts[i + 1], H.dik + (sp ? 3.5 : 2.5), sp ? 1.8 : 1.3, [V.Ax, V.Ay, 0], 0.5);
          p.m = 'windveer';
          p.deel = 60 + (kant > 0 ? 0 : 1) + V.i * 100;
          p.zaad = i + kant * 5;
          p.toon = 0;
          voeg(wv, p);
        }
      }
      continue;
    }
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
        if (achterSchoorsteen(V, a, b)) continue;
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
    // de knop in de top (een hut heeft er geen: o.knop false)
    if (H.knop === false) continue;
    const zk = V.nokZ(x) + H.dik + (H.worstR ? H.worstR * 0.9 : 3);
    const [kx, ky] = V.wereld(x, 0);
    voeg(wv, { f: (px, py, pz) => sdf.bol(px - kx, py - ky, pz - zk, sp ? 7 : 4.5), g: [kx, ky, zk, (sp ? 7 : 4.5) + 1], m: 'windveer', deel: 62 + V.i * 100 });
  }

  // --- ramen: kozijn met een kruis en een vensterbank, en het glas achterin het gat
  // (een spleet in een torenmuur heeft geen kozijn en geen glas)
  const ramen = H.openingen.filter((op) => op.raam && !op.raam.spleet && !op.raam.gat).map((op) => op.raam);
  const ramenG = W.groep('ramen');
  ramen.forEach((w, i) => {
    const op = w.op;
    const rw = (sp ? 5 : 3) / SQ; // kozijn, breed
    const rk = (sp ? 3 : 2) / SQ; // kruis
    const bankH = E(sp ? 5 : 3);
    const [cx, cy, cz] = w.P.pos(w.u, w.h0 + w.h / 2);
    const klein = w.b < (sp ? 28 : 20);
    const voor = w.P.voor; // op stammen zit het kozijn voor de stammen
    const p = {
      f: (x, y, z) => {
        const [a, v, n] = op.lok(x, y, z);
        const buiten = rechthoek(a, v, op.hb + rw, op.hh + rw * 0.8);
        const binnen = rechthoek(a, v, op.hb, op.hh);
        let d = laag(Math.max(buiten, -binnen), n - voor, -2.5, sp ? 3.2 : 2);
        // het kruis, iets terug in het gat (een klein raampje heeft alleen een middenstijl)
        const kruis = klein ? rechthoek(a, v, rk, op.hh + 0.5) : Math.min(rechthoek(a, v, rk, op.hh + 0.5), rechthoek(a, v - op.hh * 0.18, op.hb + 0.5, rk * 0.85));
        d = Math.min(d, laag(kruis, n, -op.diep + 0.5, -op.diep + 3.5));
        // de vensterbank
        const bank = rechthoek(a, v + op.hh + rw * 0.8 + bankH / 2, op.hb + rw + 3, bankH / 2 + 0.5);
        return Math.min(d, laag(bank, n - voor, -2, sp ? 7 : 4.5));
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

  // --- een gat als raam (o.ramen met gat, een hut): binnen is het donker (raam() gaf het gat een
  // donkere binnenkant), met een latei van een ronde stok erboven en twee staken erin
  H.openingen.filter((op) => op.raam && op.raam.gat).forEach((op, i) => {
    const w = op.raam;
    const P = w.P;
    const g = W.groep('ramen');
    const hL = w.h0 + w.h + (sp ? 4 : 3);
    const latei = rondePaal(P.pos(w.u - w.b / 2 - (sp ? 8 : 5), hL + wiebel(1.5), 1.2), P.pos(w.u + w.b / 2 + (sp ? 8 : 5), hL + wiebel(1.5), 1.2), sp ? 2.4 : 1.8);
    for (const [k, q] of [[-1, 1], [1, 2]]) {
      const u = w.u + (k * w.b) / 5 + wiebel(1);
      voeg(g, Object.assign(rondePaal(P.pos(u, w.h0 - 4, -3.6), P.pos(u + wiebel(1.2), w.h0 + w.h + 4, -3.6), sp ? 1.45 : 1.1), { m: 'hout', deel: 480 + i * 4 + q, zaad: 3.3 * q + i, toon: -0.3 }));
    }
    voeg(g, Object.assign(latei, { m: 'hout', deel: 480 + i * 4, zaad: 7.1 + i, toon: 0.1 }));
  });

  // --- de hoekpalen van een lemen wand: ronde palen in de grond, half in het leem, tot onder het
  // riet. De achterste staat er ook, al zie je hem niet (bouwfasen-sdf.cjs zet ze in de grond).
  H.vleugels.forEach((V) => {
    if (V.wanden[0] !== 'lemen') return;
    const g = W.groep('hoekpalen');
    H.hoekpalen = [];
    for (const [sa, sq, i] of [[-1, -1, 0], [1, -1, 1], [-1, 1, 2], [1, 1, 3]]) {
      const R = (k) => r(990 + i * 7 + k);
      const rp = (sp ? 6.2 : 4.6) * (0.92 + 0.16 * R(1));
      const uit = 2.4; // zoveel steekt hij uit elke muur
      const top = H.plaatH + 8 + sch * rs(991 + i * 7) * 5;
      const c = (h) => {
        const z = h / PXH;
        return [...V.wereld(sa * (V.ha - rp + uit) + V.hellA * z, sq * (V.hq - rp + uit) + V.hellQ * z), z];
      };
      const p = rondePaal(c(-6), c(top), rp);
      voeg(g, Object.assign(p, { m: 'hout', deel: 470 + i, zaad: 5.3 * i + 1, toon: sch ? rs(995 + i * 7) * 0.5 : 0 }));
      H.hoekpalen.push({ sa, sq, r: rp, top, voet: c(-6), kop: c(top) });
    }
  });

  // --- de uitbouwen (ronde 3)
  bouwUitbouwen(W, H, { wandBalk, hoekStijl, omlijsting, dik, wiebel, balkH, stijlB });

  // --- de deuren, die er net niet recht in hangen (de voordeur, en een deur boven een buitentrap,
  // op een galerij of in een aanbouw)
  H.deuren.forEach((D, j) => {
    const op = D.op;
    const dg = W.groep('deur');
    const hoek = D.blad;
    const co = Math.cos(hoek);
    const si = Math.sin(hoek);
    const hb = op.hb - 1.8;
    const hh = op.hh - 1.2;
    const lok = (x, y, z) => {
      const [a, v, n] = op.lok(x, y, z);
      const vv = v + 0.8;
      return [a * co + vv * si, -a * si + vv * co, n + op.diep - 1.5];
    };
    const [cx, cy, cz] = D.P.pos(D.u, (D.h0 || 0) + D.h / 2);
    voeg(dg, {
      f: (x, y, z) => {
        const [a, v, n] = lok(x, y, z);
        return laag(rechthoek(a, v, hb, hh), n, -1.5, 1.2);
      },
      g: [cx, cy, cz, Math.hypot(hb, hh) + 10],
      m: 'deur',
      deel: 30 + j,
      lok,
      hb,
      hh,
      arm: !!D.arm,
    });
  });
  return W;
}

// Het proefhuis van de eerste ronde: een rechthoek van 8 × 6 met één laag.
function proefhuis(zaad = 1, o = {}) {
  return huis(zaad, { vorm: 'rechthoek', b: 8, d: 6, lagen: 1, ...o });
}

// Een huis zoals het zaad het wil: vorm, maat, lagen en de richting van de nok. Het materiaal kiest
// maten() daarna zelf, uit hetzelfde zaad. Maten in tegels (ontwerp/wereld.md: een gewoon huis is
// 6 × 8, een herberg met twee lagen 7 × 9).
function kiesHuis(zaad) {
  const r = (k) => meng(zaad, 900 + k);
  const vorm = kiesUit([['rechthoek', 0.55], ['L', 0.3], ['T', 0.15]], r(1));
  const lagen = kiesUit([[1, 0.45], [1.5, 0.32], [2, 0.23]], r(2));
  const spec = { zaad, vorm, lagen, nok: r(3) < 0.5 ? 'x' : 'y' };
  const tel = (k, van, n) => van + Math.min(n - 1, Math.floor(r(k) * n));
  if (vorm === 'rechthoek') Object.assign(spec, { b: tel(4, 6, 4), d: tel(5, 5, 2) });
  else if (vorm === 'L') {
    const d = tel(5, 5, 2);
    Object.assign(spec, { b: tel(4, 8, 3), d, b2: tel(6, 4, 3), d2: d + tel(7, 3, 3), kant: r(8) < 0.5 ? -1 : 1, voor: r(9) < 0.7 });
  } else Object.assign(spec, { b: tel(4, 9, 3), d: tel(5, 5, 2), b2: tel(6, 4, 2), p2: tel(7, 3, 2), voor: r(9) < 0.7 });
  return spec;
}

// Waar de tovenaar kan staan: een eind voor de deur, in tegels.
function voorDeDeur(H, afstand = 1.3) {
  const d = H.deur;
  if (!d) return [0, 0];
  const [x, y] = d.P.pos(d.u, 0, afstand * TEGEL);
  return [x / TEGEL, y / TEGEL];
}

// Wat de losse tuinstukken (tuin-sdf.cjs) met de huizen delen: het hout (balkPatroon voor balken
// en planken, stamHuid voor stammen, vlechtwerk voor twijgen), de knoppen en het zaad. En wat
// bouwfasen-sdf.cjs nodig heeft om hetzelfde huis in aanbouw te tekenen: het uitpuilen van de
// muren (bolQ, bolA), de bovenkant van de steen (steenLijn), de vormen van een opening, en voor de
// hut het leem (lemenPatroon, met de schaduw onder de dakrand: metRand), het rookgat en zijn roet,
// de plek op het dak (plekV) en een ronde paal.
module.exports = { huis, proefhuis, maten, dakPlek, plekV, voorDeDeur, kiesHuis, DAKEN, WANDEN, balkPatroon, stamHuid, vlechtwerk, lemenPatroon, metRand, rookgatAfstand, roet, rondePaal, knoppenVan, meng, kiesUit, bolQ, bolA, steenLijn, laag, rechthoek };
