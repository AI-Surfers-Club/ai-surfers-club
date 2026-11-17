import './form.css';

/** 서비스 등록·수정 화면을 불러오는 동안 */
export function FormSkeleton({ title }: { title: string }) {
  return (
    <main className="main" aria-busy="true" aria-label={`${title} 화면을 불러오는 중`}>
      <div className="form-wrap">
        <h1 className="serif serif-ko">{title}</h1>
        <div className="sk" style={{ height: 12, width: '45%', marginBottom: 28 }} />
        {[48, 48, 160, 48, 120].map((h, i) => (
          <div key={i} style={{ marginBottom: 22 }}>
            <div className="sk" style={{ height: 12, width: 90, marginBottom: 10 }} />
            <div className="sk" style={{ height: h }} />
          </div>
        ))}
      </div>
    </main>
  );
}
