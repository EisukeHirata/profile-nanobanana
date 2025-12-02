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
    .select("credits, subscription_tier, subscription_status")
    .eq("email", session.user.email)
    .single();
    
  if (error) {
      console.error("API: /api/user/credits - Error fetching profile:", error);
  }

  console.log("API: /api/user/credits - Profile:", profile);

  // If no profile exists yet, return defaults
  return NextResponse.json({ 
    credits: profile?.credits ?? 0,
    subscription_tier: profile?.subscription_tier ?? null,
    subscription_status: profile?.subscription_status ?? null
  });
}
