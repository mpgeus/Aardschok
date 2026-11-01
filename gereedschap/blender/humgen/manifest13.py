# Ronde 13 (Marcel, 29 okt: "Assetmanifest: per asset naam, maker, URL, licentie, bestandsformaat, downloadstatus,
# checksums, lokale paden, gebruikte onderdelen, eventuele attributieverplichtingen"): één manifest voor alle externe
# assets van de ronde, in assets/extern/ronde13/asset-manifest.json:
# - de kleding van Human Generator die we al hadden (lokaal, de licentie van Human Generator);
# - de CC0-sets van ambientCG die deze ronde zijn gedownload (hun eigen manifest.json, met checksums);
# - de kandidaten uit het onderzoek die niet zijn gedownload (login nodig, betaald, of een licentie die het niet toelaat).
#
#   python gereedschap/blender/humgen/manifest13.py <kandidaten.json>
import glob
import hashlib
import json
import os
import sys

WORTEL = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
A = os.path.join(WORTEL, 'assets', 'extern', 'ronde13')
HG = r'C:\Users\mpgeu\Downloads\Gen1\HUMAN GEN 4'
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()
HG_LICENTIE = ('Human Generator Asset License (royalty free): een personage dat ermee is gemaakt, mag in een verkocht spel '
               'met de commerciële licentie; de bestanden zelf niet delen. Welke licentie Marcel heeft, is nog open.')


def main():
    uit = []
    for naam, pad, onderdelen, gebruik in (
            ('Frosty Evening (parka)', r'outfits\male\Winter\Frosty_Evening.blend', ['HG_Parka_Male'],
             'experiment A: de gambeson (r13-A); verworpen, zie overdracht.md'),
            ('Pirate (hemd)', r'outfits\male\Extra Outfits Pack\Pirate.blend', ['HG_Pirate_Shirt'],
             'experiment B: de tabberd (r13-B); verworpen in deze vorm, zie overdracht.md'),
            ('Pirate Boots', r'footwear\male\Extra Outfits Pack\Pirate Boots.blend', ['HG_Pirate_Boots'],
             'bekeken (bronrender); niet gebruikt: lage laarzen, niet het ontwerp van de speerman')):
        p = os.path.join(HG, pad)
        uit.append({'naam': naam, 'maker': 'Human Generator (Superhive)', 'url': 'https://superhivemarket.com (Human Generator 4)',
                    'licentie': HG_LICENTIE, 'formaat': '.blend (met texturen van 1K tot 4K)', 'downloadstatus': 'al lokaal (pakketten van Marcel)',
                    'lokaal': p, 'sha256': sha(p) if os.path.exists(p) else None, 'onderdelen': onderdelen, 'gebruik': gebruik,
                    'naamsvermelding': 'niet verplicht'})
    for m in sorted(glob.glob(os.path.join(A, '*', '*', 'manifest.json'))):
        d = json.load(open(m, encoding='utf-8'))
        d['downloadstatus'] = 'gedownload'
        d['lokaal'] = os.path.dirname(m)
        uit.append(d)
    gedaan = {x['naam'] for x in uit}
    for k in json.load(open(sys.argv[1], encoding='utf-8')):
        if k.get('naam') in gedaan:
            continue
        uit.append({'naam': k.get('naam'), 'maker': k.get('maker'), 'url': k.get('url'), 'prijs': k.get('prijs'), 'licentie': k.get('licentie'),
                    'downloadstatus': 'niet gedownload: ' + str(k.get('downloadstatus')), 'formaten': k.get('formaten'), 'driehoeken': k.get('driehoeken'),
                    'wat_voor': k.get('wat_voor'), 'opmerking': k.get('opmerking')})
    json.dump({'_uitleg': 'ronde 13: alle externe assets, met hun herkomst en licentie (manifest13.py)', 'assets': uit},
              open(os.path.join(A, 'asset-manifest.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('MANIFEST', len(uit), sum(1 for x in uit if x.get('downloadstatus') == 'gedownload'))


if __name__ == '__main__':
    main()
