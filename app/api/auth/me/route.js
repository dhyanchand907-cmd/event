import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Lets the client check who is logged in (e.g. after a page refresh).
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  return NextResponse.json({ user: session });
}
