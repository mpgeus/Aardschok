// De stijlpijplijn in één opdracht (vraag 192): van niets tot vellen en controles, zonder handwerk.
//
//   npm run stijl                 bouwen, controleren, renderen, vellen, controleren, close-ups, GLB
//   npm run stijl -- <stap> ...   alleen deze stappen: bouw controle render vel detail glb
//
// De uitvoer staat in gereedschap/pixelart/uit/stijl/ (niet in git: hij komt er met deze opdracht weer). Blender 5.2 en de Python van
// ComfyUI (voor PIL) moeten er zijn; ontwerp/gereedschap.md.
'use strict';
const { spawnSync } = require('child_process');
const path = require('path');

const BLENDER = process.env.BLENDER || 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe';
const PYTHON = process.env.PYTHON_PIL || 'C:/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe';
const HIER = __dirname;
const UIT = path.join(HIER, '..', '..', 'pixelart', 'uit', 'stijl');
const BRON = path.join(UIT, 'bron', 'speerman.blend');
const RICHTINGEN = 'Z,ZW,W,NW,N,NO,O,ZO';
// staan: 4 beelden is genoeg voor ademen; lopen: 12 (docs/art/kwaliteitsrapport.md, de vergelijking van 8, 12 en 24)
const HOUDINGEN = [
  { naam: 'staan', beelden: 4, fps: 3 },
  { naam: 'lopen', beelden: 12, fps: 15 },
];

function draai(programma, args) {
  const r = spawnSync(programma, args, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', maxBuffer: 1 << 28 });
  const regels = (r.stdout || '').split('\n').filter((l) => /KLAAR|CONTROLE|FOUT|cel |Traceback|Error:/.test(l));
  for (const l of regels) console.log('  ' + l.trim());
  if (r.status !== 0) {
    console.error((r.stderr || '').slice(-2000));
    throw new Error(`${path.basename(programma)} ${args.slice(-3).join(' ')} eindigde met code ${r.status}`);
  }
}

const blender = (script, args, blend) => draai(BLENDER, [
  ...(blend ? ['-b', blend] : ['-b', '--factory-startup']), '-P', path.join(HIER, script), '--', ...args,
]);

const STAPPEN = {
  bouw() { blender('figuur.py', [BRON]); },
  controle() { blender('controle_model.py', [path.join(UIT, 'controle-model.json')], BRON); },
  render() {
    for (const h of HOUDINGEN) {
      blender('render.py', [path.join(UIT, 'renders', h.naam), h.naam, `beelden=${h.beelden}`, `richtingen=${RICHTINGEN}`, 'monsters=64', 'speerkijkt'], BRON);
    }
  },
  vel() {
    for (const h of HOUDINGEN) {
      draai(PYTHON, [path.join(HIER, 'vel.py'), path.join(UIT, 'renders', h.naam), path.join(UIT, 'vellen'), 'speerman', h.naam, String(h.beelden), `fps=${h.fps}`]);
    }
    draai(PYTHON, [path.join(HIER, 'controle_vel.py'), path.join(UIT, 'vellen'), path.join(UIT, 'controle-vel.json'), 'speerman', ...HOUDINGEN.map((h) => h.naam)]);
  },
  detail() { blender('detail.py', [path.join(UIT, 'detail')], BRON); },
  glb() { blender('export.py', [path.join(UIT, 'export')], BRON); },
};

const gekozen = process.argv.slice(2);
for (const stap of gekozen.length ? gekozen : Object.keys(STAPPEN)) {
  if (!STAPPEN[stap]) throw new Error(`Onbekende stap: ${stap}`);
  const t0 = Date.now();
  console.log(stap);
  STAPPEN[stap]();
  console.log(`  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
