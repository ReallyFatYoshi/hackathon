import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mychef.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  manifest: "/manifest.json",
  themeColor: "#d97706",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyChef",
  },
  title: {
    default: "MyChef — Professional Chef Marketplace",
    template: "%s | MyChef",
  },
  description:
    "Connect with verified professional chefs for catering and event services. Post your event, book a chef, and enjoy exceptional culinary experiences.",
  keywords: [
    "chef marketplace",
    "catering",
    "professional chef",
    "event catering",
    "private chef",
    "wedding catering",
    "corporate catering",
    "private dining",
    "hire a chef",
  ],
  authors: [{ name: "MyChef" }],
  creator: "MyChef",
  publisher: "MyChef",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "MyChef",
    title: "MyChef — Professional Chef Marketplace",
    description:
      "Connect with verified professional chefs for catering and event services. Post your event, book a chef, and enjoy exceptional culinary experiences.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MyChef — Professional Chef Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mychefapp",
    creator: "@mychefapp",
    title: "MyChef — Professional Chef Marketplace",
    description:
      "Connect with verified professional chefs for catering and event services. Post your event, book a chef, and enjoy exceptional culinary experiences.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
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
