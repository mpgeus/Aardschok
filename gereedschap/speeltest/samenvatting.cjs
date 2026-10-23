// De tabellen van de speeltest (speeltest.cjs). De getallen komen uit wat speler.js per jaar teruggeeft; wat een jaar niet
// heeft, blijft leeg. De kolonist (werklijst B, 1f) speelt het lege begin, een jaar: voor hem het eerste jaar (loopt er iets
// vast, en het eten en het hout), de twee bazen, het bos en het graanboek (vraag 94, d). Tot 12 okt stonden hier
// ook de tabellen van de spelers braaf, slim, bouwer en sluw (de heer, het dorp, gemiddeld per speler, van gehucht tot dorp).
const NAMEN = { kolonist: 'kolonist' };
const VOLGORDE = Object.keys(NAMEN);

const getal = (x) => (x == null || Number.isNaN(x) ? '' : String(Math.round(x)));
const pct = (x) => (x == null || Number.isNaN(x) ? '' : `${Math.round(x * 100)}%`);
const regel = (cellen) => `| ${cellen.join(' | ')} |`;

exports.maak = function (uitslagen, stand) {
  const lijst = [...uitslagen].sort((a, b) => VOLGORDE.indexOf(a.speler) - VOLGORDE.indexOf(b.speler) || a.zaad - b.zaad);
  const goed = lijst.filter((u) => !u.mislukt);
  const uit = [`# De speeltest`, '', `Gespeeld op ${stand}. Een jaar loopt van 1 lentemaand tot 1 grasmaand van het jaar erna.`, ''];
  const mislukt = lijst.filter((u) => u.mislukt);
  if (mislukt.length) uit.push(...mislukt.map((u) => `- **Mislukt:** ${NAMEN[u.speler] || u.speler}, zaad ${u.zaad}: ${u.mislukt}`), '');
  const fouten = goed.filter((u) => u.fouten.length || (u.luisterFouten || []).length);
  uit.push(fouten.length ? fouten.map((u) => `- **Fouten** bij ${NAMEN[u.speler]}, zaad ${u.zaad}: ${[...u.fouten, ...(u.luisterFouten || [])].slice(0, 3).join(' / ')}`).join('\n') : 'Geen fouten in de console.', '');
  uit.push(...hetEersteJaar(goed.filter((u) => u.eersteJaar)));
  uit.push(...hetVervoer(goed.filter((u) => u.kar)));
  uit.push(...deTweeBazen(goed));
  uit.push(...hetBos(goed));
  uit.push(...hetGraanboek(goed));
  return uit.join('\n') + '\n';
};

// De twee bazen (js/bazen.js, vraag 106): de gunst van de heer en het vertrouwen van het dorp aan het eind en op hun
// laagst, de waarschuwingen, of je weg moest en waarom, en wat de speler op de grillen van de heer antwoordde.
function deTweeBazen(goed) {
  const met = goed.filter((u) => u.eind && u.eind.bazen);
  const uit = ['## De twee bazen', ''];
  if (!met.length) return uit.concat('De spelregel "Twee bazen" stond uit.', '');
  const kop = ['speler', 'zaad', 'gunst (laagst)', 'vertrouwen (laagst)', 'waarschuwingen', 'weg', 'grillen (beantwoord, stil)', 'het laatst'];
  uit.push(regel(kop), regel(kop.map(() => '---')));
  for (const u of met) {
    const b = u.eind.bazen;
    const weg = b.weg ? `${b.weg.reden === 'verjaagd' ? 'weggejaagd' : 'ontslagen'}${b.weg.waarom ? `: ${b.weg.waarom}` : ''}` : 'nee';
    const g = b.grillen ? `${b.grillen.aantal} (${b.grillen.beantwoord}, ${b.grillen.stil})` : '';
    const laatst = [...b.laatst.gunst.map((x) => `heer ${x.n > 0 ? '+' : ''}${x.n} ${x.tekst}`), ...b.laatst.vertrouwen.map((x) => `dorp ${x.n > 0 ? '+' : ''}${x.n} ${x.tekst}`)].join('; ');
    uit.push(regel([NAMEN[u.speler] || u.speler, u.zaad, `${Math.round(b.nu.gunst)} (${Math.round(b.laagst.gunst)})`, `${Math.round(b.nu.vertrouwen)} (${Math.round(b.laagst.vertrouwen)})`, String(b.waarschuwingen), weg, g, laatst]));
  }
  uit.push('');
  return uit;
}

// Het bos (js/bos.js; werklijst vraag 115, stap 4 van vraag 110, e): per jaar hoeveel houthakkers er stonden, hoeveel
// hout ze uit hun bomen haalden, hoeveel bomen er omgingen en waarvoor, hoeveel boompjes er geplant werden, een jonge
// boom werden en een boom, hoeveel dagen een houthakker stilstond zonder boom, en wat er aan het eind van het jaar stond,
// op de kaart en binnen het bereik van de houthakkers (`bos` in speler.js).
function hetBos(goed) {
  const met = goed.filter((u) => (u.bos || []).some(Boolean));
  if (!met.length) return [];
  const uit = ['## Het bos', '', 'Per jaar: hoeveel houthakkers er stonden, hoeveel hout ze uit hun bomen haalden, welke bomen er omgingen (door de houthakker, voor een erf of een werkplaats die gerooid werd, of voor een akker die ontgonnen werd), hoeveel boompjes er geplant werden, een jonge boom werden en een boom, en hoeveel dagen een houthakker stilstond zonder boom (opgeteld over de houthakkers). Wat er staat, is aan het eind van het jaar: op de hele kaart, en binnen tien tegels van een houthakker. Het laatste jaar is de eerste maand, tot 1 grasmaand.', ''];
  const kop = ['speler', 'zaad', 'jaar', 'houthakkers', 'hout gehakt', 'bomen om', 'geplant', 'jong, boom geworden', 'dagen stil', 'op de kaart', 'bij de houthakkers'];
  uit.push(regel(kop), regel(kop.map(() => '---')));
  for (const u of met) {
    u.bos.forEach((b, j) => {
      if (!b) return;
      const om = Object.entries(b.om).map(([wie, n]) => `${n} ${wie}`).join(', ') || '0';
      const e = b.eind || {};
      const bij = e.bij || {};
      uit.push(regel([
        NAMEN[u.speler] || u.speler, u.zaad, String(j + 1), String(b.houthakkers), getal(b.hout), om, String(b.geplant),
        `${b.jong}, ${b.volgroeid}`, String(b.stil),
        `${e.bomen} bomen, ${e.jong} jong, ${e.boompjes} boompjes, ${e.stronken} stronken`, `${bij.bomen} bomen, ${bij.jong} jong, ${bij.boompjes} boompjes`,
      ]));
    });
  }
  uit.push('');
  return uit;
}

// Het eerste jaar van de kolonist (werklijst B, 1f; Marcel, 12 okt: "b1"): zonder fouten is dat niets vastloopt, en het
// eten en het hout meten we. Twee tabellen: wat er vastliep (speler.js, eersteJaar), en het eten en het hout.
function hetEersteJaar(goed) {
  if (!goed.length) return [];
  const uit = ['## Het eerste jaar: loopt er iets vast?', '', 'Wat de kolonist neerzette en op welke dag het af was (het langst dat het werk aan een bouwplaats stilstond, tussen haakjes, als het meer dan een dag was); wat hij wilde maar niet kon (op hoeveel dagen, en vanaf welke); hoeveel dagen hij wachtte tot hij iets kon betalen; op welke dag het kamp leeg was; wie er op 1 wintermaand nog in een tent woonde; wie na een dag nog naar zijn huis onderweg was (het langst, in dagen); en welke werkplaats af was maar niet werkte zonder dat het spel zei waarom (dagen).', ''];
  const kop = ['speler', 'zaad', 'einde', 'af op dag', 'niet gelukt', 'wachtte (dagen)', 'kamp leeg op', 'in een tent', 'onderweg', 'werkt niet', 'soldaten (eerste op dag)'];
  uit.push(regel(kop), regel(kop.map(() => '---')));
  for (const u of goed) {
    const E = u.eersteJaar;
    const af = E.gebouwd.map((g) => `${g.soort} ${g.af}${g.stil > 1 ? ` (${g.stil})` : ''}`);
    // Wat niet lukte, één keer per soort en reden: hij probeert het elke dag opnieuw.
    const niet = [];
    for (const g of (u.gebouwd || []).filter((x) => !x.gelukt)) {
      const n = niet.find((x) => x.soort === g.soort && x.reden === g.reden);
      if (n) n.dagen++;
      else niet.push({ soort: g.soort, reden: g.reden, van: Math.floor(g.dag), dagen: 1 });
    }
    uit.push(regel([
      NAMEN[u.speler] || u.speler, u.zaad, u.eind.tekst, af.join(', ') || 'niets',
      niet.map((n) => `${n.soort}: ${n.reden} (${n.dagen} ${n.dagen === 1 ? 'dag' : 'dagen'}, vanaf ${n.van})`).join('; '),
      Object.entries(E.wacht || {}).map(([soort, w]) => `${soort} ${w.dagen} (${w.op})`).join(', '),
      E.kampLeeg == null ? 'nooit' : String(E.kampLeeg), E.inTent == null ? '' : String(E.inTent),
      E.onderweg.map((o) => `${o.naam} ${o.dagen}`).join(', '), E.werktNiet.map((w) => `${w.soort} ${w.dagen}`).join(', '),
      E.soldaten ? `${E.soldaten.nu}${E.soldaten.eerste != null ? ` (${E.soldaten.eerste})` : ''}` : '',
    ]));
  }
  uit.push('', '## Het eerste jaar: eten en hout', '', 'Het graan en het hout op 1 hooimaand (voor de oogst), 1 herfstmaand (erna), 1 wintermaand en 1 lentemaand van het jaar erna; het laagste graan voor de oogst; de dagen met honger en met kou (de status in de balk); de dagen met 1, 2, 3, 4 en 5 of meer soorten eten (de afwisseling, vraag 154; het werk staat in de werkbank: 60, 75, 90 en vanaf vier 100%); en wie er stierf.', '');
  const kop2 = ['speler', 'zaad', 'mensen', 'doden (kou, honger)', 'graan laagst', 'graan', 'hout', 'dagen honger', 'dagen kou', 'dagen met 1/2/3/4/5+ soorten'];
  uit.push(regel(kop2), regel(kop2.map(() => '---')));
  const reeks = (x) => ['voor de oogst', 'na de oogst', 'de winter', 'de lente'].map((k) => getal(x[k])).join(' → ');
  for (const u of goed) {
    const E = u.eersteJaar;
    const w = u.winter || {};
    uit.push(regel([
      NAMEN[u.speler] || u.speler, u.zaad, `${u.begin.bevolking} → ${u.eind.bevolking}`,
      `${w.doden || 0} (${(w.kou || 0) + (w.beide || 0)}, ${(w.honger || 0) + (w.beide || 0)})`,
      getal(E.graan.laagst), reeks(E.graan), reeks(E.hout), String(E.honger), String(E.kou),
      [1, 2, 3, 4].map((n) => (E.soorten || {})[n] || 0).concat(Object.keys(E.soorten || {}).filter((n) => n >= 5).reduce((t, n) => t + E.soorten[n], 0)).join(' / '),
    ]));
  }
  uit.push('');
  return uit;
}

// Het vervoer (werklijst C, stap 6; de dragers sinds vraag 184): wat elke kar en de dragers samen deden (speler.js,
// meetKar), en de stapels en wat er wachtte (karDag). Hoe lang een waar op een stapel ligt, is wat er gemiddeld op de
// stapels lag gedeeld door wat er per dag werd opgehaald (de wet van Little: wat er ligt is wat erbij komt maal hoe lang
// het blijft).
const SEIZOENEN = ['lente', 'zomer', 'herfst', 'winter'];
function hetVervoer(goed) {
  if (!goed.length) return [];
  const uur = (dagen) => `${Math.round(dagen * 24)} u`;
  const uit = ['## Het vervoer', '', 'Per kar (van een schuur, en vanaf welke dag), en voor de dragers samen (hoeveel er het meest tegelijk waren; bij hen is "bezig" wat een drager gemiddeld bezig was): hoeveel van de werktijd hij bezig was, en waarmee (rijden met lading, rijden leeg, laden en lossen); per seizoen hoeveel hij bezig was (het tweede jaar erachter); hoe lang een rit na de werktijd nog doorliep; de ritten (halen van een stapel, brengen naar een bouwplaats of werkplaats); en wat hij vervoerde, per dag en het meest per waar.', ''];
  const kop = ['speler', 'zaad', 'kar', 'bezig', 'vol / leeg / laden', 'per seizoen', 'overwerk', 'ritten (halen, brengen)', 'per dag', 'vervoerd'];
  uit.push(regel(kop), regel(kop.map(() => '---')));
  for (const u of goed) {
    const K = u.kar;
    K.karren.concat(K.dragers ? [K.dragers] : []).forEach((k, i) => {
      const w = k.werktijd || 1e-9;
      const bezig = k.vol + k.leeg + k.laden;
      const maanden = Object.keys(k.maanden).map(Number);
      const jaren = maanden.length ? Math.floor(Math.max(...maanden) / 12) + 1 : 0;
      const seizoenen = [];
      for (let j = 0; j < jaren; j++) {
        seizoenen.push(SEIZOENEN.map((naam, s) => {
          let werk = 0;
          let b = 0;
          for (let m = j * 12 + s * 3; m < j * 12 + s * 3 + 3; m++) {
            werk += (k.maanden[m] || {}).werktijd || 0;
            b += (k.maanden[m] || {}).bezig || 0;
          }
          return werk > 0 ? pct(b / werk) : '–';
        }).join(' '));
      }
      const dagen = Math.max(1, (k.t || 0) - k.vanaf);
      const waren = Object.entries(k.vervoerd).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([wat, n]) => `${wat} ${getal(n)}`);
      uit.push(regel([
        NAMEN[u.speler] || u.speler, u.zaad, k.mensen ? `dragers (tot ${k.mensen}), dag ${k.vanaf}` : `${i + 1}: ${k.thuis}, dag ${k.vanaf}`, pct(bezig / w),
        `${pct(k.vol / w)} / ${pct(k.leeg / w)} / ${pct(k.laden / w)}`, seizoenen.join(' · '), uur(k.overwerk),
        `${k.halen + k.brengen} (${k.halen}, ${k.brengen})`, getal(somVan(k.vervoerd) / dagen), waren.join(', '),
      ]));
    });
  }
  uit.push('', '### De stapels, en wat er op vervoer wachtte', '', 'Wat er op alle stapels samen lag (gemiddeld en het meest), hoe lang een waar gemiddeld op een stapel lag voor iemand hem haalde (in uren, met de nacht erbij), de grootste stapel per soort gebouw, op hoeveel ochtenden een stapel vol was (dan maakt het gebouw niets), hoeveel dagen een bouwplaats op hout wachtte (bouwplaatsdagen), welke werkplaats iets miste dat gebracht wordt (dagen, en tussen haakjes op hoeveel daarvan de opslag het wel had), en op welke dag het dorp een dorp werd.', '');
  const kop2 = ['speler', 'zaad', 'op de stapels (gem., meest)', 'ligt er', 'grootste stapel', 'vol (ochtenden)', 'bouwplaats wacht', 'werkplaats mist', 'dorp op dag', 'planken'];
  uit.push(regel(kop2), regel(kop2.map(() => '---')));
  for (const u of goed) {
    const K = u.kar;
    const gem = K.opDeStapels.keer ? K.opDeStapels.som / K.opDeStapels.keer : 0;
    const opgehaald = K.karren.concat(K.dragers ? [K.dragers] : []).reduce((n, k) => n + k.opgehaald, 0) / Math.max(1, K.dagen);
    const stapels = Object.entries(K.stapels).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([soort, n]) => `${soort} ${getal(n)}`);
    const vol = Object.entries(K.vol).sort((a, b) => b[1] - a[1]).map(([soort, n]) => `${soort} ${n}`);
    const mist = Object.entries(K.tekort).map(([soort, x]) => `${soort} ${x.wat} ${x.dagen} (${x.metVoorraad})`);
    const P = (u.eersteJaar && u.eersteJaar.planken) || {};
    uit.push(regel([
      NAMEN[u.speler] || u.speler, u.zaad, `${getal(gem)}, ${getal(K.opDeStapels.meest)}`, opgehaald > 0 ? uur(gem / opgehaald) : '',
      stapels.join(', '), vol.join(', '), String(K.bouwWacht), mist.join(', '), K.dorp == null ? 'nog niet' : String(K.dorp),
      ['voor de oogst', 'na de oogst', 'de winter', 'de lente'].map((k) => getal(P[k])).join(' → '),
    ]));
  }
  uit.push('');
  return uit;
}
const somVan = (o) => Object.values(o || {}).reduce((n, x) => n + x, 0);

// Het graanboek (vraag 94, d): per jaar waar het graan bleef (de luisteraar op T.wijzigVoorraad in speler.js; erbij is +,
// eraf is −), en wat dat deed: hoeveel dagen er geen bier of brood was, hoeveel soorten het dorp gemiddeld at, en welk
// deel van de huizen die door kunnen groeien, gemiddeld groeide. Het tweede jaar is alleen de eerste maand, tot 1 grasmaand. Daaronder de druk om eten (vraag 95):
// op hoeveel dagen er honger was, het eten de winter niet haalde, en er geen graan lag boven het zaaigraan, en hoeveel
// jagers er dat jaar kwamen.
function hetGraanboek(goed) {
  const met = goed.filter((u) => (u.graan || []).length);
  if (!met.length) return [];
  const teken = (x) => (x == null || Math.abs(x) < 0.5 ? '' : x > 0 ? `+${Math.round(x)}` : `−${Math.round(-x)}`);
  const samen = (b, ...namen) => namen.reduce((n, k) => n + (b[k] || 0), 0);
  const BEKEND = ['oogst', 'gegeten', 'zaaien', 'heer', 'herberg', 'molen', 'brouwerij', 'gekocht', 'verkocht', 'rovers', 'soldaten'];
  const uit = ['## Het graanboek', '', 'Per jaar waar het graan bleef (erbij +, eraf −), en wat dat deed. Het laatste jaar is de eerste maand, tot 1 grasmaand.', ''];
  const kop = ['speler', 'zaad', 'jaar', 'oogst', 'gegeten', 'zaaien', 'de heer', 'herberg', 'molen', 'brouwerij', 'handel', 'rovers en soldaten', 'anders', 'dagen zonder bier', 'dagen zonder brood', 'soorten eten', 'huizen die groeien'];
  uit.push(regel(kop), regel(kop.map(() => '---')));
  for (const u of met) {
    u.graan.forEach((jaar, j) => {
      const b = jaar || {};
      const g = (u.geluk || [])[j] || {};
      const anders = Object.keys(b).filter((k) => !BEKEND.includes(k)).reduce((n, k) => n + b[k], 0);
      uit.push(regel([
        NAMEN[u.speler] || u.speler, u.zaad, String(j + 1),
        teken(b.oogst), teken(b.gegeten), teken(b.zaaien), teken(b.heer), teken(b.herberg), teken(b.molen), teken(b.brouwerij),
        teken(samen(b, 'gekocht', 'verkocht')), teken(samen(b, 'rovers', 'soldaten')),
        teken(anders),
        g.dagen ? String(g.zonderBier) : '', g.dagen ? String(g.zonderBrood) : '',
        g.dagen && g.soorten != null ? (g.soorten / g.dagen).toFixed(1).replace('.', ',') : '', g.dagen && g.groei != null ? pct(g.groei / g.dagen) : '',
      ]));
    });
  }
  uit.push('');
  uit.push('### De druk om eten', '', 'Per jaar op hoeveel dagen (vraag 95: "er moet altijd druk zijn om voldoende eten").', '');
  const kop2 = ['speler', 'zaad', 'jaar', 'honger', 'het eten haalt de winter niet', 'geen graan boven het zaaigraan', 'jagers erbij'];
  uit.push(regel(kop2), regel(kop2.map(() => '---')));
  for (const u of met) {
    (u.geluk || []).forEach((g, j) => {
      if (!g || g.honger == null) return;
      const jagers = (u.gebouwd || []).filter((x) => x.gelukt && x.soort === 'jager' && Math.floor(x.dag / 360) === j).length;
      uit.push(regel([NAMEN[u.speler] || u.speler, u.zaad, String(j + 1), String(g.honger), String(g.etenWinter), String(g.graanOp), String(jagers)]));
    });
  }
  uit.push('');
  return uit;
}

exports.NAMEN = NAMEN;
