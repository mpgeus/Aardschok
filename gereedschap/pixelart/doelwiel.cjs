// Het wiel naar het doel (werklijst vraag 180; Marcel, 19 okt: "Ok geometry first"; gereedschap/ai/ai-afwerking.md,
// "Het wiel naar het doel"): de geometrie van het ChatGPT-wiel (hdproef.cjs wielDoel) als proefplaat, eerst in woorden en
// één plaat (CLAUDE.md: eerst goedkeuring, dan renderen). Zuidwest, stand 0, op de productiestandaard (4× intern, 2×):
// de render zoals hij is (box, 64 kleuren, omlijning), en met stijl D (hdstijl.cjs, opnieuw geijkt op dit wiel, met koper
// erbij), naast het doel en wiel D van nu.
//
//   node gereedschap/pixelart/doelwiel.cjs proef
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
function render(kant, s) {
  const m = H.wielModel(H.DOELWIEL, H.STANDEN[s].hoek);
  const B = new K.Beeld(H.CEL[0] * FIJN, H.CEL[1] * FIJN, H.CEL[2] * FIJN, H.CEL[3] * FIJN);
  const t0 = process.hrtime.bigint();
  K.tekenModel(B, m, { richting: kant, rust: true, gbuffer: true, fijn: FIJN });
  K.belicht(B);
  const zl = K.kleurBeeld(B);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const nagels = m.delen.map((d, i) => (TX.uvVan(d) ? -1 : i)).filter((i) => i >= 0);
  return { b: B.b, h: B.h, ramp: B.ramp, stap: B.stap, diep: B.diep, deel: B.deel, nrm: B.nrm, rust: B.rust, albedo: B.albedo, g: B.g, kleur: B.kleur, zl, ms, nagels, delen: m.delen.length };
}

// Stijl D voor dit wiel: die van de stijlproef (de tonen en de verdeling van het doel), met koper erbij (de ramp 'goud' van
// kern.cjs, met de standaardverdeling), opnieuw geijkt op zuidwest in twee standen.
function stijlVoor(Rs) {
  const ij = HS.leesIjk();
  const stijl = JSON.parse(JSON.stringify(ij.stijlen.doel));
  const ijzer = stijl.materialen.ijzer;
  const goud = K.RAMP_RGB[K.RAMP.goud].slice(1);
  stijl.materialen.goud = { ...ijzer, reeks: goud, verdeling: S.verdeling(goud.length), lijn: [40, 20, 8], textuur: 0.3, glans: 1.0 };
  const Gs = Rs.map((R) => S.gbuffer(R, FIJN / 2, stijl));
  S.kalibreer(Gs, { ...stijl, details: new Set(Rs[0].nagels) }, ij.verdeling, HS.VARIANTEN.D.st);
  return stijl;
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

const [wat] = require.main === module ? process.argv.slice(2) : ['geladen'];
if (wat === 'proef') proef();
else if (wat !== 'geladen') console.log('node gereedschap/pixelart/doelwiel.cjs proef');

module.exports = { render, stijlVoor };
