// De figuren uit TripoSplat in het spel (Marcel, 1 nov: "Ze mogen voor nu erin"): de vellen van keten_splat_vel.sh en
// keten_ridder.sh naar beelden/figuren, en per houding het bestand, de beelden, de cel en het anker in de beschrijving.
// De oude vellen van de speerman blijven staan, zodat hij terug kan.
//
//   node gereedschap/blender/stijl/proef/zet_figuren.cjs
'use strict';
const fs = require('fs');
const path = require('path');
const { zetInBeschrijving } = require('../../../pixelart/beschrijving-zet.cjs');

const WORTEL = path.join(__dirname, '..', '..', '..', '..');
const BEELDEN = path.join(WORTEL, 'beelden');
const SPLAT = path.join(WORTEL, 'gereedschap', 'pixelart', 'uit', 'stijl', 'hunyuan', 'splat');
// De pas telt het spel uit de afgelegde weg: twee stappen per cyclus (js/sprites.js). De voeten van deze figuren staan op
// spelsnelheid te dicht bij elkaar om mee te lopen, en dan trippelen ze; deze stap geeft zo'n twee cycli per seconde. De ridder
// loopt sneller (`ridder` in T.SOLDATEN_INSTELLINGEN).
const STAP = { speerman: 0.6, boogschutter: 0.6, kruisboogschutter: 0.6, piekenier: 0.6, ridder: 0.88 };
const FIGUREN = { speerman: 'speer/spel/vellen', boogschutter: 'boog/spel/vellen', kruisboogschutter: 'kruis/spel/vellen', piekenier: 'piek/spel/vellen', ridder: 'ridder-samen/spel/vellen' };
const HOUDINGEN = { staan: true, lopen: true, aanval: false, geraakt: false, sterven: false };

const figuren = JSON.parse(fs.readFileSync(path.join(BEELDEN, 'beschrijving.json'), 'utf8')).figuren;
const richtingen = figuren.speerman.richtingen;
let bytes = 0;
let pixels = 0;
for (const [fig, map] of Object.entries(FIGUREN)) {
  const houdingen = {};
  for (const [h, herhaal] of Object.entries(HOUDINGEN)) {
    const g = JSON.parse(fs.readFileSync(path.join(SPLAT, map, `${fig}-${h}.json`), 'utf8'));
    const bestand = `${fig}-ts-${h}.png`;
    fs.copyFileSync(path.join(SPLAT, map, g.bestand), path.join(BEELDEN, 'figuren', bestand));
    bytes += fs.statSync(path.join(BEELDEN, 'figuren', bestand)).size;
    pixels += g.cel[0] * g.beelden * g.cel[1] * richtingen.length;
    houdingen[h] = { bestand, beelden: g.beelden, fps: g.fps, herhaal, cel: g.cel, anker: g.anker };
    if (h === 'lopen') {
      houdingen[h].snelheid = 1.5;
      houdingen[h].stap = STAP[fig];
    }
  }
  // De speerman slaat om en om de eerste en de tweede uithaal (js/sprites.js); de tweede moet nog gemaakt worden, en is voorlopig dezelfde.
  if (fig === 'speerman') houdingen.aanval2 = { ...houdingen.aanval };
  figuren[fig] = { naam: fig, cel: houdingen.aanval.cel, anker: houdingen.aanval.anker, snelheid: 1.5, richtingen, houdingen };
  console.log(fig, Object.values(houdingen).map((h) => `${h.cel[0]}x${h.cel[1]}`).join(' '));
}
zetInBeschrijving('figuren', figuren);
console.log(`${(bytes / 1e6).toFixed(1)} MB, ${(pixels / 1e6).toFixed(1)} miljoen pixels`);
