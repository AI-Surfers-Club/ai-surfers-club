import './about.css';

const ROPES = [60, 130, 30, 100, 50];

/** About Us 를 불러오는 동안: 레일에 빈 카드가 매달려 있다 */
export function AboutSkeleton() {
  return (
    <section className="hang-stage" aria-busy="true" aria-label="멤버를 불러오는 중" style={{ '--per-row': 5 } as React.CSSProperties}>
      <div className="hang-rail" aria-hidden="true" />
      <ul className="hang-row" aria-hidden="true">
        {ROPES.map((rope, i) => (
          <li key={i} className="hang-slot" style={{ '--rope': `${rope}px` } as React.CSSProperties}>
            <div className="hang-swing">
              <span className="hang-pin" />
              <span className="hang-rope" />
              <div className="hang-card sk" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
