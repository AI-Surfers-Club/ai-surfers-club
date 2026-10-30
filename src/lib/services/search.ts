// 홈 찾기 조건: URL 쿼리(?q=&sort=&filter=&mine=1&author=) ↔ 목록 조건
import type { ListServicesOptions, ServiceSort } from '@/lib/store/types';

export type HomeQuery = {
  q: string;
  sort: ServiceSort;
  filter: string | null;
  mine: boolean;
  author: string | null;
};

type Raw = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export function parseHomeQuery(sp: Raw): HomeQuery {
  return {
    q: one(sp.q).trim(),
    sort: one(sp.sort) === 'name' ? 'name' : 'new',
    filter: one(sp.filter) || null,
    mine: one(sp.mine) === '1',
    author: one(sp.author) || null,
  };
}

/**
 * 목록 조건. '내 서비스'는 로그인 회원일 때만 적용하고,
 * 만든 사람별 보기(author)와 함께 오면 author가 우선이다.
 */
export function toListOptions(query: HomeQuery, memberId: string | null): ListServicesOptions {
  const options: ListServicesOptions = { sort: query.sort };
  if (query.q) options.q = query.q;
  if (query.filter) options.filterId = query.filter;
  if (query.author) options.authorId = query.author;
  else if (query.mine && memberId) options.authorId = memberId;
  return options;
}

/** 지금 조건에서 일부만 바꾼 홈 주소 */
export function homeHref(query: HomeQuery, patch: Partial<HomeQuery> = {}): string {
  const next = { ...query, ...patch };
  const p = new URLSearchParams();
  if (next.q) p.set('q', next.q);
  if (next.sort === 'name') p.set('sort', 'name');
  if (next.filter) p.set('filter', next.filter);
  if (next.mine) p.set('mine', '1');
  if (next.author) p.set('author', next.author);
  const s = p.toString();
  return s ? `/?${s}` : '/';
}

export const EMPTY_QUERY: HomeQuery = { q: '', sort: 'new', filter: null, mine: false, author: null };
