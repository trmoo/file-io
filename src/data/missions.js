/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  카드별 미션 — 처음 코드 · 모범 답 · 흔한 실수 · 채점.
 *
 *  ★ 채점은 「코드 글자」 가 아니라 「돌려 본 결과」 로 한다.
 *    학생 코드를 실제로 실행하고, 화면 출력과 ★ 실행 뒤 디스크에 남은 파일 · 남은 변수를 본다.
 *    그리고 늘 「다른 펫(다른 세이브 파일)」 으로 한 번 더 돌려 본다 — '비트' 를 글자 그대로 적어 넣은 답을 거르려고.
 *  채점 결과 = { pass, items: [{ ok: true|false|'warn', label, why }], runs: [화면에 보여 줄 실행 결과] }
 *
 *  ⚠ node 로 불러다 시험한다(모범 답은 통과, 흔한 실수는 실패해야 한다). DOM 을 만들지 말 것.
 *  ⚠ 파이썬 코드는 String.raw 로 적는다 — 그래야 '\n' 이 파이썬 코드 안에 「역슬래시 n」 으로 남는다.
 */
import { run, hasBlank, linesOf } from '../lib/run.js';
import { toVars, saveText } from '../game/pet.js';
import { j } from '../lib/josa.js';

const P = String.raw;
/** 「다른 펫」 — 채점할 때 한 번 더 돌려 보는 값 */
export const OTHER = Object.freeze({ name: '콩이', level: 12, hunger: 0 });
export const OTHER2 = Object.freeze({ name: '별', level: 1, hunger: 9 });

const item = (ok, label, why = '') => ({ ok, label, why: ok === true ? '' : why });
const finish = (items, runs) => ({ pass: items.every((i) => i.ok === true || i.ok === 'warn'), items, runs });
/** 오류가 났으면 그 오류 한 줄 */
const errWhy = (r) => (r.ok ? '' : `실행이 멈췄어요 — ${r.errorLast || r.stderr.split('\n').pop()}`);

/* ═════════════ 카드 2 · 첫 세이브 ═════════════ */
export const FIRST = {
  starter: P`f = open('save.txt', ___)   # 쓰기 모드
f.___(name)                 # 이름을 쓴다
f.___()                     # 닫는다
`,
  model: P`f = open('save.txt', 'w')
f.write(name)
f.close()
`,
  mistakes: {
    '빈칸 그대로': null, // starter
    '읽기 모드': P`f = open('save.txt', 'r')
f.write(name)
f.close()
`,
    '이름 대신 글자': P`f = open('save.txt', 'w')
f.write('비트')
f.close()
`,
    '다른 파일 이름': P`f = open('save', 'w')
f.write(name)
f.close()
`,
  },
  check(code, { pet, disk = {} }) {
    const r1 = run(code, { disk, vars: toVars(pet) });
    const r2 = run(code, { disk: {}, vars: toVars(OTHER) });
    const items = [
      item(!hasBlank(code), '빈칸 ___ 을 모두 채웠다', '아직 ___ 이 남아 있어요.'),
      item(r1.ok, '오류 없이 실행된다', errWhy(r1)),
      item('save.txt' in r1.disk, 'save.txt 파일이 생겼다', "파일 이름을 'save.txt' 로 정확히 썼는지 확인해 보세요."),
      item((r1.disk['save.txt'] || '').trim() === pet.name && (r2.disk['save.txt'] || '').trim() === OTHER.name,
        'save.txt 에 펫 이름이 들어 있다', (r1.disk['save.txt'] || '').trim() === pet.name
          ? `다른 펫(${OTHER.name})으로 돌리면 ${JSON.stringify(r2.disk['save.txt'] ?? '')} 이 저장돼요. 이름을 글자로 적지 말고 변수 name 을 쓰세요.`
          : '파일 안에 이름이 없어요. write( ) 의 괄호 안을 확인해 보세요.'),
    ];
    return finish(items, [r1]);
  },
};

/* ═════════════ 카드 3 · 세이브 버그 둘 ═════════════ */
export const BUGS = {
  starter: P`f = open('save.txt', 'w')
f.write(name)
f.write(level)
f.write(hunger)
f.close()
`,
  model: P`f = open('save.txt', 'w')
f.write(name + '\n')
f.write(str(level) + '\n')
f.write(str(hunger) + '\n')
f.close()
`,
  others: {
    'print 의 file=': P`f = open('save.txt', 'w')
print(name, file=f)
print(level, file=f)
print(hunger, file=f)
f.close()
`,
    '한 번에 쓰기': P`f = open('save.txt', 'w')
f.write(name + '\n' + str(level) + '\n' + str(hunger))
f.close()
`,
  },
  mistakes: {
    '처음 그대로 (TypeError)': null,
    'str 만 고침 (줄 붙음)': P`f = open('save.txt', 'w')
f.write(name)
f.write(str(level))
f.write(str(hunger))
f.close()
`,
    '값을 글자로 적음': P`f = open('save.txt', 'w')
f.write('비트\n3\n4\n')
f.close()
`,
    '줄바꿈 앞에 붙임': P`f = open('save.txt', 'w')
f.write(name)
f.write('\n' + str(level))
f.write(str(hunger) + '\n')
f.close()
`,
  },
  /** 세이브 파일이 「한 줄에 값 하나」 인가 */
  good(text, p) {
    return JSON.stringify(linesOf(text)) === JSON.stringify([p.name, String(p.level), String(p.hunger)]);
  },
  check(code, { pet, disk = {} }) {
    const r1 = run(code, { disk, vars: toVars(pet) });
    const r2 = run(code, { disk: {}, vars: toVars(OTHER) });
    const t1 = r1.disk['save.txt'];
    const typeErr = !r1.ok && r1.errorType === 'TypeError';
    const items = [
      item(r1.ok, '오류 없이 실행된다 (버그 1)', typeErr ? 'write( ) 에는 글자(str)만 넣을 수 있어요. 숫자는 str( ) 로 감싸 주세요.' : errWhy(r1)),
      item(r1.ok && BUGS.good(t1, pet), '값마다 한 줄씩 저장된다 (버그 2)',
        r1.ok ? `지금 save.txt 는 ${JSON.stringify(t1 ?? '').replace(/\\n/g, '↵')} 예요. 값 뒤마다 줄바꿈 '\\n' 을 붙여 주세요.` : '먼저 버그 1 을 고쳐야 해요.'),
      item(r2.ok && BUGS.good(r2.disk['save.txt'], OTHER), `다른 펫(${OTHER.name} · ${OTHER.level} · ${OTHER.hunger})으로 시험해도 맞다`,
        r1.ok && BUGS.good(t1, pet) ? '값을 글자로 적어 넣지 말고 변수 name · level · hunger 를 쓰세요.' : '버그 둘을 고치면 함께 풀려요.'),
    ];
    return finish(items, [r1]);
  },
};

/* ═════════════ 카드 5 · 되살리기 ═════════════ */
/** 게임이 학생 코드 뒤에 붙이는 코드 — 불러온 값을 실제로 써 본다 */
export const LOAD_TAIL = P`# ── 게임이 붙이는 코드 (고치지 않아요) ──
print('안녕, ' + name + '! 다시 만나서 반가워')
if level >= 3:
    print('벌써 레벨', level, '이네!')
if hunger > 7:
    print('배고파요… 밥 주세요')
`;
export const LOAD = {
  starter: P`f = open('save.txt', 'r')
lines = f.readlines()
f.close()
name = lines[0]
level = lines[1]
hunger = lines[2]
`,
  model: P`f = open('save.txt', 'r')
lines = f.readlines()
f.close()
name = lines[0].strip()
level = int(lines[1])
hunger = int(lines[2])
`,
  others: {
    'with 로': P`with open('save.txt', 'r') as f:
    lines = f.readlines()
name = lines[0].strip()
level = int(lines[1].strip())
hunger = int(lines[2].strip())
`,
    'readline 세 번': P`f = open('save.txt', 'r')
name = f.readline().strip()
level = int(f.readline())
hunger = int(f.readline())
f.close()
`,
  },
  mistakes: {
    '처음 그대로': null,
    'strip 만 (숫자로 안 바꿈)': P`f = open('save.txt', 'r')
lines = f.readlines()
f.close()
name = lines[0].strip()
level = lines[1].strip()
hunger = lines[2].strip()
`,
    'int 만 (이름에 ↵)': P`f = open('save.txt', 'r')
lines = f.readlines()
f.close()
name = lines[0]
level = int(lines[1])
hunger = int(lines[2])
`,
    '자리를 하나씩 밀림': P`f = open('save.txt', 'r')
lines = f.readlines()
f.close()
name = lines[1].strip()
level = int(lines[2])
hunger = int(lines[0])
`,
  },
  full: (code) => code.replace(/\s*$/, '\n') + LOAD_TAIL,
  check(code, { pet }) {
    const saves = [pet, OTHER, OTHER2];
    // 셋째 세이브는 끝에 줄바꿈이 없다 — 메모장으로 고친 파일처럼
    const texts = [saveText(pet), saveText(OTHER), saveText(OTHER2).replace(/\n$/, '')];
    const runs = texts.map((t) => run(LOAD.full(code), { disk: { 'save.txt': t } }));
    const r1 = runs[0];
    const v = r1.varMap;
    const same = (r, p) => r.ok && r.varMap.name === p.name && r.varMap.level === p.level && r.varMap.hunger === p.hunger;
    const items = [
      item(r1.ok, '오류 없이 실행된다', r1.errorType === 'TypeError'
        ? '파일에서 읽은 것은 모두 글자(str)예요. 숫자로 견주려면 int( ) 로 바꿔야 해요.' : errWhy(r1)),
      item(typeof v.name === 'string' && !v.name.includes('\n') && v.name === pet.name, 'name 에 줄바꿈(↵)이 붙지 않았다',
        typeof v.name === 'string' && v.name.includes('\n') ? `지금 name 은 ${JSON.stringify(v.name).replace(/\\n/g, '↵')} 예요. strip( ) 으로 ↵ 를 떼세요.` : `name 이 ${JSON.stringify(pet.name)} 이 되어야 해요.`),
      item(Number.isInteger(v.level) && Number.isInteger(v.hunger) && v.level === pet.level && v.hunger === pet.hunger, 'level 과 hunger 가 숫자(int)로 되살아났다',
        typeof v.level === 'string' || typeof v.hunger === 'string' ? 'level · hunger 가 아직 글자(str)예요. int( ) 로 감싸 주세요.' : `level 은 ${pet.level}, hunger 는 ${pet.hunger} 이 되어야 해요. 몇 번째 줄(lines[ ])을 읽는지 확인해 보세요.`),
      item(saves.every((p, i) => same(runs[i], p)), '다른 세이브 파일 둘로도 맞다',
        `「${OTHER.name}·${OTHER.level}·${OTHER.hunger}」 와 「${OTHER2.name}·${OTHER2.level}·${OTHER2.hunger}(마지막 줄에 ↵ 없음)」 세이브로도 시험했어요.`),
    ];
    return finish(items, [r1]);
  },
};

/* ═════════════ 카드 6 · 바구니 ═════════════ */
export const BASKET = {
  demo: P`f = open('save.txt', 'w')
f.write(name + '\n')
f.write(str(level) + '\n')
f.write(str(hunger) + '\n')

check = open('save.txt', 'r')
print('저장된 내용:', check.read())
check.close()
`,
  model: P`with open('save.txt', 'w') as f:
    f.write(name + '\n')
    f.write(str(level) + '\n')
    f.write(str(hunger) + '\n')

check = open('save.txt', 'r')
print('저장된 내용:', check.read())
check.close()
`,
  others: {
    'with 둘': P`with open('save.txt', 'w') as f:
    f.write(name + '\n')
    f.write(str(level) + '\n')
    f.write(str(hunger) + '\n')

with open('save.txt', 'r') as check:
    print('저장된 내용:', check.read())
`,
  },
  mistakes: {
    '처음 그대로': null,
    'close 만 (with 안 씀)': P`f = open('save.txt', 'w')
f.write(name + '\n')
f.write(str(level) + '\n')
f.write(str(hunger) + '\n')
f.close()

check = open('save.txt', 'r')
print('저장된 내용:', check.read())
check.close()
`,
    '확인까지 with 안에': P`with open('save.txt', 'w') as f:
    f.write(name + '\n')
    f.write(str(level) + '\n')
    f.write(str(hunger) + '\n')
    check = open('save.txt', 'r')
    print('저장된 내용:', check.read())
    check.close()
`,
  },
  check(code, { pet, disk = {} }) {
    const r = run(code, { disk, vars: toVars(pet) });
    const want = `저장된 내용: ${saveText(pet)}`;
    const items = [
      item(r.ok, '오류 없이 실행된다', errWhy(r)),
      item(/^\s*with\s+open\s*\(/m.test(code), 'with 문으로 열었다', "with open('save.txt', 'w') as f: 로 바꾸고, 쓰는 줄을 들여 쓰세요."),
      item(r.ok && r.stdout.startsWith(want.replace(/\n$/, '')), '확인할 때 세 줄이 모두 보인다',
        '확인하는 순간에 아직 바구니(버퍼)에 남아 있어요. 쓰기가 끝난 뒤 — with 블록 밖에서 — 확인해야 해요.'),
    ];
    return finish(items, [r]);
  },
};

/* ═════════════ 카드 7 · 처음 온 친구 ═════════════ */
export const NEWBIE = {
  starter: P`with open('save.txt', 'r') as f:
    lines = f.readlines()
name = lines[0].strip()
level = int(lines[1])
hunger = int(lines[2])
print('불러오기 성공!')
`,
  model: P`try:
    with open('save.txt', 'r') as f:
        lines = f.readlines()
    name = lines[0].strip()
    level = int(lines[1])
    hunger = int(lines[2])
    print('불러오기 성공!')
except FileNotFoundError:
    name = '알'
    level = 0
    hunger = 0
    print('새 알을 받았어요!')
`,
  others: {
    'except 블록에 with 만': P`try:
    with open('save.txt', 'r') as f:
        lines = f.readlines()
except FileNotFoundError:
    lines = ['알', '0', '0']
name = lines[0].strip()
level = int(lines[1])
hunger = int(lines[2])
`,
  },
  mistakes: {
    '처음 그대로': null,
    '다른 예외를 잡음': P`try:
    with open('save.txt', 'r') as f:
        lines = f.readlines()
    name = lines[0].strip()
    level = int(lines[1])
    hunger = int(lines[2])
except ValueError:
    name = '알'
    level = 0
    hunger = 0
`,
    '새 알 값을 안 정함': P`try:
    with open('save.txt', 'r') as f:
        lines = f.readlines()
    name = lines[0].strip()
    level = int(lines[1])
    hunger = int(lines[2])
except FileNotFoundError:
    print('새 알을 받았어요!')
`,
    '언제나 새 알': P`name = '알'
level = 0
hunger = 0
`,
  },
  check(code) {
    const a = run(code, { disk: {} });
    const b = run(code, { disk: { 'save.txt': saveText(OTHER) } });
    const va = a.varMap, vb = b.varMap;
    const items = [
      item(a.ok, '세이브가 없는 컴퓨터에서도 멈추지 않는다', a.errorType === 'FileNotFoundError'
        ? 'try: 로 감싸고 except FileNotFoundError: 를 붙이세요.' : errWhy(a)),
      item(a.ok && va.level === 0 && va.hunger === 0 && typeof va.name === 'string', '새 알(level 0 · hunger 0)로 시작한다',
        "except 블록 안에서 name = '알' · level = 0 · hunger = 0 을 정해 주세요."),
      item(b.ok && vb.name === OTHER.name && vb.level === OTHER.level && vb.hunger === OTHER.hunger, '세이브가 있으면 그대로 불러온다',
        `세이브(${OTHER.name}·${OTHER.level}·${OTHER.hunger})가 있는 컴퓨터에서 돌리면 ${b.ok ? `${JSON.stringify(vb.name)}·${vb.level}·${vb.hunger}` : '멈춰요'}.`),
      item(/except\s+(\(\s*)?FileNotFoundError/.test(code) ? true : (a.ok ? 'warn' : false), 'except FileNotFoundError 로 콕 집었다 (권장)',
        'except: 처럼 아무 예외나 잡으면 다른 실수까지 숨어 버려요. 「파일이 없을 때」 만 콕 집어 잡는 편이 좋아요.'),
    ];
    return finish(items, [a, b]);
  },
};

/* ═════════════ 카드 8 · 세이브는 'w' ═════════════ */
export const SAVE_MODES = {
  a: P`with open('save.txt', 'a') as f:
    f.write(name + '\n')
    f.write(str(level) + '\n')
    f.write(str(hunger) + '\n')
`,
  w: P`with open('save.txt', 'w') as f:
    f.write(name + '\n')
    f.write(str(level) + '\n')
    f.write(str(hunger) + '\n')
`,
};

/* ═════════════ 카드 9 · 일지는 'a' ═════════════ */
export const eventsFor = (name) => [`${j(name, '이')} 알에서 깨어났다`, `${j(name, '과')} 공놀이를 했다`, `${j(name, '이')} 레벨 2가 되었다`];
export const rebootEvent = (name) => `${j(name, '이')} 다시 켜졌다`;
export const LOG_WRITE = {
  starter: P`with open('log.txt', 'w') as f:
    f.write(event + '\n')
`,
  model: P`with open('log.txt', 'a') as f:
    f.write(event + '\n')
`,
  others: {
    'print 의 file=': P`with open('log.txt', 'a') as f:
    print(event, file=f)
`,
  },
  mistakes: {
    '처음 그대로 (w)': null,
    '줄바꿈 빠짐': P`with open('log.txt', 'a') as f:
    f.write(event)
`,
    '읽기 모드': P`with open('log.txt', 'r') as f:
    f.write(event + '\n')
`,
  },
  /** 사건들을 차례로 기록해 본다 — 실행 한 번에 사건 하나 (게임이 사건마다 코드를 부른다) */
  play(code, events, disk = {}) {
    const runs = [];
    let d = { ...disk };
    for (const ev of events) {
      const r = run(code, { disk: d, vars: { event: ev } });
      runs.push(r);
      d = r.disk;
      if (!r.ok) break;
    }
    return { runs, disk: d };
  },
  check(code, { pet }) {
    const evs = eventsFor(pet.name);
    const p1 = LOG_WRITE.play(code, evs, {});
    const p2 = LOG_WRITE.play(code, ['새 사건'], { 'log.txt': '옛 기록 1\n옛 기록 2\n' });
    const last = p1.runs[p1.runs.length - 1];
    const log = p1.disk['log.txt'] ?? '';
    const items = [
      item(p1.runs.every((r) => r.ok), '오류 없이 실행된다', errWhy(last)),
      item(linesOf(log).length >= evs.length || log.includes(evs[0]), '사건 세 개가 모두 남는다',
        `지금 log.txt 에는 ${JSON.stringify(log).replace(/\\n/g, '↵')} 만 남았어요. 열 때마다 앞의 기록이 지워지고 있어요.`),
      item(JSON.stringify(linesOf(log)) === JSON.stringify(evs) && log.endsWith('\n'), '한 줄에 사건 하나씩 쌓인다',
        log.includes(evs[0]) ? `사건 뒤에 줄바꿈 '\\n' 이 붙어야 다음 사건이 새 줄에서 시작해요.` : '바로 위 칸을 해결하면 함께 풀려요.'),
      item(JSON.stringify(linesOf(p2.disk['log.txt'])) === JSON.stringify(['옛 기록 1', '옛 기록 2', '새 사건']), '전에 있던 일지도 지우지 않는다',
        '이미 기록이 있는 일지에 덧붙여야 해요.'),
    ];
    return finish(items, p1.runs);
  },
};
export const LOG_READ = {
  starter: P`with open('log.txt', 'r') as f:
    for line in f:
        print(line)
`,
  model: P`with open('log.txt', 'r') as f:
    for line in f:
        print(line.strip())
`,
  others: {
    'readlines': P`with open('log.txt', 'r') as f:
    lines = f.readlines()
for line in lines:
    print(line.strip())
`,
    "end=''": P`with open('log.txt', 'r') as f:
    for line in f:
        print(line, end='')
`,
  },
  mistakes: {
    '처음 그대로 (빈 줄)': null,
    'read 를 줄마다': P`with open('log.txt', 'r') as f:
    for line in f:
        print(f.read())
`,
  },
  check(code, { pet }) {
    const evs = eventsFor(pet.name);
    const r = run(code, { disk: { 'log.txt': evs.join('\n') + '\n' } });
    const out = r.stdout.replace(/\n+$/, '').split('\n');
    const items = [
      item(r.ok, '오류 없이 실행된다', errWhy(r)),
      item(evs.every((e) => r.stdout.includes(e)), '일지가 모두 출력된다', '일지의 줄을 모두 출력해야 해요.'),
      item(r.ok && JSON.stringify(out) === JSON.stringify(evs), '줄 사이에 빈 줄이 없다',
        "읽은 줄 끝에 이미 ↵ 가 있어서 print 의 줄바꿈과 겹쳐요. line.strip( ) 으로 떼어 내세요."),
    ];
    return finish(items, [r]);
  },
};

/* ═════════════ 카드 11 · 끝판왕 — 나의 세이브 시스템 ═════════════ */
export const BOSS = {
  starters: {
    save: P`# name · level · hunger 를 save.txt 에 저장하세요 (with 문 · 한 줄에 값 하나)
`,
    load: P`# save.txt 를 읽어 name · level · hunger 를 되살리세요
# 세이브가 없으면 새 알(name = '알', level = 0, hunger = 0)로 시작합니다
`,
    log: P`# 사건 하나(event)를 log.txt 에 한 줄로 남기세요
`,
  },
  models: {
    save: SAVE_MODES.w,
    load: NEWBIE.model,
    log: LOG_WRITE.model,
  },
  /** ⭐ 더 해 보기 — 깨진 세이브에도 멈추지 않는 불러오기 */
  bonusModel: P`try:
    with open('save.txt', 'r') as f:
        lines = f.readlines()
    name = lines[0].strip()
    level = int(lines[1])
    hunger = int(lines[2])
except FileNotFoundError:
    name = '알'
    level = 0
    hunger = 0
except (ValueError, IndexError):
    print('세이브 파일이 깨져서 새 알로 시작해요')
    name = '알'
    level = 0
    hunger = 0
`,
  /**
   * 자동 검사 — 진짜 게임처럼 차례대로 해 본다.
   *  ① 빈 컴퓨터에서 켜기 ② 놀고 저장 ③ 껐다 켜기 ④ 더 놀고 저장(덮어쓰기) ⑤ 껐다 켜기
   *  ⑥ 일지 세 번 + 껐다 켜고 한 번 더 ⑦ 모든 파일을 닫았나 ⭐ 깨진 세이브
   */
  check({ save, load, log }, { name = '비트' } = {}) {
    const steps = [];
    let disk = {};
    const closedWell = [];
    const note = (r) => { closedWell.push(...r.fileLog.filter((x) => x.op === 'close').map((x) => x.why)); return r; };
    const boot = () => note(run(load, { disk }));
    const pet = (r) => r.varMap;

    // ① 빈 컴퓨터에서 켜기
    let r = boot();
    steps.push(item(r.ok && pet(r).level === 0 && pet(r).hunger === 0, '1. 세이브가 없을 때 — 새 알로 시작한다',
      r.ok ? `level·hunger 가 0 이 아니에요 (${pet(r).level}·${pet(r).hunger}).` : errWhy(r)));
    // ② 놀고 저장
    const A = { name, level: 2, hunger: 4 };
    r = note(run(save, { disk, vars: A }));
    disk = r.disk;
    steps.push(item(r.ok && BUGS.good(disk['save.txt'], A), '2. 저장하면 save.txt 에 세 줄이 남는다',
      r.ok ? `save.txt = ${JSON.stringify(disk['save.txt'] ?? '(없음)').replace(/\\n/g, '↵')}` : errWhy(r)));
    // ③ 껐다 켜기
    r = boot();
    const same = (x, p) => x.ok && x.varMap.name === p.name && x.varMap.level === p.level && x.varMap.hunger === p.hunger;
    steps.push(item(same(r, A), `3. 껐다 켜면 ${j(name, '이')} 그대로(레벨 2 · 배고픔 4) 돌아온다`,
      r.ok ? `불러온 값: ${JSON.stringify(pet(r).name)} · ${JSON.stringify(pet(r).level)} · ${JSON.stringify(pet(r).hunger)}` : errWhy(r)));
    // ④ 더 놀고 저장 — 덮어써야 한다
    const B = { name, level: 3, hunger: 6 };
    r = note(run(save, { disk, vars: B }));
    disk = r.disk;
    steps.push(item(r.ok && BUGS.good(disk['save.txt'], B), '4. 다시 저장해도 save.txt 는 세 줄 그대로다 (덮어쓰기)',
      r.ok ? `save.txt 가 ${disk['save.txt'] ? linesOf(disk['save.txt']).length : 0}줄이에요. 'w' 로 열어야 덮어써요.` : errWhy(r)));
    // ⑤ 껐다 켜기 — 최신 상태
    r = boot();
    steps.push(item(same(r, B), '5. 다시 껐다 켜면 최신 상태(레벨 3)가 돌아온다',
      r.ok ? `불러온 레벨: ${JSON.stringify(pet(r).level)}` : errWhy(r)));
    // ⑥ 일지
    const evs = eventsFor(name);
    const p = LOG_WRITE.play(log, evs, disk);
    p.runs.forEach(note);
    disk = p.disk;
    const p2 = LOG_WRITE.play(log, [rebootEvent(name)], disk);
    p2.runs.forEach(note);
    disk = p2.disk;
    const want = [...evs, rebootEvent(name)];
    steps.push(item(p.runs.every((x) => x.ok) && p2.runs.every((x) => x.ok) && JSON.stringify(linesOf(disk['log.txt'])) === JSON.stringify(want),
      '6. 일지는 껐다 켜도 이어서 쌓인다 (네 줄)', `log.txt = ${JSON.stringify(disk['log.txt'] ?? '(없음)').replace(/\\n/g, '↵')}`));
    // ⑦ 닫기
    const lazy = closedWell.filter((w) => w === 'end' || w === 'gc').length;
    steps.push(item(closedWell.length > 0 && lazy === 0, '7. 연 파일을 모두 닫았다 (with 또는 close)',
      `닫지 않고 둔 파일이 ${lazy}번 있었어요. with 문을 쓰면 저절로 닫혀요.`));
    // ⭐ 깨진 세이브
    const broken = run(load, { disk: { 'save.txt': `${name}\n구십구\n4\n` } });
    const bonus = item(broken.ok && Number.isInteger(broken.varMap.level), '⭐ 깨진 세이브(레벨 「구십구」)에도 멈추지 않는다',
      broken.ok ? 'level 이 숫자가 아니에요.' : `${broken.errorType} 로 멈춰요. except 를 하나 더 붙여 보세요.`);
    return { pass: steps.every((s) => s.ok === true), items: steps, bonus, disk };
  },
};

/** 화면에 실을 모든 코드 — 진짜 파이썬 대조(golden)와 시험이 쓴다 */
export const ALL = { FIRST, BUGS, LOAD, BASKET, NEWBIE, SAVE_MODES, LOG_WRITE, LOG_READ, BOSS };
