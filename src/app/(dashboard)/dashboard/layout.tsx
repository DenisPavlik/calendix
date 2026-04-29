import DashboardNav from "@/app/components/DashboardNav";
import { getSessionEmailFromCookies } from "@/libs/getSessionEmail";
import { nylas } from "@/libs/nylas";
import { ProfileModel } from "@/models/Profile";
import { AlertTriangle } from "lucide-react";
import { ReactNode } from "react";

async function checkGrantValid(grantId: string): Promise<boolean> {
  try {
    await nylas.calendars.list({ identifier: grantId, queryParams: {} });
    return true;
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    return statusCode !== 401;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const email = await getSessionEmailFromCookies();
  const profileDoc = await ProfileModel.findOne({ email });

  const grantExpired =
    profileDoc?.grantId
      ? !(await checkGrantValid(profileDoc.grantId))
      : false;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav username={profileDoc?.username} />
      <main className="md:ml-60 pb-24 md:pb-0">
        {grantExpired && (
          <div className="flex items-center justify-between gap-3 bg-amber-50 border-b border-amber-200 px-4 md:px-8 py-3 text-sm text-amber-800">
            <span className="flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              Your calendar connection has expired.
            </span>
            <a href="/api/auth" className="font-semibold underline whitespace-nowrap">
              Reconnect →
            </a>
          </div>
        )}
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
