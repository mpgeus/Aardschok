// Proefplaten van de maaier: de boer met een zeis, om te beoordelen vóórdat er iets in het spel of
// in beelden/ komt (werklijst: "boer met zeis"; ontwerp/spel.md). Raakt graan.cjs en
// graan-proef.cjs niet aan — gebruikt ze alleen (graan.cjs wordt tegelijk door een andere agent
// uitgebreid, ronde 2).
//
//   node gereedschap/pixelart/maaier-proef.cjs   ->  gereedschap/pixelart/uit/maaier/*.png
//
// Wat erop staat:
//   veld.png            de maaier in een rijp veld, stoppels en een zwad achter hem
//   veld-uitsnede.png   een 600×400 uitsnede daarvan
//   reeks-<kant>.png    de maaislag als rij van 12 beelden, voor een paar richtingen
//   maaier.png           het vel: een rij per richting, een kolom per beeld (net als
//                        animaties-export.cjs, maar zonder de auto-uitsnede — dit is een proef)
//   maaier-lus-z.png     een bewegende PNG van de lus (richting Z)
//   maaier-lus-zo.png    dezelfde lus, richting ZO
//   zeis.png             de zeis los
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { model, kegel } = require('./figuren.cjs');
const G = require('./graan.cjs');
const D = require('./dorp.cjs'); // grondKaart/grondTex rechtstreeks, voor een veld met twee stadia
const Ma = require('./maaier.cjs');
const { apng } = require('./apng.cjs');

const UIT = path.join(__dirname, 'uit', 'maaier');
fs.mkdirSync(UIT, { recursive: true });
const t0 = Date.now();
let totaalBytes = 0;
function schrijf(naam, buf) {
  fs.writeFileSync(path.join(UIT, naam), buf);
  totaalBytes += buf.length;
  console.log(' ', naam, `${(buf.length / 1024).toFixed(0)} kB`);
}

console.log('Maaier — proefplaten (' + new Date().toISOString() + ')');

// ---------------------------------------------------------------- 1) het veld: rijp, met een
// gemaaide strook en een zwad erin, de maaier op de grens

// Een paar losse, laag liggende bundels gemaaid graan (het zwad): dezelfde bouwstenen als
// schoof() in graan.cjs (kegel, ramp 'stro'), maar plat neergelegd in plaats van rechtop gebonden
// — er zijn er maar een paar per tegel nodig, dus dit mag (net als de schoof) een echt model met
// licht en omlijning zijn, zie de opmerking bovenaan graan.cjs.
function zwadBundel(zaad) {
  const mat = [{ ramp: 'stro', lo: 1.4, hi: 6, patroon: (x, y, z) => (Math.sin(y * 1.6 + x * 0.5) > 0.82 ? -0.8 : 0) }];
  const d = [];
  const n = 4 + Math.floor(K.rnd(zaad, 1) * 3);
  // de stelen liggen vrijwel evenwijdig (in de richting van het zwad, lokaal x), met maar een
  // klein beetje jitter dwars en in lengte — zo leest een bundel als een handvol stro dat samen
  // is neergevallen, niet als losse takjes door elkaar
  for (let i = 0; i < n; i++) {
    const dwars = (K.rnd(zaad, i * 3 + 2) - 0.5) * 2.6;
    const lengte = 24 + K.rnd(zaad, i * 3 + 3) * 12;
    const kop = 1.8 + K.rnd(zaad, i * 3 + 4) * 0.9;
    const scheef = (K.rnd(zaad, i * 3 + 5) - 0.5) * 3;
    d.push(kegel([-lengte * 0.5, dwars, 1.4], [lengte * 0.5, dwars + scheef, 0.6], kop, 0.5, 0, 1));
  }
  return model(d, mat, { midden: [0, 0, 1], straal: 24 });
}

const B_VELD = 8; // breedte in tegels
const D_RIJP = 3.4; // diepte van het nog staande, rijpe deel
const D_MAAID = 1.6; // diepte van de gemaaide strook erachter
const D_TOT = D_RIJP + D_MAAID;
const MARGE = 0.9;
const ZAAD_VELD = 31;
const FIG_GX = 4.1;
const FIG_GY = D_RIJP - 0.6; // net binnen het rijpe deel, dicht bij de grens met de stoppels

function veldMetMaaier(fase) {
  const figHoog = 90;
  const maxHoog = Math.max(G.MAX_HOOG.rijp, figHoog);
  const { OX, OY, BREED, HOOG } = G.veldAfmeting(B_VELD, D_TOT, MARGE, maxHoog);
  const Bimg = new K.Beeld(BREED, HOOG, OX, OY);

  // bodem: twee akkers naast elkaar (rijp / geen — net als 'gemaaid' in graan.cjs kent), op
  // dezelfde manier als bodemKaart() in graan.cjs dat voor één stadium doet
  const kaart = D.grondKaart({
    zaad: ZAAD_VELD,
    akkers: [
      { x0: -MARGE, y0: -MARGE, x1: B_VELD + MARGE, y1: D_RIJP, langs: 'x', stadium: 'rijp' },
      { x0: -MARGE, y0: D_RIJP, x1: B_VELD + MARGE, y1: D_TOT + MARGE, langs: 'x', stadium: undefined },
    ],
  });
  const grond = D.grondTex(kaart, {});
  K.tekenDozen(Bimg, [K.doos(-MARGE, -MARGE, B_VELD + MARGE, D_TOT + MARGE, -4, 0, grond)]);

  // stoppels over het hele veld (blijven zichtbaar in de gemaaide strook; in het rijpe deel
  // verdwijnen ze zo weer onder de lange halmen die daar overheen komen)
  G.stoppelsOverAkker(Bimg, B_VELD, D_TOT, { zaad: ZAAD_VELD });

  // het zwad: een rij bundels, dicht opeen langs de grens met het rijpe deel, waar de maaier net
  // doorheen is geweest — allemaal in dezelfde richting (langs de rij) zodat ze samen als één
  // zwad lezen in plaats van losse hoopjes
  for (let i = 0; i < 8; i++) {
    const gx = 0.2 + i * 0.95 + (K.rnd(ZAAD_VELD, i, 9) - 0.5) * 0.25;
    const gy = D_RIJP + 0.35 + (K.rnd(ZAAD_VELD, i, 10) - 0.5) * 0.35;
    K.tekenModel(Bimg, zwadBundel(ZAAD_VELD * 10 + i), { gx, gy, richting: 'O' });
  }

  // het rijpe graan, alleen in het staande deel (0..D_RIJP); vóór de maaier geplaatst wordt eerst
  // het deel achter hem (verder van de camera dan zijn eigen diepte), zodat hij er straks tot zijn
  // middel in lijkt te staan — dezelfde grens/laag-truc als renderVeld() in graan.cjs gebruikt.
  const grens = FIG_GX + FIG_GY;
  G.halmenOverAkker(Bimg, B_VELD, D_RIJP, 'rijp', { zaad: ZAAD_VELD, laag: 'achter', grens });
  K.tekenModel(Bimg, Ma.maaier(fase), { gx: FIG_GX, gy: FIG_GY, richting: 'Z', z: 0 });
  G.halmenOverAkker(Bimg, B_VELD, D_RIJP, 'rijp', { zaad: ZAAD_VELD, laag: 'voor', grens });

  K.belicht(Bimg);
  K.omlijn(Bimg);
  return { plaat: K.Plaat.van(K.kwantiseer(Bimg)), OX, OY };
}

const { plaat: veldPlaat, OX, OY } = veldMetMaaier(0.3);
schrijf('veld.png', K.png(veldPlaat));

// een 600×400 uitsnede rond de maaier, op dezelfde manier als graan-proef.cjs dat voor de boer doet
{
  const voetX = OX + (FIG_GX - FIG_GY) * 32;
  const voetY = OY + (FIG_GX + FIG_GY) * 16;
  const snee = veldPlaat.uitsnede(Math.round(voetX - 300), Math.round(voetY - 320), 600, 400);
  schrijf('veld-uitsnede.png', K.png(snee));
}

// ---------------------------------------------------------------- 2) de maaislag: 12 beelden, acht
// richtingen (of vier schuine, als acht niet op tijd lukt)

const CEL = { b: 280, h: 230, anker: [140, 195] };
const ACHT = K.KANTEN.length === 8;
const RICHTINGEN = K.KANTEN; // ['Z','ZW','W','NW','N','NO','O','ZO'] — alle acht
const SCHUIN = ['ZW', 'NW', 'NO', 'ZO'];

function renderReeks(richting, n) {
  const platen = [];
  for (let i = 0; i < n; i++) {
    const fase = i / n;
    platen.push(K.losRenderen(Ma.maaier(fase), { b: CEL.b, h: CEL.h, anker: CEL.anker, richting }));
  }
  return platen;
}

const t1 = Date.now();
const perRichting = {};
for (const kant of RICHTINGEN) perRichting[kant] = renderReeks(kant, Ma.MAAIER_BEELDEN);
console.log(`  (${RICHTINGEN.length} richtingen × ${Ma.MAAIER_BEELDEN} beelden gerenderd in ${((Date.now() - t1) / 1000).toFixed(1)}s)`);

// het vel: rij per richting, kolom per beeld
{
  const vel = new K.Plaat(CEL.b * Ma.MAAIER_BEELDEN, CEL.h * RICHTINGEN.length);
  RICHTINGEN.forEach((kant, r) => {
    perRichting[kant].forEach((p, i) => vel.plak(p, i * CEL.b, r * CEL.h));
  });
  schrijf('maaier.png', K.png(vel, 1));
}

// een paar reeksen los op een rij, om de zwaai zelf te bekijken
for (const kant of ['Z', 'ZO']) {
  const rij = new K.Plaat(CEL.b * Ma.MAAIER_BEELDEN, CEL.h);
  perRichting[kant].forEach((p, i) => rij.plak(p, i * CEL.b, 0));
  schrijf(`reeks-${kant.toLowerCase()}.png`, K.png(rij, 1));
}

// bewegende PNG's van de lus, richting Z en ZO
for (const kant of ['Z', 'ZO']) {
  schrijf(`maaier-lus-${kant.toLowerCase()}.png`, apng(perRichting[kant], { fps: Ma.MAAIER_FPS, schaal: 2, herhaal: 0 }));
}

// ---------------------------------------------------------------- 3) de zeis los

{
  const p = K.losRenderen(Ma.zeis(), { b: 220, h: 220, anker: [110, 190], richting: 'ZO' });
  schrijf('zeis.png', K.png(p, 2));
}

const duur = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`klaar in ${duur}s, ${(totaalBytes / 1024).toFixed(0)} kB totaal, in ${UIT}`);
console.log(ACHT ? 'alle acht richtingen geleverd.' : `alleen de vier schuine richtingen (${SCHUIN.join(', ')}) — acht richtingen niet gelukt binnen de tijd.`);
