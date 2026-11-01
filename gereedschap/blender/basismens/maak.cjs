// De basismens van begin tot eind (Marcel, 28 okt: een 3D-pijplijn voor figuren): het model bouwen, renderen,
// exporteren, de atlas en het contactblad; dan de soldaat (ronde 3: de kleren en de uitrusting op hetzelfde lijf),
// zijn renders, zijn GLB, zijn bladen en zijn controles; en de controles met rapport.json. Elke stap schrijft een log in
// <uit>/logs; stopt een stap, dan stopt alles. Daarna hetzelfde voor elke variant (ronde 4: de gedrongen soldaat), in
// <uit>/<variant> (variant.py), en de maten tegen de speerman (meten.py).
//
//   npm run basismens                       alles, de basismens en elke variant
//   npm run basismens -- soldaat            de basismens vanaf een stap (bouw, render, export, blad, soldaat,
//                                           soldaat-render, soldaat-textuur, soldaat-export, realtime-export,
//                                           realtime-render, soldaat-blad, meten, soldaat-controle, controle)
//   npm run basismens -- gedrongen [stap]   alleen een variant, eventueel vanaf een stap
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const HIER = __dirname;
const WORTEL = path.join(HIER, '..', '..', '..');
const INST = JSON.parse(fs.readFileSync(path.join(HIER, 'instellingen.json'), 'utf8'));
const VARIANTEN = Object.keys(INST.varianten).filter((k) => !k.startsWith('_'));

const stappen = (UIT, variant) => {
  const BLEND = path.join(UIT, 'bron', 'basismens.blend');
  // ronde 10: een variant kan een eigen bouw hebben ('bouw': het .blend en het script dat er een basismens van maakt,
  // zoals de HumGen-man met gereedschap/blender/humgen/naar_basis.py); de stappen erna blijven dezelfde
  // (door elke basis heen: humgen12 staat op humgen11, die op humgen)
  const bouwVan = (naam) => naam && (INST.varianten[naam].bouw || bouwVan(INST.varianten[naam].basis));
  const eigen = variant && bouwVan(variant);
  const bouw = eigen ? ['-b', path.join(WORTEL, eigen.blend), '-P', path.join(WORTEL, eigen.script)] : ['-b', '-P', path.join(HIER, 'bouw.py')];
  const SOLDAAT = path.join(UIT, 'bron', 'soldaat.blend');
  const BRON = (versie) => path.join(UIT, 'bron', `soldaat-${versie}.blend`);
  return [
  ['bouw', INST.blender, bouw],
  ['render', INST.blender, ['-b', BLEND, '-P', path.join(HIER, 'render.py')]],
  ['export', INST.blender, ['-b', BLEND, '-P', path.join(HIER, 'export.py')]],
  ['blad', INST.python, ['-I', path.join(HIER, 'blad.py')]],
  ['soldaat', INST.blender, ['-b', BLEND, '-P', path.join(HIER, 'soldaat.py')]],
  ['soldaat-render', INST.blender, ['-b', SOLDAAT, '-P', path.join(HIER, 'soldaat_render.py')]],
  ['soldaat-textuur', INST.blender, ['-b', SOLDAAT, '-P', path.join(HIER, 'textuur.py')]],
  ['soldaat-export', INST.blender, ['-b', BRON('hoog'), '-P', path.join(HIER, 'export.py'), '--', 'soldaat']],
  ['realtime-export', INST.blender, ['-b', BRON('realtime'), '-P', path.join(HIER, 'export.py'), '--', 'soldaat', 'realtime']],
  ['realtime-render', INST.blender, ['-b', SOLDAAT, '-P', path.join(HIER, 'realtime_render.py')]],
  ['soldaat-blad', INST.python, ['-I', path.join(HIER, 'soldaat_blad.py')]],
  ['meten', INST.python, ['-I', path.join(HIER, 'meten.py')]],
  ['soldaat-controle', INST.blender, ['-b', SOLDAAT, '-P', path.join(HIER, 'soldaat_controle.py')]],
  ['controle', INST.blender, ['-b', BLEND, '-P', path.join(HIER, 'controle.py')]],
  ];
};

function draai(variant, vanaf) {
  const UIT = path.join(WORTEL, INST.uit, variant);
  const STAPPEN = stappen(UIT, variant);
  const begin = STAPPEN.findIndex(([naam]) => naam === vanaf);
  if (begin < 0) throw new Error(`onbekende stap ${vanaf}; kies uit ${STAPPEN.map((s) => s[0]).join(', ')}`);
  fs.mkdirSync(path.join(UIT, 'logs'), { recursive: true });
  if (variant) console.log(`variant ${variant}:`);
  for (const [naam, prog, args] of STAPPEN.slice(begin)) {
    const t = Date.now();
    const env = { ...process.env, BASISMENS_VARIANT: variant };
    const r = spawnSync(prog, args, { cwd: WORTEL, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    fs.writeFileSync(path.join(UIT, 'logs', `${naam}.log`), (r.stdout || '') + (r.stderr || ''));
    console.log(`${naam}: ${r.status === 0 ? 'klaar' : 'FOUT'} in ${Math.round((Date.now() - t) / 1000)} s`);
    if (r.status !== 0 && !naam.endsWith('controle')) {
      console.log((r.stdout || '').split('\n').filter((l) => /Error|Traceback|line \d+/.test(l)).slice(-12).join('\n'));
      process.exit(1);
    }
  }
  const rapport = JSON.parse(fs.readFileSync(path.join(UIT, 'rapport.json'), 'utf8'));
  for (const c of rapport.controles) console.log(`${c.geslaagd ? 'OK  ' : 'FOUT'} ${c.naam}`);
  console.log(`${rapport.geslaagd} geslaagd, ${rapport.gezakt} gezakt; rapport: ${path.relative(WORTEL, path.join(UIT, 'rapport.json'))}`);
  return rapport.gezakt;
}

function main() {
  const args = process.argv.slice(2);
  const variant = args.find((a) => VARIANTEN.includes(a));
  const vanaf = args.find((a) => !VARIANTEN.includes(a)) || 'bouw';
  const welke = variant ? [variant] : args.length ? [''] : ['', ...VARIANTEN];
  let gezakt = 0;
  for (const v of welke) gezakt += draai(v, vanaf);
  process.exit(gezakt ? 1 : 0);
}

main();
