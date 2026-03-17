import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/cart",
  "/menu",
  "/my-order",
  "/payment",
  "/share-qr",
  "payment/success",
  "payment/failed/invalid_session",
  "payment/failed/verification_failed",
  "payment/failed/cancelled",
  "payment/success",
  "payment/cancel",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get("accessToken")?.value;
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!token) {
      const notFoundUrl = new URL("/not-found", request.url);
      return NextResponse.redirect(notFoundUrl);
    }
    return NextResponse.next();
  }


  return NextResponse.next();
}