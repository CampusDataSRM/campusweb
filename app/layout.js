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
import { CampusWebPostHogProvider } from "@/functions/providers/posthog-analytics";
import Clarity from "@microsoft/clarity";
import ServiceResting from "@/components/offline/serviceResting";
import AndroidDeviceCheck from "@/components/global/andriodDeviceCheck";

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_KEY;
Clarity.init(CLARITY_ID);

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
        <meta
          property="og:description"
          content="Your one-stop campus solution"
        />
        <meta
          property="og:image"
          content="https://i.ibb.co/6rBVRnk/unknown-1.jpg"
        />
        <meta property="og:url" content="https://campusweb.vercel.app/" />
        <meta property="og:site_name" content="The Campus Web" />

        <meta name="twitter:card" content="the_campus_web" />
        <meta name="twitter:title" content="The Campus Web" />
        <meta
          name="twitter:description"
          content="Your one-stop campus solution"
        />
        <meta
          name="twitter:image"
          content="https://mvfejxbltzmknypuuain.supabase.co/storage/v1/object/public/Event/469f11c9-7472-11ef-9282-92877155d7f2.png"
        />
        <script type="text/javascript">
          {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "qdypyyr4iv");`}
        </script>
      </Head>
      <CampusWebPostHogProvider>
        <body className={inter.className}>
          <Script src="https://www.googletagmanager.com/gtag/js?id=G-C3JDRSD2G9" />
          <Script>
            {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments)}
          gtag('js', new Date());

          gtag('config', 'G-C3JDRSD2G9');`}
          </Script>
          <Suspense fallback={<Loader />}>
            {/* <Image
              src="/bg_vector.png"
              alt="Background Vector"
              layout="fill"
              className="filter blur-[60px] fixed top-0 left-0 -z-50"
            /> */}

            {/* New animated bg Start */}
            <div className="-z-50 fixed top-0 left-0 w-full h-full overflow-hidden">
              <div className="-z-50 absolute top-0 -left-44 w-96 h-96 bg-theme_text_primary/20 rounded-full filter blur-2xl -translate-x-20 translate-y-20 duration-[600ms] ease-in-out"></div>
              <div className="-z-50 absolute top-0 -right-4 w-72 h-72 bg-theme_primary/20 rounded-full filter blur-2xl translate-x-20 -translate-y-20 duration-[600ms] ease-in-out"></div>
              <div className="-z-50 absolute -bottom-8 left-20 w-[500px] h-[500px] bg-theme_secondary/20 rounded-full filter blur-3xl translate-x-20 -translate-y-20 duration-[600ms] ease-in-out"></div>
            </div>
            {/* New animated bg stop */}

            <div className="sm:flex sm:justify-center">
              <ToastContainer
                stacked
                position="top-right"
                autoClose={3000}
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
                {/*<ServiceResting />*/}
                {children}
                <AndroidDeviceCheck />
                <Analytics />
                <SpeedInsights />
              </div>
            </div>
          </Suspense>
        </body>
      </CampusWebPostHogProvider>
    </html>
  );
}
