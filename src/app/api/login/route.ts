import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
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

  const res = NextResponse.json({ ok: true });
  res.cookies.set("app_auth", "1", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
