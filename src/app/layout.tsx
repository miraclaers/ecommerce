import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Outfit, Fraunces } from "next/font/google";
import Header from "@/components/Header";
import ClerkAuthBridge from "@/components/ClerkAuthBridge";
import { CartProvider } from "@/app/context/CartContext";
import { OrdersProvider } from "@/app/context/OrdersContext";
import { RealtimeProvider } from "@/app/context/RealtimeContext";
import { MessagesProvider } from "@/app/context/MessagesContext";
import { FavoritesProvider } from "@/app/context/FavoritesContext";
import { CollectionsProvider } from "@/app/context/CollectionsContext";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mini-ecommerce-nextjs-psi.vercel.app"),
  title: "MiniShop - Demo E-commerce App",
  description:
    "A demo ecommerce experience built with Next.js, TypeScript, and Tailwind.",
  openGraph: {
    title: "MiniShop - Demo E-commerce App",
    description:
      "A demo ecommerce experience built with Next.js, TypeScript, and Tailwind.",
    url: "https://mini-ecommerce-nextjs-psi.vercel.app",
    siteName: "MiniShop",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MiniShop preview image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MiniShop - Demo E-commerce App",
    description:
      "A demo ecommerce experience built with Next.js, TypeScript, and Tailwind.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ClerkProvider>
          <ClerkAuthBridge />
          <RealtimeProvider>
            <CartProvider>
              <OrdersProvider>
                <FavoritesProvider>
                  <CollectionsProvider>
                    <MessagesProvider>
                      <Header />
                      <main id="main-content" className="flex-1">
                        <PageTransition>{children}</PageTransition>
                      </main>
                      <Footer />
                    </MessagesProvider>
                  </CollectionsProvider>
                </FavoritesProvider>
              </OrdersProvider>
            </CartProvider>
          </RealtimeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
