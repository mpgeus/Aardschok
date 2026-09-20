// De spiraaltrap in drie staten naar uit/, om te bekijken.
//
//   node gereedschap/pixelart/trap-export.cjs
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const Trap = require('./trap.cjs');

const UIT = path.join(__dirname, 'uit');
fs.mkdirSync(UIT, { recursive: true });

const p = Trap.vel();
fs.writeFileSync(path.join(UIT, 'hd-trap.png'), K.png(p, 1));
console.log(`hd-trap.png ${p.b}×${p.h} — rijen: ${Object.keys(Trap.SOORTEN).join(', ')}; kolommen: ${Trap.STATEN.join(', ')}`);
