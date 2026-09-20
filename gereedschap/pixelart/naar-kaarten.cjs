// Bundelt elke kaarten/*.tmj tot één gewoon scriptbestand, kaarten/kaarten.js, met
// T.KAARTEN = { <naam>: <ingelezen .tmj> }. Nodig omdat index.html los moet blijven te openen
// (zie CLAUDE.md): fetch mag dan niet vanaf file://, dus komt de inhoud van elke kaart ook als
// gewoon <script> binnen (dezelfde truc als beelden/beschrijving.js, zie naar-spel.cjs).
// Verandert niets aan een .tmj zelf: dat blijft de bron die Marcel in Tiled bewerkt. Los van
// npm run tiled, want dit hoeft niet opnieuw als alleen de kunst verandert, en andersom.
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
