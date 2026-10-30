import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from '@/lib/store';

/** 로그아웃 후 홈으로 */
export async function GET(req: NextRequest) {
  await getAuth().signOut();
  return NextResponse.redirect(new URL('/', req.url));
}

export const POST = GET;
