# Werklijst: wat we doen, in welke volgorde

Begin een sessie hier. Bovenaan staat de stand: wat loopt, wat op Marcel wacht, en wat klaarstaat.
Daaronder komt wat volgt, in volgorde. Elk punt heeft een "klaar als", zodat afwerken iets is wat
je kunt nakijken. Een punt dat af is, gaat naar onderen met een datum; een nieuw punt krijgt een
plek met een reden. **De stand wordt aan het eind van elke sessie bijgewerkt,** zodat een nieuwe
sessie meteen weet waar we zijn.

**Waarom deze volgorde:** eerst wat Marcel vrijmaakt om zelf te bouwen, dan de lus die het spel
een spel maakt (quest → goud en grondstoffen → toren of jezelf → hoger), dan de inhoud, en pas
aan het eind de afwerking. Afwerking vóór de lus is poetsen aan iets wat nog niet werkt.

## De stand (einde sessie 22 sep 2026)

**Loopt nu:** niets. Er draait geen agent.

**Alles staat op `main`.** De sessie van 22 sep draaide in de cloud en werkte op de tak
`claude/aardschok-quest-system-ywvpe7`; die is aan het eind in `main` gezet en gepusht, dus er
staat niets meer los en de tak mag weg. Werk gewoon op `main`, zoals CLAUDE.md zegt.

**Nieuw sinds 22 sep: `gereedschap/wereld.html`.** Open het met `npm start` op
`http://localhost:8123/gereedschap/wereld.html`, of via de link bovenin de twee andere
gereedschappen. Rondes 1, 2 en 4 staan erin: kijken, neerzetten en de controle.

**Tiled tekent voortaan alleen nog de grond** (besluit van Marcel, 22 sep; `kaarten.md`). Mensen,
deuren, geheime doorgangen, aansluitingen en questvoorwerpen zet je hier neer, en ze gaan naar
`kaarten/<naam>.betekenis.json` — een eigen bestand waar Tiled nooit in komt. Wat er al stond, is
verhuisd: `wereld.tmj`, `proef.tmj` en `proefbos.tmj` houden alleen nog tekening. Na Opslaan
bundelt het blad zelf, dus het spel ziet het meteen.

**Een poppetje aanklikken geeft zijn gesprek én zijn quest** (ronde 3, af): dubbelklik hem, of
gebruik de knoppen in het tegelpaneel, en er schuift een breed paneel over de kaart met twee
tabbladen — de hele bewerkers uit `gesprekken.html` en `quests.html`, niet nagemaakt maar
hergebruikt. Geeft hij nog geen gesprek of quest, dan biedt het paneel aan er een te beginnen.
Aanwijzen gaat op zijn lijf, niet op zijn voeten, net als in het spel. Een questvoorwerp hang je
aan een fase met twee keuzelijsten, en de kaart springt mee naar die fase.

**Elke dorpeling kan zijn eigen gesprek hebben** (22 sep). Het spel zocht op `soort`, en die is
voor elke dorpeling met een zaad gewoon "dorpeling" — negentien dorpelingen zouden dus alle
negentien hetzelfde zeggen. Nu beslist `T.gesprekIdVan` (`js/gesprek.js`): zijn soort, tenzij er
`gesprek` op staat. In het gereedschap kies je dat uit een lijst, en "een gesprek beginnen" voor
een dorpeling vraagt om een eigen naam.

**De controle kijkt ook of je er kunt komen** (22 sep): een vlekvulling vanaf elke uitgang, met de
loopregels van het spel zelf. Een poppetje op een eilandje achter de bomen is een fout; losse
tegels zijn een "let op" (op `wereld.tmj` 767 van de 6330 — gaten in het bos). Laag `o`.

**Het gereedschap is daarmee af voor wat het moest doen.** Wat nu volgt is het gebruiken: De koude
oven neerzetten, en daarna de negentien dorpelingen.

**Tempo:** gewoon door. Marcel maakt het niet uit of de week vandaag of vrijdag op is (22 sep).
Bekijk wel de vijfuursgrens voor je een zware agent start, zodat hij niet halverwege stilvalt.

**Wacht op Marcel:**
- Opmerkingen bij het draaiboek van de tutorial (gestuurd op 22 sep; de teksten staan in
  `T.TUTORIAL_TEKST` in `js/gesprekken.js`).
- In Tiled: het vel `tuin` aan `wereld.tmj` toevoegen. (De vier varens rond (51–52, 45–46) zijn op
  22 sep verhuisd naar `objecten`, met gras eronder; `npm run kaarten` klaagt nergens meer over.)
- **De koude oven neerzetten**, nu met `gereedschap/wereld.html` (niet meer in Tiled). Zet
  "Bewerken" aan; de controle rechts zegt wat er ontbreekt en die regels verdwijnen terwijl je
  neerzet. Het gaat om: de bakker, de marskramer en de smidsvrouw in het dorp; een leemkuil bij
  de beek met de leem erin (voorwerp met `quest` = `bakker:zoeken`) en iets wat daar huist; en de
  oven van de bakker met `raak` = `oven` op een tegel waar je bij kunt.

**Klaar om te starten, in deze volgorde.** Bekijk eerst de meter (`get_usage`) als je een agent
start; de onderste drie zijn renderwerk en dus zwaar.

1. **De koude oven neerzetten met het nieuwe gereedschap** (zie "Wacht op Marcel" hierboven).
   Dat is het eerste echte gebruik: de bakker, de marskramer en de smidsvrouw in het dorp, de
   leemkuil met de leem erin, en de oven met zijn raakpunt. De controle rechts telt af terwijl je
   het doet. **Daarna:** de negentien dorpelingen.
2. Ronde 4b: de huizen in Tiled (zie de huizenbouwer hieronder). Renderwerk.
3. Fase B2b: de zeven vaklieden en meer gewone dorpelingen. Daar horen nu ook de bakker en de
   marskramer bij: die lenen het vel van Wim tot dit af is. Renderwerk.
4. Fase B3: de portretten in de gesprekken. De bakker, de marskramer en de smidsvrouw hebben er
   ook nog geen. Renderwerk.

**Het laatst af (22 sep):**
- het wereldgereedschap, alle vier de rondes (`gereedschap/wereld.html`), en de verhuizing van de
  betekenis uit Tiled;
- het questsysteem, De koude oven, en de verhaaleditor die quests kan;
- de tutorial, met Marcels keuzes erin;
- huizenbouwer ronde 3 en 4a: uitbouwen, tuinstukken en hekjes in Tiled;
- twaalf dorpelingen die lopen, met knieën.

**Niet vergeten, want het is nu nog gratis:** de schuld aan de smidsvrouw (`schuldSmidsvrouw`).
Zij vraagt de eerste grondstof uit de toren, en tot het punt over grondstoffen die schuld kan
innen, kost haar weg door De koude oven de speler niets. Dan haalt die quest de toets van drie
antwoorden alleen op papier.

Details staan bij de punten hieronder en in `git log`.

## Tegelijk: de huizenbouwer op ronde vormen

Vier rondes, elk een eigen agent, en na elke ronde een plaat om te beoordelen. Zie `beeld.md`,
"De huizenbouwer op ronde vormen".

1. **Vorm** (af, 21 sep). Klaar als de bouwer elke maat kan, de nok langs beide richtingen, één, anderhalf en
   twee lagen (met overkraging), en rechthoek, L en T met een doorlopende kil in het riet.
2. **Materiaal** (af, 22 sep). Klaar als er planken, vlechtwerk en blokhut zijn naast vakwerk en veldsteen, en
   spanen, leien en pannen naast riet.
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
   Ronde 3 was één lange agent (235 stappen), dus ronde 4 gaat in twee stukken: **4a** (af, 22 sep) de hekjes
   van wilgentenen en latten (`beeld.md`) en de tuinstukken als eigen vel in Tiled; **4b** de
   huizen in `gebouwen.tsx`.

## Marcel, tegelijk

- **Kaarten tekenen in Tiled:** het dorp, het bos, de weg ertussen. Elke kaart in `kaarten/` is
  vanzelf een gebied. Laat weten of de randtegels de goede kant op liggen.

## Daarna, in deze volgorde

1. **De tutorial.** Klaar als het spel op het erf begint; de meester in zijn moestuin werkt en je
   laat lopen, slaan, sluipen en een deur dichtgooien; een vuurschicht op een oude ton schiet (97
   wordt 98), uit de fontein drinkt (weer 96) en de ton kapotmept met de staf (kost niets); er iets
   van boven de trap komt; hij sterft aan zijn laatste spreuk bij zijn moestuin; Wim om hem rouwt;
   en de oude openingsteksten ("na veertig jaar") zijn herschreven. Zie `verhaal.md`.
   **Stand (22 sep):** speelbaar van begin tot eind, met Marcels keuzes erin: er blijft één slok
   in de fontein, en wie te lang wegblijft, vindt de meester dood terug. Nog te doen: de teksten
   poetsen (`T.TUTORIAL_TEKST` in `js/gesprekken.js`), voelen hoe lang "te lang weg" is (`WEG` in
   `js/tutorial.js`), en een droge fontein in de kunst (hij rimpelt niet meer, maar toont nog water).
2. **Dorpelingen die er echt zijn.** Klaar als de negentien dorpelingen en de gewone
   `dorpeling(zaad)` loopanimaties hebben (en dus niet meer als Wim getekend worden), en er
   portretten zijn voor de gesprekken.
   **Fase A (af, 22 sep):** de smid en twee gewone dorpelingen lopen en ademen, ook in het spel
   (`T.WEZENS.smid`, en een `zaad` kiest zijn vel). Plaat: `uit/dorpelingen/lopen-proef.png`.
   **Besloten:** knieën, zoals bij Wim (Marcel, 22 sep; `wereld.md`). Fase B in korte stukken:
   - B1 (af, 22 sep): knieën voor de smid en de twee gewone dorpelingen. De uitleg staat boven de
     sectie "lopen en staan" in `dorpelingen.cjs`, met de smid als voorbeeld.
   - B2a (af, 22 sep): de herbergierster, de boer, de dorpsoudste en de acht uit
     `dorpelingen2.cjs`. Plaat: `uit/dorpelingen/lopen-proef-b2a.png`.
   - B2b: de zeven vaklieden uit `dorpelingen3.cjs` (daar neemt `been()` de knie al mee), en meer
     gewone varianten (`dorpeling2`, … in `dorpelingen-anim.cjs`).
   - B3: de portretten in de gesprekken.
3. **Het questsysteem, met één quest helemaal af.** Klaar als quests gegevens zijn (zie
   `toren.md`), de stand van een quest een voorwaarde is in een gesprek, er goud bestaat, en één
   quest — bijvoorbeeld "De koude oven" — van begin tot eind speelt en de toets van drie antwoorden
   haalt.
   **Stand (22 sep):** af, op het neerzetten na. De regels staan er en zijn getoetst — fasen en
   wegen, goud, het vak linksboven, de Tiled-eigenschappen `quest` en `raak`, en `T.keurQuests`,
   dat de toets van drie antwoorden door `npm test` laat bewaken. De koude oven is geschreven, met
   de gesprekken van de bakker, de marskramer en de smidsvrouw, en `test/quest.test.cjs` speelt
   alle vier de wegen uit. Wat rest is Tiled (zie "Wacht op Marcel").
4. **Het wereldgereedschap: Tiled houdt de grond, wij de betekenis** (Marcel, 22 sep 2026). Klaar
   als je de kaart in de browser ziet met alles wat betekenis heeft erop — mensen,
   questvoorwerpen, raakpunten, overgangen — ze daar kunt neerzetten en verslepen, hun gesprek en
   hun quest in hetzelfde scherm kunt bewerken, en één controle zegt wat er aan de kaart mankeert.
   Vier rondes; zie `kaarten.md`, "Een wereldgereedschap naast Tiled". **Hoort hier hoog, want het
   verdient zich terug op het neerzetten van de negentien dorpelingen en van De koude oven — doe
   je dat eerst met de hand, dan komt het te laat.**
   **Stand (22 sep):** rondes 1, 2 en 4 zijn af, als `gereedschap/wereld.html`. Marcels besluit
   van die dag — *"alleen basislaag uit Tiled halen en de rest moet hier; hier maken we eigenlijk
   het echte spel"* — is uitgevoerd: de betekenis staat in `kaarten/<naam>.betekenis.json`, een
   eigen bestand waar Tiled nooit in komt, en het gereedschap zet neer, versleept en haalt weg.
   Een aansluiting leg je in één handeling over twee kaarten. Een geheime doorgang bestaat nu ook
   in het spel zelf (`staat: "geheim"` met een `als`; `T.werkGeheimenBij` in `js/quest.js`). De
   controle staat los in `gereedschap/keuring.js` met `test/keuring.test.cjs` eromheen.
   Ronde 3 staat er ook: dubbelklik een poppetje en zijn gesprek én zijn quest staan in een
   paneel over de kaart, met de bewerkers uit `gesprekken-tool.js` en `quests-tool.js` zelf —
   dezelfde bewerkers, niet een tweede stel. Alle vier de rondes zijn daarmee af.

   **Opslaan is veilig geworden (22 sep).** Het was dat niet: de gespreksbewerker schreef
   `js/gesprekken.js` helemaal opnieuw en kende `T.TUTORIAL_TEKST` niet, dus wiste één keer
   opslaan het hele draaiboek van de tutorial. Nu knipt `gereedschap/bronblok.js` een bestand in
   kop, blok en staart en wordt alleen het blok herschreven. Ook het commentaar blijft staan, tot
   op de losse tekstregel: van 21 verloren opmerkingen naar geen enkele.

5. **De verhaaleditor.** Klaar als het gesprekkengereedschap ook quests kan: vormen om mee te
   beginnen, alles op één plek, een proef per fase, controle die de routes telt, en de koppeling
   met Tiled. Zie `verhaal.md`, "Een quest moet makkelijk te bouwen zijn".
   **Stand (22 sep):** gebouwd als `gereedschap/quests.html`. Alle vijf de eisen zitten erin; de
   gaten staan in `verhaal.md` onder "Stand": twee van de vijf vormen ontbreken nog, en raakpunten
   zijn wel te controleren maar niet te bewerken.
6. **Grondstoffen en de verdeelvraag.** Klaar als magische grondstoffen voorwerpen zijn die je aan
   de toren óf aan jezelf geeft (jaren terug), ze eindig zijn in de wereld, en je er per saldo op
   achteruitgaat. Zie `toren.md`.
   **Hoort hier meteen bij:** de schuld aan de smidsvrouw (`schuldSmidsvrouw`, gezet door De koude
   oven). Zij vraagt de eerste grondstof uit de toren. Zolang die niet verzilverd wordt, is haar
   weg door de quest gratis, en dan klopt de toets van drie antwoorden alleen op papier.
7. **De toren in verdiepingen.** Klaar als elke verdieping een eigen gebied is met de spiraaltrap
   als overgang; zweven kan voor twee jaar (drie als de vloer weg is), je dan niets draagt en het
   iets boven stoort; en er een torenpaneel in doorsnede is waarin je herstelt. Zie `toren.md`.
8. **De eerste verdieping, helemaal af.** Klaar als één verdieping — bijvoorbeeld de kweekkamer —
   drie geloofwaardige antwoorden heeft die verschillend kosten, en na herstel iets anders wordt
   (een kruidentuin).
9. **Verdorren.** Klaar als de spreuk er is met zijn vier regels (wat je verdort komt nooit terug,
   alleen buiten een gevecht, opbrengst naar hoeveel leven erin zit, meesterschap geeft toegang
   maar geen grotere opbrengst), er dieren zijn om te verdorren, en het dorp het ziet. Zie
   `spreuken.md`.
10. **Vergeten door ouderdom, en een dorp dat het ziet.** Klaar als meesterschap terugzakt als je een
    spreuk laat versloffen, en dorpelingen reageren op je leeftijd — ouder én jonger.
11. **Hoogte.** Klaar als er een hoogtelaag is in Tiled, rotswanden vanzelf worden afgeleid, en
    lopen alleen kan bij gelijke hoogte of over een helling. Zie `kaarten.md`.
12. **Kelders en mijnen.** Klaar als de grijze binnenbouwdoos er is (trap omlaag, ladder, rooster,
    ingestorte vloer, stalagmieten, vuur, botten, begroeide muren) en er één mijn te bezoeken is.
    Zie `beeld.md`.
13. **Een andere tovenaarstoren.** Klaar als er één te bezoeken is, met een eigen oude eigenaar,
    een eigen probleem en eigen grondstoffen.
14. **De leerling.** Klaar als de quest met de jongen er is en hij met je meegaat, met zijn drie
    remmen. Zie `verhaal.md`.
15. **Opslaan, titelscherm, instellingen, geluid.** Klaar als het spel een avond te spelen is en
    niets op de lijst "wat het browserig laat voelen" nog geldt, en wie opnieuw begint de
    tutorial kan overslaan. Zie `verpakken.md`.
16. **Verpakken.** Klaar als er een programma is dat vanuit Steam start. Zie `verpakken.md`.

## Klein, tussendoor als het past

- **Kringen en leeftijd:** de beste speler krijgt nu de minste spreuken. Kiezen uit de vier
  richtingen in `spreuken.md`. Moet vóór het verdorren besloten zijn.
- **Een omheining is geen blok** (om samen te bespreken). Het kerkhof, de kippenren en de moestuin
  staan in het spel als één vast blok, dus je kunt niet tussen de graven lopen, en een boomstronk
  die Marcel binnen de kerkhofmuurtjes zette, staat technisch "in" het kerkhof. Een omheining zou
  alleen zijn rand vast moeten hebben.
- **Omheiningen die je schildert:** tuinhek, palissade, haag, aarden wal met vlechtwerk, en een
  hekje, als een eigen laag met een terreinset in Tiled. Eén systeem, later ook voor een stadsmuur.
  Zie `wereld.md`, "Een dorp heeft geen muur".
- **Kinderkopjes** in plaats van platte kasseien: bolle ronde keien met mos in de voegen. Zie
  `beeld.md`. Alleen de tekening van `rand.tsx` verandert, dus bestaande paden gaan vanzelf mee.
- **Windwijzer en schoorsteenrook** als losse elementen, zodat ze met de wind meebewegen.
- **Lage begroeiing op de erfkaart:** grassprieten, varens en bloemen staan er nog niet op.
- **Bewegende omgeving:** vlammen, water, stof in het licht.

## Af

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
