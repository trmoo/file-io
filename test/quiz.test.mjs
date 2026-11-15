/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  확인 문제의 정답을 「코드를 진짜로 돌려서」 맞춰 본다 — 문제 글과 정답이 어긋나지 않게.
 *  그리고 펫 규칙 · 조사.
 */
import { 묶음, 확인, 참 } from './harness.mjs';
import { FINAL, MODE_QUIZ, NOTES } from '../src/data/quiz.js';
import { run } from '../src/lib/run.js';
import { hatch, play, feed, fromVars, stageOf, cleanName, saveText, EGG } from '../src/game/pet.js';
import { j, batchim } from '../src/lib/josa.js';

const Q = Object.fromEntries(FINAL.map((q) => [q.id, q]));

묶음('확인 문제 — 모양');
for (const q of FINAL) {
  확인(`${q.id} — 보기 넷`, q.choices.length, 4);
  참(`${q.id} — 정답 자리`, q.answer >= 0 && q.answer < 4);
  참(`${q.id} — 풀이가 있다`, q.why.length > 10);
}
확인('정답이 한 자리에 몰리지 않는다', new Set(FINAL.map((q) => q.answer)).size >= 3, true);

묶음('확인 문제 — 코드로 맞춰 보기');
{
  const r = run(Q.q1.code);
  확인('q1 — 진짜로 FileNotFoundError', r.errorLast, Q.q1.out);
}
{
  const want = Q.q2.out;
  const ok = Q.q2.fills.map(([a, b]) => {
    const code = Q.q2.code.replace('㉠', a).replace('㉡', b);
    const r = run(code);
    return r.ok && r.disk['english.txt'] === want;
  });
  확인('q2 — 원하는 파일을 만드는 보기는 정답 하나뿐', ok.map((x, i) => (x ? i : -1)).filter((i) => i >= 0), [Q.q2.answer]);
  확인('q2 — 보기 글과 채우는 코드가 같다', Q.q2.choices.map((c) => c.replace(/\s+/g, ' ')), Q.q2.fills.map(([a, b]) => `㉠ ${a} ㉡ ${b}`.replace(/\s+/g, ' ')));
  const r3 = run(Q.q2.code.replace('㉠', Q.q2.fills[2][0]).replace('㉡', Q.q2.fills[2][1]));
  확인('q2 — ③ 은 read( ) 에 글자를 넣어 멈춘다', r3.errorType, 'TypeError');
}
{
  const r = run(Q.q3.code, { disk: Q.q3.files });
  확인('q3 — 한 줄과 빈 줄', r.stdout, 'important 중요한\n');
  확인('q3 — 정답 보기', Q.q3.choices[Q.q3.answer], 'important 중요한');
}
{
  const r = run(Q.q4.code);
  확인('q4 — 남은 줄', r.stdout.replace(/\n+$/, '').split('\n'), Q.q4.lines[Q.q4.answer]);
}
{
  const r = run(Q.q5.code);
  확인('q5 — 빈 글자', r.stdout, "''");
  확인('q5 — 정답 보기', Q.q5.choices[Q.q5.answer].startsWith("''"), true);
}
{
  const r = run(Q.q6.code);
  확인('q6 — TypeError', r.errorType, 'TypeError');
  확인('q6 — 정답 보기', Q.q6.choices[Q.q6.answer].startsWith('TypeError'), true);
}

묶음('모드 고르기');
확인('여섯 문항', MODE_QUIZ.length, 6);
확인('r · w · a 가 두 번씩', ['r', 'w', 'a'].map((m) => MODE_QUIZ.filter((x) => x.a === m).length), [2, 2, 2]);
확인('오늘 배운 것 — 세 물음', NOTES.length, 3);

묶음('펫 규칙');
{
  const p = hatch('  비트\n ');
  확인('깨우면 레벨 1 · 배고픔 2 · 이름 다듬기', p, { name: '비트', level: 1, hunger: 2 });
  확인('놀면 레벨 +1 · 배고픔 +2', play(p).pet, { name: '비트', level: 2, hunger: 4 });
  확인('밥 주면 배고픔 −3 (0 아래로 안 감)', feed({ ...p, hunger: 2 }).pet.hunger, 0);
  참('너무 배고프면 못 논다', !play({ ...p, hunger: 9 }).ok);
  참('알은 못 논다', !play(EGG).ok);
  확인('모습', [0, 1, 3, 6, 99].map(stageOf), ['egg', 'baby', 'kid', 'adult', 'legend']);
  확인('빈 이름은 비트', cleanName('   '), '비트');
  확인('따옴표는 걷어 낸다', cleanName("비'트"), '비트');
  확인('세이브 내용', saveText(p), '비트\n1\n2\n');
  확인('되살리기 — 맞는 값', fromVars({ name: '비트', level: 3, hunger: 4 }).pet, { name: '비트', level: 3, hunger: 4 });
  참('되살리기 — 이름에 ↵', fromVars({ name: '비트\n', level: 3, hunger: 4 }).problems[0].includes('strip'));
  참('되살리기 — 글자 레벨', fromVars({ name: '비트', level: '3\n', hunger: 4 }).problems[0].includes('int'));
  참('되살리기 — 변수가 없음', fromVars({ name: '비트' }).problems.length === 2);
}

묶음('조사');
확인('받침 없음', [j('비트', '이'), j('비트', '과'), j('비트', '을')], ['비트가', '비트와', '비트를']);
확인('받침 있음', [j('별', '이'), j('별', '과'), j('콩', '은')], ['별이', '별과', '콩은']);
확인('숫자·영어', [j('Bit2', '이'), j('R2', '이'), j('Sam', '이'), j('Bob', '이')], ['Bit2가', 'R2가', 'Sam이', 'Bob가']);
확인('으로', [j('집', '으로'), j('별', '으로'), j('비트', '으로')], ['집으로', '별로', '비트로']);
참('ㄹ 받침', batchim('별').rieul);
