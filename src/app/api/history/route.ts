import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("generations")
      .select("*")
      .eq("user_email", session.user.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }

    // Transform data to match frontend expectations if needed
    // The DB stores images as text[] (base64 strings), which matches our frontend GeneratedItem interface
    const history = data.map(item => ({
      id: item.id,
      timestamp: new Date(item.created_at).getTime(),
      images: item.images,
      prompt: item.prompt,
      scene: item.scene
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
