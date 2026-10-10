// De tabellen van de speeltest (speeltest.cjs): per jaar drie tabellen (de inner en de heer; verstoppen en de
// soldaten; het dorp), en per speler het gemiddelde over zijn zaden. De getallen komen uit wat speler.js per
// jaar teruggeeft; wat een jaar niet heeft, blijft leeg. Daarna, voor alle spelers, van gehucht tot dorp (vraag
// 58): wanneer het een dorp werd, en waarom er op een groeidag geen gezin kwam; en voor wie twee jaar speelt het graanboek
// (vraag 94, d).
const NAMEN = { braaf: 'braaf', lui30: 'lui, 30% weg', lui60: 'lui, 60% weg', slim: 'slim, 60% weg', bouwer: 'bouwer, twee jaar', sluw: 'sluwe bouwer, twee jaar' };
const BASIS = { bouwer: 'bouwer', sluw: 'sluwe bouwer' };
const TELWOORD = ['', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes'];
const RANG = ['', 'eerste', 'tweede', 'derde', 'vierde', 'vijfde', 'zesde', 'zevende'];
const VOLGORDE = Object.keys(NAMEN);
// De drie tabellen en het gemiddelde gaan over één jaar met de heer en het verstoppen; de bouwer en de sluwe bouwer spelen
// er twee, en staan in de tabel van gehucht tot dorp en in het graanboek.
const EEN_JAAR = ['braaf', 'lui30', 'lui60', 'slim'];

const getal = (x) => (x == null || Number.isNaN(x) ? '' : String(Math.round(x)));
const pct = (x) => (x == null || Number.isNaN(x) ? '' : `${Math.round(x * 100)}%`);
const regel = (cellen) => `| ${cellen.join(' | ')} |`;
const som = (lijst, f) => lijst.reduce((a, x) => a + (f(x) || 0), 0);

function gemiddelde(lijst, f) {
  const w = lijst.map(f).filter((x) => typeof x === 'number' && !Number.isNaN(x));
  return w.length ? w.reduce((a, b) => a + b, 0) / w.length : null;
}

// Wat een jaar oplevert, in getallen die in de tabellen en het gemiddelde terugkomen.
function maten(u) {
  const r = u.inner.rapport || {};
  const gevonden = u.soldaten.gevonden || [];
  const na = u.naSintMaarten || {};
  const verstopt = u.verstopt || [];
  return {
    innerGebouwen: typeof r.gebouwen === 'object' ? som(Object.values(r.gebouwen), (n) => n) : r.gebouwen,
    gebouwenInHetDorp: r.gebouwenInHetDorp,
    innerTegels: r.tegels,
    tegelsInHetDorp: r.tegelsInHetDorp,
    gepraat: u.inner.gepraatUren,
    geschenk: som(u.inner.geschenken, (g) => (g.kan ? g.goud : 0)),
    gehoord: u.inner.geschenken.some((g) => g.gehoord),
    vroegGraan: u.heer && u.heer.vroeg.graan,
    vroegGoud: u.heer && u.heer.vroeg.goud,
    deel: u.heer && u.heer.deel,
    straf: u.heer ? u.heer.straf : '',
    verstoptGraan: som(verstopt, (v) => v.graan),
    verstoptGoud: som(verstopt, (v) => v.goud),
    getuigen: new Set(u.getuigen.filter((g) => !/^Niemand/.test(g.wie)).map((g) => `${g.dag}|${g.plek}`)).size,
    verteld: (u.eind.getuigenPerPlek || []).filter((p) => p.verteldDoor).length,
    doorzocht: (u.soldaten.gedaan || []).length,
    hetHeleDorp: u.soldaten.hetHeleDorp,
    heerKiest: u.soldaten.heerKiest,
    gevondenGraan: som(gevonden, (v) => v.graan),
    gevondenGoud: som(gevonden, (v) => v.goud),
    argwaan: u.heer ? u.heer.argwaan : null,
    rijkGraan: (na.graan || 0) + ((na.verstopt && na.verstopt.graan) || 0),
    rijkGoud: (na.goud || 0) + ((na.verstopt && na.verstopt.goud) || 0),
    rijkVerstoptGraan: na.verstopt && na.verstopt.graan,
    rijkVerstoptGoud: na.verstopt && na.verstopt.goud,
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
    kop: 'De inner en de heer',
    kolommen: [
      ['de inner zag', (m) => `${getal(m.innerGebouwen)} van ${getal(m.gebouwenInHetDorp)} gebouwen, ${getal(m.innerTegels)} van ${getal(m.tegelsInHetDorp)} akkertegels`],
      ['gepraat', (m) => (m.gepraat ? `${getal(m.gepraat)} uur` : '')],
      ['geschenk', (m) => (m.geschenk ? `${m.geschenk} goud${m.gehoord ? ', de heer hoorde het' : ''}` : '')],
      ['de heer vroeg', (m) => `${getal(m.vroegGraan)} graan, ${getal(m.vroegGoud)} goud`],
      ['gegeven', (m) => pct(m.deel)],
      ['straf', (m) => m.straf],
    ],
  },
  {
    kop: 'Verstoppen en de soldaten',
    kolommen: [
      ['weggezet (graan, goud)', (m) => `${m.verstoptGraan}, ${m.verstoptGoud}`],
      ['keer gezien', (m) => String(m.getuigen)],
      ['rondverteld', (m) => String(m.verteld)],
      ['de soldaten zochten', (m) => (m.hetHeleDorp ? 'het hele dorp' : `${m.doorzocht} plekken${m.heerKiest ? ', de heer koos' : ''}`)],
      ['en vonden (graan, goud)', (m) => `${m.gevondenGraan}, ${m.gevondenGoud}`],
      ['argwaan', (m) => pct(m.argwaan)],
    ],
  },
  {
    kop: 'Het dorp',
    kolommen: [
      ['na Sint-Maarten (graan, goud; waarvan verstopt)', (m) => `${getal(m.rijkGraan)}, ${getal(m.rijkGoud)} (${getal(m.rijkVerstoptGraan)}, ${getal(m.rijkVerstoptGoud)})`],
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
  uit.push(...deVoorvallen(goed));
  uit.push(...deOndernemers(goed));
  uit.push(...deTweeBazen(goed));
  uit.push(...naarDeWinst(goed));
  uit.push(...hetOntginnen(goed));
  uit.push(...hetBos(goed));
  uit.push(...vanGehuchtTotDorp(goed));
  uit.push(...hetGraanboek(goed));
  return uit.join('\n') + '\n';
};

function gemiddeldPerSpeler(goed) {
  const uit = ['## Per speler, gemiddeld over de zaden', ''];
  const kop = ['speler', 'jaren', 'de heer vroeg (graan, goud)', 'gegeven', 'gevonden (graan, goud)', 'na Sint-Maarten (graan, goud)', 'mensen', 'doden', 'tevreden'];
  uit.push(regel(kop), regel(kop.map(() => '---')));
  for (const speler of EEN_JAAR) {
    const j = goed.filter((u) => u.speler === speler).map(maten);
    if (!j.length) continue;
    uit.push(regel([
      NAMEN[speler], j.length,
      `${getal(gemiddelde(j, (m) => m.vroegGraan))}, ${getal(gemiddelde(j, (m) => m.vroegGoud))}`,
      pct(gemiddelde(j, (m) => m.deel)),
      `${getal(gemiddelde(j, (m) => m.gevondenGraan))}, ${getal(gemiddelde(j, (m) => m.gevondenGoud))}`,
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

// De ondernemers (js/ondernemers.js, vraag 104): wat ze vroegen, wat de speler zei, en wat ervan kwam (de
// herbergierster, wie wegtrok). Alleen wie er een had.
function deOndernemers(goed) {
  const met = goed.filter((u) => u.eind && u.eind.ondernemers && (u.eind.ondernemers.vroegen.length || u.eind.ondernemers.berichten.length));
  const uit = ['## De ondernemers', ''];
  if (!met.length) return uit.concat('Geen ondernemer vroeg iets.', '');
  const kop = ['speler', 'zaad', 'vroegen', 'wat ervan kwam', 'wapens aan het eind', 'herbergen'];
  uit.push(regel(kop), regel(kop.map(() => '---')));
  for (const u of met) {
    const o = u.eind.ondernemers;
    uit.push(regel([NAMEN[u.speler] || u.speler, u.zaad, o.vroegen.join('; '), o.berichten.join('; '), String(o.wapens), String(o.herbergen)]));
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

// Naar de winst (werklijst vraag 102, e): per jaar de mensen aan het eind, op hoeveel dagen alle huizen alles hadden en
// hoeveel daarvan in steen (zoals de winst het vraagt), de teller van het eind (js/einde.js: de langste reeks dat jaar, en
// waar hij aan het eind stond), op hoeveel dagen hij stilstond (een slechte week mag), en de twee bazen aan het eind van het
// jaar. Daaronder of het gewonnen werd, en wat de reeks brak als hij na een maand of meer op nul ging.
const WENS_NAAM = { vleesOfVis: 'vlees of vis', bouwstof: 'wacht op bouwstof' };
function naarDeWinst(goed) {
  const meer = goed.filter((u) => (u.jaren || 1) > 1 && (u.geluk || []).some((g) => g && g.winBeste != null));
  if (!meer.length) return [];
  const r = meer[0].eindRegels || {};
  const uit = ['## Naar de winst', '', `Per jaar. De winst vraagt ${r.dagen} dagen op de teller, met alle woningen in steen en alles wat ze willen, vanaf ${r.minstensMensen} mensen; ${r.magMissen ? `een slechte reeks van hooguit ${r.magMissen} dagen zet de teller stil` : 'één slechte dag zet de teller op nul'}. Het laatste jaar is de eerste maand, tot 1 grasmaand.`, ''];
  const kop = ['speler', 'zaad', 'jaar', 'mensen', 'dagen alle huizen alles', 'waarvan in steen', 'de teller (langst, eind)', 'dagen stil', 'gunst', 'vertrouwen'];
  uit.push(regel(kop), regel(kop.map(() => '---')));
  for (const u of meer) {
    (u.geluk || []).forEach((g, j) => {
      if (!g || !g.dagen) return;
      uit.push(regel([
        NAMEN[u.speler] || u.speler, u.zaad, String(j + 1), getal(g.mensen), `${g.allemaal} van ${g.dagen}`, String(g.gewonnen || 0),
        `${g.winBeste || 0}, ${g.winNu || 0}`, String(g.stil || 0), getal(g.gunst), getal(g.vertrouwen),
      ]));
    });
  }
  uit.push('');
  for (const u of meer) {
    const gewonnen = u.eind && u.eind.eind && u.eind.eind.gewonnen;
    const breuken = u.breuken || [];
    const brak = breuken.slice(0, 6).map((b) => {
      const wat = Object.entries(b.gemist || {}).sort((x, y) => y[1] - x[1]).map(([w, n]) => `${WENS_NAAM[w] || w} ${n}`).join(', ');
      return `${b.datum} na ${b.lengte} dagen, met ${b.mensen} mensen (${wat || 'niets te zien'})`;
    });
    const meerDan = breuken.length > 6 ? `, en nog ${breuken.length - 6} keer` : '';
    uit.push(`- ${NAMEN[u.speler] || u.speler}, zaad ${u.zaad}: ${gewonnen ? `gewonnen op ${gewonnen}` : 'niet gewonnen'}. ${breuken.length ? `De reeks brak ${breuken.length} keer na een maand of meer: ${brak.join('; ')}${meerDan}.` : 'De reeks brak nooit na een maand of meer.'}`);
  }
  uit.push('');
  return uit;
}

// Ontginnen (js/ontginnen.js; werklijst vraag 107, stap 3): per jaar hoe vaak een boer erom vroeg, wat de speler koos (de
// heide, het bos gemeld of het bos stiekem; `gebouwd` in speler.js), wie er zocht naar een akker in het bos die niet in de
// boeken staat en hoeveel van hoeveel hij vond (`bosZoeken`), en wanneer de schout betrapt werd, waarom, en de gunst
// daarna (`betrapt`). Daaronder per spel hoeveel stiekeme akkers er aan het eind nog niet gevonden waren.
function hetOntginnen(goed) {
  const ONTGINNING = /^ontginning \((.+)\)$/;
  const met = goed.filter((u) => (u.voorvallen || []).some((v) => v.id === 'ontginverzoek') || (u.betrapt || []).length);
  if (!met.length) return [];
  const kort = (datum) => datum.replace(/ 13(\d\d)$/, " '$1");
  const jaar = (x) => Math.floor(x.dag / 360);
  const uit = ['## Ontginnen', '', 'Per jaar: hoe vaak een boer vroeg om te ontginnen en wat de speler koos, wie er zocht naar een akker in het bos die niet in de boeken stond (gevonden van wat er lag), en wanneer de schout betrapt werd, met de gunst daarna. Het laatste jaar is de eerste maand, tot 1 grasmaand.', ''];
  const kop = ['speler', 'zaad', 'jaar', 'verzoeken', 'heide', 'bos, gemeld', 'bos, stiekem', 'gezocht in het bos', 'betrapt'];
  uit.push(regel(kop), regel(kop.map(() => '---')));
  for (const u of met) {
    const ja = (u.gebouwd || []).filter((g) => g.gelukt && ONTGINNING.test(g.soort));
    const jaren = Math.max(u.jaren || 1, (u.graan || []).length, ...ja.map((g) => jaar(g) + 1));
    for (let j = 0; j < jaren; j++) {
      const stukken = (waar) => String(ja.filter((g) => jaar(g) === j && ONTGINNING.exec(g.soort)[1] === waar).length);
      const gezocht = (u.bosZoeken || []).filter((z) => jaar(z) === j).map((z) => `${kort(z.datum)}: ${z.wie}, ${z.gevonden} van ${z.lagen}`);
      const betrapt = (u.betrapt || []).filter((b) => jaar(b) === j).map((b) => `${kort(b.datum)}: ${b.tekst} (gunst ${b.gunst})`);
      uit.push(regel([
        NAMEN[u.speler] || u.speler, u.zaad, String(j + 1),
        String((u.voorvallen || []).filter((v) => v.id === 'ontginverzoek' && jaar(v) === j).length),
        stukken('heide'), stukken('bos, gemeld'), stukken('bos, stiekem'), gezocht.join('; '), betrapt.join('; '),
      ]));
    }
  }
  uit.push('');
  for (const u of met) {
    const stiekem = (u.gebouwd || []).filter((g) => g.gelukt && g.soort === 'ontginning (bos, stiekem)').length;
    if (!stiekem) continue;
    const gevonden = som(u.bosZoeken || [], (z) => z.gevonden);
    uit.push(`- ${NAMEN[u.speler] || u.speler}, zaad ${u.zaad}: ${stiekem} ${stiekem === 1 ? 'stuk' : 'stukken'} stiekem ontgonnen, ${gevonden} gevonden, ${stiekem - gevonden} aan het eind nog niet.`);
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
function vanGehuchtTotDorp(goed) {
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
  const BEKEND = ['oogst', 'gegeten', 'zaaien', 'heer', 'herberg', 'molen', 'brouwerij', 'gekocht', 'verkocht', 'rovers', 'soldaten', 'voorvallen', 'verstopt', 'teruggehaald'];
  const uit = ['## Het graanboek', '', 'Per jaar waar het graan bleef (erbij +, eraf −), en wat dat deed. Het laatste jaar is de eerste maand, tot 1 grasmaand.', ''];
  const kop = ['speler', 'zaad', 'jaar', 'oogst', 'gegeten', 'zaaien', 'de heer', 'herberg', 'molen', 'brouwerij', 'handel', 'rovers, soldaten, voorvallen', 'verstopt, terug', 'anders', 'dagen zonder bier', 'dagen zonder brood', 'dagen zonder laken', 'huizen met alles', 'dagen alle huizen alles'];
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
        `${teken(b.verstopt) || '0'}, ${teken(b.teruggehaald) || '0'}`, teken(anders),
        g.dagen ? String(g.zonderBier) : '', g.dagen ? String(g.zonderBrood) : '', g.dagen && g.zonderLaken != null ? String(g.zonderLaken) : '',
        g.dagen ? pct(g.alles / g.dagen) : '', g.dagen ? `${g.allemaal} van ${g.dagen}${g.gewonnen ? ` (${g.gewonnen} gewonnen)` : ''}` : '',
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
