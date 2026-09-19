// Bewegende PNG (APNG) uit een reeks platen: om animaties te bekijken, in de browser en op het
// ontwerpcanvas. Elk beeld vervangt het vorige helemaal (blend "source"), dus doorzichtige
// pixels blijven doorzichtig. Browsers die geen APNG kennen, tonen het eerste beeld.
'use strict';
const zlib = require('zlib');

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

// de beeldregels van één plaat, vergroot, met filterbyte 0 per regel
function regels(plaat, schaal, achtergrond) {
  const src = plaat.rgba(achtergrond);
  const b = plaat.b * schaal;
  const h = plaat.h * schaal;
  const raw = Buffer.alloc((b * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    const rij = y * (b * 4 + 1);
    const sy = Math.floor(y / schaal);
    for (let x = 0; x < b; x++) {
      const s = (sy * plaat.b + Math.floor(x / schaal)) * 4;
      src.copy(raw, rij + 1 + x * 4, s, s + 4);
    }
  }
  return zlib.deflateSync(raw, { level: 9 });
}

// platen: even grote Plaat-objecten (zie kern.cjs). o.fps: beelden per seconde, of o.duur: een
// lijst met de duur van elk beeld in seconden. o.herhaal: 0 = eindeloos.
function apng(platen, o = {}) {
  const schaal = o.schaal || 1;
  const b = platen[0].b * schaal;
  const h = platen[0].h * schaal;
  const delen = [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])];
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(b, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  delen.push(chunk('IHDR', ihdr));
  const actl = Buffer.alloc(8);
  actl.writeUInt32BE(platen.length, 0);
  actl.writeUInt32BE(o.herhaal ?? 0, 4);
  delen.push(chunk('acTL', actl));
  let volg = 0;
  platen.forEach((p, i) => {
    const duur = o.duur ? o.duur[i] : 1 / (o.fps || 8);
    const fctl = Buffer.alloc(26);
    fctl.writeUInt32BE(volg++, 0);
    fctl.writeUInt32BE(b, 4);
    fctl.writeUInt32BE(h, 8);
    fctl.writeUInt32BE(0, 12);
    fctl.writeUInt32BE(0, 16);
    fctl.writeUInt16BE(Math.round(duur * 1000), 20);
    fctl.writeUInt16BE(1000, 22);
    fctl[24] = 1; // na dit beeld het vlak leegmaken
    fctl[25] = 0; // vervangen, niet mengen
    delen.push(chunk('fcTL', fctl));
    const data = regels(p, schaal, o.achtergrond || null);
    if (i === 0) delen.push(chunk('IDAT', data));
    else {
      const nr = Buffer.alloc(4);
      nr.writeUInt32BE(volg++);
      delen.push(chunk('fdAT', Buffer.concat([nr, data])));
    }
  });
  delen.push(chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(delen);
}

module.exports = { apng };
