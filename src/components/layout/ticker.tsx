import { communityStats } from '@/lib/services/queries';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** 하단에 흐르는 띠: 슬로건 + 커뮤니티 현황 */
export async function Ticker() {
  let items = ['AI 파도에 올라타는 사람들', 'Surf the New Wave of AI'];
  try {
    const { serviceCount, makerCount, latest } = await communityStats();
    items = ['AI 파도에 올라타는 사람들'];
    if (latest) items.push(`New Wave — ${latest}`);
    items.push(`${plural(makerCount, 'Surfer')}, ${plural(serviceCount, 'Wave')}`);
    items.push('Surf the New Wave of AI');
  } catch {
    // 현황을 못 읽어도 슬로건은 흐르게 둔다
  }
  // 끊김 없이 흐르도록 같은 줄을 두 번 이어 붙인다 (두 번째는 화면 낭독기에서 숨김)
  const row = (copy: number) =>
    items.flatMap((t, i) => [
      <span key={`${copy}t${i}`} aria-hidden={copy > 0 || undefined}>{t}</span>,
      <span key={`${copy}s${i}`} aria-hidden="true">*</span>,
    ]);
  return (
    <div className="ticker-wrap" aria-label="AI Surfers Club 소식">
      <div className="ticker" data-testid="ticker">
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
}

export async function SideLabel() {
  let text = 'STATUS: SURFING';
  try {
    const { serviceCount, makerCount } = await communityStats();
    text = `SERVICES: ${serviceCount} // SURFERS: ${makerCount} // STATUS: SURFING`;
  } catch {
    // 현황 없이 상태만
  }
  return <div className="side-label" aria-hidden="true">{text}</div>;
}
