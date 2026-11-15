/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  `npm run golden` — 진짜 파이썬을 UTF-8 모드로 불러 tools/golden.py 를 돌린다.
 *  (윈도 명령 창에서 PYTHONUTF8=1 을 앞에 붙이는 문법이 셸마다 달라서 node 로 감쌌다)
 */
import { spawnSync } from 'node:child_process';
const py = process.platform === 'win32' ? 'python' : 'python3';
const r = spawnSync(py, [process.argv[2] || 'tools/golden.py'], { stdio: 'inherit', env: { ...process.env, PYTHONUTF8: '1' } });
process.exit(r.status ?? 1);
