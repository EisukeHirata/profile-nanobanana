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

    const { generationId, imageIndex, deleteAll } = await request.json();

    if (!generationId) {
      return NextResponse.json({ error: "Missing generationId" }, { status: 400 });
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

    // 2. Handle deletion based on deleteAll flag
    if (deleteAll) {
      // Delete all images from storage
      for (const imageUrl of generation.images) {
        if (imageUrl.startsWith("http")) {
          try {
            const urlParts = imageUrl.split("/generated-images/");
            if (urlParts.length === 2) {
              const filePath = urlParts[1];
              await supabaseAdmin.storage
                .from("generated-images")
                .remove([filePath]);
              console.log("Deleted file from storage:", filePath);
            }
          } catch (storageError) {
            console.error("Failed to delete file from storage:", storageError);
          }
        }
      }

      // Delete the entire generation record
      const { error: deleteError } = await supabaseAdmin
        .from("generations")
        .delete()
        .eq("id", generationId);

      if (deleteError) throw deleteError;

      return NextResponse.json({ success: true, images: [], deleted: true });
    } else {
      // Delete single image (existing logic)
      if (imageIndex === undefined) {
        return NextResponse.json({ error: "Missing imageIndex" }, { status: 400 });
      }

      const updatedImages = [...generation.images];
      if (imageIndex >= 0 && imageIndex < updatedImages.length) {
        const imageToDelete = updatedImages[imageIndex];
        
        // If it's a URL (Supabase Storage), delete the file
        if (imageToDelete.startsWith("http")) {
          try {
            const urlParts = imageToDelete.split("/generated-images/");
            if (urlParts.length === 2) {
              const filePath = urlParts[1];
              await supabaseAdmin.storage
                .from("generated-images")
                .remove([filePath]);
              console.log("Deleted file from storage:", filePath);
            }
          } catch (storageError) {
            console.error("Failed to delete file from storage:", storageError);
          }
        }

        updatedImages.splice(imageIndex, 1);
      } else {
        return NextResponse.json({ error: "Invalid image index" }, { status: 400 });
      }

      // 3. Update or delete the generation
      if (updatedImages.length === 0) {
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
    }

  } catch (error: any) {
    console.error("Delete image error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
