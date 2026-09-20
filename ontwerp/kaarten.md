# Kaarten: van Tiled naar het spel

Wat er op die kaarten komt te staan, staat in `wereld.md` en `toren.md`.

## De kaarten tekenen we in een editor (Marcel, 20 sep 2026)

Claude elke boom laten neerzetten kost te veel. De wereld wordt dus in een kaarteditor getekend.
Gekozen richting: **Tiled** (mapeditor.org, open bron, al jaren de standaard in pixelspellen).
Tiled kent isometrische kaarten van 64×32 en slaat op als JSON (`.tmj`), dus het spel kan een
kaart gewoon inlezen. LDtk is moderner en prettiger, maar isometrisch is daar stiefmoederlijk
bedeeld.

Hoe het aan elkaar hangt:

1. `gereedschap/pixelart/` blijft de beelden maken, maar schrijft er voortaan ook tegelvellen bij
   met een `.tsx` per vel: het beeld, de tegelmaat, het voetpunt van hoge dingen, en wat vast
   staat. Dan hoeft niemand in Tiled honderden sprites met de hand aan te wijzen.
2. Marcel tekent in Tiled: een grondlaag (gras, pad, kasseien, water), een laag met wat vast
   staat, en een objectlaag voor huizen, bomen, mensen en monsters.
3. Eigenschappen per object vertellen het spel de rest: welk wezen, welke dorpeling (het zaad),
   welke deur, welke quest, en waar je naar een ander gebied overgaat.
4. `js/kaart.js` leest de `.tmj` en maakt daarvan wat `js/wereld.js` nu met de
   hand opschrijft: begaanbaar, vast, deuren, voorwerpen, wezens.

### De keten staat (20 sep 2026)

| Stap | Wat het doet |
|---|---|
| `npm run tiled` | Rendert uit `dorp.cjs`, `dorp2.cjs` en `bomen.cjs` de vellen naar `tegels/`: grond, bomen, begroeiing en de vijftien gebouwen, elk met een `.tsx` waarin `vast` en `beslaat` al staan. |
| Tiled | Marcel opent de `.tsx`-en en tekent een kaart, die hij opslaat als `kaarten/<naam>.tmj`. |
| `npm run kaarten` | Bundelt elke `.tmj` tot `kaarten/kaarten.js` (`T.KAARTEN`), want `fetch` werkt niet vanaf `file://`. |
| `T.laadKaart(T.KAARTEN.naam)` | Maakt er een wereld van: tegels, deuren, voorwerpen en wezens, waar `isBegaanbaar`, `isVast` en `raakt` ongewijzigd op werken. |

Eigenschappen die Marcel op een object zet: `wezen` (welk wezen, uit dezelfde lijst als het
spel), `zaad` (een gewone dorpeling), `staat` (een deur: open, dicht of opslot) en `overgang`
(de naam van de kaart waar je heen gaat). Op de tegel zelf staan `naam`, `vast` en bij een
gebouw `beslaat` ("7x5"). Een gebouw zet je neer op zijn achterste hoek en het beslaat de
tegels rechtsonder daarvandaan, dezelfde afspraak als in de export.

`kaarten/proef.tmj` is een kaart van 12×10 die met de hand is gezet, met `test/kaart.test.cjs`
eromheen; die toetst dat het pad begaanbaar is, dat de voet van het huis vast is en dat het
monster op de goede tegel staat.

Nog uit te zoeken:

- **De grond herhaalt zichtbaar.** Marcel opende `proef.tmj` in Tiled (20 sep 2026): de kaart
  klopt en de gebouwen staan op hun voettegel, maar het gras is één tegel die naast zichzelf
  ligt, dus de tufts vormen nette diagonale rijen. In een grote render valt dat niet op, want
  daar wordt de grond in één keer getekend. De oplossing: een lap van vier bij vier tegels uit
  hetzelfde ruisveld snijden, plus losse varianten om te strooien.
- **Hoogte.** Besloten, zie "Hoogte is een getal per tegel" hieronder. Nog niet gebouwd.
- **Grote gebouwen.** Een huis van 6×8 tegels is één object met een voetpunt, geen losse tegels.
  De dieptesortering van het spel (op t) moet zulke objecten op hun voettegel inplannen.
- **Wat blijft er in code?** De kamers binnen in de toren zijn klein en staan al in code. Die
  mogen zo blijven tot de editor er staat.
- **Wat er nog niet in de vellen zit:** dorpelingen, deuren en hekken als plaatje (de
  eigenschappen werken wel, maar je ziet in Tiled een kaal blokje), stromend water, en het
  bruggetje, dat geen heel aantal tegels breed is.
- **Overgangen doen nog niets.** `overgang` wordt ingelezen, maar er is nog niets dat van kaart
  wisselt.

### Hoogte is een getal per tegel (Marcel, 20 sep 2026)

Tiled kent geen derde dimensie. Van de drie manieren die daarvoor rondgaan — een laag per
verdieping, een getal per tegel, of sorteren op y — is de tweede voor ons de juiste.

**Waarom geen laag per verdieping.** Alles in dit spel hangt aan één raster voor rondlopen én
vechten; dat is wat de overgang naadloos maakt. Lagen geven twee rasters die met trappen aan
elkaar geknoopt moeten worden, en dat raakt het lopen, het zoeken van een pad, het zicht, het
bereik van een spreuk en de beurtvolgorde. Voor een huis met een bovenverdieping is het de goede
aanpak; voor een heuvel met een beek eronder een dure omweg.

**Hoe het in Tiled werkt.** Naast de grondlaag komt een laag `hoogte` met een klein palet: acht
gekleurde ruiten met een cijfer, 0 tot en met 7, waarbij 0 het maaiveld is. Marcel schildert geen
rotsen maar hoogtes, met dezelfde emmer en stempel als voor gras, en ziet de grond eronder
doorschemeren. Eén extra tegel in dat palet is `helling`, met een richting: daar mag een
hoogteverschil overbrugd worden.

Een eigenschap per tegel in het tegelvel kan niet, want dezelfde graspol moet op elke hoogte
kunnen liggen; een eigenschap per object zou betekenen dat je elke tegel apart aanklikt. Een laag
schilder je.

**Rotswanden worden afgeleid, niet getekend.** Staat er een 1 naast een 0, dan is daar een wand.
Dat is dezelfde machinerie als de randtegels tussen twee grondsoorten, alleen tussen twee
hoogtes. Een klifrand kan daardoor nooit fout liggen.

**Wat het spel ermee doet:**

- de tegel en alles wat erop staat schuift omhoog met hoogte maal een vaste trede (begin met
  ongeveer een halve tegel; `iso.js` weet al dat één eenheid hoogte 0,866 pixel is);
- lopen mag naar een buurtegel bij gelijke hoogte, of over een helling;
- de dieptesortering krijgt hoogte als tweede sleutel: wie boven staat, komt over wie beneden
  staat heen;
- het exportstapje klaagt als een stuk is ingesloten waar geen helling heen leidt.

**Wat het de kernregel oplevert,** want anders is het alleen mooi: vanaf hoog grond zie je verder,
dus zie je een wolf eerder en kun je hem ontlopen. Een richel dwingt je te kiezen welke kant je
omloopt. Naar beneden springen kan wel maar niet terug, dus dat is een eenrichtingsroute om weg te
komen. Alle drie versterken ze de afweging tussen jaren en veiligheid.

**Wanneer:** na de randtegels en nadat elke kaart vanzelf een gebied is, want hoogte bouwen in een
wereld die nog niet af is, is de verkeerde volgorde.
