import '@/components/detail/detail.css';

export default function ServiceDetailLoading() {
  return (
    <main className="main" aria-busy="true" aria-label="서비스를 불러오는 중">
      <section className="detail">
        <div className="detail-img sk" />
        <div>
          <div className="sk" style={{ height: 12, width: '30%', margin: '10px 0 18px' }} />
          <div className="sk" style={{ height: 48, width: '85%', marginBottom: 14 }} />
          <div className="sk" style={{ height: 14, width: '40%', marginBottom: 28 }} />
          <div className="sk" style={{ height: 18, width: '90%', marginBottom: 10 }} />
          <div className="sk" style={{ height: 14, width: '100%', marginBottom: 8 }} />
          <div className="sk" style={{ height: 14, width: '70%' }} />
        </div>
      </section>
    </main>
  );
}
