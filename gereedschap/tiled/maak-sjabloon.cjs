// Maakt gereedschap/tiled/nieuwe-kaart.tmj: een lege kaart waarin alles al goed staat, zodat je in
// Tiled meteen kunt tekenen in plaats van eerst te zoeken naar oriëntatie, tegelmaat, laagnamen en
// tegelvellen. Open hem in Tiled en sla hem op als kaarten/<naam>.tmj (Bestand > Opslaan als);
// Tiled past de verwijzingen naar tegels/ dan zelf aan. Zie ontwerp/kaarten.md, "Werken in Tiled".
//
//   node gereedschap/tiled/maak-sjabloon.cjs
//
// De beginnummers van de vellen volgen uit hun vaste capaciteit (ontwerp/kaarten.md, "Een
// tegelnummer verandert nooit"), dus ze worden uit de .tsx gelezen en niet overgetypt.
'use strict';
const fs = require('fs');
const path = require('path');

const WORTEL = path.join(__dirname, '..', '..');
const BREED = 48;
const HOOG = 40;

// rand.tsx eerst: daar zitten het vlakke gras en de terreinsets waarmee je paden, pleinen en
// water schildert. grond.tsx hoort er niet bij: Tiled kent die stempels niet als terrein, en dan
// kloppen de randen niet (zie de randtegels in ontwerp/kaarten.md).
const VELLEN = ['rand', 'bomen', 'begroeiing', 'gebouwen', 'toren', 'erf'];

function tegelAantal(vel) {
  const tsx = fs.readFileSync(path.join(WORTEL, 'tegels', vel + '.tsx'), 'utf8');
  const m = tsx.match(/tilecount="(\d+)"/);
  if (!m) throw new Error(`Geen tilecount in tegels/${vel}.tsx`);
  return Number(m[1]);
}

let volgende = 1;
const tilesets = VELLEN.map((vel) => {
  const ts = { firstgid: volgende, source: `../../tegels/${vel}.tsx` };
  volgende += tegelAantal(vel);
  return ts;
});

// De acht vlakke grastegels van rand.tsx (plaats 0 tot 7). Door elkaar, met een vaste hash, zodat
// het veld er meteen natuurlijk uitziet en de kaart bij elke run hetzelfde wordt.
const grasBegin = tilesets[0].firstgid;
const hash = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;
const grond = [];
for (let y = 0; y < HOOG; y++) for (let x = 0; x < BREED; x++) grond.push(grasBegin + (hash(x, y) % 8));

// Eén voorbeeld van een overgang, zodat te zien is hoe dat gaat: links in het midden terug naar
// het erf. `komt` is de tegel in déze kaart waar je landt als je van het erf hierheen komt: één
// stap van de uitgang af, anders stap je meteen weer terug (js/gebied.js).
const UIT = { x: 1, y: Math.floor(HOOG / 2) };
const objecten = [
  {
    id: 1, name: 'pad terug naar het erf', type: '', point: true,
    x: UIT.x * 32, y: UIT.y * 32, width: 0, height: 0, rotation: 0, visible: true,
    properties: [
      { name: 'overgang', type: 'string', value: 'erf' },
      { name: 'komt', type: 'string', value: `${UIT.x + 1},${UIT.y}` },
    ],
  },
];

const kaart = {
  compressionlevel: -1,
  height: HOOG, width: BREED,
  infinite: false,
  layers: [
    { id: 1, name: 'grond', type: 'tilelayer', x: 0, y: 0, width: BREED, height: HOOG, opacity: 1, visible: true, data: grond },
    { id: 2, name: 'objecten', type: 'objectgroup', draworder: 'topdown', x: 0, y: 0, opacity: 1, visible: true, objects: objecten },
  ],
  nextlayerid: 3,
  nextobjectid: objecten.length + 1,
  orientation: 'isometric',
  renderorder: 'right-down',
  tiledversion: '1.11.0',
  tileheight: 32, tilewidth: 64,
  tilesets,
  type: 'map',
  version: '1.10',
};

const uit = path.join(__dirname, 'nieuwe-kaart.tmj');
fs.writeFileSync(uit, JSON.stringify(kaart, null, 1) + '\n');
console.log(`${path.relative(WORTEL, uit)}: ${BREED}×${HOOG} tegels, vellen ${VELLEN.join(', ')}`);
