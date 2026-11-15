/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  카드 0 · 알이 깨어났다   — 게임 속 펫은 결국 변수 셋이다
 *  카드 1 · 리셋의 충격     — 껐다 켜면 변수(메모리)는 사라진다. 파일(디스크)은 남는다
 */
import { h, fill, onCleanup } from '../ui/dom.js';
import { codeView } from '../ui/code.js';
import { gameBox } from '../ui/gamebox.js';
import { memoryPanel, diskPanel } from '../ui/panels.js';
import { ME, S, card, setCard } from '../store.js';
import { isEgg } from '../game/pet.js';
import { story, tip, checklist, choose, picked, finish } from './kit.js';
import { j } from '../lib/josa.js';

/** 카드에 들어올 때 내 컴퓨터가 꺼져 있으면 켠다(등록한 불러오기 코드로) */
export function ensureOn() {
  if (!ME.powered) ME.powerOn(S.codes.load);
}

/* ═════════════ 카드 0 ═════════════ */
export const hatchCard = {
  id: 'c00', chapter: 'start', title: '🥚 알이 깨어났다',
  render(body, api) {
    ensureOn();
    const cid = 'c00';
    const inside = h('div', { class: 'inside' });
    const list = h('div', {});
    const paintInside = (ev) => {
      const p = ME.pet || { name: '?', level: '?', hunger: '?' };
      const hot = ev && ev.kind;
      const v = (x) => (typeof x === 'string' ? `'${x}'` : String(x));
      fill(inside,
        h('div', { class: 'mini-title' }, `🔍 게임 속을 들여다보면 — ${j(ME.pet && !isEgg(ME.pet) ? ME.pet.name : '펫', '은')} 변수 셋이에요`),
        codeView(`name = ${v(p.name)}      # 이름\nlevel = ${v(p.level)}         # 레벨\nhunger = ${v(p.hunger)}        # 배고픔`, {
          marks: hot === 'play' ? { 2: 'on', 3: 'on' } : hot === 'feed' ? { 3: 'on' } : hot === 'hatch' ? { 1: 'on', 2: 'on', 3: 'on' } : {},
        }),
        h('div', { class: 'rules' },
          h('div', { class: hot === 'play' ? 'rule on' : 'rule' }, '🎾 놀아 주기 → ', h('code', {}, 'level = level + 1'), ' · ', h('code', {}, 'hunger = hunger + 2')),
          h('div', { class: hot === 'feed' ? 'rule on' : 'rule' }, '🍚 밥 주기 → ', h('code', {}, 'hunger = hunger - 3'))));
      const p2 = ME.pet;
      const res = {
        items: [
          { ok: (!!p2 && !isEgg(p2)) || null, label: '🥚 알을 톡톡 두드려 깨우고 이름 짓기' },
          { ok: (!!p2 && p2.level >= 3) || null, label: '🎾 놀아 주며 레벨 3 까지 키우기' },
          { ok: !!card(cid).fed || null, label: '🍚 배고프면 밥 주기 (한 번 이상)' },
        ],
      };
      res.pass = res.items.every((x) => x.ok === true);
      fill(list, checklist(res, { title: '🎯 미션' }));
      if (res.pass) finish(api, cid, `${j(p2.name, '이')} 무럭무럭 자랐어요!`);
    };
    const gb = gameBox(ME, { power: false, onEvent: (k) => { if (k === 'feed') setCard(cid, { fed: true }); paintInside({ kind: k }); } });
    paintInside();
    fill(body, h('div', { class: 'split l42' },
      h('div', { class: 'col' }, gb, memoryPanel(ME)),
      h('div', { class: 'col' },
        story('알 하나를 받았어요! <b>톡톡 두드려 깨우고</b>, 이름을 지어 준 뒤 <b>놀아 주며 레벨 3</b> 까지 키워 보세요.<br>놀면 배가 고파지니 밥도 챙겨 주세요.', '🥚'),
        inside, list,
        tip('게임 속 펫의 모든 것은 <b>변수</b>에 들어 있어요. 변수는 컴퓨터의 <b>메모리(RAM)</b> 에 있어요. 왼쪽 아래 🧠 칸이 바로 그 메모리예요.'),
        h('p', { class: 'start-copy' }, '💾 세이브 파일 공방 · 파이썬 파일 입출력 · © 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요'))));
    onCleanup(ME.listen((w, ev) => { if (ev.kind === 'hatch' || ev.kind === 'play' || ev.kind === 'feed') paintInside(ev); }));
  },
};

/* ═════════════ 카드 1 ═════════════ */
export const resetCard = {
  id: 'c01', chapter: 'start', title: '⏻ 리셋의 충격',
  render(body, api) {
    ensureOn();
    const cid = 'c01';
    const right = h('div', { class: 'col' });
    let cycled = !!card(cid).cycled;
    let wasOff = false;
    const before = ME.pet ? { ...ME.pet } : null;

    const paintRight = () => {
      const guess = picked(cid, 'guess');
      const parts = [
        story('레벨을 올린 펫, 컴퓨터를 <b>껐다 켜면</b> 어떻게 될까요? 먼저 예상해 보세요.', '🤔'),
        choose({
          q: '⏻ 껐다 켜면 펫은?', choices: ['레벨 그대로 다시 나타난다', '알로 돌아간다 (모두 잊는다)', '오류가 나서 게임이 안 켜진다'],
          save: [cid, 'guess'], reveal: false, onPick: () => paintRight(), cls: 'inline', note: !cycled,
        }),
      ];
      if (guess !== undefined && !cycled) parts.push(h('div', { class: 'go-try' }, '👈 왼쪽 게임기의 ', h('b', {}, '⏻ 끄기'), ' → ', h('b', {}, '⏻ 켜기'), ' 를 차례로 눌러 확인해 보세요.'));
      if (cycled) {
        parts.push(h('div', { class: `reveal ${guess === 1 ? 'right' : 'wrong'}` },
          guess === 1 ? '⭕ 예상대로 ' : '😱 예상과 달리 ', h('b', {}, '알로 돌아갔어요.'), ' 이름도 레벨도 모두 잊었어요.'));
        parts.push(h('table', { class: 'mvd' },
          h('tr', {}, h('th', {}, ''), h('th', {}, '🧠 메모리 (RAM)'), h('th', {}, '💾 디스크 (SSD)')),
          h('tr', {}, h('td', {}, '들어 있는 것'), h('td', {}, '변수'), h('td', {}, '파일')),
          h('tr', {}, h('td', {}, '빠르기'), h('td', {}, '아주 빠르다'), h('td', {}, '느리다')),
          h('tr', {}, h('td', {}, '전원이 꺼지면'), h('td', { class: 'bad' }, '모두 사라진다'), h('td', { class: 'good' }, '그대로 남는다'))));
        parts.push(choose({
          q: '그렇다면 껐다 켜도 <b>남는 것</b>은?', choices: ['변수 <code>score = 100</code>', '파일 <code>score.txt</code>', '<code>print( )</code> 로 화면에 찍은 글자'],
          answer: 1, why: '파일은 디스크에 있어서 전원이 꺼져도 남아요. 그래서 게임은 「세이브 파일」 을 만들어요. 다음 카드에서 직접 만들어 봐요!',
          save: [cid, 'quiz'], cls: 'inline', onPick: (i, ok) => { if (ok) finish(api, cid, '메모리와 디스크의 차이를 알았어요!'); },
        }));
      }
      fill(right, ...parts);
    };
    const gb = gameBox(ME, {
      power: true,
      onEvent: (k) => {
        if (k === 'off') wasOff = true;
        if (k === 'on' && wasOff) { cycled = true; setCard(cid, { cycled: true, before }); paintRight(); }
      },
    });
    paintRight();
    fill(body, h('div', { class: 'split l42' },
      h('div', { class: 'col' }, gb, h('div', { class: 'two' }, memoryPanel(ME, { note: '' }), diskPanel(ME, { note: '' }))),
      right));
  },
};
