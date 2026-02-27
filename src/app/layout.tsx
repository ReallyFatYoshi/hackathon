import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyChef — Professional Chef Marketplace",
  description:
    "Connect with verified professional chefs for catering and event services. Post your event, book a chef, and enjoy exceptional culinary experiences.",
  keywords: ["chef marketplace", "catering", "professional chef", "event catering", "private chef"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
