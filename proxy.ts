/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import LogedUser from "./app/default/functions/LogedUser";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // ✅ get logged-in user data
  const userData: any = await LogedUser();

  // if no user or no role → block
  if (!userData || !userData.role) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ✅ Admin or Super Admin → allow dashboard
  if (
    (userData.role === "admin") &&
    pathname.startsWith("/dashboard")
  ) {
    return NextResponse.next();
  }else if ((userData.role === "instructor") &&
    pathname.startsWith("/instructor")) {
    
  }

  // ❌ default → send to home
  url.pathname = "/";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*" , "/instructor/:path*"],
};
