/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  게임기 — 펫 화면 + 단추(🍚 밥 · 🎾 놀기 · 💾 저장 · ⏻ 전원).
 *  어느 컴퓨터(World)든 받아서 그 컴퓨터의 펫을 보여 준다.
 *
 *  opts
 *    saveCode()  → 저장 코드(없으면 💾 단추가 숨는다)
 *    loadCode()  → 켤 때 돌릴 불러오기 코드(없으면 알부터)
 *    power       ⏻ 단추를 보일까
 *    hatch       알일 때 「톡톡 두드리기」 로 깨울 수 있나
 *    onEvent(kind, info)  카드가 알아야 할 일 — 'hatch' · 'play' · 'feed' · 'save' · 'off' · 'on'
 */
import { h, modal, onCleanup, screenTimeout } from './dom.js';
import { petSVG } from './pet-svg.js';
import { isEgg, MAX_HUNGER, STAGE_NAME, stageOf, cleanName } from '../game/pet.js';
import { S } from '../store.js';
import { j } from '../lib/josa.js';

export function gameBox(world, { saveCode = null, loadCode = null, power = true, hatch = true, buttons = true, onEvent = () => {}, size = '' } = {}) {
  const box = h('section', { class: `gb ${size}` });
  let crack = 0;
  let fx = '';        // 다음 그림에 붙일 움직임
  let bubble = '';    // 말풍선
  let bubbleTimer = null;

  const say = (msg) => {
    bubble = msg;
    if (bubbleTimer) clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => { bubble = ''; paint(); }, 2200);
  };
  onCleanup(() => bubbleTimer && clearTimeout(bubbleTimer));

  async function askName() {
    const inp = h('input', { class: 'name-in', maxlength: 8, value: S.petName || '비트', 'aria-label': '펫 이름' });
    const body = h('div', {}, h('p', {}, '알에서 깨어났어요! 이름을 지어 주세요. (8글자까지)'), inp,
      h('p', { class: 'small muted' }, '🙅 실명 대신 펫 이름을 지어 주세요. 이름은 이 브라우저에만 남아요.'));
    setTimeout(() => { inp.focus(); inp.select(); }, 30);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const b = document.querySelector('.modal .primary'); if (b) b.click(); } });
    const ok = await modal('🐣 이름 짓기', body, { ok: '이 이름으로!' });
    return ok ? cleanName(inp.value) : cleanName(S.petName);
  }

  async function act(kind) {
    if (kind === 'tap') {
      crack++;
      fx = 'wobble';
      if (crack < 3) { say(['톡!', '톡톡! 금이 갔어요', ''][crack - 1] || '톡'); paint(); return; }
      fx = 'pop';
      paint();
      const name = await askName();
      world.hatch(name);
      crack = 0;
      fx = 'pop';
      say(`안녕! 나는 ${name}!`);
      paint();
      onEvent('hatch', {});
      return;
    }
    if (kind === 'play' || kind === 'feed') {
      const r = kind === 'play' ? world.play() : world.feed();
      fx = r.ok ? (kind === 'play' ? 'jump' : 'munch') : 'nope';
      say(r.msg);
      paint();
      if (r.ok) onEvent(kind, r);
      return;
    }
    if (kind === 'save') {
      const code = saveCode && saveCode();
      if (!code) return;
      const r = world.save(code);
      fx = r.ok ? 'saved' : 'nope';
      say(r.ok ? '💾 저장했어요' : '💥 저장 코드가 멈췄어요');
      paint();
      onEvent('save', r);
      return;
    }
    if (kind === 'power') {
      if (world.powered) {
        world.powerOff();
        fx = 'off';
        paint();
        onEvent('off', {});
      } else {
        fx = 'boot';
        const code = loadCode ? loadCode() : null;
        const r = world.powerOn(code);
        if (r.restored) say(`${j(world.pet.name, '이')} 돌아왔어요! (레벨 ${world.pet.level})`);
        else if (code && r.problems.length) say('불러오기 실패… 알부터 다시 시작해요');
        else say('…알부터 다시 시작해요');
        paint();
        onEvent('on', r);
      }
    }
  }

  function paint() {
    const p = world.pet;
    const on = world.powered;
    const egg = on && isEgg(p);
    const screen = h('div', { class: `gb-screen ${on ? '' : 'off'} ${fx}` },
      on ? h('div', { class: 'gb-hud' },
        h('span', { class: 'gb-name' }, egg ? '🥚 알' : `${p.name}`),
        egg ? null : h('span', { class: 'gb-lv' }, `Lv.${p.level} · ${STAGE_NAME[stageOf(p.level)]}`)) : null,
      on ? h('div', { class: 'gb-pet', html: petSVG(p, { crack }) }) : h('div', { class: 'gb-offmsg' }, h('div', { class: 'gb-off-ico' }, '⏻'), '전원 꺼짐'),
      on && !egg ? h('div', { class: 'gb-bar', title: `배고픔 ${p.hunger} / ${MAX_HUNGER}` },
        h('span', {}, '🍖 배고픔'), h('span', { class: 'gb-track' }, h('i', { style: { width: `${(p.hunger / MAX_HUNGER) * 100}%` }, class: p.hunger >= 8 ? 'hot' : '' })), h('b', {}, `${p.hunger}`)) : null,
      bubble ? h('div', { class: 'gb-bubble' }, bubble) : null);
    const btns = h('div', { class: 'gb-btns' },
      on && egg && hatch ? h('button', { class: 'btn gb-b tap', onClick: () => act('tap') }, '🥚 톡톡 두드리기') : null,
      on && !egg ? h('button', { class: 'btn gb-b', onClick: () => act('feed') }, '🍚 밥 주기') : null,
      on && !egg ? h('button', { class: 'btn gb-b', onClick: () => act('play') }, '🎾 놀아 주기') : null,
      on && !egg && saveCode && saveCode() ? h('button', { class: 'btn gb-b save', onClick: () => act('save') }, '💾 저장') : null,
      power ? h('button', { class: `btn gb-b power ${on ? '' : 'is-off'}`, onClick: () => act('power'), title: on ? '전원 끄기' : '전원 켜기' }, on ? '⏻ 끄기' : '⏻ 켜기') : null);
    // ⚠ replaceChildren 에 null 을 넣으면 「null」 이라는 글자가 들어간다 — 배열로 골라 넣는다
    box.replaceChildren(...(buttons ? [screen, btns] : [screen]));
    if (fx) { const f = fx; screenTimeout(() => { if (fx === f) { fx = ''; const s = box.querySelector('.gb-screen'); if (s) s.classList.remove(f); } }, 700); }
  }
  paint();
  // 다른 곳(카드·실험)이 이 컴퓨터를 바꿔도 다시 그린다 — 움직임(fx)은 그대로 둔다
  onCleanup(world.listen(() => paint()));
  box.act = act;
  box.paint = paint;
  return box;
}

