# Werklijst: wat we doen, in welke volgorde

Begin een sessie hier. Bovenaan staat de stand: wat loopt, wat op Marcel wacht, en wat klaarstaat.
Daaronder komt wat volgt, in volgorde. Elk punt heeft een "klaar als", zodat afwerken iets is wat
je kunt nakijken. Een punt dat af is, gaat naar onderen met een datum; een nieuw punt krijgt een
plek met een reden. **De stand wordt aan het eind van elke sessie bijgewerkt,** zodat een nieuwe
sessie meteen weet waar we zijn.

**Waarom deze volgorde:** eerst een dorp dat draait, dan de heer die eraan trekt (en daarmee de
kern: rijk worden en arm lijken), dan verhalen en besturen, dan het verzet, en pas aan het eind de
groei naar vrijheid en de afwerking. Zie "Daarna, in deze volgorde".

## De stand (einde sessie 24 sep 2026)

**Het spel is omgegooid** (23 sep). Marcel vond het doel van De laatste klim niet goed genoeg en
kwam, na vijf rondes ideeën van Claude, zelf met het nieuwe spel: **een bouw- en beheerspel in
isometrisch beeld, met politiek en avontuur erin.** Jij bent de schout van een gehucht onder een
verwarde heer die alleen geld ziet; je breidt het uit tot een stad en maakt je aan het eind van de
heer los. Alles staat in `spel.md`, en `CLAUDE.md` is bijgewerkt. De code van het oude spel (toren,
spreuken, leeftijd, tutorial) staat er nog; die gaat eruit bij punt 7.

**Wat er nu speelt** (`http://localhost:8123/?kaart=gehucht`): een open kaart met een gehucht en
een es; graan dat met de kalender groeit, wuift en door de boeren gemaaid wordt (en alleen zo
binnenkomt); een balk met kalender (oude maandnamen, pauze, 1–3×), voorraad, bevolking en
tevredenheid; 45 soorten gebouwen met een bouwmenu (`B`) en fases tijdens het bouwen; een
bevolking die groeit met ruimte, eten en tevredenheid; en een winter die zonder brandhout mensen
kost. **Sinds 24 sep ook handel:** de marskramer komt drie keer per jaar over de weg naar de brink.
Je praat met hem en handelt in een venster, en zolang dat open is, staat de tijd stil. De prijzen
verschillen per bezoek. Een gebouw maakt alleen wat zijn grondstof toelaat (de smidse staat
zonder ijzer stil en zegt dat bij de muis), gereedschap laat harder werken, en zout houdt vis en
vlees goed. `npm test`: 314/314. `await Toren.debug.schermafdruk('naam')` bewaart een blik op het
spel, en `Toren.debug.marskramer()` laat hem meteen komen.

**Loopt nu:** niets. Er draait geen agent.

**Volgende stap: punt 5, Sint-Maarten.** Dan punt 6, rijk worden en arm lijken: samen het tweede
proefje, en de vraag of de kern leuk is. Wacht wel eerst op Marcels oordeel over de kern
(hieronder).

**Nog ruw, om te onthouden:**
- de winter is hard (25 naar 2 mensen zonder hout); `T.BEHOEFTEN_INSTELLINGEN` samen met Marcel
  bijstellen als hij speelt;
- in een huis in aanbouw branden de ramen al;
- een boer met twee akkers werkt er maar één af, en er is geen apart zaaimoment;
- het zwad van de maaier staat als paaltjes, en de slag is symmetrisch;
- de bevolking is een getal, geen poppetjes; van de nieuwe goederen staan alleen ijzer, zout en
  gereedschap in de balk (steen, klei, riet, vis, … niet); wat de marskramer koopt, zie je wel in
  zijn venster;
- **het eerste voorjaar is krap:** het gehucht begint met 60 graan voor 25 mensen, dus half
  grasmaand is het op, ruim drie maanden vóór de oogst. Bij het eerste bezoek van de marskramer
  heb je dan ook bijna niets te verkopen (wat hout). Marcel (24 sep): "het graan passen we
  gaandeweg wel aan na spelen";
- zout telt sinds 24 sep voor de vis, want de beek vriest 's winters dicht. Het vlees van de jager
  komt het hele jaar binnen; het slachten in slachtmaand is voor later (`spel.md`, "Handel");
- de marskramer leent het vel van Wim, en loopt van de weg naar de brink op 1× een week;
- wat een gebouw zegt, lees je alleen op zijn voet (het dak vangt de muis niet), en alleen bij
  gebouwen die je zelf neerzette;
- veel nieuwe gebouwen lenen een tekening (hut, schaapskooi, timmerman, brouwerij, tiendschuur,
  wapenmaker, wachthuis, …), en kapel, watermolen en put hebben nog geen bouwfases: tekenwerk.


**Wacht op Marcel:**
- Spelen, en zeggen hoe het voelt: vooral de winter, en hoe snel een jaar gaat.
- Het voorstel voor de kern in `spel.md` ("De kern voor het tweede proefje"): goederen, wat de heer
  wil, wat de inner ziet, drie groepen en vijf keuren. Schrappen en aanvullen, vóór punt 5.
- Een naam; "Aardschok" past niet meer.

## Daarna, in deze volgorde (Marcel: "Ik wil het allemaal. Welke volgorde?", 23 sep)

De volgorde volgt wat op wat steunt: eerst een dorp dat draait, dan de heer die eraan trekt (en
daarmee de kern), dan verhalen die elk jaar anders maken, dan het besturen, dan het verzet, en pas
aan het eind de groei naar vrijheid en de afwerking. Alles staat in `spel.md`, "Welke gameplay er
nog nodig is".

*A. Een dorp dat draait*

3. **Behoeften en de winter** (af, 23 sep 2026). Klaar als mensen
   eten, brandhout en een kerk willen, tevredenheid bepaalt hoe hard ze werken en of ze blijven,
   een huis groeit (hut, huis, stenen huis) als zijn bewoners krijgen wat ze willen, en een winter
   zonder brandhout of voorraad mensen kost.
4. **Handel** (af, 24 sep 2026). Klaar als de marskramer drie keer per jaar langskomt (niet in
   de winter), ijzer en zout verkoopt en koopt wat je over hebt, tegen een prijs die per bezoek
   verschilt; een gebouw alleen maakt wat zijn grondstof toelaat, zodat de smidse zonder ijzer
   stilvalt; gereedschap sneller werk geeft en slijt; en zout vis en vlees bewaart. Besloten op
   24 sep, zie `spel.md`, "Handel". Stenen komen niet van hem maar bij punt 14, met een voerman
   met een kar.

*B. De heer, en de kern (dit is het tweede proefje)*

5. **Sint-Maarten.** Klaar als de heer op 11 slachtmaand zijn deel vraagt, in goederen en goud, zijn
   eisen meegroeien met hoe rijk het dorp oogt, hij straft als je tekortschiet (in het dorp, jou
   zelf, hogere eisen, soldaten), en je je ambt kunt verliezen.
6. **Rijk worden en arm lijken.** Klaar als de inner argwaan heeft die stijgt als wat hij ziet niet
   klopt met wat je levert, er verstopplekken zijn met plaats voor zoveel, je twee rekenboeken
   bijhoudt, en zijn bezoek een scène is waarin jij meeloopt, de route kiest, praat, afleidt of
   omkoopt. De vraag van het proefje: is dit leuk?
7. **Het oude spel eruit.** Klaar als de toren, de spreuken, de leeftijd en de tutorial uit de code
   zijn, `npm test` groen is, en `CLAUDE.md` alleen nog het nieuwe spel beschrijft. Hier, omdat
   er daarna veel nieuwe code bovenop komt.

*C. Verhalen en besturen*

8. **Voorvallen.** Klaar als er dingen gebeuren die een keuze vragen, met twee of drie antwoorden
   die elk iets kosten (zoals de quests), als gegevens op één plek, en de eerste reeks er is: weer
   (hagel, droogte), brand, ziekte, een vreemdeling die wil blijven, een bruiloft, een
   grensruzie, en de grillen van de heer als brieven.
9. **Groepen en keuren.** Klaar als boeren, landlozen en de kerk (later meer) elk een gezicht en
   vertrouwen in jou hebben, en je keuren kunt uitvaardigen die elk iets kosten.
10. **Rechtspraak en verklikkers.** Klaar als je als schout oordeelt over een dief, een vechtpartij
    of een verdachte vreemdeling, streng of mild met gevolgen, en er iemand in het dorp met de inner
    praat die je kunt ontmaskeren.

*D. De nacht en het verzet*

11. **De nacht.** Klaar als er dag en nacht is (ook voor de sfeer), met een avondklok, wachters en
    lantaarns, en verstoppen en smokkelen 's nachts veiliger is.
12. **Eigen buidel en dorpskas.** Klaar als jij zelf iets overhoudt, en wie te veel in eigen zak
    steekt, het dorp verliest.
13. **Een militie in het geheim.** Klaar als je mensen kunt laten oefenen (een feest als de inner
    kijkt), en rovers en wolven een reden en een gevecht in beurten geven.

*E. Groeien naar vrijheid*

14. **De treden.** Klaar als het gehucht een dorp wordt, dan marktrecht krijgt (markt, kramen,
    handelaars) en een stad wordt, met schepenen die stemmen. Met het dorp komt de voerman met
    een kar, die stenen brengt (`spel.md`, "Handel").
15. **Stadsrechten kopen.**
16. **De opstand:** trainen, wapens verbergen, en het gevecht in beurten.

*F. Afwerking*

17. **Opslaan, titelscherm, instellingen, geluid.** Zie `verpakken.md`.
18. **Verpakken.** Klaar als er een programma is dat vanuit Steam start.

Het tweede proefje (één jaar met de heer: is rijk worden en arm lijken leuk?) zijn nu de punten 5 en 6.

## Tegelijk: de huizenbouwer, en meer mensen

Een stad vraagt veel huizen en veel mensen, dus dit weegt nu zwaarder dan eerst. In het nieuwe spel
zet de speler de huizen neer, dus voet en anker doen er nog meer toe; of ze daarvoor ook in Tiled
moeten, hangt af van punt 1.

Vier rondes, elk een eigen agent, en na elke ronde een plaat om te beoordelen. Zie `beeld.md`,
"De huizenbouwer op ronde vormen".

1. **Vorm** (af, 21 sep). Klaar als de bouwer elke maat kan, de nok langs beide richtingen, één,
   anderhalf en twee lagen (met overkraging), en rechthoek, L en T met een doorlopende kil in het
   riet.
2. **Materiaal** (af, 22 sep). Klaar als er planken, vlechtwerk en blokhut zijn naast vakwerk en
   veldsteen, en spanen, leien en pannen naast riet.
3. **Uitbouwen** (af, 22 sep). Dakkapellen (in het riet een bult), aanbouwen met een eenzijdig dak,
   erkers, luiken, bloembakken, buitentrappen, galerijen, gevelschoorstenen, en 21 losse
   tuinstukken in `tuin-sdf.cjs`. Plaat: `uit/proefhuis/uitbouwen.png`. Wat nog wringt: een bult
   in het riet past niet naast een aanbouw of op een L, het erkerkapje raakt bij twee lagen de rand
   van het grote dak, en het hek leest op ware grootte als een dicht staketsel.
4. **In gebruik.** Klaar als de nieuwe huizen in `gebouwen.tsx` staan met de goede voet en het goede
   anker, achteraan in de volgorde, en het dorp ermee getekend kan worden. Wat ronde 3 hiervoor
   opschreef:
   - Een aanbouw, trap of galerij steekt 1 tot 2,5 tegels voor de muur uit. Er is een `voetVan(H)`
     nodig (of opmeten zoals `meetVoet` in `naar-tiled.cjs`), met het anker op de achterste
     voethoek (+16), anders slaat `test/tegelanker.test.cjs` uit.
   - Renderen zonder gras en grondschaduw, anders wordt de slagschaduw de onderste pixelrij.
   - Per tegel een vaste opgave met een uitgeschreven `uit: {…}`, zodat andere kansen later het vel
     niet veranderen.
   - `naar-tiled.cjs` rendert in één draad (twaalf huizen: 5 tot 10 minuten); werkers of een cache
     per opgave.
   - Een huis met twee lagen en uitbouwen is zo'n 710×880 px: misschien een eigen vel.
   - Tussen de palen van een galerij en de muur kan niemand staan; die tegels moeten vast.
   - De tuinstukken krijgen een eigen vel van 1×1, anker op het midden van de tegel. Vast zijn het
     hek, de bank en de regenton; het hekje en de bedden niet (Marcel, 22 sep).
   Ronde 3 was één lange agent (235 stappen), dus ronde 4 gaat in twee stukken: **4a** (af, 22 sep)
   de hekjes van wilgentenen en latten (`beeld.md`) en de tuinstukken als eigen vel in Tiled; **4b**
   de huizen in `gebouwen.tsx`.

**Meer mensen:** fase B2b, de zeven vaklieden uit `dorpelingen3.cjs` (daar neemt `been()` de knie
al mee), en meer gewone varianten (`dorpeling2`, … in `dorpelingen-anim.cjs`). Renderwerk.

## Klein, tussendoor als het past

- **Een omheining is geen blok** (om samen te bespreken). Het kerkhof, de kippenren en de moestuin
  staan in het spel als één vast blok, dus je kunt niet tussen de graven lopen. Een omheining zou
  alleen zijn rand vast moeten hebben.
- **Omheiningen die je schildert:** tuinhek, palissade, haag, aarden wal met vlechtwerk, en een
  hekje, als een eigen laag. Eén systeem, later ook voor een stadsmuur. Zie `wereld.md`, "Een dorp
  heeft geen muur".
- **Kinderkopjes** in plaats van platte kasseien: bolle ronde keien met mos in de voegen. Zie
  `beeld.md`. Alleen de tekening van `rand.tsx` verandert, dus bestaande paden gaan vanzelf mee.
- **Windwijzer en schoorsteenrook** als losse elementen, zodat ze met de wind meebewegen.
- **Lage begroeiing:** grassprieten, varens en bloemen.
- **Bewegende omgeving:** vlammen, water, stof in het licht.

## Af

- 24 sep 2026 — **Handel (punt 4).** De marskramer komt drie keer per jaar, je handelt met hem
  in een venster (`js/handel.js`, `js/hud.js`), en de prijzen verschillen per bezoek. Een gebouw
  maakt alleen wat zijn grondstof toelaat, de smidse kan al in het gehucht, gereedschap laat
  harder werken, en zout houdt vis en vlees goed. Het eerste voorstel ging aan Marcel voor, en hij
  koos alle vier de keuzes; wat Claude zag voordat er gebouwd werd, staat in `spel.md`, "Handel".

- 23 sep 2026 — **Het gehucht speelt.** Punt 1: graan als plaat en in het spel (groeit met de
  kalender, wuift, boeren maaien, de oogst brengt het graan binnen). Punt 2 en 2b: 45 soorten
  gebouwen (`js/gebouwen.js`) met bouwmenu, bevolking, handen, en een huis dat in vijf fases
  oprijst (`bouwfasen.cjs`). Punt 3: behoeften, tevredenheid en de winter (`js/behoeften.js`).
  Verder de interface (kalender, voorraad), de kale kaart met de es, het kijkgat, de maaier, en
  `Toren.debug.schermafdruk`. Details in `git log`.

- 23 sep 2026 — **Het nieuwe spel gekozen:** de schout, de heer en het dorp dat een stad wordt, met
  keuren, politiek en avontuur (`spel.md`). De laatste klim is vervallen.

- 22 sep 2026 — **De verhaaleditor kan quests** (`gereedschap/quests.html`): de fasen en wegen als
  boom met hun prijs ernaast, formulieren voor fase, weg, klaarAls en beloning, drie vormen om mee
  te beginnen die meteen de toets van drie antwoorden halen, en opslaan dat `js/quests.js`
  terugschrijft met de uitleg tussen de gegevens intact. Twee dingen die er beter uit kwamen dan
  gevraagd: de proef per fase zet een merkje bij **wie het merkt** (het vergelijkt met hoe het dorp
  zou praten zonder de quest), en de controle kijkt naast het tellen van routes ook of een gesprek
  de quest wel begint, of een weg wacht op iets wat niets geeft, en of wat in Tiled aan een fase
  hangt die fase ook heeft. Eén afwijking van het plan: het werd een tweede bladzijde naast
  gesprekken.html, met een link ertussen — waarom staat in `verhaal.md`.
  Erbij: `Toren.debug.quest('bakker', 'terug')` zet een quest in een fase zonder hem te spelen.

- 22 sep 2026 — **De koude oven, de eerste quest:** vier wegen die elk iets anders kosten (de kuil
  met wat erin huist, de vuurklei van de marskramer, de vuurstenen van de smidsvrouw, en een
  vuurschicht in de oven), met de gesprekken erbij en een toets die alle vier uitspeelt. Twee
  besluiten van Marcel: een gunst moet ook echt iets kosten, dus de smidsvrouw vraagt de eerste
  grondstof uit de toren; en je erft acht munten van de meester, zeven te weinig voor de
  marskramer. De bakker en de marskramer bestaan nu als wezen en lenen tot fase B2b het vel van
  Wim.

- 22 sep 2026 — **Het questsysteem, de regels:** quests als gegevens (`js/quests.js`) met de
  regels erachter (`js/quest.js`), goud naast de leeftijd, het vak linksboven dat nu ook van een
  quest kan zijn, en in Tiled `quest="bakker:zoeken"` op een voorwerp. Twee dingen die uit het
  bouwen kwamen: een weg door een quest is nu een ding in de gegevens met een `kost`, zodat
  `npm test` de toets van drie antwoorden bewaakt en het spel onthoudt *hoe* je iets oploste; en
  een spreuk kan een ding raken in plaats van alleen een wezen (`raak="oven"`), waarmee de
  toverweg van De koude oven kan bestaan zonder dat de oven een uitzondering wordt.

- 22 sep 2026 — Wachter voor gebouwen die elkaar overlappen: `npm run kaarten` klaagt als twee
  gebouwen van meer dan één tegel over elkaar staan.

- 22 sep 2026 — Huizenbouwer ronde 1 en 2: elke vorm (rechthoek, L, T; één, anderhalf en twee
  lagen, met riet dat in de kil doorloopt) en alle materialen (vakwerk, vlechtwerk, planken,
  blokhut, veldsteen; riet, spanen, leien, pannen; een wachttoren met plat dak). Platen in
  `gereedschap/pixelart/uit/proefhuis/`.

- 21 sep 2026 — **Eén doorlopende wereld:** `kaarten/wereld.tmj` met het erf (nu met randtegels)
  en het dorp op één kaart, en een strook ertussen voor het bos; de losse kaarten staan in
  `kaarten/oud/`. De camera volgt de held altijd, en om elke buitenkaart staat bos. De gebouwen
  staan op hun voet, en een tegelnummer verandert nooit meer.

- 21 sep 2026 — De meester in het spel: zes houdingen, een eigen leeftijd, en hij scharrelt bij
  zijn moestuin. Meldingen die zich herhalen worden één regel met een teller.
- 21 sep 2026 — Spreukanimaties met een worp, een vlucht en een inslag, en een grijze zucht die
  van de tovenaar opstijgt als hij betaalt (zie `spreuken.md`, "Je ziet de prijs gebeuren").
- 21 sep 2026 — Twaalf nieuwe gebouwen naar referentie één, met aanbouw en L-vorm; en
  tegelnummers die nooit meer verschuiven, zodat kaarten die Marcel tekent blijven kloppen.
- 21 sep 2026 — Fundering van de tutorial: `T.verouder` voor elk wezen, en een regieboek
  (`js/regie.js`) waarin overslaan dezelfde eindtoestand geeft als uitkijken.
- 21 sep 2026 — De verhaalsamenvatting in `CLAUDE.md` bijgewerkt; Wim is de knecht van de meester.
- 20 sep 2026 — Sprites in het spel; naar buiten lopen; wereld en dorp op referentie één; de
  toren op 8,7 tegels; randtegels met water en brug; elke kaart een gebied; gesprekken als
  gegevens met een editor; de spiraaltrap in drie staten.
