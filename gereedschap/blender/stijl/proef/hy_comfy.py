# Hunyuan3D-2mv in ComfyUI: vier aanzichten naar één mesh, met de instellingen van het eigen sjabloon van ComfyUI
# (3d_hunyuan3d_multiview_to_model.json). ComfyUI moet draaien op 127.0.0.1:8188.
#
#   python hy_comfy.py <uitmap> [naam=speerman] [zaad=1] [stappen=20] [cfg=7.5] [octree=256] [drempel=0.6] [resolutie=3072] [aanzichten=front,left,back,right] [invoer=invoer] [wissel]
# leest <uitmap>/<invoer>/, schrijft <uitmap>/<naam>.glb en <naam>.json (tijd, piek van VRAM en RAM). `wissel` verwisselt
# links en rechts, voor als het model de kanten andersom leest.
import json
import os
import shutil
import subprocess
import sys
import threading
import time
import urllib.request

import psutil

COMFY = 'http://127.0.0.1:8188'
BASIS = 'C:/ComfyUI/ComfyUI_windows_portable/ComfyUI'
MODEL = 'hunyuan3d-dit-v2-mv_fp16.safetensors'
SJABLOON = {'zaad': 1, 'stappen': 20, 'cfg': 7.5, 'sampler': 'euler', 'planner': 'normal', 'resolutie': 3072, 'brokken': 8000, 'octree': 256, 'drempel': 0.6, 'algoritme': 'surface net'}


def post(pad, data):
    req = urllib.request.Request(COMFY + pad, data=json.dumps(data).encode(), headers={'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(req))


def get(pad):
    return json.load(urllib.request.urlopen(COMFY + pad))


def opdracht(I, naam, wissel, aanzichten, map_invoer):
    bron = {'front': 'front', 'left': 'right' if wissel else 'left', 'back': 'back', 'right': 'left' if wissel else 'right'}
    laad = {'front': '56', 'left': '78', 'back': '80', 'right': '87'}
    kod = {'front': '51', 'left': '79', 'back': '81', 'right': '86'}
    p = {
        '54': {'class_type': 'ImageOnlyCheckpointLoader', 'inputs': {'ckpt_name': MODEL}},
        '70': {'class_type': 'ModelSamplingAuraFlow', 'inputs': {'model': ['54', 0], 'shift': 1.0}},
        '66': {'class_type': 'EmptyLatentHunyuan3Dv2', 'inputs': {'resolution': I['resolutie'], 'batch_size': 1}},
        '65': {'class_type': 'Hunyuan3Dv2ConditioningMultiView', 'inputs': {k: [kod[k], 0] for k in aanzichten}},
        '3': {'class_type': 'KSampler', 'inputs': {'model': ['70', 0], 'seed': I['zaad'], 'steps': I['stappen'], 'cfg': I['cfg'], 'sampler_name': I['sampler'], 'scheduler': I['planner'], 'positive': ['65', 0], 'negative': ['65', 1], 'latent_image': ['66', 0], 'denoise': 1.0}},
        '61': {'class_type': 'VAEDecodeHunyuan3D', 'inputs': {'samples': ['3', 0], 'vae': ['54', 2], 'num_chunks': I['brokken'], 'octree_resolution': I['octree']}},
        '82': {'class_type': 'VoxelToMesh', 'inputs': {'voxel': ['61', 0], 'algorithm': I['algoritme'], 'threshold': I['drempel']}},
        '83': {'class_type': 'SaveGLB', 'inputs': {'mesh': ['82', 0], 'filename_prefix': f'hy/{naam}'}},
    }
    for k in aanzichten:
        p[laad[k]] = {'class_type': 'LoadImage', 'inputs': {'image': f'hy/{map_invoer}/{bron[k]}.png'}}
        p[kod[k]] = {'class_type': 'CLIPVisionEncode', 'inputs': {'clip_vision': ['54', 1], 'image': [laad[k], 0], 'crop': 'none'}}
    return p


def main():
    uit = sys.argv[1]
    arg = dict(a.split('=') for a in sys.argv[2:] if '=' in a)
    naam, wissel = arg.get('naam', 'speerman'), 'wissel' in sys.argv
    aanzichten = arg.get('aanzichten', 'front,left,back,right').split(',')
    I = dict(SJABLOON)
    for k, v in arg.items():
        if k in I:
            I[k] = type(I[k])(v)
    map_invoer = arg.get('invoer', 'invoer')
    doel = os.path.join(BASIS, 'input', 'hy', map_invoer)
    os.makedirs(doel, exist_ok=True)
    for k in aanzichten:
        shutil.copy(os.path.join(uit, map_invoer, f'{k}.png'), os.path.join(doel, f'{k}.png'))
    piek = {'vram_mib': 0, 'ram_gb': 0.0}
    klaar = threading.Event()

    def meet():
        while not klaar.is_set():
            r = subprocess.run(['nvidia-smi', '--query-gpu=memory.used', '--format=csv,noheader,nounits'], capture_output=True, text=True)
            piek['vram_mib'] = max(piek['vram_mib'], int(r.stdout.strip() or 0))
            piek['ram_gb'] = max(piek['ram_gb'], round(psutil.virtual_memory().used / 2**30, 1))
            klaar.wait(2)
    threading.Thread(target=meet, daemon=True).start()
    t0 = time.time()
    pid = post('/prompt', {'prompt': opdracht(I, naam, wissel, aanzichten, map_invoer)})['prompt_id']
    while True:
        h = get(f'/history/{pid}')
        if pid in h:
            break
        time.sleep(3)
    klaar.set()
    h = h[pid]
    st = h['status']
    print('status', st.get('status_str'), 'klaar', st.get('completed'))
    if st.get('status_str') != 'success':
        for m in st.get('messages', []):
            if m[0] == 'execution_error':
                print('FOUT', m[1].get('node_type'), m[1].get('exception_message'))
        sys.exit(1)
    glb = None
    for uitvoer in h['outputs'].values():
        for lijst in uitvoer.values():
            for f in lijst if isinstance(lijst, list) else []:
                if isinstance(f, dict) and str(f.get('filename', '')).endswith('.glb'):
                    glb = os.path.join(BASIS, 'output', f.get('subfolder', ''), f['filename'])
    if glb is None:
        for wortel, _, bestanden in os.walk(os.path.join(BASIS, 'output', 'hy')):
            for b in bestanden:
                if b.startswith(naam) and b.endswith('.glb') and os.path.getmtime(os.path.join(wortel, b)) >= t0:
                    glb = os.path.join(wortel, b)
    shutil.copy(glb, os.path.join(uit, f'{naam}.glb'))
    info = {**I, 'wissel': wissel, 'aanzichten': aanzichten, 'invoer': arg.get('invoer', 'invoer'), 'seconden': round(time.time() - t0), 'piek': piek, 'glb_bytes': os.path.getsize(glb), 'model': MODEL}
    with open(os.path.join(uit, f'{naam}.json'), 'w', encoding='utf-8') as f:
        json.dump(info, f, indent=1)
    print(json.dumps(info))


if __name__ == '__main__':
    main()
