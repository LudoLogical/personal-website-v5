import type { Metadata } from "next";
import { Mulish } from "next/font/google";
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
      className={`${mulish.variable} h-full font-sans antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
