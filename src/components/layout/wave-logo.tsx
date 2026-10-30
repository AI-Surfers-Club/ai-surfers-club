/** 로고 후보 C: 세 줄 물결 아이콘 */
export function WaveIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={5} strokeLinecap="round" aria-hidden="true">
      <path d="M6 20c6-7 12-7 18 0s12 7 18 0 12-7 16-2" />
      <path d="M6 34c6-7 12-7 18 0s12 7 18 0 12-7 16-2" />
      <path d="M6 48c6-7 12-7 18 0s12 7 18 0 12-7 16-2" />
    </svg>
  );
}
