// Bundelt elke kaarten/*.tmj tot één gewoon scriptbestand, kaarten/kaarten.js, met
// T.KAARTEN = { <naam>: <ingelezen .tmj> }. Nodig omdat index.html los moet blijven te openen
// (zie CLAUDE.md): fetch mag dan niet vanaf file://, dus komt de inhoud van elke kaart ook als
// gewoon <script> binnen (dezelfde truc als beelden/beschrijving.js, zie naar-spel.cjs).
// Verandert niets aan een .tmj zelf: dat blijft de bron die Marcel in Tiled bewerkt. Los van
// npm run tiled, want dit hoeft niet opnieuw als alleen de kunst verandert, en andersom.
//
// Toetst daarna ook elke kaart: een tegel in Tiled is een nummer (firstgid + lokaal id), en dat
// nummer klopt alleen zolang tegels/tegels.json er nog bij past. Wijst een nummer naar een lege
// cel of buiten een vel (zie ontwerp/kaarten.md — dat overkwam gebouwen.tsx op 20 sep 2026), dan
// klaagt dit script luid in plaats van dat het spel straks stilletjes het verkeerde plaatje toont.
//
//   node gereedschap/pixelart/naar-kaarten.cjs      (of: npm run kaarten)
'use strict';
const fs = require('fs');
const path = require('path');

const KAARTEN = path.join(__dirname, '..', '..', 'kaarten');
fs.mkdirSync(KAARTEN, { recursive: true });

const kaarten = {};
const betekenis = {};
for (const bestand of fs.readdirSync(KAARTEN)) {
  const lees = (naam, doel) => {
    try {
      doel[naam] = JSON.parse(fs.readFileSync(path.join(KAARTEN, bestand), 'utf8'));
    } catch (e) {
      console.warn(`  overgeslagen: ${bestand} (${e.message})`);
    }
  };
  // Twee bestanden per kaart: de .tmj met de grond die Marcel in Tiled tekent, en het
  // betekenisbestand van gereedschap/wereld.html met de mensen, de deuren, de doorgangen en de
  // aansluitingen. Zie ontwerp/kaarten.md, "Tiled tekent alleen nog de grond".
  if (bestand.endsWith('.betekenis.json')) lees(bestand.replace(/\.betekenis\.json$/, ''), betekenis);
  else if (bestand.endsWith('.tmj')) lees(bestand.replace(/\.tmj$/, ''), kaarten);
}

const alsScript = (waarde) => JSON.stringify(waarde, null, 1).replace(/\n/g, '\n  ');
fs.writeFileSync(
  path.join(KAARTEN, 'kaarten.js'),
  '// Gemaakt door gereedschap/pixelart/naar-kaarten.cjs — niet met de hand bijwerken.\n' +
    '// Elke kaarten/*.tmj en elk kaarten/*.betekenis.json, als gewoon script, zodat file:// ze ook\n' +
    '// kan lezen (zie js/kaart.js).\n' +
    '(function (T) {\n  T.KAARTEN = ' +
    alsScript(kaarten) +
    ';\n  T.BETEKENIS = ' +
    alsScript(betekenis) +
    ';\n})(globalThis.Spel = globalThis.Spel || {});\n',
);

const namen = Object.keys(kaarten);
const metBetekenis = Object.keys(betekenis);
console.log(`kaarten.js klaar: ${namen.length} kaart(en)${namen.length ? ' — ' + namen.join(', ') : ''}`);
console.log(`  betekenis: ${metBetekenis.length ? metBetekenis.map((n) => `${n} (${(betekenis[n].dingen || []).length})`).join(', ') : 'nog geen enkele kaart'}`);

// ---------------------------------------------------------------- de wachter
//
// Dezelfde opzoeking als js/kaart.js se bouwOpzoeker: een gid hoort bij het vel waar hij binnen
// firstgid .. firstgid + aantal_tegels − 1 valt (niet zomaar "de eerste met firstgid <= gid", zie
// de toelichting daar), met tegels/tegels.json zoals dat NU op schijf staat.
const TEGELS_JSON_PAD = path.join(__dirname, '..', '..', 'tegels', 'tegels.json');
let TEGELS = null;
try {
  TEGELS = JSON.parse(fs.readFileSync(TEGELS_JSON_PAD, 'utf8'));
} catch (e) {
  console.warn(`  geen tegels/tegels.json gevonden (${e.message}) — draai eerst npm run tiled; de wachter slaat deze keer over`);
}

function velNaamVan(bron) {
  return String(bron || '').replace(/\\/g, '/').split('/').pop().replace(/\.tsx$/i, '');
}

function bouwOpzoeker(kaart) {
  const sets = (kaart.tilesets || []).map((t) => {
    const naam = velNaamVan(t.source);
    const vel = TEGELS[naam];
    return { naam, firstgid: t.firstgid || 1, aantal: vel ? vel.tiles.length : 0, vel };
  });
  return function (gid) {
    const g = gid & 0x1fffffff; // de bovenste drie bits zijn spiegel/draai-vlaggen (Tiled)
    if (!g) return null;
    for (const s of sets) {
      const lokaal = g - s.firstgid;
      if (s.vel && lokaal >= 0 && lokaal < s.aantal) return { vel: s.naam, id: lokaal, eig: s.vel.tiles[lokaal] };
    }
    return null; // valt buiten elk vel
  };
}

// Vellen met dingen die boven de grond uitsteken. Die horen als object in de laag "objecten"
// (Tegel invoegen), niet gestempeld in een tegellaag: daar tekent Tiled de rijen ervóór eroverheen,
// en zie je van een huis alleen het dak nog boven het gras uitsteken. Marcel liep daar op 21 sep
// 2026 tegenaan; zie "Werken in Tiled" in ontwerp/kaarten.md.
const OBJECTVELLEN = new Set(['bomen', 'begroeiing', 'gebouwen', 'toren', 'erf', 'tuin']);

let totaalFouten = 0;
if (TEGELS) {
  for (const [naam, kaart] of Object.entries(kaarten)) {
    const opzoek = bouwOpzoeker(kaart);
    let fouten = 0;
    let getoetst = 0;
    const klaag = (waar, gid) => {
      console.error(`  FOUT in ${naam}.tmj: ${waar} verwijst naar gid ${gid}, maar dat is geen bestaande tegel (een lege cel, of buiten elk vel) — draai npm run tiled opnieuw en controleer de kaart in Tiled`);
      fouten++;
    };
    for (const laag of kaart.layers || []) {
      if (laag.type === 'tilelayer' && Array.isArray(laag.data)) {
        const breedte = laag.width || kaart.width;
        laag.data.forEach((gid, i) => {
          if (!gid) return;
          getoetst++;
          const t = opzoek(gid);
          const waar = `laag "${laag.name}" tegel (${i % breedte}, ${Math.floor(i / breedte)})`;
          if (!t || !t.eig || !t.eig.naam) klaag(waar, gid);
          else if (OBJECTVELLEN.has(t.vel)) {
            console.error(`  FOUT in ${naam}.tmj: ${waar} is een ${t.eig.naam} uit ${t.vel}.tsx. Die hoort in de laag "objecten", neergezet met Tegel invoegen — in een tegellaag tekent Tiled de grond ervóór eroverheen`);
            fouten++;
          }
        });
      } else if (laag.type === 'objectgroup') {
        // Twee vaste dingen mogen nooit dezelfde tegel beslaan: dan steekt in het spel een dak door
        // een muur, of staat er een boom midden in een huis (Marcel zag het op 22 sep 2026 op een
        // proefplaat). Dezelfde regel als js/kaart.js: de tegel van het object, en bij "beslaat"
        // de tegels rechtsonder daarvandaan.
        const th = kaart.tileheight || 32;
        const bezet = new Map(); // "x,y" → { naam, x, y }
        const gemeld = new Set();
        for (const obj of laag.objects || []) {
          if (!obj.gid) continue;
          getoetst++;
          const t = opzoek(obj.gid);
          if (!t || !t.eig || !t.eig.naam) {
            klaag(`object "${obj.name || obj.id}"`, obj.gid);
            continue;
          }
          if (!t.eig.vast) continue;
          const b = t.eig.beslaat || [1, 1];
          // Alleen gebouwen van meer dan één tegel tegen elkaar. Een los ding binnen een groot object
          // kan juist bedoeld zijn: een boomstronk op het kerkhof, binnen de muurtjes. Het kerkhof
          // is een omheining, geen blok, maar dat onderscheid kent het spel nog niet.
          if (b[0] * b[1] <= 1) continue;
          const gx = Math.round(obj.x / th);
          const gy = Math.round(obj.y / th);
          for (let dy = 0; dy < b[1]; dy++) {
            for (let dx = 0; dx < b[0]; dx++) {
              const sleutel = `${gx + dx},${gy + dy}`;
              const ander = bezet.get(sleutel);
              if (!ander) {
                bezet.set(sleutel, { naam: t.eig.naam, x: gx, y: gy });
                continue;
              }
              const paar = `${ander.x},${ander.y}|${gx},${gy}`;
              if (gemeld.has(paar)) continue;
              gemeld.add(paar);
              console.error(`  FOUT in ${naam}.tmj: ${t.eig.naam} op (${gx}, ${gy}) staat over ${ander.naam} op (${ander.x}, ${ander.y}) heen — twee vaste dingen op dezelfde tegel (${sleutel}); zet er een een stukje verder`);
              fouten++;
            }
          }
        }
      }
    }
    if (fouten) totaalFouten += fouten;
    else console.log(`  ${naam}.tmj: ${getoetst} tegelverwijzing(en), allemaal geldig`);
  }
}
if (totaalFouten) {
  console.error(`kaarten.js: ${totaalFouten} fout(en) in de kaarten — zie hierboven`);
  process.exitCode = 1;
}
