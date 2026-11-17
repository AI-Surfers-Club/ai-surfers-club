import { cache } from 'react';
import { getStore } from '@/lib/store';
import type { Filter, ListServicesOptions, Profile, Service, ServiceSort } from '@/lib/store/types';

export type ServiceCardData = Service & { author: Pick<Profile, 'id' | 'teamName' | 'displayName'> | null };

export function parseSort(v: string | string[] | undefined): ServiceSort {
  return v === 'name' ? 'name' : 'new';
}

// 한 번의 화면 렌더 안에서 같은 목록을 여러 곳(개수·그리드·전체 개수·티커)이 읽어도 DB 는 한 번만 묻는다
const servicesByKey = cache((key: string) => getStore().listServices(JSON.parse(key) as ListServicesOptions));
const keyOf = (o: ListServicesOptions) =>
  JSON.stringify({ sort: o.sort ?? 'new', q: o.q?.trim() || undefined, filterId: o.filterId || undefined, authorId: o.authorId || undefined });

/** 서비스 목록 (같은 요청 안에서는 조건이 같으면 다시 조회하지 않는다) */
export const listServices = (options: ListServicesOptions = {}): Promise<Service[]> => servicesByKey(keyOf(options));

/** 회원 목록 (같은 요청 안에서 한 번만 조회) */
export const listProfiles = cache((): Promise<Profile[]> => getStore().listProfiles());

/** 홈 목록: 서비스 + 작성자 팀·이름(저장하지 않고 매번 조인) */
export async function listServiceCards(options: ListServicesOptions = {}): Promise<ServiceCardData[]> {
  const [services, profiles] = await Promise.all([listServices(options), listProfiles()]);
  const byId = new Map(profiles.map((p) => [p.id, p]));
  return services.map((s) => {
    const p = byId.get(s.authorId);
    return { ...s, author: p ? { id: p.id, teamName: p.teamName, displayName: p.displayName } : null };
  });
}

export async function listFilterMap(): Promise<Map<string, Filter>> {
  const filters = await getStore().listFilters();
  return new Map(filters.map((f) => [f.id, f]));
}

/** 하단 티커·사이드 라벨용 커뮤니티 현황 */
export async function communityStats() {
  const services = await listServices({ sort: 'new' });
  const makers = new Set(services.map((s) => s.authorId)).size;
  return { serviceCount: services.length, makerCount: makers, latest: services[0]?.name ?? null };
}
