/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  카드 12 · ✅ 확인 문제 · 오늘 배운 것
 *  확인 문제는 교재 12장 확인 문제(5~8번)와 같은 꼴 — 정기고사와 같은 예제를 쓴다.
 *  오늘 배운 것은 학생이 직접 쓴다(채점하지 않는다). 막히면 실마리 낱말만 하나씩 열린다.
 */
import { h, fill, screenTimeout } from '../ui/dom.js';
import { codeView } from '../ui/code.js';
import { S, card, setCard } from '../store.js';
import { FINAL, NOTES } from '../data/quiz.js';
import { choose, picked, finish } from './kit.js';

export const wrapCard = {
  id: 'c12', chapter: 'wrap', title: '✅ 확인 문제 · 오늘 배운 것',
  render(body, api) {
    const cid = 'c12';
    const st = () => card(cid);
    const right = h('div', { class: 'col' });
    const left = h('div', { class: 'col' });
    const solved = () => FINAL.filter((q) => picked(cid, q.id) === q.answer).length;

    const paintLeft = () => {
      const cur = Math.min(st().q || 0, FINAL.length - 1);
      const q = FINAL[cur];
      fill(left,
        h('div', { class: 'pills' }, ...FINAL.map((x, i) => h('button', {
          class: 'pill' + (i === cur ? ' on' : '') + (picked(cid, x.id) === x.answer ? ' done' : ''),
          onClick: () => { setCard(cid, { q: i }); paintLeft(); },
        }, picked(cid, x.id) === x.answer ? `✔ ${i + 1}` : `${i + 1}`)),
        h('span', { class: 'score' }, `맞힌 문제 ${solved()} / ${FINAL.length}`)),
        h('div', { class: 'q-card' },
          h('div', { class: 'q-tag' }, `${cur + 1}번 · ${q.tag}`),
          h('div', { class: 'q-text' }, q.q),
          h('div', { class: q.out ? 'two' : '' },
            codeView(q.code),
            q.out ? h('div', { class: 'col tight' }, h('div', { class: 'mini-title' }, q.outTitle || '실행 결과'), h('pre', { class: 'q-out' }, q.out)) : null),
          q.files ? h('div', { class: 'muted small' }, `📄 ${Object.keys(q.files)[0]} 의 내용 — ${Object.values(q.files)[0].split('\n').join(' ↵ ')}`) : null,
          choose({ choices: q.choices.map((c) => c.replace(/&/g, '&amp;').replace(/</g, '&lt;')), answer: q.answer, why: q.why, save: [cid, q.id], cls: 'q-choose',
            onPick: (i, ok) => {
              paintLeft();
              if (solved() === FINAL.length) { finish(api, cid, '확인 문제를 모두 맞혔어요! 🎓'); paintRight(); }
              else if (ok && cur < FINAL.length - 1) screenTimeout(() => { setCard(cid, { q: cur + 1 }); paintLeft(); }, 1400);
            } })));
    };

    const paintRight = () => {
      const notes = st().notes || {};
      const clues = st().clues || {};
      const doneCount = Object.keys(S.done).filter((k) => /^c\d\d$/.test(k)).length;
      fill(right,
        h('div', { class: 'mini-title' }, '✍️ 오늘 배운 것 — 내 말로 써 보세요'),
        ...NOTES.map((n) => h('div', { class: 'note' },
          h('div', { class: 'note-q' }, n.q),
          h('textarea', { class: 'note-ta', rows: 2, placeholder: '한두 문장으로', onInput: (e) => setCard(cid, { notes: { ...(st().notes || {}), [n.id]: e.target.value } }) }, notes[n.id] || ''),
          h('div', { class: 'clues' },
            ...n.clues.slice(0, clues[n.id] || 0).map((c) => h('span', { class: 'clue' }, c)),
            (clues[n.id] || 0) < n.clues.length ? h('button', { class: 'btn small', onClick: () => { setCard(cid, { clues: { ...clues, [n.id]: (clues[n.id] || 0) + 1 } }); paintRight(); } }, '💡 실마리 낱말') : null))),
        h('div', { class: 'summary' }, `🏅 해낸 카드 ${doneCount} / 13`, h('small', {}, ' (⭐ 10번은 선택)')),
        h('p', { class: 'start-copy' }, '💾 세이브 파일 공방 · © 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요'));
    };
    paintLeft();
    paintRight();
    fill(body, h('div', { class: 'split l58' }, left, right));
  },
};
