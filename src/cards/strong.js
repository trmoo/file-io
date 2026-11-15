/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  카드 6 · 저장했는데 빈 파일? — 바구니(버퍼)와 close · with
 *  카드 7 · 처음 온 친구        — 세이브가 없으면 FileNotFoundError → try–except
 */
import { h, fill } from '../ui/dom.js';
import { codeView, consoleView } from '../ui/code.js';
import { gameBox } from '../ui/gamebox.js';
import { fileText, diskPanel, basketView } from '../ui/panels.js';
import { ME, S, card, setCard, plug } from '../store.js';
import { World } from '../game/world.js';
import { run } from '../lib/run.js';
import { toVars, isEgg, saveText } from '../game/pet.js';
import { BASKET, NEWBIE, OTHER } from '../data/missions.js';
import { story, tip, checklist, choose, picked, hints, editorBlock, finish, pills } from './kit.js';
import { ensureOn } from './start.js';
import { savedPet } from './load.js';

/* ═════════════ 카드 6 ═════════════ */

/** 실행 기록(fileLog)을 「한 걸음씩」 으로 바꾼다 — 걸음마다 바구니·디스크·화면 */
export function stepsOf(r, before) {
  const steps = [];
  let disk = before, basket = '', out = '';
  const names = {};
  const outLines = r.stdout.split('\n');
  for (const op of r.fileLog) {
    const prev = steps[steps.length - 1];
    if (op.op === 'open') {
      names[op.id] = op.mode;
      steps.push({ line: op.line, disk, basket, out,
        cap: op.mode === 'r' ? `${op.line}번 줄 — 확인하려고 같은 파일을 'r'(읽기)로 열었어요.` : `${op.line}번 줄 — save.txt 를 '${op.mode}' 로 열었어요.` });
    } else if (op.op === 'truncate' || op.op === 'create') {
      disk = '';
      prev.disk = disk;
      prev.cap += op.op === 'truncate' ? " 'w' 는 여는 순간 원래 내용을 지워요!" : ' 파일이 없어서 빈 파일을 새로 만들었어요.';
    } else if (op.op === 'write') {
      basket = op.buf;
      steps.push({ line: op.line, disk, basket, out, cap: `${op.line}번 줄 — 쓴 글자가 🧺 바구니에 담겼어요. 💾 디스크는 아직 그대로예요!` });
    } else if (op.op === 'read') {
      out = outLines[0] ?? '';
      steps.push({ line: op.line, disk, basket, out, read: op.text,
        cap: op.text === '' ? `${op.line}번 줄 — 디스크에서 읽었더니… 텅 비어 있어요! 글자는 아직 바구니 속에 있으니까요.` : `${op.line}번 줄 — 디스크에서 읽었어요. 세 줄이 모두 있어요.` });
    } else if (op.op === 'flush') {
      disk = op.disk; basket = '';
      steps.push({ line: op.why === 'end' ? null : op.line, disk, basket, out, poured: true,
        cap: op.why === 'end' ? '프로그램이 끝나는 순간 — 그제야 바구니가 💾 디스크로 쏟아졌어요. 하지만 확인은 이미 끝난 뒤였죠.'
          : op.why === 'with' ? `${op.line}번 줄 — with 블록이 끝나며 파일이 닫히고, 바구니가 디스크로 쏟아졌어요.`
            : `${op.line}번 줄 — close( ) 가 바구니를 디스크로 쏟았어요.` });
    } else if (op.op === 'close' && op.why !== 'end' && !(prev && prev.poured && prev.line === op.line)) {
      steps.push({ line: op.line, disk, basket, out, cap: `${op.line}번 줄 — ${names[op.id] === 'r' ? '확인용 파일을' : '파일을'} 닫았어요.` });
    }
  }
  return steps;
}

export const basketCard = {
  id: 'c06', chapter: 'strong', title: '🧺 저장했는데 빈 파일?',
  render(body, api) {
    ensureOn();
    const cid = 'c06';
    const pet = ME.powered && !isEgg(ME.pet) ? ME.pet : savedPet();
    const tab = card(cid).tab || 'see';
    const st = () => card(cid);
    const go = (t) => { setCard(cid, { tab: t }); basketCard.render(body, api); };
    const done = () => {
      const s = st();
      if (picked(cid, 'guess') !== undefined && s.reachedEnd && s.res && s.res.pass) finish(api, cid, '바구니(버퍼)와 with 를 익혔어요!');
    };
    const top = pills([{ id: 'see', label: '1. 무슨 일이?', done: !!st().reachedEnd }, { id: 'fix', label: '2. with 로 고치기', done: !!(st().res && st().res.pass) }], tab, go);

    if (tab === 'see') {
      const before = ME.disk['save.txt'] ?? null;
      const r = run(BASKET.demo, { disk: { ...ME.disk }, vars: toVars(pet) });
      const steps = stepsOf(r, before);
      const view = h('div', { class: 'col' });
      const right = h('div', { class: 'col' });
      const paint = () => {
        const k = Math.min(st().step ?? -1, steps.length - 1);
        const s = k >= 0 ? steps[k] : { line: null, disk: before, basket: '', out: '', cap: '▶ 를 눌러 한 줄씩 따라가 보세요.' };
        const end = k === steps.length - 1;
        fill(view,
          codeView(BASKET.demo, { marks: s.line ? { [s.line]: 'on' } : {} }),
          h('div', { class: 'stepper' },
            h('button', { class: 'btn small', disabled: k < 0, onClick: () => { setCard(cid, { step: k - 1 }); paint(); } }, '◀'),
            h('button', { class: 'btn primary', disabled: end || picked(cid, 'guess') === undefined, onClick: () => {
              setCard(cid, { step: k + 1, reachedEnd: st().reachedEnd || k + 1 === steps.length - 1 }); paint(); done();
            } }, k < 0 ? '▶ 한 줄씩 보기' : '▶ 다음'),
            h('span', { class: 'step-no' }, `${k + 1} / ${steps.length}`)),
          h('div', { class: `cap ${s.read === '' ? 'bad' : s.poured ? 'gold' : ''}` }, s.cap),
          picked(cid, 'guess') === undefined ? h('div', { class: 'muted small' }, '👉 먼저 오른쪽에서 결과를 예상해 주세요.') : null);
        fill(right,
          choose({ q: '7번 줄 <code>print(\'저장된 내용:\', check.read())</code> 는 무엇을 보여 줄까요?',
            choices: ['이름 · 레벨 · 배고픔 세 줄', '아무것도 없다 (빈 글자)', '오류가 난다'], save: [cid, 'guess'], reveal: false, onPick: () => paint(), cls: 'inline' }),
          h('div', { class: 'two' },
            basketView(s.basket, { state: s.basket ? 'full' : '' }),
            h('div', { class: `panel disk mini ${s.poured ? 'pour' : ''}` }, h('div', { class: 'panel-head' }, h('b', {}, '💾 디스크의 save.txt')),
              s.disk === null ? h('div', { class: 'disk-empty' }, '(파일 없음)') : fileText(s.disk))),
          consoleView(k >= 0 && s.out !== '' ? { ok: true, stdout: s.out } : null, { title: '화면' }),
          end ? tip('컴퓨터는 디스크에 조금씩 자주 쓰면 느려서, 쓸 글자를 <b>바구니(버퍼)</b>에 모았다가 한꺼번에 써요. 바구니를 쏟는 때는 <b>close( )</b> · <b>with 블록 끝</b> · 프로그램 끝이에요.<br>📒 <b>코랩</b>에서는 셀이 끝나도 프로그램이 끝나지 않아서, 닫지 않으면 파일이 계속 비어 보일 수 있어요!', '🧺') : null,
          end ? h('button', { class: 'btn primary', onClick: () => go('fix') }, '2. with 로 고치러 가기 ▶') : null);
      };
      paint();
      fill(body, top, h('div', { class: 'split l50' }, view, right));
      return;
    }

    // ② 고치기
    const checks = h('div', {}, checklist(st().res || null, { labels: ['오류 없이 실행된다', 'with 문으로 열었다', '확인할 때 세 줄이 모두 보인다'] }));
    const blk = editorBlock({
      cid, starter: BASKET.demo, model: BASKET.model, rows: 9, runLabel: '▶ 실행',
      onRun: (code) => {
        const res = BASKET.check(code, { pet, disk: ME.disk });
        setCard(cid, { res });
        fill(checks, checklist(res));
        done();
        return res.runs[0];
      },
    });
    fill(body, top, h('div', { class: 'split l55' },
      h('div', { class: 'col' }, story('<b>with</b> 문으로 열면 블록(들여 쓴 부분)이 끝날 때 파일이 <b>저절로 닫히며</b> 바구니가 쏟아져요. 저장 부분을 with 로 바꿔, 확인할 때 세 줄이 다 보이게 해 보세요.', '🛠️'), blk.el),
      h('div', { class: 'col' }, checks,
        h('div', { class: 'mini-title' }, 'with 문의 모양'),
        codeView("with open('save.txt', 'w') as f:\n    f.write(...)      # 들여 쓴 동안만 열려 있다\n    f.write(...)\n# 여기서는 이미 닫혀 있다 (바구니도 쏟아짐)", { marks: { 1: 'on' } }),
        tip('<code>close( )</code> 를 빠뜨리는 실수는 아주 흔해요. <b>with</b> 를 쓰면 잊을 수가 없어요. 오류가 나서 중간에 멈춰도 닫아 줘요.'),
        hints(['쓰는 세 줄을 with 블록 안으로 넣고 4칸 들여 쓰세요.', '확인하는 부분(check = …)은 with 블록 <b>밖</b>(들여 쓰지 않음)에 있어야 해요.', "<code>with open('save.txt', 'w') as f:</code> 다음 줄부터 <code>    f.write(name + '\\n')</code> …"], { cid }))));
  },
};

/* ═════════════ 카드 7 ═════════════ */
const FRIEND = new World({ disk: {}, label: '친구 컴퓨터' });

export const newbieCard = {
  id: 'c07', chapter: 'strong', title: '🆕 처음 온 친구',
  render(body, api) {
    const cid = 'c07';
    if (!FRIEND.powered) FRIEND.powerOn(null);
    const checks = h('div', {}, checklist(card(cid).res || null, { labels: ['세이브가 없는 컴퓨터에서도 멈추지 않는다', '새 알(level 0 · hunger 0)로 시작한다', '세이브가 있으면 그대로 불러온다', 'except FileNotFoundError 로 콕 집었다 (권장)'] }));
    let blk = null;
    const toggle = h('div', {});
    const paintToggle = () => {
      const has = 'save.txt' in FRIEND.disk;
      fill(toggle, h('button', { class: 'btn small', onClick: () => { FRIEND.setFile('save.txt', has ? null : saveText(OTHER)); paintToggle(); } },
        has ? '🗑️ 친구 세이브 지우기' : `💾 친구 세이브 넣어 보기 (${OTHER.name} · Lv.${OTHER.level})`));
    };
    paintToggle();
    blk = editorBlock({
      cid, starter: NEWBIE.starter, model: NEWBIE.model, rows: 12, runLabel: '▶ 친구 컴퓨터에서 켜기',
      onRun: (code) => {
        FRIEND.powerOff();
        const { r } = FRIEND.powerOn(code);
        const res = NEWBIE.check(code);
        setCard(cid, { res });
        fill(checks, checklist(res));
        if (res.pass) { plug('load', code); finish(api, cid, '어느 컴퓨터에서도 멈추지 않는 불러오기 완성!'); }
        return r;
      },
    });
    fill(body, h('div', { class: 'split l36' },
      h('div', { class: 'col' },
        h('div', { class: 'who' }, '👫 친구 컴퓨터'),
        gameBox(FRIEND, { loadCode: () => blk.ed.value, size: 'sm' }),
        diskPanel(FRIEND, { title: '💾 친구 컴퓨터의 디스크', note: '' }), toggle),
      h('div', { class: 'col' },
        story('친구가 이 게임을 <b>처음</b> 깔았어요. 친구 컴퓨터에는 save.txt 가 <b>없어요</b>. 켜자마자 불러오기 코드가 돌면…? 실행해 보고, <b>예외 처리</b>로 고쳐 주세요.', '👫'),
        h('div', { class: 'split-in wide-ed' }, blk.el, h('div', { class: 'col tight' }, checks,
          tip("세이브가 없을 때는 <b>새 알</b>로 시작하면 돼요: <code>name = '알'</code> · <code>level = 0</code> · <code>hunger = 0</code>"),
          hints(['오류 이름은 <code>FileNotFoundError</code> 예요. 예외 처리 시간에 배운 try–except 를 떠올려 보세요.', '읽고 되살리는 줄 전체를 <code>try:</code> 안에 넣고(4칸 들여 쓰기) 아래에 <code>except FileNotFoundError:</code> 를 붙여요.', "except 블록 안에 <code>name = '알'</code>, <code>level = 0</code>, <code>hunger = 0</code> 을 써요."], { cid }),
          tip('파일 작업은 <b>코드가 맞아도</b> 실패할 수 있어요(파일이 없다 · 지워졌다 · 잠겼다). 그래서 파일과 예외 처리는 늘 짝꿍이에요.', '🤝'))))));
  },
};
