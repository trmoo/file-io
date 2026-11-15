/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  파이썬 오류 마지막 줄(「FileNotFoundError: [Errno 2] …」)을 한국어로 풀어 준다.
 *  실행 결과 창에서 오류 줄 아래 말풍선으로 보인다. 영어 원문은 그대로 두고 옆에 덧붙이기만 한다.
 *  ⚠ node 로 불러다 시험한다. DOM 을 만들지 말 것.
 */

// [예외 이름, 원문 꼴, 번역] — 위에서부터 맞는 것 하나를 쓴다. 원문 꼴의 괄호 묶음은 번역의 $1·$2 로 들어간다.
const RULES = [
  // ── 파일 ──
  ['FileNotFoundError', /^\[Errno 2\] No such file or directory: (.*)$/, "$1 파일이 없어요. 'r'(읽기)로 여는 파일은 이미 있어야 해요. 이름의 띄어쓰기·확장자도 확인해 보세요."],
  ['FileExistsError', /^.*$/, "이미 있는 파일이에요. 'x' 모드는 새 파일을 만들 때만 써요."],
  ['io.UnsupportedOperation', /^not readable$/, "'w' · 'a' 로 연 파일은 읽을 수 없어요. 읽으려면 닫은 뒤 'r' 로 다시 여세요."],
  ['io.UnsupportedOperation', /^not writable$/, "'r' 로 연 파일에는 쓸 수 없어요. 쓰려면 'w' 나 'a' 로 여세요."],
  ['ValueError', /^I\/O operation on closed file\.?$/, '이미 닫은 파일이에요. 닫은 뒤에는 읽거나 쓸 수 없어요.'],
  ['ValueError', /^invalid mode: (.*)$/, "그런 모드는 없어요: $1 — 'r' · 'w' · 'a' 가운데 하나를 소문자로 쓰세요."],
  ['ValueError', /^must have exactly one of/, "'r' · 'w' · 'a' 가운데 하나만 골라야 해요."],
  ['TypeError', /^write\(\) argument must be str, not (\w+)$/, '파일에는 글자(str)만 쓸 수 있어요. 지금 넣은 것: $1 — str( ) 로 감싸 주세요.'],
  ['TypeError', /^'(\w+)' object does not support the context manager protocol$/, "with 뒤에는 open('파일', '모드') 가 와야 해요."],
  ['TypeError', /^expected str, bytes or os\.PathLike object, not (\w+)$/, "파일 이름은 'save.txt' 처럼 따옴표로 감싼 글자여야 해요."],
  ['TypeError', /^argument should be integer or None, not '(\w+)'$/, 'read( ) · readline( ) 의 괄호 안에는 읽을 글자 수(숫자)만 넣을 수 있어요. 보통은 비워 둬요.'],
  ['AttributeError', /^'_io\.TextIOWrapper' object has no attribute '(.+?)'/, "파일에는 '$1' 이라는 기능이 없어요. 철자를 확인해 보세요 (read · readline · readlines · write · close)."],
  // ── 읽은 값을 쓸 때 ──
  ['ValueError', /^invalid literal for int\(\) with base 10: (.*)$/, '숫자로 바꿀 수 없는 글자예요: $1'],
  ['IndexError', /^list index out of range$/, '리스트에 그 번호의 칸이 없어요. 파일의 줄 수가 모자라지 않은지 확인해 보세요.'],
  ['TypeError', /^can only concatenate str \(not "(\w+)"\) to str$/, '글자에는 글자만 + 로 이어 붙일 수 있어요. (지금 붙인 것: $1)'],
  ['TypeError', /^unsupported operand type\(s\) for (.+): '(\w+)' and '(\w+)'$/, '자료형이 맞지 않아 계산할 수 없어요: $2 $1 $3 — 파일에서 읽은 값은 글자(str)예요. int( ) 로 바꿔 보세요.'],
  ['TypeError', /^'(.+)' not supported between instances of '(\w+)' and '(\w+)'$/, '크기를 견줄 수 없는 짝이에요: $2 · $3 — 파일에서 읽은 값은 글자(str)예요. int( ) 로 바꿔 보세요.'],
  ['TypeError', /^.*$/, '자료형이 맞지 않는 연산이에요.'],
  ['NameError', /^name '(_{3,})' is not defined/, '빈칸 $1 이 남아 있어요. 알맞은 말로 채워 주세요.'],
  ['NameError', /^name '(.+)' is not defined/, "없는 이름(변수)이에요: '$1' — 철자를 확인해 보세요."],
  ['ZeroDivisionError', /^.*$/, '0 으로 나눌 수 없어요.'],
  ['SyntaxError', /^unterminated string literal/, '따옴표를 닫지 않았어요. 여는 따옴표와 닫는 따옴표의 짝을 맞춰 보세요.'],
  ['SyntaxError', /^expected ':'$/, '줄 끝에 콜론(:)이 빠졌어요.'],
  ['SyntaxError', /^.*$/, '파이썬 문법에 맞지 않아요. 괄호·따옴표·콜론(:)을 확인해 보세요.'],
  ['IndentationError', /^.*$/, '들여쓰기가 맞지 않아요. 줄 앞의 빈칸(4칸)을 확인해 보세요.'],
];

// 자료형 이름 — 영어 그대로 두면 학생이 또 막힌다
const TYPE_KO = { int: 'int(정수)', str: 'str(글자)', float: 'float(실수)', list: 'list(리스트)', dict: 'dict(딕셔너리)', NoneType: 'None', '_io.TextIOWrapper': '파일' };

/** 오류 줄 한 줄 → 한국어 풀이. 모르는 꼴이면 '' */
export function koreanOf(line) {
  const m = /^((?:io\.)?[A-Za-z_]+(?:Error|Exception|Operation)):?\s*(.*)$/.exec(String(line || '').trim());
  if (!m) return '';
  const [, kind, msg] = m;
  for (const [k, re, ko] of RULES) {
    if (k !== kind) continue;
    const g = re.exec(msg);
    if (!g) continue;
    return ko.replace(/\$(\d)/g, (_, i) => {
      const v = g[Number(i)] ?? '';
      return TYPE_KO[v] || v;
    });
  }
  return '';
}
