# 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
# 진짜 파이썬(CPython)으로 test/golden-cases.mjs 의 사례들을 돌려 test/golden.json 을 만든다.
#
#   npm run golden          (= PYTHONUTF8=1 python tools/golden.py)
#
# 사례마다 임시 폴더에 처음 파일들을 진짜로 만들고, 그 폴더에서 `python main.py` 를 실행한다.
# 화면 출력(stdout) · 오류(stderr) · 그리고 ★ 실행이 끝난 뒤 폴더에 남은 파일들의 내용까지 받아 둔다.
# 파일 입출력 수업이므로 「출력이 같은가」 만큼 「디스크에 무엇이 남았는가」 가 중요하다.
#
# ⚠ UTF-8 모드(PYTHONUTF8=1)로 돌린다 — 학생이 쓰는 코랩(리눅스)과 같게.
#   한국어 윈도의 기본 파이썬은 open( ) 의 기본 인코딩이 cp949 라 print(f) 의 encoding= 이 달라진다.
import json, os, pathlib, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
dump = subprocess.run(
    ['node', '-e', "import('./test/golden-cases.mjs').then(m => process.stdout.write(JSON.stringify(m.cases())))"],
    cwd=ROOT, capture_output=True, text=True, encoding='utf-8', check=True)
cases = json.loads(dump.stdout)

PREFIX = sys.base_prefix  # 예) C:\Program Files\Python 3.12.3

out = []
for c in cases:
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmp:
        for d in c.get('dirs') or []:
            pathlib.Path(tmp, d).mkdir(parents=True, exist_ok=True)
        for name, text in (c.get('files') or {}).items():
            p = pathlib.Path(tmp, name)
            p.parent.mkdir(parents=True, exist_ok=True)
            # 줄바꿈을 그대로 — 윈도에서 \r\n 으로 바뀌지 않게
            p.write_bytes(text.encode('utf-8'))
        r = subprocess.run([sys.executable, 'main.py'], cwd=tmp, capture_output=True,
                           text=True, encoding='utf-8', input='\n'.join(c.get('inputs') or []),
                           env={**os.environ, 'PYTHONUTF8': '1', 'PYTHONDONTWRITEBYTECODE': '1'})
        real = str(pathlib.Path(tmp).resolve())
        fix = lambda s: (s.replace(real, 'C:\\project').replace(real.replace('\\', '\\\\'), 'C:\\\\project')
                         .replace(PREFIX, 'C:\\Python312').replace(PREFIX.replace('\\', '\\\\'), 'C:\\\\Python312')
                         .replace('\r\n', '\n').rstrip('\n'))
        # 실행 뒤 남은 파일 — 프로그램 파일(main.py)은 빼고, 윈도 줄바꿈(\r\n)은 \n 으로 되돌려 적는다
        left = {}
        for p in sorted(pathlib.Path(tmp).rglob('*')):
            if p.is_file() and p.name != 'main.py' and '__pycache__' not in p.parts:
                left[p.relative_to(tmp).as_posix()] = p.read_bytes().decode('utf-8').replace('\r\n', '\n')
        out.append({'name': c['name'], 'stdout': fix(r.stdout), 'stderr': fix(r.stderr), 'code': r.returncode, 'files': left})

(ROOT / 'test' / 'golden.json').write_text(
    json.dumps({'python': sys.version.split()[0], 'cases': out}, ensure_ascii=False, indent=1), encoding='utf-8')
print(f'{len(out)}개 사례를 진짜 파이썬 {sys.version.split()[0]} 로 돌려 test/golden.json 에 담았습니다.')
