// Bouwt kaarten/wereld.tmj: de hele buitenwereld op één doek, zodat er straks geen overgangen meer
// zijn tussen het erf, het bos en het dorp (zie ontwerp/werklijst.md "Eén doorlopende wereld" en
// ontwerp/kaarten.md "Buiten is één grote kaart"). Eenmalig: hierna is wereld.tmj van Marcel, en
// tekent hij er in Tiled zelf in verder — dit script overschrijft dat nooit zonder --overschrijf.
//
//   node gereedschap/tiled/maak-wereld.cjs [--overschrijf]
//
// Wat erin komt:
//  1. het erf, met dezelfde plaatsing als gereedschap/pixelart/erf-kaart.cjs (die kaarten/erf.tmj
//     maakte, nu in kaarten/oud/): de toren, het schuurtje, de put, de moestuin, de bomen, de oude
//     meester, de wolf en de deur van de toren. Alleen de grondlaag is nieuw: geen stempels meer
//     uit grond.tsx, maar de terreinsets van tegels/rand.tsx (zie randtegels-proef.cjs), zodat het
//     pad nette randen en karrensporen krijgt zoals Tiled dat ook zou kiezen.
//  2. Marcels dorp (kaarten/oud/dorp.tmj), tegel voor tegel en object voor object overgenomen —
//     alleen de tegelnummers zijn op NAAM overgezet (zie ontwerp/kaarten.md "Een tegelnummer
//     verandert nooit"), voor het geval de tegelvellen intussen in een andere volgorde staan. De
//     oude "pad terug naar het erf" (een teleport naar een kaart die zo niet meer bestaat) gaat
//     niet mee: erf en dorp liggen nu op dezelfde kaart.
//  3. een simpel zandpad, met gras eromheen, dat het einde van het dorpspad van het erf verbindt
//     met de oostkant van het dorp. Marcel tekent het bos daar zelf in.
//
// Een kaart is een rechthoek; niet alles ertussen hoeft gevuld: waar geen erf, dorp of pad ligt,
// blijft de tegel leeg (net als "buiten", onbegaanbaar) — dat is normaal in Tiled en scheelt een
// hoop tegels ten opzichte van alles vullen met gras.
'use strict';
const fs = require('fs');
const path = require('path');
const Es = require('../pixelart/erf-scene.cjs');
const K = require('../pixelart/kern.cjs');

const WORTEL = path.join(__dirname, '..', '..');
const TEGELS_DIR = path.join(WORTEL, 'tegels');
const KAARTEN = path.join(WORTEL, 'kaarten');
const UIT_PAD = path.join(KAARTEN, 'wereld.tmj');
const DORP_BRON_PAD = path.join(KAARTEN, 'oud', 'dorp.tmj');

const vellen = JSON.parse(fs.readFileSync(path.join(TEGELS_DIR, 'tegels.json'), 'utf8'));

// ---------------------------------------------------------------- de tegelvellen en hun gids
//
// Dezelfde soort opzoeking als erf-kaart.cjs, maar met 'rand' in plaats van 'grond' als eerste vel:
// de grond komt nu uit de terreinsets van tegels/rand.tsx, niet meer uit de vierkante stempels.
const VOLGORDE = ['rand', 'bomen', 'begroeiing', 'gebouwen', 'toren', 'erf'];
const gebruikt = VOLGORDE.filter((n) => vellen[n]);
const firstgid = {};
{
  let g = 1;
  for (const naam of gebruikt) {
    firstgid[naam] = g;
    g += vellen[naam].tiles.length;
  }
}
// naam -> eerste vel/id waarin die naam voorkomt (voor losse dingen als "toren", "schuurtje", ...
// die maar in één vel voorkomen, zoals erf-kaart.cjs dat ook opzoekt).
const velVan = new Map();
for (const naam of gebruikt) {
  vellen[naam].tiles.forEach((t, i) => {
    if (t && t.naam && !velVan.has(t.naam)) velVan.set(t.naam, { vel: naam, id: i, tegel: t });
  });
}
function gidVan(naam) {
  const v = velVan.get(naam);
  if (!v) return null;
  return { gid: firstgid[v.vel] + v.id, vel: vellen[v.vel], tegel: v.tegel };
}
// naam -> lokaal id, per vel apart (voor het overzetten van het dorp: daar weten we uit welk vel
// een tegel al kwam, dus zoeken we daar gericht in door, in plaats van op de eerste de beste vel
// met die naam te gokken).
const idOpNaam = {};
for (const naam of gebruikt) {
  idOpNaam[naam] = {};
  vellen[naam].tiles.forEach((t, i) => {
    if (t && t.naam && !(t.naam in idOpNaam[naam])) idOpNaam[naam][t.naam] = i;
  });
}
function nieuweGid(velNaam, tegelNaam) {
  const id = idOpNaam[velNaam] && idOpNaam[velNaam][tegelNaam];
  if (id === undefined) throw new Error(`geen tegel "${tegelNaam}" in ${velNaam}.tsx — draai npm run tiled/randtegels opnieuw`);
  return firstgid[velNaam] + id;
}
// gid (uit een kaart met zijn EIGEN tilesets-tabel, bijvoorbeeld het gearchiveerde dorp.tmj) -> op
// welke naam, uit welk vel hij eigenlijk staat. Dezelfde opzoeking als js/kaart.js se bouwOpzoeker,
// hier met tegels/tegels.json zoals dat NU op schijf staat (dorp.tmj droeg zijn eigen firstgid's al
// bij zich, dus dit werkt ook als de vellen intussen gegroeid zijn).
function velNaamVan(bron) {
  return String(bron || '').replace(/\\/g, '/').split('/').pop().replace(/\.tsx$/i, '');
}
function bouwOpzoekerVoorKaart(kaart) {
  const sets = (kaart.tilesets || []).map((t) => {
    const naam = velNaamVan(t.source);
    const vel = vellen[naam];
    return { naam, firstgid: t.firstgid || 1, aantal: vel ? vel.tiles.length : 0, vel };
  });
  return function (gid) {
    const g = gid & 0x1fffffff; // spiegel/draai-vlaggen (Tiled) wegdoen
    if (!g) return null;
    for (const s of sets) {
      const lokaal = g - s.firstgid;
      if (s.vel && lokaal >= 0 && lokaal < s.aantal) {
        const eig = s.vel.tiles[lokaal];
        return eig && eig.naam ? { vel: s.naam, naam: eig.naam } : null;
      }
    }
    return null;
  };
}

// ---------------------------------------------------------------- de randtegels (terreinsets)
//
// tegels/rand.tsx zelf opnieuw laten bouwen (randtegels.cjs) zou rand.png/rand.tsx herschrijven en
// zo de vaste-capaciteit-opvulling van npm run tiled ongedaan maken (zie ontwerp/kaarten.md, "Een
// tegelnummer verandert nooit"). We lezen daarom de terreinsets uit de .tsx die al op schijf staat
// — precies wat Tiled zelf ook doet — en kiezen per tegel de goede randtegel op dezelfde manier als
// gereedschap/pixelart/randtegels-proef.cjs: per hoek de grondsoort, de vier hoeken naar een wangid,
// en die opzoeken in de terreinset.
function leesWangsets(tsxTekst) {
  const sets = [];
  const setRe = /<wangset name="([^"]*)"[^>]*>([\s\S]*?)<\/wangset>/g;
  let m;
  while ((m = setRe.exec(tsxTekst))) {
    const kleuren = [...m[2].matchAll(/<wangcolor name="([^"]*)"/g)].map((x) => ({ naam: x[1] }));
    const tegels = [...m[2].matchAll(/<wangtile tileid="(\d+)" wangid="([^"]*)"/g)].map((x) => ({ id: Number(x[1]), wangid: x[2] }));
    sets.push({ naam: m[1], kleuren, tegels });
  }
  return sets;
}
const randSets = leesWangsets(fs.readFileSync(path.join(TEGELS_DIR, 'rand.tsx'), 'utf8'));
// vlakke tegels per grondsoort (groep "vlak", zie randtegels.cjs)
const VLAK = {};
vellen.rand.tiles.forEach((t, id) => {
  if (t && t.groep === 'vlak') (VLAK[t.naam] = VLAK[t.naam] || []).push(id);
});
// "soortA|soortB" -> { a, b, opWangid } — allebei de richtingen, zoals randtegels-proef.cjs dat doet
const TERREINSETS = {};
for (const set of randSets) {
  const a = set.kleuren[0].naam;
  const b = set.kleuren[1].naam;
  const opWangid = {};
  for (const wt of set.tegels) (opWangid[wt.wangid] = opWangid[wt.wangid] || []).push(wt.id);
  TERREINSETS[`${a}|${b}`] = { a, b, opWangid };
  TERREINSETS[`${b}|${a}`] = { a, b, opWangid };
}
// Dezelfde volgorde als randtegels.cjs: boven, rechts, onder, links van de ruit.
const HOEK_INDEX = { boven: 7, rechts: 1, onder: 3, links: 5 };
function wangId(hoeken) {
  const w = [0, 0, 0, 0, 0, 0, 0, 0];
  w[HOEK_INDEX.boven] = hoeken[0];
  w[HOEK_INDEX.rechts] = hoeken[1];
  w[HOEK_INDEX.onder] = hoeken[2];
  w[HOEK_INDEX.links] = hoeken[3];
  return w.join(',');
}
// Een tegel kan maar twee grondsoorten dragen; komen er drie samen, dan houden we de twee die het
// vaakst voorkomen (Tiled se eigen beste-gok).
function totTwee(hoeken) {
  const tel = {};
  for (const h of hoeken) tel[h] = (tel[h] || 0) + 1;
  const soorten = Object.keys(tel);
  if (soorten.length <= 2) return hoeken;
  soorten.sort((p, q) => tel[q] - tel[p]);
  const [eerste, tweede] = soorten;
  return hoeken.map((h) => (h === eerste || h === tweede ? h : eerste));
}
// soortOp(tx, ty): de grondsoort op ROOSTERPUNT (tx, ty). terreinGid kijkt naar de vier punten van
// tegel (tx, ty) — (tx,ty), (tx+1,ty), (tx+1,ty+1), (tx,ty+1) — en geeft de gid van de tegel uit
// rand.tsx die daarbij hoort, zoals Tiled dat zelf ook zou kiezen.
function terreinGid(soortOp, tx, ty, zout) {
  const hoeken = totTwee([soortOp(tx, ty), soortOp(tx + 1, ty), soortOp(tx + 1, ty + 1), soortOp(tx, ty + 1)]);
  const uniek = [...new Set(hoeken)];
  const kies = (lijst) => lijst[K.hash(tx, ty, zout) % lijst.length];
  if (uniek.length === 1) return firstgid.rand + kies(VLAK[uniek[0]]);
  const set = TERREINSETS[`${uniek[0]}|${uniek[1]}`];
  if (!set) throw new Error(`geen terreinset voor ${uniek.join(' en ')} op (${tx},${ty})`);
  const id = wangId(hoeken.map((h) => (h === set.a ? 1 : 2)));
  const lijst = set.opWangid[id];
  if (!lijst) throw new Error(`geen tegel voor wangid ${id} in ${set.a}/${set.b}`);
  return firstgid.rand + kies(lijst);
}

// afstand (in tegels) van een punt tot een gebroken lijn — dezelfde som als in erf-kaart.cjs en
// erf-scene.cjs.
function totLijn(punten) {
  return (x, y) => {
    let d = 1e9;
    for (let i = 0; i + 1 < punten.length; i++) {
      const [ax, ay] = punten[i];
      const [bx, by] = punten[i + 1];
      const vx = bx - ax;
      const vy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)));
      d = Math.min(d, Math.hypot(x - ax - vx * t, y - ay - vy * t));
    }
    return d;
  };
}

// ==================================================================================================
// 1. HET ERF — dezelfde plaatsing als erf-kaart.cjs, maar met een terreinset-grondlaag in plaats van
//    stempels, en zonder de overgangen naar het dorp en het (nog niet bestaande) bos: die liggen nu
//    gewoon op dezelfde kaart. Alles hieronder werkt in erf-LOKALE tegelcoördinaten (0..B-1, 0..H-1);
//    pas bij het samenvoegen (sectie 4) schuift het geheel naar zijn plek in de wereld.
// ==================================================================================================
function bouwErf() {
  // -------------------------------------------------------------- de maat van de kaart (zie erf-kaart.cjs)
  const BAND = 10; // hoeveel ringen bos er om het erf heen liggen, en over hoeveel ringen het wegdooft
  const MUUR = 6; // op deze diepte vanaf de rand staat het bos gesloten
  const BOSDICHT = { 6: 1, 7: 0.6, 8: 0.4, 9: 0.25 };
  const RUIM = 7; // hoeveel ruimer het erf is dan de open plek uit de plaat (zie erf-kaart.cjs)

  const MIDX = (Es.VELD.x0 + Es.VELD.x1) / 2;
  const MIDY = (Es.VELD.y0 + Es.VELD.y1) / 2;
  const HALFX = (Es.VELD.x1 - Es.VELD.x0) / 2;
  const HALFY = (Es.VELD.y1 - Es.VELD.y0) / 2;
  const ruimer = (gx, gy) => [MIDX + (gx - MIDX) * ((HALFX + RUIM) / HALFX), MIDY + (gy - MIDY) * ((HALFY + RUIM) / HALFY)];

  const X0 = Math.floor(Es.VELD.x0) - RUIM - BAND;
  const X1 = Math.ceil(Es.VELD.x1) + RUIM + BAND;
  const Y0 = Math.floor(Es.VELD.y0) - RUIM - BAND;
  const Y1 = Math.ceil(Es.VELD.y1) + RUIM + BAND;
  const B = X1 - X0 + 1;
  const H = Y1 - Y0 + 1;
  const OX = -X0;
  const OY = -Y0;
  const naarKaart = (wx, wy) => [Math.round(wx) + OX, Math.round(wy) + OY];
  const opKaart = (mx, my) => mx >= 0 && my >= 0 && mx < B && my < H;
  const randDiepte = (mx, my) => Math.min(mx, my, B - 1 - mx, H - 1 - my);

  // -------------------------------------------------------------- het pad naar het dorp
  //
  // Alleen PAD_DORP: dat is de weg die straks de wereld in loopt (naar het dorp). PAD_BOS (het
  // paadje achter de toren, dat vroeger naar de toetskaart "proefbos" liep) laten we dicht: die
  // overgang bestaat niet meer, en een pad naar nergens is verwarrender dan gewoon bos.
  function doorgetrokken(punten) {
    const uit = punten.map(([x, y]) => ruimer(x, y));
    const [ax, ay] = uit[uit.length - 2];
    const [bx, by] = uit[uit.length - 1];
    const lang = Math.hypot(bx - ax, by - ay) || 1;
    uit.push([bx + ((bx - ax) / lang) * 40, by + ((by - ay) / lang) * 40]);
    return uit;
  }
  const dDorp = totLijn(doorgetrokken(Es.PAD_DORP));
  const opPad = (wx, wy) => dDorp(wx, wy) < 0.62;
  const bijPad = (wx, wy) => dDorp(wx, wy) < 1.1;

  // -------------------------------------------------------------- de grondlaag (terreinsets)
  const soortOpErf = (gx, gy) => (opPad(gx - OX, gy - OY) ? 'zandpad' : 'gras');
  const grondLokaal = new Array(B * H).fill(0);
  for (let my = 0; my < H; my++) {
    for (let mx = 0; mx < B; mx++) grondLokaal[my * B + mx] = terreinGid(soortOpErf, mx, my, 41);
  }

  // waar verlaat het pad de kaart aan de westkant? (de kolom mx = 0, de rij waarop opPad daar nog
  // geldt) — dat is het punt waarmee sectie 3 hieronder het pad naar het dorp verbindt.
  let padExitMY = -1;
  for (let my = 0; my < H; my++) {
    if (opPad(0 - OX, my - OY)) {
      padExitMY = my;
      break;
    }
  }
  if (padExitMY < 0) throw new Error('bouwErf: het dorpspad raakt de westrand van het erf niet — erf-scene.cjs se PAD_DORP nagekeken?');

  // -------------------------------------------------------------- de objecten
  const objecten = [];
  const bezet = new Set(); // hier komt niets (meer) te staan
  const dicht = new Set(); // hier sta je vast (zegt niets over lopen, zie erf-kaart.cjs)
  const sleutel = (mx, my) => mx + ',' + my;
  let volgendId = 1;

  function zetTegel(naam, mx, my) {
    const g = gidVan(naam);
    if (!g) {
      console.warn(`  overgeslagen: geen tegel "${naam}" in tegels/ — draai npm run tiled`);
      return false;
    }
    if (!opKaart(mx, my) || bezet.has(sleutel(mx, my))) return false;
    const [vb, vd] = g.tegel.beslaat || [1, 1];
    for (let dy = 0; dy < vd; dy++) {
      for (let dx = 0; dx < vb; dx++) {
        bezet.add(sleutel(mx + dx, my + dy));
        if (g.tegel.vast) dicht.add(sleutel(mx + dx, my + dy));
      }
    }
    objecten.push({
      id: volgendId++, visible: true, rotation: 0, name: naam, gid: g.gid,
      x: mx * 32, y: my * 32, width: g.vel.tegelB, height: g.vel.tegelH, properties: [],
    });
    return true;
  }
  function zetPunt(naam, mx, my, eigenschappen) {
    objecten.push({
      id: volgendId++, visible: true, rotation: 0, name: naam, point: true,
      x: mx * 32, y: my * 32, width: 0, height: 0,
      properties: Object.entries(eigenschappen).map(([name, value]) => ({ name, type: 'string', value })),
    });
  }

  // 1. de toren en wat er op het erf staat (zie erf-kaart.cjs voor de uitleg per stap)
  const torenTegel = velVan.get('toren');
  const TOREN_VOET = (() => {
    if (!torenTegel || !torenTegel.tegel.staat) return [0, 0, 1, 1];
    const [x, y] = torenTegel.tegel.staat.split(',').map(Number);
    const [b, d] = torenTegel.tegel.beslaat || [1, 1];
    return [x, y, b, d];
  })();
  const RUIMTE_OM_TOREN = 1;
  function botst(x, y, b, d) {
    const [tx, ty, tb, td] = TOREN_VOET;
    return x < tx + tb + RUIMTE_OM_TOREN && x + b > tx - RUIMTE_OM_TOREN && y < ty + td + RUIMTE_OM_TOREN && y + d > ty - RUIMTE_OM_TOREN;
  }
  function weggeduwd(x, y, b, d) {
    const mx = TOREN_VOET[0] + (TOREN_VOET[2] - 1) / 2;
    const my = TOREN_VOET[1] + (TOREN_VOET[3] - 1) / 2;
    const cx = x + (b - 1) / 2 - mx;
    const cy = y + (d - 1) / 2 - my;
    const lang = Math.hypot(cx, cy) || 1;
    const vrij = (nx, ny) => {
      for (let dy = 0; dy < d; dy++) {
        for (let dx = 0; dx < b; dx++) {
          const [kx, ky] = naarKaart(nx + dx, ny + dy);
          if (!opKaart(kx, ky) || bezet.has(sleutel(kx, ky))) return false;
        }
      }
      return true;
    };
    for (let t = 0; t < 40; t += 0.5) {
      const nx = Math.round(x + (cx / lang) * t);
      const ny = Math.round(y + (cy / lang) * t);
      if (!botst(nx, ny, b, d) && vrij(nx, ny)) return [nx, ny];
    }
    return [x, y];
  }
  const geplaatstOp = new Map();
  for (const d of [...Es.TOREN_TEGELS, ...Es.ERF_TEGELS]) {
    const v = velVan.get(d.naam);
    if (!v || !v.tegel.staat) {
      console.warn(`  overgeslagen: ${d.naam} staat niet in tegels/ — draai npm run tiled`);
      continue;
    }
    let [wx, wy] = v.tegel.staat.split(',').map(Number);
    const [vb, vd] = v.tegel.beslaat || [1, 1];
    if (d.naam !== 'toren' && botst(wx, wy, vb, vd)) {
      const [nx, ny] = weggeduwd(wx, wy, vb, vd);
      wx = nx;
      wy = ny;
    }
    const [mx, my] = naarKaart(wx, wy);
    if (!zetTegel(d.naam, mx, my)) console.warn(`  ${d.naam} kon niet op (${mx}, ${my})`);
    else geplaatstOp.set(d.naam, [wx, wy, vb, vd]);
  }

  // 1b. de deur van de toren
  function deurTegels() {
    const toren = velVan.get('toren');
    const [tx, ty] = toren.tegel.staat.split(',').map(Number);
    const [tb, td] = toren.tegel.beslaat;
    const mx0 = tx + (tb - 1) / 2;
    const my0 = ty + (td - 1) / 2;
    const lang = Math.hypot(Es.DEURKANT[0], Es.DEURKANT[1]);
    const ux = Es.DEURKANT[0] / lang;
    const uy = Es.DEURKANT[1] / lang;
    const inVoet = (x, y) => x >= tx && x < tx + tb && y >= ty && y < ty + td;
    let deur = null;
    for (let t = 0.5; t < 40 && !deur; t += 0.25) {
      const x = Math.round(mx0 + ux * t);
      const y = Math.round(my0 + uy * t);
      if (!inVoet(x, y)) deur = [x, y];
    }
    if (!deur) deur = [tx, ty + td];
    const stap = Math.abs(uy) >= Math.abs(ux) ? [0, Math.sign(uy) || 1] : [Math.sign(ux) || 1, 0];
    return { deur, komt: [deur[0] + stap[0], deur[1] + stap[1]] };
  }
  const DEUR = deurTegels();
  for (const [dx, dy] of [[0, 0], [0, 1], [-1, 0], [1, 0], [0, 2], [1, 1], [-1, 1], [1, 2], [-1, 2]]) {
    const [mx, my] = naarKaart(DEUR.deur[0] + dx, DEUR.deur[1] + dy);
    if (opKaart(mx, my)) bezet.add(sleutel(mx, my));
  }

  // 2. de bomen en struiken uit dezelfde scène
  for (const [naam, , gx0, gy0] of [...Es.BOMEN, ...Es.KLEIN, ...Es.RAND]) {
    const [gx, gy] = ruimer(gx0, gy0);
    const [mx, my] = naarKaart(gx, gy);
    const v = velVan.get(naam);
    if (!v) continue;
    if (!v.tegel.vast || opPad(mx - OX, my - OY)) continue;
    zetTegel(naam, mx, my);
  }

  // 3. de bosrand: dicht op MUUR, dunner naar het erf toe, open waar het dorpspad de kaart verlaat.
  //
  // In erf-kaart.cjs bleef de MUUR-ring altijd dicht, ook waar het pad hem raakte (`diep !== MUUR
  // && bijPad(...)`): het pad hield daar hoe dan ook op bij een overgang (een teleport naar het
  // dorp of het bos), dus niemand liep er echt doorheen. Hier moet het pad wél echt doorlopen, tot
  // aan de rand van de kaart toe waar het de kloof in gaat — dus laten we het gat ook op MUUR-diepte
  // open, anders staat er alsnog een dichte rij bomen precies waar de wereld had moeten doorlopen.
  const BOSBOMEN = ['den', 'eik', 'berk', 'herfstEik', 'den', 'dodeBoom'];
  const hash = (x, y) => {
    let h = (x * 374761393 + y * 668265263) >>> 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  for (let my = 0; my < H; my++) {
    for (let mx = 0; mx < B; mx++) {
      const diep = randDiepte(mx, my);
      if (diep >= BAND) continue;
      const wx = mx - OX;
      const wy = my - OY;
      if (bijPad(wx, wy)) continue;
      const kans = BOSDICHT[diep] || 0;
      const h = hash(mx, my);
      if (h > kans) continue;
      zetTegel(BOSBOMEN[Math.floor(hash(mx + 7, my + 11) * BOSBOMEN.length)], mx, my);
    }
  }

  // 4. de wolf
  function vrijeTegel(wx, wy) {
    for (let r = 0; r < 6; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const [mx, my] = naarKaart(wx + dx, wy + dy);
          if (opKaart(mx, my) && !bezet.has(sleutel(mx, my)) && randDiepte(mx, my) >= BAND) return [mx, my];
        }
      }
    }
    return naarKaart(wx, wy);
  }
  zetPunt('wolf', ...vrijeTegel(-12, -12), { wezen: 'wolf', straal: '7' });

  // 4b. de oude meester, bij zijn moestuin
  const tuin = geplaatstOp.get('moestuin');
  if (tuin) {
    const [tx, ty, tb, td] = tuin;
    zetPunt('meester', ...vrijeTegel(tx + (tb - 1) / 2, ty + (td - 1) / 2), { wezen: 'meester', straal: '2' });
  } else {
    console.warn('  meester overgeslagen: de moestuin staat niet op de kaart');
  }

  // 5. de deur van de toren: de enige overgang die overblijft
  {
    const [dx, dy] = naarKaart(DEUR.deur[0], DEUR.deur[1]);
    const [kx, ky] = naarKaart(DEUR.komt[0], DEUR.komt[1]);
    zetPunt('deur van de toren', dx, dy, { overgang: 'toren', komt: `${kx},${ky}` });
  }

  return { B, H, grondLokaal, objectenLokaal: objecten, padExitMX: 0, padExitMY };
}

// ==================================================================================================
// 2. HET DORP — Marcels kaarten/oud/dorp.tmj, tegel voor tegel en object voor object overgenomen. De
//    tegelnummers zijn op naam overgezet (niet zomaar gekopieerd): dorp.tmj droeg zijn eigen
//    firstgid's al bij zich, dus het werkt ook als de tegelvellen intussen gegroeid zijn.
// ==================================================================================================
function bouwDorp() {
  if (!fs.existsSync(DORP_BRON_PAD)) {
    throw new Error(`bouwDorp: ${path.relative(WORTEL, DORP_BRON_PAD)} bestaat niet — dorp.tmj moet eerst naar kaarten/oud/ verhuisd zijn`);
  }
  const bron = JSON.parse(fs.readFileSync(DORP_BRON_PAD, 'utf8'));
  const B = bron.width;
  const H = bron.height;
  const opzoekBron = bouwOpzoekerVoorKaart(bron);

  const grondLokaal = new Array(B * H).fill(0);
  for (const laag of bron.layers || []) {
    if (laag.type !== 'tilelayer' || !laag.data) continue;
    const breedte = laag.width || B;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        const gid = laag.data[y * breedte + x];
        if (!gid) continue;
        const t = opzoekBron(gid);
        if (!t) {
          console.warn(`  dorp: onbekende grondtegel (gid ${gid}) op (${x}, ${y}), overgeslagen`);
          continue;
        }
        grondLokaal[y * B + x] = nieuweGid(t.vel, t.naam); // bovenste laag met een tegel wint, net als js/kaart.js
      }
    }
  }

  const objectenLokaal = [];
  for (const laag of bron.layers || []) {
    if (laag.type !== 'objectgroup') continue;
    for (const obj of laag.objects || []) {
      const eig = Object.fromEntries((obj.properties || []).map((p) => [p.name, p.value]));
      // de oude weg terug naar "erf": die kaart bestaat straks niet meer op zichzelf, en erf en
      // dorp liggen nu op dezelfde kaart — deze overgang gaat dus niet mee.
      if (eig.overgang !== undefined) continue;
      if (obj.gid) {
        const t = opzoekBron(obj.gid);
        if (!t) {
          console.warn(`  dorp: onbekend object (gid ${obj.gid}) "${obj.name || obj.id}", overgeslagen`);
          continue;
        }
        objectenLokaal.push({ ...obj, gid: nieuweGid(t.vel, t.naam) });
      } else {
        objectenLokaal.push({ ...obj });
      }
    }
  }
  return { B, H, grondLokaal, objectenLokaal };
}

// ==================================================================================================
// 3. SAMENVOEGEN: het erf, het dorp en de ruimte ertussen op één doek
// ==================================================================================================
const dorp = bouwDorp();
const erf = bouwErf();

// Het dorp krijgt een marge aan zijn noord-, zuid- en westkant: dorp.tmj zelf is strak getekend (de
// gebouwen raken bijna de rand), en zonder marge zou Marcel daar bij het verder tekenen meteen tegen
// de rand van de kaart aanlopen. Dat is de "ruimte om te groeien". Het erf heeft zijn eigen brede
// bosrand al ingebakken (BAND hierboven) en heeft dus geen extra marge nodig: zijn buitenkant is de
// rand van de kaart, precies zoals in het losse erf.tmj van vroeger.
const MARGE = 24;
// Hoeveel gras er tussen het dorp en het erf ligt: straks Marcels bos. Een kleine kloof zou het
// gevoel van reizen wegnemen; te groot is alleen maar meer lege tegels om doorheen te lopen voordat
// er iets staat. 48 tegels (~38 meter) is ruim een dorpsbreedte — genoeg voelbare afstand, en ruim
// genoeg voor Marcel om een bos in te tekenen zonder meteen weer tegen het dorp of het erf te lopen.
const KLOOF = 48;
// Op welke rij (dorp-lokaal) het nieuwe pad het dorp raakt: dezelfde rij als Marcels oude "pad terug
// naar het erf" (tegel (1, 20)) — die rij is over de hele oostrand nog open gras, dus het pad kan er
// zo naar binnen lopen zonder een huis te raken.
const DORP_RIJ = 20;

const DOX = MARGE;
const DOY = MARGE;
// Het erf komt aan de oostkant van de kloof. In de wereld loopt een kaart nooit "om", dus het dorp
// (waarvan de uitgang aan zijn EIGEN westkant lag, zie kaarten.md) komt met zijn open oostkant naar
// de kloof toe te liggen: zijn gebouwen liggen daarmee verder van het erf af dan de rand van zijn
// kaart, niet andersom. Dat is het gevolg van gewoon verschuiven (nooit spiegelen, zie de opdracht):
// Marcels dorp blijft precies zo liggen als hij het getekend heeft.
const EOX = DOX + dorp.B + KLOOF;
// Dezelfde rij: het pad van het erf (dat op zijn eigen westrand naar buiten loopt, op erf-lokale rij
// erf.padExitMY) en de rij bij het dorp komen op dezelfde wereldrij te liggen, zodat het pad
// daartussen een rechte lijn is — "een eenvoudig zandpad".
const EOY = DOY + DORP_RIJ - erf.padExitMY;

const BREEDTE = EOX + erf.B;
const HOOGTE = Math.max(EOY + erf.H, DOY + dorp.H) + MARGE;

const grondLaag = new Array(BREEDTE * HOOGTE).fill(0);
function zetGrond(gx, gy, gid) {
  if (gx >= 0 && gy >= 0 && gx < BREEDTE && gy < HOOGTE) grondLaag[gy * BREEDTE + gx] = gid;
}
for (let y = 0; y < erf.H; y++) {
  for (let x = 0; x < erf.B; x++) {
    const g = erf.grondLokaal[y * erf.B + x];
    if (g) zetGrond(EOX + x, EOY + y, g);
  }
}
for (let y = 0; y < dorp.H; y++) {
  for (let x = 0; x < dorp.B; x++) {
    const g = dorp.grondLokaal[y * dorp.B + x];
    if (g) zetGrond(DOX + x, DOY + y, g);
  }
}

// De kloof: gras, met een recht zandpad erdoorheen van de oostrand van het dorp tot de westrand van
// het erf (beide net buiten de kloof zelf, zodat het pad daar naadloos verdergaat in wat het erf en
// het dorp al zelf hebben klaargelegd).
const RIJ = DOY + DORP_RIJ; // === EOY + erf.padExitMY
const kloofPad = totLijn([[EOX, RIJ], [DOX + dorp.B - 1, RIJ]]);
const soortOpKloof = (gx, gy) => (kloofPad(gx, gy) < 0.62 ? 'zandpad' : 'gras');
const KLOOF_X0 = DOX + dorp.B;
const KLOOF_X1 = EOX - 1;
const KLOOF_Y0 = DOY;
const KLOOF_Y1 = DOY + dorp.H - 1;
for (let y = KLOOF_Y0; y <= KLOOF_Y1; y++) {
  for (let x = KLOOF_X0; x <= KLOOF_X1; x++) zetGrond(x, y, terreinGid(soortOpKloof, x, y, 91));
}

// De objecten: eerst het erf, dan het dorp, allebei verschoven naar hun plek, met verse
// volgnummers. Draagt een object een "komt" (de overgang bij de deur van de toren: de tegel waar
// je landt, als tekst "x,y" — zie T.laadKaart in js/kaart.js), dan is dat een tegel op DEZE kaart
// en moet hij dus in dezelfde beweging mee verschuiven, anders wijst hij na het verschuiven van het
// object zelf ineens naar een tegel ergens anders op de kaart.
function verschoven(o, dx, dy) {
  const properties = (o.properties || []).map((p) => {
    if (p.name !== 'komt' || typeof p.value !== 'string') return p;
    const [kx, ky] = p.value.split(',').map(Number);
    return { ...p, value: `${kx + dx},${ky + dy}` };
  });
  return { ...o, x: o.x + dx * 32, y: o.y + dy * 32, properties };
}
const objecten = [];
let volgendId = 1;
for (const o of erf.objectenLokaal) objecten.push({ ...verschoven(o, EOX, EOY), id: volgendId++ });
for (const o of dorp.objectenLokaal) objecten.push({ ...verschoven(o, DOX, DOY), id: volgendId++ });

// ---------------------------------------------------------------- nakijken vóór we schrijven
//
// Zonder een deur die werkt, is het erf een val (zie erf-kaart.cjs). Nu er nog maar één overgang is
// (de toren), is deze toets simpel: hij moet bestaan, "komt" moet erbij staan, en beide tegels
// moeten begaanbaar zijn.
const fouten = [];
{
  const uitgangen = objecten.filter((o) => (o.properties || []).some((p) => p.name === 'overgang'));
  if (!uitgangen.length) fouten.push('er staat geen enkele overgang op de kaart (de deur van de toren zou er moeten zijn)');
  const vrij = (x, y) => x >= 0 && y >= 0 && x < BREEDTE && y < HOOGTE && !!grondLaag[y * BREEDTE + x];
  for (const o of uitgangen) {
    const eig = Object.fromEntries(o.properties.map((p) => [p.name, p.value]));
    const [ox, oy] = [o.x / 32, o.y / 32];
    if (!eig.komt) fouten.push(`de overgang op (${ox}, ${oy}) heeft geen "komt"`);
    if (!vrij(ox, oy)) fouten.push(`de tegel vóór de deur (${ox}, ${oy}) is niet begaanbaar`);
    if (eig.komt) {
      const [kx, ky] = eig.komt.split(',').map(Number);
      if (!vrij(kx, ky)) fouten.push(`de tegel waar je landt (${kx}, ${ky}) is niet begaanbaar`);
    }
  }
  // de naad tussen het dorp en de kloof, en tussen de kloof en het erf, moet begaanbaar aansluiten
  if (!vrij(KLOOF_X0, RIJ) || !vrij(KLOOF_X0 - 1, RIJ)) fouten.push('het pad sluit niet aan op het dorp');
  if (!vrij(KLOOF_X1, RIJ) || !vrij(KLOOF_X1 + 1, RIJ)) fouten.push('het pad sluit niet aan op het erf');
}

// ---------------------------------------------------------------- de .tmj schrijven

const kaart = {
  type: 'map',
  version: '1.10',
  tiledversion: '1.11.0',
  orientation: 'isometric',
  renderorder: 'right-down',
  width: BREEDTE,
  height: HOOGTE,
  tilewidth: 64,
  tileheight: 32,
  infinite: false,
  nextlayerid: 3,
  nextobjectid: volgendId,
  properties: [
    { name: 'naam', type: 'string', value: 'De wereld' },
    // over hoeveel ringen vanaf de rand van de kaart het bos wegdooft in het donker (js/tekenen.js).
    // Alleen de kant van het erf ligt aan de echte rand van deze kaart (zie hierboven); de rand
    // rond het dorp en de kloof is nog gewoon leeg, dus daar doet dit niets zichtbaars.
    { name: 'doof', type: 'int', value: 10 },
  ],
  tilesets: gebruikt.map((naam) => ({ firstgid: firstgid[naam], source: `../tegels/${naam}.tsx` })),
  layers: [
    { type: 'tilelayer', id: 1, name: 'grond', x: 0, y: 0, width: BREEDTE, height: HOOGTE, visible: true, opacity: 1, data: grondLaag },
    { type: 'objectgroup', id: 2, name: 'objecten', visible: true, opacity: 1, draworder: 'topdown', objects: objecten },
  ],
};

if (require.main === module) {
  const overschrijf = process.argv.includes('--overschrijf');
  if (fs.existsSync(UIT_PAD) && !overschrijf) {
    console.error('kaarten/wereld.tmj bestaat al. Zodra Marcel erin tekent, is dat zijn werk — dit');
    console.error('script overschrijft dat nooit zomaar. Moet hij toch opnieuw (bijvoorbeeld vóórdat');
    console.error('Marcel is begonnen), draai dan: node gereedschap/tiled/maak-wereld.cjs --overschrijf');
    process.exitCode = 1;
  } else {
    if (fouten.length) {
      console.error('wereld.tmj deugt niet:');
      for (const f of fouten) console.error(`  - ${f}`);
      process.exitCode = 1;
    }
    fs.mkdirSync(KAARTEN, { recursive: true });
    fs.writeFileSync(UIT_PAD, JSON.stringify(kaart, null, 1) + '\n');
    console.log(`wereld.tmj klaar: ${BREEDTE}×${HOOGTE} tegels — dorp op (${DOX}, ${DOY}), erf op (${EOX}, ${EOY}), ${objecten.length} objecten`);
    // Meteen bundelen, want zonder kaarten/kaarten.js ziet het spel de kaart niet (fetch mag niet
    // vanaf file://).
    require('../pixelart/naar-kaarten.cjs');
  }
}

// Voor test/wereld.test.cjs: waar het dorpsdeel binnen wereld.tmj precies ligt, zodat de toets dat
// tegen kaarten/oud/dorp.tmj kan leggen zonder deze getallen een tweede keer over te typen. En de
// kaart zoals dit script hem bouwt: de toets hoort het script te controleren, niet kaarten/wereld.tmj
// zelf, want daar tekent Marcel in verder en dan wijkt het dorpsdeel terecht af.
module.exports = {
  DOX, DOY, DORP_B: dorp.B, DORP_H: dorp.H,
  EOX, EOY, ERF_B: erf.B, ERF_H: erf.H,
  BREEDTE, HOOGTE, RIJ,
  kaart,
};
