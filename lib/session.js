// Server-only helpers for reading the logged-in user from the auth cookie.
import { cookies } from "next/headers";
import { COOKIE_NAME, MAX_AGE, verifyToken } from "@/lib/jwt";

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};

export async function getSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.sub) return null;

  return { id: payload.sub, name: payload.name, email: payload.email };
}
