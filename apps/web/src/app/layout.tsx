import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Manrope } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
      <body className={`${manrope.className}`}>
        <Providers>
          <div className="flex flex-col gap-6 bg-background">
            <Navbar />
            {children}
            <Footer/>
          </div>
        </Providers>
      </body>
    </html>
  );
}
