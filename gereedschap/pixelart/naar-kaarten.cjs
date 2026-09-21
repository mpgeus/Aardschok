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
for (const bestand of fs.readdirSync(KAARTEN)) {
  if (!bestand.endsWith('.tmj')) continue;
  const naam = bestand.replace(/\.tmj$/, '');
  try {
    kaarten[naam] = JSON.parse(fs.readFileSync(path.join(KAARTEN, bestand), 'utf8'));
  } catch (e) {
    console.warn(`  overgeslagen: ${bestand} (${e.message})`);
  }
}

const json = JSON.stringify(kaarten, null, 1);
fs.writeFileSync(
  path.join(KAARTEN, 'kaarten.js'),
  '// Gemaakt door gereedschap/pixelart/naar-kaarten.cjs — niet met de hand bijwerken.\n' +
    '// Elke kaarten/*.tmj, als gewoon script, zodat file:// ze ook kan lezen (zie js/kaart.js).\n' +
    '(function (T) {\n  T.KAARTEN = ' +
    json.replace(/\n/g, '\n  ') +
    ';\n})(globalThis.Toren = globalThis.Toren || {});\n',
);

const namen = Object.keys(kaarten);
console.log(`kaarten.js klaar: ${namen.length} kaart(en)${namen.length ? ' — ' + namen.join(', ') : ''}`);

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
          if (!t || !t.eig || !t.eig.naam) klaag(`laag "${laag.name}" tegel (${i % breedte}, ${Math.floor(i / breedte)})`, gid);
        });
      } else if (laag.type === 'objectgroup') {
        for (const obj of laag.objects || []) {
          if (!obj.gid) continue;
          getoetst++;
          const t = opzoek(obj.gid);
          if (!t || !t.eig || !t.eig.naam) klaag(`object "${obj.name || obj.id}"`, obj.gid);
        }
      }
    }
    if (fouten) totaalFouten += fouten;
    else console.log(`  ${naam}.tmj: ${getoetst} tegelverwijzing(en), allemaal geldig`);
  }
}
if (totaalFouten) {
  console.error(`kaarten.js: ${totaalFouten} ongeldige tegelverwijzing(en) — zie hierboven`);
  process.exitCode = 1;
}
