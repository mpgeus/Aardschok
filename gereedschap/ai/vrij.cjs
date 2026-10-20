// Eerst een mooi beeld van de AI (werklijst Q, f; ontwerp/beeld.md, "De soldaten van het dorp en de poppetjes met SDXL").
// Marcel, 20 okt, na SDXL over onze render: "Maar, kun je niet met ai een mooi poppetje genereren en dat als basis gebruiken
// voor een schilderbeurt? Want dingen uit code worden gewoon niet zo mooi", en: "Kun je niet de plaat die onze lat is
// gebruiken om sdxl te voeden". Dus: SDXL maakt het ding vrij (denoise 1: niets van onze kleuren of lijnen), van ons model
// gaat alleen de diepte zacht mee (de houding, de hoek van de camera, de maat; zodat het beeld later nog op het model past),
// en zijn plaat (ontwerp/voorbeelden/heerstoet-doel.webp, een uitsnede) gaat als stijl mee via de IP-Adapter. Een paar zaden
// en sterktes naast elkaar; Marcel kiest. Voor de poppetjes (soldatenhd.cjs concept) en de ossenkar (karhd.cjs concept).
//
//   vrijeRonde(R, o)   R: een render met diepte (kern.cjs, zoals soldatenhd.cjs of karhd.cjs render); o: { naam, map,
//                      plaat, titel, positief, negatief, stijl (pad van een stijlplaat, of niets), ipSterktes, zaden,
//                      instellingen }. Schrijft elk beeld in map, en een plaat met alles naast elkaar.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('../pixelart/kern.cjs');
const H = require('../pixelart/hdproef.cjs');

// De instellingen van een vrije ronde: denoise 1, geen lijnen, de diepte zacht tot 60% van de stappen.
const VRIJ = { denoise: 1, lijn: 0, diepte: 0.45, cnEind: 0.6, ip: 0, steps: 32, cfg: 6, sampler: 'dpmpp_2m', scheduler: 'karras' };

async function vrijeRonde(R, o) {
  const AF = require('./afwerking.cjs');
  const A = require('./beeld-ai.cjs');
  const DK = require('./doek.cjs');
  const HU = require('./huisstijl.cjs');
  const E = require('./etiket.cjs');
  const S = require('../pixelart/stijl.cjs');
  let x0 = R.b, x1 = 0, y0 = R.h, y1 = 0;
  for (let i = 0; i < R.b * R.h; i++) if (R.ramp[i] >= 0) {
    const x = i % R.b;
    const y = (i - x) / R.b;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  // ruimer dan het silhouet (de AI mag de vorm wat anders maken), op veelvouden van 64
  const b = Math.ceil((x1 - x0 + 1 + 160) / 64) * 64;
  const h = Math.ceil((y1 - y0 + 1 + 96) / 64) * 64;
  const ox = Math.floor((x0 + x1 - b) / 2);
  const oy = Math.floor((y0 + y1 - h) / 2);
  const knip = (r, leeg) => {
    const uit = { b, h, rgba: Buffer.alloc(b * h * 4) };
    for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
      const X = x + ox, Y = y + oy;
      const i = (y * b + x) * 4;
      if (X < 0 || Y < 0 || X >= R.b || Y >= R.h) uit.rgba.set([...leeg, 255], i);
      else { r.rgba.copy(uit.rgba, i, (Y * R.b + X) * 4, (Y * R.b + X) * 4 + 4); uit.rgba[i + 3] = 255; }
    }
    return uit;
  };
  const grijs = { b, h, rgba: Buffer.alloc(b * h * 4, 170) };
  const wit = { b, h, rgba: Buffer.alloc(b * h * 4, 255) };
  const diepte = knip(S.diepteVan(R), [0, 0, 0]);
  fs.mkdirSync(o.map, { recursive: true });
  fs.writeFileSync(path.join(o.map, 'diepte.png'), K.pngVanBeeld(diepte));
  const namen = { positief: o.positief, negatief: o.negatief };
  for (const [k, r] of Object.entries({ init: grijs, masker: wit, diepte })) namen[k] = await A.upload(`aardschok-vrij-${o.naam}-${k}.png`, K.pngVanBeeld(r), 'image/png');
  if (o.stijl) namen.stijl = await A.upload(`aardschok-vrij-stijl-${path.basename(o.stijl)}`, fs.readFileSync(o.stijl), 'image/png');
  const beelden = [];
  for (const ip of o.ipSterktes || [0]) for (const seed of o.zaden) {
    const inst = { ...AF.START, ...(o.instellingen || VRIJ), checkpoint: HU.HUISSTIJL.checkpoint, seed, ...(ip ? { ip, ipSoort: 'style transfer' } : {}) };
    const t0 = Date.now();
    const png = await DK.maak(b, h).voerUit(AF.werkstroom(namen, inst));
    const tijd = (Date.now() - t0) / 1000;
    const bestand = ip ? `zaad-${seed}-ip${ip}.png` : `zaad-${seed}.png`;
    fs.writeFileSync(path.join(o.map, bestand), png);
    console.log(`${o.naam} vrij ${bestand}: ${tijd.toFixed(0)} s, doek ${b}×${h}`);
    beelden.push(E.met(H.verklein(A.leesPng(png), 2, 'naast'), ip ? `zaad ${seed} · stijl ${String(ip).replace('.', ',')}` : `zaad ${seed}`));
  }
  const { naam, map, plaat, titel, ...rest } = o;
  fs.writeFileSync(path.join(map, 'instellingen.json'), JSON.stringify({ ...rest, instellingen: o.instellingen || VRIJ, checkpoint: HU.HUISSTIJL.checkpoint, doek: [b, h], wanneer: new Date().toISOString() }, null, 1));
  const per = b > h ? 2 : 4;
  const rijen = [];
  for (let i = 0; i < beelden.length; i += per) rijen.push(beelden.slice(i, i + per));
  const sterktes = (o.ipSterktes || [0]).filter(Boolean);
  E.bewaar(plaat, rijen, titel, `SDXL (FaeTastic) vrij, denoise 1; van ons model alleen de diepte, zacht (0,45, tot 60% van de stappen), voor de houding en de hoek${o.stijl ? `; ${path.basename(o.stijl)} als stijl (IP-Adapter, ${sterktes.map((s) => String(s).replace('.', ',')).join(' en ')})` : ''}. Gehalveerd.`);
  console.log(plaat);
}

module.exports = { VRIJ, vrijeRonde };
