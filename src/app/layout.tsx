import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import PrimaryNav from "@/components/PrimaryNav";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Daniel "Ludo" DeAnda',
  // description: '', TODO
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html
    lang="en"
    data-theme="dark"
    data-scroll-behavior="smooth"
    className={`${mulish.variable} h-full font-sans antialiased motion-safe:scroll-smooth`}
  >
    <body className="flex min-h-full min-w-93.75 flex-col bg-base-300">
      <PrimaryNav />
      <div className="rounded-b-paper relative z-10 flex flex-1 flex-col bg-base-100 shadow-page">
        {children}
      </div>
      <SiteFooter />
    </body>
  </html>
);

export default RootLayout;
