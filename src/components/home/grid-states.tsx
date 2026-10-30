import Link from 'next/link';

export function GridSkeleton() {
  return (
    <div className="grid" aria-busy="true" aria-label="목록을 불러오는 중">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="card skeleton">
          <div className="card-img" />
          <div className="card-info">
            <div>
              <div className="sk" style={{ height: 10, width: '40%', marginBottom: 14 }} />
              <div className="sk" style={{ height: 24, width: '80%', marginBottom: 8 }} />
              <div className="sk" style={{ height: 14, width: '50%' }} />
            </div>
            <div className="sk" style={{ height: 10, width: '65%', marginTop: 16 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyFirst() {
  return (
    <div className="state">
      <h2 className="serif serif-ko">첫 번째 서비스를<br />소개해보세요</h2>
      <p>AI로 만든 서비스가 있다면 가장 먼저 올려주세요.</p>
      <Link className="pill fill" href="/services/new">+ 서비스 등록</Link>
    </div>
  );
}

export function GridError({ retryHref }: { retryHref: string }) {
  return (
    <div className="state" role="alert">
      <div className="err-ic">!</div>
      <h2 className="serif serif-ko">목록을 불러오지 못했습니다</h2>
      <p>잠시 후 다시 시도해주세요. 문제가 계속되면 운영자에게 알려주세요.</p>
      <a className="pill fill" href={retryHref}>다시 시도</a>
    </div>
  );
}
