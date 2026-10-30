import { getStore } from '@/lib/store';
import type { Filter, Profile, Service, ServiceSort } from '@/lib/store/types';

export type ServiceCardData = Service & { author: Pick<Profile, 'id' | 'teamName' | 'displayName'> | null };

export function parseSort(v: string | string[] | undefined): ServiceSort {
  return v === 'name' ? 'name' : 'new';
}

/** 홈 목록: 서비스 + 작성자 팀·이름(저장하지 않고 매번 조인) */
export async function listServiceCards(options: Parameters<ReturnType<typeof getStore>['listServices']>[0] = {}): Promise<ServiceCardData[]> {
  const store = getStore();
  const [services, profiles] = await Promise.all([store.listServices(options), store.listProfiles()]);
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
  const store = getStore();
  const services = await store.listServices({ sort: 'new' });
  const makers = new Set(services.map((s) => s.authorId)).size;
  return { serviceCount: services.length, makerCount: makers, latest: services[0]?.name ?? null };
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
