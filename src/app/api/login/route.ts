import { NextResponse, type NextRequest } from "next/server";
import { USERS } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const APP_PASSWORD = process.env.APP_PASSWORD;

  if (!APP_PASSWORD) {
    return NextResponse.json(
      { error: "APP_PASSWORD env var not set. Add it in Vercel → Settings → Environment Variables." },
      { status: 500 },
    );
  }

  if (password !== APP_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const user = USERS.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return NextResponse.json(
      { error: "Email not found in the 4Brains team roster" },
      { status: 401 },
    );
  }

  const isProduction = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true, name: user.name, role: user.role });

  /* httpOnly — middleware auth check */
  res.cookies.set("app_auth", "1", {
    httpOnly: true,
    secure:   isProduction,
    sameSite: "lax",
    path:     "/",
    maxAge:   60 * 60 * 24 * 30,
  });

  /* readable by client — UserContext identity */
  res.cookies.set("app_user", encodeURIComponent(cleanEmail), {
    httpOnly: false,
    secure:   isProduction,
    sameSite: "lax",
    path:     "/",
    maxAge:   60 * 60 * 24 * 30,
  });

  return res;
}
