import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "./providers"; // We will create this

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IndiaBuddy — Smart India Travel Planner",
  description: "Find the smartest way to travel across India with AI-powered price predictions and multi-modal comparisons.",
  openGraph: {
    images: ["/og-image.jpg"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col`}>
        <Providers>
          <header className="w-full bg-white dark:bg-gray-800 shadow-sm z-10 sticky top-0">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <a href="/" className="font-black text-2xl text-primary-600 dark:text-primary-400 tracking-tight">
                India<span className="text-gray-900 dark:text-white">Buddy</span>
              </a>
              <nav className="hidden md:flex gap-6 font-medium text-sm text-gray-600 dark:text-gray-300">
                <a href="/" className="hover:text-primary-600 transition-colors">Search</a>
                <a href="/predict" className="hover:text-primary-600 transition-colors">Price Predictor</a>
              </nav>
            </div>
          </header>
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
