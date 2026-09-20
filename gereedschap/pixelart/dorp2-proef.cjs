'use strict';
// dorp2-proef.cjs [schaal] [x y b h] : de proef bij de beek, op ware grootte in
// uit/dorp/dorp-proef2.png, en een vergroting (of uitsnede) in uit/dorp/werk/zoom-beek.png.
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const P = require('./dorp2.cjs');

const UITMAP = path.join(__dirname, 'uit', 'dorp');
fs.mkdirSync(path.join(UITMAP, 'werk'), { recursive: true });
const [schaal = '2', ...kader] = process.argv.slice(2);
console.time('beekProef');
const p = P.beekProef();
console.timeEnd('beekProef');
fs.writeFileSync(path.join(UITMAP, 'dorp-proef2.png'), K.png(p, 1));
const z = kader.length === 4 ? p.uitsnede(...kader.map(Number)) : p;
fs.writeFileSync(path.join(UITMAP, 'werk', 'zoom-beek.png'), K.png(z, +schaal, '#0e0a14'));
