# Werklijst: wat we doen, in welke volgorde

Begin een sessie hier. Bovenaan wat loopt, daaronder wat komt, in volgorde. Elk punt heeft een
"klaar als", zodat afwerken iets is wat je kunt nakijken. Een punt dat af is, gaat naar onderen
met een datum; een nieuw punt krijgt een plek met een reden.

**Waarom deze volgorde:** eerst wat Marcel vrijmaakt om zelf te bouwen, dan de lus die het spel
een spel maakt (quest → goud en grondstoffen → toren of jezelf → hoger), dan de inhoud, en pas
aan het eind de afwerking. Afwerking vóór de lus is poetsen aan iets wat nog niet werkt.

## Loopt nu

- **Meer huizen naar referentie één** — klaar als er zo'n twaalf nieuwe gebouwen zijn die niet op
  elkaar lijken, in `tegels/gebouwen.tsx` met de juiste voetafdruk, en in het spel te tekenen.
- **Fundering van de tutorial** — klaar als `T.verouder` ook een ander wezen dan de held ouder en
  jonger kan maken (met sterven maar zonder einde van het spel), en er een regieboek is waarmee
  een scène leest als gewone code, met een toets om over te slaan.

## Marcel, tegelijk

- **Kaarten tekenen in Tiled:** het dorp, het bos, de weg ertussen. Elke kaart in `kaarten/` is
  vanzelf een gebied. Laat weten of de randtegels de goede kant op liggen.

## Daarna, in deze volgorde

1. **De meester in het spel.** Klaar als zijn animaties in `beelden/` staan, hij een wezen is met
   een eigen leeftijd die boven zijn hoofd staat, en hij rondscharrelt bij zijn moestuin.
2. **Spreukanimaties.** (Marcel, 21 sep 2026.) Klaar als de vuurschicht, het dwaallicht en de
   windstoot echte animaties hebben in plaats van de getekende vlakjes van nu: een worp, een vlucht
   en een inslag, in ons palet en met pixels, niet met zachte gloed. **En je ziet de prijs gebeuren:**
   op het moment dat de schicht vertrekt, gaat er iets grijs van de tovenaar af — een zucht, een
   schaduw van ouderdom — zodat het jaar niet alleen een getal is maar iets wat je hem ziet kosten.
   Dit gaat vóór de tutorial, want daar moet die eerste schicht op de kraai indruk maken.
3. **De tutorial.** Klaar als het spel op het erf begint; de meester in zijn moestuin werkt en je
   laat lopen, slaan, sluipen en een deur dichtgooien; een kraai van zijn kool schiet (97 wordt
   98), uit de fontein schept (weer 96) en een ton kapotmept met de staf (kost niets); er iets van
   boven de trap komt; hij sterft aan zijn laatste spreuk bij zijn moestuin; Wim om hem rouwt; en
   de oude openingsteksten ("na veertig jaar") zijn herschreven. Zie `verhaal.md`.
4. **Dorpelingen die er echt zijn.** Klaar als de negentien dorpelingen en de gewone
   `dorpeling(zaad)` loopanimaties hebben (en dus niet meer als Wim getekend worden), en er
   portretten zijn voor de gesprekken.
5. **Het questsysteem, met één quest helemaal af.** Klaar als quests gegevens zijn (zie
   `toren.md`), de stand van een quest een voorwaarde is in een gesprek, er goud bestaat, en één
   quest — bijvoorbeeld "De koude oven" — van begin tot eind speelt en de toets van drie antwoorden
   haalt.
6. **De verhaaleditor.** Klaar als het gesprekkengereedschap ook quests kan: vormen om mee te
   beginnen, alles op één plek, een proef per fase, controle die de routes telt, en de koppeling
   met Tiled. Zie `verhaal.md`, "Een quest moet makkelijk te bouwen zijn".
7. **Grondstoffen en de verdeelvraag.** Klaar als magische grondstoffen voorwerpen zijn die je aan
   de toren óf aan jezelf geeft (jaren terug), ze eindig zijn in de wereld, en je er per saldo op
   achteruitgaat. Zie `toren.md`.
8. **De toren in verdiepingen.** Klaar als elke verdieping een eigen gebied is met de spiraaltrap
   als overgang; zweven kan voor twee jaar (drie als de vloer weg is), je dan niets draagt en het
   iets boven stoort; en er een torenpaneel in doorsnede is waarin je herstelt. Zie `toren.md`.
9. **De eerste verdieping, helemaal af.** Klaar als één verdieping — bijvoorbeeld de kweekkamer —
   drie geloofwaardige antwoorden heeft die verschillend kosten, en na herstel iets anders wordt
   (een kruidentuin).
10. **Verdorren.** Klaar als de spreuk er is met zijn vier regels (wat je verdort komt nooit terug,
   alleen buiten een gevecht, opbrengst naar hoeveel leven erin zit, meesterschap geeft toegang
   maar geen grotere opbrengst), er dieren zijn om te verdorren, en het dorp het ziet. Zie
   `spreuken.md`.
11. **Vergeten door ouderdom, en een dorp dat het ziet.** Klaar als meesterschap terugzakt als je een
    spreuk laat versloffen, en dorpelingen reageren op je leeftijd — ouder én jonger.
12. **Hoogte.** Klaar als er een hoogtelaag is in Tiled, rotswanden vanzelf worden afgeleid, en
    lopen alleen kan bij gelijke hoogte of over een helling. Zie `kaarten.md`.
13. **Kelders en mijnen.** Klaar als de grijze binnenbouwdoos er is (trap omlaag, ladder, rooster,
    ingestorte vloer, stalagmieten, vuur, botten, begroeide muren) en er één mijn te bezoeken is.
    Zie `beeld.md`.
14. **Een andere tovenaarstoren.** Klaar als er één te bezoeken is, met een eigen oude eigenaar,
    een eigen probleem en eigen grondstoffen.
15. **De leerling.** Klaar als de quest met de jongen er is en hij met je meegaat, met zijn drie
    remmen. Zie `verhaal.md`.
16. **Opslaan, titelscherm, instellingen, geluid.** Klaar als het spel een avond te spelen is en
    niets op de lijst "wat het browserig laat voelen" nog geldt. Zie `verpakken.md`.
17. **Verpakken.** Klaar als er een programma is dat vanuit Steam start. Zie `verpakken.md`.

## Klein, tussendoor als het past

- **Kringen en leeftijd:** de beste speler krijgt nu de minste spreuken. Kiezen uit de vier
  richtingen in `spreuken.md`. Moet vóór het verdorren besloten zijn.
- **Windwijzer en schoorsteenrook** als losse elementen, zodat ze met de wind meebewegen.
- **Lage begroeiing op de erfkaart:** grassprieten, varens en bloemen staan er nog niet op.
- **Bewegende omgeving:** vlammen, water, stof in het licht.

## Af

- 21 sep 2026 — De verhaalsamenvatting in `CLAUDE.md` bijgewerkt; Wim is de knecht van de meester.
- 20 sep 2026 — Sprites in het spel; naar buiten lopen; wereld en dorp op referentie één; de
  toren op 8,7 tegels; randtegels met water en brug; elke kaart een gebied; gesprekken als
  gegevens met een editor; de spiraaltrap in drie staten.
