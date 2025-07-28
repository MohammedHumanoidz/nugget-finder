import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Manrope } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";

const manrope = Manrope({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nugget-finder",
  description: "nugget-finder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.className} antialiased`}
      >
        <Providers>
          <div className="">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
