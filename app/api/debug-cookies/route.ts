import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Log and return all cookies
  console.log('[DEBUG-COOKIES] Cookies:', request.cookies);
  return NextResponse.json({ cookies: request.cookies });
}
