import { getIronSession, IronSessionData } from "iron-session";
import { NextRequest, NextResponse } from "next/server";

const sessionOptions = {
  cookieName: "calendix_session",
  password: process.env.SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<IronSessionData>(req, res, sessionOptions);

  if (!session.email) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
