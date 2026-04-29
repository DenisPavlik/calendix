import { connectToDB } from "@/libs/connectToDB";
import { nylas, nylasConfig } from "@/libs/nylas";
// import { session } from "@/libs/session";
import { ProfileModel } from "@/models/Profile";
import { getSession } from "@/libs/session";
import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//   const url = new URL(req.url);
//   const code = url.searchParams.get("code");

//   if (!code) {
//     return Response.json("No authorization code returned from Nylas", {
//       status: 400,
//     });
//   }

//   const response = await nylas.auth.exchangeCodeForToken({
//     clientSecret: nylasConfig.apiKey,
//     clientId: nylasConfig.clientId as string, // Note this is *different* from your API key
//     redirectUri: nylasConfig.callbackUri, // URI you registered with Nylas in the previous step
//     code,
//   });
//   const { grantId, email } = response;

//   await connectToDB();

//   const profileDoc = await ProfileModel.findOne({ email });
//   if (profileDoc) {
//     profileDoc.grantId = grantId;
//     await profileDoc.save();
//   } else {
//     await ProfileModel.create({ email, grantId });
//   }

//   // await session().set("grandId", grantId);
//   const res = Response.redirect(new URL("/", req.url), 302)
//   await session().set("email", email);
//   return res;
// }

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return Response.json("No authorization code returned from Nylas", {
      status: 400,
    });
  }

  const response = await nylas.auth.exchangeCodeForToken({
    clientSecret: nylasConfig.clientSecret as string,
    clientId: nylasConfig.clientId as string,
    redirectUri: nylasConfig.callbackUri,
    code,
  });
  const { grantId, email } = response;

  await connectToDB();

  const profileDoc = await ProfileModel.findOne({ email });
  if (profileDoc) {
    profileDoc.grantId = grantId;
    await profileDoc.save();
  } else {
    await ProfileModel.create({ email, grantId });
  }

  const { session, res } = await getSession(req);
  session.email = email;
  await session.save();

  return NextResponse.redirect(new URL("/", req.url), {
    headers: res.headers,
  });
}
