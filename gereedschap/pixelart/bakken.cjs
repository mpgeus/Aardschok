// Bakken: een beschildering (een AI-beeld van een ding, gemaakt op onze render) op het oppervlak van het ding zetten, zodat
// ze eraan vastzit (werklijst vraag 180; Marcels keus na de zevende opdracht, "Ai on surface"; gereedschap/ai/ai-afwerking.md,
// "AI op het oppervlak"). Een AI die elk beeld los beschildert, flikkert bij draaien (de nagel staat in de volgende stand
// ergens anders); een beschildering die één keer op het oppervlak gebakken is, draait mee.
//
// De weg:
//   1. render het ding in de stand van het AI-beeld op de maat van het doek (kern.cjs met o.rust en o.gbuffer): per
//      doekpixel het onderdeel, de plek in de afwikkeling (u, v) en ons licht;
//   2. haal ons licht eruit (de kleur van de AI gedeeld door ons licht): wat overblijft is de kleur van het oppervlak, het
//      albedo, met wat de AI erop schilderde (nerf, naden, nagels, lijnen);
//   3. bewaar die per groep (onderdelen die elkaars gedraaide kopie zijn, zoals acht spaken of vier stukken velg, delen één
//      beschildering) op (u, v), voor een rond onderdeel gevouwen op zijn symmetrie (de band om de 90°): zo is ook bedekt
//      wat in het AI-beeld net niet te zien was;
//   4. een materiaal (`bakMateriaal`) leest die kleur op elk punt terug; onze renderer belicht hem in elke stand en richting
//      opnieuw.
//
// Per doekpixel wint niet het gemiddelde (vier verschillend beschilderde stukken velg gemiddeld is een vlek) maar de beste
// kopie: de kopie van de groep die het meest te zien was, waar ze het punt zag, en anders de volgende.
//
//   nummer(model)                       elk onderdeel zijn nummer (naast het onderdeel, in een WeakMap: nooit een nieuwe
//                                       eigenschap op een onderdeel, zie code.md bij kern.cjs)
//   groepen(model, o)                   per onderdeel { groep, vouw }: kopieën in één groep, vouw = de symmetrie rondom
//   bak(B, beeld, model, groepVan, o)   → de bak (de kleur per groep en texel) uit een render op doekmaat en het AI-beeld
//   voegSamen(bakken)                   meer bakken (meer kanten) tot één: de eerste wint
//   bakMateriaal(mat, bak, groepVan)    een materiaal met een textuur (textuur.cjs) dat de bak leest, en anders zichzelf
'use strict';
const K = require('./kern.cjs');
const TX = require('./textuur.cjs');

const NR = new WeakMap();
function nummer(model) {
  model.delen.forEach((d, i) => NR.set(d, i));
  return model;
}
const nummerVan = (deel) => NR.get(deel);

// De groepen: onderdelen met dezelfde soort (deel.deel), even groot (de grensbol) en even ver van de as zijn gedraaide
// kopieën van elkaar. o.as, o.midden: de as van het ding; o.vouw(deel, aantal): hoe vaak een rond onderdeel rondom
// herhaalt (standaard het aantal kopieën, of o.vouwAlleen voor een onderdeel zonder kopieën).
function groepen(model, o) {
  const as = o.as;
  const c = o.midden;
  const sleutelVan = (d) => {
    const g = d.g || [0, 0, 0, 0];
    const p = [g[0] - c[0], g[1] - c[1], g[2] - c[2]];
    const langs = p[0] * as[0] + p[1] * as[1] + p[2] * as[2];
    const dwars = Math.hypot(p[0] - langs * as[0], p[1] - langs * as[1], p[2] - langs * as[2]);
    return `${d.deel ?? '-'}|${g[3].toFixed(2)}|${langs.toFixed(2)}|${dwars.toFixed(1)}`;
  };
  const tel = new Map();
  for (const d of model.delen) if (TX.uvVan(d)) tel.set(sleutelVan(d), (tel.get(sleutelVan(d)) || 0) + 1);
  const uit = new Map();
  for (const d of model.delen) {
    if (!TX.uvVan(d)) continue;
    const s = sleutelVan(d);
    const n = tel.get(s);
    uit.set(nummerVan(d), { groep: s, vouw: n > 1 ? n : (o.vouwAlleen ? o.vouwAlleen(d) : 1), kopieen: n });
  }
  return uit;
}

// Een texel: de groep en (u, v) op `dicht` texels per eenheid, met u gevouwen. omtrekU (van textuur.cjs rond): u is een
// hoek maal de omtrek, dan vouwen.
function texel(gv, uv, dicht) {
  let u = uv[0];
  if (uv[2] && gv.vouw > 1) {
    const p = uv[2] / gv.vouw;
    u = ((u % p) + p) % p;
  }
  return `${gv.groep}|${Math.floor(u * dicht)}|${Math.floor(uv[1] * dicht)}`;
}

// De bak. B: een render met o.rust en o.gbuffer op precies de maat en plek van het AI-beeld (een pixel van B is een pixel
// van `beeld`, verschoven met o.dx, o.dy); model: het model van die render (genummerd); groepVan: uit `groepen`. o.ijk: de
// helderheid per materiaal op die van ons materiaal (zie onder). o.dicht:
// texels per eenheid (8); o.minLicht: niet door minder dan dit delen (anders wordt een schaduw een witte vlek); o.lichtMacht;
// o.binnen(X, Y): telt deze pixel van het beeld mee (ons silhouet).
function bak(B, beeld, model, groepVan, o = {}) {
  const dicht = o.dicht || 8;
  const minLicht = o.minLicht ?? 0.3;
  const gk = o.glansKleur || [255, 240, 214];
  // eerst per kopie wat ze zag (hoeveel pixels), om de kopieën te rangschikken
  const zicht = new Map();
  for (let i = 0; i < B.b * B.h; i++) {
    if (B.ramp[i] < 0 || !B.rust || Number.isNaN(B.rust[i * 4])) continue;
    const st = B.rust[i * 4 + 3];
    zicht.set(st, (zicht.get(st) || 0) + 1);
  }
  const rang = (st) => zicht.get(st) || 0;
  const kaart = new Map(); // texel → { k: [r, g, b], st, kijk }
  for (let y = 0; y < B.h; y++) for (let x = 0; x < B.b; x++) {
    const i = y * B.b + x;
    if (B.ramp[i] < 0 || !B.g) continue;
    const X = x + (o.dx || 0), Y = y + (o.dy || 0);
    if (X < 0 || Y < 0 || X >= beeld.b || Y >= beeld.h) continue;
    if (o.binnen && !o.binnen(X, Y)) continue;
    const st = B.rust[i * 4 + 3];
    const gv = groepVan.get(st);
    const u = B.g[i * K.GB + K.G.u];
    if (!gv || Number.isNaN(u)) continue;
    const sleutel = texel(gv, [u, B.g[i * K.GB + K.G.v], groepVanOmtrek(model, st)], dicht);
    // hoe recht het vlak naar ons kijkt (de normaal naar de camera): schuin gezien is een pixel van de AI uitgerekt
    const f = K.klem(1 + (B.stap[i] - B.kleur[i * 4 + 3]) * 0.22, 0.45, 1.8);
    // o.lichtMacht: hoeveel van ons licht eruit gaat (1: alles; minder als de AI een vlak in de schaduw al donkerder
    // schilderde dan het is, anders wordt het in de zon te licht)
    const licht = Math.max(minLicht, B.g[i * K.GB + K.G.licht] * f) ** (o.lichtMacht ?? 1);
    const glans = B.g[i * K.GB + K.G.glans] * f;
    const a = (Y * beeld.b + X) * 4;
    const k = [0, 1, 2].map((c) => K.klem((beeld.rgba[a + c] - glans * gk[c]) / licht, 0, 255));
    const oud = kaart.get(sleutel);
    if (oud && oud.st !== st && rang(oud.st) >= rang(st)) continue; // een betere kopie had dit al
    if (oud && oud.st === st) {
      // dezelfde kopie, meer pixels op één texel: middelen
      for (let c = 0; c < 3; c++) oud.som[c] += k[c];
      oud.n++;
      continue;
    }
    kaart.set(sleutel, { som: k, n: 1, st });
  }
  const uit = new Map();
  for (const [s, t] of kaart) uit.set(s, t.som.map((v) => v / t.n));
  // o.ijk: per materiaal de helderheid op die van ons eigen materiaal zetten (de mediaan van het albedo in deze render):
  // het patroon van de AI blijft (de nerf, de naden, de nagels), het licht komt helemaal van onze renderer. Zonder ijking
  // wordt een vlak dat in het AI-beeld in de schaduw lag, in de zon te licht (19 okt: de velg van het wiel naar het doel
  // werd geel).
  if (o.ijk && B.albedo) {
    const lum = (k) => 0.299 * k[0] + 0.587 * k[1] + 0.114 * k[2];
    const eigen = new Map();
    for (let i = 0; i < B.b * B.h; i++) {
      if (B.ramp[i] < 0 || Number.isNaN(B.albedo[i * 3])) continue;
      const m = model.delen[B.rust[i * 4 + 3]].m;
      (eigen.get(m) || eigen.set(m, []).get(m)).push(lum([B.albedo[i * 3], B.albedo[i * 3 + 1], B.albedo[i * 3 + 2]]));
    }
    const ai = new Map();
    for (const [s, t] of kaart) {
      const m = model.delen[t.st].m;
      (ai.get(m) || ai.set(m, []).get(m)).push(lum(uit.get(s)));
    }
    const med = (a) => a.sort((p, q) => p - q)[a.length >> 1];
    const factor = new Map();
    for (const [m, a] of ai) if (eigen.has(m)) factor.set(m, med(eigen.get(m)) / Math.max(1, med(a)));
    for (const [s, t] of kaart) {
      const f = factor.get(model.delen[t.st].m) ?? 1;
      uit.set(s, uit.get(s).map((v) => K.klem(v * f, 0, 255)));
    }
    return { dicht, kaart: uit, factor: Object.fromEntries(factor) };
  }
  return { dicht, kaart: uit };
}
// De omtrek langs u van een onderdeel (rond in textuur.cjs: de derde waarde), voor het vouwen. Eén keer per onderdeel
// uitgerekend op zijn eigen afwikkeling.
const OMTREK = new WeakMap();
function groepVanOmtrek(model, st) {
  const d = model.delen[st];
  if (OMTREK.has(d)) return OMTREK.get(d);
  const uv = TX.uvVan(d);
  const g = d.g || [0, 0, 0];
  const r = uv ? uv(g[0] + 0.01, g[1] + 0.01, g[2] + 0.01, 0, 0, 1) : null;
  const om = r ? r[2] : undefined;
  OMTREK.set(d, om);
  return om;
}
function voegSamen(bakken) {
  const kaart = new Map();
  for (const b of bakken) for (const [s, k] of b.kaart) if (!kaart.has(s)) kaart.set(s, k);
  return { dicht: bakken[0].dicht, kaart };
}

// Een materiaal dat de bak leest: mat is een materiaal met een textuur (textuur.cjs textuurMateriaal). De textuur wordt de
// gebakken kleur (een texel, anders een buur binnen één texel), en waar niets gebakken is de textuur van mat zelf. Wat
// kern.cjs afwerken met de kleur doet (reliëf uit de oude textuur, warm en koel, slijtage op de randen), gaat uit: de
// beschildering heeft dat al; het licht, de holtes, de randen in het licht en de glans blijven. Dat moet ook zo voor de render
// waaruit gebakken wordt (`gebakkenAfwerking`), anders klopt het licht dat eruit gehaald wordt niet.
function gebakkenAfwerking(mat) {
  const a = { ...(mat.afwerking || {}) };
  delete a.reliëf;
  delete a.warm;
  delete a.koel;
  if (a.randen) a.randen = { ...a.randen, slijt: undefined };
  const uit = { ...mat, afwerking: a };
  delete uit.hoogte;
  return uit;
}
function bakMateriaal(mat, bk, groepVan, model) {
  const basis = gebakkenAfwerking(mat);
  if (!bk) return basis;
  const eigen = mat.textuur;
  const buren = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
  return {
    ...basis,
    textuur: (x, y, z, nx, ny, nz, deel, kijk, fijn) => {
      const st = nummerVan(deel);
      const gv = st === undefined ? null : groepVan.get(st);
      const uv = gv ? TX.uvVan(deel)(x, y, z, nx, ny, nz) : null;
      if (uv) {
        let u = uv[0];
        if (uv[2] && gv.vouw > 1) {
          const p = uv[2] / gv.vouw;
          u = ((u % p) + p) % p;
        }
        const iu = Math.floor(u * bk.dicht);
        const iv = Math.floor(uv[1] * bk.dicht);
        for (const [du, dv] of buren) {
          const k = bk.kaart.get(`${gv.groep}|${iu + du}|${iv + dv}`);
          if (k) return k;
        }
      }
      return eigen(x, y, z, nx, ny, nz, deel, kijk, fijn);
    },
  };
}

module.exports = { nummer, nummerVan, groepen, bak, voegSamen, bakMateriaal, gebakkenAfwerking, texel };
