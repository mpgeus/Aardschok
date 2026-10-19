// Het wiel naar het doel (werklijst vraag 180; Marcel, 19 okt: "Ok geometry first"; gereedschap/ai/ai-afwerking.md,
// "Het wiel naar het doel"): de geometrie van het ChatGPT-wiel (hdproef.cjs wielDoel) als proefplaat, eerst in woorden en
// één plaat (CLAUDE.md: eerst goedkeuring, dan renderen). Zuidwest, stand 0, op de productiestandaard (4× intern, 2×):
// de render zoals hij is (box, 64 kleuren, omlijning), en met stijl D (hdstijl.cjs, opnieuw geijkt op dit wiel, met koper
// erbij), naast het doel en wiel D van nu.
//
//   node gereedschap/pixelart/doelwiel.cjs proef      de proefplaat
//   node gereedschap/pixelart/doelwiel.cjs filters    van 4× naar 2×: box, Lanczos, nearest en detailbehoudend
//   node gereedschap/pixelart/doelwiel.cjs groter     het wiel groter in beeld: sprite 2×, 3× en 4× op 1920×1080
//   node gereedschap/pixelart/doelwiel.cjs hand       stijl D met het handschrift erbij: standen, richtingen, metingen
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const H = require('./hdproef.cjs');
const HS = require('./hdstijl.cjs');
const S = require('./stijl.cjs');
const TX = require('./textuur.cjs');
const E = require('../ai/etiket.cjs');

const UIT = path.join(__dirname, 'uit', 'doelwiel');
const FIJN = 4;

// Een render met de G-buffer (zoals hdstijl.cjs render), van het wiel naar het doel.
function render(kant, s, fijn = FIJN) {
  const m = H.wielModel(H.DOELWIEL, H.STANDEN[s].hoek);
  const B = new K.Beeld(H.CEL[0] * fijn, H.CEL[1] * fijn, H.CEL[2] * fijn, H.CEL[3] * fijn);
  const t0 = process.hrtime.bigint();
  K.tekenModel(B, m, { richting: kant, rust: true, gbuffer: true, fijn });
  K.belicht(B);
  const zl = K.kleurBeeld(B);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const nagels = m.delen.map((d, i) => (TX.uvVan(d) ? -1 : i)).filter((i) => i >= 0);
  return { b: B.b, h: B.h, ramp: B.ramp, stap: B.stap, diep: B.diep, deel: B.deel, nrm: B.nrm, rust: B.rust, albedo: B.albedo, g: B.g, kleur: B.kleur, zl, ms, nagels, delen: m.delen.length };
}

// Stijl D voor dit wiel: die van de stijlproef (de tonen en de verdeling van het doel), met koper erbij (de ramp 'goud' van
// kern.cjs, met de standaardverdeling), opnieuw geijkt op zuidwest in twee standen.
// hand: het handschrift erbij (19 okt; Marcel: de maat blijft, het detail moet uit het handschrift komen): een nagel wint
// zijn pixel al in de G-buffer (detailsWinnen), elke nagel een lichte stip met een donkere pixel ernaast (nagelLicht, zoals
// op het doel; een eerste versie maakte een nagel op een lichte ondergrond donker, het doel doet dat nergens), en een naad
// tussen twee stukken van dezelfde soort (binnenlijnen.naden), zoals de stukken velg.
function stijlVoor(Rs, hand = false) {
  const ij = HS.leesIjk();
  const stijl = JSON.parse(JSON.stringify(ij.stijlen.doel));
  const ijzer = stijl.materialen.ijzer;
  // koper zonder de twee lichtste tonen van de ramp 'goud' (die maakten de kap knalgeel; het doel heeft brons)
  const goud = K.RAMP_RGB[K.RAMP.goud].slice(0, 6);
  stijl.materialen.goud = { ...ijzer, reeks: goud, verdeling: S.verdeling(goud.length), lijn: [40, 20, 8], textuur: 0.3, glans: 1.0 };
  if (hand) {
    stijl.detailsWinnen = true;
    stijl.nagelLicht = true;
    // de naden tussen de stukken velg, en een lijn om de spaken (spaak: deel 32, hdproef.cjs wielDoel)
    stijl.binnenlijnen = { ...stijl.binnenlijnen, naden: true, om: [32] };
    // de nerf dichter en donkerder (Marcel, 19 okt: "Ja die drie nog toevoegen": de nerf in de planken was te zwak)
    stijl.materialen.hout.nerf = { ...stijl.materialen.hout.nerf, afstand: 1.3, breedte: 0.5, gat: 0.35, lengte: 4, stap: -3 };
  }
  const met = (R) => ({ ...stijl, details: new Set(R.nagels) });
  const Gs = Rs.map((R) => S.gbuffer(R, FIJN / 2, met(R)));
  S.kalibreer(Gs, met(Rs[0]), ij.verdeling, HS.VARIANTEN.D.st);
  return stijl;
}
// Een beeld met een stijl: de G-buffer (met de nagels, voor detailsWinnen) en de stijl erop.
function gestileerd(R, stijl) {
  const st = { ...stijl, details: new Set(R.nagels) };
  return S.stileer(S.gbuffer(R, FIJN / 2, st), st, HS.VARIANTEN.D.st);
}

function proef() {
  fs.mkdirSync(UIT, { recursive: true });
  const Rs = [render('ZW', 0), render('ZW', 4)];
  const R = Rs[0];
  const stijl = stijlVoor(Rs);
  const G = S.gbuffer(R, FIJN / 2, stijl);
  const Dnieuw = S.stileer(G, { ...stijl, details: new Set(R.nagels) }, HS.VARIANTEN.D.st);
  const box = H.verklein(R.zl, FIJN / 2, 'filter');
  const P = H.paletVan([box], 64);
  const A = H.naarPalet(H.omlijnBeeld(H.naarPalet(box, P)), P);
  const Doud = H.lees(path.join(HS.UIT, 'D', 'ZW-0.png'));
  for (const [naam, r] of [['render', A], ['D', Dnieuw]]) H.bewaar(path.join(UIT, `ZW-0-${naam}.png`), r);
  const ij = HS.leesIjk();
  const doel = HS.doelOpMaat(ij.hoogte);
  const doelK = H.alfaSnij(doel, H.uitsnede([doel], 4));
  const doel4 = HS.doelOpMaat(ij.hoogte * 4);
  const doel4K = H.alfaSnij(doel4, H.uitsnede([doel4], 16));
  const u = H.uitsnede([Doud, A, Dnieuw], 4);
  const knip = (r) => H.alfaSnij(r, u);
  const opGrond = (r) => H.alfaSnijMetGrond(r);
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  // de render op 4× zelf, op de helft (zo is het wiel even groot als de rest)
  const ruw = A.b ? H.alfaSnij(R.zl, { x0: u.x0 * 2, y0: u.y0 * 2, b: u.b * 2, h: u.h * 2 }) : null;
  E.bewaar(path.join(UIT, 'proef.png'), [
    [E.met(opGrond(doel4K), 'doel: het ChatGPT-wiel'), E.met(groot(opGrond(knip(Doud)), 4), 'D van nu (het wiel van C)'), E.met(groot(opGrond(ruw), 2), 'het wiel naar het doel: de render op 4×'), E.met(groot(opGrond(knip(A)), 4), 'naar het doel, zoals hij is (2×)'), E.met(groot(opGrond(knip(Dnieuw)), 4), 'naar het doel, met stijl D (2×)')],
    [E.met(opGrond(doelK), 'doel'), E.met(opGrond(knip(Doud)), 'D van nu'), E.met(opGrond(knip(A)), 'naar het doel'), E.met(opGrond(knip(Dnieuw)), 'naar het doel, stijl D')],
    [E.met(groot(opGrond(doelK), 3), 'doel, maal 3'), E.met(groot(opGrond(knip(Doud)), 3), 'D van nu, maal 3'), E.met(groot(opGrond(knip(A)), 3), 'naar het doel, maal 3'), E.met(groot(opGrond(knip(Dnieuw)), 3), 'naar het doel met stijl D, maal 3')],
  ], 'Het wiel naar het doel: de proefplaat', `Zuidwest, stand 0. Rij 1 op dezelfde zichtbare grootte (de sprites van 2× maal 4), rij 2 op 1920×1080, rij 3 dat maal 3. ${R.delen} onderdelen, ${Math.round(R.ms)} ms per beeld op 4×.`);
  const o = { doel: HS.ontleedWiel(doel), Doud: HS.ontleedWiel(knip(Doud)), A: HS.ontleedWiel(knip(A)), D: HS.ontleedWiel(knip(Dnieuw)) };
  for (const [k, x] of Object.entries(o)) console.log(k.padEnd(5), 'hout', Math.round(x.aandeel.hout * 100) + '%', 'ijzer', Math.round(x.aandeel.ijzer * 100) + '%', 'lijn', Math.round(x.aandeel.lijn * 100) + '%', 'wiel', JSON.stringify(x.wiel.ellips), 'spaken', JSON.stringify(x.wiel.spaken), 'velg', x.wiel.velg.pixels);
  fs.writeFileSync(path.join(UIT, 'metingen.json'), JSON.stringify({ ms: R.ms, delen: R.delen, ontleding: o }, null, 1));
  console.log(`uit/doelwiel/proef.png (${Math.round(R.ms)} ms op 4×)`);
}

// ---------------------------------------------------------------- verkleinen: welk filter houdt het detail?

// Marcel (19 okt): "i feel like the filter destroys detail when we scale down". Het wiel naar het doel naar zuidwest, acht
// standen en een volle slag, op 4× gerenderd en op vier manieren naar 2× verkleind: box (zoals nu), Lanczos-3, nearest
// neighbour en detailbehoudend (stijl.cjs verkleinDetail); en daarna op drie manieren naar een palet: 64 kleuren gedeeld
// (zoals nu: een mediaansnede, wie veel pixels heeft krijgt de kleuren), een palet per materiaal (paletPerMateriaal: hout,
// ijzer en koper elk hun eigen kleuren, uit hun eigen pixels), of geen. Dan een omlijning. Gemeten: het detail, hoeveel
// nagelkoppen te zien zijn, en het flikkeren bij draaien.
const FILTERS = ['box', 'lanczos', 'naast', 'detail'];
const PALETTEN = ['64', 'materiaal', 'geen'];
// Een palet per materiaal: per materiaal (G.mat, de ramp van de render) n kleuren uit zijn eigen pixels in deze beelden
// (o: { [rampnaam]: n }, anders 16); de omlijning en wat geen materiaal heeft 8.
function paletPerMateriaal(beelden, Gs, o = {}) {
  const per = new Map();
  beelden.forEach((r, k) => {
    const G = Gs[k];
    for (let i = 0; i < r.b * r.h; i++) {
      if (r.rgba[i * 4 + 3] < 128) continue;
      const m = G.dek[i] ? G.mat[i] : -1;
      (per.get(m) || per.set(m, []).get(m)).push([r.rgba[i * 4], r.rgba[i * 4 + 1], r.rgba[i * 4 + 2]]);
    }
  });
  const P = new Map();
  for (const [m, kl] of per) P.set(m, TX.palet(kl, m < 0 ? 8 : o[K.RAMP_NAMEN[m]] || 16));
  return P;
}
function naarPaletPerMateriaal(r, G, P) {
  const uit = { b: r.b, h: r.h, rgba: Buffer.from(r.rgba) };
  for (let i = 0; i < r.b * r.h; i++) {
    if (r.rgba[i * 4 + 3] < 128) continue;
    // zonder eigen palet (een omlijning voordat de rand een palet had, of een pixel die bij Lanczos net anders dekt):
    // alle kleuren samen
    const p = P.get(G.dek[i] ? G.mat[i] : -1) || P.get(-1) || [...P.values()].flat();
    let beste = p[0], bd = Infinity;
    for (const q of p) {
      const d = (q[0] - r.rgba[i * 4]) ** 2 + (q[1] - r.rgba[i * 4 + 1]) ** 2 + (q[2] - r.rgba[i * 4 + 2]) ** 2;
      if (d < bd) [bd, beste] = [d, q];
    }
    uit.rgba.set(beste, i * 4);
  }
  return uit;
}
function filters() {
  const AF = require('../ai/afwerking.cjs');
  const RES = require('./hdresolutie.cjs');
  fs.mkdirSync(UIT, { recursive: true });
  const ij = HS.leesIjk();
  const Rs = H.STANDEN.map((_, s) => render('ZW', s));
  const Gs = Rs.map((R) => S.gbuffer(R, FIJN / 2));
  const verklein = (R, f) => {
    if (f === 'detail') return S.verkleinDetail(R, FIJN / 2, { details: new Set(R.nagels) });
    if (f === 'box') return H.verklein(R.zl, FIJN / 2, 'filter');
    if (f === 'naast') return H.verklein(R.zl, FIJN / 2, 'naast');
    return RES.lanczos(R.zl, FIJN / 2);
  };
  const PER = { hout: 20, ijzer: 16, goud: 10 };
  const beelden = {};
  for (const f of FILTERS) {
    const ruw = Rs.map((R) => verklein(R, f));
    for (const p of PALETTEN) {
      const k = `${f}|${p}`;
      if (p === 'geen') beelden[k] = ruw.map((r) => H.omlijnBeeld(r));
      else if (p === '64') {
        const P = H.paletVan(ruw.slice(0, 8), 64);
        beelden[k] = ruw.map((r) => H.naarPalet(H.omlijnBeeld(H.naarPalet(r, P)), P));
      } else {
        const P = paletPerMateriaal(ruw.slice(0, 8), Gs.slice(0, 8), PER);
        // de omlijning na het palet, en dan de omlijning naar het palet van de rand
        beelden[k] = ruw.map((r, s) => naarPaletPerMateriaal(H.omlijnBeeld(naarPaletPerMateriaal(r, Gs[s], P)), Gs[s], P));
      }
      beelden[k].forEach((r, s) => H.bewaar(path.join(UIT, 'filters', `${f}-${p}-ZW-${s}.png`), r));
    }
  }
  const sleutels = Object.keys(beelden);
  const lijst = Rs.map((R, s) => ({ G: Gs[s], beelden: Object.fromEntries(sleutels.map((k) => [k, beelden[k][s]])), nagels4: HS.nagelKoppen4(R), nagels: new Set(R.nagels) }));
  const uit = {};
  for (const k of sleutels) {
    const m = HS.meet(lijst, k, ij, 'ZW');
    const sm = AF.spriteMaten(beelden[k][0], Gs[0], lijst[0].nagels);
    const kleuren = new Set();
    for (const r of beelden[k].slice(0, 8)) for (let i = 0; i < r.b * r.h; i++) if (r.rgba[i * 4 + 3] >= 128) kleuren.add((r.rgba[i * 4] << 16) | (r.rgba[i * 4 + 1] << 8) | r.rgba[i * 4 + 2]);
    uit[k] = { detail: sm.detail, nagels: sm.nagels, flikkeren: m.flikkeren.deel, glimlichtWissel: m.glimlichtWissel, lijnWissel: m.lijnWissel, volleSlag: m.volleSlag, kleuren: kleuren.size };
    console.log(k.padEnd(18), `detail ${sm.detail}, nagels ${sm.nagels.zichtbaar}/${sm.nagels.koppen}, flikkeren ${m.flikkeren.deel}, lijn ${m.lijnWissel}, kleuren ${kleuren.size}`);
  }
  fs.writeFileSync(path.join(UIT, 'filters.json'), JSON.stringify(uit, null, 1));
  // de plaat: de naaf maal 8 en het wiel maal 4, voor elk filter en palet; erboven de render op 4×
  const u = H.uitsnede([beelden['box|64'][0]], 4);
  const opGrond = (r) => H.alfaSnijMetGrond(r);
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const naaf = { x0: u.x0 + Math.round(u.b * 0.3), y0: u.y0 + Math.round(u.h * 0.33), b: Math.round(u.b * 0.36), h: Math.round(u.h * 0.32) };
  const ruwNaaf = H.alfaSnij(Rs[0].zl, { x0: naaf.x0 * 2, y0: naaf.y0 * 2, b: naaf.b * 2, h: naaf.h * 2 });
  const NAAM = { box: 'box', lanczos: 'Lanczos-3', naast: 'nearest', detail: 'detailbehoudend' };
  const PNAAM = { 64: '64 kleuren gedeeld (nu)', materiaal: 'palet per materiaal', geen: 'geen palet' };
  const rijen = [[E.met(groot(opGrond(ruwNaaf), 4), 'de naaf op 4× (wat er is)'), E.met(groot(opGrond(H.alfaSnij(Rs[0].zl, { x0: u.x0 * 2, y0: u.y0 * 2, b: u.b * 2, h: u.h * 2 })), 2), 'het wiel op 4×')]];
  for (const p of PALETTEN) rijen.push(FILTERS.map((f) => {
    const k = `${f}|${p}`;
    return E.met(groot(opGrond(H.alfaSnij(beelden[k][0], naaf)), 8), `${NAAM[f]} · ${PNAAM[p]} · nagels ${uit[k].nagels.zichtbaar} · flikkeren ${String(uit[k].flikkeren).replace('.', ',')}`);
  }));
  rijen.push(['box|64', 'detail|materiaal', 'naast|materiaal'].map((k) => E.met(groot(opGrond(H.alfaSnij(beelden[k][0], u)), 4), `${NAAM[k.split('|')[0]]} · ${PNAAM[k.split('|')[1]]}`)));
  E.bewaar(path.join(UIT, 'filters.png'), rijen, 'Van 4× naar 2×: wat houdt het detail, het filter of het palet?', 'Het wiel naar het doel, zuidwest, stand 0. Rij 1: de render op 4×. Rij 2 tot 4: de naaf op 2× maal 8, per filter, met 64 kleuren gedeeld (zoals nu), een palet per materiaal, en zonder palet. Rij 5: het hele wiel maal 4. Nagels: koppen die te zien zijn (van 63); flikkeren: over acht standen.');
  console.log('uit/doelwiel/filters.png');
}

// ---------------------------------------------------------------- het handschrift

// Het wiel naar het doel met stijl D, zonder en met het handschrift erbij (stijlVoor hand), naar zuidwest in acht standen en
// een volle slag, en in acht richtingen; gemeten tegen het doel (de lijnen, de losse pixels, het contrast, de nagels) en
// in beweging (het flikkeren).
function hand() {
  const AF = require('../ai/afwerking.cjs');
  fs.mkdirSync(path.join(UIT, 'hand'), { recursive: true });
  const ij = HS.leesIjk();
  const ijkR = [render('ZW', 0), render('ZW', 4)];
  const stijlen = { D: stijlVoor(ijkR, false), H: stijlVoor(ijkR, true) };
  const lijst = [];
  for (let s = 0; s < H.STANDEN.length; s++) {
    const R = s === 0 ? ijkR[0] : s === 4 ? ijkR[1] : render('ZW', s);
    const beelden = { D: gestileerd(R, stijlen.D), H: gestileerd(R, stijlen.H) };
    for (const [k, r] of Object.entries(beelden)) H.bewaar(path.join(UIT, 'hand', `${k}-ZW-${s}.png`), r);
    // de metingen op een G-buffer waarin de nagels hun pixel winnen (anders telt een nagel die het handschrift tekent niet)
    lijst.push({ G: S.gbuffer(R, FIJN / 2, { detailsWinnen: true, details: new Set(R.nagels) }), beelden, nagels4: HS.nagelKoppen4(R), nagels: new Set(R.nagels) });
  }
  const richtingen = K.KANTEN.map((kant) => {
    const r = kant === 'ZW' ? lijst[0].beelden.H : gestileerd(render(kant, 0), stijlen.H);
    H.bewaar(path.join(UIT, 'hand', `H-${kant}-0.png`), r);
    return r;
  });
  const doel = HS.doelOpMaat(ij.hoogte);
  const doelK = H.alfaSnij(doel, H.uitsnede([doel], 3));
  const doel4 = HS.doelOpMaat(ij.hoogte * 4);
  const doel4K = H.alfaSnij(doel4, H.uitsnede([doel4], 12));
  const u = H.uitsnede([lijst[0].beelden.D, lijst[0].beelden.H], 3);
  const knip = (r) => H.alfaSnij(r, u);
  const opGrond = (r) => H.alfaSnijMetGrond(r);
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const kwart = (r) => H.snij(r, { x0: 0, y0: 0, b: Math.ceil(r.b * 0.6), h: Math.ceil(r.h * 0.6) }, 6);
  const ont = { doel: HS.ontleedWiel(doel) };
  const uit = {};
  for (const k of ['D', 'H']) {
    const r = lijst[0].beelden[k];
    ont[k] = HS.ontleedWiel(knip(r));
    const m = HS.meet(lijst, k, ij, 'ZW');
    const sm = AF.spriteMaten(r, lijst[0].G, lijst[0].nagels);
    uit[k] = { lijn: Math.round(ont[k].aandeel.lijn * 100), losse: ont[k].clusters.pixelsIn['1'], contrast: ont[k].stijl.contrast, binnenlijnen: ont[k].randen.lijnenBinnenin, nagels: sm.nagels, detail: sm.detail, flikkeren: m.flikkeren.deel, lijnWissel: m.lijnWissel, volleSlag: m.volleSlag, kleur: Object.fromEntries(['hout', 'ijzer'].map((mm) => [mm, AF.deltaE(ont[k].materiaal[mm].gem, ont.doel.materiaal[mm].gem)])) };
  }
  uit.doel = { lijn: Math.round(ont.doel.aandeel.lijn * 100), losse: ont.doel.clusters.pixelsIn['1'], contrast: ont.doel.stijl.contrast, binnenlijnen: ont.doel.randen.lijnenBinnenin };
  for (const [k, x] of Object.entries(uit)) console.log(k.padEnd(5), JSON.stringify(x));
  fs.writeFileSync(path.join(UIT, 'hand.json'), JSON.stringify(uit, null, 1));
  const NAAM = { D: 'stijl D (zoals de proefplaat)', H: 'stijl D met het handschrift' };
  E.bewaar(path.join(UIT, 'hand.png'), [
    [E.met(opGrond(doel4K), 'doel: het ChatGPT-wiel'), ...['D', 'H'].map((k) => E.met(groot(opGrond(knip(lijst[0].beelden[k])), 4), `${NAAM[k]} · lijnen ${uit[k].lijn}% · nagels ${uit[k].nagels.zichtbaar}/${uit[k].nagels.koppen}`))],
    [E.met(kwart(doelK), 'doel, linksboven maal 6'), ...['D', 'H'].map((k) => E.met(kwart(knip(lijst[0].beelden[k])), `${NAAM[k]}, linksboven maal 6`))],
    [E.met(opGrond(doelK), 'doel'), ...['D', 'H'].map((k) => E.met(opGrond(knip(lijst[0].beelden[k])), k)), E.met(groot(opGrond(doelK), 3), 'doel maal 3'), E.met(groot(opGrond(knip(lijst[0].beelden.H)), 3), 'handschrift maal 3')],
  ], 'Het handschrift op het wiel naar het doel', `Zuidwest, stand 0. Het handschrift: een nagel wint zijn pixel, steekt af tegen zijn ondergrond, en een naad tussen de stukken velg. Doel: lijnen ${uit.doel.lijn}%, losse pixels ${Math.round(uit.doel.losse * 100)}%; D: ${uit.D.lijn}% en ${Math.round(uit.D.losse * 100)}%; handschrift: ${uit.H.lijn}% en ${Math.round(uit.H.losse * 100)}%. Flikkeren over acht standen: D ${uit.D.flikkeren}, handschrift ${uit.H.flikkeren}.`);
  E.bewaar(path.join(UIT, 'hand-richtingen.png'), [K.KANTEN.map((kant, i) => E.met(groot(opGrond(H.alfaSnij(richtingen[i], H.uitsnede([richtingen[i]], 3))), 2), kant))], 'Het handschrift in acht richtingen', 'Stand 0, maal 2.');
  const frames = lijst.slice(0, 8).map((x) => H.naastElkaar([groot(opGrond(knip(x.beelden.D)), 3), groot(opGrond(knip(x.beelden.H)), 3)], 2));
  const { apng } = require('./apng.cjs');
  fs.writeFileSync(path.join(UIT, 'hand-draaien.png'), apng(frames.map((r) => ({ b: r.b, h: r.h, rgba: () => r.rgba })), { fps: 6 }));
  console.log('uit/doelwiel/hand.png, hand-richtingen.png, hand-draaien.png');
}

// ---------------------------------------------------------------- groter in beeld

// Marcel (19 okt): "Wat als wij onze ingame resolutie voor sprites verhogen?" Op 1920×1080 tekent het spel een sprite van 2×
// één op één; meer pixels laat het scherm alleen zien als alles groter in beeld komt. Het wiel naar het doel op drie
// maten, elk één op één zoals het scherm hem toont: zoals nu (sprite 2×, uit 4×), anderhalf keer zo groot (3×, uit 6×) en
// twee keer zo groot (4×, uit 8×), steeds detailbehoudend verkleind met een palet per materiaal; naast het ChatGPT-wiel op
// dezelfde maat. En op een schermafdruk van het spel (1920×1080) wat er bij die maten nog in beeld past.
const SCHERM = path.join(__dirname, '..', 'schermen', 'uit', 'tekenmeting-tegen-nieuw-0-35-dag.png');
function groter() {
  const AF = require('../ai/afwerking.cjs');
  fs.mkdirSync(UIT, { recursive: true });
  const ij = HS.leesIjk();
  const maten = [2, 3, 4];
  const uit = [];
  for (const n of maten) {
    const R = render('ZW', 0, 2 * n);
    const G = S.gbuffer(R, 2);
    const P = paletPerMateriaal([S.verkleinDetail(R, 2, { details: new Set(R.nagels) })], [G], PER);
    const sprite = spriteVan(R, G, P);
    const sm = AF.spriteMaten(sprite, G, new Set(R.nagels));
    const u = H.uitsnede([sprite], 3);
    const doel = HS.doelOpMaat(ij.hoogte * (n / 2));
    // een figuur van 320 beelden (acht richtingen, veertig standen) op deze maat, als RGBA
    const figuurMB = +((320 * u.b * u.h * 4) / 1e6).toFixed(1);
    uit.push({ n, R, sprite, u, doel, sm, ms: Math.round(R.ms), maat: `${u.b - 6}×${u.h - 6}`, figuurMB });
    H.bewaar(path.join(UIT, `groter-${n}x.png`), sprite);
    console.log(`sprite ${n}× (uit ${2 * n}×): wiel ${u.b - 6}×${u.h - 6} px, ${Math.round(R.ms)} ms, nagels ${sm.nagels.zichtbaar}/${sm.nagels.koppen}, detail ${sm.detail}, een figuur van 320 beelden ${figuurMB} MB`);
  }
  const opGrond = (r) => H.alfaSnijMetGrond(r);
  const groot = (r, k) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, k);
  const NAAM = { 2: 'zoals nu', 3: 'anderhalf keer zo groot', 4: 'twee keer zo groot' };
  // rij 1: één op één; rij 2: de naaf, zo vergroot dat ze even groot zijn (maal 12 / n)
  const rij1 = [];
  const rij2 = [];
  for (const x of uit) {
    const dk = H.alfaSnij(x.doel, H.uitsnede([x.doel], 3));
    rij1.push(E.met(opGrond(dk), `doel, ${NAAM[x.n]}`), E.met(opGrond(H.alfaSnij(x.sprite, x.u)), `wiel ${x.n}× · ${x.maat} · ${x.sm.nagels.zichtbaar}/${x.sm.nagels.koppen} nagels`));
    const naaf = { x0: x.u.x0 + Math.round(x.u.b * 0.3), y0: x.u.y0 + Math.round(x.u.h * 0.33), b: Math.round(x.u.b * 0.36), h: Math.round(x.u.h * 0.32) };
    rij2.push(E.met(groot(opGrond(H.alfaSnij(x.sprite, naaf)), 12 / x.n), `de naaf, ${NAAM[x.n]} (maal ${12 / x.n})`));
  }
  // rij 3: de schermafdruk met wat er in beeld blijft (gecentreerd op het dorp), op de helft
  const rijen = [rij1, rij2];
  if (fs.existsSync(SCHERM)) {
    const A = require('../ai/beeld-ai.cjs');
    const sc = A.leesPng(fs.readFileSync(SCHERM));
    const rgba = Buffer.alloc(sc.b * sc.h * 4);
    for (let i = 0; i < sc.b * sc.h; i++) rgba.set([sc.rgba[i * 4], sc.rgba[i * 4 + 1], sc.rgba[i * 4 + 2], 255], i * 4);
    const scherm = { b: sc.b, h: sc.h, rgba };
    const cx = 1500, cy = 760; // het dorp
    const kader = (f, kleur) => {
      const b = Math.round(sc.b / f), h = Math.round(sc.h / f);
      const x0 = Math.max(0, Math.min(sc.b - b, Math.round(cx - b / 2))), y0 = Math.max(0, Math.min(sc.h - h, Math.round(cy - h / 2)));
      for (let t = 0; t < 4; t++) for (let x = x0; x < x0 + b; x++) for (const y of [y0 + t, y0 + h - 1 - t]) scherm.rgba.set([...kleur, 255], (y * sc.b + x) * 4);
      for (let t = 0; t < 4; t++) for (let y = y0; y < y0 + h; y++) for (const x of [x0 + t, x0 + b - 1 - t]) scherm.rgba.set([...kleur, 255], (y * sc.b + x) * 4);
    };
    kader(1.5, [250, 200, 60]);
    kader(2, [230, 70, 60]);
    rijen.push([E.met(A.verklein(scherm, sc.b / 2, sc.h / 2), 'het spel op 1920×1080 (op de helft): heel = zoals nu; geel = anderhalf keer zo groot; rood = twee keer zo groot')]);
  }
  E.bewaar(path.join(UIT, 'groter.png'), rijen, 'Groter in beeld: het wiel op 1920×1080, zoals nu, anderhalf en twee keer zo groot',
    `Rij 1 één op één, zoals het scherm het toont (de sprite van ${uit.map((x) => `${x.n}× uit ${2 * x.n}×`).join(', ')}; detailbehoudend verkleind, een palet per materiaal), naast het ChatGPT-wiel op dezelfde maat. Rij 2: de naaf, even groot gemaakt. Rij 3: wat er van de wereld in beeld blijft. Rendertijd per beeld: ${uit.map((x) => `${x.n}×: ${(x.ms / 1000).toFixed(1)} s`).join(', ')}; een figuur van 320 beelden: ${uit.map((x) => `${x.figuurMB} MB`).join(', ')}.`);
  fs.writeFileSync(path.join(UIT, 'groter.json'), JSON.stringify(uit.map((x) => ({ sprite: `${x.n}×`, intern: `${2 * x.n}×`, wiel: x.maat, ms: x.ms, nagels: x.sm.nagels, detail: x.sm.detail, figuurMB: x.figuurMB })), null, 1));
  console.log('uit/doelwiel/groter.png');
}

// ---------------------------------------------------------------- de sprite van het wiel naar het doel

// Uit de proef hierboven (19 okt): verkleinen met behoud van detail, en een palet per materiaal (vast per ding: uit de acht
// richtingen in stand 0, bewaard in `pad`), dan een omlijning. Zo blijft het koper koper en de nagel een nagel.
const PER = { hout: 20, ijzer: 16, goud: 10 };
function paletVast(pad, renderVan, kanten = K.KANTEN) {
  if (fs.existsSync(pad)) return new Map(JSON.parse(fs.readFileSync(pad)));
  // uit alle acht richtingen in stand 0: uit twee alleen viel een richting met meer zon buiten het palet (19 okt)
  const Rs = kanten.map((k) => renderVan(k, 0));
  const P = paletPerMateriaal(Rs.map((R) => S.verkleinDetail(R, FIJN / 2, { details: new Set(R.nagels) })), Rs.map((R) => S.gbuffer(R, FIJN / 2)), PER);
  fs.mkdirSync(path.dirname(pad), { recursive: true });
  fs.writeFileSync(pad, JSON.stringify([...P]));
  return P;
}
function spriteVan(R, G, P) {
  const r = S.verkleinDetail(R, FIJN / 2, { details: new Set(R.nagels) });
  return naarPaletPerMateriaal(H.omlijnBeeld(naarPaletPerMateriaal(r, G, P)), G, P);
}
// De bron voor afwerking.cjs (SDXL op dit wiel): de sprite zoals hierboven; de uitsnede uit stand 0, met wat ruimte.
const uitsneden = {};
const BRON = {
  naam: 'het wiel naar het doel (hdproef.cjs wielDoel), de render op 4×, detailbehoudend verkleind met een palet per materiaal',
  render: (kant, s) => render(kant, s),
  sprite: (R) => {
    const G = S.gbuffer(R, FIJN / 2);
    return { G, D: spriteVan(R, G, paletVast(path.join(UIT, 'palet-materiaal.json'), render)) };
  },
  uitsnede: (kant) => {
    if (!uitsneden[kant]) {
      const R = render(kant, 0);
      uitsneden[kant] = H.uitsnede([BRON.sprite(R).D], 6);
    }
    return uitsneden[kant];
  },
};

const [wat] = require.main === module ? process.argv.slice(2) : ['geladen'];
if (wat === 'proef') proef();
else if (wat === 'filters') filters();
else if (wat === 'groter') groter();
else if (wat === 'hand') hand();
else if (wat !== 'geladen') console.log('node gereedschap/pixelart/doelwiel.cjs proef | filters');

module.exports = { render, stijlVoor, paletPerMateriaal, naarPaletPerMateriaal, paletVast, spriteVan, BRON, UIT };
