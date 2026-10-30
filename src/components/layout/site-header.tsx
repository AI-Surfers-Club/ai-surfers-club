import Link from 'next/link';
import { HeaderActions } from './header-actions';
import { WaveIcon } from './wave-logo';

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="logo" href="/" aria-label="AI Surfers Club 홈">
        <WaveIcon />
        <span className="serif">AI Surfers Club</span>
      </Link>
      <HeaderActions />
    </header>
  );
}
