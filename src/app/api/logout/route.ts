import { sessionOptions } from '@/libs/session';
import { getIronSession } from 'iron-session';
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return new NextResponse(null, { status: 405 });
}

export async function POST(req: NextRequest) {
  const res = new NextResponse();

  const session = await getIronSession(req, res, sessionOptions);
  session.destroy();

  return NextResponse.redirect(new URL("/", req.url), {
    headers: res.headers
  });
}