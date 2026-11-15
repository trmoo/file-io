/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  미션 채점 — 모범 답·다른 정답은 통과하고, 흔한 실수는 반드시 떨어져야 한다.
 *  (채점기가 아무 답이나 통과시키면 학생은 배운 줄 안다. 그래서 「떨어져야 할 답」 을 함께 지킨다)
 */
import { 묶음, 확인, 참 } from './harness.mjs';
import { FIRST, BUGS, LOAD, BASKET, NEWBIE, LOG_WRITE, LOG_READ, BOSS, SAVE_MODES, OTHER, eventsFor } from '../src/data/missions.js';
import { run } from '../src/lib/run.js';
import { saveText } from '../src/game/pet.js';

const PETS = [{ name: '비트', level: 3, hunger: 4 }, { name: '별', level: 7, hunger: 10 }, { name: 'Bit2', level: 1, hunger: 0 }];

function suite(title, M, ctxOf = (pet) => ({ pet })) {
  묶음(title);
  for (const pet of PETS) {
    const ctx = ctxOf(pet);
    const m = M.check(M.model, ctx);
    참(`모범 답 통과 (${pet.name})`, m.pass);
    if (!m.pass) 확인(`모범 답이 떨어진 까닭 (${pet.name})`, m.items.filter((i) => i.ok !== true), []);
    for (const [k, code] of Object.entries(M.others || {})) 참(`다른 정답 「${k}」 통과 (${pet.name})`, M.check(code, ctx).pass);
    for (const [k, code] of Object.entries(M.mistakes || {})) {
      const r = M.check(code ?? M.starter ?? M.demo, ctx);
      참(`흔한 실수 「${k}」 는 떨어진다 (${pet.name})`, !r.pass);
      참(`흔한 실수 「${k}」 — 떨어진 칸마다 까닭을 말해 준다`, r.items.filter((i) => i.ok === false).every((i) => i.why && i.why.length > 5));
    }
  }
}

suite('카드 2 · 첫 세이브', FIRST);
suite('카드 3 · 세이브 버그 둘', BUGS);
suite('카드 5 · 되살리기', LOAD);
suite('카드 6 · 바구니', BASKET);
suite('카드 7 · 처음 온 친구', NEWBIE);
suite('카드 9 · 일지 쓰기', LOG_WRITE);
suite('카드 9 · 일지 읽기', LOG_READ);

묶음('카드 2 — 처음 코드는 빈칸 NameError');
{
  const r = run(FIRST.starter, { vars: { name: '비트' } });
  확인('빈칸 ___ 을 그대로 돌리면 NameError', r.errorType, 'NameError');
}

묶음('카드 3 — 처음 코드가 보여 줄 두 버그');
{
  const r = run(BUGS.starter, { vars: { name: '비트', level: 3, hunger: 4 } });
  확인('버그 1 — write(level) 에서 TypeError', [r.errorType, r.errorLine], ['TypeError', 3]);
  확인('버그 1 — 멈추기 전에 쓴 이름은 프로그램이 끝날 때 쏟아진다', r.disk['save.txt'], '비트');
  const r2 = run(BUGS.mistakes['str 만 고침 (줄 붙음)'], { vars: { name: '비트', level: 3, hunger: 4 } });
  확인('버그 2 — 줄바꿈 없이 붙는다', r2.disk['save.txt'], '비트34');
}

묶음('카드 5 — 처음 코드가 보여 줄 문제');
{
  const r = run(LOAD.full(LOAD.starter), { disk: { 'save.txt': '비트\n3\n4\n' } });
  확인('인사말이 두 줄로 갈라진다', r.stdout.split('\n').slice(0, 2), ['안녕, 비트', '! 다시 만나서 반가워']);
  확인('글자 레벨을 숫자와 견주면 TypeError', r.errorType, 'TypeError');
  확인('오류는 게임이 붙인 코드의 if 줄에서', r.errorLine, LOAD.starter.trim().split('\n').length + 3);
}

묶음('카드 6 — 바구니 시연');
{
  const r = run(BASKET.demo, { vars: { name: '비트', level: 3, hunger: 4 } });
  확인('확인할 때는 비어 있다', r.stdout, '저장된 내용: ');
  확인('그래도 프로그램이 끝나면 쏟아진다', r.disk['save.txt'], '비트\n3\n4\n');
  const writes = r.fileLog.filter((x) => x.op === 'write').length;
  확인('바구니에 세 번 담긴다', writes, 3);
  확인('마지막에 「프로그램 끝」 으로 쏟아진다', r.fileLog.filter((x) => x.op === 'flush').map((x) => x.why), ['end']);
}

묶음('카드 7 — 처음 코드는 친구 컴퓨터에서 멈춘다');
{
  const r = run(NEWBIE.starter, { disk: {} });
  확인('FileNotFoundError', r.errorType, 'FileNotFoundError');
}

묶음('카드 8 — a 로 저장하면 레벨이 되돌아간다');
{
  let disk = {};
  for (const level of [1, 2, 3]) disk = run(SAVE_MODES.a, { disk, vars: { name: '비트', level, hunger: 0 } }).disk;
  확인('a — 아홉 줄', disk['save.txt'].split('\n').length - 1, 9);
  확인('a — 불러오면 레벨 1', run(NEWBIE.model, { disk }).varMap.level, 1);
  disk = {};
  for (const level of [1, 2, 3]) disk = run(SAVE_MODES.w, { disk, vars: { name: '비트', level, hunger: 0 } }).disk;
  확인('w — 세 줄', disk['save.txt'], '비트\n3\n0\n');
  확인('w — 불러오면 레벨 3', run(NEWBIE.model, { disk }).varMap.level, 3);
}

묶음('카드 9 — 일지');
{
  const p = LOG_WRITE.play(LOG_WRITE.starter, eventsFor('비트'));
  확인("w 로 세 번 — 마지막 하나만", p.disk['log.txt'], '비트가 레벨 2가 되었다\n');
  const p2 = LOG_WRITE.play(LOG_WRITE.model, eventsFor('별'));
  확인('a 로 세 번 — 조사도 이름에 맞게', p2.disk['log.txt'], '별이 알에서 깨어났다\n별과 공놀이를 했다\n별이 레벨 2가 되었다\n');
  const r = run(LOG_READ.starter, { disk: { 'log.txt': 'a\nb\n' } });
  확인('처음 읽기 코드 — 줄 사이에 빈 줄', r.stdout, 'a\n\nb\n');
}

묶음('카드 11 · 끝판왕');
{
  const m = BOSS.check(BOSS.models, { name: '비트' });
  참('모범 시스템 통과', m.pass);
  if (!m.pass) 확인('떨어진 칸', m.items.filter((i) => i.ok !== true), []);
  확인('모범 시스템 — 깨진 세이브(⭐)는 못 버틴다', m.bonus.ok, false);
  const b = BOSS.check({ ...BOSS.models, load: BOSS.bonusModel }, { name: '별' });
  참('⭐ 불러오기로 바꾸면 통과 + 별', b.pass && b.bonus.ok === true);
  // 흔한 실수
  const close3 = BOSS.check({ ...BOSS.models, save: BUGS.model }, { name: '비트' });
  참('close( ) 로 닫아도 통과', close3.pass);
  const noClose = BOSS.check({ ...BOSS.models, save: SAVE_MODES.w.replace("with open('save.txt', 'w') as f:", "f = open('save.txt', 'w')").replace(/\n {4}/g, '\n') }, { name: '비트' });
  확인('닫지 않은 저장 — 7 만 떨어진다', noClose.items.filter((i) => i.ok !== true).map((i) => i.label.split('.')[0]), ['7']);
  const aSave = BOSS.check({ ...BOSS.models, save: SAVE_MODES.a }, { name: '비트' });
  확인("'a' 로 저장 — 4 · 5 가 떨어진다", aSave.items.filter((i) => i.ok !== true).map((i) => i.label.split('.')[0]), ['4', '5']);
  const noTry = BOSS.check({ ...BOSS.models, load: LOAD.model }, { name: '비트' });
  참('예외 처리 없는 불러오기 — 1 이 떨어진다', noTry.items[0].ok === false);
  const wLog = BOSS.check({ ...BOSS.models, log: LOG_WRITE.starter }, { name: '비트' });
  참("'w' 일지 — 6 이 떨어진다", wLog.items[5].ok === false);
  const empty = BOSS.check(BOSS.starters, { name: '비트' });
  참('처음(주석뿐) — 떨어진다', !empty.pass);
}

묶음('다른 펫 값');
확인('다른 펫의 세이브 파일', saveText(OTHER), '콩이\n12\n0\n');
