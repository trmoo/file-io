/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  우리 해석기 ↔ 진짜 파이썬 3.12.
 *  화면 출력(stdout) · 오류 문구(stderr — Traceback·밑줄·Did you mean 까지) ·
 *  ★ 실행 뒤 디스크에 남은 파일 내용이 글자 하나까지 같아야 한다.
 */
import { readFileSync } from 'node:fs';
import { 묶음, 확인 } from './harness.mjs';
import { runProject } from '../src/lib/pymini.js';
import { cases } from './golden-cases.mjs';

const golden = JSON.parse(readFileSync(new URL('./golden.json', import.meta.url), 'utf-8'));
const list = cases();

묶음('진짜 파이썬과 대조');
확인('사례 수가 기준과 같다 (사례를 고쳤으면 npm run golden 을 다시 돌릴 것)', golden.cases.length, list.length);
for (let i = 0; i < list.length; i++) {
  const c = list[i], g = golden.cases[i];
  if (!g || g.name !== c.name) { 확인(`${c.name} — 기준의 이름이 같다`, g && g.name, c.name); continue; }
  const r = runProject({ files: c.files, dirs: c.dirs, entry: 'main.py' });
  // 기준은 끝의 빈 줄을 걷어 낸 것이라 우리 것도 똑같이 걷어 내고 견준다 (화면에는 빈 줄까지 그대로 보인다)
  확인(`${c.name} — 화면 출력`, r.stdout.replace(/\n+$/, ''), g.stdout);
  확인(`${c.name} — 오류 문구`, r.stderr, g.stderr);
  const left = { ...r.files };
  delete left['main.py'];
  const sorted = Object.fromEntries(Object.keys(left).sort().map((k) => [k, left[k]]));
  확인(`${c.name} — 실행 뒤 디스크`, sorted, g.files);
}
