import { sessionOptions } from '@/libs/session';
import { getIronSession } from 'iron-session';
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const res = new NextResponse();

  const session = await getIronSession(req, res, sessionOptions);
  await session.destroy();

  return NextResponse.redirect(new URL("/", req.url), {
    headers: res.headers
  })
}