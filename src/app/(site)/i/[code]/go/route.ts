import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { INVITE_COOKIE, INVITE_COOKIE_DAYS, isInviteCode } from "@/lib/invite";

// "Relever le défi" button on the invite page: remember the code for a month
// (it survives the sign-up, e-mail confirmation and Google/Facebook hops),
// then send the visitor to the sign-up or sign-in form. The code is applied
// by the app shell on the member's first visit (see InviteAcceptor).
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const origin = req.nextUrl.origin;
  if (!isInviteCode(code)) return NextResponse.redirect(`${origin}/`);

  const mode = req.nextUrl.searchParams.get("mode") === "login" ? "login" : "signup";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already a full member: the code is applied right away on the next page.
  const target = user && !user.is_anonymous ? "/dashboard/classement?scope=amis" : `/auth?mode=${mode}`;
  const res = NextResponse.redirect(`${origin}${target}`);
  res.cookies.set(INVITE_COOKIE, code.toLowerCase(), {
    maxAge: INVITE_COOKIE_DAYS * 24 * 60 * 60,
    path: "/",
    sameSite: "lax",
    // Readable by the app shell so it only calls the server when a code exists.
    httpOnly: false,
    secure: origin.startsWith("https"),
  });
  return res;
}
