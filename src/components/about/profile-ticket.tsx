import { characterSrc } from '@/lib/avatars/characters';
import type { AboutGroup } from '@/lib/store/types';
import './about.css';

type Props = { displayName: string; teamName: string; character: number; group: AboutGroup };

/** 작은 프로필 티켓: About Us 카드의 앞면을 명함 크기로. 작성자 화면 제목 옆에 붙는다 */
export function ProfileTicket({ displayName, teamName, character, group }: Props) {
  return (
    <div className="ticket" aria-label={`${displayName} · ${teamName}`} role="img">
      <span className="ticket-clip" aria-hidden="true" />
      <span className="ticket-tag" aria-hidden="true">{group === 'crew' ? 'CREW' : 'SURFER'}</span>
      <span className="ticket-photo" aria-hidden="true">
        <span className="crew-art" style={{ '--crew': `url(${characterSrc(character)})` } as React.CSSProperties} />
      </span>
      <span className="ticket-name" aria-hidden="true">{displayName}</span>
      <span className="ticket-team" aria-hidden="true">{teamName}</span>
    </div>
  );
}
