// Zet één ingang in beelden/beschrijving.json en .js, zoals naar-spel.cjs dat bij --alleen doet (zelfde opmaak), voor een vel
// dat een eigen script maakt (wijnrank.cjs --spel, graan-vel.cjs --spel) zonder dat heel naar-spel.cjs opnieuw hoeft te
// draaien. Leest en schrijft in één adem, zodat een ander die tegelijk een ingang zet er niet tussen komt.
'use strict';
const fs = require('fs');
const path = require('path');

const BEELDEN = path.join(__dirname, '..', '..', 'beelden');

function zetInBeschrijving(naam, waarde) {
  const bestand = path.join(BEELDEN, 'beschrijving.json');
  const beschrijving = JSON.parse(fs.readFileSync(bestand, 'utf8'));
  beschrijving[naam] = waarde;
  const json = JSON.stringify(beschrijving, null, 1);
  fs.writeFileSync(bestand, json + '\n');
  fs.writeFileSync(
    path.join(BEELDEN, 'beschrijving.js'),
    '// Gemaakt door gereedschap/pixelart/naar-spel.cjs — niet met de hand bijwerken.\n' +
      '// Dezelfde inhoud als beschrijving.json, als script, zodat file:// het ook kan lezen.\n' +
      '(function (T) {\n  T.BEELDEN = ' +
      json.replace(/\n/g, '\n  ') +
      ';\n})(globalThis.Spel = globalThis.Spel || {});\n',
  );
}

module.exports = { zetInBeschrijving };
