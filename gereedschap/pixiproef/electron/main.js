'use strict';
// De renderproef in Electron (meting.cjs): de bladzijde met loadFile (file://), zoals de schil van het spel
// (gereedschap/proefversie/maak.cjs), en per zoom een meting. Drukt één regel af: "UITSLAG {json}".
//   electron.exe gereedschap/pixiproef/electron <pad naar index.html> "weg=pixi&sorteer=pixi"
const { app, BrowserWindow } = require('electron');
const args = process.argv.slice(2);
const doel = args.find((a) => a.endsWith('.html'));
const q = new URLSearchParams(args.find((a) => a.includes('weg=')) || 'weg=huidig');
const query = Object.fromEntries(q);
Object.assign(query, { alleen: '', b: '1920', h: '1080', kaal: '' });
app.whenReady().then(async () => {
  const w = new BrowserWindow({ width: 1920, height: 1080, show: false, useContentSize: true, webPreferences: { backgroundThrottling: false } });
  await w.loadFile(doel, { query });
  const js = (s) => w.webContents.executeJavaScript(s);
  for (let i = 0; i < 300; i++) {
    if (await js('!!(window.Proef && (Proef.klaar || Proef.fout))')) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  const uit = await js(`(async () => {
    const uit = { fout: Proef.fout, kaart: Spel.gl.kaart(), glKapot: Spel.gl.kapot(), zooms: {} };
    if (uit.fout) return uit;
    for (const z of [1, 0.5, 0.35]) uit.zooms[z] = await Proef.meet(240, 60, { zoom: z });
    uit.geheugen = await Proef.geheugen();
    uit.glKapotNa = Spel.gl.kapot();
    return uit;
  })()`).catch((e) => ({ fout: String(e) }));
  console.log('UITSLAG ' + JSON.stringify(uit));
  app.quit();
});
