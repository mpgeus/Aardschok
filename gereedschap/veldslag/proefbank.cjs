// De proefbank van de veldslag (vraag 187 en 188, stap 3a3; ontwerp/scenario.md, 7: "Een proefbank voor het vechten").
// Twee veldheren (js/veldheer.js) vechten zonder scherm tegen elkaar, met vaste zaden, op het spel zoals het draait (de
// laadlijst van de toetsen, test/laad.cjs). Per slag: wie won, na hoeveel seconden, wanneer het eerste gevecht begon, wie
// er per soort nog staat, en wat een tik kost. Zo zie je na het verzetten van een getal (een prijs, een wapen, de
// veldheer) wat het met een slag doet, zonder te spelen.
//
//   npm run veldslag                                  vijf slagen op The Ford (zaad 1 tot 5), elk leger acht speermannen
//                                                     en vier boogschutters, tien minuten
//   npm run veldslag -- --zaden 1-20                  andere zaden (of --zaad 7)
//   npm run veldslag -- --kaart ford                  een andere kaart (T.KAARTEN, levels/kaarten.js)
//   npm run veldslag -- --a speerman=8,boogschutter=4 --b zwaardvechter=6,kruisboogschutter=4
//                                                     de legers: leger A heeft de eerste strook, B de tweede
//   npm run veldslag -- --minuten 5                   de tijd (0: geen tijd; dan stopt hij na een uur)
//   npm run veldslag -- --punten 40                   elke veldheer koopt zelf voor zoveel punten (T.veldheerKoopt: een van
//                                                     de drie mixen uit het zaad), tenzij --a of --b zegt wat
//   npm run veldslag -- --getal GEVECHT_INSTELLINGEN.zicht=10
//                                                     een getal uit de werkbank, zo vaak als je wilt
//
// De tik meet hier in Node; het tekenen en Firefox meet het spel zelf (CLAUDE.md, performance; code.md bij js/gl.js).
const path = require('node:path');

const WORTEL = path.join(__dirname, '..', '..');

function lees(argv) {
  const o = { zaden: [1, 2, 3, 4, 5], kaart: 'ford', a: { speerman: 8, boogschutter: 4 }, b: { speerman: 8, boogschutter: 4 }, minuten: 10, getallen: {} };
  const leger = (s) =>
    Object.fromEntries(
      String(s || '')
        .split(',')
        .filter(Boolean)
        .map((d) => {
          const [soort, n] = d.split('=');
          return [soort, Number(n)];
        }),
    );
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--zaad') o.zaden = [Number(argv[++i])];
    else if (a === '--zaden') {
      const [van, tot] = String(argv[++i]).split('-').map(Number);
      o.zaden = [];
      for (let z = van; z <= (tot || van); z++) o.zaden.push(z);
    } else if (a === '--kaart') o.kaart = argv[++i];
    else if (a === '--a') o.a = o.aGezet = leger(argv[++i]);
    else if (a === '--b') o.b = o.bGezet = leger(argv[++i]);
    else if (a === '--minuten') o.minuten = Number(argv[++i]);
    else if (a === '--punten') o.punten = Number(argv[++i]);
    else if (a === '--getal') {
      const [naam, waarde] = String(argv[++i] || '').split('=');
      if (!naam || waarde == null || waarde === '') {
        console.error('--getal wil naam=waarde, zoals --getal GEVECHT_INSTELLINGEN.zicht=10.');
        process.exit(1);
      }
      o.getallen[naam] = Number(waarde);
    } else {
      console.error(`Onbekend: ${a}. Wel: --zaad n, --zaden van-tot, --kaart naam, --a soort=n,..., --b soort=n,..., --minuten n, --punten n, --getal pad=waarde.`);
      process.exit(1);
    }
  }
  return o;
}

// Wie er van een leger nog staat, per soort ("6 speerman, 4 boogschutter, held").
function overVan(T, D) {
  const tel = {};
  for (const e of T.legerVan(D)) {
    const s = T.soortVanMan(D, e);
    tel[s] = (tel[s] || 0) + 1;
  }
  return Object.entries(tel).map(([s, n]) => (s === 'held' ? 'held' : `${n} ${s}`)).join(', ') || 'niemand';
}

// Eén slag: tot het eind (de triggers van het level), of na een uur als er geen tijd is.
function slag(T, o, zaad) {
  // met --punten koopt elke veldheer zelf, behalve wie --a of --b zijn leger gaf
  const koopt = (soorten, gezet) => (o.punten && !gezet ? { veldheer: true } : { soorten, veldheer: true });
  const legers = [koopt(o.a, o.aGezet), koopt(o.b, o.bGezet)];
  const S = T.proefdorp.begin(T.proefdorp.zaad, T.veldslagLevel({ kaart: o.kaart, zaad, punten: o.punten || null, legers, minuten: o.minuten || null }));
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen' }, T.schermVelden());
  S.kalender.snelheid = 1;
  const [A, B] = S.dorpen;
  let tikken = 0;
  let duur = 0;
  let hoogst = 0;
  let eerste = null;
  while (!A.einde && S.wereldTijd < 3600) {
    const t0 = process.hrtime.bigint();
    T.wereldTik(S);
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    tikken++;
    duur += ms;
    hoogst = Math.max(hoogst, ms);
    if (eerste == null && T.erWordtGevochten(S)) eerste = S.wereldTijd;
  }
  const wij = T.legerVan(A).length;
  const zij = T.legerVan(B).length;
  return {
    zaad,
    winnaar: !A.einde ? '?' : wij > zij ? 'A' : zij > wij ? 'B' : '=',
    seconden: Math.round(S.wereldTijd),
    eerste: eerste == null ? '-' : Math.round(eerste),
    A: (A.veldheer.mix ? `${A.veldheer.mix}: ` : '') + overVan(T, A),
    B: (B.veldheer.mix ? `${B.veldheer.mix}: ` : '') + overVan(T, B),
    tik: duur / tikken,
    hoogst,
  };
}

function main() {
  const o = lees(process.argv.slice(2));
  const T = require(path.join(WORTEL, 'test', 'laad.cjs')).spel();
  T.ui = new Proxy({}, { get: () => () => undefined }); // geen scherm
  for (const [pad, waarde] of Object.entries(o.getallen)) {
    if (typeof T.leesPad(pad) !== 'number' || !T.zetPad(pad, waarde)) {
      console.error(`Geen getal in de werkbank: ${pad}.`);
      process.exit(1);
    }
  }
  const tekst = (s) => Object.entries(s).map(([k, n]) => `${n} ${k}`).join(', ');
  const wie = (s, gezet) => (o.punten && !gezet ? `zelf gekocht voor ${o.punten}` : tekst(s));
  console.log(`De veldslag op ${o.kaart}: A (${wie(o.a, o.aGezet)}) tegen B (${wie(o.b, o.bGezet)}), ${o.minuten ? `${o.minuten} minuten` : 'geen tijd'}.`);
  for (const [pad, waarde] of Object.entries(o.getallen)) console.log(`  ${pad} = ${waarde}`);
  console.log('');
  console.log('zaad  wint  sec  gevecht  A over                                              B over                                              ms/tik (hoogst)');
  const uit = [];
  for (const zaad of o.zaden) {
    const r = slag(T, o, zaad);
    uit.push(r);
    console.log(
      `${String(r.zaad).padEnd(6)}${r.winnaar.padEnd(6)}${String(r.seconden).padEnd(5)}${String(r.eerste).padEnd(9)}${r.A.padEnd(52)}${r.B.padEnd(52)}${r.tik.toFixed(2)} (${r.hoogst.toFixed(1)})`,
    );
  }
  const tel = (w) => uit.filter((r) => r.winnaar === w).length;
  const gem = uit.reduce((s, r) => s + r.seconden, 0) / uit.length;
  const tik = uit.reduce((s, r) => s + r.tik, 0) / uit.length;
  console.log('');
  console.log(`A wint ${tel('A')}, B wint ${tel('B')}, gelijk ${tel('=')}${tel('?') ? `, zonder eind ${tel('?')}` : ''}; een slag duurt gemiddeld ${Math.round(gem)} seconden, een tik ${tik.toFixed(2)} ms.`);
}

main();
