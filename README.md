# 바꿈 파일 변환기

사진, PDF, 엑셀, 음악, 영상, 3D 모델 파일을 **브라우저 안에서만** 변환하는 사이트예요.
파일이 서버로 올라가지 않고, 서버가 필요 없어서 **운영비가 0원**이에요.

- 이미지 9개 · PDF 5개 · 문서·데이터 4개 · 오디오 1개 · 비디오 3개 · 3D 9개 (총 31개 도구)
- 정적 파일만으로 돌아가요. GitHub Pages, Cloudflare Pages, Netlify 어디든 올리면 돼요.

---

## 사용한 라이브러리

| 라이브러리 | 버전 | 라이선스 | 용도 |
|---|---|---|---|
| ffmpeg.wasm (@ffmpeg/core) | 0.12.6 | 감싸는 코드 MIT, 안의 FFmpeg는 LGPL/GPL | 영상·오디오 |
| heic2any | 0.0.4 | MIT (안의 libheif는 LGPL) | HEIC |
| pdf.js (pdfjs-dist) | 3.11.174 | Apache-2.0 | PDF 읽기·그리기 |
| pdf-lib | 1.17.1 | MIT | PDF 만들기·합치기 |
| SheetJS (xlsx) | 0.18.5 | Apache-2.0 | 엑셀 |
| js-yaml | 4.1.0 | MIT | YAML |
| JSZip | 3.10.1 | MIT 또는 GPL-3.0 | ZIP |
| marked | 4.3.0 | MIT | 마크다운 |
| three.js | 0.160.0 | MIT | 3D |
| occt-import-js (OpenCascade) | 0.0.22 | LGPL-2.1 | STEP·IGES |
| xatlas (xatlasjs) | 0.2.0 | MIT | UV 펼치기 |
