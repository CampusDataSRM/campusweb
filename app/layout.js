import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Loader from "@/components/global/loader";
import { Suspense } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import Head from "next/head";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

const APP_NAME = "The Campus Web";
const APP_DEFAULT_TITLE = "The Campus Web";
const APP_DESCRIPTION = "Your one-stop campus solution";

export const metadata = {
  title: "The Campus Web",
  description: "Your one-stop campus solution",
  manifest: "/manifest.json",
  applicationName: "Campus Web",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
    },
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/logo_png.png",
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: "the_campus_web",
    title: {
      default: APP_DEFAULT_TITLE,
    },
    description: APP_DESCRIPTION,
    images: ["/logo_png.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="The Campus Web" />
        <meta property="og:description" content="Your one-stop campus solution" />
        <meta property="og:image" content="https://i.ibb.co/6rBVRnk/unknown-1.jpg" />
        <meta property="og:url" content="https://campusweb.vercel.app/" />
        <meta property="og:site_name" content="The Campus Web" />

        <meta name="twitter:card" content="the_campus_web" />
        <meta name="twitter:title" content="The Campus Web" />
        <meta name="twitter:description" content="Your one-stop campus solution" />
        <meta name="twitter:image" content="https://mvfejxbltzmknypuuain.supabase.co/storage/v1/object/public/Event/469f11c9-7472-11ef-9282-92877155d7f2.png" />
      </Head>
      <body className={inter.className}>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-C3JDRSD2G9" />
        <Script>
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments)}
          gtag('js', new Date());

          gtag('config', 'G-C3JDRSD2G9');`}
        </Script>
        <Suspense fallback={<Loader />}>
          <Image
            src="/bg_vector.png"
            alt="Background Vector"
            layout="fill"
            className="filter blur-[60px] fixed top-0 left-0 -z-50"
          />
          <div className="sm:flex sm:justify-center">
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
              bodyClassName={`font-['Nunito'] tracking-wide`}
            />
            <div
              className="md:w-[630px]"
              style={{
                scrollbarColor: "rgba(0, 0, 0, 0.0) rgba(0, 0, 0, 0.0)",
                scrollbarWidth: "thin",
              }}
            >
              {children}
              <Analytics />
              <SpeedInsights />
            </div>
          </div>
        </Suspense>
      </body>
    </html>
  );
}
