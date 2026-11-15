/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  펫 「비트」 그림 — 직접 그린 SVG. 레벨이 오를수록 모습이 바뀐다.
 *    알 → 아기(1~2) → 어린이(3~5, 더듬이가 난다) → 어른(6~, 더듬이 전구가 켜진다) → 전설(99, 왕관)
 *  배고픔에 따라 표정이 바뀐다(8 이상이면 땀방울).
 */
import { stageOf, moodOf } from '../game/pet.js';

const BODY = '#3cc6b4', BODY_DARK = '#219b8b', BELLY = '#c9f5ec', CHEEK = '#ff9db0', INK = '#24303a';

/** 알 — crack 0~3 (두드릴수록 금이 간다) */
function egg(crack = 0) {
  const cracks = [
    '',
    '<path d="M88 72 l8 10 -6 8 9 9" fill="none" stroke="#8a6a33" stroke-width="3" stroke-linecap="round"/>',
    '<path d="M88 72 l8 10 -6 8 9 9 M118 96 l-7 9 6 7 -5 9" fill="none" stroke="#8a6a33" stroke-width="3" stroke-linecap="round"/>',
    '<path d="M60 112 l12 -8 10 9 12 -10 10 9 12 -9 10 9 14 -8" fill="none" stroke="#8a6a33" stroke-width="3.5" stroke-linecap="round"/>',
  ];
  return `
    <ellipse cx="100" cy="182" rx="44" ry="7" fill="rgba(0,0,0,.12)"/>
    <g class="egg-body">
      <ellipse cx="100" cy="116" rx="50" ry="64" fill="#fff6e2" stroke="#d9b77a" stroke-width="4"/>
      <circle cx="78" cy="100" r="9" fill="${BODY}" opacity=".8"/>
      <circle cx="120" cy="132" r="12" fill="${BODY}" opacity=".8"/>
      <circle cx="104" cy="82" r="6" fill="${BODY}" opacity=".8"/>
      <circle cx="84" cy="150" r="7" fill="${BODY}" opacity=".8"/>
      ${cracks[Math.max(0, Math.min(3, crack))]}
    </g>`;
}

function face(mood, s, cy) {
  const ey = cy - 12 * s, ex = 22 * s;
  const eyes = mood === 'hungry'
    ? `<path d="M${100 - ex - 8} ${ey} q8 -8 16 0 M${100 + ex - 8} ${ey} q8 -8 16 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="${100 - ex}" cy="${ey}" rx="${9 * s}" ry="${11 * s}" fill="#fff"/><ellipse cx="${100 + ex}" cy="${ey}" rx="${9 * s}" ry="${11 * s}" fill="#fff"/>
       <circle class="pupil" cx="${100 - ex + 1}" cy="${ey + 2}" r="${5.5 * s}" fill="${INK}"/><circle class="pupil" cx="${100 + ex + 1}" cy="${ey + 2}" r="${5.5 * s}" fill="${INK}"/>
       <circle cx="${100 - ex + 3}" cy="${ey - 1}" r="${2 * s}" fill="#fff"/><circle cx="${100 + ex + 3}" cy="${ey - 1}" r="${2 * s}" fill="#fff"/>`;
  const my = ey + 22 * s;
  const mouth = mood === 'happy'
    ? `<path d="M${100 - 10 * s} ${my} q${10 * s} ${11 * s} ${20 * s} 0" stroke="${INK}" stroke-width="3.5" fill="#ff7c8f" stroke-linecap="round"/>`
    : mood === 'ok'
      ? `<path d="M${100 - 8 * s} ${my + 2} q${8 * s} ${5 * s} ${16 * s} 0" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
      : `<path d="M${100 - 12 * s} ${my + 4} q${6 * s} -6 ${12 * s} 0 q${6 * s} 6 ${12 * s} 0" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  const cheeks = `<ellipse cx="${100 - ex - 12 * s}" cy="${ey + 16 * s}" rx="${7 * s}" ry="${4.5 * s}" fill="${CHEEK}" opacity=".75"/>
    <ellipse cx="${100 + ex + 12 * s}" cy="${ey + 16 * s}" rx="${7 * s}" ry="${4.5 * s}" fill="${CHEEK}" opacity=".75"/>`;
  const sweat = mood === 'hungry' ? `<path class="sweat" d="M${100 + 48 * s} ${ey - 22 * s} q7 12 0 16 q-7 -4 0 -16z" fill="#7fd0ff"/>` : '';
  return eyes + cheeks + mouth + sweat;
}

/** 펫 그림 — pet = { name, level, hunger } · crack = 알에 간 금 */
export function petSVG(pet, { crack = 0 } = {}) {
  const st = stageOf(pet ? pet.level : 0);
  const inner = st === 'egg' ? egg(crack) : creature(st, moodOf(pet.hunger));
  return `<svg class="pet-svg st-${st}" viewBox="0 0 200 200" role="img" aria-label="펫 그림">${inner}</svg>`;
}

function creature(st, mood) {
  const s = { baby: 0.72, kid: 0.86, adult: 1, legend: 1 }[st];
  const cy = 182 - 58 * s;            // 몸 가운데
  const top = cy - 52 * s;            // 머리 꼭대기
  const antenna = st === 'baby' ? '' : `
    <path d="M100 ${top + 4} q-4 -18 6 -30" stroke="${BODY_DARK}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle class="bulb" cx="106" cy="${top - 28}" r="${st === 'kid' ? 7 : 9}" fill="${st === 'kid' ? '#e9fff9' : '#ffd84a'}" stroke="${BODY_DARK}" stroke-width="3"/>
    ${st === 'kid' ? '' : `<circle cx="106" cy="${top - 28}" r="16" fill="#ffd84a" opacity=".25"/>`}`;
  const arms = st === 'adult' || st === 'legend' ? `
    <ellipse cx="${100 - 58 * s}" cy="${cy + 8}" rx="11" ry="16" fill="${BODY}" transform="rotate(25 ${100 - 58 * s} ${cy + 8})"/>
    <ellipse cx="${100 + 58 * s}" cy="${cy + 8}" rx="11" ry="16" fill="${BODY}" transform="rotate(-25 ${100 + 58 * s} ${cy + 8})"/>` : '';
  const crown = st === 'legend' ? `
    <path d="M70 ${top - 6} l8 -26 14 16 8 -24 8 24 14 -16 8 26z" fill="#ffc531" stroke="#c48a00" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="100" cy="${top - 14}" r="4" fill="#e5484d"/>
    <text x="30" y="60" font-size="22" class="spark">✨</text><text x="150" y="90" font-size="18" class="spark">✨</text>` : '';
  // 아기 다음부터는 몸통(머리와 몸이 붙은 둥근 덩어리)이 아래로 살짝 넓다
  return `
    <ellipse cx="100" cy="184" rx="${50 * s}" ry="7" fill="rgba(0,0,0,.12)"/>
    <g class="body">
      ${antenna}${arms}
      <ellipse cx="${100 - 26 * s}" cy="${cy + 48 * s}" rx="${15 * s}" ry="${9 * s}" fill="${BODY_DARK}"/>
      <ellipse cx="${100 + 26 * s}" cy="${cy + 48 * s}" rx="${15 * s}" ry="${9 * s}" fill="${BODY_DARK}"/>
      <path d="M${100 - 60 * s} ${cy + 10 * s} C${100 - 62 * s} ${top - 4} ${100 + 62 * s} ${top - 4} ${100 + 60 * s} ${cy + 10 * s} C${100 + 62 * s} ${cy + 58 * s} ${100 - 62 * s} ${cy + 58 * s} ${100 - 60 * s} ${cy + 10 * s}z" fill="${BODY}" stroke="${BODY_DARK}" stroke-width="4"/>
      <ellipse cx="100" cy="${cy + 24 * s}" rx="${34 * s}" ry="${22 * s}" fill="${BELLY}"/>
      ${face(mood, s, cy)}
      ${crown}
    </g>`;
}
