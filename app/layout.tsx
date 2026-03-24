import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";

import "./globals.css";

const notoSanThai = Noto_Sans_Thai({
  weight: ["100", "300", "200", "400", "700", "900"],
  subsets: ["thai"],
});

export const metadata: Metadata = {
  title: "FOODSPHERE - Ordering",
  description: "FOODSPHERE self-ordering frontend project.",
};

import { CartProvider } from "@/app/context/CartContext";
import { MenuProvider } from "@/app/context/MenuContext";
import { Toaster } from "@/app/components/ui/toast/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="https://storage.ensigame.com/logos/teams/be384481caba4964ce41eda884e4ad24.png"
        />
      </head>
      <body className={`${notoSanThai.className}`}>
        <MenuProvider>
          <CartProvider>{children}</CartProvider>
        </MenuProvider>
        <Toaster />
      </body>
    </html>
  );
}
