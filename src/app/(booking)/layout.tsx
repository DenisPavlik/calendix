import { Toaster } from "react-hot-toast";
import "./../globals.css";
import { Inter } from "next/font/google";

export const metadata = {
  title: "Calendly",
  description: "This is a clone of Calendly",
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
