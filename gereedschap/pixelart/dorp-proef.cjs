'use strict';
// dorp-proef.cjs [schaal] [x y b h] : het dorpsplein, op ware grootte in uit/dorp/dorp-proef.png,
// en een vergroting (of een vergrote uitsnede) in uit/dorp/werk/zoom-plein.png om te beoordelen.
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const D = require('./dorp.cjs');

const UITMAP = path.join(__dirname, 'uit', 'dorp');
fs.mkdirSync(UITMAP, { recursive: true });
const [schaal = '2', ...kader] = process.argv.slice(2);
console.time('dorpsplein');
const p = D.dorpsplein({ prikbord: require('./dorp2.cjs').prikbord(5) });
console.timeEnd('dorpsplein');
fs.writeFileSync(path.join(UITMAP, 'dorp-proef.png'), K.png(p, 1));
const z = kader.length === 4 ? p.uitsnede(...kader.map(Number)) : p;
fs.mkdirSync(path.join(UITMAP, 'werk'), { recursive: true });
fs.writeFileSync(path.join(UITMAP, 'werk', 'zoom-plein.png'), K.png(z, +schaal, '#0e0a14'));
