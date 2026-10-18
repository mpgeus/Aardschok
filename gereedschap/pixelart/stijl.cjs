// De stijlafwerking: van een render naar pixel art die er met de hand gemaakt uitziet (werklijst vraag 180; Marcels zesde
// opdracht in gereedschap/ai/opdracht-comfyui.md, het verslag in gereedschap/ai/hd-stijl.md). Optioneel en voor elk ding:
// de renderer blijft zoals hij is, dit is een stap erna.
//
// De weg: kern.cjs rendert op de interne resolutie (4×) met een G-buffer (o.rust en o.gbuffer: per pixel het onderdeel,
// het materiaal, de diepte, de normaal, de plek in rust, de afwikkeling, het licht, de glans, de holte, de bolle rand en de
// zon). `gbuffer` brengt die naar de doelmaat (2×): per doelpixel het onderdeel dat de meeste subpixels heeft, en het
// gemiddelde daarvan. `stileer` maakt er op de doelmaat een beeld van: per materiaal een kleurreeks (een paar tonen, de
// tint verschuift van koel in de schaduw naar warm in het licht), en wat een pixelaar met de hand doet. Alles hangt aan
// het ding zelf (de plek in rust, de afwikkeling, het onderdeel), nooit aan toeval per beeld: wat op een spaak staat,
// draait met de spaak mee.
//
// De stappen (elk aan of uit, `stileer(G, stijl, stappen)`):
//   reeksen       de kleur uit de kleurreeks van het materiaal, op drempels in het licht (in plaats van de kleur van de
//                 render): licht, middel en donker als vlakken, met warme lichten en koele schaduwen
//   nerf          gerichte nerven: korte donkere lijnen langs u van de afwikkeling (de lengte van een spaak, rondom een
//                 velg), golvend en onderbroken, uit de afwikkeling (dus vast op het hout)
//   variatie      elk onderdeel een eigen toon (elke spaak iets anders) en grote vlekken uit ruis op de plek in rust
//   metaal        een hard glimlicht (de lichtste toon) waar de glans hoog is, en een lichte pixel op bolle randen in het
//                 licht (de koppen van de nagels)
//   clusters      grotere vlakken van één toon: het licht eerst glad binnen elk onderdeel (`clusters.glad` rondes), en
//                 op verzoek kleine losse stukjes (onder `clusters.min` pixels) opgaan in hun buren; wat een stap bewust
//                 zette (een nerf, een glimlicht), blijft
//   contact       contactschaduw: holtes donkerder, en een pixel naast een onderdeel dat ervoor ligt een toon donkerder
//   accent        een lichte rand: een pixel aan de rand van een onderdeel dat naar het licht kijkt, een toon lichter
//   binnenlijnen  een donkere lijn van één pixel waar het ene onderdeel voor het andere ligt, of waar twee soorten
//                 onderdelen elkaar raken (een spaak in de velg)
//   slijt         slijtage: een bolle rand (de kromming uit de render) een toon lichter, onderbroken op vaste plekken
//   selOmlijning  de omlijning in de donkerste kleur van het materiaal ernaast (aan de lichte kant minder donker), in
//                 plaats van zwart maal de kleur
//
//   reeks(basis, n, o)                een kleurreeks rond een kleur (in OKLab), voor elk materiaal
//   gbuffer(B, n, stijl)              de G-buffer van B (n keer zo fijn) op de doelmaat
//   verdeling(n, o)                   hoe vaak elke toon voorkomt, als standaard
//   kalibreer(Gs, stijl, doel, st)    de drempels per materiaal, eens per ding (niet per beeld: dat zou flikkeren)
//   stileer(G, stijl, stappen)        → { b, h, rgba, toon, vast }
'use strict';
const K = require('./kern.cjs');

const lum = (k) => 0.299 * k[0] + 0.587 * k[1] + 0.114 * k[2];
const lin = (c) => ((c / 255) <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
const srgb = (l) => Math.round(255 * K.klem(l <= 0.0031308 ? 12.92 * l : 1.055 * l ** (1 / 2.4) - 0.055, 0, 1));

// ---------------------------------------------------------------- kleurreeksen

// OKLab (Björn Ottosson): gelijke stappen zien er gelijk uit, en de tint blijft waar hij is als het licht verandert.
function naarLab(k) {
  const [r, g, b] = k.map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function vanLab([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
// Van LCh (helderheid, verzadiging, tint in graden) naar sRGB; buiten wat het scherm kan, minder verzadigd.
function vanLch(L, C, h) {
  for (let c = C; c >= 0; c -= 0.004) {
    const rgb = vanLab([L, c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)]);
    if (rgb.every((v) => v >= -0.001 && v <= 1.001)) return rgb.map(srgb);
  }
  return vanLab([L, 0, 0]).map(srgb);
}
const naarLch = (k) => {
  const [L, a, b] = naarLab(k);
  return [L, Math.hypot(a, b), ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360];
};
// Een tint een stuk naar een doeltint, langs de korte kant van de kring.
const naarTint = (h, doel, graden) => {
  const d = ((doel - h + 540) % 360) - 180;
  return h + Math.sign(d) * Math.min(Math.abs(d), graden);
};
// Een kleurreeks van n tonen rond een basiskleur, van donker naar licht. o: { donker, licht (de helderheid in OKLab van de
// donkerste en de lichtste toon, 0 tot 1), koel (graden die de schaduw naar blauwpaars schuift), warm (graden die het
// licht naar geel schuift), verzadiging (maal die van de basis), randVerzadiging (hoeveel minder verzadigd de donkerste en
// de lichtste toon zijn dan het midden: 0,25), lichtVerzadiging (de lichtste toon maal dit) }. De vuistregel van pixel art: de tint verschuift met het licht, niet alleen de helderheid.
function reeks(basis, n, o = {}) {
  const [L0, C0, h0] = naarLch(basis);
  const lo = o.donker ?? L0 * 0.45;
  const hi = o.licht ?? Math.min(0.95, L0 * 1.45);
  const uit = [];
  for (let k = 0; k < n; k++) {
    const t = n === 1 ? 0.5 : k / (n - 1);
    const L = lo + (hi - lo) * t;
    const h = t < 0.5 ? naarTint(h0, 290, (o.koel ?? 20) * (1 - 2 * t)) : naarTint(h0, 95, (o.warm ?? 15) * (2 * t - 1));
    const C = C0 * (o.verzadiging ?? 1) * (1 - (o.randVerzadiging ?? 0.25) * Math.abs(2 * t - 1) ** 2) * (t > 0.5 ? 1 + ((o.lichtVerzadiging ?? 1) - 1) * (2 * t - 1) : 1);
    uit.push(vanLch(L, C, h));
  }
  return uit;
}

// ---------------------------------------------------------------- de G-buffer op de doelmaat

// De nerf op een plek in de afwikkeling: lijnen langs u, om de `afstand` in v, golvend, in stukken van zo'n `lengte` met
// gaten ertussen (een deel `gat`); elke lijn op een vaste plek in zijn baan. 1 op een lijn, anders 0.
function nerfBij(u, v, stuk, p) {
  const a = p.afstand || 1.1;
  const vv = v + (p.golf ?? 0.3) * a * (K.ruis2(u * 0.3, stuk * 7.13, 11) * 2 - 1);
  const k = Math.floor(vv / a);
  const midden = 0.25 + 0.5 * K.rnd(k, stuk, 3);
  if (Math.abs(vv / a - k - midden) * a > (p.breedte || 0.3) / 2) return 0;
  const lengte = p.lengte || 4;
  const s = Math.floor(u / lengte + K.rnd(k, stuk, 5));
  return K.rnd(k, s, stuk * 13 + 7) < (p.gat ?? 0.35) ? 0 : 1;
}

// De G-buffer van B (gerenderd met o.rust en o.gbuffer, n keer zo fijn als de doelmaat) op de doelmaat. Per doelpixel:
// dek (de helft van de subpixels dekt), het stuk (het onderdeel, model.delen-index) dat de meeste subpixels heeft, en van
// die subpixels het gemiddelde; kleur: de render zelf, gemiddeld in lineair licht over alles wat dekt (zoals box); nerf:
// het deel van de subpixels op een nerf (als het materiaal er een heeft, stijl.materialen[ramp].nerf).
function gbuffer(B, n, stijl = {}) {
  const b = Math.floor(B.b / n);
  const h = Math.floor(B.h / n);
  const N = b * h;
  const G = {
    b, h, n,
    dek: new Uint8Array(N), mat: new Int16Array(N).fill(-1), deel: new Int16Array(N).fill(-1), stuk: new Int16Array(N).fill(-1),
    diep: new Float32Array(N), nrm: new Float32Array(N * 3), rust: new Float32Array(N * 3), albedo: new Float32Array(N * 3),
    licht: new Float32Array(N), glans: new Float32Array(N), holte: new Float32Array(N), bol: new Float32Array(N),
    zon: new Float32Array(N), nL: new Float32Array(N), kleur: new Float32Array(N * 3), nerf: new Float32Array(N),
  };
  const GB = K.GB;
  const g = B.g;
  const tel = new Map();
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const o = y * b + x;
    tel.clear();
    let dek = 0;
    const kl = [0, 0, 0];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const s = (y * n + j) * B.b + x * n + i;
      if (B.ramp[s] < 0) continue;
      dek++;
      const st = B.rust ? B.rust[s * 4 + 3] : B.deel[s];
      tel.set(st, (tel.get(st) || 0) + 1);
      if (B.kleur) {
        const f = K.klem(1 + (B.stap[s] - B.kleur[s * 4 + 3]) * 0.22, 0.45, 1.8);
        for (let c = 0; c < 3; c++) kl[c] += lin(K.klem(B.kleur[s * 4 + c] * f, 0, 255));
      }
    }
    if (dek * 2 < n * n) continue;
    G.dek[o] = 1;
    for (let c = 0; c < 3; c++) G.kleur[o * 3 + c] = kl[c] / dek;
    let stuk = -1;
    let max = 0;
    for (const [st, t] of tel) if (t > max) [stuk, max] = [st, t];
    G.stuk[o] = stuk;
    let m = 0;
    const som = new Float64Array(20);
    let nerf = 0;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const s = (y * n + j) * B.b + x * n + i;
      if (B.ramp[s] < 0) continue;
      const st = B.rust ? B.rust[s * 4 + 3] : B.deel[s];
      if (st !== stuk) continue;
      m++;
      G.mat[o] = B.ramp[s];
      G.deel[o] = B.deel[s];
      som[0] += B.diep[s];
      for (let c = 0; c < 3; c++) {
        som[1 + c] += B.nrm[s * 3 + c];
        if (B.rust) som[4 + c] += B.rust[s * 4 + c];
        if (B.albedo) som[7 + c] += B.albedo[s * 3 + c];
      }
      if (g) {
        const f = B.kleur ? K.klem(1 + (B.stap[s] - B.kleur[s * 4 + 3]) * 0.22, 0.45, 1.8) : 1;
        som[10] += g[s * GB + K.G.licht] * f;
        som[11] += g[s * GB + K.G.glans] * f;
        som[12] += g[s * GB + K.G.holte];
        som[13] += g[s * GB + K.G.bol];
        som[14] += g[s * GB + K.G.zon];
        som[15] += g[s * GB + K.G.nL];
        const def = stijl.materialen && stijl.materialen[K.RAMP_NAMEN[B.ramp[s]]];
        const u = g[s * GB + K.G.u];
        if (def && def.nerf && !Number.isNaN(u)) nerf += nerfBij(u, g[s * GB + K.G.v], st, def.nerf);
      }
    }
    G.diep[o] = som[0] / m;
    const nl = Math.hypot(som[1], som[2], som[3]) || 1;
    for (let c = 0; c < 3; c++) {
      G.nrm[o * 3 + c] = som[1 + c] / nl;
      G.rust[o * 3 + c] = som[4 + c] / m;
      G.albedo[o * 3 + c] = som[7 + c] / m;
    }
    G.licht[o] = som[10] / m;
    G.glans[o] = som[11] / m;
    G.holte[o] = som[12] / m;
    G.bol[o] = som[13] / m;
    G.zon[o] = som[14] / m;
    G.nL[o] = som[15] / m;
    G.nerf[o] = nerf / m;
  }
  return G;
}

// ---------------------------------------------------------------- kalibreren

// Het licht van een pixel als één getal s: het licht van de render, met de textuur (de helderheid van het albedo om zijn
// gemiddelde, maal def.textuur) en de glans erbij.
function lichtVan(G, o, def) {
  const a = lum([G.albedo[o * 3], G.albedo[o * 3 + 1], G.albedo[o * 3 + 2]]) / (def.ref || 1);
  return G.licht[o] * (1 + (def.textuur ?? 0.5) * (a - 1)) + (def.glans ?? 0) * G.glans[o];
}
// Een verdeling van n tonen zoals een pixelaar hem vaak kiest (een standaard voor elk materiaal zonder voorbeeld): het
// meeste in de tonen iets onder het midden, de lichtste zeldzaam (een glimlicht, geen vlak). o: { midden (0 tot 1),
// breedte, top (het aandeel van de lichtste maal dit) }.
function verdeling(n, o = {}) {
  const m = o.midden ?? 0.4;
  const w = o.breedte ?? 0.42;
  const a = Array.from({ length: n }, (_, k) => Math.exp(-((((n === 1 ? 0.5 : k / (n - 1)) - m) / w) ** 2)));
  a[n - 1] *= o.top ?? 0.5;
  const som = a.reduce((s, x) => s + x, 0);
  return a.map((x) => x / som);
}
// De drempels per materiaal, uit een paar beelden van het ding (eens, en dan vast voor alle richtingen en standen): ref,
// de mediaan van de helderheid van het albedo; en de drempels tussen de tonen, zo dat elke toon zo vaak voorkomt als
// doel[materiaal] (het aandeel van elke toon in een voorbeeld, van donker naar licht) of anders def.verdeling zegt; zonder
// allebei even ver uit elkaar tussen het donkerste en het lichtste licht (3% en 97%). Met stappen (die van stileer) wordt
// het eindbeeld nagemeten (de nerf, de contactschaduw en de randen schuiven tonen) en worden de drempels in een paar
// rondes bijgesteld tot de verdeling klopt.
function kalibreer(Gs, stijl, doel = null, stappen = null) {
  const per = [];
  for (const [naam, def] of Object.entries(stijl.materialen)) {
    const m = K.RAMP[naam];
    const alb = [];
    for (const G of Gs) for (let o = 0; o < G.b * G.h; o++) if (G.dek[o] && G.mat[o] === m) alb.push(lum([G.albedo[o * 3], G.albedo[o * 3 + 1], G.albedo[o * 3 + 2]]));
    if (!alb.length) continue;
    alb.sort((a, b) => a - b);
    def.ref = alb[alb.length >> 1];
    const s = [];
    for (const G of Gs) for (let o = 0; o < G.b * G.h; o++) if (G.dek[o] && G.mat[o] === m) s.push(lichtVan(G, o, def));
    s.sort((a, b) => a - b);
    const q = (p) => s[K.klem(Math.floor(p * s.length), 0, s.length - 1)];
    const n = def.reeks.length;
    const aandelen = (doel && doel[naam]) || def.verdeling || null;
    if (!aandelen) {
      const lo = q(0.03);
      const hi = q(0.97);
      def.drempels = Array.from({ length: n - 1 }, (_, k) => lo + ((k + 1) * (hi - lo)) / n);
      continue;
    }
    let cum = 0;
    const doelCum = aandelen.slice(0, n - 1).map((a) => (cum += a));
    per.push({ naam, def, m, q, doelCum, p: [...doelCum] });
    def.drempels = doelCum.map(q);
  }
  if (!stappen) return stijl;
  for (let ronde = 0; ronde < 6; ronde++) {
    const tel = per.map((x) => new Float64Array(x.def.reeks.length));
    for (const G of Gs) {
      const r = stileer(G, stijl, stappen);
      for (let o = 0; o < G.b * G.h; o++) {
        if (r.toon[o] < 0) continue;
        const k = per.findIndex((x) => x.m === G.mat[o]);
        if (k >= 0) tel[k][r.toon[o]]++;
      }
    }
    per.forEach((x, k) => {
      const totaal = tel[k].reduce((s, v) => s + v, 0) || 1;
      let c = 0;
      const echt = x.doelCum.map((_, j) => (c += tel[k][j] / totaal));
      x.p = x.p.map((p, j) => K.klem(p + (x.doelCum[j] - echt[j]), 0.001, 0.999));
      for (let j = 1; j < x.p.length; j++) x.p[j] = Math.max(x.p[j], x.p[j - 1] + 0.001);
      x.def.drempels = x.p.map(x.q);
    });
  }
  return stijl;
}

// ---------------------------------------------------------------- stileren

const BUREN = [[1, 0], [-1, 0], [0, 1], [0, -1]];
// Het beeld op de doelmaat. stappen: { reeksen, nerf, variatie, metaal, clusters, contact, accent, binnenlijnen, slijt,
// selOmlijning } (zie boven). Geeft { b, h, rgba, toon (de toon per pixel, -1 voor een lijn), vast (1: een stap zette
// deze toon bewust: nerf, glimlicht, slijtage, accent, contactschaduw) }.
function stileer(G, stijl, st = {}) {
  const { b, h } = G;
  const N = b * h;
  const toon = new Int16Array(N).fill(-1);
  const vast = new Uint8Array(N);
  const lijn = new Uint8Array(N);
  const defVan = (o) => stijl.materialen[K.RAMP_NAMEN[G.mat[o]]];
  const dekt = (x, y) => x >= 0 && y >= 0 && x < b && y < h && G.dek[y * b + x];
  // 1. het licht en de toon. Met de clusters (stijl.clusters.glad) eerst het licht glad binnen elk onderdeel (een paar
  // keer het gemiddelde met de buren van hetzelfde onderdeel): dan ontstaan er minder losse eilandjes, en omdat het licht
  // vloeiend blijft, springt er bij het draaien niets. (Eilandjes achteraf samenvoegen, stijl.clusters.min, is een keus per
  // beeld en flikkert: zuidwest 0,18 naar 0,25.)
  const sv = new Float32Array(N);
  for (let o = 0; o < N; o++) if (G.dek[o] && defVan(o)) sv[o] = lichtVan(G, o, defVan(o));
  const glad = st.clusters && stijl.clusters ? stijl.clusters.glad || 0 : 0;
  for (let ronde = 0; ronde < glad; ronde++) {
    const oud = Float32Array.from(sv);
    for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
      const o = y * b + x;
      if (!G.dek[o] || !defVan(o)) continue;
      let som = 0, n = 0;
      for (const [dx, dy] of BUREN) {
        if (!dekt(x + dx, y + dy)) continue;
        const j = o + dy * b + dx;
        if (G.stuk[j] !== G.stuk[o]) continue;
        som += oud[j];
        n++;
      }
      if (n) sv[o] = 0.5 * oud[o] + (0.5 * som) / n;
    }
  }
  for (let o = 0; o < N; o++) {
    if (!G.dek[o]) continue;
    const def = defVan(o);
    if (!def) continue;
    let s = sv[o];
    if (st.variatie && def.variatie) {
      const v = def.variatie;
      s *= 1 + (v.stuk || 0) * (K.rnd(G.stuk[o], 17, 3) * 2 - 1);
      const sc = v.schaal || 2.5;
      s *= 1 + (v.ruis || 0) * (K.ruis3(G.rust[o * 3] / sc, G.rust[o * 3 + 1] / sc, G.rust[o * 3 + 2] / sc, G.stuk[o] * 31) * 2 - 1);
    }
    if (st.contact && def.contact) s *= 1 - (def.contact.holte || 0) * G.holte[o];
    let t = 0;
    for (const d of def.drempels) if (s > d) t++;
    // def.topVoorAccent: de lichtste toon alleen voor wat een stap bewust zet (een lichte rand, een glimlicht), niet als
    // vlak: zo doet een pixelaar het
    toon[o] = def.topVoorAccent ? Math.min(t, def.reeks.length - 2) : t;
  }
  const max = (o) => defVan(o).reeks.length - 1;
  const zet = (o, t) => {
    toon[o] = K.klem(t, 0, max(o));
    vast[o] = 1;
  };
  // 2. wat bewust gezet wordt (en in de clusters blijft)
  for (let o = 0; o < N; o++) {
    if (toon[o] < 0) continue;
    const def = defVan(o);
    if (st.nerf && def.nerf && G.nerf[o] >= (def.nerf.drempel ?? 0.45)) zet(o, toon[o] + (def.nerf.stap ?? -1));
    if (st.metaal && def.metaal) {
      if (G.glans[o] >= def.metaal.glimlicht) zet(o, max(o));
      else if (G.bol[o] >= (def.metaal.bol ?? 0.5) && G.nL[o] > 0.15 && G.zon[o] > 0.5) zet(o, toon[o] + 1);
    }
    if (st.slijt && def.slijt && G.bol[o] >= def.slijt.vanaf) {
      const c = 1 / (def.slijt.stuk || 0.7);
      if (K.rnd(Math.floor(G.rust[o * 3] * c), Math.floor(G.rust[o * 3 + 1] * c), Math.floor(G.rust[o * 3 + 2] * c) + G.stuk[o] * 101) >= (def.slijt.gat ?? 0.35)) zet(o, toon[o] + (def.slijt.stap ?? 1));
    }
  }
  // de nagels (stijl.details: de onderdelen die versiering zijn): elke kop een lichte pixel waar hij het meest naar het licht
  // kijkt en een donkere aan de andere kant, ook op een vlak in de schaduw; zo tekent een pixelaar een nagel, en het hangt
  // aan de kop zelf (de normaal), dus het draait mee
  if (st.metaal && stijl.details) {
    const gezien = new Uint8Array(N);
    for (let s0 = 0; s0 < N; s0++) {
      if (toon[s0] < 0 || gezien[s0] || !stijl.details.has(G.stuk[s0])) continue;
      const kop = [s0];
      gezien[s0] = 1;
      for (let k = 0; k < kop.length; k++) {
        const i = kop[k];
        const x = i % b;
        const y = (i - x) / b;
        for (const [dx, dy] of BUREN) {
          if (!dekt(x + dx, y + dy)) continue;
          const j = i + dy * b + dx;
          if (!gezien[j] && toon[j] >= 0 && G.stuk[j] === G.stuk[s0]) {
            gezien[j] = 1;
            kop.push(j);
          }
        }
      }
      kop.sort((p, q) => G.nL[p] - G.nL[q]);
      const def = defVan(s0);
      const d = def.nagel || {};
      zet(kop[kop.length - 1], max(s0) - (d.licht ?? 1));
      if (kop.length >= 2) zet(kop[0], d.donker ?? 1);
    }
  }
  if (st.contact) {
    // een pixel naast een onderdeel dat ervoor ligt (meer dan `voor` eenheden): een toon donkerder
    for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
      const o = y * b + x;
      if (toon[o] < 0) continue;
      const def = defVan(o);
      if (!def.contact) continue;
      const voor = def.contact.voor ?? 0.8;
      if (BUREN.some(([dx, dy]) => dekt(x + dx, y + dy) && G.stuk[o + dy * b + dx] !== G.stuk[o] && G.diep[o + dy * b + dx] > G.diep[o] + voor)) zet(o, toon[o] - (def.contact.stap ?? 1));
    }
  }
  // 3. de clusters: een stuk van één toon (vier buren, binnen één materiaal) dat kleiner is dan min, en niets bewust
  // gezet heeft, krijgt de toon die het meest om het stuk heen ligt
  if (st.clusters && stijl.clusters && stijl.clusters.min > 1) {
    const min = stijl.clusters.min;
    for (let ronde = 0; ronde < 2; ronde++) {
      const gezien = new Uint8Array(N);
      for (let s0 = 0; s0 < N; s0++) {
        if (toon[s0] < 0 || gezien[s0]) continue;
        const stuk = [s0];
        gezien[s0] = 1;
        let bewust = vast[s0];
        for (let k = 0; k < stuk.length && stuk.length <= min; k++) {
          const i = stuk[k];
          const x = i % b;
          const y = (i - x) / b;
          for (const [dx, dy] of BUREN) {
            if (!dekt(x + dx, y + dy)) continue;
            const j = i + dy * b + dx;
            if (gezien[j] || toon[j] !== toon[s0] || G.mat[j] !== G.mat[s0]) continue;
            gezien[j] = 1;
            stuk.push(j);
            bewust |= vast[j];
          }
        }
        if (stuk.length >= min || bewust) continue;
        const rond = new Map();
        for (const i of stuk) {
          const x = i % b;
          const y = (i - x) / b;
          for (const [dx, dy] of BUREN) {
            if (!dekt(x + dx, y + dy)) continue;
            const j = i + dy * b + dx;
            if (G.mat[j] !== G.mat[s0] || toon[j] === toon[s0] || toon[j] < 0) continue;
            rond.set(toon[j], (rond.get(toon[j]) || 0) + 1);
          }
        }
        let beste = -1;
        let bt = 0;
        for (const [t, c] of rond) if (c > bt || (c === bt && Math.abs(t - toon[s0]) < Math.abs(beste - toon[s0]))) [beste, bt] = [t, c];
        if (beste >= 0) for (const i of stuk) toon[i] = beste;
      }
    }
  }
  // 4. de lichte rand: aan de rand van een onderdeel (ernaast niets, of een onderdeel erachter) dat naar het licht kijkt
  if (st.accent) {
    const nieuw = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
      const o = y * b + x;
      if (toon[o] < 0) continue;
      const def = defVan(o);
      if (!def.accent || G.nL[o] < def.accent.nL || G.zon[o] < 0.5) continue;
      if (BUREN.some(([dx, dy]) => !dekt(x + dx, y + dy) || (G.stuk[o + dy * b + dx] !== G.stuk[o] && G.diep[o + dy * b + dx] < G.diep[o] - 0.8))) nieuw.push(o);
    }
    for (const o of nieuw) zet(o, toon[o] + (defVan(o).accent.stap ?? 1));
  }
  // 5. de lijnen binnenin: waar een buur van een ander onderdeel ervoor ligt (meer dan `voor`), of waar twee soorten
  // onderdelen elkaar raken (de lijn op het onderdeel met het hogere nummer van zijn soort: een vaste keus, dus geen
  // geflikker)
  if (st.binnenlijnen && stijl.binnenlijnen) {
    const voor = stijl.binnenlijnen.voor ?? 1.2;
    for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
      const o = y * b + x;
      if (toon[o] < 0) continue;
      for (const [dx, dy] of BUREN) {
        if (!dekt(x + dx, y + dy)) continue;
        const j = o + dy * b + dx;
        if (G.stuk[j] === G.stuk[o]) continue;
        if (G.diep[j] > G.diep[o] + voor || (G.deel[j] !== G.deel[o] && Math.abs(G.diep[j] - G.diep[o]) <= voor && G.deel[o] > G.deel[j])) {
          lijn[o] = 1;
          break;
        }
      }
    }
  }
  // 6. de kleuren
  const rgba = Buffer.alloc(N * 4);
  for (let o = 0; o < N; o++) {
    if (!G.dek[o]) continue;
    const def = defVan(o);
    let k;
    if (!def) k = [0, 1, 2].map((c) => srgb(G.kleur[o * 3 + c]));
    else if (!st.reeksen) k = [0, 1, 2].map((c) => srgb(G.kleur[o * 3 + c]));
    else k = lijn[o] ? def.lijn || def.reeks[0].map((c) => Math.round(c * 0.55)) : def.reeks[toon[o]];
    rgba.set([...k, 255], o * 4);
    if (lijn[o]) toon[o] = -1;
  }
  // 7. de omlijning (een pixel om wat dekt): de donkerste kleur (def.lijn) van het materiaal ernaast; met selOmlijning aan
  // de lichte kant (links en boven) de donkerste toon van de reeks, anders de kleur ernaast maal 0,3 of 0,18 (zoals
  // hdproef.cjs omlijnBeeld)
  const uit = Buffer.from(rgba);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const o = y * b + x;
    if (G.dek[o]) continue;
    for (const [dx, dy, f, lichtKant] of [[1, 0, 0.3, true], [0, 1, 0.3, true], [-1, 0, 0.18, false], [0, -1, 0.18, false]]) {
      if (!dekt(x + dx, y + dy)) continue;
      const j = o + dy * b + dx;
      const def = G.mat[j] >= 0 ? defVan(j) : null;
      let k;
      if (st.selOmlijning && def) k = lichtKant ? def.reeks[0] : def.lijn || def.reeks[0].map((c) => Math.round(c * 0.55));
      else k = [0, 1, 2].map((c) => Math.round(rgba[j * 4 + c] * f));
      uit.set([...k, 255], o * 4);
      break;
    }
  }
  return { b, h, rgba: uit, toon, vast };
}

module.exports = { reeks, verdeling, naarLch, vanLch, gbuffer, nerfBij, kalibreer, lichtVan, stileer, lum, lin, srgb };
