import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tech4IT - Building Modern Software Solutions",
  description:
    "Tech4IT is a software solutions company specializing in mobile apps, web development, trading indicators, AI systems, and software maintenance. We build high-performance applications that drive business growth.",
  keywords: [
    "Tech4IT",
    "software development",
    "mobile apps",
    "web development",
    "trading indicators",
    "AI systems",
    "Flutter",
    "Pine Script",
  ],
  authors: [{ name: "Tech4IT" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Tech4IT - Building Modern Software Solutions",
    description:
      "High-performance applications, intelligent trading systems, and AI-powered solutions that drive business growth.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech4IT - Building Modern Software Solutions",
    description:
      "High-performance applications, intelligent trading systems, and AI-powered solutions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
