/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  앱이 기억하는 것 — 이 브라우저의 localStorage 에만 남는다(서버로 보내지 않는다).
 *
 *  ★ 펫 상태(메모리)는 일부러 저장하지 않는다.
 *    새로 고침 = 프로그램을 껐다 켠 것. 그래서 새로 고침하면 펫은 사라지고, 디스크(가상 파일)만 남는다.
 *    학생이 만든 불러오기 코드가 있으면 새로 고침해도 그 코드가 펫을 되살린다 — 이 수업 그대로다.
 *
 *  기억하는 것 — 가상 디스크 · 펫 이름(이름 칸을 채워 두려고) · 등록한 저장/불러오기/일지 코드 ·
 *               카드별 진행 · 편집기 내용 · 오늘 배운 것. 개인정보(이름·학번)는 받지 않는다.
 */
import { World } from './game/world.js';

const KEY = 'savefile-workshop:v1';

function blank() {
  return {
    petName: '비트',
    disk: {},
    codes: { save: null, load: null, log: null }, // 학생이 미션을 통과해 「게임에 끼운」 코드
    done: {},       // 카드 id → true
    cards: {},      // 카드 id → 그 카드의 기록(예측·편집기 내용 등)
    card: 0,        // 마지막으로 본 카드
  };
}

function read() {
  try {
    const t = localStorage.getItem(KEY);
    if (!t) return null;
    const v = JSON.parse(t);
    return { ...blank(), ...v, codes: { ...blank().codes, ...(v.codes || {}) } };
  } catch (e) { return null; }
}

export const S = read() || blank();

export function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 저장 공간이 막혀 있어도 앱은 돈다 */ }
}

/* 내 컴퓨터 — 디스크는 S.disk 와 늘 같게 */
const listeners = new Set();
export const ME = new World({ disk: S.disk, label: '내 컴퓨터' });
ME.onChange = (w, ev) => {
  S.disk = w.disk;
  if (w.pet && w.pet.name !== '알') S.petName = w.pet.name;
  persist();
  listeners.forEach((f) => f(w, ev));
};
export function onWorld(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/** 카드 하나의 기록 */
export function card(id) { return S.cards[id] || (S.cards[id] = {}); }
export function setCard(id, patch) { Object.assign(card(id), patch); persist(); }
export function markDone(id) { if (!S.done[id]) { S.done[id] = true; persist(); return true; } return false; }

/** 미션을 통과한 코드를 게임에 끼운다 */
export function plug(kind, code) { S.codes[kind] = code; persist(); }

/** 처음 켤 때 — 등록한 불러오기 코드가 있으면 그것으로 펫을 되살린다 */
export function bootMine() { return ME.powerOn(S.codes.load); }

export function resetAll() {
  try { localStorage.removeItem(KEY); } catch (e) { /* 무시 */ }
  Object.assign(S, blank());
  ME.disk = {};
  ME.pet = { name: '알', level: 0, hunger: 0 };
  ME.changed('reset');
}
