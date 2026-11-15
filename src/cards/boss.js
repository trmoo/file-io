/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  카드 11 · 🏆 끝판왕 — 나의 세이브 시스템
 *  저장 · 불러오기 · 일지 세 코드를 끼우면 앱이 진짜 게임처럼 차례대로 해 보며 검사한다.
 *  (앞 카드에서 통과한 코드가 처음부터 들어 있다 — 「내가 만든 부품을 모아 끼우기」)
 */
import { h, fill, screenTimeout } from '../ui/dom.js';
import { petSVG } from '../ui/pet-svg.js';
import { S, card, setCard, plug } from '../store.js';
import { BOSS } from '../data/missions.js';
import { story, tip, checklist, editorBlock, finish, pills, DEMO } from './kit.js';

const PARTS = [
  { id: 'save', label: '💾 저장', what: '변수 name · level · hunger 를 save.txt 에 (with · 한 줄에 값 하나)' },
  { id: 'load', label: '📂 불러오기', what: 'save.txt 를 읽어 name · level · hunger 를 되살린다 (없으면 새 알)' },
  { id: 'log', label: '📜 일지', what: '변수 event 를 log.txt 에 한 줄로 덧붙인다' },
];

/** 이 카드의 코드 — 저장한 것 → 앞 카드에서 끼운 것 → 빈 틀 */
const codeOf = (k) => {
  const c = card('c11');
  if (typeof c[k] === 'string') return c[k];
  if (DEMO) return BOSS.models[k];
  return S.codes[k] || BOSS.starters[k];
};

export const bossCard = {
  id: 'c11', chapter: 'boss', title: '🏆 끝판왕 — 나의 세이브 시스템',
  render(body, api) {
    const cid = 'c11';
    const st = () => card(cid);
    const tab = st().tab || 'save';
    const result = h('div', { class: 'col' });
    const name = S.petName || '비트';

    const paintResult = (res, animate) => {
      if (!res) {
        fill(result, checklist(null, { title: '🧪 자동 검사', labels: ['1. 세이브가 없을 때 — 새 알로 시작한다', '2. 저장하면 save.txt 에 세 줄이 남는다', '3. 껐다 켜면 그대로(레벨 2 · 배고픔 4) 돌아온다', '4. 다시 저장해도 save.txt 는 세 줄 그대로다 (덮어쓰기)', '5. 다시 껐다 켜면 최신 상태(레벨 3)가 돌아온다', '6. 일지는 껐다 켜도 이어서 쌓인다 (네 줄)', '7. 연 파일을 모두 닫았다 (with 또는 close)'] }));
        return;
      }
      const n = res.items.length;
      const draw = (k) => {
        const shown = { pass: k >= n && res.pass, items: res.items.slice(0, k) };
        fill(result,
          checklist(shown, { title: '🧪 자동 검사' }),
          k >= n ? h('div', { class: `bonus ${res.bonus.ok === true ? 'got' : ''}` }, res.bonus.ok === true ? '⭐ ' : '☆ ', res.bonus.label, res.bonus.ok === true ? '' : h('div', { class: 'chk-why' }, res.bonus.why)) : null,
          k >= n && res.pass ? h('div', { class: 'trophy' }, h('div', { class: 'trophy-pet', html: petSVG({ name, level: 99, hunger: 0 }) }),
            h('div', {}, h('div', { class: 'trophy-title' }, '🏆 세이브 시스템 완성!'), h('div', {}, '껐다 켜도, 처음 온 친구여도, 일지가 쌓여도 — 이제 게임이 모든 것을 기억해요.'))) : null);
      };
      if (!animate) { draw(n); return; }
      for (let k = 0; k <= n; k++) screenTimeout(() => draw(k), 320 * k);
    };

    const blk = editorBlock({
      cid, key: tab, starter: BOSS.starters[tab], model: BOSS.models[tab], rows: tab === 'load' ? 15 : 8,
      runLabel: '🧪 자동 검사', showConsole: false,
      onRun: (code) => {
        const codes = { save: codeOf('save'), load: codeOf('load'), log: codeOf('log'), [tab]: code };
        const res = BOSS.check(codes, { name });
        setCard(cid, { res: { pass: res.pass, items: res.items, bonus: res.bonus } });
        paintResult(res, true);
        if (res.pass) {
          plug('save', codes.save); plug('load', codes.load); plug('log', codes.log);
          screenTimeout(() => finish(api, cid, '끝판왕을 깼어요! 🏆'), 320 * (res.items.length + 1));
        }
        return null;
      },
    });
    // 편집기에 처음 넣을 코드 — 저장한 것이 없으면 앞 카드에서 끼운 코드
    if (typeof st()[tab] !== 'string') blk.ed.value = codeOf(tab);
    paintResult(st().res || null, false);

    const part = PARTS.find((p) => p.id === tab);
    fill(body, h('div', { class: 'split l55' },
      h('div', { class: 'col' },
        story('지금까지 만든 부품 셋을 끼워 <b>나만의 세이브 시스템</b>을 완성해요. 앞 카드에서 통과한 코드가 이미 들어 있어요. <b>🧪 자동 검사</b>를 누르면 진짜 게임처럼 켜고 · 놀고 · 저장하고 · 껐다 켜며 확인해요.', '🏆'),
        pills(PARTS.map((p) => ({ id: p.id, label: p.label })), tab, (t) => { setCard(cid, { tab: t }); bossCard.render(body, api); }),
        h('div', { class: 'part-what' }, part.what),
        blk.el),
      h('div', { class: 'col' }, result,
        tip("⭐ 더 해 보기 — 세이브 파일의 레벨 칸이 「구십구」 처럼 깨져 있으면 <code>int( )</code> 에서 <code>ValueError</code> 가 나요. 불러오기 코드에 <code>except ValueError:</code> 를 하나 더 붙여 새 알로 시작하게 해 보세요.", '⭐'))));
  },
};
