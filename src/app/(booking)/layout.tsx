import { Toaster } from "react-hot-toast";
import "./../globals.css";
import { Inter } from "next/font/google";

export const metadata = {
  title: "Calendix",
  description: "Simple scheduling for everyone — share a link, let others pick a time.",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
