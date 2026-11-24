import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/jwt";
import { cookieOptions } from "@/lib/session";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out." });
  res.cookies.set(COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
  return res;
}
