/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  모드 고르기(카드 9) · 확인 문제(카드 12) · 오늘 배운 것(카드 12).
 *  확인 문제는 교재 12장 확인 문제 5~8번과 같은 꼴이다(정기고사와 같은 예제를 쓰기 때문).
 *  ⚠ 정답은 시험(test/quiz.test.mjs)이 코드를 진짜로 돌려 맞춰 본다. 문제를 고치면 시험도 함께 볼 것.
 *  ⚠ node 로 불러다 시험한다. DOM 을 만들지 말 것.
 */
const P = String.raw;

/* ── 모드 고르기 — 상황을 보고 'r' · 'w' · 'a' 가운데 하나 ── */
export const MODE_QUIZ = [
  { q: '게임 세이브 저장하기 — 「지금 상태」 한 장만 있으면 된다', a: 'w', why: '세이브는 지금 상태만 남기면 되므로 덮어쓰기(w)가 맞아요. a 로 쓰면 옛 세이브가 위에 쌓여 불러올 때 옛날 상태가 나와요.' },
  { q: '모험 일지에 오늘 한 일을 더하기', a: 'a', why: '일지는 지난 기록을 지우면 안 되므로 덧붙이기(a)예요.' },
  { q: '껐다 켰을 때 세이브를 불러오기', a: 'r', why: '불러오기는 읽기만 하므로 r 이에요. 혹시 w 로 열면 여는 순간 세이브가 지워져요!' },
  { q: '최고 점수 기록판에 이번 판 점수를 남기기 — 지난 판 점수도 모두 남겨야 한다', a: 'a', why: '지난 기록을 모두 남기려면 덧붙이기(a)예요.' },
  { q: '설정 파일의 「소리 크기」 를 새 값으로 바꾸기', a: 'w', why: '설정은 지금 값 하나만 있으면 되므로 덮어쓰기(w)예요.' },
  { q: '친구가 보낸 편지 letter.txt 를 화면에 보여 주기', a: 'r', why: '내용을 보여 주기만 하므로 읽기(r)예요.' },
];

/* ── 확인 문제 ── */
const ENGLISH = 'important 중요한\nfuture 미래\nlanguage 언어';
export const FINAL = [
  {
    id: 'q1', tag: '교재 5번 꼴',
    q: '다음 프로그램에서 오류가 난 원인으로 가장 옳은 것은?',
    code: P`f = open("newfile.txt", "r")
content = f.read()
`,
    out: "FileNotFoundError: [Errno 2] No such file or directory: 'newfile.txt'",
    choices: ["모드를 'a' 로 바꿔야 한다.", '파일의 첫 번째 줄이 비어 있기 때문이다.', '파일에 저장된 데이터가 너무 많기 때문이다.', 'newfile.txt 파일이 존재하지 않기 때문이다.'],
    answer: 3,
    why: "'r'(읽기)로 여는 파일은 이미 있어야 해요. 없으면 FileNotFoundError 가 나요. ('a' 로 바꾸면 오류는 사라지지만 빈 파일이 새로 생길 뿐 원인은 그대로예요.)",
  },
  {
    id: 'q2', tag: '교재 6번 꼴',
    q: '실행 뒤 english.txt 의 내용이 오른쪽과 같았다. ㉠ · ㉡ 에 알맞은 것은?',
    code: P`f = open("english.txt", "w")
㉠
f.write("future 미래\n")
㉡
f.close()
`,
    out: ENGLISH,
    outTitle: 'english.txt 의 내용',
    choices: [
      P`㉠ f.write("important 중요한\n")   ㉡ f.write("language 언어")`,
      P`㉠ f.write("important 중요한")     ㉡ f.write("language 언어\n")`,
      P`㉠ f.read("important 중요한\n")    ㉡ f.write("language 언어")`,
      P`㉠ f.write("important 중요한\n")   ㉡ f.close()`,
    ],
    fills: [
      [P`f.write("important 중요한\n")`, P`f.write("language 언어")`],
      [P`f.write("important 중요한")`, P`f.write("language 언어\n")`],
      [P`f.read("important 중요한\n")`, P`f.write("language 언어")`],
      [P`f.write("important 중요한\n")`, P`f.close()`],
    ],
    answer: 0,
    why: "줄을 나누려면 각 줄 끝에 '\\n' 을 직접 붙여야 해요. 마지막 줄 language 언어 뒤에는 줄바꿈이 없어요. 보기 3 의 read( ) 는 읽는 함수라 괄호 안에 글자를 넣으면 오류가 나요. 보기 4 는 language 언어 를 쓰지 않고 닫아요.",
  },
  {
    id: 'q3', tag: '교재 7번 꼴',
    q: 'english.txt 의 내용이 위 문제와 같을 때, 실행 결과로 옳은 것은?',
    code: P`f = open("english.txt", "r")
content = f.readline()
print(content)
f.close()
`,
    files: { 'english.txt': ENGLISH },
    choices: ['important 중요한', 'important 중요한 future 미래 language 언어 (세 줄)', "['important 중요한\\n']", '오류가 난다'],
    answer: 0,
    why: 'readline( ) 은 한 줄만 읽어요. 그 줄 끝의 ↵ 와 print 의 줄바꿈이 겹쳐서 아래에 빈 줄이 하나 더 생겨요.',
  },
  {
    id: 'q4', tag: '교재 8번 꼴',
    q: '실행 결과로 옳은 것은?',
    code: P`with open("record.txt", "w") as f:
    f.write("첫 번째 기록\n")
with open("record.txt", "w") as f:
    f.write("두 번째 기록\n")
with open("record.txt", "a") as f:
    f.write("세 번째 기록\n")
with open("record.txt", "r") as f:
    print(f.read())
`,
    choices: ['첫 번째 기록 · 두 번째 기록 · 세 번째 기록', '두 번째 기록 · 세 번째 기록', '세 번째 기록', '첫 번째 기록 · 세 번째 기록'],
    lines: [['첫 번째 기록', '두 번째 기록', '세 번째 기록'], ['두 번째 기록', '세 번째 기록'], ['세 번째 기록'], ['첫 번째 기록', '세 번째 기록']],
    answer: 1,
    why: "두 번째 'w' 가 여는 순간 「첫 번째 기록」 을 지웠어요. 'a' 는 지우지 않고 뒤에 붙여요.",
  },
  {
    id: 'q5', tag: '바구니',
    q: '실행 결과로 옳은 것은? (a.txt 는 처음에 없었다)',
    code: P`f = open("a.txt", "w")
f.write("hi")
g = open("a.txt", "r")
print(repr(g.read()))
g.close()
f.close()
`,
    choices: ["'hi'", "'' (빈 글자)", 'FileNotFoundError', 'None'],
    answer: 1,
    why: "f 를 닫기 전이라 'hi' 는 아직 바구니(버퍼)에 있어요. 디스크의 a.txt 는 'w' 로 연 순간 비워진 그대로라 빈 글자가 읽혀요. 그래서 다 쓰고 나면 반드시 닫아야 해요.",
  },
  {
    id: 'q6', tag: 'write',
    q: '실행하면 어떻게 되는가?',
    code: P`level = 3
with open("save.txt", "w") as f:
    f.write(level)
`,
    choices: ['ValueError 가 난다', 'TypeError 가 난다', 'save.txt 에 3 이 저장된다', 'FileNotFoundError 가 난다'],
    answer: 1,
    why: 'write( ) 에는 글자(str)만 넣을 수 있어요. f.write(str(level)) 처럼 바꿔야 해요.',
  },
];

/* ── 오늘 배운 것 — 학생이 직접 쓴다(채점하지 않는다). 막히면 실마리 낱말만 보인다 ── */
export const NOTES = [
  { id: 'n1', q: '변수와 파일은 무엇이 다른가요?', clues: ['메모리', '디스크', '전원(껐다 켜기)'] },
  { id: 'n2', q: "'w' 와 'a' 는 각각 언제 쓰나요?", clues: ['덮어쓰기', '덧붙이기', '세이브', '일지'] },
  { id: 'n3', q: '파일을 다 쓰면 꼭 닫아야 하는 까닭은?', clues: ['바구니(버퍼)', 'close( )', 'with'] },
];
