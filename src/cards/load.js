/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  카드 4 · 읽기 삼형제  — read( ) · readline( ) · readlines( ) 와 책갈피(읽는 자리)
 *  카드 5 · 되살리기     — 읽은 것은 모두 글자다. strip( ) 과 int( ) 로 되살린다
 */
import { h, fill, toast, onCleanup } from '../ui/dom.js';
import { codeView, consoleView } from '../ui/code.js';
import { fileText } from '../ui/panels.js';
import { ME, S, card, setCard, plug } from '../store.js';
import { run, linesOf } from '../lib/run.js';
import { saveText } from '../game/pet.js';
import { LOAD, LOAD_TAIL } from '../data/missions.js';
import { story, tip, checklist, hints, editorBlock, finish } from './kit.js';
import { ensureOn } from './start.js';
import { myComputer } from './save.js';
import { j } from '../lib/josa.js';

/** 디스크의 세이브를 펫으로 읽어 본다(세 줄짜리가 아니면 기본값) */
export function savedPet() {
  const L = linesOf(ME.disk['save.txt']);
  if (L.length === 3 && /^\d+$/.test(L[1].trim()) && /^\d+$/.test(L[2].trim())) return { name: L[0], level: Number(L[1]), hunger: Number(L[2]) };
  return { name: S.petName || '비트', level: 3, hunger: 4 };
}

/* ═════════════ 카드 4 ═════════════ */
const SNIPS = [
  { id: 'A', call: 'read', what: '전체를 읽는다' },
  { id: 'B', call: 'readline', what: '한 줄을 읽는다' },
  { id: 'C', call: 'readlines', what: '모든 줄을 리스트로' },
];
const ORDER = ['B', 'C', 'A']; // 결과 카드 ①②③ 의 차례 (코드 차례와 다르게)
const snipCode = (call) => `f = open('save.txt', 'r')\nprint(f.${call}())\nf.close()\n`;

export const read3Card = {
  id: 'c04', chapter: 'load', title: '📖 읽기 삼형제와 책갈피',
  render(body, api) {
    ensureOn();
    const cid = 'c04';
    const text = linesOf(ME.disk['save.txt']).length === 3 ? ME.disk['save.txt'] : saveText(savedPet());
    const disk = { 'save.txt': text };
    const results = Object.fromEntries(SNIPS.map((s) => [s.id, run(snipCode(s.call), { disk })]));
    const st = () => card(cid);
    const labCode = (ops) => `f = open('save.txt', 'r')\n${ops.map((o) => `print(repr(f.${o}()))`).join('\n')}\n`;
    const isEmptyOut = (l) => l === "''" || l === '[]';

    // 해낸 것은 따로 기억한다 — 「📂 다시 열기」 로 실험 기록을 비워도 지난 실험 횟수와 「읽을 게 없음」 은 남는다
    {
      const ops = st().ops || [];
      const seen = run(labCode(ops), { disk }).stdout.split('\n').some(isEmptyOut);
      if ((st().reads || 0) < ops.length || (seen && !st().sawEmpty)) setCard(cid, { reads: Math.max(st().reads || 0, ops.length), sawEmpty: !!st().sawEmpty || seen });
    }
    const progress = () => {
      const s = st();
      const m = s.match || {};
      return { match: !!s.checked && SNIPS.every((x) => ORDER[m[x.id]] === x.id), reads: s.reads || 0, empty: !!s.sawEmpty };
    };

    /* ── 오른쪽 아래: 해낼 것 세 가지 (해낸 것은 ✅) ── */
    const goal = h('div', { class: 'mission-line' });
    const paintGoal = () => {
      const p = progress();
      const item = (ok, label) => h('span', { class: 'goal' + (ok ? ' ok' : '') }, ok ? '✅ ' : '⬜ ', label);
      fill(goal, '🎯 ',
        item(p.match, '짝 셋 맞히기'), ' · ',
        item(p.reads >= 3, `책갈피 실험 세 번 이상 (${Math.min(p.reads, 3)}/3)`), ' · ',
        item(p.empty, '「읽을 게 없음」 한 번 보기'));
    };

    /* ── 오른쪽: 짝 맞추기 ── */
    const match = h('div', { class: 'match' });
    const paintMatch = () => {
      const m = st().match || {};
      const checked = !!st().checked;
      const allRight = SNIPS.every((s) => ORDER[m[s.id]] === s.id);
      fill(match,
        h('div', { class: 'match-cols' },
          h('div', { class: 'col tight' }, h('div', { class: 'mini-title' }, '코드'),
            ...SNIPS.map((s) => h('div', { class: 'snip' + (checked ? (ORDER[m[s.id]] === s.id ? ' right' : ' wrong') : '') },
              h('div', { class: 'snip-head' }, h('b', {}, s.id), h('code', {}, `${s.call}( )`), h('small', {}, '→ 결과는?'),
                ...ORDER.map((_, k) => h('button', { class: 'nbtn' + (m[s.id] === k ? ' on' : ''), disabled: checked && allRight, onClick: () => {
                  setCard(cid, { match: { ...m, [s.id]: k }, checked: false }); paintMatch();
                } }, String(k + 1)))),
              codeView(snipCode(s.call), { marks: { 2: 'on' } })))),
          h('div', { class: 'col tight' }, h('div', { class: 'mini-title' }, '실행 결과'),
            ...ORDER.map((id, k) => h('div', { class: 'res-card' }, h('b', { class: 'res-no' }, String(k + 1)), consoleView(results[id], { title: '화면' }))))),
        h('div', { class: 'row' },
          h('button', { class: 'btn primary', disabled: SNIPS.some((s) => m[s.id] === undefined) || (checked && allRight), onClick: () => {
            setCard(cid, { checked: true });
            paintMatch();
            if (SNIPS.every((s) => ORDER[m[s.id]] === s.id)) {
              const p = progress();
              toast(p.reads >= 3 && p.empty ? '⭕ 셋 다 맞았어요!' : '⭕ 셋 다 맞았어요! 이제 왼쪽 책갈피 실험실도 해 보세요', 'gold');
              maybeDone();
            } else toast('❌ 틀린 짝이 있어요. 빨간 것을 다시 골라 보세요', 'bad');
          } }, '✔ 맞는지 보기'),
          checked && allRight ? h('div', { class: 'reveal right' }, '⭕ ', h('b', {}, 'readline'), ' 뒤에는 빈 줄이 하나 생겨요 — 읽은 줄 끝의 ↵ 와 print 의 줄바꿈이 겹쳐서예요. ', h('b', {}, 'readlines'), ' 는 줄마다 ↵ 가 붙은 채 리스트로 와요.') : null));
      paintGoal();
    };

    /* ── 왼쪽: 책갈피 실험실 ── */
    const lab = h('div', { class: 'col tight' });
    const paintLab = () => {
      const ops = st().ops || [];
      const r = run(labCode(ops), { disk });
      const reads = r.fileLog.filter((x) => x.op === 'read');
      const last = reads[reads.length - 1];
      const pos = last ? last.to : 0;
      const outs = r.stdout.split('\n').filter((l, i, a) => i < ops.length);
      fill(lab,
        h('div', { class: 'mini-title' }, '🔖 책갈피 실험실 — 같은 파일을 연 채로 하나씩 읽어 보세요'),
        fileText(text, { mark: pos, sel: last ? [last.from, last.to] : null }),
        h('div', { class: 'row' },
          ...['readline', 'read', 'readlines'].map((o) => h('button', { class: 'btn small code-btn', onClick: () => {
            const next = [...ops, o];
            // 방금 읽은 것이 빈 글자('' · [])였나 — 책갈피가 끝에 닿았다는 뜻
            const lines = run(labCode(next), { disk }).stdout.split('\n');
            const empty = isEmptyOut(lines[next.length - 1] || '');
            setCard(cid, { ops: next.slice(-8), reads: (st().reads || 0) + 1, sawEmpty: !!st().sawEmpty || empty });
            paintLab(); maybeDone();
          } }, `f.${o}()`)),
          h('button', { class: 'btn small', onClick: () => { setCard(cid, { ops: [] }); paintLab(); } }, '📂 다시 열기')),
        h('div', { class: 'hist' },
          ops.length ? null : h('div', { class: 'muted small' }, '아직 읽지 않았어요. 책갈피 ▼ 가 맨 앞에 있어요.'),
          ...ops.map((o, i) => h('div', { class: 'hist-row' + (i === ops.length - 1 ? ' last' : '') },
            h('code', {}, `f.${o}()`), ' → ', h('code', { class: 'ret' }, outs[i] ?? ''),
            /^''$|^\[\]$/.test(outs[i] || '') ? h('span', { class: 'empty-tag' }, '읽을 게 없음!') : null))),
        tip('책갈피는 <b>읽은 만큼 앞으로</b> 가요. 끝까지 간 뒤에 또 읽으면 빈 글자 <code>\'\'</code> 가 나와요. 처음부터 다시 읽으려면 파일을 <b>다시 열어야</b> 해요.', '🔖'));
      paintGoal();
    };

    function maybeDone() {
      const p = progress();
      if (p.match && p.reads >= 3 && p.empty) finish(api, cid, '읽기 삼형제와 책갈피를 익혔어요!');
    }

    paintMatch();
    paintLab();
    maybeDone(); // 예전에 조건을 다 채워 두었다면 열자마자 완료로
    fill(body, h('div', { class: 'split l40' },
      h('div', { class: 'col' },
        story(`디스크의 save.txt 를 <b>읽는</b> 방법은 셋이에요. 오른쪽 코드와 결과의 짝을 맞춰 보고, 아래 실험실에서 <b>책갈피</b>가 어떻게 움직이는지 보세요.`, '📖'),
        lab),
      h('div', { class: 'col' }, match, goal)));
  },
};

/* ═════════════ 카드 5 ═════════════ */
export const loadCard = {
  id: 'c05', chapter: 'load', title: '🔢 되살리기 — strip( ) 과 int( )',
  render(body, api) {
    ensureOn();
    const cid = 'c05';
    const checks = h('div', {}, checklist(card(cid).res || null, { labels: ['오류 없이 실행된다', 'name 에 줄바꿈(↵)이 붙지 않았다', 'level 과 hunger 가 숫자(int)로 되살아났다', '다른 세이브 파일 둘로도 맞다'] }));
    const after = h('div', {});
    // 세이브가 세 줄이 아니면(3번 카드를 끝내지 않았으면) 불러오기를 시험할 수 없다 — 알려 주고 바로 만들 수 있게
    const notice = h('div', {});
    const paintNotice = () => {
      const L = linesOf(ME.disk['save.txt']);
      if (L.length === 3) { fill(notice); return; }
      fill(notice, h('div', { class: 'reveal wrong' },
        `💾 지금 save.txt 는 ${L.length ? `${L.length}줄` : '없어요'} — 이름 · 레벨 · 배고픔 세 줄이어야 불러올 수 있어요. `,
        h('button', { class: 'btn small', onClick: () => {
          const p = ME.powered && ME.pet && ME.pet.level > 0 ? ME.pet : savedPet();
          ME.setFile('save.txt', saveText(p));
          toast('세 줄짜리 세이브를 만들었어요', 'gold');
          paintNotice();
        } }, '세 줄 세이브 만들기')));
    };
    paintNotice();
    onCleanup(ME.listen(() => paintNotice()));
    const paintAfter = () => {
      if (card(cid).restored) fill(after, h('div', { class: 'reveal right' }, '🎉 껐다 켜도 펫이 돌아왔어요! 이제 이 게임에는 진짜 세이브 시스템이 있어요.'));
      else if (S.codes.load && card(cid).res && card(cid).res.pass) fill(after, h('div', { class: 'go-try big' }, '👈 이제 게임기의 ', h('b', {}, '⏻ 끄기'), ' → ', h('b', {}, '⏻ 켜기'), ' 를 눌러 보세요! 켤 때 방금 만든 코드가 돌아요.'));
      else fill(after);
    };
    const blk = editorBlock({
      cid, starter: LOAD.starter, model: LOAD.model, tail: LOAD_TAIL, rows: 6, runLabel: '▶ 불러오기 실행',
      onRun: (code) => {
        if (!('save.txt' in ME.disk)) { toast('디스크에 save.txt 가 없어요. 먼저 💾 저장을 눌러 주세요', 'bad'); paintNotice(); return null; }
        const r = run(LOAD.full(code), { disk: ME.disk });
        const res = LOAD.check(code, { pet: savedPet() });
        setCard(cid, { res });
        fill(checks, checklist(res));
        if (res.pass) { plug('load', code); toast('📂 불러오기 코드를 게임기에 끼웠어요!', 'gold'); }
        paintAfter();
        return r;
      },
    });
    const left = myComputer({ onEvent: (k, r) => {
      if (k === 'on' && r.restored && S.codes.load) { setCard(cid, { restored: true }); paintAfter(); if (card(cid).res && card(cid).res.pass) finish(api, cid, `${j(ME.pet.name, '이')} 돌아왔어요!`); }
    } });
    paintAfter();
    fill(body, h('div', { class: 'split l40' },
      left,
      h('div', { class: 'col' },
        story('save.txt 는 디스크에 잘 남아 있어요. 이제 <b>켤 때 그 파일을 읽어</b> 펫을 되살리는 「불러오기」 코드를 만들어요. 그런데 그대로 실행하면… 게임이 이상해져요!', '🔢'),
        notice,
        h('div', { class: 'split-in' }, blk.el, h('div', { class: 'col tight' }, checks,
          tip("파일에서 읽은 것은 <b>모두 글자(str)</b>이고, 줄 끝에는 <b>↵</b> 가 붙어 있어요. <code>'3\\n'</code> 은 숫자 3 이 아니에요!"),
          hints(['인사말이 왜 두 줄로 갈라졌을까요? <code>lines[0]</code> 끝에 무엇이 붙어 있나요?', "<code>'비트\\n'.strip()</code> → <code>'비트'</code> — 앞뒤의 빈칸·줄바꿈을 떼어 내요.", '<code>int(lines[1])</code> — 글자를 숫자로 바꿔요. (int 는 끝의 ↵ 를 봐 줘요)'], { cid }),
          after)))));
  },
};
