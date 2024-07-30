import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "The Campus Web",
  description: "Your one-stop campus sloution",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Image
          src="/bg_vector.png"
          alt="Create Next App"
          layout="fill"
          className="filter blur-[30px] fixed top-0 left-0 -z-50"
        />
        {children}
      </body>
    </html>
  );
}
