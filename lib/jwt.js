// Edge-safe JWT helpers (used by both middleware and route handlers).
import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "token";
export const MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined. Add it to .env.local");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload;
  } catch {
    return null;
  }
}
