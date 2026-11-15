/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  「컴퓨터 한 대」 — 메모리(지금 펫 상태 = 변수)와 디스크(파일)를 함께 들고 있다.
 *
 *   ⏻ 끄기   메모리가 사라진다(펫이 없어진다). 디스크는 그대로.
 *   ⏻ 켜기   게임이 처음부터 다시 시작한다. 불러오기 코드가 있으면 그것을 돌려 디스크에서 펫을 되살리고,
 *            없거나 실패하면 알부터 다시.
 *   💾 저장  저장 코드를 「지금 펫 상태」 를 변수로 넘겨 돌린다 → 디스크가 바뀐다.
 *
 *  내 컴퓨터는 하나지만(화면 왼쪽에 늘 보이는 것), 카드에 따라 「친구 컴퓨터」 · 「실험용 컴퓨터」 를 따로 만든다.
 *  ⚠ node 로 불러다 시험한다. DOM 을 만들지 말 것.
 */
import { run } from '../lib/run.js';
import { EGG, hatch, play, feed, toVars, fromVars, isEgg } from './pet.js';

export class World {
  constructor({ disk = {}, pet = EGG, label = '내 컴퓨터', onChange = null } = {}) {
    this.disk = { ...disk };
    this.pet = pet ? { ...pet } : null; // null = 전원이 꺼져 메모리가 비었다
    this.label = label;
    this.onChange = onChange;
    this.last = null;                   // 마지막에 일어난 일 — 화면이 효과(흔들기·반짝)를 고를 때
    this.subs = new Set();              // 화면 조각들 (게임기 · 메모리 칸 · 디스크 칸)
  }
  /** 바뀔 때마다 부를 함수를 건다 — 걷어 내는 함수를 돌려준다 */
  listen(fn) { this.subs.add(fn); return () => this.subs.delete(fn); }
  get powered() { return this.pet !== null; }
  changed(kind, extra = {}) {
    this.last = { kind, at: Date.now(), ...extra };
    if (this.onChange) this.onChange(this, this.last);
    for (const f of [...this.subs]) f(this, this.last);
  }

  hatch(name) {
    if (!this.powered) return { ok: false, msg: '전원이 꺼져 있어요.' };
    this.pet = hatch(name);
    this.changed('hatch');
    return { ok: true, msg: `${this.pet.name} 탄생! 🐣` };
  }
  play() {
    if (!this.powered) return { ok: false, msg: '전원이 꺼져 있어요.' };
    const r = play(this.pet);
    if (r.ok) { this.pet = r.pet; this.changed('play'); }
    return r;
  }
  feed() {
    if (!this.powered) return { ok: false, msg: '전원이 꺼져 있어요.' };
    const r = feed(this.pet);
    if (r.ok) { this.pet = r.pet; this.changed('feed'); }
    return r;
  }
  /** 펫을 정해 둔 값으로 (실험·시험용) */
  setPet(p) { this.pet = p ? { ...p } : null; this.changed('set'); }

  powerOff() {
    const before = this.pet;
    this.pet = null;
    this.changed('off', { before });
  }
  /**
   * 켜기 — loader(불러오기 코드)가 있으면 돌려서 펫을 되살린다.
   * 돌려주는 값 = { r: 실행 결과(없으면 null), problems: [되살리기에 실패한 까닭], restored: 되살렸나 }
   */
  powerOn(loader = null) {
    this.pet = { ...EGG };
    let r = null, problems = [], restored = false;
    if (loader) {
      r = run(loader, { disk: this.disk });
      this.disk = r.disk; // 불러오기 코드가 파일을 건드렸을 수도 있다('w' 로 열었다면 지워진다!)
      if (!r.ok) problems = [`불러오기 코드가 멈췄어요 — ${r.errorLast || r.stderr.split('\n').pop()}`];
      else {
        const v = fromVars(r.varMap);
        problems = v.problems;
        if (v.pet) { this.pet = v.pet; restored = !isEgg(v.pet); }
      }
    }
    this.changed('on', { restored, problems });
    return { r, problems, restored };
  }
  /** 껐다 켜기 */
  reboot(loader = null) {
    this.powerOff();
    return this.powerOn(loader);
  }

  /** 저장 — 지금 펫 상태를 변수 name · level · hunger 로 넘겨 저장 코드를 돌린다 */
  save(code) {
    if (!this.powered) return { r: null, ok: false, msg: '전원이 꺼져 있어요.' };
    const r = run(code, { disk: this.disk, vars: toVars(this.pet) });
    this.disk = r.disk;
    this.changed('save', { ok: r.ok });
    return { r, ok: r.ok };
  }
  /** 일지에 사건 하나 — 변수 event 로 넘긴다 */
  log(code, event) {
    const r = run(code, { disk: this.disk, vars: { event } });
    this.disk = r.disk;
    this.changed('log', { ok: r.ok, event });
    return { r, ok: r.ok };
  }
  /** 아무 코드나 이 컴퓨터에서 — 디스크만 넘겨받는다 */
  exec(code, vars = null) {
    const r = run(code, { disk: this.disk, vars });
    this.disk = r.disk;
    this.changed('exec', { ok: r.ok });
    return r;
  }
  setFile(name, text) {
    if (text === null) delete this.disk[name]; else this.disk[name] = text;
    this.changed('file', { name });
  }
  clearDisk() { this.disk = {}; this.changed('disk'); }
}
