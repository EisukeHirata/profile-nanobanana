import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("generations")
      .select("*")
      .eq("id", id)
      .eq("user_email", session.user.email)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch generation" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      generation: {
        id: data.id,
        timestamp: new Date(data.created_at).getTime(),
        images: data.images,
        prompt: data.prompt,
        scene: data.scene
      }
    });

  } catch (error) {
    console.error("Generation fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
