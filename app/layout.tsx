import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";

import "./globals.css";

const notoSanThai = Noto_Sans_Thai({
  weight: ["100", "300", "200", "400", "700", "900"],
  subsets: ["thai"],
});

export const metadata: Metadata = {
  title: "FOODSHPERE - Self-Ordering Platform",
  description: "FOODSPHERE self-ordering frontend project.",
};

import { CartProvider } from "@/app/context/CartContext";
import { MenuProvider } from "@/app/context/MenuContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>{/* <link rel="icon" href="/icons/sahapanLogo01.svg" /> */}</head>
      <body className={`${notoSanThai.className}`}>
        <MenuProvider>
          <CartProvider>{children}</CartProvider>
        </MenuProvider>
      </body>
    </html>
  );
}
