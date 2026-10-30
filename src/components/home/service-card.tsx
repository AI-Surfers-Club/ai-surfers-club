import Link from 'next/link';
import type { ServiceCardData } from '@/lib/services/queries';
import { domainOf } from '@/lib/services/queries';
import { CardTilt } from './card-tilt';

export function CoverImage({ name, src }: { name: string; src?: string }) {
  if (!src) return <div className="default-img serif" aria-hidden="true">{name.trim()[0] ?? '?'}</div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={`${name} 대표 이미지`} />;
}

export function ServiceCard({ service, filterName }: { service: ServiceCardData; filterName?: string }) {
  const author = service.author;
  return (
    <CardTilt>
      <article className="card" data-testid="service-card">
        <Link href={`/services/${service.id}`} className="card-link" aria-label={service.name} style={{ display: 'contents', color: 'inherit', textDecoration: 'none' }}>
          <div className="card-img"><CoverImage name={service.name} src={service.images[0]} /></div>
        </Link>
        <div className="card-info">
          <div>
            <div className="meta-top"><span>{filterName ?? ''}</span><span>{domainOf(service.url)}</span></div>
            <Link href={`/services/${service.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              <div className="card-title serif" data-testid="card-title">{service.name}</div>
            </Link>
            {author && (
              <Link className="card-author serif" href={`/?author=${author.id}`} data-testid="card-author">
                {author.teamName} · {author.displayName}
              </Link>
            )}
          </div>
          <Link href={`/services/${service.id}`} style={{ color: 'inherit', textDecoration: 'none' }} tabIndex={-1}>
            <div className="tagline">{service.tagline}</div>
          </Link>
        </div>
      </article>
    </CardTilt>
  );
}
