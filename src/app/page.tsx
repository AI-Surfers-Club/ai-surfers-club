import Link from 'next/link';
import { Suspense } from 'react';
import { Hero } from '@/components/home/hero';
import { HeroSearch } from '@/components/home/hero-search';
import { HeaderChips } from '@/components/home/header-chips';
import { Toolbar } from '@/components/home/toolbar';
import { ServiceGrid } from '@/components/home/service-grid';
import { GridSkeleton } from '@/components/home/grid-states';
import { homeHref, parseHomeQuery, toListOptions } from '@/lib/services/search';
import { currentUser } from '@/lib/auth/session';
import { getStore } from '@/lib/store';
import '@/components/home/home-tools.css';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const query = parseHomeQuery(await searchParams);
  const user = await currentUser().catch(() => ({ state: 'guest' as const }));
  const memberId = user.state === 'member' ? user.profile.id : null;
  const options = toListOptions(query, memberId);
  const store = getStore();

  const [filters, author, count] = await Promise.all([
    store.listFilters().catch(() => []),
    query.author ? store.getProfile(query.author).catch(() => null) : Promise.resolve(null),
    store.listServices(options).then((l) => l.length).catch(() => null),
  ]);

  const hero = author ? (
    <Hero
      korean
      title={<>{author.displayName}님의<br />서비스</>}
      side={
        <div className="hero-side">
          <span>{author.teamName}</span>
          <Link className="pill" href={homeHref(query, { author: null })}>전체 보기로 돌아가기</Link>
        </div>
      }
    />
  ) : (
    <Hero title={<>Surf the<br />New Wave of AI.</>} side={<HeroSearch initial={query.q} />} />
  );

  const chips = [
    ...(memberId ? [{ label: '★ 내 서비스', href: homeHref(query, { mine: !query.mine }), on: query.mine }] : []),
    { label: '전체', href: homeHref(query, { filter: null }), on: !query.filter },
    ...filters.map((f) => ({ label: f.name, href: homeHref(query, { filter: f.id }), on: query.filter === f.id })),
  ];

  const noResults = (
    <div className="state">
      <h2 className="serif serif-ko">검색 결과가 없습니다</h2>
      <p>다른 검색어나 필터로 찾아보세요.</p>
      <Link className="pill" href="/">조건 초기화</Link>
    </div>
  );

  return (
    <main className="main">
      <HeaderChips chips={chips} />
      {hero}
      <Toolbar query={query} filters={filters} isMember={!!memberId} count={count} />
      <Suspense key={homeHref(query)} fallback={<GridSkeleton />}>
        <ServiceGrid options={options} retryHref={homeHref(query)} noResults={noResults} />
      </Suspense>
    </main>
  );
}
