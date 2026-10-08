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
  description: 'Portfolio of Daniel "Ludo" DeAnda',
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      className={`${mulish.variable} h-full font-sans antialiased motion-safe:scroll-smooth`}
    >
      {/* The body is the "table" on which the page (like a piece of paper)
          rests; the footer is engraved into the table underneath the page.
          Viewports narrower than the narrowest common phones (375px) are
          impractical to design for, so they scroll horizontally instead */}
      <body className="flex min-h-full min-w-93.75 flex-col bg-base-300">
        <PrimaryNav />
        <div className="relative z-10 flex flex-1 flex-col rounded-b-paper bg-base-100 shadow-[0_24px_48px_-8px_rgb(0_0_0/0.85)]">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
