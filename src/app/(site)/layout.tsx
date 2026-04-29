import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./../globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Toaster } from "react-hot-toast";
import { getSessionEmailFromCookies } from "@/libs/getSessionEmail";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Calendix — Simple scheduling for everyone",
  description: "Share a link, let others pick a time. Calendix connects to your Google Calendar and creates meetings automatically.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const email = await getSessionEmailFromCookies()
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="container flex flex-col min-h-screen">
          <Toaster />
          <Header email={email} />
          <div className="flex-1">{children}</div>
          <Footer />
        </main>
      </body>
    </html>
  );
}
