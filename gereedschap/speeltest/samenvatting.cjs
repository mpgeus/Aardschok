// De tabellen van de speeltest (speeltest.cjs): per jaar twee tabellen (de heer; het dorp), en per speler het gemiddelde over zijn zaden. De getallen komen uit wat speler.js per
// jaar teruggeeft; wat een jaar niet heeft, blijft leeg. Daarna, voor alle spelers, van gehucht tot dorp (vraag
// 58): wanneer het een dorp werd, en waarom er op een groeidag geen gezin kwam; en voor wie twee jaar speelt het graanboek
// (vraag 94, d). De kolonist (werklijst B, 1f) speelt het lege begin: voor hem het eerste jaar, in plaats van gehucht tot
// dorp.
const NAMEN = { kolonist: 'kolonist', braaf: 'braaf', slim: 'slim', bouwer: 'bouwer, twee jaar', sluw: 'sluwe bouwer, twee jaar' };
const BASIS = { bouwer: 'bouwer', sluw: 'sluwe bouwer' };
const TELWOORD = ['', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes'];
const RANG = ['', 'eerste', 'tweede', 'derde', 'vierde', 'vijfde', 'zesde', 'zevende'];
const VOLGORDE = Object.keys(NAMEN);
// De twee tabellen en het gemiddelde gaan over één jaar met de heer; de bouwer en de sluwe bouwer spelen er twee, en
// staan in de tabel van gehucht tot dorp en in het graanboek.
const EEN_JAAR = ['braaf', 'slim'];

const getal = (x) => (x == null || Number.isNaN(x) ? '' : String(Math.round(x)));
const pct = (x) => (x == null || Number.isNaN(x) ? '' : `${Math.round(x * 100)}%`);
const regel = (cellen) => `| ${cellen.join(' | ')} |`;

function gemiddelde(lijst, f) {
  const w = lijst.map(f).filter((x) => typeof x === 'number' && !Number.isNaN(x));
  return w.length ? w.reduce((a, b) => a + b, 0) / w.length : null;
}

// Wat een jaar oplevert, in getallen die in de tabellen en het gemiddelde terugkomen.
function maten(u) {
  const na = u.naSintMaarten || {};
  return {
    vroegGraan: u.heer && u.heer.vroeg.graan,
    vroegGoud: u.heer && u.heer.vroeg.goud,
    deel: u.heer && u.heer.deel,
    straf: u.heer ? u.heer.straf : '',
    rijkGraan: na.graan || 0,
    rijkGoud: na.goud || 0,
    mensen: u.eind.bevolking,
    begin: u.begin.bevolking,
    doden: u.winter.doden,
    kou: u.winter.kou + u.winter.beide,
    honger: u.winter.honger + u.winter.beide,
    tevreden: u.eind.tevredenheid,
    houthakker: (u.gebouwd || []).filter((g) => g.soort === 'houthakker' && g.gelukt).map((g) => g.datum.replace(/ 13\d\d$/, '')).join(', '),
    ongezaaid: u.eind.akkertegels ? u.eind.ongezaaid / u.eind.akkertegels : null,
    voorvallen: (u.voorvallen || []).length,
  };
}

const TABELLEN = [
  {
    kop: 'De heer',
    kolommen: [
      ['de heer vroeg', (m) => `${getal(m.vroegGraan)} graan, ${getal(m.vroegGoud)} goud`],
      ['gegeven', (m) => pct(m.deel)],
      ['straf', (m) => m.straf],
    ],
  },
  {
    kop: 'Het dorp',
    kolommen: [
      ['na Sint-Maarten (graan, goud)', (m) => `${getal(m.rijkGraan)}, ${getal(m.rijkGoud)}`],
      ['mensen', (m) => `${m.begin} → ${m.mensen}`],
      ['doden (kou, honger)', (m) => `${m.doden} (${m.kou}, ${m.honger})`],
      ['tevreden', (m) => pct(m.tevreden)],
      ['houthakker', (m) => m.houthakker || 'geen'],
      ['ongezaaid in lentemaand', (m) => pct(m.ongezaaid)],
    ],
  },
];

exports.maak = function (uitslagen, stand) {
  const lijst = [...uitslagen].sort((a, b) => VOLGORDE.indexOf(a.speler) - VOLGORDE.indexOf(b.speler) || a.zaad - b.zaad);
  const goed = lijst.filter((u) => !u.mislukt);
  // Hoeveel jaar de bouwers speelden (--jaren; standaard twee), in hun naam en in de kop.
  const jaren = Math.max(2, ...lijst.map((u) => u.jaren || 1));
  for (const s of Object.keys(BASIS)) NAMEN[s] = `${BASIS[s]}, ${TELWOORD[jaren] || jaren} jaar`;
  const uit = [`# De speeltest`, '', `Gespeeld op ${stand}. Een jaar loopt van 1 lentemaand tot 1 grasmaand van het jaar erna; de bouwer en de sluwe bouwer spelen er ${TELWOORD[jaren] || jaren}, tot 1 grasmaand van het ${RANG[jaren + 1] || `${jaren + 1}e`}.`, ''];
  const mislukt = lijst.filter((u) => u.mislukt);
  if (mislukt.length) uit.push(...mislukt.map((u) => `- **Mislukt:** ${NAMEN[u.speler] || u.speler}, zaad ${u.zaad}: ${u.mislukt}`), '');
  const fouten = goed.filter((u) => u.fouten.length || (u.luisterFouten || []).length);
  uit.push(fouten.length ? fouten.map((u) => `- **Fouten** bij ${NAMEN[u.speler]}, zaad ${u.zaad}: ${[...u.fouten, ...(u.luisterFouten || [])].slice(0, 3).join(' / ')}`).join('\n') : 'Geen fouten in de console.', '');
  const eenJaar = goed.filter((u) => EEN_JAAR.includes(u.speler));
  for (const t of eenJaar.length ? TABELLEN : []) {
    uit.push(`## ${t.kop}`, '', regel(['speler', 'zaad', ...t.kolommen.map((k) => k[0])]), regel(['---', '---', ...t.kolommen.map(() => '---')]));
    for (const u of eenJaar) uit.push(regel([NAMEN[u.speler] || u.speler, u.zaad, ...t.kolommen.map((k) => k[1](maten(u)))]));
    uit.push('');
  }
  if (eenJaar.length) uit.push(...gemiddeldPerSpeler(eenJaar));
  uit.push(...hetEersteJaar(goed.filter((u) => u.eersteJaar)));
  uit.push(...deVoorvallen(goed));
  uit.push(...deTweeBazen(goed));
  uit.push(...hetBos(goed));
  uit.push(...vanGehuchtTotDorp(goed.filter((u) => !u.eersteJaar)));
  uit.push(...hetGraanboek(goed));
  return uit.join('\n') + '\n';
};

function gemiddeldPerSpeler(goed) {
  const uit = ['## Per speler, gemiddeld over de zaden', ''];
  const kop = ['speler', 'jaren', 'de heer vroeg (graan, goud)', 'gegeven', 'na Sint-Maarten (graan, goud)', 'mensen', 'doden', 'tevreden'];
  uit.push(regel(kop), regel(kop.map(() => '---')));
  for (const speler of EEN_JAAR) {
    const j = goed.filter((u) => u.speler === speler).map(maten);
    if (!j.length) continue;
    uit.push(regel([
      NAMEN[speler], j.length,
      `${getal(gemiddelde(j, (m) => m.vroegGraan))}, ${getal(gemiddelde(j, (m) => m.vroegGoud))}`,
      pct(gemiddelde(j, (m) => m.deel)),
      `${getal(gemiddelde(j, (m) => m.rijkGraan))}, ${getal(gemiddelde(j, (m) => m.rijkGoud))}`,
      getal(gemiddelde(j, (m) => m.mensen)),
      getal(gemiddelde(j, (m) => m.doden)),
      pct(gemiddelde(j, (m) => m.tevreden)),
    ]));
  }
  uit.push('');
  return uit;
}

// De voorvallen (js/voorvallen.js, vraag 65): hoeveel er waren, en hoe vaak het spel dan een keuze vraagt. Een jaar is
// een uur op 30×, en het had er al een keer of acht (vraag 65: drie keer de marskramer, de inner, Sint-Maarten, twee
// keer de rovers, het slachten); "Klaar als" vraagt een keuze per één à twee minuten.
const KEUZES_ZONDER = 8;
function deVoorvallen(goed) {
  const uit = ['## De voorvallen', '', `Een jaar is een uur op 30×; met de ${KEUZES_ZONDER} keuzes die een jaar al had, vraagt het spel een keuze per zoveel minuten.`, ''];
  const kop = ['speler', 'zaad', 'voorvallen', 'per jaar', 'een keuze per', 'door de raadsman', 'welke (de eerste tien)'];
  uit.push(regel(kop), regel(kop.map(() => '---')));
  for (const u of goed) {
    const v = u.voorvallen || [];
    const jaren = u.jaren || (u.speler === 'bouwer' ? 2 : 1);
    uit.push(regel([
      NAMEN[u.speler] || u.speler, u.zaad, String(v.length), getal(v.length / jaren),
      `${(60 / (v.length / jaren + KEUZES_ZONDER)).toFixed(1).replace('.', ',')} min`,
      u.raadsman ? `${u.raadsman.door}: ${u.raadsman.over}` : '',
      v.slice(0, 10).map((x) => x.id).join(', '),
    ]));
  }
  uit.push('');
  return uit;
}

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

// Van gehucht tot dorp (vraag 58): op welke dag het een dorp werd en marktrecht kreeg (vraag 90), en op de groeidagen
// hoe vaak er een gezin kwam en waarom niet (T.waaromGeenGezin: een dag kan meer dan één reden hebben). En per jaar wat
// de heer kreeg, en hoeveel dagen welke raad onder het doel stond (js/raad.js).
// Het eerste jaar van de kolonist (werklijst B, 1f; Marcel, 12 okt: "b1"): zonder fouten is dat niets vastloopt, en het
// eten en het hout meten we. Twee tabellen: wat er vastliep (speler.js, eersteJaar), en het eten en het hout.
function hetEersteJaar(goed) {
  if (!goed.length) return [];
  const uit = ['## Het eerste jaar: loopt er iets vast?', '', 'Wat de kolonist neerzette en op welke dag het af was (het langst dat het werk aan een bouwplaats stilstond, tussen haakjes, als het meer dan een dag was); wat hij wilde maar niet kon (op hoeveel dagen, en vanaf welke); hoeveel dagen hij wachtte tot hij iets kon betalen; op welke dag het kamp leeg was; wie er op 1 wintermaand nog in een tent woonde; wie na een dag nog naar zijn huis onderweg was (het langst, in dagen); en welke werkplaats af was maar niet werkte zonder dat het spel zei waarom (dagen).', ''];
  const kop = ['speler', 'zaad', 'einde', 'af op dag', 'niet gelukt', 'wachtte (dagen)', 'kamp leeg op', 'in een tent', 'onderweg', 'werkt niet'];
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
    ]));
  }
  uit.push('', '## Het eerste jaar: eten en hout', '', 'Het graan en het hout op 1 hooimaand (voor de oogst), 1 herfstmaand (erna), 1 wintermaand en 1 lentemaand van het jaar erna; het laagste graan voor de oogst; de dagen met honger en met kou (de status in de balk); en wie er stierf.', '');
  const kop2 = ['speler', 'zaad', 'mensen', 'doden (kou, honger)', 'graan laagst', 'graan', 'hout', 'dagen honger', 'dagen kou'];
  uit.push(regel(kop2), regel(kop2.map(() => '---')));
  const reeks = (x) => ['voor de oogst', 'na de oogst', 'de winter', 'de lente'].map((k) => getal(x[k])).join(' → ');
  for (const u of goed) {
    const E = u.eersteJaar;
    const w = u.winter || {};
    uit.push(regel([
      NAMEN[u.speler] || u.speler, u.zaad, `${u.begin.bevolking} → ${u.eind.bevolking}`,
      `${w.doden || 0} (${(w.kou || 0) + (w.beide || 0)}, ${(w.honger || 0) + (w.beide || 0)})`,
      getal(E.graan.laagst), reeks(E.graan), reeks(E.hout), String(E.honger), String(E.kou),
    ]));
  }
  uit.push('');
  return uit;
}

function vanGehuchtTotDorp(goed) {
  if (!goed.length) return [];
  const uit = ['## Van gehucht tot dorp', '', 'Een groeidag is elke 20ste dag (met Vreemden welkom elke 10de). Een dag zonder gezin kan meer dan één reden hebben.', ''];
  const kop = ['speler', 'zaad', 'een dorp op', 'marktrecht op', 'mensen', 'huizen met alles', 'groeidagen', 'een gezin', 'geen plaats', 'te weinig graan', 'niet tevreden', 'de winter niet gehaald', 'de heer kreeg', 'doden (kou, honger, gesneuveld)', 'gebouwd', 'de raad (dagen)'];
  uit.push(regel(kop), regel(kop.map(() => '---')));
  const kort = (datum) => datum.replace(/ 13(\d\d)$/, " '$1");
  // Hoeveel huizen aan het eind alles hebben wat hun stand wil (js/wensen.js; vraag 87): super gelukkig.
  const alles = (st) => (st ? `${Object.values(st).reduce((n, x) => n + x.alles, 0)} van ${Object.values(st).reduce((n, x) => n + x.huizen, 0)}` : '');
  for (const u of goed) {
    const groei = u.groei || [];
    const telt = (reden) => groei.filter((g) => g.waarom.includes(reden)).length;
    const w = u.winter || {};
    const gebouwd = (u.gebouwd || []).filter((g) => g.gelukt && g.soort !== 'erf').map((g) => `${g.soort} ${kort(g.datum)}`);
    const erven = (u.gebouwd || []).filter((g) => g.gelukt && g.soort === 'erf').length;
    if (erven) gebouwd.push(`${erven} erven`);
    uit.push(regel([
      NAMEN[u.speler] || u.speler, u.zaad,
      u.dorp ? `${kort(u.dorp.datum)} (${u.dorp.mensen} mensen)` : 'nee',
      u.marktrecht ? `${kort(u.marktrecht.datum)} (${u.marktrecht.mensen} mensen)` : 'nee',
      `${u.begin.bevolking} → ${u.eind.bevolking}`,
      alles(u.eind.standen),
      String(groei.length),
      String(groei.filter((g) => !g.waarom.length).length),
      String(telt('plaats')), String(telt('graan')), String(telt('tevreden')), String(telt('winter')),
      (u.eind.jaren || []).map((j) => `${j.jaar}: ${pct(j.deel)}, ${j.straf}`).join('; '),
      `${w.doden || 0} (${(w.kou || 0) + (w.beide || 0)}, ${(w.honger || 0) + (w.beide || 0)}, ${(u.eind.rovers && u.eind.rovers.gesneuveld) || 0})`,
      gebouwd.join(', ') || 'niets',
      Object.entries(u.raad || {}).sort((a, b) => b[1].dagen - a[1].dagen).map(([id, r]) => `${id} ${r.dagen}`).join(', '),
    ]));
  }
  uit.push('');
  return uit;
}

// Het graanboek (vraag 94, d): per jaar waar het graan bleef (de luisteraar op T.wijzigVoorraad in speler.js; erbij is +,
// eraf is −), en wat dat deed: hoeveel dagen er geen bier of brood was, hoeveel huizen gemiddeld alles hadden, en op
// hoeveel dagen allemaal. Het derde jaar is alleen de eerste maand, tot 1 grasmaand. Daaronder de druk om eten (vraag 95):
// op hoeveel dagen er honger was, het eten de winter niet haalde, en er geen graan lag boven het zaaigraan, en hoeveel
// jagers er dat jaar kwamen.
function hetGraanboek(goed) {
  const twee = goed.filter((u) => (u.graan || []).length);
  if (!twee.length) return [];
  const teken = (x) => (x == null || Math.abs(x) < 0.5 ? '' : x > 0 ? `+${Math.round(x)}` : `−${Math.round(-x)}`);
  const samen = (b, ...namen) => namen.reduce((n, k) => n + (b[k] || 0), 0);
  const BEKEND = ['oogst', 'gegeten', 'zaaien', 'heer', 'herberg', 'molen', 'brouwerij', 'gekocht', 'verkocht', 'rovers', 'soldaten', 'voorvallen'];
  const uit = ['## Het graanboek', '', 'Per jaar waar het graan bleef (erbij +, eraf −), en wat dat deed. Het laatste jaar is de eerste maand, tot 1 grasmaand.', ''];
  const kop = ['speler', 'zaad', 'jaar', 'oogst', 'gegeten', 'zaaien', 'de heer', 'herberg', 'molen', 'brouwerij', 'handel', 'rovers, soldaten, voorvallen', 'anders', 'dagen zonder bier', 'dagen zonder brood', 'dagen zonder laken', 'huizen met alles', 'dagen alle huizen alles'];
  uit.push(regel(kop), regel(kop.map(() => '---')));
  for (const u of twee) {
    u.graan.forEach((jaar, j) => {
      const b = jaar || {};
      const g = (u.geluk || [])[j] || {};
      const anders = Object.keys(b).filter((k) => !BEKEND.includes(k)).reduce((n, k) => n + b[k], 0);
      uit.push(regel([
        NAMEN[u.speler] || u.speler, u.zaad, String(j + 1),
        teken(b.oogst), teken(b.gegeten), teken(b.zaaien), teken(b.heer), teken(b.herberg), teken(b.molen), teken(b.brouwerij),
        teken(samen(b, 'gekocht', 'verkocht')), teken(samen(b, 'rovers', 'soldaten', 'voorvallen')),
        teken(anders),
        g.dagen ? String(g.zonderBier) : '', g.dagen ? String(g.zonderBrood) : '', g.dagen && g.zonderLaken != null ? String(g.zonderLaken) : '',
        g.dagen ? pct(g.alles / g.dagen) : '', g.dagen ? `${g.allemaal} van ${g.dagen}` : '',
      ]));
    });
  }
  uit.push('', ...twee.map((u) => `- ${NAMEN[u.speler] || u.speler}, zaad ${u.zaad}: alle huizen hadden alles hooguit ${u.reeks ? u.reeks.langste : 0} dagen achter elkaar.`), '');
  uit.push('### De druk om eten', '', 'Per jaar op hoeveel dagen (vraag 95: "er moet altijd druk zijn om voldoende eten").', '');
  const kop2 = ['speler', 'zaad', 'jaar', 'honger', 'het eten haalt de winter niet', 'geen graan boven het zaaigraan', 'jagers erbij'];
  uit.push(regel(kop2), regel(kop2.map(() => '---')));
  for (const u of twee) {
    (u.geluk || []).forEach((g, j) => {
      if (!g || g.honger == null) return;
      const jagers = (u.gebouwd || []).filter((x) => x.gelukt && x.soort === 'jager' && Math.floor(x.dag / 360) === j).length;
      uit.push(regel([NAMEN[u.speler] || u.speler, u.zaad, String(j + 1), String(g.honger), String(g.etenWinter), String(g.graanOp), String(jagers)]));
    });
  }
  uit.push('');
  return uit;
}

exports.maten = maten;
exports.NAMEN = NAMEN;
exports.BASIS = BASIS;
