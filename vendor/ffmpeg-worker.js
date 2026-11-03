/* 영상·오디오 변환용 ffmpeg 워커. wasm은 같은 폴더의 두 조각을 받아 합쳐서 씁니다. */
let core = null;
const logs = [];

async function fetchParts(urls) {
  const heads = await Promise.all(urls.map(u => fetch(u)));
  heads.forEach(r => { if (!r.ok) throw new Error('변환 엔진 파일을 받지 못했어요 (' + r.status + ')'); });
  const total = heads.reduce((a, r) => a + Number(r.headers.get('content-length') || 0), 0) || 32129114;
  let loaded = 0;
  const chunks = [];
  for (const r of heads) {
    const reader = r.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      self.postMessage({ type: 'loadprogress', loaded, total });
    }
  }
  const bin = new Uint8Array(loaded);
  let off = 0;
  for (const c of chunks) { bin.set(c, off); off += c.length; }
  return bin;
}

function loadB64Parts(name) {
  // 공개 공유용: .wasm 대신 base64를 담은 .js 조각에서 엔진을 읽어요
  for (let i = 0; ; i++) {
    try { importScripts(name + '.wasm.b64-' + i + '.js'); } catch (e) { if (i === 0) throw new Error('변환 엔진 파일을 받지 못했어요'); break; }
    self.postMessage({ type: 'loadprogress', loaded: i + 1, total: 3 });
  }
  const bin = atob(self.__b64[name]); delete self.__b64[name];
  const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}

self.onmessage = async (e) => {
  const { id, type, data } = e.data;
  try {
    if (type === 'load') {
      if (!core) {
        let wasmBinary;
        try { wasmBinary = await fetchParts(['ffmpeg-core-0.wasm', 'ffmpeg-core-1.wasm']); }
        catch (_) { wasmBinary = loadB64Parts('ffmpeg-core'); }
        importScripts('ffmpeg-core.js');
        core = await self.createFFmpegCore({ wasmBinary });
        core.setLogger(({ message }) => { logs.push(message); if (logs.length > 40) logs.shift(); });
        core.setProgress(p => self.postMessage({ type: 'progress', data: p }));
      }
      self.postMessage({ id, ok: true });
    } else if (type === 'exec') {
      logs.length = 0;
      const { inName, outName, input, args } = data;
      core.FS.writeFile(inName, new Uint8Array(input));
      core.setTimeout(-1);
      core.exec(...args);
      const ret = core.ret;
      core.reset();
      let out = null;
      try { out = core.FS.readFile(outName); } catch (_) {}
      try { core.FS.unlink(inName); } catch (_) {}
      try { core.FS.unlink(outName); } catch (_) {}
      if (!out || !out.length) {
        const tail = logs.slice(-4).join(' / ');
        throw new Error('변환하지 못했어요. 파일이 손상됐거나 지원하지 않는 형식일 수 있어요.' + (tail ? ' [' + tail + ']' : '') + ' (code ' + ret + ')');
      }
      self.postMessage({ id, ok: true, data: out }, [out.buffer]);
    }
  } catch (err) {
    self.postMessage({ id, ok: false, error: String((err && err.message) || err) });
  }
};
