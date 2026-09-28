// De tabel van de speeltest (speeltest.cjs): één regel per jaar, en per speler het gemiddelde over zijn
// zaden. De getallen komen uit wat speler.js per jaar teruggeeft; wat een jaar niet heeft, blijft leeg.
const NAMEN = { braaf: 'braaf', lui30: 'lui, 30% weg', lui60: 'lui, 60% weg', slim: 'slim, 60% weg' };

const getal = (x) => (x == null || Number.isNaN(x) ? '' : Math.round(x));
const pct = (x) => (x == null || Number.isNaN(x) ? '' : `${Math.round(x * 100)}%`);

// Wat er per jaar in de tabel komt, als [kop, functie van de uitslag].
const KOLOMMEN = [
  ['speler', (u) => NAMEN[u.speler] || u.speler],
  ['zaad', (u) => u.zaad],
  ['de heer vroeg', (u) => (u.heer ? `${getal(u.heer.vroeg.graan)} graan, ${getal(u.heer.vroeg.goud)} goud` : '')],
  ['gegeven', (u) => (u.heer ? pct(u.heer.deel) : '')],
  ['straf', (u) => (u.heer ? u.heer.straf : '')],
  ['argwaan', (u) => (u.argwaan ? `${pct(u.argwaan.naInner)} / ${pct(u.argwaan.opSintMaarten)}` : '')],
  ['soldaten vonden', (u) => (u.soldaten ? u.soldaten.gevonden.map((v) => v.tekst).join('; ') || 'niets' : '')],
  ['verstopt aan het eind', (u) => (u.eind ? `${getal(u.eind.verstopt.graan)} graan, ${getal(u.eind.verstopt.goud)} goud` : '')],
  ['mensen', (u) => (u.eind ? `${u.begin.bevolking} → ${u.eind.bevolking}` : '')],
  ['doden (kou, honger)', (u) => (u.winter ? `${u.winter.doden} (${u.winter.kou}, ${u.winter.honger})` : '')],
  ['tevreden', (u) => (u.eind ? pct(u.eind.tevredenheid) : '')],
  ['fouten', (u) => (u.fouten ? u.fouten.length : '')],
];

function regel(cellen) {
  return `| ${cellen.join(' | ')} |`;
}

function gemiddelde(lijst, f) {
  const w = lijst.map(f).filter((x) => typeof x === 'number' && !Number.isNaN(x));
  return w.length ? w.reduce((a, b) => a + b, 0) / w.length : null;
}

exports.maak = function (uitslagen, stand) {
  const volgorde = Object.keys(NAMEN);
  const lijst = [...uitslagen].sort((a, b) => volgorde.indexOf(a.speler) - volgorde.indexOf(b.speler) || a.zaad - b.zaad);
  const uit = [`# De speeltest (${stand})`, '', regel(KOLOMMEN.map((k) => k[0])), regel(KOLOMMEN.map(() => '---'))];
  for (const u of lijst) {
    if (u.mislukt) uit.push(regel([NAMEN[u.speler] || u.speler, u.zaad, `mislukt: ${u.mislukt}`, ...KOLOMMEN.slice(3).map(() => '')]));
    else uit.push(regel(KOLOMMEN.map((k) => k[1](u))));
  }
  uit.push('', '## Per speler, gemiddeld over de zaden', '');
  const kop = ['speler', 'jaren', 'gegeven', 'gevonden (graan, goud)', 'verstopt aan het eind (graan, goud)', 'goud aan het eind', 'mensen aan het eind', 'doden', 'tevreden'];
  uit.push(regel(kop), regel(kop.map(() => '---')));
  for (const speler of volgorde) {
    const j = lijst.filter((u) => u.speler === speler && !u.mislukt && u.eind);
    if (!j.length) continue;
    const gevonden = (soort) => (u) => u.soldaten.gevonden.reduce((a, v) => a + (v[soort] || 0), 0);
    uit.push(regel([
      NAMEN[speler],
      j.length,
      pct(gemiddelde(j, (u) => u.heer && u.heer.deel)),
      `${getal(gemiddelde(j, gevonden('graan')))}, ${getal(gemiddelde(j, gevonden('goud')))}`,
      `${getal(gemiddelde(j, (u) => u.eind.verstopt.graan))}, ${getal(gemiddelde(j, (u) => u.eind.verstopt.goud))}`,
      getal(gemiddelde(j, (u) => u.eind.goud)),
      getal(gemiddelde(j, (u) => u.eind.bevolking)),
      getal(gemiddelde(j, (u) => u.winter.doden)),
      pct(gemiddelde(j, (u) => u.eind.tevredenheid)),
    ]));
  }
  return uit.join('\n') + '\n';
};
