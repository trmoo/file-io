/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  카드 8 · 세이브는 'w'   — 'a' 로 저장하면 불러올 때 옛날 레벨이 나온다
 *  카드 9 · 일지는 'a'     — 'w' 로 쓰면 마지막 하나만 남는다 · for line in f · 모드 고르기
 *  카드 10 · ⭐ 세이브 조작 — 파일은 그냥 글자다(고치면 레벨 99) · 깨진 세이브
 */
import { h, fill, toast, screenTimeout } from '../ui/dom.js';
import { codeView, consoleView } from '../ui/code.js';
import { gameBox } from '../ui/gamebox.js';
import { memoryPanel, diskPanel } from '../ui/panels.js';
import { ME, S, card, setCard, plug } from '../store.js';
import { World } from '../game/world.js';
import { run } from '../lib/run.js';
import { isEgg, saveText } from '../game/pet.js';
import { SAVE_MODES, NEWBIE, LOG_WRITE, LOG_READ, eventsFor } from '../data/missions.js';
import { MODE_QUIZ } from '../data/quiz.js';
import { story, tip, checklist, choose, picked, hints, editorBlock, finish, pills } from './kit.js';
import { ensureOn } from './start.js';
import { savedPet } from './load.js';
import { j } from '../lib/josa.js';

const loader = () => S.codes.load || NEWBIE.model;
const petName = () => (ME.pet && !isEgg(ME.pet) ? ME.pet.name : S.petName || '비트');

/* ═════════════ 카드 8 ═════════════ */
const LAB = new World({ disk: {}, label: '실험용 컴퓨터' });

export const wModeCard = {
  id: 'c08', chapter: 'modes', title: "💾 세이브는 'w' — 덮어쓰기",
  render(body, api) {
    const cid = 'c08';
    const name = petName();
    const timeline = h('div', { class: 'timeline' });
    const right = h('div', { class: 'col' });
    let busy = false;

    const experiment = (mode) => {
      if (busy) return;
      busy = true;
      LAB.disk = {};
      LAB.setPet({ name, level: 1, hunger: 0 });
      const lines = [];
      const log = (t, cls = '') => { lines.push(h('div', { class: `tl ${cls}` }, t)); fill(timeline, h('div', { class: 'mini-title' }, `🧪 '${mode}' 로 저장하는 게임`), ...lines); timeline.scrollTop = timeline.scrollHeight; };
      log(`🐣 ${j(name, '이')} 깨어났어요 (레벨 1)`);
      const code = SAVE_MODES[mode];
      const acts = [
        () => { LAB.save(code); log('💾 저장 — save.txt 에 레벨 1'); },
        () => { LAB.play(); log('🎾 놀아 주기 → 레벨 2'); },
        () => { LAB.save(code); log(`💾 저장 — save.txt ${mode === 'a' ? '맨 뒤에 덧붙임' : '를 덮어씀'}`); },
        () => { LAB.play(); log('🎾 놀아 주기 → 레벨 3'); },
        () => { LAB.save(code); log(`💾 저장 — save.txt ${mode === 'a' ? '맨 뒤에 덧붙임' : '를 덮어씀'}`); },
        () => { LAB.powerOff(); log('⏻ 끄기 — 메모리가 사라졌어요'); },
        () => {
          const r = LAB.powerOn(loader());
          const lv = LAB.pet.level;
          log(r.restored ? `⏻ 켜기 — 불러온 레벨: ${lv} ${lv === 3 ? '😊' : '😱'}` : '⏻ 켜기 — 불러오기 실패', lv === 3 ? 'good' : 'bad');
          setCard(cid, { [mode]: lv });
          busy = false;
          paintRight();
        },
      ];
      acts.forEach((f, i) => screenTimeout(f, 650 * (i + 1)));
    };

    const paintRight = () => {
      const st = card(cid);
      const parts = [
        story(`친구가 말했어요. 「세이브가 지워지면 안 되니까 저장 코드를 <b>'a'(덧붙이기)</b>로 바꾸자!」 정말 괜찮을까요? 레벨 1·2·3 일 때 한 번씩 저장하고 껐다 켜 봐요.`, '🤔'),
        h('div', { class: 'two' },
          h('div', { class: 'col tight' }, codeView(SAVE_MODES.a, { marks: { 1: 'on' } }),
            h('button', { class: 'btn primary', disabled: picked(cid, 'guess') === undefined, onClick: () => experiment('a') }, "▶ 'a' 로 실험"),
            st.a !== undefined ? h('div', { class: `res-tag ${st.a === 3 ? 'good' : 'bad'}` }, `불러온 레벨 ${st.a}`) : null),
          h('div', { class: 'col tight' }, codeView(SAVE_MODES.w, { marks: { 1: 'on' } }),
            h('button', { class: 'btn primary', disabled: st.a === undefined, onClick: () => experiment('w') }, "▶ 'w' 로 실험"),
            st.w !== undefined ? h('div', { class: `res-tag ${st.w === 3 ? 'good' : 'bad'}` }, `불러온 레벨 ${st.w}`) : null)),
        choose({ q: "'a' 로 세 번 저장한 뒤 껐다 켜면 몇 레벨로 돌아올까요?", choices: ['레벨 1', '레벨 3', '오류가 난다'], save: [cid, 'guess'], reveal: false, onPick: () => paintRight(), cls: 'inline', note: card(cid).a === undefined }),
      ];
      if (st.a !== undefined && st.w !== undefined) {
        parts.push(tip("'a' 는 옛 세이브 <b>뒤에</b> 붙여서 파일이 9줄이 됐어요. 불러오기는 <b>맨 위 세 줄</b>(가장 옛날 세이브)을 읽었죠. 세이브는 「지금 상태 한 장」 이면 되니 <b>덮어쓰기('w')</b>가 맞아요.", '🔍'));
        parts.push(choose({ q: '그렇다면 세이브 저장에 알맞은 모드는?', choices: ["'a' — 덧붙이기", "'w' — 덮어쓰기"], answer: 1,
          why: "세이브는 지금 상태만 있으면 돼요. 'w' 가 옛 세이브를 지우고 새로 써요. (덧붙이기가 필요한 것은 다음 카드에서!)",
          save: [cid, 'which'], cls: 'inline', onPick: (i, ok) => { if (ok) finish(api, cid, "세이브에는 'w' 가 맞다는 걸 알았어요!"); } }));
      }
      fill(right, ...parts);
    };
    paintRight();
    fill(body, h('div', { class: 'split l38' },
      h('div', { class: 'col compact' }, h('div', { class: 'who' }, '🧪 실험용 컴퓨터'), gameBox(LAB, { buttons: false, size: 'xs' }),
        diskPanel(LAB, { title: '💾 실험용 컴퓨터의 디스크', note: '' }), timeline),
      right));
  },
};

/* ═════════════ 카드 9 ═════════════ */
const LOGW = new World({ disk: {}, label: '일지' });

export const aModeCard = {
  id: 'c09', chapter: 'modes', title: "📜 일지는 'a' — 덧붙이기",
  render(body, api) {
    const cid = 'c09';
    const name = petName();
    const evs = eventsFor(name);
    const st = () => card(cid);
    const tab = st().tab || 'write';
    const go = (t) => { setCard(cid, { tab: t }); aModeCard.render(body, api); };
    const quizDone = () => MODE_QUIZ.every((q, i) => (st().mq || {})[i] === q.a);
    const done = () => {
      const s = st();
      if (s.wres && s.wres.pass && s.rres && s.rres.pass && quizDone()) finish(api, cid, "일지는 'a', 세이브는 'w'!");
    };
    const top = pills([
      { id: 'write', label: '1. 일지 쓰기', done: !!(st().wres && st().wres.pass) },
      { id: 'read', label: '2. 일지 읽기', done: !!(st().rres && st().rres.pass) },
      { id: 'quiz', label: '3. 모드 고르기', done: quizDone() },
    ], tab, go);

    if (tab === 'write') {
      const checks = h('div', {}, checklist(st().wres || null, { labels: ['오류 없이 실행된다', '사건 세 개가 모두 남는다', '한 줄에 사건 하나씩 쌓인다', '전에 있던 일지도 지우지 않는다'] }));
      const blk = editorBlock({
        cid, key: 'wcode', starter: LOG_WRITE.starter, model: LOG_WRITE.model, rows: 4, runLabel: '▶ 사건 세 개 기록하기',
        onRun: (code) => {
          const p = LOG_WRITE.play(code, evs, {});
          LOGW.disk = p.disk;
          LOGW.changed('disk');
          const res = LOG_WRITE.check(code, { pet: { name } });
          setCard(cid, { wres: res });
          fill(checks, checklist(res));
          if (res.pass) plug('log', code);
          done();
          return p.runs[p.runs.length - 1];
        },
      });
      fill(body, top, h('div', { class: 'split l50' },
        h('div', { class: 'col' },
          story(`이번엔 <b>모험 일지</b>예요. 게임은 사건이 일어날 때마다 이 코드를 한 번씩 불러요 — 변수 <code>event</code> 에 사건이 들어 있어요. 사건 세 개가 <b>모두</b> 일지에 남게 해 주세요.`, '📜'),
          h('div', { class: 'events' }, ...evs.map((e, i) => h('div', { class: 'ev' }, h('b', {}, `사건 ${i + 1}`), ` event = '${e}'`))),
          blk.el),
        h('div', { class: 'col' }, diskPanel(LOGW, { title: '💾 일지 파일', note: '', state: { open: 'log.txt' } }), checks,
          hints(["세 번 기록했는데 마지막 하나만 남았다면 — 열 때마다 무엇이 일어나나요? 'w' 는 「여는 순간 지운다」 였죠.", "덧붙이기 모드는 영어 <b>a</b>ppend 의 첫 글자예요.", "<code>with open('log.txt', 'a') as f:</code>"], { cid, key: 'wh' }))));
      return;
    }
    if (tab === 'read') {
      const checks = h('div', {}, checklist(st().rres || null, { labels: ['오류 없이 실행된다', '일지가 모두 출력된다', '줄 사이에 빈 줄이 없다'] }));
      const disk = { 'log.txt': evs.join('\n') + '\n' };
      const R = new World({ disk });
      const blk = editorBlock({
        cid, key: 'rcode', starter: LOG_READ.starter, model: LOG_READ.model, rows: 4, runLabel: '▶ 일지 읽기',
        onRun: (code) => {
          const res = LOG_READ.check(code, { pet: { name } });
          setCard(cid, { rres: res });
          fill(checks, checklist(res));
          done();
          return res.runs[0];
        },
      });
      fill(body, top, h('div', { class: 'split l50' },
        h('div', { class: 'col' },
          story('<code>for line in f:</code> 는 파일을 <b>한 줄씩</b> 꺼내 줘요. 그런데 그대로 출력하면 줄 사이에 빈 줄이 생겨요. 깔끔한 일지로 고쳐 보세요.', '📖'), blk.el),
        h('div', { class: 'col' }, diskPanel(R, { title: '💾 읽을 일지', note: '', state: { open: 'log.txt' } }), checks,
          tip('<code>line</code> 끝에는 이미 <span class="nl">↵</span> 가 있어요. 거기에 <code>print( )</code> 가 줄바꿈을 하나 더 붙여서 빈 줄이 생겨요.'),
          hints(['5번 카드에서 ↵ 를 떼어 낼 때 무엇을 썼나요?', '<code>print(line.strip())</code>'], { cid, key: 'rh' }))));
      return;
    }
    // ③ 모드 고르기
    const list = h('div', { class: 'mq' });
    const paint = () => {
      const mq = st().mq || {};
      fill(list, ...MODE_QUIZ.map((q, i) => {
        const a = mq[i];
        const ok = a === q.a;
        return h('div', { class: `mq-row ${a === undefined ? '' : ok ? 'right' : 'wrong'}` },
          h('div', { class: 'mq-q' }, `${i + 1}. ${q.q}`),
          h('div', { class: 'mq-btns' }, ...['r', 'w', 'a'].map((m) => h('button', {
            class: `mbtn ${a === m ? (ok ? 'right' : 'wrong') : ''}`, disabled: ok,
            onClick: () => { setCard(cid, { mq: { ...mq, [i]: m } }); paint(); done(); },
          }, `'${m}'`))),
          a !== undefined ? h('div', { class: 'mq-why' }, ok ? `⭕ ${q.why}` : '❌ 다시 골라 보세요') : null);
      }));
    };
    paint();
    fill(body, top, h('div', { class: 'split l30' },
      h('div', { class: 'col' }, story('상황마다 알맞은 모드를 골라요.', '🎯'),
        h('table', { class: 'modes' },
          h('tr', {}, h('th', {}, '모드'), h('th', {}, '뜻'), h('th', {}, '파일이 없으면'), h('th', {}, '원래 내용은')),
          h('tr', {}, h('td', {}, h('code', {}, "'r'")), h('td', {}, '읽기'), h('td', { class: 'bad' }, '오류'), h('td', {}, '그대로')),
          h('tr', {}, h('td', {}, h('code', {}, "'w'")), h('td', {}, '쓰기'), h('td', {}, '새로 만든다'), h('td', { class: 'bad' }, '모두 지운다')),
          h('tr', {}, h('td', {}, h('code', {}, "'a'")), h('td', {}, '덧붙이기'), h('td', {}, '새로 만든다'), h('td', { class: 'good' }, '두고 뒤에 붙인다')))),
      list));
  },
};

/* ═════════════ 카드 10 · ⭐ ═════════════ */
export const cheatCard = {
  id: 'c10', chapter: 'modes', title: '⭐ 세이브 조작 — 파일은 그냥 글자',
  render(body, api) {
    ensureOn();
    const cid = 'c10';
    const st = () => card(cid);
    if (!('save.txt' in ME.disk)) ME.setFile('save.txt', saveText(savedPet()));
    if (st().backup === undefined) setCard(cid, { backup: ME.disk['save.txt'] });
    const ta = h('textarea', { class: 'notepad', spellcheck: 'false', rows: 5, 'aria-label': 'save.txt 메모장' });
    ta.value = ME.disk['save.txt'];
    const out = h('div', {});
    const status = h('div', {});
    const paintStatus = () => {
      const s = st();
      fill(status, checklist({ pass: !!(s.t99 && s.broken), items: [
        { ok: !!s.t99, label: '1. 레벨 칸을 99 로 고치고 ⏻ 껐다 켜기 → 👑' },
        { ok: !!s.broken, label: '2. 레벨 칸에 「구십구」 라고 적고 ⏻ 껐다 켜기 → ?' },
      ] }, { title: '⭐ 해 볼 것 (선택)' }));
      if (s.t99 && s.broken) finish(api, cid, '세이브 파일의 비밀을 알아냈어요!');
    };
    paintStatus();
    const gb = gameBox(ME, { loadCode: loader, saveCode: () => S.codes.save, size: 'sm', onEvent: (k, r) => {
      if (k !== 'on') return;
      if (r.restored && ME.pet.level >= 99) setCard(cid, { t99: true });
      if (r.r && !r.r.ok) { setCard(cid, { broken: true }); fill(out, consoleView(r.r, { title: '켤 때 돈 불러오기 코드' })); }
      else fill(out);
      ta.value = ME.disk['save.txt'] ?? '';
      paintStatus();
    } });
    fill(body, h('div', { class: 'split l38' },
      h('div', { class: 'col' }, gb, memoryPanel(ME, { note: '' })),
      h('div', { class: 'col' },
        story('세이브 파일은 <b>그냥 글자</b>예요. 메모장으로 열어 고칠 수도 있죠! 레벨을 바꿔 저장한 뒤 게임기를 껐다 켜 보세요.', '🕵️'),
        h('div', { class: 'two' },
          h('div', { class: 'col tight' }, h('div', { class: 'mini-title' }, '📝 메모장 — save.txt'), ta,
            h('div', { class: 'row' },
              h('button', { class: 'btn primary', onClick: () => { ME.setFile('save.txt', ta.value); toast('메모장 내용을 save.txt 에 저장했어요', 'gold'); } }, '💾 메모장 저장'),
              h('button', { class: 'btn small', onClick: () => { ME.setFile('save.txt', st().backup); ta.value = st().backup; toast('처음 세이브로 되돌렸어요'); } }, '↺ 되돌리기'))),
          status),
        out,
        tip('게임 회사는 왜 세이브 파일을 숨기거나 알아볼 수 없게 바꿔 둘까요? 그리고 <b>깨진 세이브</b>에도 게임이 멈추지 않게 하려면 불러오기 코드에 무엇을 더해야 할까요? → 끝판왕의 ⭐ 에서 해 볼 수 있어요.', '💭'),
        h('textarea', { class: 'note-ta', rows: 2, placeholder: '내 생각 (적지 않아도 돼요)', onInput: (e) => setCard(cid, { think: e.target.value }) }, st().think || ''))));
  },
};
