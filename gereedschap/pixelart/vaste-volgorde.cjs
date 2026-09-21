// Eén klein, op zichzelf staand stukje van naar-tiled.cjs: de vaste volgorde en vaste capaciteit
// van een tegelvel (zie de toelichting bovenaan naar-tiled.cjs, bij VELCONFIG). Een eigen bestand
// zonder dorp.cjs, bomen.cjs of enige tekenaar erbij, zodat test/tegelvolgorde.test.cjs dit kan
// toetsen zonder ook maar één tegel te hoeven renderen.
'use strict';
const fs = require('fs');
const path = require('path');

// map: de map waarin "<veldNaam>.volgorde.json" staat (in het spel: tegels/).
// items: [{ key, ... }] — de tegels die de code NU levert, in zijn eigen (mogelijk wisselende)
// volgorde. `key` is de identiteit die nooit meer verandert: meestal de naam zelf, bij grond een
// fijnere sleutel (zie bouwGrondVel in naar-tiled.cjs).
//
// Leest (of maakt) tegels/<veldNaam>.volgorde.json, zet elke huidige tegel op zijn bevroren plek
// en plakt een nog onbekende sleutel ACHTERAAN — nooit ertussen, ook niet als `items` hem ergens
// in het midden aanlevert. Verdwijnt een sleutel uit `items` (een tegel die niet meer bestaat),
// dan houdt hij zijn plaats als lege cel: er wordt nooit opgeschoven.
//
// Rondt na een uitbreiding af op een veelvoud van `kolommen`, zodat een latere aanvulling altijd
// aan een nieuwe rij begint (belangrijk voor grond.tsx, waar Marcel een heel stempelblok in één
// keer sleept), en vult aan tot `capaciteit` lege cellen. Gooit als er ondanks die marge geen
// ruimte meer is — dat mag nooit stilzwijgend een tegel laten vallen.
//
// Geeft een array van PRECIES `capaciteit` lang terug: op elke plek het bijbehorende item uit
// `items`, of `null` voor een lege cel (nog niet gebruikt, of een verdwenen tegel).
function vasteVolgordeEnCapaciteit(map, veldNaam, items, capaciteit, kolommen) {
  const pad = path.join(map, `${veldNaam}.volgorde.json`);
  let volgorde = [];
  try {
    volgorde = JSON.parse(fs.readFileSync(pad, 'utf8'));
  } catch (e) {
    // eerste keer: er is nog niets bevroren, dus de volgorde begint bij wat de code nu al
    // oplevert — en dat IS de volgorde van de laatste commit, want er verandert hier verder niets.
  }
  let uitgebreid = false;
  for (const it of items) {
    if (!volgorde.includes(it.key)) {
      volgorde.push(it.key);
      uitgebreid = true;
    }
  }
  while (uitgebreid && volgorde.length % kolommen !== 0) volgorde.push(null);
  if (volgorde.length > capaciteit) {
    throw new Error(`${veldNaam}: ${volgorde.length} tegels nodig, maar de vaste capaciteit is ${capaciteit} — verhoog VELCONFIG.${veldNaam}.capaciteit in naar-tiled.cjs (dat schuift geen bestaande nummers op, want nieuwe tegels komen alleen achteraan bij)`);
  }
  fs.writeFileSync(pad, JSON.stringify(volgorde, null, 1) + '\n');
  const bijSleutel = new Map(items.map((it) => [it.key, it]));
  const uit = [];
  for (let i = 0; i < capaciteit; i++) {
    const sleutel = volgorde[i];
    uit.push(sleutel != null ? bijSleutel.get(sleutel) || null : null);
  }
  return uit;
}

module.exports = { vasteVolgordeEnCapaciteit };
