import type { ReactNode } from 'react';
import { listFilterMap, listServiceCards } from '@/lib/services/queries';
import type { ListServicesOptions } from '@/lib/store/types';
import { ServiceCard } from './service-card';
import { EmptyFirst, GridError } from './grid-states';

type Props = {
  options: ListServicesOptions;
  retryHref: string;
  /** 조건에 맞는 서비스가 없을 때(전체가 0개인 경우는 제외) 보여줄 것 */
  noResults?: ReactNode;
  /** 지금 보이는 개수를 바깥(툴바 등)에 알리고 싶을 때 */
  renderCount?: (n: number) => ReactNode;
};

export async function ServiceGrid({ options, retryHref, noResults, renderCount }: Props) {
  let cards, filters, total;
  try {
    [cards, filters, total] = await Promise.all([
      listServiceCards(options),
      listFilterMap(),
      listServiceCards({}).then((all) => all.length),
    ]);
  } catch {
    return <div className="grid"><GridError retryHref={retryHref} /></div>;
  }
  return (
    <>
      {renderCount?.(cards.length)}
      <div className="grid" data-testid="service-grid">
        {total === 0 ? <EmptyFirst /> : cards.length === 0 ? noResults : cards.map((s) => (
          <ServiceCard key={s.id} service={s} filterName={s.filterIds.map((id) => filters.get(id)?.name).find(Boolean)} />
        ))}
      </div>
    </>
  );
}
