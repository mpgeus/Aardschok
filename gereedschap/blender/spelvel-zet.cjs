// De speerman uit het 3D-model in het spel (vraag 190; Marcel, 26 okt: "zet de speerman uit het 3D-model echt in het spel,
// in plaats van die van de generator, met renders op volle kwaliteit"): de vellen van spelvel.py naar beelden/figuren, en
// per houding het bestand, de beelden, de cel en het anker in de beschrijving (speerman3d.json naast de vellen). Wat de
// beschrijving van een houding verder heeft (de snelheid en de stap van het lopen), blijft.
//
//   node gereedschap/blender/spelvel-zet.cjs <map met de vellen en speerman3d.json>
'use strict';
const fs = require('fs');
const path = require('path');
const { zetInBeschrijving } = require('../pixelart/beschrijving-zet.cjs');

const BEELDEN = path.join(__dirname, '..', '..', 'beelden');

function zet(map) {
  const gegevens = JSON.parse(fs.readFileSync(path.join(map, 'speerman3d.json'), 'utf8'));
  const figuren = JSON.parse(fs.readFileSync(path.join(BEELDEN, 'beschrijving.json'), 'utf8')).figuren;
  const houdingen = figuren.speerman.houdingen;
  for (const [houding, g] of Object.entries(gegevens)) {
    fs.copyFileSync(path.join(map, g.bestand), path.join(BEELDEN, 'figuren', g.bestand));
    houdingen[houding] = { ...houdingen[houding], ...g };
    console.log(houding, g.bestand, g.cel, g.anker);
  }
  zetInBeschrijving('figuren', figuren);
}

if (require.main === module) zet(process.argv[2]);
