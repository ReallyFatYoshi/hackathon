import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { PageTransition } from "@/components/ui/page-transition";

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
  icons: {
    icon: [
      { url: "/icons/icon-196x196.png", sizes: "196x196", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
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
        url: "/og_image.png",
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
    images: ["/og_image.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            <PageTransition>
              {children}
            </PageTransition>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
