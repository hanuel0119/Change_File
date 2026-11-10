# 바꿈 파일 변환기

사진, PDF, 엑셀, 음악, 영상, 3D 모델 파일을 **브라우저 안에서만** 변환하는 사이트예요.

- 이미지 9개 · PDF 5개 · 문서·데이터 4개 · 오디오 1개 · 비디오 3개 · 3D 9개 (총 31개 도구)
- 정적 파일만으로 돌아가요. GitHub Pages, Cloudflare Pages, Netlify 어디든 올리면 돼요.

---

## GitHub Pages에 올리는 방법 (웹 브라우저만으로)

1. GitHub에 로그인한 뒤 오른쪽 위 **+ → New repository**를 눌러요.
2. 저장소 이름을 정하고(예: `converter`), **Public**을 고른 뒤 **Create repository**를 눌러요.
3. 새 저장소 화면에서 **uploading an existing file** 링크를 눌러요.
4. 이 폴더(`bakkum-converter`) **안에 있는 파일과 폴더 전부**를 끌어다 놓아요.
   - `index.html`이 저장소 맨 위(루트)에 있어야 해요. 폴더째 올려서 `bakkum-converter/index.html`이 되면 안 돼요.
   - `.nojekyll` 파일은 숨김 파일이라 안 보일 수 있어요. 없어도 사이트는 돌아가요.
   - 파일 수는 55개, 가장 큰 파일은 약 16MB라서 웹 업로드 제한(한 번에 100개, 파일당 25MB) 안에 들어가요.
5. 아래 **Commit changes**를 눌러요.
6. 저장소의 **Settings → Pages**로 가서
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` / `/ (root)` 를 고르고 **Save**를 눌러요.
7. 1~3분 뒤 같은 화면 위쪽에 주소가 나와요.
   `https://내아이디.github.io/저장소이름/`

### git 명령어로 올리는 경우

```bash
cd bakkum-converter
git init
git add .
git commit -m "바꿈 파일 변환기"
git branch -M main
git remote add origin https://github.com/내아이디/저장소이름.git
git push -u origin main
```

그다음 위 6번처럼 Pages를 켜면 돼요.

---

## 폴더 구성

```
index.html            사이트 전체 (화면 + 변환 코드)
.nojekyll             GitHub Pages가 파일을 그대로 쓰게 하는 표시
vendor/               변환 라이브러리
  ffmpeg-core-0.wasm  영상·오디오 엔진 (용량 때문에 두 조각으로 나눔)
  ffmpeg-core-1.wasm
  ffmpeg-core.js / ffmpeg-worker.js
  heic2any.min.js     HEIC 사진
  pdf.min.js / pdf.worker.min.js / pdf-lib.min.js   PDF
  cmaps/              한글 PDF 글꼴 표
  xlsx.full.min.js    엑셀
  purify.min.js       마크다운 결과 보안 처리
  js-yaml.min.js / marked.min.js / jszip.min.js
  three-bundle.js     3D 읽기·쓰기·미리보기
  occt-import-js.*    STEP·IGES(CAD) 읽기
  xatlas-*            UV 자동 펼치기
licenses/             각 라이브러리 라이선스 원문
```

## 알아둘 점

- **index.html을 더블클릭해서 열어도 돼요.** 이미지·PDF·문서·3D 변환은 그대로 작동해요. 다만 오디오·영상·STEP·UV 펴기 4가지는 브라우저 보안 때문에 사이트 주소(GitHub Pages 등)로 열어야 작동해요. 내 컴퓨터에서 전부 쓰려면 이 폴더에서 `python -m http.server`를 실행하고 `http://localhost:8000`으로 들어가세요.
- 영상은 300MB, 3D 파일은 200MB까지만 받도록 제한해 뒀어요. 사용자 컴퓨터가 직접 처리하기 때문이에요.
- 여기서는 저장 버튼이 파일을 바로 내려받아요. Claude 미리보기에서처럼 ZIP으로 감싸지 않아요.

## 공개 전에 확인할 것


- **라이선스**: 대부분 MIT·Apache 라이선스지만 두 가지는 확인이 필요해요.
  - 영상 엔진(FFmpeg)에는 GPL 부품(x264 등)이 들어 있어요.
  - CAD 엔진(OpenCascade, occt-import-js)은 LGPL이에요.
  - 사이트를 일반에 공개하면 소스 공개 같은 의무가 생길 수 있어요. 이 저장소를 Public으로 두면 소스는 이미 공개된 상태예요. 자세한 내용은 `licenses/` 폴더와 아래 표를 참고하세요.
- **보안**: 다음 보안 처리를 해뒀어요.
  - PDF 라이브러리(pdf.js 4.10.38)와 엑셀 라이브러리(SheetJS 0.20.3)를 알려진 취약점이 고쳐진 버전으로 올렸어요. SheetJS는 공식 npm에 최신판이 없어서, 공식 배포본을 그대로 다시 올린 `@e965/xlsx`에서 가져왔어요. 공식 파일을 직접 쓰고 싶다면 https://cdn.sheetjs.com 에서 0.20.3의 `xlsx.full.min.js`를 받아 `vendor/`에 덮어쓰면 돼요.
  - 마크다운 → HTML 결과에서 스크립트와 위험한 속성을 걸러내요(DOMPurify).
  - `index.html`에 보안 설정(CSP)이 들어 있어서, 이 사이트 파일과 Google 글꼴 말고는 어떤 외부 코드도 불러오지 못해요.
  - GitHub·Vercel 계정에는 꼭 2단계 인증을 켜두세요. 계정이 털리지 않는 게 가장 중요한 보안이에요.

## 사용한 라이브러리

| 라이브러리 | 버전 | 라이선스 | 용도 |
|---|---|---|---|
| ffmpeg.wasm (@ffmpeg/core) | 0.12.6 | 감싸는 코드 MIT, 안의 FFmpeg는 LGPL/GPL | 영상·오디오 |
| heic2any | 0.0.4 | MIT (안의 libheif는 LGPL) | HEIC |
| pdf.js (pdfjs-dist) | 4.10.38 | Apache-2.0 | PDF 읽기·그리기 |
| pdf-lib | 1.17.1 | MIT | PDF 만들기·합치기 |
| SheetJS (xlsx, @e965/xlsx) | 0.20.3 | Apache-2.0 | 엑셀 |
| DOMPurify | 3.4.17 | Apache-2.0 또는 MPL-2.0 | 마크다운 결과 보안 처리 |
| js-yaml | 4.1.0 | MIT | YAML |
| JSZip | 3.10.1 | MIT 또는 GPL-3.0 | ZIP |
| marked | 4.3.0 | MIT | 마크다운 |
| three.js | 0.160.0 | MIT | 3D |
| occt-import-js (OpenCascade) | 0.0.22 | LGPL-2.1 | STEP·IGES |
| xatlas (xatlasjs) | 0.2.0 | MIT | UV 펼치기 |
