// Elk mens ziet er anders uit (werklijst vraag 145, 1; Marcel, 9 okt: "het voelt gewoon wat 'saai' in het dorp", en
// "Kleren, haar, niet iedereen heeft een hoofddeksel. Ook verschillende gezichten, baard etc. Lang haar, kort haar
// mannen en vrouwen. Schoenen eventueel"). Tot nu toe had elke leeftijd één poppetje per geslacht: twintig mensen
// voelden als vier. Hier staan de uiterlijken: per lijf acht, elk een andere kleur kleren (een verf die er toen was:
// ongeverfd linnen, blauw van wede, rood van meekrap, geel en oker van wouw, groen, bruin, grijs), ander haar (blond,
// bruin, kastanje, zwart, rood), een kapsel (kort, lang, krullen, een staart, kaal; bij een vrouw een knot, een vlecht,
// twee vlechten, los of kort), een baard of niet, een hoofddeksel of niet, en een ander gezicht (neus, wenkbrauwen).
// Ze zijn met de hand samengesteld, niet geloot: zo is elk een mens, en geen toevalstreffer.
//
// UITERLIJKEN.<lijf> is een lijst opties voor de bouwfunctie van dat lijf (boer() in dorpelingen.cjs, boerin() in
// dorpelingen2.cjs; de opties staan daar beschreven). Het haar staat erbij als `kleur` (HAAR), zodat een kind het haar
// van een ouder kan krijgen (js/bewoners.js). De hulpjes hieronder bouwen wat er nieuw is aan een hoofd; ze leunen
// alleen op de bouwstenen (kern, figuren, figuren2), zoals karakters.cjs.
//
//   node gereedschap/pixelart/uiterlijk.cjs proef     de proefplaat: alle uiterlijken staand, in ZO en Z, op 1× en 3×,
//                                                      in gereedschap/pixelart/uit/uiterlijk/
// Lokale assen zoals overal: x naar rechts van de figuur, y naar voren, z omhoog; de voeten op z = 0.
'use strict';
const { sdf } = require('./kern.cjs');
const { kegel, bol, ellips, plus } = require('./figuren.cjs');

// ---------------------------------------------------------------- de kleuren

// Haar, als materiaal, met lokken erin (een lichtere streep, schuin over het hoofd) en een scheiding bovenop (bij een volwassene).
// Grijs is voor de ouden.
const lokken = (x, y, z) => (Math.abs(x) < 0.45 && z > 71 && y > -2 ? -1.2 : Math.sin(x * 2.1 + z * 0.7 + y * 0.4) > 0.62 ? 0.7 : 0);
const HAAR_KLEUR = {
  blond: { ramp: 'stro', lo: 2, hi: 6 },
  bruin: { ramp: 'aarde', lo: 1, hi: 4.6 },
  donker: { ramp: 'schors', lo: 0.8, hi: 4.2 },
  kastanje: { ramp: 'hout', lo: 1, hi: 4.4 },
  zwart: { ramp: 'vacht', lo: 0.3, hi: 2.6 },
  rood: { ramp: 'herfst', lo: 1.2, hi: 5 },
  grijs: { ramp: 'baard', lo: 1.6, hi: 5.6 },
};
const HAAR = Object.fromEntries(Object.entries(HAAR_KLEUR).map(([k, v]) => [k, { ...v, patroon: lokken }]));

// Kleren: de verf van toen, gedempt (lo en hi binnen de ramp, zodat niets fel wordt).
const STOF = {
  linnen: { ramp: 'perkament', lo: 1.4, hi: 4.8 },
  wit: { ramp: 'pleister', lo: 2.2, hi: 6.2 },
  blauw: { ramp: 'pet', lo: 1.4, hi: 6 },
  lichtblauw: { ramp: 'gewaad', lo: 1.6, hi: 4.4 },
  rood: { ramp: 'rood', lo: 1.6, hi: 5.2 },
  terracotta: { ramp: 'dak', lo: 1, hi: 5.6 },
  oker: { ramp: 'stro', lo: 1.2, hi: 4.6 },
  groen: { ramp: 'mos', lo: 0.8, hi: 5 },
  bruin: { ramp: 'jas', lo: 1, hi: 4.8 },
  grijs: { ramp: 'vacht', lo: 1.2, hi: 5 },
  donker: { ramp: 'schors', lo: 0.6, hi: 3.6 },
};
// Een stof met een paar plooien erin, zoals de kiel van de boer.
const geplooid = (stof, f = 1.3) => ({ ...stof, patroon: (x, y, z) => (Math.sin(x * f + 0.4) > 0.84 ? -0.6 : 0) });

// Schoenen: klompen van wilgenhout, of leer.
const SCHOEN = {
  klomp: { ramp: 'zand', lo: 3, hi: 7.4 },
  donkereKlomp: { ramp: 'hout', lo: 2, hi: 5.6 },
  leer: { ramp: 'leer', lo: 0.6, hi: 3.6, glans: 1 },
};

// ---------------------------------------------------------------- het hoofd

// Het haar van een man, bovenop de kap die boer() altijd legt (achter op het hoofd). soort: 'kort' (een korte pony),
// 'lang' (tot op de schouders), 'krul' (krullen over het hele hoofd), 'staart' (lang, achter bijeengebonden). Onder een
// hoed blijft alleen zichtbaar wat eronder uitkomt. maat = de stralen van het hoofd.
function kapselMan(delen, H, [rx, ry, rz], m, d, soort) {
  if (soort === 'kort') delen.push(ellips(plus(H, [0.4, ry * 0.5, rz * 0.62]), [rx * 0.78, 2.6, 1.7], m, d, 0.8));
  if (soort === 'lang' || soort === 'staart') {
    // over de kruin naar achteren, en achter tot in de nek
    delen.push(ellips(plus(H, [0, -1.4, 1.6]), [rx + 0.5, ry - 0.4, rz - 0.6], m, d, 1));
    delen.push(ellips(plus(H, [0, -3.4, -3.6]), [rx + 0.3, 3.6, 6.4], m, d, 1.2));
  }
  if (soort === 'lang') {
    // opzij, achter de oren langs tot op de schouders; een fractie ongelijk
    for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * (rx - 0.4), -1.6, -4.4 - (s > 0 ? 0.6 : 0)]), [1.9, 3.2, 6.6], m, d, 1));
    delen.push(ellips(plus(H, [0, -4, -9]), [rx - 1, 3, 3.4], m, d, 1));
  }
  if (soort === 'staart') {
    delen.push(kegel(plus(H, [0, -6.4, -2.2]), plus(H, [0.6, -8.6, -12.4]), 2.1, 1, m, d, 0.8));
  }
  if (soort === 'krul') {
    // krullen: bolletjes over de kruin en achter, op een vast patroon
    for (let i = 0; i < 26; i++) {
      const a = i * 2.39996; // de gulden hoek, zodat ze gelijk verdeeld liggen
      const h = 1 - (i + 0.5) / 26;
      const z = 0.25 + h * 0.75;
      const r = Math.sqrt(1 - z * z);
      const dx = Math.cos(a) * r;
      const dy = Math.sin(a) * r;
      if (dy > 0.55 && z < 0.75) continue; // het gezicht blijft vrij
      delen.push(bol(plus(H, [dx * (rx + 0.3), dy * (ry + 0.3) - 1, z * (rz + 0.2)]), 2.1, m, d, 0.6));
    }
  }
}

// Kaal, met een krans haar boven de oren die wat uitstaat (zoals de hoed 'bloot' van boer()).
function krans(delen, H, m, d) {
  delen.push(ellips(plus(H, [-6.4, -1.3, 1.8]), [1.9, 3.3, 2.7], m, d, 0.8));
  delen.push(ellips(plus(H, [6.3, -1.6, 1.5]), [1.8, 3.4, 2.5], m, d, 0.8));
  delen.push(ellips(plus(H, [0, -5.6, 0.2]), [5.2, 1.8, 2.8], m, d, 0.8));
}

// Een snor: van onder de neus naar de mondhoeken en dan omlaag, wat voller dan die in de volle baard (KAR.baard).
function snor(delen, H, [, ry], m, d, z = -3.7) {
  for (const s of [-1, 1]) delen.push(kegel(plus(H, [s * 0.6, ry + 0.7, z]), plus(H, [s * 4.2, ry - 0.6, z - 2.8]), 1.6, 0.9, m, d, 0.8));
}

// Een sik: een kort puntje aan de kin, met een snor.
function sik(delen, H, [rx, ry, rz], m, d) {
  snor(delen, H, [rx, ry, rz], m, d);
  delen.push(kegel(plus(H, [0, ry * 0.55, -rz * 0.8]), plus(H, [0.3, ry * 0.7, -rz - 4]), 2.2, 0.9, m, d, 1));
}

// Stoppels: het onderste deel van het gezicht een stap donkerder, in plukjes (een patroon op de huid).
function stoppels(H, [, ry, rz], vorig = null) {
  return (x, y, z, nx, ny, nz, stap) => {
    const dz = z - H[2];
    if (dz < -rz * 0.25 && y > H[1] + ry * 0.2 && Math.sin(x * 3.1 + z * 2.3) + Math.sin(z * 4.3 - x) > -0.2) return -1.1;
    return vorig ? vorig(x, y, z, nx, ny, nz, stap) : 0;
  };
}

// Een wollen muts zonder veer of kwast: een opgerolde rand en een bol die een fractie naar één kant zakt.
function wolmuts(delen, H, [rx, ry], m, d, zij = 1) {
  const c = plus(H, [0, -0.6, 3]);
  const a = rx + 0.9;
  const b = ry + 0.9;
  delen.push({
    f: (x, y, z) => {
      const dx = x - c[0];
      const dy = y - c[1];
      const dz = z - c[2] - 0.18 * dy - 0.05 * zij * dx;
      const q = (Math.hypot(dx / a, dy / b) - 1) * Math.min(a, b);
      return Math.hypot(q, dz / 1.1) - 1.5;
    },
    g: [c[0], c[1], c[2], Math.max(a, b) + 4],
    m,
    deel: d,
  });
  delen.push(ellips(plus(H, [0.8 * zij, -1.4, 6.6]), [rx + 1.1, ry + 0.9, 5.6], m, d, 1.2));
  delen.push(ellips(plus(H, [2.6 * zij, -2.6, 10.2]), [3.2, 3, 2.6], m, d, 1.2));
}

// Het haar van een vrouw zonder doek, bovenop de haarkap die boerin() altijd legt. soort: 'knot' (achter op het hoofd),
// 'vlecht' (één, over de rug), 'vlechten' (twee, over de schouders naar voren), 'los' (lang, over de rug en de schouders),
// 'kort' (tot de kaak).
function kapselVrouw(delen, H, [rx, ry, rz], m, d, soort) {
  // de kruin: het haar over het hoofd, met de haargrens hoog op het voorhoofd en achter de slapen langs
  delen.push({
    f: (x, y, z) => {
      const dx = x - H[0];
      const dy = y - H[1];
      const dz = z - H[2];
      const e = sdf.ellipsoide(dx, dy + 0.6, dz - 0.6, rx + 0.45, ry + 0.2, rz + 0.25);
      const lijn = (dy - 3.4 - 1.25 * (dz - 4.6)) / 1.6;
      return Math.max(e, lijn);
    },
    g: [H[0], H[1], H[2] + 0.6, rx + 3],
    m,
    deel: d,
    k: 0.8,
  });
  if (soort === 'knot') delen.push(bol(plus(H, [0, -7.4, 1.4]), 3.4, m, d, 1));
  if (soort === 'vlecht') vlechtje(delen, plus(H, [0, -6.6, -2]), plus(H, [0, -9.6, -10]), plus(H, [0.6, -9.4, -21]), m, d);
  if (soort === 'vlechten') {
    for (const s of [-1, 1]) vlechtje(delen, plus(H, [s * 5, -2.6, -3]), plus(H, [s * 8.6, 0.4, -9.6]), plus(H, [s * 7.4, 4.4, -18.4]), m, d);
  }
  if (soort === 'los') {
    delen.push(ellips(plus(H, [0, -4, -6]), [rx + 0.6, 4, 10.4], m, d, 1.2));
    for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * (rx - 0.2), -0.6, -5.4]), [2.1, 3.4, 7.6], m, d, 1));
  }
  if (soort === 'kort') {
    delen.push(ellips(plus(H, [0, -2.4, -1.2]), [rx + 0.9, ry - 1, rz - 0.6], m, d, 1));
    for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * (rx - 0.1), -0.8, -2.6]), [1.8, 3, 4.4], m, d, 0.8));
  }
}

// Een vlecht langs drie punten: schakels die om en om een fractie opzij liggen, en dunner worden, met een strikje.
function vlechtje(delen, p0, p1, p2, m, d, r0 = 2, r1 = 1.1, n = 8) {
  const bez = (t) => [0, 1, 2].map((i) => (1 - t) * (1 - t) * p0[i] + 2 * (1 - t) * t * p1[i] + t * t * p2[i]);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const p = bez(t);
    const r = r0 + (r1 - r0) * t;
    delen.push(ellips(plus(p, [(i % 2 ? 0.5 : -0.5) * r, 0, 0]), [r * 1.05, r, r * 1.25], m, d, 0.6));
  }
  delen.push(bol(plus(p2, [0, 0, -1.2]), r1 * 0.9, m, d, 0.5));
}

// ---------------------------------------------------------------- de uiterlijken

// De boer, voor alle mannen van het dorp (T.LEEFTIJDEN in js/bewoners.js). Geen hooivork: die is van de boer zelf.
// hoed: 'stro', 'vilt', 'wol' (met muts: de kleur), 'kap' (de kaproen) of 'geen'; kapsel: zie kapselMan, of 'kaal';
// baard: 'vol', 'kort', 'snor', 'sik', 'stoppels' of niets; kraag: 'geen' of de halsdoek (halsdoek: de kleur); neusMaat: een maat (1 is die van de boer); wenkbrauw: een maat.
const man = (o) => ({ links: 'hangt', strootje: false, ...o, haar: HAAR[o.kleur], kiel: geplooid(STOF[o.kiel]), broek: STOF[o.broek], klomp: SCHOEN[o.schoen] });
const UITERLIJKEN = {
  boer: [
    man({ kleur: 'donker', hoed: 'stro', kapsel: 'kort', baard: 'snor', kiel: 'blauw', broek: 'bruin', schoen: 'klomp' }),
    man({ kleur: 'blond', hoed: 'geen', kapsel: 'lang', baard: 'kort', kraag: 'geen', kiel: 'linnen', broek: 'donker', schoen: 'leer', neusMaat: 0.85 }),
    man({ kleur: 'zwart', hoed: 'wol', muts: STOF.rood, halsdoek: STOF.linnen, kapsel: 'kort', baard: 'stoppels', kiel: 'bruin', broek: 'grijs', schoen: 'klomp', wenkbrauw: 1.4 }),
    man({ kleur: 'rood', hoed: 'geen', kapsel: 'krul', baard: 'vol', kraag: 'geen', kiel: 'groen', broek: 'bruin', schoen: 'donkereKlomp', neusMaat: 1.15 }),
    man({ kleur: 'bruin', hoed: 'vilt', halsdoek: STOF.donker, kapsel: 'staart', baard: 'sik', kiel: 'grijs', broek: 'bruin', schoen: 'leer', neusMaat: 1.3 }),
    man({ kleur: 'kastanje', hoed: 'geen', kapsel: 'kaal', kraag: 'geen', baard: 'vol', kiel: 'oker', broek: 'donker', schoen: 'klomp', neusMaat: 1.35, wenkbrauw: 1.5, links: 'zij' }),
    man({ kleur: 'blond', hoed: 'wol', muts: STOF.groen, halsdoek: STOF.oker, kapsel: 'lang', kiel: 'rood', broek: 'bruin', schoen: 'klomp', neusMaat: 0.9 }),
    man({ kleur: 'donker', hoed: 'stro', kapsel: 'lang', baard: 'kort', halsdoek: STOF.wit, kiel: 'lichtblauw', broek: 'grijs', schoen: 'donkereKlomp', neusMaat: 1.1 }),
  ],
};
// De boerin, voor alle vrouwen. hoofd: 'doek' (onder de kin geknoopt; met doek: de kleur), 'nekdoek' (in de nek) of
// 'geen'; kapsel: zie kapselVrouw.
const vrouw = (o) => ({ mand: false, links: 'hangt', rechts: 'hangt', ...o, haar: HAAR[o.kleur], jurk: STOF[o.jurk], schort: o.schort ? geplooid(STOF[o.schort], 1.1) : false, doek: o.doek && STOF[o.doek] });
UITERLIJKEN.boerin = [
  vrouw({ kleur: 'bruin', hoofd: 'doek', doek: 'wit', jurk: 'terracotta', schort: 'blauw', mand: true, links: undefined, rechts: undefined }),
  vrouw({ kleur: 'blond', hoofd: 'geen', kapsel: 'vlecht', jurk: 'blauw', schort: 'wit', neusMaat: 0.9 }),
  vrouw({ kleur: 'donker', hoofd: 'nekdoek', doek: 'rood', jurk: 'groen', schort: 'linnen' }),
  vrouw({ kleur: 'zwart', hoofd: 'geen', kapsel: 'knot', jurk: 'bruin', neusMaat: 1.15, rechts: 'zij' }),
  vrouw({ kleur: 'kastanje', hoofd: 'doek', doek: 'oker', jurk: 'grijs', schort: 'wit' }),
  vrouw({ kleur: 'rood', hoofd: 'geen', kapsel: 'los', jurk: 'linnen', schort: 'groen', neusMaat: 0.85 }),
  vrouw({ kleur: 'bruin', hoofd: 'geen', kapsel: 'kort', jurk: 'rood', schort: 'grijs', neusMaat: 1.2 }),
  vrouw({ kleur: 'blond', hoofd: 'geen', kapsel: 'vlechten', jurk: 'lichtblauw', schort: 'linnen' }),
];

module.exports = { HAAR, STOF, SCHOEN, UITERLIJKEN, kapselMan, krans, snor, sik, stoppels, wolmuts, kapselVrouw, vlechtje };

// ---------------------------------------------------------------- de proefplaat

if (require.main === module && process.argv[2] === 'proef') {
  const fs = require('fs');
  const path = require('path');
  const K = require('./kern.cjs');
  const { boer } = require('./dorpelingen.cjs');
  const { boerin } = require('./dorpelingen2.cjs');
  const UIT = path.join(__dirname, 'uit', 'uiterlijk');
  fs.mkdirSync(UIT, { recursive: true });
  const bouw = { boer, boerin };
  const CEL = [112, 124];
  const rijen = [];
  for (const lijf of ['boer', 'boerin']) {
    for (const kant of ['ZO', 'Z']) {
      rijen.push(UITERLIJKEN[lijf].map((o) => K.losRenderen(bouw[lijf]({ houding: 'staan', fase: 0 }, o), { b: CEL[0], h: CEL[1], anker: [56, 110], richting: kant })));
    }
  }
  // elke cel bijsnijden tot wat erin staat, met een vaste breedte per kolom
  const KOL = 56;
  const BOVEN = 20;
  const HOOG = 100;
  const vel = new K.Plaat(KOL * 8 + 8, HOOG * rijen.length);
  rijen.forEach((rij, r) => rij.forEach((p, i) => vel.plak(p.uitsnede(28, BOVEN, KOL, HOOG), 4 + i * KOL, r * HOOG)));
  fs.writeFileSync(path.join(UIT, 'proef-1x.png'), K.png(vel, 1, '#5e6a44'));
  fs.writeFileSync(path.join(UIT, 'proef-3x.png'), K.png(vel, 3, '#5e6a44'));
  console.log(path.join(UIT, 'proef-3x.png'));
}
