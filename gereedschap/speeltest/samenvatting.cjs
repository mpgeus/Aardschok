// De tabellen van de speeltest (speeltest.cjs): per jaar drie tabellen (de inner en de heer; verstoppen en de
// soldaten; het dorp), en per speler het gemiddelde over zijn zaden. De getallen komen uit wat speler.js per
// jaar teruggeeft; wat een jaar niet heeft, blijft leeg. Daarna, voor alle spelers, van gehucht tot dorp (vraag
// 58): wanneer het een dorp werd, en waarom er op een groeidag geen gezin kwam; en voor wie twee jaar speelt het graanboek
// (vraag 94, d).
const NAMEN = { braaf: 'braaf', lui30: 'lui, 30% weg', lui60: 'lui, 60% weg', slim: 'slim, 60% weg', bouwer: 'bouwer, twee jaar', sluw: 'sluwe bouwer, twee jaar' };
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
  const uit = [`# De speeltest`, '', `Gespeeld op ${stand}. Een jaar loopt van 1 lentemaand tot 1 grasmaand van het jaar erna; de bouwer en de sluwe bouwer spelen er twee, tot 1 grasmaand van het derde.`, ''];
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
  const uit = ['## Het graanboek', '', 'Per jaar waar het graan bleef (erbij +, eraf −), en wat dat deed. Het derde jaar is de eerste maand, tot 1 grasmaand.', ''];
  const kop = ['speler', 'zaad', 'jaar', 'oogst', 'gegeten', 'zaaien', 'de heer', 'herberg', 'molen', 'brouwerij', 'handel', 'rovers, soldaten, voorvallen', 'verstopt, terug', 'anders', 'dagen zonder bier', 'dagen zonder brood', 'huizen met alles', 'dagen alle huizen alles'];
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
        g.dagen ? String(g.zonderBier) : '', g.dagen ? String(g.zonderBrood) : '',
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
