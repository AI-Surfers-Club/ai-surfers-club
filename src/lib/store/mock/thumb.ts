// 샘플 서비스용 SVG 이미지 (data URL). 색은 이미지 내용이라 토큰 대상이 아니다.
type Kind = 'circle' | 'bars' | 'chat' | 'doc' | 'wave' | 'grid';

export function thumb(h1: number, h2: number, kind: Kind): string {
  const accent = `hsl(${h2},85%,60%)`;
  const shapes: Record<Kind, string> = {
    circle: `<circle cx="230" cy="190" r="120" fill="${accent}" opacity=".85"/><circle cx="120" cy="300" r="70" fill="#fff" opacity=".35"/>`,
    bars: `<rect x="60" y="220" width="50" height="120" rx="8" fill="#fff" opacity=".8"/><rect x="140" y="160" width="50" height="180" rx="8" fill="${accent}"/><rect x="220" y="100" width="50" height="240" rx="8" fill="#fff" opacity=".6"/><rect x="300" y="190" width="50" height="150" rx="8" fill="${accent}" opacity=".8"/>`,
    chat: `<rect x="50" y="80" width="230" height="90" rx="22" fill="#fff" opacity=".85"/><rect x="120" y="200" width="230" height="90" rx="22" fill="${accent}"/><rect x="70" y="110" width="150" height="10" rx="5" fill="hsl(${h1},60%,40%)"/><rect x="70" y="135" width="100" height="10" rx="5" fill="hsl(${h1},60%,40%)"/>`,
    doc: `<rect x="100" y="60" width="200" height="270" rx="14" fill="#fff" opacity=".9"/><rect x="130" y="100" width="140" height="12" rx="6" fill="${accent}"/><rect x="130" y="130" width="120" height="10" rx="5" fill="hsl(${h1},30%,70%)"/><rect x="130" y="155" width="130" height="10" rx="5" fill="hsl(${h1},30%,70%)"/><rect x="130" y="180" width="90" height="10" rx="5" fill="hsl(${h1},30%,70%)"/><circle cx="270" cy="290" r="40" fill="${accent}"/>`,
    wave: `<path d="M0 260 Q100 180 200 260 T400 260 V400 H0Z" fill="#fff" opacity=".5"/><path d="M0 300 Q100 230 200 300 T400 300 V400 H0Z" fill="${accent}"/><circle cx="300" cy="110" r="50" fill="#fff" opacity=".8"/>`,
    grid: Array.from({ length: 16 }, (_, n) => {
      const r = Math.floor(n / 4), c = n % 4;
      const fill = (r + c) % 3 ? '#fff' : accent;
      return `<rect x="${50 + c * 78}" y="${50 + r * 78}" width="62" height="62" rx="10" fill="${fill}" opacity="${(r + c) % 2 ? '.9' : '.55'}"/>`;
    }).join(''),
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h1},75%,55%)"/><stop offset="1" stop-color="hsl(${h1 + 40},70%,35%)"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/>${shapes[kind]}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
