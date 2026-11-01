# Hunyuan3D-2: het textuurmodel ophalen (Marcel, 31 okt: "pak ook dat texture pack maar"). De mappen hunyuan3d-paint-v2-0 en hunyuan3d-delight-v2-0 uit tencent/Hunyuan3D-2, op een vaste revisie, zonder dubbele
# bestanden (safetensors waar die er is), met de hash van Hugging Face nagekeken. Hervat waar het gebleven was. Alleen standaardbibliotheek, en curl voor het grote werk.
#
#   python hy_model_ophalen.py <doelmap> [repo=.. rev=.. mappen=a/,b/ zonder=naam,naam]
# Marcel, 31 okt: TripoSplat op dezelfde manier (VAST-AI/TripoSplat, MIT).
import hashlib
import json
import os
import subprocess
import sys
import urllib.request

REPO, REV = 'tencent/Hunyuan3D-2', '9cd649ba6913f7a852e3286bad86bfa9a2d83dcf'
MAPPEN = ('hunyuan3d-paint-v2-0/', 'hunyuan3d-delight-v2-0/')


def main():
    doel = sys.argv[1]
    arg = dict(a.split('=', 1) for a in sys.argv[2:])
    repo, rev = arg.get('repo', REPO), arg.get('rev', REV)
    mappen = tuple(arg['mappen'].split(',')) if 'mappen' in arg else MAPPEN
    zonder = arg.get('zonder', '').split(',')
    d = json.load(urllib.request.urlopen(f'https://huggingface.co/api/models/{repo}/revision/{rev}?blobs=true'))
    alle = {s['rfilename']: s for s in d['siblings'] if s['rfilename'].startswith(mappen) and os.path.basename(s['rfilename']) not in zonder}
    lijst = []
    for n, s in alle.items():
        # een .bin met een .safetensors ernaast is dubbel
        if n.endswith('pytorch_model.bin') and n.replace('pytorch_model.bin', 'model.safetensors') in alle:
            continue
        if n.endswith('diffusion_pytorch_model.bin') and n.replace('.bin', '.safetensors') in alle:
            continue
        lijst.append(s)
    totaal = sum(s['size'] for s in lijst)
    print(f'{len(lijst)} bestanden, {totaal / 1e9:.2f} GB')
    for s in sorted(lijst, key=lambda x: x['size']):
        n = s['rfilename']
        pad = os.path.join(doel, n)
        os.makedirs(os.path.dirname(pad), exist_ok=True)
        sha = s['lfs']['sha256'] if s.get('lfs') else None
        if os.path.exists(pad) and os.path.getsize(pad) == s['size']:
            print('al aanwezig', n)
        else:
            url = f'https://huggingface.co/{repo}/resolve/{rev}/{n}'
            subprocess.run(['curl', '-L', '--fail', '--retry', '8', '--retry-delay', '10', '-C', '-', '-sS', '-o', pad, url], check=True)
        if sha:
            h = hashlib.sha256()
            with open(pad, 'rb') as f:
                for blok in iter(lambda: f.read(1 << 22), b''):
                    h.update(blok)
            if h.hexdigest() != sha:
                raise SystemExit(f'HASH FOUT {n}: {h.hexdigest()} tegen {sha}')
            print('goed', n, f'{s["size"] / 1e9:.2f} GB', sha[:12])
        else:
            print('klaar', n)
    print('OPHALEN KLAAR')


if __name__ == '__main__':
    main()
