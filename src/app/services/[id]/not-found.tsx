import Link from 'next/link';

export default function ServiceNotFound() {
  return (
    <main className="main">
      <div className="grid">
        <div className="state" role="alert">
          <div className="err-ic">!</div>
          <h2 className="serif serif-ko">삭제되었거나<br />없는 서비스입니다</h2>
          <p>주소가 바뀌었거나 작성자가 삭제했을 수 있어요.</p>
          <Link className="pill fill" href="/">홈으로</Link>
        </div>
      </div>
    </main>
  );
}
