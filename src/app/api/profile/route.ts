import { connectToDB } from "@/libs/connectToDB";
import { getSessionEmailFromRequest } from "@/libs/getSessionEmail";
import { ProfileModel } from "@/models/Profile";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    await connectToDB();
    const email = await getSessionEmailFromRequest(req);
    if (!email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    const { username, timezone } = data;
    if (!username) {
      return new Response("Missing username", { status: 400 });
    }

    const FORMAT_RE = /^[a-z0-9-]{3,30}$/;
    if (!FORMAT_RE.test(username)) {
      return new Response("Invalid username: use 3–30 lowercase letters, numbers, or hyphens", { status: 400 });
    }

    const profileDoc = await ProfileModel.findOne({ email });
    if (profileDoc) {
      profileDoc.username = username;
      if (timezone) profileDoc.timezone = timezone;
      await profileDoc.save();
    } else {
      await ProfileModel.create({ email, username, timezone });
    }

    return new Response("Profile saved", { status: 200 });

  } catch (err) {
    console.error("Error in PUT /api/profile:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}