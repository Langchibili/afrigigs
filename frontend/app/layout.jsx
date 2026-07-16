import { Inter, Space_Grotesk } from "next/font/google";
import Providers from "./providers";
import NavBar from "@/components/layout/NavBar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata = {
  title: "AfriGigs — Find work. Get paid safely.",
  description:
    "A localized, pan-African, mobile-first gig marketplace with escrow-backed payments and privacy-safe proximity matching.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
