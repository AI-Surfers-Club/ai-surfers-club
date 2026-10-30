import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireMember } from '@/lib/auth/session';
import { getStore } from '@/lib/store';
import { canManage, updateServiceAction } from '@/lib/services/edit';
import { ServiceForm } from '@/components/service-form/service-form';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export default async function EditServicePage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await requireMember(`/services/${id}/edit`);
  const store = getStore();
  const [service, filters] = await Promise.all([store.getService(id), store.listFilters()]);
  if (!service) notFound();

  if (!canManage(user, service)) {
    return (
      <main className="main">
        <div className="grid">
          <div className="state" role="alert">
            <div className="err-ic">!</div>
            <h2 className="serif serif-ko">수정할 수 없는 서비스입니다</h2>
            <p>작성자 본인이나 관리자만 고칠 수 있어요.</p>
            <Link className="pill fill" href="/">홈으로</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <ServiceForm
        title="서비스 수정"
        filters={filters}
        initial={{
          name: service.name,
          tagline: service.tagline,
          url: service.url,
          description: service.description,
          images: service.images,
          filterIds: service.filterIds,
        }}
        save={updateServiceAction.bind(null, service.id)}
        cancelHref={`/services/${service.id}`}
      />
    </main>
  );
}
