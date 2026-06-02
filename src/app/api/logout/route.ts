import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  /* clear both cookies */
  res.cookies.set("app_auth", "", { httpOnly: true,  maxAge: 0, path: "/" });
  res.cookies.set("app_user", "", { httpOnly: false, maxAge: 0, path: "/" });
  return res;
}
