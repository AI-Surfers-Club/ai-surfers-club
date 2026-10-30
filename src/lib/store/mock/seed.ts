import type { Filter, Profile, Service } from '../types';
import { thumb } from './thumb';

// mock 모드 샘플 데이터. 확정 프로토타입과 같은 내용.

// 비밀번호 노출 검사와 헷갈리지 않도록 이메일에 비밀번호 글자를 넣지 않는다
export const MOCK_ADMIN_EMAIL = 'surf.admin@gmail.com';

/** mock 로그인 화면에서 고를 수 있는 계정 */
export const MOCK_ACCOUNTS = [
  { id: 'u1', email: 'seoyeon.kim@gmail.com', label: '김서연', note: '가입한 회원' },
  { id: 'admin', email: MOCK_ADMIN_EMAIL, label: '운영자', note: '관리자' },
  { id: 'u-new', email: 'new.surfer@gmail.com', label: 'new.surfer@gmail.com', note: '처음 오는 사람' },
] as const;

export function seedProfiles(): Profile[] {
  return [
    { id: 'u1', email: 'seoyeon.kim@gmail.com', displayName: '김서연', teamName: 'AX전략팀' },
    { id: 'u2', email: 'junho.park@gmail.com', displayName: '박준호', teamName: '디지털마케팅팀' },
    { id: 'u3', email: 'haeun.lee@gmail.com', displayName: '이하은', teamName: '경영관리팀' },
    { id: 'u4', email: 'minjae.choi@gmail.com', displayName: '최민재', teamName: '콘텐츠기획팀' },
    { id: 'u5', email: 'yuna.jung@gmail.com', displayName: '정유나', teamName: '인사팀' },
    { id: 'u6', email: 'doyun.han@gmail.com', displayName: '한도윤', teamName: 'IT셀' },
    { id: 'admin', email: MOCK_ADMIN_EMAIL, displayName: '운영자', teamName: 'AI Surfers Club' },
  ];
}

export function seedFilters(): Filter[] {
  return [
    { id: 'f1', name: 'ChatGPT' },
    { id: 'f2', name: 'Claude' },
    { id: 'f3', name: 'Gemini' },
    { id: 'f4', name: '업무자동화' },
    { id: 'f5', name: '데이터분석' },
    { id: 'f6', name: '콘텐츠제작' },
    { id: 'f7', name: '사내툴' },
  ];
}

const S1 =
  '<p>매주 팀 회의 녹음을 정리하느라 <strong>1시간씩</strong> 쓰던 걸 줄이려고 만들었어요.</p>' +
  '<h3>이런 걸 해줘요</h3><ul><li>음성 파일(mp3, m4a)을 올리면 화자별로 나눠 받아씁니다</li><li>결정된 것 / 할 일 / 담당자 / 기한을 표로 뽑아줘요</li><li>결과를 메일 본문으로 바로 복사할 수 있어요</li></ul>' +
  '<h3>쓰는 방법</h3><ol><li>녹음 파일을 끌어다 놓기</li><li>회의 종류(주간회의, 기획회의 등) 고르기</li><li><em>3분</em> 기다리면 정리본 완성</li></ol>' +
  '<blockquote>지금 AX전략팀에서 3주째 쓰고 있어요. 다른 팀도 써보시고 의견 주세요!</blockquote>' +
  '<p>사용 가이드: <a href="https://meeting-notes.example.com/guide" target="_blank" rel="noopener noreferrer">meeting-notes.example.com/guide</a></p>';

const S2 =
  '<p>캠페인마다 카피 시안을 30개씩 뽑느라 야근하던 게 시작이었어요. 브랜드마다 말투가 달라서 일반 챗봇으로는 매번 톤을 다시 설명해야 했거든요. 그래서 <strong>브랜드 가이드를 한 번만 넣으면 그 톤을 기억하는</strong> 카피 생성기를 만들었습니다.</p>' +
  '<h3>이런 걸 해줘요</h3><ul><li>브랜드 가이드 PDF나 기존 광고 문구 20개 정도를 넣으면 <strong>톤앤매너를 한 장으로 요약</strong>해줘요</li><li>인스타그램 피드·릴스 자막, 유튜브 범퍼 광고(6초), 배너 헤드라인처럼 <strong>채널별 글자 수 제한</strong>에 맞춰 뽑아요</li><li>한 번에 10개씩, 감성형 / 혜택형 / 질문형으로 나눠서 보여줍니다</li><li>마음에 드는 문구를 고르면 그 방향으로 10개를 더 만들어요</li></ul>' +
  '<h3>쓰는 방법</h3><ol><li>왼쪽 메뉴에서 <em>브랜드 등록</em>을 누르고 가이드 파일을 올립니다</li><li>캠페인 목적(신제품 출시, 할인 행사 등)과 타깃을 한 줄로 적어요</li><li>채널을 고르고 <em>생성</em>을 누르면 30초 안에 결과가 나옵니다</li></ol>' +
  '<h3>써보신 분들 반응</h3><blockquote>"시안 회의 전에 초안 잡는 시간이 2시간에서 20분으로 줄었어요." — 디지털마케팅팀 동료</blockquote>' +
  '<p>지금은 ChatGPT API를 쓰고 있고, 브랜드는 팀당 5개까지 등록할 수 있어요. 광고 심의에 걸릴 만한 표현(최고, 1위 등)은 빨간 밑줄로 표시해주지만 <strong>최종 검수는 꼭 사람이 해주세요.</strong></p>' +
  '<p>개선 아이디어는 <a href="https://copy-lab.example.com/feedback" target="_blank" rel="noopener noreferrer">피드백 페이지</a>에 남겨주시면 매주 금요일에 반영합니다.</p>';

const S3 =
  '<p>매달 말이면 법인카드 영수증 수십 장을 엑셀에 옮겨 적고 계정과목을 하나하나 고르는 일이 반복됐어요. 경영관리팀에 들어오는 문의의 절반이 <em>"이건 어떤 계정과목이에요?"</em>였고요.</p>' +
  '<h3>무엇이 달라지나요</h3><ul><li>영수증 사진을 <strong>여러 장 한 번에</strong> 올리면 가맹점, 날짜, 금액을 읽어 표로 만들어줘요</li><li>가맹점 이름과 품목을 보고 <strong>계정과목을 추천</strong>합니다 (복리후생비, 회의비, 여비교통비 등)</li><li>애매한 건은 노란색으로 표시하고 이유를 같이 적어줘요</li><li>결과를 회사 경비 양식 엑셀로 바로 내려받을 수 있어요</li></ul>' +
  '<h3>정확도는 어느 정도인가요</h3><p>9월 한 달 동안 경영관리팀 영수증 412장으로 시험해봤어요.</p><ol><li>금액·날짜 읽기: 99% (흐린 사진 4장만 틀림)</li><li>계정과목 추천: 91% 일치</li><li>나머지 9%는 대부분 회의비와 복리후생비를 헷갈린 경우였어요</li></ol>' +
  '<blockquote>계정과목 추천은 참고용이에요. 최종 결정은 사내 경비 규정을 따라주세요.</blockquote>' +
  '<p>Gemini의 이미지 인식을 쓰고 있고, 영수증 사진은 처리 후 바로 지워져요. 규정 원문은 <a href="https://receipt-sort.example.com/policy" target="_blank" rel="noopener noreferrer">사내 경비 규정 요약</a>에서 볼 수 있습니다.</p>';

const S4 =
  '<p>콘텐츠기획팀은 영상 하나에 썸네일을 3–4개 만들고 회의에서 투표로 골랐어요. 그런데 <strong>회의에서 뽑힌 썸네일이 실제로 잘 된 적이 생각보다 적었습니다.</strong> 그래서 지난 1년 동안 우리 채널 영상 380개의 썸네일과 클릭률을 모아 기준을 만들었어요.</p>' +
  '<h3>어떻게 고르나요</h3><ul><li>얼굴이 화면에서 차지하는 비율, 글자 수, 대비, 색 조합을 점수로 매겨요</li><li>우리 채널에서 <strong>클릭률이 높았던 썸네일과 얼마나 닮았는지</strong> 비교합니다</li><li>순위와 함께 "글자를 7자 이하로 줄여보세요" 같은 고칠 점을 알려줘요</li></ul>' +
  '<h3>결과 예시</h3><ol><li>A안 — 82점: 얼굴이 크고 글자가 짧아 모바일에서 잘 보임</li><li>C안 — 71점: 색 대비는 좋지만 글자가 12자로 김</li><li>B안 — 58점: 배경이 복잡해 제목이 묻힘</li></ol>' +
  '<blockquote>10월에 추천 1순위를 그대로 쓴 영상 8개의 평균 클릭률이 이전보다 1.4%p 높았어요. 아직 표본이 적어서 계속 지켜보는 중입니다.</blockquote>' +
  '<p>다른 채널에서 쓰려면 그 채널 데이터로 기준을 다시 만들어야 해요. 관심 있는 팀은 연락 주세요!</p>';

const S5 =
  '<p>채용 공고 초안을 쓰면 "우리끼리만 아는 말"이 많이 들어가요. 지원자 입장에서 다시 읽기 쉽게 다듬어주는 도우미입니다.</p>' +
  '<ul><li>사내 용어·약어를 풀어 쓰고</li><li>담당 업무와 자격 요건을 <strong>구분해서</strong> 정리하고</li><li>성별·나이 등 차별로 읽힐 수 있는 표현을 찾아 대안을 제안해요</li></ul>' +
  '<p>Claude로 만들었고, 인사팀 공고 템플릿에 맞춰 결과를 내보냅니다.</p>';

const S6 =
  '<p>인사팀과 경영관리팀으로 오는 질문의 상당수는 <em>"연차는 반차로 쪼갤 수 있나요?"</em>, <em>"출장 숙박비 한도가 얼마예요?"</em>처럼 규정집에 이미 답이 있는 것들이에요. 그런데 규정집이 PDF 12개로 흩어져 있어서 찾기가 어렵죠.</p>' +
  '<h3>들어 있는 규정</h3><ul><li>취업규칙, 휴가·휴직 규정, 복리후생 안내</li><li>여비·출장 규정, 경비 처리 지침, 법인카드 사용 기준</li><li>정보보안 규정, 개인정보 처리 지침, 사내 시스템 이용 수칙</li></ul>' +
  '<h3>답변은 이렇게 나와요</h3><ol><li>질문에 대한 짧은 답을 먼저 보여주고</li><li><strong>근거 조항 번호와 원문</strong>을 그대로 붙여요 (예: 휴가 규정 제12조 2항)</li><li>규정에 없는 내용이면 지어내지 않고 "규정에서 찾지 못했어요, 담당 부서에 문의해주세요"라고 답해요</li></ol>' +
  '<blockquote>규정이 바뀌면 IT셀에서 2영업일 안에 새 파일로 바꿔 넣고 있어요. 답변 아래에 기준 날짜가 함께 표시됩니다.</blockquote>' +
  '<p>잘못된 답을 발견하면 답변 옆 <strong>신고</strong> 버튼을 눌러주세요. 담당자 확인 후 고칩니다. 전체 규정 목록은 <a href="https://policy-bot.example.com/docs" target="_blank" rel="noopener noreferrer">여기</a>에서 볼 수 있어요.</p>';

function svc(
  id: string, authorId: string, name: string, tagline: string, url: string,
  description: string, filterIds: string[], images: string[], date: string,
): Service {
  const at = `${date}T09:00:00.000Z`;
  return { id, authorId, name, tagline, url, description, filterIds, images, createdAt: at, updatedAt: at };
}

export function seedServices(): Service[] {
  return [
    svc('s1', 'u1', '회의록 요약봇', '녹음 파일을 올리면 3분 안에 결정사항과 할 일을 정리해줘요', 'https://meeting-notes.example.com', S1, ['f2', 'f4'],
      [thumb(230, 190, 'doc'), thumb(230, 190, 'chat'), thumb(230, 190, 'grid')], '2026-10-27'),
    svc('s2', 'u2', '광고 카피 생성기', '브랜드 톤을 학습해서 채널별 광고 문구를 10개씩 뽑아줍니다', 'https://copy-lab.example.com', S2, ['f1', 'f6'],
      [thumb(330, 20, 'chat'), thumb(330, 20, 'doc'), thumb(330, 20, 'wave'), thumb(330, 20, 'grid')], '2026-10-24'),
    svc('s3', 'u3', '경비 영수증 자동 분류', '영수증 사진을 찍으면 계정과목까지 알아서 채워줘요', 'https://receipt-sort.example.com', S3, ['f3', 'f4'],
      [thumb(140, 60, 'grid'), thumb(140, 60, 'bars')], '2026-10-20'),
    svc('s4', 'u4', '유튜브 썸네일 A/B 추천', '썸네일 후보 3개를 올리면 클릭률이 높을 것 같은 순서로 골라줘요', 'https://thumb-ab.example.com', S4, ['f5', 'f6'],
      [thumb(10, 45, 'bars'), thumb(10, 45, 'circle')], '2026-10-15'),
    svc('s5', 'u5', '채용 공고 다듬기 도우미', '초안을 넣으면 지원자 입장에서 읽기 쉬운 공고로 바꿔줍니다', 'https://jd-polish.example.com', S5, ['f2'],
      [thumb(280, 320, 'wave')], '2026-10-09'),
    svc('s6', 'u6', '사내 규정 Q&A 챗봇', '휴가, 경비, 보안 규정을 물어보면 조항과 함께 답해줘요', 'https://policy-bot.example.com', S6, ['f7', 'f1'],
      [thumb(190, 230, 'chat'), thumb(190, 230, 'doc'), thumb(190, 230, 'circle')], '2026-10-02'),
    svc('s7', 'u1', '주간 리포트 대시보드', '흩어진 엑셀 지표를 모아 매주 월요일 아침 요약을 만들어요', 'https://weekly-report.example.com', '', ['f5'],
      [thumb(45, 200, 'bars')], '2026-09-25'),
    svc('s8', 'u2', '캠페인 성과 코멘트 작성기', '성과 수치를 붙여넣으면 광고주 보고용 코멘트 초안을 써줘요', 'https://campaign-note.example.com', '', ['f2', 'f5'],
      [thumb(300, 170, 'circle')], '2026-09-18'),
    svc('s9', 'u6', 'Slack 공지 번역기', '한국어 공지를 영어·일본어로 동시에 바꿔 채널에 올려줍니다', 'https://notice-translate.example.com', '', ['f3', 'f7'],
      [], '2026-09-11'),
  ];
}
