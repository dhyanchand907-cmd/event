import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { COOKIE_NAME, signToken } from "@/lib/jwt";
import { cookieOptions } from "@/lib/session";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    await connectDB();

    // password is `select: false` on the schema, so ask for it explicitly
    const user = await User.findOne({ email }).select("+password");
    const valid = user ? await bcrypt.compare(password, user.password) : false;

    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await signToken({
      sub: String(user._id),
      name: user.name,
      email: user.email,
    });

    const res = NextResponse.json({
      user: { id: String(user._id), name: user.name, email: user.email },
    });
    res.cookies.set(COOKIE_NAME, token, cookieOptions);
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
