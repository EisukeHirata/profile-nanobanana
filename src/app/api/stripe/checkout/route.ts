import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId, mode } = await request.json();

    if (!priceId || !mode) {
      return NextResponse.json({ error: "Missing priceId or mode" }, { status: 400 });
    }

    // Get or create Stripe Customer ID
    let customerId: string | undefined;
    
    // Check if user already has a stripe_customer_id in profiles
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("email", session.user.email)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      // Create new customer in Stripe
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          email: session.user.email,
        },
      });
      customerId = customer.id;

      // Update profile with new customer ID
      // We use upsert here to ensure the profile exists
      await supabaseAdmin.from("profiles").upsert({
        email: session.user.email,
        stripe_customer_id: customerId,
      }, { onConflict: "email" });
    }

    // Determine the base URL for redirects
    // Determine the base URL for redirects
    // Priority: NEXT_PUBLIC_APP_URL (manual override) -> NEXTAUTH_URL (standard) -> Origin Header (dynamic) -> VERCEL_URL (Vercel preview) -> localhost
    const getBaseUrl = () => {
      if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
      if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
      
      const origin = request.headers.get("origin");
      if (origin) return origin;
      
      if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
      return "http://localhost:3000";
    };
    
    const baseUrl = getBaseUrl();

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: mode,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/profile?success=true`,
      cancel_url: `${baseUrl}/?canceled=true`,
      metadata: {
        userId: session.user.email,
        priceId: priceId,
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
