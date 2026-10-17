// De tekenaar op WebGPU (renderproef; atlas.js): precies hetzelfde als gl2weg.js (dezelfde rijen, dezelfde atlas als
// textuurstapel, dezelfde shaders in WGSL), zodat het verschil tussen de twee alleen de API is. Per beeld één
// opdrachtbuffer met twee rondgangen: het masker van de schaduwen, en de rest.
(function (P) {
  'use strict';
  const weg = { naam: 'gpu', canvas: null, b: 0, h: 0, zicht: 0 };
  let device = null;
  let ctx = null;
  let formaat = null;
  let A = null;
  let atlasTex = null;
  let atlasView = null;
  let punt = null;
  const R = {};
  let dynBuf = null;
  let vastBuf = null;
  let diepte = null;
  let masker = null;
  let camBuf = null;
  let camMaskerBuf = null;
  let schermBuf = null;
  let lichtBuf = null;
  let groepGewoon = null;
  let groepMasker = null;
  let groepScherm = null;
  let groepLicht = null;
  let laySprite = null;
  let layVlak = null;
  let layScherm = null;
  const pijp = {};
  const grondGroep = new Map(); // stuk → bindgroep
  const grond = [];
  const U = globalThis.GPUBufferUsage || {}; // zonder WebGPU (Firefox op Linux) laadt de bladzijde toch
  const T = globalThis.GPUTextureUsage || {};

  const CAM = 'struct Cam { zoom: f32, tx: f32, ty: f32, b: f32, h: f32, schaduw: f32, rx: f32, ry: f32 };';
  const SPRITE = `${CAM}
  @group(0) @binding(0) var<uniform> cam: Cam;
  @group(0) @binding(1) var atlas: texture_2d_array<f32>;
  @group(0) @binding(2) var punt: sampler;
  struct Uit { @builtin(position) pos: vec4f, @location(0) uv: vec2f, @location(1) @interpolate(flat) laag: i32, @location(2) alpha: f32 };
  @vertex fn vs(@builtin(vertex_index) vi: u32, @location(0) rect: vec4f, @location(1) uvr: vec4f, @location(2) extra: vec4f) -> Uit {
    var o: Uit;
    let c = vec2f(f32(vi & 1u), f32(vi >> 1u));
    var p = rect.xy + c * rect.zw;
    if (cam.schaduw > 0.5) {
      if (extra.z < 0.5) { o.pos = vec4f(2.0, 2.0, 0.5, 1.0); o.uv = vec2f(0.0); o.laag = 0; o.alpha = 0.0; return o; }
      let t = 1.0 - c.y;
      p = vec2f(rect.x + c.x * rect.z + t * rect.w * cam.rx, rect.y + rect.w + t * rect.w * cam.ry);
    }
    let s = p * cam.zoom + vec2f(cam.tx, cam.ty);
    o.pos = vec4f(s.x / cam.b * 2.0 - 1.0, 1.0 - s.y / cam.h * 2.0, extra.w, 1.0);
    o.uv = mix(uvr.xy, uvr.zw, c);
    o.laag = i32(extra.x + 0.5);
    o.alpha = extra.y;
    return o;
  }
  @fragment fn fsLijst(i: Uit) -> @location(0) vec4f { return textureSampleLevel(atlas, punt, i.uv, i.laag, 0.0) * i.alpha; }
  @fragment fn fsHard(i: Uit) -> @location(0) vec4f {
    let c = textureSampleLevel(atlas, punt, i.uv, i.laag, 0.0);
    if (c.a < 0.5) { discard; }
    return c * i.alpha;
  }
  @fragment fn fsMasker(i: Uit) -> @location(0) vec4f {
    let c = textureSampleLevel(atlas, punt, i.uv, i.laag, 0.0);
    if (c.a < 0.004) { discard; }
    return vec4f(0.0, 0.0, 0.0, c.a);
  }`;
  const VLAK = `${CAM}
  struct Stuk { x: f32, y: f32, w: f32, h: f32 };
  @group(0) @binding(0) var<uniform> cam: Cam;
  @group(0) @binding(1) var<uniform> stuk: Stuk;
  @group(0) @binding(2) var beeld: texture_2d<f32>;
  @group(0) @binding(3) var punt: sampler;
  struct Uit { @builtin(position) pos: vec4f, @location(0) uv: vec2f };
  @vertex fn vs(@builtin(vertex_index) vi: u32) -> Uit {
    var o: Uit;
    let c = vec2f(f32(vi & 1u), f32(vi >> 1u));
    let s = (vec2f(stuk.x, stuk.y) + c * vec2f(stuk.w, stuk.h)) * cam.zoom + vec2f(cam.tx, cam.ty);
    o.pos = vec4f(s.x / cam.b * 2.0 - 1.0, 1.0 - s.y / cam.h * 2.0, 0.0, 1.0);
    o.uv = c;
    return o;
  }
  @fragment fn fs(i: Uit) -> @location(0) vec4f { return textureSampleLevel(beeld, punt, i.uv, 0.0); }`;
  const SCHERM = `
  struct Scherm { kleur: vec4f, b: f32, h: f32, metMasker: f32, leeg: f32 };
  @group(0) @binding(0) var<uniform> sch: Scherm;
  @group(0) @binding(1) var masker: texture_2d<f32>;
  @group(0) @binding(2) var punt: sampler;
  @vertex fn vs(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
    let c = vec2f(f32(vi & 1u), f32(vi >> 1u));
    return vec4f(c * 2.0 - 1.0, 0.0, 1.0);
  }
  @fragment fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
    if (sch.metMasker > 0.5) { return sch.kleur * textureSampleLevel(masker, punt, pos.xy / vec2f(sch.b, sch.h), 0.0).a; }
    return sch.kleur;
  }`;

  const MENG = { color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' } };
  const MAAL = { color: { srcFactor: 'dst', dstFactor: 'zero' }, alpha: { srcFactor: 'zero', dstFactor: 'one' } };
  const diepteVan = (schrijf, vergelijk) => ({ format: 'depth24plus', depthWriteEnabled: schrijf, depthCompare: vergelijk });
  const RIJ = [{ arrayStride: P.PER * 4, stepMode: 'instance', attributes: [
    { shaderLocation: 0, offset: 0, format: 'float32x4' },
    { shaderLocation: 1, offset: 16, format: 'float32x4' },
    { shaderLocation: 2, offset: 32, format: 'float32x4' },
  ] }];

  function pijplijn(module, layout, fs, doel, meng, diepteStand, buffers) {
    return device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [layout] }),
      vertex: { module, entryPoint: 'vs', buffers: buffers || [] },
      fragment: { module, entryPoint: fs, targets: [{ format: doel, blend: meng }] },
      primitive: { topology: 'triangle-strip' },
      depthStencil: diepteStand || undefined,
    });
  }
  const uniform = (n) => device.createBuffer({ size: n, usage: U.UNIFORM | U.COPY_DST });

  weg.init = async function (b, h) {
    if (!navigator.gpu) throw new Error('geen WebGPU');
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) throw new Error('geen adapter voor WebGPU');
    device = await adapter.requestDevice();
    weg.adapter = adapter.info ? `${adapter.info.vendor} ${adapter.info.architecture}` : '?';
    weg.canvas = document.createElement('canvas');
    weg.canvas.width = b;
    weg.canvas.height = h;
    ctx = weg.canvas.getContext('webgpu');
    formaat = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({ device, format: formaat, alphaMode: 'premultiplied' });
    weg.b = b;
    weg.h = h;
    punt = device.createSampler({ magFilter: 'nearest', minFilter: 'nearest' });
    const VF = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
    const F = GPUShaderStage.FRAGMENT;
    laySprite = device.createBindGroupLayout({ entries: [
      { binding: 0, visibility: VF, buffer: {} },
      { binding: 1, visibility: F, texture: { viewDimension: '2d-array' } },
      { binding: 2, visibility: F, sampler: {} },
    ] });
    layVlak = device.createBindGroupLayout({ entries: [
      { binding: 0, visibility: VF, buffer: {} },
      { binding: 1, visibility: VF, buffer: {} },
      { binding: 2, visibility: F, texture: {} },
      { binding: 3, visibility: F, sampler: {} },
    ] });
    layScherm = device.createBindGroupLayout({ entries: [
      { binding: 0, visibility: VF, buffer: {} },
      { binding: 1, visibility: F, texture: {} },
      { binding: 2, visibility: F, sampler: {} },
    ] });
    const ms = device.createShaderModule({ code: SPRITE });
    const mv = device.createShaderModule({ code: VLAK });
    const mc = device.createShaderModule({ code: SCHERM });
    pijp.masker = pijplijn(ms, laySprite, 'fsMasker', 'rgba8unorm', MENG, null, RIJ);
    pijp.lijst = pijplijn(ms, laySprite, 'fsLijst', formaat, MENG, diepteVan(false, 'always'), RIJ);
    pijp.hard = pijplijn(ms, laySprite, 'fsHard', formaat, MENG, diepteVan(true, 'less-equal'), RIJ);
    pijp.zacht = pijplijn(ms, laySprite, 'fsLijst', formaat, MENG, diepteVan(false, 'less-equal'), RIJ);
    pijp.vlak = pijplijn(mv, layVlak, 'fs', formaat, MENG, diepteVan(false, 'always'));
    pijp.scherm = pijplijn(mc, layScherm, 'fs', formaat, MENG, diepteVan(false, 'always'));
    pijp.licht = pijplijn(mc, layScherm, 'fs', formaat, MAAL, diepteVan(false, 'always'));
    camBuf = uniform(32);
    camMaskerBuf = uniform(32);
    schermBuf = uniform(32);
    lichtBuf = uniform(32);
  };
  weg.maat = function (b, h) {
    weg.canvas.width = b;
    weg.canvas.height = h;
    weg.b = b;
    weg.h = h;
  };
  weg.bouw = function (sc) {
    A = P.maakAtlas();
    const lagen = P.pakIn(A, sc) + 2;
    A.lagen = lagen;
    atlasTex = device.createTexture({ size: [P.LAAG, P.LAAG, lagen], format: 'rgba8unorm', usage: T.TEXTURE_BINDING | T.COPY_DST | T.RENDER_ATTACHMENT });
    atlasView = atlasTex.createView({ dimension: '2d-array' });
    const groep = (buf) => device.createBindGroup({ layout: laySprite, entries: [
      { binding: 0, resource: { buffer: buf } }, { binding: 1, resource: atlasView }, { binding: 2, resource: punt },
    ] });
    groepGewoon = groep(camBuf);
    groepMasker = groep(camMaskerBuf);
  };

  function stuurNieuw() {
    for (const p of A.nieuw) {
      device.queue.copyExternalImageToTexture({ source: p.img }, { texture: atlasTex, origin: { x: p.x, y: p.y, z: p.l }, premultipliedAlpha: true }, { width: p.b, height: p.h });
    }
    A.nieuw.length = 0;
  }
  // Het masker van de schaduwen en de dieptebuffer, zo groot als het scherm (opnieuw als de maat verandert).
  function doelen() {
    if (masker && masker.b === weg.b && masker.h === weg.h) return;
    if (masker) { masker.tex.destroy(); diepte.destroy(); }
    const tex = device.createTexture({ size: [weg.b, weg.h], format: 'rgba8unorm', usage: T.RENDER_ATTACHMENT | T.TEXTURE_BINDING });
    masker = { tex, view: tex.createView(), b: weg.b, h: weg.h };
    const d = device.createTexture({ size: [weg.b, weg.h], format: 'depth24plus', usage: T.RENDER_ATTACHMENT });
    diepte = d;
    diepte.view = d.createView();
    const groep = (buf) => device.createBindGroup({ layout: layScherm, entries: [
      { binding: 0, resource: { buffer: buf } }, { binding: 1, resource: masker.view }, { binding: 2, resource: punt },
    ] });
    groepScherm = groep(schermBuf);
    groepLicht = groep(lichtBuf);
  }
  function grondGroepVan(s) {
    let g = grondGroep.get(s);
    if (!g) {
      const tex = device.createTexture({ size: [512, 512], format: 'rgba8unorm', usage: T.TEXTURE_BINDING | T.COPY_DST | T.RENDER_ATTACHMENT });
      device.queue.copyExternalImageToTexture({ source: s.doek }, { texture: tex, premultipliedAlpha: true }, { width: 512, height: 512 });
      const buf = uniform(16);
      device.queue.writeBuffer(buf, 0, new Float32Array([s.x, s.y, s.S, s.S]));
      g = device.createBindGroup({ layout: layVlak, entries: [
        { binding: 0, resource: { buffer: camBuf } }, { binding: 1, resource: { buffer: buf } },
        { binding: 2, resource: tex.createView() }, { binding: 3, resource: punt },
      ] });
      grondGroep.set(s, g);
    }
    return g;
  }
  function buffer(oud, bytes) {
    if (oud && oud.size >= bytes) return oud;
    if (oud) oud.destroy();
    return device.createBuffer({ size: Math.max(256, Math.ceil(bytes * 1.5 / 16) * 16), usage: U.VERTEX | U.COPY_DST });
  }
  const camData = new Float32Array(8);
  const schermData = new Float32Array(8);

  weg.teken = function (sc, cam, inst) {
    const z = cam.zoom;
    const tx = Math.round(weg.b / 2 - cam.x * z);
    const ty = Math.round(weg.h / 2 - cam.y * z);
    P.rijen(sc, cam, weg.b, weg.h, inst, R, A);
    weg.zicht = R.getekend;
    stuurNieuw();
    doelen();
    const q = device.queue;
    camData.set([z, tx, ty, weg.b, weg.h, 0, P.ZON.rx, P.ZON.ry]);
    q.writeBuffer(camBuf, 0, camData);
    camData[5] = 1;
    q.writeBuffer(camMaskerBuf, 0, camData);
    if (R.n) {
      dynBuf = buffer(dynBuf, R.n * P.PER * 4);
      q.writeBuffer(dynBuf, 0, R.dyn.buffer, R.dyn.byteOffset, R.n * P.PER * 4);
    }
    if (inst.vast && R.vastNieuw && R.nVast) {
      vastBuf = buffer(vastBuf, R.vastData.byteLength);
      q.writeBuffer(vastBuf, 0, R.vastData);
      R.vastNieuw = false;
    }
    const vast = inst.vast && R.nVast;
    const enc = device.createCommandEncoder();
    if (inst.schaduw) {
      const m = enc.beginRenderPass({ colorAttachments: [{ view: masker.view, clearValue: [0, 0, 0, 0], loadOp: 'clear', storeOp: 'store' }] });
      m.setPipeline(pijp.masker);
      m.setBindGroup(0, groepMasker);
      if (vast) { m.setVertexBuffer(0, vastBuf); m.draw(4, R.nVast); }
      if (R.n) { m.setVertexBuffer(0, dynBuf); m.draw(4, R.n); }
      m.end();
      const k = P.SCHADUW.kleur;
      const a = P.SCHADUW.sterkte;
      schermData.set([k[0] * a, k[1] * a, k[2] * a, a, weg.b, weg.h, 1, 0]);
      q.writeBuffer(schermBuf, 0, schermData);
    }
    const r = enc.beginRenderPass({
      colorAttachments: [{ view: ctx.getCurrentTexture().createView(), clearValue: [0, 0, 0, 0], loadOp: 'clear', storeOp: 'store' }],
      depthStencilAttachment: { view: diepte.view, depthClearValue: 1, depthLoadOp: 'clear', depthStoreOp: 'discard' },
    });
    r.setPipeline(pijp.vlak);
    for (const s of P.grondStukken(sc, cam, weg.b, weg.h, grond)) { r.setBindGroup(0, grondGroepVan(s)); r.draw(4); }
    if (inst.schaduw) { r.setPipeline(pijp.scherm); r.setBindGroup(0, groepScherm); r.draw(4); }
    r.setBindGroup(0, groepGewoon);
    if (!inst.vast) {
      if (R.n) { r.setPipeline(pijp.lijst); r.setVertexBuffer(0, dynBuf); r.draw(4, R.n); }
    } else {
      r.setPipeline(pijp.hard);
      if (vast) { r.setVertexBuffer(0, vastBuf); r.draw(4, R.nVast); }
      if (R.nHard) { r.setVertexBuffer(0, dynBuf); r.draw(4, R.nHard); }
      if (R.n > R.nHard) { r.setPipeline(pijp.zacht); r.setVertexBuffer(0, dynBuf); r.draw(4, R.n - R.nHard, 0, R.nHard); }
    }
    if (inst.licht) {
      const k = P.AVOND;
      schermData.set([k[0], k[1], k[2], 1, weg.b, weg.h, 0, 0]);
      q.writeBuffer(lichtBuf, 0, schermData);
      r.setPipeline(pijp.licht);
      r.setBindGroup(0, groepLicht);
      r.draw(4);
    }
    r.end();
    q.submit([enc.finish()]);
  };
  // Wachten tot de kaart klaar is: WebGPU kan alleen met een belofte (en dus een ronde van de browser erbij).
  weg.wacht = () => device.queue.onSubmittedWorkDone();

  P.wegen = P.wegen || {};
  P.wegen.gpu = weg;
})(globalThis.Proef = globalThis.Proef || {});
