// 서퍼스 크루 캐릭터: 사용자가 사진 대신 고르는 얼굴 20개.
// 그림은 public/characters/crew-01~20.png — 선 모양만 담은 투명 마스크라 색이 없다.
// 화면에서는 CSS mask 로 씌우고 currentColor(키컬러 토큰)로 칠한다 (.crew-art, styles/base.css).

export const CHARACTER_COUNT = 20;

export function isCharacter(n: unknown): n is number {
  return Number.isInteger(n) && (n as number) >= 0 && (n as number) < CHARACTER_COUNT;
}

/** 아직 고르지 않은 사람의 기본 캐릭터: 계정 id로 정해져 사람마다 다르고, 늘 같은 캐릭터가 나온다 */
export function defaultCharacter(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return (h >>> 0) % CHARACTER_COUNT;
}

/** 캐릭터 마스크 이미지 주소 */
export function characterSrc(n: number): string {
  const k = isCharacter(n) ? n : 0;
  return `/characters/crew-${String(k + 1).padStart(2, '0')}.png`;
}
