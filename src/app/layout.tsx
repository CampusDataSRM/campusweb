import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { ThemeHead } from "@/components/theme/theme-head";
import { GA_ID } from "@/constants";
import { DEFAULT_PALETTE, PRESET_PALETTES } from "@/constants/theme";
import { SITE } from "@/constants/site";
import { dmSans, nunito, spaceGrotesk } from "@/lib/fonts";
import Providers from "./providers";
import "./globals.css";
import "./product.css";
import "./campus-glow.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.shortName,
  other: { "campusweb-release": "unified-sessions-2026-10-08-r2" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE.name,
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.shortName,
    title: SITE.name,
    description: SITE.description,
    images: [{ url: SITE.ogImage, alt: SITE.shortName }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
    images: [SITE.ogImage],
  },
  icons: { icon: "/logo_png.png", apple: "/manifest/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor:
    DEFAULT_PALETTE === "custom"
      ? PRESET_PALETTES["campus-glow"].surface
      : PRESET_PALETTES[DEFAULT_PALETTE].surface,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-palette={DEFAULT_PALETTE}
      // The pre-paint script may change data-palette and inline variables
      // before React hydrates; the DOM is authoritative for those.
      suppressHydrationWarning
      className={`${nunito.variable} ${dmSans.variable} ${spaceGrotesk.variable} h-full`}
    >
      <head>
        <ThemeHead />
      </head>
      <body className="flex min-h-full flex-col">
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
