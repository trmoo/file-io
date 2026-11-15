/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  카드 2 · 첫 세이브       — 열기 → 쓰기 → 닫기
 *  카드 3 · 세이브 버그 둘  — write( ) 는 글자만 받고, 줄을 바꿔 주지 않는다
 */
import { h, fill, toast } from '../ui/dom.js';
import { gameBox } from '../ui/gamebox.js';
import { memoryPanel, diskPanel } from '../ui/panels.js';
import { ME, S, card, setCard, plug } from '../store.js';
import { isEgg } from '../game/pet.js';
import { FIRST, BUGS } from '../data/missions.js';
import { story, tip, checklist, hints, editorBlock, finish } from './kit.js';
import { ensureOn } from './start.js';

/** 왼쪽 칸 — 내 컴퓨터(게임기 + 메모리 + 디스크) */
export function myComputer({ onEvent = () => {}, diskState = { open: 'save.txt' }, compact = true } = {}) {
  return h('div', { class: 'col' },
    gameBox(ME, { saveCode: () => S.codes.save, loadCode: () => S.codes.load, onEvent, size: compact ? 'sm' : '' }),
    h('div', { class: 'two' }, memoryPanel(ME, { note: '' }), diskPanel(ME, { note: '', state: diskState })));
}

/** 알이거나 꺼져 있으면 저장할 것이 없다 */
function needPet() {
  if (!ME.powered) { toast('먼저 ⏻ 켜기를 눌러 주세요', 'bad'); return true; }
  if (isEgg(ME.pet)) { toast('먼저 알을 깨워 주세요 🥚', 'bad'); return true; }
  return false;
}

/* ═════════════ 카드 2 ═════════════ */
export const firstSaveCard = {
  id: 'c02', chapter: 'save', title: '📝 첫 세이브 — 열기 · 쓰기 · 닫기',
  render(body, api) {
    ensureOn();
    const cid = 'c02';
    const checks = h('div', {}, checklist(card(cid).res || null, { labels: ['빈칸 ___ 을 모두 채웠다', '오류 없이 실행된다', 'save.txt 파일이 생겼다', 'save.txt 에 펫 이름이 들어 있다'] }));
    const after = h('div', {});
    const blk = editorBlock({
      cid, starter: FIRST.starter, model: FIRST.model, rows: 4, runLabel: '▶ 실행 (저장하기)',
      onRun: (code) => {
        if (needPet()) return null;
        const { r } = ME.save(code);
        const res = FIRST.check(code, { pet: ME.pet, disk: ME.disk });
        setCard(cid, { res });
        fill(checks, checklist(res));
        if (res.pass) {
          finish(api, cid, '첫 세이브 파일을 만들었어요!');
          fill(after, tip('이제 ⏻ <b>끄고 켜 보세요.</b> 💾 디스크의 save.txt 는 남아 있나요? 그런데 펫은 왜 알일까요? — 파일을 <b>읽어서 되살리는 코드</b>가 아직 없기 때문이에요. (5번 카드에서 만들어요)', '🔌'));
        }
        return r;
      },
    });
    fill(body, h('div', { class: 'split l40' },
      myComputer(),
      h('div', { class: 'col' },
        story('메모리는 꺼지면 사라지니, 펫을 <b>디스크에 적어</b> 두어요. 디스크에 적는 것 = <b>파일에 쓰기</b>. 먼저 이름 하나만 적어 봐요.', '📝'),
        h('div', { class: 'steps3' },
          h('div', { class: 'st' }, h('b', {}, '1. 열기'), h('code', {}, "open('save.txt', 'w')")),
          h('div', { class: 'st' }, h('b', {}, '2. 쓰기'), h('code', {}, 'f.write(…)')),
          h('div', { class: 'st' }, h('b', {}, '3. 닫기'), h('code', {}, 'f.close()'))),
        h('div', { class: 'mode-note' }, h('b', {}, "'w'"), ' = 쓰기(write) — 파일이 없으면 새로 만들고, ', h('b', {}, '있으면 내용을 지우고'), ' 새로 써요.'),
        h('div', { class: 'split-in' }, blk.el, h('div', { class: 'col tight' }, checks,
          hints(['쓰기 모드는 영어 <b>w</b>rite 의 첫 글자예요.', '파일에 쓰는 함수는 <code>write</code>, 닫는 함수는 <code>close</code> 예요.', "<code>f = open('save.txt', 'w')</code> · <code>f.write(name)</code> · <code>f.close()</code>"], { cid }),
          after)))));
    if (S.done[cid]) fill(after, tip('⏻ 끄고 켜 보세요 — 파일은 남고, 펫은 알이 돼요. 파일을 <b>읽는</b> 코드는 5번 카드에서!', '🔌'));
  },
};

/* ═════════════ 카드 3 ═════════════ */
export const bugsCard = {
  id: 'c03', chapter: 'save', title: '🐛 세이브 버그 둘',
  render(body, api) {
    ensureOn();
    const cid = 'c03';
    const badges = h('div', { class: 'bugs' });
    const checks = h('div', {});
    const paintBadges = (res) => {
      const b1 = res ? res.items[0].ok === true : false;
      const b2 = res ? res.items[1].ok === true : false;
      fill(badges,
        h('div', { class: 'bug' + (b1 ? ' fixed' : '') }, b1 ? '✅' : '🐛', h('b', {}, ' 버그 1 '), h('span', {}, '오류가 나며 멈춘다')),
        h('div', { class: 'bug' + (b2 ? ' fixed' : '') }, b2 ? '✅' : '🐛', h('b', {}, ' 버그 2 '), h('span', {}, '세 값이 한 줄에 붙는다')));
    };
    const res0 = card(cid).res || null;
    paintBadges(res0);
    fill(checks, checklist(res0, { labels: ['오류 없이 실행된다 (버그 1)', '값마다 한 줄씩 저장된다 (버그 2)', '다른 펫으로 시험해도 맞다'] }));
    const blk = editorBlock({
      cid, starter: BUGS.starter, model: BUGS.model, rows: 6, runLabel: '▶ 실행 (저장하기)',
      onRun: (code) => {
        if (needPet()) return null;
        const { r } = ME.save(code);
        const res = BUGS.check(code, { pet: ME.pet, disk: ME.disk });
        setCard(cid, { res });
        paintBadges(res);
        fill(checks, checklist(res));
        if (res.pass) {
          plug('save', code);
          finish(api, cid, '세이브 코드를 게임기에 끼웠어요 — 💾 저장 단추가 생겼어요!');
        }
        return r;
      },
    });
    fill(body, h('div', { class: 'split l40' },
      myComputer(),
      h('div', { class: 'col' },
        story('이번엔 <b>이름 · 레벨 · 배고픔</b>을 모두 저장해요. 그런데 이 코드에는 <b>버그가 둘</b> 숨어 있어요. 실행해 보고, 💾 디스크의 save.txt 를 열어 보며 하나씩 잡아 보세요.', '🐛'),
        badges,
        h('div', { class: 'split-in' }, blk.el, h('div', { class: 'col tight' }, checks,
          tip('<code>write( )</code> 는 <code>print( )</code> 와 달라요. <b>글자(str)만</b> 받고, <b>줄을 바꿔 주지 않아요</b>. 디스크 칸의 <span class="nl">↵</span> 표시가 줄바꿈이에요.'),
          hints(['오류 마지막 줄을 읽어 보세요 — 무엇을 넣어야 한다고 하나요?', '숫자는 <code>str(level)</code> 처럼 글자로 바꿔서 넣어요.', "값 뒤마다 줄바꿈을 붙여요 — <code>f.write(str(level) + '\\n')</code>"], { cid })))),
    ));
  },
};
