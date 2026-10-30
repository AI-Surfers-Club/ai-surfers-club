import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Filter } from '@/lib/store/types';
import { homeHref, type HomeQuery } from '@/lib/services/search';
import { currentUser } from '@/lib/auth/session';
import { FilterManager } from '@/components/admin/filter-manager';

type Props = {
  query: HomeQuery;
  filters: Filter[];
  isMember: boolean;
  count: number | null;
  /** 필터 칩 오른쪽에 붙일 것 (관리자 버튼 등) */
  extra?: ReactNode;
};

/** 히어로 아래 한 줄: 왼쪽 내 서비스·필터 칩, 오른쪽 결과 수와 정렬 토글 */
export async function Toolbar({ query, filters, isMember, count, extra }: Props) {
  // 관리자에게만 '필터 관리' (서버 동작에서도 다시 확인한다)
  const user = await currentUser().catch(() => null);
  const admin = user?.state === 'member' && user.admin;
  return (
    <div className="toolbar" id="home-toolbar">
      {isMember && (
        <>
          <Link className={`chip${query.mine ? ' on' : ''}`} href={homeHref(query, { mine: !query.mine })} aria-pressed={query.mine}>★ 내 서비스</Link>
          <span className="divider" aria-hidden="true" />
        </>
      )}
      <div className="chips" role="group" aria-label="필터">
        <Link className={`chip${!query.filter ? ' on' : ''}`} href={homeHref(query, { filter: null })} aria-pressed={!query.filter}>전체</Link>
        {filters.map((f) => (
          <Link key={f.id} className={`chip${query.filter === f.id ? ' on' : ''}`} href={homeHref(query, { filter: f.id })} aria-pressed={query.filter === f.id}>
            {f.name}
          </Link>
        ))}
      </div>
      {admin && <FilterManager />}
      {extra}
      <span className="spacer" />
      <div className="result-meta">
        {count !== null && <span className="result-count" data-testid="result-count">서비스 {count}개</span>}
        <div className="seg" role="group" aria-label="정렬">
          <Link className={query.sort === 'new' ? 'on' : ''} href={homeHref(query, { sort: 'new' })} aria-pressed={query.sort === 'new'}>최신순</Link>
          <Link className={query.sort === 'name' ? 'on' : ''} href={homeHref(query, { sort: 'name' })} aria-pressed={query.sort === 'name'}>이름순</Link>
        </div>
      </div>
    </div>
  );
}
