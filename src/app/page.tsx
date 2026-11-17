import Link from 'next/link';
import { Suspense } from 'react';
import { Hero } from '@/components/home/hero';
import { HeroSearch } from '@/components/home/hero-search';
import { HeaderChips } from '@/components/home/header-chips';
import { Toolbar } from '@/components/home/toolbar';
import { ServiceGrid } from '@/components/home/service-grid';
import { GridSkeleton } from '@/components/home/grid-states';
import { homeHref, parseHomeQuery, toListOptions } from '@/lib/services/search';
import { listServices } from '@/lib/services/queries';
import { currentUser } from '@/lib/auth/session';
import { getStore } from '@/lib/store';
import { ProfileTicket } from '@/components/about/profile-ticket';
import { defaultCharacter } from '@/lib/avatars/characters';
import '@/components/home/home-tools.css';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const query = parseHomeQuery(await searchParams);
  const store = getStore();
  // 로그인 확인을 기다리는 동안 필터·작성자도 같이 읽는다 (차례로 기다리지 않게)
  const userP = currentUser().catch(() => ({ state: 'guest' as const }));
  const filtersP = store.listFilters().catch(() => []);
  const authorP = query.author ? store.getProfile(query.author).catch(() => null) : Promise.resolve(null);
  // 만든 사람별 보기는 로그인과 상관없이 목록 조건이 정해지므로 바로 조회를 시작한다
  if (query.author) void listServices(toListOptions(query, null)).catch(() => null);

  const user = await userP;
  const memberId = user.state === 'member' ? user.profile.id : null;
  const options = toListOptions(query, memberId);
  const [filters, author, count] = await Promise.all([
    filtersP,
    authorP,
    listServices(options).then((l) => l.length).catch(() => null),
  ]);

  // 작성자가 About Us 에 있으면 그 사람의 프로필 티켓을 제목 옆에 붙인다
  const ticket = author?.aboutGroup ? (
    <ProfileTicket
      displayName={author.displayName}
      teamName={author.teamName}
      character={author.character ?? defaultCharacter(author.id)}
      group={author.aboutGroup}
    />
  ) : null;

  const hero = author ? (
    <Hero
      korean
      eyebrow={
        <Link className="hero-back" href={homeHref(query, { author: null })}>
          <span aria-hidden="true">←</span><span>전체 서비스</span>
        </Link>
      }
      title={<>{author.displayName}님의<br />서비스</>}
      side={ticket ? undefined : <div className="hero-side"><span>{author.teamName}</span></div>}
      badge={ticket}
    />
  ) : (
    <Hero title={<>Surf<br />the New Wave of AI.</>} side={<HeroSearch initial={query.q} />} />
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
