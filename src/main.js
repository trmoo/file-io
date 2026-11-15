/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  학교 수업 목적으로만 이용해 주세요. 자세한 내용은 LICENSE 를 보세요.
 *
 *  펫 「비트」 를 키우며 세이브(저장 · 불러오기 · 일지)를 직접 만드는 파일 입출력 수업 (교재 12장 B · [12정03-05]).
 *  ★ 새로 고침 = 프로그램을 껐다 켠 것. 펫(메모리)은 사라지고 가상 디스크만 남는다.
 *    학생이 만든 불러오기 코드가 있으면 그 코드가 펫을 되살린다.
 *  주소에 ?demo 를 붙이면 편집기마다 모범 답이 들어 있다(선생님 시연용).
 */
import './style.css';
import { h, modal } from './ui/dom.js';
import { createStage, createDeck } from './ui/deck.js';
import { CHAPTERS, CARDS } from './cards/index.js';
import { S, persist, bootMine, resetAll } from './store.js';
import { DEMO } from './cards/kit.js';

const { holder, stage } = createStage();
document.body.append(holder);

// 켤 때 — 등록한 불러오기 코드가 있으면 그것으로 펫을 되살린다
bootMine();

async function askReset() {
  const ok = await modal('🧹 기록 지우기',
    '이 브라우저에 남은 것(가상 디스크의 파일 · 내가 끼운 코드 · 카드 진행 · 편집기 내용)을 모두 지우고 처음부터 시작할까요? 되돌릴 수 없어요.',
    { ok: '모두 지우기', cancel: '그만두기' });
  if (!ok) return;
  resetAll();
  location.reload();
}

createDeck(stage, CARDS, {
  chapters: CHAPTERS,
  start: S.card || 0,
  isDone: (id) => !!S.done[id],
  onMove: (i) => { S.card = i; persist(); },
  chip: () => h('div', { class: 'me-chip' },
    DEMO ? h('span', { class: 'demo-tag' }, '👩‍🏫 시연') : null,
    `✔ ${Object.keys(S.done).length} / ${CARDS.length}`),
  tools: () => h('button', { class: 'reset-btn', title: '이 브라우저의 기록을 모두 지웁니다', onClick: askReset }, '🧹 기록 지우기'),
});
