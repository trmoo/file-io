/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  펫 「비트」 의 규칙. 게임 속 상태는 변수 셋뿐이다 —
 *     name   이름 (str)
 *     level  레벨 (int)   — 놀아 줄 때마다 1 오른다
 *     hunger 배고픔 (int) — 0(배부름) ~ 10(쓰러지기 직전). 놀면 2 오르고, 밥을 주면 3 내린다
 *  이 셋이 곧 세이브 파일의 세 줄이 된다.
 *  ⚠ node 로 불러다 시험한다. DOM 을 만들지 말 것.
 */

export const MAX_HUNGER = 10;
export const DEFAULT_NAME = '비트';
/** 알 — 아직 깨어나지 않았거나, 껐다 켜서 모든 것을 잊은 상태 */
export const EGG = Object.freeze({ name: '알', level: 0, hunger: 0 });

/** 이름 다듬기 — 앞뒤 빈칸·줄바꿈을 걷어 내고 8글자까지. 실명 대신 펫 이름을 쓰게 안내한다 */
export function cleanName(s) {
  const t = String(s ?? '').replace(/[\r\n\t]/g, ' ').replace(/['"\\]/g, '').trim().slice(0, 8);
  return t || DEFAULT_NAME;
}

export const isEgg = (p) => !p || p.level <= 0;

/** 알에서 깨어난다 — 레벨 1, 배고픔 2 */
export function hatch(name) {
  return { name: cleanName(name), level: 1, hunger: 2 };
}

/** 놀아 주기 — 너무 배고프면 놀지 못한다 */
export function play(p) {
  if (isEgg(p)) return { pet: p, ok: false, msg: '아직 알이에요. 먼저 깨워 주세요.' };
  if (p.hunger >= MAX_HUNGER - 1) return { pet: p, ok: false, msg: '배가 너무 고파서 놀 힘이 없어요. 먼저 밥을 주세요! 🍚' };
  return { pet: { ...p, level: p.level + 1, hunger: Math.min(MAX_HUNGER, p.hunger + 2) }, ok: true, msg: `레벨 ${p.level + 1}! 신나요 🎾` };
}

/** 밥 주기 */
export function feed(p) {
  if (isEgg(p)) return { pet: p, ok: false, msg: '알은 아직 밥을 먹지 않아요.' };
  if (p.hunger <= 0) return { pet: p, ok: false, msg: '배불러요! 더는 못 먹어요.' };
  return { pet: { ...p, hunger: Math.max(0, p.hunger - 3) }, ok: true, msg: '냠냠, 맛있어요 🍚' };
}

/** 레벨에 따라 모습이 바뀐다 */
export function stageOf(level) {
  if (level <= 0) return 'egg';
  if (level <= 2) return 'baby';
  if (level <= 5) return 'kid';
  if (level < 99) return 'adult';
  return 'legend';
}
export const STAGE_NAME = { egg: '알', baby: '아기', kid: '어린이', adult: '어른', legend: '전설' };

export function moodOf(hunger) {
  if (hunger >= 8) return 'hungry';
  if (hunger >= 4) return 'ok';
  return 'happy';
}

/** 게임 상태 → 파이썬 변수 */
export const toVars = (p) => ({ name: p.name, level: p.level, hunger: p.hunger });

/** 모범 세이브 파일 내용 — 한 줄에 값 하나 */
export const saveText = (p) => `${p.name}\n${p.level}\n${p.hunger}\n`;

/** 「불러오기」 코드가 끝난 뒤 남은 변수 → 펫. 문제가 있으면 무엇이 잘못됐는지 말해 준다.
 *  (불러오기는 「정확히」 되살려야 한다 — 이름 끝의 ↵ 하나, 글자로 남은 레벨 하나도 게임을 망가뜨린다) */
export function fromVars(v) {
  const problems = [];
  if (!v || !('name' in v)) problems.push('name 변수가 없어요.');
  if (!v || !('level' in v)) problems.push('level 변수가 없어요.');
  if (!v || !('hunger' in v)) problems.push('hunger 변수가 없어요.');
  if (problems.length) return { pet: null, problems };
  if (typeof v.name !== 'string') problems.push('name 이 글자(str)가 아니에요.');
  else if (/\n/.test(v.name)) problems.push('name 끝에 줄바꿈(↵)이 붙어 있어요. strip( ) 으로 떼어 내세요.');
  for (const k of ['level', 'hunger']) {
    if (typeof v[k] === 'string') problems.push(`${k} 가 아직 글자(str) ${JSON.stringify(v[k]).replace(/\\n/g, '↵')} 예요. int( ) 로 숫자로 바꾸세요.`);
    else if (typeof v[k] !== 'number' || !Number.isInteger(v[k])) problems.push(`${k} 가 정수(int)가 아니에요.`);
  }
  if (problems.length) return { pet: null, problems };
  return { pet: { name: v.name, level: Math.max(0, v.level), hunger: Math.max(0, Math.min(MAX_HUNGER, v.hunger)) }, problems };
}
