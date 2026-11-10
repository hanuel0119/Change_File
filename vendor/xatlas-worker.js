/* UV 자동 펼치기 워커 (xatlas). 메시마다 정점 65,535개 이하로 나눠서 넣습니다. */
importScripts('xatlas-core.js');
let mod = null;
const CHART = { fixWinding: false, maxBoundaryLength: 0, maxChartArea: 0, maxCost: 2, maxIterations: 1, normalDeviationWeight: 2, normalSeamWeight: 4, roundnessWeight: 0.01, straightnessWeight: 6, textureSeamWeight: 0.5, useInputMeshUvs: false };
const PACK = { bilinear: true, blockAlign: false, bruteForce: false, createImage: false, maxChartSize: 0, padding: 0, resolution: 0, rotateCharts: true, rotateChartsToAxis: true, texelsPerUnit: 0 };

async function init() {
  if (!mod) {
    let wasmBinary;
    try { const r = await fetch('xatlas.wasm'); if (!r.ok) throw 0; wasmBinary = new Uint8Array(await r.arrayBuffer()); }
    catch (_) { importScripts('xatlas.wasm.b64.js'); const bin = atob(self.__b64.xatlas); wasmBinary = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) wasmBinary[i] = bin.charCodeAt(i); }
    mod = await self.createXAtlasModule({
      wasmBinary,
      locateFile: p => p,
      onAtlasProgress: (mode, progress) => self.postMessage({ type: 'progress', mode, progress })
    });
  }
}

self.onmessage = async (e) => {
  const { id, meshes, chart, pack } = e.data;
  try {
    await init();
    mod.createAtlas();
    const ids = [];
    for (const m of meshes) {
      const vc = m.positions.length / 3, ic = m.indices.length;
      if (vc > 65535) throw new Error('메시 조각이 너무 커요');
      const d = mod.createMesh(vc, ic, false, false);
      mod.HEAPU16.set(m.indices, d.indexOffset / 2);
      mod.HEAPF32.set(m.positions, d.positionOffset / 4);
      const r = mod.addMesh();
      if (r !== 0) throw new Error('메시를 넣지 못했어요 (code ' + r + '). 면이 깨진 모델일 수 있어요.');
      ids.push(d.meshId);
    }
    mod.generateAtlas(Object.assign({}, CHART, chart || {}), Object.assign({}, PACK, pack || {}));
    const at = mod.getAtlas();
    const out = [], transfer = [];
    for (const mid of ids) {
      const r = mod.getMeshData(mid);
      const vC = r.newVertexCount, iC = r.newIndexCount;
      const index = new Uint32Array(mod.HEAPU32.subarray(r.indexOffset / 4, r.indexOffset / 4 + iC));
      const xref = new Uint32Array(mod.HEAPU32.subarray(r.originalIndexOffset / 4, r.originalIndexOffset / 4 + vC));
      const uv = new Float32Array(mod.HEAPF32.subarray(r.uvOffset / 4, r.uvOffset / 4 + vC * 2));
      mod.destroyMeshData(r);
      if (r.subMeshes && r.subMeshes.delete) r.subMeshes.delete();
      out.push({ index, xref, uv });
      transfer.push(index.buffer, xref.buffer, uv.buffer);
    }
    const res = { width: at.width, height: at.height, atlasCount: at.atlasCount };
    mod.destroyAtlas();
    self.postMessage({ id, ok: true, out, atlas: res }, transfer);
  } catch (err) {
    try { mod && mod.destroyAtlas(); } catch (_) {}
    self.postMessage({ id, ok: false, error: String((err && err.message) || err) });
  }
};
