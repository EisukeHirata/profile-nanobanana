import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ credits: 0 });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("credits")
    .eq("email", session.user.email)
    .single();

  // If no profile exists yet, return default (e.g., 0 or 5 if we auto-create)
  // Ideally, we create profile on signup. For now, return 0.
  return NextResponse.json({ credits: profile?.credits ?? 0 });
}
