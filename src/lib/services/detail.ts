import { getStore } from '@/lib/store';
import type { Filter, Profile, Service } from '@/lib/store/types';
import { sanitizeRich } from '@/lib/richtext/sanitize';

export type ServiceDetail = {
  service: Service;
  author: Pick<Profile, 'id' | 'teamName' | 'displayName'> | null;
  filters: Filter[];
  /** 화면에 그릴 수 있게 정리된 설명 HTML (비어 있으면 '') */
  descriptionHtml: string;
};

/** 상세 화면 데이터. 없는 id면 null */
export async function getServiceDetail(id: string): Promise<ServiceDetail | null> {
  const store = getStore();
  const service = await store.getService(id);
  if (!service) return null;
  const [profile, allFilters] = await Promise.all([store.getProfile(service.authorId), store.listFilters()]);
  const byId = new Map(allFilters.map((f) => [f.id, f]));
  return {
    service,
    author: profile ? { id: profile.id, teamName: profile.teamName, displayName: profile.displayName } : null,
    filters: service.filterIds.map((fid) => byId.get(fid)).filter((f): f is Filter => !!f),
    descriptionHtml: sanitizeRich(service.description),
  };
}

/** '2026.10.27' 형식 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}
