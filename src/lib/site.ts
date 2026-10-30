/** 사이트 공통 정보 (메타데이터·공유 미리보기) */
export const SITE_NAME = 'AI Surfers Club';
export const SITE_DESCRIPTION = '임직원이 AI로 직접 만든 서비스를 소개하고 함께 써보는 곳';
/** 공유 미리보기 기본 이미지 (public/og.png, 1200×630) */
export const SITE_OG_IMAGE = { url: '/og.png', width: 1200, height: 630, alt: 'AI Surfers Club — Surf the New Wave of AI.' };
// 공유 이미지 주소를 절대 주소로 만들 기준. Vercel은 운영 도메인을 환경변수로 넣어준다
export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000';
