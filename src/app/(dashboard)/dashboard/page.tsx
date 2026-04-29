"use server";

import Preloader from "@/app/components/Preloader";
import ProfileForm from "@/app/components/ProfileForm";
import { getUsernameByEmail } from "@/libs/db-utils";
import { getSessionEmailFromCookies } from "@/libs/getSessionEmail";
import { notFound } from "next/navigation";
// import { session } from "@/libs/session";

export default async function DashboardPage() {
  const email = await getSessionEmailFromCookies();
  if (!email) {
    notFound();
  }
  const username = await getUsernameByEmail(email);

  return (
    <div>
      <ProfileForm un={username} />
    </div>
  );
}
