import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { generationId, imageIndex } = await request.json();

    if (!generationId || imageIndex === undefined) {
      return NextResponse.json({ error: "Missing generationId or imageIndex" }, { status: 400 });
    }

    // 1. Fetch the generation to verify ownership and get current images
    const { data: generation, error: fetchError } = await supabaseAdmin
      .from("generations")
      .select("*")
      .eq("id", generationId)
      .single();

    if (fetchError || !generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    if (generation.user_email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Remove the image at the specified index
    const updatedImages = [...generation.images];
    if (imageIndex >= 0 && imageIndex < updatedImages.length) {
      updatedImages.splice(imageIndex, 1);
    } else {
        return NextResponse.json({ error: "Invalid image index" }, { status: 400 });
    }

    // 3. Update the generation in the database
    // If no images left, we could delete the generation, but let's just update it for now
    // or maybe delete if empty? Let's just update.
    
    if (updatedImages.length === 0) {
        // Option: Delete the entire generation row if empty
        const { error: deleteError } = await supabaseAdmin
            .from("generations")
            .delete()
            .eq("id", generationId);
            
        if (deleteError) throw deleteError;
    } else {
        const { error: updateError } = await supabaseAdmin
          .from("generations")
          .update({ images: updatedImages })
          .eq("id", generationId);

        if (updateError) throw updateError;
    }

    return NextResponse.json({ success: true, images: updatedImages });

  } catch (error: any) {
    console.error("Delete image error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
