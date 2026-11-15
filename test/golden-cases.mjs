/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  진짜 파이썬과 견줄 사례들. `npm run golden` 이 진짜 파이썬으로 돌려 test/golden.json 을 만든다.
 *  ⚠ 여기 사례나 카드 자료(src/data)를 고치면 golden 을 다시 돌릴 것.
 *
 *  사례 = { name, files: { 'main.py': 프로그램, 그 밖의 처음 파일… }, dirs?: [빈 폴더] }
 *  비교하는 것 — 화면 출력 · 오류 문구(Traceback 까지) · ★ 실행 뒤 디스크에 남은 파일들
 *
 *  파이썬 코드는 String.raw 로 적는다 — 그래야 '\n' 이 파이썬 코드 안에 「역슬래시 n」 으로 들어간다.
 */
import { goldenFromCards } from '../src/data/golden-from-cards.js';

const P = String.raw;
const SAVE = '비트\n3\n4\n';
const ENGLISH = 'important 중요한\nfuture 미래\nlanguage 언어';

const BASE = [
  // ── 교재 12장 B 의 예제 ──
  ['교재 · english.txt 만들기', { 'main.py': P`f = open("english.txt", "w")
f.write("important 중요한\n")
f.write("future 미래\n")
f.write("language 언어")
f.close()
print("파일을 만들었습니다.")
` }],
  ['교재 · readline', { 'main.py': P`f = open("english.txt", "r")
content = f.readline()
print(content)
f.close()
`, 'english.txt': ENGLISH }],
  ['교재 · read', { 'main.py': P`f = open("english.txt", "r")
content = f.read()
print(content)
f.close()
`, 'english.txt': ENGLISH }],
  ['교재 · readlines', { 'main.py': P`f = open("english.txt", "r")
lines = f.readlines()
f.close()
print(lines)
print("줄 수:", len(lines))
for i in range(len(lines)):
    print(i + 1, "번째 줄:", lines[i].strip())
`, 'english.txt': ENGLISH }],
  ['교재 · with 와 for', { 'main.py': P`with open("english.txt", "r") as f:
    for line in f:
        print(line.strip())
`, 'english.txt': ENGLISH }],
  ['교재 · w w a', { 'main.py': P`with open("memo.txt", "w") as f:
    f.write("첫 번째 줄\n")
with open("memo.txt", "w") as f:
    f.write("두 번째 줄\n")
with open("memo.txt", "a") as f:
    f.write("세 번째 줄\n")
with open("memo.txt", "r") as f:
    print(f.read())
` }],
  ['교재 · 없는 파일', { 'main.py': P`f = open("newfile.txt", "r")
content = f.read()
` }],

  // ── 쓰기 ──
  ['write 에 숫자', { 'main.py': P`name = '비트'
level = 3
f = open('save.txt', 'w')
f.write(name)
f.write(level)
f.close()
` }],
  ['줄바꿈 없이 이어 쓰기', { 'main.py': P`f = open('save.txt', 'w')
f.write('비트')
f.write(str(3))
f.write(str(4))
f.close()
print(open('save.txt').read())
` }],
  ['write 는 쓴 글자 수를 돌려준다', { 'main.py': P`f = open('a.txt', 'w')
print(f.write('비트\n'))
print(f.write('abc'))
f.close()
` }],
  ['print 의 file=', { 'main.py': P`with open('a.txt', 'w') as f:
    print('비트', 3, file=f)
    print('끝', file=f)
print(open('a.txt').read(), end='')
` }],
  ['writelines', { 'main.py': P`with open('a.txt', 'w') as f:
    f.writelines(['비트\n', '3\n'])
    f.writelines(['4\n'])
` }],
  ['writelines 에 숫자', { 'main.py': P`with open('a.txt', 'w') as f:
    f.writelines(['비트\n', 3])
` }],
  ['write 에 두 개', { 'main.py': P`f = open('a.txt', 'w')
f.write('비트', '\n')
` }],
  ['w 는 여는 순간 지운다', { 'main.py': P`f = open('save.txt', 'w')
f.close()
print(repr(open('save.txt').read()))
`, 'save.txt': SAVE }],

  // ── 읽기 ──
  ['read 두 번', { 'main.py': P`f = open('save.txt')
print(repr(f.read()))
print(repr(f.read()))
f.close()
`, 'save.txt': SAVE }],
  ['readline 차례로', { 'main.py': P`f = open('save.txt')
print(repr(f.readline()))
print(repr(f.readline()))
print(repr(f.readline()))
print(repr(f.readline()))
f.close()
`, 'save.txt': SAVE }],
  ['readline 다음 read', { 'main.py': P`f = open('save.txt')
f.readline()
print(repr(f.read()))
f.close()
`, 'save.txt': SAVE }],
  ['read 에 글자 수', { 'main.py': P`f = open('save.txt')
print(repr(f.read(2)))
print(repr(f.readline()))
print(repr(f.readline(1)))
f.close()
`, 'save.txt': SAVE }],
  ['빈 파일 readlines', { 'main.py': P`f = open('empty.txt')
print(f.readlines())
print(repr(f.read()))
f.close()
`, 'empty.txt': '' }],
  ['enumerate 로 줄 번호', { 'main.py': P`with open('save.txt') as f:
    for i, line in enumerate(f):
        print(i, line.strip())
`, 'save.txt': SAVE }],
  ['list(f)', { 'main.py': P`with open('save.txt') as f:
    print(list(f))
`, 'save.txt': SAVE }],
  ['for line in open', { 'main.py': P`for line in open('save.txt'):
    print(line.strip())
`, 'save.txt': SAVE }],

  // ── 되살리기 ──
  ['줄바꿈이 붙은 이름', { 'main.py': P`f = open('save.txt')
lines = f.readlines()
f.close()
name = lines[0]
print('안녕, ' + name + '! 반가워')
`, 'save.txt': SAVE }],
  ['글자 레벨에 숫자 빼기', { 'main.py': P`f = open('save.txt')
lines = f.readlines()
f.close()
level = lines[1]
print('다음 레벨까지', 10 - level, '번')
`, 'save.txt': SAVE }],
  ['글자 레벨에 숫자 더하기', { 'main.py': P`lines = open('save.txt').readlines()
level = lines[1]
level = level + 1
`, 'save.txt': SAVE }],
  ['strip 과 int', { 'main.py': P`with open('save.txt', 'r') as f:
    lines = f.readlines()
name = lines[0].strip()
level = int(lines[1])
hunger = int(lines[2])
print('안녕, ' + name + '! 반가워')
print('다음 레벨까지', 10 - level, '번')
print(repr(lines[1]), int(lines[1]), repr(lines[1].strip()))
`, 'save.txt': SAVE }],
  ['콜라 세기', { 'main.py': P`count = 0
with open('sales.txt') as f:
    for line in f:
        if line == '콜라':
            count = count + 1
print('그냥 비교:', count)
count = 0
with open('sales.txt') as f:
    for line in f:
        if line.strip() == '콜라':
            count = count + 1
print('strip 비교:', count)
`, 'sales.txt': '콜라\n사이다\n콜라\n콜라\n' }],
  ['줄이 모자란 세이브', { 'main.py': P`lines = open('save.txt').readlines()
name = lines[0].strip()
level = int(lines[1])
hunger = int(lines[2])
`, 'save.txt': '비트\n3\n' }],
  ['숫자가 아닌 레벨', { 'main.py': P`lines = open('save.txt').readlines()
level = int(lines[1])
`, 'save.txt': '비트\n구십구\n4\n' }],

  // ── 바구니(버퍼) ──
  ['닫기 전에 다시 읽기', { 'main.py': P`f = open('save.txt', 'w')
f.write('비트\n')
f.write('3\n')
check = open('save.txt', 'r')
print('저장된 내용:', repr(check.read()))
check.close()
` }],
  ['닫은 뒤에 다시 읽기', { 'main.py': P`f = open('save.txt', 'w')
f.write('비트\n')
f.close()
check = open('save.txt', 'r')
print('저장된 내용:', repr(check.read()))
check.close()
` }],
  ['flush', { 'main.py': P`f = open('save.txt', 'w')
f.write('비트\n')
f.flush()
print(repr(open('save.txt').read()))
f.write('3\n')
print(repr(open('save.txt').read()))
f.close()
` }],
  ['같은 이름으로 다시 열면 앞의 파일이 닫힌다', { 'main.py': P`f = open('a.txt', 'w')
f.write('처음')
f = open('a.txt')
print(repr(f.read()))
` }],
  ['함수 안에서 닫지 않음', { 'main.py': P`def save():
    f = open('a.txt', 'w')
    f.write('함수 안')
save()
print(repr(open('a.txt').read()))
` }],
  ['이름 없이 쓰기', { 'main.py': P`open('a.txt', 'w').write('이름 없이')
print(repr(open('a.txt').read()))
` }],
  ['del 하면 닫힌다', { 'main.py': P`f = open('a.txt', 'w')
f.write('del')
del f
print(repr(open('a.txt').read()))
` }],
  ['다른 이름이 붙들고 있으면 안 닫힌다', { 'main.py': P`f = open('a.txt', 'w')
f.write('붙듦')
g = f
f = None
print(repr(open('a.txt').read()))
g.close()
print(repr(open('a.txt').read()))
` }],
  ['리스트 안에 있으면 안 닫힌다', { 'main.py': P`box = [open('a.txt', 'w')]
box[0].write('리스트')
print(repr(open('a.txt').read()))
box.clear()
print(repr(open('a.txt').read()))
` }],
  ['끝까지 안 닫음', { 'main.py': P`f = open('a.txt', 'w')
f.write('끝날 때 쏟아짐\n')
print('프로그램 끝')
` }],
  ['안 닫고 오류로 멈춤', { 'main.py': P`f = open('a.txt', 'w')
f.write('오류 전에 쓴 것\n')
x = 1 / 0
` }],
  ['with 안에서 오류', { 'main.py': P`with open('a.txt', 'w') as f:
    f.write('오류 전\n')
    x = int('abc')
` }],
  ['a 로 두 파일', { 'main.py': P`f = open('log.txt', 'a')
g = open('log.txt', 'a')
f.write('f1\n')
g.write('g1\n')
g.close()
f.close()
print(open('log.txt').read(), end='')
`, 'log.txt': '처음\n' }],

  // ── with ──
  ['with 뒤에는 닫혀 있다', { 'main.py': P`with open('a.txt', 'w') as f:
    f.write('hi\n')
    print(f.closed)
print(f.closed)
` }],
  ['with 뒤에 쓰기', { 'main.py': P`with open('a.txt', 'w') as f:
    f.write('hi\n')
f.write('bye\n')
` }],
  ['with 에 파일이 아닌 것', { 'main.py': P`with 3 as f:
    pass
` }],
  ['with 두 개 한 줄', { 'main.py': P`with open('save.txt') as src, open('copy.txt', 'w') as dst:
    dst.write(src.read())
print(open('copy.txt').read(), end='')
`, 'save.txt': SAVE }],

  // ── 닫힌 파일 · 모드 ──
  ['닫은 파일에 쓰기', { 'main.py': P`f = open('a.txt', 'w')
f.close()
f.write('x')
` }],
  ['닫은 파일 읽기', { 'main.py': P`f = open('save.txt')
f.close()
print(f.read())
`, 'save.txt': SAVE }],
  ['닫은 파일 for', { 'main.py': P`f = open('save.txt')
f.close()
for line in f:
    print(line)
`, 'save.txt': SAVE }],
  ['두 번 닫기', { 'main.py': P`f = open('a.txt', 'w')
f.close()
f.close()
print('괜찮다')
` }],
  ['w 로 연 파일 읽기', { 'main.py': P`f = open('save.txt', 'w')
print(f.read())
`, 'save.txt': SAVE }],
  ['r 로 연 파일에 쓰기', { 'main.py': P`f = open('save.txt', 'r')
f.write('99\n')
`, 'save.txt': SAVE }],
  ['except ValueError 로 잡기', { 'main.py': P`f = open('save.txt', 'r')
try:
    f.write('x')
except ValueError:
    print('ValueError 로 잡혔다')
f.close()
`, 'save.txt': SAVE }],
  ['except OSError 로 잡기', { 'main.py': P`try:
    open('none.txt')
except OSError as e:
    print('잡음:', e)
` }],
  ['대문자 모드', { 'main.py': P`f = open('a.txt', 'W')
` }],
  ['모드 두 개', { 'main.py': P`f = open('a.txt', 'rw')
` }],
  ['모드에 따옴표 없음', { 'main.py': P`f = open('a.txt', w)
` }],
  ['x 모드', { 'main.py': P`f = open('save.txt', 'x')
`, 'save.txt': SAVE }],
  ['x 모드로 새로', { 'main.py': P`with open('new.txt', 'x') as f:
    f.write('새것\n')
` }],
  ['없는 폴더에 쓰기', { 'main.py': P`f = open('data/save.txt', 'w')
` }],
  ['있는 폴더에 쓰기', { 'main.py': P`with open('data/save.txt', 'w') as f:
    f.write('비트\n')
`, dirs: ['data'] }],
  ['모드 이름 붙이기', { 'main.py': P`with open('a.txt', mode='w', encoding='utf-8') as f:
    f.write('비트\n')
    print(f)
    print(f.name, f.mode, f.encoding)
` }],
  ['파일 객체 출력', { 'main.py': P`f = open('a.txt', 'w')
print(f)
print(type(f))
f.close()
print(f)
` }],
  ['메소드 오타', { 'main.py': P`f = open('a.txt', 'w')
f.wirte('x')
` }],
  ['readlines 오타', { 'main.py': P`f = open('save.txt')
lines = f.readline()
print(lines)
lines = f.readlins()
`, 'save.txt': SAVE }],
  ['open 에 아무것도 없음', { 'main.py': P`f = open()
` }],
  ['len(f)', { 'main.py': P`f = open('save.txt')
print(len(f))
`, 'save.txt': SAVE }],
  ['f 를 글자에 더하기', { 'main.py': P`f = open('save.txt')
print('내용: ' + f)
`, 'save.txt': SAVE }],

  // ── 예외 처리와 짝 ──
  ['없으면 새 알', { 'main.py': P`try:
    with open('save.txt', 'r') as f:
        lines = f.readlines()
    name = lines[0].strip()
    level = int(lines[1])
    hunger = int(lines[2])
except FileNotFoundError:
    name = '알'
    level = 0
    hunger = 0
    print('새 알을 받았어요!')
print(name, level, hunger)
` }],
  ['있으면 불러오기', { 'main.py': P`try:
    with open('save.txt', 'r') as f:
        lines = f.readlines()
    name = lines[0].strip()
    level = int(lines[1])
    hunger = int(lines[2])
except FileNotFoundError:
    name = '알'
    level = 0
    hunger = 0
    print('새 알을 받았어요!')
print(name, level, hunger)
`, 'save.txt': SAVE }],
  ['예외 메시지 출력', { 'main.py': P`try:
    f = open('save.txt')
except FileNotFoundError as e:
    print('문제:', e)
    print(type(e).__name__)
` }],

  // ── w 와 a ──
  ['세이브를 a 로 세 번', { 'main.py': P`for level in [1, 2, 3]:
    with open('save.txt', 'a') as f:
        f.write('비트\n')
        f.write(str(level) + '\n')
        f.write('0\n')
with open('save.txt') as f:
    lines = f.readlines()
print(len(lines), '줄')
print('불러온 레벨:', int(lines[1]))
` }],
  ['일지를 w 로 세 번', { 'main.py': P`for event in ['알이 깨어났다', '레벨 1', '레벨 2']:
    with open('log.txt', 'w') as f:
        f.write(event + '\n')
print(open('log.txt').read(), end='')
` }],
  ['일지를 a 로 세 번', { 'main.py': P`for event in ['알이 깨어났다', '레벨 1', '레벨 2']:
    with open('log.txt', 'a') as f:
        f.write(event + '\n')
with open('log.txt', 'r') as f:
    for line in f:
        print(line.strip())
` }],
];

export function cases() {
  return [...BASE.map(([name, files]) => {
    const { dirs, ...rest } = files;
    return { name, files: rest, dirs: dirs || [] };
  }), ...goldenFromCards()];
}
