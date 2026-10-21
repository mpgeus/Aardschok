// Eerst een mooi beeld van de AI (werklijst Q, f; ontwerp/beeld.md, "De soldaten van het dorp en de poppetjes met SDXL").
// Marcel, 20 okt, na SDXL over onze render: "Maar, kun je niet met ai een mooi poppetje genereren en dat als basis gebruiken
// voor een schilderbeurt? Want dingen uit code worden gewoon niet zo mooi", en: "Kun je niet de plaat die onze lat is
// gebruiken om sdxl te voeden". Dus: SDXL maakt het ding vrij (denoise 1: niets van onze kleuren of lijnen), van ons model
// gaat alleen de diepte zacht mee (de houding, de hoek van de camera, de maat; zodat het beeld later nog op het model past),
// en zijn plaat (ontwerp/voorbeelden/heerstoet-doel.webp, een uitsnede) gaat als stijl mee via de IP-Adapter. Een paar zaden
// en sterktes naast elkaar; Marcel kiest. Voor de poppetjes (soldatenhd.cjs concept) en de ossenkar (karhd.cjs concept).
//
//   vrijeRonde(R, o)   R: een render met diepte (kern.cjs, zoals soldatenhd.cjs of karhd.cjs render); o: { naam, map,
//                      plaat, titel, positief, negatief, stijl (pad van een stijlplaat, of niets), ipSoort (standaard
//                      'style transfer'; 'linear' neemt ook de inhoud over, voor hetzelfde poppetje in een andere richting),
//                      ipSterktes, zaden, instellingen, lora ({ naam, kracht, woorden }: een LoRA, zoals de pixelart-LoRA
//                      huisstijl.cjs LORA; zijn woorden vooraan de zin), pose (een beeld op de maat van R: het skelet
//                      voor OpenPose, met instellingen.pose), omtrek (true: de buitenlijn van ons silhouet als lijnen,
//                      met instellingen.lijn), checkpoint (een ander checkpoint dan de huisstijl, huisstijl.cjs
//                      CHECKPOINTS), init (een beeld op de maat van R als begin, voor een schilderbeurt met een lagere
//                      denoise; buiten het silhouet grijs, of met initOveral het hele beeld), masker ('silhouet': alleen binnen ons silhouet, vier pixels
//                      ruimer, schilderen; een beeld op de maat van R: alleen waar het wit is; anders het hele doek),
//                      schilder ('ernie': ERNIE-Image-Turbo, afwerking.cjs
//                      werkstroomErnie, zonder ControlNet en IP-Adapter; dus alleen met een eigen begin, de denoise uit
//                      instellingen) }. Schrijft elk beeld in map, en (met o.plaat) een plaat met alles
//                      naast elkaar; geeft de beelden terug ({ beeld, etiket, bestand }).
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('../pixelart/kern.cjs');
const H = require('../pixelart/hdproef.cjs');

// De instellingen van een vrije ronde: denoise 1, geen lijnen, de diepte zacht tot 60% van de stappen.
const VRIJ = { denoise: 1, lijn: 0, diepte: 0.45, cnEind: 0.6, ip: 0, steps: 32, cfg: 6, sampler: 'dpmpp_2m', scheduler: 'karras' };

// Het doek om een render: ruimer dan het silhouet (de AI mag de vorm wat anders maken), op veelvouden van 64; een pixel
// (x, y) van het doek is pixel (x + ox, y + oy) van de render.
function doekVan(R) {
  let x0 = R.b, x1 = 0, y0 = R.h, y1 = 0;
  for (let i = 0; i < R.b * R.h; i++) if (R.ramp[i] >= 0) {
    const x = i % R.b;
    const y = (i - x) / R.b;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const b = Math.ceil((x1 - x0 + 1 + 160) / 64) * 64;
  const h = Math.ceil((y1 - y0 + 1 + 96) / 64) * 64;
  return { b, h, ox: Math.floor((x0 + x1 - b) / 2), oy: Math.floor((y0 + y1 - h) / 2) };
}

async function vrijeRonde(R, o) {
  const AF = require('./afwerking.cjs');
  const A = require('./beeld-ai.cjs');
  const DK = require('./doek.cjs');
  const HU = require('./huisstijl.cjs');
  const E = require('./etiket.cjs');
  const S = require('../pixelart/stijl.cjs');
  const { b, h, ox, oy } = doekVan(R);
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
  const dekt = (X, Y) => X >= 0 && Y >= 0 && X < R.b && Y < R.h && R.ramp[Y * R.b + X] >= 0;
  if (o.init) {
    for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
      const X = x + ox, Y = y + oy;
      if (!(o.initOveral ? X >= 0 && Y >= 0 && X < R.b && Y < R.h : dekt(X, Y))) continue;
      const j = (Y * R.b + X) * 4;
      grijs.rgba.set([o.init.rgba[j], o.init.rgba[j + 1], o.init.rgba[j + 2], 255], (y * b + x) * 4);
    }
  }
  if (o.masker && o.masker.rgba) {
    for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
      const X = x + ox, Y = y + oy;
      const aan = X >= 0 && Y >= 0 && X < R.b && Y < R.h && o.masker.rgba[(Y * R.b + X) * 4] > 127;
      wit.rgba.set(aan ? [255, 255, 255, 255] : [0, 0, 0, 255], (y * b + x) * 4);
    }
  }
  if (o.masker === 'silhouet') {
    for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
      let in4 = false;
      for (let dy = -4; dy <= 4 && !in4; dy++) for (let dx = -4; dx <= 4 && !in4; dx++) in4 = dekt(x + ox + dx, y + oy + dy);
      wit.rgba.set(in4 ? [255, 255, 255, 255] : [0, 0, 0, 255], (y * b + x) * 4);
    }
  }
  const diepte = knip(S.diepteVan(R), [0, 0, 0]);
  fs.mkdirSync(o.map, { recursive: true });
  fs.writeFileSync(path.join(o.map, 'diepte.png'), K.pngVanBeeld(diepte));
  const namen = { positief: o.lora && o.lora.woorden ? `${o.lora.woorden}, ${o.positief}` : o.positief, negatief: o.negatief };
  const extra = {};
  if (o.pose) extra.pose = knip(o.pose, [0, 0, 0]);
  if (o.omtrek) extra.lijnen = knip(omtrekVan(R), [0, 0, 0]);
  for (const [k, r] of Object.entries(extra)) fs.writeFileSync(path.join(o.map, `${k}.png`), K.pngVanBeeld(r));
  if (o.init) fs.writeFileSync(path.join(o.map, 'init.png'), K.pngVanBeeld(grijs));
  for (const [k, r] of Object.entries({ init: grijs, masker: wit, diepte, ...extra })) namen[k] = await A.upload(`aardschok-vrij-${o.naam}-${k}.png`, K.pngVanBeeld(r), 'image/png');
  if (o.stijl) namen.stijl = await A.upload(`aardschok-vrij-stijl-${path.basename(o.stijl)}`, fs.readFileSync(o.stijl), 'image/png');
  const beelden = [];
  for (const ip of o.ipSterktes || [0]) for (const seed of o.zaden) {
    const inst = { ...AF.START, ...(o.instellingen || VRIJ), checkpoint: o.checkpoint || HU.HUISSTIJL.checkpoint, seed, ...(ip ? { ip, ipSoort: o.ipSoort || 'style transfer' } : {}), ...(o.lora ? { lora: o.lora } : {}) };
    const t0 = Date.now();
    const stroom = o.schilder === 'ernie' ? AF.werkstroomErnie(namen, { denoise: inst.denoise, seed }) : AF.werkstroom(namen, inst);
    const png = await DK.maak(b, h).voerUit(stroom);
    const tijd = (Date.now() - t0) / 1000;
    const bestand = ip ? `zaad-${seed}-ip${ip}.png` : `zaad-${seed}.png`;
    fs.writeFileSync(path.join(o.map, bestand), png);
    console.log(`${o.naam} vrij ${bestand}: ${tijd.toFixed(0)} s, doek ${b}×${h}`);
    beelden.push({ beeld: A.leesPng(png), etiket: ip ? `zaad ${seed} · stijl ${String(ip).replace('.', ',')}` : `zaad ${seed}`, bestand });
  }
  const { naam, map, plaat, titel, ...rest } = o;
  fs.writeFileSync(path.join(map, 'instellingen.json'), JSON.stringify({ ...rest, instellingen: o.instellingen || VRIJ, checkpoint: o.checkpoint || HU.HUISSTIJL.checkpoint, doek: [b, h], wanneer: new Date().toISOString() }, null, 1));
  if (!plaat) return beelden;
  const per = b > h ? 2 : 4;
  const rijen = [];
  const vakjes = beelden.map((v) => E.met(H.verklein(v.beeld, 2, 'naast'), v.etiket));
  for (let i = 0; i < vakjes.length; i += per) rijen.push(vakjes.slice(i, i + per));
  const sterktes = (o.ipSterktes || [0]).filter(Boolean);
  E.bewaar(plaat, rijen, titel, `SDXL (FaeTastic) vrij, denoise 1; van ons model alleen de diepte, zacht (0,45, tot 60% van de stappen), voor de houding en de hoek${o.stijl ? `; ${path.basename(o.stijl)} als stijl (IP-Adapter, ${sterktes.map((s) => String(s).replace('.', ',')).join(' en ')})` : ''}. Gehalveerd.`);
  console.log(plaat);
  return beelden;
}

// De buitenlijn van een render: wit waar ons silhouet aan de achtergrond grenst (drie pixels dik), voor een ControlNet met
// lijnen; zonder de lijnen binnenin (die gaven het uiterlijk uit code terug).
function omtrekVan(R) {
  const uit = { b: R.b, h: R.h, rgba: Buffer.alloc(R.b * R.h * 4) };
  const vol = (x, y) => x >= 0 && y >= 0 && x < R.b && y < R.h && R.ramp[y * R.b + x] >= 0;
  for (let y = 0; y < R.h; y++) for (let x = 0; x < R.b; x++) {
    let rand = false;
    if (vol(x, y)) for (let d = -1; d <= 1 && !rand; d++) rand = !vol(x + d, y - 1) || !vol(x + d, y + 1) || !vol(x - 1, y + d) || !vol(x + 1, y + d);
    uit.rgba.set(rand ? [255, 255, 255, 255] : [0, 0, 0, 255], (y * R.b + x) * 4);
  }
  return uit;
}

module.exports = { VRIJ, vrijeRonde, omtrekVan, doekVan };
