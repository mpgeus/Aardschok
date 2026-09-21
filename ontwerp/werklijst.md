# Werklijst: wat we doen, in welke volgorde

Begin een sessie hier. Bovenaan wat loopt, daaronder wat komt, in volgorde. Elk punt heeft een
"klaar als", zodat afwerken iets is wat je kunt nakijken. Een punt dat af is, gaat naar onderen
met een datum; een nieuw punt krijgt een plek met een reden.

**Waarom deze volgorde:** eerst wat Marcel vrijmaakt om zelf te bouwen, dan de lus die het spel
een spel maakt (quest → goud en grondstoffen → toren of jezelf → hoger), dan de inhoud, en pas
aan het eind de afwerking. Afwerking vóór de lus is poetsen aan iets wat nog niet werkt.

## Loopt nu

- **Plaatje en voetafdruk gelijk.** Marcel liep de schuur en de put in: de plaatjes van het erf
  en de toren zijn op het midden van hun voet verankerd, het spel zet ze op de achterste hoek, dus
  elk gebouw staat een halve voet verschoven ten opzichte van waar het blokkeert. Klaar als het
  rode vlak van de onbegaanbare tegels precies onder de muren ligt, de put zijn echte maat heeft,
  en een toets dit voortaan vangt.

## Direct daarna

- **Eén doorlopende wereld.** Klaar als `kaarten/wereld.tmj` de hele buitenwereld is: het erf (één
  keer gemaakt, met randtegels in plaats van de oude vierkante grond) en Marcels dorp op één doek,
  met ruimte voor het bos ertussen; de deur van de toren uitkomt op het erf in die wereld; er geen
  overgangen meer zijn tussen erf, bos en dorp; en Marcel verder tekent in dat ene bestand. Zie
  `kaarten.md`, "Buiten is één grote kaart". Pas na de voetafdrukken, want die zitten in dezelfde
  bestanden.


## Tegelijk: de huizenbouwer op ronde vormen

Vier rondes, elk een eigen agent, en na elke ronde een plaat om te beoordelen. Zie `beeld.md`,
"De huizenbouwer op ronde vormen".

1. **Vorm.** Klaar als de bouwer elke maat kan, de nok langs beide richtingen, één, anderhalf en
   twee lagen (met overkraging), en rechthoek, L en T met een doorlopende kil in het riet.
2. **Materiaal.** Klaar als er planken, vlechtwerk en blokhut zijn naast vakwerk en veldsteen, en
   spanen, leien en pannen naast riet.
3. **Uitbouwen.** Klaar als dakkapellen in het riet opgaan, en er erkers, aanbouwen, buitentrappen,
   luiken, bloembakken, schoorstenen en houten balkonnetjes zijn, plus losse tuinstukken (hek,
   hekje, groente, kruidenbed, bloemen, bankje) om zelf neer te zetten.
4. **In gebruik.** Klaar als de nieuwe huizen in `gebouwen.tsx` staan met de goede voet en het goede
   anker, achteraan in de volgorde, en het dorp ermee getekend kan worden.

## Marcel, tegelijk

- **Kaarten tekenen in Tiled:** het dorp, het bos, de weg ertussen. Elke kaart in `kaarten/` is
  vanzelf een gebied. Laat weten of de randtegels de goede kant op liggen.

## Daarna, in deze volgorde

1. **De tutorial.** Klaar als het spel op het erf begint; de meester in zijn moestuin werkt en je
   laat lopen, slaan, sluipen en een deur dichtgooien; een kraai van zijn kool schiet (97 wordt
   98), uit de fontein schept (weer 96) en een ton kapotmept met de staf (kost niets); er iets van
   boven de trap komt; hij sterft aan zijn laatste spreuk bij zijn moestuin; Wim om hem rouwt; en
   de oude openingsteksten ("na veertig jaar") zijn herschreven. Zie `verhaal.md`.
2. **Dorpelingen die er echt zijn.** Klaar als de negentien dorpelingen en de gewone
   `dorpeling(zaad)` loopanimaties hebben (en dus niet meer als Wim getekend worden), en er
   portretten zijn voor de gesprekken.
3. **Het questsysteem, met één quest helemaal af.** Klaar als quests gegevens zijn (zie
   `toren.md`), de stand van een quest een voorwaarde is in een gesprek, er goud bestaat, en één
   quest — bijvoorbeeld "De koude oven" — van begin tot eind speelt en de toets van drie antwoorden
   haalt.
4. **De verhaaleditor.** Klaar als het gesprekkengereedschap ook quests kan: vormen om mee te
   beginnen, alles op één plek, een proef per fase, controle die de routes telt, en de koppeling
   met Tiled. Zie `verhaal.md`, "Een quest moet makkelijk te bouwen zijn".
5. **Grondstoffen en de verdeelvraag.** Klaar als magische grondstoffen voorwerpen zijn die je aan
   de toren óf aan jezelf geeft (jaren terug), ze eindig zijn in de wereld, en je er per saldo op
   achteruitgaat. Zie `toren.md`.
6. **De toren in verdiepingen.** Klaar als elke verdieping een eigen gebied is met de spiraaltrap
   als overgang; zweven kan voor twee jaar (drie als de vloer weg is), je dan niets draagt en het
   iets boven stoort; en er een torenpaneel in doorsnede is waarin je herstelt. Zie `toren.md`.
7. **De eerste verdieping, helemaal af.** Klaar als één verdieping — bijvoorbeeld de kweekkamer —
   drie geloofwaardige antwoorden heeft die verschillend kosten, en na herstel iets anders wordt
   (een kruidentuin).
8. **Verdorren.** Klaar als de spreuk er is met zijn vier regels (wat je verdort komt nooit terug,
   alleen buiten een gevecht, opbrengst naar hoeveel leven erin zit, meesterschap geeft toegang
   maar geen grotere opbrengst), er dieren zijn om te verdorren, en het dorp het ziet. Zie
   `spreuken.md`.
9. **Vergeten door ouderdom, en een dorp dat het ziet.** Klaar als meesterschap terugzakt als je een
    spreuk laat versloffen, en dorpelingen reageren op je leeftijd — ouder én jonger.
10. **Hoogte.** Klaar als er een hoogtelaag is in Tiled, rotswanden vanzelf worden afgeleid, en
    lopen alleen kan bij gelijke hoogte of over een helling. Zie `kaarten.md`.
11. **Kelders en mijnen.** Klaar als de grijze binnenbouwdoos er is (trap omlaag, ladder, rooster,
    ingestorte vloer, stalagmieten, vuur, botten, begroeide muren) en er één mijn te bezoeken is.
    Zie `beeld.md`.
12. **Een andere tovenaarstoren.** Klaar als er één te bezoeken is, met een eigen oude eigenaar,
    een eigen probleem en eigen grondstoffen.
13. **De leerling.** Klaar als de quest met de jongen er is en hij met je meegaat, met zijn drie
    remmen. Zie `verhaal.md`.
14. **Opslaan, titelscherm, instellingen, geluid.** Klaar als het spel een avond te spelen is en
    niets op de lijst "wat het browserig laat voelen" nog geldt. Zie `verpakken.md`.
15. **Verpakken.** Klaar als er een programma is dat vanuit Steam start. Zie `verpakken.md`.

## Klein, tussendoor als het past

- **Kringen en leeftijd:** de beste speler krijgt nu de minste spreuken. Kiezen uit de vier
  richtingen in `spreuken.md`. Moet vóór het verdorren besloten zijn.
- **Omheiningen die je schildert:** tuinhek, palissade, haag, aarden wal met vlechtwerk, en een
  hekje, als een eigen laag met een terreinset in Tiled. Eén systeem, later ook voor een stadsmuur.
  Zie `wereld.md`, "Een dorp heeft geen muur".
- **Kinderkopjes** in plaats van platte kasseien: bolle ronde keien met mos in de voegen. Zie
  `beeld.md`. Alleen de tekening van `rand.tsx` verandert, dus bestaande paden gaan vanzelf mee.
- **Windwijzer en schoorsteenrook** als losse elementen, zodat ze met de wind meebewegen.
- **Lage begroeiing op de erfkaart:** grassprieten, varens en bloemen staan er nog niet op.
- **Bewegende omgeving:** vlammen, water, stof in het licht.

## Af

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
