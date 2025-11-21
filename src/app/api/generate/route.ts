import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY is not set in environment variables" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { images, scene, prompt: customPrompt, aspectRatio, shotType, eyeContact, imageCount = 1 } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    // Check user credits
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("email", session.user.email)
      .single();

    const currentCredits = profile?.credits ?? 0;
    const cost = imageCount; // 1 credit per image

    if (currentCredits < cost) {
      return NextResponse.json({ 
        error: "Insufficient credits", 
        credits: currentCredits,
        required: cost 
      }, { status: 402 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the specific image generation model requested by the user
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

    const allGeneratedImages: string[] = [];
    let lastDebugResponse = "";
    let basePrompt = "";

    for (let i = 0; i < imageCount; i++) {
      const prompt = `
        Generate a photorealistic profile picture based on the user's uploaded photos.
        Style: nano banana
        Scene: ${scene}
        Shot Type: ${shotType}
        Eye Contact: ${eyeContact}
        Aspect Ratio: ${aspectRatio}
        Additional Prompt: ${customPrompt}
        
        Ensure the subject maintains their likeness but fits naturally into the specified scene.
        The lighting and composition should be high quality, suitable for a dating app profile.
      `;
      basePrompt = prompt;

      // Prepare image parts
      const imageParts = images.map((base64: string) => ({
        inlineData: {
          data: base64,
          mimeType: "image/jpeg",
        },
      }));

      try {
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        
        // Log full response for debugging
        console.log("Gemini Full Response:", JSON.stringify(response, null, 2));

        // Check for inlineData (native image generation)
        if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if ('inlineData' in part && part.inlineData && part.inlineData.data) {
                    // Found native image data!
                    // It usually comes as a base64 string without the prefix.
                    // We'll add the prefix in the frontend, or we can add it here if we want to be consistent.
                    // The frontend now expects a full data URI or adds it if missing.
                    // Let's just push the raw data and let frontend handle it, OR construct a full URI.
                    // The model usually returns mimeType too.
                    const mimeType = part.inlineData.mimeType || "image/png";
                    const fullUri = `data:${mimeType};base64,${part.inlineData.data}`;
                    allGeneratedImages.push(fullUri);
                } else if ('text' in part && part.text) {
                    lastDebugResponse += part.text + "\n";
                }
            }
        }
        
        // Fallback: Check text for base64 if no inlineData found
        if (allGeneratedImages.length === 0) {
            const text = lastDebugResponse;
            if (text.includes("data:image")) {
                 const match = text.match(/(data:image\/[^;]+;\s*base64,\s*[A-Za-z0-9+/=\s]+)/);
                 if (match && match[1]) {
                     const fullDataUri = match[1].replace(/\s/g, '');
                     if (fullDataUri.length > 1000) {
                         allGeneratedImages.push(fullDataUri);
                     }
                 }
            }
        }

      } catch (e) {
        console.error("Generation iteration failed:", e);
        lastDebugResponse += `Error: ${e instanceof Error ? e.message : String(e)}`;
      }
    }

    if (allGeneratedImages.length === 0) {
       console.warn("No images were generated successfully.");
       return NextResponse.json({
         success: false,
         error: `No images were generated. Model response: ${lastDebugResponse.substring(0, 200)}...`,
         debug_response: lastDebugResponse
       }, { status: 500 });
    }

    // Deduct credits
    await supabaseAdmin.from("profiles").update({
      credits: currentCredits - allGeneratedImages.length
    }).eq("email", session.user.email);

    // Save to Supabase if user is authenticated
    if (session?.user?.email) {
      try {
        await supabaseAdmin.from("generations").insert({
          user_email: session.user.email,
          prompt: customPrompt || basePrompt,
          scene: scene,
          images: allGeneratedImages,
        });
      } catch (dbError) {
        console.error("Failed to save to Supabase:", dbError);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Generated ${allGeneratedImages.length} images successfully`,
      images: allGeneratedImages,
      debug_response: lastDebugResponse,
      remainingCredits: currentCredits - allGeneratedImages.length
    });

  } catch (error: any) {
    console.error("Error generating images:", error);
    
    // Check for quota exceeded or rate limit errors
    if (error.message?.includes("429") || error.status === 429) {
      return NextResponse.json(
        { 
          error: "Quota exceeded. This model (Gemini 2.5 Flash Image) may require a paid plan or billing enabled on your Google Cloud project.",
          details: error.message
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate images" },
      { status: 500 }
    );
  }
}
