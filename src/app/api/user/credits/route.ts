import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  console.log("API: /api/user/credits called");
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    console.log("API: /api/user/credits - Unauthorized");
    return NextResponse.json({ credits: 0 });
  }

  console.log("API: /api/user/credits - Fetching for", session.user.email);

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("credits")
    .eq("email", session.user.email)
    .single();
    
  if (error) {
      console.error("API: /api/user/credits - Error fetching profile:", error);
  }

  console.log("API: /api/user/credits - Credits:", profile?.credits);

  // If no profile exists yet, return default (e.g., 0 or 5 if we auto-create)
  // Ideally, we create profile on signup. For now, return 0.
  return NextResponse.json({ credits: profile?.credits ?? 0 });
}
