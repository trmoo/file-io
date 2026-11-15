/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  카드 화면에 실린 코드(처음 코드 · 모범 답 · 다른 정답 · 흔한 실수 · 확인 문제)를 진짜 파이썬 대조 사례로 바꾼다.
 *  화면에서 학생이 보는 실행 결과가 진짜 파이썬과 같다는 것을 이것으로 지킨다.
 *
 *  게임이 넘겨주는 변수(name · level · hunger · event)는 진짜 파이썬에 넘길 방법이 없으므로
 *  코드 맨 위에 대입문으로 붙인다. 우리 해석기도 똑같이 붙인 코드를 돌려 견주므로 줄 번호도 함께 맞춰 본다.
 *  ⚠ node 로 불러다 시험한다. DOM 을 만들지 말 것.
 */
import { FIRST, BUGS, LOAD, BASKET, NEWBIE, SAVE_MODES, LOG_WRITE, LOG_READ, BOSS, eventsFor } from './missions.js';
import { FINAL } from './quiz.js';

const pyStr = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
const head = (vars) => Object.entries(vars).map(([k, v]) => `${k} = ${typeof v === 'string' ? pyStr(v) : v}\n`).join('');
const PET = { name: '비트', level: 3, hunger: 4 };
const SAVE = '비트\n3\n4\n';

function variants(M) {
  const out = [];
  if (M.starter) out.push(['처음 코드', M.starter]);
  if (M.demo) out.push(['시연 코드', M.demo]);
  if (M.model) out.push(['모범 답', M.model]);
  for (const [k, c] of Object.entries(M.others || {})) out.push([`다른 정답 · ${k}`, c]);
  for (const [k, c] of Object.entries(M.mistakes || {})) if (c) out.push([`흔한 실수 · ${k}`, c]);
  return out;
}

export function goldenFromCards() {
  const cases = [];
  const add = (name, code, { vars = {}, files = {} } = {}) => cases.push({ name, files: { 'main.py': head(vars) + code, ...files }, dirs: [] });

  for (const [k, c] of variants(FIRST)) add(`카드2 첫 세이브 · ${k}`, c, { vars: PET });
  for (const [k, c] of variants(BUGS)) add(`카드3 버그 둘 · ${k}`, c, { vars: PET });
  for (const [k, c] of variants(LOAD)) add(`카드5 되살리기 · ${k}`, LOAD.full(c), { files: { 'save.txt': SAVE } });
  add('카드5 되살리기 · 모범 답 · 끝 줄바꿈 없는 세이브', LOAD.full(LOAD.model), { files: { 'save.txt': '별\n1\n9' } });
  for (const [k, c] of variants(BASKET)) add(`카드6 바구니 · ${k}`, c, { vars: PET });
  for (const [k, c] of variants(NEWBIE)) {
    add(`카드7 처음 온 친구 · ${k} · 빈 컴퓨터`, c);
    add(`카드7 처음 온 친구 · ${k} · 세이브 있음`, c, { files: { 'save.txt': SAVE } });
  }
  add("카드8 세이브 a", SAVE_MODES.a, { vars: PET, files: { 'save.txt': '비트\n2\n2\n' } });
  add("카드8 세이브 w", SAVE_MODES.w, { vars: PET, files: { 'save.txt': '비트\n2\n2\n' } });
  const ev = eventsFor('비트');
  for (const [k, c] of variants(LOG_WRITE)) add(`카드9 일지 쓰기 · ${k}`, c, { vars: { event: ev[2] }, files: { 'log.txt': `${ev[0]}\n${ev[1]}\n` } });
  for (const [k, c] of variants(LOG_READ)) add(`카드9 일지 읽기 · ${k}`, c, { files: { 'log.txt': ev.join('\n') + '\n' } });
  add('카드11 ⭐ 깨진 세이브 · 모범 불러오기', BOSS.models.load, { files: { 'save.txt': '비트\n구십구\n4\n' } });
  add('카드11 ⭐ 깨진 세이브 · 더 해 보기 답', BOSS.bonusModel, { files: { 'save.txt': '비트\n구십구\n4\n' } });
  add('카드11 ⭐ 짧은 세이브 · 더 해 보기 답', BOSS.bonusModel, { files: { 'save.txt': '비트\n' } });

  for (const q of FINAL) {
    if (q.fills) q.fills.forEach(([a, b], i) => add(`확인 문제 ${q.id} · 보기 ${i + 1}`, q.code.replace('㉠', a).replace('㉡', b)));
    else add(`확인 문제 ${q.id}`, q.code, { files: q.files || {} });
  }
  return cases;
}
