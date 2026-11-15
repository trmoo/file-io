/*! 💾 세이브 파일 공방 — © 2026 티쳐무 · 모든 권리 보유
 *  카드 차례 = 수업 흐름.
 *    시작(0·1) → 저장(2·3) → 불러오기(4·5) → 튼튼하게(6·7) → w 와 a(8·9·⭐10) → 끝판왕(11) → 정리(12)
 */
import { hatchCard, resetCard } from './start.js';
import { firstSaveCard, bugsCard } from './save.js';
import { read3Card, loadCard } from './load.js';
import { basketCard, newbieCard } from './strong.js';
import { wModeCard, aModeCard, cheatCard } from './modes.js';
import { bossCard } from './boss.js';
import { wrapCard } from './wrap.js';

export const CHAPTERS = [
  { id: 'start', label: '시작', short: '시작', color: '#ff7a3d' },
  { id: 'save', label: '저장하기', short: '저장', color: '#0f9d8a' },
  { id: 'load', label: '불러오기', short: '불러오기', color: '#2f6fe4' },
  { id: 'strong', label: '튼튼하게', short: '튼튼하게', color: '#8b5cf6' },
  { id: 'modes', label: "'w' 와 'a'", short: 'w · a', color: '#e5484d' },
  { id: 'boss', label: '끝판왕', short: '끝판왕', color: '#d99a00' },
  { id: 'wrap', label: '정리', short: '정리', color: '#5b6474' },
];

export const CARDS = [
  hatchCard, resetCard,
  firstSaveCard, bugsCard,
  read3Card, loadCard,
  basketCard, newbieCard,
  wModeCard, aModeCard, cheatCard,
  bossCard,
  wrapCard,
];
