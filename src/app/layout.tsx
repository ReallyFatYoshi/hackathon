import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mychef.com";

export const viewport: Viewport = {
  themeColor: "#d97706",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  manifest: "/manifest.json",
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
  },
  twitter: {
    card: "summary_large_image",
    site: "@mychefapp",
    creator: "@mychefapp",
    title: "MyChef — Professional Chef Marketplace",
    description:
      "Connect with verified professional chefs for catering and event services. Post your event, book a chef, and enjoy exceptional culinary experiences.",
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
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
