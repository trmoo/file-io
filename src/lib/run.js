/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  학생 코드를 「프로그램 한 번」 으로 돌린다.
 *
 *  ★ 실행 한 번 = 프로그램 한 번. 끝나면 변수(메모리)는 모두 사라지고, 디스크(파일)만 남는다.
 *    그래서 돌려주는 값도 둘로 나뉜다 —
 *      vars : 프로그램이 끝나는 순간 남아 있던 변수 (화면은 이것으로 「불러온 값」 을 읽는다)
 *      disk : 실행 뒤 디스크 (다음 실행은 이것을 그대로 받는다)
 *  ⚠ node 로 불러다 시험한다. DOM 을 만들지 말 것.
 */
import { runProject } from './pymini.js';

export const ENTRY = 'main.py';

/**
 * src   학생 코드
 * disk  실행 전 디스크 { 'save.txt': '비트\n3\n4\n', … }
 * vars  프로그램보다 먼저 정해 둔 변수 { name: '비트', level: 3 } — 게임이 넘겨주는 「지금 상태」
 */
export function run(src, { disk = {}, vars = null, dirs = [] } = {}) {
  const files = { ...disk, [ENTRY]: src };
  const r = runProject({ files, dirs, entry: ENTRY, vars, maxSteps: 200000 });
  const after = { ...r.files };
  delete after[ENTRY];
  const varMap = {};
  for (const v of r.vars) varMap[v.name] = v.value;
  return { ...r, disk: after, varMap };
}

/** 빈칸 ___ 이 남아 있나 */
export const hasBlank = (src) => /_{3,}/.test(src);

/** 파일 내용 → 줄 목록 (맨 끝의 줄바꿈 하나는 「마지막 줄의 끝」 이라 줄을 하나 더 만들지 않는다) */
export function linesOf(text) {
  if (text == null || text === '') return [];
  return text.replace(/\n$/, '').split('\n');
}

/** 화면에 보일 때 줄바꿈을 ↵ 로 */
export const showNL = (s) => String(s).replace(/\n/g, '↵\n');
