"use server";

import ProfileForm from "@/app/components/ProfileForm";
import { connectToDB } from "@/libs/connectToDB";
import { getSessionEmailFromCookies } from "@/libs/getSessionEmail";
import { ProfileModel } from "@/models/Profile";
import { notFound } from "next/navigation";

export default async function DashboardPage() {
  const email = await getSessionEmailFromCookies();
  if (!email) {
    notFound();
  }

  await connectToDB();
  const profileDoc = await ProfileModel.findOne({ email });

  return (
    <div>
      <ProfileForm un={profileDoc?.username ?? null} tz={profileDoc?.timezone ?? null} />
    </div>
  );
}
