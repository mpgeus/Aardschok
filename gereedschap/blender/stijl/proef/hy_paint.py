# Hunyuan3D-2 paint, het textuurmodel van Tencent, op onze mesh: zes aanzichten, samen geverfd uit één plaat, en terug op de punten van de mesh. Zonder hun rasterizer (die vraagt een compiler) en zonder UV (onze
# mesh is verf per punt): de normaal- en plekkaarten komen uit `kaarten`, op hun camera en in hun assen (camera_utils.py, mesh_render.py). Alleen hun pijplijn draait; de code staat in CODE, de pakketten daarnaast in pylib.
#
#   python hy_paint.py <mesh.npz> <uitmap> <plaat.png> [beeld=0] [stap=alles|kaarten|verf|terug] [stappen=30] [zaad=0] [licht=1]
#
# mesh.npz: V, F, deel, en eventueel Vf (dan de houding `beeld`: een open houding laat ook de plekken achter de arm zien). De speer doet niet mee: de plaat heeft er geen. Uit: kaart-*.png, verf-*.png, plaat-zonder-licht.png,
# paint.json, en kleur.npz (kleur per punt, lineair, met `gezien`: hoeveel de aanzichten dat punt zagen).
import json
import os
import sys
import time

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hy_kleur as K  # noqa: E402
import hy_mesh as M  # noqa: E402

CODE = 'C:/ComfyUI/hunyuan_tex'
MODEL = 'C:/ComfyUI/ComfyUI_windows_portable/ComfyUI/models/hunyuan3d-2'
AZIMS = [0, 90, 180, 270, 0, 180]
ELEVS = [0, 0, 0, 0, 90, -90]
GEWICHT = [1.0, 0.1, 0.5, 0.1, 0.05, 0.05]
ORTHO = 1.2
SCHAAL = 1.15
MAAT = 512
BAK_MACHT = 4


def naar_binnen(V):
    """Onze assen (gezicht naar -y, omhoog z) naar die van het model (gezicht naar +y, omhoog z), gecentreerd en geschaald zoals in hun load_mesh."""
    P = V * np.array([-1.0, -1.0, 1.0])
    c = (P.max(0) + P.min(0)) / 2
    f = SCHAAL / (2.0 * np.linalg.norm(P - c, axis=1).max())
    return (P - c) * f


def camera(elev, azim, d=1.45):
    e, a = np.radians(-elev), np.radians(azim + 90)
    pos = d * np.array([np.cos(e) * np.cos(a), np.cos(e) * np.sin(a), np.sin(e)])
    kijk = -pos / np.linalg.norm(pos)
    rechts = np.cross(kijk, [0, 0, 1.0])
    rechts /= np.linalg.norm(rechts)
    boven = np.cross(rechts, kijk)
    return rechts, boven / np.linalg.norm(boven), kijk


def beeldpunt(P, cam, maat):
    r, b, k = cam
    u = (P @ r / ORTHO + 0.5) * maat
    v = (0.5 - P @ b / ORTHO) * maat
    return u, v, P @ k


def raster(P, F, cam, maat):
    """Per pixel het dichtste vlak en de plek daarop: elk vlak bemonsterd, fijn genoeg voor zijn maat. Eenvoudiger dan een echte rasterizer, en de mesh is veel fijner dan de pixels."""
    u, v, d = beeldpunt(P, cam, maat)
    rand = np.maximum.reduce([np.hypot(u[F[:, a]] - u[F[:, b]], v[F[:, a]] - v[F[:, b]]) for a, b in ((0, 1), (1, 2), (2, 0))])
    n = np.clip(np.ceil(rand * 1.5).astype(int), 1, 128)
    diep = np.full(maat * maat, np.inf, dtype=np.float32)
    vlak = np.full(maat * maat, -1, dtype=np.int32)
    bary = np.zeros((maat * maat, 3), dtype=np.float32)
    for k in np.unique(n):
        s = np.nonzero(n == k)[0]
        i, j = np.meshgrid(np.arange(k + 1), np.arange(k + 1), indexing='ij')
        h = i + j <= k
        b0, b1 = (i[h] + 0.3) / (k + 0.9), (j[h] + 0.3) / (k + 0.9)
        b = np.stack([b0, b1, 1 - b0 - b1], axis=1)
        for van in range(0, len(s), 200000):
            f = s[van:van + 200000]
            pu = (u[F[f]][:, None, :] * b[None]).sum(2)
            pv = (v[F[f]][:, None, :] * b[None]).sum(2)
            pd = (d[F[f]][:, None, :] * b[None]).sum(2)
            x, y = pu.astype(np.int32).ravel(), pv.astype(np.int32).ravel()
            pd = pd.ravel().astype(np.float32)
            ff = np.repeat(f, len(b))
            bb = np.tile(b, (len(f), 1))
            ok = (x >= 0) & (x < maat) & (y >= 0) & (y < maat) & (pu.ravel() >= 0) & (pv.ravel() >= 0)
            idx = y[ok] * maat + x[ok]
            pd, ff, bb = pd[ok], ff[ok], bb[ok]
            np.minimum.at(diep, idx, pd)
            w = pd <= diep[idx]
            vlak[idx[w]] = ff[w]
            bary[idx[w]] = bb[w]
    return diep.reshape(maat, maat), vlak.reshape(maat, maat), bary.reshape(maat, maat, 3)


def kaarten(P, F, uit):
    """De normaal- en plekkaarten zoals render_normal(use_abs_coor=True) en render_position: wit waar niets staat."""
    N = M.normalen(P, F)
    for i, (e, a) in enumerate(zip(ELEVS, AZIMS)):
        _, vlak, bary = raster(P, F, camera(e, a), MAAT)
        s = vlak >= 0
        nb = np.ones((MAAT, MAAT, 3), dtype=np.float32)
        pb = np.ones((MAAT, MAAT, 3), dtype=np.float32)
        fv = F[vlak[s]]
        b = bary[s][:, :, None]
        nb[s] = np.clip(((N[fv] * b).sum(1) + 1) * 0.5, 0, 1)
        pb[s] = np.clip(0.5 - (P[fv] * b).sum(1) / SCHAAL, 0, 1)
        Image.fromarray((nb * 255).astype(np.uint8)).save(os.path.join(uit, f'kaart-normaal-{i}.png'))
        Image.fromarray((pb * 255).astype(np.uint8)).save(os.path.join(uit, f'kaart-plek-{i}.png'))


def recenter(beeld, rand=0.2):
    """Zoals recenter_image: uitsnijden op de alfa, en een marge eromheen."""
    a = np.array(beeld)[:, :, 3]
    y, x = np.nonzero(a > 0)
    uit_ = beeld.crop((x.min(), y.min(), x.max() + 1, y.max() + 1))
    w, h = uit_.size
    bw, bh = int(w * rand), int(h * rand)
    z = max(w + 2 * bw, h + 2 * bh)
    n = Image.new('RGBA', (z, z), (255, 255, 255, 0))
    n.paste(uit_, ((z - w - 2 * bw) // 2 + bw, (z - h - 2 * bh) // 2 + bh))
    return n


def laad_code():
    sys.path.insert(0, CODE + '/pylib')
    sys.path.insert(0, CODE + '/src/hy3dgen/texgen')


def zonder_licht(plaat, uit):
    """Zoals Light_Shadow_Remover: dezelfde stappen en dezelfde kleurcorrectie, zonder cv2."""
    import torch
    from diffusers import EulerAncestralDiscreteScheduler, StableDiffusionInstructPix2PixPipeline
    pipe = StableDiffusionInstructPix2PixPipeline.from_pretrained(MODEL + '/hunyuan3d-delight-v2-0', torch_dtype=torch.float16, safety_checker=None)
    pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
    pipe.set_progress_bar_config(disable=True)
    pipe = pipe.to('cuda', torch.float16)
    b = recenter(plaat).resize((512, 512))
    arr = np.array(b).astype(np.float32) / 255
    a = arr[:, :, 3:] > 0.5
    arr[~a[:, :, 0], :3] = 1.0
    bron = Image.fromarray((arr[:, :, :3] * 255).astype(np.uint8))
    with torch.no_grad():
        los = pipe(prompt='', image=bron, generator=torch.manual_seed(42), height=512, width=512, num_inference_steps=50, image_guidance_scale=1.5, guidance_scale=1.0).images[0]
    u = np.array(los).astype(np.float32) / 255
    d = arr[:, :, :3]
    s = a[:, :, 0]
    uit_ = u.copy()
    for i in range(3):
        uit_[:, :, i] = np.clip((u[:, :, i] - 0.95 * u[s, i].mean()) * (d[s, i].std() / u[s, i].std()) + 0.95 * d[s, i].mean(), 0, 1)
    if ((u - d) ** 2).mean() < ((uit_ - d) ** 2).mean():
        uit_ = u
    uit_[~s] = 1.0
    klaar = Image.fromarray((uit_ * 255).astype(np.uint8))
    klaar.save(os.path.join(uit, 'plaat-zonder-licht.png'))
    del pipe
    torch.cuda.empty_cache()
    return klaar


def laad_paint():
    import torch
    from diffusers import AutoencoderKL, EulerAncestralDiscreteScheduler, UNet2DConditionModel
    from hunyuanpaint.pipeline import HunyuanPaintPipeline
    from hunyuanpaint.unet.modules import UNet2p5DConditionModel
    from safetensors.torch import load_file
    from transformers import CLIPImageProcessor, CLIPTextModel, CLIPTokenizer
    p = MODEL + '/hunyuan3d-paint-v2-0'
    cfg = json.load(open(p + '/unet/config.json', encoding='utf-8'))
    unet = UNet2p5DConditionModel(UNet2DConditionModel(**cfg))
    unet.load_state_dict(load_file(p + '/unet/diffusion_pytorch_model.safetensors'), strict=True)
    unet = unet.to(torch.float16)
    sch = EulerAncestralDiscreteScheduler.from_pretrained(p, subfolder='scheduler', timestep_spacing='trailing')
    pipe = HunyuanPaintPipeline(vae=AutoencoderKL.from_pretrained(p, subfolder='vae', torch_dtype=torch.float16),
                                text_encoder=CLIPTextModel.from_pretrained(p, subfolder='text_encoder', torch_dtype=torch.float16),
                                tokenizer=CLIPTokenizer.from_pretrained(p, subfolder='tokenizer'),
                                unet=unet, scheduler=sch, feature_extractor=CLIPImageProcessor.from_pretrained(p, subfolder='feature_extractor'))
    pipe.set_progress_bar_config(disable=True)
    return pipe.to('cuda')


def verf(uit, plaat, stappen, zaad, licht_eraf):
    import torch
    laad_code()
    t0 = time.time()
    torch.cuda.reset_peak_memory_stats()
    ref = zonder_licht(plaat, uit) if licht_eraf else Image.fromarray(np.array(recenter(plaat).resize((512, 512)).convert('RGB')))
    t1 = time.time()
    pipe = laad_paint()
    normaal = [[Image.open(os.path.join(uit, f'kaart-normaal-{i}.png')).convert('RGB') for i in range(len(AZIMS))]]
    plek = [[Image.open(os.path.join(uit, f'kaart-plek-{i}.png')).convert('RGB') for i in range(len(AZIMS))]]
    # camera_info zoals in hun pipelines.py
    extra = {-20: 0, 0: 12, 20: 24, -90: 36, 90: 40}
    deel_ = {-20: 1, 0: 1, 20: 1, -90: 3, 90: 3}
    info = [(((a // 30) + 9) % 12) // deel_[e] + extra[e] for a, e in zip(AZIMS, ELEVS)]
    with torch.no_grad():
        beelden = pipe([ref], num_inference_steps=stappen, generator=torch.Generator(device='cuda').manual_seed(zaad), width=MAAT, height=MAAT, num_in_batch=len(AZIMS),
                       camera_info_gen=[info], camera_info_ref=[[0]], normal_imgs=normaal, position_imgs=plek).images
    for i, b in enumerate(beelden):
        b.save(os.path.join(uit, f'verf-{i}.png'))
    rij = Image.new('RGB', (MAAT * len(beelden), MAAT * 2), (255, 255, 255))
    for i, b in enumerate(beelden):
        rij.paste(b, (i * MAAT, 0))
        rij.paste(normaal[0][i], (i * MAAT, MAAT))
    rij.save(os.path.join(uit, 'verf-rij.png'))
    return {'licht_eraf_s': round(t1 - t0, 1), 'verf_s': round(time.time() - t1, 1), 'vram_piek_gb': round(torch.cuda.max_memory_allocated() / 2 ** 30, 2), 'stappen': stappen, 'zaad': zaad, 'licht_eraf': bool(licht_eraf)}


def terug(P, F, uit, n_alles, wie):
    """De aanzichten terug op de punten: per aanzicht wat het ziet (dichtbij de voorste laag), met het gewicht cos^4 maal het gewicht van het aanzicht, zoals back_project en fast_bake_texture. Wat niets ziet, krijgt de kleur van het dichtste punt dat wel gezien is."""
    from scipy.spatial import cKDTree
    N = M.normalen(P, F)
    som = np.zeros((len(P), 3))
    gew = np.zeros(len(P))
    for i, (e, a, g) in enumerate(zip(ELEVS, AZIMS, GEWICHT)):
        beeld = K.srgb_lin(np.array(Image.open(os.path.join(uit, f'verf-{i}.png')).convert('RGB')).astype(np.float64) / 255)
        cam = camera(e, a)
        diep, _, _ = raster(P, F, cam, MAAT * 2)
        u, v, d = beeldpunt(P, cam, MAAT * 2)
        x, y = np.clip(u.astype(int), 0, MAAT * 2 - 1), np.clip(v.astype(int), 0, MAAT * 2 - 1)
        cosn = np.clip(-(N @ cam[2]), 0, 1)
        zicht = (d <= diep[y, x] + 0.004) & (cosn > 0.05)
        c = beeld[np.clip((v / 2).astype(int), 0, MAAT - 1), np.clip((u / 2).astype(int), 0, MAAT - 1)]
        w = g * cosn ** BAK_MACHT * zicht
        som += c * w[:, None]
        gew += w
    gezien = gew > 1e-6
    kl = np.zeros((len(P), 3))
    kl[gezien] = som[gezien] / gew[gezien, None]
    _, i = cKDTree(P[gezien]).query(P[~gezien])
    kl[~gezien] = kl[gezien][i]
    alles = np.zeros((n_alles, 3), dtype=np.float32)
    g_alles = np.zeros(n_alles, dtype=np.float32)
    alles[wie] = kl
    g_alles[wie] = gew
    np.savez_compressed(os.path.join(uit, 'kleur.npz'), kleur=alles, gezien=g_alles)
    return {'punten': int(len(P)), 'niet_gezien': int((~gezien).sum())}


def main():
    arg = dict(a.split('=', 1) for a in sys.argv[4:] if '=' in a)
    d = np.load(sys.argv[1])
    uit = sys.argv[2]
    os.makedirs(uit, exist_ok=True)
    V = d['Vf'][int(arg.get('beeld', 0))] if 'Vf' in d.files else d['V']
    wie = d['deel'] != 3
    nieuw = -np.ones(len(V), dtype=np.int64)
    nieuw[wie] = np.arange(wie.sum())
    F = nieuw[d['F'][wie[d['F']].all(1)]]
    P = naar_binnen(V[wie])
    stap = arg.get('stap', 'alles')
    info = {}
    pad = os.path.join(uit, 'paint.json')
    if os.path.exists(pad):
        info = json.load(open(pad, encoding='utf-8'))
    if stap in ('alles', 'kaarten'):
        kaarten(P, F, uit)
    if stap in ('alles', 'verf'):
        plaat = Image.open(sys.argv[3]).convert('RGBA')
        info['verf'] = verf(uit, plaat, int(arg.get('stappen', 30)), int(arg.get('zaad', 0)), int(arg.get('licht', 1)))
    if stap in ('alles', 'terug'):
        info['terug'] = terug(P, F, uit, len(V), wie)
    json.dump(info, open(pad, 'w', encoding='utf-8'), indent=1)
    print(json.dumps(info))


if __name__ == '__main__':
    main()
