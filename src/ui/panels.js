/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  메모리 칸 · 디스크 칸 · 파일 내용 보기(↵ · 책갈피) · 바구니.
 *  ★ 이 앱의 핵심 그림 — 「메모리는 꺼지면 사라지고, 디스크는 남는다」 를 두 칸으로 나란히 보여 준다.
 */
import { h, esc, onCleanup } from './dom.js';
import { linesOf } from '../lib/run.js';

const pyRepr = (v) => (typeof v === 'string' ? `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'` : String(v));
const typeTag = (v) => (typeof v === 'string' ? 'str' : Number.isInteger(v) ? 'int' : typeof v);

/** 바뀐 값에 잠깐 반짝임을 주려고 앞의 값을 기억해 둔다 */
const lastShown = new WeakMap();

/**
 * 🧠 메모리 칸 — 지금 게임 속 변수들.
 *   world 가 꺼져 있으면 「모두 사라졌다」 를 보여 준다.
 */
export function memoryPanel(world, { title = '🧠 메모리 (변수)', note = '전원이 꺼지면 사라져요' } = {}) {
  const box = h('section', { class: 'panel mem' });
  const paint = () => {
    const prev = lastShown.get(box) || {};
    const head = h('div', { class: 'panel-head' }, h('b', {}, title), h('small', {}, note));
    if (!world.powered) {
      box.replaceChildren(head, h('div', { class: 'mem-off' },
        h('div', { class: 'ghost' }, 'name = ?'), h('div', { class: 'ghost' }, 'level = ?'), h('div', { class: 'ghost' }, 'hunger = ?'),
        h('div', { class: 'mem-off-msg' }, '⚡ 전원이 꺼져서 변수가 모두 사라졌어요')));
      box.classList.add('off');
      lastShown.set(box, {});
      return;
    }
    box.classList.remove('off');
    const p = world.pet;
    const rows = ['name', 'level', 'hunger'].map((k) => {
      const v = p[k];
      const changed = prev[k] !== undefined && prev[k] !== v;
      return h('div', { class: 'var' + (changed ? ' flash' : '') },
        h('code', { class: 'v-name' }, k), h('span', { class: 'v-eq' }, '='),
        h('code', { class: 'v-val' }, pyRepr(v)), h('span', { class: 'v-type' }, typeTag(v)));
    });
    box.replaceChildren(head, ...rows);
    lastShown.set(box, { ...p });
  };
  paint();
  onCleanup(world.listen(paint));
  return box;
}

/**
 * 파일 내용 — 줄 번호 · ↵(줄바꿈) · 책갈피(읽는 자리) · 고른 곳(방금 읽은 부분).
 *   nl    ↵ 보이기
 *   mark  책갈피 자리(글자 번호) · sel [from, to] 칠할 곳
 */
export function fileText(text, { nl = true, mark = null, sel = null, empty = '(빈 파일 — 글자가 하나도 없어요)' } = {}) {
  const box = h('div', { class: 'ftext' + (nl ? ' show-nl' : '') });
  if ((text ?? '') === '' && mark === null) { box.appendChild(h('div', { class: 'f-empty' }, empty)); return box; }
  const t = text ?? '';
  const lines = t.match(/[^\n]*\n|[^\n]+$/g) || [];
  // 마지막이 ↵ 로 끝나면 「다음 줄의 맨 앞」 도 한 줄로 보여 준다 — 책갈피가 거기 설 수 있다
  if (t === '' || t.endsWith('\n')) lines.push('');
  let pos = 0;
  lines.forEach((ln, i) => {
    let html = '';
    for (let k = 0; k <= ln.length; k++) {
      const at = pos + k;
      if (mark === at) html += '<span class="bm" aria-label="책갈피"></span>';
      if (k === ln.length) break;
      const ch = ln[k];
      const inSel = sel && at >= sel[0] && at < sel[1];
      const body = ch === '\n' ? '<span class="nl">↵</span>' : esc(ch);
      html += inSel ? `<span class="sel">${body}</span>` : body;
    }
    pos += ln.length;
    const isTail = ln === '' && i === lines.length - 1;
    box.appendChild(h('div', { class: 'f-line' + (isTail ? ' tail' : '') }, h('span', { class: 'f-no' }, String(i + 1)), h('span', { class: 'f-src', html: html || '&#8203;' })));
  });
  return box;
}

/**
 * 💾 디스크 칸 — 파일 목록. 파일을 누르면 내용이 펼쳐진다.
 *   state.open   펼친 파일 이름 (카드가 기억해 두게 바깥에서 넘긴다)
 */
export function diskPanel(world, { title = '💾 디스크 (파일)', note = '꺼져도 남아요', state = { open: 'save.txt' }, nl = true, hide = [] } = {}) {
  const box = h('section', { class: 'panel disk' });
  const prev = new Map();
  const paint = () => {
    const names = Object.keys(world.disk).filter((n) => !hide.includes(n)).sort();
    const head = h('div', { class: 'panel-head' }, h('b', {}, title), h('small', {}, note));
    if (!names.length) {
      box.replaceChildren(head, h('div', { class: 'disk-empty' }, '(파일이 하나도 없어요)'));
      prev.clear();
      return;
    }
    const rows = [];
    for (const n of names) {
      const text = world.disk[n];
      const isNew = !prev.has(n);
      const changed = prev.has(n) && prev.get(n) !== text;
      const open = state.open === n;
      rows.push(h('button', {
        class: 'file' + (open ? ' open' : '') + (isNew && prev.size ? ' new' : '') + (changed ? ' changed' : ''),
        onClick: () => { state.open = open ? null : n; paint(); },
        'aria-expanded': open ? 'true' : 'false',
      }, h('span', { class: 'f-ico' }, '📄'), h('b', {}, n),
        h('small', {}, text === '' ? '빈 파일' : `${linesOf(text).length}줄 · ${text.length}글자`),
        h('span', { class: 'f-caret' }, open ? '▲' : '▼')));
      if (open) rows.push(fileText(text, { nl }));
    }
    box.replaceChildren(head, h('div', { class: 'files' }, ...rows));
    prev.clear();
    for (const n of names) prev.set(n, world.disk[n]);
  };
  paint();
  // 처음 그린 다음부터는 새 파일·바뀐 파일을 반짝이게
  onCleanup(world.listen(paint));
  return box;
}

/**
 * 🧺 바구니(버퍼) — 아직 디스크로 가지 않은 글자들.
 */
export function basketView(text, { title = '🧺 바구니 (버퍼)', state = '' } = {}) {
  return h('div', { class: `basket ${state}` },
    h('div', { class: 'basket-title' }, title),
    h('div', { class: 'basket-body' }, text ? fileText(text, { nl: true }) : h('div', { class: 'f-empty' }, '(비어 있음)')));
}
