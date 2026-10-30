import { NextResponse } from 'next/server';
import { isMockMode } from '@/lib/store';
import { resetMockState } from '@/lib/store/mock/memory-store';

// mock 모드 전용: 샘플 데이터로 되돌린다. 그 밖의 모드에서는 없는 주소처럼 404.
export async function POST() {
  if (!isMockMode()) return new NextResponse('Not Found', { status: 404 });
  resetMockState();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return new NextResponse('Not Found', { status: 404 });
}
