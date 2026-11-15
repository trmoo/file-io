/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  카드들이 함께 쓰는 조각 — 이야기 상자 · 체크리스트 · 예상 고르기 · 힌트 · 편집기 묶음 · 알약 단추.
 */
import { h, fill, toast } from '../ui/dom.js';
import { codeEditor, consoleView, marksOf } from '../ui/code.js';
import { card, setCard, markDone } from '../store.js';

/** 주소에 ?demo 를 붙이면 편집기마다 모범 답이 들어 있다 (선생님 시연용) */
export const DEMO = typeof location !== 'undefined' && /[?&]demo\b/.test(location.search);

/** 이야기 상자 — html 은 우리가 쓴 글만 넣는다(학생 글은 넣지 않는다) */
export function story(html, icon = '📖', cls = '') {
  return h('div', { class: `story ${cls}` }, h('span', { class: 'story-ico' }, icon), h('div', { class: 'story-text', html }));
}

export function tip(html, icon = '💡') {
  return h('div', { class: 'tip' }, h('span', {}, icon), h('div', { html }));
}

/** 체크리스트 — res 가 없으면 labels 만 ⬜ 로 */
export function checklist(res, { title = '✅ 해내야 할 것', labels = [] } = {}) {
  const items = res ? res.items : labels.map((label) => ({ ok: null, label }));
  return h('div', { class: 'checks' + (res && res.pass ? ' pass' : '') },
    h('div', { class: 'checks-title' }, title, res && res.pass ? h('span', { class: 'pass-chip' }, '🎉 통과!') : null),
    ...items.map((it) => h('div', { class: `chk ${it.ok === true ? 'ok' : it.ok === 'warn' ? 'warn' : it.ok === false ? 'no' : ''}` },
      h('span', { class: 'chk-ico' }, it.ok === true ? '✅' : it.ok === 'warn' ? '⚠️' : it.ok === false ? '❌' : '⬜'),
      h('div', {}, h('div', { class: 'chk-label' }, it.label), it.why ? h('div', { class: 'chk-why' }, it.why) : null))));
}

/**
 * 고르기 — 예상(정답을 바로 알려 주지 않음) 또는 문제(맞았는지 바로 알려 줌).
 *   save    [카드 id, 열쇠] — 고른 것을 기억해 둔다
 *   reveal  true 면 고르자마자 정답·풀이를 보여 준다. false 면 「예상을 골랐어요」 만.
 *   retry   틀리면 다시 고를 수 있나 (문제일 때)
 */
export function choose({ q, choices, answer = null, why = '', save, reveal = true, retry = true, onPick = () => {}, cls = '', note = true }) {
  const [cid, key] = save;
  const box = h('div', { class: `choose ${cls}` });
  const paint = () => {
    const st = card(cid)[key] || { picks: [] };
    const last = st.picks[st.picks.length - 1];
    const solved = reveal && answer !== null && last === answer;
    const locked = reveal ? (solved || (!retry && last !== undefined)) : last !== undefined;
    fill(box,
      q ? h('div', { class: 'choose-q', html: q }) : null,
      h('div', { class: 'choose-list' }, ...choices.map((c, i) => {
        const tried = st.picks.includes(i);
        let state = '';
        if (reveal && tried) state = i === answer ? 'right' : 'wrong';
        if (!reveal && last === i) state = 'picked';
        if (reveal && locked && i === answer) state = 'right';
        return h('button', { class: `choice ${state}`, disabled: locked || (reveal && tried), onClick: () => {
          setCard(cid, { [key]: { picks: [...st.picks, i] } });
          paint();
          onPick(i, i === answer);
        } }, h('span', { class: 'choice-no' }, String(i + 1)), h('span', { html: c }));
      })),
      reveal && last !== undefined ? h('div', { class: `choose-why ${last === answer ? 'right' : 'wrong'}` },
        last === answer ? '⭕ 맞아요! ' : retry ? '❌ 다시 골라 보세요. ' : '❌ ', last === answer || !retry ? h('span', { html: why }) : null) : null,
      !reveal && note && last !== undefined ? h('div', { class: 'choose-why picked' }, '✍️ 예상을 골랐어요. 이제 직접 확인해 보세요!') : null);
  };
  paint();
  return box;
}
export const picked = (cid, key) => {
  const st = card(cid)[key];
  return st && st.picks.length ? st.picks[st.picks.length - 1] : undefined;
};

/** 💡 힌트 — 누를 때마다 하나씩 열린다 */
export function hints(list, { cid, key = 'hint' } = {}) {
  const box = h('div', { class: 'hints' });
  const paint = () => {
    const n = (cid && card(cid)[key]) || 0;
    fill(box,
      ...list.slice(0, n).map((t, i) => h('div', { class: 'hint' }, h('b', {}, `힌트 ${i + 1}`), h('span', { html: t }))),
      n < list.length ? h('button', { class: 'btn small hint-btn', onClick: () => { if (cid) setCard(cid, { [key]: n + 1 }); paint(); } }, `💡 힌트 ${n + 1} / ${list.length}`) : null);
  };
  paint();
  return box;
}

/**
 * 편집기 묶음 — 편집기 + [▶ 실행] [↺ 처음 코드] + 실행 결과 자리.
 *   onRun(code) → 실행 결과 r (결과 창에 그린다)
 *   tail        학생 코드 뒤에 게임이 붙이는 코드(읽기 전용)
 */
export function editorBlock({ cid, key = 'code', starter, model = null, tail = '', rows = 7, runLabel = '▶ 실행', onRun, consoleTitle = '실행 결과', extraBtns = [], showConsole = true }) {
  const saved = card(cid)[key];
  const initial = DEMO && model ? model : (typeof saved === 'string' ? saved : starter);
  const out = h('div', { class: 'out-slot' }, consoleView(null, { title: consoleTitle }));
  const ed = codeEditor(initial, {
    tail, rows,
    // 고칠 때마다 바로 기억한다 — 미뤄 두면 카드를 넘기는 순간 마지막 고침이 사라질 수 있다
    onChange: (v) => setCard(cid, { [key]: v }),
    onRun: () => runNow(),
  });
  function show(r) {
    fill(out, consoleView(r, { title: consoleTitle }));
    // 오류 줄과 한국어 풀이는 맨 끝에 있다 — 결과 창이 넘치면 끝이 보이게 내려 둔다
    const pre = out.querySelector('pre');
    if (pre) pre.scrollTop = pre.scrollHeight;
    ed.mark(marksOf(r));
  }
  function runNow() {
    setCard(cid, { [key]: ed.value });
    const r = onRun(ed.value);
    if (r) show(r);
    return r;
  }
  const bar = h('div', { class: 'ed-bar' },
    h('button', { class: 'btn primary run', onClick: runNow, title: 'Ctrl+Enter 로도 실행돼요' }, runLabel),
    ...extraBtns,
    h('button', { class: 'btn small', title: '처음 코드로 되돌리기', onClick: () => { ed.value = starter; setCard(cid, { [key]: starter }); fill(out, consoleView(null, { title: consoleTitle })); } }, '↺ 처음으로'));
  return { el: h('div', { class: 'ed-block' }, ed.el, bar, showConsole ? out : null), ed, out, show, runNow };
}

/** 카드를 해냈을 때 — 처음 한 번만 축하 */
export function finish(api, cid, msg = '해냈어요!') {
  if (markDone(cid)) {
    toast(`🎉 ${msg}`, 'gold big');
    api.refreshHead();
  }
}

/** 알약 단추 — 카드 안의 작은 갈래 */
export function pills(items, current, onPick) {
  return h('div', { class: 'pills' }, ...items.map((it) => h('button', {
    class: 'pill' + (it.id === current ? ' on' : '') + (it.done ? ' done' : ''), onClick: () => onPick(it.id),
  }, it.done ? '✔ ' : '', it.label)));
}

/** 줄바꿈을 ↵ 로 보여 주는 짧은 글 (체크리스트·말풍선 안) */
export const nlText = (s) => String(s).replace(/\n/g, '↵');
