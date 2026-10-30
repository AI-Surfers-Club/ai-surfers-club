import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDate, getServiceDetail } from '@/lib/services/detail';
import { ImageGallery } from '@/components/detail/image-gallery';
import { OwnerActions, SavedToast } from '@/components/detail/owner-actions';
import { currentUser } from '@/lib/auth/session';
import { canManage, deleteServiceAction } from '@/lib/services/edit';
import '@/components/detail/detail.css';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ServiceDetailPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const [detail, user] = await Promise.all([getServiceDetail(id), currentUser().catch(() => ({ state: 'guest' as const }))]);
  if (!detail) notFound();
  const { service: s, author, filters, descriptionHtml } = detail;
  const manage = canManage(user, s);
  const saved = sp.saved === 'created' || sp.saved === 'updated' ? sp.saved : null;

  return (
    <main className="main">
      <Link className="back" href="/">← 목록으로</Link>
      <section className="detail">
        <ImageGallery name={s.name} images={s.images} />
        <div>
          {filters.length > 0 && (
            <div className="tags">{filters.map((f) => <span key={f.id} className="tag">{f.name}</span>)}</div>
          )}
          <h1 className="serif serif-ko">{s.name}</h1>
          <div className="byline">
            {author && <Link href={`/?author=${author.id}`}>{author.teamName} · {author.displayName}</Link>}
            <span className="date">{formatDate(s.createdAt)} 등록</span>
          </div>
          <p className="lead">{s.tagline}</p>
          {descriptionHtml && (
            // 저장된 설명은 허용 목록(sanitizeRich)을 거친 HTML만 그린다
            <div className="desc rich" data-testid="description" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          )}
          <div className="actions">
            <a className="pill fill big" href={s.url} target="_blank" rel="noopener noreferrer">서비스 바로가기 ↗</a>
            {manage && <OwnerActions serviceId={s.id} onDelete={deleteServiceAction.bind(null, s.id)} />}
          </div>
        </div>
      </section>
      <SavedToast kind={saved} />
    </main>
  );
}
