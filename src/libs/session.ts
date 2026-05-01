import { getIronSession, IronSessionData, SessionOptions } from "iron-session";
import { NextRequest, NextResponse } from "next/server";

export const sessionOptions: SessionOptions = {
  cookieName: "calendix_session",
  password: process.env.SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession(req: NextRequest) {
  const res = new NextResponse();
  const session = await getIronSession<IronSessionData>(req, res, sessionOptions);
  return { session, res };
}
