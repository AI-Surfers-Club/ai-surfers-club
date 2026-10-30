import { requireMember } from '@/lib/auth/session';
import { getStore } from '@/lib/store';
import { createServiceAction } from '@/lib/services/mutations';
import { ServiceForm } from '@/components/service-form/service-form';

export const dynamic = 'force-dynamic';

export default async function NewServicePage() {
  await requireMember('/services/new');
  const filters = await getStore().listFilters();
  return (
    <main className="main">
      <ServiceForm title="서비스 등록" filters={filters} save={createServiceAction} cancelHref="/" />
    </main>
  );
}
